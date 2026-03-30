<template>
  <div class="app-container">
    <!-- <doc-alert title="功能权限" url="https://doc.iocoder.cn/resource-permission" />
    <doc-alert title="菜单路由" url="https://doc.iocoder.cn/vue2/route/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item :label="$t('systemMenu.search.name')" prop="name">
        <el-input v-model="queryParams.name" :placeholder="$t('systemMenu.search.placeholder.name')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item :label="$t('systemMenu.search.status')" prop="status">
        <el-select v-model="queryParams.status" :placeholder="$t('systemMenu.search.placeholder.status')" clearable>
          <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemMenu.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemMenu.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:menu:create']">{{ $t('systemMenu.button.add') }}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="small" @click="toggleExpandAll">{{ $t('systemMenu.button.toggleExpand') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-if="refreshTable" v-loading="loading" :data="menuList" row-key="id" :default-expand-all="isExpandAll"
              :tree-props="{children: 'children', hasChildren: 'hasChildren'}" border>
      <el-table-column prop="name" :label="$t('systemMenu.table.name')" :show-overflow-tooltip="true" width="250"></el-table-column>
      <el-table-column prop="icon" :label="$t('systemMenu.table.icon')" align="center" width="100">
        <template v-slot="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" :label="$t('systemMenu.table.sort')" width="60"></el-table-column>
      <el-table-column prop="permission" :label="$t('systemMenu.table.permission')" :show-overflow-tooltip="true" />
      <el-table-column prop="component" :label="$t('systemMenu.table.component')" :show-overflow-tooltip="true" />
      <el-table-column prop="componentName" :label="$t('systemMenu.table.componentName')" :show-overflow-tooltip="true" />
      <el-table-column prop="status" :label="$t('systemMenu.table.status')" width="80">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('systemMenu.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:menu:update']">{{ $t('systemMenu.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)"
                     v-hasPermi="['system:menu:create']">{{ $t('systemMenu.button.add') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:menu:delete']">{{ $t('systemMenu.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('systemMenu.dialog.parentMenu')">
              <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer" :show-count="true"
                          :placeholder="$t('systemMenu.dialog.parentMenu')"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$t('systemMenu.dialog.menuType')" prop="type">
              <el-radio-group v-model="form.type">
                <el-radio v-for="dict in menuTypeDictDatas" :key="parseInt(dict.value)" :label="parseInt(dict.value)">
                  {{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="form.type !== 3" :label="menuType+$t('systemMenu.dialog.icon')">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" :placeholder="$t('systemMenu.dialog.icon')"  clearable>
                  <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon"
                            style="height: 32px;width: 16px;"/>
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="menuType+$t('systemMenu.dialog.name')" prop="name">
              <el-input v-model="form.name" :placeholder="$t('systemMenu.dialog.name')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemMenu.dialog.sort')" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" :max="10000"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.type !== 3" :label="$t('systemMenu.dialog.path')" prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`。如需外网地址时，则以 `http(s)://` 开头" placement="top">
                <i class="el-icon-question" />
                </el-tooltip>
                {{ $t('systemMenu.dialog.path') }}
              </span>
              <el-input v-model="form.path" :placeholder="$t('systemMenu.dialog.path')" />
            </el-form-item>
          </el-col>
				<el-col :span="12">
					<el-form-item v-if="form.type !== 1" :label="$t('systemMenu.dialog.permission')">
              <span slot="label">
                <el-tooltip content="Controller 方法上的权限字符，如：@PreAuthorize(`@ss.hasPermission('system:user:list')`)" placement="top">
                  <i class="el-icon-question" />
                </el-tooltip>
                {{ $t('systemMenu.dialog.permission') }}
              </span>
						<el-input v-model="form.permission" :placeholder="$t('systemMenu.dialog.permission')" maxlength="50" />
				</el-form-item>
			</el-col>
          <el-col :span="12" v-if="form.type === 2">
            <el-form-item :label="$t('systemMenu.dialog.component')" prop="component">
              <el-input v-model="form.component" :placeholder="$t('systemMenu.dialog.component')" />
            </el-form-item>
          </el-col>
			<el-col :span="12" v-if="form.type === 2">
				<el-form-item :label="$t('systemMenu.dialog.componentName')" prop="componentName">
					<el-input v-model="form.componentName" :placeholder="$t('systemMenu.dialog.componentName')" />
				</el-form-item>
			</el-col>
          <el-col :span="12">
            <el-form-item :label="menuType+$t('systemMenu.dialog.status')" prop="status">
              <span slot="label">
                <el-tooltip content="选择停用时，路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <i class="el-icon-question" />
                </el-tooltip>
                {{menuType+$t('systemMenu.dialog.status')}}
              </span>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                          :key="dict.value" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.type !== 3" :label="$t('systemMenu.dialog.visible')">
              <span slot="label">
                <el-tooltip content="选择隐藏时，路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <i class="el-icon-question" />
                </el-tooltip>
                {{ $t('systemMenu.dialog.visible') }}
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio :key="true" :label="true">{{ $t('systemMenu.dialog.options.show') }}</el-radio>
                <el-radio :key="false" :label="false">{{ $t('systemMenu.dialog.options.hide') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.type !== 3" :label="$t('systemMenu.dialog.alwaysShow')">
              <span slot="label">
                <el-tooltip content="选择不是时，当该菜单只有一个子菜单时，不展示自己，直接展示子菜单" placement="top">
                  <i class="el-icon-question" />
                </el-tooltip>
                {{ $t('systemMenu.dialog.alwaysShow') }}
              </span>
              <el-radio-group v-model="form.alwaysShow">
                <el-radio :key="true" :label="true">{{ $t('systemMenu.dialog.options.always') }}</el-radio>
                <el-radio :key="false" :label="false">{{ $t('systemMenu.dialog.options.notAlways') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
			<el-col :span="12">
				<el-form-item v-if="form.type === 2" :label="$t('systemMenu.dialog.keepAlive')">
              <span slot="label">
                <el-tooltip content="选择缓存时，则会被 `keep-alive` 缓存，必须填写「组件名称」字段" placement="top">
                  <i class="el-icon-question" />
                </el-tooltip>
                {{ $t('systemMenu.dialog.keepAlive') }}
              </span>
					<el-radio-group v-model="form.keepAlive">
						<el-radio :key="true" :label="true">{{ $t('systemMenu.dialog.options.cache') }}</el-radio>
						<el-radio :key="false" :label="false">{{ $t('systemMenu.dialog.options.noCache') }}</el-radio>
					</el-radio-group>
				</el-form-item>
			</el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ $t('systemMenu.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemMenu.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

import { SystemMenuTypeEnum, CommonStatusEnum } from '@/utils/constants'
import { getDictDatas, DICT_TYPE } from '@/utils/dict'
import {isExternal} from "@/utils/validate";

export default {
  name: "SystemMenu",
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      submitLoading: false,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 查询参数
      queryParams: {
        name: undefined,
        visible: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        name: [
          { required: true, message: this.$t('systemMenu.validation.nameRequired'), trigger: "blur" }
        ],
        sort: [
          { required: true, message: this.$t('systemMenu.validation.sortRequired'), trigger: "blur" }
        ],
        path: [
          { required: true, message: this.$t('systemMenu.validation.pathRequired'), trigger: "blur" }
        ],
        status: [
          { required: true, message: this.$t('systemMenu.validation.statusRequired'), trigger: "blur" }
        ]
      },

      // 枚举
      MenuTypeEnum: SystemMenuTypeEnum,
      CommonStatusEnum: CommonStatusEnum,
      // 数据字典
      menuTypeDictDatas: getDictDatas(DICT_TYPE.SYSTEM_MENU_TYPE),
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS)
    };
  },
  computed:{
    menuType(){
      let obj=this.menuTypeDictDatas.find(_=>_.value==this.form.type)||{}
      return  obj.label||'菜单'
    },
  },
  created() {
    this.getList();
  },
  methods: {
    // 选择图标
    selected(name) {
      this.form.icon = name;
    },
    /** 查询菜单列表 */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        // .filter(item => item.name !== '资产中心');
        // this.menuList = this.handleTree(response.data, "id").filter(item => item.name !== '资产中心');
        this.menuList = this.handleTree(response.data, "id")
        this.loading = false;
      });
    },
    /** 转换菜单数据结构 */
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
    /** 查询菜单下拉树结构 */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = [];
        const menu = { id: 0, name: this.$t('systemMenu.other.mainCategory'), children: [] };
        menu.children = this.handleTree(response.data, "id");
        this.menuOptions.push(menu);
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
        parentId: 0,
        name: undefined,
        icon: undefined,
        type: SystemMenuTypeEnum.DIR,
        sort: undefined,
        status: CommonStatusEnum.ENABLE,
        visible: true,
        keepAlive: true,
        alwaysShow: true,
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
    /** 展开/折叠操作 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.id) {
        this.form.parentId = row.id;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = this.$t('systemMenu.dialog.addTitle');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('systemMenu.dialog.editTitle');
      });
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          // 若权限类型为目录或者菜单时，进行 path 的校验，避免后续拼接出来的路由无法跳转
          if (this.form.type === SystemMenuTypeEnum.DIR
            || this.form.type === SystemMenuTypeEnum.MENU) {
            // 如果是外链，则不进行校验
            const path = this.form.path
            if (!isExternal(path)) {
              // 父权限为根节点，path 必须以 / 开头
              if (this.form.parentId === 0 && path.charAt(0) !== '/') {
                this.$modal.msgSuccess(this.$t('systemMenu.message.pathRootError'))
                return
              } else if (this.form.parentId !== 0 && path.charAt(0) === '/') {
                this.$modal.msgSuccess(this.$t('systemMenu.message.pathChildError'))
                return
              }
            }
          }

          // 提交
          if (this.form.id !== undefined) {
            this.submitLoading = true;
            updateMenu(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemMenu.message.updateSuccess'));
              this.submitLoading = false;
              this.open = false;
              this.getList();
            }).catch(()=>{
              this.submitLoading = false;
            });
          } else {
            this.submitLoading = true;
            addMenu(this.form).then(response => {
              this.$modal.msgSuccess(this.$t('systemMenu.message.addSuccess'));
              this.submitLoading = false;
              this.open = false;
              this.getList();
            }).catch(()=>{
              this.submitLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$confirm(this.$t('systemMenu.message.deleteConfirm', { name: row.name }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function() {
          return delMenu(row.id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemMenu.message.deleteSuccess'));
      }).catch(() => {});
    }
  }
};
</script>
