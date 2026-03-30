<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="4">
            <a-form-item >
              <a-input v-model="searchForm.ruleName" :placeholder="$t('common.enterRuleName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <!-- 告警级别（多选） -->
          <a-col :span="4">
            <a-form-item >
              <a-select v-model="searchForm.ruleSwitch" :options="severityOptions" :placeholder="$t('common.selectStatus')" allowClear
                style="width: 100%;" :not-found-content="$t('common.noData')" />
            </a-form-item>
          </a-col>

          <!-- 触发时间（时间范围） -->
          <!-- <a-col :span="5">
            <a-form-item label="时间范围">
              <a-range-picker
                v-model="searchForm.timeRange"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="['开始时间', '结束时间']"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col> -->



          <!-- 操作按钮 -->
          <a-col :span="8" style="display: flex; align-items: center;padding-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('common.reset') }}</a-button>
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
          <a-button type="primary" ghost @click="handleAdd">
            <a-icon type="plus" />{{ $t('common.create') }}
          </a-button>
        </div>

      </div>
    </div>

    <!-- 告警表格 -->
    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
      <template slot="ruleName" slot-scope="text, record">
        <span style="color: #1890ff; cursor: pointer" @click="handleView(record)">
          {{ text }}</span>
      </template>
      <template slot="mergeFields" slot-scope="text,record">
        <span> {{ getMergeFields(text) }}</span>
      </template>
      <!-- 告警级别列：Scoped Slot -->


      <!-- 状态列：Scoped Slot -->
      <template slot="status" slot-scope="text">
        <a-tag class="status-tag" :color="text === true ? 'green' : 'red'">
          {{ text === true ? $t('common.on') : $t('common.off') }}
        </a-tag>
      </template>

      <!-- 处置状态列：Scoped Slot -->
      <template slot="channelString" slot-scope="text">
        {{ handleChannelString(text) }}
      </template>

      <!-- 操作列：Scoped Slot -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="handleEdit(record)">{{ $t('common.edit') }}</a>
          <a @click="handleDelete(record.ruleId)">{{ $t('common.delete') }}</a>
          <!-- <a-popconfirm 
            title="确定删除这条消息通知规则吗？" 
            ok-text="确定" 
            cancel-text="取消"
            @confirm="handleDelete(record.ruleId)"
          >
            <a>删除</a>
          </a-popconfirm> -->

        </div>

      </template>
    </a-table>


    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('common.perPage') }}</span>

      </template>
    </a-pagination>

    <!-- 编辑模态框 -->

    <edit-modal ref="editModal" :rowData="rowData" :isView="isView" @refreshList="refreshList"></edit-modal>
  </div>
</template>

<script>
import moment from 'moment'

