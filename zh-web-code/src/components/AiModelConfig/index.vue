<template>
  <el-dialog
    :title="$t('common.aiModelConfig.title')"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    :modal="true"
    :lock-scroll="false"
    :z-index="3000"
    append-to-body
    @close="handleClose"
  >
    <!-- 当前使用的模型显示 -->
    <div class="current-model" v-if="currentConfig">
      <el-alert
        :title="`${$t('common.aiModelConfig.form.provider')}: ${getProviderName(currentConfig.provider)} - ${currentConfig.model}`"
        type="info"
        :closable="false"
        show-icon
      ></el-alert>
    </div>

    <!-- 模型提供商选择 -->
    <el-form :model="form" label-width="100px" style="margin-top: 20px;">
      <el-form-item :label="$t('common.aiModelConfig.form.provider')">
        <el-select v-model="form.provider" :placeholder="$t('common.aiModelConfig.placeholder.selectProvider')" @change="onProviderChange">
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.deepseek')" value="deepseek"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.siliconflow')" value="siliconflow"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.openai')" value="openai"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.qwen')" value="qwen"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.zhipu')" value="zhipu"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.wenxin')" value="wenxin"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.moonshot')" value="moonshot"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.yi')" value="yi"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.claude')" value="claude"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.doubao')" value="doubao"></el-option>
          <el-option :label="$t('common.aiModelConfig.providerWithRecommend.local')" value="local"></el-option>
        </el-select>
      </el-form-item>

      <!-- 动态配置表单 -->
      <template v-if="form.provider">
        <!-- API Key / App ID -->
        <el-form-item :label="form.provider === 'local' ? $t('common.aiModelConfig.form.appId') : $t('common.aiModelConfig.form.apiKey')" required>
          <el-input
            v-model="form.apiKey"
            type="password"
            :placeholder="form.provider === 'local' ? $t('common.aiModelConfig.placeholder.appId') : $t('common.aiModelConfig.placeholder.apiKey')"
            show-password
          ></el-input>
        </el-form-item>

        <!-- Base URL (部分提供商需要) -->
        <el-form-item 
          v-if="needsBaseUrl(form.provider)" 
          :label="$t('common.aiModelConfig.form.baseUrl')"
        >
          <el-input
            v-model="form.baseUrl"
            :placeholder="getDefaultBaseUrl(form.provider)"
          ></el-input>
        </el-form-item>

        <!-- Secret Key (文心一言需要) / App Key (本地模型需要) -->
        <el-form-item 
          v-if="form.provider === 'wenxin' || form.provider === 'local'" 
          :label="form.provider === 'local' ? $t('common.aiModelConfig.form.appKey') : $t('common.aiModelConfig.form.secretKey')"
          required
        >
          <el-input
            v-model="form.secretKey"
            type="password"
            :placeholder="form.provider === 'local' ? $t('common.aiModelConfig.placeholder.appKey') : $t('common.aiModelConfig.placeholder.secretKey')"
            show-password
          ></el-input>
        </el-form-item>

        <!-- 模型选择 -->
        <el-form-item :label="$t('common.aiModelConfig.form.model')">
          <div style="display: flex; gap: 10px;">
            <el-select v-model="form.model" :placeholder="$t('common.aiModelConfig.placeholder.selectModel')" style="flex: 1;">
              <el-option
                v-for="model in getAvailableModels(form.provider)"
                :key="model.value"
                :label="model.label"
                :value="model.value"
              ></el-option>
            </el-select>
            <!-- 硅基流动刷新模型按钮 -->
            <el-button 
              v-if="form.provider === 'siliconflow'"
              @click="loadSiliconflowModels"
              :loading="loadingSiliconflowModels"
              icon="el-icon-refresh"
              size="small"
            >
              {{ loadingSiliconflowModels ? $t('common.aiModelConfig.button.loading') : $t('common.aiModelConfig.button.refreshModels') }}
            </el-button>
          </div>
          <div v-if="form.provider === 'siliconflow'" style="margin-top: 5px; font-size: 12px; color: #909399;">
            {{ $t('common.aiModelConfig.siliconflow.tip') }}
          </div>
        </el-form-item>
      </template>
    </el-form>

    <!-- 连接测试 -->
    <div class="test-section" v-if="form.provider">
      <el-divider>{{ $t('common.aiModelConfig.section.test') }}</el-divider>
      <el-input
        v-model="testMessage"
        type="textarea"
        :rows="2"
        :placeholder="$t('common.aiModelConfig.placeholder.testMessage')"
      ></el-input>
      
      <div class="test-result" v-if="testResult">
        <el-alert
          :title="testResult.success ? $t('common.aiModelConfig.test.success') : $t('common.aiModelConfig.test.failure')"
          :type="testResult.success ? 'success' : 'error'"
          :description="testResult.message"
          show-icon
          :closable="false"
          style="margin-top: 10px;"
        ></el-alert>
      </div>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleTest" :loading="testing" :disabled="!canTest">
        <i class="el-icon-connection"></i> {{ $t('common.aiModelConfig.button.test') }}
      </el-button>
      <el-button @click="dialogVisible = false">{{ $t('common.aiModelConfig.button.cancel') }}</el-button>
      <el-button 
        type="primary" 
        @click="handleSave" 
        :disabled="!canSave"
        :loading="saving"
      >
        {{ $t('common.aiModelConfig.button.save') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { testAiModel, verifySiliconflowApiKey, getSiliconflowModels } from '@/api/ai'

export default {
  name: 'AiModelConfig',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      testing: false,
      saving: false,
      testResult: null,
      testMessage: this.$t('common.aiModelConfig.placeholder.testMessage'),
      // 硅基流动相关
      siliconflowModels: [],
      loadingSiliconflowModels: false,
      currentConfig: null,
      form: {
        provider: '',
        apiKey: '',
        baseUrl: '',
        secretKey: '',
        model: ''
      },
      // 模型配置
      modelOptions: {
        openai: [
          { label: 'GPT-3.5-Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'GPT-4-Turbo', value: 'gpt-4-turbo-preview' }
        ],
        deepseek: [
          { label: 'DeepSeek Chat', value: 'deepseek-chat' },
          { label: 'DeepSeek Coder', value: 'deepseek-coder' }
        ],
        qwen: [
          { label: 'Qwen-Turbo', value: 'qwen-turbo' },
          { label: 'Qwen-Plus', value: 'qwen-plus' },
          { label: 'Qwen-Max', value: 'qwen-max' }
        ],
        zhipu: [
          { label: 'GLM-4', value: 'glm-4' },
          { label: 'GLM-4-Flash', value: 'glm-4-flash' },
          { label: 'GLM-3-Turbo', value: 'glm-3-turbo' }
        ],
        wenxin: [
          { label: 'ERNIE-Bot', value: 'ernie-bot' },
          { label: 'ERNIE-Bot-Turbo', value: 'ernie-bot-turbo' },
          { label: 'ERNIE-Bot-4', value: 'ernie-bot-4' }
        ],
        moonshot: [
          { label: 'Moonshot-v1-8k', value: 'moonshot-v1-8k' },
          { label: 'Moonshot-v1-32k', value: 'moonshot-v1-32k' },
          { label: 'Moonshot-v1-128k', value: 'moonshot-v1-128k' }
        ],
        yi: [
          { label: 'Yi-Large', value: 'yi-large' },
          { label: 'Yi-Medium', value: 'yi-medium' },
          { label: 'Yi-Spark', value: 'yi-spark' }
        ],
        claude: [
          { label: 'Claude-3-Haiku', value: 'claude-3-haiku-20240307' },
          { label: 'Claude-3-Sonnet', value: 'claude-3-sonnet-20240229' },
          { label: 'Claude-3-Opus', value: 'claude-3-opus-20240229' }
        ],
        doubao: [
          { label: '豆包-Lite-4K', value: 'doubao-lite-4k' },
          { label: '豆包-Pro-4K', value: 'doubao-pro-4k' },
          { label: '豆包-Pro-32K', value: 'doubao-pro-32k' }
        ],
        siliconflow: [
          { label: 'Qwen2.5-7B-Instruct', value: 'Qwen/Qwen2.5-7B-Instruct' },
          { label: 'Qwen2.5-72B-Instruct', value: 'Qwen/Qwen2.5-72B-Instruct' },
          { label: 'DeepSeek-V2.5', value: 'deepseek-ai/DeepSeek-V2.5' },
          { label: 'InternLM2.5-20B-Chat', value: 'internlm/internlm2_5-20b-chat' },
          { label: 'GLM-4-9B-Chat', value: 'THUDM/glm-4-9b-chat' }
        ],
        local: [
          { label: 'DeepSeek-V3-w8a8', value: 'DeepSeek-V3-w8a8' },
          { label: '自定义模型', value: 'custom-model' }
        ]
      }
    }
  },
  computed: {
    canTest() {
      if (!this.form.provider || !this.form.apiKey) return false
      if ((this.form.provider === 'wenxin' || this.form.provider === 'local') && !this.form.secretKey) return false
      return true
    },
    canSave() {
      return this.canTest && this.testResult && this.testResult.success
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.loadCurrentConfig()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 加载当前配置
    loadCurrentConfig() {
      const saved = localStorage.getItem('aiModelConfig')
      if (saved) {
        try {
          this.currentConfig = JSON.parse(saved)
          // 预填充表单
          Object.assign(this.form, this.currentConfig)
        } catch (e) {
          console.error('加载配置失败:', e)
        }
      }
    },

    // 提供商变化
    onProviderChange() {
      // 重置相关字段
      this.form.apiKey = ''
      this.form.baseUrl = this.getDefaultBaseUrl(this.form.provider)
      this.form.secretKey = ''
      this.form.model = ''
      this.testResult = null
      
      // 设置默认模型
      const models = this.getAvailableModels(this.form.provider)
      if (models.length > 0) {
        this.form.model = models[0].value
      }
      
      // 如果是硅基流动，清空动态模型列表
      if (this.form.provider === 'siliconflow') {
        this.siliconflowModels = []
        this.loadingSiliconflowModels = false
      }
    },

    // 获取提供商名称
    getProviderName(provider) {
      return this.$t(`common.aiModelConfig.provider.${provider}`) || provider
    },

    // 是否需要Base URL
    needsBaseUrl(provider) {
      return ['openai', 'deepseek', 'claude', 'doubao', 'siliconflow', 'local'].includes(provider)
    },

    // 获取默认Base URL
    getDefaultBaseUrl(provider) {
      const urls = {
        openai: 'https://api.openai.com/v1',
        deepseek: 'https://api.deepseek.com/v1',
        claude: 'https://api.anthropic.com/v1',
        doubao: 'https://ark.cn-beijing.volces.com/api/v3',
        siliconflow: 'https://api.siliconflow.cn/v1',
        local: 'http://121.237.36.1:28080/eop/AIGLKFPT/DeepSeekV3_w8a8_AIPlatform'
      }
      return urls[provider] || ''
    },

    // 获取可用模型
    getAvailableModels(provider) {
      if (provider === 'siliconflow' && this.siliconflowModels.length > 0) {
        return this.siliconflowModels.map(model => ({
          label: `${model.name} - ${model.description}`,
          value: model.id
        }))
      }
      return this.modelOptions[provider] || []
    },

    // 加载硅基流动模型列表
    async loadSiliconflowModels() {
      if (!this.form.apiKey) {
        this.$message.warning(this.$t('common.aiModelConfig.message.enterApiKey'))
        return
      }

      this.loadingSiliconflowModels = true
      try {
        // 首先验证API Key
        const verifyResponse = await verifySiliconflowApiKey({
          api_key: this.form.apiKey
        })
        
        if (!verifyResponse.success) {
          this.$message.error(verifyResponse.error || this.$t('common.aiModelConfig.message.apiKeyVerifyFailed'))
          return
        }
        
        // API Key验证成功，获取模型列表
        const response = await getSiliconflowModels(this.form.apiKey)
        
        if (response.success) {
          this.siliconflowModels = response.models
          
          let successMsg = this.$t('common.aiModelConfig.message.loadModelsSuccess', { count: response.total })
          if (response.source === 'default' || response.source === 'default_fallback') {
            successMsg += this.$t('common.aiModelConfig.message.useDefaultModels')
          }
          if (response.warning) {
            successMsg += ` - ${response.warning}`
          }
          
          this.$message.success(successMsg)
          
          // 设置默认模型
          if (this.siliconflowModels.length > 0 && !this.form.model) {
            this.form.model = this.siliconflowModels[0].id
          }
        } else {
          this.$message.error(response.error || this.$t('common.aiModelConfig.message.loadModelsFailed'))
        }
      } catch (error) {
        console.error('获取硅基流动模型失败:', error)
        if (error.response && error.response.status === 400) {
          this.$message.error(this.$t('common.aiModelConfig.message.checkApiKeyFormat'))
        } else if (error.response && error.response.status === 401) {
          this.$message.error(this.$t('common.aiModelConfig.message.apiKeyInvalid'))
        } else {
          this.$message.error(this.$t('common.aiModelConfig.message.loadModelsFailed'))
        }
      } finally {
        this.loadingSiliconflowModels = false
      }
    },

    // 测试连接
    async handleTest() {
      this.testing = true
      this.testResult = null

      try {
        const config = {
          apiKey: this.form.apiKey,
          model: this.form.model
        }

        if (this.form.baseUrl) {
          config.baseUrl = this.form.baseUrl
        }
        if (this.form.secretKey) {
          config.secretKey = this.form.secretKey
        }

        const response = await testAiModel({
          provider: this.form.provider,
          config: config,
          message: this.testMessage
        })

        if (response.success) {
          this.testResult = {
            success: true,
            message: this.$t('common.aiModelConfig.message.testSuccess', { content: response.content?.substring(0, 100) })
          }
        } else {
          this.testResult = {
            success: false,
            message: response.error || this.$t('common.aiModelConfig.message.testFailed')
          }
        }
      } catch (error) {
        this.testResult = {
          success: false,
          message: error.response?.data?.detail || error.message || this.$t('common.aiModelConfig.message.connectionFailed')
        }
      } finally {
        this.testing = false
      }
    },

    // 保存配置
    handleSave() {
      this.saving = true
      try {
        const config = {
          provider: this.form.provider,
          apiKey: this.form.apiKey,
          model: this.form.model
        }

        if (this.form.baseUrl) {
          config.baseUrl = this.form.baseUrl
        }
        if (this.form.secretKey) {
          config.secretKey = this.form.secretKey
        }

        // 保存到本地存储
        localStorage.setItem('aiModelConfig', JSON.stringify(config))
        
        this.$message.success(this.$t('common.aiModelConfig.message.saveSuccess'))
        this.$emit('config-saved', config)
        this.dialogVisible = false
      } catch (e) {
        this.$message.error(this.$t('common.aiModelConfig.message.saveFailed', { error: e.message }))
      } finally {
        this.saving = false
      }
    },

    // 关闭对话框
    handleClose() {
      this.testResult = null
      this.form = {
        provider: '',
        apiKey: '',
        baseUrl: '',
        secretKey: '',
        model: ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.current-model {
  margin-bottom: 20px;
}

.test-section {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;

  .el-divider {
    margin: 0 0 15px 0;
  }
}

.dialog-footer {
  .el-button {
    i {
      margin-right: 5px;
    }
  }
}

// 修复弹窗层级问题
::v-deep .el-dialog__wrapper {
  z-index: 3000 !important;
}

::v-deep .el-dialog {
  z-index: 3001 !important;
}

::v-deep .el-overlay {
  z-index: 2999 !important;
}
</style>
