// AI服务模拟器 - 用于开发和测试
// 在实际部署时，这些接口会被真实的后端AI服务替换

// 模拟AI响应数据
const mockResponses = [
  "您好！我是AI助手，很高兴为您服务。",
  "我理解您的问题，让我为您分析一下...",
  "根据您提供的信息，我建议您可以尝试以下解决方案：",
  "这是一个很好的问题！让我为您详细解释一下。",
  "我注意到您可能遇到了系统相关的问题，让我帮您排查一下。",
  "基于我的分析，这个问题可能有以下几种原因：",
  "我建议您按照以下步骤进行操作：",
  "如果您需要更详细的帮助，请提供更多相关信息。"
]

// 模拟AI响应延迟
const mockDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟AI对话接口
export const mockAiChat = async (message, history = []) => {
  // 模拟网络延迟
  await mockDelay(1000 + Math.random() * 2000)
  
  // 根据用户消息内容生成不同的响应
  let response = ""
  
  if (message.includes("你好") || message.includes("您好")) {
    response = "您好！我是您的AI助手，有什么可以帮助您的吗？"
  } else if (message.includes("系统") || message.includes("故障")) {
    response = "关于系统问题，我建议您：\n1. 检查系统日志\n2. 重启相关服务\n3. 联系技术支持\n\n需要我帮您详细分析某个具体问题吗？"
  } else if (message.includes("性能") || message.includes("优化")) {
    response = "系统性能优化建议：\n1. 清理缓存和临时文件\n2. 检查资源使用情况\n3. 优化数据库查询\n4. 升级硬件配置\n\n您想了解哪个方面的优化方案？"
  } else if (message.includes("配置") || message.includes("设置")) {
    response = "系统配置相关的问题，我可以帮您：\n1. 查看当前配置\n2. 修改系统参数\n3. 备份配置信息\n4. 恢复默认设置\n\n请告诉我您需要配置什么？"
  } else if (message.includes("安全") || message.includes("权限")) {
    response = "安全相关建议：\n1. 定期更新密码\n2. 检查用户权限\n3. 监控异常登录\n4. 备份重要数据\n\n您遇到了什么安全问题？"
  } else {
    // 随机选择一个通用响应
    response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
  }
  
  return {
    success: true,
    data: {
      content: response,
      timestamp: new Date().getTime(),
      sessionId: `session_${Date.now()}`,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }
}

// 模拟AI状态检查
export const mockAiStatus = async () => {
  await mockDelay(500)
  
  return {
    success: true,
    data: {
      status: 'online',
      model: 'gpt-3.5-turbo',
      version: '1.0.0',
      uptime: Date.now() - Math.random() * 86400000, // 随机运行时间
      requests: Math.floor(Math.random() * 1000) // 随机请求数
    }
  }
}

// 模拟获取AI模型列表
export const mockGetModels = async () => {
  await mockDelay(800)
  
  return {
    success: true,
    data: [
      { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: '快速响应，适合日常对话' },
      { id: 'gpt-4', name: 'GPT-4', description: '更强大的推理能力，适合复杂任务' },
      { id: 'claude', name: 'Claude', description: '擅长分析和总结' }
    ]
  }
}

// 模拟AI配置
export const mockAiConfig = async () => {
  await mockDelay(600)
  
  return {
    success: true,
    data: {
      model: 'gpt-3.5',
      style: 'friendly',
      speed: 3,
      maxTokens: 2000,
      temperature: 0.7,
      enableHistory: true,
      maxHistory: 10
    }
  }
}

// 模拟保存AI配置
export const mockSaveConfig = async (config) => {
  await mockDelay(1000)
  
  console.log('保存AI配置:', config)
  
  return {
    success: true,
    data: {
      message: '配置保存成功',
      config: config
    }
  }
}

// 模拟错误响应
export const mockError = async (message = '服务暂时不可用') => {
  await mockDelay(500)
  
  return {
    success: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: message,
      timestamp: new Date().getTime()
    }
  }
}
