<template>
  <div class="smart-qa-page">
    <div class="hero-section">
      <div class="robot-showcase">
        <div class="floating-robot">
          <div class="robot-body-container">
            <div class="robot-head">
              <div class="antenna">
                <div class="signal"></div>
              </div>
              <div class="face">
                <div class="eye left">
                  <div class="pupil"></div>
                </div>
                <div class="eye right">
                  <div class="pupil"></div>
                </div>
                <div class="mouth"></div>
              </div>
            </div>
            <div class="robot-torso">
              <div class="chest-panel">
                <div class="panel-light"></div>
                <div class="panel-grid"></div>
              </div>
            </div>
            <div class="robot-arms">
              <div class="arm left-arm">
                <div class="upper-arm"></div>
                <div class="lower-arm"></div>
                <div class="hand">
                  <div class="finger"></div>
                  <div class="finger"></div>
                  <div class="finger"></div>
                </div>
              </div>
              <div class="arm right-arm">
                <div class="upper-arm"></div>
                <div class="lower-arm"></div>
                <div class="hand">
                  <div class="finger"></div>
                  <div class="finger"></div>
                  <div class="finger"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="logo-platform">
            <div class="platform-base">
              <div class="base-glow"></div>
            </div>
            <div class="logo-container">
              <div class="logo-icon-wrapper">
                <i class="el-icon-platform-eleme"></i>
                <div class="icon-ring"></div>
              </div>
              <div class="logo-text">智护</div>
              <div class="logo-subtitle">SmartGuard</div>
            </div>
          </div>
        </div>

        <div class="orbital-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>

        <div class="floating-particles">
          <div v-for="n in 12" :key="n" :class="'particle p' + n"></div>
        </div>
      </div>

      <div class="hero-content">
        <h1 class="title">
          <span class="gradient-text">智能问答</span>
          <span class="badge">AI</span>
        </h1>
        <p class="subtitle">智护运维助手，让问题迎刃而解</p>
        <div class="features">
          <div class="feature-item">
            <i class="el-icon-data-analysis"></i>
            <span>指标查询</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-warning"></i>
            <span>告警分析</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-cpu"></i>
            <span>资源巡检</span>
          </div>
        </div>
        <el-button type="primary" size="large" class="start-btn" @click="enterChat">
          <i class="el-icon-chat-dot-round"></i>
          开始对话
        </el-button>
      </div>
    </div>

    <div class="capabilities-section">
      <h2 class="section-title">智能能力</h2>
      <div class="capability-grid">
        <div class="capability-card" v-for="(cap, index) in capabilities" :key="index">
          <div class="card-icon">
            <i :class="cap.icon"></i>
          </div>
          <h3>{{ cap.title }}</h3>
          <p>{{ cap.desc }}</p>
          <div class="card-glow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SmartQAPage',
  data() {
    return {
      capabilities: [
        {
          icon: 'el-icon-odometer',
          title: '实时监控',
          desc: '查询CPU、内存、磁盘、网络等系统指标，实时掌握运行状态'
        },
        {
          icon: 'el-icon-bell',
          title: '告警分析',
          desc: '快速查询当前告警，分析故障原因，提供处理建议'
        },
        {
          icon: 'el-icon-search',
          title: '资产检索',
          desc: '通过关键字或IP地址快速查找监控对象和主机信息'
        },
        {
          icon: 'el-icon-document-checked',
          title: '全面巡检',
          desc: '一键生成系统健康报告，覆盖所有关键指标'
        },
        {
          icon: 'el-icon-s-grid',
          title: '资源统计',
          desc: '统计网络设备、操作系统等各类资产数量'
        },
        {
          icon: 'el-icon-chat-line-round',
          title: '智能对话',
          desc: '自然语言交互，无需记忆复杂命令'
        }
      ]
    }
  },
  methods: {
    enterChat() {
      this.$router.push('/ai-assistant')
    }
  }
}
</script>

