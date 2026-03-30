<template>
  <div class="alert-container" :class="{ 'no-data-container': !inspectionData.length && !loading }">
    <a-row :gutter="16">
      <a-col :span="8">
        <p><strong>{{ $t('common.ipAddress') }}:</strong> {{ selectRow?.ip || '--' }}</p>
      </a-col>
    </a-row>
    <!-- 状态筛选器 -->
    <div class="tab-header">
      <a-radio-group v-model="statusFilter" button-style="solid" @change="handleStatusChange">
        <a-radio-button value="all">{{ $t('common.all') }}</a-radio-button>
        <a-radio-button value="normal">{{ $t('common.normal2') }}</a-radio-button>
        <a-radio-button value="abnormal">{{ $t('common.exception') }}</a-radio-button>
        <a-radio-button value="other">{{ $t('common.unknown') }}</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 巡检项表格 -->
    <a-table
      :columns="inspectionColumns"
      :data-source="inspectionData"
      :pagination="false"
      rowKey="id"
      class="inspection-table"
      :loading="loading"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
      <template slot="severity" slot-scope="text">
        <a-tag :color="severityColorMap[text]" size="small">
          {{ severityMap2[text] || text }}
        </a-tag>
      </template>
      <template slot="result" slot-scope="text">
        <a-tag
          :color="text === $t('common.normal2') ? 'green' : text === $t('common.exception') ? 'red' : 'orange'"
          size="small"
        >
          {{ text }}
        </a-tag>
      </template>
      <!-- 自定义无数据提示 -->
      <template slot="emptyText">
        <div class="custom-empty-text">{{ $t('common.noInspectionData') }}</div>
      </template>
    </a-table>
  </div>
</template>

