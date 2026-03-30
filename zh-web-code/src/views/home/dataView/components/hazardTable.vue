<template>
  <Card>
    <Table :columns="columns" :data="dataList" :loading="tableLoad">
      <template slot-scope="{ row }" slot="hiddenDangerSource">
        <div>
          {{sourceList[row.hiddenDangerSource]}}
        </div>
      </template>
      <template slot-scope="{ row }" slot="hiddenDangerStatus">
        <div>
          {{statusList[row.hiddenDangerStatus]}}
        </div>
      </template>
      <template slot-scope="{ row }" slot="hiddenDangerLevel">
        <div>
          {{levelList[row.hiddenDangerLevel]}}
        </div>
      </template>
      <template slot-scope="{ row }" slot="pitfallLife">
        <div class="step">
          <div
            class="item"
            v-for="item in row.pitfallLifeStatus"
            :key="item.name"
            :style="{ display: item.show ? 'flex' : 'none' }"
          >
            <Tooltip :content="item.name" placement="top" transfer>
              <div class="itemBlock"></div>
            </Tooltip>
          </div>
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
import {alarmList} from "@/api/fault";
import {hazardList, hazardListDelete, processCancel} from "@/api/hazard";

export default {
  name: "",
  components: {},
  data() {
    return {
      columns: [
        // {
        //   type: "selection",
        //   width: 60,
        //   align: "center"
        // },
        {
          title: "隐患名称",
          key: "hiddenDangerName",
          align: "center",
          minWidth: 150
        },
        {
          title: "隐患所属项目",
          key: "projectName",
          align: "center",
          minWidth: 180
        },
        {
          title: "隐患来源",
          key: "hiddenDangerSource",
          align: "center",
          minWidth: 120,
          // slot:'hiddenDangerSource'
        },
        {
          title: "隐患级别",
          key: "hiddenDangerLevel",
          align: "center",
          minWidth: 100,
          // slot:'hiddenDangerLevel'
        },
        {
          title: "隐患状态",
          key: "hiddenDangerStatus",
          align: "center",
          minWidth: 120,
          slot:'hiddenDangerStatus'
        },
        {
          title: "工单编号",
          key: "processInstanceId",
          align: "center",
          tooltip:'true',
          minWidth: 300,
        },
        {
          title: "预计整改期限",
          key: "rectificationTime",
          minWidth: 200,
          align: "center",
        },
        {
          title: "创建人",
          key: "creator",
          align: "center",
          minWidth: 120,
        },
        {
          title: "隐患创建时间",
          key: "createTime",
          align: "center",
          minWidth: 180,
        },
        {
          title: "整改完成时间",
          key: "rectificationCompletTime",
          align: "center",
          minWidth: 180,
        },
        {
          title: "整改耗时",
          key: "rectificationTimeStr",
          align: "center",
          minWidth: 160,
        },
      ],
      sourceList:{
        1:'故障',
        2:'日常巡检',
        3:'应急演练',
        4:'自主排查',
        5:'其他',
      },
      statusList:{
        1:'草稿',
        2:'待审核',
        3:'待整治',
        4:'待确认',
        5:'已完结',
      },
      levelList:{
        1:'普通',
        2:'重要',
      },
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
      hazardList(data)
        .then((res) => {
          console.log(res, "告警数量");
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
