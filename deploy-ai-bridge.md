# AI Bridge 容器化部署指南

## 架构说明

```
┌─────────────────────────────────────────────────────────────────┐
│                      部署架构                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  浏览器 → Nginx容器 → ai-bridge容器 → 大模型API (DeepSeek等)    │
│                      ↓                    ↑                     │
│           ┌───────────────────────────────┴─────────────────┐   │
│           │               外部数据源                           │   │
│           │  • VictoriaMetrics: http://117.89.88.210:29090   │   │
│           │  • Zabbix: http://117.89.88.210:28080            │   │
│           │  • 智护API: http://117.89.88.210:58080/admin-api  │   │
│           └──────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 部署步骤

### 1. 准备环境变量

创建 `.env` 文件：

```bash
cd /Users/zhuhaoran/Desktop/AiOps
cat > .env << 'EOF'
# LLM API 配置
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-your-actual-api-key
OPENAI_MODEL=deepseek-chat

# 外部服务地址
VM_URL=http://117.89.88.210:29090
ZABBIX_URL=http://117.89.88.210:28080
ZHIHU_API_URL=http://117.89.88.210:58080/admin-api

# Zabbix 认证
ZABBIX_USER=Admin
ZABBIX_PASSWORD=Z^zhihuM468
EOF
```

### 2. 创建 Docker 网络（如果不存在）

```bash
docker network ls | grep zhihu-network || docker network create zhihu-network
```

### 3. 构建并启动服务

```bash
# 方式一：使用 docker-compose（推荐）
docker-compose -f docker-compose.ai-bridge.yml up -d --build

# 方式二：单独构建
cd zh-web-code/websocket-bridge
docker build -t zhihu-ai-bridge:latest .
docker run -d --name zhihu-ai-bridge \
  --network zhihu-network \
  -p 9999:9999 \
  --env-file ../../.env \
  zhihu-ai-bridge:latest
```

### 4. 更新 Nginx 容器

将更新后的 `nginx.conf` 复制到你的 Nginx 容器：

```bash
# 假设你的 nginx 容器名为 zhihu-nginx
docker cp /Users/zhuhaoran/Desktop/AiOps/zh-web-code/nginx.conf zhihu-nginx:/etc/nginx/conf.d/default.conf
docker restart zhihu-nginx
```

### 5. 验证服务

```bash
# 检查容器状态
docker ps | grep zhihu

# 查看日志
docker logs -f zhihu-ai-bridge

# 测试 WebSocket 连接
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Host: localhost" \
  -H "Origin: http://localhost" \
  http://localhost:9999/
```

## 常用命令

```bash
# 启动服务
docker-compose -f docker-compose.ai-bridge.yml start

# 停止服务
docker-compose -f docker-compose.ai-bridge.yml stop

# 重启服务
docker-compose -f docker-compose.ai-bridge.yml restart

# 查看日志
docker-compose -f docker-compose.ai-bridge.yml logs -f

# 重新构建
docker-compose -f docker-compose.ai-bridge.yml up -d --build

# 进入容器
docker exec -it zhihu-ai-bridge sh
```

## 文件结构

```
AiOps/
├── docker-compose.ai-bridge.yml    # Docker Compose 配置
├── .env                             # 环境变量（需手动创建）
└── zh-web-code/
    ├── nginx.conf                  # Nginx 配置（已更新）
    └── websocket-bridge/
        ├── Dockerfile              # 容器镜像构建
        ├── docker-entrypoint.sh    # 启动脚本
        ├── .env.example            # 环境变量示例
        ├── server.js               # WebSocket Server
        ├── ai-connector.js         # AI Connector
        ├── package.json
        └── skills/                 # Skills 文档目录
            ├── api_victoriametrics.md
            ├── api_zabbix.md
            └── ...
```

## 前端连接配置

前端连接 WebSocket 时使用：

```javascript
// 开发环境
const wsUrl = 'ws://localhost:9999';

// 生产环境（通过 Nginx 代理）
const wsUrl = 'ws://117.89.88.210/ws/';
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker logs zhihu-ai-bridge

# 检查环境变量
docker exec zhihu-ai-bridge env | grep -E 'OPENAI|WS_'
```

### 2. WebSocket 连接失败

```bash
# 检查端口是否开放
netstat -tlnp | grep 9999

# 测试本地连接
wscat -c ws://localhost:9999
```

### 3. AI 调用失败

```bash
# 进入容器测试 API
docker exec -it zhihu-ai-bridge sh
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'
```

## 注意事项

1. **API Key 安全**：`.env` 文件包含敏感信息，不要提交到 Git
2. **网络配置**：确保 ai-bridge 容器能访问外部数据源
3. **日志管理**：日志挂载到 `./logs/ai-bridge`，定期清理
4. **资源限制**：如需要，可在 docker-compose.yml 中添加资源限制
