/**
 * 新项目承接
 * @autor hjw
 * @date 2023/02/05
 */
// 引入util
import request from '@/utils/request'
// 预警列表
export function newProjectList(data) {
  return request({
    url: '/cqt/new-project/page',
    method: 'post',
    data: data
  })
}
// 日志
export function logList(data){
  return request({
    url: '/cqt/new-project/log-page',
    method: 'POST',
    data
  })
}
// 日志
export function projectDetail(data){
  return request({
    url: '/cqt/new-project/detail',
    method: 'POST',
    data
  })
}
// 转派
export function jlTransfer(data){
  return request({
    url: '/cqt/new-project/transfer',
    method: 'POST',
    data
  })
}
// 承接
export function isConfirm(data) {
  return request({
    url: '/cqt/new-project/confirm',
    method: 'POST',
    data
  })
}
// 转派树
export function projectAndOrgInfoAndUserInfos(data) {
  return request({
    url:`/system/dept/op-list?postName=${data}`,
    method: 'GET',
    data
  })
}

