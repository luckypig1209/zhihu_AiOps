<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('systemDept.search.name')" prop="name">
        <el-input v-model="queryParams.name" :placeholder="$t('systemDept.search.placeholder.name')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item :label="$t('systemDept.search.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('systemDept.search.placeholder.status')" clearable>
          <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemDept.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemDept.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:dept:create']">{{ $t('systemDept.button.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="small" @click="toggleExpandAll">{{ $t('systemDept.button.expandCollapse') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="deptList" row-key="id" :default-expand-all="isExpandAll"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}" border>
      <el-table-column prop="id" :label="$t('systemDept.table.id')" width="260"></el-table-column>
      <el-table-column prop="name" :label="$t('systemDept.table.name')" width="260"></el-table-column>
      <el-table-column prop="leader" :label="$t('systemDept.table.leader')" :formatter="userNicknameFormat" width="120"/>
      <el-table-column prop="sort" :label="$t('systemDept.table.sort')" width="200"></el-table-column>
      <el-table-column prop="status" :label="$t('systemDept.table.status')" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDept.table.createTime')" align="center" prop="createTime" width="200">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemDept.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:dept:update']">{{ $t('systemDept.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)"
                     v-hasPermi="['system:dept:create']">{{ $t('systemDept.button.add') }}</el-button>
          <el-button v-if="scope.row.parentId !== 0" size="mini" type="text" icon="el-icon-delete"
                     @click="handleDelete(scope.row)" v-hasPermi="['system:dept:delete']">{{ $t('systemDept.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('systemDept.dialog.parentDept')" :rules="(title=== $t('systemDept.dialog.addTitle') || (title === $t('systemDept.dialog.editTitle') && form.parentId))? [{ required: true, trigger: ['blur', 'change'], message: $t('systemDept.dialog.message.selectDept') }]: []" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" :placeholder="$t('systemDept.dialog.placeholder.parentDept')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.name')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('systemDept.dialog.placeholder.name')" maxlength="30" show-word-limit/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.sort')" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" :max="100000" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.leader')" prop="leaderUserId">
              <el-select v-model="form.leaderUserId" :placeholder="$t('systemDept.dialog.placeholder.leader')" clearable style="width: 100%">
                <el-option v-for="item in users" :key="parseInt(item.id)" :label="item.nickname" :value="parseInt(item.id)" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.phone')" prop="phone">
              <el-input v-model="form.phone" :placeholder="$t('systemDept.dialog.placeholder.phone')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('systemDept.dialog.placeholder.email')" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemDept.dialog.status')" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="parseInt(dict.value)">
                  {{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ $t('systemDept.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemDept.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDept, getDept, delDept, addDept, updateDept } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import {CommonStatusEnum} from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {listSimpleUsers} from "@/api/system/user";

export default {
  name: "SystemDept",
  components: { Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],
      // 用户下拉列表
      users: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 是否展开
      expand: false,
      // 查询参数
      queryParams: {
        name: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: this.$t('systemDept.message.nameRequired'), trigger: "blur" }
        ],
        sort: [
          { required: true, message: this.$t('systemDept.message.sortRequired'), trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: this.$t('systemDept.message.emailInvalid'),
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/,
            message: this.$t('systemDept.message.phoneInvalid'),
            trigger: "blur"
          }
        ],
        status: [
          { required: true, message: this.$t('systemDept.message.statusRequired'), trigger: "blur" }
        ]
      },
      submitLoading: false,
      // 枚举
      CommonStatusEnum: CommonStatusEnum,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    };
  },
  created() {
    this.getList();
    // 获得用户列表
    listSimpleUsers().then(response => {
      this.users = response.data;
    });
  },
  methods: {
    /** 查询部门列表 */
    getList() {
      this.loading = true;
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, "id");
        this.loading = false;
      });
    },
    /** 转换部门数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },
    // 用户昵称展示
    userNicknameFormat(row, column) {
      if (!row.leaderUserId) {
        return this.$t('systemDept.message.noLeader');
      }
      for (const user of this.users) {
        if (row.leaderUserId === user.id) {
          return user.nickname;
        }
      }
      return this.$t('systemDept.message.unknownLeader', { id: row.leaderUserId });
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
        parentId: undefined,
        name: undefined,
        sort: undefined,
        leaderUserId: undefined,
        phone: undefined,
        email: undefined,
        status: CommonStatusEnum.ENABLE,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      if (row !== undefined) {
        this.form.parentId = row.id;
      }
      this.open = true;
      this.title = this.$t('systemDept.dialog.addTitle');
      listDept().then(response => {
	        this.deptOptions = this.handleTree(response.data, "id");
      });
    },
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      getDept(row.id).then(response => {
        this.form = response.data;
        if (this.form.parentId === 0) { // 无父部门时，标记为 undefined，避免展示为 Unknown
          this.form.parentId = undefined;
        }
        this.open = true;
        this.title = this.$t('systemDept.dialog.editTitle');
      });
      listDept(row.id).then(response => {
	        this.deptOptions = this.handleTree(response.data, "id");
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          if (this.form.id !== undefined) {
            updateDept(this.form).then(response => {
              this.submitLoading = false;
              this.$modal.msgSuccess(this.$t('systemDept.message.updateSuccess'));
              this.open = false;
              this.getList();
            }).catch(()=> {
              this.submitLoading = false;
            });
          } else {
            addDept(this.form).then(response => {
              this.submitLoading = false;
              this.$modal.msgSuccess(this.$t('systemDept.message.addSuccess'));
              this.open = false;
              this.getList();
            }).catch(() => {
              this.submitLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(this.$t('systemDept.message.deleteConfirm', { id: row.id }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function() {
          return delDept(row.id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemDept.message.deleteSuccess'));
      }).catch(() => {});
    }
  }
};
</script>
