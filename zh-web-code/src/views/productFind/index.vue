<template>
  <div class="task-manage">
    <!-- 条件查询区域 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item>
              <a-input v-model="searchForm.taskName" :placeholder="$t('productFind.pleaseEnterTaskName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <a-col :span="6">
            <a-form-item>
              <a-select v-model="searchForm.execResult" :options="resultOptions" :placeholder="$t('productFind.pleaseSelectExecutionResult')" allowClear
                style="width: 100%;" showArrow :not-found-content="$t('common.noData')" />
            </a-form-item>
          </a-col>

          <a-col :span="8" style="display: flex; align-items: center;padding-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('productFind.query') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('productFind.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="primary" ghost @click="handleAdd">
            <a-icon type="plus" />{{ $t('productFind.addTask') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle" class="table-auto-scroll"
      :locale="{
        emptyText: $t('common.noData')
      }"
      >
      <!-- 任务名称：点击查看详情 -->
      <template slot="taskName" slot-scope="text, record">
        <a style="color: #1890ff; cursor: pointer;" @click="handleView(record)">
          {{ text }}
        </a>
      </template>

      <!-- 扫描对象：悬停提示所有IP -->
      <template slot="scanObj" slot-scope="text">
        <el-tooltip :content="text" placement="top" effect="dark">
          <span>{{ text }}</span>
        </el-tooltip>
      </template>

      <!-- 执行结果：展示状态 -->
      <template slot="execResult" slot-scope="text">
        <span :class="`status-tag status-${text}`">{{ text }}</span>
      </template>

      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a :disabled="record.execResult === '扫描中'" @click="handleViewResult(record)">{{ $t('productFind.viewScanResult') }}</a>
          <a :disabled="record.execResult === '扫描中'" @click="handleEdit(record)">{{ $t('productFind.edit') }}</a>
          <a :disabled="record.execResult === '扫描中'" @click="handleRescan(record)">{{ $t('productFind.rescan') }}</a>
          <a :disabled="record.execResult === '扫描中'" @click="handleDelete(record)">{{ $t('productFind.delete') }}</a>
        </div>
      </template>
    </a-table>

    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => `${$t('productFind.total')} ${total} ${$t('productFind.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
    </a-pagination>

    <!-- 详情/编辑弹框（复用，通过type区分） -->
    <TaskForm :view-mode="modalType" ref="taskForm" @refreshList="fetchMockData" />
  </div>
</template>

<script>
import moment from 'moment'
import TaskForm from './components/editModal.vue';
import {
  getScanTaskList,// 资产发现 列表接口
  deleteScanTask, // 删除资产发现接口
  restartScanTask, // 重启资产发现任务
} from '@/api/productFind'
export default {
  name: 'TaskManage',
  components: {
    TaskForm,
  },
  data() {
    return {
      // 模态框相关
      modalVisible: false,
      modalData: {},
      modalType: false, // view-查看，edit-编辑

      // 查询表单
      searchForm: {
        taskName: '',
        execResult: undefined
      },

      // 执行结果下拉选项（补充扫描失败、扫描超时）
      resultOptions: [
        { label: this.$t('productFind.pendingExecution'), value: this.$t('productFind.pendingExecution') },
        { label: this.$t('productFind.scanning'), value: this.$t('productFind.scanning') },
        { label: this.$t('productFind.scanCompleted'), value: this.$t('productFind.scanCompleted') },
        { label: this.$t('productFind.scanFailed'), value: this.$t('productFind.scanFailed') },
        { label: this.$t('productFind.scanTimeout'), value: this.$t('productFind.scanTimeout') }
      ],

      // 表格数据（真实接口填充）
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('productFind.taskName'),
          dataIndex: 'taskName',
          key: 'taskName',
          width: '15%',
          scopedSlots: { customRender: 'taskName' }
        },
        {
          title: this.$t('productFind.scanObject'),
          dataIndex: 'scanObj',
          key: 'scanObj',
          width: '20%',
          scopedSlots: { customRender: 'scanObj' }
        },
        {
          title: this.$t('productFind.scheduledExecutionTime'),
          dataIndex: 'scheduleScanTime',
          key: 'scheduleScanTime',
          width: '15%',
          customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
          title: this.$t('productFind.latestExecutionTime'),
          dataIndex: 'latestExecTime',
          key: 'latestExecTime',
          width: '15%',
          customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
          title: this.$t('productFind.executionResult'),
          dataIndex: 'execResult',
          key: 'execResult',
          width: '10%',
          scopedSlots: { customRender: 'execResult' }
        },
        {
          title: this.$t('productFind.operation'),
          key: 'operation',
          width: '35%',
          scopedSlots: { customRender: 'operation' }
        }
      ];
    }
  },
  mounted() {
    this.fetchMockData();
  },
  methods: {
    // 状态映射：页面显示文本 → 接口请求状态值
    mapStatusToApi(showStatus) {
      const statusMap = {
        [this.$t('productFind.pendingExecution')]: 'PENDING',
        [this.$t('productFind.scanning')]: 'RUNNING',
        [this.$t('productFind.scanCompleted')]: 'COMPLETED',
        [this.$t('productFind.scanFailed')]: 'FAILED',
        [this.$t('productFind.scanTimeout')]: 'TIMEOUT'
      };
      return showStatus ? statusMap[showStatus] : '';
    },

    // 状态映射：接口返回状态值 → 页面显示文本
    mapStatusToShow(apiStatus) {
      const statusMap = {
        'PENDING': this.$t('productFind.pendingExecution'),
        'RUNNING': this.$t('productFind.scanning'),
        'COMPLETED': this.$t('productFind.scanCompleted'),
        'FAILED': this.$t('productFind.scanFailed'),
        'TIMEOUT': this.$t('productFind.scanTimeout')
      };
      return statusMap[apiStatus] || this.$t('productFind.unknownStatus');
    },

    // 获取真实接口数据（替换原mock方法）
    fetchMockData() {
      this.loading = true;
      // 构建接口请求参数
      const params = {
        pageNo: this.currentPage,
        pageSize: this.pageSize,
        taskName: this.searchForm.taskName || '',
        scanStatus: this.mapStatusToApi(this.searchForm.execResult)
      };

      getScanTaskList(params)
        .then(res => {
          if (res.code === 0) {
            const { list, total } = res.data;
            // 接口返回数据映射为表格所需格式
            this.tableData = list.map(item => ({
              ...item,
              id: item.id,
              taskName: item.taskName || this.$t('productFind.unnamedTask'), // 处理null场景
              scanObj: item.scanTarget || '-', // 扫描对象对应接口scanTarget字段
              latestExecTime: item.lastExecuteTime, // 最新执行时间对应lastExecuteTime
              execResult: this.mapStatusToShow(item.scanStatus) // 状态映射
            }));
            this.total = total; // 赋值总条数，支撑分页
          } else {
            this.$message.error(`${this.$t('productFind.getTaskListFailed')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
          }
        })
        .catch(err => {
          this.$message.error(this.$t('productFind.getTaskListFailedPleaseRetry'));
          console.error('接口请求异常：', err);
        })
        .finally(() => {
          this.loading = false; // 无论成功失败，关闭加载状态
        });
    },

    // 查看任务详情
    handleView(record) {
      this.modalType = true;
      this.$refs.taskForm.rowData = record;
      if (record.scheduleScanTime) {
        this.$refs.taskForm.scheduleScanTime = record.scheduleScanTime.slice(0, 16);
      }
      this.$refs.taskForm.show();
    },

    // 新增任务
    handleAdd() {
      this.$refs.taskForm.rowData = {}
      this.modalType = false;
      this.$refs.taskForm.show();
    },

    // 编辑任务
    handleEdit(record) {
      this.modalType = false;
      this.$refs.taskForm.rowData = record;
      if (record.scheduleScanTime) {
        this.$refs.taskForm.form.scheduleScanTime = record.scheduleScanTime.slice(0, 16);
      }
      this.$refs.taskForm.show();
    },

    // 查看扫描结果
    handleViewResult(record) {
      // this.$message.info(`跳转到扫描结果页面，筛选任务【${record.taskName}】的结果`);
      // 实际场景可启用路由跳转：
      this.$router.push({ path: '/product/productFind/scaleResult', query: { taskName: record.taskName, taskId:  record.id} });
    },

    // 重新扫描（联调restartScanTask接口）
    handleRescan(record) {
      this.$confirm(this.$t('productFind.confirmRescanTask'), this.$t('productFind.tip'), {
        confirmButtonText: this.$t('productFind.confirm'),
        cancelButtonText: this.$t('productFind.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading = true;
        // 接口传参：仅需任务id
        restartScanTask({ id: record.id })
          .then(res => {
            if (res.code === 0 && res.data) {
              this.$message.success(this.$t('productFind.rescanTaskExecuted'));
              // 实时更新表格状态
              const index = this.tableData.findIndex(item => item.id === record.id);
              if (index > -1) {
                this.tableData[index].latestExecTime = moment().format('YYYY-MM-DD HH:mm:ss');
                this.tableData[index].execResult = this.$t('productFind.scanning');
                setTimeout(() => {
                   this.fetchMockData();
                }, 5000);
              }
            } else {
              this.$message.error(`${this.$t('productFind.rescanFailed')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
            }
          })
          .catch(err => {
            this.$message.error(this.$t('productFind.rescanTaskFailedPleaseRetry'));
            console.error('接口请求异常：', err);
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {});
    },

    // 删除任务（联调deleteScanTask接口）
    handleDelete(record) {
      this.$confirm(this.$t('productFind.confirmDeleteScanTask'), this.$t('productFind.tip'), {
        confirmButtonText: this.$t('productFind.confirm'),
        cancelButtonText: this.$t('productFind.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading = true;
        // 接口传参：仅需任务id
        deleteScanTask({ id: record.id })
          .then(res => {
            if (res.code === 0 && res.data) {
              this.$message.success(this.$t('productFind.taskDeleteSuccess'));
              // 刷新列表数据
              this.fetchMockData();
            } else {
              this.$message.error(`${this.$t('productFind.deleteFailed')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
            }
          })
          .catch(err => {
            this.$message.error(this.$t('productFind.deleteTaskFailedPleaseRetry'));
            console.error('接口请求异常：', err);
          })
          .finally(() => {
            this.loading = false;
          });
      }).catch(() => {});
    },

    // 保存编辑（模态框）
    handleSave() {
      this.$message.success(this.$t('productFind.taskSaveSuccess'));
      this.modalVisible = false;
      this.fetchMockData(); // 刷新列表
    },

    // 关闭模态框
    handleModalCancel() {
      this.modalVisible = false;
      this.modalData = {};
    },

    // 查询（携带筛选条件）
    handleSearch() {
      this.currentPage = 1; // 重置为第一页
      this.fetchMockData();
    },

    // 重置查询条件
    handleReset() {
      this.searchForm = {
        taskName: '',
        execResult: undefined
      };
      this.handleSearch();
    },

    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchMockData();
    },

    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1; // 条数变化时重置为第一页
      this.fetchMockData();
    }
  }
}
</script>

