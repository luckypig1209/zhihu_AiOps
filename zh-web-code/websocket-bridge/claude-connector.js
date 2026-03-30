#!/usr/bin/env node
/**
 * Claude CLI WebSocket 连接器
 *
 * 功能：
 * 1. 连接 WebSocket Bridge Server
 * 2. 接收前端查询请求
 * 3. 调用 Claude CLI Skills 处理请求
 * 4. 返回结果给前端
 *
 * 使用方法：
 * node claude-connector.js
 */

const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const WS_URL = process.env.WS_URL || 'ws://localhost:9999';
const RECONNECT_INTERVAL = 5000; // 5秒重连

let ws = null;
let reconnectTimer = null;

// Claude CLI 技能映射
const SKILL_MAP = {
  // 指标查询 -> query-metrics skill
  'metrics': 'query-metrics',
  'cpu': 'query-metrics',
  'memory': 'query-metrics',
  'disk': 'query-metrics',
  'network': 'query-metrics',

  // Zabbix 查询 -> query-zabbix skill
  'zabbix': 'query-zabbix',
  'host': 'query-zabbix',
  '告警': 'query-zabbix',
  'alert': 'query-zabbix',

  // 全面巡检 -> full-inspection skill
  '巡检': 'full-inspection',
  'inspection': 'full-inspection',
  'health': 'full-inspection'
};

// 连接 WebSocket
function connect() {
  console.log(`[Claude Connector] Connecting to ${WS_URL}...`);

  ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('[Claude Connector] Connected to WebSocket Bridge');

    // 注册为 Claude CLI
    send({
      type: 'register',
      payload: { clientType: 'claude', version: '1.0.0' }
    });
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      await handleMessage(message);
    } catch (error) {
      console.error('[Claude Connector] Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('[Claude Connector] Disconnected, reconnecting...');
    scheduleReconnect();
  });

  ws.on('error', (error) => {
    console.error('[Claude Connector] WebSocket error:', error.message);
  });
}

// 处理消息
async function handleMessage(message) {
  const { type, id, payload } = message;

  console.log(`[Claude Connector] Received [${type}]:`, payload);

  if (type === 'query') {
    // 处理查询请求
    const response = await processQuery(payload);

    send({
      id,
      type: 'response',
      payload: response
    });
  }
}

// 处理查询 - 调用 Claude CLI Skills
async function processQuery(payload) {
  const { query, context = {} } = payload;

  console.log(`[Claude Connector] Processing query: "${query}"`);

  try {
    // 识别意图并选择 skill
    const skill = detectSkill(query);

    if (skill) {
      // 调用对应的 skill
      const result = await callClaudeSkill(skill, query, context);
      return {
        success: true,
        skill,
        query,
        result
      };
    } else {
      // 没有匹配的 skill，使用通用 AI 回复
      return {
        success: true,
        skill: 'ai-chat',
        query,
        result: {
          type: 'text',
          content: `收到查询: "${query}"\n\n我目前支持的查询类型包括:\n- 指标查询 (CPU、内存、磁盘、网络)\n- Zabbix 监控查询\n- 全面巡检\n\n请尝试使用更具体的问题，例如:\n- "查询 CPU 使用率"\n- "查看当前告警"\n- "执行全面巡检"`
        }
      };
    }
  } catch (error) {
    console.error('[Claude Connector] Query processing error:', error);
    return {
      success: false,
      query,
      error: error.message
    };
  }
}

// 检测应该使用哪个 skill
function detectSkill(query) {
  const lowerQuery = query.toLowerCase();

  // 检查关键词映射
  for (const [keyword, skill] of Object.entries(SKILL_MAP)) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      return skill;
    }
  }

  // 意图识别规则
  if (/cpu|内存|磁盘|网络|指标|metric|usage/i.test(lowerQuery)) {
    return 'query-metrics';
  }
  if (/zabbix|主机|host|告警|alert|problem/i.test(lowerQuery)) {
    return 'query-zabbix';
  }
  if (/巡检|检查|inspection|health|check/i.test(lowerQuery)) {
    return 'full-inspection';
  }

  return null;
}

