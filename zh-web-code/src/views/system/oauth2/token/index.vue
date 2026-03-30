<template>
  <div class="app-container">
    <!-- <doc-alert title="OAuth 2.0（SSO 单点登录)" url="https://doc.iocoder.cn/oauth2/" />
    <doc-alert title="用户体系" url="https://doc.iocoder.cn/user-center/" /> -->

    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="18px">
      <el-form-item  prop="userId">
        <el-input v-model="queryParams.userId" :placeholder="$t('common.oauth2Token.search.placeholder.userId')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="clientId">
        <el-input v-model="queryParams.clientId" :placeholder="$t('common.oauth2Token.search.placeholder.clientId')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="userType">
        <el-select v-model="queryParams.userType" :placeholder="$t('common.oauth2Token.search.placeholder.userType')" clearable>
          <el-option v-for="dict in this.getDictDatas(DICT_TYPE.USER_TYPE)"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.oauth2Token.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.oauth2Token.button.reset') }}</el-button>
      </el-form-item>

    </el-form>
    <el-table v-loading="loading" :data="list" style="width: 100%;">
      <el-table-column :label="$t('common.oauth2Token.table.accessToken')" align="center" prop="accessToken" width="300" />
      <el-table-column :label="$t('common.oauth2Token.table.refreshToken')" align="center" prop="refreshToken" width="300" />
      <el-table-column :label="$t('common.oauth2Token.table.userId')" align="center" prop="userId" />
      <el-table-column :label="$t('common.oauth2Token.table.userType')" align="center" prop="userType" width="100">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.USER_TYPE" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Token.table.createTime')" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Token.table.expiresTime')" align="center" prop="expiresTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.expiresTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.oauth2Token.table.operation')" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleForceLogout(scope.row)"
            v-hasPermi="['system:oauth2-token:delete']">{{ $t('common.oauth2Token.button.forceLogout') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>
  </div>
</template>

<script>
import { getAccessTokenPage, deleteAccessToken } from "@/api/system/oauth2/oauth2Token";

export default {
  name: "SystemTokenClient",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        userId: undefined,
        userType: undefined,
        clientId: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      getAccessTokenPage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 强退按钮操作 */
    handleForceLogout(row) {
      this.$confirm(this.$t('common.oauth2Token.message.confirm.forceLogout', { accessToken: row.accessToken }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function() {
          return deleteAccessToken(row.accessToken);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess(this.$t('common.oauth2Token.message.success.forceLogout'));
      }).catch(() => {});
    }
  }
};
</script>

