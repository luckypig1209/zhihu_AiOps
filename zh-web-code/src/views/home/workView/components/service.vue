/**
 * 工作台视图-工作项-主动服务任务
 * @router index
 * @autor zm
 * @date 2023/03/22
 */
<template>
  <div>
    <el-table :data="tableList" v-loading="tableLoad">
      <template slot="empty">
        <div class="no-data">
          <img style="width: 160px; height: 160px" src="../../../../assets/images/no-data.png" alt="" />
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column prop="custName" align="center" label="客户名称" width="200"></el-table-column>
      <el-table-column prop="projectName" align="center" label="项目名称" width="260"></el-table-column>
      <el-table-column prop="operateTypeName" align="center" label="服务计划类别" width="180"></el-table-column>
      <el-table-column prop="scheduleStatus" align="center" label="执行状态" width="240"></el-table-column>
    </el-table>
    <div style="text-align: right; width: 100%" v-if="page.total > 0">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        size="small"
      ></Page>
    </div>
    <Modal title="执行计划" width="900" v-model="carryoutShow">
      <!--      <carryout ref="carryout" @cancelCarryout="cancelCarryout" @carryoutSuccess="carryoutSuccess"></carryout>-->
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
// import Carryout from "@/views/InitiativePlan/components/carryout.vue";
export default {
  name: "",
  // components: { Carryout },
  data() {
    return {
      tableList: [],
      tableLoad: false,
      columns: [
        // {
        //   title: "客户名称",
        //   key: "custName",
        //   minWidth: 160,
        //   ellipsis: true,
        //   tooltip: true
        // },
        // {
        //   title: "项目名称",
        //   key: "projectName",
        //   minWidth: 160,
        //   ellipsis: true,
        //   tooltip: true
        // },
        {
          title: "服务计划类别",
          key: "operateTypeName",
          width: 120,
          ellipsis: true,
          tooltip: true
        },
        {
          title: "执行状态",
          key: "scheduleStatus",
          width: 90,
          render: (h, params) => {
            return h("div", [
              h("span", {
                style: {
                  backgroundColor: params.row.scheduleStatus === "已延期" ? "#ed4014" : "#ff9900",
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  marginRight: "5px",
                  borderRadius: "10px"
                }
              }),
              h(
                "span",
                {
                  style: {
                    color: params.row.scheduleStatus === "已延期" ? "#ed4014" : "#ff9900"
                  }
                },
                params.row.scheduleStatus
              )
            ]);
          }
        },
        {
          title: "操作",
          key: "action",
          width: 60,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: "#1c5fb3",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.handleCarryout(params.row);
                    }
                  }
                },
                "操作"
              )
            ]);
          }
        }
      ],
      page: { total: 0, pageSize: 5, current: 1 },
      carryoutShow: false
    };
  },
  computed: {},
  methods: {
    getList() {
      this.tableLoad = true;
      let data = {
        pageNum: this.page.current, // 当前页
        pageSize: this.page.pageSize, // 每页显示记录数
        params: {
          custName: "",
          projectName: "",
          operateTypeId: "",
          scheduleStartTime: "",
          scheduleEndTime: "",
          scheduleStatus: "",
          type: "1" //未完成，已延期
        }
      };
      this.$http.post(window.BACKSTAGE + "/api/operation/schedule/page", data).then((res) => {
        this.tableLoad = false;
        if (res.data.code === 200) {
          this.tableList = res.data.data.list;
          this.page.total = Number(res.data.data.total);
        }
      });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    // 执行
    handleCarryout(row) {
      this.$refs.carryout.init(row);
      this.carryoutShow = true;
    },
    cancelCarryout() {
      this.carryoutShow = false;
    },
    carryoutSuccess() {
      this.carryoutShow = false;
      this.getList();
    }
  },
  created() {
    // this.getList();
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
@import "../../../../styles/form.less";
</style>
