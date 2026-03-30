<template>
  <div class="app-container">
    <!-- <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="18px">
      <el-form-item  prop="userId">
        <el-input v-model="queryParams.userId" :placeholder="$t('common.apiAccessLog.placeholder.userId')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="userType">
        <el-select v-model="queryParams.userType" :placeholder="$t('common.apiAccessLog.placeholder.userType')" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.USER_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item  prop="applicationName">
        <el-input v-model="queryParams.applicationName" :placeholder="$t('common.apiAccessLog.placeholder.applicationName')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="requestUrl">
        <el-input v-model="queryParams.requestUrl" :placeholder="$t('common.apiAccessLog.placeholder.requestUrl')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="beginTime">
        <el-date-picker v-model="queryParams.beginTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('common.apiAccessLog.placeholder.startDate')" :end-placeholder="$t('common.apiAccessLog.placeholder.endDate')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item  prop="duration">
        <el-input v-model="queryParams.duration" :placeholder="$t('common.apiAccessLog.placeholder.duration')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="resultCode">
        <el-input v-model="queryParams.resultCode" :placeholder="$t('common.apiAccessLog.placeholder.resultCode')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="small" :loading="exportLoading" @click="handleExport"
                   v-hasPermi="['system:api-access-log:export']">{{ $t('common.export') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('common.apiAccessLog.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('common.apiAccessLog.table.userId')" align="center" prop="userId" />
      <el-table-column :label="$t('common.apiAccessLog.table.userType')" align="center" prop="userType">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType"/>
        </template>
      </el-table-column>>
      <el-table-column :label="$t('common.apiAccessLog.table.applicationName')" align="center" prop="applicationName" />
      <el-table-column :label="$t('common.apiAccessLog.table.requestMethod')" align="center" prop="requestMethod" />
      <el-table-column :label="$t('common.apiAccessLog.table.requestUrl')" align="center" prop="requestUrl" width="250" />
      <el-table-column :label="$t('common.apiAccessLog.table.beginTime')" align="center" prop="beginTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.beginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.apiAccessLog.table.duration')" align="center" prop="startTime">
        <template v-slot="scope">
          <span>{{ scope.row.duration }}  ms</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.apiAccessLog.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <span>{{ scope.row.resultCode === 0 ? $t('common.apiAccessLog.status.success') : $t('common.apiAccessLog.status.failed') + '(' + scope.row.resultMsg + ')' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row,scope.index)"
                     v-hasPermi="['system:api-access-log:query']">{{ $t('common.apiAccessLog.button.detail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
<!--    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"-->
<!--                @pagination="getList"/>-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => $t('common.totalRecords', { total: total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 查看明细 -->
    <el-dialog :title="$t('common.apiAccessLog.dialog.title')" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('common.apiAccessLog.dialog.id') + '：'">{{ form.id }}</el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.traceId') + '：'">{{ form.traceId }}</el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.applicationName') + '：'">{{ form.applicationName }}</el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.userInfo') + '：'">
              {{ form.userId }} <dict-tag :type="DICT_TYPE.USER_TYPE" :value="form.userType"/> | {{ form.userIp }} | {{ form.userAgent}}
            </el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.requestInfo') + '：'">{{ form.requestMethod }} | {{ form.requestUrl }} </el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.requestParams') + '：'">{{ form.requestParams }}</el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.beginTime') + '：'">
              {{ parseTime(form.beginTime) }} ~ {{ parseTime(form.endTime) }} | {{ form.duration }} ms
            </el-form-item>
            <el-form-item :label="$t('common.apiAccessLog.dialog.status') + '：'">
              <div v-if="form.resultCode === 0">{{ $t('common.apiAccessLog.status.success') }}</div>
              <div v-else-if="form.resultCode > 0">{{ $t('common.apiAccessLog.status.failed') }} | {{ form.resultCode }} || {{ form.resultMsg}}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">{{ $t('common.close') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getApiAccessLogPage, exportApiAccessLogExcel } from "@/api/infra/apiAccessLog";

export default {
  name: "InfraApiAccessLog",
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // API 访问日志列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: null,
        userType: null,
        applicationName: null,
        requestUrl: null,
        duration: null,
        resultCode: null,
        beginTime: []
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // 分页切换
    handlePageChange(page) {
      this.queryParams.pageNo = page;
      this.getList();
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.queryParams.pageSize = pageSize;
      this.currentPage = 1;
      this.getList();
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getApiAccessLogPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {};
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** 导出按钮操作 */
    handleExport() {
      // 操作查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      // 执行导出
      this.$confirm(this.$t('common.apiAccessLog.confirm.export'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        this.exportLoading = true;
        return exportApiAccessLogExcel(params);
      }).then(response => {
        this.$download.excel(response, this.$t('common.apiAccessLog.filename.export') + '.xls');
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.pagination {
  text-align: right;
  padding: 16px;
  background: #fff;
  margin-left: auto;
  width: 100%;
  /* border-radius: 8px; */
  margin-top: 16px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}
</style>
