<!--
  @descript: 当日值班
-->
<template>
  <Card style="border-radius: 24px;height: 36vh;" >
        <div style="margin-right: 8px" class="itemTitle">
        <span>当日值班信息</span>
      </div>
    <!-- <div class="card-body"> -->
      <!-- <div class="item-title">
        <div class="title-content">
          <span>当</span>
          <span>日</span>
        </div>
        <div class="title-content">
          <span>值</span>
          <span>班</span>
        </div> -->
        <!-- <router-link :to="{ path: '/resource/resourceManage' }" style="margin-roght: 4px;">更多</router-link> -->
      <!-- </div> -->
      <div class="worksheet-list">
        <div v-if="tableList && tableList.length > 0">
          <el-carousel style="height: 25vh">
          <el-carousel-item v-for="(item, index) in tableList"  :key="index"> 
            <div class="worksheet-li" style="margin-top: 40px;margin-left: 20%">
                <div style="margin-bottom: 12px;">平台：{{ item.platform }}</div>
                <div style="margin-bottom: 12px;">班次：{{ item.type }}</div>
                <div style="margin-bottom: 12px;">姓名：{{ item.name }}</div>
                <div style="margin-bottom: 12px;" v-if="item.name==='--'">--</div>
                <div style="margin-bottom: 12px;" v-else>电话：{{ item.phone || '--' }}</div>
              </div>
          </el-carousel-item>
     
       </el-carousel>
          
        </div>
        <div v-else class="empty" style="margin: 25% 0 0 25%;">
          <img style="width: 65px" src="../../../assets/images/no-data.png" alt="" />
          <div class="no-text">暂无当日值班数据</div>
        </div>
      </div>
    <!-- <div :class="filterRole? 'list-box': 'high-list-box'">
      <el-table :data="tableList" max-height="168px" v-loading="tableLoading">
        <template slot="empty">
          <div class="no-data">
            <img style="width: 90px; height: 90px" src="../../../assets/images/no-data.png" alt="" />
            <span class="no-text">暂无数据</span>
          </div>
        </template>
        <el-table-column align="center" label="平台名称" prop="Platform"></el-table-column>
        <el-table-column align="center" label="厂商" prop="manufacturer"></el-table-column>
        <el-table-column align="center" label="人员" prop="Name"></el-table-column>
        <el-table-column align="center" label="联系方式" prop="phone"></el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </div> -->
  </Card>
</template>

<script>
import { getDutyUser, getWorkScheduleList } from '@/api/workforceManage.js'
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
export default {
  name: "worksheetView",
  components: {},
  data () {
    return {
      tableList: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 5
      },
      tableLoading: false,
      dutyPlatformOptions: getDictDatas(DICT_TYPE.SCHEDULE_PLATFORM), // 排班平台类型
      dutyUserOptions: [], // 值班人员
      shiftArr: ['全天班', '白班', '晚班'],
    }
  },
  computed: {
    filterRole () { // 是否为超管或领导角色
      const currentRole = this.$store.state.user.roles
      const show = currentRole.includes('yibaoju_leader') || currentRole.includes('super_admin')
      return show
    },
    currentDay () { // 当天日期
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      const currentTime = new Date()
      const currentDate = currentTime.toLocaleString('zh-CN', options).replace(/\//g, "-").split(' ')[0]
      const formatStart = currentDate + ' 00:00:00'
      const formatEnd = currentDate + ' 23:59:59'
      return [formatStart, formatEnd]
    }
  },
  methods: {
    getDutyUser () { // 获取值班用户数据
      const prePromise = new Promise((resolve, reject) => {
        getDutyUser().then(res => {
          if (res.code === 0) {
            this.dutyUserOptions = res.data && res.data.map(user => {
              return {
                userId: user.id,
                userName: user.nickname
              }
            }) || []
            resolve()
          } else {
            reject()
          }
        }).catch(_ => {
          reject()
        })
      })
      return prePromise
    },
    formatList (list) {
      if (!list) return []
      const formatedList = list.map(rowItem => { // 行数据
        // dutyInfoList--当日值班人员数据列表
        if (!rowItem.dutyInfoList) return []
        rowItem.dutyInfoList.forEach(dutyInfo => {
          const targetUserItem = this.dutyUserOptions.filter(item => {
            return item.userId === dutyInfo.userId
          })
          const targePlatformItem = this.dutyPlatformOptions.filter(item => {
            return item.value === dutyInfo.platform
          })
          dutyInfo.name = targetUserItem[0] && targetUserItem[0].userName || '--'
          dutyInfo.platform = targePlatformItem[0] && targePlatformItem[0].label || '--'
          dutyInfo.type = this.shiftArr[dutyInfo.shift] || '--'
        })
        return rowItem
      })
      return formatedList[0].dutyInfoList
    },
    getList () {
      const params = {
        startDate: this.currentDay[0],
        endDate: this.currentDay[1],
      }
      this.tableLoading = true
      getWorkScheduleList(params).then(res => {
        if (res.code === 0) {
          this.tableList = this.formatList(res.data)
          console.log('ces',this.tableList)
        }
        this.tableLoading = false
      }).catch(_ => {
        this.tableLoading = false
      })
    }
  },
  created () {
    this.getDutyUser().then(_ => {
      this.getList()
    }).catch(_ => {
      this.getList()
    })
  },
}
</script>
<style lang="scss" scoped>
.list-box {
  margin-top: 15px;
  min-height: 228px;
  .no-data {
    height: 130px;
  }
}
.high-list-box {
  margin-top: 15px;
  min-height: 525px;
  .no-data {
    height: 130px;
  }
}
.card-body {
  display: flex;
  margin: 0px 8px;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e8eaec;
  border-radius: 24px;
  transition: all .3s;
  .item-title {
    width: 106px;
    height: 94px;
    padding: 5px 10px;
    border-radius: 24px;
    background-color: #459ffb;
    transform: scale(0.8);
    .title-content {
      color: #fff;
      text-align: center;
      vertical-align: middle;
      line-height: 42px;
      font-size: 22px;
      font-weight: 600;
      span {
        display: inline-block;
        width: 35%;
        text-align: center;
      }
    }
  }
  .worksheet-list {
    max-height: 80px;
    width: calc(99.5% - 96px);
    // margin: 4px 13px 4px 0px;
    margin: auto;
    border-radius: 24px;
    overflow-y: auto;
    .worksheet-li {
      display: flex;
      justify-content: space-around;
      align-items: center;
      font-size: 14px;
      line-height: 26px;
      div {
        width: 24%;
        text-align: center;
      }
    }
    .empty {
      text-align: center;
    }
  }
  .worksheet-list::-webkit-scrollbar {
      width: 6px;
      background-color: rgba(240, 240, 240, 1);
  }
  .worksheet-list::-webkit-scrollbar-track {
      box-shadow: inset 0 0 0px rgba(163, 163, 163, 0.5);
      border-radius: 10px;
      background-color: rgba(240, 240, 240, .5);
  }
  /*定义滑块*/
  .worksheet-list::-webkit-scrollbar-thumb {
      border-radius: 10px;
      box-shadow: inset 0 0 0px rgba(237, 44, 37, .5);
      background-color: rgba(126, 126, 126, 0.5);
  }
  &:hover {
    box-shadow: 0 1px 6px rgba(0,0,0,.2);
    border-color: #eee;
  }
}
::v-deep .el-carousel__container{
  height: 24vh;
}
</style>
