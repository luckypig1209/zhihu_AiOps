<template>
  <div class="alarm-history">

    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">

          <a-col :span="5">
            <a-form-item >
              <a-input v-model="searchForm.inspectionRecordName" :placeholder="$t('common.pleaseInputName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <!-- 巡检结果 -->
          <a-col :span="5">
            <a-form-item >
              <a-select v-model="searchForm.inspectionResult" :options="resultOptions" :placeholder="$t('common.pleaseSelectInspectionResult')" allowClear
                style="width: 100%;" />
            </a-form-item>
          </a-col>

          <!-- 修改为时间范围选择器 -->
          <a-col :span="7">
            <a-form-item >
              <a-range-picker v-model="searchForm.timeRange" format="YYYY-MM-DD HH:mm" :placeholder="[$t('common.startDate'), $t('common.endDate')]"
                style="width: 100%" @change="handleRangeTimeChange" />
            </a-form-item>
          </a-col>
          <!-- 操作按钮 -->
          <a-col :span="5" style="display: flex; align-items: center;margin-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('common.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
      <template slot="name" slot-scope="text,record">
        <a-tooltip placement="top" :title="text">
          <span style="color: #1890ff; cursor: pointer;" @click="viewDetail(record)"> {{ text }}</span>
        </a-tooltip>
      </template>

      <template slot="assetCount" slot-scope="text, record">
        <span>
          <span style="color: green;">{{ record.assetSuccessCount || 0 }}</span> /
          <span style="color: red;">{{ record.assetErrorCount || 0 }}</span>
        </span>
      </template>

      <template slot="indicatorCount" slot-scope="text, record">
        <span>
          <span style="color: green;">{{ record.indicatorSuccessCount || 0 }}</span> /
          <span style="color: red;">{{ record.indicatorErrorCount || 0 }}</span> /
          <span style="color: #999;">{{ record.indicatorUnknownCount || 0 }}</span>
        </span>
      </template>

      <template slot="inspectionResult" slot-scope="text">
        <a-tag :color="text ? 'green' : 'red'">
          {{ text ? $t('common.success') : $t('common.failure') }}
        </a-tag>
      </template>

      <!-- 操作列：新增「查看」按钮 -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="viewDetail(record)">{{ $t('common.view') }}</a>
          <a @click="handleDelete(record)">{{ $t('common.delete') }}</a>
        </div>
      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('common.itemsPerPage') }}</span>
      </template>
    </a-pagination>

    <!-- 新增：el-drawer 详情抽屉（样式优化） -->
    <el-drawer
      :title="$t('common.inspectionRecordDetails')"
      :visible.sync="drawerVisible"
      direction="rtl"
      size="500px"
      @close="handleDrawerClose"
      class="inspection-detail-drawer"
    >
      <!-- 优化后的详情容器 -->
      <div class="drawer-detail-container">
        <!-- 详情卡片样式，增加边框、阴影和内边距 -->
        <div class="detail-card">
          <!-- 详情分组：基础信息 -->
          <div class="detail-group">
            <h3 class="group-title">{{ $t('common.basicInfo') }}</h3>
            <div class="detail-list">
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.inspectionName') }}：</label>
                <span class="detail-value">{{ currentRecord?.name || '-' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.executionTime') }}：</label>
                <span class="detail-value">{{ currentRecord?.createTime ? currentRecord.createTime : '-' }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.inspectionResult') }}：</label>
                <el-tag :type="currentRecord?.inspectionResult ? 'success' : 'danger'" size="default" class="result-tag">
                  {{ currentRecord?.inspectionResult ? $t('common.success') : $t('common.failure') }}
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 详情分组：资源统计 -->
          <div class="detail-group">
            <h3 class="group-title">{{ $t('common.resourceQuantityStatistics') }}</h3>
            <div class="detail-list">
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.normalResourceCount') }}：</label>
                <span class="detail-value green-text">{{ currentRecord?.assetSuccessCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.abnormalResourceCount') }}：</label>
                <span class="detail-value red-text">{{ currentRecord?.assetErrorCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.totalResourceCount') }}：</label>
                <span class="detail-value">{{ (currentRecord?.assetSuccessCount || 0) + (currentRecord?.assetErrorCount || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- 详情分组：巡检项统计 -->
          <div class="detail-group">
            <h3 class="group-title">{{ $t('common.inspectionItemStatistics') }}</h3>
            <div class="detail-list">
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.normalInspectionItems') }}：</label>
                <span class="detail-value green-text">{{ currentRecord?.indicatorSuccessCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.abnormalInspectionItems') }}：</label>
                <span class="detail-value red-text">{{ currentRecord?.indicatorErrorCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.unknownInspectionItems') }}：</label>
                <span class="detail-value gray-text">{{ currentRecord?.indicatorUnknownCount || 0 }}</span>
              </div>
              <div class="detail-item">
                <label class="detail-label">{{ $t('common.totalInspectionItems') }}：</label>
                <span class="detail-value">{{ (currentRecord?.indicatorSuccessCount || 0) + (currentRecord?.indicatorErrorCount || 0) + (currentRecord?.indicatorUnknownCount || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import moment from 'moment'
import { getAlarmHistory, recoverApi } from "@/api/monitor/task";
import { getInspectionList, deleteInspection } from "@/api/inspectionRecord";
import { getAssetModelPage } from "@/api/resource";

export default {
  name: 'AlarmHistory',
  components: {},
  props: {
    selectId: {
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      modelList: [],
      assertList: [],
      // 查询表单参数（优化为时间范围）
      searchForm: {
        inspectionRecordName: '',      // 巡检记录名称
        inspectionResult: undefined,        // 巡检结果（boolean类型）
        timeRange: null,               // 时间范围选择器值（数组格式）
        startTime: null,               // 开始时间（传给接口）
        endTime: null                  // 结束时间（传给接口）
      },
      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      visible: false,
      currentEditRecord: null,
      // 新增：抽屉相关数据
      drawerVisible: false, // 抽屉显示状态
      currentRecord: null   // 当前选中的详情记录
    }
  },
  computed: {
    // 巡检结果选项
    resultOptions() {
      return [
        { value: true, label: this.$t('common.success') },
        { value: false, label: this.$t('common.failure') }
      ];
    },
    // 表格列配置（与接口返回字段对应）
    columns() {
      return [
        {
          title: this.$t('common.name'),
          dataIndex: 'name',
          key: 'name',
          width: '20%',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('common.normalExceptionResourceCount'),
          key: 'assetCount',
          width: '15%',
          scopedSlots: { customRender: 'assetCount' }
        },
        {
          title: this.$t('common.normalExceptionUnknownInspectionItems'),
          key: 'indicatorCount',
          width: '15%',
          scopedSlots: { customRender: 'indicatorCount' }
        },
        {
          title: this.$t('common.executionTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: '15%',
          customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '-'
        },
        {
          title: this.$t('common.inspectionResult'),
          dataIndex: 'inspectionResult',
          key: 'inspectionResult',
          width: '10%',
          scopedSlots: { customRender: 'inspectionResult' }
        },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '10%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    }
  },
  mounted() {
    this.fetchData();
    this.getModelList();
  },
  methods: {
    // 新增：查看详情（打开抽屉）
    handleView(record) {
      this.currentRecord = JSON.parse(JSON.stringify(record)); // 深拷贝记录，避免原数据被修改
      this.drawerVisible = true; // 显示抽屉
    },
    // 新增：关闭抽屉
    handleDrawerClose() {
      this.drawerVisible = false;
      this.currentRecord = null; // 清空当前记录
    },
    handleDelete(row) {
      const ids = row.id;
      this.$confirm(this.$t('common.areYouSureYouWantToDeleteThisData'), this.$t('common.tip'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {
          // 显示删除中状态
          this.loading = true
          return deleteInspection(ids);
        })
        .then(() => {
          // 关闭加载状态
          this.loading = false
          this.$modal.msgSuccess(this.$t('common.deleteSuccess'));
          this.fetchData();
        })
        .catch(() => {
          // 取消或错误时关闭加载状态
          this.loading = false
        });
    },
    // 处理时间范围选择变化
    handleRangeTimeChange(dateRange) {
      if (dateRange && dateRange.length === 2) {
        // 格式化开始时间和结束时间
        this.searchForm.startTime = dateRange[0].format('YYYY-MM-DD HH:mm') + ':00';
        this.searchForm.endTime = dateRange[1].format('YYYY-MM-DD HH:mm') + ':59';
      } else {
        // 清空时间范围
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
    },

    // 获取巡检记录列表（优化为时间范围传参）
    fetchData() {
      this.loading = true;
      // 构造接口要求的参数格式：使用startTime和endTime
      const params = {
        pageNo: this.currentPage,
        pageSize: this.pageSize,
        inspectionRecordName: this.searchForm.inspectionRecordName || undefined,
        inspectionResult: this.searchForm.inspectionResult !== null ? this.searchForm.inspectionResult : undefined,
        startTime: this.searchForm.startTime || undefined,   // 开始时间
        endTime: this.searchForm.endTime || undefined       // 结束时间
      };

      // 调用post接口
      getInspectionList(params)
        .then((res) => {
          if (res.code === 0 && res.data) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error(this.$t('common.failedToGetData') + (res.msg || this.$t('common.unknownError')));
          }
          this.loading = false;
        })
        .catch((err) => {
          console.error('接口请求失败', err);
          this.tableData = [];
          this.total = 0;
          this.loading = false;
          this.$message.error(this.$t('common.networkErrorPleaseTryAgain'));
        });
    },

    // 查询
    handleSearch() {
      this.currentPage = 1;
      this.fetchData();
    },

    // 重置（清空时间范围）
    handleReset() {
      this.searchForm = {
        inspectionRecordName: '',
        inspectionResult: undefined,
        timeRange: null,
        startTime: null,
        endTime: null
      };
      this.handleSearch();
    },

    // 查看记录详情（原有路由跳转，保持不变）
    viewDetail(record) {
      this.$router.push({
        path: "/faultManage/indicatorList/reportDetail",
        query: { id: record.id, name: record.name }
      });
    },

    // 查看关联策略
    viewStrategy(record) {
      this.$router.push({
        path: "/inspection/strategyDetail",
        query: { id: record.strategyId, name: record.strategyName }
      });
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

    // 获取模型列表
    getModelList() {
      getAssetModelPage({ pageNo: 1, pageSize: 100 })
        .then((res) => {
          this.modelList = res.data?.list?.map(item => ({
            label: item.modelName,
            value: item.modelCode
          })) || [];
        });
    }
  }
}
</script>

<style scoped lang="less">
::v-deep .ant-table-tbody>tr>td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.alarm-history {
  padding: 20px;
  background: #fff;
  height: 89vh;
  min-width: 1280px;
  overflow-x: auto;
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
  margin-top: 16px;
  text-align: right;
}

::v-deep .ant-form-item {
  margin-bottom: 16px;
}

::v-deep .ant-table-thead>tr>th {
  background: #e6f0fb !important;
  font-weight: 600;
}

::v-deep .ant-table-tbody>tr:hover>td {
  background: #f0f8ff !important;
}

// ******** 优化后的抽屉详情样式 ********
::v-deep .inspection-detail-drawer {
  .el-drawer__body {
    padding: 20px 16px;
    background-color: #fafbfc;
  }
  .el-drawer__header {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fff;
    .el-drawer__title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2329;
    }
  }
}

// 详情容器
.drawer-detail-container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

// 详情卡片
.detail-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  padding: 20px;
  box-sizing: border-box;
}

// 详情分组
.detail-group {
  margin-bottom: 24px;
  &:last-child {
    margin-bottom: 0;
  }
}

// 分组标题
.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

// 详情列表
.detail-list {
  width: 100%;
}

// 详情项（优化布局和间距）
.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  line-height: 26px;
  &:last-child {
    margin-bottom: 0;
  }
}

// 标签样式（加宽、加粗）
.detail-label {
  width: 110px;
  text-align: right;
  padding-right: 12px;
  color: #606266;
  font-weight: 500;
  font-size: 13px;
  flex-shrink: 0; // 防止标签被压缩
}

// 值样式（优化字体和换行）
.detail-value {
  flex: 1;
  color: #303133;
  font-size: 13px;
  word-break: break-all;
  line-height: 26px;
}

// 颜色文本样式
.green-text {
  color: #52c41a !important;
  font-weight: 500;
}

.red-text {
  color: #f5222d !important;
  font-weight: 500;
}

.gray-text {
  color: #8c8c8c !important;
  font-weight: 500;
}

// 结果标签样式
.result-tag {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}
</style>