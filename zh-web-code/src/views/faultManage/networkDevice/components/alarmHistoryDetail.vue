<template>
  <div class="alert-container">
    <!-- 标签页容器 -->
    <a-tabs default-active-key="overview" v-model="activeTab">
      <!-- 总览 Tab -->
      <a-tab-pane :tab="$t('common.overview')" key="overview">
        <div class="alert-summary">
          <!-- 基础信息卡片 -->
             <a-card style="margin-bottom: 16px;">
            <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.basicInfo') }}
                </div>
            </template>
            <a-row :gutter="16">
              <a-col :span="8">
                <p><strong>{{ $t('common.alarmId') }}:</strong> {{ selectRow?.id || '--' }}</p>
                <p><strong>{{ $t('common.alarmName') }}:</strong> {{ selectRow?.alarmTitle || '--'  }}</p>
                <p><strong>{{ $t('common.status') }}:</strong>  <a-tag  :color="selectRow?.alarmStatus == 0? 'red': 'green'">
                  {{ selectRow?.alarmStatus == 0? $t('common.notRecovered'): $t('common.recovered') }}
                </a-tag></p>
              </a-col>
              <a-col :span="8">
                <p><strong>{{ $t('common.alarmCount') }}:</strong> {{ selectRow?.alarmCount || '--' }}</p>
                <p><strong>{{ $t('common.alarmLevel') }}:</strong> <a-tag  :color="severityColorMap[selectRow?.alarmLevel]">
                    {{severityMap2[selectRow?.alarmLevel] || '' }}
                  </a-tag></p>
                <p><strong>{{ $t('common.duration') }}:</strong> {{ selectRow?.lastTime || '--' }}</p>
              </a-col>
               <a-col :span="8">
                <p><strong>{{ $t('common.resourceModel') }}:</strong> {{ selectRow?.assetModelName || '--' }}</p>
                <p><strong>{{ $t('common.resourceName') }}:</strong> {{ selectRow?.assetName || '--' }}</p>
                <p><strong>{{ $t('common.alarmTime') }}:</strong> {{ selectRow?.alarmTime || '--' }}</p>
               </a-col>
              <a-col :span="24">
                <div style="display: flex;">
                   <el-tooltip :content=" selectRow?.alarmContent" placement="top">
                      <p class="content"><strong>{{ $t('common.alarmContent') }}:</strong>{{ selectRow?.alarmContent || '--' }}</p>
                  </el-tooltip>

              <p style="margin-left: 2%;"><strong >{{ $t('common.recoverTime') }}:</strong> {{selectRow?.alarmStatus == 0? '--' : selectRow?.recoverTime || '--' }}</p>
              </div>
              </a-col>
            </a-row>
          </a-card>

          <!-- ECharts 快照卡片 -->
          <!-- <a-card  style="margin-bottom: 16px;">
             <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                快照
                </div>
            </template>
            <div ref="chartRef" style="width: 100%; height: 200px;"></div>
          </a-card> -->

          <!-- 处置信息卡片 -->
          <!-- <a-card>
            <template #title>
                <div class="custom-title">
                <span class="title-marker"></span>
                处置信息
                </div>
            </template>
            <a-row :gutter="16">
              <a-col :span="8">
                <p><strong>状态:</strong> <a-tag color="orange">{{ handleInfo.status }}</a-tag></p>
              </a-col>
              <a-col :span="16" style="text-align: right;">
                <a-button type="primary" @click="showEditModal = true">编辑</a-button>
              </a-col>
            </a-row>
            <p style="margin-top: 8px;"><strong>建议:</strong> {{ handleInfo.suggestion }}</p>
          </a-card> -->

          <!-- 编辑弹窗 -->
          <a-modal
            :title="$t('common.edit')"
            v-model="showEditModal"
            @ok="handleOk"
            @cancel="showEditModal = false"
          >
            <a-form :model="editForm">
              <a-form-item :label="$t('common.disposalStatus')">
                <a-select v-model="editForm.handleStatus">
                  <a-select-option value="已关闭">{{ $t('common.closed') }}</a-select-option>
                  <a-select-option value="处理中">{{ $t('common.processing') }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item :label="$t('common.disposalSuggestion')">
                <a-textarea v-model="editForm.suggestion" rows="4"></a-textarea>
              </a-form-item>
            </a-form>
          </a-modal>
        </div>
      </a-tab-pane>

      <!-- 告警通知 Tab -->
      <a-tab-pane :tab="$t('common.alarmNotification')" key="alerts">
        <div class="alerts-list" v-if='alertsDataWithI18n.length>0'>
          <!-- 遍历告警通知数据 -->
          <a-card
            v-for="(item, index) in alertsDataWithI18n"
            :key="index"
            style="margin-bottom: 16px; padding: 12px"
          >
               <!-- 遍历告警通知数据 -->
      <p><strong>{{ $t('common.notificationTitle') }}:</strong> {{ item.notificationTitle }}</p>
      <p><strong>{{ $t('common.alarmName') }}:</strong> {{ item.alarmName }}</p>
      <p><strong>{{ $t('common.resourceName') }}:</strong> {{ item.resourceName }}</p>
      <p><strong>{{ $t('common.notificationMethod') }}:</strong>

          <a-tag class="severity-tag" :color="methodColorMap[item.notificationMethod]">
          {{ methodsMap[item.notificationMethod] }}
        </a-tag>
      </p>
      <p><strong>{{ $t('common.notificationTarget') }}:</strong> {{ item.notificationTarget }}</p>
      <!-- 告警内容区域（模拟截图中的灰色背景块） -->
      <p style="display: flex;">
        <strong>{{ $t('common.notificationContent') }}:</strong>
         <div class="alert-content">
        <div v-html="item.alarmMsg&&item.alarmMsg.replace(/\n/g, '<br>')">
        </div>

      </div>
      </p>
      <p>
        <strong>{{ $t('common.notificationStatus') }}:</strong>

        <a-tag :color="item.notificationStatus=='成功'?'green':'red'">{{item.notificationStatus }}</a-tag>
      </p>
      <p><strong>{{ $t('common.notificationTime') }}:</strong> {{ item.notificationTime }}</p>
          </a-card>
        </div>
        <div v-else  class="top-list-container">
            <div style="margin: auto;">
              <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
              <div class="no-text" style="text-align: center;">{{ $t('common.noData') }}</div>
            </div>
       </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import * as echarts from "echarts";
import { pushLogList } from "@/api/message/index";
export default {
  props: {
    selectRow: {
      type: Object,
      default: {},
    },
    activeTab: {
      type: String,
      default: 'overview'
    }
  },
  watch: {
    selectRow: {
      immediate: true,
      handler(selectRow) {
        this.getLogList()

      }
    },
  },
  data() {
    return {
      // 颜色映射
      severityColorMap: {
        '4': "red",
        '3': "volcano",
        '2': "orange",
        '1': "blue",
      },
       // 颜色映射
      methodColorMap: {
         "dd": "volcano",
        "qywx": "volcano",
        "wx": "volcano",
        "dx": "volcano",
        "wh": "volcano",
        "yhf": "volcano",
        'szh':'volcano',
        'http':'volcano'
      },
      statusColorMap: {
        1: "green",
        0: "red",
      },
      // 总览 - 基础信息
      basicInfo: {
        id: "f886212076994afb204461cdaae26e76",
        resource: "orcl19c Oracle",
        triggerTime: "2025-08-28 09:31:18",
        recoverTime: "2025-08-28 09:44:46",
        duration: "13m",
      },
      // 总览 - 处置信息
      handleInfo: {
        suggestion: "-",
      },
      // 编辑表单
      editForm: {
        suggestion: "-",
      },
      showEditModal: false, // 编辑弹窗显隐控制
      chartInstance: null, // ECharts 实例
      chartOption: {
        // ECharts 配置项
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
          webhook:
            "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c690244-016c-4823-badf-b9a2aa5b3a66",
          title: "[OpsEye] 数据库告警通知",
          name: "Oracle Ping 不通",
          resourceName: "orcl19c Oracle",
          resourceIp: "10.10.0.169",
          triggerTime: "2025-08-28 09:31:18",
          recoverTime: "2025-08-28 09:44:46",
          detail: "success",
        },
        {
          webhook:
            "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1c690244-016c-4823-badf-b9a2aa5b3a66",
          title: "[OpsEye] 数据库告警通知",
          name: "Oracle Ping 不通",
          resourceName: "orcl19c Oracle",
          resourceIp: "10.10.0.169",
          triggerTime: "2025-08-28 09:31:18",
          recoverTime: "", // 第二条无“恢复时间”
          detail: "success",
        },
      ],
    };
  },
  computed: {
    // 告警级别映射
    severityMap2() {
      return {
        '1': this.$t('common.warning'),
        '2': this.$t('common.normal'),
        '3': this.$t('common.critical'),
        '4': this.$t('common.urgent')
      };
    },
    // 通知方式映射
    methodsMap() {
      return {
        "dd": this.$t('common.dingtalk'),
        "qywx": this.$t('common.wecom'),
        "wx": this.$t('common.wechat'),
        "dx": this.$t('common.sms'),
        "wh": this.$t('common.outboundCall'),
        "yhf": this.$t('common.recovered'),
        'szh': this.$t('common.telecomServiceDesk'),
        'http':'HTTP'
      };
    },
    // 通知方式映射（另一个）
    severityMap() {
      return {
        "dd": this.$t('common.dingtalk'),
        "qywx": this.$t('common.wecom'),
        "wx": this.$t('common.wechat'),
        "dx": this.$t('common.sms'),
        "wh": this.$t('common.outboundCall'),
        "yhf": this.$t('common.recovered'),
        'szh': this.$t('common.telecomServiceDesk'),
        'http':'HTTP'
      };
    },
    // 基础信息（带国际化）
    basicInfoWithI18n() {
      return {
        ...this.basicInfo,
        severity: this.$t('common.urgent'),
        resourceType: this.$t('common.database'),
        status: this.$t('common.recovered'),
      };
    },
    // 处置信息（带国际化）
    handleInfoWithI18n() {
      return {
        ...this.handleInfo,
        status: this.$t('common.closed'),
      };
    },
    // 编辑表单（带国际化）
    editFormWithI18n() {
      return {
        ...this.editForm,
        handleStatus: this.$t('common.closed'),
      };
    },
    // 告警通知数据（带国际化）
    alertsDataWithI18n() {
      return this.alertsData.map(item => ({
        ...item,
        notifyMethod: this.$t('common.wecom'),
        alertStatus: item.alertStatus === '恢复' ? this.$t('common.recovered') : this.$t('common.alarm'),
        severity: this.$t('common.urgent'),
        status: this.$t('common.success'),
      }));
    },
  },
  mounted() {
    this.getLogList();
  },
  activated(){

  },
  methods: {
    getLogList() {
      let params = {
        alarmId: this.selectRow.id,
        // alarmId: 141,
        pageSize: 10,
        pageNo: 1,
      };
      pushLogList(params).then((res) => {
        this.alertsData = res.data && res.data.list;
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
/* TOP5 列表样式 */
.top-list-container {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  box-sizing: border-box;
}
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
.content {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
  max-width: 66%; /* 可选：限制单元格最大宽度（根据需求调整） */
}
</style>
