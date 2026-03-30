<template>
  <div class="dashboard-container">
    <!-- 顶部：设备状态统计 + 制造商分布图表 + 制造商分布统计 -->
    <a-row :gutter="24">
      <!-- 设备状态统计：添加自定义类用于单独控制样式 -->
      <a-col :span="6">
        <a-card title="设备状态统计" class="card-container device-status-card">
          <div class="switch-status">
            <h3>交换机</h3>
            <ul>
              <li>
                <span class="status-dot normal"></span>正常: {{ deviceStatus.normal }}
              </li>
              <li>
                <span class="status-dot warning"></span>告警: {{ deviceStatus.warning }}
              </li>
              <li>
                <span class="status-dot unknown"></span>未知: {{ deviceStatus.unknown }}
              </li>
              <li>
                <span class="status-dot abnormal"></span>异常: {{ deviceStatus.abnormal }}
              </li>
            </ul>
            <div class="total-count">总计: {{ deviceStatus.total }}</div>
          </div>
          <div class="current-alert-summary">
            <h4>当前告警</h4>
            <div class="alert-types">
              <div class="alert-type-item">
                <span class="alert-level emergency">紧急</span>
                <span class="count">{{ alertSummary.emergency }}</span>
              </div>
              <div class="alert-type-item">
                <span class="alert-level serious">严重</span>
                <span class="count">{{ alertSummary.serious }}</span>
              </div>
              <div class="alert-type-item">
                <span class="alert-level normal">普通</span>
                <span class="count">{{ alertSummary.normal }}</span>
              </div>
              <div class="alert-type-item">
                <span class="alert-level warning">预警</span>
                <span class="count">{{ alertSummary.warning }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card title="制造商分布图表" class="card-container">
          <div ref="manufacturerChart" class="chart-container"></div>
        </a-card>
      </a-col>
      <!-- 制造商分布统计：删除走马灯，改用网格布局 -->
      <a-col :span="12">
        <a-card title="制造商分布统计" class="card-container">
          <div class="manufacturer-grid">
            <a-card
              v-for="(m, idx) in manufacturers"
              :key="idx"
              class="manufacturer-card"
            >
              <div class="manufacturer-card-content">
                <h3>{{ m.name }}</h3>
                <p>总数: {{ m.total }}</p>
                <ul>
                  <li>
                    <span class="status-dot unknown"></span>未知: {{ m.unknown }}
                  </li>
                  <li>
                    <span class="status-dot normal"></span>正常: {{ m.normal }}
                  </li>
                  <li>
                    <span class="status-dot warning"></span>告警: {{ m.warning }}
                  </li>
                  <li>
                    <span class="status-dot abnormal"></span>异常: {{ m.abnormal }}
                  </li>
                </ul>
              </div>
            </a-card>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 中部：当前告警列表 + 累计告警统计（环形图） -->
    <a-row :gutter="16" style="margin-top: 16px;">
      <a-col :span="16">
        <a-card title="当前告警" class="card-container">
          <div class="alert-list">
            <div
              v-for="(alert, idx) in currentAlerts"
              :key="idx"
              class="alert-item"
            >
              <div class="alert-header">
                <span
                  :class="['alert-level-tag', `alert-level-${alert.level}`]"
                >{{ alert.levelText }}</span>
                <span class="alert-time">{{ alert.time }}</span>
                <span class="alert-time-detail">{{ alert.timeDetail }}</span>
              </div>
              <div class="alert-content">
                <span :class="['alert-icon', `alert-icon-${alert.iconType}`]"></span>
                <div class="alert-text">
                  <p class="alert-title">{{ alert.content }}</p>
                  <p class="alert-meta">
                    <span>资源类型: {{ alert.resourceType }}</span>
                    <span class="resource-separator">|</span>
                    <span>资源: {{ alert.resource }}</span>
                  </p>
                </div>
              </div>
              <div class="alert-handle">
                <a-tag color="red">{{ alert.handleStatus }}</a-tag>
              </div>
            </div>
            <div class="more-alert" v-if="showMore">更多</div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="累计告警统计" class="card-container">
          <div ref="alertChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部：性能统计表格 -->
    <a-card title="性能统计" class="card-container" style="margin-top: 16px;">
      <a-table
        :columns="performanceColumns"
        :data-source="performanceData"
        bordered
        size="middle"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
export default {
  data() {
    return {
      deviceStatus: { normal: 2, warning: 1, unknown: 0, abnormal: 10, total: 13 },
      alertSummary: { emergency: 1, serious: 2, normal: 7, warning: 0 },
      manufacturers: [
        { name: '华为', total: 6, unknown: 0, normal: 1, warning: 0, abnormal: 5 },
        { name: '新华三', total: 2, unknown: 1, normal: 1, warning: 0, abnormal: 0 },
        { name: '锐捷', total: 2, unknown: 0, normal: 0, warning: 0, abnormal: 2 },
        { name: 'TP-LINK', total: 2, unknown: 0, normal: 1, warning: 0, abnormal: 1 },
        { name: '思科', total: 1, unknown: 0, normal: 1, warning: 0, abnormal: 0 },
      ],
      currentAlerts: [
        { time: '2025-08-29 14:37:27', timeDetail: '持续 3d23h36m', level: 'warning', levelText: '预警', iconType: 'host', content: '宿主机 10.10.0.201: 电源状态异常', resourceType: '虚拟化', resource: 'VMware vCenter', handleStatus: '待处理' },
        { time: '2025-08-29 14:37:27', timeDetail: '持续 3d23h36m', level: 'warning', levelText: '预警', iconType: 'host', content: '宿主机 10.10.0.202: 电源状态异常', resourceType: '虚拟化', resource: 'VMware vCenter', handleStatus: '待处理' },
        { time: '2025-08-29 14:37:27', timeDetail: '持续 3d23h36m', level: 'warning', levelText: '预警', iconType: 'host', content: '宿主机 10.10.0.206: 电源状态异常', resourceType: '虚拟化', resource: 'VMware vCenter', handleStatus: '待处理' },
        { time: '2025-08-29 14:22:41', timeDetail: '持续 3d23h21m', level: 'warning', levelText: '预警', iconType: 'os', content: 'OS: Agent 不可用', resourceType: '操作系统', resource: 'lv_parallelis_prd', handleStatus: '待处理' },
        { time: '2025-08-29 14:22:31', timeDetail: '持续 3d23h15m', level: 'warning', levelText: '预警', iconType: 'os', content: 'OS: Agent 不可用', resourceType: '操作系统', resource: 'lv_idap_prd', handleStatus: '待处理' },
        { time: '2025-08-29 14:19:08', timeDetail: '持续 3d23h44m', level: 'serious', levelText: '严重', iconType: 'os', content: 'OS: ICMP Ping 不通', resourceType: '操作系统', resource: 'lv_parallelis_prd', handleStatus: '待处理' },
        { time: '2025-08-29 14:19:05', timeDetail: '持续 3d23h44m', level: 'serious', levelText: '严重', iconType: 'os', content: 'OS: ICMP Ping 不通', resourceType: '操作系统', resource: 'lv_idap_prd', handleStatus: '待处理' },
        { time: '2025-08-29 13:44:42', timeDetail: '持续 4h28m', level: 'warning', levelText: '预警', iconType: 'db', content: 'DM: 表空间 PROD 使用率持续 5 分钟大于 80%', resourceType: '数据库', resource: 'lv_opensense_prd - 达梦', handleStatus: '待处理' },
      ],
      showMore: true,
      performanceColumns: [
        { title: '状态', dataIndex: 'status', key: 'status' },
        { title: '名称', dataIndex: 'name', key: 'name' },
        { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
        { title: '当前告警', dataIndex: 'currentAlert', key: 'currentAlert' },
        { title: 'CPU使用率(%)', dataIndex: 'cpuUsage', key: 'cpuUsage' },
        { title: '内存使用率(%)', dataIndex: 'memUsage', key: 'memUsage' },
        { title: '丢包率(%)', dataIndex: 'packetLoss', key: 'packetLoss' },
      ],
      performanceData: [
        { status: '告警', name: '办公汇聚交换机', ip: '10.10.2.1', currentAlert: 2, cpuUsage: 15, memUsage: 38, packetLoss: 0 },
        { status: '异常', name: '机房1801汇聚交换机3', ip: '10.10.6.181', currentAlert: 0, cpuUsage: 11, memUsage: 9.16, packetLoss: 0 },
        { status: '异常', name: '机房1801汇聚交换机1', ip: '10.10.6.171', currentAlert: 0, cpuUsage: 9, memUsage: 74, packetLoss: 0 },
        { status: '异常', name: '机房1801接入交换机', ip: '10.10.0.152', currentAlert: 0, cpuUsage: 8, memUsage: 74, packetLoss: 0 },
        { status: '正常', name: '核心交换机', ip: '10.10.1.1', currentAlert: 1, cpuUsage: 5, memUsage: 18, packetLoss: 0 },
      ],
      manufacturerChart: null,
      alertChart: null,
    };
  },
  methods: {
    initManufacturerChart() {
      const chartDom = this.$refs.manufacturerChart;
      if (chartDom) {
        this.manufacturerChart = echarts.init(chartDom);
        const option = {
          title: {
            text: '各制造商设备状态分布',
            left: 'center',
            textStyle: { fontSize: 14, color: '#333' }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: '{b}<br/>{a}: {c}台'
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '18%',
            top: '20%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: this.manufacturers.map(m => m.name),
            name: '制造商',
            nameTextStyle: { fontSize: 12, color: '#666' },
            axisLabel: { rotate: 15 }
          },
          yAxis: {
            type: 'value',
            name: '设备数量（台）',
            nameTextStyle: { fontSize: 12, color: '#666' },
            min: 0
          },
          series: [
            { name: '未知', type: 'bar', data: this.manufacturers.map(m => m.unknown), itemStyle: { color: '#808080', borderRadius: [4, 4, 0, 0] } },
            { name: '正常', type: 'bar', data: this.manufacturers.map(m => m.normal), itemStyle: { color: '#00ff00', borderRadius: [4, 4, 0, 0] } },
            { name: '告警', type: 'bar', data: this.manufacturers.map(m => m.warning), itemStyle: { color: '#ffaa00', borderRadius: [4, 4, 0, 0] } },
            { name: '异常', type: 'bar', data: this.manufacturers.map(m => m.abnormal), itemStyle: { color: '#ff0000', borderRadius: [4, 4, 0, 0] } },
          ],
          legend: {
            data: ['未知', '正常', '告警', '异常'],
            bottom: 0,
            left: 'center',
            textStyle: { fontSize: 12 }
          }
        };
        this.manufacturerChart.setOption(option);
      }
    },
    initAlertChart() {
      const chartDom = this.$refs.alertChart;
      if (chartDom) {
        this.alertChart = echarts.init(chartDom);
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}条 ({d}%)'
          },
          grid: {
            left: '3%',
            right: '3%',
            top: '10%',
            bottom: '10%',
            containLabel: true
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '50%'],
              data: [
                { value: this.alertSummary.emergency, name: '紧急', itemStyle: { color: '#ff0000' } },
                { value: this.alertSummary.serious, name: '严重', itemStyle: { color: '#ff6600' } },
                { value: this.alertSummary.normal, name: '普通', itemStyle: { color: '#0080ff' } },
                { value: this.alertSummary.warning, name: '预警', itemStyle: { color: '#00cc99' } },
              ],
              label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {c}条'
              },
              labelLine: { show: true }
            }
          ],
          legend: {
            orient: 'horizontal',
            right: 'center',
            bottom: '0',
            data: ['紧急', '严重', '普通', '预警'],
            textStyle: { fontSize: 12 }
          }
        };
        this.alertChart.setOption(option);
      }
    },
    getStatusColor(status) {
      switch (status) {
        case '正常': return 'green';
        case '告警': return 'orange';
        case '异常': return 'red';
        default: return 'gray';
      }
    },
    handleResize() {
      this.manufacturerChart && this.manufacturerChart.resize();
      this.alertChart && this.alertChart.resize();
    }
  },
  mounted() {
    this.initManufacturerChart();
    this.initAlertChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    if (this.manufacturerChart) {
      this.manufacturerChart.dispose();
      this.manufacturerChart = null;
    }
    if (this.alertChart) {
      this.alertChart.dispose();
      this.alertChart = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
  background-color: #f0f2f5;
}

/* 1. 全局卡片高度调整为50vh */
.card-container {
  height: 50vh;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 卡片标题栏统一高度，确保内容区对齐 */
.card-container >>> .ant-card-head {
  min-height: 40px;
}

/* 2. 设备状态统计卡片：取消滚动，全量展示内容 */
.device-status-card >>> .ant-card-body {
  overflow: visible !important; /* 禁用滚动 */
  flex: none !important; /* 取消弹性占满，让内容自然展开 */
  padding: 16px 20px;
}
/* 调整设备状态统计内部间距，避免内容拥挤 */
.device-status-card .switch-status {
  margin-bottom: 24px;
}
.device-status-card .current-alert-summary {
  margin-top: 12px;
}
.device-status-card .alert-types {
  gap: 8px; /* 增加告警类型间距，避免换行 */
}

/* 基础样式复用（原有样式保留） */
.card-container >>> .ant-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.switch-status h3 { 
  font-size: 16px; 
  font-weight: 600; 
  margin-bottom: 12px; 
  color: #333; 
}
.switch-status ul { 
  list-style: none; 
  padding: 0; 
  margin-bottom: 12px;
}
.switch-status li { 
  margin-bottom: 8px; 
  display: flex; 
  align-items: center; 
  font-size: 14px; 
  color: #666; 
}

.status-dot { 
  display: inline-block; 
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
  margin-right: 8px; 
}
.status-dot.normal { background-color: #00ff00; }
.status-dot.warning { background-color: #ffaa00; }
.status-dot.unknown { background-color: #808080; }
.status-dot.abnormal { background-color: #ff0000; }

.total-count { 
  font-size: 18px; 
  font-weight: bold; 
  margin-top: 8px; 
  color: #333; 
  text-align: center;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.current-alert-summary h4 { 
  font-size: 16px; 
  font-weight: 600; 
  margin-bottom: 12px; 
  color: #333; 
}
.current-alert-summary .alert-types { 
  display: flex; 
  justify-content: space-around; 
  margin-top: 8px; 
}
.alert-type-item { 
  text-align: center; 
  flex: 1;
}
.alert-level { 
  display: block; 
  padding: 4px 8px; 
  border-radius: 4px; 
  color: white; 
  margin-bottom: 4px; 
  font-size: 12px; 
  font-weight: 500; 
}
.alert-level.emergency { background-color: #ff0000; }
.alert-level.serious { background-color: #ff6600; }
.alert-level.normal { background-color: #0080ff; }
.alert-level.warning { background-color: #00cc99; }
.alert-type-item .count { 
  font-size: 16px; 
  font-weight: bold;
  color: #333; 
}

/* 3. 制造商分布：网格布局（每行3个，垂直滚动） */
.manufacturer-grid {
  display: flex;
  flex-wrap: wrap; /* 自动换行 */
  gap: 16px; /* 卡片间距 */
  height: calc(100% - 4px); /* 占满卡片内容区高度 */
  overflow-y: auto; /* 垂直滚动（超出高度时） */
  padding: 8px 0;
}
/* 制造商卡片：每行3个，自适应宽度 */
.manufacturer-card {
  flex: 0 0 calc((100% - 32px) / 3); /* 3个卡片 + 2个间距(16px*2) */
  max-width: calc((100% - 32px) / 3); /* 限制最大宽度，避免拉伸 */
  height: auto; /* 自适应内容高度 */
  margin: 0; /* 取消原有margin，用gap控制间距 */
}
/* 响应式适配：小屏幕自动调整每行数量 */
@media screen and (max-width: 1200px) {
  .manufacturer-card {
    flex: 0 0 calc((100% - 16px) / 2); /* 屏幕<1200px时每行2个 */
    max-width: calc((100% - 16px) / 2);
  }
}
@media screen and (max-width: 768px) {
  .manufacturer-card {
    flex: 0 0 100%; /* 屏幕<768px时每行1个 */
    max-width: 100%;
  }
}

.manufacturer-card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
}
.manufacturer-card h3 { 
  font-size: 16px; 
  font-weight: 600; 
  margin-bottom: 8px; 
  color: #333; 
  text-align: center;
}
.manufacturer-card p { 
  font-size: 14px; 
  color: #666; 
  margin-bottom: 12px; 
  text-align: center;
  font-weight: 500;
}
.manufacturer-card ul { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-around; 
}
.manufacturer-card ul li { 
  font-size: 13px; 
  color: #666; 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 4px 0;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border-radius: 8px;
}

/* 告警列表样式 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.alert-item {
  display: flex;
  align-items: stretch;
  background-color: #f9fafc;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 4px;
}

.alert-header { 
  display: flex; 
  flex-direction: column; 
  width: 150px; 
  margin-right: 12px; 
  justify-content: center;
}
.alert-time { 
  font-size: 13px; 
  color: #333; 
  margin-bottom: 4px; 
}
.alert-time-detail { 
  font-size: 12px; 
  color: #999; 
}

.alert-content { 
  flex: 1; 
  display: flex; 
  align-items: flex-start; 
  margin-right: 12px; 
}
.alert-icon { 
  display: inline-block; 
  width: 24px; 
  height: 24px; 
  margin-right: 8px; 
  border-radius: 4px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #1890ff; 
  font-weight: bold; 
  flex-shrink: 0;
}
.alert-icon-host { background-color: #f0f9ff; color: #2f54eb; }
.alert-icon-os { background-color: #fffbe6; color: #faad14; }
.alert-icon-db { background-color: #f9f0ff; color: #722ed1; }

.alert-text { 
  flex: 1; 
  overflow: hidden;
}
.alert-title { 
  font-size: 14px; 
  font-weight: 600; 
  color: #333; 
  margin-bottom: 4px; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.alert-meta { 
  font-size: 12px; 
  color: #666; 
  display: flex;
  flex-wrap: wrap;
}
.resource-separator { 
  margin: 0 4px; 
  color: #999; 
}

.alert-handle { 
  display: flex; 
  align-items: center; 
  flex-shrink: 0;
}
.alert-level-tag { 
  display: inline-block; 
  padding: 2px 6px; 
  border-radius: 4px; 
  color: white; 
  font-size: 12px; 
  font-weight: 500; 
  margin-bottom: 4px; 
}
.alert-level-warning { background-color: #faad14; }
.alert-level-serious { background-color: #ff4d4f; }

.more-alert { 
  text-align: center; 
  color: #1890ff; 
  cursor: pointer; 
  padding: 8px 0; 
  font-size: 14px; 
  margin-top: 8px;
}

/* 性能统计表格样式 */
.card-container >>> .ant-table {
  flex: 1;
  overflow: auto;
}
.card-container >>> .ant-table-container {
  height: 100%;
}
</style>