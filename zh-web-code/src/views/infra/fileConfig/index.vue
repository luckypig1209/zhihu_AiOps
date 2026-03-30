<template>
  <div class="app-container">
    <!-- <doc-alert title="上传下载" url="https://doc.iocoder.cn/file/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" >
      <el-form-item prop="name" style="flex: 1; min-width: 200px;">
        <el-input v-model="queryParams.name" :placeholder="$t('fileConfig.search.placeholder.name')" clearable @keyup.enter.native="handleQuery" style="width: 100%;"/>
      </el-form-item>
      <el-form-item prop="storage" style="flex: 1; min-width: 200px;">
        <el-select v-model="queryParams.storage" :placeholder="$t('fileConfig.search.placeholder.storage')" clearable style="width: 100%;">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_FILE_STORAGE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime" style="flex: 1; min-width: 240px;">
        <el-date-picker v-model="queryParams.createTime" style="width: 100%;" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('fileConfig.search.placeholder.startDate')" :end-placeholder="$t('fileConfig.search.placeholder.endDate')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 0;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('fileConfig.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('fileConfig.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:file-config:create']">{{ $t('fileConfig.button.add') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('fileConfig.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('fileConfig.table.name')" align="center" prop="name" />
      <el-table-column :label="$t('fileConfig.table.storage')" align="center" prop="storage">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_FILE_STORAGE" :value="scope.row.storage" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('fileConfig.table.remark')" align="center" prop="remark" />
      <el-table-column :label="$t('fileConfig.table.master')" align="center" prop="primary">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.master" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('fileConfig.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('fileConfig.table.operation')" align="center" class-name="small-padding fixed-width" width="240">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:file-config:update']">{{ $t('fileConfig.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-attract" @click="handleMaster(scope.row)"
                     :disabled="scope.row.master" v-hasPermi="['system:file-config:update']">{{ $t('fileConfig.button.master') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-share" @click="handleTest(scope.row)">{{ $t('fileConfig.button.test') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:file-config:delete']">{{ $t('fileConfig.button.delete') }}</el-button>
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
      :show-total="total => $t('fileConfig.table.total', { total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="form.id ? $t('fileConfig.dialog.edit') : $t('fileConfig.dialog.add')" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item :label="$t('fileConfig.form.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('fileConfig.form.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="$t('fileConfig.form.remark')" prop="remark">
          <el-input v-model="form.remark" :placeholder="$t('fileConfig.form.placeholder.remark')" />
        </el-form-item>
        <el-form-item :label="$t('fileConfig.form.storage')" prop="storage">
          <el-select v-model="form.storage" :placeholder="$t('fileConfig.form.placeholder.storage')" :disabled="form.id !== undefined">
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_FILE_STORAGE)"
                       :key="dict.value" :label="dict.label" :value="parseInt(dict.value)" />
          </el-select>
        </el-form-item>
        <!-- DB -->
        <!-- Local / FTP / SFTP -->
        <el-form-item v-if="form.storage >= 10 && form.storage <= 12" :label="$t('fileConfig.form.basePath')" prop="config.basePath">
          <el-input v-model="form.config.basePath" :placeholder="$t('fileConfig.form.placeholder.basePath')" />
        </el-form-item>
        <el-form-item v-if="form.storage >= 11 && form.storage <= 12" :label="$t('fileConfig.form.host')" prop="config.host">
          <el-input v-model="form.config.host" :placeholder="$t('fileConfig.form.placeholder.host')" />
        </el-form-item>
        <el-form-item v-if="form.storage >= 11 && form.storage <= 12" :label="$t('fileConfig.form.port')" prop="config.port">
          <el-input-number :min="0" v-model="form.config.port" :placeholder="$t('fileConfig.form.placeholder.port')" />
        </el-form-item>
        <el-form-item v-if="form.storage >= 11 && form.storage <= 12" :label="$t('fileConfig.form.username')" prop="config.username">
          <el-input v-model="form.config.username" :placeholder="$t('fileConfig.form.placeholder.username')" />
        </el-form-item>
        <el-form-item v-if="form.storage >= 11 && form.storage <= 12" :label="$t('fileConfig.form.password')" prop="config.password">
          <el-input v-model="form.config.password" :placeholder="$t('fileConfig.form.placeholder.password')" />
        </el-form-item>
        <el-form-item v-if="form.storage === 11" :label="$t('fileConfig.form.mode')" prop="config.mode">
          <el-radio-group v-model="form.config.mode">
            <el-radio key="Active" label="Active">{{ $t('fileConfig.form.activeMode') }}</el-radio>
            <el-radio key="Passive" label="Passive">{{ $t('fileConfig.form.passiveMode') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- S3 -->
        <el-form-item v-if="form.storage === 20" :label="$t('fileConfig.form.endpoint')" prop="config.endpoint">
          <el-input v-model="form.config.endpoint" :placeholder="$t('fileConfig.form.placeholder.endpoint')" />
        </el-form-item>
        <el-form-item v-if="form.storage === 20" :label="$t('fileConfig.form.bucket')" prop="config.bucket">
          <el-input v-model="form.config.bucket" :placeholder="$t('fileConfig.form.placeholder.bucket')" />
        </el-form-item>
        <el-form-item v-if="form.storage === 20" :label="$t('fileConfig.form.accessKey')" prop="config.accessKey">
          <el-input v-model="form.config.accessKey" :placeholder="$t('fileConfig.form.placeholder.accessKey')" />
        </el-form-item>
        <el-form-item v-if="form.storage === 20" :label="$t('fileConfig.form.accessSecret')" prop="config.accessSecret">
          <el-input v-model="form.config.accessSecret" :placeholder="$t('fileConfig.form.placeholder.accessSecret')" />
        </el-form-item>
        <!-- 通用 -->
        <el-form-item v-if="form.storage === 20" :label="$t('fileConfig.form.domain')"> <!-- 无需参数校验，所以去掉 prop -->
          <el-input v-model="form.config.domain" :placeholder="$t('fileConfig.form.placeholder.domain')" />
        </el-form-item>
        <el-form-item v-else-if="form.storage" :label="$t('fileConfig.form.domain')" prop="config.domain">
          <el-input v-model="form.config.domain" :placeholder="$t('fileConfig.form.placeholder.domain')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('fileConfig.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('fileConfig.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  createFileConfig,
  updateFileConfig,
  deleteFileConfig,
  getFileConfig,
  getFileConfigPage,
  testFileConfig, updateFileConfigMaster
} from "@/api/infra/fileConfig";

export default {
  name: "InfraFileConfig",
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件配置列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: null,
        storage: null,
        createTime: []
      },
      // 表单参数
      form: {
        storage: undefined,
        config: {}
      },
      // 表单校验
      rules: {
        name: [{ required: true, message: this.$t('fileConfig.validation.name'), trigger: "blur" }],
        storage: [{ required: true, message: this.$t('fileConfig.validation.storage'), trigger: "change" }],
        config: {
          basePath: [{ required: true, message: this.$t('fileConfig.validation.basePath'), trigger: "blur" }],
          host: [{ required: true, message: this.$t('fileConfig.validation.host'), trigger: "blur" }],
          port: [{ required: true, message: this.$t('fileConfig.validation.port'), trigger: "blur" }],
          username: [{ required: true, message: this.$t('fileConfig.validation.username'), trigger: "blur" }],
          password: [{ required: true, message: this.$t('fileConfig.validation.password'), trigger: "blur" }],
          mode: [{ required: true, message: this.$t('fileConfig.validation.mode'), trigger: "change" }],
          endpoint: [{ required: true, message: this.$t('fileConfig.validation.endpoint'), trigger: "blur" }],
          bucket: [{ required: true, message: this.$t('fileConfig.validation.bucket'), trigger: "blur" }],
          accessKey: [{ required: true, message: this.$t('fileConfig.validation.accessKey'), trigger: "blur" }],
          accessSecret: [{ required: true, message: this.$t('fileConfig.validation.accessSecret'), trigger: "blur" }],
          domain: [{ required: true, message: this.$t('fileConfig.validation.domain'), trigger: "blur" }]
        }
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
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getFileConfigPage(this.queryParams).then(response => {
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
      this.form = {
        id: undefined,
        name: undefined,
        storage: undefined,
        remark: undefined,
        config: {},
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
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      getFileConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        // 修改的提交
        if (this.form.id != null) {
          updateFileConfig(this.form).then(response => {
            this.$modal.msgSuccess(this.$t('fileConfig.message.updateSuccess'));
            this.open = false;
            this.getList();
          });
          return;
        }
        // 添加的提交
        createFileConfig(this.form).then(response => {
          this.$modal.msgSuccess(this.$t('fileConfig.message.addSuccess'));
          this.open = false;
          this.getList();
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$confirm(this.$t('fileConfig.message.deleteConfirm', { id: id }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        return deleteFileConfig(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('fileConfig.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 主配置按钮操作 */
    handleMaster(row) {
      const id = row.id;
      this.$confirm(this.$t('fileConfig.message.masterConfirm', { id: id }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        return updateFileConfigMaster(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('fileConfig.message.updateSuccess'));
      }).catch(() => {});
    },
    /** 测试按钮操作 */
    handleTest(row) {
      testFileConfig(row.id).then((response) => {
        this.$confirm(this.$t('fileConfig.message.testSuccess') + response.data, this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      })
      
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
