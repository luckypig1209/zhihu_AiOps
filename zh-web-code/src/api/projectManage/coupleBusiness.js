import request from '@/utils/request'

// 获取两线业务
export function getBusiness(query) {
  return request({
    url: '/cqt/line-bussiness/get',
    method: 'post',
    params: query
  })
}
// 获取两线业务列表
export function getBusinessList(query) {
  return request({
    url: '/cqt/line-bussiness/page',
    method: 'post',
    params: query
  })
}
// 创建两线业务
export function createBusiness(query) {
  return request({
    url: '/cqt/line-bussiness/create',
    method: 'post',
    data: query
  })
}
// 更新两线业务
export function updateBusiness(query) {
  return request({
    url: '/cqt/line-bussiness/update',
    method: 'post',
    data: query
  })
}
// 删除两线业务
export function deleteBusiness(query) {
  return request({
    url: '/cqt/line-bussiness/delete',
    method: 'post',
    params: query
  })
}
// 导出两线业务
export function  exportBusinessExcel(query) {
  return request({
    url: '/cqt/line-bussiness/export-excel',
    method: 'post',
    params: query
  })
}
// 查询url
export function  queryTemplate(query) {
  return request({
    url: '/cqt/sys-dictionary/queryTemplate',
    method: 'post',
    data: query
  })
}
// 上传模板
export function  saveTemplate(query) {
  return request({
    url: '/cqt/sys-dictionary/saveTemplate',
    method: 'post',
    data: query
  })
}
// 查询项目信息
export function  queryProject(query) {
  return request({
    url: '/cqt/project/query-by-project-name',
    method: 'post',
    params: query
  })
}



