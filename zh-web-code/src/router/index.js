import Vue from "vue";
import Router from "vue-router";
/* Layout */
import Layout from "@/layout";

Vue.use(Router);

/**
 * Note: 路由配置项
 *
 * hidden: true                   // 【重要】当设置 true 的时候该路由不会再侧边栏出现 如 401，login 等页面，或者如一些编辑页面 /edit/1
 * alwaysShow: true               // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * path: '/login',                // 【重要】访问的 URL 路径
 * component: Layout,             // 【重要】对应的组件；也可以是 (resolve) => require(['@/views/login'], resolve),
 * redirect: noRedirect           // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             // 【重要】设定路由的名字，一定要填写不然使用 <keep-alive> 时会出现各种问题
 * meta : {
    noCache: true                // 【重要】如果设置为 true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'               // 【重要】设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'             // 【重要】设置该路由的图标，对应路径 src/assets/icons/svg
    breadcrumb: false            // 如果设置为 false，则不会在 breadcrumb 面包屑中显示
    activeMenu: '/system/user'   // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: "/redirect",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        component: (resolve) => require(["@/views/redirect"], resolve),
      },
    ],
  },
  {
    path: "/login",
    component: (resolve) => require(["@/views/login"], resolve),
    hidden: true,
  },
  {
    path: "/sso",
    component: (resolve) => require(["@/views/sso"], resolve),
    hidden: true,
  },
  {
    path: "/ssoPortal",
    component: (resolve) => require(["@/views/authorize"], resolve),
    hidden: true,
  },
  {
    path: "/social-login",
    component: (resolve) => require(["@/views/socialLogin"], resolve),
    hidden: true,
  },
  {
    path: "/404",
    component: (resolve) => require(["@/views/error/404"], resolve),
    hidden: true,
  },
  {
    path: "/401",
    component: (resolve) => require(["@/views/error/401"], resolve),
    hidden: true,
  },
  {
    path: "/show/dataScreen",
    component: (resolve) => require(["@/views/dataScreen/index.vue"], resolve),
    hidden: true,
  },
  {
    path: "/faultManage/alarmScreen",
    component: (resolve) => require(["@/views/alarm/dataAllShow.vue"], resolve),
    hidden: true,
  },
  // AI智能问答助手
  {
    path: "/ai-assistant",
    component: (resolve) => require(["@/views/aiAssistant"], resolve),
    name: "AIAssistant",
    hidden: true,
    meta: { title: "智能问答助手", noCache: true },
  },
  // AI功能路由
  {
    path: "/ai-chat",
    component: (resolve) => require(["@/views/aiChat"], resolve),
    name: "AIChat",
    hidden: true,
    meta: { title: "AI聊天", noCache: true },
  },
  {
    path: "/ai-test",
    component: (resolve) => require(["@/views/aiTest"], resolve),
    name: "AITest",
    hidden: true,
    meta: { title: "AI功能测试", noCache: true },
  },
  {
    path: "/demo",
    component: (resolve) => require(["@/views/ai-standalone"], resolve),
    name: "AIDemo",
    hidden: true,
    meta: { title: "AI助手演示", noCache: true },
  },
  {
    path: "",
    component: Layout,
    redirect: "faultManage/alarmShow",
    // children: [
    //   {
    //     path: "index",
    //     component: (resolve) => require(["@/views/home/home"], resolve),
    //     name: "首页",
    //     hidden: true,
    //     meta: { title: "首页", icon: "dashboard", affix: true },
    //   },
    // ],
  },
  {
    path: "/user",
    component: Layout,
    hidden: true,
    redirect: "noredirect",
    children: [
      {
        path: "profile",
        component: (resolve) =>
          require(["@/views/system/user/profile/index"], resolve),
        name: "Profile",
        meta: { title: "个人中心", icon: "user" },
      },
      {
        path: "notify-message",
        component: (resolve) =>
          require(["@/views/system/notify/my/index"], resolve),
        name: "MyNotifyMessage",
        meta: { title: "我的站内信", icon: "message" },
      },
    ],
  },
  {
    path: "/setting",
    component: Layout,
    hidden: true,
    children: [
      {
        path: "system/dict/type/data/:dictId(\\d+)",
        component: (resolve) => require(["@/views/system/dict/data"], resolve),
        name: "SystemDictData",
        meta: { title: "字典数据", icon: "", activeMenu: "/system/dict" },
      },
    ],
  },
  // {
  //   path: "/demos",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       // path: "topology/:dictId(\\d+)",
  //       path: `topology/id=${id}`,
  //       component: (resolve) => require(["@/views/demos/topology"], resolve),
  //       name: "topologyData",
  //       meta: { title: "拓扑图", icon: "", activeMenu: "/demos" },
  //     },
  //   ],
  // },
  // {
  //   path: "/demos",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       // 正则匹配 "id=数字" 格式的参数，括号内是参数值（需用 () 捕获）
  //       path: "topology/id=(\\d+)",
  //       component: (resolve) => require(["@/views/demos/topology"], resolve),
  //       name: "topologyData",
  //       meta: { title: "拓扑图", icon: "", activeMenu: "/demos" },
  //       // 解析参数（将 "id=123" 中的 123 提取为 dictId）
  //       props: (route) => {
  //         const id = route.params[0]; // 正则捕获的第一个分组值（即 \\d+ 匹配的内容）
  //         return { dictId: id }; // 传递给组件的 props
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: "/demos",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: "topology", // 基础路径，不包含查询参数
  //       component: (resolve) => require(["@/views/demos/topology"], resolve),
  //       name: "topologyData",
  //       meta: { title: "拓扑图", icon: "", activeMenu: "/demos" },
  //       // 从 query 中提取参数并传递给组件 props
  //       props: (route) => ({
  //         dictId: route.query.id, // 直接获取 ?id=xxx 中的值
  //         // 若有多个参数，继续添加：
  //         // otherParam: route.query.other
  //       }),
  //     },
  //   ],
  // },
  {
    path: "/topology",
    component: (resolve) => require(["@/views/demos/topology"], resolve),
    name: "topologyDatas",
    hidden: true,
    meta: {
      title: "拓扑图",
      icon: "",
    },
    // 保留 query 参数传递逻辑（核心，从 URL 提取 ?id=xxx 传给组件）
    props: (route) => ({
      dictId: route.query.id, // 接收 URL 中的 ?id=xxx 参数
      // 若有其他参数，继续添加：
      // otherParam: route.query.other // 对应 ?other=yyy
    }),
  },
  
  {
    path: "/videos",
    component: (resolve) =>
      require(["@/components/xgVideo/index.vue"], resolve),
    name: "videos",
    hidden: true,
    meta: {
      title: "视频",
      icon: "",
    },

    props: (route) => ({
      dictId: route.query.id,
      videoUrl: route.query.videoUrl
    }),
  },
  {
    path: "/videoPlay",
    component: (resolve) =>
      require(["@/components/xgVideo/demo.vue"], resolve),
    name: "videoPlay",
    hidden: true,
    meta: {
      title: "视频",
      icon: "",
    },
  },
  // 智能问答页面（菜单由 Sidebar 手动渲染，此处 hidden: true 仅注册路由）
  {
    path: "/smart-qa",
    component: Layout,
    name: "SmartQA",
    hidden: true,
    meta: {
      title: "智能问答",
      icon: "message",
    },
    children: [
      {
        path: "",
        component: (resolve) => require(["@/views/aiAssistant/index.vue"], resolve),
        name: "SmartQAIndex",
        meta: {
          title: "智能问答",
          icon: "message",
          noCache: true,
        },
      },
    ],
  },
];

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch((err) => err);
};

export default new Router({
  base: process.env.VUE_APP_APP_NAME ? process.env.VUE_APP_APP_NAME : "/",
  mode: "history", // 去掉url中的#
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes,
});
