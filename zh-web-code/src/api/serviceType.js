import request from '@/utils/request'

/* ---服务类别--- */

// 获得服务类别管理分页
export function getServiceTypePage(query) {
  return request({
    url: '/cqt/service-type-manage/page',
    method: 'post',
    data: query
  })
}

// 获得服务类别管理
export function getServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/get',
    method: 'post',
    data: query
  })
}

// 新增服务类别
export function  createServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/create',
    method: 'post',
    data: query
  })
}

// 修改服务类别
export function  updateServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/update',
    method: 'post',
    data: query
  })
}

// 删除服务类别
export function deleteServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/delete',
    method: 'post',
    data: query
  })
}


// 导出服务类别管理 Excel
export function exportServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/export-excel',
    method: 'post',
    data: query
  })
}
