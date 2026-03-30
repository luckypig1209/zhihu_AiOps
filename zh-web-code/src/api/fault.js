import request from '@/utils/request'
// 告警管理列表
export function alarmList(data) {
  return request({
    url: '/cqt/alarms/page',
    method: 'post',
    data: data
  })
}
export function alarmListNew(data) {
  return request({
    url: '/monitor/topology/share/getAlarmDetail/' + data.id + '/' + data.token,
    method: 'get',
  })
}
// 告警派单
export function createProcess(data) {
  return request({
    url: '/cqt/alarms/create-process-instance',
    method: 'post',
    data: data
  })
}
// 故障工单列表
export function faultShow(data) {
  return request({
    url: '/cqt/work-order-info/page',
    method: 'post',
    data: data
  })
}
// 地市
export function sysArea(data) {
  return request({
    url: '/cqt/sys-area/list',
    method: 'post',
    data: data
  })
}
