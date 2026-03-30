<template>
  <div class="ai-chat-container" :class="{ 'expanded': isExpanded }">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-left">
        <div class="ai-avatar">
          <div class="avatar-inner">
            <i class="el-icon-cpu"></i>
          </div>
          <div class="avatar-status"></div>
        </div>
        <div class="ai-info">
          <h4>{{ $t('aiChat.title') }}</h4>
          <span class="status" :class="{ online: isOnline }">
            {{ isOnline ? $t('aiChat.online') : $t('aiChat.offline') }}
          </span>
        </div>
      </div>
      <div class="header-right">
        <el-button 
          type="text" 
          icon="el-icon-files" 
          @click="showAssetViewer = true"
          :title="$t('aiChat.viewManagedAssets')"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-setting" 
          @click="showModelConfig = true"
          :title="$t('aiChat.aiModelConfig')"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-question" 
          @click="showHelpDialog = true"
          :title="$t('aiChat.usageHelp')"
        ></el-button>
        <el-button 
          type="text" 
          :icon="isExpanded ? 'el-icon-minus' : 'el-icon-full-screen'" 
          @click="toggleExpand"
          :title="isExpanded ? $t('aiChat.shrink') : $t('aiChat.enlarge')"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-refresh" 
          @click="clearChat"
          :title="$t('aiChat.clearChat')"
        ></el-button>
        <el-button 
          type="text" 
          icon="el-icon-close" 
          @click="$emit('close')"
          :title="$t('aiChat.close')"
        ></el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message-item"
        :class="{ 'user-message': message.type === 'user', 'ai-message': message.type === 'ai' }"
      >
        <div class="message-avatar" :class="message.type + '-avatar'">
          <div v-if="message.type === 'user'" class="user-avatar-inner">
            <i class="el-icon-user-solid"></i>
          </div>
          <div v-else class="ai-avatar-inner">
            <i class="el-icon-cpu"></i>
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="message-text" v-html="formatMessage(message.content, message.type)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="message-item ai-message">
        <div class="message-avatar ai-avatar">
          <div class="ai-avatar-inner">
            <i class="el-icon-cpu"></i>
          </div>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速提示词 -->
    <div class="quick-prompts" v-if="quickPrompts.length > 0">
      <div class="prompts-header">
        <span>{{ $t('aiChat.quickPrompts') }}</span>
        <el-button 
          type="text" 
          size="mini" 
          @click="togglePrompts"
          :icon="showPrompts ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
        ></el-button>
      </div>
      <transition name="prompts-slide">
        <div v-show="showPrompts" class="prompts-list">
          <el-button
            v-for="(prompt, index) in quickPrompts"
            :key="index"
            type="text"
            size="small"
            class="prompt-btn"
            @click="selectPrompt(prompt.text)"
            :title="prompt.description"
          >
            <i :class="prompt.icon"></i>
            {{ prompt.text }}
          </el-button>
        </div>
      </transition>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <div class="custom-textarea-wrapper">
          <textarea
            v-model="inputMessage"
            :rows="2"
            :placeholder="$t('aiChat.inputPlaceholder')"
            @keydown="handleKeyDown"
            :disabled="isLoading"
            class="custom-textarea"
            ref="messageInput"
          ></textarea>
        </div>
        <div class="input-actions">
          <el-button 
            type="primary" 
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
            size="small"
          >
            {{ $t('aiChat.send') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI模型配置弹窗 -->
    <ai-model-config 
      :visible.sync="showModelConfig"
      @config-saved="onConfigSaved"
    />

    <!-- 帮助弹窗 -->
    <el-dialog
      :title="$t('aiChat.helpTitle')"
      :visible.sync="showHelpDialog"
      width="800px"
      top="8vh"
      :close-on-click-modal="false"
      :modal="true"
      :lock-scroll="false"
      :z-index="4000"
      append-to-body
      class="help-dialog"
    >
      <div class="help-content">
        <!-- 快速开始 -->
        <div class="help-section">
          <h3><i class="el-icon-star-on"></i> {{ $t('aiChat.help.quickStart') }}</h3>
          <div class="help-item">
            <h4>{{ $t('aiChat.help.configureAiModel') }}</h4>
            <p v-html="$t('aiChat.help.configureAiModelDesc')"></p>
            <el-alert
              :title="$t('aiChat.help.configureAiModelTip')"
              type="success"
              :closable="false"
              show-icon
            ></el-alert>
          </div>
          
          <div class="help-item">
            <h4>{{ $t('aiChat.help.getApiKey') }}</h4>
            <div class="api-links">
              <el-tag type="success" size="small">🌟 DeepSeek</el-tag>
              <span>https://platform.deepseek.com/api_keys</span>
              
              <el-tag type="primary" size="small">🌟 硅基流动</el-tag>
              <span>https://cloud.siliconflow.cn/account/ak</span>
              
              <el-tag type="primary" size="small">OpenAI</el-tag>
              <span>https://platform.openai.com/api-keys</span>
              
              <el-tag type="warning" size="small">通义千问</el-tag>
              <span>https://dashscope.aliyun.com/api-key</span>
              
              <el-tag type="info" size="small">智谱清言</el-tag>
              <span>https://open.bigmodel.cn/usercenter/apikeys</span>
              
              <el-tag type="danger" size="small">Claude</el-tag>
              <span>https://console.anthropic.com/settings/keys</span>
              
              <el-tag size="small">豆包</el-tag>
              <span>https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey</span>
            </div>
            <el-alert
              :title="$t('aiChat.help.getApiKeyTip')"
              type="success"
              :closable="false"
              show-icon
              style="margin-top: 10px;"
            ></el-alert>
          </div>
        </div>

        <!-- 监控查询指南 -->
        <div class="help-section">
          <h3><i class="el-icon-monitor"></i> {{ $t('aiChat.help.monitorQueryGuide') }}</h3>
          <div class="help-item">
            <h4>{{ $t('aiChat.help.assetQueryBestPractice') }}</h4>
            <p>{{ $t('aiChat.help.assetQueryBestPracticeDesc') }}</p>
            <div class="query-examples">
              <div class="example-item">
                <el-tag type="success" size="mini">{{ $t('aiChat.help.recommended') }}</el-tag>
                <code>{{ $t('aiChat.help.queryExample1') }}</code>
                <span class="example-desc">{{ $t('aiChat.help.queryExample1Desc') }}</span>
              </div>
              <div class="example-item">
                <el-tag type="success" size="mini">{{ $t('aiChat.help.recommended') }}</el-tag>
                <code>{{ $t('aiChat.help.queryExample2') }}</code>
                <span class="example-desc">{{ $t('aiChat.help.queryExample2Desc') }}</span>
              </div>
              <div class="example-item">
                <el-tag type="warning" size="mini">{{ $t('aiChat.help.general') }}</el-tag>
                <code>{{ $t('aiChat.help.queryExample3') }}</code>
                <span class="example-desc">{{ $t('aiChat.help.queryExample3Desc') }}</span>
              </div>
            </div>
          </div>

          <div class="help-item">
            <h4>{{ $t('aiChat.help.supportedMonitorTypes') }}</h4>
            <div class="monitor-types">
              <el-tag type="primary">{{ $t('aiChat.help.systemMonitor') }}</el-tag>
              <span>{{ $t('aiChat.help.systemMonitorDesc') }}</span>
              
              <el-tag type="success">{{ $t('aiChat.help.database') }}</el-tag>
              <span>{{ $t('aiChat.help.databaseDesc') }}</span>
              
              <el-tag type="warning">{{ $t('aiChat.help.messageQueue') }}</el-tag>
              <span>{{ $t('aiChat.help.messageQueueDesc') }}</span>
              
              <el-tag type="info">{{ $t('aiChat.help.webService') }}</el-tag>
              <span>{{ $t('aiChat.help.webServiceDesc') }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷操作 -->
        <div class="help-section">
          <h3><i class="el-icon-magic-stick"></i> {{ $t('aiChat.help.quickOperations') }}</h3>
          <div class="help-item">
            <h4>{{ $t('aiChat.help.keyboardShortcuts') }}</h4>
            <div class="shortcuts">
              <div class="shortcut-item">
                <kbd>Enter</kbd>
                <span>{{ $t('aiChat.help.sendMessage') }}</span>
              </div>
              <div class="shortcut-item">
                <kbd>Shift</kbd> + <kbd>Enter</kbd>
                <span>{{ $t('aiChat.help.newline') }}</span>
              </div>
            </div>
          </div>

          <div class="help-item">
            <h4>{{ $t('aiChat.help.presetPrompts') }}</h4>
            <p>{{ $t('aiChat.help.presetPromptsDesc') }}</p>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="help-section">
          <h3><i class="el-icon-question"></i> {{ $t('aiChat.help.faq') }}</h3>
          <div class="faq-item">
            <h4>{{ $t('aiChat.help.faq1Q') }}</h4>
            <p>{{ $t('aiChat.help.faq1A') }}</p>
          </div>
          <div class="faq-item">
            <h4>{{ $t('aiChat.help.faq2Q') }}</h4>
            <p>{{ $t('aiChat.help.faq2A') }}</p>
          </div>
          <div class="faq-item">
            <h4>{{ $t('aiChat.help.faq3Q') }}</h4>
            <p>{{ $t('aiChat.help.faq3A') }}</p>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showHelpDialog = false">{{ $t('aiChat.help.iKnow') }}</el-button>
      </span>
    </el-dialog>

    <!-- 资产查看器 -->
    <AssetViewer :visible.sync="showAssetViewer" />
  </div>
</template>

<script>
import { processQuery, isWebSocketConnected, getWebSocketService } from '@/utils/opsQueryService'
import AiModelConfig from '@/components/AiModelConfig'
import AssetViewer from '@/components/AssetViewer'

export default {
  name: 'AiChat',
  components: {
    AiModelConfig,
    AssetViewer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      isLoading: false,
      isOnline: true,
      selectedModel: 'siliconflow',
      sessionId: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      isExpanded: false, // 控制是否展开
      showModelConfig: false, // 控制模型配置弹窗
      showHelpDialog: false, // 控制帮助弹窗
      showAssetViewer: false, // 控制资产查看器
      currentModelConfig: null, // 当前模型配置
      storageKey: 'ai_chat_history', // localStorage存储键
      maxHistorySize: 100, // 最大历史记录数量
      showPrompts: true // 是否显示快速提示词
    }
  },
  computed: {
    quickPrompts() { // 预置提示词列表
      return [
        {
          text: this.$t('common.aiChat.quickPromptList.queryAllAssets'),
          description: this.$t('common.aiChat.quickPromptList.queryAllAssetsDesc'),
          icon: 'el-icon-monitor'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.serverInspection'),
          description: this.$t('common.aiChat.quickPromptList.serverInspectionDesc'),
          icon: 'el-icon-cpu'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.mysqlStatus'),
          description: this.$t('common.aiChat.quickPromptList.mysqlStatusDesc'),
          icon: 'el-icon-coin'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.redisStatus'),
          description: this.$t('common.aiChat.quickPromptList.redisStatusDesc'),
          icon: 'el-icon-box'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.kafkaStatus'),
          description: this.$t('common.aiChat.quickPromptList.kafkaStatusDesc'),
          icon: 'el-icon-message'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.performanceAnalysis'),
          description: this.$t('common.aiChat.quickPromptList.performanceAnalysisDesc'),
          icon: 'el-icon-data-analysis'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.viewAlerts'),
          description: this.$t('common.aiChat.quickPromptList.viewAlertsDesc'),
          icon: 'el-icon-warning'
        },
        {
          text: this.$t('common.aiChat.quickPromptList.networkCheck'),
          description: this.$t('common.aiChat.quickPromptList.networkCheckDesc'),
          icon: 'el-icon-connection'
        }
      ]
    }
  },
  mounted() {
    this.loadChatHistory()
    this.initChat()
    this.loadModelConfig()
    this.initWebSocketListeners()
  },
  methods: {
    // 初始化聊天
    initChat() {
      // 如果没有历史记录，添加欢迎消息
      if (this.messages.length === 0) {
        this.addWelcomeMessage()
      }
    },

    // 初始化 WebSocket 监听器
    initWebSocketListeners() {
      const wsService = getWebSocketService()

      // 监听连接状态
      wsService.on('connected', () => {
        console.log('[AiChat] WebSocket connected')
        this.isOnline = true
      })

      wsService.on('disconnected', () => {
        console.log('[AiChat] WebSocket disconnected')
        this.isOnline = false
      })

      // 检查初始状态
      this.isOnline = isWebSocketConnected()
    },
    
    // 添加欢迎消息
    addWelcomeMessage() {
      this.messages.push({
        type: 'ai',
        content: this.$t('common.aiChat.welcomeMessage'),
        timestamp: new Date()
      })
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return

      const userMessage = this.inputMessage.trim()
      this.inputMessage = ''

      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      })

      // 保存历史记录
      this.saveChatHistory()

      this.scrollToBottom()
      this.isLoading = true

      try {
        console.log('[AiChat] 发送消息:', userMessage)

        // 使用 WebSocket 进行查询
        const response = await processQuery(userMessage, {
          sessionId: this.sessionId,
          history: this.messages.slice(-10)
        })

        console.log('[AiChat] 收到响应:', response)

        // 添加AI回复
        this.messages.push({
          type: 'ai',
          content: response || '抱歉，我暂时无法回答您的问题。',
          timestamp: new Date()
        })

        // 保存历史记录
        this.saveChatHistory()

      } catch (error) {
        console.error('[AiChat] 对话错误:', error)
        this.messages.push({
          type: 'ai',
          content: this.$t('common.aiChat.error.serviceUnavailable'),
          timestamp: new Date()
        })

        // 保存历史记录
        this.saveChatHistory()
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },
    
    // 清空对话
    clearChat() {
      this.$confirm(this.$t('common.aiChat.confirm.clearChat'), '提示', {
        confirmButtonText: this.$t('common.aiChat.confirm.confirm'),
        cancelButtonText: this.$t('common.aiChat.confirm.cancel'),
        type: 'warning'
      }).then(() => {
        this.messages = []
        this.addWelcomeMessage()
        // 清空本地存储的历史记录
        localStorage.removeItem(this.storageKey)
      })
    },
    
    // 格式化消息内容
    formatMessage(content, messageType) {
      if (!content) return ''
      
      // 只对 AI 消息进行 Markdown 解析
      if (messageType === 'ai') {
        // 检测是否包含 Markdown 格式
        const hasMarkdown = this.detectMarkdown(content)
        
        if (hasMarkdown) {
          // 进行 Markdown 转换
          let html = content
            // 标题处理
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            
            // 粗体和斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // 代码块（行内）
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            
            // 列表项
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
            
            // 分割线
            .replace(/^---$/gim, '<hr>')
            
            // 换行处理
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
          
          // 包装段落
          if (html.indexOf('<h1>') === -1 && html.indexOf('<h2>') === -1 && html.indexOf('<h3>') === -1) {
            html = '<p>' + html + '</p>'
          }
          
          // 处理列表
          html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
          
          return html
        }
      }
      
      // 用户消息或无 Markdown 的 AI 消息，保持原有的简单换行处理
      return content.replace(/\n/g, '<br>')
    },
    
    // 检测是否包含 Markdown 格式
    detectMarkdown(content) {
      const markdownPatterns = [
        /^#{1,6} /m,           // 标题
        /\*\*.*?\*\*/,         // 粗体
        /^- /m,                // 无序列表
        /^\d+\. /m,            // 有序列表
        /^---$/m,              // 分割线
        /`.*?`/,               // 行内代码
        /^\[.*\]\(.*\)/        // 链接
      ]
      
      return markdownPatterns.some(pattern => pattern.test(content))
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const now = new Date()
      const time = new Date(timestamp)
      const diff = now - time
      
      if (diff < 60000) { // 1分钟内
        return this.$t('common.aiChat.time.justNow')
      } else if (diff < 3600000) { // 1小时内
        return this.$t('common.aiChat.time.minutesAgo', { minutes: Math.floor(diff / 60000) })
      } else if (diff < 86400000) { // 24小时内
        return this.$t('common.aiChat.time.today', { time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) })
      } else {
        return this.$t('common.aiChat.time.date', { date: time.toLocaleDateString('zh-CN') })
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    // 加载模型配置
    loadModelConfig() {
      try {
        const saved = localStorage.getItem('aiModelConfig')
        if (saved) {
          this.currentModelConfig = JSON.parse(saved)
          console.log('已加载自定义模型配置:', this.currentModelConfig)
        }
      } catch (e) {
        console.error('加载模型配置失败:', e)
      }
    },

    // 配置保存回调
    onConfigSaved(config) {
      this.currentModelConfig = config
      console.log('模型配置已更新:', config)
      this.$message.success(this.$t('common.aiChat.message.saveSuccess'))
    },

    // 获取提供商名称
    getProviderName(provider) {
      return this.$t(`common.aiChat.providerNames.${provider}`) || provider
    },

    // 切换展开/缩小
    toggleExpand() {
      this.isExpanded = !this.isExpanded
      // 放大时滚动到底部，确保显示最新消息
      if (this.isExpanded) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    // 切换提示词显示
    togglePrompts() {
      this.showPrompts = !this.showPrompts
    },

    // 选择提示词
    selectPrompt(promptText) {
      this.inputMessage = promptText
      // 自动聚焦到输入框
      this.$nextTick(() => {
        if (this.$refs.messageInput) {
          this.$refs.messageInput.focus()
          // 将光标移到文本末尾
          const textarea = this.$refs.messageInput
          textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
      })
    },

    // 处理键盘按下事件
    handleKeyDown(event) {
      if (event.key === 'Enter') {
        if (event.shiftKey) {
          // Shift+Enter 换行，让默认行为处理
          return
        } else {
          // Enter 发送消息
          event.preventDefault()
          if (!this.isLoading && this.inputMessage.trim()) {
            this.sendMessage()
          }
        }
      }
    },

    // 加载聊天历史
    loadChatHistory() {
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (saved) {
          const history = JSON.parse(saved)
          // 验证数据格式
          if (Array.isArray(history)) {
            this.messages = history.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
            console.log(`已加载 ${this.messages.length} 条历史对话记录`)
          }
        }
      } catch (error) {
        console.error('加载聊天历史失败:', error)
        this.messages = []
      }
    },

    // 保存聊天历史
    saveChatHistory() {
      try {
        // 限制历史记录数量，避免占用过多空间
        const historyToSave = this.messages.slice(-this.maxHistorySize)
        localStorage.setItem(this.storageKey, JSON.stringify(historyToSave))
      } catch (error) {
        console.error('保存聊天历史失败:', error)
        // 如果存储空间不足，尝试清理旧记录
        if (error.name === 'QuotaExceededError') {
          this.cleanupHistory()
        }
      }
    },

    // 清理历史记录
    cleanupHistory() {
      try {
        // 只保留最近50条记录
        const recentMessages = this.messages.slice(-50)
        this.messages = recentMessages
        localStorage.setItem(this.storageKey, JSON.stringify(recentMessages))
        console.log('已清理历史记录，保留最近50条')
      } catch (error) {
        console.error('清理历史记录失败:', error)
        // 如果还是失败，清空历史记录
        localStorage.removeItem(this.storageKey)
      }
    }
  },
  
  watch: {
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: none;
  overflow: hidden;
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease-in-out;

  &.expanded {
    width: 800px;
    height: 80vh;
    max-height: 800px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  }
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .ai-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      position: relative;
      
      .avatar-inner {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        i {
          font-size: 16px;
          color: white;
        }
      }
      
      .avatar-status {
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #4ade80;
        border: 2px solid white;
        animation: pulse 2s infinite;
      }
    }
    
    .ai-info {
      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      
      .status {
        font-size: 12px;
        opacity: 0.8;
        
        &.online {
          color: #4ade80;
        }
      }
    }
  }
  
  .header-right {
    .el-button {
      color: white;
      padding: 8px;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  animation: messageSlideIn 0.3s ease-out;
  
  &.user-message {
    flex-direction: row-reverse;
    
    .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-right: 12px;
      margin-left: 0;
      box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
    }
  }
  
  &.ai-message {
    .message-bubble {
      background: white;
      color: #333;
      margin-left: 12px;
      margin-right: 0;
      border: 1px solid #e5e5e5;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(10px);
    }
    
    // AI 消息的 Markdown 样式
    .message-text {
      h1, h2, h3 {
        margin: 16px 0 8px 0;
        font-weight: bold;
        line-height: 1.3;
      }
      
      h1 { font-size: 20px; color: #2c3e50; }
      h2 { font-size: 18px; color: #34495e; }
      h3 { font-size: 16px; color: #5a6c7d; }
      
      p {
        margin: 8px 0;
        line-height: 1.6;
      }
      
      strong {
        font-weight: bold;
        color: #2c3e50;
      }
      
      em {
        font-style: italic;
        color: #7f8c8d;
      }
      
      code {
        background: #f8f9fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 0.9em;
        color: #e74c3c;
      }
      
      ul {
        margin: 8px 0;
        padding-left: 20px;
        
        li {
          margin: 4px 0;
          list-style-type: disc;
        }
      }
      
      hr {
        border: none;
        border-top: 1px solid #e1e8ed;
        margin: 16px 0;
      }
    }
  }
  
  .message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    
    &.user-avatar {
      .user-avatar-inner {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        
        i {
          font-size: 18px;
          color: white;
        }
      }
    }
    
    &.ai-avatar {
      .ai-avatar-inner {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
        
        i {
          font-size: 18px;
          color: white;
        }
      }
    }
  }
  
  .message-content {
    max-width: 70%;
    
    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
      
      .message-text {
        line-height: 1.5;
        margin-bottom: 4px;
      }
      
      .message-time {
        font-size: 11px;
        opacity: 0.7;
        text-align: right;
      }
    }
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 8px 0;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
    margin: 0 2px;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(229, 229, 229, 0.5);
  
  .input-container {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    
    .custom-textarea-wrapper {
      flex: 1;
      
      .custom-textarea {
        width: 100%;
        min-height: 60px;
        padding: 8px 12px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        line-height: 1.5;
        color: #606266;
        background-color: #fff;
        resize: none;
        outline: none;
        transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        
        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
        
        &:disabled {
          background-color: #f5f7fa;
          border-color: #e4e7ed;
          color: #c0c4cc;
          cursor: not-allowed;
        }
        
        &::placeholder {
          color: #c0c4cc;
        }
      }
    }
    
    .el-textarea {
      flex: 1;
    }
    
    .input-actions {
      .el-button {
        height: 36px;
        padding: 0 20px;
      }
    }
  }
}

.quick-prompts {
  padding: 12px 20px 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(229, 229, 229, 0.5);
  
  .prompts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    span {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }
    
    .el-button {
      padding: 4px;
      color: #666;
      
      &:hover {
        color: #409eff;
      }
    }
  }
  
  .prompts-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 12px;
    
    .prompt-btn {
      padding: 6px 12px;
      border: 1px solid #e1e8ed;
      border-radius: 16px;
      background: white;
      color: #333;
      font-size: 12px;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f0f9ff;
        border-color: #409eff;
        color: #409eff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }
      
      i {
        margin-right: 4px;
        font-size: 12px;
      }
    }
  }
}

.prompts-slide-enter-active,
.prompts-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.prompts-slide-enter,
.prompts-slide-leave-to {
  max-height: 0;
  opacity: 0;
}

// 响应式设计
@media (max-width: 768px) {
  .ai-chat-container {
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
  
  .message-content {
    max-width: 85% !important;
  }
  
  .quick-prompts {
    .prompts-list {
      .prompt-btn {
        font-size: 11px;
        padding: 4px 8px;
      }
    }
  }
}

// 帮助弹窗样式
.help-dialog {
  .help-content {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0 10px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
  }
  
  .help-section {
    margin-bottom: 30px;
    
    h3 {
      color: #409eff;
      font-size: 18px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e1f5fe;
      
      i {
        margin-right: 8px;
      }
    }
  }
  
  .help-item {
    margin-bottom: 20px;
    
    h4 {
      color: #333;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }
  }
  
  .api-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .el-tag {
      width: 80px;
      text-align: center;
      margin-right: 12px;
    }
    
    span {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #666;
    }
  }
  
  .query-examples {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    border-left: 4px solid #409eff;
    
    .example-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      gap: 10px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      code {
        background: #e7f3ff;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        color: #409eff;
        flex: 1;
      }
      
      .example-desc {
        font-size: 12px;
        color: #999;
        flex-shrink: 0;
      }
    }
  }
  
  .monitor-types {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .el-tag {
      width: 80px;
      text-align: center;
      margin-right: 12px;
    }
    
    span {
      color: #666;
      font-size: 13px;
    }
  }
  
  .shortcuts {
    display: flex;
    gap: 20px;
    
    .shortcut-item {
      display: flex;
      align-items: center;
      gap: 8px;
      
      kbd {
        background: #f5f5f5;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        color: #374151;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
      
      span {
        color: #666;
        font-size: 13px;
      }
    }
  }
  
  .faq-item {
    background: #fafbfc;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 10px;
    border-left: 4px solid #67c23a;
    
    h4 {
      color: #67c23a;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #555;
    }
  }
}

// 帮助弹窗层级和位置
::v-deep .help-dialog .el-dialog__wrapper {
  z-index: 4000 !important;
}

::v-deep .help-dialog .el-dialog {
  z-index: 4001 !important;
  margin-top: 8vh !important;
  margin-bottom: 8vh !important;
  max-height: 84vh !important;
  
  .el-dialog__body {
    max-height: calc(84vh - 120px) !important;
    overflow: hidden;
  }
}

::v-deep .help-dialog .el-overlay {
  z-index: 3999 !important;
}

// 响应式调整
@media (max-height: 800px) {
  ::v-deep .help-dialog .el-dialog {
    margin-top: 5vh !important;
    margin-bottom: 5vh !important;
    max-height: 90vh !important;
    
    .el-dialog__body {
      max-height: calc(90vh - 120px) !important;
    }
  }
}

@media (max-height: 600px) {
  ::v-deep .help-dialog .el-dialog {
    margin-top: 2vh !important;
    margin-bottom: 2vh !important;
    max-height: 96vh !important;
    
    .el-dialog__body {
      max-height: calc(96vh - 120px) !important;
    }
  }
}
</style>
