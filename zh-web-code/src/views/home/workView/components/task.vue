/**
 * 工作台视图-工作项-合作方评估
 * @router index
 * @autor zm
 * @date 2023/03/22
 */
<template>
  <div>
    <Table :columns="columns" :data="dataList" :loading="tableLoad"></Table>
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
    <!--    <estimate-info-->
    <!--      ref="infoRef"-->
    <!--      :itemData="itemData"-->
    <!--      :templateList="templateList"-->
    <!--      @success="refreshHistory"-->
    <!--    ></estimate-info>-->
    <!--    <estimate-history-->
    <!--      ref="history"-->
    <!--      :itemData="itemData"-->
    <!--      @openEdit="openEditModal"-->
    <!--      @openDetail="openDetailModal"-->
    <!--    ></estimate-history>-->
    <!--    <detail-modal :itemData="itemData" ref="detail"> </detail-modal>-->
  </div>
</template>

<script>
// import estimateInfo from "@/views/partnerEvaluation/periodicityTask/components/estimate-info.vue";
// import estimateHistory from "@/views/partnerEvaluation/periodicityTask/components/estimate-history.vue";
// import detailModal from "@/views/partnerEvaluation/periodicityTask/components/detailModal";
// import { workTaskList } from "@/api/home";
// import { templateAllList } from "@/api/cooperate";
export default {
  name: "",
  // components: { estimateInfo, estimateHistory, detailModal },
  data() {
    return {
      dataList: [],
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
          title: "合作方名称",
          key: "partnerName",
          minWidth: 160,
          ellipsis: true,
          tooltip: true
        },
        {
          title: "合同名称",
          key: "contractName",
          minWidth: 160,
          ellipsis: true,
          tooltip: true
        },
        {
          title: "评估状态",
          key: "recordStatus",
          width: 100
        },
        {
          title: "操作",
          key: "key",
          width: 140,
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: {
                    color: "#1c5fb3",
                    cursor: "pointer",
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.itemData = params.row;
                      this.$refs.history.showModal = true;
                    }
                  }
                },
                "历史评估"
              ),
              h(
                "span",
                {
                  style: {
                    color: "#1c5fb3",
                    cursor: "pointer"
                  },
                  on: {
                    click: () => {
                      this.itemData = params.row;
                      this.$refs.infoRef.modalTitle = "发起评估";
                      this.$refs.infoRef.show = true;
                    }
                  }
                },
                "发起评估"
              )
            ]);
          }
        }
      ],
      page: { total: 0, pageSize: 5, current: 1 },
      itemData: {},
      templateList: []
    };
  },
  computed: {},
  methods: {
    getList() {
      this.tableLoad = true;
      let data = { pageNum: this.page.current, pageSize: this.page.pageSize };
      workTaskList(data)
        .then((res) => {
          console.log(res, "评估");
          if (res.data.code === 200) {
            this.dataList = res.data.data.list || [];
            this.page.total = Number(res.data.data.total) || 0;
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
    getTemplete() {
      let data = {
        params: {
          templateName: ""
        }
      };
      templateAllList(data)
        .then((res) => {
          console.log(res);
          if (res.data.code === 200) {
            this.templateList = res.data.data || [];
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    openEditModal(data) {
      console.log(data);
      this.itemData = data;
      this.$refs.infoRef.modalTitle = "编辑";
      this.$refs.infoRef.show = true;
    },
    openDetailModal(data) {
      console.log(data);
      this.itemData = data;
      this.$refs.detail.show = true;
    },
    refreshHistory() {
      this.getList();
      this.$refs.history.getList();
    }
  },
  created() {
    this.getList();
    this.getTemplete();
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>
