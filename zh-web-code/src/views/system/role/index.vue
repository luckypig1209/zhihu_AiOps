<template>
  <div class="app-container">
    <!-- <doc-alert title="功能权限" url="https://doc.iocoder.cn/resource-permission" />
    <doc-alert title="数据权限" url="https://doc.iocoder.cn/data-permission" /> -->
    <el-form :model="queryParams" ref="queryForm" v-show="showSearch" size="small" :inline="true" style="display: flex; align-items: center; width: 100%;">
      <el-form-item prop="name" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.name" :placeholder="$t('systemRole.search.placeholder.name')" clearable size="small" style="width: 100%"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="code" style="flex: 1; margin-right: 10px;">
        <el-input v-model="queryParams.code" :placeholder="$t('systemRole.search.placeholder.code')" clearable size="small" style="width: 100%"
                  @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item prop="status" style="flex: 1; margin-right: 10px;">
        <el-select v-model="queryParams.status" :placeholder="$t('systemRole.search.placeholder.status')" clearable size="small" style="width: 100%">
          <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="createTime" style="flex: 1.5; margin-right: 10px;">
        <el-date-picker v-model="queryParams.createTime" style="width: 100%" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" :start-placeholder="$t('systemRole.search.placeholder.dateStart')" :end-placeholder="$t('systemRole.search.placeholder.dateEnd')" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemRole.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemRole.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:role:create']">{{ $t('systemRole.button.add') }}</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                   v-hasPermi="['system:role:export']">导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList" border>
      <el-table-column :label="$t('systemRole.table.id')" align="center" prop="id" width="120" />
      <el-table-column :label="$t('systemRole.table.name')" align="center" prop="name" :show-overflow-tooltip="true" width="150" />
      <el-table-column :label="$t('systemRole.table.code')" align="center" prop="code" :show-overflow-tooltip="true" width="150" />
      <el-table-column :label="$t('systemRole.table.type')" align="center" prop="type" width="120">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_ROLE_TYPE" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemRole.table.sort')" align="center" prop="sort" width="100" />
      <el-table-column :label="$t('systemRole.table.status')" align="center" width="100">
        <template v-slot="scope">
          <el-switch v-model="scope.row.status" :disabled="!statusFlag" :active-value="0" :inactive-value="1" @change="handleStatusChange(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemRole.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemRole.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" v-if="scope.row.type !== 1" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:role:update']">{{ $t('systemRole.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-circle-check" v-if="scope.row.type !== 1" @click="handleMenu(scope.row)"
                     v-hasPermi="['system:permission:assign-role-menu']">{{ $t('systemRole.button.menuPermission') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-circle-check" v-if="scope.row.type !== 1" @click="handleDataScope(scope.row)"
                     v-show="false"
                     v-hasPermi="['system:permission:assign-role-data-scope']">{{ $t('systemRole.button.dataPermission') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" v-if="scope.row.type !== 1" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:role:delete']">{{ $t('systemRole.button.delete') }}</el-button>
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
              :show-total="total => $t('systemRole.pagination.total', { total })"
              :page-size-options="['5', '10', '50', '100']"
              show-size-changer
              show-quick-jumper
              @change="handlePageChange"
              @showSizeChange="onShowSizeChange"
            />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="$t('systemRole.dialog.name')" prop="name">
          <el-input v-model.trim="form.name" maxlength="20" :placeholder="$t('systemRole.dialog.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.dialog.code')" prop="code">
          <el-input v-model.trim="form.code" maxlength="20" :placeholder="$t('systemRole.dialog.placeholder.code')" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.dialog.sort')" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="0" step-strictly :step="1" :max="1000"/>
        </el-form-item>
        <el-form-item :label="$t('systemRole.dialog.remark')">
          <el-input v-model="form.remark" maxlength="500" type="textarea" :placeholder="$t('systemRole.dialog.placeholder.remark')"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('systemRole.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemRole.button.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色的数据权限对话框 -->
    <el-dialog :title="$t('systemRole.dataScope.title')" :visible.sync="openDataScope" width="500px" append-to-body>
      <el-form ref="dataForm" :model="form" label-width="80px" :rules="dataRules">
        <el-form-item :label="$t('systemRole.dataScope.name')">
          <el-input v-model.trim="form.name" maxlength="20" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.dataScope.code')">
          <el-input v-model.trim="form.code" maxlength="20" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.dataScope.scope')">
          <el-select v-model="form.dataScope">
            <el-option
              v-for="item in dataScopeDictDatas"
              :key="parseInt(item.value)"
              :label="item.label"
              :value="parseInt(item.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="数据权限" v-if="form.dataScope === 2" prop="dataScopeDeptIds"> -->
        <el-form-item :label="$t('systemRole.dataScope.permission')" v-if="form.dataScope === SysDataScopeEnum.DEPT_CUSTOM" prop="dataScopeDeptIds">
          <el-checkbox :checked="!form.deptCheckStrictly" @change="handleCheckedTreeConnect($event, 'dept')">{{ $t('systemRole.dataScope.treeOptions.connect') }}</el-checkbox>
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">{{ $t('systemRole.dataScope.treeOptions.expand') }}</el-checkbox>
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">{{ $t('systemRole.dataScope.treeOptions.selectAll') }}</el-checkbox>
          <el-tree
            v-model="form.dataScopeDeptIds"
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            default-expand-all
            ref="dept"
            node-key="id"
            :check-strictly="form.deptCheckStrictly"
            empty-text="加载中，请稍后"
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDataScope">{{ $t('systemRole.button.confirm') }}</el-button>
        <el-button @click="cancelDataScope">{{ $t('systemRole.button.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色的菜单权限对话框 -->
    <el-dialog :title="$t('systemRole.menuPermission.title')" :visible.sync="openMenu" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item :label="$t('systemRole.menuPermission.name')">
          <el-input v-model.trim="form.name" maxlength="20" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.menuPermission.code')">
          <el-input v-model.trim="form.code" maxlength="20" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemRole.menuPermission.permission')">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">{{ $t('systemRole.menuPermission.treeOptions.expand') }}</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">{{ $t('systemRole.menuPermission.treeOptions.selectAll') }}</el-checkbox>
          <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menu" node-key="id"
              :check-strictly="form.menuCheckStrictly" empty-text="加载中，请稍后" :props="defaultProps"></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitMenu">{{ $t('systemRole.button.confirm') }}</el-button>
        <el-button @click="cancelMenu">{{ $t('systemRole.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addRole,
  changeRoleStatus,
  delRole,
  exportRole,
  getRole,
  listRole,
  updateRole
} from "@/api/system/role";
import {listSimpleMenus} from "@/api/system/menu";
import {assignRoleMenu, listRoleMenus, assignRoleDataScope} from "@/api/system/permission";
import {listSimpleDepts} from "@/api/system/dept";
import {CommonStatusEnum, SystemDataScopeEnum} from "@/utils/constants";
import {DICT_TYPE, getDictDatas} from "@/utils/dict";

export default {
  name: "SystemRole",
  data() {
    let validateDataScopeDeptIds = (rule, value, callback) => {
		  let arr = this.$refs.dept.getCheckedKeys(); // 在此获取选中的树形数据
		  if (arr.length == 0 || !arr) {
		    callback(new Error(this.$t('systemRole.validation.dataScopeRequired')));
		  } else {
		    callback();
		  }
	  };
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      // 是否显示弹出层（菜单权限）
      openMenu: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [], // 部门属性结构
      depts: [], // 部门列表
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        code: undefined,
        status: undefined,
        createTime: []
      },
      // 表单参数
      form: {},
      defaultProps: {
        label: "name",
        children: "children"
      },
      dataRules: {
        dataScopeDeptIds: [{ required: true, validator: validateDataScopeDeptIds}]
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: this.$t('systemRole.validation.nameRequired'), trigger: "blur" }
        ],
        code: [
          { required: true, message: this.$t('systemRole.validation.codeRequired'), trigger: "blur" }
        ],
        sort: [
          { required: true, message: this.$t('systemRole.validation.sortRequired'), trigger: "blur" }
        ]
      },

      // 枚举
      SysCommonStatusEnum: CommonStatusEnum,
      SysDataScopeEnum: SystemDataScopeEnum,
      // 数据字典
      roleTypeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_ROLE_TYPE),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      dataScopeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_DATA_SCOPE)
    };
  },
  computed:{
    statusFlag(){
      const permissions = this.$store.getters && this.$store.getters.permissions
      let value = 'system:role:update'
      return permissions.some(permission => {
        return permission === value
      })
    },
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
    /** 查询角色列表 */
    getList() {
      this.loading = true;
      listRole(this.queryParams).then(
        response => {
          this.roleList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    // 角色状态修改
    handleStatusChange(row) {
      // 此时，row 已经变成目标状态了，所以可以直接提交请求和提示
      let text = row.status === CommonStatusEnum.ENABLE ? this.$t('common.enable') : this.$t('common.disable');
      this.$confirm(this.$t('systemRole.message.statusChangeConfirm', { text, name: row.name }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return changeRoleStatus(row.id, row.status);
        }).then(() => {
          this.$modal.msgSuccess(this.$t('systemRole.message.statusChangeSuccess'));
        }).catch(() => {
          // 异常时，需要将 row.status 状态重置回之前的
          row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE
              : CommonStatusEnum.ENABLE;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（数据权限）
    cancelDataScope() {
      this.openDataScope = false;
      this.reset();
    },
    // 取消按钮（菜单权限）
    cancelMenu() {
      this.openMenu = false;
      this.reset();
    },
    // 表单重置
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.menuExpand = false;
      this.menuNodeAll = false;
      this.deptExpand = true;
      this.deptNodeAll = false;
      this.form = {
        id: undefined,
        name: undefined,
        code: undefined,
        sort: 0,
        deptIds: [],
        menuIds: [],
        dataScope: undefined,
        deptCheckStrictly: false,
        menuCheckStrictly: true,
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
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type === 'menu') {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type === 'dept') {
        let treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type === 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions: []);
      } else if (type === 'dept') {
        // this.$refs.dept.setCheckedNodes(value ? this.deptOptions: []);
        this.$refs.dept.setCheckedNodes(value ? this.depts: []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type === 'menu') {
        this.form.menuCheckStrictly = value;
      } else if (type === 'dept') {
        this.form.deptCheckStrictly = !value;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = this.$t('systemRole.dialog.addTitle');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id
      getRole(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('systemRole.dialog.editTitle');
      });
    },
    /** 分配菜单权限操作 */
    handleMenu(row) {
      this.reset();
      const id = row.id
      // 操作了 form 的角色 name 和 code 的展示
      this.form.id = id;
      this.form.name = row.name;
      this.form.code = row.code;
      // 打开弹窗
      this.openMenu = true;
      // 获得菜单列表
      listSimpleMenus().then(response => {
        // 操作 menuOptions 参数
        this.menuOptions = [];
        this.menuOptions.push(...this.handleTree(response.data, "id"));
        console.log('菜单==', this.menuOptions);
        this.indexArr = [];
        this.menuOptions.forEach(item => {
          if(item.name == '首页') {
            item.disabled = true;
            this.indexArr.push(item)
          }
        })

        // 获取角色拥有的菜单权限
        listRoleMenus(id).then(response => {
          let roleArr = response.data
          let ids = [];
          let indexIds = this.getIndexNodeId(ids, this.indexArr);
          const newArr = roleArr.concat(indexIds);
          // 设置为严格，避免设置父节点自动选中子节点，解决半选中问题
          this.form.menuCheckStrictly = true;
          // 设置选中
          this.$refs.menu.setCheckedKeys(newArr);
          // 设置为非严格，继续使用半选中
          this.form.menuCheckStrictly = false;
        })
      });

    },
    // 递归获取首页所有节点id
    getIndexNodeId (expandedKeys, moduleDataList) {
      for (let i = 0; i < moduleDataList.length; i++) {
        // console.log('i in getAllNodeId: ', i)
        console.log('moduleDataList[i].id  in getAllNodeId: ', moduleDataList[i].id, moduleDataList[i].name)
        expandedKeys.push(moduleDataList[i].id)
        if (moduleDataList[i].children) {
          expandedKeys = this.getIndexNodeId(expandedKeys, moduleDataList[i].children)
        }

      }
      console.log('expandedKeys in getAllNodeId: ', expandedKeys)
      return expandedKeys
    },
    /** 分配数据权限操作 */
    handleDataScope(row) {
      this.reset();
      // 操作了 form 的角色 name 和 code 的展示
      this.form.id = row.id;
      this.form.name = row.name;
      this.form.code = row.code;
       // 打开弹窗
      this.openDataScope = true;
      // 获得部门列表
      listSimpleDepts().then(response => {
      // 操作 deptOptions 参数
      this.deptOptions = [];
      this.deptOptions.push(...this.handleTree(response.data, "id"));
      this.depts = response.data;
      // this.deptIds = response.data.map(x => x.id);
      // 获得角色拥有的数据权限
      getRole(row.id).then(response => {
          this.form.dataScope = response.data.dataScope;
          this.$nextTick(()=> {
            if(this.$refs.dept) {
              this.$refs.dept.setCheckedKeys(response.data.dataScopeDeptIds, false);
            }

          })

        });
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateRole(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemRole.message.updateSuccess'));
              this.open = false;
              this.getList();
            });
          } else {
            addRole(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemRole.message.addSuccess'));
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮（数据权限） */
    submitDataScope: function() {
      this.$refs["dataForm"].validate(valid => {
        if(valid) {
          if (this.form.id !== undefined) {
        assignRoleDataScope({
          roleId: this.form.id,
          dataScope: this.form.dataScope,
          dataScopeDeptIds: this.form.dataScope !== SystemDataScopeEnum.DEPT_CUSTOM ? [] :
              this.$refs.dept.getCheckedKeys()
        }).then(response => {
          this.$modal.msgSuccess(this.$t('systemRole.message.updateSuccess'));
          this.openDataScope = false;
          this.getList();
        });
      }
        }
      })

    },
    /** 提交按钮（菜单权限） */
    submitMenu: function() {
      if (this.form.id !== undefined) {
        assignRoleMenu({
          roleId: this.form.id,
          menuIds: [...this.$refs.menu.getCheckedKeys(), ...this.$refs.menu.getHalfCheckedKeys()]
        }).then(response => {
          this.$modal.msgSuccess(this.$t('systemRole.message.updateSuccess'));
          this.openMenu = false;
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(this.$t('systemRole.message.deleteConfirm', { id: ids }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return delRole(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemRole.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      const _this =  this
      this.$confirm(this.$t('systemRole.message.exportConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          _this.exportLoading = true;
          return exportRole(queryParams);
        }).then(response => {
          this.$download.excel(response, '角色数据.xls');
          this.exportLoading = false;
      }).catch(() => {
        this.exportLoading = false;
      });
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
