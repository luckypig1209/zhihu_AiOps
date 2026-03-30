const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9999');
let querySent = false;

ws.on('open', () => {
  console.log('[Test] WebSocket connected');
  
  // 先注册为前端
  ws.send(JSON.stringify({
    type: 'register',
    payload: { clientType: 'frontend' }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[Test] Received:', msg.type);
  
  if (msg.type === 'registered' && !querySent) {
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'query',
        id: 'test-' + Date.now(),
        payload: {
          query: '查询最近30分钟CPU使用率',
          context: {}
        }
      }));
      console.log('[Test] Query sent: 查询最近30分钟CPU使用率');
      querySent = true;
    }, 500);
  }
  
  if (msg.type === 'response') {
    console.log('\n[Test] ====== Response received! ======');
    console.log('Result type:', msg.payload.result?.type);
    console.log('Content preview:', msg.payload.result?.content?.substring(0, 500));
    if (msg.payload.result?.toolCalls) {
      console.log('Tool calls:', JSON.stringify(msg.payload.result.toolCalls, null, 2));
    }
    ws.close();
    process.exit(0);
  }
  
  if (msg.type === 'error') {
    console.error('[Test] Error:', msg.payload);
    ws.close();
    process.exit(1);
  }
});

ws.on('error', (err) => {
  console.error('[Test] WebSocket error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('[Test] Timeout!');
  ws.close();
  process.exit(1);
}, 60000);
