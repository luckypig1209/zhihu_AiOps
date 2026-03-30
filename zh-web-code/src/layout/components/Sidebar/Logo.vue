<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}" :style="{ backgroundColor: sideTheme === 'theme-dark' ? variables.menuBackground : variables.menuLightBackground }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/faultManage/alarmShow">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h2 v-else class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }} </h2>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/faultManage/alarmShow">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
        <h1 class="sidebar-title" :style="{ color: sideTheme === 'theme-dark' ? variables.logoTitleColor : variables.logoLightTitleColor }">{{ title }} </h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
import variables from '@/assets/styles/variables.scss'
import { getLogoGlobalConfig } from "@/api/system/globalConfig";

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    variables() {
      return variables;
    },
    sideTheme() {
      return this.$store.state.settings.sideTheme
    },
    title() {
      return localStorage.getItem("sysMenuPageName") || this.$t('common.appShortTitle');
    }
  },
  created() {
    this.getLogoConfig();
  },
  methods:{
  getLogoConfig() {
    getLogoGlobalConfig().then((res) => {
      if (res.data) {
        if (res.data.sysIconUrl) {
          localStorage.setItem("sysIconUrl", res.data.sysIconUrl);
        } else {
          localStorage.removeItem("sysIconUrl");
        }
        if (res.data.sysLoginPageName) {
          localStorage.setItem("sysLoginPageName", res.data.sysLoginPageName);
        } else {
          localStorage.removeItem("sysLoginPageName");
        }
        if (res.data.sysMenuPageName) {
          localStorage.setItem("sysMenuPageName", res.data.sysMenuPageName);
        } else {
          localStorage.removeItem("sysMenuPageName");
        }
      } else {
        localStorage.removeItem("sysIconUrl");
        localStorage.removeItem("sysLoginPageName");
        localStorage.removeItem("sysMenuPageName");
      }
    });
  },
  },
  data() {
    return {
      logo: localStorage.getItem('sysIconUrl') || require('@/assets/zhihu/zh.png'),
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 60px;
      font-size: 18px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
