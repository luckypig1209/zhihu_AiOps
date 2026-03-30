<template>
  <div class="header">
    <!-- 时间展示 -->
    <div class="time-show">
      <!-- 星期 -->
      <div class="currentDay">
        <div class="currentDay-icon"></div>
        <div class="currentDay-info">{{ currentDay }}</div>
      </div>
      <!-- 日期 -->
      <div class="nowDate">{{ nowDate }}</div>
      <!-- 时间 -->
      <div class="nowTime">{{ nowTime }}</div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {},
  data() {
    return {
      nowDate:
        new Date().getFullYear() +
        "年" +
        (new Date().getMonth() + 1) +
        "月" +
        new Date().getDate() +
        "日",
      nowTime: null,
    };
  },
  watch: {},
  computed: {
    currentDay() {
      const days = ["日", "一", "二", "三", "四", "五", "六"];
      return `星期${days[new Date().getDay()]}`;
    },
  },
  methods: {
    showTime() {
      let date = new Date();
      let hour = date.getHours();
      hour = hour < 10 ? "0" + hour : hour; // 用三目运算符调整数字显示格式
      let minute = date.getMinutes();
      minute = minute < 10 ? "0" + minute : minute;
      let second = date.getSeconds();
      second = second < 10 ? "0" + second : second;
      // 加载现在时间
      let current = hour + ":" + minute + ":" + second + "";
      this.nowTime = current;
    },
  },
  created() {
    //计时器
    this.showTime();
    setInterval(this.showTime, 1000);
  },
  mounted() {},
};
</script>
<style lang="scss" scoped>
.header {
  position: relative;
  // height: 48px;
  .time-show {
    position: relative;
    top: -10px;
    display: flex;
    align-items: center;
    .currentDay {
      display: flex;
      align-items: center;
      .currentDay-icon {
        width: 16px;
        height: 16px;
        background-image: url("../../../assets/images/dataScreen/currentDay.png");
        background-size: 100% 100%;
      }
      .currentDay-info {
        font-family: PingFangSC-Regular;
        font-weight: 400;
        font-size: 16px;
        color: #ffffff;
        margin-left: 4px;
      }
    }
    .nowDate {
      margin-left: 16px;
      margin-right: 8px;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 16px;
      color: #ffffff;
    }
    .nowTime {
      font-family: PingFangSC-Semibold;
      font-weight: 600;
      font-size: 20px;
      color: #ffffff;
    }
  }
}
</style>
