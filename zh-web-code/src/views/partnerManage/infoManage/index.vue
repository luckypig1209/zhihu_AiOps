<template>
  <div class="app-container">
    <div class="searchArea">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
        <el-form-item :label="'合作方名称'" prop="partnerName">
          <el-input v-model="queryParams.partnerName" maxlength="30" placeholder="请输入合作方名称"/>
        </el-form-item>
        <el-form-item :label="'合作方编码'" prop="partnerCode">
          <el-input v-model="queryParams.partnerCode" maxlength="30" placeholder="请输入合作方编码"/>
        </el-form-item>
        <el-form-item :label="'合作方电话'" prop="partnerTelephone">
          <el-input v-model="queryParams.partnerTelephone" maxlength="20" placeholder="请输入合作方电话"/>
        </el-form-item>
        <el-form-item :label="'合作方法人'" prop="partnerLegalPerson">
          <el-input v-model="queryParams.partnerLegalPerson" maxlength="10" placeholder="请输入合作方法人"/>
        </el-form-item>
        <el-form-item style="margin-left: 6px;">
          <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" @click="handleCreateOrEditItem('add')">新增</el-button>
      </el-col>  
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="queryLoading" :data="partnerList">
      <template slot="empty">
        <div class="no-data">
          <img src="../../../assets/images/table-empty.png" alt="">
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column label="合作方名称" align="center" prop="partnerName" />
      <el-table-column label="合作方编码" align="center" prop="partnerCode" />
      <el-table-column label="合作方地址" align="center" prop="partnerAddress" />
      <el-table-column label="合作方电话" align="center" prop="partnerTelephone" />
      <el-table-column label="合作方法人" align="center" prop="partnerLegalPerson" />
      <el-table-column label="合作方营业执照" width="180px" align="center" prop="partnerLicense" />
      <el-table-column label="合作方组织机构代码" align="center" prop="partnerNodeCode" />
      <el-table-column label="合作方税号" align="center" prop="partnerDuty" />
      <el-table-column label="操作" width="200px" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleCreateOrEditItem('edit', scope.row)">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleCreateOrEditItem('delete', scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList"/>
    <partner-info
      @refreshList="handleSearch"
      ref="partnerInfoRef"
      :showDetailFlag="showDetailFlag"
    ></partner-info>
  </div>
</template>

<script>
import { getPartnerPage, deletePartner } from "@/api/partnerManage";
import partnerInfo from "./components/partner-info";
export default {
  name: "collaborators",
  data() {
    return {
      queryLoading: false,
      queryParams: {
        pageSize: 10,
        pageNo: 1,
        partnerName: undefined,
        partnerCode: undefined,
        partnerTelephone: undefined,
        partnerLegalPerson: undefined
      },
      showSearch: true,
      deptSearchForm: {},
      form: {},
      partnerList: [],
      total: 0,
      showDetailFlag: false,
      reset: {},
    };
  },
  components: {
    partnerInfo,
  },
  methods: {
     /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      console.log(this.queryParams);
      this.handleQuery();
    },
    init() {
      this.getList();
    },
    handleSearch() {
      this.pagepageNo = 1;
      this.pageSize = 10;
      this.getList();
    },
    // handleReset() {
    //   this.queryParams = {};
    //   this.pagepageNo = 1;
    //   this.pageSize = 10;
    //   this.getList();
    // },
    showDetail(id) {
      this.$refs.partnerInfoRef.init(id);
      this.$refs.partnerInfoRef.showModal = true;
      this.showDetailFlag = true;
    },
    async handleCreateOrEditItem(val, params) {
      this.showDetailFlag = false;
      if (val === "add") {
        this.$refs.partnerInfoRef.showModal = true;
        // this.$nextTick(() => {
        this.$refs.partnerInfoRef.init();
        // })
      } else if (val === "edit") {
        this.$refs.partnerInfoRef.showModal = true;
        // this.$nextTick(() => {
        this.$refs.partnerInfoRef.init(params);
        // })
      } else {
         this.$modal
        .confirm('是否确认删除?')
        .then(function () {
          return deletePartner({id: params.id})
        }).then(()=> {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
      }
    },
    getList() {
      this.queryLoading = true;
      getPartnerPage(this.queryParams).then(res=> {
        this.queryLoading = false;
        this.partnerList = res.data.list || [];
        this.total = Number(res.data.total);
      }).catch(error =>{
        this.queryLoading = false;
      })
    },
    selectChange(node) {
      this.deptId = node[0] ? node[0].id : null;
      this.getList();
    },
  },
  created() {
    this.init();
  },
};
</script>
