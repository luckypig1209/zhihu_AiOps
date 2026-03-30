import request from '@/utils/request'

export function getProcessDefinitionPage(query) {
  return request({
    url: '/bpm/process-definition/page',
    method: 'get',
    params: query
  })
}

export function getProcessDefinitionList(query) {
  return request({
    url: '/bpm/process-definition/list',
    method: 'get',
    params: query
  })
}
export function getOtherProcessDefinitionListAPI() {
  return request({
    url: '/cqt/flow-config/list',
    method: 'post',
    data: {}
  })
}
export function getProcessDefinitionDetail(key) {
  return request({
    url: '/bpm/process-definition/get?key=' + key,
    method: 'get'
  })
}
export function getProcessDefinitionBpmnXML(id) {
  return request({
    url: '/bpm/process-definition/get-bpmn-xml?id=' + id,
    method: 'get'
  })
}

export function getTaskDetail(data) {
  return request({
    url: '/bpm/process-instance/detail',
    method: 'post',
    data: data
  })
}
export function getDutyDetail(taskId) {
  return request({
    url: `/cqt/on-duty/get?id=${taskId}`,
    method: 'get',
  })
}



