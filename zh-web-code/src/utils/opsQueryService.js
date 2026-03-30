/**
 * 运维查询服务 - WebSocket 版本
 * 通过 WebSocket 连接到 Claude CLI 调用 skills
 */
import wsService from './websocketService'

// ==================== 意图识别 ====================

const intentPatterns = [
  {
    intent: 'metrics_cpu',
    patterns: [/cpu.*使用率/, /cpu.*usage/, /处理器.*使用/, /cpu.*负载/],
    skill: 'query-metrics'
  },
  {
    intent: 'metrics_memory',
    patterns: [/内存.*使用率/, /内存.*使用/, /memory.*usage/, /内存.*占用/],
    skill: 'query-metrics'
  },
  {
    intent: 'metrics_disk',
    patterns: [/磁盘.*使用/, /磁盘.*空间/, /disk.*usage/, /存储.*使用/],
    skill: 'query-metrics'
  },
  {
    intent: 'metrics_network',
    patterns: [/网络.*流量/, /带宽.*使用/, /网卡.*流量/, /network.*traffic/],
    skill: 'query-metrics'
  },
  {
    intent: 'zabbix_host_search',
    patterns: [/关键字.*查询.*监控/, /搜索.*监控.*对象/, /查找.*主机/, /关键字.*搜索/],
    skill: 'query-zabbix'
  },
  {
    intent: 'zabbix_host_by_ip',
    patterns: [/ip.*查询.*监控/, /通过.*ip.*查/, /ip地址.*查询/, /ip.*搜索/],
    skill: 'query-zabbix'
  },
  {
    intent: 'zabbix_os_count',
    patterns: [/操作系统.*监控.*对象/, /操作系统.*多少/, /os.*监控/, /linux.*监控|windows.*监控/],
    skill: 'query-zabbix'
  },
  {
    intent: 'zabbix_network_devices',
    patterns: [/网络设备/, /交换机/, /路由器/, /监控.*多少.*网络/],
    skill: 'query-zabbix'
  },
  {
    intent: 'zabbix_problems',
    patterns: [/告警/, /问题/, /故障/, /异常/, /alarm/, /problem/],
    skill: 'query-zabbix'
  },
  {
    intent: 'full_inspection',
    patterns: [/全面巡检/, /巡检/, /健康检查/, /全面检查/, /系统检查/],
    skill: 'full-inspection'
  }
]

/**
 * 识别用户意图
 * @param {string} input - 用户输入
 * @returns {{ intent: string, skill: string } | null}
 */
function recognizeIntent(input) {
  const text = input.toLowerCase()
  for (const item of intentPatterns) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        return item
      }
    }
  }
  return null
}

/**
 * 从输入中提取时间范围（小时数）
 */
function extractTimeRange(input) {
  const match = input.match(/(\d+)\s*(?:小时|h|hour)/)
  return match ? parseInt(match[1]) : 1 // 默认1小时
}

/**
 * 从输入中提取 IP 地址
 */
function extractIp(input) {
  const match = input.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
  return match ? match[1] : null
}

/**
 * 从输入中提取关键字
 */
function extractKeyword(input) {
  // 移除常见指令词，保留关键字
  const cleaned = input
    .replace(/通过|关键字|查询|搜索|查找|监控对象|监控|主机|设备/g, '')
    .trim()
  return cleaned || null
}

// ==================== WebSocket 查询 ====================

/**
 * 通过 WebSocket 发送查询（支持流式回调）
 * @param {string} query - 用户查询
 * @param {object} context - 上下文信息
 * @param {function} onChunk - 流式 chunk 回调 (chunk: string) => void
 * @returns {Promise<string>} 格式化的回复
 */
async function queryViaWebSocket(query, context = {}, onChunk = null) {
  try {
    if (!wsService.isConnected) {
      await waitForConnection(5000)
    }

    // 注册流式监听
    let streamHandler = null
    if (onChunk) {
      streamHandler = (data) => { onChunk(data.chunk) }
      wsService.on('stream_chunk', streamHandler)
    }

    // 发送查询
    const response = await wsService.query(query, {
      history: context.history || [],
      sessionId: context.sessionId,
      timestamp: Date.now()
    })

    // 移除监听
    if (streamHandler) {
      wsService.off('stream_chunk', streamHandler)
    }

    // 流式响应直接返回完整内容
    if (response.stream && response.content) {
      return response.content
    }

    return formatWebSocketResponse(response)
  } catch (error) {
    console.error('[OpsQuery] WebSocket query failed:', error)
    return handleOfflineQuery(query)
  }
}

/**
 * 等待 WebSocket 连接
 */
