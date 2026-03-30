export default {
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    reset: '重置',
    export: '导出',
    import: '导入',
    refresh: '刷新',
    detail: '详情',
    back: '返回',
    submit: '提交',
    close: '关闭',
    yes: '是',
    no: '否',
    success: '操作成功',
    error: '操作失败',
    warning: '警告',
    info: '提示'
  },
  login: {
    title: '系统登录',
    username: '用户名',
    password: '密码',
    captcha: '验证码',
    remember: '记住我',
    login: '登录',
    logout: '退出',
    register: '注册',
    forget: '忘记密码',
    welcome: '欢迎回来',
    placeholder: {
      username: '请输入用户名',
      password: '请输入密码',
      captcha: '请输入验证码'
    }
  },
  menu: {
    dashboard: '首页',
    system: '系统管理',
    user: '用户管理',
    role: '角色管理',
    menu: '菜单管理',
    dept: '部门管理',
    post: '岗位管理',
    dict: '字典管理',
    config: '配置管理',
    monitor: '监控中心',
    log: '日志管理',
    online: '在线用户',
    job: '定时任务',
    cache: '缓存管理',
    server: '服务器监控',
    tool: '工具管理',
    gen: '代码生成',
    swagger: '接口文档',
    build: '表单构建',
    tree: '树形表格',
    icon: '图标管理'
  },
  systemMenu: {
    search: {
      name: '菜单名称',
      status: '状态',
      placeholder: {
        name: '请输入菜单名称',
        status: '菜单状态'
      }
    },
    button: {
      add: '新增',
      toggleExpand: '展开/折叠',
      search: '搜索',
      reset: '重置',
      edit: '修改',
      delete: '删除',
      confirm: '确 定',
      cancel: '取 消'
    },
    table: {
      name: '菜单名称',
      icon: '图标',
      sort: '排序',
      permission: '权限标识',
      component: '组件路径',
      componentName: '组件名称',
      status: '状态',
      operation: '操作'
    },
    dialog: {
      addTitle: '添加菜单',
      editTitle: '修改菜单',
      parentMenu: '上级菜单',
      menuType: '菜单类型',
      icon: '图标',
      name: '名称',
      sort: '显示排序',
      path: '路由地址',
      permission: '权限字符',
      component: '组件路径',
      componentName: '组件名称',
      status: '状态',
      visible: '是否显示',
      alwaysShow: '总是显示',
      keepAlive: '是否缓存',
      options: {
        show: '显示',
        hide: '隐藏',
        always: '总是',
        notAlways: '不是',
        cache: '缓存',
        noCache: '不缓存'
      }
    },
    validation: {
      nameRequired: '菜单名称不能为空',
      sortRequired: '菜单顺序不能为空',
      pathRequired: '路由地址不能为空',
      statusRequired: '状态不能为空'
    },
    message: {
      pathRootError: '上级菜单为主类目时，路由地址必须以 / 开头',
      pathChildError: '上级菜单不为主类目时，路由地址不能以 / 开头',
      updateSuccess: '修改成功',
      addSuccess: '新增成功',
      deleteConfirm: '是否确认删除名称为"{name}"的数据项?',
      deleteSuccess: '删除成功'
    },
    other: {
      mainCategory: '主类目'
    }
  }
}