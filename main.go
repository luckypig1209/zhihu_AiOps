package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/larksuite/oapi-sdk-go/v3"
	larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
	"github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
	larkim "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
	"github.com/larksuite/oapi-sdk-go/v3/ws"
	"gopkg.in/yaml.v3"
)

// Config 应用配置
type Config struct {
	App struct {
		ID     string `yaml:"id"`
		Secret string `yaml:"secret"`
	} `yaml:"app"`
	Websocket struct {
		ForwardURL string `yaml:"forward_url"`
		ResultURL  string `yaml:"result_url"`
	} `yaml:"websocket"`
	Log struct {
		Level string `yaml:"level"`
	} `yaml:"log"`
}

// LarkMessage 飞书消息结构
type LarkMessage struct {
	// 消息元信息
	MessageID   string `json:"message_id"`
	ChatID      string `json:"chat_id"`
	ChatType    string `json:"chat_type"` // p2p 或 group
	UserID      string `json:"user_id"`
	MessageType string `json:"message_type"` // text, image, etc.
	Content     string `json:"content"`
	CreateTime  string `json:"create_time"`

	// 用于回复的必要信息
	RootID   string `json:"root_id,omitempty"`   // 群聊中回复用
	ParentID string `json:"parent_id,omitempty"` // 群聊中回复用
}

// SkillResult 技能处理结果
type SkillResult struct {
	// 原始请求标识
	MessageID string `json:"message_id"`
	ChatID    string `json:"chat_id"`
	ChatType  string `json:"chat_type"`

	// 回复内容
	ReplyType string `json:"reply_type"` // text, card, etc.
	Content   string `json:"content"`

	// 错误信息
	Error string `json:"error,omitempty"`
}

// Gateway 消息网关
type Gateway struct {
	config       *Config
	larkClient   *lark.Client

	// 转发连接（发送用户消息到技能系统）
	forwardConn  *websocket.Conn
	forwardMutex sync.Mutex

	// 结果连接（接收技能系统返回）
	resultConn   *websocket.Conn

	// 消息缓存（用于关联请求和回复）
	messageCache map[string]*LarkMessage
	cacheMutex   sync.RWMutex
}

func main() {
	// 加载配置
	config, err := loadConfig("config.yaml")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 创建飞书客户端
	larkClient := lark.NewClient(config.App.ID, config.App.Secret)

	// 创建网关
	gateway := &Gateway{
		config:       config,
		larkClient:   larkClient,
		messageCache: make(map[string]*LarkMessage),
	}

	// 启动结果接收 WebSocket 连接
	go gateway.startResultReceiver()

	// 启动转发 WebSocket 连接
	go gateway.startForwardConnection()

	// 启动飞书事件监听
	gateway.startLarkEventListener()
}

// loadConfig 加载配置文件
func loadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}

	config := &Config{}
	if err := yaml.Unmarshal(data, config); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}

	return config, nil
}

// startLarkEventListener 启动飞书事件监听
func (g *Gateway) startLarkEventListener() {
	eventHandler := dispatcher.NewEventDispatcher("", "").
		OnP2MessageReceiveV1(func(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
			return g.handleLarkMessage(ctx, event)
		})

	cli := ws.NewClient(
		g.config.App.ID,
		g.config.App.Secret,
		ws.WithEventHandler(eventHandler),
		ws.WithLogLevel(larkcore.LogLevelDebug),
	)

	log.Println("启动飞书事件监听...")
	if err := cli.Start(context.Background()); err != nil {
		log.Fatalf("飞书事件监听启动失败: %v", err)
	}
}

// handleLarkMessage 处理飞书消息
func (g *Gateway) handleLarkMessage(ctx context.Context, event *larkim.P2MessageReceiveV1) error {
	// 提取消息信息
	msg := &LarkMessage{
		MessageID:   safeString(event.Event.Message.MessageId),
		ChatID:      safeString(event.Event.Message.ChatId),
		ChatType:    safeString(event.Event.Message.ChatType),
		UserID:      safeString(event.Event.Sender.SenderId.UserId),
		MessageType: safeString(event.Event.Message.MessageType),
		Content:     safeString(event.Event.Message.Content),
		CreateTime:  safeString(event.Event.Message.CreateTime),
		RootID:      safeString(event.Event.Message.RootId),
		ParentID:    safeString(event.Event.Message.ParentId),
	}

	log.Printf("收到消息: chat_type=%s, user=%s, content=%s",
		msg.ChatType, msg.UserID, truncate(msg.Content, 100))

	// 缓存消息（用于后续回复关联）
	g.cacheMutex.Lock()
	g.messageCache[msg.MessageID] = msg
	g.cacheMutex.Unlock()

	// 转发消息到技能系统
	if err := g.forwardMessage(msg); err != nil {
		log.Printf("转发消息失败: %v", err)
		// 发送失败提示给用户
		g.replyToUser(ctx, msg, "消息处理中，请稍候...", true)
	}

	return nil
}

