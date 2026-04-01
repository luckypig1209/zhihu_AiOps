<template>
  <div class="ai-assistant-page">
    <!-- 主体三栏布局 -->
    <div class="main-body">
      <!-- 左栏：会话列表 -->
      <aside class="left-panel anim-slide-left">
        <SessionList
          ref="sessionList"
          :current-session-id="currentSessionId"
          :storage-key="sessionStorageKey"
          @select="switchSession"
          @delete="onSessionDelete"
        />
      </aside>

      <!-- 中栏：聊天区 -->
      <main class="center-panel anim-slide-up">
        <ChatMain
          ref="chatMain"
          :messages="currentMessages"
          :is-loading="isLoading"
          :module-config="moduleConfig"
          @send="handleSend"
        />
      </main>

      <!-- 右栏：快捷指令 -->
      <aside class="right-panel anim-slide-right">
        <QuickCommands
          ref="quickCommands"
          :external-commands="moduleQuickActions"
          @execute="handleQuickCommand"
          @open-config="showCommandConfig = true"
          @open-model-config="showModelConfig = true"
          @open-skills-editor="showSkillsEditor = true"
        />
      </aside>
    </div>

    <!-- 快捷指令配置弹窗 -->
    <CommandConfigDialog
      :visible.sync="showCommandConfig"
      @saved="onCommandsSaved"
    />
    <!-- 模型配置弹窗 -->
    <ModelConfigDialog :visible.sync="showModelConfig" />
    <!-- Skills 编辑弹窗 -->
    <SkillsEditorDialog :visible.sync="showSkillsEditor" />
  </div>
</template>

<script>
import SessionList from './components/SessionList.vue'
import ChatMain from './components/ChatMain.vue'
import QuickCommands from './components/QuickCommands.vue'
import CommandConfigDialog from './components/CommandConfigDialog.vue'
import ModelConfigDialog from './components/ModelConfigDialog.vue'
import SkillsEditorDialog from './components/SkillsEditorDialog.vue'
import { processQuery } from '@/utils/opsQueryService'
import { getModuleById, getSessionStorageKey } from '@/utils/digitalStaffConfig'

const SESSIONS_STORAGE_KEY = 'ai_assistant_sessions'

