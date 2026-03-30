import request from '@/utils/request'

// 更新合作方信息
export function updatePartner(query) {
  return request({
    url: '/cqt/project-partner/update',
    method: 'post',
    data: query
  })
}
// 查询合作方信息分页
export function getPartnerPage(query) {
  return request({
    url: '/cqt/project-partner/select-all',
    method: 'post',
    params: query
  })
}

// 删除合作方信息
export function deletePartner(query) {
  return request({
    url: '/cqt/project-partner/delete',
    method: 'post',
    params: query
  })
}

// 新增合作方信息
export function  createPartner(query) {
  return request({
    url: '/cqt/project-partner/create',
    method: 'post',
    data: query
  })
}

// 校验合作方信息
export function  checkPartner(query) {
  return request({
    url: '/cqt/project-partner/check',
    method: 'post',
    params: query
  })
}

