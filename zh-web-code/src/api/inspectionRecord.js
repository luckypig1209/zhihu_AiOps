import request from '@/utils/request'

//巡检记录列表
export function getInspectionList(data) {
  return request({
    url: '/zhihu/inspection-record/page',
    method: 'post',  
    data: data
  })
}
//删除巡检记录
export function deleteInspection(id) {
  return request({
    url: '/zhihu/inspection-record/delete/' + id,
    method: 'get',  
  })
}
// 巡检项统计 正常、异常、未知
export function getInspectionAssetStatistics(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/asset-statistics', data),
    method: 'post',  
  })
}
// 异常级别统计
export function getInspectionErrorLevel(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/error-level', data),
    method: 'post',  
  })
}
// 资源统计 资源正常、异常
export function getInspectionIndicatorGeneral(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/indicator-general', data),
    method: 'post',  
  })
}
// 巡检指标异常率Top5
export function getInspectionIndicatorTop(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/indicator-exception-rate-top5', data),
    method: 'post',  
  })
}
// 资源异常率Top5
export function getInspectionResourceTop(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/resource-exception-rate-top5', data),
    method: 'post',  
  })
}

// 巡检明细
export function getLogList(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/logList', data),
    method: 'post',  
  })
}

// 按照模块展示各个资源模型的巡检明细
export function getAssetModelList(data) {
  return request({
    url: buildUrlWithParams('/zhihu/inspection-result/assetModel-static', data),
    method: 'post',  
  })
}
function buildUrlWithParams(baseUrl, data) {
    // 如果没有数据，直接返回基础URL
    if (!data) return baseUrl;
    
    // 收集所有查询参数
    const params = [];
    for (const key in data) {
        // 只处理对象自身的属性
        if (data.hasOwnProperty(key)) {
            // 获取值，如为undefined或null则使用空字符串
            const value = data[key] ?? '';
            // 编码参数值并添加到数组
            params.push(`${key}=${encodeURIComponent(value)}`);
        }
    }
    
    // 如果有参数，拼接URL
    return params.length > 0 
        ? `${baseUrl}?${params.join('&')}` 
        : baseUrl;
}