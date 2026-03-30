<template>
  <div class="transaction-total">
    <div class="title">
      <div class="title-name">告警统计</div>
    </div>
    <div class="info-container">
      <diskPieChart
        :data-prop="dataCloudProp"
        :totalNum="totalNum"
        :typeNum="3"
      ></diskPieChart>
      <div class="list-container">
        <div class="container">
          <div class="item warning">
            <span>告警总数</span>
            <span>{{ totalCount }}</span>
          </div>
          <div class="item unprocessed">
            <span>未处理数</span>
            <span>{{ firingCount }}</span>
          </div>
        </div>

        <div class="info-list">
          <div
            v-show="dataCloudProp && dataCloudProp.length > 0"
            class="info"
            v-for="(item, index) in dataCloudProp"
            :key="index"
          >
            <!-- 内容 -->
            <div class="info-content">
              <div class="content-name">
                <span class="icon-circle"></span>
                <span class="item-name">{{ item.name }}</span>
              </div>
              <div class="content-num">
                <div class="num-value">
                  {{ item.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!dataCloudProp || dataCloudProp.length == 0" class="noData">
      <div class="no-img"></div>
      <div>暂无数据</div>
    </div>
  </div>
</template>

<script>
import { getSummary } from "@/api/screen";
import diskPieChart from "./showPieChart.vue";
export default {
  components: {
    diskPieChart,
  },
  props: {},
  data() {
    return {
      showNum: false,
      allCountDuration: 2,
      firingCount: 0,
      totalCount: 0,
      dataCloudProp: [
        { name: "紧急告警", value: 0 },
        { name: "重要告警", value: 0 },
        { name: "次要告警", value: 0 },
        { name: "提示告警", value: 0 },
      ],
      totalNum: 0,
      options: {
        useEasing: true, // 使用缓和
        useGrouping: false, // 使用分组(是否显示千位分隔符,一般为 true)
        separator: ",", // 分隔器(千位分隔符,默认为',')
        decimal: ".", // 十进制(小数点符号,默认为 '.')
        //decimalPlaces:2, // 小数位数(默认为 '0')
        prefix: "", // 字首(数字的前缀,根据需要可设为 $,¥,￥ 等)
        suffix: "", // 后缀(数字的后缀 ,根据需要可设为 元,个,美元 等)
      },
    };
  },
  watch: {},
  computed: {},
  methods: {
    getDecimalPlaces(num) {
      if (!num) {
        return 0;
      }
      if (Number.isInteger(num)) {
        return null;
      }
      const decimalPart = num.toString().split(".")[1];
      return decimalPart ? decimalPart.length : null;
    },
    getSummary() {
      getSummary({}).then((res) => {
        if (res.code == 0) {
          this.firingCount = res.data.firingCount;
          this.totalCount = res.data.totalCount;
          this.dataCloudProp = Object.entries(res.data.priorityGroup).map(
            ([name, value]) => ({ name, value })
          );
          this.totalNum = this.dataCloudProp.reduce((acc, item) => {
            const value = typeof item.value === "number" ? item.value : 0;
            return acc + value;
          }, 0);
        }
      });
    },
  },
  created() {},
  mounted() {
    this.getSummary();
  },
};
</script>
<style lang="scss" scoped>
.transaction-total {
  width: 500px;
  height: 306px;
  background-image: url("../../../assets/images/dataScreen/module.png");
  background-size: 100% 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .title {
    width: 100%;
    height: 36px;
    background-image: url("../../../assets/images/dataScreen/module-title.png");
    background-size: 100% 100%;
    position: relative;
    display: flex;
    align-items: center;
    .date-range {
      position: absolute;
      right: 0;
      top: 2px;
      width: 48px;
      height: 22px;
      background-image: linear-gradient(0deg, #0085ff80 0%, #00a3ff00 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
    }
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
  .info-container {
    display: flex;
    .list-container {
      display: flex;
      flex-direction: column;
      .container {
        display: flex;
        justify-content: space-between;
      }

      .item {
        display: flex;
        // flex-direction: column;
        align-items: center;
        padding: 5px 10px;
        border-radius: 5px;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .warning {
        background-color: #00439f; /* 蓝色背景 */
        margin-left: 20px;
      }

      .unprocessed {
        background-color: #956609; /* 绿色背景 */
        margin-right: 30px;
      }
    }
    .info-list {
      flex: 1;
      width: 284px;
      display: flex;
      flex-wrap: wrap;
    }
  }
  .info {
    display: flex;
    width: 50%;
    align-items: center;
    margin-bottom: 22px;

    .info-content {
      display: flex;
      flex-direction: column;
      .content-name {
        font-weight: 400;
        font-size: 18px;
        color: #baccfb;
        line-height: 48px;
        margin-left: 8px;
        display: flex;
        align-items: center;
        .icon-circle {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: #de4f27;
          margin-right: 4px;
        }
      }

      .content-num {
        display: flex;
        // align-items: flex-end;
        flex-direction: column;
        align-items: center;
        .num-value {
          font-family: HarmonyOS_Sans_SC_Black;
          font-weight: 900;
          font-size: 20px;
          color: #e3f3fe;
        }
        .num-percent {
          padding-bottom: 4px;
          font-family: HarmonyOS_Sans_TC_Black;
          font-weight: 900;
          font-size: 14px;
          color: #f30300;
        }
        .num-percent_active {
          color: #18f300;
        }
      }

      .num-upFlag_active {
        background-image: url("../../../assets/images/dataScreen/up.png") !important;
      }
      .num-upFlag {
        width: 16px;
        height: 16px;
        background-size: 100% 100%;
        margin-top: 3px;
        margin-left: 4px;
        background-image: url("../../../assets/images/dataScreen/down.png");
      }
    }
  }
  .info:nth-child(2) {
    .icon-circle {
      background: #fba159 !important;
    }
  }
  .info:nth-child(3) {
    .icon-circle {
      background: #087ff7 !important;
    }
  }
  .info:nth-child(4) {
    .icon-circle {
      background: #81fbe3 !important;
    }
  }
}
</style>
