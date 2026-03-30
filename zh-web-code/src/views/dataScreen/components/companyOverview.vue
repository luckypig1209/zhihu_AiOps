<template>
  <div class="resource-overview">
    <div class="title">
      <div class="title-name">告警设备Top5</div>
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
import { getDeviceTop } from "@/api/screen";
export default {
  props: {},
  data() {
    return {
      showFlag: false,
    };
  },
  watch: {},
  computed: {},
  methods: {
    initEchartMap() {
      getDeviceTop({}).then((res) => {
        if (res.code == 0) {
          if (res.data && res.data.length > 0) {
            this.showFlag = true;
          }
          let xData = [];
          let yData = [];

          res.data.forEach((element) => {
            yData.unshift(element.alarmCount);
            xData.unshift(element.assetName);
          });
          let options = {
            // backgroundColor: "#1b2a3e", // 设置背景颜色
            tooltip: {
              trigger: "axis", // 触发类型为坐标轴
              axisPointer: {
                type: "shadow", // 阴影指示器
              },
              formatter: function (params) {
                // params是一个数组，包含当前tooltip要显示的数据
                var result = params[0].name + "<br/>"; // 显示Y轴的完整名称
                params.forEach(function (item) {
                  result += item.seriesName + ": " + item.value + "<br/>";
                });
                return result;
              },
            },
            grid: {
              left: "2%", // 调整图表距离左边的距离，可以是像素值或百分比
              right: "10%", // 如果需要的话，也可以设置右边距
              bottom: "15%", // 设置下边距
              top: "10%", // 设置上边距
              containLabel: true, // 确保grid区域包含坐标轴标签
            },
            xAxis: {
              type: "value",
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
            yAxis: {
              type: "category",
              boundaryGap: [0, 0],
              data: xData,
              axisLabel: {
                color: "#fff", // y轴标签颜色
                fontSize: 14,
                // 自定义标签格式化
                formatter: function (value) {
                  // 如果字符串长度大于4，则截取前4个字符并加...
                  if (value.length > 8) {
                    return value.substring(0, 8) + "...";
                  }
                  return value;
                },
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
            },
            series: [
              {
                name: "数量",
                type: "bar",
                barWidth: "40%", // 条形宽度
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: "#0095ff" }, // 蓝色渐变开始
                    { offset: 1, color: "#005aff" }, // 蓝色渐变结束
                  ]),
                },
                data: yData,
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
    //新的数据
    initEchartMapData() {
      this.showFlag = true;
      let options = {
        // backgroundColor: "#1b2a3e", // 设置背景颜色
        tooltip: {},
        grid: {
          left: "10%", // 调整图表距离左边的距离，可以是像素值或百分比
          right: "10%", // 如果需要的话，也可以设置右边距
          bottom: "10%", // 设置下边距
          top: "10%", // 设置上边距
          containLabel: true, // 确保grid区域包含坐标轴标签
        },
        xAxis: {
          type: "value",
          axisLabel: {
            color: "#fff", // x轴标签颜色,
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
        yAxis: {
          type: "category",
          boundaryGap: [0, 0],
          data: ["应用和业务", "物联网", "存储设备", "服务器", "网络设备"],
          axisLabel: {
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
        },
        series: [
          {
            name: "数量",
            type: "bar",
            barWidth: "40%", // 条形宽度
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: "#0095ff" }, // 蓝色渐变开始
                { offset: 1, color: "#005aff" }, // 蓝色渐变结束
              ]),
            },
            data: [32, 19, 8, 15, 27],
          },
        ],
      };

      this.mapChart = echarts.init(this.$refs.rateChart, null, {
        width: "auto", // 自动宽度
        height: "auto", // 自动高度
      });
      this.mapChart.setOption(options);
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
  width: 500px;
  height: 306px;
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
    display: flex;
    align-items: center;
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
  .rateChart {
    width: 500px;
    height: 300px;
  }
}
</style>