import { messageList, deleteMessage } from "@/api/monitor/task";
import refreshTime from '@/components/refresh/index.vue'
import editModal from './components/editModal.vue'
import { getRuleDetail } from '../../../api/monitor/task';
import { getNotificationGroup } from "@/api/notice/notice";
export default {
  name: 'AlarmHistory',
  components: { editModal, refreshTime },
  props: {
    selectId: {
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      isView: false,
      selectName: '',
      nameVisible: false,
      selectRow: {},
      // 查询表单参数
      searchForm: {
        ruleName: '',
        ruleSwitch: undefined,

      },
      // messageObj 移至 computed 属性
      // messageList 移至 computed 属性
      // 下拉选项
      // severityOptions 移至 computed 属性
      // statusOptions 移至 computed 属性
      // disposalStatusOptions 移至 computed 属性
      // severityMap 移至 computed 属性
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
      // disposalStatusColorMap 移至 computed 属性
      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      visible: false, // 模态框显隐
      // editForm 移至 computed 属性
      selectedRows: [], // 批量操作选中行
      selectedRowKeys: [], // 批量操作选中行的key
      currentEditRecord: null, // 当前编辑的告警记录
      rowData: {},
      userOptions: []
    }
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.ruleName'),
          dataIndex: 'ruleName',
          key: 'ruleName',
          width: '15%',
          scopedSlots: { customRender: 'ruleName' }
        },
        {
          title: this.$t('common.notificationObject'),
          dataIndex: 'mergeFields',
          key: 'mergeFields',
          width: '15%',
          scopedSlots: { customRender: 'mergeFields' }
        },
        {
          title: this.$t('common.notificationTime'),
          dataIndex: 'noticeTime',
          key: 'noticeTime',
          width: '15%',
        },
        {
          title: this.$t('common.creator'),
          dataIndex: 'creator',
          key: 'creator',
          width: '15%',
        },
        {
          title: this.$t('common.ruleStatus'),
          dataIndex: 'ruleSwitch',
          key: 'ruleSwitch',
          width: '10%',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: this.$t('common.createTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: '15%',
          customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '15%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    // 表格多选配置
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys;
          this.selectedRows = selectedRows;
        },
        getCheckboxProps: record => ({
          props: {
            disabled: record.disposalStatus === this.$t('common.closed')
          }
        })
      }
    },
    // 消息对象映射
    messageObj() {
      return {
        dd: this.$t('common.dingTalk'),
        qywx: this.$t('common.wecom'),
        wx: this.$t('common.wechat'),
        dx: this.$t('common.sms'),
        wh: this.$t('common.outboundCall'),
        szh: this.$t('common.telecomServiceDesk')
      };
    },
    // 消息列表
    messageList() {
      return [
        { label: this.$t('common.dingTalk'), value: 'dd' },
        { label: this.$t('common.wecom'), value: 'qywx' },
        { label: this.$t('common.wechat'), value: 'wx' },
        { label: this.$t('common.sms'), value: 'dx' },
        { label: this.$t('common.outboundCall'), value: 'wh' },
        { label: this.$t('common.telecomServiceDesk'), value: 'szh' }
      ];
    },
    // 状态选项
    severityOptions() {
      return [
        { value: false, label: this.$t('common.off') },
        { value: true, label: this.$t('common.on') }
      ];
    },
    // 状态选项
    statusOptions() {
      return [
        { value: this.$t('common.recovered'), label: this.$t('common.recovered') },
        { value: this.$t('common.unrecovered'), label: this.$t('common.unrecovered') },
        { value: this.$t('common.processing'), label: this.$t('common.processing') }
      ];
    },
    // 处置状态选项
    disposalStatusOptions() {
      return [
        { value: this.$t('common.closed'), label: this.$t('common.closed') },
        { value: this.$t('common.pending'), label: this.$t('common.pending') },
        { value: this.$t('common.ignored'), label: this.$t('common.ignored') }
      ];
    },
    // 严重程度映射
    severityMap() {
      return {
        1: this.$t('common.warning'),
        2: this.$t('common.normal'),
        3: this.$t('common.severe'),
        4: this.$t('common.urgent')
      };
    },
    // 处置状态颜色映射
    disposalStatusColorMap() {
      return {
        [this.$t('common.closed')]: 'green',
        [this.$t('common.pending')]: 'orange',
        [this.$t('common.ignored')]: 'default'
      };
    },
    // 编辑表单
    editForm() {
      return {
        disposalStatus: this.$t('common.closed'),
        disposalSuggestion: ''
      };
    }
  },
  mounted() {
    this.getUserOptions()

  },
  methods: {
    refreshList(){
      this.getUserOptions()
      this.fetchData()
    },
    getMergeFields(text) {
      let value = []
      text.forEach(tItem => {
        this.userOptions.forEach(item => {
          if (tItem == item.value) {
            value.push(item.label)
          }

        })

      })

      return value.join(',')
    },
    handleChannelString(text) {
      let arrayVal = text.map(item => {
        return this.messageObj[item] || ''
      }
      )?.join(',')

      return arrayVal
    },
    handleAdd() {
      this.rowData = {};
      this.isView = false;
      this.$refs.editModal.showModal = true;
    },
    recover(id) {
      recoverApi({ id: id }).then((res) => {
        //
      })
    },
    onClose() {
      this.nameVisible = false
    },
    selectShow(row) {
      this.nameVisible = true
      this.selectName = row.name
      this.selectRow = row
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
      }
      messageList(params).then((res) => {
        this.tableData = res.data && res.data.list;
        this.tableData = this.tableData.map(item => {
          return {
            ...item,
            noticeTime: item.startTime != '' && item.endTime != '' ? item.startTime + ' ~ ' + item.endTime : this.$t('common.allDay')
          }
        })
        this.total = (res.data && res.data.total) || 0;
       
        this.loading = false
        
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
        name: '',
        severities: [],
        timeRange: [],
        status: '',
        disposalStatus: ''
      };
      this.handleSearch();
    },
    // 查看
    handleView(row) {
      this.rowData = JSON.parse(JSON.stringify(row))
      this.isView = true
      this.$refs.editModal.showModal = true;
    },
    // 编辑
    handleEdit(row) {
      // this.currentEditRecord = record;
      // this.editForm.disposalStatus = record.disposalStatus;
      // this.editForm.disposalSuggestion = record.disposalSuggestion || '';
      // getRuleDetail({ruleId: ruleId}).then((res) =>{
      //    this.visible = true;
      // })
      this.rowData = JSON.parse(JSON.stringify(row))
      this.isView = false
      this.$refs.editModal.showModal = true;

    },
    // 保存编辑
    handleOk() {
      // 模拟更新（实际调用接口）
      const index = this.tableData.findIndex((item) => item.id === this.currentEditRecord.id);
      if (index !== -1) {
        this.tableData[index].disposalStatus = this.editForm.disposalStatus;
        this.tableData[index].disposalSuggestion = this.editForm.disposalSuggestion;
      }
      this.visible = false;
      this.$message.success(this.$t('common.alarmInfoUpdateSuccess'));
    },
    // 取消编辑
    handleCancel() {
      this.visible = false;
    },
    getUserOptions() {
      let params = {
        pageSize: 999,
        pageNo: 1,

      }
      getNotificationGroup(params).then((res) => {
        let userOptions = res.data && res.data.list;
        this.userOptions = userOptions.map(item => {
          return {
            label: item.groupName,
            value: item.id
          }
        })
        this.fetchData();
      });
    },
    // 删除
    handleDelete(id) {
      this.$confirm(this.$t('common.confirmDeleteMessageRule'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function () {
          return deleteMessage({ ruleId: id });
        })
        .then(() => {
          this.$message.success(this.$t('common.messageRuleDeleteSuccess'));
          this.fetchData()

        })
        .catch(() => {
          // this.$message.error(this.$t('common.messageRuleDeleteFailed'));
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
        this.$message.warning(this.$t('common.pleaseSelectAlarmRecords'));
        return;
      }

      if (action === 'batchClose') {
        this.selectedRows.forEach((row) => {
          row.disposalStatus = this.$t('common.closed');
        });
        this.$message.success(this.$t('common.batchCloseSuccess'));
        this.clearSelection();
      } else if (action === 'batchDelete') {
        this.$confirm({
          title: this.$t('common.confirmDelete'),
          content: this.$t('common.confirmDeleteSelectedAlarmRecords', { count: this.selectedRows.length }),
          onOk: () => {
            const idsToDelete = this.selectedRows.map(row => row.id);
            this.tableData = this.tableData.filter(item => !idsToDelete.includes(item.id));
            this.total = this.tableData.length;
            this.$message.success(this.$t('common.batchDeleteSuccess'));
            this.clearSelection();
          }
        });
      } else if (action === 'batchExport') {
        this.$message.info(this.$t('common.batchExportInDevelopment'));
      }
    },
    // 导出
    handleExport() {
      this.$message.info(this.$t('common.exportInDevelopment'));
    },
    // 设置
    handleSetting() {
      this.$message.info(this.$t('common.settingInDevelopment'));
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
    }
  }
}
</script>

<style scoped lang="less">
.alarm-history {
  padding: 20px;
  background: #fff;
  height: 90vh;
  overflow-y: auto;
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
</style>