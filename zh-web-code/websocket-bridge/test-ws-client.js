const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:9999');

ws.on('open', () => {
  console.log('[Test Client] Connected');
  
  // 发送一个测试查询
  ws.send(JSON.stringify({
    type: 'query',
    id: 'test-' + Date.now(),
    payload: {
      query: '查询最近30分钟CPU使用率',
      context: {}
    }
  }));
  console.log('[Test Client] Query sent');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[Test Client] Response received');
  console.log(JSON.stringify(msg, null, 2));
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('[Test Client] Error:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('[Test Client] Timeout - closing connection');
  ws.close();
  process.exit(1);
}, 30000);
