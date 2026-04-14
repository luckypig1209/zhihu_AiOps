package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"gopkg.in/yaml.v3"
)

// Config 适配层配置
type Config struct {
	Server struct {
		Listen      string `yaml:"listen"`
		ForwardPath string `yaml:"forward_path"`
		ResultPath  string `yaml:"result_path"`
	} `yaml:"server"`
	AI struct {
		WSURL string `yaml:"ws_url"`
	} `yaml:"ai"`
}

// LarkMessage 飞书消息结构（与 main.go 一致）
type LarkMessage struct {
	MessageID   string `json:"message_id"`
	ChatID      string `json:"chat_id"`
	ChatType    string `json:"chat_type"`
	UserID      string `json:"user_id"`
	MessageType string `json:"message_type"`
	Content     string `json:"content"`
	CreateTime  string `json:"create_time"`
	RootID      string `json:"root_id,omitempty"`
	ParentID    string `json:"parent_id,omitempty"`
}

// SkillResult 技能处理结果（返回给 main.go）
type SkillResult struct {
	MessageID string `json:"message_id"`
	ChatID    string `json:"chat_id"`
	ChatType  string `json:"chat_type"`
	ReplyType string `json:"reply_type"`
	Content   string `json:"content"`
	Error     string `json:"error,omitempty"`
}

// BridgeMessage AI Bridge 消息格式
type BridgeMessage struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Payload   json.RawMessage `json:"payload"`
	Timestamp int64           `json:"timestamp,omitempty"`
}

// PendingRequest 关联上下文
type PendingRequest struct {
	Origin    *LarkMessage
	StartedAt time.Time
	Buffer    *strings.Builder
}

// Adapter 适配层
type Adapter struct {
	cfg *Config

	aiConn   *websocket.Conn
	aiMutex  sync.Mutex
	aiReady  bool
	aiClosed chan struct{}

	resultConn  *websocket.Conn
	resultMutex sync.Mutex

	pending      map[string]*PendingRequest
	pendingMutex sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	rand.Seed(time.Now().UnixNano())

	configPath := flag.String("config", "adapter-config.yaml", "adapter config path")
	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	adapter := &Adapter{
		cfg:      cfg,
		pending:  make(map[string]*PendingRequest),
		aiClosed: make(chan struct{}),
	}

	go adapter.runAIClient()

	mux := http.NewServeMux()
	mux.HandleFunc(cfg.Server.ForwardPath, adapter.handleForwardWS)
	mux.HandleFunc(cfg.Server.ResultPath, adapter.handleResultWS)

	server := &http.Server{
		Addr:    cfg.Server.Listen,
		Handler: mux,
	}

	go func() {
		log.Printf("[Adapter] Listen on %s (forward=%s, result=%s)", cfg.Server.Listen, cfg.Server.ForwardPath, cfg.Server.ResultPath)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// 优雅退出
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	log.Println("[Adapter] shutting down...")
	_ = server.Close()
}

// loadConfig 读取 YAML 配置
func loadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}

	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}

	if cfg.Server.Listen == "" {
		cfg.Server.Listen = ":10099"
	}
	if cfg.Server.ForwardPath == "" {
		cfg.Server.ForwardPath = "/forward"
	}
	if cfg.Server.ResultPath == "" {
		cfg.Server.ResultPath = "/result"
	}
	if cfg.AI.WSURL == "" {
		cfg.AI.WSURL = "ws://127.0.0.1:9999"
	}
	return cfg, nil
}

// handleForwardWS 接收 main.go 转发的消息
func (a *Adapter) handleForwardWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[Adapter] forward upgrade failed: %v", err)
		return
	}
	log.Println("[Adapter] forward connection established")

	go func() {
		defer conn.Close()
		for {
			_, data, err := conn.ReadMessage()
			if err != nil {
				log.Printf("[Adapter] forward connection closed: %v", err)
				return
			}

			var msg LarkMessage
			if err := json.Unmarshal(data, &msg); err != nil {
				log.Printf("[Adapter] invalid lark message: %v, data=%s", err, string(data))
				continue
			}

			if err := a.handleLarkMessage(&msg); err != nil {
				log.Printf("[Adapter] handle message error: %v", err)
				a.sendErrorResult(&msg, err.Error())
			}
		}
	}()
}

// handleResultWS 保存 result 连接（用于回传结果给 main.go）
func (a *Adapter) handleResultWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[Adapter] result upgrade failed: %v", err)
		return
	}

	a.resultMutex.Lock()
	if a.resultConn != nil {
		_ = a.resultConn.Close()
	}
	a.resultConn = conn
	a.resultMutex.Unlock()

	log.Println("[Adapter] result connection established")

	go func() {
		defer conn.Close()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Printf("[Adapter] result connection closed: %v", err)
				a.resultMutex.Lock()
				if a.resultConn == conn {
					a.resultConn = nil
				}
				a.resultMutex.Unlock()
				return
			}
		}
	}()
}