export default {
  name: 'AiAssistant',
  components: {
    SessionList,
    ChatMain,
    QuickCommands,
    CommandConfigDialog,
    ModelConfigDialog,
    SkillsEditorDialog
  },
  data() {
    return {
      currentSessionId: '',
      currentMessages: [],
      isLoading: false,
      showCommandConfig: false,
      showModelConfig: false,
      showSkillsEditor: false
    }
  },
  computed: {
    moduleId() {
      return this.$route.params.moduleId || null
    },
    moduleConfig() {
      return getModuleById(this.moduleId)
    },
    sessionStorageKey() {
      return getSessionStorageKey(this.moduleId)
    },
    moduleQuickActions() {
      return this.moduleConfig ? this.moduleConfig.quickActions : null
    }
  },
  mounted() {
    this.initSession()
  },
  methods: {
    // 初始化：确保有一个会话
    initSession() {
      this.$nextTick(() => {
        const sessionList = this.$refs.sessionList
        if (sessionList) {
          const session = sessionList.ensureSession()
          if (session) {
            this.currentSessionId = session.id
            this.currentMessages = session.messages || []
          }
        }
      })
    },

    // 切换会话
    switchSession(sessionId) {
      // 保存当前会话
      this.saveCurrentSession()

      this.currentSessionId = sessionId
      const sessionList = this.$refs.sessionList
      const session = sessionList.getSession(sessionId)
      if (session) {
        this.currentMessages = session.messages || []
      } else {
        this.currentMessages = []
      }
    },

    // 删除会话
    onSessionDelete(deletedId) {
      if (deletedId === this.currentSessionId) {
        const sessionList = this.$refs.sessionList
        const session = sessionList.ensureSession()
        if (session) {
          this.currentSessionId = session.id
          this.currentMessages = session.messages || []
        } else {
          this.currentSessionId = ''
          this.currentMessages = []
        }
      }
    },

    // 保存当前会话到 SessionList
    saveCurrentSession() {
      if (!this.currentSessionId) return
      const sessionList = this.$refs.sessionList
      if (sessionList) {
        // 自动生成标题
        let title = '新对话'
        const firstUserMsg = this.currentMessages.find(m => m.type === 'user')
        if (firstUserMsg) {
          title = firstUserMsg.content.substring(0, 20)
          if (firstUserMsg.content.length > 20) title += '...'
        }

        sessionList.updateSession(this.currentSessionId, {
          title,
          messages: this.currentMessages
        })
      }
    },

    // 处理发送消息
    async handleSend(text) {
      if (!text.trim() || this.isLoading) return

      // 确保有会话
      if (!this.currentSessionId) {
        this.initSession()
      }

      // 添加用户消息
      this.currentMessages.push({
        type: 'user',
        content: text,
        timestamp: Date.now()
      })

      this.saveCurrentSession()
      this.isLoading = true

      // 预创建 AI 消息占位，用于流式填充
      const aiMessage = {
        type: 'ai',
        content: '',
        timestamp: Date.now(),
        streaming: true
      }
      this.currentMessages.push(aiMessage)
      const aiIndex = this.currentMessages.length - 1

      try {
        // 调用查询服务，传入流式回调
        const response = await processQuery(text, {
          history: this.currentMessages.slice(-10),
          sessionId: this.currentSessionId
        }, (chunk) => {
          // 逐 chunk 追加到 AI 消息
          this.currentMessages[aiIndex].content += chunk
          this.$refs.chatMain && this.$refs.chatMain.scrollToBottom()
        })

        // 流式结束后，用完整内容覆盖（防止遗漏）
        if (response) {
          this.currentMessages[aiIndex].content = response
        }
        this.currentMessages[aiIndex].streaming = false
      } catch (error) {
        console.error('查询失败:', error)
        this.currentMessages[aiIndex].content = '抱歉，查询处理出现错误。请稍后重试或使用其他快捷指令。\n\n错误信息: ' + (error.message || error)
        this.currentMessages[aiIndex].streaming = false
      } finally {
        this.isLoading = false
        this.saveCurrentSession()
      }
    },

    // 处理快捷指令
    handleQuickCommand(command) {
      const content = typeof command === 'string' ? command : command.content
      const needInput = typeof command === 'object' && command.needInput
      if (!needInput) {
        // 硬编码兼容：旧的文本匹配
        const legacyNeedInput = ['通过关键字查询监控对象', '通过IP查询监控对象']
        if (legacyNeedInput.includes(content)) {
          this.$refs.chatMain.fillInput(content + ' ')
          return
        }
        this.handleSend(content)
      } else {
        this.$refs.chatMain.fillInput(content)
      }
    },

    // 快捷指令配置保存
    onCommandsSaved(commands) {
      if (this.$refs.quickCommands) {
        this.$refs.quickCommands.updateCommands(commands)
      }
    },

  },

  // 离开页面前保存
  beforeDestroy() {
    this.saveCurrentSession()
  }
}
</script>

<style lang="scss" scoped>
.ai-assistant-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at 10% 12%, rgba(34, 211, 238, 0.16), transparent 45%),
    radial-gradient(circle at 90% 8%, rgba(47, 107, 255, 0.16), transparent 40%),
    linear-gradient(180deg, #f7fbff 0%, #eef4ff 60%, #f9fbff 100%);
  overflow: hidden;
  animation: fadeIn 0.4s ease-out;
  border-radius: 14px;
  border: 1px solid rgba(47, 107, 255, 0.12);
  font-family: 'Space Grotesk', 'Noto Sans SC', 'PingFang SC', sans-serif;
  color: #0f172a;
}

// ==================== 入场动画 ====================
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

.anim-slide-left {
  animation: slideInLeft 0.45s ease-out both;
}
.anim-slide-up {
  animation: slideUp 0.5s ease-out 0.1s both;
}
.anim-slide-right {
  animation: slideInRight 0.45s ease-out 0.2s both;
}

// ==================== 主体 ====================
.main-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  gap: 12px;
  padding: 12px;
}

// ==================== 左栏 ====================
.left-panel {
  width: 240px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}

// ==================== 中栏 ====================
.center-panel {
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  overflow: hidden;
}

// ==================== 右栏 ====================
.right-panel {
  width: 260px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(47, 107, 255, 0.12);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}

// ==================== 响应式 ====================
@media (max-width: 1200px) {
  .right-panel {
    width: 220px;
  }
  .left-panel {
    width: 200px;
  }
}

@media (max-width: 960px) {
  .right-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .left-panel {
    display: none;
  }
}
</style>