function waitForConnection(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (wsService.isConnected) {
      resolve()
      return
    }

    const timer = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'))
    }, timeout)

    const checkConnection = setInterval(() => {
      if (wsService.isConnected) {
        clearTimeout(timer)
        clearInterval(checkConnection)
        resolve()
      }
    }, 100)
  })
}

/**
 * 格式化 WebSocket 响应
 */
function formatWebSocketResponse(response) {
  if (!response.success) {
    return formatError('查询失败', new Error(response.error || 'Unknown error'))
  }

  const { skill, result } = response

  // 根据 skill 类型格式化结果
  switch (skill) {
    case 'query-metrics':
      return formatMetricsResult(result)
    case 'query-zabbix':
      return formatZabbixResult(result)
    case 'full-inspection':
      return formatInspectionResult(result)
    case 'claude-ai':
      return formatClaudeAIResult(result)
    default:
      return result.content || JSON.stringify(result, null, 2)
  }
}

/**
 * 格式化指标查询结果
 */
function formatMetricsResult(result) {
  if (result.type === 'error') {
    return formatError('指标查询失败', new Error(result.message))
  }

  const { promql, results } = result

  if (!results || results.length === 0) {
    return formatResponse('指标查询', [
      `**PromQL**: \`${promql || 'N/A'}\``,
      '',
      '未找到相关指标数据。',
      '',
      '可能原因：',
      '- VictoriaMetrics 中暂无该指标数据',
      '- 查询时间范围不正确',
      '- 指标名称不匹配'
    ])
  }

  const lines = [
    `**PromQL**: \`${promql}\``,
    ''
  ]

  results.forEach(r => {
    const value = typeof r.value === 'number' ? r.value.toFixed(2) : r.value
    lines.push(`- **${r.instance || 'localhost'}**: ${value}`)
  })

  return formatResponse('指标查询结果', lines)
}

/**
 * 格式化 Zabbix 查询结果
 */
function formatZabbixResult(result) {
  if (result.type === 'error') {
    return formatError('Zabbix 查询失败', new Error(result.message))
  }

  const { results } = result

  if (!results || results.length === 0) {
    return formatResponse('Zabbix 查询', ['未找到匹配的记录'])
  }

  // 根据数据类型格式化
  const lines = results.slice(0, 20).map(item => {
    if (typeof item === 'string') return `- ${item}`
    return `- **${item.name || item.host || 'Unknown'}**${item.ip ? ` (${item.ip})` : ''}`
  })

  if (results.length > 20) {
    lines.push(`\n... 还有 ${results.length - 20} 条记录`)
  }

  return formatResponse(`查询结果 (共 ${results.length} 条)`, lines)
}

/**
 * 格式化 Claude AI 查询结果
 */
function formatClaudeAIResult(result) {
  if (result.type === 'error') {
    return formatError('AI 查询失败', new Error(result.content))
  }

  const { content, apiCall, apiResult } = result

  // 如果没有 API 调用结果，直接返回 AI 的回复
  if (!apiResult) {
    return content || 'AI 未能执行查询'
  }

  // 检查 API 调用是否出错
  if (apiResult.error) {
    const lines = [
      '## AI 分析',
      '',
      content,
      '',
      '## API 调用失败',
      '',
      `**错误**: ${apiResult.error}`,
      '',
      '**请求参数**:',
      '```json',
      JSON.stringify(apiCall, null, 2),
      '```'
    ]
    return lines.join('\n')
  }

  // 格式化 API 结果
  const lines = [
    '## AI 分析',
    '',
    content,
    '',
    '## 查询结果',
    ''
  ]

  // 根据 API 类型格式化结果
  if (apiCall.api === 'victoriametrics' && apiResult.data) {
    const vmData = apiResult.data
    if (vmData.result && vmData.result.length > 0) {
      lines.push(`找到 **${vmData.result.length}** 条时间序列数据`, '')

      vmData.result.forEach((series, idx) => {
        const metric = series.metric || {}
        const instance = metric.instance || metric.host_ip || `实例${idx + 1}`

        lines.push(`### ${instance}`)

        if (series.values) {
          // 范围查询，显示统计信息
          const values = series.values.map(v => parseFloat(v[1]))
          const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          const max = Math.max(...values).toFixed(2)
          const min = Math.min(...values).toFixed(2)
          const latest = values[values.length - 1].toFixed(2)

          lines.push(`- **平均值**: ${avg}%`)
          lines.push(`- **最大值**: ${max}%`)
          lines.push(`- **最小值**: ${min}%`)
          lines.push(`- **最新值**: ${latest}%`)
          lines.push(`- **数据点**: ${values.length} 个`)
        } else if (series.value) {
          // 即时查询
          lines.push(`- **当前值**: ${parseFloat(series.value[1]).toFixed(2)}%`)
        }
        lines.push('')
      })
    } else {
      lines.push('⚠️ 未找到数据', '', '可能原因：')
      lines.push('- 该指标暂无数据')
      lines.push('- 时间范围不正确')
      lines.push('- 查询条件不匹配')
    }
  } else if (apiCall.api === 'zabbix' && apiResult.result) {
    const zabbixData = apiResult.result
    if (Array.isArray(zabbixData) && zabbixData.length > 0) {
      lines.push(`找到 **${zabbixData.length}** 条记录`, '')
      zabbixData.slice(0, 10).forEach(item => {
        lines.push(`- **${item.name || item.host || 'Unknown'}**`)
      })
      if (zabbixData.length > 10) {
        lines.push(`\n... 还有 ${zabbixData.length - 10} 条记录`)
      }
    } else {
      lines.push('未找到匹配的记录')
    }
  }

  return lines.join('\n')
}

