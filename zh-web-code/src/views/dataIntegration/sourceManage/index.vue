/**
 * 监控运维-派单规则
 * @router ruleList
 * @autor zz
 * @date 2024/03/29
 */
<template>
  <div class="app-container">
    <el-form ref="seForm" :model="seForm" size="small" :inline="true" label-width="100px">
      <el-form-item label="数据源名称" prop="sourceName">
        <el-input v-model.trim="seForm.sourceName" placeholder="请输入数据源名称" maxlength="30" clearable></el-input>
      </el-form-item>
      <el-form-item style="margin-left: 6px">
        <el-button icon="el-icon-search" type="primary" @click="getSearch" size="small" :loading="tableLoad"
          >搜索</el-button
        >

        <el-button icon="el-icon-plus" type="primary" size="small" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table style="margin-top: 15px" :data="dataList" v-loading="tableLoad">
      <template slot="empty">
        <div class="no-data">
          <img src="../../../assets/images/table-empty.png" alt="" />
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column prop="sourceId" align="center" label="数据源编码" min-width="180"></el-table-column>
      <el-table-column prop="sourceName" align="center" label="数据源名称" min-width="250"></el-table-column>
      <el-table-column prop="type" align="center" label="类型" min-width="100"></el-table-column>
      <el-table-column prop="process" align="center" label="权限" min-width="180"></el-table-column>
      <el-table-column prop="remark" align="center" label="备注" min-width="100"></el-table-column>
      <el-table-column align="center" label="操作" width="160">
        <template slot-scope="scope">
          <el-button type="text" @click="handleEdit(scope.row)">测试连接</el-button>
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
        { sourceId: "dsdfs1", sourceName: "测试规则", type: "0", process: "11111111", remark: "222" },
        { sourceId: "dfdsdd", sourceName: "测试规则", type: "1", process: "11111111111", remark: "222" }
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
