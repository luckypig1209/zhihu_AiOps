/**
 * 工作台视图-统计
 * @router index
 * @autor zm
 * @date 2023/03/21
 */
<template>
  <div>
    <div class="con">
      <Card class="left-card" style="border-left: 2px solid rgb(245, 82, 92);">
        <div style="margin-left: 1vw;" @click="openModal(0, '告警', detail.alarmCount)">
          <div class="item">
            <div class="img"><img :src="require('@/assets/images/icon01.png')" /></div>
          </div>
          <div class="txt" style="display: flex;margin-top: 16px;">
              <p style="color: #f5525c;margin-top: -1px;" >{{ detail.alarmCount }}</p>
              <h3 style="margin-left: 8px;">告警</h3>
            </div>
        </div>
      </Card>
      <Card class="left-card" style="border-left: 2px solid rgb(38, 190, 243);">
        <div style="margin-left: 1vw;" @click="openModal(1, '工单', detail.workOrderCount)">
        <div class="item">
          <div class="img"><img :src="require('@/assets/images/icon02.png')" /></div>
        </div>
        <div class="txt" style="display: flex;margin-top: 16px;margin-left: -0.7vw;">
            <p style="color: #26bef3;margin-top: -1px;" >
              {{ detail.workOrderCount }}
            </p>
            <h3 style="margin-left: 8px;">故障单</h3>
          </div>
          </div>
      </Card>
      <Card class="left-card" style="border-left: 2px solid rgb(79, 91, 255);">
        <div style="margin-left: 1vw;" @click="openModal(2, '隐患', detail.hiddenDangerIdentificationCount)">
        <div class="item">
          <div class="img"><img :src="require('@/assets/images/icon03.png')" /></div>
        </div>
        <div class="txt" style="display: flex;margin-top: 16px;">
            <p style="color: #4f5bff;margin-top: -1px;" >
              {{ detail.hiddenDangerIdentificationCount }}
            </p>
            <h3 style="margin-left: 8px;">隐患</h3>
          </div>
          </div>
      </Card>
      <!-- <Card class="left-card">
        <div class="item">
          <div class="img"><img :src="require('@/assets/images/icon04.png')" /></div>
          <div class="txt">
            <p style="color: #ff903a" @click="openModal(3, '项目', detail.projectCount)">{{ detail.projectCount }}</p>
            <h3>项目</h3>
          </div>
        </div>

      </Card> -->
      <Card class="left-card" style="border-left: 2px solid rgb(255, 144, 58);">
        <div style="margin-left: 1vw;" @click="openModal(3, '服务计划', detail.projectCount)">
        <div class="item">
          <div class="img"><img :src="require('@/assets/images/icon04.png')" /></div>
        </div>
        <div class="txt" style="display: flex;margin-top: 16px;margin-left: -1.2vw;">
            <p style="color: #ff903a;margin-top: -1px;" >
              {{ detail.projectCount }}
            </p>
            <h3 style="margin-left: 8px;">服务计划</h3>
          </div>
          </div>
      </Card>
      <!-- <div class="item">
        <div class="img"><img :src="require('@/assets/cloud-screen/icon05.png')" /></div>
        <div class="txt">
          <p style="color: #10b56e" @click="openModal(4, '隐患', null)">0</p>
          <h3>隐患</h3>
        </div>
      </div> -->
      <!-- <div class="item">
        <div class="img"><img :src="require('@/assets/cloud-screen/icon06.png')" /></div>
        <div class="txt">
          <p style="color: #4880ff" @click="openModal(5, '割接', gjCount)">{{ gjCount }}</p>
          <h3>割接</h3>
        </div>
      </div> -->
    </div>
    <Modal v-model="show" :title="showTitle" class-name="modal-center" :footer-hide="true" width="960">
      <alarm-table v-if="tableList[0]" :seShow="false" :noCard="true" @success="updateAlarmCount"></alarm-table>
      <workTable v-if="tableList[1]" :orderT="2" :seShow="false" :noCard="true"></workTable>
      <hazardTable v-if="tableList[2]" :seShow="false" :noCard="true"></hazardTable>
      <projectTable v-if="tableList[3]" :seShow="false" :noCard="true"></projectTable>
      <!--      <el-table v-if="tableList[3]" :data="yjDataList">-->
      <!--        <el-table-column label="项目名称" align="center" prop="projectName" />-->
      <!--        <el-table-column label="预警标签" align="center" prop="typeEnum" />-->
      <!--        <el-table-column label="预警来源" align="center" prop="source" />-->
      <!--        <el-table-column label="预警描述" align="center" prop="busiContent" />-->
      <!--        <el-table-column label="预警发现时间" align="center" prop="occurTime" />-->
      <!--        <el-table-column label="预警发现人" align="center" prop="creator" />-->
      <!--      </el-table>-->
      <!--      <div style="text-align: right; width: 100%">-->
      <!--        <Page-->
      <!--          v-if="tableList[3]"-->
      <!--          :total="page.total"-->
      <!--          :page-size="page.pageSize"-->
      <!--          :current="page.current"-->
      <!--          @on-change="changePage"-->
      <!--          @on-page-size-change="changePageSize"-->
      <!--          show-total-->
      <!--          show-sizer-->
      <!--          show-elevator-->
      <!--          style="padding: 10px"-->
      <!--        ></Page>-->
      <!--      </div>-->
      <!--      <gj-table v-if="tableList[5]" :seShow="false" :noCard="true"></gj-table>-->
    </Modal>
    <Modal v-model="yjShow" :title="yjTitle" class-name="modal-center" :footer-hide="true" width="960">
      <!--      <yj-gll v-if="yjTableList[0]" :seShow="false" :noCard="true"></yj-gll>-->
      <!--      <yj-gs v-if="yjTableList[1]" :seShow="false" :noCard="true"></yj-gs>-->
      <!--      <yj-cf v-if="yjTableList[2]" :seShow="false" :noCard="true"></yj-cf>-->
      <!--      <yj-ping v-if="yjTableList[3]" :seShow="false" :noCard="true"></yj-ping>-->
      <!--      <yj-yjjc v-if="yjTableList[4]" :seShow="false" :noCard="true"></yj-yjjc>-->
    </Modal>
  </div>
