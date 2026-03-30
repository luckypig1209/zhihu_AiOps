<template>
  <div class="app-container">
    <div class="con" v-if="list.length > 0">
      <div class="list" v-for="(typeList, index) in typeList" :key="index">
        <div class="top">
          <span class="line"></span>
          <span class="title">{{ index }}</span>
        </div>
        <div class="box">
          <el-row :gutter="20">
            <el-col :span="6" v-for="(item, i) in typeList" :key="i">
              <div class="grid" @click="toFlow(item)">
                <div class="left">
                  <img :src="require('@/assets/images/icon07.png')" />
                </div>
                <div class="right">
                  <div :title="item.flowName">{{ item.flowName }}</div>
                  <span :title="item.flowDescription">{{ item.flowDescription }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div class="no-data" v-else>
      <img style="width: 200px" src="../../../assets/images/no-data.png" alt="" />
      <span class="no-text">暂无数据</span>
    </div>
  </div>
</template>
<script>
import { getTaskPage } from "@/api/bpm/createTask";
export default {
  data() {
    return {
      list: []
    };
  },
  computed: {
    typeList() {
      const result = {};
      this.list.forEach((item) => {
        const flowType = item.flowType;
        if (flowType === "资产变更") {
          if (!result[flowType]) {
            result[flowType] = [];
          }
          result[flowType].push(item);
        }
      });
      return result;
    }
  },
  created() {},
  mounted() {
    this.getTaskPage();
  },
  methods: {
    getTaskPage() {
      getTaskPage().then((res) => {
        this.list = res.data;
      });
    },
    toFlow(item) {
      this.$router.push({
        name: "BpmProcessInstanceCreate",
        query: { flowUniqueKey: item.flowUniqueKey, flowType: item.flowType }
      });
    }
  }
};
</script>
<style scoped lang="scss">
.con {
  .list {
    margin-bottom: 20px;
    .top {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .line {
        display: inline-block;
        height: 18px;
        vertical-align: middle;
        border-left: 4px solid #4380f3;
        border-radius: 4px;
      }
      .title {
        font-weight: 700;
        font-size: 18px;
        color: #040938;
        margin-left: 10px;
      }
    }
    .grid {
      display: flex;
      border-radius: 6px;
      background: #ffffff;
      box-shadow: 0px 2px 14px 0px rgba(178, 183, 199, 0.4);
      border-radius: 8px;
      padding: 20px 20px 40px;
      margin-bottom: 10px;
      cursor: pointer;
      &:hover {
        transform: scale(1.01);
      }
      img {
        width: 40px;
        margin-right: 16px;
      }
      .right {
        div {
          font-weight: 600;
          font-size: 16px;
          color: #040938;
          margin-bottom: 16px;
          overflow: hidden;
          text-overflow: ellipsis;
          /*将对象作为弹性伸缩盒子模型显示*/
          display: -webkit-box;
          /*限制文本行数*/
          -webkit-line-clamp: 1;
          /*子元素的排列方式*/
          -webkit-box-orient: vertical;
        }
        span {
          display: inline-block;
          min-height: 56px;
          color: #666666;
          overflow: hidden;
          text-overflow: ellipsis;
          /*将对象作为弹性伸缩盒子模型显示*/
          display: -webkit-box;
          /*限制文本行数*/
          -webkit-line-clamp: 3;
          /*子元素的排列方式*/
          -webkit-box-orient: vertical;
        }
      }
    }
  }
}
.no-data {
  height: 640px;
}
</style>
