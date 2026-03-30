<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee; margin-bottom: 10px">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="4">
            <a-form-item>
              <a-input v-model="searchForm.notificationTitle" :placeholder="$t('common.pleaseEnterNotificationTitle')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="4">
            <a-form-item>
              <a-select v-model="searchForm.notificationMethod" :options="severitypeOptions" :placeholder="$t('common.selectNotificationMethod')"
                allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <!-- 通知状态 -->
          <a-col :span="4">
            <a-form-item>
              <a-select v-model="searchForm.notificationStatus" :options="statusOptions" :placeholder="$t('common.selectNotificationStatus')"
                allowClear style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="8">
            <!-- 批量操作 + 导出 + 设置 -->
            <div class="table-operations">
              <div class="operation-buttons">
                <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
                <a-button type="primary" @click="handleReset" ghost>{{ $t('common.reset') }}</a-button>
                <!-- <a-button @click="refreshData" icon="sync" :loading="loading">
                  {{ $t('common.refresh') }}
                </a-button> -->
                <div style="margin-left: 10px">
                  <img v-if="showAll" style="width: 24px; height: 24px" src="@/assets/images/loudouoon.png" :alt="$t('common.showAll')"
                    @click="changeShowAll" />
                  <img v-else style="width: 24px; height: 24px" src="@/assets/images/loudouoff.png" :alt="$t('common.hideAll')"
                    @click="changeShowAll" />
                </div>
              </div>
            </div>
          </a-col>

          <div style="margin-left: auto">
            <refreshTime @refresh="fetchData"></refreshTime>
          </div>
        </a-row>
        <a-row :gutter="16" v-if="showAll">
          <!-- //告警名称 -->
          <a-col :span="6">
            <a-form-item>
              <a-input v-model="searchForm.alarmName" :placeholder="$t('common.pleaseEnterAlarmName')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <!-- //资源名称 -->
          <a-col :span="8">
            <a-form-item>
              <a-input v-model="searchForm.resourceName" :placeholder="$t('common.pleaseEnterResourceName')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <a-range-picker v-model="searchForm.timeRange" :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss" :placeholder="[$t('common.startTime'), $t('common.endTime')]" style="width: 100%" />
            </a-form-item>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 告警表格 -->
    <a-table style="margin-top: 10px" :columns="columns" :data-source="tableData" :pagination="false" :loading="loading"
      bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
      <template slot="name" slot-scope="text, record">
        <span style="color: #1890ff; cursor: pointer" @click="selectShow(record.id)">
          {{ text }}</span>
      </template>
      <template slot="alarmName" slot-scope="text, record">
        <span style="color: #1890ff; cursor: pointer" @click="selectAlarmShow(record)">
          {{ record.notificationType === 2? '' : text }}</span>
      </template>
      <!-- 告警级别列：Scoped Slot -->
      <template slot="notificationMethod" slot-scope="text">
        <a-tag class="severity-tag" :color="severityColorMap[text]">
          {{ severityMap[text] }}
        </a-tag>
      </template>

      <!-- 状态列：Scoped Slot -->
      <template slot="notificationStatus" slot-scope="text">
        <a-tag class="status-tag" :color="text == $t('common.failure') ? 'red' : 'green'">
          {{ text === '成功' ? $t('common.success') : text === '失败' ? $t('common.failure') : text }}
        </a-tag>
      </template>

      <!-- 处置状态列：Scoped Slot -->
      <template slot="disposalStatus" slot-scope="text">
        <a-tag class="disposal-tag" :color="disposalStatusColorMap[text]">
          {{ text === '已关闭' ? $t('common.closed') : text === '待处理' ? $t('common.pending') : text === '已忽略' ? $t('common.ignored') : text }}
        </a-tag>
      </template>

      <!-- 通知对象列：Scoped Slot - 实现单行省略+悬浮Tooltip -->
      <template slot="notificationTarget" slot-scope="text">
        <a-tooltip :title="text || ''" placement="topLeft">
          <div style="
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            {{ text || '-' }}
          </div>
        </a-tooltip>
      </template>

      <!-- 操作列：Scoped Slot -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a v-if="record.alarmStatus == 0" @click="recover(record.id)">{{ $t('common.recover') }}</a>
        </div>

      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="(total) => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('common.perPage') }}</span>
      </template>
    </a-pagination>

    <a-drawer :title="$t('common.messageNotificationDetail')" width="777px" placement="right" :closable="true" :visible="nameVisible"
      :mask-closable="false" @close="onClose">
      <alarmHistoryDetail :selectRow="detailObj"></alarmHistoryDetail>
    </a-drawer>
    <a-drawer :title="selectAlarmName" width="777px" placement="right" :closable="true" :visible="alarmVisible"
      :mask-closable="false" @close="onCloseAlarm">
      <alarmDetail :selectRow="selectAlarmRow"></alarmDetail>
    </a-drawer>
  </div>
