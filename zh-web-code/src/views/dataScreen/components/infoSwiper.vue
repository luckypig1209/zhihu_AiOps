<template>
  <div class="carousel-container">
    <!-- 轮播主体 -->
    <swiper
      ref="mySwiper"
      :options="swiperOptions"
      @slideChange="onSlideChange"
    >
      <!-- 幻灯片内容 -->
      <swiper-slide
        v-for="(item, index) in infoList"
        :key="item.number + item.category"
      >
        <div class="value-box">
          <div class="value-main">
            <div class="value-num">
              <!-- <VueCountUp
                v-if="showNum"
                :key="item.number + item.category"
                :delay="allCountDuration"
                :options="{
                  ...options,
                  decimalPlaces: getDecimalPlaces(item.number),
                }"
                :endVal="item.number"
              /> -->
              {{ item.number }}
            </div>
          </div>
          <div class="title">
            <span> {{ item.category }}</span>
            <span class="value-unit">/{{ item.unit }} </span>
          </div>
          <div class="title-light"></div>
        </div>
      </swiper-slide>

      <!-- 分页器 -->
      <div class="swiper-pagination" slot="pagination"></div>

      <!-- 导航按钮 -->
      <div class="swiper-button-prev" slot="button-prev"></div>
      <div class="swiper-button-next" slot="button-next"></div>
    </swiper>
  </div>
</template>

<script>
export default {
  name: "Carousel",
  props: ["infoList"],
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
      // 轮播配置项
      swiperOptions: {
        // 基础配置
        loop: true,
        speed: 500,
        autoplay: {
          delay: 2000,
          disableOnInteraction: false, // 用户操作后是否停止自动轮播，默认为 true
          pauseOnMouseEnter: true // 鼠标悬停时暂停 // 鼠标进入时是否暂停自动轮播，默认为 true
        },
        // 分页器
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          dynamicBullets: true,
        },
        pagination: false,
        // 导航按钮
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        // 响应式断点 不同分辨率展示不同个数
        breakpoints: {
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 0,
          },
        },
      },
      // 幻灯片数据
    };
  },
  computed: {
    // 获取swiper实例
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
  },
  methods: {
    getDecimalPlaces(num) {
      if (!num) {
        return 0;
      }
      if (Number.isInteger(num)) {
        return null;
      }
      const decimalPart = num.toString().split(".")[1];
      return decimalPart ? decimalPart.length : null;
    },
    // 幻灯片切换回调
    onSlideChange() {
      // console.log("当前幻灯片索引:", this.swiper.realIndex);
    },
  },
  mounted() {
    // console.log("Swiper实例:", this.swiper);
    setTimeout(() => {
      this.showNum = true;
    }, 1500);
  },
};
</script>

<style lang="scss" scoped>
.carousel-container {
  width: 700px;
  margin: 0 auto;
  position: relative;
}
::v-deep.swiper-container {
  height: 100%;
  position: unset;
}

.slide-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.slide-content {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

/* 自定义导航按钮样式 */
.swiper-button-prev {
  width: 26px;
  height: 32px;
  background-image: url("../../../assets/images/dataScreen/button-prev.png") !important;
  background-size: 100% 100%;
  position: absolute;
  z-index: 100;
  left: -38px;
}
.swiper-button-next {
  width: 26px;
  height: 32px;
  background-image: url("../../../assets/images/dataScreen/button-next.png")!important;
  background-size: 100% 100%;
  position: absolute;
  z-index: 100;
  right: -38px;
}

/* 自定义分页器样式 */
.swiper-pagination-bullet {
  width: 12px;
  height: 12px;
  background: #fff;
  opacity: 0.5;
}

.swiper-pagination-bullet-active {
  opacity: 1;
  background: #007bff;
}
.value-box {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 20px;
  .value-main {
    width: 156px;
    height: 54px;
    background-image: url("../../../assets/images/dataScreen/value-main.png");
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 4px;
    .value-num {
      background: linear-gradient(to bottom, #fff, #90deff);
      -webkit-background-clip: text;
      color: transparent;
      font-family: YouSheBiaoTiHei, YouSheBiaoTiHei;
      font-size: 28px;
      font-weight: 600;
    }
  }
  .title {
    font-weight: 600;
    font-size: 16px;
    color: #ffffff;
    text-align: center;
    text-shadow: 0 0 10px #1ec6ffcc;
    .value-unit {
      color: #ffffff;
      font-size: 12px;
      font-face: PingFangSC;
      font-weight: 600;
      padding-top: 2px;
    }
  }
  .title-light {
    width: 100px;
    height: 12px;
    background-image: url("../../../assets/images/dataScreen/title-light.png");
    background-size: 100% 100%;
  }
}
</style>
