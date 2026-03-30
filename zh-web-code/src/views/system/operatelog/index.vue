<template>
  <div class="app-container">
    <!-- <doc-alert title="系统日志" url="https://doc.iocoder.cn/system-log/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="18px">
      <el-form-item  prop="module">
        <el-input v-model="queryParams.module" :placeholder="$t('common.operateLog.search.placeholder.module')" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="userNickname">
        <el-input v-model="queryParams.userNickname" :placeholder="$t('common.operateLog.search.placeholder.userNickname')" clearable style="width: 240px;"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="type">
        <el-select v-model="queryParams.type" :placeholder="$t('common.operateLog.search.placeholder.type')" clearable style="width: 240px">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.SYSTEM_OPERATE_TYPE)" :key="parseInt(dict.value)"
                     :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item  prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('common.operateLog.search.placeholder.status')" clearable style="width: 240px">
          <el-option :key="true" :label="$t('common.operateLog.table.success')" :value="true"/>
          <el-option :key="false" :label="$t('common.operateLog.table.fail')" :value="false"/>
        </el-select>
      </el-form-item>
      <el-form-item  prop="startTime">
        <el-date-picker v-model="queryParams.startTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('common.operateLog.search.placeholder.startDate')" :end-placeholder="$t('common.operateLog.search.placeholder.endDate')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.operateLog.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.operateLog.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:operate-log:export']">{{ $t('common.operateLog.button.export') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('common.operateLog.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('common.operateLog.table.module')" align="center" prop="module" />
      <el-table-column :label="$t('common.operateLog.table.name')" align="center" prop="name" width="180" />
      <el-table-column :label="$t('common.operateLog.table.type')" align="center" prop="type">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_OPERATE_TYPE" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operateLog.table.userNickname')" align="center" prop="userNickname" />
      <el-table-column :label="$t('common.operateLog.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <span>{{ scope.row.resultCode === 0 ? $t('common.operateLog.table.success') : $t('common.operateLog.table.fail') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operateLog.table.startTime')" align="center" prop="startTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operateLog.table.duration')" align="center" prop="startTime">
        <template v-slot="scope">
          <span>{{ scope.row.duration }}  {{ $t('common.operateLog.table.ms') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operateLog.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row,scope.index)"
                     v-hasPermi="['system:operate-log:query']">{{ $t('common.operateLog.button.detail') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

<!--    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"-->
<!--                @pagination="getList" />-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => $t('common.operateLog.pagination.total', { total: total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 操作日志详细 -->
    <el-dialog :title="$t('common.operateLog.dialog.title')" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.id')">{{ form.id }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.traceId')">{{ form.traceId }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.userInfo')">{{ form.userId }} | {{ form.userNickname }} | {{ form.userIp }} | {{ form.userAgent}} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.operateInfo')">
              {{ form.module }} | {{ form.name }}
              <dict-tag :type="DICT_TYPE.SYSTEM_OPERATE_TYPE" :value="form.type"/>
              <br /> {{ form.content }}
              <br /> {{ form.exts }}
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.requestInfo')">{{ form.requestMethod }} | {{ form.requestUrl }} </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.javaMethod')">{{ form.javaMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.javaMethodArgs')">{{ form.javaMethodArgs }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('common.operateLog.dialog.form.startTime')">
              {{ parseTime(form.startTime) }} | {{ form.duration }} ms
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('common.operateLog.dialog.form.result')">
              <div v-if="form.resultCode === 0">{{ $t('common.operateLog.dialog.form.normal') }} | {{ form.resultData}} </div>
              <div v-else-if="form.resultCode > 0">{{ $t('common.operateLog.dialog.form.fail') }} | {{ form.resultCode }} || {{ form.resultMsg}}</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">{{ $t('common.operateLog.button.close') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOperateLog, exportOperateLog } from "@/api/system/operatelog";

export default {
  name: "SystemOperateLog",
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
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        module: undefined,
        userNickname: undefined,
        businessType: undefined,
        status: undefined,
        startTime: []
      },
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
    /** 查询登录日志 */
    getList() {
      this.loading = true;
      listOperateLog(this.queryParams).then( response => {
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
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm(this.$t('common.operateLog.message.confirm.export'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          // 操作查询参数
          let params = {...this.queryParams};
          params.pageNo = undefined;
          params.pageSize = undefined;
          this.exportLoading = true;
          return exportOperateLog(params);
        }).then(response => {
          this.$download.excel(response, this.$t('common.operateLog.message.export.fileName'));
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

