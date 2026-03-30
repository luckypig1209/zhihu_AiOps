<template>
  <div class="kibana-page" v-loading="urlLoading">
    <!-- 友好提示区域 -->
    <div class="prompt-container">
      <el-icon class="icon" size="48"><Link /></el-icon>
      <h3>{{ $t('common.customPageOpened') }}</h3>
      <p class="desc">
        {{ $t('common.customPageOpenedDesc') }}
        {{ $t('common.checkBrowserPopupSettings') }}
      </p>
      <el-button
        type="primary"
        icon="el-icon-external-link"
        @click="openKibanaManually"
        class="open-btn"
      >
        {{ $t('common.openNewPanelManually') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import axios from "axios";
import i18n from "@/i18n";
// import { ElMessage, ElMessageBox } from "element-ui";
// import { Link } from "@element-plus/icons-vue"; // 若用element-ui则替换为对应图标

export default {
  components: {  },
  data() {
    return {
      externalUrl: "/kibana/app/dashboards#/11", // 默认地址
      urlLoading: true, // 初始加载状态
      hasOpened: false, // 标记是否已打开新标签页
    };
  },
  async mounted() {
    this.openKibanaManually();
  },
  methods: {

    async fetchZhihuToken() {
      try {
        const currentOrigin = window.location.origin;
        // 拼接dataEase的基础地址（替换原字典获取逻辑）
        const dataEaseUrl = currentOrigin;

        const response = await axios({
          url: `${dataEaseUrl}/screen/de2api/login/zhihuLogin`,
          method: "post",
          data: { name: "admin" },
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        });

        this.urlLoading = false;
        // 获取当前语言
        const currentLang =  localStorage.getItem("accept-language") === 'zh-CN' ? 'zh-CN' : 'en';
        // const currentLang =  this.$i18n.locale === 'zh' ? 'zh-CN' : 'en';
        // 拼接完整URL并打开新标签页
        const fullUrl = `${dataEaseUrl}/screen/#/workbranch/index&isFrom=zhihu&token=${response.data.data?.token || ''}&lang=${currentLang}`;
        window.open(fullUrl, '_blank');
      } catch (error) {
        console.error("登录接口请求失败：", error);
         this.urlLoading = false
        // 统一异常处理，如提示用户、记录日志等
        this.$message?.error(this.$t('common.loginVerificationFailed'));
      }
    },
    /** 手动打开 新标签页 */
    openKibanaManually() {
      // if (this.hasOpened) {
      //   ElMessage.info("面板已打开，请勿重复点击～");
      //   return;
      // }

      try {
        this.fetchZhihuToken()
        this.hasOpened = true;
      } catch (error) {
      }
    },
  },
};
</script>

<style scoped lang="less">
.kibana-page {
  height: calc(100vh - 130px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;

  .prompt-container {
    text-align: center;
    padding: 40px 60px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 90%;

    .icon {
      color: #409eff;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 20px;
      color: #303133;
      margin: 0 0 16px 0;
      font-weight: 600;
    }

    .desc {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
      margin: 0 0 30px 0;
    }

    .open-btn {
      font-size: 14px;
      padding: 10px 30px;
    }
  }
}
</style>
