<template>
  <div class="ai-standalone-page">
    <div class="floating-robot">
      <div class="robot-container">
        <div class="robot">
          <div class="robot-head">
            <div class="robot-eyes">
              <div class="eye left"></div>
              <div class="eye right"></div>
            </div>
            <div class="robot-antenna"></div>
          </div>
          <div class="robot-body">
            <div class="robot-chest">
              <i class="el-icon-s-opportunity"></i>
            </div>
            <div class="robot-arms">
              <div class="arm left"></div>
              <div class="arm right"></div>
            </div>
          </div>
        </div>
        <div class="logo-platform">
          <div class="logo-icon">
            <i class="el-icon-platform-eleme"></i>
          </div>
          <span class="logo-text">智护</span>
        </div>
      </div>
      <div class="glow-ring"></div>
      <div class="particles">
        <span v-for="n in 6" :key="n" :class="'particle p' + n"></span>
      </div>
    </div>

    <div class="ai-chat-container">
      <AiAssistant />
    </div>
  </div>
</template>

<script>
import AiAssistant from '@/views/aiAssistant/index.vue'

export default {
  name: 'AIStandalone',
  components: {
    AiAssistant
  }
}
</script>

<style lang="scss" scoped>
.ai-standalone-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  overflow: hidden;

  .floating-robot {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    height: 300px;
    z-index: 1;
    pointer-events: none;

    .robot-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .robot {
        width: 80px;
        height: 100px;
        position: relative;
        animation: float 3s ease-in-out infinite;

        .robot-head {
          width: 50px;
          height: 40px;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px 12px 8px 8px;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

          .robot-eyes {
            display: flex;
            gap: 8px;
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);

            .eye {
              width: 8px;
              height: 8px;
              background: #00ff88;
              border-radius: 50%;
              animation: blink 4s infinite;
              box-shadow: 0 0 10px #00ff88;
            }
          }

          .robot-antenna {
            width: 4px;
            height: 12px;
            background: #667eea;
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 2px;

            &::after {
              content: '';
              width: 8px;
              height: 8px;
              background: #00ff88;
              border-radius: 50%;
              position: absolute;
              top: -8px;
              left: 50%;
              transform: translateX(-50%);
              animation: pulse 1.5s ease-in-out infinite;
            }
          }
        }

        .robot-body {
          width: 40px;
          height: 45px;
          background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
          border-radius: 8px;
          position: absolute;
          top: 42px;
          left: 50%;
          transform: translateX(-50%);

          .robot-chest {
            width: 20px;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;

            i {
              color: #00ff88;
              font-size: 12px;
            }
          }

          .robot-arms {
            .arm {
              width: 12px;
              height: 30px;
              background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
              border-radius: 6px;
              position: absolute;
              top: 5px;

              &.left {
                left: -14px;
                transform: rotate(30deg);
                animation: wave-left 2s ease-in-out infinite;
              }

              &.right {
                right: -14px;
                transform: rotate(-30deg);
                animation: wave-right 2s ease-in-out infinite;
              }
            }
          }
        }
      }

      .logo-platform {
        position: absolute;
        bottom: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: platform-float 3s ease-in-out infinite;

        .logo-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
          margin-bottom: 8px;

          i {
            font-size: 32px;
            color: #fff;
          }
        }

        .logo-text {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .glow-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 280px;
      height: 280px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 50%;
      animation: rotate 20s linear infinite;

      &::before,
      &::after {
        content: '';
        position: absolute;
        border-radius: 50%;
        border: 1px solid;
      }

      &::before {
        top: 20px;
        left: 20px;
        right: 20px;
        bottom: 20px;
        border-color: rgba(118, 75, 162, 0.3);
        animation: rotate-reverse 15s linear infinite;
      }

      &::after {
        top: 40px;
        left: 40px;
        right: 40px;
        bottom: 40px;
        border-color: rgba(0, 212, 255, 0.2);
        animation: rotate 10s linear infinite;
      }
    }

    .particles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        opacity: 0;
        animation: particle 3s ease-in-out infinite;

        &.p1 { top: 20%; left: 20%; animation-delay: 0s; }
        &.p2 { top: 30%; left: 80%; animation-delay: 0.5s; }
        &.p3 { top: 70%; left: 15%; animation-delay: 1s; }
        &.p4 { top: 80%; left: 75%; animation-delay: 1.5s; }
        &.p5 { top: 40%; left: 10%; animation-delay: 2s; }
        &.p6 { top: 60%; left: 85%; animation-delay: 2.5s; }
      }
    }
  }

  .ai-chat-container {
    position: relative;
    z-index: 10;
    height: 100vh;
    padding: 20px;
    box-sizing: border-box;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(26, 26, 46, 0.85);
      backdrop-filter: blur(10px);
      z-index: -1;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

@keyframes platform-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes blink {
  0%, 96%, 100% { opacity: 1; }
  98% { opacity: 0.3; }
}

@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
  50% { transform: translateX(-50%) scale(1.3); opacity: 0.7; }
}

@keyframes wave-left {
  0%, 100% { transform: rotate(30deg); }
  50% { transform: rotate(45deg); }
}

@keyframes wave-right {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-45deg); }
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes rotate-reverse {
  from { transform: translate(-50%, -50%) rotate(360deg); }
  to { transform: translate(-50%, -50%) rotate(0deg); }
}

@keyframes particle {
  0% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0) translateY(-20px); }
}
</style>
