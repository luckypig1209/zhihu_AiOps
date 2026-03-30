<template>
  <div class="ai-config-container">
    <el-dialog
      :title="$t('common.aiConfig.title')"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <!-- 模型选择tabs -->
      <el-tabs v-model="activeTab" type="card">
        <!-- OpenAI配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.openai')" name="openai">
          <el-form :model="modelConfigs.openai" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.openai.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.openaiApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.apiBaseUrl')">
              <el-input 
                v-model="modelConfigs.openai.baseUrl" 
                :placeholder="$t('common.aiConfig.placeholder.openaiBaseUrl')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.openai.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.openai')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通义千问配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.qwen')" name="qwen">
          <el-form :model="modelConfigs.qwen" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.qwen.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.qwenApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.apiBaseUrl')">
              <el-input 
                v-model="modelConfigs.qwen.baseUrl" 
                :placeholder="$t('common.aiConfig.placeholder.qwenBaseUrl')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.qwen.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.qwen')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 文心一言配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.wenxin')" name="wenxin">
          <el-form :model="modelConfigs.wenxin" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.wenxin.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.wenxinApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.secretKey')">
              <el-input 
                v-model="modelConfigs.wenxin.secretKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.wenxinSecretKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.wenxin.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.wenxin')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 讯飞星火配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.spark')" name="spark">
          <el-form :model="modelConfigs.spark" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.appId')">
              <el-input 
                v-model="modelConfigs.spark.appId" 
                :placeholder="$t('common.aiConfig.placeholder.sparkAppId')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.spark.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.sparkApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.apiSecret')">
              <el-input 
                v-model="modelConfigs.spark.apiSecret" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.sparkApiSecret')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.modelVersion')">
              <el-select v-model="modelConfigs.spark.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.spark')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 智谱清言配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.zhipu')" name="zhipu">
          <el-form :model="modelConfigs.zhipu" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.zhipu.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.zhipuApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.zhipu.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.zhipu')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- DeepSeek配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.deepseek')" name="deepseek">
          <el-form :model="modelConfigs.deepseek" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.deepseek.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.deepseekApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.apiBaseUrl')">
              <el-input 
                v-model="modelConfigs.deepseek.baseUrl" 
                :placeholder="$t('common.aiConfig.placeholder.deepseekBaseUrl')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.deepseek.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.deepseek')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 月之暗面配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.moonshot')" name="moonshot">
          <el-form :model="modelConfigs.moonshot" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.moonshot.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.moonshotApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.moonshot.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.moonshot')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 零一万物配置 -->
        <el-tab-pane :label="$t('common.aiConfig.tabs.yi')" name="yi">
          <el-form :model="modelConfigs.yi" label-width="120px">
            <el-form-item :label="$t('common.aiConfig.form.apiKey')">
              <el-input 
                v-model="modelConfigs.yi.apiKey" 
                type="password"
                :placeholder="$t('common.aiConfig.placeholder.yiApiKey')"
                show-password
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('common.aiConfig.form.model')">
              <el-select v-model="modelConfigs.yi.model" :placeholder="$t('common.aiConfig.placeholder.selectModel')">
                <el-option v-for="(label, value) in $t('common.aiConfig.models.yi')" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 测试区域 -->
      <div class="test-section">
        <el-divider>{{ $t('common.aiConfig.test.section') }}</el-divider>
        <el-input
          v-model="testMessage"
          type="textarea"
          :rows="3"
          :placeholder="$t('common.aiConfig.test.placeholder')"
        ></el-input>
        <div class="test-result" v-if="testResult">
          <el-alert
            :title="testResult.success ? $t('common.aiConfig.test.success') : $t('common.aiConfig.test.failure')"
            :type="testResult.success ? 'success' : 'error'"
            :description="testResult.message"
            show-icon
            :closable="false"
          ></el-alert>
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleTest" :loading="testing">
          <i class="el-icon-connection"></i> {{ $t('common.aiConfig.button.test') }}
        </el-button>
        <el-button @click="dialogVisible = false">{{ $t('common.aiConfig.button.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          {{ $t('common.aiConfig.button.save') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AiConfig',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      activeTab: 'openai',
      testing: false,
      saving: false,
      testMessage: this.$t('common.aiConfig.test.placeholder'),
      testResult: null,
      modelConfigs: {
        openai: {
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo'
        },
        qwen: {
          apiKey: '',
          baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
          model: 'qwen-turbo'
        },
        wenxin: {
          apiKey: '',
          secretKey: '',
          model: 'ernie-bot'
        },
        spark: {
          appId: '',
          apiKey: '',
          apiSecret: '',
          model: 'spark-v3.5'
        },
        zhipu: {
          apiKey: '',
          model: 'glm-4'
        },
        deepseek: {
          apiKey: '',
          baseUrl: 'https://api.deepseek.com/v1',
          model: 'deepseek-chat'
        },
        moonshot: {
          apiKey: '',
          model: 'moonshot-v1-8k'
        },
        yi: {
          apiKey: '',
          model: 'yi-large'
        }
      }
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  mounted() {
    this.loadConfigs()
  },
  methods: {
    // 加载已保存的配置
    loadConfigs() {
      const savedConfigs = localStorage.getItem('aiModelConfigs')
      if (savedConfigs) {
        try {
          this.modelConfigs = JSON.parse(savedConfigs)
        } catch (e) {
          console.error('加载配置失败:', e)
        }
      }
    },

    // 保存配置
    handleSave() {
      this.saving = true
      try {
        // 保存到localStorage
        localStorage.setItem('aiModelConfigs', JSON.stringify(this.modelConfigs))
        
        // 设置当前使用的模型
        const currentModel = {
          provider: this.activeTab,
          config: this.modelConfigs[this.activeTab]
        }
        localStorage.setItem('currentAiModel', JSON.stringify(currentModel))
        
        this.$message.success(this.$t('common.aiConfig.message.saveSuccess'))
        this.$emit('config-saved', currentModel)
        this.dialogVisible = false
      } catch (e) {
        this.$message.error(this.$t('common.aiConfig.message.saveFailed', { error: e.message }))
      } finally {
        this.saving = false
      }
    },

    // 测试连接
    async handleTest() {
      const currentConfig = this.modelConfigs[this.activeTab]
      
      // 检查必填项
      if (!this.validateConfig(currentConfig)) {
        this.$message.warning(this.$t('common.aiConfig.message.validate'))
        return
      }

      this.testing = true
      this.testResult = null

      try {
        // 调用后端测试API
        const response = await this.$http.post('/api/v1/ai/test', {
          provider: this.activeTab,
          config: currentConfig,
          message: this.testMessage
        })

        if (response.data.success) {
          this.testResult = {
            success: true,
            message: this.$t('common.aiConfig.test.response', { content: response.data.content })
          }
        } else {
          this.testResult = {
            success: false,
            message: response.data.error || this.$t('common.aiConfig.test.failure')
          }
        }
      } catch (error) {
        this.testResult = {
          success: false,
          message: error.response?.data?.detail || error.message || this.$t('common.aiConfig.test.failure')
        }
      } finally {
        this.testing = false
      }
    },

    // 验证配置
    validateConfig(config) {
      if (this.activeTab === 'wenxin') {
        return config.apiKey && config.secretKey
      } else if (this.activeTab === 'spark') {
        return config.appId && config.apiKey && config.apiSecret
      } else {
        return config.apiKey
      }
    },

    // 关闭对话框
    handleClose() {
      this.testResult = null
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-config-container {
  ::v-deep .el-dialog__body {
    padding: 20px;
  }

  .el-tabs {
    margin-bottom: 20px;
  }

  .test-section {
    margin-top: 20px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .el-divider {
      margin: 0 0 15px 0;
    }

    .test-result {
      margin-top: 15px;
    }
  }

  .dialog-footer {
    .el-button {
      i {
        margin-right: 5px;
      }
    }
  }
}
</style> 