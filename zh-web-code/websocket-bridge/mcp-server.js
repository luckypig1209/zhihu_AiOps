#!/usr/bin/env node
/**
 * 智护 MCP Server
 *
 * 功能：桥接 Claude CLI 和 WebSocket Bridge
 * 协议：Model Context Protocol (MCP)
 *
 * 使用方式：
 * 1. 在 Claude CLI 配置中添加此 server
 * 2. Claude CLI 会通过 stdio 与此 server 通信
 * 3. 此 server 将消息转发到 WebSocket Bridge
 */

const { Server } = require('@anthropic-ai/mcp-server');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const WS_URL = process.env.WS_URL || 'ws://localhost:9999';

// 连接 WebSocket Bridge
let ws = null;
let pendingCallbacks = new Map();

function connectWebSocket() {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.error('[MCP Server] Connected to WebSocket Bridge');

      // 注册为 MCP Server
      ws.send(JSON.stringify({
        type: 'register',
        payload: { clientType: 'mcp-server', version: '1.0.0' }
      }));

      resolve();
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        handleWebSocketMessage(msg);
      } catch (e) {
        console.error('[MCP Server] Invalid message:', e);
      }
    });

    ws.on('close', () => {
      console.error('[MCP Server] WebSocket disconnected, reconnecting...');
      setTimeout(connectWebSocket, 5000);
    });

    ws.on('error', (err) => {
      console.error('[MCP Server] WebSocket error:', err);
      reject(err);
    });
  });
}

function handleWebSocketMessage(msg) {
  const { id, type, payload } = msg;

  if (type === 'response' && id && pendingCallbacks.has(id)) {
    const callback = pendingCallbacks.get(id);
    pendingCallbacks.delete(id);
    callback(null, payload);
  }
}

async function sendQuery(skill, query, params = {}) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket not connected'));
      return;
    }

    const id = uuidv4();

    // 设置超时
    const timeout = setTimeout(() => {
      pendingCallbacks.delete(id);
      reject(new Error('Query timeout'));
    }, 60000);

    // 存储回调
    pendingCallbacks.set(id, (err, result) => {
      clearTimeout(timeout);
      if (err) reject(err);
      else resolve(result);
    });

    // 发送查询
    ws.send(JSON.stringify({
      id,
      type: 'query',
      payload: {
        skill,
        query,
        params,
        timestamp: Date.now()
      }
    }));
  });
}

// 创建 MCP Server
const server = new Server({
  name: 'zhihu-mcp-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// 注册工具：指标查询
server.setToolHandler('query_metrics', async (args) => {
  const { metric_type, instance, time_range } = args;

  console.error(`[MCP Server] query_metrics: ${metric_type}`);

  try {
    const result = await sendQuery('query-metrics', `查询 ${metric_type} 指标`, {
      metric_type,
      instance,
      time_range
    });

    return {
      content: [{
        type: 'text',
        text: formatMetricsResult(result)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `查询失败: ${error.message}`
      }],
      isError: true
    };
  }
});

// 注册工具：Zabbix 查询
server.setToolHandler('query_zabbix', async (args) => {
  const { query_type, keyword, ip } = args;

  console.error(`[MCP Server] query_zabbix: ${query_type}`);

  try {
    const result = await sendQuery('query-zabbix', `Zabbix ${query_type} 查询`, {
      query_type,
      keyword,
      ip
    });

    return {
      content: [{
        type: 'text',
        text: formatZabbixResult(result)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `查询失败: ${error.message}`
      }],
      isError: true
    };
  }
});

// 注册工具：全面巡检
server.setToolHandler('full_inspection', async () => {
  console.error('[MCP Server] full_inspection');

  try {
    const result = await sendQuery('full-inspection', '执行全面巡检', {});

    return {
      content: [{
        type: 'text',
        text: formatInspectionResult(result)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `巡检失败: ${error.message}`
      }],
      isError: true
    };
  }
});

// 格式化函数
function formatMetricsResult(result) {
  if (!result || result.type === 'error') {
    return `指标查询失败: ${result?.message || '未知错误'}`;
  }

  const lines = ['## 指标查询结果\n'];

  if (result.data && result.data.results) {
    result.data.results.forEach(r => {
      lines.push(`- **${r.instance || 'localhost'}**: ${r.value}`);
    });
  }

  return lines.join('\n');
}

function formatZabbixResult(result) {
  if (!result || result.type === 'error') {
    return `Zabbix 查询失败: ${result?.message || '未知错误'}`;
  }

  const lines = ['## Zabbix 查询结果\n'];

  if (Array.isArray(result.data)) {
    result.data.forEach(item => {
      lines.push(`- ${item.name || item}`);
    });
  } else {
    lines.push(JSON.stringify(result.data, null, 2));
  }

  return lines.join('\n');
}

function formatInspectionResult(result) {
  if (!result || result.type === 'error') {
    return `巡检失败: ${result?.message || '未知错误'}`;
  }

  return result.data?.report || JSON.stringify(result.data, null, 2);
}

// 启动
async function main() {
  console.error('[MCP Server] Starting...');
  console.error('[MCP Server] Connecting to WebSocket Bridge...');

  try {
    await connectWebSocket();
    console.error('[MCP Server] Ready, waiting for Claude CLI...');

    // 开始监听 stdio
    server.listen();
  } catch (error) {
    console.error('[MCP Server] Failed to start:', error);
    process.exit(1);
  }
}

main();
