<template>
  <div class="alert-container">
    <!-- 标签页容器 -->
    <a-tabs default-active-key="overview">
      <!-- 总览 Tab -->
      <a-tab-pane :tab="$t('common.overview')" key="overview">
        <div class="alert-summary">
          <!-- 基础信息卡片 -->
          <a-card style="margin-bottom: 16px;">
            <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.basicInformation') }}
                </div>
            </template>  
            <a-row :gutter="16">
              <a-col :span="8">
                <p><strong>{{ $t('common.id') }}:</strong> {{ selectRow?.id || '--' }}</p>
                <p><strong>{{ $t('common.name') }}:</strong> {{ selectRow?.alarmTitle || '--'  }}</p>
                <p><strong>{{ $t('common.status') }}:</strong>  <a-tag  :color="selectRow?.alarmStatus == 0? 'red': 'green'">
                  {{ selectRow?.alarmStatus == 0? $t('common.notRecovered'): $t('common.recovered') }}
                </a-tag></p>
              </a-col>
              <a-col :span="8">
                <p><strong>{{ $t('common.alarmCount') }}:</strong> {{ selectRow?.alarmCount || '--' }}</p>
                <p><strong>{{ $t('common.alarmLevel') }}:</strong> <a-tag  :color="severityColorMap[selectRow?.alarmLevel]">
                    {{severityMap[selectRow?.alarmLevel] || '' }}
                  </a-tag></p>
                <p><strong>{{ $t('common.duration') }}:</strong> {{ selectRow?.lastTime || '--' }}</p>   
              </a-col>              
               <a-col :span="8">
                <p><strong>{{ $t('common.triggerTime') }}:</strong> {{ selectRow?.createTime || '--' }}</p>
                <p><strong>{{ $t('common.recoverTime') }}:</strong> {{ selectRow?.recoverTime || '--' }}</p>
                            
               
               </a-col>

             
            </a-row>
          </a-card>

          <!-- ECharts 快照卡片 -->
          <!-- <a-card  style="margin-bottom: 16px;">
             <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.snapshot') }}
                </div>
            </template>  
            <div ref="chartRef" style="width: 100%; height: 200px;"></div>
          </a-card> -->

          <!-- 处置信息卡片 -->
          <!-- <a-card>
            <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.handlingInformation') }}
                </div>
            </template>  
            <a-row :gutter="16">
              <a-col :span="8">
                <p><strong>{{ $t('common.status') }}:</strong> <a-tag color="orange">{{ handleInfo.status }}</a-tag></p>
              </a-col>
              <a-col :span="16" style="text-align: right;">
                <a-button type="primary" @click="showEditModal = true">{{ $t('common.edit') }}</a-button>
              </a-col>
            </a-row>
            <p style="margin-top: 8px;"><strong>{{ $t('common.handlingSuggestion') }}:</strong> {{ handleInfo.suggestion }}</p>
          </a-card> -->

          <!-- 编辑弹窗 -->
          <a-modal
            :title="$t('common.edit')"
            v-model="showEditModal"
            @ok="handleOk"
            @cancel="showEditModal = false"
          >
            <a-form :model="editForm">
              <a-form-item :label="$t('common.handlingStatus')">
                <a-select v-model="editForm.handleStatus">
                  <a-select-option :value="$t('common.closed')">{{ $t('common.closed') }}</a-select-option>
                  <a-select-option :value="$t('common.processing')">{{ $t('common.processing') }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item :label="$t('common.handlingSuggestion')">
                <a-textarea v-model="editForm.suggestion" rows="4"></a-textarea>
              </a-form-item>
            </a-form>
          </a-modal>
        </div>
      </a-tab-pane>

      <!-- 告警通知 Tab -->
      <!-- <a-tab-pane :tab="$t('common.alarmNotification')" key="alerts">
        <div class="alerts-list">
          <a-card
            v-for="(item, index) in alertsData"
            :key="index"
            style="margin-bottom: 16px; padding: 12px;"
          >
            <p><strong>{{ $t('common.notifyMethod') }}:</strong> {{ item.notifyMethod }}</p>
            <p><strong>{{ $t('common.webhook') }}:</strong> {{ item.webhook }}</p>
            <div class="alert-content">
              <p><strong>{{ item.title }}</strong></p>
              <p><strong>{{ $t('common.alertStatus') }}:</strong> {{ item.alertStatus }}</p>
              <p><strong>{{ $t('common.name') }}:</strong> {{ item.name }}</p>
              <p><strong>{{ $t('common.severity') }}:</strong> {{ item.severity }}</p>
              <p><strong>{{ $t('common.resourceName') }}:</strong> {{ item.resourceName }}</p>
              <p><strong>{{ $t('common.resourceIp') }}:</strong> {{ item.resourceIp }}</p>
              <p><strong>{{ $t('common.triggerTime') }}:</strong> {{ item.triggerTime }}</p>
              <p v-if="item.recoverTime"><strong>{{ $t('common.recoverTime') }}:</strong> {{ item.recoverTime }}</p>
            </div>
            <p><strong>{{ $t('common.status') }}:</strong> <a-tag color="green">{{ item.status }}</a-tag></p>
            <p><strong>{{ $t('common.detail') }}:</strong> {{ item.detail }}</p>
          </a-card>
        </div>
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>
<script>
import * as echarts from 'echarts';
export default {
  props:{
    selectRow:{
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      severityMap: {
          1: this.$t('common.warning'),
          2: this.$t('common.normal'),
          3: this.$t('common.critical'), 
          4: this.$t('common.emergency')
      },
      // 颜色映射
      severityColorMap: {
        4: 'red',
        3: 'volcano',
        2: 'orange',
        1: 'blue'
      },
      statusColorMap: {
        1: 'green',
        0: 'red',
      },      
      // 总览 - 基础信息
      basicInfo: {
        id: "f886212076994afb204461cdaae26e76",
        severity: this.$t('common.emergency'),
        resource: "orcl19c Oracle",
        resourceType: this.$t('common.database'),
        triggerTime: "2025-08-28 09:31:18",
        recoverTime: "2025-08-28 09:44:46",
        duration: "13m",
        status: this.$t('common.recovered'),
      },
      // 总览 - 处置信息
      handleInfo: {
        status: this.$t('common.closed'),
        suggestion: "-",
      },
      // 编辑表单
      editForm: {
        handleStatus: this.$t('common.closed'),
        suggestion: "-",
      },
      showEditModal: false, // 编辑弹窗显隐控制
      chartInstance: null,  // ECharts 实例
      chartOption: {        // ECharts 配置项
        tooltip: {
          trigger: "axis",
          formatter: (params) => `${params[0].name}<br/>值: ${params[0].value}`,
        },
        xAxis: {
          type: "category",
          data: ["08-28 09:31"],
          boundaryGap: false,
        },
        yAxis: { type: "value", show: false },
        series: [
          {
            name: "Oracle Ping",
            type: "line",
            data: [0],
            itemStyle: { color: "#4895ef" },
            lineStyle: { color: "#4895ef" },
            showSymbol: true,
            symbol: "circle",
            symbolSize: 8,
          },
        ],
        grid: {
          left: "3%",
          right: "10%",
          bottom: "3%",
          top: "6%",
          containLabel: true,
        },
      },
      // 告警通知 - 模拟数据（与截图一致）
      alertsData: [
        {
          notifyMethod: this.$t('common.wechatWork'),
          webhook: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c690244-016c-4823-badf-b9a2aa5b3a66",
          title: "[OpsEye] Database Alarm Notification",
          alertStatus: this.$t('common.recoveredStatus'),
          name: "Oracle Ping Failed",
          severity: this.$t('common.emergency'),
          resourceName: "orcl19c Oracle",
          resourceIp: "10.10.0.169",
          triggerTime: "2025-08-28 09:31:18",
          recoverTime: "2025-08-28 09:44:46",
          status: this.$t('common.success'),
          detail: "success",
        },
        {
          notifyMethod: this.$t('common.wechatWork'),
          webhook: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c690244-016c-4823-badf-b9a2aa5b3a66",
          title: "[OpsEye] Database Alarm Notification",
          alertStatus: this.$t('common.alert'),
          name: "Oracle Ping Failed",
          severity: this.$t('common.emergency'),
          resourceName: "orcl19c Oracle",
          resourceIp: "10.10.0.169",
          triggerTime: "2025-08-28 09:31:18",
          recoverTime: "", // 第二条无“恢复时间”
          status: this.$t('common.success'),
          detail: "success",
        },
      ],
    };
  },
  mounted() {
    this.initChart(); // 初始化 ECharts
  },
  methods: {
    // 初始化 ECharts 图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chartRef);
      this.chartInstance.setOption(this.chartOption);
      // 窗口 resize 时自适应
      window.addEventListener("resize", () => {
        this.chartInstance && this.chartInstance.resize();
      });
    },
    // 弹窗“确定”回调：更新处置信息
    handleOk() {
      this.handleInfo.status = this.editForm.handleStatus;
      this.handleInfo.suggestion = this.editForm.suggestion;
      this.showEditModal = false;
    },
  },
  beforeDestroy() {
    // 销毁前移除 resize 事件监听（避免内存泄漏）
    window.removeEventListener("resize", () => {
      this.chartInstance && this.chartInstance.resize();
    });
  },
};
</script>
<style scoped>
.alert-container {
  padding: 16px;
}
.alerts-list {
  padding: 8px;
}
.alert-content {
  background-color: #f9f9f9;
  padding: 8px;
  margin: 8px 0;
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