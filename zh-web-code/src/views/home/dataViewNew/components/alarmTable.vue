<template>
  <Card>
    <Table :columns="columns" :data="dataList" :loading="tableLoad"></Table>
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

export default {
  name: "",
  components: {},
  data() {
    return {
      columns: [
        // {
        //   title: "客户名称",
        //   key: "customerName",
        //   width: 180
        // },
        // {
        //   title: "项目名称",
        //   key: "projectName",
        //   width: 180
        // },
        {
          title: "告警标题",
          key: "alarmTitle",
          width: 180
        },
        {
          title: "告警对象名称",
          key: "alarmObjectName",
          width: 180
        },
        {
          title: "设备名称",
          key: "devName",
          width: 180
        },
        {
          title: "设备IP",
          key: "devIp",
          width: 180
        },
        {
          title: "告警来源",
          key: "alarmSource",
          width: 120
        },
        {
          title: "告警类别",
          key: "alarmType",
          width: 120
        },
        {
          title: "告警级别",
          key: "alarmLevel",
          width: 140
        },
        {
          title: "告警内容",
          key: "alarmContent",
          minWidth: 280,
          tooltip: true,
          ellipsis: true
        },
        // {
        //   title: "是否操作",
        //   key: "isdeal",
        //   width: 120
        // },
        // {
        //   title: "故障单号",
        //   key: "orderserialno",
        //   width: 200
        // },
        {
          title: "告警时间",
          key: "createTime",
          width: 180
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
        messageType: "ADD",
        pageNo: this.page.current,
        pageSize: this.page.pageSize
      };
      alarmList(data)
        .then((res) => {
          console.log(res, "告警数量");
          if (res.code === 0) {
            this.dataList = res.data.list || [];
            this.page.total = Number(res.data.total) || 0;
            // this.$emit("success", this.page.total);

            this.$bus.$emit("changeAlarmCount", this.page.total);
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
