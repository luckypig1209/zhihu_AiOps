# 智护 WebSocket Bridge 架构

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              前端 (Vue.js)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ AI 助手页面  │  │ 智能问答页面 │  │ 指标查询    │                      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                      │
│         │                │                │                             │
│         └────────────────┼────────────────┘                             │
│                          ▼                                              │
│              ┌─────────────────────┐                                    │
│              │  websocketService.js │  ← 前端 WebSocket 客户端            │
│              │  (自动重连/心跳)      │                                    │
│              └──────────┬──────────┘                                    │
└─────────────────────────┼───────────────────────────────────────────────┘
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         WebSocket Bridge Server                         │
│                        (Port: 9999)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  消息路由：前端 ◄────► Claude Connector                          │   │
│  │  - 接收前端查询请求                                               │   │
│  │  - 转发给 Claude Connector                                       │   │
│  │  - 返回执行结果                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Claude Connector                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  1. 接收 WebSocket 消息                                          │   │
│  │  2. 意图识别 (metrics/zabbix/inspection)                         │   │
│  │  3. 调用技能脚本 (child_process.spawn)                            │   │
│  │  4. 返回结果                                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────────┘
                          │ child_process
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
│ metrics.js      │ │ zabbix.js   │ │ inspection.js   │
│ 指标查询技能     │ │ Zabbix 查询 │ │ 全面巡检技能     │
└────────┬────────┘ └──────┬──────┘ └────────┬────────┘
         │                 │                 │
         ▼                 ▼                 ▼
  VictoriaMetrics    Zabbix API        综合检查
  (Port: 29090)      (Port: 28080)
```

## 组件说明

| 组件 | 路径 | 功能 | 端口 |
|------|------|------|------|
| **WebSocket Bridge Server** | `websocket-bridge/server.js` | 消息中转 | 9999 |
| **Claude Connector** | `websocket-bridge/claude-connector.js` | 技能路由 | - |
| **Metrics Skill** | `websocket-bridge/skills/metrics.js` | VictoriaMetrics 查询 | - |
| **Zabbix Skill** | `websocket-bridge/skills/zabbix.js` | Zabbix API 查询 | - |
| **Inspection Skill** | `websocket-bridge/skills/inspection.js` | 全面巡检 | - |
| **前端 WebSocket 服务** | `src/utils/websocketService.js` | 前端客户端 | - |

## 快速启动

### 方法 1: 一键启动（推荐）

```bash
cd /Users/zhuhaoran/Desktop/AiOps/zh-web-code
./start-websocket.sh
```

带前端一起启动：
```bash
./start-websocket.sh --with-frontend
```

### 方法 2: 分别启动

**终端 1 - WebSocket Server:**
```bash
npm run ws:server
```

**终端 2 - Claude Connector:**
```bash
npm run ws:claude
```

**终端 3 - 前端:**
```bash
NODE_OPTIONS=--openssl-legacy-provider npm run dev58
```

### 停止服务

```bash
./stop-websocket.sh
```

## 访问页面

- **智能问答落地页**: http://localhost:1024/smart-qa
- **AI 助手**: http://localhost:1024/ai-assistant
- **AI 演示**: http://localhost:1024/demo

## 支持的查询

| 查询类型 | 示例 | 调用的 Skill |
|----------|------|--------------|
| CPU 查询 | "查询 CPU 使用率" | metrics.js |
| 内存查询 | "查询内存使用率" | metrics.js |
| 磁盘查询 | "查询磁盘空间" | metrics.js |
| Zabbix 主机 | "搜索主机" | zabbix.js |
| Zabbix 告警 | "查看告警" | zabbix.js |
| 全面巡检 | "执行巡检" | inspection.js |

## 消息流程

```
1. 用户在前端输入: "查询 CPU 使用率"
   ↓
2. opsQueryService.js 识别意图 → skill: 'query-metrics'
   ↓
3. websocketService.js 发送 WebSocket 消息
   ↓
4. WebSocket Bridge Server 接收并路由
   ↓
5. Claude Connector 接收消息
   ↓
6. 调用 skills/metrics.js (child_process.spawn)
   ↓
7. metrics.js 调用 VictoriaMetrics API
   ↓
8. 返回结果给 Claude Connector
   ↓
9. 通过 WebSocket 返回给前端
   ↓
10. 前端展示结果
```

## 配置

### 数据源地址

编辑技能脚本修改数据源：

**metrics.js:**
```javascript
const VM_BASE_URL = 'http://117.89.88.210:29090';
```

**zabbix.js:**
```javascript
const ZABBIX_URL = 'http://117.89.88.210:28080/api_jsonrpc.php';
const ZABBIX_USER = 'Admin';
const ZABBIX_PASS = 'Z^zhihuM468';
```

### WebSocket URL

前端 `.env.dev`:
```
VUE_APP_WS_URL = 'ws://localhost:9999'
```

## 日志位置

```
logs/
├── ws-server.log        # WebSocket Server 日志
├── claude-connector.log # Claude Connector 日志
└── frontend.log         # 前端日志 (如果使用 --with-frontend)
```

## 添加新技能

1. 创建技能脚本 `websocket-bridge/skills/your-skill.js`
2. 在 `claude-connector.js` 中添加意图识别规则
3. 实现 `callYourSkill` 函数

示例技能脚本模板：

```javascript
#!/usr/bin/env node
/**
 * 自定义技能
 */

async function runSkill(params) {
  // 实现你的逻辑
  const result = await yourQueryLogic(params);

  // 输出 JSON 结果
  console.log(JSON.stringify({
    timestamp: Date.now(),
    type: 'your-skill',
    results: result
  }));
}

const params = JSON.parse(process.argv[2] || '{}');
runSkill(params);
```

## 故障排查

### WebSocket 连接失败
```bash
# 检查 WebSocket Server 是否运行
lsof -i :9999

# 重新启动
./stop-websocket.sh
./start-websocket.sh
```

### 技能执行失败
```bash
# 查看 Claude Connector 日志
tail -f logs/claude-connector.log

# 手动测试技能
node websocket-bridge/skills/metrics.js '{"query_type": "cpu"}'
```

### 前端无法连接
```bash
# 检查浏览器控制台网络面板
# 确认 VUE_APP_WS_URL 配置正确
```

## 注意事项

1. **Node.js 版本**: 需要 Node.js 14+
2. **端口占用**: 确保 9999 端口未被占用
3. **数据源**: 确保 VictoriaMetrics 和 Zabbix 可访问
4. **防火墙**: 确保没有防火墙阻止 WebSocket 连接

## 技术栈

- **前端**: Vue 2 + Element UI + WebSocket API
- **后端**: Node.js + ws (WebSocket library)
- **进程通信**: child_process.spawn
- **数据源**: VictoriaMetrics (PromQL) + Zabbix API
