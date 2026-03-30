FROM node:18-alpine

# 设置时区
ENV TZ=Asia/Shanghai

# 设置工作目录
WORKDIR /app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制服务文件
COPY server.js ./server.js
COPY ai-connector.js ./ai-connector.js

# 复制 skills 目录
COPY skills ./skills

# 创建 logs 目录
RUN mkdir -p /app/logs

# 复制启动脚本
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# 暴露 WebSocket 端口
EXPOSE 9999

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9999', (r) => {process.exit(r.statusCode === 400 ? 0 : 1)})" || exit 1

# 启动服务
ENTRYPOINT ["./docker-entrypoint.sh"]
