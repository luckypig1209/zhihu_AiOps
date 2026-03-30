<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="3">
            <a-form-item >
              <a-input
                v-model="searchForm.alarmTitle"
                :placeholder="$t('common.pleaseInputName')"

                allowClear
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>

          <!-- 告警级别（多选） -->
          <a-col :span="4">
            <a-form-item >
              <a-select
                v-model="searchForm.alarmStatus"
                :options="severityOptions"
                :placeholder="$t('common.pleaseSelectAlarmStatus')"
                allowClear
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>

          <!-- 触发时间（时间范围） -->
          <a-col :span="5">
            <a-form-item>
              <a-range-picker
                v-model="searchForm.timeRange"
                :show-time="{ format: 'HH:mm:ss' }"
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="[$t('common.startTime'), $t('common.endTime')]"
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>

          <!-- 状态（单选） -->
          <!-- <a-col :span="7">
            <a-form-item :label="$t('common.status')">
              <a-select
                v-model="searchForm.status"
                :options="statusOptions"
                :placeholder="$t('common.pleaseSelectStatus')"
                allowClear
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>


          <a-col :span="7">
            <a-form-item :label="$t('common.disposalStatus')">
              <a-select
                v-model="searchForm.disposalStatus"
                :options="disposalStatusOptions"
                :placeholder="$t('common.pleaseSelectDisposalStatus')"
                allowClear
                style="width: 100%;"
              />
            </a-form-item>
          </a-col> -->

          <!-- 操作按钮 -->
          <a-col :span="6" style="display: flex; align-items: center;margin-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('common.query') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset" >{{ $t('common.reset') }}</a-button>
           <div style="margin-left: 10px">
              <img
                v-if="showAll"
                style="width: 24px; height: 24px"
                src="@/assets/images/loudouoon.png"
                alt=""
                @click="changeShowAll"
              />
              <img
                v-else
                style="width: 24px; height: 24px"
                src="@/assets/images/loudouoff.png"
                alt=""
                @click="changeShowAll"
              />
            </div>
          </a-col>
        <div style="margin-left: auto;margin-top: -3px;">
          <refreshTime @refresh="fetchData"></refreshTime>
        </div>
        </a-row>
      </a-form>

      <a-form v-if="showAll" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="4">
            <a-form-item  >
             <el-select
                v-model="searchForm.alarmLevelList"
                :multiple="true"
                collapse-tags
                filterable
                :placeholder="$t('common.pleaseSelectAlarmLevel')"
                style="width: 100%;"
              >
               <el-option
                  v-for="item in severityList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </a-form-item>
          </a-col>

          <!-- 告警级别（多选） -->
          <a-col :span="4">
            <a-form-item >
              <el-select
                v-model="searchForm.assetModelCodeList"
                :multiple="true"
                collapse-tags
                filterable
                :placeholder="$t('common.pleaseSelectResourceType')"
                style="width: 100%;"
              >
               <el-option
                  v-for="item in modelList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <!-- <el-select
                v-model="searchForm.assetModelCodeList"
                :options="modelList"
                :show-search="true"
                 mode="multiple"
                 :maxTagCount="1"
                 filterable
                :placeholder="$t('common.pleaseSelectResourceType')"
                allowClear
                @change="changeSourceList(index, form.sourceConditions[index].leftValue, 'edit')"
                style="width: 100%;"
              /> -->
            </a-form-item>
          </a-col>

          <!-- 触发时间（时间范围） -->
          <a-col :span="5">
            <a-form-item >
              <a-input
                v-model="searchForm.assetName"
                :placeholder="$t('common.pleaseInputResourceName')"
                allowClear
                style="width: 100%;"
              />
            </a-form-item>
          </a-col>


        </a-row>
      </a-form>
    </div>

    <!-- 批量操作 + 导出 + 设置 -->


    <!-- 告警表格 -->
    <a-table
    style="margin-top: 10px;"
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :loading="loading"
      bordered
      size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
        <template slot="name" slot-scope="text,record">
           <a-tooltip placement="top" :title={text}>
               <span style="color: #1890ff; cursor: pointer;" @click="selectShow(record)">  {{ text }}</span>
            </a-tooltip>

        </template>
        <template slot="assetName" slot-scope="text,record">
           <a-tooltip placement="top" :title={text}>
                <span v-if="!record.dialingTarget" style="color: #1890ff; cursor: pointer;" @click="selectAssert(record)">  {{ text }}</span>
                <span v-else >  {{ text }}</span>
            </a-tooltip>

        </template>
      <!-- 告警级别列：Scoped Slot -->
      <template slot="severity" slot-scope="text">
        <a-tag class="severity-tag" :color="severityColorMap[text]">
          {{severityMap[text] }}
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
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">

         <a v-if="record.alarmStatus == 0" @click="recover(record.id)">{{ $t('common.recover') }}</a>
        </div>
          <!-- <a-button   type="default" >
                恢复
              </a-button> -->
      </template>
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
    <alarmHistoryDetail :selectRow="selectRow"></alarmHistoryDetail>
    </a-drawer>
    <!-- 设备详情抽屉 -->
    <a-drawer
      v-if="isDestory"
      :title="selectName1"
      width="1080px"
      placement="right"
      :closable="true"
      :visible="nameVisible1"
       :mask-closable="false"
      @close="onClose1"
    >
      <deviceDetail
        :selectRow="selectRow1"
        :assertInfo="assertInfo1"
      ></deviceDetail>
    </a-drawer>
  </div>
