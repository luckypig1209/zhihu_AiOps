<template>
  <div>
    <div class="chart-left">
      <div ref="myChart" class="myChart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-gl'
export default {
  name: 'DiskPieChart',
  components: {},
  props: {
    dataProp: {
      default: () => {
        return []
      },
      type: Array
    },
    typeNum: {
      type: Number | String,
      default: 0
    },
    totalNum: {
      type: Number | String,
      default: 0
    }
  },
  data() {
    return {
      myChart: null,
      seriesData: [],
      total: 0,
      yData: [
        {
          name: '紧急',
          value: 18
        },
        {
          name: '重要',
          value: 16
        },
        {
          name: '提示',
          value: 15
        },
        {
          name: '一般',
          value: 14
        }
      ],
      color: [
        '#DE4F27',
        '#FBA159',
        '#087FF7',
        '#81FBE3',
        '#52C41A',
        '#EB2F96',
        '#722ED1',
        '#FA8C16'
      ]
    }
  },
  watch: {
    totalNum: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.getList()
          })
        }
      },
      immediate: true
    },
    dataProp: {
      handler(val) {
        if (val) {
          this.$nextTick(() => {
            this.getList()
          })
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    getList() {
      this.seriesData = this.dataProp
      console.log("88888888",this.seriesData);
      this.initChart(this.seriesData)
    },

    initChart(data) {
      const _this = this
      const sum = setTimeout(() => {
        data.reduce((acc, item) => {
          const value = typeof item.value === 'number' ? item.value : 0
          return acc + value
        }, 0)
      }, 300)
      console.log('sum',sum)
      // if (data.length === 0) return
      this.myChart = echarts.init(this.$refs.myChart)
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        title: {
          textAlign: 'center',
          text: _this.totalNum,
          subtext: '告警总量(个)',
          x: '48%',
          y: '40%',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            align: 'center',
            color: '#CAD6F1'
          },
          subtextStyle: {
            fontSize: 14,
            fontWeight: 'normal',
            align: 'center',
            color: '#CAD6F1'
          }
        },
        series: [
          {
            tooltip: {
              trigger: 'item',
              formatter: function (params) {
                return (
                  params.name + '：' + params.value + '<br>占比：' + params.percent.toFixed(2) + '%'
                )
              }
            },
            itemStyle: {
              normal: {
                borderColor: '#0A1934',
                borderWidth: 3,
                color: function (params) {
                  return _this.color[params.dataIndex]
                }
              }
            },
            type: 'pie',
            radius: ['55%', '70%'],
            center: ['50%', '50%'],
            label: {
              normal: {
                show: false,
                position: 'inner',
                formatter: (params) => {
                  return '{percent|' + params.percent.toFixed(0) + '%}'
                }
              }
            },
            data: data
          }
        ]
      }

      // 是否需要label指引线，如果要就添加一个透明的2d饼状图并调整角度使得labelLine和3d的饼状图对齐，并再次setOption

      this.myChart.setOption(option)
    }
  }
}
</script>
<style scoped lang="scss">
@font-face {
  font-family: DOUYU;
  // src: url('../../../bigScreen/font/douyuFont-2.otf');
}
.myChart {
  width: 80%;
  height: 250px;
  z-index: 9;
}
.chart-left {
  width: 216px;
  position: relative;
  top: -32px;
  left: 11px;
}
.bottom-img {
  width: 270px;
  height: 101px;
  position: absolute;
  bottom: 30px;
  left: 40%;
  z-index: 0;
  // height: calc(270 / 1080 * 100vh);
  // width: calc(101 / 1920 * 100vw);
  background: no-repeat center;
  // background: url('../../../bigScreen/dict/pie_bottom_bg.png');
  background-size: 100% 100%;
  transform: translateX(-50%);
}
.bottom-name {
  position: absolute;
  bottom: 00px;
  left: 40%;
  transform: translateX(-50%);
  color: #fff;
}
</style>
