<template>
  <div class="digital-staff-page">
    <!-- 顶部 Banner -->
    <div class="page-banner">
      <div class="banner-content">
        <div class="banner-icon">
          <i class="el-icon-s-custom"></i>
          <div class="icon-pulse"></div>
        </div>
        <h1 class="banner-title">智护数字员工工作站</h1>
        <p class="banner-desc">选择您需要的数字员工，开始智能运维之旅</p>
      </div>
      <div class="banner-particles">
        <span v-for="n in 8" :key="n" :class="'particle p' + n"></span>
      </div>
    </div>

    <!-- 模块卡片网格 -->
    <div class="module-grid">
      <div
        v-for="mod in modules"
        :key="mod.id"
        class="module-card"
        :class="{ disabled: !mod.enabled }"
        @click="enterModule(mod)"
      >
        <!-- 即将上线角标 -->
        <div v-if="!mod.enabled" class="coming-soon-badge">即将上线</div>

        <!-- 卡片内容 -->
        <div class="card-icon-wrapper" :style="{ background: mod.enabled ? mod.color + '18' : '#f0f0f0' }">
          <i :class="mod.icon" :style="{ color: mod.enabled ? mod.color : '#bfbfbf' }"></i>
        </div>
        <h3 class="card-title">{{ mod.name }}</h3>
        <p class="card-desc">{{ mod.description }}</p>

        <!-- skills 标签 -->
        <div class="card-tags" v-if="mod.skills.length > 0">
          <span
            v-for="skill in mod.skills"
            :key="skill"
            class="skill-tag"
            :style="{ borderColor: mod.enabled ? mod.color + '60' : '#d9d9d9', color: mod.enabled ? mod.color : '#bfbfbf' }"
          >{{ formatSkillName(skill) }}</span>
        </div>

        <!-- 进入按钮 -->
        <div class="card-action" v-if="mod.enabled">
          <span class="enter-text" :style="{ color: mod.color }">进入对话</span>
          <i class="el-icon-arrow-right" :style="{ color: mod.color }"></i>
        </div>

        <!-- 卡片底部渐变条 -->
        <div class="card-bottom-bar" :style="{ background: mod.enabled ? mod.color : '#d9d9d9' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { MODULES } from '@/utils/digitalStaffConfig'

export default {
  name: 'DigitalStaffMatrix',
  data() {
    return {
      modules: MODULES
    }
  },
  methods: {
    enterModule(mod) {
      if (!mod.enabled) return
      this.$router.push(`/smart-qa/chat/${mod.id}`)
    },
    formatSkillName(skill) {
      const nameMap = {
        'query-metrics': '指标查询',
        'query-zabbix': 'Zabbix查询',
        'full-inspection': '全面巡检',
        'add-os-monitor': 'OS监控'
      }
      return nameMap[skill] || skill
    }
  }
}
</script>

<style lang="scss" scoped>
.digital-staff-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #16213e 100%);
  padding: 40px;
  overflow-x: hidden;
}

// ==================== Banner ====================
.page-banner {
  position: relative;
  text-align: center;
  padding: 60px 0 40px;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;

  i {
    font-size: 48px;
    color: #667eea;
    display: block;
  }

  .icon-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.2);
    animation: bannerPulse 2.5s ease-in-out infinite;
  }
}

@keyframes bannerPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.banner-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.banner-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.banner-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(102, 126, 234, 0.4);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }

  @for $i from 1 through 8 {
    .p#{$i} {
      left: random(90) + 5%;
      top: random(80) + 10%;
      animation-delay: #{$i * 0.4}s;
      animation-duration: #{4 + random(4)}s;
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
}

// ==================== 模块卡片网格 ====================
.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 0 60px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.module-card {
  position: relative;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px 24px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &:hover:not(.disabled) {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;

    .card-title, .card-desc {
      color: rgba(255, 255, 255, 0.35);
    }
  }
}

.coming-soon-badge {
  position: absolute;
  top: 16px;
  right: -28px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  padding: 4px 32px;
  transform: rotate(45deg);
  letter-spacing: 1px;
}

.card-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s;

  i {
    font-size: 28px;
    transition: all 0.3s;
  }
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.card-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 16px;
  line-height: 1.6;
  min-height: 42px;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.skill-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
  border: 1px solid;
  background: transparent;
  letter-spacing: 0.5px;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 4px;

  .enter-text {
    font-size: 13px;
    font-weight: 500;
  }

  i {
    font-size: 13px;
    transition: transform 0.2s;
  }

  .module-card:hover & i {
    transform: translateX(4px);
  }
}

.card-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.6;
  transition: opacity 0.3s;

  .module-card:hover:not(.disabled) & {
    opacity: 1;
  }
}
</style>
