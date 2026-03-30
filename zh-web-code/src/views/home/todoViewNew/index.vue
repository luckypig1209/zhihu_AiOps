<!-- 
  @descript: 待办已办项
-->
<template>
  <!-- <Card style="border-radius: 24px;"> -->
    <div class="row" style="width: 100% !important;">
      <!-- <div class="title-box work">
        <div>我的任务</div>
        <div>{{worksheetData.sum || '0'}}</div>
      </div> -->
      <div class="pending work">
        <div class="sub-title">
          <img src="../../../assets/images/home/warning.png" alt="">
          <div>未处理</div>
        </div>
        <div @click="toPath('/task/todo')">{{worksheetData.pending || '0'}}</div>
      </div>
      <div class="resolve work">
        <div class="sub-title">
          <img src="../../../assets/images/home/switch.png" alt="">
          <div>已处理</div>
        </div>
        <div @click="toPath('/task/done')">{{worksheetData.resolve || '0'}}</div>
      </div>
    </div>
  <!-- </Card> -->
</template>

<script>
import { getMyTodo, getMyDone, getAllSheet, getAllProcess } from "@/api/login.js"
export default {
  components: {},
  data () {
    return {
      allData: {
        sum: null,
        pending: null,
        resolve: null
      }, // 所有工单数据
      myData: {
        sum: null,
        pending: null,
        resolve: null
      }, // 我的发起数据
      worksheetData: {
        sum: null,
        pending: null,
        resolve: null
      }, // 我的任务数据
    }
  },
  methods: {
    queryTodoDoneSum () { // 获取待办已办总数数量数据
      const todoDoneParams = {
        pageNo: 1,
        pageSize: 10,
        roles: this.$store.state.user.roles || undefined
      }
      const allPromiseArr = [getAllSheet(1), getAllSheet(2)] // 所有工单
      const myPromiseArr = [getAllProcess({...todoDoneParams, status: 1}), getAllProcess({...todoDoneParams, status: 2})] // 我的发起
      const workPromiseArr = [getMyTodo(todoDoneParams), getMyDone(todoDoneParams)] // 我的任务
      this.formatPromiseResult(allPromiseArr, this.allData)
      this.formatPromiseResult(myPromiseArr, this.myData)
      this.formatPromiseResult(workPromiseArr, this.worksheetData)
    },
    toPath (path, query) {
      this.$router.push({
        path,
        query
      })
    },
    formatPromiseResult (promiseArr, targetObj) { // 格式待办、已办、总数化返回值
      Promise.all(promiseArr).then(res => {
        let sum = 0
        if (res[0].code === 0) {
          targetObj.pending = res[0].data.total || 0
          sum += res[0].data.total
        } else {
          this.$message.error(res[0].msg)
        }
        if (res[1].code === 0) {
          targetObj.resolve = res[1].data.total || 0
          sum += res[1].data.total
        } else {
          this.$message.error(res[0].msg)
        }
        if (sum) {
          targetObj.sum = sum
        }
        sum = undefined
      }).catch(_ => {

      })
    }
  },
  created () {
    this.queryTodoDoneSum()
  },
}
</script>
<style lang="scss" scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 5px;
  &:last-child {
    padding-bottom: 0px;
  }
  .title-box {
    border-radius: 18px;
    width: 20%;
    text-align: center;
    font-weight: 600;
    padding: 10px 0px;
    color: #fff;
    &.all {
      background-color: #ff7e86;
    }
    &.my {
      background-color: #459ffb;
    }
    &.work {
      background-color: #9b99f5;
    }
  }
  .pending {
    display: flex;
    justify-content: flex-start;
    width: 39%;
    padding-left: 9%;
    .sub-title {
      font-size: 13px;
      img {
        width: 52%;
        user-select: none;
        vertical-align: bottom;
      }
      span {
        text-align: center;
      }
    }
    &.all > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #3a3539;
    }
    &.my > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #e8d554;
      cursor: pointer;
    }
    &.work > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #eea975;
      cursor: pointer;
    }
  }
  .resolve {
    display: flex;
    justify-content: flex-start;
    width: 39%;
    padding-left: 9%;
    .sub-title {
      font-size: 13px;
      img {
        width: 50%;
        user-select: none;
        vertical-align: bottom;
      }
      span {
        text-align: center;
      }
    }
    &.all > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #36332e;
    }
    &.my > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #7377e0;
      cursor: pointer;
    }
    &.work > div:last-child {
      margin: auto 0px;
      font-size: 22px;
      font-weight: 600;
      color: #89d15f;
      cursor: pointer;
    }
  }
}
</style>
