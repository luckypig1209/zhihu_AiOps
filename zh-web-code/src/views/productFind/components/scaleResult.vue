<template>
  <div class="task-manage">
    <!-- 条件查询区域 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
<!--        <a-row :gutter="16" v-if="searchForm.taskId !== ''">-->
<!--          &lt;!&ndash; 任务id &ndash;&gt;-->
<!--          &lt;!&ndash; <a-col :span="6">-->
<!--            <a-form-item label="任务ID">-->
<!--              <a-input v-model="searchForm.taskId" style="border: none !important; box-shadow: none !important;" />-->
<!--            </a-form-item>-->
<!--          </a-col> &ndash;&gt;-->

<!--          <a-col :span="6">-->
<!--          </a-col>-->

<!--          <a-col :span="8">-->
<!--          </a-col>-->
<!--        </a-row>-->

        <a-row :gutter="16">
          <!-- 任务名称 -->
          <a-col :span="6">
            <a-form-item>
              <a-input v-model="searchForm.taskName" :placeholder="$t('productFind.pleaseEnterTaskName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <!-- 扫描结果 -->
          <a-col :span="6">
            <a-form-item>
              <a-select v-model="searchForm.scanResult" :options="resultOptions" :placeholder="$t('productFind.pleaseSelectScanResult')" allowClear
                style="width: 100%;" showArrow :not-found-content="$t('common.noData')" />
            </a-form-item>
          </a-col>

          <!-- 操作按钮 -->
          <a-col :span="8" style="display: flex; align-items: center;padding-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('productFind.query') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('productFind.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 任务列表 -->
    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle" class="table-auto-scroll"
      :locale="{
        emptyText: $t('common.noData')
      }"
      >
      <!-- 扫描对象：悬停提示所有IP -->
      <template slot="scanObj" slot-scope="text">
        <el-tooltip :content="text" placement="top" effect="dark">
          <span>{{ text }}</span>
        </el-tooltip>
      </template>

      <!-- 扫描结果：展示状态 -->
      <template slot="scanResult" slot-scope="text">
        <span :class="`status-tag status-${text}`">{{ text }}</span>
      </template>

      <!-- 发现资产数：点击查看资产情况 -->
      <template slot="assetCount" slot-scope="text, record">
        <a style="color: #1890ff; cursor: pointer;" @click="handleViewAsset(record)">
          {{ text }}
        </a>
      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => `${$t('productFind.total')} ${total} ${$t('productFind.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
    </a-pagination>

    <!-- 详情/编辑弹框（复用） -->
    <TaskForm ref="taskForm" @refreshList="fetchMockData" />
    <detailModal ref="detailModal"></detailModal>
  </div>
</template>

<script>
import moment from 'moment'
import TaskForm from './editModal.vue';
import detailModal from './detailModal.vue';
import {
  getRecordList,// 结果列表
} from '@/api/productFind'
export default {
  name: 'TaskManage',
  components: {
    TaskForm,
    detailModal
  },
  data() {
    return {
      // 模态框相关
      modalVisible: false,
      modalData: {},
      modalType: 'view', // view-查看，edit-编辑

      // 查询表单
      searchForm: {
        taskId: '',
        taskName: '',
        scanResult: undefined
      },

      // 扫描结果下拉选项（补充所有状态）
      resultOptions: [
        { label: this.$t('productFind.pendingExecution'), value: this.$t('productFind.pendingExecution') },
        { label: this.$t('productFind.scanning'), value: this.$t('productFind.scanning') },
        { label: this.$t('productFind.success'), value: this.$t('productFind.success') },
        { label: this.$t('productFind.failed'), value: this.$t('productFind.failed') },
        { label: this.$t('productFind.timeout'), value: this.$t('productFind.timeout') }
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
          width: '12%',
          scopedSlots: { customRender: 'taskName' }
        },
        {
          title: this.$t('productFind.scanObject'),
          dataIndex: 'scanObj',
          key: 'scanObj',
          width: '18%',
          scopedSlots: { customRender: 'scanObj' }
        },
        {
          title: this.$t('productFind.scanStartTime'),
          dataIndex: 'scanStartTime',
          key: 'scanStartTime',
          width: '12%',
          customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
          title: this.$t('productFind.scanEndTime'),
          dataIndex: 'scanEndTime',
          key: 'scanEndTime',
          width: '12%',
          customRender: (text) => text && text !== '-' ? moment(text).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
          title: this.$t('productFind.scanDuration'),
          dataIndex: 'scanDuration',
          key: 'scanDuration',
          width: '10%',
          customRender: (text) => text || '-'
        },
        {
          title: this.$t('productFind.scanResult'),
          dataIndex: 'scanResult',
          key: 'scanResult',
          width: '10%',
          scopedSlots: { customRender: 'scanResult' }
        },
        {
          title: this.$t('productFind.assetCount'),
          dataIndex: 'assetCount',
          key: 'assetCount',
          width: '10%',
          scopedSlots: { customRender: 'assetCount' }
        },
        {
          title: this.$t('productFind.failReason'),
          dataIndex: 'failReason',
          key: 'failReason',
          width: '10%',
          scopedSlots: { customRender: 'failReason' }
        },
      ]
    }
  },
  mounted() {
    if(this.$route.query && this.$route.query.taskId){
      // this.searchForm.taskName = this.$route.query.taskName
      this.searchForm.taskId = this.$route.query.taskId
    }
    this.fetchMockData();
  },
  methods: {
    // 页面显示结果 → 接口scanStatus映射
    mapResultToApi(showResult) {
      const resultMap = {
        [this.$t('productFind.pendingExecution')]: 'PENDING',
        [this.$t('productFind.scanning')]: 'RUNNING',
        [this.$t('productFind.success')]: 'COMPLETED',
        [this.$t('productFind.failed')]: 'FAILED',
        [this.$t('productFind.timeout')]: 'TIMEOUT'
      };
      return showResult ? resultMap[showResult] : '';
    },

    // 接口scanStatus → 页面显示结果映射
    mapStatusToResult(apiStatus) {
      const statusMap = {
        'PENDING': this.$t('productFind.pendingExecution'),
        'RUNNING': this.$t('productFind.scanning'),
        'COMPLETED': this.$t('productFind.success'),
        'FAILED': this.$t('productFind.failed'),
        'TIMEOUT': this.$t('productFind.timeout')
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
        taskId: this.searchForm.taskId || '', // 默认为空，支持后续扩展传入
        taskName: this.searchForm.taskName || '',
        scanStatus: this.mapResultToApi(this.searchForm.scanResult)
      };

      getRecordList(params)
        .then(res => {
          if (res.code === 0) {
            const { list, total } = res.data;
            // 接口返回数据映射为表格格式
            this.tableData = list.map(item => ({
              id: item.id,
              taskId: item.taskId,
              taskName: item.taskName || this.$t('productFind.unnamedTask'),
              scanObj: item.scanTarget || '-',
              scanStartTime: item.startTime,
              scanEndTime: item.endTime || '-',
              scanDuration: item.consumingTime || '-',
              scanResult: this.mapStatusToResult(item.scanStatus),
              assetCount: item.assetCount || 0,
              failReason: item.failReason
            }));
            this.total = total;
          } else {
            this.$message.error(`${this.$t('productFind.getResultListFailed')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
          }
        })
        .catch(err => {
          this.$message.error(this.$t('productFind.getResultListFailedPleaseRetry'));
          console.error('接口请求异常：', err);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 查看任务详情
    handleView(record) {
      this.$message.info(`${this.$t('productFind.viewTaskDetails')}【${record.taskName}】`);
      this.modalType = 'view';
      this.modalData = JSON.parse(JSON.stringify(record));
      this.modalVisible = true;
    },

    // 查看资产情况
    handleViewAsset(record) {
      this.handleDetail(record);
      // 实际场景可携带参数跳转：
      // this.$router.push({ path: '/asset-detail', query: { taskId: record.taskId, resultId: record.id } });
    },

    // 新增方法
    handleAdd() {
      this.$refs.taskForm.show();
    },

    // 打开详情弹窗
    handleDetail(record) {
      this.$refs.detailModal.open(record);
    },

    // 编辑方法
    handleEdit(record) {
      this.$refs.taskForm.rowData = record;
      this.$refs.taskForm.show();
    },

    // 重新扫描
    handleRescan(record) {
      this.$confirm(this.$t('productFind.confirmRescanTask'), this.$t('productFind.tip'), {
        confirmButtonText: this.$t('productFind.confirm'),
        cancelButtonText: this.$t('productFind.cancel'),
        type: 'warning'
      }).then(() => {
        // 若需联调重新扫描接口，可在此处添加请求逻辑
        const index = this.tableData.findIndex(item => item.id === record.id);
        if (index > -1) {
          this.tableData[index].scanStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
          this.tableData[index].scanEndTime = '-';
          this.tableData[index].scanDuration = this.$t('productFind.scanning');
          this.tableData[index].scanResult = this.$t('productFind.scanning');
        }
        this.$message.success(this.$t('productFind.rescanTaskExecuted'));
      }).catch(() => {});
    },

    // 删除任务
    handleDelete(record) {
      this.$confirm(this.$t('productFind.confirmDeleteScanTask'), this.$t('productFind.tip'), {
        confirmButtonText: this.$t('productFind.confirm'),
        cancelButtonText: this.$t('productFind.cancel'),
        type: 'warning'
      }).then(() => {
        // 若需联调删除接口，可在此处添加请求逻辑
        this.tableData = this.tableData.filter(item => item.id !== record.id);
        this.total = this.tableData.length;
        this.$message.success(this.$t('productFind.taskDeleteSuccess'));
      }).catch(() => {});
    },

    // 查询
    handleSearch() {
      this.currentPage = 1;
      this.fetchMockData();
    },

    // 重置
    handleReset() {
      this.searchForm = {
        taskName: '',
        scanResult: undefined
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
      this.currentPage = 1;
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

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-成功 {
  background: #52c41a;
  color: #fff;
}

.status-失败 {
  background: #ff4d4f;
  color: #fff;
}

.status-超时 {
  background: #722ed1;
  color: #fff;
}

.status-扫描中 {
  background: #36cfc9;
  color: #fff;
}

.status-待执行 {
  background: #faad14;
  color: #fff;
}

/* 操作区样式 */
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
::v-deep .ant-table-tbody>tr>td {
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 溢出隐藏 */
  text-overflow: ellipsis;
  /* 显示省略号 */
  max-width: 200px;
  /* 可选：限制单元格最大宽度（根据需求调整） */
}
</style>
