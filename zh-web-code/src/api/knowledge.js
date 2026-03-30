import request from '@/utils/request'

export function getBaseKnowledge(query) {
  return request({
    url: '/cqt/knowledge-base/get',
    method: 'post',
    data: query
  })
}
// 查询知识库
export function getKnowledgePage(query) {
  return request({
    url: '/cqt/knowledge-base/page',
    method: 'post',
    data: query
  })
}

// 删除知识库
export function deleteKnowledge(query) {
  return request({
    url: '/cqt/knowledge-base/delete',
    method: 'post',
    data: query
  })
}

// 新增知识库
export function  addKnowledge(query) {
  return request({
    url: '/cqt/knowledge-base/create',
    method: 'post',
    data: query
  })
}

// 更新知识库
export function  updateKnowledge(query) {
  return request({
    url: '/cqt/knowledge-base/update',
    method: 'post',
    data: query
  })
}

