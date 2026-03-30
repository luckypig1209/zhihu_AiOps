<template>
  <div class="app-container">
    <!-- <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="18px">
      <el-form-item  prop="userIp">
        <el-input v-model="queryParams.userIp" :placeholder="$t('common.loginLog.search.placeholder.userIp')" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="queryParams.username" :placeholder="$t('common.loginLog.search.placeholder.username')" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('common.loginLog.search.placeholder.status')" clearable style="width: 240px">
          <el-option :key="true" :label="$t('common.loginLog.table.success')" :value="true"/>
          <el-option :key="false" :label="$t('common.loginLog.table.fail')" :value="false"/>
        </el-select>
      </el-form-item>
      <el-form-item  prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('common.loginLog.search.placeholder.startDate')" :end-placeholder="$t('common.loginLog.search.placeholder.endDate')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.loginLog.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.loginLog.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:login-log:export']">{{ $t('common.loginLog.button.export') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('common.loginLog.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('common.loginLog.table.logType')" align="center" prop="logType" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_LOGIN_TYPE" :value="scope.row.logType" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.loginLog.table.username')" align="center" prop="username" />
      <el-table-column :label="$t('common.loginLog.table.userIp')" align="center" prop="userIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('common.loginLog.table.userAgent')" align="center" prop="userAgent" width="400" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('common.loginLog.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_LOGIN_RESULT" :value="scope.row.result" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.loginLog.table.loginTime')" align="center" prop="loginTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
    </el-table>

<!--    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"-->
<!--                @pagination="getList"/>-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => $t('common.loginLog.pagination.total', { total: total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />
  </div>
</template>

<script>
import { list, exportLoginLog } from "@/api/system/loginlog";

export default {
  name: "SystemLoginLog",
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
      // 表格数据
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userIp: undefined,
        username: undefined,
        status: undefined,
        createTime: []
      }
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
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      list(this.queryParams).then(response => {
          this.list = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
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
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm(this.$t('common.loginLog.message.confirm.export'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          // 操作查询参数
          let params = {...this.queryParams};
          params.pageNo = undefined;
          params.pageSize = undefined;
          this.exportLoading = true;
          return exportLoginLog(params);
        }).then(response => {
          this.$download.excel(response, this.$t('common.loginLog.message.export.fileName'));
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
