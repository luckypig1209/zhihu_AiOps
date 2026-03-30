<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form style="font-size: 16px !important;">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="5">
            <a-form-item>
              <a-input v-model="searchForm.ruleName" :placeholder="$t('common.pleaseEnterRuleName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <!-- <el-select
                    v-model="searchForm.modelId"
                    placeholder="请选择资源模型"
                    @change="handleResourceModelChange"
                    style="width: 100%;"
                    clearable
                    filterable
                  >
                    <el-option
                      v-for="item in resourceModelOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select> -->
              <a-select v-model="searchForm.modelId" :options="resourceModelOptions" :placeholder="$t('common.pleaseSelectResourceModel')"
                @change="handleResourceModelChange" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>
          <!-- 告警级别（多选） -->
          <a-col :span="5">
            <a-form-item>
              <!-- <el-select
                  v-model="searchForm.deviceType"
                  placeholder="请选择设备类型"
                  :disabled="!searchForm.modelId"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="item in deviceTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select> -->
              <a-select v-model="searchForm.deviceType" :options="deviceTypeOptions" :placeholder="$t('common.pleaseSelectDeviceType')"
                :disabled="!searchForm.modelId" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <a-col :span="5">
            <a-form-item>
              <a-select v-model="searchForm.pushEnabled" :options="severityOptions" :placeholder="$t('common.pleaseSelectStatus')" allowClear
                style="width: 100%;" />
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
          <a-col :span="4" style="display: flex; align-items: center;padding-top: 3px;">
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
      <!-- <template slot="name" slot-scope="text,record">
          <span style="color: #1890ff; cursor: pointer;" @click="selectShow(record)">  {{ text }}</span>
        </template> -->
      <!-- 告警级别列：Scoped Slot -->


      <!-- 状态列：Scoped Slot -->
      <template slot="pushEnabled" slot-scope="text, record">
        <a-switch :checked="text" @change="onStatusChange(record, $event)" />
      </template>

      <!-- 处置状态列：Scoped Slot -->
      <template slot="pushMetricItems" slot-scope="text, record">

        <span style="color: #1890ff; cursor: pointer" @click="selectShow(record)">
          {{ JSON.parse(text)?.length || '0' }}</span>
      </template>

      <!-- 操作列：Scoped Slot -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="handleEdit(record)">{{ $t('common.edit') }}</a>
          <a @click="handleDelete(record.id)">{{ $t('common.delete') }}</a>
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
      :show-total="total => $t('common.totalRecords', { total: total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('common.itemsPerPage') }}</span>

      </template>
    </a-pagination>

    <!-- 编辑模态框 -->

    <edit-modal ref="editModal" :rowData="rowData" @refreshList="fetchData"></edit-modal>
    <!-- 编辑模态框 -->
    <!-- <edit-modal-new ref="editModalNew" :resourceType="selectResourceType" :deviceType="selectDeviceType"
      @refreshList="fetchData"></edit-modal-new> -->
    <!-- 推送指标项显示 -->
    <zb-modal-show ref="zbModalShow" :recordId="recordId" :resourceType="selectResourceType"
      :deviceType="selectDeviceType" @refreshList="fetchData"></zb-modal-show>
  </div>
</template>

