import request from '@/utils/request'
// 遗留问题列表
export function problemList(data) {
  return request({
    url: '/cqt/project-issue/page',
    method: 'post',
    data: data
  })
}
// 遗留问题列表
export function documentList(data) {
  return request({
    url: '/cqt/document/select',
    method: 'post',
    data: data
  })
}
// 遗留问题列表
export function customerList(data) {
  return request({
    url: '/cqt/customer-info/query-all-by-user',
    method: 'post',
    data: data
  })
}
// 干系人维护列表
export function stakeholderList(data) {
  return request({
    url: '/cqt/project-stakeholder/page',
    method: 'post',
    data: data
  })
}
// 干系人维护删除
export function stakeholderDelete(data) {
  return request({
    url: `/cqt/project-stakeholder/delete?id=${data}`,
    method: 'post',
    data: data
  })
}
// 干系人维护修改
export function stakeholderUpdate(data) {
  return request({
    url: '/cqt/project-stakeholder/update',
    method: 'post',
    data: data
  })
}
// 干系人维护新增
export function stakeholderAdd(data) {
  return request({
    url: '/cqt/project-stakeholder/create',
    method: 'post',
    data: data
  })
}
// crm订单列表
export function queryCrmList(data) {
  return request({
    url: '/cqt/project-busi-crm/page',
    method: 'post',
    data: data
  })
}
// crm订单列表
export function queryNoCrmList(data) {
  return request({
    url: '/cqt/project-busi-nocrm/page',
    method: 'post',
    data: data
  })
}
// 非crm订单新增
export function noCrmCreate(data) {
  return request({
    url: '/cqt/project-busi-nocrm/create',
    method: 'post',
    data: data
  })
}
// crm订单新增
export function crmCreate(data) {
  return request({
    url: '/cqt/project-busi-crm/create',
    method: 'post',
    data: data
  })
}
// crm订单修改
export function crmUpdate(data) {
  return request({
    url: '/cqt/project-busi-crm/update',
    method: 'post',
    data: data
  })
}
// 非crm订单修改
export function noCrmUpdate(data) {
  return request({
    url: '/cqt/project-busi-nocrm/create',
    method: 'post',
    data: data
  })
}
// 非crm订单删除
export function noCrmDelete(data) {
  return request({
    url: `/cqt/project-busi-nocrm/delete?id=${data}`,
    method: 'post',
  })
}
// crm订单删除
export function CrmDelete(data) {
  return request({
    url: `/cqt/project-busi-crm/delete?id=${data}`,
    method: 'post',
  })
}
// 预警列表
export function opportunityList(data) {
  return request({
    url: '/cqt/business-opportunity-service/page',
    method: 'post',
    data: data
  })
}
// 线索录入
export function opportunityCreate(data) {
  return request({
    url: '/cqt/business-opportunity-service/create',
    method: 'post',
    data: data
  })
}
// 线索录入删除
export function opportunityDelete(data) {
  return request({
    url: `/cqt/business-opportunity-service/delete?id=${data}`,
    method: 'post',
    data: data
  })
}
// 线索录入更新
export function opportunityUpdate(data) {
  return request({
    url: '/cqt/business-opportunity-service/update',
    method: 'post',
    data: data
  })
}
