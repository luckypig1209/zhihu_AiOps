<template>
  <div class="realtime-alarm-visual">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <!-- <span>实时告警监控中心</span> -->
        <el-button style="float: right; padding: 3px 0" type="text" @click="toggleAutoRefresh">
          {{ autoRefresh ? '暂停刷新' : '开始刷新' }}
        </el-button>
      </div>
      
      <div class="chart-grid">
        <!-- 告警级别分布 -->
        <div ref="levelChart" class="chart-item"></div>
        
        <!-- 告警来源分布 -->
        <div ref="sourceChart" class="chart-item"></div>

        <!-- 告警类型分布 -->
        <div ref="typeChart" class="chart-item"></div>

        <!-- 设备类型统计 -->
        <div ref="deviceChart" class="chart-item"></div>
      </div>

      <!-- 最近告警趋势 -->
      <div class="trend-chart">
        <div ref="trendChart" class="chart-full"></div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'RealtimeAlarmVisual',
  data() {
    return {
      autoRefresh: true,
      refreshInterval: null,
      // 图表实例
      levelChart: null,
      sourceChart: null,
      typeChart: null,
      deviceChart: null,
      trendChart: null,
      
      // 告警数据模型
      alarmData: {
        levels: [
          { name: '紧急告警', value: 0 },
          { name: '重要告警', value: 0 },
          { name: '次要告警', value: 0 },
          { name: '提示告警', value: 0 }
        ],
        sources: [
          { name: '虎威', value: 0 },
          { name: '机房无忧', value: 0 },
          { name: '天翼视联', value: 0 },
          { name: '5G定制网', value: 0 }
        ],
        types: [
          { name: '网络故障', value: 0 },
          { name: '服务中断', value: 0 },
          { name: '性能告警', value: 0 },
          { name: '安全事件', value: 0 }
        ],
        devices: [
          { name: '服务器', value: 0 },
          { name: '交换机', value: 0 },
          { name: '路由器', value: 0 },
          { name: '防火墙', value: 0 }
        ],
        trend: [] // 时间序列数据
      }
    };
  },
  mounted() {
    this.initCharts();
    this.startAutoRefresh();
  },
  methods: {
    // 初始化所有图表
    initCharts() {
      // 告警级别饼图
      this.levelChart = echarts.init(this.$refs.levelChart);
      this.levelChart.setOption(this.getLevelOption());

      // 告警来源柱状图
      this.sourceChart = echarts.init(this.$refs.sourceChart);
      this.sourceChart.setOption(this.getSourceOption());

      // 告警类型饼图
      this.typeChart = echarts.init(this.$refs.typeChart);
      this.typeChart.setOption(this.getTypeOption());

      // 设备类型柱状图
      this.deviceChart = echarts.init(this.$refs.deviceChart);
      this.deviceChart.setOption(this.getDeviceOption());

      // 告警趋势折线图
      this.trendChart = echarts.init(this.$refs.trendChart);
      this.trendChart.setOption(this.getTrendOption());
    },

    // 图表配置项
    getLevelOption() {
      return {
        title: { text: '告警级别分布', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '55%',
          data: this.alarmData.levels,
          emphasis: {
            itemStyle: { shadowBlur: 10 }
          }
        }]
      };
    },

    getSourceOption() {
      return {
        title: { text: '告警来源分布', left: 'center' },
        xAxis: { 
          type: 'category',
          data: this.alarmData.sources.map(item => item.name)
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: this.alarmData.sources.map(item => item.value),
          itemStyle: { color: '#409EFF' }
        }]
      };
    },

    getTypeOption() {
      return {
        title: { text: '告警类型分布', left: 'center' },
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '55%',
          data: this.alarmData.types,
          emphasis: {
            itemStyle: { shadowBlur: 10 }
          }
        }]
      };
    },

    getDeviceOption() {
      return {
        title: { text: '设备类型统计', left: 'center' },
        xAxis: { 
          type: 'category',
          data: this.alarmData.devices.map(d => d.name)
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: this.alarmData.devices.map(d => d.value),
          itemStyle: { color: '#67C23A' }
        }]
      };
    },

    getTrendOption() {
      return {
        title: { text: '最近1小时告警趋势', left: 'center' },
        xAxis: { 
          type: 'category',
          data: this.alarmData.trend.map(t => t.time)
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'line',
          data: this.alarmData.trend.map(t => t.count),
          itemStyle: { color: '#E6A23C' },
          areaStyle: {}
        }]
      };
    },

    // 生成模拟数据
    generateMockData() {
      // 告警级别
      this.alarmData.levels.forEach(item => {
        item.value = Math.floor(Math.random() * 20) + 5;
      });

      // 告警来源
      this.alarmData.sources.forEach(item => {
        item.value = Math.floor(Math.random() * 15) + 3;
      });

      // 告警类型
      this.alarmData.types.forEach(t => {
        t.value = Math.floor(Math.random() * 15) + 5;
      });

      // 设备类型
      this.alarmData.devices.forEach(d => {
        d.value = Math.floor(Math.random() * 12) + 3;
      });

      // 生成时间序列数据（最近1小时，每5分钟一个点）
      const now = new Date();
      this.alarmData.trend = Array.from({length: 12}, (_, i) => ({
        time: this.formatTime(new Date(now - (11 - i) * 5 * 60 * 1000)),
        count: Math.floor(Math.random() * 25) + 5
      }));
    },

    // 更新所有图表
    updateCharts() {
      this.levelChart.setOption({ series: [{ data: this.alarmData.levels }] });
      this.sourceChart.setOption({
        xAxis: { data: this.alarmData.sources.map(item => item.name) },
        series: [{ data: this.alarmData.sources.map(item => item.value) }]
      });
      this.typeChart.setOption({ series: [{ data: this.alarmData.types }] });
      this.deviceChart.setOption({
        xAxis: { data: this.alarmData.devices.map(d => d.name) },
        series: [{ data: this.alarmData.devices.map(d => d.value) }]
      });
      this.trendChart.setOption({
        xAxis: { data: this.alarmData.trend.map(t => t.time) },
        series: [{ data: this.alarmData.trend.map(t => t.count) }]
      });
    },

    // 启动自动刷新
    startAutoRefresh() {
      if (!this.refreshInterval && this.autoRefresh) {
        this.refreshInterval = setInterval(() => {
          this.generateMockData();
          this.updateCharts();
        }, 3000);
      }
    },

    // 停止自动刷新
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },

    // 切换刷新状态
    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh;
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },

    // 时间格式化工具
    formatTime(date) {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  },
  beforeDestroy() {
    this.stopAutoRefresh();
    if (this.levelChart) this.levelChart.dispose();
    if (this.sourceChart) this.sourceChart.dispose();
    if (this.typeChart) this.typeChart.dispose();
    if (this.deviceChart) this.deviceChart.dispose();
    if (this.trendChart) this.trendChart.dispose();
  }
};
</script>

<style scoped>
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.chart-item {
  height: 300px;
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.trend-chart {
  margin-top: 20px;
}

.chart-full {
  height: 350px;
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
</style>