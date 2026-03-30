import request from '@/utils/request'

// 查询文档信息
export function selectDocument(query) {
  return request({
    url: '/cqt/document/select',
    method: 'post',
    data: query
  })
}
// 查询下拉框
export function  selectDropList(query) {
  return request({
    url: '/cqt/document/selectDropList',
    method: 'post',
    params: query
  })
}
// 查询文档所有类型
export function  selectAllTypeList() {
  return request({
    url: '/cqt/document/select-all-types',
    method: 'post'
  })
}

// 删除项目文档
export function  deleteDocument(query) {
  return request({
    url: '/cqt/document/delete',
    method: 'post',
    params: query
  })
}
// 新增项目文档
export function  createDocument(query) {
  return request({
    url: '/cqt/document/create',
    method: 'post',
    data: query
  })
}

// 查询后向合同信息
export function  selectBackwardDocument(query) {
  return request({
    url: '/cqt/document/select-backward-document',
    method: 'post',
    params: query
  })
}
