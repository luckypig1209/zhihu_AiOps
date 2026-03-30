import request from '@/utils/request'

export function getMyProcessInstancePage(query) {
  return request({
    url: '/bpm/process-instance/my-page',
    method: 'get',
    params: query
  })
}

export function createProcessInstance(data) {
  return request({
    url: '/bpm/process-instance/create',
    method: 'POST',
    data: data
  })
}

export function cancelProcessInstance(id, reason) {
  return request({
    url: '/bpm/process-instance/cancel',
    method: 'DELETE',
    data: {
      id,
      reason
    }
  })
}

export function getProcessInstance(id) {
  return request({
    url: '/bpm/process-instance/get?id=' + id,
    method: 'get',
  })
}

export function batchInsertTableData(data) {
  return request({
    url: '/cqt/flow-asset-ecs/batch-insert-Update',
    method: 'POST',
    data: data
  })
}

export function getProcessType(data) { // 获取工单类型下拉框数据。后端复用的接口，参数写死为suspensionState: 1
  return request({
    url: '/bpm/model/get-list',
    method: 'get',
    data
  })
}

export function getProcessFilter(data) { // 获取当前类型筛选条件下拉框数据。
  return request({
    url: '/bpm/process-instance/get-filter-condition',
    method: 'post',
    data
  })
}

export function getCustomField(data) { // 获取当前list已配置字段
  return request({
    url: '/bpm/process-instance/user-config/get',
    method: 'post',
    data
  })
}

export function saveCustomField(data) { // 保存当前list已配置字段
  return request({
    url: '/bpm/process-instance/user-config/save',
    method: 'post',
    data
  })
}

export function getProcessList(data) { // 获取工单列表-24.4定制化-新表格list数据接口
  return request({
    url: '/bpm/process-instance/my-process-page',
    method: 'post',
    data
  })
}
//全量工单
export function getAllProcessList(data) { // 获取工单列表-24.4定制化-新表格list数据接口
  return request({
    url: '/bpm/process-instance/all-process-page',
    method: 'post',
    data
  })
}

export function exportList(data) { // 列表数据导出
  return request({
    url: '/cqt/process/export-my-page',
    method: 'post',
    responseType: "blob",
    data
  })
}

export function getTodoList(data) { // 获取工单列表-24.4定制化-新待办list数据接口
  return request({
    url: '/bpm/process-instance/todo-page',
    method: 'post',
    data
  })
}
export function getDoneList(data) { // 获取工单列表-24.4定制化-新已办list数据接口
  return request({
    url: '/bpm/process-instance/done-page',
    method: 'post',
    data
  })
}
// 删除全量订单
export function deleteOrder(id) {
  return request({
    url: '/bpm/process-instance/delete/' + id,
    method: 'get'
  })
}
//获取留痕记录
export function getProcessInstanceList(id) {
  return request({
    url: '/bpm/process-instance-ext-content/list-by-process-instance-id?processInstanceId=' + id,
    method: 'get',
  })
}
export function createContent(data) { // 创建留痕
  return request({
    url: '/bpm/process-instance-ext-content/create',
    method: 'post',
    data
  })
}
// 挂起
export function hangUpOrder(id) {
  return request({
    url: '/bpm/process-instance/hangUp/' + id,
    method: 'get'
  })
}
// 解除挂起
export function releaseOrder(id) {
  return request({
    url: '/bpm/process-instance/release/' + id,
    method: 'get'
  })
}