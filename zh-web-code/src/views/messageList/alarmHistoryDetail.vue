<template>
  <div class="alert-container">
    <!-- 标签页容器 -->
    <div class="alerts-list">
      <!-- 遍历告警通知数据 -->
      <p><strong>{{ $t('common.notificationTitle') }}:</strong> {{ selectRow.notificationTitle }}</p>
      <p><strong>{{ $t('common.alarmName') }}:</strong> {{ selectRow.notificationType === 2? '' : selectRow.alarmName }}</p>
      <p><strong>{{ $t('common.resourceName') }}:</strong> {{ selectRow.resourceName }}</p>
      <p><strong>{{ $t('common.notificationMethod') }}:</strong>

          <a-tag class="severity-tag" :color="severityColorMap[selectRow.notificationMethod]">
          {{ getNotificationMethodText(selectRow.notificationMethod) }}
        </a-tag>
      </p>
      <p><strong>{{ $t('common.notificationTarget') }}:</strong> {{ selectRow.notificationTarget }}</p>
      <!-- 告警内容区域（模拟截图中的灰色背景块） -->
      <p style="display: flex;">
        <strong>{{ $t('common.notificationContent') }}:</strong>
         <div class="alert-content">
        <div v-html="selectRow.alarmMsg&&selectRow.alarmMsg.replace(/\n/g, '<br>')">
        </div>

      </div>
      </p>
      <p>
        <strong>{{ $t('common.notificationStatus') }}:</strong>

        <a-tag :color="selectRow.notificationStatus==$t('common.success')?'green':'red'">{{ selectRow.notificationStatus }}</a-tag>
      </p>
      <p><strong>{{ $t('common.notificationTime') }}:</strong> {{ selectRow.notificationTime }}</p>
    </div>
  </div>
</template>
<script>
import * as echarts from "echarts";
export default {
  props: {
    selectRow: {
      type: Object,
      default: {},
    },
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
         "dd": "volcano",
        "qywx": "volcano",
        "wx": "volcano",
        "dx": "volcano",
        "wh": "volcano",
        "yhf": "volcano",
        'szh':'volcano',
        'http':'volcano',
      },
      statusColorMap: {
        1: "green",
        0: "red",
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
      chartInstance: null, // ECharts 实例

      alertDetail: {
        notifyMethod: this.$t('common.wechatWork'),
        webhook:
          "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c690244-016c-4823-badf-b9a2aa5b3a66",
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
    };
  },
  mounted() {
    this.initChart(); // 初始化 ECharts
  },
  methods: {
    // 弹窗“确定”回调：更新处置信息
    handleOk() {
      this.handleInfo.status = this.editForm.handleStatus;
      this.handleInfo.suggestion = this.editForm.suggestion;
      this.showEditModal = false;
    },
    // 获取通知方式的国际化文本
    getNotificationMethodText(method) {
      const methodMap = {
        "dd": this.$t('common.dingTalk'),
        "qywx": this.$t('common.wechatWork'),
        "wx": this.$t('common.wechat'),
        "dx": this.$t('common.sms'),
        "wh": this.$t('common.outboundCall'),
        "yhf": this.$t('common.recovered'),
        'szh': this.$t('common.telecomServiceDesk'),
        'http': 'HTTP'
      };
      return methodMap[method] || method;
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
  padding-top: 0px;
}
.severity-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
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
