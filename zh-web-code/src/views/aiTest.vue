<template>
  <div class="ai-test-page">
    <div class="test-header">
      <h1>智护AI助手功能测试</h1>
      <p>这是一个测试页面，用于验证智护AI助手功能是否正常工作</p>
    </div>
    
    <div class="test-content">
      <div class="test-section">
        <h3>1. 浮动按钮测试</h3>
        <p>查看页面右下角是否有智护AI助手浮动按钮</p>
        <el-button type="primary" @click="showFloatingButton = !showFloatingButton">
          {{ showFloatingButton ? '隐藏' : '显示' }}浮动按钮
        </el-button>
      </div>
      
      <div class="test-section">
        <h3>2. 聊天组件测试</h3>
        <p>测试AI聊天组件的基本功能</p>
        <el-button type="success" @click="showChat = !showChat">
          {{ showChat ? '关闭' : '打开' }}聊天窗口
        </el-button>
      </div>
      
      <div class="test-section">
        <h3>3. 接口测试</h3>
        <p>测试AI接口是否正常工作</p>
        <el-button type="warning" @click="testApi">测试API</el-button>
        <div v-if="apiResult" class="api-result">
          <pre>{{ apiResult }}</pre>
        </div>
      </div>
      
      <div class="test-section">
        <h3>4. 路由测试</h3>
        <p>测试AI聊天页面路由</p>
        <el-button type="info" @click="goToAiChat">跳转到AI聊天页面</el-button>
      </div>
    </div>
    
    <!-- 聊天组件 -->
    <div v-if="showChat" class="chat-test">
      <AiChat :visible="showChat" @close="showChat = false" />
    </div>
    
    <!-- 浮动按钮 -->
    <div v-if="showFloatingButton">
      <AiFloatingButton />
    </div>
  </div>
</template>

<script>
import AiChat from '@/components/AiChat'
import AiFloatingButton from '@/components/AiChat/FloatingButton'
import { sendAiMessage, checkAiStatus } from '@/api/ai'

export default {
  name: 'AiTest',
  components: {
    AiChat,
    AiFloatingButton
  },
  data() {
    return {
      showChat: false,
      showFloatingButton: true,
      apiResult: null
    }
  },
  methods: {
    async testApi() {
      try {
        this.apiResult = '正在测试...'
        
        // 测试AI状态
        const statusResult = await checkAiStatus()
        console.log('AI状态:', statusResult)
        
        // 测试AI对话
        const chatResult = await sendAiMessage({
          message: '你好，这是一个测试消息',
          history: []
        })
        console.log('AI对话:', chatResult)
        
        this.apiResult = JSON.stringify({
          status: statusResult,
          chat: chatResult
        }, null, 2)
        
        this.$message.success('API测试成功！')
      } catch (error) {
        console.error('API测试失败:', error)
        this.apiResult = `错误: ${error.message}`
        this.$message.error('API测试失败！')
      }
    },
    
    goToAiChat() {
      this.$router.push('/ai-chat')
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    font-size: 16px;
  }
}

.test-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.test-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    color: #666;
    margin-bottom: 15px;
  }
}

.api-result {
  margin-top: 15px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #ddd;
  
  pre {
    margin: 0;
    font-size: 12px;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.chat-test {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

// 响应式设计
@media (max-width: 768px) {
  .test-content {
    grid-template-columns: 1fr;
  }
  
  .ai-test-page {
    padding: 15px;
  }
}
</style>
