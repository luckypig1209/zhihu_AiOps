const WebSocket = require('ws');

// 启动 ai-connector
const { spawn } = require('child_process');
const path = require('path');

console.log('[Test] Starting ai-connector...');
const aiConnector = spawn('node', ['ai-connector.js'], {
  cwd: __dirname,
  env: { ...process.env, ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN },
  stdio: 'pipe'
});

let connectorOutput = '';
aiConnector.stdout.on('data', (data) => {
  connectorOutput += data.toString();
  console.log('[AI-Connector]', data.toString().trim());
});

aiConnector.stderr.on('data', (data) => {
  connectorOutput += data.toString();
  console.error('[AI-Connector Error]', data.toString().trim());
});

// 等待 ai-connector 启动
setTimeout(() => {
  console.log('[Test] Connecting to WebSocket...');
  const ws = new WebSocket('ws://localhost:9999');
  
  ws.on('open', () => {
    console.log('[Test] WebSocket connected');
    
    // 发送查询
    ws.send(JSON.stringify({
      type: 'query',
      id: 'test-' + Date.now(),
      payload: {
        query: '查询最近30分钟CPU使用率',
        context: {}
      }
    }));
    console.log('[Test] Query sent');
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('[Test] Received message type:', msg.type);
    
    if (msg.type === 'response') {
      console.log('[Test] Response payload:', JSON.stringify(msg.payload, null, 2).substring(0, 1000));
      ws.close();
      aiConnector.kill();
      process.exit(0);
    }
  });
  
  ws.on('error', (err) => {
    console.error('[Test] WebSocket error:', err.message);
    aiConnector.kill();
    process.exit(1);
  });
}, 3000);

// 30秒超时
setTimeout(() => {
  console.log('[Test] Timeout!');
  console.log('\n[AI-Connector Full Output]:');
  console.log(connectorOutput);
  aiConnector.kill();
  process.exit(1);
}, 35000);
