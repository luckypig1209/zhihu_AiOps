import request from '@/utils/request'

// 获取工单列表
export function getTaskPage(data) {
  return request({
    url: '/cqt/flow-config/getAll',
    method: 'post',
    data: data
  })
}
// 新获取工单列表
export function getNewTaskPage(queryValue) {
  return request({
    url: '/cqt/flow-config/getAll-groupByType?queryValue=' + queryValue,
    method: 'post'
  })
}

