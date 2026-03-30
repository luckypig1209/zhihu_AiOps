<template>
  <div class="ai-floating-button">
    <!-- 浮动按钮 -->
    <div 
      class="floating-btn"
      @click="toggleChat"
      :class="{ active: chatVisible }"
    >
      <div class="btn-inner">
        <i class="el-icon-cpu"></i>
        <span class="btn-text">{{ $t('aiChat.buttonText') }}</span>
      </div>
      <div class="pulse-ring"></div>
    </div>
    
    <!-- 聊天窗口 -->
    <transition name="chat-slide">
      <div v-if="chatVisible" class="chat-window">
        <AiChat 
          :visible="chatVisible"
          @close="closeChat"
        />
      </div>
    </transition>
    
    <!-- 遮罩层 -->
    <div 
      v-if="chatVisible" 
      class="chat-overlay"
      @click="closeChat"
    ></div>
  </div>
</template>

<script>
import AiChat from './index.vue'

export default {
  name: 'AiFloatingButton',
  components: {
    AiChat
  },
  data() {
    return {
      chatVisible: false
    }
  },
  methods: {
    toggleChat() {
      this.chatVisible = !this.chatVisible
    },
    
    closeChat() {
      this.chatVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-floating-button {
  display: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.floating-btn {
  width: 60px;
  height: 60px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  .btn-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    color: white;
    position: relative;
    z-index: 2;
    
    i {
      font-size: 24px;
      margin-bottom: 2px;
    }
    
    .btn-text {
      font-size: 10px;
      font-weight: 500;
    }
  }
  
  .pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  &:hover {
    transform: scale(1.1);
    
    .btn-inner {
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
    }
    
    .pulse-ring {
      animation-duration: 1s;
    }
  }
  
  &.active {
    .btn-inner {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }
  }
}

.chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  z-index: 1001;
}

.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .ai-floating-button {
    bottom: 15px;
    right: 15px;
  }
  
  .floating-btn {
    width: 50px;
    height: 50px;
    
    .btn-inner {
      i {
        font-size: 20px;
      }
      
      .btn-text {
        font-size: 9px;
      }
    }
    
    .pulse-ring {
      width: 50px;
      height: 50px;
    }
  }
  
  .chat-window {
    bottom: 70px;
    right: -10px;
  }
}
</style>
