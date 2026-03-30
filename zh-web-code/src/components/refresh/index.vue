
<template>
    <div  class="refresh-right">
      <div>{{ $t('common.lastRefreshTime') }}：{{time}}</div>
       <a-button  class="button-refresh" @click="refresh">
            {{ $t('common.refresh') }}
       </a-button>
      <div class="refresh-interval">
        <!-- 触发下拉的按钮 -->
        <a-dropdown @visibleChange="handleVisibleChange">
          <a-button style="border-radius: 0;">
            {{selectValue === '0'? '...' : (parseInt(selectValue) >= 60? (parseInt(selectValue)/60) + 'm': parseInt(selectValue) + 's')}}
          </a-button>
          <!-- 下拉菜单内容 -->
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="0">{{ $t('common.notRefresh') }}</a-menu-item>
              <a-menu-item key="15">15s</a-menu-item>
              <a-menu-item key="30">30s</a-menu-item>
              <a-menu-item key="60">1m</a-menu-item>
              <a-menu-item key="300">5m</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>      
    </div> 
</template>

<script>
import { refresh } from "less";
const formatDate = (date, formatStr) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return formatStr
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds); 
};
export default {
  name: "refreshTime",
  components: {  },
  data() {
    return { 
      currentName: "list",       
      isSearch: "yes",
      time: '2025-08-27 09:16:08',
      timer: null, // 定时器标识
      selectValue:'0' 
    };
  },
  computed: {},
  methods: {
        // 下拉菜单显示/隐藏时可做的逻辑（如清除定时器）
    handleVisibleChange(visible) {
      if (!visible) {
        // 隐藏时可根据需求处理，比如清除之前的定时器
        this.clearTimer();
      }
    },
    // 点击菜单项逻辑
    handleMenuClick({ key }) {
      this.selectValue = key
      this.clearTimer(); // 先清除之前的定时器
      if (key!== '0') {
        const interval = Number(key) * 1000; // 转毫秒
        this.timer = setInterval(() => {
          // 这里写真正的“刷新”逻辑，比如调用接口、更新数据等
          console.log('执行刷新操作');
          this.refresh()
        }, interval);
      }
    },
    refresh(){
      this.time = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
      this.$emit('refresh')
    },
    // 清除定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
  },
  created() {
    this.time = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');
  },
  mounted() {},
  beforeDestroy() {
    this.clearTimer(); // 组件销毁前清除定时器，避免内存泄漏
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
  margin: 10px 20px;
  position: relative;
  font-size: 16px;

.tab-top{
  position: absolute;
  left:0;
  width: 100%;
}
}
</style>
