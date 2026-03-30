<template>
  <div>
    <el-popover ref="dcPopover" width="700" trigger="click">
      <!-- 弹出列表 -->
      <el-table v-loading="loading" :data="list" maxHeight="400">
        <el-table-column width="120" property="templateNickname" label="发送人" align="center"/>
        <el-table-column width="180" property="createTime" label="发送时间" align="center">
          <template v-slot="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="templateType" width="100">
          <template v-slot="scope">
            <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="scope.row.templateType" />
          </template>
        </el-table-column>
        <el-table-column property="templateContent" label="内容" align="center" >
          <template v-slot="scope">
            <div style="white-space:pre-line;" v-html="scope.row.templateContent"></div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 更多 -->
      <div style="text-align: right; margin-top: 10px">
        <el-button type="primary" size="mini" @click="goMyList">查看全部</el-button>
      </div>
       <!-- icon 展示 -->
      <el-badge slot="reference" :is-dot="unreadCount > 0" type="danger">
        <span class="circle-bg" @click="getList">
          <img :src="msgImg" alt="">
        </span>
         <!-- <svg-icon icon-class="message" @click="getList"/> -->
      </el-badge>

    </el-popover>
  </div>
</template>

<script>
import {getUnreadNotifyMessageCount, getUnreadNotifyMessageList} from "@/api/system/notify/message";

export default {
  name: 'NotifyMessage',
  data() {
    return {
      // 遮罩层
      loading: false,
      flag:false,
      // 列表
      list: [],
      // 未读数量,
      unreadCount: 0,
      msgImg: require('@/assets/images/msg-icon.png'),
    }
  },
  created() {
    // 首次加载小红点
    this.getUnreadCount()
    // 轮询刷新小红点
    setInterval(() => {
      this.getUnreadCount()
    },1000 * 60 * 2)
  },
  methods: {
    changeFlag(){
      this.flag = !this.flag
    },
    getList: function() {
      this.loading = true;
      getUnreadNotifyMessageList().then(response => {
        this.list = response.data;
        this.loading = false;
        // 强制设置 unreadCount 为 0，避免小红点因为轮询太慢，不消除
        // this.unreadCount = 0
      });
    },
    getUnreadCount: function() {
      getUnreadNotifyMessageCount().then(response => {
        this.unreadCount = response.data;
      })
    },
    goMyList: function() {
      this.$router.push({
        name: 'MyNotifyMessage'
      });
    }
  }
}
</script>
<style>
.el-badge__content.is-fixed {
  top: 10px; /* 保证徽章的位置 */
}
</style>
<style scoped lang="scss">
  .circle-bg {
    display: inline-block;
    width: 32px;
    height: 32px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    img {
      width: 16px;
    }
  }
</style>
