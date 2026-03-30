<template>
  <div class="fullscreen-container">
    <ScreenAdapter>
      <div class="data-screen">
        <div class="title">{{ dashboardName }}</div>

        <div class="header">
          <div
            v-if="isAll"
            class="back-button animate__animated animate__zoomIn animate__delay-0.5s"
            @click="goBack()"
          >
            <div class="back-msg">全屏</div>
          </div>
          <dataHeader></dataHeader>
        </div>
        <div class="data-content">
          <div class="left-content">
            <transactionTotal
              class="animate__animated animate__lightSpeedInLeft animate__delay-1s"
            ></transactionTotal>
            <warnimgCumulative
              class="animate__animated animate__lightSpeedInLeft animate__delay-1s"
              style="margin-top: 26px"
            >
            </warnimgCumulative>
            <userTransaction
              class="animate__animated animate__bounceInUp animate__delay-1s"
              style="margin-top: 24px"
            ></userTransaction>
          </div>
          <div class="center-content" style="position: relative">
            <centerCharts
              class="animate__animated animate__bounceInUp animate__delay-1s"
            >
            </centerCharts>
            <powerGrowth
              class="animate__animated animate__lightSpeedInLeft animate__delay-1s"
              style="margin-top: 28px"
            ></powerGrowth>
          </div>
          <div class="right-content">
            <companyOverview
              class="animate__animated animate__lightSpeedInRight animate__delay-1s"
            ></companyOverview>
            <tradingVolume
              class="animate__animated animate__lightSpeedInRight animate__delay-1s"
              style="margin-top: 26px"
            ></tradingVolume>
            <resourceDistribution
              class="animate__animated animate__lightSpeedInRight animate__delay-1s"
              style="margin-top: 24px"
            ></resourceDistribution>
          </div>
        </div>
      </div>
    </ScreenAdapter>
  </div>
</template>

<script>
import tradingVolume from "./components/tradingVolume.vue";
import "animate.css";
import warnimgCumulative from "./components/warnimgCumulative.vue";
import powerGrowth from "./components/powerGrowth.vue";
import centerMap from "./components/centerMap.vue";
import centerValue from "./components/centerValue.vue";
import userTransaction from "./components/userTransaction.vue";
import resourceDistribution from "./components/resourceDistribution.vue";
import utilizationRate from "./components/utilizationRate.vue";
import dataHeader from "./components/header.vue";
import resourceOverview from "./components/resourceOverview.vue";
import transactionTotal from "./components/transactionTotal.vue";
import companyOverview from "./components/companyOverview.vue";
import hotResourceRanking from "./components/hotResourceRanking.vue";
import centerCharts from "./components/centerCharts.vue";
// 引入适配组件
import ScreenAdapter from "@/components/common/ScreenAdapter.vue";
import { getGlobalConfig } from "@/api/system/globalConfig";
export default {
  components: {
    ScreenAdapter,
    dataHeader,
    transactionTotal,
    resourceOverview,
    utilizationRate,
    companyOverview,
    resourceDistribution,
    userTransaction,
    centerValue,
    centerMap,
    hotResourceRanking,
    powerGrowth,
    warnimgCumulative,
    tradingVolume,
    centerCharts,
  },
  props: {},
  computed: {
    dashboardName() {
      return localStorage.getItem("dashboardName") || this.$t('common.systemGlobalConfig.default.dashboardName');
    }
  },
  data() {
    return {
      viewportWidth: 0,
      viewportHeight: 0,
      isAll: true
    };
  },
  created() {
    if(this.$route.query.isAll && this.$route.query.isAll === 'yes'){
      this.isAll = false
    } else {
      this.isAll = true
    }

    // 初始化尺寸并监听变化
    this.updateViewportDimensions();
    window.addEventListener("resize", this.handleResize);
    
    // 处理全屏状态
    this.checkFullscreenStatus();
    document.addEventListener('fullscreenchange', this.checkFullscreenStatus);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener('fullscreenchange', this.checkFullscreenStatus);
  },
  methods: {
    goBack() {
      const routeData = this.$router.resolve({
        path: "/show/dataScreen",
        query:{
          isAll: 'yes'
        }
      });
      window.open(routeData.href, "_blank");
    },
    // 处理窗口大小变化
    handleResize() {
      this.updateViewportDimensions();
      // 触发重绘
      this.$nextTick(() => {
        const dataScreen = document.querySelector('.data-screen');
        if (dataScreen) {
          dataScreen.style.transform = 'scale(1)';
          dataScreen.offsetHeight; // 触发重排
          dataScreen.style.transform = '';
        }
      });
    },
    updateViewportDimensions() {
      // 使用window.innerWidth/innerHeight更准确获取视口尺寸
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
    },
    // 检查全屏状态
    checkFullscreenStatus() {
      const isFullscreen = !!document.fullscreenElement;
      if (isFullscreen) {
        // 全屏时移除可能导致滚动的样式
        document.body.style.overflow = 'hidden';
      }
    },
    getGlobalConfig() {
      this.$nextTick(()=>{
        getGlobalConfig().then((res) => {
          if (res.data && res.data.dashboardName) {
            localStorage.setItem("dashboardName", res.data.dashboardName);
          } else {
            localStorage.removeItem("dashboardName");
          }
        });
      });
    },
  },
  mounted() {
    this.getGlobalConfig();
  }
};
</script>
<style lang="scss" scoped>
// 基础样式重置
::v-deep * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

