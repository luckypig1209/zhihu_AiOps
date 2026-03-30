<template>
  <div class="transaction-total">
    <div class="title">
      <div class="title-name">热门资源池排名</div>
      <div class="hot_resource_ranking">
        <div class="table_box">
          <div class="table_item_box_header">
            <div
              v-for="(item, index) in tableColums"
              :key="index"
              class="table_header_item"
              :style="`width:${item.width};text-align: ${item.align};padding: ${item.padding};`"
            >
              {{ item.title }}
            </div>
          </div>
          <div
            v-for="(item, index) in companyOverviewList"
            :key="item.id"
            class="table_item_box"
          >
            <div class="progress_box_tanking">
              <div
                class="progress_top_icon"
                :class="'progress_top_icon' + (index + 1)"
              ></div>
            </div>
            <div class="progress_box_company">
              <div class="progress_box_company_name">{{ item.label }}</div>
            </div>
            <div class="progress_box_amount">{{ item.value + "次" }}</div>
            <div
              class="progress_box_percentage"
              :class="{ progress_box_percentage_down: index > 2 }"
            >
              <div class="percentage_text">
                {{ Math.abs(item.percentage) + "%" }}
              </div>
              <div class="percentage_icon"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSourcePoolSummary } from "@/api/screen";
import { get } from "sortablejs";
export default {
  components: {},
  props: {},
  data() {
    return {
      /* 头部tab签数据 */
      tabList: [
        {
          id: "1",
          name: "CPU",
        },
        {
          id: "2",
          name: "内存",
        },
        {
          id: "3",
          name: "存储",
        },
      ],
      /* 当前选中的tab签 */
      tabModel: "1",
      tableColums: [
        {
          title: "排名",
          width: "96px",
          align: "left",
          padding: "0 0 0 22px",
        },
        {
          title: "资源池",
          width: "228px",
          align: "left",
        },
        {
          title: "调度次数",
          width: "56px",
          align: "right",
        },
      ],
      companyOverviewList: [
        // {
        //   id: "1",
        //   label: "通用计算-天翼云-内蒙古",
        //   value: 4300,
        //   percentage: 6.02,
        // },
        // {
        //   id: "2",
        //   label: "通用计算-天翼云-贵州",
        //   value: 2288,
        //   percentage: 190.23,
        // },
        // {
        //   id: "3",
        //   label: "通用计算-天翼云-广州",
        //   value: 2100,
        //   percentage: 8.15,
        // },
        // {
        //   id: "4",
        //   label: "通用计算-天翼云-湖南",
        //   value: 1080,
        //   percentage: -4.3,
        // },
        // {
        //   id: "5",
        //   label: "通用计算-天翼云-河北",
        //   value: 960,
        //   percentage: -1.16,
        // },
      ],
      total: 13000,
    };
  },
  watch: {},
  computed: {},
  methods: {
    /* 点击tab签的回调 */
    handleTab(id) {
      if (this.tabModel === id) {
        return;
      } else {
        this.tabModel = id;
      }
    },
    getData() {
      getSourcePoolSummary().then((res) => {
        if (res.code == 0) {
          this.companyOverviewList = [];
          res.data.forEach((element, index) => {
            this.companyOverviewList.push({
              id: index + 1,
              label: element.name,
              value: element.scheduleTimes,
              percentage: parseFloat(element.rate),
            });
          });
        }
      });
    },
  },
  created() {},
  mounted() {
    this.getData();
  },
};
</script>
<style lang="scss" scoped>
.transaction-total {
  width: 500px;
  height: 290px;
  padding: 0 14px 0 10px;
  background-image: url("../../../assets/images/dataScreen/module.png");
  background-size: 100% 100%;
  display: flex;
  flex-wrap: wrap;
  .title {
    width: 100%;
    height: 36px;
    background-image: url("../../../assets/images/dataScreen/module-title.png");
    background-size: 100% 100%;
    position: relative;
    .title-name {
      font-family: AlibabaPuHuiTi_3_105_Heavy;
      font-weight: 900;
      font-size: 20px;
      color: #ffffff;
      padding-left: 36px;
      /* 设置渐变色背景 */
      background: -webkit-linear-gradient(left, #fff 0%, #90deff 100%);
      background: linear-gradient(to bottom, #fff 0%, #90deff 100%);
      /* 应用背景裁剪 */
      -webkit-background-clip: text;
      background-clip: text;
      /* 设置文字颜色为透明，以便显示背景色（即渐变色） */
      color: transparent;
      /* 确保文字不被裁剪溢出 */
      display: inline;
    }
  }
}
.hot_resource_ranking {
  margin-top: 14px;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  .table_box {
    width: 100%;
    .table_item_box_header {
      width: 100%;
      height: 36px;
      margin-bottom: 4px;
      background-image: linear-gradient(
        90deg,
        rgba(1, 17, 38, 0.45) 2%,
        rgba(24, 142, 255, 0.45) 53%,
        rgba(1, 17, 38, 0.45) 100%
      );
      display: flex;
      display: flex;
      .table_header_item {
        height: 100%;
        font-weight: 600;
        font-size: 14px;
        background: linear-gradient(180deg, #eeeeee 20%, #71b1e0 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        letter-spacing: 0;
        line-height: 32px;
      }
    }
    .table_item_box {
      width: 100%;
      height: 36px;
      display: flex;
      align-items: center;
      &:nth-of-type(2n-1) {
        background: rgba($color: #1d4e8c, $alpha: 0.13);
      }
      .progress_box_tanking {
        width: 96px;
        display: flex;
        padding: 0 0 0 22px;
        .progress_top_icon {
          width: 32px;
          height: 11px;
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
        .progress_top_icon1 {
          background-image: url("../../../assets/images/dataScreen/hotResourceRanking_top1.png");
        }
        .progress_top_icon2 {
          background-image: url("../../../assets/images/dataScreen/hotResourceRanking_top2.png");
        }
        .progress_top_icon3 {
          background-image: url("../../../assets/images/dataScreen/hotResourceRanking_top3.png");
        }
        .progress_top_icon4 {
          background-image: url("../../../assets/images/dataScreen/hotResourceRanking_top4.png");
        }
        .progress_top_icon5 {
          background-image: url("../../../assets/images/dataScreen/hotResourceRanking_top5.png");
        }
      }
    }
  }
}
.progress_box_company {
  width: 228px;
  height: 100%;
  .progress_box_company_name {
    width: 100%;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    line-height: 36px;
  }
}
.progress_box_amount {
  width: 56px;
  text-align: right;
  font-weight: 700;
  font-size: 14px;
  color: #e2edfa;
  line-height: 36px;
}
.progress_box_percentage {
  display: flex;
  align-items: center;
  justify-content: end;
  width: 92px;
  .percentage_text {
    color: #0bcd56;
    font-size: 14px;
    width: 52px;
    text-align: right;
  }
  .percentage_icon {
    padding-left: 2px;
    width: 16px;
    height: 16px;
    background-image: url("../../../assets/images/dataScreen/hotResourceRanking_up.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }
}
.progress_box_percentage_down {
  .percentage_text {
    color: #cd240b;
  }
  .percentage_icon {
    background-image: url("../../../assets/images/dataScreen/hotResourceRanking_down.png");
  }
}
</style>
