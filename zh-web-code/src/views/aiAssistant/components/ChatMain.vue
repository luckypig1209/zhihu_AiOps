<template>
  <div class="chat-main" :style="moduleConfig ? { '--module-color': moduleConfig.color } : {}">
    <!-- 欢迎页 -->
    <div class="welcome-page" v-if="messages.length === 0">
      <div class="welcome-content">
        <div class="welcome-logo">
          <div class="logo-circle" :style="moduleConfig ? { background: moduleConfig.color } : {}">
            <i :class="moduleConfig ? moduleConfig.icon : 'el-icon-cpu'"></i>
          </div>
          <div class="logo-pulse" :style="moduleConfig ? { background: moduleConfig.color } : {}"></div>
        </div>
        <h1 class="welcome-title">{{ moduleConfig ? moduleConfig.welcomeTitle : '智能问答助手' }}</h1>
        <p class="welcome-desc" v-if="!moduleConfig">欢迎使用您的专属AI运维工作台，让管理运维更简单高效</p>
        <pre class="welcome-message" v-if="moduleConfig">{{ moduleConfig.welcomeMessage }}</pre>

        <div class="feature-cards">
          <template v-if="moduleConfig">
            <div
              class="feature-card"
              v-for="cap in moduleConfig.capabilities"
              :key="cap.label"
              @click="$emit('send', cap.triggerText)"
            >
              <i :class="cap.icon"></i>
              <span>{{ cap.label }}</span>
              <p>{{ cap.desc }}</p>
            </div>
          </template>
          <template v-else>
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
          </template>
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
          :placeholder="moduleConfig && moduleConfig.inputPlaceholder ? moduleConfig.inputPlaceholder : '输入您的问题... (Enter 发送, Shift+Enter 换行)'"
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
    },
    moduleConfig: {
      type: Object,
      default: null
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
$primary: #2f6bff;
$accent: #22d3ee;
$ink: #0f172a;
$muted: #5b6475;
$surface: rgba(255, 255, 255, 0.82);

.chat-main {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.18), transparent 45%),
    radial-gradient(circle at 82% 18%, rgba(47, 107, 255, 0.18), transparent 45%),
    linear-gradient(180deg, #f6faff 0%, #eef4ff 65%, #f9fbff 100%);
  font-family: 'Space Grotesk', 'Noto Sans SC', 'PingFang SC', sans-serif;
}

.chat-main::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.3;
  pointer-events: none;
}

.chat-main::after {
  content: '';
  position: absolute;
  right: -120px;
  bottom: -160px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.2), transparent 65%);
  pointer-events: none;
}

.chat-main > * {
  position: relative;
  z-index: 1;
}

// ==================== 欢迎页 ====================
.welcome-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.welcome-content {
  text-align: center;
  max-width: 720px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 20px;
  padding: 32px 32px 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(12px);
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
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 12px 28px rgba(47, 107, 255, 0.25);

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
    filter: blur(1px);
  }
}

@keyframes logoPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
  50% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: $ink;
  margin: 0 0 10px 0;
  letter-spacing: 0.6px;
}

.welcome-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 36px 0;
}

.welcome-message {
  font-size: 14px;
  color: $muted;
  line-height: 2;
  text-align: left;
  display: inline-block;
  margin: 0 0 32px 0;
  white-space: pre-wrap;
  font-family: inherit;
  background: rgba(15, 23, 42, 0.03);
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 12px;
  padding: 12px 14px;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .feature-card {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(47, 107, 255, 0.16);
    border-radius: 14px;
    padding: 18px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: left;
    animation: cardIn 0.5s ease-out both;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);

    &:nth-child(1) { animation-delay: 0.15s; }
    &:nth-child(2) { animation-delay: 0.25s; }
    &:nth-child(3) { animation-delay: 0.35s; }
    &:nth-child(4) { animation-delay: 0.45s; }

    &:hover {
      border-color: rgba(47, 107, 255, 0.35);
      box-shadow: 0 16px 36px rgba(47, 107, 255, 0.18);
      transform: translateY(-2px);
    }

    i {
      font-size: 22px;
      color: var(--module-color, #2f6bff);
      margin-bottom: 8px;
      display: block;
    }

    span {
      font-size: 14px;
      font-weight: 600;
      color: $ink;
      display: block;
      margin-bottom: 4px;
    }

    p {
      font-size: 12px;
      color: #6b7280;
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
  padding: 26px 24px 18px;
  background: rgba(255, 255, 255, 0.38);
  border-top: 1px solid rgba(15, 23, 42, 0.06);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(47, 107, 255, 0.25);
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
      background: linear-gradient(135deg, var(--module-color, #2f6bff), #22d3ee);
      color: #fff;
      border-radius: 16px 16px 4px 16px;
      box-shadow: 0 12px 28px rgba(47, 107, 255, 0.25);
    }

    .message-time {
      text-align: right;
    }
  }

  &.ai {
    .message-bubble {
      background: $surface;
      color: #1f2937;
      border: 1px solid rgba(47, 107, 255, 0.14);
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(10px);
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
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);

    i { font-size: 16px; color: #fff; }
  }

  .user-avatar {
    background: linear-gradient(135deg, var(--module-color, #2f6bff), #22d3ee);
  }

  .ai-avatar {
    background: linear-gradient(135deg, #14b8a6, #0ea5e9);
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
  letter-spacing: 0.2px;

  &.typing {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 16px 20px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.45);
      animation: dotBounce 1.4s infinite ease-in-out;

      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
    }
  }

  // Markdown 样式
  ::v-deep {
    .md-h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 16px 0 8px; }
    .md-h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 12px 0 6px; }
    .md-h4 { font-size: 14px; font-weight: 600; color: #334155; margin: 10px 0 4px; }
    .md-p { margin: 8px 0; }
    .md-hr { border: none; border-top: 1px solid rgba(15, 23, 42, 0.12); margin: 12px 0; }
    .md-ul, .md-ol { margin: 8px 0; padding-left: 20px; }
    .md-li { margin: 4px 0; list-style: disc; }
    .md-li-ordered { margin: 4px 0; list-style: decimal; }

    .inline-code {
      background: rgba(47, 107, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 0.9em;
      color: #d9480f;
    }

    .code-block {
      background: #0f172a;
      color: #e2e8f0;
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

    strong { font-weight: 600; color: #0f172a; }
    em { font-style: italic; color: #475569; }
  }
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
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
  background: rgba(255, 255, 255, 0.82);
  border-top: 1px solid rgba(47, 107, 255, 0.12);
  backdrop-filter: blur(12px);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(47, 107, 255, 0.2);
  border-radius: 12px;
  padding: 8px 12px;
  transition: all 0.25s;

  &:focus-within {
    border-color: rgba(47, 107, 255, 0.45);
    box-shadow: 0 0 0 3px rgba(47, 107, 255, 0.12);
  }

  textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
    font-size: 14px;
    line-height: 1.5;
    color: #1f2937;
    min-height: 24px;
    max-height: 120px;
    font-family: inherit;
    padding: 4px 0;

    &::placeholder {
      color: #94a3b8;
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
    background: linear-gradient(135deg, var(--module-color, #2f6bff), #22d3ee);
    border: none;
    box-shadow: 0 10px 20px rgba(47, 107, 255, 0.2);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #3b82f6, #22d3ee);
    }

    &:disabled {
      background: #cbd5f5;
      opacity: 0.6;
      box-shadow: none;
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
