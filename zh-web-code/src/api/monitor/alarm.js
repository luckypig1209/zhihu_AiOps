import request from '@/utils/request'
//告警级别分布
export function getPriority(data) {
  return request({
    url:  '/monitor/alarms/overview/priority',
    method: 'post',
    data:data
  })
}

//告警恢复率总览接口
export function getResolved(data) {
  return request({
    url:  '/monitor/alarms/overview/resolved',
    method: 'post',
    data:data
  })
}
//告警分布总览接口
export function getDistribution(data) {
  return request({
    url:  '/monitor/alarms/overview/distribution',
    method: 'post',
    data:data
  })
}
//告警日统计总览接口
export function getDaily(data) {
  return request({
    url:  '/monitor/alarms/overview/daily',
    method: 'post',
    data:data
  })
}
//告警趋势统计总览接口
export function getTrend(data) {
  return request({
    url:  '/monitor/alarms/overview/trend',
    method: 'post',
    data:data
  })
}
//告警统计TOP总览接口
export function getTop(data, type) {
  return request({
    url:  '/monitor/alarms/overview/' + type + '/top',
    method: 'post',
    data:data
  })
}
