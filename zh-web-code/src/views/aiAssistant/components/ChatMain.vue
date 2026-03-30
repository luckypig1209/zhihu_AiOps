<template>
  <div class="chat-main">
    <!-- 欢迎页 -->
    <div class="welcome-page" v-if="messages.length === 0">
      <div class="welcome-content">
        <div class="welcome-logo">
          <div class="logo-circle">
            <i class="el-icon-cpu"></i>
          </div>
          <div class="logo-pulse"></div>
        </div>
        <h1 class="welcome-title">智能问答助手</h1>
        <p class="welcome-desc">欢迎使用您的专属AI运维工作台，让管理运维更简单高效</p>

        <div class="feature-cards">
          <div class="feature-card" @click="$emit('send', '查询最近1小时内CPU总使用率')">
            <i class="el-icon-data-line"></i>
            <span>指标查询</span>
            <p>查询 CPU、内存、磁盘等监控指标</p>
          </div>
          <div class="feature-card" @click="$emit('send', '查询目前监控了多少网络设备')">
            <i class="el-icon-monitor"></i>
            <span>设备管理</span>
            <p>查询和管理监控对象信息</p>
          </div>
          <div class="feature-card" @click="$emit('send', '执行全面巡检')">
            <i class="el-icon-finished"></i>
            <span>智能巡检</span>
            <p>一键执行全面基础设施健康检查</p>
          </div>
          <div class="feature-card" @click="$emit('send', '查看当前告警')">
            <i class="el-icon-warning-outline"></i>
            <span>告警中心</span>
            <p>查看当前系统告警和异常</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" v-else ref="messagesContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-item"
        :class="msg.type"
      >
        <div class="message-avatar">
          <div v-if="msg.type === 'user'" class="avatar user-avatar">
            <i class="el-icon-user-solid"></i>
          </div>
          <div v-else class="avatar ai-avatar">
            <i class="el-icon-cpu"></i>
          </div>
        </div>
        <div class="message-body">
          <div class="message-bubble" v-html="formatMessage(msg.content, msg.type)"></div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 加载动画（流式输出时不显示，因为已有内容逐字出现） -->
      <div v-if="isLoading && !hasStreamingMessage" class="message-item ai">
        <div class="message-avatar">
          <div class="avatar ai-avatar">
            <i class="el-icon-cpu"></i>
          </div>
        </div>
        <div class="message-body">
          <div class="message-bubble typing">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <div class="input-wrapper">
        <textarea
          ref="inputRef"
          v-model="inputText"
          placeholder="输入您的问题... (Enter 发送, Shift+Enter 换行)"
          @keydown="handleKeyDown"
          :disabled="isLoading"
          rows="1"
        ></textarea>
        <el-button
          type="primary"
          icon="el-icon-s-promotion"
          circle
          class="send-btn"
          :disabled="!inputText.trim() || isLoading"
          :loading="isLoading"
          @click="sendMessage"
        ></el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMain',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputText: ''
    }
  },
  computed: {
    hasStreamingMessage() {
      return this.messages.some(m => m.streaming)
    }
  },
  methods: {
    sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.isLoading) return
      this.$emit('send', text)
      this.inputText = ''
      this.$nextTick(() => {
        this.autoResize()
      })
    },

    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },

    autoResize() {
      const el = this.$refs.inputRef
      if (!el) return
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },

    // 填充输入框并发送
    fillAndSend(text) {
      this.inputText = text
      this.$nextTick(() => {
        this.sendMessage()
      })
    },

    // 仅填充不发送
    fillInput(text) {
      this.inputText = text
      this.$nextTick(() => {
        this.autoResize()
        this.$refs.inputRef && this.$refs.inputRef.focus()
      })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },

    formatMessage(content, type) {
      if (!content) return ''
      if (type === 'user') {
        return content.replace(/\n/g, '<br>')
      }
      // AI 消息 Markdown 渲染
      return this.renderMarkdown(content)
    },

    renderMarkdown(text) {
      let html = text
        // 代码块
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
        // 标题
        .replace(/^### (.*$)/gim, '<h4 class="md-h4">$1</h4>')
        .replace(/^## (.*$)/gim, '<h3 class="md-h3">$1</h3>')
        .replace(/^# (.*$)/gim, '<h2 class="md-h2">$1</h2>')
        // 粗体和斜体
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 行内代码
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        // 分割线
        .replace(/^---$/gim, '<hr class="md-hr">')
        // 无序列表
        .replace(/^- (.*$)/gim, '<li class="md-li">$1</li>')
        // 有序列表
        .replace(/^\d+\. (.*$)/gim, '<li class="md-li-ordered">$1</li>')
        // 换行
        .replace(/\n\n/g, '</p><p class="md-p">')
        .replace(/\n/g, '<br>')

      // 包装连续的 li 标签
      html = html.replace(/((<li class="md-li">.*?<\/li>\s*)+)/g, '<ul class="md-ul">$1</ul>')
      html = html.replace(/((<li class="md-li-ordered">.*?<\/li>\s*)+)/g, '<ol class="md-ol">$1</ol>')

      return html
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const time = new Date(timestamp)
      const now = new Date()
      const diff = now - time

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
      if (diff < 86400000) return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      return time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    }
  },

  watch: {
    messages() {
      this.scrollToBottom()
    },
    isLoading() {
      this.scrollToBottom()
    },
    inputText() {
      this.$nextTick(() => this.autoResize())
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #1890ff;
$primary-light: rgba(24, 144, 255, 0.08);

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f7f8fa;
}

// ==================== 欢迎页 ====================
.welcome-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  text-align: center;
  max-width: 680px;
}

.welcome-logo {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;

  .logo-circle {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: $primary;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;

    i {
      font-size: 32px;
      color: #fff;
    }
  }

  .logo-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: $primary;
    animation: logoPulse 2s ease-in-out infinite;
    opacity: 0.25;
  }
}

@keyframes logoPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
  50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0 0 10px 0;
}

