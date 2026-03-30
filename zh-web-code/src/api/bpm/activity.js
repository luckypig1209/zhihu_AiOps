import request from '@/utils/request'

export function getActivityList(query) {
  return request({
    url: '/bpm/activity/list',
    method: 'get',
    params: query
  })
}
export function exportDataAPI(id) {
  return request({
    url: `/bpm/process-instance/exportTableData?id=${id}`,
    method: 'get',
    responseType: 'blob'
  })
}
