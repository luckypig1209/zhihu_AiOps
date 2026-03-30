import request from '@/utils/request'

// AI聊天接口
export function sendAiMessage(data) {
  return request({
    url: '/api/v1/ai/chat',
    method: 'post',
    data,
    timeout: 300000 // 5分钟超时，适应复杂AI查询
  })
}

// 测试AI模型连接
export function testAiModel(data) {
  return request({
    url: '/api/v1/ai/test',
    method: 'post',
    data,
    timeout: 120000 // 2分钟超时，适应模型测试
  })
}

// 获取模型列表
export function getAiModels() {
  return request({
    url: '/api/v1/ai/models',
    method: 'get',
    timeout: 10000 // 10秒超时，快速接口
  })
}

// 获取AI服务状态
export function getAiStatus() {
  return request({
    url: '/api/v1/ai/status',
    method: 'get',
    timeout: 10000 // 10秒超时，快速接口
  })
}

// 使用动态配置的模型进行对话
export function chatWithDynamicModel(data) {
  return request({
    url: '/api/v1/ai/chat/dynamic',
    method: 'post',
    data,
    timeout: 300000 // 5分钟超时，适应复杂AI查询和本地模型
  })
}

// 验证硅基流动API Key
export function verifySiliconflowApiKey(data) {
  return request({
    url: '/api/v1/ai/siliconflow/verify',
    method: 'post',
    data,
    timeout: 30000 // 30秒超时
  })
}

// 获取硅基流动模型列表
export function getSiliconflowModels(apiKey) {
  return request({
    url: '/api/v1/ai/siliconflow/models',
    method: 'get',
    params: { api_key: apiKey },
    timeout: 30000 // 30秒超时
  })
} 