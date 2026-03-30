/**
 * 工作台视图-我的客户 我的项目
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
  <Card style="border-radius: 24px;min-height: 291px">
    <div class="itemTitle">
      <span>我的客户</span>
      <div style="margin-right: 4px">
        <router-link :to="{ name: 'improveInfo' }">新建</router-link
        ><router-link :to="{ name: 'myCustomers' }">全部</router-link>
      </div>
    </div>
    <div class="custom-list">
      <div class="item" v-for="(item, index) in dataList" :key="item.customerCode + index" :class="{ on: item.show }">
        <div class="name">
          <div class="img"><img :src="require('@/assets/images/icon09.png')" /></div>
          <Tooltip :content="item.customerName">
            <span class="overflow" @click="changeList(index)">{{ item.customerName }}</span>
          </Tooltip>
          <Icon type="md-arrow-dropleft" size="26" :class="{ on: item.show }" />
        </div>
        <transition name="slide-right">
          <div class="list" v-show="item.show">
            <span @click="goPage(item.id,it.id)" v-for="(it, i) in item.projectInfos" :key="it.projectName + i">{{
              it.projectName
            }}</span>
          </div>
        </transition>
      </div>
      <Spin size="large" fix v-if="spinShow"></Spin>
      <div style="text-align: center" v-if="!spinShow && dataList.length == '0'">暂无数据</div>
    </div>
    <!-- <div style="text-align: right; width: 100%" v-if="page.total > 0">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        size="small"
        style="padding: 10px"
      ></Page>
    </div> -->
  </Card>
</template>

<script>
// import { custAndProjectList } from "@/api/home";
import {getCustomerList} from "@/api/login";

export default {
  name: "",
  components: {},
  data() {
    return {
      dataList: [],
      page: { total: 0, pageSize: 3, current: 1 },
      spinShow: false
    };
  },
  computed: {},
  methods: {
    changeList(index) {
      this.dataList.forEach((el, i) => {
        if (i == index) {
          this.$set(this.dataList, i, { ...el, show: !this.dataList[i].show });
        } else {
          this.$set(this.dataList, i, { ...el, show: false });
        }
      });
    },
    getList() {
      let data = { pageNum: this.page.current, pageSize: 2 };
      this.spinShow = true;
      getCustomerList(data)
        .then((res) => {
          console.log(res, "我的客户 我的项目");
          if (res.code === 0) {
            let d = []
            if (res.data&&res.data.length > 3){
               d = res.data.slice(0,3) || [];
            }else{
              d = res.data || [];
            }
            this.dataList = d.map((el) => {
              return { ...el, show: false };
            });
            this.page.total = Number(res.data.total || 0);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.spinShow = false;
        });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    goPage(customerId,id) {
      this.$router.push({ name: "improveInfo", query: { customerId:customerId,projectId: id } });
    }
  },
  created() {
    this.getList();
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
.custom-list {
  margin-top: 15px;
  position: relative;
  min-height: 183px;
  .item {
    display: flex;
    margin-bottom: 14px;
    border-radius: 8px;
    background: #F7F9FC;
    padding: 15px;
    border-bottom: 1px solid #eaedf3;
    &.on {
      background: #e5f2ff;
      .name {
        .img {
          background: #fff;
        }
      }
    }
    .name {
      display: flex;
      height: 30px;
      line-height: 30px;
      .img {
        width: 30px;
        height: 30px;
        background: #e5f2ff;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 17px;
          height: auto;
        }
      }
      .overflow {
        width: 140px;
        margin: 0 4px 0 12px;
        height: 24px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -o-text-overflow: ellipsis;
        font-size: 14px;
        font-weight: 600;
        color: #4a4a4a;
        cursor: pointer;
      }
      .ivu-icon {
        color: #999;
        transition: transform 0.2s ease-in-out;
        &.on {
          transform: rotate(180deg);
          color: #4d9af9;
        }
      }
    }
    .list {
      display: flex;
      flex-wrap: wrap;
      span {
        font-size: 14px;
        font-weight: 400;
        color: #666;
        margin-right: 10px;
        padding: 5px 0;
        line-height: 20px;
        cursor: pointer;
      }
    }
  }
}
</style>