<style lang="scss" scoped>
.smart-qa-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #16213e 100%);
  padding: 40px;
  overflow-x: hidden;
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  min-height: 500px;
  margin-bottom: 60px;
}

.robot-showcase {
  position: relative;
  width: 400px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-robot {
  position: relative;
  z-index: 10;
  animation: robot-float 4s ease-in-out infinite;
}

.robot-body-container {
  position: relative;
  width: 100px;
  height: 140px;
  margin: 0 auto 20px;
}

.robot-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 50px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 12px 12px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);

  .antenna {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 15px;
    background: linear-gradient(180deg, #00ff88, #667eea);
    border-radius: 2px;

    .signal {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 12px;
      height: 12px;
      background: #00ff88;
      border-radius: 50%;
      box-shadow: 0 0 20px #00ff88, 0 0 40px #00ff88;
      animation: signal-pulse 1.5s ease-in-out infinite;
    }
  }

  .face {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 25px;

    .eye {
      position: absolute;
      top: 0;
      width: 14px;
      height: 14px;
      background: #1a1a3e;
      border-radius: 50%;
      overflow: hidden;

      &.left { left: 0; }
      &.right { right: 0; }

      .pupil {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: #00ff88;
        border-radius: 50%;
        box-shadow: 0 0 10px #00ff88;
        animation: pupil-move 3s ease-in-out infinite;
      }
    }

    .mouth {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 6px;
      background: #00ff88;
      border-radius: 0 0 8px 8px;
      animation: mouth-smile 2s ease-in-out infinite;
    }
  }
}

.robot-torso {
  position: absolute;
  top: 55px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 45px;
  background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
  border-radius: 12px;

  .chest-panel {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    overflow: hidden;

    .panel-light {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background: #00ff88;
      border-radius: 50%;
      box-shadow: 0 0 15px #00ff88;
      animation: panel-blink 2s ease-in-out infinite;
    }

    .panel-grid {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
      background-size: 5px 5px;
    }
  }
}

.robot-arms {
  .arm {
    position: absolute;
    top: 60px;
    width: 35px;
    height: 50px;

    &.left-arm {
      left: -25px;
      animation: arm-wave-left 2s ease-in-out infinite;
    }

    &.right-arm {
      right: -25px;
      animation: arm-wave-right 2s ease-in-out infinite;
    }

    .upper-arm {
      position: absolute;
      top: 0;
      width: 12px;
      height: 25px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      left: 50%;
      transform: translateX(-50%);
    }

    .lower-arm {
      position: absolute;
      top: 20px;
      width: 10px;
      height: 20px;
      background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
      border-radius: 5px;
      left: 50%;
      transform: translateX(-50%);
    }

    .hand {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 2px;

      .finger {
        width: 4px;
        height: 10px;
        background: #667eea;
        border-radius: 2px;
      }
    }
  }
}

.logo-platform {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .platform-base {
    position: absolute;
    bottom: -10px;
    width: 120px;
    height: 20px;
    background: radial-gradient(ellipse, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;

    .base-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 8px;
      background: #00d4ff;
      border-radius: 4px;
      box-shadow: 0 0 20px #00d4ff, 0 0 40px #00d4ff;
      animation: base-pulse 2s ease-in-out infinite;
    }
  }

  .logo-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 20px;
    border: 1px solid rgba(0, 212, 255, 0.3);
    backdrop-filter: blur(10px);

    .logo-icon-wrapper {
      position: relative;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;

      i {
        font-size: 36px;
        color: #00d4ff;
        z-index: 2;
      }

      .icon-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 70px;
        height: 70px;
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 50%;
        animation: ring-expand 2s ease-out infinite;
      }
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    }

    .logo-subtitle {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 2px;
      margin-top: 2px;
    }
  }
}

