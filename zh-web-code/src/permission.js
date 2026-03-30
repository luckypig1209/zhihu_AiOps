import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { getAccessToken } from "@/utils/auth";
import { isRelogin } from "@/utils/request";
import Skeleton from "@/layout/Skeleton.vue";
import Vue from "vue";

// 创建骨架屏实例
const SkeletonConstructor = Vue.extend(Skeleton);
const skeletonInstance = new SkeletonConstructor().$mount();
document.body.appendChild(skeletonInstance.$el);

// 配置更平滑的动画
NProgress.configure({
  showSpinner: false, // 隐藏旋转器更美观
  easing: "ease",
  speed: 500,
  trickleSpeed: 200,
  minimum: 0.3,
});

// 免登录白名单路由
const WHITE_LIST = [
  "/login",
  "/social-login",
  "/auth-redirect",
  "/bind",
  "/register",
  '/videoPlay',
  "/oauthLogin/gitee",
];

// 第三方携带token实现免登录
function urlToken() {
  const url = decodeURIComponent(window.location.href);
  const reg = /[?&]([^?&#]+)=([^?&#]+)/g;
  const param = {};
  let ret = reg.exec(url);
  while (ret) {
    param[ret[1]] = ret[2];
    ret = reg.exec(url);
  }
  if (param.token) {
    localStorage.setItem("ACCESS_TOKEN", param.token);
  }
  if (param.errMsg) {
    if (errMsg != param.errMsg) {
      errMsg = param.errMsg;
      Message.error(errMsg);
    }
  }
}

// 检查是否在白名单中
const isInWhiteList = (path) => WHITE_LIST.includes(path);

// 显示骨架屏
const showSkeleton = () => {
  skeletonInstance.$el.style.display = "block";
};

// 隐藏骨架屏（带过渡效果）
const hideSkeleton = () => {
  skeletonInstance.$el.style.opacity = "1";
  let opacity = 1;
  const fadeOut = setInterval(() => {
    opacity -= 0.1;
    skeletonInstance.$el.style.opacity = opacity;
    if (opacity <= 0) {
      clearInterval(fadeOut);
      skeletonInstance.$el.style.display = "none";
      skeletonInstance.$el.style.opacity = "1";
    }
  }, 50);
};

// 处理登录后的路由逻辑
const handleAuthenticatedRoute = async (to, from, next) => {
  // 特殊处理portal登录重定向
  if (to.path === "/login") {
    if (
      to.query?.code === "portal" &&
      to.query.accessToken &&
      to.query.refreshToken
    ) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("REFRESH_TOKEN");
      next();
    } else {
      next({ path: "/" });
    }
    return true;
  }

  // 检查是否为特定的topology页面且soureType=1
  const isSpecialTopology =
    (to.path === "/topology" || to.path === "/demos/topology") &&
    to.query?.soureType === "1";
  console.log(isSpecialTopology, "isSpecialTopology");

  // 初始化用户信息和路由
  if (store.getters.roles.length === 0) {
    try {
      isRelogin.show = true;

      // 当是特定的topology页面且soureType=1时，跳过dict/loadDictDatas和GetInfo调用
      if (isSpecialTopology) {
        // 设置默认角色以通过权限检查
        store.commit("SET_ROLES", ["ROLE_DEFAULT"]);
        store.commit("SET_PERMISSIONS", []);
        next({ ...to, replace: true });
      } else {
        // 正常流程
        await store.dispatch("dict/loadDictDatas");
        const userInfo = await store.dispatch("GetInfo");

        // 动态生成路由
        const accessRoutes = await store.dispatch(
          "GenerateRoutes",
          userInfo.menus
        );
        router.addRoutes(accessRoutes);

        // 确保路由添加完成
        next({ ...to, replace: true });
      }
    } catch (err) {
      // 对于特殊页面，不执行logout
      if (!isSpecialTopology) {
        await store.dispatch("LogOut");
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      } else {
        next({ ...to, replace: true });
      }
    } finally {
      isRelogin.show = false;
    }
    return true;
  }

  return false;
};

let urlTokenFlag = true;
let errMsg = "";
// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start();
  showSkeleton();
  urlTokenFlag ? urlToken() : "";
  const hasToken = getAccessToken();

  // 设置页面标题
  if (to.meta.title) {
    store.dispatch("settings/setTitle", to.meta.title);
  }

  try {
    // 已登录状态
    if (hasToken) {
      if (await handleAuthenticatedRoute(to, from, next)) {
        return;
      }
      next();
    }
    // 未登录状态
    else {
      isInWhiteList(to.path)
        ? next()
        : next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
  } catch (error) {
    console.error("路由导航错误:", error);
    next(false); // 取消当前导航
  } finally {
    // 确保进度条完成
    if (NProgress.isStarted()) {
      NProgress.done();
    }
  }
});

// 路由后置钩子
router.afterEach(() => {
  // 延迟隐藏骨架屏确保新内容已加载
  setTimeout(() => {
    hideSkeleton();
  }, 100);
});

// 路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
  hideSkeleton();
  NProgress.done();
});