// forwardMessage 转发消息到技能系统
func (g *Gateway) forwardMessage(msg *LarkMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return fmt.Errorf("序列化消息失败: %w", err)
	}

	g.forwardMutex.Lock()
	defer g.forwardMutex.Unlock()

	if g.forwardConn == nil {
		return fmt.Errorf("转发连接未建立")
	}

	if err := g.forwardConn.WriteMessage(websocket.TextMessage, data); err != nil {
		// 连接可能断开，尝试重连
		log.Printf("发送消息失败，尝试重连: %v", err)
		g.reconnectForward()
		if g.forwardConn != nil {
			return g.forwardConn.WriteMessage(websocket.TextMessage, data)
		}
		return fmt.Errorf("重连后仍无法发送: %w", err)
	}

	log.Printf("消息已转发: %s", msg.MessageID)
	return nil
}

// startForwardConnection 维护转发 WebSocket 连接
func (g *Gateway) startForwardConnection() {
	for {
		if err := g.connectForward(); err != nil {
			log.Printf("转发连接失败: %v，5秒后重试...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		// 连接成功，等待断开
		g.monitorForwardConnection()
		log.Println("转发连接断开，尝试重连...")
		time.Sleep(5 * time.Second)
	}
}

// connectForward 建立转发连接
func (g *Gateway) connectForward() error {
	log.Printf("连接转发 WebSocket: %s", g.config.Websocket.ForwardURL)

	conn, _, err := websocket.DefaultDialer.Dial(g.config.Websocket.ForwardURL, nil)
	if err != nil {
		return err
	}

	g.forwardMutex.Lock()
	g.forwardConn = conn
	g.forwardMutex.Unlock()

	log.Println("转发连接已建立")
	return nil
}

// reconnectForward 重新建立转发连接
func (g *Gateway) reconnectForward() {
	g.forwardMutex.Lock()
	if g.forwardConn != nil {
		g.forwardConn.Close()
		g.forwardConn = nil
	}
	g.forwardMutex.Unlock()
}

// monitorForwardConnection 监控转发连接状态
func (g *Gateway) monitorForwardConnection() {
	g.forwardMutex.Lock()
	conn := g.forwardConn
	g.forwardMutex.Unlock()

	if conn == nil {
		return
	}

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("转发连接异常关闭: %v", err)
			}
			return
		}
	}
}

// startResultReceiver 启动结果接收器
func (g *Gateway) startResultReceiver() {
	for {
		if err := g.connectResult(); err != nil {
			log.Printf("结果接收连接失败: %v，5秒后重试...", err)
			time.Sleep(5 * time.Second)
			continue
		}

		// 处理结果消息
		g.handleResults()

		log.Println("结果连接断开，尝试重连...")
		time.Sleep(5 * time.Second)
	}
}

// connectResult 建立结果接收连接
func (g *Gateway) connectResult() error {
	log.Printf("连接结果 WebSocket: %s", g.config.Websocket.ResultURL)

	conn, _, err := websocket.DefaultDialer.Dial(g.config.Websocket.ResultURL, nil)
	if err != nil {
		return err
	}

	g.resultConn = conn
	log.Println("结果接收连接已建立")
	return nil
}

// handleResults 处理接收到的结果
func (g *Gateway) handleResults() {
	for {
		if g.resultConn == nil {
			return
		}

		_, data, err := g.resultConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("结果连接异常: %v", err)
			}
			return
		}

		// 解析结果
		var result SkillResult
		if err := json.Unmarshal(data, &result); err != nil {
			log.Printf("解析结果失败: %v, data=%s", err, string(data))
			continue
		}

		// 处理结果
		go g.processResult(&result)
	}
}