<style scoped lang="less">
.table-auto-scroll {
  max-height: 490px;
  overflow-y: auto;
}

.task-manage {
  padding: 20px;
  background: #fff;
  min-height: 89vh;
}

/* 状态标签样式（补充扫描失败、扫描超时） */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-待执行 {
  background: #faad14;
  color: #fff;
}

.status-排队中 {
  background: #1890ff;
  color: #fff;
}

.status-扫描中 {
  background: #36cfc9;
  color: #fff;
}

.status-扫描完成 {
  background: #52c41a;
  color: #fff;
}

.status-扫描失败 {
  background: #ff4d4f;
  color: #fff;
}

.status-扫描超时 {
  background: #722ed1;
  color: #fff;
}

/* 详情弹框样式 */
.detail-content {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-label {
  width: 120px;
  color: #666;
  font-weight: 500;
  text-align: right;
  margin-right: 16px;
}

.detail-value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.operation-card {
  margin-bottom: 16px;
}

.table-row-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-row-actions a {
  color: #1890ff;
  transition: color 0.3s;
  &:hover {
    color: #40a9ff;
  }
  &[disabled] {
    color: #bfbfbf;
    cursor: not-allowed;
  }
}

.pagination {
  text-align: right;
  margin-top: 16px;
}

/* 表格样式优化 */
/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
  font-weight: 600;
}

/deep/ .ant-table-tbody>tr:hover>td {
  background: #e6f7ff !important;
}

/deep/ .ant-form-item {
  margin-bottom: 16px;
}
</style>
