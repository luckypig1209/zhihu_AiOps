<!-- 
  @descript: 资产信息
-->
<template>
  <Card style="border-radius: 24px">
    <div class="itemTitle">
      <span>资产信息</span>
      <router-link :to="{ path: '/resource/resourceManage' }" style="margin-roght: 4px">更多</router-link>
    </div>
    <div class="asset-chart">
      <div id="charts" v-show="assetVisi"></div>
      <el-empty description="暂无数据" :image-size="118" v-show="!assetVisi" :image="emptyImg"></el-empty>
    </div>
  </Card>
</template>

<script>
import * as echarts from 'echarts'
import { getAssetInfo } from '@/api/login.js'
import emptyImg from '@/assets/images/table-empty.png'
export default {
  components: {},
  data () {
    return {
      myCharts: null, // echarts实例
      resizeListener: null, // 窗口大小变化监听器
      assetVisi: true, // 是否有资产信息
      emptyImg, // 空值图片
    }
  },
  methods: {
    queryChartsData() {
      let xLabel = []
      let yData = []
      getAssetInfo().then(res => {
        if (res.code === 0) {
          if (!res.data || res.data.length === 0) {
            this.assetVisi = false
            return
          }
          res.data.forEach(item => {
            xLabel.push(item.modelName || '--')
            yData.push(item.total || 0)
          })
          this.initGraph(xLabel, yData)
          this.assetVisi = true
        } else {
          this.assetVisi = false
        }
      }).catch(_ => {
        this.assetVisi = false
      })
    },
    initGraph (x, y) {
      let chartDom = document.querySelector("#charts")
      this.myCharts = echarts.init(chartDom)
      // this.resizeListener = window.addEventListener('resize', this.resizeHanlder)
      // 请求资产数据接口
      const options = {
        xAxis: {
          type: "category",
          data: x || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLabel: {
            interval: 0,
            rotate: 35,
            height: 100,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          }
        },
        grid: {
          x: 20,
          y: 20,
          x2: 20,
          y2: 80
        },
        series: [
          {
            data: y || [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
            barWidth: '40%',
            label: {
              show: true,
              position: 'top'
            },
            itemStyle: {
              color: '#f79646'
            }
          },
        ]
      }
      options && this.myCharts.setOption(options);
      this.initSizeWatcher()
    },
    initSizeWatcher () {
      const targetDiv = document.querySelector('#charts')
      let timer;
      const debounce = (entries) => {
        this.myCharts.resize()
        // if (timer) {
        //   clearTimeout(timer)
        // }
        // timer = setTimeout(() => {
        //   this.myCharts.resize()
        // }, 100)
      }
      this.resizeListener = new ResizeObserver((entries) => debounce(entries)) || null
      this.resizeListener && this.resizeListener.observe(targetDiv)
    },
    // resizeHanlder () { // resize事件操作
    //   let timer;
    //   if (timer) {
    //     clearTimeout(timer)
    //   }
    //   setTimeout(() => {
    //     this.myCharts.resize()
    //   }, 500)
    // }
  },
  mounted () {
    this.queryChartsData()
    // this.initGraph()
  },
  beforeDestroy () {
    this.resizeListener && this.resizeListener.disconnect()
  }
}
</script>
<style lang="scss" scoped>
#charts {
  height: 220px;
  width: 100%;
}
</style>
