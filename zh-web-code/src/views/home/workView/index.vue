/**
 * 工作台视图-工作项
 * @router index
 * @autor zm
 * @date 2023/03/21
 */
<template>
  <Card style="border-radius: 24px;margin-left: 8px">
    <div class="con">
      <div style="margin-right: 8px" class="itemTitle">
        <span>我的待办</span>
        <a @click="goPage">全部</a>
      </div>
      <div style="margin-top: 20px">
        <todo></todo>
      </div>
    </div>
  </Card>
</template>

<script>
import Service from "./components/service.vue";
import Need from "./components/need.vue";
import Accept from "./components/accept.vue";
import Task from "./components/task.vue";
import todo from "./components/index";
export default {
  name: "",
  components: { Service, Need, Accept, Task, todo },
  data() {
    return {
      activeTab: "service"
    };
  },
  computed: {},
  methods: {
    goPage() {
      const menus = []
      this.$store.state.user.menus.forEach(item=>{
        menus.push(...item.children)
      })
      if(menus.some(item=>item.path ==='servicePlan')){
        this.$router.push({ name: "BpmTodoTask" });
      }else{
        this.$Message.warning('暂无权限！')
      }

    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
/deep/.ivu-tabs {
  margin-top: 20px;
  .ivu-tabs-bar {
    border-bottom: none;
  }
  .ivu-tabs-nav-container {
    margin-bottom: 0;
  }
  .ivu-tabs-ink-bar {
    display: none;
  }
  &.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
    border: 1px solid #e8e8e8;
    border-right: 0;
    border-radius: 0;
    margin-right: 0;
    height: 32px;
    font-size: 14px;
    font-weight: 400;
    background: #fff;
  }
  .ivu-tabs-nav-container:focus .ivu-tabs-tab-focused {
    border-color: #e8e8e8 !important;
  }
  .ivu-tabs-nav {
    border-right: 1px solid #e8e8e8;
  }
}
/deep/.ivu-table {
  .ivu-table-cell {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
