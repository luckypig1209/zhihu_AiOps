<template>
  <div class="resource-overview">
    <div class="title">
      <div class="title-name">资源告警总览</div>
    </div>
    <div v-show="showFlag" class="rateChart" ref="rateChart"></div>
    <div v-show="!showFlag" style="color: #fff" class="noData">
      <div class="no-img"></div>
      <div>暂无数据</div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { getSourceSummary } from "@/api/screen";
export default {
  props: {},
  data() {
    return {
      showFlag: false,
      chartData: {
        categories: [],
        barData: [],
        lineData: [],
      },
    };
  },
  watch: {},
  computed: {},
  methods: {
    initEchartMap() {
      getSourceSummary().then((res) => {
        if (res.code == 0) {
          if (res.data && res.data.length > 0) {
            this.showFlag = true;
          }
          let categories = [];
          let barData = [];
          let lineData = [];
          res.data.forEach((element) => {
            categories.push(element.assetModelName);
            barData.push(element.assetCount);
            lineData.push(element.alarmCount);
          });
          this.chartData = {
            categories: categories,
            barData: barData,
            lineData: lineData,
          };
          console.log("22222222,chartData", this.chartData);
          let options = {
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross",
              },
            },
            legend: {
              data: ["资源总数", "资源总告警数"],
              textStyle: {
                color: "##fff", // 设置图例文字颜色为红色
                fontSize: 14, // 字体大小
                fontWeight: "bold", // 字重
                fontFamily: "Arial", // 字体
              },
            },
            xAxis: [
              {
                type: "category",
                data: this.chartData.categories,
                axisLabel: {
                  color: "#fff", // x轴标签颜色,
                  fontSize: 14,
                },
                axisLine: {
                  show: true, // 显示坐标轴线（默认为true）
                  lineStyle: {
                    color: "#082C47", // 设置轴线颜色，例如白色
                    width: 2, // 设置轴线宽度，单位是像素
                    // 可选：设置线的类型，如 'solid'（实线）、'dashed'（虚线）、'dotted'（点线）
                    type: "solid",
                  },
                },
                splitLine: {
                  show: false, // 显示坐标轴线
                  lineStyle: {
                    color: "#082C47", // 设置坐标轴线颜色（例如白色）
                    width: 3, // 设置坐标轴线宽度（单位：px）
                  },
                },
              },
            ],
            yAxis: [
              {
                type: "value",
                name: "",
                nameTextStyle: {
                  color: "#fff", // 名称颜色（例如：红色）
                  fontSize: 16, // 字号
                  fontWeight: "bold", // 字重
                  fontFamily: "Arial", // 字体
                },
                position: "left",
                axisLine: {
                  lineStyle: {
                    color: "#999",
                  },
                },
                axisLabel: {
                  formatter: "{value}",
                  color: "#fff", // y轴标签颜色
                  fontSize: 12,
                },
                axisLine: {
                  lineStyle: {
                    color: "#fff", // y轴线颜色
                  },
                },
                axisLine: {
                  show: true, // 显示坐标轴线（默认为true）
                  lineStyle: {
                    color: "#082C47", // 设置轴线颜色，例如白色
                    width: 2, // 设置轴线宽度，单位是像素
                    // 可选：设置线的类型，如 'solid'（实线）、'dashed'（虚线）、'dotted'（点线）
                    type: "solid",
                  },
                },
                splitLine: {
                  show: false, // 显示坐标轴线
                  lineStyle: {
                    color: "#082C47", // 设置坐标轴线颜色（例如白色）
                    width: 3, // 设置坐标轴线宽度（单位：px）
                  },
                },
              },
              {
                type: "value",
                name: "",
                position: "right",
                nameTextStyle: {
                  color: "#fff", // 名称颜色（例如：红色）
                  fontSize: 16, // 字号
                  fontWeight: "bold", // 字重
                  fontFamily: "Arial", // 字体
                },
                axisLabel: {
                  formatter: "{value}",
                  formatter: "{value}",
                  color: "#fff", // y轴标签颜色
                  fontSize: 12,
                },
                axisLine: {
                  show: true, // 显示坐标轴线（默认为true）
                  lineStyle: {
                    color: "#082C47", // 设置轴线颜色，例如白色
                    width: 2, // 设置轴线宽度，单位是像素
                    // 可选：设置线的类型，如 'solid'（实线）、'dashed'（虚线）、'dotted'（点线）
                    type: "solid",
                  },
                },
                splitLine: {
                  show: false, // 显示坐标轴线
                  lineStyle: {
                    color: "#082C47", // 设置坐标轴线颜色（例如白色）
                    width: 3, // 设置坐标轴线宽度（单位：px）
                  },
                },
              },
            ],
            series: [
              {
                name: "资源总数",
                nameTextStyle: {
                  color: "#fff",
                },
                type: "bar",
                data: this.chartData.barData,
                // data: [1,2,34,44,5],
                barWidth: "36%", // 设置柱子宽度为分类间隔的60%
                itemStyle: {
                  color: "#5470c6",
                },
              },
              {
                name: "资源总告警数",
                nameTextStyle: {
                  color: "#fff",
                },
                type: "line",
                yAxisIndex: 1,
                data: this.chartData.lineData,
                itemStyle: {
                  color: "#d48265",
                },
              },
            ],
          };

          this.mapChart = echarts.init(this.$refs.rateChart, null, {
            width: "auto", // 自动宽度
            height: "auto", // 自动高度
          });
          this.mapChart.setOption(options);
        }
      });
    },
  },
  created() {},
  mounted() {
    this.initEchartMap();
  },
};
</script>
<style lang="scss" scoped>
.resource-overview {
  width: 100%;
  height: 313px;
  background-image: url("../../../assets/images/dataScreen/module-long.png");
  background-size: 100% 100%;
  display: flex;
  flex-wrap: wrap;
  .title {
    width: 100%;
    height: 36px;
    background-image: url("../../../assets/images/dataScreen/module-title.png");
    background-size: 100% 100%;
    position: relative;
    display: flex;
    align-items: center;
    .title-name {
      font-family: AlibabaPuHuiTi_3_105_Heavy;
      font-weight: 900;
      font-size: 20px;
      color: #ffffff;
      padding-left: 56px;
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
  .rateChart {
    width: 900px;
    height: 300px;
  }
}
</style>
