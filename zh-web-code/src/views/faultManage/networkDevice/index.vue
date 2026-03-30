/**
 * 故障管理-告警管理
 * @router alarmShow
 * @autor zm
 * @date 2024/01/2
 */
<template>
  <div class="list-top">
    <!-- <a-tabs v-model:currentName="currentName" class="tab-top">
      <a-tab-pane key="show" tab="总览">
        <dataAllShow></dataAllShow>
      </a-tab-pane>
      <a-tab-pane key="list" tab="列表">
         <warning-tab ref="list" v-show="currentName == 'list'" :isSearch="isSearch"></warning-tab>
      </a-tab-pane>
    </a-tabs>    -->
     <!-- <refreshTime @refresh="refresh"></refreshTime> -->
     <warning-tab ref="list" v-show="currentName == 'list'" :isSearch="isSearch"></warning-tab>
  </div>
</template>

<script>
import warningTab from "./components/warningTab.vue";
import dataAllShow from "./components/dataAllShow.vue";
import refreshTime from '@/components/refresh/index.vue'
export default {
  name: "alarmShow",
  props: {
    id: {
      default: "",
      type: String
    },
    custName: {
      default: "",
      type: String
    }
  },
  components: { warningTab, dataAllShow, refreshTime },
  data() {
    return { 
      currentName: "list", 
      isSearch: "yes",
      time: '2025-08-27 09:16:08',
      timer: null, // 定时器标识
      selectValue:'15' 
    };
  },
  computed: {},
  methods: {
    refresh(){
      this.$refs.list.getList()
    },Timer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {
  }
};
</script>

<style scoped lang="less">
.ivu-card {
  min-height: 100%;
}
/deep/ .ant-tabs-nav-wrap{
  font-size: 16px;
}
.refresh-interval {
  /* 可根据布局需求调整样式 */
  display: inline-block;
  margin-top: -2px;
}
.button-refresh{
  margin-top: 5px;
  margin-left: 10px;
  border-radius: 0;
  width: 70px;
}
.refresh-right{
  position: absolute; 
  right: 0;
  display: flex;
  line-height: 45px;
}
.list-top{
  position: relative;
  font-size: 16px;

.tab-top{
  position: absolute;
  left:0;
  width: 100%;
}
}
</style>
