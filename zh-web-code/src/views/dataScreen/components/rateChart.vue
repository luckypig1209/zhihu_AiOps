<template>
  <div>
    <div class="rateChart" ref="rateChart"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  components: {},
  props: ['name',"percent", "colorStart", "colorEnd"],
  data() {
    return {};
  },
  watch: {},
  computed: {},
  methods: {
    initEchartMap() {
      // transparent
      var demoData = {
        name: this.name,
        value: this.percent,
        colorStart: this.colorStart,
        colorEnd: this.colorEnd,
      };

      const startAngle = 220;
      const endAngle = -40;
      let options = {
        animation: true, // 开启初始化动画
        animationDuration: 3000, // 动画时长，单位是毫秒
        animationEasing: "bounceOut", // 动画缓动效果
        backgroundColor: "transparent",
        tooltip: {
          show: false,
          trigger: "item",
        },
        title: [
          {
            text: `{value|${demoData.value + "%"}\n}`,
            left: "center",
            bottom: "12%",
            textStyle: {
              rich: {
                value: {
                  fontSize: "16",
                  color: "#ffffff",
                  padding: [8, 0],
                },
              },
            },
          },
        ],
        series: [
          {
            name: demoData.name,
            type: "gauge",
            radius: "90%",
            startAngle,
            endAngle,
            axisLine: {
              lineStyle: {
                color: [[1, "#053d50"]],
                width: 12,
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: false,
            },
            detail: {
              show: false,
            },
            pointer: {
              show: true,
              length: "76%",
              offsetCenter: [0, "-24%"],
              width: 3,
              icon: "path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z",
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: demoData.colorStart,
                    },
                    // {
                    //   offset: 0.2,
                    //   color: "#07ffd6",
                    // },
                    // {
                    //   offset: 0.8,
                    //   color: "#002f3c",
                    // },
                    {
                      offset: 1,
                      color: demoData.colorEnd,
                    },
                  ],
                },
              },
            },
            progress: {
              show: true,
              width: 12,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: demoData.colorStart,
                    },
                    {
                      offset: 1,
                      color: demoData.colorEnd,
                    },
                  ],
                },
              },
            },
            data: [
              {
                value: demoData.value,
              },
            ],
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
.rateChart {
  width: 100px;
  height: 100px;
}
</style>