</template>

<script>
import moment from 'moment'
import alarmHistoryDetail from './alarmHistoryDetail.vue'
import { getAlarmHistory, recoverApi } from "@/api/monitor/task";
import refreshTime from '@/components/refresh/index.vue'
import {
  getAssetModelPage,
} from "@/api/resource";
import deviceDetail from '@/views/faultManage/networkDevice/components/deviceDetail'
export default {
  name: 'AlarmHistory',
  components:{alarmHistoryDetail, refreshTime, deviceDetail},
  props:{
    selectId:{
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      modelList:[],
      assertList:[],
      selectName:'',
      nameVisible: false,
      selectRow:{},
      selectName1:'',
      nameVisible1: false,
      selectRow1:{},
      assertInfo1:{
        modelId: undefined,
        assetTypeId: undefined,
        modelCode: undefined,
      },
      isDestory: true,
      // 查询表单参数
      searchForm: {
        name: '',
        severities: [], // 多选：紧急、严重
        timeRange: [], // 时间范围
        alarmStatus: 0,
        disposalStatus: '',
        alarmLevelList: [], // 告警级别
        assetModelCodeList: [] // 资源类型
      },
      // 颜色映射
      severityColorMap: {
        5: 'red',
        4: 'red',
        3: 'volcano',
        2: 'orange',
        1: 'blue'
      },
      statusColorMap: {
        1: 'green',
        0: 'red',
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
      showAll: false,
    }
  },
  computed: {
    // 告警级别下拉选项（国际化）
    severityList() {
      return [
        { label: this.$t('common.warning'), value: '1' },
        { label: this.$t('common.normal'), value: '2' },
        { label: this.$t('common.critical'), value: '3' },
        { label: this.$t('common.urgent'), value: '4' },
      ];
    },
    // 告警状态下拉选项（国际化）
    severityOptions() {
      return [
        { value: 0, label: this.$t('common.notRecovered') },
        { value: 1, label: this.$t('common.recovered') },
      ];
    },
    // 状态下拉选项（国际化）
    statusOptions() {
      return [
        { value: '已恢复', label: this.$t('common.recovered') },
        { value: '未恢复', label: this.$t('common.notRecovered') },
        { value: '处理中', label: this.$t('common.processing') }
      ];
    },
    // 处置状态下拉选项（国际化）
    disposalStatusOptions() {
      return [
        { value: '已关闭', label: this.$t('common.closed') },
        { value: '待处理', label: this.$t('common.pending') },
        { value: '已忽略', label: this.$t('common.ignored') }
      ];
    },
    // 告警级别映射（国际化）
    severityMap() {
      return {
        1: this.$t('common.warning'),
        2: this.$t('common.normal'),
        3: this.$t('common.critical'),
        4: this.$t('common.urgent'),
      };
    },
    // 告警级别对象映射（国际化）
    severityObj() {
      return {
        '预警': '1',
        '普通': '2',
        '严重': '3',
        '紧急': '4',
      };
    },
    // 处置状态颜色映射（国际化）
    disposalStatusColorMap() {
      return {
        '已关闭': 'green',
        '待处理': 'orange',
        '已忽略': 'default'
      };
    },
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.name'),
          dataIndex: 'alarmTitle',
          key: 'alarmTitle',
          width: '20%',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('common.alarmLevel'),
          dataIndex: 'alarmLevel',
          key: 'alarmLevel',
          width: '8%',
          scopedSlots: { customRender: 'severity' }
        },
        {
          title: this.$t('common.resourceType'),
          dataIndex: 'assetModelName',
          key: 'assetModelName',
          width: '8%',

        },
        {
          title: this.$t('common.resourceName'),
          dataIndex: 'assetName',
          key: 'assetName',
          width: '10%',
          scopedSlots: { customRender: 'assetName' }

        },
        {
          title: this.$t('common.alarmTime'),
          dataIndex: 'alarmTime',
          key: 'alarmTime',
          width: '12%',
          customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: this.$t('common.alarmUpdateTime'),
          dataIndex: 'updateTime',
          key: 'updateTime',
          width: '12%',
          customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: this.$t('common.alarmCount'),
          dataIndex: 'alarmCount',
          key: 'alarmCount',
          width: '10%',
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
          width: '10%',
        },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '100px',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
     // 计算默认值：前一个月 00:00:00 到现在

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
    this.searchForm.alarmLevelList = []
    if(this.$route.query?.alarmLevel  && this.$route.query?.alarmLevel !== ''){
      this.searchForm.alarmLevelList.push(this.severityObj[this.$route.query?.alarmLevel])
    }
    if(this.$route.query?.alarmStatus  && this.$route.query?.alarmStatus !== ''){
      this.searchForm.alarmStatus = this.$route.query?.alarmStatus === '已恢复'? 1 : 0
    }
    this.searchForm.timeRange=this.defaultDateRange()
    this.fetchData();
    this.getModelList()
  },
  methods: {
      filterOption(input, option) {
        console.log('111111',option);
       return option.label?.toLowerCase().includes(input.toLowerCase());
    },
     defaultDateRange() {
      const end = moment(); // 当前时间
      const start = moment().subtract(1, 'months').startOf('day'); // 前一个月的第一天 00:00:00

      return [start, end];
    },
    recover(id){
      recoverApi({id:id}).then((res) =>{
        if(res.data){
           this.$Message.success(this.$t('common.recoverSuccess'));
           this.fetchData()
        } else{
           this.$Message.error(this.$t('common.recoverFailed'));
        }
      })
    },
    onClose(){
      this.nameVisible = false
    },
    selectShow(row){
      this.nameVisible = true
      this.selectName = row.name
      this.selectRow = row
    },
    selectAssert(row){
        if (!row.dialingTarget) {
          this.nameVisible1 = true;
          this.selectName1 = row.assetName;
          this.selectRow1 = {
            id: row.assetId,
            modelId: row.assetModelId,
            modelCode: row.assetModelCode,
            monitorMethod: row.monitorMethod,
          };
        this.assertInfo1 = {
            modelId: row.assetModelId,
            assetTypeId: row.assetId,
            modelCode: row.assetModelCode,
          }
        }

    },
    onClose1() {
      this.nameVisible1 = false;

      setTimeout(() => {
        this.isDestory = false;
      }, 500);
      setTimeout(() => {
        this.isDestory = true;
      }, 800);
    },
    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize:this.pageSize,
        pageNo: this.currentPage,
        // assetId: this.selectId,
        alarmTitle: this.searchForm.alarmTitle || undefined,
         startTime: this.searchForm.timeRange[0]
          ? moment(this.searchForm.timeRange[0]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        endTime: this.searchForm.timeRange[1]
          ? moment(this.searchForm.timeRange[1]).format("YYYY-MM-DD HH:mm:ss")
          : undefined,
        alarmStatus: this.searchForm.alarmStatus ,
        assetModelCodeList: this.searchForm.assetModelCodeList || undefined,
        assetName: this.searchForm.assetName || undefined,
        alarmLevelList: this.searchForm.alarmLevelList || undefined
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
        timeRange: this.defaultDateRange(),
        alarmStatus: 0,
        disposalStatus: '',
        alarmLevelList: [],
        assetModelCodeList: []
      };
      this.handleSearch();
    },
    changeShowAll() {
      this.showAll = !this.showAll;
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
        this.$message.warning(this.$t('alarm.pleaseSelectAlarmRecords'));
        return;
      }

      if (action === 'batchClose') {
        this.selectedRows.forEach((row) => {
          row.disposalStatus = '已关闭';
        });
        this.$message.success(this.$t('alarm.batchCloseSuccess'));
        this.clearSelection();
      } else if (action === 'batchDelete') {
        this.$confirm({
          title: '确认删除',
          content: `确定要删除选中的 ${this.selectedRows.length} 条告警记录吗？`,
          onOk: () => {
            const idsToDelete = this.selectedRows.map(row => row.id);
            this.tableData = this.tableData.filter(item => !idsToDelete.includes(item.id));
            this.total = this.tableData.length;
            this.$message.success(this.$t('alarm.batchDeleteSuccess'));
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
    getModelList(){
      getAssetModelPage({pageNo:1,pageSize:100}).then((res) => {
              this.modelList = res.data.list.map(item =>{
                return {
                  label: item.modelName,
                  value: item.modelCode
                }
              }) || [];

            });
      },
  }
}
</script>

<style scoped lang="less">

::v-deep .ant-table-tbody > tr > td {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 显示省略号 */
  max-width: 200px; /* 可选：限制单元格最大宽度（根据需求调整） */
}
.alarm-history {
  padding: 20px;
  background: #fff;
  height: 89vh;
  min-width: 1280px;
  overflow-x: auto;
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
.pagination{
  text-align: right;
}
</style>
