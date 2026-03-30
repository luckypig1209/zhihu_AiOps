/**
 * 工作台视图-我的合作方评估-统计弹窗
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
  <Modal v-model="show" :title="showTitle" class-name="modal-center" :footer-hide="true" width="960">
    <Table :columns="columns" :data="dataList" :loading="tableLoad"></Table>
    <div style="text-align: right; width: 100%">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        style="padding: 10px"
      ></Page>
    </div>
  </Modal>
</template>

<script>
// import { getZhzzTokenFormalt, netWorkingPreviewIntransitDis } from "@/api/zhzz";
// import { taskDetailList } from "@/api/home";
// import { encryptDes, decryptByDES } from "@/libs/encryptionAndDecryption";
// import md5 from "js-md5";
export default {
  name: "",
  components: {},
  data() {
    return {
      show: false,
      showTitle: "",
      columns: [
        {
          title: "客户名称",
          key: "customerName",
          width: 180
        },
        {
          title: "工单编号",
          key: "billSn",
          width: 160
        },
        {
          title: "专线号",
          key: "dealCode",
          width: 240
        },
        {
          title: "专业类型",
          key: "specialtyName",
          width: 120
        },
        {
          title: "地市",
          key: "city",
          width: 100
        },
        {
          title: "障碍描述",
          key: "createInfo",
          minWidth: 360,
          ellipsis: true,
          tooltip: true
        },
        {
          title: "建单时间",
          key: "createTime",
          width: 190
        },
        {
          title: "工单状态",
          key: "STATUS",
          width: 120,
          render: (h, params) => {
            return h("span", params.row.STATUS == "0" ? "在途" : "历史");
          }
        },
        {
          title: "操作",
          key: "action",
          width: 120,
          fixed: "right",
          render: (h, params) => {
            let arr = [
              h(
                "Tooltip",
                {
                  props: {
                    placement: "top",
                    transfer: true,
                    content: "查看综调详情"
                  }
                },
                [
                  h(
                    "span",
                    {
                      style: {
                        margin: "0 5px",
                        color: "#368DF9",
                        cursor: "pointer"
                      },
                      on: {
                        click: () => {
                          this.goZD(params.row.billSn);
                        }
                      }
                    },
                    "详情"
                  )
                ]
              )
            ];
            if (String(params.row.STATUS) === "0") {
              arr.push(
                h(
                  "Tooltip",
                  {
                    props: {
                      placement: "top",
                      transfer: true,
                      content: "查看进度"
                    }
                  },
                  [
                    h(
                      "span",
                      {
                        style: {
                          margin: "0 5px",
                          color: "#368DF9",
                          cursor: "pointer"
                        },
                        on: {
                          click: () => {
                            this.screenShow = true;
                            this.timer = setTimeout(() => {
                              this.screenShow = false;
                              this.$router.push({
                                name: "faultShowDetail",
                                query: {
                                  pid: params.row.billSn,
                                  city: params.row.city
                                }
                              });
                              clearTimeout(this.timer);
                              this.timer = null;
                            }, 300);
                          }
                        }
                      },
                      "进度"
                    )
                  ]
                )
              );
            }
            return h("div", arr);
          }
        }
      ],
      dataList: [],
      tableLoad: false,
      page: { total: 0, pageSize: 5, current: 1 },
      itemData: {},
      partnerCode: "",
      satisfaction: ""
    };
  },
  computed: {},
  watch: {
    show(val) {
      if (val) {
        this.getList();
      } else {
        this.page = { total: 0, pageSize: 5, current: 1 };
        this.dataList = [];
      }
    }
  },
  methods: {
    getAuthority() {
      if (sessionStorage.getItem("zhzzUserInfo")) {
        return;
      }
      let data = {
        sysCode: "cqt",
        code: this.$store.getters.userName
        // userName: "qianchao"
      };
      getZhzzTokenFormalt(data)
        .then((res) => {
          if (res.data.success) {
            // sessionStorage.setItem("zhzzToken", md5(res.data.detail.token + "_star"));
            // sessionStorage.setItem("zhzzUserName", res.data.detail.userName);
            // sessionStorage.setItem("userId", res.data.detail.userId);
            let obj = {
              token: md5(res.data.detail.token + "_star"),
              userName: res.data.detail.userName,
              userId: res.data.detail.userId,
              city: res.data.detail.city
            };
            sessionStorage.setItem("zhzzUserInfo", JSON.stringify(obj));
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    getList() {
      this.tableLoad = true;
      let data = {
        params: { partnerCode: this.partnerCode, satisfaction: this.satisfaction },
        pageNum: this.page.current,
        pageSize: this.page.pageSize
      };
      taskDetailList(data)
        .then((res) => {
          if (res.data.code === 200) {
            this.dataList = res.data.data.list || [];
            this.page.total = Number(res.data.data.total || 0);
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
    goZD(id) {
      const data = {
        id
      };
      netWorkingPreviewIntransitDis(data)
        .then((res) => {
          const result = JSON.parse(decryptByDES(res.data));
          if (result.success) {
            const d = result.detail;
            // 用户单
            window.open(
              "http://132.228.169.145/ida40/module/sa/page/detail/billMainDetail.xhtml?billSn=" +
                data.id +
                "&operID=" +
                d.operID +
                "&argutsname=" +
                d.argutsname +
                "&hashCode=" +
                d.hashcode
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>
