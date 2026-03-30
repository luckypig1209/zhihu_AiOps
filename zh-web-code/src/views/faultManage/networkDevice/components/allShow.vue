<template>
  <div class="device-detail-page">

    <!-- 基础信息与基础状态布局 -->
    <div class="info-status-row">
      <!-- 基础信息卡片 -->
      <a-card  class="info-card">
        <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            {{ $t('common.basicInformation') }}
            </div>
        </template>        
        <div class="info-container">
           <a-row :gutter="24" style="width: 100%;">
              <a-col :span="8" >
                 <div style="display: flex;line-height: 32px;">
                 <span class="info-label">id：</span>
                 
                 <span class="info-value">{{ this.selectRow.id || '--' }}</span>
                 </div>
              </a-col>
              <a-col :span="8" v-for="item in itemList" >
               <el-tooltip :content="item.itemName + ': ' + item?.itemValue || '--' " placement="top">
                <div style="display: flex;line-height: 32px;">
                <span class="info-label">{{item.itemName}}：</span>
                 
                 <span class="info-value">{{ item?.itemValue || '--' }}</span>
                 </div>
                </el-tooltip>
                    <!-- <span v-else class="info-value">{{ item?.itemValue || '--' }}</span> -->
              </a-col>
              <a-col :span="8" >
                 <div style="display: flex;line-height: 32px;">
                 <span class="info-label">{{ $t('common.monitoringMethod') }}：</span>
                 
                 <span class="info-value" v-if="selectRow.modelCode === 'networkdevice'
            || selectRow.modelCode === 'storagedevice' || selectRow.modelCode === 'storagedevice' || selectRow.modelCode === 'terminaldevice'">{{ monitorTypeList1[this.monitorMethod] || '--' }}</span>
                <span class="info-value" v-else>{{ monitorTypeList2[this.monitorMethod] || '--' }}</span>
                 </div>
              </a-col>              
           </a-row>
        <!-- <div class="info-column">
            <div class="info-item" v-for="item in itemList">
              <span class="info-label">{{item.itemName}}：</span>
              <span>{{ item?.itemValue || '--' }}</span>
            </div> 
        </div> -->
        </div>
      </a-card>

      <!-- 基础状态卡片 -->
      <a-card  class="status-card">
        <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            {{ $t('common.basicStatus') }}
            </div>
        </template>        
        <div class="chart-container">
          <div 
            id="resourceStatusChart" 
            class="chart" 
            ref="resourceStatusChart"
          ></div>
          <div class="chart-label" v-if="selectRow.modelCode !== 'ztkeeper'">{{ $t('common.resourceStatus') }}</div>
           <div class="chart-label" v-else>{{ $t('common.monitoringStatus') }}</div>
        </div>
      </a-card>
    </div>

    <!-- 基础指标区域（包含两个 ECharts 环形图） -->
    <!-- <a-card class="metrics-card">
         <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            基础指标
            </div>
        </template>            
      <div class="metrics-chart-row">
        <div class="chart-container">
          <div 
            id="delayChart" 
            class="metric-chart" 
            ref="delayChart"
          ></div>
          <div class="chart-label">延迟</div>
        </div>
        <div class="chart-container">
          <div 
            id="packetLossChart" 
            class="metric-chart" 
            ref="packetLossChart"
          ></div>
          <div class="chart-label">丢包率</div>
        </div>
      </div>
    </a-card> -->

    <!-- 当前告警表格 -->
    <a-card class="alarm-card">
         <template #title>
            <div class="custom-title">
            <span class="title-marker"></span>
            {{ $t('common.currentAlarms') }}
            </div>
        </template>           
      <!-- <a-table
        :columns="alarmColumns"
        :data-source="alarmData"
        bordered
        :pagination="alarmPagination"
      >
        <template #severity="{ text }">
          <a-tag :color="getSeverityColor(text)">{{ text }}</a-tag>
        </template>
      </a-table> -->
      <alarmCurrent :selectId="selectRow.id"></alarmCurrent>
    </a-card>
  </div>
</template>

<script>
import Vue from 'vue';
import * as echarts from 'echarts';
import alarmCurrent from './alarmCurrent.vue';
import {getAssetInfo, getAssetModelDetail}  from "@/api/resource";
import { getDictDatas } from "@/utils/dict";

