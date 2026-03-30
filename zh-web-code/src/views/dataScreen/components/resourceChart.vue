<template>
  <div>
    <div class="chart-box" :style="{ 'border-color': color }">
      <div class="resourceChart" ref="resourceChart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  components: {},
  props: ["value",'name', "max", "color", "colorStart", "colorEnd"],
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {
    initEchartMap() {
      var data = [this.value]; //百分数
      var colorList = [];
      colorList[0] = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: this.colorStart },
        { offset: 1, color: this.colorEnd },
      ]);
      let backgroundColor = "rgba(0,0,0,1)";
      let chartdata = [[this.value], [this.name]];

      var getmydmc = chartdata[1]; //数据点名称
      var getmyd = chartdata[0]; //收入金额
      var getmydzd = [];

      let big = 200;
      getmyd.forEach((el) => {
        if (!(el === undefined || el === "")) {
          if (big < Number(el)) {
            big = Number(el);
          }
        }
      });
      for (let i = 0; i < getmyd.length; i++) {
        getmydzd.push(big * 4);
      }
      //计算最大值
      function calMax(arr) {
        let max = 0;
        arr.forEach((el) => {
          el.forEach((el1) => {
            if (!(el1 === undefined || el1 === "")) {
              if (max < Number(el1)) {
                max = Number(el1);
              }
            }
          });
        });
        let maxint = Math.ceil(max / 9.5);
        //不让最高的值超过最上面的刻度
        let maxval = maxint * 10;
        //让显示的刻度是整数
        return maxval;
      }

      var max = Math.ceil(calMax([getmyd]) / 10) * 10;
      let options = {
        animation: true, // 开启初始化动画
        animationDuration: 2000, // 动画时长，单位是毫秒
        animationEasing: "bounceOut", // 动画缓动效果
        backgroundColor: "transparent",
        grid: {
          left: "3%",
          right: "1%",
          bottom: "10%",
          top: "10%",
          containLabel: true,
        },
        // tooltip: {
        //   formatter: (params) => {
        //     if (params.name !== "") {
        //       return params.name + " : " + getmyd[params.dataIndex];
        //     }
        //   },
        //   textStyle: {
        //     align: "left",
        //   },
        // },
        xAxis: [
          {
            type: "value",
            axisLabel: {
              show: false,
              margin: 5,
              color: "#fff",
              formatter: function (val) {
                return val + "";
              },
              textStyle: {
                fontSize: "13",
              },
            },
            min: 0,
            max: this.max, // 计算最大值
            interval: max / 5, //  平均分为5份
            splitNumber: 5,
            splitLine: {
              show: false,
              lineStyle: {
                color: "#fff",
              },
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#fff",
                width: 1,
                opacity: 0.3,
              },
            },
            axisTick: {
              show: false,
            },
          },
          {
            type: "value",
            axisLabel: {
              show: false,
            },
            min: 0,
            max: max, // 计算最大值
            interval: max / 10, //  平均分为5份
            splitNumber: 10,
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed",
                color: "#D8D8D8",
              },
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#fff",
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: "category",
            inverse: true,
            //  boundaryGap:true,
            axisLabel: {
              show: false,
              formatter: (value, index) => {
                if (value.length >= 12) {
                  value = value.slice(0, 12) + `\n` + value.slice(12);
                }
                if (value.length >= 26) {
                  value = value.slice(0, 26) + `\n` + value.slice(26);
                }
                return value;
              },
              textStyle: {
                color: "rgba(255,255,255,0.8)",
                fontSize: "12",
                align: "right",
                lineHeight: 18,
              },
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#fff",
                width: 1,
                opacity: 0.3,
              },
            },
            data: getmydmc,
          },
        ],
        dataZoom: [
          {
            type: "inside",
            show: true,
            height: 15,
            start: 1,
            end: 100,
            orient: "vertical",
            zlevel: 66,
          },
        ],
        series: [
          {
            name: "值",
            type: "bar",
            // zlevel: 1,
            xAxisIndex: 0,
            itemStyle: {
              normal: {
                // barBorderRadius: [0, 5, 5, 0],
                color: {
                  colorStops: [
                    {
                      offset: 0,
                      color: this.colorStart, // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: this.colorEnd, // 100% 处的颜色
                    },
                  ],
                },
              },
            },
            barWidth: 15,
            data: getmyd,
            z: 0,
          },
          {
            // 分隔
            type: "pictorialBar",
            itemStyle: {
              normal: {
                color: "#022539",
              },
            },
            symbolRepeat: "fixed",
            symbolMargin: 4,
            symbol: "rect",
            symbolClip: true,
            symbolSize: [2, 15],
            symbolPosition: "start",
            symbolOffset: [-1, 0],
            data: getmydzd,
            z: 66,
            animationEasing: "elasticOut",
          },
          {
            name: "背景",
            type: "bar",
            barWidth: 15,
            barGap: "-100%",
            xAxisIndex: 1,
            data: getmydzd,
            itemStyle: {
              normal: {
                color: {
                  colorStops: [
                    {
                      offset: 0,
                      color: "rgba(24,144,255,0.3)", // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: "rgba(99,180,255,0.3)", // 100% 处的颜色
                    },
                  ],
                },
              },
            },
            z: 0,
          },
        ],
      };

      this.mapChart = echarts.init(this.$refs.resourceChart);
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
.chart-box {
  width: 440px;
  height: 24px;
  border: 1px solid #487cc2;
  border-radius: 3px;
  display: flex;
  align-items: center;
  // padding-left: 10px;
  .resourceChart {
    width: 430px;
    height: 10px;
  }
}
</style>
