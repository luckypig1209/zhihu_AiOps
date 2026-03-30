<!-- 
  @descript: 待办已办项
-->
<template>
  <Card style="border-radius: 24px;height: 90vh;" >
    <div style="margin-right: 8px" class="itemTitle">
        <span>待办已办项</span>
    </div>
    <div class="con" style="margin-top: 20px;">
         <div style="display: flex;line-height: 24px;margin: 4px;">
           <img width="24px" src="../../../assets/images/home/text.png" alt="">
           <span>所有工单</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: rgb(38, 190, 243);;">{{allData.sum || '0'}}</span>

            <span style="margin-left: 8px;">处理中</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: rgb(38, 190, 243);;">{{allData.pending || '0'}}</span>

            <span style="margin-left: 8px;">已完结</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: rgb(38, 190, 243);;">{{allData.resolve || '0'}}</span>
         </div> 
         <line-chart id="myEcharts" :sum="allData.sum" 
          :pending="allData.pending" :resolve="allData.resolve" 
          :color="'rgb(38, 190, 243)'" :endColor="'#188df0'" titleValue="完结率"></line-chart> 
      <!-- <div class="title-box all">
        <div>所有工单</div>
        <div>{{allData.sum || '0'}}</div>
      </div>
      <div class="pending all">
        <div class="sub-title">
          <img src="../../../assets/images/home/alarm.png" alt="">
          <div>处理中</div>
        </div>
        <div>{{allData.pending || '0'}}</div>
      </div>
      <div class="resolve all">
        <div class="sub-title">
          <img src="../../../assets/images/home/text.png" alt="">
          <div>已完结</div>
        </div>
        <div>{{allData.resolve || '0'}}</div>
      </div> -->
    </div>
    <div class="con">
       <div style="display: flex;line-height: 24px;margin: 4px;">
           <img width="24px" src="../../../assets/images/home/people.png" alt="">
           <span>我的发起</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #e8d554">{{myData.sum || '0'}}</span>

            <span style="margin-left: 8px;">处理中</span>
           <span @click="toPath('/task/my', { status: '1' })" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #e8d554;cursor: pointer;">{{myData.pending || '0'}}</span>

            <span style="margin-left: 8px;">已完结</span>
           <span @click="toPath('/task/my', { status: '2' })" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #e8d554;cursor: pointer;">{{myData.resolve || '0'}}</span>
         </div>  
          <line-chart id="myEcharts1" :sum="myData.sum" :pending="myData.pending" 
          :resolve="myData.resolve" 
          :color="'#e8d554'" :endColor="'#fede3a'" titleValue="完结率"></line-chart> 
    </div>

    <div class="con">
       <div  style="display: flex;line-height: 24px;margin: 4px;">
           <img width="24px" src="../../../assets/images/home/warning.png" alt="">
           <span>我的任务</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #eea975;">{{worksheetData.sum || '0'}}</span>

            <span style="margin-left: 8px;">处理中</span>
           <span @click="toPath('/task/todo')" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #eea975;cursor: pointer;">{{worksheetData.pending || '0'}}</span>

            <span style="margin-left: 8px;">已处理</span>
           <span  @click="toPath('/task/done')" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #eea975;cursor: pointer;">{{worksheetData.resolve || '0'}}</span>
         </div>  
          <line-chart id="myEcharts2" :sum="worksheetData.sum" 
          :pending="worksheetData.pending" :resolve="worksheetData.resolve" 
          :color="'#eea975'" :endColor="'#e3d23b'" titleValue="处理率"></line-chart> 
      <!-- <div class="title-box work">
        <div>我的任务</div>
        <div>{{worksheetData.sum || '0'}}</div>
      </div>
      <div class="pending work">
        <div class="sub-title">
          <img src="../../../assets/images/home/warning.png" alt="">
          <div>处理中</div>
        </div>
        <div @click="toPath('/task/todo')">{{worksheetData.pending || '0'}}</div>
      </div>
      <div class="resolve work">
        <div class="sub-title">
          <img src="../../../assets/images/home/switch.png" alt="">
          <div>已处理</div>
        </div>
        <div @click="toPath('/task/done')">{{worksheetData.resolve || '0'}}</div>
      </div> -->
    </div>

        <div class="con">
       <div style="display: flex;line-height: 24px;margin: 4px;">
           <img width="24px" src="../../../assets/images/home/switch.png" alt="">
           <span>我的服务计划</span>
           <span style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #89d15f">{{myServiceData.sum || '0'}}</span>

            <span style="margin-left: 8px;">处理中</span>
           <span @click="toPath('/service/servicePlan', {activeName: 'todo'})" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #89d15f;cursor: pointer;">{{myServiceData.pending || '0'}}</span>

            <span style="margin-left: 8px;">已处理</span>
           <span @click="toPath('/service/servicePlan', {activeName: 'done'})" style="margin-left: 4px;font-size: 20px;font-weight: 400;color: #89d15f;cursor: pointer;">{{myServiceData.resolve || '0'}}</span>
         </div>  
          <line-chart id="myEcharts3" :sum="myServiceData.sum" :pending="myServiceData.pending" 
          :resolve="myServiceData.resolve" 
          :color="'#89d15f'" :endColor="'#14dc93'" titleValue="处理率"></line-chart> 
    </div>
  </Card>
</template>

<script>
import lineChart from "../components/lineChart.vue";
import { getMyTodo, getMyDone, getAllSheet, getAllProcess } from "@/api/login.js"
import { planTodoList, planDoneList } from "@/api/servicePlan.js"
export default {
  components: {lineChart},
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
      myServiceData: {
        sum: null,
        pending: null,
        resolve: null
      }, // 我的作业计划
      
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
      const serviceArr = [planTodoList({
        ...todoDoneParams,
        onDutyId: 182}
      ), planDoneList({
        ...todoDoneParams,
        onDutyId: 182})] // 我的任务
      this.formatPromiseResult(allPromiseArr, this.allData)
      this.formatPromiseResult(myPromiseArr, this.myData)
      this.formatPromiseResult(workPromiseArr, this.worksheetData)
      this.formatPromiseResult(serviceArr, this.myServiceData)
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
