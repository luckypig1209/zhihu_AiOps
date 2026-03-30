import request from '@/utils/request'

// 获取用户和项目部门关系分页
export function getProjectDeptUserList(query) {
  return request({
    url: '/cqt/project-permission/get-by-user',
    method: 'post',
    data: query
  })
}
// 删除用户和项目部门关系
export function  deleteProjectDeptUser(query) {
  return request({
    url: '/cqt/project-permission/delete',
    method: 'post',
    data: query
  })
}
// 创建用户和项目部门关系
export function  createProjectDeptUser(query) {
  return request({
    url: '/cqt/project-permission/create',
    method: 'post',
    data: query
  })
}

// 获取项目列表
export function  queryProjectByLogin(query) {
  return request({
    url: '/cqt/project/query-by-user',
    method: 'post',
    data: query
  })
}
// 获取项目管理中的项目列表
export function  queryProjectBinded(query) {
  return request({
    url: '/cqt/project/query-by-user-except-binded',
    method: 'post',
    data: query
  })
}