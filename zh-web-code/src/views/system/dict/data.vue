<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="10px">
      <el-form-item  prop="dictType">
        <el-select v-model="queryParams.dictType">
          <el-option v-for="item in typeOptions" :key="item.id" :label="item.name" :value="item.type"/>
        </el-select>
      </el-form-item>
      <el-form-item  prop="label">
        <el-input v-model="queryParams.label" :placeholder="$t('systemDictData.search.placeholder.label')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('systemDictData.search.placeholder.status')" clearable>
          <el-option v-for="dict in statusDictDatas" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemDictData.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemDictData.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:dict:create']">{{ $t('systemDictData.button.add') }}</el-button>
      </el-col>
<!--      <el-col :span="1.5">-->
<!--        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"-->
<!--                   v-hasPermi="['system:dict:export']">{{ $t('systemDictData.button.export') }}</el-button>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <file-upload :dataType="queryParams.dictType"  @success="getList"></file-upload>-->
<!--      </el-col>-->
<!--      <el-col :span="1.5">-->
<!--        <a download="字典数据导入模版.xlsx" href="/字典数据导入模版.xlsx" style="margin-left: 15px">-->
<!--          <el-button type="warning" icon="el-icon-bottom" size="small">{{ $t('systemDictData.button.downloadTemplate') }}</el-button>-->
<!--        </a>-->
<!--      </el-col>    -->
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-delete" size="small" @click="batchDelete"
                   >{{ $t('systemDictData.button.batchDelete') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column  type="selection"  width="55" />
      <el-table-column :label="$t('systemDictData.table.id')" align="center" prop="id" />
      <el-table-column :label="$t('systemDictData.table.label')" align="center" prop="label" />
      <el-table-column :label="$t('systemDictData.table.value')" align="center" prop="value" />
      <el-table-column :label="$t('systemDictData.table.sort')" align="center" prop="sort" />
      <el-table-column :label="$t('systemDictData.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDictData.table.colorType')" align="center" prop="colorType" />
      <el-table-column :label="$t('systemDictData.table.cssClass')" align="center" prop="cssClass" />
      <el-table-column :label="$t('systemDictData.table.remark')" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column :label="$t('systemDictData.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDictData.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:dict:update']">{{ $t('systemDictData.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:dict:delete']">{{ $t('systemDictData.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item :label="$t('systemDictData.dialog.dictType')">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.label')" prop="label">
          <el-input v-model="form.label" maxlength="20" :placeholder="$t('systemDictData.dialog.placeholder.label')" />
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.value')" prop="value">
          <el-input v-model="form.value" maxlength="120" :placeholder="$t('systemDictData.dialog.placeholder.value')" />
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.sort')" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" :max="10000"/>
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.colorType')" prop="colorType">
          <el-select v-model="form.colorType">
            <el-option v-for="item in colorTypeOptions" :key="item.value" :label="$t('systemDictData.colorType.' + item.value) + '(' + item.value + ')'" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.cssClass')" prop="cssClass">
          <el-input v-model="form.cssClass" maxlength="20" :placeholder="$t('systemDictData.dialog.placeholder.cssClass')" />
        </el-form-item>
        <el-form-item :label="$t('systemDictData.dialog.remark')" prop="remark">
          <el-input v-model="form.remark" maxlength="500" type="textarea" :placeholder="$t('systemDictData.dialog.placeholder.remark')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('systemDictData.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemDictData.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listData, getData, delData, addData, updateData, exportData, deleteData } from "@/api/system/dict/data";
import { listAllSimple, getType } from "@/api/system/dict/type";
import fileUpload from "./upload";
import { CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'

export default {
  name: "SystemDictData",
  components: { fileUpload},
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
      // 字典表格数据
      dataList: [],
      // 默认字典类型
      defaultDictType: "",
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
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        label: [
          { required: true, message: "数据标签不能为空", trigger: "blur" }
        ],
        value: [
          { required: true, message: "数据键值不能为空", trigger: "blur" }
        ],
        sort: [
          { required: true, message: "数据顺序不能为空", trigger: "blur" }
        ]
      },
      // 数据标签回显样式
      colorTypeOptions: [{
          value: "default"
        }, {
          value: "primary"
        }, {
          value: "success"
        }, {
          value: "info"
        }, {
          value: "warning"
        }, {
          value: "danger"
        }
      ],

      // 枚举
      CommonStatusEnum: CommonStatusEnum,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      selectId:[],
    };
  },
  created() {
    const dictId = this.$route.params && this.$route.params.dictId;
    this.getType(dictId);
    this.getTypeList();
  },
  methods: {
    handleSelectionChange(val) {
       this.selectId = []
       if(val.length){
          this.selectId = val.map(item =>{
            return item.id
          })
       }
      },
    batchDelete(){
      if(this.selectId.length == 0){
        this.$modal.msgWarning(this.$t('systemDictData.message.batchDeleteWarning'));
        return
      }
      deleteData(this.selectId).then(response => {
            this.$modal.msgSuccess(this.$t('systemDictData.message.deleteSuccess'));
            this.getList();
            this.$store.dispatch('dict/loadDictDatas');
      });
    },
    /** 查询字典类型详细 */
    getType(dictId) {
      getType(dictId).then(response => {
        this.queryParams.dictType = response.data.type;
        this.defaultDictType = response.data.type;
        this.getList();
      });
    },
    /** 查询字典类型列表 */
    getTypeList() {
      listAllSimple().then(response => {
        this.typeOptions = response.data;
      });
    },
    /** 查询字典数据列表 */
    getList() {
      this.loading = true;
      listData(this.queryParams).then(response => {
        this.dataList = response.data.list;
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
        label: undefined,
        value: undefined,
        sort: 0,
        status: CommonStatusEnum.ENABLE,
        colorType: 'default',
        cssClass: undefined,
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
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = this.$t('systemDictData.dialog.addTitle');
      this.form.dictType = this.queryParams.dictType;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getData(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('systemDictData.dialog.editTitle');
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateData(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemDictData.message.updateSuccess'));
              this.open = false;
              this.getList();
              this.$store.dispatch('dict/loadDictDatas');
            });
          } else {
            addData(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemDictData.message.addSuccess'));
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
      const ids = row.id;
      this.$confirm(this.$t('systemDictData.message.deleteConfirm', { id: ids }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return delData(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemDictData.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm(this.$t('systemDictData.message.exportConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          this.exportLoading = true;
          return exportData(queryParams);
        }).then(response => {
          this.$download.excel(response, '字典数据.xls');
          this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>
