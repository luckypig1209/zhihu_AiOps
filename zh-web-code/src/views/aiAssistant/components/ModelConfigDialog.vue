<template>
  <el-dialog title="模型配置" :visible.sync="dialogVisible" width="520px" :close-on-click-modal="false" class="model-config-dialog">
    <el-form label-width="100px" size="small" :model="form">
      <el-form-item label="API 地址">
        <el-input v-model="form.apiUrl" placeholder="如 https://openrouter.ai/api/v1"></el-input>
      </el-form-item>
      <el-form-item label="API Key">
        <el-input v-model="form.apiKey" placeholder="输入新 Key 覆盖，留空保持不变" show-password></el-input>
      </el-form-item>
      <el-form-item label="模型名称">
        <el-input v-model="form.model" placeholder="如 anthropic/claude-3.5-sonnet"></el-input>
      </el-form-item>
      <el-form-item label="API 格式">
        <el-radio-group v-model="form.useAnthropicFormat">
          <el-radio :label="false">OpenAI 兼容</el-radio>
          <el-radio :label="true">Anthropic 兼容</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="连接状态">
        <el-tag :type="wsConnected ? 'success' : 'danger'" size="small">
          {{ wsConnected ? 'WebSocket 已连接' : 'WebSocket 未连接' }}
        </el-tag>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="dialogVisible = false">取消</el-button>
      <el-button size="small" type="primary" :loading="saving" @click="handleSave">保存并生效</el-button>
    </div>
  </el-dialog>
</template>

<script>
import wsService from '@/utils/websocketService'

const CONFIG_STORAGE_KEY = 'ai_model_config'

export default {
  name: 'ModelConfigDialog',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      form: { apiUrl: '', apiKey: '', model: '', useAnthropicFormat: false },
      saving: false,
      wsConnected: false,
      _wsCheckTimer: null
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadConfig()
        this.wsConnected = wsService.isConnected
        this._wsCheckTimer = setInterval(() => {
          this.wsConnected = wsService.isConnected
        }, 1000)
      } else if (this._wsCheckTimer) {
        clearInterval(this._wsCheckTimer)
      }
    }
  },
  methods: {
    async loadConfig() {
      // 先从 localStorage 读
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY)
      if (saved) {
        try { Object.assign(this.form, JSON.parse(saved)) } catch (e) { /* ignore */ }
      }
      // 再从 AI Connector 拉最新
      if (wsService.isConnected) {
        try {
          const res = await wsService.getConfig()
          if (res.config) {
            this.form.apiUrl = res.config.apiUrl || this.form.apiUrl
            this.form.model = res.config.model || this.form.model
            this.form.useAnthropicFormat = res.config.useAnthropicFormat || false
            // apiKey 脱敏，仅显示占位
            if (res.config.apiKey && !this.form.apiKey) {
              this.form.apiKey = res.config.apiKey
            }
          }
        } catch (e) {
          console.warn('[ModelConfig] Failed to fetch remote config:', e.message)
        }
      }
    },
    async handleSave() {
      if (!this.form.apiUrl || !this.form.model) {
        this.$message.warning('API 地址和模型名称不能为空')
        return
      }
      this.saving = true
      try {
        // 存 localStorage
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({
          apiUrl: this.form.apiUrl,
          model: this.form.model,
          useAnthropicFormat: this.form.useAnthropicFormat
        }))
        // 发送到 AI Connector
        if (wsService.isConnected) {
          await wsService.updateConfig(this.form)
          this.$message.success('配置已保存并实时生效')
        } else {
          this.$message.warning('配置已保存到本地，WebSocket 未连接，将在连接后生效')
        }
        this.dialogVisible = false
      } catch (e) {
        this.$message.error('保存失败: ' + e.message)
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.model-config-dialog {
  ::v-deep .el-dialog__body {
    padding: 16px 24px;
  }
}
</style>
