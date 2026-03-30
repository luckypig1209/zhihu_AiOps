#!/bin/sh
set -e

echo "========================================"
echo "  智护 AI Bridge 容器启动"
echo "========================================"

# 显示环境变量（隐藏敏感信息）
echo "WebSocket 端口: ${WS_PORT:-9999}"
echo "LLM 模型: ${OPENAI_MODEL:-未设置}"
echo "API 地址: ${OPENAI_BASE_URL:-未设置}"
echo "Skills 目录: /app/skills"
echo ""

# 启动 WebSocket Server (后台)
echo "[启动] WebSocket Server..."
node /app/server.js > /app/logs/ws-server.log 2>&1 &
WS_PID=$!
echo "  PID: $WS_PID"

# 等待 WebSocket Server 启动
sleep 2

# 启动 AI Connector (前台)
echo "[启动] AI Connector..."
echo ""
echo "========================================"
echo "  服务已启动，日志输出如下:"
echo "========================================"
node /app/ai-connector.js

# 如果 AI Connector 退出，也关闭 WebSocket Server
echo ""
echo "[AI Connector] 已停止，正在关闭 WebSocket Server..."
kill $WS_PID 2>/dev/null || true
exit 0
