<template>
  <div class="js-map">
    <div class="map-background">
      <div class="mapChart" ref="mapChart"></div>
      <!-- <div class="back-button" @click="goBack">
        <div class="back-icon"></div>
        <div class="back-msg">返回</div>
      </div> -->
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import mapJson from "./jiangsu.json";
import LOC from "../../../assets/images/dataScreen/loc.png";
export default {
  components: {},
  props: {},
  data() {
    return {
      cityCenter: {
        南京: [118.797413, 31.791544],
        无锡: [119.851663, 31.274729],
        徐州: [117.504811, 34.181792],
        常州: [119.436973, 31.432752],
        苏州: [120.649585, 31.239379],
        南通: [121.104608, 32.016212],
        连云港: [119.158821, 34.420018],
        淮安: [118.921265, 33.247506],
        盐城: [120.229998, 33.367631],
        扬州: [119.521003, 32.593159],
        镇江: [119.472753, 31.904402],
        泰州: [120.085176, 32.424882],
        宿迁: [118.565162, 33.623008],
      },
      mapData: [
        {
          name: "徐州",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "苏州",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "南通",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "连云港",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "淮安",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "镇江",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "泰州",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "宿迁",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "徐州",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "徐州",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "盐城",
          value: [
            {
              resourcePool: "云立方",
              type: 2,
              typeName: "存储池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: "5338",
              storageTotal: "6000",
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "无锡",
          value: [
            {
              resourcePool: "云立方",
              type: 2,
              typeName: "存储池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: "3347",
              storageTotal: "5120",
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "常州",
          value: [
            {
              resourcePool: null,
              type: 1,
              typeName: "通算池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: "5765",
              memoryTotal: "15226",
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: "4840",
              vcpuAvalibale: "846",
            },
          ],
        },
        {
          name: "扬州",
          value: [
            {
              resourcePool: null,
              type: 1,
              typeName: "通算池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: "257437",
              memoryTotal: "479535",
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: "148528",
              vcpuAvalibale: "68048",
            },
            {
              resourcePool: "云立方",
              type: 2,
              typeName: "存储池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: "479",
              storageTotal: "5120",
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
        {
          name: "南京",
          value: [
            {
              resourcePool: "南电H800",
              type: 0,
              typeName: "智算（容器）",
              city: "南京",
              gpuType: "H800",
              gpuNumAvalibale: "70",
              gpuNumTotal: "102",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
            {
              resourcePool: "南电璧仞",
              type: 0,
              typeName: "智算（裸金属）",
              city: "南京",
              gpuType: "璧仞",
              gpuNumAvalibale: "512",
              gpuNumTotal: "1024",
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
            {
              resourcePool: null,
              type: 1,
              typeName: "通算池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: "99234",
              memoryTotal: "259351",
              storageAvalibale: null,
              storageTotal: null,
              vcpuTotal: "98000",
              vcpuAvalibale: "38667",
            },
            {
              resourcePool: "云立方",
              type: 2,
              typeName: "存储池",
              city: null,
              gpuType: null,
              gpuNumAvalibale: null,
              gpuNumTotal: null,
              memoryAvalibale: null,
              memoryTotal: null,
              storageAvalibale: "5056",
              storageTotal: "5120",
              vcpuTotal: null,
              vcpuAvalibale: null,
            },
          ],
        },
      ],
    };
  },
  watch: {},
  computed: {
    getMapData() {
      let data = this.mapData;
      let res = [];
      for (let i = 0; i < data.length; i++) {
        let geoCoord = this.cityCenter[data[i].name];
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value),
            tooltipData: data[i].value,
            itemStyle: data[i].itemStyle,
            label: { color: "#fff" },
            // target: data[i].target
          });
        }
      }
      return res;
    },
  },
  methods: {
    goBack() {
      this.$emit("goBack");
    },
    initEchartMap() {
      let options = {
        tooltip: {
          show: false,
          trigger: "item",
        },
        geo: [
          {
            map: "jiangsu",
            aspectScale: 0.75,
            layoutCenter: ["50%", "50%"],
            layoutSize: "95%",
            show: true,
            roam: false,
            emphasis: {
              label: {
                color: "#FF4500", // 高亮时字体颜色
                // fontWeight: "bold",
                fontSize: 14,
              },
            },
            label: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: 14,
                  color: "#20408B",
                },
              },
            },
            itemStyle: {
              areaColor: "transparent", // 关键设置
              borderColor: "transpercent", // 保留边框颜色
              borderWidth: 0,
            },
          },
        ],
        series: [
          {
            type: "map",
            map: "jiangsu",
            name: "",
            aspectScale: 0.75,
            selectedMode: false, // 禁用点击高亮
            roam: false, // 是否允许缩放
            // zoom: 1.1, //默认显示级别
            layoutSize: "95%",
            layoutCenter: ["50%", "50%"],
            label: {
              normal: {
                show: true,
                textStyle: {
                  fontSize: 14,
                  color: "#20408B",
                },
              },
            },
            itemStyle: {
              areaColor: "transparent", // 关键设置
              borderColor: "transpercent", // 保留边框颜色
              borderWidth: 0,
            },
            emphasis: {
              // 高亮状态样式
              itemStyle: {
                color: "#fff",
                areaColor: "rgba(51,153,255,0.3)", // 高亮时半透明
              },
              label: {
                color: "#FFf", // 高亮时字体颜色
                // fontWeight: "bold",
                fontSize: 14,
              },
            },

            showLegendSymbol: false,
            data: this.getMapData,
            zlevel: 10,
          },
          {
            type: "scatter",
            coordinateSystem: "geo",
            symbol: "image://" + LOC,
            symbolSize: [30, 12],
            // symbolOffset: [0, "-50%"],
            label: {
              normal: {
                show: false,
              },
            },
            itemStyle: {
              areaColor: "transparent",
              normal: {
                color: "transparent", //标志颜色
              },
            },
            data: this.getMapData,
            hoverAnimation: false,
            zlevel: 10,
          },
        ],
      };
      echarts.registerMap("jiangsu", mapJson);
      this.mapChart = echarts.init(this.$refs.mapChart);
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
.back-button {
  width: 100px;
  height: 34px;
  position: absolute;
  right: -94px;
  bottom: 24px;
  z-index: 1000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("../../../assets/images/dataScreen/back-back.png");
  background-size: 100% 100%;
  .back-icon {
    width: 16px;
    height: 16px;
    background-image: url("../../../assets/images/dataScreen/back-icon.png");
    background-size: 100% 100%;
  }
  .back-msg {
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
    margin-left: 8px;
  }
}
.js-map {
  width: 100%;
  display: flex;
  justify-content: center;
  .map-background {
    position: relative;
    width: 620px;
    height: 577px;
    background-image: url("../../../assets/images/dataScreen/map-Background.png");
    background-size: 100% auto;
    .mapChart {
      width: 580px;
      height: 554px;
      position: relative;
      left: 15px;
    }
  }
}
</style>
