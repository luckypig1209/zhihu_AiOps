<template>
  <div class="smart-qa-entrance" @click="goToSmartQA">
    <div class="robot-wrapper">
      <div class="robot">
        <div class="robot-head">
          <div class="antenna"></div>
          <div class="face">
            <div class="eye left"></div>
            <div class="eye right"></div>
          </div>
        </div>
        <div class="robot-body">
          <div class="chest-light"></div>
        </div>
        <div class="arms">
          <div class="arm left">
            <div class="hand"></div>
          </div>
          <div class="arm right">
            <div class="hand"></div>
          </div>
        </div>
      </div>

      <div class="logo-badge">
        <div class="badge-bg">
          <i class="el-icon-platform-eleme"></i>
        </div>
        <span class="badge-text">智护</span>
      </div>
    </div>

    <div class="qa-text">
      <span class="label">智能问答</span>
      <div class="pulse-line">
        <span v-for="n in 3" :key="n" :class="'dot dot-' + n"></span>
      </div>
    </div>

    <div class="glow-effect"></div>
    <div class="orbit-ring"></div>
  </div>
</template>

<script>
export default {
  name: 'SmartQAEntrance',
  methods: {
    goToSmartQA() {
      this.$router.push('/ai-assistant')
    }
  }
}
</script>

<style lang="scss" scoped>
.smart-qa-entrance {
  position: relative;
  padding: 16px 20px;
  margin: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.2);

  &:hover {
    transform: translateY(-2px);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(118, 75, 162, 0.25) 100%);
    border-color: rgba(102, 126, 234, 0.4);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);

    .robot {
      animation: robot-bounce 0.6s ease infinite;
    }

    .arm {
      &.left { animation: wave-left 0.5s ease infinite; }
      &.right { animation: wave-right 0.5s ease infinite; }
    }

    .glow-effect {
      opacity: 1;
    }
  }

  .robot-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
    position: relative;
    height: 60px;

    .robot {
      position: relative;
      width: 40px;
      height: 50px;
      z-index: 2;

      .robot-head {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 28px;
        height: 22px;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px 10px 6px 6px;

        .antenna {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 8px;
          background: #667eea;
          border-radius: 2px;

          &::after {
            content: '';
            position: absolute;
            top: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: #00ff88;
            border-radius: 50%;
            box-shadow: 0 0 8px #00ff88;
            animation: antenna-glow 1.5s ease-in-out infinite;
          }
        }

        .face {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;

          .eye {
            width: 5px;
            height: 5px;
            background: #00ff88;
            border-radius: 50%;
            box-shadow: 0 0 6px #00ff88;
            animation: eye-blink 4s infinite;
          }
        }
      }

      .robot-body {
        position: absolute;
        top: 22px;
        left: 50%;
        transform: translateX(-50%);
        width: 22px;
        height: 22px;
        background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
        border-radius: 6px;

        .chest-light {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: #00ff88;
          border-radius: 50%;
          box-shadow: 0 0 10px #00ff88;
          animation: chest-pulse 2s ease-in-out infinite;
        }
      }

      .arms {
        .arm {
          position: absolute;
          top: 24px;
          width: 8px;
          height: 16px;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transform-origin: top center;

          &.left {
            left: 2px;
            transform: rotate(25deg);
          }

          &.right {
            right: 2px;
            transform: rotate(-25deg);
          }

          .hand {
            position: absolute;
            bottom: -3px;
            left: 50%;
            transform: translateX(-50%);
            width: 10px;
            height: 6px;
            background: #667eea;
            border-radius: 3px;
          }
        }
      }
    }

    .logo-badge {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;

      .badge-bg {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        animation: badge-float 3s ease-in-out infinite;

        i {
          font-size: 20px;
          color: #fff;
        }
      }

      .badge-text {
        margin-top: 4px;
        font-size: 11px;
        font-weight: 600;
        color: #fff;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .qa-text {
    text-align: center;
    position: relative;
    z-index: 2;

    .label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 6px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .pulse-line {
      display: flex;
      justify-content: center;
      gap: 4px;

      .dot {
        width: 4px;
        height: 4px;
        background: #00ff88;
        border-radius: 50%;
        animation: dot-pulse 1.4s ease-in-out infinite;

        &.dot-1 { animation-delay: 0s; }
        &.dot-2 { animation-delay: 0.2s; }
        &.dot-3 { animation-delay: 0.4s; }
      }
    }
  }

  .glow-effect {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(ellipse, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }

  .orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    border: 1px solid rgba(102, 126, 234, 0.1);
    border-radius: 50%;
    animation: orbit-rotate 10s linear infinite;
    pointer-events: none;

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #00ff88;
      border-radius: 50%;
      box-shadow: 0 0 8px #00ff88;
    }
  }
}

@keyframes robot-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes badge-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes wave-left {
  0%, 100% { transform: rotate(25deg); }
  50% { transform: rotate(45deg); }
}

@keyframes wave-right {
  0%, 100% { transform: rotate(-25deg); }
  50% { transform: rotate(-45deg); }
}

@keyframes antenna-glow {
  0%, 100% { box-shadow: 0 0 8px #00ff88; }
  50% { box-shadow: 0 0 16px #00ff88, 0 0 24px #00ff88; }
}

@keyframes chest-pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.9); }
}

@keyframes eye-blink {
  0%, 96%, 100% { opacity: 1; }
  98% { opacity: 0.2; }
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes orbit-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