export default Vue.extend({
  name: 'DeviceDetail',
  components:{alarmCurrent},
  props:{
    selectRow:{
      type: Object,
      default: {
        id:0,
        onlineStatus: 1
      }
    }
  },
  computed: {
    // 监控方式列表1
    monitorTypeList1() {
      return {
        0: this.$t('common.notMonitored'),
        1: 'SNMP',
        2: 'PING'
      };
    },
    // 监控方式列表2
    monitorTypeList2() {
      return {
        0: this.$t('common.notMonitored'),
        1: this.$t('common.monitoring'),
      };
    },
    // 标签页列表
    tabs() {
      return [
        { key: 'overview', title: this.$t('common.overview') },
        { key: 'hardware', title: this.$t('common.hardwareStatus') },
        { key: 'network', title: this.$t('common.networkStatus') },
        { key: 'neighbor', title: this.$t('common.neighborInformation') },
        { key: 'trend', title: this.$t('common.metricTrend') },
        { key: 'monitor', title: this.$t('common.monitoringMetrics') },
        { key: 'alarm-rule', title: this.$t('common.alarmRules') },
        { key: 'alarm-history', title: this.$t('common.alarmHistory') }
      ];
    },
    // 告警表格列配置
    alarmColumns() {
      return [
        { title: this.$t('common.name'), dataIndex: 'name', key: 'name' },
        { 
          title: this.$t('common.severity'), 
          dataIndex: 'severity', 
          key: 'severity',
          scopedSlots: { customRender: 'severity' }
        },
        { title: this.$t('common.triggerTime'), dataIndex: 'time', key: 'time' },
        { title: this.$t('common.duration'), dataIndex: 'duration', key: 'duration' },
        { title: this.$t('common.todayCumulative'), dataIndex: 'count', key: 'count' }
      ];
    }
  },
  data() {
    return {
      activeTab: 'overview',
      // 设备基础信息
      info: {},
      // 告警表格数据
      alarmData: [
        {
          key: '1',
          name: 'ICMP Ping 不通',
          severity: '紧急',
          time: '2025-08-15 18:08:04',
          duration: '11d21h37m',
          count: '0次'
        }
      ],  
      onlineStatus: 1,
      itemList:[],    
      monitorMethod: 0,
      // 告警表格分页配置
      alarmPagination: {
        total: 1,
        pageSize: 10,
        current: 1
      },
      // 图表实例
      charts: {
        resourceStatus: null,
        delay: null,
        packetLoss: null
      }
    };
  },
  mounted() {
    this.$nextTick(() => {
      // 初始化基础状态环形图
      // 初始化延迟环形图
      this.initDelayChart();
      // 初始化丢包率环形图
      this.initPacketLossChart();
      this.getDetail(this.selectRow.id)
    });
    // 监听窗口大小变化，重新渲染图表
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.dispose();
      }
    });
    
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
  getDetail(id) {
     getAssetModelDetail({ id: this.selectRow.modelId })
        .then((res) => {
          if (res.data?.items && res.data.items.length) {
            this.itemList = res.data.items.map(item =>{
              return {
                itemName: item.itemName,
                itemCode: item.itemCode,
                itemValue:''
              }
            });
           
           getAssetInfo({ id: id }).then((res) => {
            let resData = res.data
            let assetAttribute = res.data.assetAttribute;
            this.onlineStatus = res.data.onlineStatus
            this.initResourceStatusChart();
            this.monitorMethod = res.data.monitorMethod || 0
            this.itemList.forEach(iitem=>{
                 if(iitem.itemCode.indexOf('asset_optional') > -1){
                  let isIn = false
                    let typeList = getDictDatas(iitem.itemCode) || []
                    typeList.forEach(tItem =>{
                      if(tItem.value === assetAttribute[iitem.itemCode]){
                        isIn = true
                        iitem.itemValue = tItem.label
                      }
                    })
                    if(!isIn){
                        iitem.itemValue = assetAttribute[iitem.itemCode] || ''
                    }
                  } else {
                     iitem.itemValue = assetAttribute[iitem.itemCode] || ''
                  
                 }
                //  iitem.itemValue = assetAttribute[iitem.itemCode] || ''
              })

      });
          } else {
            this.$message.error(this.$t('common.modelFieldLoadingFailed'));
          }
        })
        .catch(() => {
          this.$message.error(this.$t('common.modelFieldRequestException'));
        });    
     
    },      
    getStatusColor(status) {
      switch (status) {
        case 1:
          return "green";
        case 2:
          return "orange";    
        case 3:
          return "red";                 
        default:
          return "gray";
      }
    },
    getStatusText(status) {
      const statusMap = {
        0: this.$t('common.notMonitored'),
        1: this.$t('common.normal2'),
        2: this.$t('common.alarm'),
        3: this.$t('common.exception'),
      };
      return statusMap[status];
    },        
    // 初始化基础状态（资源状态）环形图
    initResourceStatusChart() {
      const chartDom = this.$refs.resourceStatusChart;
      if (!chartDom) return;
      
      this.charts.resourceStatus = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'none'  // 设为'none'禁用提示框，点击和hover都不会显示数据
        },
        series: [
          {
            name: this.$t('common.resourceStatus'),
            type: 'pie',
            radius: ['60%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
              color: this.getStatusColor(this.onlineStatus)
            },
            label: {
              show: true,
              position: 'center',
              formatter: this.getStatusText(this.onlineStatus),
              fontSize: 10,
              fontWeight: 'bold',
              color: this.getStatusColor(this.onlineStatus)
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { 
                value: this.onlineStatus, 
                name: this.onlineStatus === 0 ? this.$t('common.notMonitored') :
                      this.onlineStatus === 1 ? this.$t('common.normal2') :
                      this.onlineStatus === 2 ? this.$t('common.alarm') : this.$t('common.exception')
              }
            ]
          }
        ]
      };
      this.charts.resourceStatus.setOption(option);
    },
    // 初始化延迟环形图
    initDelayChart() {
      const chartDom = this.$refs.delayChart;
      if (!chartDom) return;
      
      this.charts.delay = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: this.$t('common.delay'),
            type: 'pie',
            radius: ['60%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
              color: '#52c41a'
            },
            label: {
              show: true,
              position: 'center',
              formatter: '0s',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#52c41a'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1, name: '0s' }
            ]
          }
        ]
      };
      this.charts.delay.setOption(option);
    },
    // 初始化丢包率环形图
    initPacketLossChart() {
      const chartDom = this.$refs.packetLossChart;
      if (!chartDom) return;
      
      this.charts.packetLoss = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: this.$t('common.packetLossRate'),
            type: 'pie',
            radius: ['60%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
              color: '#ff4d4f'
            },
            label: {
              show: true,
              position: 'center',
              formatter: '100%',
              fontSize: 14,
              fontWeight: 'bold',
              color: '#ff4d4f'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 1, name: '100%' }
            ]
          }
        ]
      };
      this.charts.packetLoss.setOption(option);
    },
    // 处理窗口大小变化
    handleResize() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          chart.resize();
        }
      });
    },
    // 获取严重性标签颜色
    getSeverityColor(severity) {
      const colors = {
        '紧急': 'red',
        '严重': 'orange',
        '警告': 'yellow',
        '信息': 'blue'
      };
      return colors[severity] || 'default';
    }
  }
});
</script>