.welcome-desc {
  font-size: 14px;
  color: #8c94a5;
  margin: 0 0 36px 0;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  .feature-card {
    background: #fff;
    border: 1px solid #e8ecf1;
    border-radius: 10px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    animation: cardIn 0.5s ease-out both;

    &:nth-child(1) { animation-delay: 0.15s; }
    &:nth-child(2) { animation-delay: 0.25s; }
    &:nth-child(3) { animation-delay: 0.35s; }
    &:nth-child(4) { animation-delay: 0.45s; }

    &:hover {
      border-color: $primary;
      box-shadow: 0 4px 16px rgba(24, 144, 255, 0.12);
      transform: translateY(-2px);
    }

    i {
      font-size: 22px;
      color: $primary;
      margin-bottom: 8px;
      display: block;
    }

    span {
      font-size: 14px;
      font-weight: 600;
      color: #1f2d3d;
      display: block;
      margin-bottom: 4px;
    }

    p {
      font-size: 12px;
      color: #8c94a5;
      margin: 0;
      line-height: 1.4;
    }
  }
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

// ==================== 消息列表 ====================
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 3px;
  }
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  animation: msgIn 0.3s ease-out;

  &.user {
    flex-direction: row-reverse;

    .message-bubble {
      background: $primary;
      color: #fff;
      border-radius: 16px 16px 4px 16px;
    }

    .message-time {
      text-align: right;
    }
  }

  &.ai {
    .message-bubble {
      background: #fff;
      color: #333;
      border: 1px solid #e8ecf1;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }
  }
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  flex-shrink: 0;
  margin: 0 12px;

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    i { font-size: 16px; color: #fff; }
  }

  .user-avatar {
    background: $primary;
  }

  .ai-avatar {
    background: #36cfc9;
  }
}

.message-body {
  max-width: 70%;
  min-width: 60px;
}

.message-bubble {
  padding: 12px 16px;
  line-height: 1.6;
  font-size: 14px;
  word-wrap: break-word;

  &.typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 16px 20px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #999;
      animation: dotBounce 1.4s infinite ease-in-out;

      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
    }
  }

  // Markdown 样式
  ::v-deep {
    .md-h2 { font-size: 18px; font-weight: 600; color: #1f2d3d; margin: 16px 0 8px; }
    .md-h3 { font-size: 16px; font-weight: 600; color: #2c3e50; margin: 12px 0 6px; }
    .md-h4 { font-size: 14px; font-weight: 600; color: #34495e; margin: 10px 0 4px; }
    .md-p { margin: 8px 0; }
    .md-hr { border: none; border-top: 1px solid #e8e8e8; margin: 12px 0; }
    .md-ul, .md-ol { margin: 8px 0; padding-left: 20px; }
    .md-li { margin: 4px 0; list-style: disc; }
    .md-li-ordered { margin: 4px 0; list-style: decimal; }

    .inline-code {
      background: #f0f2f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.9em;
      color: #e74c3c;
    }

    .code-block {
      background: #1e1e2e;
      color: #cdd6f4;
      padding: 12px 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 13px;
      line-height: 1.5;

      code {
        color: inherit;
        background: none;
        padding: 0;
      }
    }

    strong { font-weight: 600; color: #1f2d3d; }
    em { font-style: italic; color: #666; }
  }
}

.message-time {
  font-size: 11px;
  color: #b0b8c4;
  margin-top: 4px;
  padding: 0 4px;
}

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

// ==================== 输入区域 ====================
.input-area {
  padding: 14px 24px 18px;
  background: #fff;
  border-top: 1px solid #e8ecf1;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 10px;
  padding: 8px 12px;
  transition: all 0.25s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  }

  textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    min-height: 24px;
    max-height: 120px;
    font-family: inherit;
    padding: 4px 0;

    &::placeholder {
      color: #b0b8c4;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .send-btn {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    background: $primary;
    border: none;

    &:hover:not(:disabled) {
      background: #40a9ff;
    }

    &:disabled {
      background: #d0d5dd;
      opacity: 0.6;
    }
  }
}

// ==================== 响应式 ====================
@media (max-width: 768px) {
  .feature-cards {
    grid-template-columns: 1fr;
  }

  .message-body {
    max-width: 85%;
  }

  .welcome-title {
    font-size: 20px;
  }
}
</style>
