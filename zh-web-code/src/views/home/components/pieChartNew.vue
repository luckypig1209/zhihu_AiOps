/**
 * 工作台视图-环形图
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
 <div class="myEcharts" :id="id" style="height: 222px; width: 388px"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "",
  components: {},
  props: {
    id: {
      default: "myEchartspie",
      type: String
    },
    myData:{
      default:[],
      type: Array
    },
  },
  data() {
    return {
      echartsOption: null,
    }
  },
  watch: {
    myData: function (val) {
     this.initChart()
    }
  },
  computed: {
  },
  methods: {
    initChart() {
      var myChart = echarts.init(document.getElementById(this.id));

      // 配置项
       this.echartsOption  ={
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center',
    type: 'scroll',
  },
  series: [
    {
      name: '资产信息',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: false,
          fontSize: 40,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: this.myData
    }
  ]
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
