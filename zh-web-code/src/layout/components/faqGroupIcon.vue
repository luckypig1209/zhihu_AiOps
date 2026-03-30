<template>
  <a-tooltip 
    placement="bottom" 
    :mouseEnterDelay="0.3"
    overlayClassName="faq-qrcode-tooltip"
  >
    <!-- 答疑群图标 -->
    <template slot="title">
      <div class="qrcode-container">
        <img 
          src="../../assets/zhihu/dayi.png" 
          alt="答疑群二维码" 
          class="qrcode-img"
        >
        <p class="qrcode-text" style="color: #fff;">{{ $t('faq.qrcodeText') }}</p>
      </div>
    </template>
    
    <div class="faq-icon-container">
      <!-- 对话气泡背景 -->
      <div class="faq-bubble">
        <!-- 问号图标 -->
        <div class="faq-question-mark">?</div>
        <!-- 气泡小三角 -->
      </div>
    </div>
  </a-tooltip>
</template>

<script>
export default {
  name: 'FaqGroupIcon',
  props: {
    // 二维码图片地址，可通过props传入
    qrcodeUrl: {
      type: String,
      default: 'https://picsum.photos/200/200?random=1' // 默认占位图
    },
    // 图标大小
    size: {
      type: Number,
      default: 64
    },
    // 气泡颜色
    bubbleColor: {
      type: String,
      default: '#40a9ff' // ant-design-vue的蓝色
    },
    // 问号颜色
    questionColor: {
      type: String,
      default: '#ffffff'
    }
  },
  computed: {
    // 计算样式，根据props动态调整大小和颜色
    iconStyles() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      }
    },
    bubbleStyles() {
      return {
        backgroundColor: this.bubbleColor,
        width: `${this.size * 0.8}px`,
        height: `${this.size * 0.8}px`
        // 其他尺寸相关样式通过计算得出
      }
    },
    questionStyles() {
      return {
        color: this.questionColor,
        fontSize: `${this.size * 0.5}px`
      }
    }
  }
}
</script>

<style scoped>
.faq-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.faq-icon-container:hover {
  transform: scale(1.05);
}

.faq-bubble {
  position: relative;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.faq-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.faq-question-mark {
  font-weight: bold;
  font-family: Arial, sans-serif;
  line-height: 1;
  font-size: 16px;
  color: #fff;
  background-color: #40a9ff;
  padding: 3px 6px;
  border-radius: 100%;
}

.faq-bubble-triangle {
  position: absolute;
  bottom: -6px;
  right: 12px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #40a9ff;
}

/* 二维码提示框样式 */
.qrcode-container {
  padding: 12px;
  text-align: center;
}

.qrcode-img {
  width: 160px;
  height: 160px;
  object-fit: contain;
  border: 1px solid #eee;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qrcode-text {
  margin-top: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 自定义tooltip样式 */
::v-deep .faq-qrcode-tooltip .ant-tooltip-inner {
  padding: 0;
  background-color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

::v-deep .faq-qrcode-tooltip .ant-tooltip-arrow::before {
  background-color: #fff;
  box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
}
</style>
