<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
  


    <!-- 告警表格 -->
    <a-table
      style="margin-top: 10px;"
      :columns="columns"
      :data-source="tableData"
      
      :pagination="false"
      :loading="loading"
      bordered
      size="middle"
    >
        <template slot="name" slot-scope="text,record">
          <span style="color: #1890ff; cursor: pointer;" @click="selectShow(record)">  {{ text }}</span>
        </template>
      <!-- 告警级别列：Scoped Slot -->
      <template slot="severity" slot-scope="text">
        <a-tag class="severity-tag" :color="severityColorMap[text]">
          {{ severityMap[text] }}
        </a-tag>
      </template>

      <!-- 状态列：Scoped Slot -->
      <template slot="status" slot-scope="text">
        <a-tag class="status-tag" :color="text == 0? 'red': 'green'">
          {{ text == 0? $t('common.notRecovered'): $t('common.recovered') }}
        </a-tag>
      </template>

      <!-- 处置状态列：Scoped Slot -->
      <template slot="disposalStatus" slot-scope="text">
        <a-tag class="disposal-tag" :color="disposalStatusColorMap[text]">
          {{ text  }}
        </a-tag>      
      </template>

      <!-- 操作列：Scoped Slot -->
      <!-- <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a-popconfirm 
            title="确定删除这条告警记录吗？" 
            ok-text="确定" 
            cancel-text="取消"
            @confirm="handleDelete(record.id)"
          >
            <a>删除</a>
          </a-popconfirm>
        </div>
      </template> -->
    </a-table>
    
    <!-- 分页 -->
    <a-pagination
      class="pagination"
      :current="currentPage"
      :page-size="pageSize"
      :total="total"
      :show-total="total => $t('common.totalRecords', { total })"
      :page-size-options="['10', '20', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    >
     <template slot="buildOptionText" slot-scope="props">
      <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>
      
    </template>
  </a-pagination>

    <!-- 编辑模态框 -->
    <a-modal
      :visible="visible"
      :title="$t('common.editAlarm')"
      @ok="handleOk"
      @cancel="handleCancel"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      width="600px"
    >
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-item :label="$t('common.alarmName')">
          <a-input :value="currentEditRecord ? currentEditRecord.name : ''" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.alarmLevel')">
          <a-input :value="currentEditRecord ? currentEditRecord.severity : ''" disabled />
        </a-form-item>
        <a-form-item :label="$t('common.disposalStatus')">
          <a-select v-model="editForm.disposalStatus" :options="disposalStatusOptions" />
        </a-form-item>
        <a-form-item :label="$t('common.disposalSuggestion')">
          <a-textarea v-model="editForm.disposalSuggestion" :rows="4" :placeholder="$t('common.pleaseInputContent')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer
      :title="selectName"
      width="777px"
      placement="right"
      :closable="true"
      :visible="nameVisible"
       :mask-closable="false"
      @close="onClose"
    >
    <alarmHistoryDetail :selectRow="selectRow" activeTab="overview"></alarmHistoryDetail>
    </a-drawer>   
  </div>
</template>

<script>
import moment from 'moment'
import alarmHistoryDetail from './alarmHistoryDetail.vue'
import { getAlarmHistory } from "@/api/monitor/task";

