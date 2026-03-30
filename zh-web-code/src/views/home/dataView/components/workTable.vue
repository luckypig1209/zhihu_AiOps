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
import { alarmList, faultShow } from "@/api/fault";

export default {
  name: "",
  components: {},
  data() {
    return {
      columns: [
        // {
        //   title: "客户名称",
        //   key: "customerName",
        //   align:'center',
        //   width: 180
        // },
        // {
        //   title: "项目名称",
        //   align:'center',
        //   key: "projectName",
        //   width: 180
        // },
        {
          title: "工单编号",
          align: "center",
          key: "orderSerialNo",
          width: 160
        },
        {
          title: "专线号",
          align: "center",
          key: "dealCode",
          width: 180
        },
        // {
        //   title: "专业类型",
        //   key: "specialtyName",
        //   width: 120
        // },
        {
          title: "工单类型",
          key: "orderType",
          align: "center",
          width: "140",
          ellipsis: true,
          tooltip: true,
          render: (h, params) => {
            return h(
              "span",
              params.row.orderType == "1" ? "自主监控" : params.row.orderType == "2" ? "客户申告" : "大网告警工单"
            );
          }
        },
        {
          title: "地市",
          key: "projectCity",
          align: "center",
          width: 100
        },
        {
          title: "障碍描述",
          key: "faultDescription",
          align: "center",
          minWidth: 180,
          ellipsis: true,
          tooltip: true
        },
        {
          title: "建单时间",
          key: "createOrderTime",
          align: "center",
          width: 190
        },
        {
          title: "工单状态",
          key: "status",
          align: "center",
          width: 120,
          render: (h, params) => {
            return h("span", params.row.status == "0" ? "在途" : "历史");
          }
        }
        // {
        //   title: "操作",
        //   key: "action",
        //   width: 120,
        //   fixed: "right",
        //   render: (h, params) => {
        //     let arr = [
        //       h(
        //         "Tooltip",
        //         {
        //           props: {
        //             placement: "top",
        //             transfer: true,
        //             content: "查看综调详情"
        //           }
        //         },
        //         [
        //           h(
        //             "span",
        //             {
        //               style: {
        //                 margin: "0 5px",
        //                 color: "#368DF9",
        //                 cursor: "pointer"
        //               },
        //               on: {
        //                 click: () => {
        //                   // this.goZD(params.row.billSn);
        //                   this.detail(params.row)
        //                 }
        //               }
        //             },
        //             "详情"
        //           )
        //         ]
        //       )
        //     ];
        //     if (String(params.row.status) === "0") {
        //       arr.push(
        //         h(
        //           "Tooltip",
        //           {
        //             props: {
        //               placement: "top",
        //               transfer: true,
        //               content: "查看进度"
        //             }
        //           },
        //           [
        //             h(
        //               "span",
        //               {
        //                 style: {
        //                   margin: "0 5px",
        //                   color: "#368DF9",
        //                   cursor: "pointer"
        //                 },
        //                 on: {
        //                   click: () => {
        //                     this.screenShow = true;
        //                     this.timer = setTimeout(() => {
        //                       this.screenShow = false;
        //                       this.$router.push({
        //                         name: "faultShowDetail",
        //                         query: {
        //                           pid: params.row.billSn,
        //                           city: params.row.city
        //                         }
        //                       });
        //                       clearTimeout(this.timer);
        //                       this.timer = null;
        //                     }, 300);
        //                   }
        //                 }
        //               },
        //               "进度"
        //             )
        //           ]
        //         )
        //       );
        //     }
        //     // if (
        //     //   params.row.dealCode === "华泰证券云桌面项目" ||
        //     //   params.row.specialtyName.toUpperCase() === "ICT"
        //     // ) {
        //     //   arr.push(
        //     //     h(
        //     //       "Tooltip",
        //     //       {
        //     //         props: {
        //     //           placement: "top",
        //     //           transfer: true,
        //     //           content: "发起评估",
        //     //         },
        //     //       },
        //     //       [
        //     //         h(
        //     //           "span",
        //     //           {
        //     //             style: {
        //     //               margin: "0 5px",
        //     //               color: "#368DF9",
        //     //               cursor: "pointer",
        //     //             },
        //     //             on: {
        //     //               click: () => {
        //     //                 this.rateForm.itemName = params.row.dealCode;
        //     //                 this.rateForm.orderTime = params.row.createTime;
        //     //                 this.rateForm.billSn = params.row.billSn;
        //     //                 this.getModalInfo(params.row.billSn);
        //     //                 this.getPartnerNameList(params.row.dealCode);
        //     //                 this.rateModal = true;
        //     //               },
        //     //             },
        //     //           },
        //     //           "评估"
        //     //         ),
        //     //       ]
        //     //     )
        //     //   );
        //     // }
        //     return h("div", arr);
        //   }
        // }
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
      faultShow(data)
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
