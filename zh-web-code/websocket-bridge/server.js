/**
 * 智护 WebSocket Bridge Server
 *
 * 功能：
 * 1. 接收前端 WebSocket 连接
 * 2. 接收 Claude CLI WebSocket 连接
 * 3. 在两者之间中转消息
 *
 * 消息格式：
 * {
 *   id: string,        // 消息唯一ID
 *   type: string,      // 消息类型: query, response, error, ping
 *   payload: any,      // 消息内容
 *   timestamp: number, // 时间戳
 *   client: string     // 发送方: frontend, claude
 * }
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.WS_PORT || 9999;
const HEARTBEAT_INTERVAL = 30000; // 30秒心跳

// 存储连接
const clients = {
  frontend: new Set(), // 前端连接
  claude: null         // Claude CLI 连接（单例）
};

// 存储待处理的请求
const pendingRequests = new Map();

// 创建 WebSocket 服务器 - 明确绑定到 0.0.0.0 以支持 IPv4 和 IPv6
const wss = new WebSocket.Server({ port: PORT, host: '0.0.0.0' });

console.log(`[WebSocket Bridge] Server started on port ${PORT} (0.0.0.0)`);
console.log(`[WebSocket Bridge] Waiting for connections...`);

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  console.log(`[WebSocket Bridge] New connection: ${clientId}`);

  // 设置心跳
  ws.isAlive = true;
  ws.clientId = clientId;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('[WebSocket Bridge] Invalid JSON:', error.message);
      sendError(ws, 'Invalid JSON format');
    }
  });

  // 处理关闭
  ws.on('close', () => {
    console.log(`[WebSocket Bridge] Connection closed: ${clientId}`);
    removeClient(ws);
  });

  // 处理错误
  ws.on('error', (error) => {
    console.error(`[WebSocket Bridge] Connection error (${clientId}):`, error.message);
  });

  // 发送欢迎消息
  send(ws, {
    type: 'connected',
    payload: { clientId, message: 'Connected to WebSocket Bridge' }
  });
});

// 处理消息路由
function handleMessage(ws, message) {
  const { type, payload, id } = message;

  console.log(`[WebSocket Bridge] Received [${type}] from ${message.client || 'unknown'}`);

  switch (type) {
    // Claude CLI 注册
    case 'register':
      if (payload?.clientType === 'claude') {
        clients.claude = ws;
        ws.clientType = 'claude';
        console.log('[WebSocket Bridge] Claude CLI registered');
        send(ws, { type: 'registered', payload: { success: true } });
      } else if (payload?.clientType === 'frontend') {
        clients.frontend.add(ws);
        ws.clientType = 'frontend';
        console.log('[WebSocket Bridge] Frontend registered');
        send(ws, { type: 'registered', payload: { success: true } });
      }
      break;

    // 前端查询请求
    case 'query':
      if (ws.clientType === 'frontend') {
        handleQueryRequest(ws, message);
      }
      break;

    // 前端 → Claude: 配置和 Skills 管理
    case 'get_config':
    case 'update_config':
    case 'get_skills':
    case 'update_skill':
      if (ws.clientType === 'frontend') {
        handleQueryRequest(ws, message);
      }
      break;

    // Claude CLI 响应
    case 'response':
      if (ws.clientType === 'claude') {
        handleClaudeResponse(message);
      }
      break;

    // Claude CLI 流式输出
    case 'stream_start':
    case 'stream_chunk':
    case 'stream_end':
      if (ws.clientType === 'claude') {
        handleClaudeResponse(message);
      }
      break;

    // Claude CLI 主动推送（如告警通知）
    case 'push':
      if (ws.clientType === 'claude') {
        broadcastToFrontend(message);
      }
      break;

    // 心跳
    case 'ping':
      send(ws, { type: 'pong', timestamp: Date.now() });
      break;

    default:
      console.warn('[WebSocket Bridge] Unknown message type:', type);
  }
}

// 处理前端查询请求
function handleQueryRequest(ws, message) {
  const requestId = message.id || uuidv4();

  // 存储请求等待响应
  pendingRequests.set(requestId, {
    frontendWs: ws,
    timestamp: Date.now(),
    payload: message.payload
  });

  // 转发给 Claude CLI
  if (clients.claude && clients.claude.readyState === WebSocket.OPEN) {
    send(clients.claude, {
      id: requestId,
      type: message.type,
      payload: message.payload,
      timestamp: Date.now()
    });
    console.log(`[WebSocket Bridge] Query [${requestId}] forwarded to Claude`);
  } else {
    // Claude CLI 未连接
    sendError(ws, 'Claude CLI is not connected', requestId);
    pendingRequests.delete(requestId);
  }
}

// 处理 Claude CLI 响应（含流式）
function handleClaudeResponse(message) {
  const requestId = message.id;
  const pending = pendingRequests.get(requestId);

  if (pending) {
    // 转发给前端，保留原始 type（response / stream_start / stream_chunk / stream_end）
    send(pending.frontendWs, {
      id: requestId,
      type: message.type,
      payload: message.payload,
      timestamp: Date.now()
    });

    // 只在最终响应或流式结束时清理
    if (message.type === 'response' || message.type === 'stream_end') {
      pendingRequests.delete(requestId);
    }
  } else {
    console.warn(`[WebSocket Bridge] No pending request found for [${requestId}]`);
  }
}

// 广播消息给所有前端
function broadcastToFrontend(message) {
  clients.frontend.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      send(ws, message);
    }
  });
}

// 移除客户端
function removeClient(ws) {
  if (ws.clientType === 'claude') {
    clients.claude = null;
    console.log('[WebSocket Bridge] Claude CLI disconnected');
  } else if (ws.clientType === 'frontend') {
    clients.frontend.delete(ws);
    console.log('[WebSocket Bridge] Frontend disconnected');
  }

  // 清理该客户端的待处理请求
  for (const [id, pending] of pendingRequests.entries()) {
    if (pending.frontendWs === ws) {
      pendingRequests.delete(id);
    }
  }
}

// 发送消息
function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// 发送错误
function sendError(ws, error, requestId = null) {
  send(ws, {
    id: requestId,
    type: 'error',
    payload: { error },
    timestamp: Date.now()
  });
}

// 心跳检测
const heartbeat = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });

  // 清理超时请求（5分钟）
  const now = Date.now();
  for (const [id, pending] of pendingRequests.entries()) {
    if (now - pending.timestamp > 300000) {
      sendError(pending.frontendWs, 'Request timeout', id);
      pendingRequests.delete(id);
    }
  }
}, HEARTBEAT_INTERVAL);

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n[WebSocket Bridge] Shutting down...');
  clearInterval(heartbeat);
  wss.close(() => {
    console.log('[WebSocket Bridge] Server closed');
    process.exit(0);
  });
});
