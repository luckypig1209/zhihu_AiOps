import request from '@/utils/request'

// 资产发现 分页查询
export function getScanTaskList(data) {
  return request({
    url: '/cmdb/scan-task/page',
    method: 'post',  
    data: data
  })
}
//创建资产发现接口
export function createScanTask(data) {
  return request({
    url: '/cmdb/scan-task/create',
    method: 'post',  
    data: data
  })
}

//编辑资产发现接口
export function updateScanTask(data) {
  return request({
    url: '/cmdb/scan-task/update',
    method: 'post',  
    data: data
  })
}

//删除资产发现接口
export function deleteScanTask(data) {
  return request({
    url: '/cmdb/scan-task/delete',
    method: 'post',  
    data: data
  })
}

//重启资产发现任务
export function restartScanTask(data) {
  return request({
    url: '/cmdb/scan-task/restart',
    method: 'post',  
    data: data
  })
}

//获取视频地址
export function getPlayUrl(data) {
  return request({
    url: '/monitor/video/stream/get-play-url',
    method: 'post',  
    data: data
  })
}

// 结果列表
export function getRecordList(data) {
  return request({
    url: '/cmdb/scan-record/page',
    method: 'post',  
    data: data
  })
}

// 资产列表
export function getRecordAssetList(data) {
  return request({
    url: '/cmdb/scan-record/asset/page',
    method: 'post',  
    data: data
  })
}

// 查询ip地址使用接口
export function getIpUse(data) {
  return request({
    url: '/cmdb/scan-record/asset/ip-usage',
    method: 'post',  
    data: data
  })
}

// 导出资产
export function exportAsset(data) {
  return request({
    url: '/cmdb/scan-record/asset/export',
    method: 'post',  
    data: data,
    responseType: "blob",
  })
  }
