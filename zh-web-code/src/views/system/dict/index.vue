<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px" style="display: flex; align-items: center; width: 100%;">
      <el-form-item prop="name" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.name" :placeholder="$t('systemDict.search.placeholder.name')" clearable size="small" style="width: 100%" @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="type" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.type" :placeholder="$t('systemDict.search.placeholder.type')" clearable size="small" style="width: 100%" @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="status" style="flex: 1; margin-right: 10px;">
        <el-select v-model="queryParams.status" :placeholder="$t('systemDict.search.placeholder.status')" clearable size="small" style="width: 100%">
          <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime" style="flex: 1.5; margin-right: 10px;">
        <el-date-picker v-model="queryParams.createTime" style="width: 100%" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('systemDict.search.placeholder.dateStart')" :end-placeholder="$t('systemDict.search.placeholder.dateEnd')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemDict.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemDict.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:dict:create']">{{ $t('systemDict.button.add') }}</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:dict:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary"  size="small"  @click="fileUpload">{{ $t('common.batchImport') }}</el-button>
      </el-col>           -->

     
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="typeList" border>
      <el-table-column :label="$t('systemDict.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('systemDict.table.name')" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemDict.table.type')" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          <router-link :to="'/setting/system/dict/type/data/' + scope.row.id" class="link-type">
            <span>{{ scope.row.type }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDict.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDict.table.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemDict.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDict.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:dict:update']">{{ $t('systemDict.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:dict:delete']">{{ $t('systemDict.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/> -->
 <a-pagination
              class="pagination"
              :current="queryParams.pageNo"
              :page-size="queryParams.pageSize"
              :total="total"
              :show-total="total => $t('systemDict.pagination.total', { total })"
              :page-size-options="['5', '10', '50', '100']"
              show-size-changer
              show-quick-jumper
              @change="handlePageChange"
              @showSizeChange="onShowSizeChange"></a-pagination>                

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('systemDict.dialog.name')" prop="name">
          <el-input v-model.trim="form.name" :placeholder="$t('systemDict.dialog.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="$t('systemDict.dialog.type')" prop="type">
          <el-input :disabled="typeof form.id !== 'undefined'" v-model.trim="form.type" :placeholder="$t('systemDict.dialog.placeholder.type')" />
        </el-form-item>
        <el-form-item :label="$t('systemDict.dialog.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('systemDict.dialog.remark')" prop="remark">
          <el-input v-model.trim="form.remark" type="textarea" show-word-limit maxlength="500" :placeholder="$t('systemDict.dialog.placeholder.remark')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ $t('systemDict.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemDict.button.cancel') }}</el-button>
      </div>
    </el-dialog>
   
  </div>
</template>

<script>
import { listType, getType, delType, addType, updateType, exportType } from "@/api/system/dict/type";
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: "SystemDictType",
  data() {
    return {
   
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      submitLoading: false,
      // 总条数
      total: 0,
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        type: undefined,
        status: undefined,
        createTime: []
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true,  message: this.$t('systemDict.search.placeholder.name'), trigger: "blur" }
        ],
        type: [
          { required: true, message: this.$t('systemDict.search.placeholder.type'), trigger: "blur" }
        ]
      },

      // 枚举
      CommonStatusEnum: CommonStatusEnum,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
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
    /** 查询字典类型列表 */
    getList() {
      this.loading = true;
      // 执行查询
      listType(this.queryParams).then(response => {
        this.typeList = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
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
        type: undefined,
        status: CommonStatusEnum.ENABLE,
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
      this.title = this.$t('systemDict.dialog.addTitle');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      getType(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('systemDict.dialog.editTitle');
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id !== undefined) {
            updateType(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemDict.message.updateSuccess'));
              this.submitLoading = false;
              this.open = false;
              this.getList();
              this.$store.dispatch('dict/loadDictDatas');
            });
          } else {
            addType(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemDict.message.addSuccess'));
              this.submitLoading = false;
              this.open = false;
              this.getList();
              this.$store.dispatch('dict/loadDictDatas');
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(this.$t('systemDict.message.deleteConfirm', { id: ids }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return delType(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemDict.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      // 操作查询参数
      let params = {...this.queryParams};
      params.pageNo = undefined;
      params.pageSize = undefined;
      // 执行导出
      this.$confirm(this.$t('systemDict.message.exportConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        this.exportLoading = true;
        return exportType(params);
      }).then(response => {
        this.$download.excel(response, '字典类型.xls');
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