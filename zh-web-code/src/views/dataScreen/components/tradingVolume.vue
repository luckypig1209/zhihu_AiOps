<template>
  <div class="user-transaction">
    <div class="title">
      <div class="title-name">设备性能Top10</div>
    </div>
    <!-- 背景框 -->
    <div class="content">
      <div class="user-title">
        <div class="title-info">排名</div>
        <div class="title-info">硬件设备</div>
        <div class="title-info">CPU使用率</div>
        <div class="title-info">内存使用率</div>
      </div>
      <!-- <userTable></userTable>
        -->
      <VerticalScroll
        v-if="tableData && tableData.length > 0"
        :items="tableData"
        :height="200"
        :speed="1"
      >
        <template v-slot="{ item }">
          <div class="user-item">
            <div class="item-content">TOP {{ item.index + 1 }}</div>
            <el-tooltip
              class="item"
              effect="light"
              :content="item.assetName"
              placement="top"
            >
              <div class="item-content">
                {{ item.assetName }}
              </div>
            </el-tooltip>
            <div class="item-content">
              <el-progress
                :percentage="item.cpuUsedRate"
                :color="cpuColor(item.cpu)"
              />
            </div>
            <div class="item-content">
              <el-progress
                :percentage="item.memoryUsedRate"
                :color="memoryColor(item.memoryUsedRate)"
              />
            </div>
          </div>
        </template>
      </VerticalScroll>
      <div v-else style="margin-top: 20px" class="noData">
        <div class="no-img-table"></div>
        <div>暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMetriceTop } from "@/api/screen";
import VerticalScroll from "./VerticalScroll.vue";
import userTable from "./userTable.vue";
export default {
  components: { userTable, VerticalScroll },
  props: {},
  data() {
    return {
      tableData: [],
    };
  },
  watch: {},
  computed: {},
  methods: {
    memoryColor(usage) {
      if (usage > 80) return "#ff4d4f"; // 红色
      else if (usage > 50) return "#faad14"; // 橙色
      else return "#52c41a"; // 绿色
    },
    cpuColor(usage) {
      if (usage > 80) return "#ff4d4f"; // 红色
      else if (usage > 50) return "#faad14"; // 橙色
      else return "#52c41a"; // 绿色
    },
    generateMockData() {
      getMetriceTop({
        topNum: 10,
        metricType: "cpu_memory_rate",
      }).then((res) => {
        if (res.code == 0) {
          console.log('22222',res.data)
//           res.data=[
//             {
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "0",
//     "memoryUsedRate": "0",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// },
// {
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "0",
//     "memoryUsedRate": "0",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// },
// {
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "36",
//     "memoryUsedRate": "55",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// },
// {
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "33",
//     "memoryUsedRate": "22",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// },{
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "99",
//     "memoryUsedRate": "12",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// },
// {
//     "assetId": 185684,
//     "assetName": "a31e9b0e-945c-11f0-a4b1-02420abe0008",
//     "cpuUsedRate": "99",
//     "memoryUsedRate": "12",
//     "diskUsedCapacity": null,
//     "diskTotalCapacity": null,
//     "diskUsedRate": null
// }
//           ]
          this.tableData = res.data.map((item, index) => {
            return {
              ...item,
              index: index,
            };
          });
        }
      });
    },
  },
  created() {},
  mounted() {
    this.generateMockData();
  },
};
</script>
<style lang="scss" scoped>
.user-transaction {
  width: 500px;
  height: 300px;
  background-image: url("../../../assets/images/dataScreen/module-long.png");
  background-size: 100% 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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
  .content {
    width: 812px;
    height: 240px;
    // background-image: url("../../../assets/images/dataScreen/userTable.png");
    background-size: 100% 100%;
    .user-title {
      display: flex;
      width: 100%;
      height: 40px;
      background-size: 100% 100%;
      .title-info {
        background: linear-gradient(to bottom, #fff, #90deff);
        -webkit-background-clip: text;
        color: transparent;
        font-weight: 600;
        font-size: 16px;
        width: 25%;
        margin-bottom: 10px;
      }
    }
    .user-item {
      width: 100%;
      display: flex;
      .item-content {
        // background: linear-gradient(to bottom, #fff, #90deff);
        // -webkit-background-clip: text;
        color: #fff;
        font-weight: 400;
        font-size: 14px;
        width: 25%;
        margin-bottom: 6px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 溢出部分用省略号表示 */
        :deep(.el-progress__text){
          color: #fff !important;
        }
        
      }
    }
  }
}
</style>
