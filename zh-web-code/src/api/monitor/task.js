import request from '@/utils/request'

//指标列表
export function getMonitorList(data) {
  return request({
    url: '/zhihu/monitor/monitor-item-list?id=' + data.id,
    method: 'post',
    data: data
  })
}

//指标详情
export function getMonitorDetail(id, itemId, startTime, endTime, type) {
  return request({
    url:`/zhihu/monitor/monitor-item-history`,
    method: 'post',
    data:{
      id: id,
      itemId: itemId,
      startTime: startTime,
      endTime: endTime,
      type: type
    }
  })
}
export function getAlarmHistory(data) {
  return request({
    url:`/cqt/alarms/page `,
    method: 'post',
    data:data
  })
}
 //下发
 export function issue(data) {
  return request({
    url:`/zhihu/snmp/create `,
    method: 'post',
    data:data
  })
}
//告警规则
export function getRuleList(data) {
  return request({
    url:`/zhihu/monitor/monitor-rule-list?id=${data?.id || ''}&pageNo=${data?.pageNo || ''}&pageSize=${data?.pageSize || ''}&status=${data?.status || ''}&description=${data?.description || ''}&priority=${data?.priority || ''} `,
    method: 'post',
  })
}

//告警规则启用禁用
export function updateRuleStatus(data) {
  return request({
    url:  buildUrlWithParams('/zhihu/monitor/updateRuleStatus', data),
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

//测试连接
export function testSnmp(data) {
  return request({
    url: '/zhihu/snmp/testConnect',
    method: 'post',
    data: data
  })
}

//测试PING连接
export function testPing(data) {
  return request({
    url: '/zhihu/ping/testConnect',
    method: 'post',
    data: data
  })
}
//告警规则批量启用禁用
export function batchUpdateRuleStatus(data) {
  return request({
    url:  '/zhihu/monitor/batchUpdateRuleStatus',
    method: 'post',
    data:data
  })
}

//告警恢复
export function recoverApi(data) {
  return request({
    url:  '/cqt/alarms/recover',
    method: 'post',
    data: data
  })
}

//消息规则列表页
export function messageList(data) {
  return request({
    url:  '/zhihu/alarm-rule/page',
    method: 'post',
    data: data
  })
}
//消息规则创建与编辑
export function updateMessage(data) {
  return request({
    url:  '/zhihu/alarm-rule/save',
    method: 'post',
    data: data
  })
}
//消息规则删除
export function deleteMessage(data) {
  return request({
    url:  buildUrlWithParams('/zhihu/alarm-rule/delete', data),
    method: 'post',
  })
}

//规则详情
export function getRuleDetail(data) {
  return request({
    url:  buildUrlWithParams('/zhihu/alarm-rule/getRule', data),
    method: 'post',
    data: data
  })
}
//厂家以及型号
export function getSpuGroupByBrand(data) {
  return request({
    url:  buildUrlWithParams('/cqt/asset-info/getSpuGroupByBrand', data),
    method: 'post',
  })
}

 //保存用户浏览监控指标历史
 export function saveUserCache(data) {
  return request({
    url:`/zhihu/monitor/saveUserCache `,
    method: 'post',
    data:data
  })
}

//查询用户浏览监控指标历史
 export function getUserCache(data) {
  return request({
    url:`/zhihu/monitor/getUserCache?assetId=` + data.assetId,
    method: 'post',
  })
}

 //保存用户默认指标
 export function saveDefaultUserCache(data) {
  return request({
    url:`/zhihu/monitor/default/saveUserCache`,
    method: 'post',
    data:data
  })
}

//查询用户默认指标
 export function getDefaultUserCache(data) {
  return request({
    url:`/zhihu/monitor/default/getUserCache?assetId=` + data.assetId,
    method: 'post',
  })
}
// 保存用户配置
export function saveUserConfig(data) {
  return request({
    url:`/zhihu/monitor/save-user-config `,
    method: 'post',
    data:data
  })
}

// 获取用户配置接口文档
export function getUserConfig(assetId) {
  return request({
    url:`/zhihu/monitor/get-user-config?assetId=` + assetId,
    method: 'post',
  })
}