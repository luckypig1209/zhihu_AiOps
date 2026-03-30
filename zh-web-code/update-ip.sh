#!/bin/bash

# 前端IP地址批量修改脚本
# 使用方法: ./update-ip.sh 新IP地址

if [ $# -eq 0 ]; then
    echo "使用方法: $0 <新IP地址>"
    echo "例如: $0 192.168.1.100"
    exit 1
fi

NEW_IP=$1
echo "�� 开始更新IP地址到: $NEW_IP"

# 1. 更新开发环境配置
echo "📝 更新 .env.dev 文件..."
sed -i "s/VUE_APP_BASE_API = 'http:\/\/[^:]*:/VUE_APP_BASE_API = 'http:\/\/$NEW_IP:/g" .env.dev
sed -i "s/VUE_APP_AI_API_BASE = 'http:\/\/[^:]*:/VUE_APP_AI_API_BASE = 'http:\/\/$NEW_IP:/g" .env.dev

# 2. 更新vue.config.js中的代理配置
echo "📝 更新 vue.config.js 代理配置..."
sed -i "s/target: \`http:\/\/[^:]*:/target: \`http:\/\/$NEW_IP:/g" vue.config.js

# 3. 显示修改结果
echo "✅ 修改完成！"
echo ""
echo "�� 修改内容预览:"
echo "=== .env.dev ==="
grep "VUE_APP_BASE_API\|VUE_APP_AI_API_BASE" .env.dev

echo ""
echo "=== vue.config.js 代理配置 ==="
grep -A 1 "target:" vue.config.js | head -10

echo ""
echo "🚀 请运行以下命令重新构建:"
echo "npm run build"