/**
 * 格式化巡检结果
 */
function formatInspectionResult(result) {
  if (result.type === 'error') {
    return formatError('巡检失败', new Error(result.message))
  }

  // 如果已经有 report 字段，直接返回
  if (result.report) {
    return result.report
  }

  // 否则格式化输出
  const { sections, summary } = result

  if (sections && sections.length > 0) {
    const lines = ['# 全面巡检报告\n']

    sections.forEach(section => {
      const statusEmoji = section.status === 'ok' ? '✅' :
                          section.status === 'warning' ? '⚠️' : '❌'
      lines.push(`## ${statusEmoji} ${section.title}`)
      lines.push(section.data)
      lines.push('')
    })

    if (summary) {
      lines.push('## 汇总')
      lines.push(`- 严重: ${summary.critical || 0}`)
      lines.push(`- 警告: ${summary.warning || 0}`)
      lines.push(`- 正常: ${summary.ok || 0}`)
    }

    return lines.join('\n')
  }

  return formatResponse('全面巡检报告', [
    '巡检已完成',
    '',
    '**详细结果**:',
    '```json',
    JSON.stringify(result, null, 2),
    '```'
  ])
}

/**
 * 离线模式查询（WebSocket 不可用时使用）
 */
async function handleOfflineQuery(query) {
  console.log('[OpsQuery] Using offline mode')

  // 简单模拟响应
  return formatResponse('离线模式', [
    '当前 Claude CLI 未连接，使用离线模式。',
    '',
    '**注意**: 离线模式下无法获取实时数据。',
    '',
    '请检查：',
    '1. WebSocket Bridge Server 是否运行 (`npm run ws:server`)',
    '2. Claude CLI Connector 是否运行 (`npm run ws:claude`)',
    '',
    '您的查询：',
    `\`${query}\``
  ])
}

// ==================== 格式化工具 ====================

function formatResponse(title, lines, separator = '\n') {
  return `## ${title}\n\n${lines.join(separator)}`
}

function formatError(title, error) {
  return `## ${title}\n\n查询出现错误: ${error.message || error}\n\n请检查：\n1. Claude CLI 是否已连接\n2. WebSocket Bridge 是否正常运行`
}

// ==================== 主入口 ====================

/**
 * 处理用户消息，通过 WebSocket 调用 Claude CLI Skills
 * @param {string} input - 用户输入
 * @param {object} options - 额外选项
 * @returns {Promise<string>} 格式化的回复内容
 */
export async function processQuery(input, options = {}, onChunk = null) {
  const matched = recognizeIntent(input)

  if (matched) {
    console.log(`[OpsQuery] Detected intent: ${matched.intent}, skill: ${matched.skill}`)

    // 构建上下文
    const context = {
      intent: matched.intent,
      skill: matched.skill,
      timeRange: extractTimeRange(input),
      ip: extractIp(input),
      keyword: extractKeyword(input),
      sessionId: options.sessionId,
      history: options.history || []
    }

    // 通过 WebSocket 发送查询
    return await queryViaWebSocket(input, context, onChunk)
  }

  // 未匹配到特定意图，通过 WebSocket 发送通用查询
  console.log('[OpsQuery] No intent matched, sending general query')
  return await queryViaWebSocket(input, options, onChunk)
}

/**
 * 检查 WebSocket 连接状态
 */
export function isWebSocketConnected() {
  return wsService.isConnected
}

/**
 * 获取 WebSocket 服务实例（用于高级用法）
 */
export function getWebSocketService() {
  return wsService
}
