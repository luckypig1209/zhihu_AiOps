<template>
  <div ref="aiPanel" :class="{show: visible}" class="ai-panel-container">
    <div class="ai-panel-background" @click="close" />
    <div class="ai-panel">
      <!-- 面板头部 -->
      <div class="ai-panel-header">
        <div class="header-left">
          <i class="el-icon-cpu"></i>
          <span>智能问答助手</span>
        </div>
        <div class="header-right">
          <el-button type="text" icon="el-icon-close" @click="close" />
        </div>
      </div>

      <!-- 聊天内容区 -->
      <div class="ai-panel-body" ref="chatBody">
        <div v-if="messages.length === 0" class="welcome-area">
          <div class="robot-icon">
            <i class="el-icon-s-custom"></i>
          </div>
          <h3>我是智护 AI 助手</h3>
          <p>可以帮你查询监控指标、分析告警、执行巡检等</p>
          <div class="quick-actions">
            <el-button size="small" @click="sendQuick('查询CPU使用率')">查询CPU</el-button>
            <el-button size="small" @click="sendQuick('查询内存使用情况')">查询内存</el-button>
            <el-button size="small" @click="sendQuick('执行全面巡检')">全面巡检</el-button>
          </div>
        </div>

        <div v-else class="messages-list">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', msg.type]"
          >
            <div class="message-avatar">
              <i :class="msg.type === 'user' ? 'el-icon-user' : 'el-icon-s-custom'"></i>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>
          <div v-if="isLoading" class="message-item ai loading">
            <div class="message-avatar">
              <i class="el-icon-s-custom"></i>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="ai-panel-footer">
        <div class="input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="2"
            placeholder="请输入您的问题，例如：查询最近1小时CPU使用率"
            @keyup.enter.native="handleEnter"
          />
          <el-button
            type="primary"
            icon="el-icon-s-promotion"
            :loading="isLoading"
            :disabled="!inputText.trim()"
            @click="sendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { processQuery } from '@/utils/opsQueryService'

export default {
  name: 'AiChatPanel',
  data() {
    return {
      visible: false,
      inputText: '',
      isLoading: false,
      messages: []
    }
  },
  watch: {
    visible(val) {
      if (val) {
        document.body.style.overflow = 'hidden'
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } else {
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    open() {
      this.visible = true
    },
    close() {
      this.visible = false
    },
    sendQuick(text) {
      this.inputText = text
      this.sendMessage()
    },
    handleEnter(e) {
      if (!e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },
    async sendMessage() {
      const text = this.inputText.trim()
      if (!text || this.isLoading) return

      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: text,
        timestamp: Date.now()
      })

      this.inputText = ''
      this.isLoading = true
      this.scrollToBottom()

      try {
        const response = await processQuery(text, {
          history: this.messages.slice(-10)
        })

        this.messages.push({
          type: 'ai',
          content: response,
          timestamp: Date.now()
        })
      } catch (error) {
        this.messages.push({
          type: 'ai',
          content: '抱歉，查询处理出现错误：' + (error.message || error),
          timestamp: Date.now()
        })
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBody = this.$refs.chatBody
        if (chatBody) {
          chatBody.scrollTop = chatBody.scrollHeight
        }
      })
    },
    formatMessage(content) {
      // 简单的 markdown 格式转换
      if (!content) return ''
      return content
        .replace(/\n/g, '<br>')
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block">$2</pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-panel-container {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  pointer-events: none;

  &.show {
    pointer-events: auto;

    .ai-panel-background {
      opacity: 1;
    }

    .ai-panel {
      transform: translateX(0);
    }
  }
}

.ai-panel-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.ai-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 450px;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
  display: flex;
  flex-direction: column;
}

// 头部
.ai-panel-header {
  height: 56px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;

    i {
      font-size: 20px;
      color: #667eea;
    }
  }

  .header-right {
    .el-button {
      color: rgba(255, 255, 255, 0.7);
      font-size: 18px;

      &:hover {
        color: #fff;
      }
    }
  }
}

// 内容区
.ai-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f5f7fa;
}

// 欢迎区域
.welcome-area {
  text-align: center;
  padding: 40px 20px;

  .robot-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 40px;
      color: #fff;
    }
  }

  h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #303133;
  }

  p {
    margin: 0 0 24px;
    font-size: 14px;
    color: #606266;
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;

    .el-button {
      border-radius: 16px;
    }
  }
}

// 消息列表
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 10px;

  &.user {
    flex-direction: row-reverse;

    .message-content {
      align-items: flex-end;

      .message-text {
        background: #409eff;
        color: #fff;
        border-radius: 12px 12px 2px 12px;
      }
    }
  }

  &.ai {
    .message-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .message-text {
      background: #fff;
      color: #303133;
      border-radius: 2px 12px 12px 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }

  .message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #c0c4cc;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
      font-size: 18px;
      color: #fff;
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: calc(100% - 60px);

    .message-text {
      padding: 10px 14px;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;

      :deep(.code-block) {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 12px;
        overflow-x: auto;
        margin: 8px 0;
      }

      :deep(code) {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }
    }

    .message-time {
      font-size: 11px;
      color: #909399;
    }
  }
}

// 加载动画
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 2px 12px 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  span {
    width: 8px;
    height: 8px;
    background: #c0c4cc;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

// 底部输入区
.ai-panel-footer {
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;

  .input-area {
    display: flex;
    gap: 10px;

    .el-textarea {
      flex: 1;

      :deep(.el-textarea__inner) {
        resize: none;
        border-radius: 8px;
      }
    }

    .el-button {
      align-self: flex-end;
      height: 54px;
      width: 54px;
      border-radius: 8px;
      font-size: 20px;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .ai-panel {
    width: 100%;
  }
}
</style>
