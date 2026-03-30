import request from '@/utils/request'
// 查询url
export function  deleteFile(query) {
  return request({
    url: '/system/file/delete',
    method: 'post',
    params: query
  })
}
export function  downLoadFile(query) {
  return request({
    url: `system/file/${query.configId}/get/` ,
    method: 'post',
    params: query
  })
}
export const downLoadFile2 = url => {
  return request({
    url: `/system/file${url}`,
    method: 'get',
    responseType: 'blob',
  })
}
