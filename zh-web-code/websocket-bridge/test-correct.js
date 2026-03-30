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
  console.log('[Test] Register sent');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[Test] Received:', msg.type);
  
  if (msg.type === 'registered' && !querySent) {
    // 注册成功后发送查询
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'query',
        id: 'test-' + Date.now(),
        payload: {
          query: '查询最近30分钟CPU使用率',
          context: {}
        }
      }));
      console.log('[Test] Query sent');
      querySent = true;
    }, 500);
  }
  
  if (msg.type === 'response') {
    console.log('[Test] Response received!');
    console.log('Payload:', JSON.stringify(msg.payload, null, 2).substring(0, 1500));
    ws.close();
    process.exit(0);
  }
  
  if (msg.type === 'error') {
    console.log('[Test] Error received:', msg.payload);
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
}, 45000);
