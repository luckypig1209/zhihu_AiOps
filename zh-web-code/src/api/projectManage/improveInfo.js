import request from '@/utils/request'

// 项目办结
export function completeProject(data) {
  return request({
    url: '/cqt/project/project-completion?id=' + data.id,
    method: 'post'
  })
}
// 获取客户名称
export function getCustomerNameByLoginProject() {
  return request({
    url: '/cqt/customer-info/query-customer-name-by-user',
    method: 'post'
  })
}

// 获取项目名称
export function queryProjectNameByLogin(query) {
  return request({
    url: '/cqt/project/query-project-names-by-user',
    method: 'post',
    data: query
  })
}
// 获取项目基本信息
export function getBaseInfo(query) {
  return request({
    url: '/cqt/project/get',
    method: 'get',
    params: query
  })
}
// 获取项目运维团队信息
export function getOmTeamInfoByProject(query) {
  return request({
    url: '/cqt/om-team-info/query-by-project-id',
    method: 'get',
    params: query
  })
}
// 获取客户信息
export function getCustomerInfoByProject(query) {
  return request({
    url: '/cqt/customer-info/query-by-project-id',
    method: 'get',
    params: query
  })
}
// 获取后向合同
export function getBackwardContractInfoByProject(query) {
  return request({
    url: '/cqt/backward-contract/getBackwardContractInfoByProject',
    method: 'get',
    params: query
  })
}
// 获取项目干系人维护
export function getProjectStakeholderByProject(query) {
  return request({
    url: '/cqt/project-stakeholder/getProjectStakeholderByProject',
    method: 'get',
    params: query
  })
}

// 新增项目
export function createProject(data) {
  return request({
    url: '/cqt/project/create',
    method: 'post',
    data: data
  })
}
// 修改项目
export function editProject(data) {
  return request({
    url: '/cqt/project/update',
    method: 'post',
    data: data
  })
}
// 项目详情
export function detailProject(data) {
  return request({
    url: '/cqt/project/detail?id=' + data.id,
    method: 'post'
  })
}

//创建项目派单策略
export function createStrategy(data) {
  return request({
    url: '/cqt/project-dispatch-strategy/create',
    method: 'post',
    data: data
  })
}

//修改项目派单策略
export function updateStrategy(data) {
  return request({
    url: '/cqt/project-dispatch-strategy/update',
    method: 'post',
    data: data
  })
}
//获取项目派单策略详情
export function getStrategy(data) {
  return request({
    url: '/cqt/project-dispatch-strategy/get',
    method: 'post',
    params: data
  })
}
// 导入失败下载
export function resourceImportError(data) {
  return request({
    url: '/cqt/project/export-excel',
    method: 'post',
    params: data,
    responseType: 'blob'
  })
}
// 删除合作伙伴
export function deletePartner(data) {
  return request({
    url: '/cqt/project-partner/delete',
    method: 'post',
    params: data
  })
}
// 删除合作方信息
export function deletePartnerProject(query) {
  return request({
    url: '/cqt/partner-project-rel/delete',
    method: 'post',
    data: query
  })
}

// 删除后向合同
export function deleteContract(data) {
  return request({
    url: '/cqt/backward-contract/delete',
    method: 'post',
    params: data
  })
}
// 获取合作方列表
export function getPartners() {
  return request({
    url: '/cqt/project-partner/query-names-by-project',
    method: 'post'
  })
}
// 删除子项目
export function deleteProject(data) {
  return request({
    url: '/cqt/devops-project-sub/delete',
    method: 'post',
    data: data
  })
}
// 查询合作方
export function getPartnersName(data) {
  return request({
    url: '/cqt/project-partner/query-list-by-name?name=' + data.name,
    method: 'post'
  })
}

// 查询合作方
export function projectFileDelete(data) {
  return request({
    url: `/cqt/project/file-delete?id=${data}`,
    method: 'post',
  })
}
// 获取项目干系人维护
export function recoverOrderApi(id) {
  return request({
    url: '/cqt/alarms/recover?id=' + id,
    method: 'get',
  })
}

// 批量恢复
export function batchRecoverOrderApi(data) {
  return request({
    url: '/cqt/alarms/batchRecover',
    method: 'post',
    data
  })
}
// 批量派单
export function batchCreateProcess(data) {
  return request({
    url: '/cqt/alarms/batch-create-process-instance',
    method: 'post',
    data: data
  })
}