::v-deep html, ::v-deep body {
  width: 100%;
  height: 100%;
  overflow: hidden; // 禁止全局滚动
}

::v-deep .noData {
  color: #aacefa !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
}
::v-deep .no-img {
  width: 110px;
  height: 90px;
  margin-bottom: 10px;
  background-image: url("../../assets/images/dataScreen/noneData.png");
  background-size: 100%;
}
::v-deep .no-img-table {
  width: 76px;
  height: 66px;
  margin-bottom: 10px;
  background-image: url("../../assets/images/dataScreen/noneTable.png");
  background-size: 100%;
}

.fullscreen-container {
  width: 100vw;
  height: 100vh;
  background: #020518;
  overflow: hidden; // 关键：容器禁止滚动
}

.data-screen {
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/dataScreen/data-background.png");
  background-size: cover; // 使用cover替代100% 100%避免拉伸
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box; // 确保padding不影响整体尺寸

  .title {
    text-align: center;
    font-family: AlibabaPuHuiTi_3_105_Heavy;
    font-weight: 900;
    font-size: 38px;
    padding-left: 36px;
    background: -webkit-linear-gradient(left, #fff 0%, #90deff 100%);
    background: linear-gradient(to bottom, #fff 0%, #90deff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    display: inline-block;
    margin: 0 auto 20px; // 居中并添加底部间距
  }

  .header {
    position: relative;
    height: 60px; // 固定高度避免布局偏移
    margin-bottom: 20px;

    .back-button {
      width: 100px;
      height: 34px;
      position: absolute;
      right: 50px;
      top: 50%;
      transform: translateY(-50%); // 垂直居中
      z-index: 1000;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url("../../assets/images/dataScreen/back-back.png");
      background-size: 100% 100%;

      .back-msg {
        font-weight: 500;
        font-size: 16px;
        color: #ffffff;
        margin-left: 8px;
      }
    }
  }

  .data-content {
    display: flex;
    justify-content: space-between;
    flex: 1; // 占据剩余空间
    overflow: hidden; // 禁止内容区滚动

    .left-content, .right-content {
      width: 28%; // 使用百分比宽度确保自适应
      display: flex;
      flex-direction: column;
      gap: 26px; // 使用gap替代margin-top
    }

    .center-content {
      flex: 1;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      gap: 28px; // 使用gap替代margin-top
    }
  }
}

// 响应式调整
@media screen and (max-width: 1920px) {
  .data-screen .title {
    font-size: 32px;
  }
}

@media screen and (max-width: 1680px) {
  .data-screen .title {
    font-size: 28px;
  }
  
  .data-content {
    padding: 0 10px;
  }
  
  .left-content, .right-content {
    width: 27% !important;
  }
}

// 全屏模式特殊处理
@media screen and (display-mode: fullscreen) {
  .data-screen {
    padding: 10px;
  }
  
  .header .back-button {
    right: 20px;
  }
}
</style>