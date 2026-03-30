import request from '@/utils/request'

// 删除文件
export function deleteFile(id) {
  return request({
    url: '/system/file/delete?id=' + id,
    method: 'post'
  })
}

// 获得文件分页
export function getFilePage(query) {
  return request({
    url: '/system/file/page',
    method: 'get',
    params: query
  })
}
