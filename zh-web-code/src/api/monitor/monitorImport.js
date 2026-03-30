import request from '@/utils/request'
// 新增监控模版
export function createTemplate(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/create',
    method: 'post',
    data:data
  })
}

// 修改监控模版
export function updateTemplate(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/update',
    method: 'post',
    data:data
  })
}

// 删除监控模版
export function deleteTemplate(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/delete/' + data.id,
    method: 'get',
  })
}

// 设置默认模版
export function setTemplate(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/setUsed/' + data.id,
    method: 'get',
  })
}

// 下载模版
export function downloadTemplateXml(id) {
  return request({
    url: `/zhihu/monitor/importCoreTemplate/download/${id}`,
    method: 'get',
    responseType: 'blob', // 必须设置为blob才能正确下载二进制文件
    headers: {
      'Accept': 'application/xml, text/xml, */*'
    }
  });
}

// 分页查询模版明细列表
export function getTemplateList(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/page',
    method: 'post',
    data:data
  })
}

// 分页查询监控导入列表
export function getGeneralPageList(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/general-page',
    method: 'post',
    data:data
  })
}

// 批量删除
export function batchdeleteTemplate(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/batchDelete/' + data.id,
    method: 'get',
  })
}

// 根据模版获取关联的资产列表
export function getAssetList(data) {
  return request({
    url:  '/zhihu/monitor/importCoreTemplate/assetList/' + data.id,
    method: 'get',
  })
}

