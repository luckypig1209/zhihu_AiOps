<template>
  <div>
    <el-dialog
      :title="$t('license.title.certificate')"
      :visible.sync="dialogLicenseVisible"
      :before-close="handleClose"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="license-content" v-if="licenseData">
        <div
          :class="licenseData.isAvailable === 1 ? 'status success' : 'status expired'"
        >
          {{ licenseData.isAvailable === 1 ? $t('license.status.active') : $t('license.status.expired') }}
        </div>

        <!-- <div class="license-item">
          <span class="label">系统名称：</span>
          <span class="value" :title="licenseData.projectName">{{ licenseData.projectName }}</span>
        </div> -->
        <div class="license-item">
          <span class="label">{{ $t('license.label.customerCode') }}：</span>
          <span class="value" :title="licenseData.customerCode">{{ licenseData.customerCode }}</span>
        </div>
        <div class="license-item">
          <span class="label">{{ $t('license.label.customerName') }}：</span>
          <span class="value" :title="licenseData.customerName">{{ licenseData.customerName }}</span>
        </div>
        <div class="license-item">
          <span class="label">{{ $t('license.label.expireTime') }}：</span>
          <span class="value">{{ licenseData.expireTime }}</span>
        </div>
        <div class="license-item">
          <span class="label">{{ $t('license.label.version') }}：</span>
          <span class="value">{{ licenseData.version }}</span>
        </div>
      </div>

      <div class="license-content" v-else>
        <div>{{ $t('license.message.noLicense') }}</div>
      </div>

      <div class="license-item">
        <span class="label">{{ $t('license.label.cpuSerial') }}：</span>
        <el-tooltip placement="top" :content="cpuNum + $t('license.message.clickToCopy')">
          <!-- 新增点击事件，添加鼠标样式提示可点击 -->
          <span class="value desc-ellipsis copy-item" @click="copyCpuNum">{{ cpuNum || $t('license.message.noData') }}</span>
        </el-tooltip>
      </div>

      <div class="license-item" v-if="licenseData && licenseData.type">
        <span class="label">{{ $t('license.label.type') }}：</span>
        <span class="value">{{ getstatus(licenseData.type) || $t('license.type.trial')}}</span>
      </div>

      <!-- 底部按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit">
          {{ licenseData.expireTime ? $t('license.button.update') : $t('license.button.upload') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 文件上传控件 -->
    <input
      ref="upload"
      type="file"
      style="display: none"
      :accept="limit.map(i => `.${i}`).join(',')"
      @change="loadImg"
    />
  </div>
</template>

<script>
import { getUploadFile, getLicenseCpu } from '@/api/login';

export default {
  props: {
    dialogLicenseVisible: {
      type: Boolean,
      required: true,
      default: false
    },
    licenseData: {
      type: [Object, String],
      required: true,
      default: ''
    }
  },
  data() {
    return {
      limit: ['txt'],
      cpuNum: '',
      statusMap: {
        1: this.$t('license.type.official'),
        2: this.$t('license.type.trial'),
        3: this.$t('license.type.test')
      }
    }
  },
  mounted() {
    this.getCpuNum()
  },
  methods: {
    getstatus(key){
      switch (key) {
        case 1:
          return this.$t('license.type.official')
          break;

        case 2:
          return this.$t('license.type.trial')
          break;
        case 3:
          return this.$t('license.type.test')
          break;

        default:
          return this.$t('license.type.trial')
          break;
      }
    },
    // 关闭弹窗
    handleClose() {
      this.$parent.dialogLicenseVisible = false
    },
    // 触发文件选择
    submit() {
      this.$refs.upload.click()
    },
    // 处理文件上传
    loadImg(e) {
      const files = e.target.files
      if (files.length === 0) return

      const file = files[0]
      e.target.value = '' // 清空以允许重复选择同一文件

      const fileTypeArr = file.name.split('.')
      const fileType = fileTypeArr[fileTypeArr.length - 1]

      if (this.limit.indexOf(fileType) === -1) {
        this.$message.error(this.$t('license.message.fileTypeError'))
        return
      }

      // 读取文件内容并上传
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        if (reader.result) {
          const params = { contact: reader.result }
          getUploadFile(params)
            .then(() => {
              this.handleClose()
              this.$message.success(this.$t('license.message.updateSuccess'))
              this.$emit('license', false)
            })
            .catch(() => {
              this.$emit('license', true)
            })
        }
      }
    },
    // 获取CPU序列号
    getCpuNum() {
      getLicenseCpu().then((res) => {
        this.cpuNum = res.data
      })
    },
    // 修复：复制CPU序列号功能（优先使用兼容方案）
    copyCpuNum() {
      // 校验CPU序列号是否存在
      if (!this.cpuNum) {
        this.$message.warning(this.$t('license.message.noCpuToCopy'))
        return
      }

      // 直接使用兼容方案（放弃Clipboard API，避免undefined错误）
      this.fallbackCopyCpuNum()
    },
    // 兼容所有浏览器的复制方案（核心修复）
    fallbackCopyCpuNum() {
      // 创建临时输入框
      const input = document.createElement('input')
      // 设置输入框的值为要复制的内容
      input.value = this.cpuNum
      // 隐藏输入框（移到可视区域外）
      input.style.position = 'fixed'
      input.style.top = '-9999px'
      input.style.left = '-9999px'
      input.style.opacity = '0'
      // 添加到页面
      document.body.appendChild(input)

      try {
        // 选中输入框内容
        input.select()
        // 兼容移动端
        input.setSelectionRange(0, input.value.length)
        // 执行复制命令
        const success = document.execCommand('copy')

        if (success) {
          this.$message.success(this.$t('license.message.copySuccess'))
        } else {
          this.$message.warning(this.$t('license.message.copyFailed'))
        }
      } catch (err) {
        console.error('复制失败：', err)
        this.$message.error(this.$t('license.message.copyError'))
      } finally {
        // 无论成功失败，都移除临时输入框
        document.body.removeChild(input)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.license-content {
  margin-bottom: 15px;
}

.status {
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.success {
  color: #70b603;
}

.expired {
  color: #d9001b;
}

.license-item {
  display: flex;
  align-items: center;
  margin: 8px 0 0 120px;
  line-height: 1.5;
}

.label {
  text-align: right;
  width: 150px; /* 固定宽度确保对齐 */
  padding-right: 10px;
  color: #666;
  font-weight: 500;
}

.value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
}

.dialog-footer {
  text-align: center;
  padding-top: 10px;
}
.desc-ellipsis {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: keep-all;
}
// 新增：给可复制元素添加鼠标样式，提示用户可点击
.copy-item {
  cursor: pointer;
  &:hover {
    color: #409eff; // 悬浮时变色，增强交互提示
    text-decoration: underline;
  }
}
</style>
