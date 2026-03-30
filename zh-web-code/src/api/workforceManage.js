/**
 * @description: 值班管理
 */
import request from '@/utils/request'

// 获取值班排班列表
export function getWorkforceList (data) {
  return request({
    url: `/cqt/on-duty/get-page`,
    method: 'post',
    data
  })
}
// 删除值班
export function deleteWorkforce (data) {
  return request({
    url: `/cqt/on-duty-record/deleteByDate`,
    method: 'post',
    data
  })
}
// 获取排班列表
export function getWorkScheduleList (data) {
  return request({
    url: `/cqt/on-duty/get-list`,
    method: 'post',
    data
  })
}
// 获取平台信息
export function getPlatform () {
  return request({
    url: `/cqt/on-duty/get-platform`,
    method: 'post'
  })
}
// 获取值班组下拉数据
export function getDutyGroup () {
  return request({
    url: `/cqt/on-duty/get-all-duty-group-list`,
    method: 'post'
  })
}
// 某值班组详情
export function getDutyGroupDetail (data) {
  return request({
    url: `/cqt/on-duty/get-duty-group-detail`,
    method: 'post',
    params: data
  })
}
// 某日值班排班详情
export function getScheduleRow (data) {
  return request({
    url: `/cqt/on-duty/get-schedule-record-detail`,
    method: 'post',
    data
  })
}
// 获取用户
export function getDutyUser () {
  return request({
    url: `/system/user/list-all-simple`,
    method: 'get'
  })
}
// 新增编辑排班（一键排班）
export function addEditDutySchedule (data) {
  return request({
    url: `/cqt/on-duty/one-click-scheduling`,
    method: 'post',
    data
  })
}
// 新增修改值班组
export function addEditDutyGroup (data) {
  return request({
    url: `/cqt/on-duty/add-duty-group`,
    method: 'post',
    data
  })
}
// 获取值班组分页列表
export function getDutyGroupPage (data) {
  return request({
    url: `/cqt/on-duty/get-duty-group-page`,
    method: 'post',
    data
  })
}
// 删除值班组
export function deleteDutyGroup (data) {
  return request({
    url: `/cqt/on-duty-group/delete`,
    method: 'post',
    data
  })
}