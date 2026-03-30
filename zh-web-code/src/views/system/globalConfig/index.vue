/**
 * @description 全局配置
*/
<template>
  <div class="app-container">
      <a-card size="small" :bordered="false" style="height: 82vh;">
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane name="systemProperty" :label="$t('common.systemGlobalConfig.tab.systemProperty')" se>
        <el-form class="sized-form" :model="tabForm" :rules="tabFormRules" label-width="210px" ref="systemPropertyFormRef">
          <el-form-item prop="sysLoginPageName" :label="$t('common.systemGlobalConfig.form.sysLoginPageName')">
            <el-input v-model.trim="tabForm.sysLoginPageName" show-word-limit maxlength="50"  style="width: 100%" clearable :placeholder="$t('common.systemGlobalConfig.placeholder.sysLoginPageName')" />
          </el-form-item>
          <el-form-item prop="sysIconUrl" :label="$t('common.systemGlobalConfig.form.sysIconUrl')">
            <imageUpload v-model="tabForm.sysIconUrl" :limit="1"/>
            <div v-show="!tabForm.sysIconUrl" class="upload-msg">{{ $t('common.systemGlobalConfig.upload.hint') }}</div>
            <div v-show="!tabForm.sysIconUrl" class="upload-msg">{{ $t('common.systemGlobalConfig.upload.format') }}</div>
            <div v-show="!tabForm.sysIconUrl" class="upload-msg">{{ $t('common.systemGlobalConfig.upload.size') }}</div>
          </el-form-item>
          <el-form-item prop="sysMenuPageName" :label="$t('common.systemGlobalConfig.form.sysMenuPageName')">
           <el-input v-model.trim="tabForm.sysMenuPageName" show-word-limit maxlength="50" style="width: 100%" clearable :placeholder="$t('common.systemGlobalConfig.placeholder.sysMenuPageName')" />
          </el-form-item>
          <el-form-item prop="dashboardName" :label="$t('common.systemGlobalConfig.form.dashboardName')">
            <el-input v-model.trim="tabForm.dashboardName" show-word-limit maxlength="50" style="width: 100%" clearable :placeholder="$t('common.systemGlobalConfig.placeholder.dashboardName')" />
          </el-form-item>
        </el-form>
        <div class="center-btn"><el-button type="primary" size="small" :loading="sumbitLoading" @click="handleSubmit">{{ $t('common.systemGlobalConfig.button.save') }}</el-button></div>
      </el-tab-pane>
    </el-tabs>
    </a-card>
  </div>
</template>

<script>
import { getGlobalConfig, updateGlobalConfig } from "@/api/system/globalConfig.js"
import { uploadFile } from "@/api/infra/fileUpload.js"
import FileUpload from "@/components/FileUpload";
import ImageUpload from '@/components/ImageUpload';
import i18n from "@/i18n"
const limit50Char = { max: 50, trigger: 'blur', message: i18n.t('common.systemGlobalConfig.validation.limit50Char') }
const numberType = { pattern: /\d/, message: i18n.t('common.systemGlobalConfig.validation.numberType'), trigger: 'blur' }

