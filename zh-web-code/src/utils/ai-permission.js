// AI功能权限配置
// 这个文件包含AI相关的权限配置，可以独立使用

// AI功能白名单路由
export const AI_WHITE_LIST = [
  '/ai-demo',
  '/ai-test', 
  '/ai-chat'
]

// 检查是否为AI白名单路由
export const isAiWhiteList = (path) => {
  return AI_WHITE_LIST.some(route => path.startsWith(route))
}

// AI功能权限检查
export const checkAiPermission = (to, from, next) => {
  // 如果是AI白名单路由，直接放行
  if (isAiWhiteList(to.path)) {
    return next()
  }
  
  // 其他路由按正常流程处理
  return null
}