</template>

<script>
import moment from "moment";
import alarmHistoryDetail from "./alarmHistoryDetail.vue";
import alarmDetail from "./alarmDetail.vue";
import { getAlarmHistory, recoverApi } from "@/api/monitor/task";
import { pushLogList, getAlarmLog } from "@/api/message/index";
import { getAlarmDetail } from "@/api/alarm.js";

import refreshTime from "@/components/refresh/index.vue";

export default {
  name: "AlarmHistory",
  components: { alarmHistoryDetail, refreshTime, alarmDetail },
  props: {
    selectId: {
      type: Object,
      default: 0,
    },
  },
  data() {
    return {
      showAll: false,
      alarmVisible: false,
      selectAlarmName: "",
      selectAlarmRow: {},
      selectName: "",
      nameVisible: false,
      selectRow: {},
      // 查询表单参数
      searchForm: {
        notificationTitle: "",
        alarmName: "",
        resourceName: "",
        notificationMethod: undefined,
        notificationStatus: undefined,
        timeRange: [], // 时间范围
      },
      // 下拉选项
      severitypeOptions: [
        { value: "dd", label: this.$t('common.dingTalk') },
        { value: "qywx", label: this.$t('common.wechatWork') },
        // { value: "wx", label: this.$t('common.wechat') },
        // { value: "dx", label: this.$t('common.sms') },
        // { value: "wh", label: this.$t('common.outboundCall') },
        // { value: "yhf", label: this.$t('common.recovered') },
        { value: "szh", label: this.$t('common.telecomServiceDesk') },
        { value: 'http', label: 'HTTP' }
      ],

      statusOptions: [
        { value: "成功", label: this.$t('common.success') },
        { value: "失败", label: this.$t('common.failure') },
      ],
      disposalStatusOptions: [
        { value: "已关闭", label: this.$t('common.closed') },
        { value: "待处理", label: this.$t('common.pending') },
        { value: "已忽略", label: this.$t('common.ignored') },
      ],
      severityMap: {
        dd: this.$t('common.dingTalk'),
        qywx: this.$t('common.wechatWork'),
        wx: this.$t('common.wechat'),
        dx: this.$t('common.sms'),
        wh: this.$t('common.outboundCall'),
        yhf: this.$t('common.recovered'),
        szh: this.$t('common.telecomServiceDesk'),
        http: 'HTTP'
      },
      // 颜色映射
      severityColorMap: {
        dd: "volcano",
        qywx: "volcano",
        wx: "volcano",
        dx: "volcano",
        wh: "volcano",
        yhf: "volcano",
        szh: "volcano",
        http: "volcano",
      },
      statusColorMap: {
        1: "green",
        0: "red",
      },
      disposalStatusColorMap: {
        [this.$t('common.closed')]: "green",
        [this.$t('common.pending')]: "orange",
        [this.$t('common.ignored')]: "default",
      },
      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      visible: false, // 模态框显隐
      editForm: {
        disposalStatus: "已关闭",
        disposalSuggestion: "",
      },
      selectedRows: [], // 批量操作选中行
      selectedRowKeys: [], // 批量操作选中行的key
      currentEditRecord: null, // 当前编辑的告警记录
      detailObj: {},
    };
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.notificationTitle'),
          dataIndex: "notificationTitle",
          key: "notificationTitle",
          width: "15%",
          scopedSlots: { customRender: "name" },
        },
        {
          title: this.$t('common.alarmName'),
          dataIndex: "alarmName",
          key: "alarmName",
          width: "15%",
          scopedSlots: { customRender: "alarmName" },
        },
        {
          title: this.$t('common.resourceName'),
          dataIndex: "resourceName",
          key: "resourceName",
          width: "15%",
          // scopedSlots: { customRender: "name" },
        },
        {
          title: this.$t('common.notificationMethod'),
          dataIndex: "notificationMethod",
          key: "notificationMethod",
          width: "10%",
          scopedSlots: { customRender: "notificationMethod" },
        },
        {
          title: this.$t('common.notificationTarget'),
          dataIndex: "notificationTarget",
          key: "notificationTarget",
          width: "15%",
          // 配置自定义渲染插槽
          scopedSlots: { customRender: "notificationTarget" },
          // 表头不换行
          customHeaderCell: () => ({
            style: {
              whiteSpace: 'nowrap'
            }
          }),
          // 单元格样式：强制单行、超出省略
          customCell: () => ({
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '1px'
            }
          })
        },
        {
          title: this.$t('common.notificationStatus'),
          dataIndex: "notificationStatus",
          key: "notificationStatus",
          width: "10%",
          scopedSlots: { customRender: "notificationStatus" },
        },
        {
          title: this.$t('common.notificationTime'),
          dataIndex: "notificationTime",
          key: "notificationTime",
          width: "15%",
          customRender: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
        },
      ];
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    addCondition() {
      this.searchForm.conditions.push({
        itemId: undefined,
        compareType: "like",
        itemValue: undefined,
        minValue: undefined,
        maxValue: undefined,
      });
    },
    changeShowAll() {
      this.showAll = !this.showAll;
      if (!this.showAll) {
        this.searchForm.alarmName = '';
        this.searchForm.resourceName = '';
        this.searchForm.timeRange = []
      }
    },
    // 获取项目的数据类型
    recover(id) {
      recoverApi({ id: id }).then((res) => {
        if (res.data) {
          this.$Message.success(this.$t('common.recoverySuccess'));
          this.fetchData();
        } else {
          this.$Message.error(this.$t('common.recoveryFailed'));
        }
      });
    },
    onClose() {
      this.nameVisible = false;
    },
    onCloseAlarm() {
      this.alarmVisible = false;
    },
    selectShow(id) {
      this.nameVisible = true;
      this.getDetailById(id);
    },
    selectAlarmShow(row) {
      console.log("row", row);
      getAlarmDetail(row.alarmId).then((res) => {
        this.selectAlarmRow = res.data;
        this.alarmVisible = true;
        this.selectAlarmName = row.name;
      });
    },
    getDetailById(logId) {
      let params = {
        logId: logId,
      };
      getAlarmLog(logId).then((res) => {
        console.log("res", res);
        this.detailObj = res.data;
      });
    },
    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize: this.pageSize,
        pageNo: this.currentPage,
        // assetId: this.selectId,
        notificationTitle: this.searchForm.notificationTitle,
        alarmName: this.searchForm.alarmName,
        resourceName: this.searchForm.resourceName,
        notificationMethod: this.searchForm.notificationMethod,
        notificationStatus: this.searchForm.notificationStatus,
        startTime: this.searchForm.timeRange[0]
          ? moment(this.searchForm.timeRange[0]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        endTime: this.searchForm.timeRange[1]
          ? moment(this.searchForm.timeRange[1]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
      };
      pushLogList(params).then((res) => {
        this.tableData = res.data && res.data.list;
        this.total = (res.data && res.data.total) || 0;
        this.loading = false;
      });
    },
    // 查询
    handleSearch() {
      this.currentPage = 1;
      this.fetchData();
    },
    // 重置
    handleReset() {
      this.searchForm = {
        name: "",
        severities: [],
        timeRange: [],
        status: "",
        disposalStatus: "",
      };
      this.handleSearch();
    },
    // 编辑
    handleEdit(record) {
      this.currentEditRecord = record;
      this.editForm.disposalStatus = record.disposalStatus;
      this.editForm.disposalSuggestion = record.disposalSuggestion || "";
      this.visible = true;
    },
    // 查看详情
    handleView(record) {
      this.$info({
        title: this.$t('common.alarmDetails'),
        width: 700,
        content: (
          <div>
            <p>
              <strong>{this.$t('common.name')}：</strong>
              {record.name}
            </p>
            <p>
              <strong>{this.$t('common.alarmLevel')}：</strong>
              {record.severity}
            </p>
            <p>
              <strong>{this.$t('common.triggerTime')}：</strong>
              {record.triggerTime}
            </p>
            <p>
              <strong>{this.$t('common.status')}：</strong>
              {record.status}
            </p>
            <p>
              <strong>{this.$t('common.duration')}：</strong>
              {record.duration}
            </p>
            <p>
              <strong>{this.$t('common.disposalStatus')}：</strong>
              {record.disposalStatus}
            </p>
          </div>
        ),
        onOk() { },
      });
    },
    // 保存编辑
    handleOk() {
      // 模拟更新（实际调用接口）
      const index = this.tableData.findIndex(
        (item) => item.id === this.currentEditRecord.id
      );
      if (index !== -1) {
        this.tableData[index].disposalStatus = this.editForm.disposalStatus;
        this.tableData[index].disposalSuggestion =
          this.editForm.disposalSuggestion;
      }
      this.visible = false;
      this.$message.success(this.$t('common.alarmInfoUpdatedSuccessfully'));
    },
    // 取消编辑
    handleCancel() {
      this.visible = false;
    },
    // 删除
    handleDelete(id) {
      this.tableData = this.tableData.filter((item) => item.id !== id);
      this.total = this.tableData.length;
      this.$message.success(this.$t('common.alarmRecordDeletedSuccessfully'));
    },
    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.fetchData();
    },
    // 批量操作
    handleBatchOperate(e) {
      const action = e.key;
      if (this.selectedRows.length === 0) {
        this.$message.warning(this.$t('common.pleaseSelectAlarmRecordsFirst'));
        return;
      }

      if (action === "batchClose") {
        this.selectedRows.forEach((row) => {
          row.disposalStatus = this.$t('common.closed');
        });
        this.$message.success(this.$t('common.batchCloseSuccess'));
        this.clearSelection();
      } else if (action === "batchDelete") {
        this.$confirm({
          title: this.$t('common.confirmDelete'),
          content: this.$t('common.confirmDeleteSelectedAlarmRecords', { count: this.selectedRows.length }),
          onOk: () => {
            const idsToDelete = this.selectedRows.map((row) => row.id);
            this.tableData = this.tableData.filter(
              (item) => !idsToDelete.includes(item.id)
            );
            this.total = this.tableData.length;
            this.$message.success(this.$t('common.batchDeleteSuccess'));
            this.clearSelection();
          },
        });
      } else if (action === "batchExport") {
        this.$message.info(this.$t('common.batchExportFunctionUnderDevelopment'));
      }
    },
    // 导出
    handleExport() {
      this.$message.info(this.$t('common.exportFunctionUnderDevelopment'));
    },
    // 设置
    handleSetting() {
      this.$message.info(this.$t('common.settingFunctionUnderDevelopment'));
    },
    // 刷新数据
    refreshData() {
      this.fetchData();
      this.$message.success(this.$t('common.dataRefreshed'));
    },
    // 清空选择
    clearSelection() {
      this.selectedRowKeys = [];
      this.selectedRows = [];
    },
  },
};
</script>

