<template>
  <div
    :class="{'has-logo': showLogo}"
    :style="{
      backgroundColor:
        settings.sideTheme === 'theme-dark'
          ? variables.menuBackground
          : variables.menuLightBackground
    }"
  >
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar :class="settings.sideTheme" wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="
          settings.sideTheme === 'theme-dark'
            ? variables.menuBackground
            : variables.menuLightBackground
        "
        :text-color="
          settings.sideTheme === 'theme-dark'
            ? variables.menuColor
            : variables.menuLightColor
        "
        :unique-opened="true"
        :active-text-color="settings.theme"
        :collapse-transition="false"
        mode="vertical"
        :default-openeds="openedMenus"
        @open="handleMenuOpen"
        @close="handleMenuClose"
      >
        <!-- 根据 sidebarRouters 路由，生成菜单 -->
        <sidebar-item
          v-for="(route, index) in sidebarRouters"
          :key="route.path + index"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/assets/styles/variables.scss";
import axios from "axios";
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
export default {
  components: { SidebarItem, Logo },
  data() {
    return {};
  },
  computed: {
    ...mapState(["settings"]),
    ...mapGetters(["sidebarRouters", "sidebar"]),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      
      // 处理动态路由，匹配静态部分
      const sidebarRoutes = this.sidebarRouters;
      let matchedPath = path;
      
      // 递归查找匹配的路由
      const findMatchedRoute = (routes) => {
        for (const routeItem of routes) {
          if (routeItem.path && path.startsWith(routeItem.path) && routeItem.path !== '/') {
            matchedPath = routeItem.path;
            if (routeItem.children) {
              findMatchedRoute(routeItem.children);
            }
          } else if (routeItem.children) {
            findMatchedRoute(routeItem.children);
          }
        }
      };
      
      findMatchedRoute(sidebarRoutes);
      
      return matchedPath;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    },
    openedMenus() {
      // 从localStorage读取展开的菜单
      const openedMenus = localStorage.getItem('openedMenus');
      return openedMenus ? JSON.parse(openedMenus) : [];
    }
  },
  watch: {
    sidebarRouters: {
      handler: function (val) {
        // 添加安全检查，避免在路由加载过程中触发重定向
        if (!val || val.length === 0) {
          return;
        }

        let isIn = false;
        const route = this.$route;
        const { path } = route;

        // 检查当前路由是否在菜单中（支持动态路由）
        const checkRouteInMenu = (routes) => {
          for (const routeItem of routes) {
            if (routeItem.path && path.startsWith(routeItem.path) && routeItem.path !== '/') {
              isIn = true;
              return;
            } else if (routeItem.children) {
              checkRouteInMenu(routeItem.children);
              if (isIn) return;
            }
          }
        };

        checkRouteInMenu(val);

        // 只有在确定需要重定向且目标路径有效时才执行重定向
        if (!isIn) {
          // 添加安全检查，避免无效重定向
          if (val && val.length > 0 && val[0]) {
            if (
              val[0].children &&
              val[0].children.length &&
              val[0].children.length > 0
            ) {
              const targetPath =
                val[0].path + "/" + val[0].children[0]?.path;
              if (
                targetPath &&
                targetPath !== "/undefined" &&
                targetPath !== "//" &&
                targetPath !== "/"
              ) {
                this.$router.push({ path: targetPath });
              }
            } else if (
              val[0].path &&
              val[0].path !== "/undefined" &&
              val[0].path !== "/"
            ) {
              this.$router.push({ path: val[0].path });
            }
          }
        }
      },
      deep: true,
      immediate: false // 改为false，避免立即执行
    }
  },
  methods: {
    async fetchZhihuToken() {
      try {
        let url = getDictDatas(DICT_TYPE.DATAEASE_URL)
        let dataEaseUrl = ''
          if(url.length && url[0]){
            dataEaseUrl = url[0].value
          }        
        if(dataEaseUrl == ''){
          return
        }  
        const response = await axios({
          url: dataEaseUrl + "/de2api/login/zhihuLogin",
          method: "post", // 接口默认按post请求，若为get可改为get
          data: { name: "admin" }, // post请求传参用data，get请求用params
          headers: {
            // 可根据接口要求补充请求头，如content-type、token等
            "Content-Type": "application/json"
          },
          timeout: 10000 // 设置10秒超时
        });
          // 2. 拼接域名，打开新标签页
          const fullUrl = dataEaseUrl + `/#/workbranch/index&isFrom=zhihu&token=` + response.data.data?.token;
          window.open(fullUrl, '_blank');
             
        // 可根据接口返回结果做后续逻辑处理，如存储token到vuex/localStorage
        // this.$store.commit('SET_TOKEN', response.data.token)
      } catch (error) {
        console.error("登录接口请求失败：", error);
        // 统一异常处理，如提示用户、记录日志等
        this.$message?.error("登录验证接口请求失败，请稍后重试");
      }
    },
    handleMenuOpen(key, keyPath) {
      // 保存展开的菜单
      localStorage.setItem('openedMenus', JSON.stringify(keyPath));
    },
    handleMenuClose(key, keyPath) {
      // 保存展开的菜单
      localStorage.setItem('openedMenus', JSON.stringify(keyPath));
    }
  }
};
</script>