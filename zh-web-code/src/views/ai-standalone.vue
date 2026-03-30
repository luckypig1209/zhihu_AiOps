<template>
  <div id="ai-standalone-app">
    <!-- AI独立应用 -->
    <router-view />
    
    <!-- AI浮动按钮 -->
    <ai-floating-button />
  </div>
</template>

<script>
import AiFloatingButton from '@/components/AiChat/FloatingButton'

export default {
  name: 'AiStandalone',
  components: {
    AiFloatingButton
  }
}
</script>

<style lang="scss">
#ai-standalone-app {
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
