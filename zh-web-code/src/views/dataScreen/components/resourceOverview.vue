<template>
  <div class="resource-overview">
    <div class="title">
      <div class="title-name">资源总览</div>
      <div class="content" v-for="(item, index) in dataList" :key="index">
        <!-- 文字 -->
        <div class="content-title">
          <div class="title-info">
            {{ item.title }}
            <div class="title-light"></div>
          </div>
          <div class="title-value" :style="{ color: item.color }">
            {{ item.value }}{{ item.unit }}
          </div>
        </div>
        <resourceChart
          :name="item.title"
          :value="item.value"
          :max="item.max"
          :color="item.color"
          :colorStart="item.colorStart"
          :colorEnd="item.colorEnd"
        ></resourceChart>
      </div>
    </div>
  </div>
</template>

<script>
import { getResource, getSummary } from "@/api/screen";
import resourceChart from "./resourceChart.vue";
export default {
  components: { resourceChart },
  props: {},
  data() {
    return {
      cpuMax: "",
      storeMax: "",
      memoryMax: "",
      dataListAll: [],
      dataList: [
        // {
        //   title: "CPU/GPU总量",
        //   value: 4200,
        //   unit: "核",
        //   max: 10000,
        //   color: "#3E97FD",
        //   colorStart: "#FDFFFF",
        //   colorEnd: "#0379FF",
        // },
        // {
        //   title: "内存总量",
        //   value: 6910,
        //   unit: "TB",
        //   max: 10000,
        //   color: "#4BD7C1",
        //   colorStart: "#B5E2E2",
        //   colorEnd: "#11F4EC",
        // },
        // {
        //   title: "存储总量",
        //   value: 3728,
        //   unit: "TB",
        //   max: 10000,
        //   color: "#4BD782",
        //   colorStart: "#FDFFFF",
        //   colorEnd: "#4BD782",
        // },
      ],
      maxList: [],
      colorList: [
        {
          color: "#3E97FD",
          colorStart: "#FDFFFF",
          colorEnd: "#0379FF",
        },
        {
          color: "#4BD7C1",
          colorStart: "#B5E2E2",
          colorEnd: "#11F4EC",
        },
        {
          color: "#4BD782",
          colorStart: "#FDFFFF",
          colorEnd: "#4BD782",
        },
      ],
    };
  },
  watch: {},
  computed: {},
  methods: {
    getSummary() {
      getSummary({}).then((res) => {
        if (res.code == 0) {
          this.dataListAll = res.data;
          this.dataListAll.forEach((item) => {
            if (item.type == 1) {
              item.details.forEach((item_) => {
                this.maxList.push(item_.count);
              });
            }
          });
          getResource().then((res) => {
            if (res.code == 0) {
              this.dataList = [];
              res.data.forEach((element, index) => {
                this.dataList.push({
                  title: element.type,
                  value: element.value,
                  unit: element.unit,
                  max: this.maxList[index],
                  color: this.colorList[index].color,
                  colorStart: this.colorList[index].colorStart,
                  colorEnd: this.colorList[index].colorEnd,
                });
              });
            }
          });
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
.resource-overview {
  width: 500px;
  height: 300px;
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
    .content-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      margin-bottom: 8px;
      .title-info {
        font-family: SourceHanSansCN-Medium;
        font-weight: 500;
        font-size: 15px;
        color: #ffffff;
        position: relative;
        .title-light {
          position: absolute;
          bottom: -6px;
          left: 12px;
          width: 100px;
          height: 15px;
          background-image: url("../../../assets/images/dataScreen/title-light.png");
          background-size: 100% 100%;
        }
      }
      .title-value {
        font-weight: 700;
        font-size: 16px;
        color: #3e97fd;
        text-align: right;
        line-height: 12px;
        position: relative;
        top: -4px;
      }
    }
  }
}
</style>
