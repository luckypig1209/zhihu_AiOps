<template>
  <div class="health-status-container">
    <!-- 健康状态区域 -->
    <a-card class="health-status-card">
      <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            健康状态
            </div>
        </template>  
      <div class="status-circles">
        <div
          v-for="(item, index) in healthStatusList"
          :key="index"
          class="status-circle"
        >
          <!-- 使用 ECharts 绘制圆形状态图 -->
          <div :id="`statusChart_${index}`" class="chart" style="width: 100px; height: 100px;"></div>
        </div>
      </div>
    </a-card>

    <!-- 风扇信息区域 -->
    <a-card class="fan-info-card">
        <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            风扇
            </div>
        </template>        
      <div class="fan-info">
         <div class="status-circles">
        <div
          v-for="(item, index) in fanData"
          :key="index"
          class="status-circle"
        >
        <div style="display: flex;width: 150px;">
          <!-- 使用 ECharts 绘制圆形状态图 -->
           <img src="../../../../assets/zhihu/fengshan.png" alt="" style="width: 56px;height: 56px;margin: 0 10px 4px 0;vertical-align: middle;">
           <div class="fan-data">
            <p> {{ item.value }}</p>
            <p><a-tag :color="item.statusColor">{{ item.status }}</a-tag></p>
          </div>
          </div>
          </div>
        </div>
        <!-- 使用 ECharts 绘制风扇图标 -->
        <!-- <div id="fanChart" class="chart" style="width: 80px; height: 80px;"></div>
        <div class="fan-data">
          <p>转速: {{ fanData.value }} RPM</p>
          <p>状态: <a-tag :color="fanData.statusColor">{{ fanData.status }}</a-tag></p>
        </div>-->
      </div> 
    </a-card>
  </div>
</template>

<script>
import Vue from 'vue';
import * as echarts from 'echarts';

export default Vue.extend({
  data() {
    return {
      // 健康状态数据
      healthStatusList: [
        { name: '风扇', status: '异常', value: 1, color: 'red' },
        { name: '电源', status: '正常', value: 1, color: 'green' },
        { name: '温度', status: '警告', value: 1, color: 'orange' }
      ],
      // 风扇数据
      fanData: [
      {
        value: '3200',
        status: '正常',
        statusColor: 'green'
      }    
    ],
      // 图表实例
      charts: []
    };
  },
  mounted() {
    // 在下一个tick初始化图表，确保DOM已渲染
    this.$nextTick(() => {
      // 初始化健康状态圆形图表
      this.initHealthStatusCharts();
      // 初始化风扇图表
      this.initFanChart();
    });
  },
  beforeDestroy() {
    // 组件销毁前销毁所有图表实例
    this.charts.forEach(chart => {
      chart && chart.dispose();
    });
  },
  methods: {
    // 初始化健康状态圆形图表
    initHealthStatusCharts() {
      this.healthStatusList.forEach((item, index) => {
        const chartDom = document.getElementById(`statusChart_${index}`);
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        this.charts.push(myChart);
        
        const option = {
          series: [
            {
              type: 'pie',
              radius: ['60%', '80%'],
              color: [item.color],
              avoidLabelOverlap: false,
              silent: true,
              itemStyle: {
                borderWidth: 2,
                borderColor: '#fff'
              },
              label: {
                show: true,
                position: 'center',
                formatter: `${item.name}\n${item.status}`,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333'
              },
              emphasis: {
                scale: false,
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: item.value, name: item.status }
              ]
            }
          ]
        };
        myChart.setOption(option);
      });
    },
    // 初始化风扇图表
    initFanChart() {
    //
    }
  }
});
</script>

<style scoped>
.health-status-container {
  padding: 20px;
  background-color: #fff;
}

/* 健康状态卡片样式 */
.health-status-card {
  margin-bottom: 20px;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.status-circles {
  display: flex;
  gap: 40px;
  justify-content: flex-start;
  padding: 20px;
  flex-wrap: wrap;
}

.status-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 风扇信息卡片样式 */
.fan-info-card {
  margin-bottom: 20px;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.fan-info {
  display: flex;
  align-items: center;
  padding: 0;
}

.fan-data {
  margin-left: 10px;
  line-height: 16px;
}

.fan-data p {
  margin: 8px 0;
  font-size: 16px;
}

.chart {
  margin: 0 auto;
}
.custom-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-marker {
  width: 4px;
  height: 16px;
  background-color: #1890ff;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>