<script>
import { pushLogList } from "@/api/message/index";
import { getLogList } from "@/api/inspectionRecord"; // 巡检明细接口
export default {
  props: {
    selectRow: {
      type: Object,
      default: () => ({}),
    },
    activeTab: {
      type: String,
      default: 'overview'
    }
  },
  watch: {
    selectRow: {
      immediate: true,
      handler() {
        this.getInspectionData(); // 改为获取真实巡检数据
      }
    }
  },
  data() {
    return {
      loading: false,
      statusFilter: 'all',
      inspectionData: [],
      // 颜色映射
      severityColorMap: {
        '高': "red",
        '3': "volcano",
        '中': "orange",
        '低': "blue"
      },
      alertsData: []
    };
  },
  
  computed: {
    // 表格列配置
    inspectionColumns() {
      return [
        {
          title: this.$t('common.inspectionItem'),
          dataIndex: 'itemName',
          key: 'itemName',
        },
        {
          title: this.$t('common.abnormalLevel'),
          dataIndex: 'severity',
          key: 'severity',
          width: 100,
          scopedSlots: { customRender: 'severity' }
        },
        {
          title: this.$t('common.judgmentCondition'),
          dataIndex: 'condition',
          key: 'condition',
          width: 100
        },
        {
          title: this.$t('common.suggestedValue'),
          dataIndex: 'suggested',
          key: 'suggested',
          width: 100
        },
        {
          title: this.$t('common.currentValue'),
          dataIndex: 'current',
          key: 'current',
          width: 100
        },
        {
          title: this.$t('common.inspectionResult'),
          dataIndex: 'result',
          key: 'result',
          width: 100,
          scopedSlots: { customRender: 'result' }
        }
      ];
    },
    // 其他参数映射
    otherParams() {
      return {
        1: this.$t('common.equalTo'),
        2: this.$t('common.notEqualTo'),
        3: this.$t('common.greaterThan'),
        4: this.$t('common.greaterThanOrEqualTo'),
        5: this.$t('common.lessThan'),
        6: this.$t('common.lessThanOrEqual')
      };
    },
    // 风险等级映射
    gradeToSeverityMap() {
      return {
        'high': this.$t('common.high'),
        'medium': this.$t('common.medium'),
        'low': this.$t('common.low')
      };
    },
    // 严重程度映射
    severityMap2() {
      return {
        '4': this.$t('common.emergency'),
        '3': this.$t('common.severe'),
        '2': this.$t('common.normal2'),
        '1': this.$t('common.warning')
      };
    },
    // 状态映射
    severityMap3() {
      return {
        '0': this.$t('common.exception'),
        '1': this.$t('common.normal2'),
        '2': this.$t('common.unknown')
      };
    }
  },
  methods: {
    getConditionText(item) {
      // 根据接口字段逻辑生成判断条件
      if (item.compareValue && item.originalParam) {
        // 假设业务逻辑：实际值 > 阈值 则异常
        return `> ${item.compareValue}`;
      }
      return '-';
    },    
    // 状态筛选变化时重新获取数据
    handleStatusChange() {
      this.getInspectionData();
    },
    // 获取告警通知日志（保留原有功能）
    // 获取巡检数据（接口联调核心方法）
    async getInspectionData() {
      if (!this.selectRow.assetId) return; // 无ID时不请求
      
      this.loading = true;
      try {
        // 构造接口参数
        const params = {
          inspectionRecordId: this.selectRow.inspectionRecordId,
          assetId: this.selectRow.assetId,
        };
        // 根据筛选状态添加status参数（all不传，normal传true，abnormal传false）
        if (this.statusFilter === 'normal') {
          params.status = 1; //0异常  1正常 2未知
        } else if (this.statusFilter === 'abnormal') {
          params.status = 0;
        }  else if (this.statusFilter === 'other') {
          params.status = 2;
        } else {
           params.status = null
        }

        // 调用巡检明细接口（POST请求）
        const res = await getLogList(params);
        if (res.code === 0 && res.data) {
          // 处理返回数据，映射为表格所需格式
          this.inspectionData = res.data.map(item => ({
            id: item.id,
            itemName: item.itemName || '--', // 巡检项名称
            severity: this.gradeToSeverityMap[item.grade] || '1', // 风险等级转级别
            condition: this.otherParams[item.otherParam] || '--', // 生成判断条件文本
            suggested: item.originalParam || '-', // 建议值（原始阈值）
            current: item.compareValue || '-', // 当前值（实际检测值）
            result: item.status === null ? this.$t('common.unknown') : (item.status ? this.$t('common.normal2') : this.$t('common.exception')), // 状态转结果
            createTime: item.createTime // 保留创建时间（可选）
          }));
        }
      } catch (error) {
        console.error('获取巡检数据失败:', error);
        this.inspectionData = [];
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    setTimeout(() => {
       this.getInspectionData(); // 保留原有告警日志获取
    }, 1000);
   
  }
};
</script>

<style scoped>
/* 原有样式保持不变 */
.alert-container {
  padding: 16px;
  background-color: #fff;
  min-height: 100%;
  box-sizing: border-box;
  overflow: auto; /* 默认有滚动条 */
}

/* 无数据时的容器样式 - 移除滚动条 */
.no-data-container {
  overflow: hidden !important;
}

.tab-header {
  margin-bottom: 12px;
  padding: 8px 0;
}

.inspection-table >>> .ant-table-thead > tr > th {
  background-color: #f5f7fa;
  font-weight: 600;
}

.inspection-table >>> .ant-table-tbody > tr:hover > td {
  background-color: #f0f7ff;
}
/* 表格整体样式优化 */
.inspection-table >>> .ant-table {
  --ant-table-header-text-align: left;
  --ant-table-cell-text-align: left;
}

/* 表头单元格样式 - 左对齐，统一内边距 */
.inspection-table >>> .ant-table-thead > tr > th {
  background-color: #f9fafc;
  font-weight: 600;
  color: #333;
  text-align: left !important; /* 强制左对齐 */
  padding: 12px 16px !important; /* 统一内边距 */
  vertical-align: middle !important; /* 垂直居中 */
  border-bottom: 1px solid #f0f0f0;
}

/* 表体单元格样式 - 左对齐，统一内边距 */
.inspection-table >>> .ant-table-tbody > tr > td {
  text-align: left !important; /* 强制左对齐 */
  padding: 12px 16px !important; /* 统一内边距，与表头保持一致 */
  vertical-align: middle !important; /* 垂直居中 */
  border-bottom: 1px solid #f0f0f0;
}

/* 悬停效果优化 */
.inspection-table >>> .ant-table-tbody > tr:hover > td {
  background-color: #f0f7ff;
}

/* 解决表格列宽不一致问题 */
.inspection-table >>> .ant-table-column-has-fix-left,
.inspection-table >>> .ant-table-column-has-fix-right {
  text-align: left !important;
}

/* 异常级别单元格样式适配 */
.inspection-table >>> .severity {
  display: inline-block; /* 确保样式正常显示 */
  vertical-align: middle;
}

/* 异常级别计数单元格样式适配 */
.inspection-table >>> .severity-count {
  align-items: center;
  justify-content: flex-start; /* 左对齐显示 */
}

/* 巡检项名称标签容器适配 */
.inspection-table >>> .metric-names-container {
  justify-content: flex-start; /* 左对齐显示 */
}

/* 自定义无数据提示样式 */
.custom-empty-text {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

/* 移除无数据时表格的滚动条 */
.inspection-table >>> .ant-table-placeholder {
  text-align: center;
  overflow: hidden !important;
}

/* 确保无数据时表格容器也没有滚动条 */
.no-data-container >>> .ant-table-wrapper {
  overflow: hidden !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content {
    max-width: 100%;
    margin-bottom: 8px;
  }
  
  .alert-content {
    min-width: auto;
    width: 100%;
    margin: 8px 0 0 0;
  }
}
</style>