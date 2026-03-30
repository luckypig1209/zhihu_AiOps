import request from '@/utils/request'

// 查询登录日志列表
export function list(data) {
  return request({
    url: '/system/console-log/page',
    method: 'post',
    data: data
  })
}

// 导出登录日志
export function exportConsoleLog(query) {
  return request({
    url: '/system/console-log/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}