<script>
import moment from 'moment'
import editModalNew from "./components/editModal-new.vue";
import zbModalShow from "./components/zbModalShow.vue";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import { messageList, deleteMessage } from "@/api/monitor/task";
import refreshTime from '@/components/refresh/index.vue'
import editModal from './components/editModal.vue'
import { getPfmepushList, deletePfmepush, getAssetModelPage, getAssetModelDetail, stopPfmepush } from '@/api/resource';
import { loadAssetTree } from "@/utils/assetData";
export default {
  name: 'AlarmHistory',
  components: { editModal, refreshTime, editModalNew, zbModalShow },
  props: {
    selectId: {
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      selectName: '',
      nameVisible: false,
      selectRow: {},
      resourceModelOptions: [
        { label: '服务器', value: 'server' },
        { label: '网络设备', value: 'network' },
        { label: '存储设备', value: 'storage' }
      ],
      selectResourceType: '',
      selectDeviceType: '',
      deviceTypeOptions: [], // 随资源模型动态更新
      // 查询表单参数
      searchForm: {
        ruleName: '',
        modelId: undefined,
        deviceType: undefined,
        pushEnabled: undefined
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
      rowData: {},
      recordId: '',
      nodeInfo: [] // 资源树数据
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
          // scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('common.resourceModel'),
          dataIndex: 'modelName',
          key: 'modelName',
          width: '15%',
        },
        {
          title: this.$t('common.deviceType'),
          dataIndex: 'deviceType',
          key: 'deviceType',
          width: '15%',
        },
        {
          title: this.$t('common.pushMetricItems'),
          dataIndex: 'pushMetricItems',
          key: 'pushMetricItems',
          scopedSlots: { customRender: 'pushMetricItems' },
          width: '10%',
        },
        {
          title: this.$t('common.status'),
          dataIndex: 'pushEnabled',
          key: 'pushEnabled',
          scopedSlots: { customRender: 'pushEnabled' },
          width: '10%',
        },
        {
          title: this.$t('common.createTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: '10%',
        },
        // {
        //   title: '创建时间',
        //   dataIndex: 'createTime',
        //   key: 'createTime',
        //   width: '15%',
        //   customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        // },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '15%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    // 下拉选项
    severityOptions() {
      return [
        { value: false, label: this.$t('common.off') },
        { value: true, label: this.$t('common.on') }
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
    this.getModelList();
    this.loadNodeInfo();
    this.$message.success(this.$t('common.performancePushModuleDescription'))
  },
  methods: {
    handleChannelString(text) {
      let arrayVal = text.map(item => {
        return this.messageObj[item] || ''
      }
      )?.join(',')

      return arrayVal
    },
    handleAdd() {
      this.rowData = {};
      // 设置flagShow为false
      this.$refs.editModal.flagShow = false;
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
    selectShow(record) {
      console.log(record, 'record1');
      this.recordId = record.id
      this.$refs.zbModalShow.showModal = true;
      // this.resourceModelOptions.forEach(item => {
      //   if (item.value == record.modelId) {
      //     this.selectResourceType = item.modelCode
      //     getAssetModelDetails(record.id).then((res) => {
      //       let typeValue = ''
      //       if (res.data?.items && res.data.items.length) {
      //         let itemList = res.data.items.map(item => {
      //           return {
      //             itemName: item.itemName,
      //             itemCode: item.itemCode,
      //             itemId: item.id,
      //             itemValue: ''
      //           }
      //         });
      //         itemList.forEach(iItem => {
      //           if (iItem.itemName === '类型') {
      //             typeValue = iItem.itemCode
      //           }

      //         });
      //         let deviceTypeOptions = getDictDatas(typeValue).map(item => {
      //           return {
      //             label: item.label,
      //             value: item.label,
      //             id: item.value
      //           }
      //         })
      //         deviceTypeOptions.forEach(ditem => {

      //           if (ditem.value == record.deviceType) {

      //             this.selectDeviceType = ditem.id
      //             this.$refs.zbModalShow.showModal = true;
      //           }
      //         })
      //       }
      //     });
      //   }
      // })


    },
    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize: this.pageSize,
        pageNo: this.currentPage,
        ruleName: this.searchForm.ruleName || undefined,
        modelId: this.searchForm.modelId || undefined,
        deviceType: this.searchForm.deviceType || undefined,
        pushEnabled: this.searchForm.pushEnabled,
      }
      getPfmepushList(params).then((res) => {
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
        ruleName: '',
        deviceType: undefined,
        modelId: undefined,
        pushEnabled: undefined,
      };
      this.handleSearch();
    },
    // 编辑
    handleEdit(row) {
      this.rowData = JSON.parse(JSON.stringify(row));
      // 设置flagShow为false
      this.$refs.editModal.flagShow = false;
      this.$refs.editModal.showModal = true;
    },
    getModelList() {
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.resourceModelOptions = res.data.list.map(item => {
          return {
            label: item.modelName,
            value: item.id,
            modelCode: item.modelCode
          }
        }) || [];

      });
    },
    // 资源模型变更时，更新设备类型选项
    handleResourceModelChange(value) {
      if (value === '' || value === undefined) {
        return
      }
      this.searchForm.deviceType = undefined;
      this.deviceTypeOptions = [];
      
      // 从资源模型选项中获取当前选中的资源模型代码
      const currentModel = this.resourceModelOptions.find(item => item.value === value);
      if (currentModel && currentModel.modelCode) {
        // 从资源树数据中查找对应资源类型的设备类型选项
        const resourceTypeNode = this.nodeInfo.find(node => node.resourceType === currentModel.modelCode);
        if (resourceTypeNode && resourceTypeNode.device) {
          this.deviceTypeOptions = resourceTypeNode.device.map(child => ({
            label: child.deviceTypeName,
            value: child.deviceTypeName
          }));
          console.log('设备类型选项更新成功:', this.deviceTypeOptions);
          return;
        }
      }
      
      // 备用方案：调用接口获取设备类型
      this.resourceScopeOptions = [];
      getAssetModelDetail({ id: value }).then((res) => {
        let typeValue = ''
        if (res.data?.items && res.data.items.length) {
          let itemList = res.data.items.map(item => {
            return {
              itemName: item.itemName,
              itemCode: item.itemCode,
              itemId: item.id,
              itemValue: ''
            }
          });
          itemList.forEach(iItem => {
            if (iItem.itemName === '类型') {
              typeValue = iItem.itemCode
            }

          });
          this.deviceTypeOptions = getDictDatas(typeValue).map(item => {
            return {
              label: item.label,
              value: item.label,
              id: item.value
            }
          })
        }
      });

    },
    
    // 加载资源树数据
    async loadNodeInfo() {
      try {
        const res = await loadAssetTree();
        this.nodeInfo = res || [];
        console.log('资源树数据加载成功:', this.nodeInfo);
      } catch (error) {
        console.error('资源树数据加载失败:', error);
      }
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
      this.$message.success('告警信息更新成功');
    },
    // 取消编辑
    handleCancel() {
      this.visible = false;
    },
    // 删除
    handleDelete(id) {
      this.$confirm(this.$t('common.confirmDeletePerformancePushRule'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function () {
        return deletePfmepush(id);
      })
        .then(() => {
          this.$message.success(this.$t('common.performancePushRuleDeletedSuccessfully'));
          this.fetchData()

        })
        .catch(() => {
          // this.$message.error('消息通知规则删除失败');
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

    // 导出
    handleExport() {
      this.$message.info('导出功能开发中');
    },
    // 设置
    handleSetting() {
      this.$message.info('设置功能开发中');
    },
    // 刷新数据
    refreshData() {
      this.fetchData();
      this.$message.success('数据已刷新');
    },
    // 清空选择
    clearSelection() {
      this.selectedRowKeys = [];
      this.selectedRows = [];
    },

    // 状态切换处理
    onStatusChange(record, checked) {
      // 模拟API调用
      this.loading = true;
      stopPfmepush(record.id).then((res) => {
        console.log(res);
        this.loading = false;
        this.fetchData();

      })
    }
  }
}
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
