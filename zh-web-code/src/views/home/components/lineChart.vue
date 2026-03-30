/**
 * 工作台视图-环形图
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
 <div class="myEcharts" :id="id" style="height: 120px; width: 488px;"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "",
  components: {},
  props: {
    id: {
      default: "myEcharts",
      type: String
    },
    myData:{
      default:{
        sum: 100,
        pending: 100,
        resolve: 0
      }
    },
    titleValue: {
      default: '完结率',
      type: String
    },
    sum:{
      default: 100,
      type: Number,
    },
    pending:{
      default: 100,
      type: Number,
    },
    resolve:{
      default: 0,
      type: Number,
    },
    color: {
      default:'#83bff6',
      type: String
    },
    endColor: {
      default:'#188df0',
      type: String
    }
  },
  data() {
    return {
      echartsOption: null,
    }
  },
  watch: {
    pending(val) {
      this.initChart()
    }
  },
  computed: {
  },
  methods: {
    initChart() {
      var myChart = echarts.init(document.getElementById(this.id));

      // 配置项
       this.echartsOption = {
            title: {
               show: false,
               text: '',
               left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: {c}%'
            },
            xAxis: {
                type: 'value',
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            },
            yAxis: {
                show: false,
                type: 'category',
                data: [this.titleValue]
            },
            series: [{
                name: this.titleValue,
                type: 'bar',
                data: [((this.resolve/this.sum) * 100).toFixed(2)],
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}%'  // 显示百分比数值
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                        { offset: 0, color: this.color },   // 渐变起始颜色
                        { offset: 1, color: this.endColor }    // 渐变结束颜色
                    ])
                }
            }]
        };

        // 渲染图表
        myChart.setOption(this.echartsOption);

    }
  },
  created() {},
  mounted() {
      setTimeout(() => {
       this.initChart()
      }, 300);
  },
  beforeDestroy() {
  }
};
</script>

<style scoped lang="less">
</style>
