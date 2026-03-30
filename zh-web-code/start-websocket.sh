#!/bin/bash
# 智护 WebSocket 架构一键启动脚本

set -e

echo "🚀 智护 WebSocket 架构启动脚本"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查依赖
echo -e "${YELLOW}检查依赖...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    exit 1
fi

# 安装依赖（如果需要）
if [ ! -d "websocket-bridge/node_modules" ]; then
    echo -e "${YELLOW}安装 WebSocket Bridge 依赖...${NC}"
    cd websocket-bridge && npm install && cd ..
fi

# 启动 WebSocket Server
echo -e "${GREEN}启动 WebSocket Bridge Server...${NC}"
nohup node websocket-bridge/server.js > logs/ws-server.log 2>&1 &
WS_PID=$!
echo $WS_PID > .pids/ws-server.pid
echo "  PID: $WS_PID"

# 等待 Server 启动
sleep 2

# 启动 Claude Connector
echo -e "${GREEN}启动 Claude Connector...${NC}"
nohup node websocket-bridge/ai-connector.js > logs/claude-connector.log 2>&1 &
CONN_PID=$!
echo $CONN_PID > .pids/claude-connector.pid
echo "  PID: $CONN_PID"

# 启动前端（可选）
if [ "$1" == "--with-frontend" ]; then
    echo -e "${GREEN}启动前端开发服务器...${NC}"
    NODE_OPTIONS=--openssl-legacy-provider npm run dev58 > logs/frontend.log 2>&1 &
    FE_PID=$!
    echo $FE_PID > .pids/frontend.pid
    echo "  PID: $FE_PID"
fi

echo ""
echo -e "${GREEN}✅ 所有服务已启动!${NC}"
echo ""
echo "日志位置:"
echo "  - WebSocket Server: logs/ws-server.log"
echo "  - Claude Connector: logs/claude-connector.log"
if [ "$1" == "--with-frontend" ]; then
    echo "  - Frontend: logs/frontend.log"
fi
echo ""
echo "访问地址:"
echo "  - 智能问答: http://localhost:1024/smart-qa"
echo "  - AI 助手: http://localhost:1024/ai-assistant"
echo ""
echo "停止服务: ./stop-websocket.sh"
