export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    detail: 'Detail',
    back: 'Back',
    submit: 'Submit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    success: 'Operation successful',
    error: 'Operation failed',
    warning: 'Warning',
    info: 'Info'
  },
  login: {
    title: 'System Login',
    username: 'Username',
    password: 'Password',
    captcha: 'Captcha',
    remember: 'Remember me',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    forget: 'Forgot password',
    welcome: 'Welcome back',
    placeholder: {
      username: 'Please enter username',
      password: 'Please enter password',
      captcha: 'Please enter captcha'
    }
  },
  menu: {
    dashboard: 'Dashboard',
    system: 'System Management',
    user: 'User Management',
    role: 'Role Management',
    menu: 'Menu Management',
    dept: 'Department Management',
    post: 'Post Management',
    dict: 'Dictionary Management',
    config: 'Configuration Management',
    monitor: 'Monitoring Center',
    log: 'Log Management',
    online: 'Online Users',
    job: 'Scheduled Tasks',
    cache: 'Cache Management',
    server: 'Server Monitoring',
    tool: 'Tool Management',
    gen: 'Code Generation',
    swagger: 'API Documentation',
    build: 'Form Builder',
    tree: 'Tree Table',
    icon: 'Icon Management'
  },
  systemMenu: {
    search: {
      name: 'Menu Name',
      status: 'Status',
      placeholder: {
        name: 'Please enter menu name',
        status: 'Menu status'
      }
    },
    button: {
      add: 'Add',
      toggleExpand: 'Expand/Collapse',
      search: 'Search',
      reset: 'Reset',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    table: {
      name: 'Menu Name',
      icon: 'Icon',
      sort: 'Sort',
      permission: 'Permission',
      component: 'Component Path',
      componentName: 'Component Name',
      status: 'Status',
      operation: 'Operation'
    },
    dialog: {
      addTitle: 'Add Menu',
      editTitle: 'Edit Menu',
      parentMenu: 'Parent Menu',
      menuType: 'Menu Type',
      icon: 'Icon',
      name: 'Name',
      sort: 'Display Sort',
      path: 'Route Path',
      permission: 'Permission Character',
      component: 'Component Path',
      componentName: 'Component Name',
      status: 'Status',
      visible: 'Whether to display',
      alwaysShow: 'Always display',
      keepAlive: 'Whether to cache',
      options: {
        show: 'Show',
        hide: 'Hide',
        always: 'Always',
        notAlways: 'No',
        cache: 'Cache',
        noCache: 'No Cache'
      }
    },
    validation: {
      nameRequired: 'Menu name cannot be empty',
      sortRequired: 'Menu order cannot be empty',
      pathRequired: 'Route address cannot be empty',
      statusRequired: 'Status cannot be empty'
    },
    message: {
      pathRootError: 'When the parent menu is the main category, the route address must start with /',
      pathChildError: 'When the parent menu is not the main category, the route address cannot start with /',
      updateSuccess: 'Modification successful',
      addSuccess: 'Added successfully',
      deleteConfirm: 'Are you sure to delete the data item named "{name}"?',
      deleteSuccess: 'Deletion successful'
    },
    other: {
      mainCategory: 'Main Category'
    }
  }
}