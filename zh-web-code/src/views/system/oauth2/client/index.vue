<template>
  <div class="app-container">
    <!-- <doc-alert title="OAuth 2.0（SSO 单点登录)" url="https://doc.iocoder.cn/oauth2/" /> -->

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="0px" style="display: flex; align-items: center; flex-wrap: wrap;">
      <el-form-item prop="name" >
        <el-input v-model="queryParams.name" :placeholder="$t('common.oauth2Client.search.placeholder.name')" clearable @keyup.enter.native="handleQuery" style="width: 100%;"/>
      </el-form-item>
      <el-form-item prop="status" >
        <el-select v-model="queryParams.status" :placeholder="$t('common.oauth2Client.search.placeholder.status')" clearable size="small" style="width: 100%;">
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                       :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 0;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.oauth2Client.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.oauth2Client.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd"
                   v-hasPermi="['system:oauth2-client:create']">{{ $t('common.oauth2Client.button.add') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('common.oauth2Client.table.clientId')" align="center" prop="clientId" />
      <el-table-column :label="$t('common.oauth2Client.table.secret')" align="center" prop="secret" />
      <el-table-column :label="$t('common.oauth2Client.table.name')" align="center" prop="name" />
      <el-table-column :label="$t('common.oauth2Client.table.logo')" align="center" prop="logo">
        <template v-slot="scope">
          <img width="40px" height="40px" :src="scope.row.logo">
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.status')" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.accessTokenValidity')" align="center" prop="accessTokenValiditySeconds">
        <template v-slot="scope">{{ scope.row.accessTokenValiditySeconds }} {{ $t('common.oauth2Client.table.seconds') }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.refreshTokenValidity')" align="center" prop="refreshTokenValiditySeconds">
        <template v-slot="scope">{{ scope.row.refreshTokenValiditySeconds }} {{ $t('common.oauth2Client.table.seconds') }}</template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.authorizedGrantTypes')" align="center" prop="authorizedGrantTypes">
        <template v-slot="scope">
          <el-tag :disable-transitions="true" :key="index" v-for="(authorizedGrantType, index) in scope.row.authorizedGrantTypes" :index="index">
            {{ authorizedGrantType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Client.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['system:oauth2-client:update']">{{ $t('common.oauth2Client.button.edit') }}</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:oauth2-client:delete']">{{ $t('common.oauth2Client.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="160px">
        <el-form-item :label="$t('common.oauth2Client.dialog.form.clientId')" prop="secret">
          <el-input v-model="form.clientId" :placeholder="$t('common.oauth2Client.dialog.placeholder.clientId')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.secret')" prop="secret">
          <el-input v-model="form.secret" :placeholder="$t('common.oauth2Client.dialog.placeholder.secret')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('common.oauth2Client.dialog.placeholder.name')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.logo')">
          <imageUpload v-model="form.logo" :limit="1"/>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.description')">
          <el-input type="textarea" v-model="form.description" :placeholder="$t('common.oauth2Client.dialog.placeholder.description')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                      :key="dict.value" :label="parseInt(dict.value)">{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.accessTokenValidity')" prop="accessTokenValiditySeconds">
          <el-input-number v-model="form.accessTokenValiditySeconds" :placeholder="$t('common.oauth2Client.dialog.placeholder.accessTokenValidity')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.refreshTokenValidity')" prop="refreshTokenValiditySeconds">
          <el-input-number v-model="form.refreshTokenValiditySeconds" :placeholder="$t('common.oauth2Client.dialog.placeholder.refreshTokenValidity')" />
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.authorizedGrantTypes')" prop="authorizedGrantTypes">
          <el-select v-model="form.authorizedGrantTypes" multiple filterable :placeholder="$t('common.oauth2Client.dialog.placeholder.authorizedGrantTypes')" style="width: 500px" >
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.SYSTEM_OAUTH2_GRANT_TYPE)"
                       :key="dict.value" :label="dict.label" :value="dict.value"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.scopes')" prop="scopes">
          <el-select v-model="form.scopes" multiple filterable allow-create :placeholder="$t('common.oauth2Client.dialog.placeholder.scopes')" style="width: 500px" >
            <el-option v-for="scope in form.scopes" :key="scope" :label="scope" :value="scope"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.autoApproveScopes')" prop="autoApproveScopes">
          <el-select v-model="form.autoApproveScopes" multiple filterable :placeholder="$t('common.oauth2Client.dialog.placeholder.autoApproveScopes')" style="width: 500px" >
            <el-option v-for="scope in form.scopes" :key="scope" :label="scope" :value="scope"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.redirectUris')" prop="redirectUris">
          <el-select v-model="form.redirectUris" multiple filterable allow-create :placeholder="$t('common.oauth2Client.dialog.placeholder.redirectUris')" style="width: 500px" >
            <el-option v-for="redirectUri in form.redirectUris" :key="redirectUri" :label="redirectUri" :value="redirectUri"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.authorities')" prop="authorities">
          <el-select v-model="form.authorities" multiple filterable allow-create :placeholder="$t('common.oauth2Client.dialog.placeholder.authorities')" style="width: 500px" >
            <el-option v-for="authority in form.authorities" :key="authority" :label="authority" :value="authority"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.resourceIds')" prop="resourceIds">
          <el-select v-model="form.resourceIds" multiple filterable allow-create :placeholder="$t('common.oauth2Client.dialog.placeholder.resourceIds')" style="width: 500px" >
            <el-option v-for="resourceId in form.resourceIds" :key="resourceId" :label="resourceId" :value="resourceId"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.oauth2Client.dialog.form.additionalInformation')" prop="additionalInformation">
          <el-input type="textarea" v-model="form.additionalInformation" :placeholder="$t('common.oauth2Client.dialog.placeholder.additionalInformation')" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">{{ $t('common.oauth2Client.button.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('common.oauth2Client.button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createOAuth2Client, updateOAuth2Client, deleteOAuth2Client, getOAuth2Client, getOAuth2ClientPage } from "@/api/system/oauth2/oauth2Client";
import ImageUpload from '@/components/ImageUpload';
import Editor from '@/components/Editor';
import {CommonStatusEnum} from "@/utils/constants";
import FileUpload from "@/components/FileUpload";

export default {
  name: "SystemOAuth2Client",
  components: {
    FileUpload,
    ImageUpload,
    Editor,
  },
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
      // OAuth2 客户端列表
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
        status: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        clientId: [{ required: true, message: this.$t('common.oauth2Client.message.required.clientId'), trigger: "blur" }],
        secret: [{ required: true, message: this.$t('common.oauth2Client.message.required.secret'), trigger: "blur" }],
        name: [{ required: true, message: this.$t('common.oauth2Client.message.required.name'), trigger: "blur" }],
        logo: [{ required: true, message: this.$t('common.oauth2Client.message.required.logo'), trigger: "blur" }],
        status: [{ required: true, message: this.$t('common.oauth2Client.message.required.status'), trigger: "blur" }],
        accessTokenValiditySeconds: [{ required: true, message: this.$t('common.oauth2Client.message.required.accessTokenValidity'), trigger: "blur" }],
        refreshTokenValiditySeconds: [{ required: true, message: this.$t('common.oauth2Client.message.required.refreshTokenValidity'), trigger: "blur" }],
        redirectUris: [{ required: true, message: this.$t('common.oauth2Client.message.required.redirectUris'), trigger: "blur" }],
        authorizedGrantTypes: [{ required: true, message: this.$t('common.oauth2Client.message.required.authorizedGrantTypes'), trigger: "blur" }],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getOAuth2ClientPage(this.queryParams).then(response => {
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
        clientId: undefined,
        secret: undefined,
        name: undefined,
        logo: undefined,
        description: undefined,
        status: CommonStatusEnum.ENABLE,
        accessTokenValiditySeconds: 30 * 60,
        refreshTokenValiditySeconds: 30 * 24 * 60,
        redirectUris: [],
        authorizedGrantTypes: [],
        scopes: [],
        autoApproveScopes: [],
        authorities: [],
        resourceIds: [],
        additionalInformation: undefined,
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
      this.title = this.$t('common.oauth2Client.dialog.addTitle');
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id;
      getOAuth2Client(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = this.$t('common.oauth2Client.dialog.editTitle');
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
          updateOAuth2Client(this.form).then(response => {
            this.$modal.msgSuccess(this.$t('common.oauth2Client.message.success.update'));
            this.open = false;
            this.getList();
          });
          return;
        }
        // 添加的提交
        createOAuth2Client(this.form).then(response => {
          this.$modal.msgSuccess(this.$t('common.oauth2Client.message.success.add'));
          this.open = false;
          this.getList();
        });
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$confirm(this.$t('common.oauth2Client.message.confirm.delete', { clientId: row.clientId }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function() {
          return deleteOAuth2Client(id);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('common.oauth2Client.message.success.delete'));
        }).catch(() => {});
    }
  }
};
</script>