// handleLarkMessage 解析飞书消息并转发到 AI Bridge
func (a *Adapter) handleLarkMessage(msg *LarkMessage) error {
	text, err := extractLarkText(msg)
	if err != nil {
		return err
	}
	return a.sendQuery(msg, text)
}

// sendQuery 转发 query 到 AI Bridge
func (a *Adapter) sendQuery(msg *LarkMessage, text string) error {
	if !a.isAIReady() {
		return fmt.Errorf("AI Bridge 未连接")
	}

	reqID := newID()

	a.pendingMutex.Lock()
	a.pending[reqID] = &PendingRequest{
		Origin:    msg,
		StartedAt: time.Now(),
		Buffer:    &strings.Builder{},
	}
	a.pendingMutex.Unlock()

	payload := map[string]interface{}{
		"query": text,
		"context": map[string]interface{}{
			"message_id": msg.MessageID,
			"chat_id":    msg.ChatID,
			"chat_type":  msg.ChatType,
			"user_id":    msg.UserID,
		},
	}

	req := map[string]interface{}{
		"id":        reqID,
		"type":      "query",
		"payload":   payload,
		"timestamp": time.Now().UnixMilli(),
	}

	if err := a.writeAI(req); err != nil {
		a.pendingMutex.Lock()
		delete(a.pending, reqID)
		a.pendingMutex.Unlock()
		return err
	}

	return nil
}

// runAIClient 连接 AI Bridge 并处理响应
func (a *Adapter) runAIClient() {
	for {
		if err := a.connectAI(); err != nil {
			log.Printf("[Adapter] AI connect failed: %v, retrying in 5s", err)
			time.Sleep(5 * time.Second)
			continue
		}

		a.readAI()
		log.Println("[Adapter] AI connection lost, retrying in 5s")
		time.Sleep(5 * time.Second)
	}
}

func (a *Adapter) connectAI() error {
	log.Printf("[Adapter] connecting AI Bridge: %s", a.cfg.AI.WSURL)
	conn, _, err := websocket.DefaultDialer.Dial(a.cfg.AI.WSURL, nil)
	if err != nil {
		return err
	}

	a.aiMutex.Lock()
	a.aiConn = conn
	a.aiReady = true
	a.aiMutex.Unlock()

	// 注册为 frontend
	registerMsg := map[string]interface{}{
		"type":    "register",
		"payload": map[string]interface{}{"clientType": "frontend"},
	}
	_ = a.writeAI(registerMsg)

	log.Println("[Adapter] AI Bridge connected")
	return nil
}

func (a *Adapter) readAI() {
	for {
		a.aiMutex.Lock()
		conn := a.aiConn
		a.aiMutex.Unlock()

		if conn == nil {
			return
		}

		_, data, err := conn.ReadMessage()
		if err != nil {
			a.aiMutex.Lock()
			if a.aiConn == conn {
				a.aiConn = nil
				a.aiReady = false
			}
			a.aiMutex.Unlock()
			return
		}

		var msg BridgeMessage
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Printf("[Adapter] invalid AI message: %v, data=%s", err, string(data))
			continue
		}

		a.handleAIMessage(&msg)
	}
}

func (a *Adapter) handleAIMessage(msg *BridgeMessage) {
	switch msg.Type {
	case "response":
		a.handleFinalResponse(msg.ID, msg.Payload, "")
	case "stream_start":
		a.ensureBuffer(msg.ID)
	case "stream_chunk":
		chunk := extractStreamChunk(msg.Payload)
		if chunk != "" {
			a.appendBuffer(msg.ID, chunk)
		}
	case "stream_end":
		content := extractStreamEndContent(msg.Payload)
		a.handleFinalResponse(msg.ID, msg.Payload, content)
	default:
		// ignore other types
	}
}

func (a *Adapter) handleFinalResponse(requestID string, payload json.RawMessage, streamContent string) {
	pending := a.getPending(requestID)
	if pending == nil {
		return
	}

	replyText := streamContent
	if replyText == "" {
		replyText = pending.Buffer.String()
	}
	if replyText == "" {
		text, err := extractReplyFromPayload(payload)
		if err != nil {
			a.sendErrorResult(pending.Origin, err.Error())
			a.deletePending(requestID)
			return
		}
		replyText = text
	}

	a.sendResult(pending.Origin, replyText)
	a.deletePending(requestID)
}

// sendResult 写回 main.go
func (a *Adapter) sendResult(origin *LarkMessage, content string) {
	result := SkillResult{
		MessageID: origin.MessageID,
		ChatID:    origin.ChatID,
		ChatType:  origin.ChatType,
		ReplyType: "text",
		Content:   content,
	}

	a.writeResult(result)
}

func (a *Adapter) sendErrorResult(origin *LarkMessage, errMsg string) {
	result := SkillResult{
		MessageID: origin.MessageID,
		ChatID:    origin.ChatID,
		ChatType:  origin.ChatType,
		ReplyType: "text",
		Error:     errMsg,
		Content:   "",
	}
	a.writeResult(result)
}

