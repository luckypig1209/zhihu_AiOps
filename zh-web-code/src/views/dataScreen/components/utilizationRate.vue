<template>
  <div class="resource-overview">
    <div class="title">
      <div class="title-name">实时利用率</div>
      <div
        v-if="dataList && dataList.length > 0"
        style="display: flex; justify-content: space-between"
      >
        <div class="content" v-for="(item, index) in dataList" :key="index">
          <div :class="item.imgClass">
            <rateChart
              style="position: relative; left: 15px; top: 15px"
              :name="item.title"
              :percent="item.percent"
              :colorStart="item.colorStart"
              :colorEnd="item.colorEnd"
            ></rateChart>
            <div class="content-value">
              <VueCountUp
                v-if="showNum"
                :key="item.value"
                :delay="allCountDuration"
                :options="{
                  ...options,
                  decimalPlaces: getDecimalPlaces(item.value),
                }"
                :endVal="item.value"
              />
              <!-- {{ item.value }} -->
              {{ item.unit }}
            </div>
          </div>
          <div class="content-title">{{ item.title }}</div>
          <div class="title-bottom"></div>
        </div>
      </div>
      <div v-else style="margin-top: 20px" class="noData">
        <div class="no-img"></div>
        <div>暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProvincialDataList } from "@/api/screen";
import rateChart from "./rateChart.vue";
export default {
  components: { rateChart },
  props: {},
  data() {
    return {
      showNum: false,
      allCountDuration: 2,
      options: {
        useEasing: true, // 使用缓和
        useGrouping: false, // 使用分组(是否显示千位分隔符,一般为 true)
        separator: ",", // 分隔器(千位分隔符,默认为',')
        decimal: ".", // 十进制(小数点符号,默认为 '.')
        //decimalPlaces:2, // 小数位数(默认为 '0')
        prefix: "", // 字首(数字的前缀,根据需要可设为 $,¥,￥ 等)
        suffix: "", // 后缀(数字的后缀 ,根据需要可设为 元,个,美元 等)
      },
      dataList: [
        // {
        //   title: "CPU利用率",
        //   value: 200,
        //   unit: "核",
        //   percent: 78,
        //   colorStart: "#50D1FF26",
        //   colorEnd: "#50D1FF",
        //   imgClass: "content-img-cpu",
        // },
        // {
        //   title: "内存利用率",
        //   value: 1817,
        //   unit: "TB",
        //   percent: 61,
        //   colorStart: "#50D1FF26",
        //   colorEnd: "#50D1FF",
        //   imgClass: "content-img-store",
        // },
        // {
        //   title: "存储利用率",
        //   value: 17626,
        //   unit: "TB",
        //   percent: 51,
        //   colorStart: "#60DEA226",
        //   colorEnd: "#5BE3B0",
        //   imgClass: "content-img-memory",
        // },
      ],
      colorList: [
        {
          colorEnd: "#50D1FF26",
          colorStart: "#50D1FF",
          imgClass: "content-img-cpu",
        },
        {
          colorEnd: "#50D1FF26",
          colorStart: "#50D1FF",
          imgClass: "content-img-store",
        },
        {
          colorEnd: "#60DEA226",
          colorStart: "#5BE3B0",
          imgClass: "content-img-memory",
        },
      ],
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
    getRealTimeRate() {
      getProvincialDataList({
        province: "江苏",
        pageNo: "1",
        category: 0,
        pageSize: "10",
      }).then((res) => {
        if (res.code == 0) {
          this.dataList = [];
          let count = 0;
          res.data.list.forEach((element, index) => {
            if (
              element.category == "存储" ||
              element.category == "内存" ||
              element.category == "CPU"
            ) {
              this.dataList.push({
                title: element.category + "利用率",
                value: element.number,
                unit: element.unit,
                percent: parseInt(element.resourcesUtilization),
                imgClass: this.colorList[count].imgClass,
                colorStart: this.colorList[count].colorStart,
                colorEnd: this.colorList[count].colorEnd,
              });
              count++;
            }
          });
        }
      });
    },
  },
  created() {},
  mounted() {
    this.getRealTimeRate();
    setTimeout(() => {
      this.showNum = true;
    }, 1500);
  },
};
</script>
<style lang="scss" scoped>
.resource-overview {
  width: 500px;
  height: 226px;
  padding: 0 30px;
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
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    .content-img-cpu {
      width: 128px;
      height: 128px;
      background-image: url("../../../assets/images/dataScreen/CPURate.png");
      background-size: 100% 100%;
    }
    .content-img-store {
      width: 128px;
      height: 128px;
      background-image: url("../../../assets/images/dataScreen/storeRate.png");
      background-size: 100% 100%;
    }
    .content-img-memory {
      width: 128px;
      height: 128px;
      background-image: url("../../../assets/images/dataScreen/memoryRate.png");
      background-size: 100% 100%;
    }
    .content-value {
      font-family: SourceHanSansCN-Medium;
      font-weight: 500;
      font-size: 15px;
      color: #ffffff;
      text-align: center;
      position: relative;
      bottom: 8px;
    }
    .content-title {
      font-family: PingFangSC-Medium;
      font-weight: 500;
      font-size: 14px;
      color: #ffffff;
      text-align: center;
      text-shadow: 0 0 10px #1ec6ffcc;
      margin-top: 12px;
    }
    .title-bottom {
      width: 112px;
      height: 16px;
      margin-top: -8px;
      background-image: url("../../../assets/images/dataScreen/title-bottom.png");
      background-size: 100% 100%;
    }
  }
}
</style>
