#!/bin/bash
# 停止 WebSocket 架构服务

echo "🛑 停止智护 WebSocket 架构..."

# 停止 Frontend
if [ -f ".pids/frontend.pid" ]; then
    PID=$(cat .pids/frontend.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "停止 Frontend (PID: $PID)..."
        kill $PID 2>/dev/null || true
    fi
    rm .pids/frontend.pid
fi

# 停止 Claude Connector
if [ -f ".pids/claude-connector.pid" ]; then
    PID=$(cat .pids/claude-connector.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "停止 Claude Connector (PID: $PID)..."
        kill $PID 2>/dev/null || true
    fi
    rm .pids/claude-connector.pid
fi

# 停止 WebSocket Server
if [ -f ".pids/ws-server.pid" ]; then
    PID=$(cat .pids/ws-server.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "停止 WebSocket Server (PID: $PID)..."
        kill $PID 2>/dev/null || true
    fi
    rm .pids/ws-server.pid
fi

echo "✅ 所有服务已停止"
