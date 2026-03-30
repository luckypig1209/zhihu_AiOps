<template>
  <div class="device-distribution">
    <!-- 左侧设备信息 -->
    <div class="left-panel">
      <div
        class="device-item"
        v-for="(item, index) in devicesNet.slice(0, 3)"
        :key="index"
      >
        <div class="name-container">
          <span class="item-name" :style="`color:${item.color}`">{{
            item.name
          }}</span>
          <span class="item-total">{{ item.assetTotalCount }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="bar"
            :style="{
              width: `${
                (item.normalCount / (item.normalCount + item.abnormalCount)) *
                100
              }%`,
              backgroundColor: item.color,
            }"
          ></div>
        </div>
        <div class="info-number">
          <div
            class="normalCount-span"
            v-for="(item2, index2) in item.monitorStatusCounts"
            :key="index2"
          >
            {{ item2.statusStr }}<span>{{ item2.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间环形图 -->
    <div class="center-panel">
      <div class="center-chart">
        <div ref="chart" style="width: 100%; height: 100%"></div>
      </div>
      <div class="device-item">
        <div class="name-container">
          <span
            class="item-name"
            :style="`color:${devicesNet && devicesNet[3].color}`"
            >{{ devicesNet && devicesNet[3].name }}</span
          >
          <span class="item-total">{{
            devicesNet && devicesNet[3].assetTotalCount
          }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="bar"
            :style="{
              width: `${
                (devicesNet &&
                  devicesNet[3].normalCount / devicesNet &&
                  devicesNet[3].assetTotalCount) * 100
              }%`,
              backgroundColor: devicesNet && devicesNet[3].color,
            }"
          ></div>
        </div>

        <div class="info-number">
          <div
            class="normalCount-span"
            v-for="(item2, index2) in devicesNet && devicesNet[3].monitorStatusCounts"
            :key="index2"
          >
            {{ item2.statusStr }}<span>{{ item2.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧设备信息 -->
    <div class="right-panel">
      <div
        class="device-item"
        v-for="(item, index) in devicesNet.slice(4, 7)"
        :key="index"
      >
        <div class="name-container">
          <span class="item-name" :style="`color:${item.color}`">{{
            item.name
          }}</span>
          <span class="item-total">{{ item.assetTotalCount }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="bar"
            :style="{
              width: `${(item.normalCount / item.assetTotalCount) * 100}%`,
              backgroundColor: item.color,
            }"
          ></div>
        </div>
        <div class="info-number">
          <div
            class="normalCount-span"
            v-for="(item2, index2) in item.monitorStatusCounts"
            :key="index2"
          >
            {{ item2.statusStr }}<span>{{ item2.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { getMonitorSummary } from "@/api/screen";

export default {
  data() {
    return {
      color: [
        "#1A8EFA",
        "#926B28",
        "#49B9CD",
        "#559738",
        "#7092E3",
        "#6D68E4",
        "#B24275",
      ],
      devicesNet: [
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#1A8EFA",
        },
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#926B28",
        },
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#49B9CD",
        },
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#559738",
        } /*  */,
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          color: "#7092E3",
        },
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#6D68E4",
        },
        {
          name: "",
          normalCount: 0,
          abnormalCount: 0,
          assetTotalCount: 0,
          monitorStatusCounts: [],
          color: "#B24275",
        },
      ],
      totalNum: 0,
    };
  },
  mounted() {
    getMonitorSummary({}).then((res) => {
      console.log("res", res);
      if (res.code == 0) {
        let data = res.data.map((item, index) => {
          return {
            ...item,
            name: item.modelName,
            value: item.assetTotalCount,
            color: this.color[index],
          };
        });
        this.devicesNet = data;
        this.initChart(data);
      }
    });
  },
  methods: {
    initChart(data) {
      const _this = this;
      const chart = echarts.init(_this.$refs.chart);
      _this.totalNum = data.reduce((sum, item) => sum + item.value, 0);
      const option = {
        tooltip: {
          trigger: "axis",
        },
        color: _this.color,
        title: {
          textAlign: "center",
          text: _this.totalNum,
          subtext: "设备总量(个)",
          x: "55%",
          y: "45%",
          textStyle: {
            fontSize: 22,
            fontWeight: "bold",
            align: "center",
            color: "#CAD6F1",
          },
          subtextStyle: {
            fontSize: 14,
            fontWeight: "normalCount",
            align: "center",
            color: "#CAD6F1",
          },
        },
        series: [
          {
            tooltip: {
              trigger: "item",
              formatter: function (params) {
                let result =params.value / _this.totalNum;
                let newText =isNaN(result) ? '0%':result.toFixed(2)*100+'%'
                return (
                  params.name +
                  "：" +
                  params.value +
                  "<br>占比：" +
                  newText
                );
              },
            },
            itemStyle: {
              normalCount: {
                borderColor: "#0A1934",
                borderWidth: 3,
                color: function (params) {
                  return params.data.color;
                },
              },
            },
            type: "pie",
            radius: ["65%", "85%"],
            center: ["55%", "55%"],
            emphasis: {
              scale: true, // 可选：整体放大效果
              scaleSize: 10, // 放大距离
            },
            label: {
              show: false,
              normalCount: {
                show: false,
                position: "inner",
                formatter: (params) => {
                  return (
                    "{percent|" +
                    (params.value / _this.totalNum).toFixed(0) +
                    "%}"
                  );
                },
              },
            },
            data: data,
          },
        ],
      };

      chart.setOption(option);
    },
  },
};
</script>

<style scoped>
.device-distribution {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  height: 625px;
}

.left-panel,
.right-panel {
  width: 200px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 500px;
  align-items: center;
  .center-chart {
    width: 100%;
    height: 300px;
    /* background-image: url(ECHARTSBG); */
    /* background: url("../../../assets/images/dataScreen/echart_bg.png") no-repeat; */
    /* background-position: 100px 10px; */
  }
}

.device-item {
  margin-bottom: 20px;
  color: #fff;
  font-size: 16px;
  width: 200px;
  .name-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .item-name {
      font-weight: 600;
    }
  }
  .info-number {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-top: 12px;
    .normalCount-span {
      display: flex;
      width: 50%;
      span {
        color: gray;
        margin-left: 6px;
      }
    }
    .normalCount-span:nth-child(2) {
      display: flex;
      width: 50%;
      span {
        color: #269223;
        margin-left: 6px;
      }
    }
    .normalCount-span:nth-child(3) {
      display: flex;
      width: 50%;
      span {
        color: #ffd591;
        margin-left: 6px;
      }
    }
    .normalCount-span:nth-child(4) {
      display: flex;
      width: 50%;
      span {
        color: rgb(245, 108, 108);;
        margin-left: 6px;
      }
    }
  }
}

.progress-bar {
  width: 100%;
  height: 13px;
  background-color: #0d2859;
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  height: 100%;
  transition: width 0.3s ease;
}
</style>
