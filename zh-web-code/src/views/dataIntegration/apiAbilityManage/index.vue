/**
 * 监控运维-派单规则
 * @router ruleList
 * @autor zz
 * @date 2024/03/28
 */
<template>
  <div class="app-container">
    <el-form ref="seForm" :model="seForm" size="small" :inline="true" label-width="80px">
      <el-form-item label="API标识" prop="ruleId">
        <el-input v-model.trim="seForm.ruleId" placeholder="请输入API标识" maxlength="30" clearable></el-input>
      </el-form-item>
      <el-form-item label="API名称" prop="ruleName">
        <el-input v-model.trim="seForm.ruleName" placeholder="请输入API名称" maxlength="30" clearable></el-input>
      </el-form-item>
      <el-form-item label="能力类型" prop="switch">
        <el-select v-model="seForm.switch" clearable>
          <el-option value="0" label="数据库"></el-option>
          <el-option value="1" label="通用API"></el-option>
          <el-option value="2" label="脚本"></el-option>
          <el-option value="3" label="告警接口"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发布状态" prop="status">
        <el-select v-model="seForm.status" clearable>
          <el-option value="0" label="已发布"></el-option>
          <el-option value="1" label="未发布"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="margin-left: 6px">
        <el-button icon="el-icon-search" type="primary" @click="getSearch" size="small" :loading="tableLoad"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh-left" size="small" @click="getReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button icon="el-icon-plus" type="primary" size="small" @click="handleAdd">新增</el-button>
    <el-table style="margin-top: 15px" :data="dataList" v-loading="tableLoad">
      <template slot="empty">
        <div class="no-data">
          <img src="../../../assets/images/table-empty.png" alt="" />
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column prop="ruleId" align="center" label="API标识" min-width="180"></el-table-column>
      <el-table-column prop="ruleName" align="center" label="API名称" min-width="250"></el-table-column>
      <el-table-column prop="switch" align="center" label="能力类型" min-width="100"></el-table-column>
      <el-table-column prop="process" align="center" label="外部URL" min-width="180"></el-table-column>
      <el-table-column prop="creator" align="center" label="发布状态" min-width="100"></el-table-column>
      <el-table-column prop="creator" align="center" label="创建人" min-width="100"></el-table-column>
      <el-table-column align="center" label="操作" width="120">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div style="text-align: right; width: 100%">
      <pagination
        :total="page.total"
        :limit.sync="page.pageSize"
        :page.sync="page.current"
        @pagination="getList"
        v-show="page.total > 0"
        style="padding: 10px"
      ></pagination>
    </div>
    <edit-modal ref="editModal" :rowData="rowData" @success="getSearch"></edit-modal>
  </div>
</template>

<script>
export default {
  name: "",
  components: {
    editModal: () => import("./components/editModal")
  },
  data() {
    return {
      seForm: {
        ruleId: "",
        ruleName: "",
        switch: ""
      },
      dataList: [
        { ruleId: "dsdfs1", ruleName: "测试规则", level: "0", switch: "0", process: "11111111", creator: "222" },
        { ruleId: "dfdsdd", ruleName: "测试规则", level: "1", switch: "1", process: "11111111111", creator: "222" }
      ],
      tableLoad: false,
      page: { total: 0, pageSize: 10, current: 1 },
      rowData: {}
    };
  },
  computed: {},
  created() {},
  mounted() {
    // this.getSearch();
  },
  methods: {
    getSearch() {
      this.page.current = 1;
      this.seResult = this.seForm;
      this.getList();
    },
    getReset() {
      this.page.current = 1;
      this.$refs["seForm"].resetFields();
      this.getSearch();
    },
    getList() {
      this.tableLoad = true;
      let data = {
        pageNo: this.page.current,
        pageSize: this.page.pageSize,
        ...this.seForm
      };
      alarmList(data)
        .then((res) => {
          if (res.code === 0) {
            this.dataList = res.data.list || [];
            this.page.total = Number(res.data.total);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    changePageSize(val) {
      this.page.current = 1;
      this.page.pageSize = val;
      this.getList();
    },
    handleAdd() {
      this.rowData = {};
      this.$refs.editModal.showModal = true;
    },
    handleEdit(row) {
      this.rowData = row;
      this.$refs.editModal.showModal = true;
    },
    handleDel(row) {}
  },
  beforeDestroy() {}
};
</script>
<style lang="less" scoped>
.app-container {
  height: 100%;
  padding: 20px;
}
</style>
