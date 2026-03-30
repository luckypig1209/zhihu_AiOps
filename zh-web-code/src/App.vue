<template>
  <div id="app">
    <router-view />
    <theme-picker />
    <ai-floating-button v-if="$route.path!=='/show/dataScreen' && $route.path!=='/faultManage/alarmScreen' && !$route.query.token"/>
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";
import AiFloatingButton from "@/components/AiChat/FloatingButton";

export default {
  name: "App",
  components: { ThemePicker, AiFloatingButton },
  data() {
    return {
      iconUrl: ''
    }
  },
  watch: {
    // 页面跳转前手动移除残留的tooltip
    $route() {
      const allTooltips = document.querySelectorAll(".el-tooltip__popper")
      if(allTooltips.length > 0) {
        Array.from(allTooltips).map((node) => document.body.removeChild(node))
      }
    }
  },
  mounted() {
    this.getLogoUrl()
  },
  metaInfo() {
    const sysTitle = localStorage.getItem("sysMenuPageName") || this.$t('common.appShortTitle')
    return {
      title: '',
      titleTemplate: title => {
        return title ? `${title} - ${sysTitle}` : sysTitle
        // return title ? `${title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE
      }
    }
  },
  methods: {
    getLogoUrl() {
      const logoUrl = localStorage.getItem("sysIconUrl")
      const iconUrl = logoUrl && logoUrl !='null' ? `${logoUrl}?v=${Date.now()}` : require('@/assets/zhihu/zh.png');
      let link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
      // 设置link元素属性
      link.type = "image/x-icon";
      link.rel = "icon";
      link.href = ''
      link.href = iconUrl;
      // 如果是新创建的元素，则添加到head中
      if (!document.querySelector('link[rel*="icon"]')) {
        document.head.appendChild(link);
      }
    }
  }
};
</script>
<style scoped>
#app .theme-picker {
  display: none;
}

</style>
