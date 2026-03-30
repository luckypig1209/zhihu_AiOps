<template>
  <div class="app-container">
    <!-- <doc-alert title="配置中心" url="https://doc.iocoder.cn/config-center/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" style="display: flex; align-items: center; width: 100%;">
      <el-form-item prop="name" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.name" :placeholder="$t('systemConfig.search.placeholder.name')" clearable style="width: 100%"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="key" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.key" :placeholder="$t('systemConfig.search.placeholder.key')" clearable style="width: 100%"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="type" style="flex: 1; margin-right: 10px;">
        <el-select v-model="queryParams.type" :placeholder="$t('systemConfig.search.placeholder.type')" clearable style="width: 100%">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_CONFIG_TYPE)" :key="parseInt(dict.value)"
                     :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime" style="flex: 1.5; margin-right: 10px;">
        <el-date-picker v-model="queryParams.createTime" style="width: 100%" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('systemConfig.search.placeholder.startDate')" :end-placeholder="$t('systemConfig.search.placeholder.endDate')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemConfig.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemConfig.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:config:create']">{{ $t('systemConfig.button.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:config:export']">{{ $t('systemConfig.button.export') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList">
      <el-table-column :label="$t('systemConfig.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('systemConfig.table.category')" align="center" prop="category" />
      <el-table-column :label="$t('systemConfig.table.name')" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemConfig.table.key')" align="center" prop="key" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemConfig.table.value')" align="center" prop="value" />
      <el-table-column :label="$t('systemConfig.table.type')" align="center" prop="type">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_CONFIG_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemConfig.table.visible')" align="center" prop="visible">
        <template v-slot="scope">
          <span>{{ scope.row.visible ? $t('systemConfig.message.yes') : $t('systemConfig.message.no') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemConfig.table.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemConfig.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemConfig.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:config:update']">{{ $t('systemConfig.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     :disabled="scope.row.type===1"
                     v-hasPermi="['system:config:delete']">{{ $t('systemConfig.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

<!--    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList"/>-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => $t('systemConfig.pagination.total', { total: total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 添加或修改{{ $t('systemConfig.config') }}对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('systemConfig.dialog.category')" prop="category">
          <el-input v-model="form.category" :placeholder="$t('systemConfig.dialog.placeholder.category')" :disabled="form.type === 1" />
        </el-form-item>
        <el-form-item :label="$t('systemConfig.dialog.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('systemConfig.dialog.placeholder.name')" :disabled="form.type === 1" />
        </el-form-item>
        <el-form-item :label="$t('systemConfig.dialog.key')" prop="key">
          <el-input v-model="form.key" :placeholder="$t('systemConfig.dialog.placeholder.key')" :disabled="form.type === 1" />
        </el-form-item>
        <el-form-item :label="$t('systemConfig.dialog.value')" prop="value">
          <el-input v-model="form.value" :placeholder="$t('systemConfig.dialog.placeholder.value')" />
        </el-form-item>
        <el-form-item :label="$t('systemConfig.dialog.visible')" prop="type">
          <el-radio-group v-model="form.visible">
            <el-radio :key="true" :label="true">{{ $t('systemConfig.message.yes') }}</el-radio>
            <el-radio :key="false" :label="false">{{ $t('systemConfig.message.no') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('systemConfig.dialog.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :placeholder="$t('systemConfig.dialog.placeholder.remark')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('systemConfig.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemConfig.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, exportConfig } from "@/api/infra/config";

export default {
  name: "InfraConfig",
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
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        key: undefined,
        type: undefined,
        createTime: []
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        category: [
          { required: true, message: this.$t('systemConfig.message.categoryRequired'), trigger: "blur" }
        ],
        name: [
          { required: true, message: this.$t('systemConfig.message.nameRequired'), trigger: "blur" }
        ],
        key: [
          { required: true, message: this.$t('systemConfig.message.keyRequired'), trigger: "blur" }
        ],
        value: [
          { required: true, message: this.$t('systemConfig.message.valueRequired'), trigger: "blur" }
        ]
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
    /** 查询参数列表 */
    getList() {
      this.loading = true;
      listConfig(this.queryParams).then(response => {
          this.configList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        name: undefined,
        key: undefined,
        value: undefined,
        remark: undefined
      };
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = this.$t('systemConfig.dialog.addTitle');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('systemConfig.dialog.editTitle');
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateConfig(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemConfig.message.updateSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemConfig.message.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(this.$t('systemConfig.message.deleteConfirm', { id: ids }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return delConfig(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemConfig.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm(this.$t('systemConfig.message.exportConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          // 操作查询参数
          let params = {...this.queryParams};
          params.pageNo = undefined;
          params.pageSize = undefined;
          this.exportLoading = true;
          return exportConfig(params);
        }).then(response => {
          this.$download.excel(response, `${this.$t('systemConfig.config')}.xls`);
          this.exportLoading = false;
      }).catch(() => {});
    },
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
