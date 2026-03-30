<template>
  <Card>
    <Table :columns="columns" :data="dataList" :loading="tableLoad">
      <template slot-scope="{ row }" slot="projectSource">
        <div>
          {{ row.projectSource == 1 ? "集团政企项目管理系统" : row.projectSource == 0 ? "人工录入" : "" }}
        </div>
      </template>
    </Table>
    <div style="text-align: right; width: 100%">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        style="padding: 10px"
        placement="top"
      ></Page>
    </div>
  </Card>
</template>

<script>
import { alarmList } from "@/api/fault";
import { hazardList, hazardListDelete, processCancel } from "@/api/hazard";
import { queryProjectByLogin } from "@/api/projectManage/projectWorkers";

export default {
  name: "",
  components: {},
  data() {
    return {
      columns: [
        {
          title: "地市",
          key: "projectCity",
          align: "center",
          minWidth: 150
        },
        // {
        //   title: "客户名称",
        //   key: "custName",
        //   align: "center",
        //   tooltip:'true',
        //   minWidth: 180
        // },
        // {
        //   title: "项目名称",
        //   key: "projectName",
        //   align: "center",
        //   tooltip:'true',
        //   minWidth: 140,
        // },
        {
          title: "项目编号",
          key: "projectNo",
          align: "center",
          minWidth: 150
        },
        {
          title: "客户经理",
          key: "customerManager",
          align: "center",
          minWidth: 120
        },
        {
          title: "项目经理",
          key: "projectManager",
          align: "center",
          tooltip: "true",
          minWidth: 300
        },
        {
          title: "转售后时间",
          key: "handoverTime",
          minWidth: 200,
          align: "center"
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 120
        },
        {
          title: "项目资料来源",
          key: "projectSource",
          align: "center",
          slot: "projectSource",
          minWidth: 180
        }
      ],
      dataList: [],
      tableLoad: false,
      page: { total: 0, pageSize: 5, current: 1 }
    };
  },
  computed: {},
  methods: {
    getList() {
      this.tableLoad = true;
      let data = {
        pageNo: this.page.current,
        pageSize: this.page.pageSize
      };
      queryProjectByLogin(data)
        .then((res) => {
          if (res.code === 0) {
            this.dataList = res.data.list || [];
            this.page.total = Number(res.data.total) || 0;
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
    }
  },
  created() {
    this.getList();
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
.ivu-card {
  min-height: 100%;
}
</style>
