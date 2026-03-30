<template>
  <div>
    <div class="center-content">
      <!-- <div class="title-background">
        <div
          @click="changeFlag(item.key)"
          v-for="(item, index) in selectList"
          :key="index"
          :class="[
            'select-box',
            selectFlag == item.key ? item.classActive : item.class,
          ]"
        >
          <span :class="[selectFlag == item.key ? 'active_font' : '']">{{
            item.name
          }}</span>
        </div>
      </div> -->
      <div class="title-message">
        <infoSwiper
          :infoList="dataList"
          v-if="dataList && dataList.length > 0"
        ></infoSwiper>
        <!-- <div class="value-box" v-for="(item, index) in dataList" :key="index">
          <div class="value-main">
            <div class="value-num">
              <VueCountUp
                v-if="showNum"
                :key="item.category + item.number"
                :delay="allCountDuration"
                :options="{
                  ...options,
                  decimalPlaces: getDecimalPlaces(item.number),
                }"
                :endVal="item.number"
              />
            </div>
            <div class="value-unit">{{ item.unit }}</div>
          </div>
          <div class="title">{{ item.category }}</div>
          <div class="title-light"></div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import infoSwiper from "./infoSwiper.vue";
import "../../../assets/font/font.css";
import { getProvincialDataList } from "@/api/screen";
export default {
  components: { infoSwiper },
  props: {},
  data() {
    return {
      showNum: false,
      allCountDuration: 2,
      options: {
        useEasing: true, // 使用缓和
        useGrouping: false, // 使用分组(是否显示千位分隔符,一般为 true)
        separator: ",", // 分隔器(千位分隔符,默认为',')
        decimal: ".", // 十进制(小数点符号,默认为 '.')
        //decimalPlaces:2, // 小数位数(默认为 '0')
        prefix: "", // 字首(数字的前缀,根据需要可设为 $,¥,￥ 等)
        suffix: "", // 后缀(数字的后缀 ,根据需要可设为 元,个,美元 等)
      },
      selectFlag: 1,
      selectList: [
        {
          class: "select-box-left",
          classActive: "select-box-left_active",
          name: "算力全景",
          key: 1,
        },
        {
          class: "select-box-center",
          classActive: "select-box-center_active",
          name: "通用计算",
          key: 2,
        },
        {
          class: "select-box-center",
          classActive: "select-box-center_active",
          name: "智能计算",
          key: 3,
        },
        {
          class: "select-box-right",
          classActive: "select-box-right_active",
          name: "超级计算",
          key: 4,
        },
      ],
      dataListAll: [],
      dataList: [
        // {
        //   value: 2283,
        //   unit: "万核",
        //   title: "CPU",
        // },
        // {
        //   value: 4390,
        //   unit: "TB",
        //   title: "内存",
        // },
        // {
        //   value: 9811,
        //   unit: "WTB",
        //   title: "存储",
        // },
        // {
        //   value: 1092,
        //   unit: "个",
        //   title: "资源池数",
        // },
      ],
    };
  },
  watch: {},
  computed: {},
  methods: {
    // changeFlag(key) {
    //   this.selectFlag = key;
    //   this.dataListAll.forEach((element) => {
    //     if (element.type === this.selectFlag) {
    //       this.dataList = [];
    //       element.details.forEach((val) => {
    //         this.dataList.push({
    //           value: val.count,
    //           unit:
    //             val.type == 1
    //               ? "万核"
    //               : val.type == 2
    //               ? "WTB"
    //               : val.type == 3
    //               ? "WTB"
    //               : val.type == 4
    //               ? "PFLOPS"
    //               : "",
    //           title:
    //             val.type == 1
    //               ? "CPU"
    //               : val.type == 2
    //               ? "内存"
    //               : val.type == 3
    //               ? "存储"
    //               : val.type == 4
    //               ? "加速卡"
    //               : "",
    //         });
    //       });
    //     }
    //   });
    // },
    getProvincialDataList() {
      getProvincialDataList({
        province: "江苏",
        pageNo: "1",
        category: 0,
        pageSize: "10",
      }).then((res) => {
        if (res.code == 0) {
          this.dataListAll = res.data.list;
          this.dataList = res.data.list;
          // this.changeFlag(1);
        }
      });
    },
  },
  created() {},
  mounted() {
    this.getProvincialDataList();
    setTimeout(() => {
      this.showNum = true;
    }, 1500);
  },
};
</script>
<style lang="scss" scoped>
// @import '../../../assets/css/YouSheBiaoTiHei.css';
.active_font {
  background: linear-gradient(to bottom, #fff, #90deff);
  -webkit-background-clip: text;
  color: transparent;
}
.center-content {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  padding: 0px;
  .title-background {
    width: 100%;
    height: 46px;
    margin-top: 13px;
    background-image: url("../../../assets/images/dataScreen/title-background.png");
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .select-box {
      width: 120px;
      height: 40px;
      font-weight: 400;
      font-size: 16px;
      color: #c3d0ea;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .select-box-left {
      background-image: url("../../../assets/images/dataScreen/select-box-left.png");
      background-size: 100% 100%;
    }

    .select-box-left_active {
      font-weight: 600;
      height: 52px;
      background-position-y: 6px;
      background-image: url("../../../assets/images/dataScreen/select-box-left_active.png");
      background-size: 100% 100%;
    }
    .select-box-center {
      margin-left: 10px;
      background-image: url("../../../assets/images/dataScreen/select-box-center.png");
      background-size: 100% 100%;
    }
    .select-box-center_active {
      font-weight: 600;
      height: 52px;
      margin-left: 10px;
      background-position-y: 6px;
      background-image: url("../../../assets/images/dataScreen/select-box-center_active.png");
      background-size: 100% 100%;
    }
    .select-box-right {
      margin-left: 10px;
      background-image: url("../../../assets/images/dataScreen/select-box-right.png");
      background-size: 100% 100%;
    }
    .select-box-right_active {
      font-weight: 600;
      height: 52px;
      margin-left: 10px;
      background-position-y: 6px;
      background-image: url("../../../assets/images/dataScreen/select-box-right_active.png");
      background-size: 100% 100%;
    }
  }
  .title-message {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0px 80px;
    .value-box {
      display: flex;
      align-items: center;
      flex-direction: column;
      margin-top: 20px;
      .value-main {
        width: 120px;
        height: 45px;
        background-image: url("../../../assets/images/dataScreen/value-main.png");
        background-size: 100% 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 4px;
        .value-num {
          font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
          color: #ffffff;
          font-size: 22px;
          font-weight: 600;
        }
        .value-unit {
          color: #ffffff;
          font-size: 14px;
          font-face: PingFangSC;
          font-weight: 600;
          padding-top: 2px;
        }
      }
      .title {
        font-weight: 600;
        font-size: 16px;
        color: #ffffff;
        text-align: center;
        text-shadow: 0 0 10px #1ec6ffcc;
      }
      .title-light {
        width: 100px;
        height: 12px;
        background-image: url("../../../assets/images/dataScreen/title-light.png");
        background-size: 100% 100%;
      }
    }
  }
}
</style>