export default {
  name: "GlobalConfig",
  components: {
    FileUpload,
    ImageUpload,
  },
  data () {
    return {
      uploadLoading: false,
      activeTab: 'systemProperty', // 当前激活的tab
      btnDisabled: false, // 按钮禁用状态
      sumbitLoading: false,
      tabForm: {
        sysIconUrl: '',
        sysLoginPageName: '',
        sysMenuPageName: '',
        dashboardName: '',
      }, // 全局配置表单
      tabFormRules: {
        sysIconUrl: [{ required: true, message: this.$t('common.systemGlobalConfig.validation.sysIconUrl'), trigger: ['blur'] }],
        sysLoginPageName: [{ required: true, message: this.$t('common.systemGlobalConfig.validation.sysLoginPageName'), trigger: ['blur'] }],
        sysMenuPageName: [{ required: true, message: this.$t('common.systemGlobalConfig.validation.sysMenuPageName'), trigger: ['blur'] }],
        dashboardName: [{ required: true, message: this.$t('common.systemGlobalConfig.validation.dashboardName'), trigger: ['blur'] }]
      },
    }
  },
  methods: {
    handleIconUpload(file) {
      // 1. 验证文件
      if (!this.beforeIconUpload(file)) return;

      // 2. 准备上传数据
      const fileSaver = new FormData();
      fileSaver.append("file", file.file);

      // 3. 设置加载状态
      this['uploadLoading'] = true;

      // 4. 执行上传
      uploadFile(fileSaver)
        .then(res => {
          if (res.code === 0) {
            // 上传成功处理
            this.tabForm['sysIconUrl'] = res.data.url;

            // 清除验证错误
            if (this.$refs.tabFormRef) {
              this.$refs.tabFormRef.clearValidate('sysIconUrl');
            }
          } else {
            // 上传失败处理
            this.tabForm['sysIconUrl'] = null;
            this.$modal.msgError(res.msg);
          }
        })
        .catch(error => {
          // 错误处理
          console.error('上传失败:', error);
          this.$modal.msgError(this.$t('common.systemGlobalConfig.message.uploadFailed'));
        })
        .finally(() => {
          // 无论成功失败都取消加载状态
          this['uploadLoading'] = false;
        });
    },
    removeImg () { // 删除图片
      this.tabForm['sysIconUrl'] = null;
    },
    beforeIconUpload (request) {
      if (request.file) {
        const targetFile = request.file
        const arr = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
        const {size, type} = targetFile
        const overLimit = (size / 1024 / 1024) > 5
        const isLegalType = arr.includes(type)
        if (overLimit) {
          this.$message.warning(this.$t('common.systemGlobalConfig.message.fileSizeLimit'))
          return false
        }
        if (!isLegalType) {
          this.$message.warning(this.$t('common.systemGlobalConfig.message.fileTypeLimit'))
          return false
        }
        return true
      } else {
        return false
      }
    },
    getUrl(path) { // 获取图片url
      return "./admin-api/system/file" + path;
    },
    handleTabClick ({ name }, event) {
      this.activeTab = name;
    },
    getGlobalConfig () { // 获取tab列表
      getGlobalConfig().then(res => {
        this.formatEchoConfig(res.data)
        // if (res.code === 0) {
        //   this.formatEchoConfig(res.data)
        // } else {
        //   this.$message.error(res.msg || res.data)
        // }
      })
    },
    formatEchoConfig(formData) {
      const processedData = { ...formData };
      this.originConfig = JSON.parse(JSON.stringify(processedData));
      if (!processedData.sysIconUrl) {
        processedData.sysIconUrl = require('@/assets/zhihu/zh.png')
      }
      if (!processedData.sysLoginPageName) {
        processedData.sysLoginPageName = this.$t('common.systemGlobalConfig.default.sysLoginPageName')
      }
      if (!processedData.sysMenuPageName) {
        processedData.sysMenuPageName = this.$t('common.systemGlobalConfig.default.sysMenuPageName')
      }
      if (!processedData.dashboardName) {
        processedData.dashboardName = this.$t('common.systemGlobalConfig.default.dashboardName')
      }
      this.tabForm = processedData;
      console.log('processData===', processedData, processedData['qualityOperationalJson'])
      this.tabForm = {
        ...processedData,
        sysIconUrl: processedData.sysIconUrl,
        sysLoginPageName: processedData.sysLoginPageName,
        sysMenuPageName: processedData.sysMenuPageName,
        dashboardName: processedData.dashboardName,
      };

      if (processedData.sysIconUrl) {
        localStorage.setItem("sysIconUrl", processedData.sysIconUrl);
      }
      if (processedData.sysLoginPageName) {
        localStorage.setItem("sysLoginPageName", processedData.sysLoginPageName);
      }
      if (processedData.sysMenuPageName) {
        localStorage.setItem("sysMenuPageName", processedData.sysMenuPageName);
      }
      if (processedData.dashboardName) {
        localStorage.setItem("dashboardName", processedData.dashboardName);
      }
    },
    formatParams (currentActiveTabName) {
      console.log('form===', this.tabForm)
      return JSON.parse(JSON.stringify(this.tabForm))
    },
    cleanUnusedFields(obj, fields) {
      fields.forEach(field => {
        delete obj[field];
      })
    },
    handleSubmit () {
      const validFormName = this.activeTab + 'FormRef'
      this.$refs[validFormName] && this.$refs[validFormName].validate(valid => {
        if (valid) {
          this.sumbitLoading = true
          console.log('tabFOrm==', this.tabForm)
          const params = this.formatParams(this.activeTab)
          console.log('params==', params)
          // return
          updateGlobalConfig(params).then(res => {
            if (res.code === 0) {
              this.$message.success(this.$t('common.systemGlobalConfig.message.saveSuccess'))
              this.getGlobalConfig()
              this.$store.dispatch("setTitle")
            } else {
              this.$message.error(res.msg || res.data)
            }
            this.sumbitLoading = false
          }).catch(err => {
            this.sumbitLoading = false
          })
        }
      })
    }
  },
  created () {
    this.getGlobalConfig()
  },
}
</script>

<style lang="scss" scoped>
.dash-board-card {
  margin-bottom: 20px;
  padding: 20px;
}
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
::v-deep .el-divider--horizontal {
  margin: 0 0 24px;
}
.toggle-icon {
  margin-right: 10px;
  cursor: pointer;
  color: #409EFF;
  font-size: 16px;
  margin-top: 10px;
}
.icon-echo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 36px;
  height: 36px;
  img {
    height: 100%;
    cursor: pointer;
  }
  span {
    padding-left: 8px;
    cursor: pointer;
    i {
      font-size: 16px;
    }
  }
}
.sized-form {
  width: 60%;
  min-width: 600px;
  margin: 12px auto;
}
.multiple-col-form {
  display: flex;
  gap: 1%;
  justify-content: center;
  align-items: stretch;
  .col-form-box {
    width: 20%;
    min-width: 400px;
    margin: 12px 0;
  }
}
.inline-unit {
  width: 100%;
  text-align: right;
  padding-right: 4px;
}
::v-deep .wrap-item.el-form-item .el-form-item__content {
  width: 200px;
}
.center-btn {
  text-align: center;
}
.action-box {
  text-align: center;
}
.half-width-form {
  width: 50%;
  margin: 0 auto;
}
</style>
<style>
.custom-title-group-select-popover li .el-select-group {
  padding-left: 6px;
}
.custom-title-group-select-popover .el-select-group__title {
  font-size: 14px;
  font-weight: bolder;
  color: #767980;
}
</style>
