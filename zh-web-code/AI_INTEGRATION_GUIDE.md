# AI功能集成指南

## 📋 概述

本指南说明如何将AI功能集成到您的运维平台项目中，同时保持原有代码不受影响。

## 🗂️ 文件结构

### 新增的AI功能文件
```
src/
├── components/AiChat/              # AI聊天组件
│   ├── index.vue                  # 主聊天组件
│   └── FloatingButton.vue         # 浮动按钮组件
├── views/aiChat/                  # AI聊天页面
│   └── index.vue                  # 聊天页面
├── views/aiTest.vue               # AI功能测试页面
├── views/demo.vue                 # AI功能演示页面
├── views/ai-standalone.vue        # AI独立应用入口
├── api/ai.js                      # AI接口对接
├── utils/aiMock.js                # AI服务模拟器
├── utils/ai-permission.js         # AI权限配置
└── router/ai-routes.js            # AI路由配置
```

### 配置文件
```
ai-start.js                        # AI独立启动脚本
AI_INTEGRATION_GUIDE.md            # 集成指南
AI_CHAT_README.md                  # AI功能说明
```

## 🔧 集成方式

### 方式1：独立运行（推荐）

1. **构建AI功能**：
   ```bash
   npm run build:prod
   ```

2. **启动AI独立服务器**：
   ```bash
   node ai-start.js
   ```

3. **访问AI功能**：
   - 演示页面：http://localhost:3000/ai-demo
   - 测试页面：http://localhost:3000/ai-test
   - 聊天页面：http://localhost:3000/ai-chat

### 方式2：集成到现有项目

1. **修改路由配置**：
   ```javascript
   // 在 src/router/index.js 中导入AI路由
   import { aiRoutes } from './ai-routes'
   
   // 添加到 constantRoutes 中
   export const constantRoutes = [
     // ... 原有路由
     ...aiRoutes
   ]
   ```

2. **修改权限验证**：
   ```javascript
   // 在 src/permission.js 中导入AI权限配置
   import { checkAiPermission } from '@/utils/ai-permission'
   
   // 在路由守卫中添加AI权限检查
   router.beforeEach(async (to, from, next) => {
     // AI权限检查
     const aiResult = checkAiPermission(to, from, next)
     if (aiResult !== null) return aiResult
     
     // ... 原有权限逻辑
   })
   ```

3. **添加浮动按钮**：
   ```javascript
   // 在 src/App.vue 中添加AI浮动按钮
   import AiFloatingButton from '@/components/AiChat/FloatingButton'
   
   export default {
     components: {
       // ... 原有组件
       AiFloatingButton
     }
   }
   ```

## 🚀 使用说明

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 访问AI功能（需要先集成路由）
http://localhost:1024/ai-demo
```

### 生产环境
```bash
# 构建项目
npm run build:prod

# 启动AI独立服务器
node ai-start.js
```

## 🔒 权限配置

### 白名单路由
AI功能的白名单路由定义在 `src/utils/ai-permission.js` 中：
- `/ai-demo` - 演示页面
- `/ai-test` - 测试页面  
- `/ai-chat` - 聊天页面

### 权限检查
AI功能使用独立的权限检查逻辑，不会影响原有系统的权限验证。

## 📱 功能特性

- ✅ **独立运行**：可以独立启动，不影响原有项目
- ✅ **模块化设计**：所有AI功能都在独立模块中
- ✅ **权限隔离**：使用独立的权限配置
- ✅ **接口对接**：完整的API接口结构
- ✅ **模拟模式**：开发环境使用模拟数据

## 🛠️ 自定义配置

### 修改AI接口
编辑 `src/api/ai.js` 文件，修改接口地址和参数。

### 修改AI样式
编辑 `src/components/AiChat/index.vue` 中的样式部分。

### 添加新功能
在 `src/components/AiChat/` 目录下添加新的AI功能组件。

## 📞 技术支持

如有问题，请参考：
- `AI_CHAT_README.md` - AI功能详细说明
- 项目文档
- 代码注释

---

**注意**：AI功能已设计为独立模块，不会影响原有项目的正常运行。
