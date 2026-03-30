import request from '@/utils/request'

/* ---X侧平台信息--- */

// 更新X侧平台状态信息
export function updatePlatform(query) {
  return request({
    url: '/cqt/x-platform/update',
    method: 'post',
    data: query
  })
}

// 获得X侧平台状态信息分页
export function getPlatformList(query) {
  return request({
    url: '/cqt/x-platform/page',
    method: 'post',
    data: query
  })
}
// 获得X侧平台状态信息
export function getPlatform(query) {
  return request({
    url: '/cqt/x-platform/get',
    method: 'post',
    data: query
  })
}

// 导出X侧平台状态信息 Excel
export function exportPlatform(query) {
  return request({
    url: '/cqt/x-platform/export-excel',
    method: 'post',
    data: query
  })
}

// 删除X侧平台状态信息
export function  deletePlatform(query) {
  return request({
    url: '/cqt/x-platform/delete',
    method: 'post',
    data: query
  })
}

// 创建X侧平台状态信息
export function  createPlatform(query) {
  return request({
    url: '/cqt/x-platform/create',
    method: 'post',
    data: query
  })
}


/* ----X侧平台信息结束---- */

/* ---X侧监控系统管理--- */
// 获取X侧平台

export function  queryAllPlatFormInfo(query) {
  return request({
    url: '/cqt/x-platform/query-all',
    method: 'post',
    data: query
  })
}
// 获取X侧监控系统列表
export function  getPlatformSystemPage(query) {
  return request({
    url: '/cqt/project-platform-system/page',
    method: 'post',
    data: query
  })
}


// 更新项目系统信息
export function  updatePlatformSystem(query) {
  return request({
    url: '/cqt/project-platform-system/update',
    method: 'post',
    data: query
  })
}
// 获取客户和项目的级联关系树
export function  queryCustInfoAndProjectInfo() {
  return request({
    url: '/cqt/project-platform-system/query-customer-project-tree',
    method: 'post'
  })
}


// 获得项目系统信息
export function  getPlatformSystem(query) {
  return request({
    url: '/cqt/project-platform-system/get',
    method: 'post',
    data: query
  })
}

// 导出项目系统信息
export function  exportPlatformSystem(query) {
  return request({
    url: '/cqt/project-platform-system/export-excel',
    method: 'post',
    data: query
  })
}

// 删除项目系统信息
export function  deletePlatformSystem(query) {
  return request({
    url: '/cqt/project-platform-system/delete',
    method: 'post',
    data: query
  })
}

// 创建项目系统信息
export function  createPlatformSystem(query) {
  return request({
    url: '/cqt/project-platform-system/create',
    method: 'post',
    data: query
  })
}