<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee; margin-bottom: 10px">
      <a-form
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        style="font-size: 16px !important"
      >
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="4">
            <a-form-item :label="$t('common.templateName')">
              <a-input
                v-model="searchForm.ruleName"
                :placeholder="$t('common.pleaseInputTemplateName')"
                allowClear
                style="width: 100%"
              />
            </a-form-item>
          </a-col>

          <!-- 告警级别（多选） -->
          <a-col :span="4">
            <a-form-item :label="$t('common.resourceModel')">
              <a-select
                v-model="searchForm.ruleSwitch"
                :options="severityOptions"
                :placeholder="$t('common.pleaseSelectResourceModel')"
                allowClear
                style="width: 100%"
              />
            </a-form-item>
          </a-col>

          <!-- 操作按钮 -->
          <a-col
            :span="8"
            style="display: flex; align-items: center; padding-top: 3px"
          >
            <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
            <a-button
              type="primary"
              ghost
              style="margin-left: 12px"
              @click="handleReset"
              >{{ $t('common.reset') }}</a-button
            >
            <!-- <a-button type="primary" ghost style="margin-left: 12px;" @click="handleAdd" >新增</a-button> -->
          </a-col>
          <!-- <div style="margin-left: auto;">
          <refreshTime @refresh="fetchData"></refreshTime> 
        </div>           -->
        </a-row>
      </a-form>
    </div>
    <!-- 操作按钮区域 -->
    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="dashed" @click="handleAdd">
            <a-icon type="plus" />{{ $t('common.create') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 告警表格 -->
    <a-table
      style="margin-top: 10px"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :loading="loading"
      bordered
      size="middle"
    >
      <!-- <template slot="name" slot-scope="text,record">
          <span style="color: #1890ff; cursor: pointer;" @click="selectShow(record)">  {{ text }}</span>
        </template> -->
      <!-- 告警级别列：Scoped Slot -->

      <!-- 状态列：Scoped Slot -->
      <template slot="ruleSwitch" slot-scope="text">
        <a @click="handleList(record)">6</a>
      </template>

      <!-- 处置状态列：Scoped Slot -->
      <template slot="channelString" slot-scope="text">
        {{ handleChannelString(text) }}
      </template>

      <!-- 操作列：Scoped Slot -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="hanleCopy(record)">{{ $t('common.copy') }}</a>
          <a @click="handleEdit(record)">{{ $t('common.edit') }}</a>
          <a @click="handleDelete(record.ruleId)">{{ $t('common.delete') }}</a>
          <!-- <a-popconfirm 
            :title="$t('common.confirmDeleteThisMessageNotificationRule')" 
            :ok-text="$t('common.confirm')" 
            :cancel-text="$t('common.cancel')"
            @confirm="handleDelete(record.ruleId)"
          >
            <a>{{ $t('common.delete') }}</a>
          </a-popconfirm> -->
        </div>
      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination
      class="pagination"
      :current="currentPage"
      :page-size="pageSize"
      :total="total"
      :show-total="(total) => $t('common.totalRecords', { total })"
      :page-size-options="['10', '20', '50', '100']"
      show-size-changer
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    >
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>
      </template>
    </a-pagination>

    <!-- 编辑模态框 -->

    <edit-modal
      ref="editModal"
      :rowData="rowData"
      @refreshList="fetchData"
    ></edit-modal>
    <indicatorList ref="indicatorList" @refreshList="fetchData">
    </indicatorList>
  </div>
</template>

<script>
import moment from "moment";

import { messageList, deleteMessage } from "@/api/monitor/task";
import refreshTime from "@/components/refresh/index.vue";
import editModal from "./components/editModal.vue";
import indicatorList from "./components/indicatorList.vue";

import { getRuleDetail } from "../../../api/monitor/task";
export default {
  name: "AlarmHistory",
  components: { editModal, refreshTime, indicatorList },
  props: {
    selectId: {
      type: Object,
      default: 0,
    },
  },
  data() {
    return {
      selectName: "",
      nameVisible: false,
      selectRow: {},
      // 查询表单参数
      searchForm: {
        ruleName: "",
        ruleSwitch: "",
      },
      messageObj: {
        dd: this.$t('common.dingTalk'),
        qywx: this.$t('common.wechatWork'),
        wx: this.$t('common.wechat'),
        dx: this.$t('common.sms'),
        wh: this.$t('common.outboundCall'),
        szh: this.$t('common.telecomServiceDesk'),
      },
      messageList: [
        {
          label: this.$t('common.dingTalk'),
          value: "dd",
        },
        {
          label: this.$t('common.wechatWork'),
          value: "qywx",
        },
        {
          label: this.$t('common.wechat'),
          value: "wx",
        },
        {
          label: this.$t('common.sms'),
          value: "dx",
        },
        {
          label: this.$t('common.outboundCall'),
          value: "wh",
        },
        {
          label: this.$t('common.telecomServiceDesk'),
          value: "szh",
        },
      ],
      // 下拉选项
      severityOptions: [
        { value: false, label: this.$t('common.off') },
        { value: true, label: this.$t('common.on') },
      ],
      statusOptions: [
        { value: "已恢复", label: this.$t('common.recovered') },
        { value: "未恢复", label: this.$t('common.unrecovered') },
        { value: "处理中", label: this.$t('common.processing') },
      ],
      disposalStatusOptions: [
        { value: "已关闭", label: this.$t('common.closed') },
        { value: "待处理", label: this.$t('common.pending') },
        { value: "已忽略", label: this.$t('common.ignored') },
      ],
      severityMap: {
          1: this.$t('common.warning'),
          2: this.$t('common.normal'),
          3: this.$t('common.severe'), 
          4: this.$t('common.emergency')
      },
      // 颜色映射
      severityColorMap: {
        4: "red",
        3: "volcano",
        2: "orange",
        1: "blue",
      },
      statusColorMap: {
        1: "green",
        0: "red",
      },
      disposalStatusColorMap: {
        已关闭: "green",
        待处理: "orange",
        已忽略: "default",
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
      rowData: {},
    };
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.templateName'),
          dataIndex: "ruleName",
          key: "ruleName",
          width: "15%",
          // scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('common.resourceModel'),
          dataIndex: "channelString",
          key: "channelString",
          width: "15%",
          scopedSlots: { customRender: "channelString" },
        },
        {
          title: this.$t('common.deviceType'),
          dataIndex: "creator",
          key: "creator",
          width: "15%",
        },

        {
          title: this.$t('common.indicatorItem'),
          dataIndex: "ruleSwitch",
          key: "ruleSwitch",
          width: "10%",
          scopedSlots: { customRender: "ruleSwitch" },
        },

        {
          title: this.$t('common.createTime'),
          dataIndex: "createTime",
          key: "createTime",
          width: "15%",
          customRender: (text) => moment(text).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          title: this.$t('common.operation'),
          key: "operation",
          width: "15%",
          scopedSlots: { customRender: "operation" },
        },
      ];
    },
    // 表格多选配置
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys;
          this.selectedRows = selectedRows;
        },
        getCheckboxProps: (record) => ({
          props: {
            disabled: record.disposalStatus === "已关闭",
          },
        }),
      };
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    handleList() {
      this.$refs.indicatorList.showModal = true;
    },
    handleChannelString(text) {
      let arrayVal = text
        .map((item) => {
          return this.messageObj[item] || "";
        })
        ?.join(",");

      return arrayVal;
    },
    handleAdd() {
      this.rowData = {};
      this.$refs.editModal.showModal = true;
    },
    recover(id) {
      recoverApi({ id: id }).then((res) => {
        //
      });
    },
    onClose() {
      this.nameVisible = false;
    },
    selectShow(row) {
      this.nameVisible = true;
      this.selectName = row.name;
      this.selectRow = row;
    },
    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize: this.pageSize,
        pageNo: this.currentPage,
        // assetId: this.selectId,
        ruleName: this.searchForm.ruleName || undefined,
        ruleType: this.searchForm.ruleType || undefined,
        ruleSwitch: this.searchForm.ruleSwitch,
      };
      messageList(params).then((res) => {
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
    handleEdit(row) {
      // this.currentEditRecord = record;
      // this.editForm.disposalStatus = record.disposalStatus;
      // this.editForm.disposalSuggestion = record.disposalSuggestion || '';
      // getRuleDetail({ruleId: ruleId}).then((res) =>{
      //    this.visible = true;
      // })
      this.rowData = JSON.parse(JSON.stringify(row));
      this.$refs.editModal.showModal = true;
    },
    //复制
    hanleCopy(row) {
      console.log("2222222,", row);
    },
    // 查看详情
    handleView(record) {
      this.$info({
        title: "告警详情",
        width: 700,
        content: (
          <div>
            <p>
              <strong>名称：</strong>
              {record.name}
            </p>
            <p>
              <strong>告警级别：</strong>
              {record.severity}
            </p>
            <p>
              <strong>触发时间：</strong>
              {record.triggerTime}
            </p>
            <p>
              <strong>状态：</strong>
              {record.status}
            </p>
            <p>
              <strong>持续时间：</strong>
              {record.duration}
            </p>
            <p>
              <strong>处置状态：</strong>
              {record.disposalStatus}
            </p>
          </div>
        ),
        onOk() {},
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
      this.$message.success(this.$t('alarm.alarmInfoUpdated'));
    },
    // 取消编辑
    handleCancel() {
      this.visible = false;
    },
    // 删除
    handleDelete(id) {
      this.$modal
        .confirm(this.$t('common.confirmDeleteThisMessageNotificationRule'))
        .then(function () {
          return deleteMessage({ ruleId: id });
        })
        .then(() => {
          this.$message.success(this.$t('common.messageNotificationRuleDeletedSuccessfully'));
          this.fetchData();
        })
        .catch(() => {
          // this.$message.error(this.$t('common.messageNotificationRuleDeletionFailed'));
        });
      // this.tableData = this.tableData.filter((item) => item.id !== id);
      // this.total = this.tableData.length;
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
        this.$message.warning(this.$t('alarm.pleaseSelectAlarmRecords'));
        return;
      }

      if (action === "batchClose") {
        this.selectedRows.forEach((row) => {
          row.disposalStatus = "已关闭";
        });
        this.$message.success(this.$t('alarm.batchCloseSuccess'));
        this.clearSelection();
      } else if (action === "batchDelete") {
        this.$confirm({
          title: "确认删除",
          content: `确定要删除选中的 ${this.selectedRows.length} 条告警记录吗？`,
          onOk: () => {
            const idsToDelete = this.selectedRows.map((row) => row.id);
            this.tableData = this.tableData.filter(
              (item) => !idsToDelete.includes(item.id)
            );
            this.total = this.tableData.length;
            this.$message.success(this.$t('alarm.batchDeleteSuccess'));
            this.clearSelection();
          },
        });
      } else if (action === "batchExport") {
        this.$message.info(this.$t('common.batchExportInDevelopment'));
      }
    },
    // 导出
    handleExport() {
      this.$message.info(this.$t('common.exportInDevelopment'));
    },
    // 设置
    handleSetting() {
      this.$message.info(this.$t('common.settingsInDevelopment'));
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
.alarm-history {
  padding: 20px;
  background: #fff;
  min-height: 89vh;
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
  margin-bottom: 16px;
  padding: 16px;
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

.ant-table-thead > tr > th {
  background: #fafafa;
  font-weight: 600;
}

.ant-table-tbody > tr:hover > td {
  background: #f0f8ff !important;
}
.metric-name:hover {
  color: #096dd9;
  text-decoration: underline;
}
/deep/ .ant-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }
  .ant-table-tbody > tr:hover > td {
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
/deep/ .ant-table-thead > tr > th {
  background: #e6f0fb !important;
}
.pagination {
  text-align: right;
}
</style>