// 调用 Claude CLI Skill
async function callClaudeSkill(skill, query, context) {
  console.log(`[Claude Connector] Calling skill [${skill}] for query: "${query}"`);

  // 构建调用 Claude Code 的命令
  // 注意：这里假设 Claude Code CLI 可以通过某种方式调用 skills
  // 实际实现可能需要通过 Claude API 或者调用本地 Claude Code 的 MCP server

  switch (skill) {
    case 'query-metrics':
      return await callMetricsSkill(query);
    case 'query-zabbix':
      return await callZabbixSkill(query);
    case 'full-inspection':
      return await callInspectionSkill();
    default:
      throw new Error(`Unknown skill: ${skill}`);
  }
}

// 调用指标查询 skill
async function callMetricsSkill(query) {
  // 构建 PromQL 查询
  const promql = buildPromQL(query);

  try {
    // 直接传递构建好的 promql，让技能脚本执行查询
    const result = await executeLocalQuery('metrics', { promql });
    // 技能脚本已经返回了完整结构，直接返回
    return result;
  } catch (error) {
    return {
      type: 'error',
      message: error.message
    };
  }
}

// 调用 Zabbix 查询 skill
async function callZabbixSkill(query) {
  try {
    const result = await executeLocalQuery('zabbix', { query });
    // 技能脚本已经返回了完整结构，直接返回
    return result;
  } catch (error) {
    return {
      type: 'error',
      message: error.message
    };
  }
}

// 调用全面巡检 skill
async function callInspectionSkill() {
  try {
    const result = await executeLocalQuery('inspection', {});
    // 技能脚本已经返回了完整结构，直接返回
    return result;
  } catch (error) {
    return {
      type: 'error',
      message: error.message
    };
  }
}

// 构建 PromQL
function buildPromQL(query) {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('cpu')) {
    return '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)';
  }
  if (lowerQuery.includes('内存') || lowerQuery.includes('memory')) {
    return '(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100';
  }
  if (lowerQuery.includes('磁盘') || lowerQuery.includes('disk')) {
    return '(1 - node_filesystem_avail_bytes{fstype!~"tmpfs|devtmpfs"} / node_filesystem_size_bytes{fstype!~"tmpfs|devtmpfs"}) * 100';
  }
  if (lowerQuery.includes('网络') || lowerQuery.includes('network')) {
    return 'rate(node_network_receive_bytes_total{device!~"lo|veth.*|br.*|docker.*"}[5m])';
  }

  return 'up';
}

// 执行本地查询 - 真正调用技能脚本
async function executeLocalQuery(type, params) {
  const skillScript = path.join(__dirname, 'skills', `${type}.js`);

  console.log(`[Claude Connector] Executing skill script: ${skillScript}`);
  console.log(`[Claude Connector] Params:`, params);

  return new Promise((resolve, reject) => {
    // 使用 node 执行技能脚本
    const child = spawn('node', [skillScript, JSON.stringify(params)], {
      cwd: __dirname,
      env: { ...process.env, SKILL_TYPE: type }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      console.log(`[Claude Connector] Skill stdout: ${data}`);
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(`[Claude Connector] Skill stderr: ${data}`);
      stderr += data.toString();
    });

    child.on('close', (code) => {
      console.log(`[Claude Connector] Skill exited with code: ${code}`);

      if (code !== 0) {
        console.error(`[Claude Connector] Skill [${type}] failed:`, stderr);
        reject(new Error(`Skill execution failed: ${stderr || 'Unknown error'}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        console.log(`[Claude Connector] Skill result:`, result);
        resolve(result);
      } catch (e) {
        // 如果不是 JSON，返回文本
        console.log(`[Claude Connector] Skill output (non-JSON):`, stdout);
        resolve({
          timestamp: Date.now(),
          type,
          params,
          results: stdout.trim().split('\n').filter(line => line)
        });
      }
    });

    child.on('error', (err) => {
      console.error(`[Claude Connector] Skill process error:`, err);
      reject(err);
    });
  });
}

// 发送消息
function send(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// 重连
function scheduleReconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, RECONNECT_INTERVAL);
}

// 启动
console.log('[Claude Connector] Starting...');
connect();

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n[Claude Connector] Shutting down...');
  if (ws) ws.close();
  process.exit(0);
});