</template>

<script>
// import { dataCount } from '@/api/home';
import alarmTable from "./components/alarmTable.vue";
import { getFourCount, getAlarm, getErrorSheet, getSchedule, getHiddenTrouble } from "@/api/login";
import { opportunityList } from "@/api/myCustomer";
// import sgTable from '@/views/faultControl/faultShow/list'; // 割接
// import zbTable from '@/views/partnerEvaluation/safeguard/index.vue'; // 重保
// import gjTable from '@/views/partnerEvaluation/riskOperation/index.vue'; // 割接
// import yjGll from '@/views/serviceWarning/highFlow/index.vue'; // 高流量预警
// import yjGs from '@/views/serviceWarning/lightWane/index.vue'; // 光衰预警
// import yjCf from '@/views/serviceWarning/repeat/index.vue'; // 重复告警
// import yjPing from '@/views/serviceWarning/pingTest/index.vue'; // PING监测
// import yjYjjc from '@/views/serviceWarning/oneKeyCheck/index.vue'; // 一键检测
export default {
  name: "",
  // , sgTable, zbTable, gjTable, yjGll, yjGs, yjCf, yjPing, yjYjjc
  components: {
    alarmTable,
    hazardTable: () => import("./components/hazardTable"),
    workTable: () => import("./components/workTable"),
    projectTable: () => import("./components/projectTable")
  },
  data() {
    return {
      alarmCount: "-", // 告警总数
      gjCount: "-", // 割接总数
      detail: {
        alarmCount: "",
        workOrderCount: "-", // 工单总数
        projectCount: "-", //项目总数
        gjTotal: "-", // 割接
        hiddenDangerIdentificationCount: "-" // 隐患
      },
      tableList: [false, false, false, false, false, false],
      currentTable: "",
      show: false,
      showTitle: "",
      yjTitle: "",
      yjShow: false,
      yjTableList: [false, false, false, false, false],
      yjDataList: [],
      currentYj: "",
      yjColumns: [
        {
          title: "高流量预警",
          key: "highTotal",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#368DF9",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.openYjModal(params, params.row.highTotal);
                  }
                }
              },
              params.row.highTotal
            );
          }
        },
        {
          title: "光衰预警",
          key: "gsTotal",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#368DF9",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.openYjModal(params, params.row.gsTotal);
                  }
                }
              },
              params.row.gsTotal
            );
          }
        },
        {
          title: "重复告警",
          key: "reApplyTotal",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#368DF9",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.openYjModal(params, params.row.reApplyTotal);
                  }
                }
              },
              params.row.reApplyTotal
            );
          }
        },
        {
          title: "PING监测",
          key: "pingTotal",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#368DF9",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.openYjModal(params, params.row.pingTotal);
                  }
                }
              },
              params.row.pingTotal
            );
          }
        },
        {
          title: "一键检测",
          key: "yyjcTotal",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#368DF9",
                  cursor: "pointer"
                },
                on: {
                  click: () => {
                    this.openYjModal(params, params.row.yyjcTotal);
                  }
                }
              },
              params.row.yyjcTotal
            );
          }
        }
      ],
      page: { total: 0, pageSize: 10, current: 1 }
    };
  },
  computed: {},
  watch: {
    show(val) {
      if (!val) {
        this.$set(this.tableList, this.currentTable, false);
      } else {
        this.$set(this.tableList, this.currentTable, true);
      }
    },
    yjShow(val) {
      if (!val) {
        this.$set(this.yjTableList, this.currentYj, false);
      } else {
        this.$set(this.yjTableList, this.currentYj, true);
      }
    }
  },
  methods: {
    getDetail() {
      getAlarm()
        .then((res) => {
          // 告警数
          if (res.code === 0) {
            this.detail.alarmCount = res.data.total || 0;
          } else {
            this.detail.alarmCount = 0;
          }
        })
        .catch((_) => {
          this.detail.alarmCount = 0;
        });
      getErrorSheet()
        .then((res) => {
          // 故障工单
          if (res.code === 0) {
            this.detail.workOrderCount = res.data || 0;
          } else {
            this.detail.workOrderCount = 0;
          }
        })
        .catch((_) => {
          this.detail.workOrderCount = 0;
        });
      getHiddenTrouble({ hiddenDangerStatus: "" })
        .then((res) => {
          // 隐患数
          if (res.code === 0) {
            this.detail.hiddenDangerIdentificationCount = res.data.total || 0;
          } else {
            this.detail.hiddenDangerIdentificationCount = 0;
          }
        })
        .catch((_) => {
          this.detail.hiddenDangerIdentificationCount = 0;
        });
      getSchedule()
        .then((res) => {
          // 服务计划
          if (res.code === 0) {
            this.detail.projectCount = res.data.total || 0;
          } else {
            this.detail.projectCount = 0;
          }
        })
        .catch((_) => {
          this.detail.projectCount = 0;
        });
      // getFourCount({}).then((res) => {
      //   if (res.code === 0) {
      //     this.detail = res.data || {};
      //   }
      // });
    },
    // 打开详情面板
    openModal(index, title, value) {
      // if (!value || value === '-' || value === '0') {
      //   this.$Message.warning('暂无数据！');
      //   return;
      // }
      // this.show = true
      // this.currentTable = index
      // this.showTitle = title
      // '/faultManage/faultShow'————————故障工单原页面
      // 430版本暂时将故障单跳转目的地址定为告警页面，后续会改造告警页面
      const menus = []
       this.$store.state.user.menus.forEach(item=>{
          menus.push(...item.children)
      })
      const toMenus = ['alarmShow','faultShow','hazardList','servicePlan']
      if(menus.some(item=>item.path ==toMenus[index])){
        const routeArr = [
          "/faultManage/alarmShow",
          "/faultManage/faultShow",
          "/hazardManagement/hazardList",
          "/service/servicePlan"
        ];
        const paramArr = [null, "orderStatus", "status", "activeName"];
        const valueArr = [null, "操作中", "2", "todo"];
        const targetUrl = routeArr[index];
        const query = {};
        if (paramArr[index]) {
          query[paramArr[index]] = valueArr[index];
        }
        this.$router.push({
          path: targetUrl,
          query
        });
      }else{
        this.$Message.warning('暂无权限！')
      }

    },
    // 预警
    openYjModal(params, count) {
      if (!count || count === "-" || count === "0") {
        this.$Message.warning("暂无数据！");
        return;
      }
      this.yjTitle = params.column.title;
      this.currentYj = params.column._index;
      this.yjShow = true;
    },
    // getAlarmCount() {
    //   let data = { params: { messageType: 'ADD', generateAuthorized: 'true' }, pageNum: 1, pageSize: 5 };
    //   this.$http
    //     .post(window.BACKSTAGE + '/api/alarm/alarmViewShowPage', data)
    //     .then((res) => {
    //       if (res.data.code === 200) {
    //         this.alarmCount = res.data.data.total;
    //       }
    //     })
    // },
    updateAlarmCount(num) {
      this.alarmCount = num;
    },
    getGjCount() {
      let data = {
        pageNo: this.page.current, // 当前页
        pageSize: this.page.pageSize, // 每页显示记录数
        busiType: "服务危机"
      };
      opportunityList(data).then((res) => {
        if (res.code === 0) {
          this.yjDataList = res.data.list;
          this.page.total = Number(res.data.total);
        }
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
    }
  },
  created() {
    this.getDetail();
    // this.getAlarmCount();
    this.getGjCount();
    // this.$bus.$on('changeAlarmCount', (num) => {
    //   this.updateAlarmCount(num);
    // });
  }
};
</script>

<style scoped lang="less">
.con {
  display: flex;
  .left-card {
    flex: 1;
    height: 114px;
    margin: 0 8px;
    /deep/.ivu-card-body {
      height: 114px;
    }
  }
  .item {
    flex: 1;
    // margin: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .img {
      width: 52px;
      height: 52px;
      img {
        width: 100%;
        height: auto;
      }
    }
    .txt {
      display: flex;
      align-items: center;
      flex: 1;
      p {
        font-size: 26px;

        font-weight: 600;
        margin-bottom: 8px;
        color: #333;
        cursor: pointer;
      }
      h3 {
        font-size: 14px;
        font-weight: 500;
        color: #1e2e41;
      }
    }
  }
}
</style>
