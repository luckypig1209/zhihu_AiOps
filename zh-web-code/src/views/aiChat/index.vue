<template>
  <div class="ai-chat-page">
    <AiAssistant />
  </div>
</template>

<script>
import AiAssistant from '@/views/aiAssistant/index.vue'

export default {
  name: 'AIChat',
  components: {
    AiAssistant
  }
}
</script>

<style lang="scss" scoped>
.ai-chat-page {
  height: 100vh;
}
</style>
