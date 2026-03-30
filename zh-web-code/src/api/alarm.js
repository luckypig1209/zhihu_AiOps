import request from '@/utils/request'

export function getRuleList(data) {
  return request({
    url: '/zhihu/alarm-rule/listRules',
    method: 'post',  
    data: data
  })
}
export function getRuleDetail(data) {
  return request({
    url: '/zhihu/alarm-rule/getRule',
    method: 'post',
    params: data
  })
}
// 新增/修改规则
export function saveRule(data) {
  return request({
    url: '/zhihu/alarm-rule/saveRule',
    method: 'post',
    data: data
  })
}
// 规则配置 条件字段
export function getRuleConditionFields(data) {
  return request({
    url: '/zhihu/alarm-rule/leftValues',
    method: 'post',
    data: data  
  })
}
// 工单流程
export function getOrderProgressList(data) {
  return request({
    url: '/bpm/model/page',
    method: 'get',
    params: data  
  })
}
// 删除规则
export function deleteRuleById(data) {
  return request({
    url: '/zhihu/alarm-rule/delete',
    method: 'post',
    params: data  
  })
}

// 工单流程
export function getAlarmDetail(id) {
  return request({
    url: `/cqt/alarms/get/${id}`,
    method: 'get',
  })
}