<style scoped>
.device-detail-page {
  padding: 0 20px;
  background-color: #fff;
  min-height: 100vh;
}

/* 标签栏样式 */
.device-tabs {
  margin-bottom: 20px;
  background: #fff;
  padding: 0 16px;
  border-radius: 4px;
}

/* 基础信息与基础状态行布局 */
.info-status-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* 基础信息卡片样式 */
.info-card {
  flex: 1;
  min-width: 400px;
}
.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  margin-left: 10px;
  /* flex-wrap: wrap; */
}
.info-label {
  width: 120px;
  color: #666;
  margin-right: 8px;
  flex-shrink: 0;
}
.group-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

/* 基础状态卡片样式 */
.status-card {
  width: 200px;
  min-width: 200px;
  display: flex;
  flex-direction: column;

}

/* 图表容器 */
.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.chart {
  width: 120px;
  height: 120px;
}
.metric-chart {
  width: 120px;
  height: 120px;
}
.chart-label {
  margin-top: 8px;
  font-weight: 500;
  color: #333;
}

/* 基础指标卡片样式 */
.metrics-card {
  margin-bottom: 20px;
}
.metrics-chart-row {
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  flex-wrap: wrap;
}

/* 告警表格卡片样式 */
.alarm-card {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-status-row {
    flex-direction: column;
  }
  
  .info-card, .status-card {
    min-width: 100%;
    width: 100%;
  }
  
  .metrics-chart-row {
    justify-content: center;
    gap: 20px;
  }
}
.info-container {
  display: flex;
  width: 100%;
}

.info-column {
  flex: 1; /* 两列等宽 */
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: flex-start;
  min-height: 20px; /* 保持对齐 */
}

.info-label {
  color: #666;
  font-weight: 800;
  margin-right: 4px;
   white-space: nowrap;    /* 禁止换行 */
  overflow: hidden;       /* 隐藏溢出内容 */
  text-overflow: ellipsis;/* 溢出显示省略号 */
  text-align: right;
}
.info-value{
  width: 100%;
  white-space: nowrap;    /* 禁止换行 */
  overflow: hidden;       /* 隐藏溢出内容 */
  text-overflow: ellipsis;/* 溢出显示省略号 */
}

.group-tag {
  margin: 2px 4px 2px 0;
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