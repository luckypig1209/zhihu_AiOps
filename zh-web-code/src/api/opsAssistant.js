import axios from 'axios'
import request from '@/utils/request'

// ==================== VictoriaMetrics 接口 ====================

const vmClient = axios.create({
  baseURL: '/vm-api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

/**
 * VictoriaMetrics 即时查询
 * @param {string} promql - PromQL 查询表达式
 * @param {number} time - 查询时间点（Unix 时间戳，可选）
 */
export function vmQueryInstant(promql, time) {
  const params = { query: promql }
  if (time) params.time = time
  return vmClient.get('/api/v1/query', { params })
}

/**
 * VictoriaMetrics 范围查询
 * @param {string} promql - PromQL 查询表达式
 * @param {number} start - 起始时间（Unix 时间戳）
 * @param {number} end - 结束时间（Unix 时间戳）
 * @param {string} step - 步长（如 '60s', '5m'）
 */
export function vmQueryRange(promql, start, end, step) {
  return vmClient.get('/api/v1/query_range', {
    params: { query: promql, start, end, step }
  })
}

/**
 * VictoriaMetrics 标签值查询
 * @param {string} label - 标签名
 */
export function vmLabelValues(label) {
  return vmClient.get(`/api/v1/label/${label}/values`)
}

// ==================== Zabbix 接口 ====================

const zabbixClient = axios.create({
  baseURL: '/zabbix-api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json-rpc' }
})

let zabbixAuthToken = null

/**
 * Zabbix JSON-RPC 调用
 */
function zabbixRpc(method, params = {}) {
  return zabbixClient.post('/api_jsonrpc.php', {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
    auth: zabbixAuthToken
  }).then(res => {
    if (res.data.error) {
      throw new Error(res.data.error.data || res.data.error.message)
    }
    return res.data.result
  })
}

/**
 * Zabbix 登录获取 token
 */
export async function zabbixLogin() {
  const res = await zabbixClient.post('/api_jsonrpc.php', {
    jsonrpc: '2.0',
    method: 'user.login',
    params: { user: 'Admin', password: 'Z^zhihuM468' },
    id: 1,
    auth: null
  })
  if (res.data.error) {
    throw new Error('Zabbix 登录失败: ' + (res.data.error.data || res.data.error.message))
  }
  zabbixAuthToken = res.data.result
  return zabbixAuthToken
}

/**
 * 确保 Zabbix 已登录
 */
async function ensureZabbixAuth() {
  if (!zabbixAuthToken) {
    await zabbixLogin()
  }
  return zabbixAuthToken
}

/**
 * 带自动重登录的 Zabbix RPC 调用
 */
async function zabbixRpcWithAuth(method, params = {}) {
  await ensureZabbixAuth()
  try {
    return await zabbixRpc(method, params)
  } catch (e) {
    // token 过期，重新登录后重试
    if (e.message && e.message.includes('Not authorized')) {
      zabbixAuthToken = null
      await ensureZabbixAuth()
      return await zabbixRpc(method, params)
    }
    throw e
  }
}

/**
 * 查询 Zabbix 主机列表
 * @param {object} filter - 过滤条件
 */
export async function getZabbixHosts(filter = {}) {
  return zabbixRpcWithAuth('host.get', {
    output: ['hostid', 'host', 'name', 'status', 'available', 'description'],
    selectInterfaces: ['ip', 'dns', 'port', 'type'],
    selectGroups: ['groupid', 'name'],
    filter,
    limit: 100
  })
}

/**
 * 按关键字搜索 Zabbix 主机
 * @param {string} keyword - 搜索关键字
 */
export async function searchZabbixHosts(keyword) {
  return zabbixRpcWithAuth('host.get', {
    output: ['hostid', 'host', 'name', 'status', 'available'],
    selectInterfaces: ['ip', 'dns'],
    selectGroups: ['groupid', 'name'],
    search: { name: keyword, host: keyword },
    searchWildcardsEnabled: true,
    searchByAny: true,
    limit: 50
  })
}

/**
 * 按 IP 查询 Zabbix 主机
 * @param {string} ip - IP 地址
 */
export async function getZabbixHostByIp(ip) {
  return zabbixRpcWithAuth('host.get', {
    output: ['hostid', 'host', 'name', 'status', 'available', 'description'],
    selectInterfaces: ['ip', 'dns', 'port', 'type'],
    selectGroups: ['groupid', 'name'],
    filter: { 'interface.ip': ip }
  })
}

/**
 * 查询 Zabbix 主机组
 */
export async function getZabbixHostGroups() {
  return zabbixRpcWithAuth('hostgroup.get', {
    output: ['groupid', 'name'],
    selectHosts: 'count'
  })
}

/**
 * 查询 Zabbix 当前问题/告警
 */
export async function getZabbixProblems() {
  return zabbixRpcWithAuth('problem.get', {
    output: ['eventid', 'objectid', 'name', 'severity', 'clock', 'r_eventid'],
    selectTags: ['tag', 'value'],
    recent: true,
    sortfield: ['eventid'],
    sortorder: 'DESC',
    limit: 50
  })
}

/**
 * 按组名查询主机数量
 * @param {string} groupName - 组名关键字
 */
export async function getZabbixHostCountByGroup(groupName) {
  const groups = await zabbixRpcWithAuth('hostgroup.get', {
    output: ['groupid', 'name'],
    search: { name: groupName },
    searchWildcardsEnabled: true
  })
  if (groups.length === 0) return { groups: [], totalHosts: 0 }

  const groupIds = groups.map(g => g.groupid)
  const hosts = await zabbixRpcWithAuth('host.get', {
    output: ['hostid', 'host', 'name'],
    groupids: groupIds,
    selectGroups: ['name']
  })
  return { groups, totalHosts: hosts.length, hosts }
}

// ==================== AI 聊天接口（复用现有） ====================

export function sendAiChatMessage(data) {
  return request({
    url: '/api/v1/ai/chat',
    method: 'post',
    data,
    timeout: 300000
  })
}
