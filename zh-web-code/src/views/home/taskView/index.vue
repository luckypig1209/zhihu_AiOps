/**
 * 工作台视图-我的合作方评估
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
  <Card style="border-radius: 24px">
    <div class="itemTitle">
      <span>我的合作方</span>
      <div style="margin-right: 4px"><router-link :to="{ name: 'partnerManage' }">全部</router-link></div>
    </div>
    <div class="custom-list">
      <div class="item" v-for="(item, index) in dataList" :key="item.partnerCode + index" :class="{ on: item.show }">
        <div class="name">
          <div class="img"><img :src="require('@/assets/images/icon09.png')" /></div>
          <Tooltip :content="item.partnerName">
            <span class="overflow" @click="changeList(index)">{{ item.partnerName }}</span>
          </Tooltip>
<!--          <Icon type="md-arrow-dropleft" size="26" :class="{ on: item.show }" />-->
        </div>
        <transition name="slide-right">
          <div class="list" v-show="item.show">
            <!-- <span v-for="(it, i) in item.list" :key="it.itemName + i">{{ it.itemName }} {{ it.num }}</span> -->
            <span @click="openGdModal(item.partnerCode || '0', '', '故障工单', item.obsTotal || '0')"
              >故障工单数：{{ item.obsTotal || "0" }}</span
            ><span @click="openGdModal(item.partnerCode || '0', '0', '满意工单', item.imTotal || '0')"
              >满意工单数：{{ item.imTotal || "0" }}</span
            ><span @click="openGdModal(item.partnerCode || '0', '1', '不满意工单', item.noTotal || '0')"
              >不满意工单数：{{ item.noTotal || "0" }}</span
            ><span @click="openCountModal(item)">周期性评估次数：{{ item.assessCount || "0" }}</span
            ><span>周期性评估均分：{{ item.avgScore || "0" }}</span>
          </div>
        </transition>
      </div>
      <Spin size="large" fix v-if="spinShow"></Spin>
      <div style="text-align: center" v-if="!spinShow && dataList.length == '0'">暂无数据</div>
    </div>
    <!-- <div style="text-align: right; width: 100%" v-if="page.total > 0">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        size="small"
        style="padding: 10px"
      ></Page>
    </div> -->
    <list-modal ref="listModal"></list-modal>
<!--    <count-modal ref="countModal" :itemData="itemData" @openDetail="openDetailModal"></count-modal>-->
<!--    <detail-modal :itemData="itemDetailData" ref="detail"> </detail-modal>-->
  </Card>
</template>

<script>
// import { taskList } from "@/api/home";
// import { cycleTaskList } from "@/api/partnerEvaluation";
import listModal from "./components/listModal.vue";
import {getPartnerList} from "@/api/login";
// import countModal from "@/views/partnerEvaluation/taskStatistics/components/taskNumber.vue";
// import detailModal from "@/views/partnerEvaluation/periodicityTask/components/detailModal.vue";
export default {
  name: "",
// , countModal, detailModal
components: { listModal},
  data() {
    return {
      dataList: [],
      page: { total: 0, pageSize: 3, current: 1 },
      spinShow: false,
      itemData: {},
      itemDetailData: {}
    };
  },
  computed: {},
  methods: {
    async changeList(index) {
      let data = {
        params: {
          partnerName: this.dataList[index].partnerName,
          startTime: "",
          endTime: ""
        },
        pageNum: this.page.current,
        pageSize: this.page.pageSize
      };
      await cycleTaskList(data)
        .then((res) => {
          console.log(res);
          if (res.data.code === 200) {
            let arr = res.data.data.list || [];
            if (arr.length > 0) {
              this.$set(this.dataList, index, {
                ...this.dataList[index],
                assessCount: arr[0].assessCount,
                avgScore: arr[0].avgScore
              });
              console.log(this.dataList[index].show);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
      this.dataList.forEach((el, i) => {
        if (i == index) {
          this.$set(this.dataList, i, { ...el, show: !this.dataList[i].show });
        } else {
          this.$set(this.dataList, i, { ...el, show: false });
        }
      });
    },
    getList() {
      let data = { pageNum: this.page.current, pageSize: 2 };
      this.spinShow = true;
      getPartnerList()
        .then((res) => {
          console.log(res, "我的合作方评估");
          if (res.code === 0) {
            let d = []
            if (res.data&&res.data.length > 3){
              d = res.data.slice(0,3) || [];
            }else{
              d = res.data || [];
            }
            this.dataList = d.map((el) => {
              return { ...el, show: false };
            });
            this.page.total = Number(res.data.total || 0);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.spinShow = false;
        });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    openGdModal(name, value, title, num) {
      if (num == "0") {
        this.$Message.warning("暂无数据！");
        return;
      }
      this.$refs.listModal.showTitle = title;
      this.$refs.listModal.partnerCode = name;
      this.$refs.listModal.satisfaction = value;
      this.$refs.listModal.show = true;
    },
    openCountModal(item) {
      if (!item.assessCount || item.assessCount == "0") {
        this.$Message.warning("暂无数据！");
        return;
      }
      this.itemData = { partnerId: item.id, projectId: "", projectName: "" };
      this.$refs.countModal.show = true;
    },
    openDetailModal(data) {
      console.log(data);
      this.itemDetailData = data;
      this.$refs.detail.show = true;
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
.custom-list {
  margin-top: 15px;
  position: relative;
  min-height: 217px;
  .item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #eaedf3;
    &.on {
      background: #e5f2ff;
      .name {
        .img {
          background: #fff;
        }
      }
    }
    .name {
      display: flex;
      height: 30px;
      line-height: 30px;
      .img {
        width: 30px;
        height: 30px;
        background: #e5f2ff;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 17px;
          height: auto;
        }
      }
      .overflow {
        width: 140px;
        margin: 0 4px 0 12px;
        height: 24px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        font-size: 14px;
        font-weight: 600;
        color: #4a4a4a;
        cursor: pointer;
      }
      .ivu-icon {
        color: #999;
        transition: transform 0.2s ease-in-out;
        &.on {
          transform: rotate(180deg);
          color: #4d9af9;
        }
      }
    }
    .list {
      display: flex;
      flex-wrap: wrap;
      span {
        font-size: 14px;
        font-weight: 400;
        color: #666;
        margin-right: 10px;
        padding: 5px 0;
        line-height: 20px;
        cursor: pointer;
        &:last-child {
          cursor: auto;
        }
      }
    }
  }
}
</style>