export default {
  name: 'AlarmHistory',
  components:{alarmHistoryDetail},
  props:{
    selectId:{
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      selectRow:{},
      selectName:'',
      nameVisible: false,
      // 查询表单参数
      searchForm: {
        name: '',
        severities: [], // 多选：紧急、严重
        timeRange: [], // 时间范围
        status: '',
        disposalStatus: ''
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
      disposalStatusColorMap: {
        '已关闭': 'green',
        '待处理': 'orange',
        '已忽略': 'default'
      },
      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      visible: false, // 模态框显隐
      editForm: {
        disposalStatus: '已关闭',
        disposalSuggestion: ''
      },
      selectedRows: [], // 批量操作选中行
      selectedRowKeys: [], // 批量操作选中行的key
      currentEditRecord: null, // 当前编辑的告警记录
    }
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.name'),
          dataIndex: 'alarmTitle',
          key: 'alarmTitle',
          width: '15%',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('common.alarmLevel'),
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          width: '10%',
          scopedSlots: { customRender: 'severity' }
        },
        {
          title: this.$t('common.alarmTime'),
          dataIndex: 'alarmTime',
          key: 'alarmTime',
          width: '15%',
          customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: this.$t('common.alarmCount'),
          dataIndex: 'alarmCount',
          key: 'alarmCount',
          width: '15%',
        },        
        {
          title: this.$t('common.status'),
          dataIndex: 'alarmStatus',
          key: 'alarmStatus',
          width: '10%',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: this.$t('common.duration'),
          dataIndex: 'lastTime',
          key: 'lastTime',
          width: '15%',
        },
        // {
        //   title: this.$t('common.operation'),
        //   key: 'operation',
        //   width: '15%',
        //   scopedSlots: { customRender: 'operation' }
        // }
      ]
    },
    // 下拉选项
    severityOptions() {
      return [
        { value: 0, label: this.$t('common.notRecovered') },
        { value: 1, label: this.$t('common.recovered') },
      ];
    },
    statusOptions() {
      return [
        { value: 1, label: this.$t('common.warning') },
        { value: 2, label: this.$t('common.normal') },
        { value: 3, label: this.$t('common.critical') },
        { value: 4, label: this.$t('common.urgent') }
      ];
    },
    disposalStatusOptions() {
      return [
        { value: '已关闭', label: this.$t('common.closed') },
        { value: '待处理', label: this.$t('common.pending') },
        { value: '已忽略', label: this.$t('common.ignored') }
      ];
    },
    // 颜色映射
    severityMap() {
      return {
        1: this.$t('common.warning'),
        2: this.$t('common.normal'),
        3: this.$t('common.critical'),
        4: this.$t('common.urgent')
      };
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
            disabled: record.disposalStatus === '已关闭'
          }
        })
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onClose(){
      this.nameVisible = false
    },    
    selectShow(row){
      this.nameVisible = true
      this.selectName = row.name
      this.selectRow = row
    },
    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize:this.pageSize,
        pageNo: this.currentPage,
        assetId: this.selectId,
        alarmTitle: this.searchForm.alarmTitle || undefined,
        startTime: this.searchForm.timeRange[0] || undefined,
        endTime: this.searchForm.timeRange[1] || undefined,
        alarmStatus: '0',
      }
       getAlarmHistory(params).then((res) => {
        this.tableData = res.data && res.data.list;
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
    // 编辑
    handleEdit(record) {
      this.currentEditRecord = record;
      this.editForm.disposalStatus = record.disposalStatus;
      this.editForm.disposalSuggestion = record.disposalSuggestion || '';
      this.visible = true;
    },
    // 查看详情
    handleView(record) {
      this.$info({
        title: this.$t('common.alarmDetails'),
        width: 700,
        content: (
          <div>
            <p><strong>{this.$t('common.name')}：</strong>{record.name}</p>
            <p><strong>{this.$t('common.alarmLevel')}：</strong>{record.severity}</p>
            <p><strong>{this.$t('common.triggerTime')}：</strong>{record.triggerTime}</p>
            <p><strong>{this.$t('common.status')}：</strong>{record.status}</p>
            <p><strong>{this.$t('common.duration')}：</strong>{record.duration}</p>
            <p><strong>{this.$t('common.disposalStatus')}：</strong>{record.disposalStatus}</p>
          </div>
        ),
        onOk() {},
      });
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
    // 删除
    handleDelete(id) {
      this.tableData = this.tableData.filter((item) => item.id !== id);
      this.total = this.tableData.length;
      this.$message.success(this.$t('common.alarmRecordDeleteSuccess'));
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
        this.$message.warning(this.$t('common.pleaseSelectAlarmRecord'));
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
          content: this.$t('common.confirmDeleteAlarmRecords', { count: this.selectedRows.length }),
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

<style scoped>
.alarm-history {
  padding:0 20px;
  background: #fff;
  /* min-height: 100vh; */
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
  text-align: right;
  /* padding: 16px;
  background: #fff;
  margin-left: auto;
  width: 360px; */
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
</style>
