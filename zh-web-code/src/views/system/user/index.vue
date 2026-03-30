<template>
  <div class="app-container">
    <!-- <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" />
    <doc-alert title="三方登陆" url="https://doc.iocoder.cn/social-user/" />
    <doc-alert title="Excel 导入导出" url="https://doc.iocoder.cn/excel-import-and-export/" /> -->
    <!-- 搜索工作栏 -->
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
          <img src="../../../assets/images/dept-icon.png" alt="" style="width: 14px;margin: 0 10px 4px 0;vertical-align: middle;">
          <span style="font-size: 16px;">{{ $t('systemUser.dept.title') }}</span>
        </div>
          <div class="head-container">
            <el-input v-model="deptName" :placeholder="$t('systemUser.dept.placeholder')" clearable size="small" prefix-icon="el-icon-search" style="margin-bottom: 20px"/>
          </div>
          <div class="head-container">
            <el-tree :data="deptOptions" :props="defaultProps" :expand-on-click-node="false" :filter-node-method="filterNode"
                    ref="tree" default-expand-all highlight-current @node-click="handleNodeClick">
              <el-tooltip
                :disabled="showTitle"
                effect="dark"
                :content="tooltipTitle"
                placement="top"
                slot-scope="{ node, data }"
              >
                <span
                  class="span-ellipsis"
                  @mouseover="onShowNameTipsMouseenter"
                  >{{ node.label }}</span
                >
              </el-tooltip>
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="0">
          <el-form-item prop="username">
            <el-input v-model="queryParams.username" :placeholder="$t('systemUser.search.placeholder.username')" clearable style="width: 220px"
                      @keyup.enter.native="handleQuery"/>
          </el-form-item>
          <el-form-item prop="mobile">
            <el-input v-model="queryParams.mobile" :placeholder="$t('systemUser.search.placeholder.mobile')" clearable style="width: 220px"
                      @keyup.enter.native="handleQuery"/>
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="queryParams.status" :placeholder="$t('systemUser.search.placeholder.status')" clearable style="width: 220px">
              <el-option v-for="dict in statusDictDatas" :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
            </el-select>
          </el-form-item>
          <el-form-item prop="createTime">
            <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
              range-separator="-" :start-placeholder="$t('systemUser.search.placeholder.dateStart')" :end-placeholder="$t('systemUser.search.placeholder.dateEnd')" :default-time="['00:00:00', '23:59:59']" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('systemUser.button.search') }}</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('systemUser.button.reset') }}</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                       v-hasPermi="['system:user:create']">{{ $t('systemUser.button.add') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" icon="el-icon-upload2" size="small" @click="handleImport"
                       v-hasPermi="['system:user:import']">{{ $t('systemUser.button.import') }}</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" icon="el-icon-download" size="small" @click="handleExport" :loading="exportLoading"
                       v-hasPermi="['system:user:export']">{{ $t('systemUser.button.export') }}</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList" border>
<!--          <el-table-column :label="$t('systemUser.table.id')" align="center" key="id" prop="id" v-if="columns[0].visible" />-->
          <el-table-column :label="$t('systemUser.table.username')" align="center" key="username" prop="username" v-if="columns[1].visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('systemUser.table.nickname')" align="center" key="nickname" prop="nickname" v-if="columns[2].visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('systemUser.table.roleName')" align="center" key="name" prop="name" v-if="columns[7].visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('systemUser.table.deptName')" align="center" key="deptName" prop="deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
          <el-table-column :label="$t('systemUser.table.mobile')" align="center" key="mobile" prop="mobile" v-if="columns[4].visible" width="120" />
          <el-table-column :label="$t('systemUser.table.status')" key="status" v-if="columns[5].visible" align="center">
            <template v-slot="scope">
              <el-switch v-model="scope.row.status" :disabled="!statusFlag" :active-value="0" :inactive-value="1" @change="handleStatusChange(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('systemUser.table.createTime')" align="center" prop="createTime" v-if="columns[6].visible" width="160">
            <template v-slot="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('systemUser.table.operation')" align="center" width="200" class-name="small-padding fixed-width">
            <template v-slot="scope">
              <el-button size="mini" type="text" v-if="scope.row.id !== 1" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                         v-hasPermi="['system:user:update']">{{ $t('systemUser.button.edit') }}</el-button>
                         <!-- <el-button size="mini" type="text" v-if="scope.row.id !== 1" icon="el-icon-circle-check" @click="handleRole(scope.row)"
                         v-hasPermi="['system:permission:assign-user-role']">分配角色</el-button> -->
              <el-dropdown  v-if="scope.row.id !== 1" @command="(command) => handleCommand(command, scope.$index, scope.row)"
                            v-hasPermi="['system:user:delete', 'system:user:update-password', 'system:permission:assign-user-role']">
                <el-button size="mini" type="text" icon="el-icon-d-arrow-right">{{ $t('systemUser.button.more') }}</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="handleDelete" v-if="scope.row.id !== 1&&scope.row.id!==$store.getters.userId" size="mini" type="text" icon="el-icon-delete"
                                    v-hasPermi="['system:user:delete']">{{ $t('systemUser.button.delete') }}</el-dropdown-item>
                  <el-dropdown-item command="handleResetPwd" v-if="scope.row.id !== 1" size="mini" type="text" icon="el-icon-key"
                                    v-hasPermi="['system:user:update-password']">{{ $t('systemUser.button.resetPwd') }}</el-dropdown-item>
                  <!-- <el-dropdown-item command="handleRole" size="mini" type="text" icon="el-icon-circle-check"
                                    v-hasPermi="['system:permission:assign-user-role']">分配角色</el-dropdown-item> -->
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                    @pagination="getList"/> -->
        <a-pagination
              class="pagination"
              :locale="zhCN"
              :current="queryParams.pageNo"
              :page-size="queryParams.pageSize"
              :total="total"
              :show-total="total => $t('systemUser.pagination.total', { total: total })"
              :page-size-options="['5', '10', '50', '100']"
              show-size-changer
              show-quick-jumper
              @change="handlePageChange"
              @showSizeChange="onShowSizeChange"
            />
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('systemUser.dialog.nickname')" prop="nickname">
              <el-input v-model="form.nickname" :placeholder="$t('systemUser.dialog.placeholder.nickname')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemUser.dialog.deptId')" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" :clearable="false"
                          :placeholder="$t('systemUser.dialog.placeholder.deptId')" :normalizer="normalizer" @open="openDept"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('systemUser.dialog.mobile')" prop="mobile">
              <el-input v-model="form.mobile" :placeholder="$t('systemUser.dialog.placeholder.mobile')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('systemUser.dialog.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('systemUser.dialog.placeholder.email')" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.id === undefined" :label="$t('systemUser.dialog.username')" prop="username">
              <el-input v-model="form.username" :placeholder="$t('systemUser.dialog.placeholder.username')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.id === undefined" :label="$t('systemUser.dialog.password')" prop="password">
              <el-input v-model="form.password" :placeholder="$t('systemUser.dialog.placeholder.password')" type="password" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$t('systemUser.dialog.sex')">
              <el-select v-model="form.sex" :placeholder="$t('systemUser.dialog.placeholder.sex')">
                <el-option v-for="dict in sexDictDatas" :key="dict.value" :label="dict.label" :value="dict.value + ''"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('systemUser.dialog.role')" prop="roleIds">
            <el-select v-model="form.roleIds" multiple :placeholder="$t('systemUser.dialog.placeholder.role')">
              <el-option
                  v-for="item in roleOptions"
                  :key="parseInt(item.id)"
                  :label="item.name"
                  :value="parseInt(item.id)"
              ></el-option>
            </el-select>
          </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$t('systemUser.dialog.remark')">
              <el-input v-model="form.remark" type="textarea" :rows="4" maxlength="500" :placeholder="$t('systemUser.dialog.placeholder.remark')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitForm">{{ $t('systemUser.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('systemUser.button.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress" :on-change="handleFileChange" :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">{{ $t('systemUser.import.dragText') }}<em>{{ $t('systemUser.import.clickUpload') }}</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> {{ $t('systemUser.import.updateSupport') }}
          </div>
          <span>{{ $t('systemUser.import.fileFormat') }}</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">{{ $t('systemUser.import.downloadTemplate') }}</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">{{ $t('systemUser.button.confirm') }}</el-button>
        <el-button @click="upload.open = false">{{ $t('systemUser.button.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog :title="$t('systemUser.assignRole.title')" :visible.sync="openRole" width="500px" append-to-body>
      <el-form :model="form" label-width="80px">
        <el-form-item :label="$t('systemUser.assignRole.username')">
          <el-input v-model="form.username" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemUser.assignRole.nickname')">
          <el-input v-model="form.nickname" :disabled="true" />
        </el-form-item>
        <el-form-item :label="$t('systemUser.assignRole.role')">
          <el-select v-model="form.roleIds" multiple :placeholder="$t('systemUser.assignRole.placeholder.role')">
            <el-option
                v-for="item in roleOptions"
                :key="parseInt(item.id)"
                :label="item.name"
                :value="parseInt(item.id)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRole">{{ $t('systemUser.button.confirm') }}</el-button>
        <el-button @click="cancelRole">{{ $t('systemUser.button.cancel') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {
  addUser,
  changeUserStatus,
  delUser,
  exportUser,
  getUser,
  importTemplate,
  listUser,
  resetUserPwd,
  updateUser
} from "@/api/system/user";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

import {listSimpleDepts} from "@/api/system/dept";
import {listSimplePosts} from "@/api/system/post";

import {CommonStatusEnum} from "@/utils/constants";
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
import {assignUserRole, listUserRoles} from "@/api/system/permission";
import {listSimpleRoles} from "@/api/system/role";
import {getBaseHeader} from "@/utils/request";
import {aesEncrypt} from "@/utils/ase";
import i18n from "@/i18n";

const strongPassword = (rule, value, callback) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*])[A-Za-z\d#?!@$%^&*]{8,}$/;
  if (strongRegex.test(value)) {
    return callback()
  }
  return callback(new Error(i18n.t('systemUser.validation.passwordStrength')))
}
export default {
  name: "SystemUser",
  components: { Treeselect },
  data() {
    return {
      tooltipTitle: "",
      showTitle: true,
      submitLoading: false,
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: undefined,
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {
        postIds:[],
      },
      defaultProps: {
        children: "children",
        label: "name"
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: getBaseHeader(),
        // 上传的地址
        url:  '/admin-api/system/user/import'
      },
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        username: undefined,
        mobile: undefined,
        status: undefined,
        deptId: undefined,
        createTime: []
      },
      // 列信息
      columns: [
        { key: 0, label: this.$t('systemUser.table.id'), visible: true },
        { key: 1, label: this.$t('systemUser.table.username'), visible: true },
        { key: 2, label: this.$t('systemUser.table.nickname'), visible: true },
        { key: 3, label: this.$t('systemUser.table.deptName'), visible: true },
        { key: 4, label: this.$t('systemUser.table.mobile'), visible: true },
        { key: 5, label: this.$t('systemUser.table.status'), visible: true },
        { key: 6, label: this.$t('systemUser.table.createTime'), visible: true },
        { key: 7, label: this.$t('systemUser.table.roleName'), visible: true }
      ],
      rules: {
        username: [
          { required: true, message: this.$t('systemUser.validation.usernameRequired'), trigger: "blur" }
        ],
        deptId: [
          { required: true, message: this.$t('systemUser.validation.deptIdRequired'), trigger: "blur" }
        ],
        nickname: [
          { required: true, message: this.$t('systemUser.validation.nicknameRequired'), trigger: "blur" }
        ],
        password: [
          { required: true, message: this.$t('systemUser.validation.passwordRequired'), trigger: "blur" },
          { min: 8, max: 20, message: this.$t('systemUser.validation.passwordLength'), trigger: "blur" },
          { validator: strongPassword, trigger: "blur" },
        ],
        email: [
          { required: true, message: this.$t('systemUser.validation.emailRequired'), trigger: "blur" },
          {
            type: "email",
            message: this.$t('systemUser.validation.emailFormat'),
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          { required: true, message: this.$t('systemUser.validation.mobileRequired'), trigger: "blur" },
          {
            pattern: /^1[0-9]{10}$/,
            message: this.$t('systemUser.validation.mobileFormat'),
            trigger: "blur"
          }
        ],
        roleIds: [
          { required: true, message: this.$t('systemUser.validation.roleRequired'), trigger: "blur" }
        ]
      },
      // 是否显示弹出层（角色权限）
      openRole: false,

      // 枚举
      SysCommonStatusEnum: CommonStatusEnum,
      // 数据字典
      statusDictDatas: getDictDatas(DICT_TYPE.COMMON_STATUS),
      sexDictDatas: getDictDatas(DICT_TYPE.SYSTEM_USER_SEX),
    };
  },
  computed:{
    statusFlag(){
      const permissions = this.$store.getters && this.$store.getters.permissions
      let value = 'system:user:update'
      return permissions.some(permission => {
           return permission === value
        })
    },
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    console.log('ddsda',this.statusFlag)
    this.getList();
    this.getTreeselect();
    console.log('rr',this.sexDictDatas)
    // this.getConfigKey("sys.user.init-password").then(response => {
    //   this.initPassword = response.msg;
    // });
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
    openDept() {
      this.$refs.selectDept.blur(); // 收起岗位下拉菜单
    },
    onShowNameTipsMouseenter(e) {
      var target = e.target;
      let textLength = target.clientWidth;
      let containerLength = target.scrollWidth;
      if (textLength < containerLength) {
        this.tooltipTitle = e.target.innerText;
        this.showTitle = false;
      } else {
        this.showTitle = true;
      }
    },
    // 更多操作
    handleCommand(command, index, row) {
      switch (command) {
        case 'handleUpdate':
          this.handleUpdate(row);//修改客户信息
          break;
        case 'handleDelete':
          this.handleDelete(row);//红号变更
          break;
        case 'handleResetPwd':
          this.handleResetPwd(row);
          break;
        case 'handleRole':
          this.handleRole(row);
          break;
        default:
          break;
      }
    },
    /** 查询用户列表 */
    getList() {
      console.log('dsa',aesEncrypt('M^adminV587'))
      this.loading = true;
      listUser(this.queryParams).then(response => {
          this.userList = response.data.list;
          this.total = response.data.total;
          this.loading = false;
        }
      );
    },
    /** 查询部门下拉树结构 + 岗位下拉 */
    getTreeselect() {
      listSimpleDepts().then(response => {
        // 操作 deptOptions 参数
        this.deptOptions = [];
        this.deptOptions.push(...this.handleTree(response.data, "id"));
      });
      listSimplePosts().then(response => {
        // 操作 postOptions 参数
        this.postOptions = [];
        this.postOptions.push(...response.data);
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === CommonStatusEnum.ENABLE ? this.$t('common.enable') : this.$t('common.disable');
        this.$confirm(this.$t('systemUser.message.statusChangeConfirm', { text: text, username: row.username }), this.$t('common.tip'), {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
          type: "warning",
        }).then(function() {
          return changeUserStatus(row.id, row.status);
        }).then(() => {
          this.$modal.msgSuccess(this.$t('systemUser.message.statusChangeSuccess'));
        }).catch(function() {
          row.status = row.status === CommonStatusEnum.ENABLE ? CommonStatusEnum.DISABLE
              : CommonStatusEnum.ENABLE;
        });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮（角色权限）
    cancelRole() {
      this.openRole = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        deptId: undefined,
        username: undefined,
        nickname: undefined,
        password: undefined,
        mobile: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: []
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
      // 获得下拉数据
      this.getTreeselect();
      // 获得角色列表
      listSimpleRoles().then(response => {
        // 操作 roleOptions 参数
        this.roleOptions = [];
        this.roleOptions.push(...response.data);
      });
      // 打开表单，并设置初始化
      this.open = true;
      this.title = this.$t('systemUser.dialog.addTitle');
      this.form.password = this.initPassword;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const id = row.id;
      getUser(id).then(response => {
        this.form = response.data;
        let newArr = []
        //将response.data.postIds和this.postOptions中id相同的项放入newArr
        for (let i = 0; i < this.postOptions.length; i++) {
          if (response.data.postIds.includes(this.postOptions[i].id)) {
            newArr.push(this.postOptions[i].id)
          }
        }
        console.log('dsd',newArr,this.postOptions)
        this.form.postIds = newArr
        if (this.form.roleIds !== '') {
          this.form.roleIds = this.form.roleIds.split(',').map(item =>{
            return parseInt(item)
          })
        }

        this.form.sex = this.form.sex === 0 ? undefined : this.form.sex + ''
        this.open = true;
        this.title = this.$t('systemUser.dialog.editTitle');
      });
      // 获得角色列表
      listSimpleRoles().then(response => {
        // 操作 roleOptions 参数
        this.roleOptions = [];
        this.roleOptions.push(...response.data);
      });
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt(this.$t('systemUser.message.resetPwdPrompt', { username: row.username }), this.$t('common.tip'), {
        confirmButtonText: this.$t('systemUser.button.confirm'),
        cancelButtonText: this.$t('systemUser.button.cancel'),
        inputPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#?!@$%^&*])[A-Za-z\d#?!@$%^&*]{8,}$/,
        inputErrorMessage: this.$t('systemUser.validation.passwordStrength')
      }).then(({ value }) => {
          resetUserPwd(row.id, aesEncrypt(value)).then(response => {
            this.$modal.msgSuccess(this.$t('systemUser.message.updateSuccess'));
          });
        }).catch(() => {});
    },
    /** 分配用户角色操作 */
    handleRole(row) {
      this.reset();
      const id = row.id
      // 操作了 form 的用户 username 和 nickname 的展示
      this.form.id = id;
      this.form.username = row.username;
      this.form.nickname = row.nickname;
      // 打开弹窗
      this.openRole = true;
      // 获得角色列表
      listSimpleRoles().then(response => {
        // 操作 roleOptions 参数
        this.roleOptions = [];
        this.roleOptions.push(...response.data);
      });
      // 获得角色拥有的菜单集合
      listUserRoles(id).then(response => {
        // 设置选中
        this.form.roleIds = response.data;
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.submitLoading = true;
          let obj = Object.assign({}, this.form, {
            password: aesEncrypt(this.form.password),
            roleIds: this.form.roleIds.join(',')
          })
          if (this.form.id !== undefined) {
            updateUser(obj).then(response => {
              this.$modal.msgSuccess(this.$t('systemUser.message.updateSuccess'));
              this.submitLoading = false;
              this.open = false;
              this.getList();
            }).catch(()=>{
              this.submitLoading = false;
            });
          } else {
            addUser(obj).then(response => {
              this.$modal.msgSuccess(this.$t('systemUser.message.addSuccess'));
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
    /** 提交按钮（角色权限） */
    submitRole: function() {
      if (this.form.id !== undefined) {
        assignUserRole({
          userId: this.form.id,
          roleIds: this.form.roleIds,
        }).then(response => {
          this.$modal.msgSuccess(this.$t('systemUser.message.assignRoleSuccess'));
          this.openRole = false;
          this.getList();
        });
      }
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm(this.$t('systemUser.message.deleteConfirm', { id: ids }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return delUser(ids);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('systemUser.message.deleteSuccess'));
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$confirm(this.$t('systemUser.message.exportConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          let params = {...this.queryParams};
          params.pageNo = undefined;
          params.pageSize = undefined;
          this.exportLoading = true;
          return exportUser(params);
        }).then(response => {
          this.$download.excel(response, this.$t('common.userData') + '.xls');
          this.exportLoading = false;
      }).catch(() => {
        this.exportLoading = false;
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = this.$t('systemUser.import.title');
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
        this.$download.excel(response, this.$t('common.userImportTemplate') + '.xls');
      });
    },
    // 文件上传中操作
    handleFileUploadProgress(event, file, fileList) {

      this.upload.isUploading = true;
    },
    handleFileChange(file, fileList) {
      console.log(file, fileList)
    },
    // 文件上传成功操作
    handleFileSuccess(response, file, fileList) {

      if (response.code !== 0) {
        this.$modal.msgError(response.msg)
        this.upload.isUploading = false;
        this.$refs.upload.clearFiles();
        return;
      }
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // 拼接提示语
      let data = response.data;
      let text = this.$t('common.createSuccessCount') + data.createUsernames.length;
      for (const username of data.createUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username;
      }
      text += '<br />' + this.$t('common.updateSuccessCount') + data.updateUsernames.length;
      for (const username of data.updateUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username;
      }
      text += '<br />' + this.$t('common.updateFailureCount') + Object.keys(data.failureUsernames).length;
      for (const username in data.failureUsernames) {
        text += '<br />&nbsp;&nbsp;&nbsp;&nbsp;' + username + '：' + data.failureUsernames[username];
      }
      this.$alert(text, this.$t('common.importResult'), { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    // 格式化部门的下拉框
    normalizer(node) {
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    }
  }
};
</script>
<style scoped>
  .box-card {
    min-height:calc(100vh - 160px);
  }
  .span-ellipsis {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 20px;
  }
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
