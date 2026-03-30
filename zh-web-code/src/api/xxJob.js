// xx_Job调度中心
import request from '@/utils/request'

// 获取任务列表(不带分页)
export function getTaskInfo() {
  return request({
    url: '/job/jobList/get',
    method: 'get'
  })
}
// 查询调度日志列表
export function getJobLog(data) {
  return request({
    url: '/job/jobLogPageList/get',
    method: 'post',
    data
  })
}
// 查询调度备注
export function getJobLogInfo(id) {
  return request({
    url: `/job/triggerMsg/by/id/get/${id}`,
    method: 'get'
  })
}

// obj执行器下拉
export function getJobGroupList() {
  return request({
    url: '/job/jobGroupList/get',
    method: 'get'
  })
}
// 查询obj列表
export function getJobList(data) {
  return request({
    url: '/job/jobInfoPageList/get',
    method: 'post',
    params: data
  })
}

// 启动
export function setStart(data) {
  return request({
    url: `/job/start/${data.id}`,
    method: 'post',
  })
}
// 停止
export function setStop(data) {
  return request({
    url: `/job/stop/${data.id}`,
    method: 'post',
  })
}
// 执行一次
export function setOnce(data) {
  return request({
    url: `/job/trigger`,
    method: 'post',
    data
  })
}
// 更新任务
export function updateTask(data) {
  return request({
    url: `/job/update`,
    method: 'post',
    data
  })
}
