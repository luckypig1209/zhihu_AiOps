import request from '@/utils/request'


//: 指标通用分页查询
export function generalPage(query) {
  return request({
    url: '/zhihu/indicator/general-page',
    method: 'post',
    data: query
  })
}
// 指标分页查询
export function indicatorPage(query) {
  return request({
    url: '/zhihu/indicator/page',
    method: 'post',
    data: query
  })
}

// 更新指标信息
export function indicatorUpdate(query) {
  return request({
    url: '/zhihu/indicator/update',
    method: 'post',
    data: query
  })
}


