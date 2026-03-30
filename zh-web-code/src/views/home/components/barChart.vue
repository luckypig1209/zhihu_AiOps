/**
 * 工作台视图-环形图
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
 <div class="myEcharts" :id="id" style="height: 138px; width: 188px;"></div>
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
    color:{
      default:'',
      type:String
    },
    dataArray:{
      default:[],
      type: String
    }
  },
  data() {
    return {
      echartsOption: null,
    }
  },
  watch: {
    dataArray: function (val) {
     this.initChart()
    }
  },
  computed: {
  },
  methods: {
    initChart() {
      var myChart = echarts.init(document.getElementById(this.id));
      let xData = this.dataArray.map(item =>{
        return item.coordinate
      })
      let yData = this.dataArray.map(item =>{
        return item.value
      })
// 配置项
        this.echartsOption = {
            // 隐藏坐标轴
            xAxis: {
                show: false,          // 关闭X轴显示
                type: 'category',
                data: xData
            },
            yAxis: {
                show: true,          // 关闭Y轴显示
                type: 'value',
                minInterval: 1
            },
            // 调整图表区域边距（避免坐标轴隐藏后留白）
            grid: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20,
                containLabel: true    // 确保标签在边界内
            },
            // 趋势线配置
            series: [{
                type: 'line',
                data: yData,
                smooth: true,         // 平滑曲线
                symbol: 'circle',    // 数据点标记
                symbolSize: 0,       // 标记大小
                lineStyle: {
                    color: this.color, // 线条颜色
                    width: 3
                },
                itemStyle: {
                    color: '#5470C6', // 数据点颜色
                    borderColor: '#fff', // 标记边框颜色
                    borderWidth: 2
                },
                // 显示数据标签（替代坐标轴数值）
                label: {
                    show: false,
                    color: '#666',
                    formatter: '{c}'  // 显示数据值
                }
            }],
            // 提示框（悬停显示详细信息）
            tooltip: {
                trigger: 'axis',
                formatter: '日期：{b0}<br/>数值：{c0}'
            }
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
