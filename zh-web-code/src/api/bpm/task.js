import request from '@/utils/request'

export function getTodoTaskPage(query) {
  return request({
    url: '/bpm/task/todo-page',
    method: 'get',
    params: query
  })
}

export function getDoneTaskPage(query) {
  return request({
    url: '/bpm/task/done-page',
    method: 'get',
    params: query
  })
}

export function completeTask(data) {
  return request({
    url: '/bpm/task/complete',
    method: 'PUT',
    data: data
  })
}

export function approveTask(data) {
  return request({
    url: '/bpm/task/approve',
    method: 'PUT',
    data: data
  })
}

export function updateFormData(data) {
  return request({
    url: '/bpm/process-instance/updateFormData',
    method: 'post',
    data: data
  })
}

export function rejectTask(data) {
  return request({
    url: '/bpm/task/reject',
    method: 'PUT',
    data: data
  })
}
export function backTask(data) {
  return request({
    url: '/bpm/task/back',
    method: 'PUT',
    data: data
  })
}

export function updateTaskAssignee(data) {
  return request({
    url: '/bpm/task/update-assignee',
    method: 'PUT',
    data: data
  })
}

export function getTaskListByProcessInstanceId(processInstanceId) {
  return request({
    url: '/bpm/task/list-by-process-instance-id?processInstanceId=' + processInstanceId,
    method: 'get',
  })
}

export function getReturnList(taskId) {
  return request({
    url: '/bpm/task/return-list?taskId='+ taskId,
    method: 'get',
  })
}

export function returnTask(data) {
  return request({
    url: '/bpm/task/return',
    method: 'PUT',
    data: data
  })
}

export function delegateTask(data) {
  return request({
    url: '/bpm/task/delegate',
    method: 'PUT',
    data: data
  })
}

export function saveAssetFormInfo(data) {
  return request({
    url: '/cqt/asset-info/save-form-info',
    method: 'post',
    data: data
  })
}

export function checkInstanceId(data) {
  return request({
    url: '/cqt/asset-info/check-instance-id',
    method: 'post',
    data: data
  })
}
export function resourceDataExport(data) {
  return request({
    url: '/cqt/process/export-asset-apply-form',
    method: 'post',
    responseType: "blob",
    data: data
  })
}

//批量不通过
export function batchRejectTask(data) {
  return request({
    url: '/bpm/task/batchReject',
    method: 'PUT',
    data: data
  })
}
//批量通过
export function batchApproveTask(data) {
  return request({
    url: '/bpm/task/batchApprove',
    method: 'PUT',
    data: data
  })
}
//批量转派
export function updateAllTaskAssignee(data) {
  return request({
    url: '/bpm/task/batchDelegate',
    method: 'PUT',
    data: data
  })
}