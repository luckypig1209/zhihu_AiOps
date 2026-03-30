import request from '@/utils/request'

// 隐患管理列表
export function hazardList(data) {
  return request({
    url: '/cqt/hidden-danger-identification/page',
    method: 'post',
    data: data
  })
}
// 隐患管理新增
export function hazardListAdd(data) {
  return request({
    url: '/cqt/hidden-danger-identification/create',
    method: 'post',
    data: data
  })
}
// 隐患管理更新
export function hazardListUpdate(data) {
  return request({
    url: '/cqt/hidden-danger-identification/update',
    method: 'post',
    data: data
  })
}
// 隐患管理删除
export function hazardListDelete(data) {
  return request({
    url: '/cqt/hidden-danger-identification/delete',
    method: 'post',
    data: data
  })
}
// 隐患管理提交审核
export function processCreate(data) {
  return request({
    url: '/cqt/hidden-danger-identification/create-process-instance',
    method: 'post',
    data: data
  })
}
// 隐患管理提交审核
export function processCancel(data) {
  return request({
    url: '/cqt/hidden-danger-identification/cancel-process-instance',
    method: 'post',
    data: data
  })
}
// 隐患管理提交审核
export function todoTask(data) {
  return request({
    url: '/cqt/hidden-danger-identification/todo-task-list',
    method: 'post',
    data: data
  })
}
// 隐患管理提交审核
export function doneTask(data) {
  return request({
    url: '/cqt/hidden-danger-identification/done-task-list',
    method: 'post',
    data: data
  })
}
