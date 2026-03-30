# AI功能部署指南

## 🎯 问题解决

### 问题：页面上没有AI圆形按钮

**原因**：AI浮动按钮组件没有被引入到主应用(App.vue)中

**解决方案**：已修复App.vue，添加了AI浮动按钮组件

## ✅ 修复内容

### 1. 修改了 `src/App.vue`
```vue
<template>
  <div id="app">
    <router-view />
    <theme-picker />
    <ai-floating-button />  <!-- 新增AI浮动按钮 -->
  </div>
</template>

<script>
import ThemePicker from "@/components/ThemePicker";
import AiFloatingButton from "@/components/AiChat/FloatingButton";  // 新增导入

export default {
  name: "App",
  components: { ThemePicker, AiFloatingButton },  // 新增组件注册
  // ... 其他代码
}
</script>
```

### 2. 构建验证
- ✅ AI浮动按钮组件已正确打包
- ✅ 组件引用已添加到主应用
- ✅ 构建成功，无错误

## 🚀 部署步骤

### 1. 重新部署前端
```bash
# 将新的dist目录部署到服务器
scp -r dist/ user@server:/path/to/webroot/
```

### 2. 确保AI后端服务运行
```bash
cd ai-backend-service
docker-compose up -d
```

### 3. 配置Nginx代理（如果使用）
```nginx
location /api/ai/ {
    proxy_pass http://zhihu-ai:18000/api/v1/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🔍 验证方法

### 1. 检查页面元素
- 打开浏览器开发者工具
- 查看页面右下角是否有AI助手按钮
- 按钮应该显示"AI助手"文字和服务图标

### 2. 测试AI功能
- 点击AI助手按钮
- 应该弹出聊天窗口
- 可以发送消息测试AI对话

### 3. 检查控制台
- 打开浏览器控制台
- 查看是否有AI相关的错误信息
- 确认API调用是否正常

## 🎯 访问方式

1. **浮动按钮**：页面右下角的AI助手按钮
2. **直接访问**：
   - `/ai-chat` - AI聊天页面
   - `/ai-test` - AI功能测试页面
   - `/demo` - AI助手演示页面

## ⚠️ 注意事项

1. **确保后端服务运行**：AI功能需要后端服务支持
2. **检查网络连接**：确保前端能访问AI后端API
3. **清除浏览器缓存**：部署后建议清除浏览器缓存
4. **检查控制台错误**：如有问题查看浏览器控制台

---
**修复时间**: 2025年9月26日  
**修复状态**: ✅ 已完成