<style scoped lang="less">
// :deep(.ant-table-body) {
//   max-height: 65vh;
//   overflow-y: auto;
// }

.alarm-history {
  padding: 20px;
  background: #fff;
  height: 90vh;
  min-width: 1350px;
  overflow: auto;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  margin-left: 20px;
  // margin-bottom: 16px;
  // padding: 16px;
  background: #fff;
  /* border-radius: 8px; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.operation-buttons {
  display: flex;
  gap: 12px;
}

.severity-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.disposal-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.table-row-actions {
  display: flex;
  gap: 12px;
}

.table-row-actions a {
  color: #1890ff;
  transition: color 0.3s;
}

.table-row-actions a:hover {
  color: #40a9ff;
}

.pagination {
  padding: 16px;
  background: #fff;
  margin-left: auto;
  // width: 360px;
  /* border-radius: 8px; */
  margin-top: 16px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-table-thead>tr>th {
  background: #fafafa;
  font-weight: 600;
}

.ant-table-tbody>tr:hover>td {
  background: #f0f8ff !important;
}

.metric-name:hover {
  color: #096dd9;
  text-decoration: underline;
}

/deep/ .ant-table {
  .ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
  }

  .ant-table-tbody>tr:hover>td {
    background: #e6f7ff;
  }
}

/deep/ .ant-pagination {
  margin-top: 16px;

  @media (max-width: 576px) {

    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next,
    .ant-pagination-jump-prev,
    .ant-pagination-jump-next {
      margin-bottom: 8px;
    }
  }
}

/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
}

.pagination {
  text-align: right;
}

// 通知对象列样式兜底，确保效果稳定
/deep/ .ant-table td.ant-table-cell-notificationTarget {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

// Tooltip 样式优化，限制最大宽度并自动换行
/deep/ .ant-tooltip-inner {
  max-width: 300px;
  word-wrap: break-word;
}
</style>