.orbital-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;

  .ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px dashed;

    &.ring-1 {
      width: 300px;
      height: 300px;
      border-color: rgba(102, 126, 234, 0.2);
      animation: orbit-cw 20s linear infinite;
    }

    &.ring-2 {
      width: 340px;
      height: 340px;
      border-color: rgba(118, 75, 162, 0.15);
      animation: orbit-ccw 25s linear infinite;
    }

    &.ring-3 {
      width: 380px;
      height: 380px;
      border-color: rgba(0, 212, 255, 0.1);
      animation: orbit-cw 30s linear infinite;
    }
  }
}

.floating-particles {
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
    animation: particle-float 4s ease-in-out infinite;

    &.p1 { top: 10%; left: 20%; animation-delay: 0s; }
    &.p2 { top: 20%; left: 80%; animation-delay: 0.3s; }
    &.p3 { top: 70%; left: 15%; animation-delay: 0.6s; }
    &.p4 { top: 80%; left: 75%; animation-delay: 0.9s; }
    &.p5 { top: 30%; left: 10%; animation-delay: 1.2s; }
    &.p6 { top: 60%; left: 85%; animation-delay: 1.5s; }
    &.p7 { top: 15%; left: 50%; animation-delay: 1.8s; }
    &.p8 { top: 85%; left: 40%; animation-delay: 2.1s; }
    &.p9 { top: 40%; left: 25%; animation-delay: 2.4s; }
    &.p10 { top: 50%; left: 70%; animation-delay: 2.7s; }
    &.p11 { top: 25%; left: 65%; animation-delay: 3s; }
    &.p12 { top: 75%; left: 30%; animation-delay: 3.3s; }
  }
}

.hero-content {
  max-width: 400px;
  color: #fff;

  .title {
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;

    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #00d4ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .badge {
      font-size: 14px;
      padding: 4px 12px;
      background: linear-gradient(135deg, #00ff88 0%, #00d4ff 100%);
      color: #0a0a1a;
      border-radius: 20px;
      font-weight: 600;
    }
  }

  .subtitle {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 32px;
  }

  .features {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);

      i {
        font-size: 18px;
        color: #00ff88;
      }

      span {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .start-btn {
    padding: 16px 40px;
    font-size: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 30px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
    }

    i {
      margin-right: 8px;
      font-size: 18px;
    }
  }
}

.capabilities-section {
  .section-title {
    text-align: center;
    font-size: 32px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 40px;
  }

  .capability-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }

  .capability-card {
    position: relative;
    padding: 30px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(102, 126, 234, 0.3);

      .card-glow {
        opacity: 1;
      }
    }

    .card-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
      border-radius: 12px;
      margin-bottom: 16px;

      i {
        font-size: 24px;
        color: #667eea;
      }
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse at center, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
  }
}

@keyframes robot-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes signal-pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
  50% { transform: translateX(-50%) scale(1.3); opacity: 0.7; }
}

@keyframes pupil-move {
  0%, 100% { transform: translate(-50%, -50%) translateX(0); }
  25% { transform: translate(-50%, -50%) translateX(-2px); }
  75% { transform: translate(-50%, -50%) translateX(2px); }
}

@keyframes mouth-smile {
  0%, 100% { border-radius: 0 0 8px 8px; }
  50% { border-radius: 0 0 12px 12px; width: 20px; }
}

@keyframes panel-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes arm-wave-left {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

@keyframes arm-wave-right {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-15deg); }
}

@keyframes base-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 20px #00d4ff; }
  50% { opacity: 0.7; box-shadow: 0 0 40px #00d4ff, 0 0 60px #00d4ff; }
}

@keyframes ring-expand {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

@keyframes orbit-cw {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes orbit-ccw {
  from { transform: translate(-50%, -50%) rotate(360deg); }
  to { transform: translate(-50%, -50%) rotate(0deg); }
}

@keyframes particle-float {
  0% { opacity: 0; transform: translateY(0) scale(0); }
  50% { opacity: 1; transform: translateY(-20px) scale(1); }
  100% { opacity: 0; transform: translateY(-40px) scale(0); }
}
</style>