func (a *Adapter) writeResult(result SkillResult) {
	a.resultMutex.Lock()
	defer a.resultMutex.Unlock()

	if a.resultConn == nil {
		log.Printf("[Adapter] result connection not ready, drop reply: %s", result.MessageID)
		return
	}

	data, _ := json.Marshal(result)
	if err := a.resultConn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Printf("[Adapter] write result failed: %v", err)
	}
}

func (a *Adapter) writeAI(message interface{}) error {
	a.aiMutex.Lock()
	defer a.aiMutex.Unlock()

	if a.aiConn == nil {
		return fmt.Errorf("AI Bridge not connected")
	}

	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return a.aiConn.WriteMessage(websocket.TextMessage, data)
}

func (a *Adapter) isAIReady() bool {
	a.aiMutex.Lock()
	defer a.aiMutex.Unlock()
	return a.aiReady && a.aiConn != nil
}

func (a *Adapter) ensureBuffer(id string) {
	a.pendingMutex.Lock()
	defer a.pendingMutex.Unlock()
	if p, ok := a.pending[id]; ok && p.Buffer == nil {
		p.Buffer = &strings.Builder{}
	}
}

func (a *Adapter) appendBuffer(id, chunk string) {
	a.pendingMutex.Lock()
	defer a.pendingMutex.Unlock()
	if p, ok := a.pending[id]; ok && p.Buffer != nil {
		p.Buffer.WriteString(chunk)
	}
}

func (a *Adapter) getPending(id string) *PendingRequest {
	a.pendingMutex.Lock()
	defer a.pendingMutex.Unlock()
	return a.pending[id]
}

func (a *Adapter) deletePending(id string) {
	a.pendingMutex.Lock()
	defer a.pendingMutex.Unlock()
	delete(a.pending, id)
}

// extractLarkText 提取文本
func extractLarkText(msg *LarkMessage) (string, error) {
	if msg.MessageType != "" && msg.MessageType != "text" {
		return "", fmt.Errorf("暂不支持消息类型: %s", msg.MessageType)
	}

	// Content 是 JSON 字符串，例如: {"text":"xxx"}
	var body struct {
		Text string `json:"text"`
	}
	if err := json.Unmarshal([]byte(msg.Content), &body); err != nil {
		// 如果不是 JSON，直接使用原始内容
		text := strings.TrimSpace(msg.Content)
		if text == "" {
			return "", fmt.Errorf("消息内容为空")
		}
		return text, nil
	}

	text := strings.TrimSpace(body.Text)
	if text == "" {
		return "", fmt.Errorf("消息内容为空")
	}
	return text, nil
}

// extractReplyFromPayload 将 AI Bridge response payload 转成文本
func extractReplyFromPayload(payload json.RawMessage) (string, error) {
	var wrapper struct {
		Success bool            `json:"success"`
		Skill   string          `json:"skill"`
		Query   string          `json:"query"`
		Result  json.RawMessage `json:"result"`
		Error   string          `json:"error"`
	}

	if err := json.Unmarshal(payload, &wrapper); err != nil {
		// payload 不是标准结构，直接返回原文
		return strings.TrimSpace(string(payload)), nil
	}

	if !wrapper.Success {
		if wrapper.Error != "" {
			return "", fmt.Errorf(wrapper.Error)
		}
		return "", fmt.Errorf("查询失败")
	}

	if len(wrapper.Result) == 0 {
		return "", nil
	}

	// 结果可能是字符串
	var resultStr string
	if err := json.Unmarshal(wrapper.Result, &resultStr); err == nil && strings.TrimSpace(resultStr) != "" {
		return strings.TrimSpace(resultStr), nil
	}

	// 尝试结构化对象
	var resultObj map[string]interface{}
	if err := json.Unmarshal(wrapper.Result, &resultObj); err == nil {
		if v, ok := resultObj["content"].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v), nil
		}
		if v, ok := resultObj["message"].(string); ok && strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v), nil
		}

		pretty, _ := json.MarshalIndent(resultObj, "", "  ")
		return string(pretty), nil
	}

	// fallback
	return strings.TrimSpace(string(wrapper.Result)), nil
}

// extractStreamChunk 解析 stream_chunk
func extractStreamChunk(payload json.RawMessage) string {
	var obj struct {
		Chunk string `json:"chunk"`
	}
	if err := json.Unmarshal(payload, &obj); err == nil {
		return obj.Chunk
	}
	return ""
}

// extractStreamEndContent 解析 stream_end
func extractStreamEndContent(payload json.RawMessage) string {
	var obj struct {
		Content string `json:"content"`
	}
	if err := json.Unmarshal(payload, &obj); err == nil {
		return obj.Content
	}
	return ""
}

func newID() string {
	return fmt.Sprintf("req_%d_%d", time.Now().UnixNano(), rand.Int63())
}