// processResult 处理技能返回的结果并回复用户
func (g *Gateway) processResult(result *SkillResult) {
	// 从缓存获取原始消息
	g.cacheMutex.RLock()
	originalMsg := g.messageCache[result.MessageID]
	g.cacheMutex.RUnlock()

	if originalMsg == nil {
		log.Printf("未找到原始消息: %s", result.MessageID)
		// 尝试直接用结果中的信息回复
		originalMsg = &LarkMessage{
			MessageID: result.MessageID,
			ChatID:    result.ChatID,
			ChatType:  result.ChatType,
		}
	}

	// 检查是否有错误
	if result.Error != "" {
		log.Printf("技能处理错误: %s", result.Error)
		g.replyToUser(context.Background(), originalMsg, "处理出错: "+result.Error, true)
		return
	}

	// 根据回复类型处理
	switch result.ReplyType {
	case "text":
		g.replyToUser(context.Background(), originalMsg, result.Content, false)
	case "card":
		g.replyCard(context.Background(), originalMsg, result.Content)
	default:
		// 默认按文本处理
		g.replyToUser(context.Background(), originalMsg, result.Content, false)
	}

	// 清理缓存
	g.cacheMutex.Lock()
	delete(g.messageCache, result.MessageID)
	g.cacheMutex.Unlock()
}

// replyToUser 回复文本消息给用户
func (g *Gateway) replyToUser(ctx context.Context, msg *LarkMessage, content string, isError bool) {
	// 直接构建JSON格式的content
	contentMap := map[string]string{"text": content}
	contentBytes, _ := json.Marshal(contentMap)
	textContent := string(contentBytes)

	log.Printf("[DEBUG] 回复内容: %s", textContent)

	var success bool
	var code int
	var msgErr string
	var requestId string

	if msg.ChatType == "p2p" {
		// 单聊：发送新消息
		resp, err := g.larkClient.Im.Message.Create(ctx, larkim.NewCreateMessageReqBuilder().
			ReceiveIdType(larkim.ReceiveIdTypeChatId).
			Body(larkim.NewCreateMessageReqBodyBuilder().
				MsgType(larkim.MsgTypeText).
				ReceiveId(msg.ChatID).
				Content(textContent).
				Build()).
			Build())
		if err != nil {
			log.Printf("回复消息失败: err=%v", err)
			return
		}
		success = resp.Success()
		code = resp.Code
		msgErr = resp.Msg
		requestId = resp.RequestId()
	} else {
		// 群聊：回复原消息
		resp, err := g.larkClient.Im.Message.Reply(ctx, larkim.NewReplyMessageReqBuilder().
			MessageId(msg.MessageID).
			Body(larkim.NewReplyMessageReqBodyBuilder().
				MsgType(larkim.MsgTypeText).
				Content(textContent).
				Build()).
			Build())
		if err != nil {
			log.Printf("回复消息失败: err=%v", err)
			return
		}
		success = resp.Success()
		code = resp.Code
		msgErr = resp.Msg
		requestId = resp.RequestId()
	}

	if !success {
		log.Printf("回复消息失败: code=%d, msg=%s, requestId=%s", code, msgErr, requestId)
	} else {
		log.Printf("回复成功: chat_type=%s, content=%s", msg.ChatType, truncate(content, 50))
	}
}

// replyCard 回复卡片消息
func (g *Gateway) replyCard(ctx context.Context, msg *LarkMessage, cardContent string) {
	var success bool
	var code int

	if msg.ChatType == "p2p" {
		resp, err := g.larkClient.Im.Message.Create(ctx, larkim.NewCreateMessageReqBuilder().
			ReceiveIdType(larkim.ReceiveIdTypeChatId).
			Body(larkim.NewCreateMessageReqBodyBuilder().
				MsgType(larkim.MsgTypeInteractive).
				ReceiveId(msg.ChatID).
				Content(cardContent).
				Build()).
			Build())
		if err != nil {
			log.Printf("回复卡片失败: %v", err)
			return
		}
		success = resp.Success()
		code = resp.Code
	} else {
		resp, err := g.larkClient.Im.Message.Reply(ctx, larkim.NewReplyMessageReqBuilder().
			MessageId(msg.MessageID).
			Body(larkim.NewReplyMessageReqBodyBuilder().
				MsgType(larkim.MsgTypeInteractive).
				Content(cardContent).
				Build()).
			Build())
		if err != nil {
			log.Printf("回复卡片失败: %v", err)
			return
		}
		success = resp.Success()
		code = resp.Code
	}

	if !success {
		log.Printf("回复卡片失败: code=%d", code)
	}
}

// safeString 安全获取字符串指针
func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// truncate 截断字符串
func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
