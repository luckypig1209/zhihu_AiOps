<template>
  <div v-loading="urlLoading" style="height: calc(100vh - 78px); position: relative;">
    <!-- 全屏按钮 - 优化样式和定位 -->
    <div 
      class="fullscreen-btn"
      @click="goBack()"
    >
      {{ $t('common.fullscreen') }}
    </div>
    <iframe 
      id="kibana" 
      class="iframe-style" 
      :src="externalUrl" 
      ref="Iframe"  
      frameborder="0" 
      width="100%" 
      height="100%"
    ></iframe>
  </div>
</template>

<script>
import iFrame from "@/components/iFrame/index";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";

export default {
  components: { iFrame },
  data() {
    return {
      externalUrl: '/show/dataScreen',
      urlLoading: false
    };
  },
  mounted() {
    // 获取字典中的URL数据
    const urlList = getDictDatas(DICT_TYPE.SCREEN_URL);
    // 校验数据有效性
    if (urlList.length && urlList[0] && urlList[0].value) {
      const rawUrl = urlList[0].value;
      // 判断是否以http开头（兼容http和https）
      if (rawUrl.startsWith('http')) {
        this.externalUrl = rawUrl;
      } else {
        // 非http开头则拼接当前域名
        this.externalUrl = `${window.location.origin}/screen${rawUrl}`;
      }
    }
    // 兜底：如果字典无数据，仍使用初始的默认URL
  },
  methods: {
    goBack() {
      // const routeData = this.$router.resolve({
      //   path: this.externalUrl,
      // });
      window.open(this.externalUrl, "_blank");
    }
  }  
};
</script>

<style scoped lang="less">
// 父容器需要设置相对定位，作为按钮绝对定位的参考
.iframe-style {
  height: calc(100% - 5px);
}

// 全屏按钮样式优化
.fullscreen-btn {
  // 绝对定位到右上角（相对父容器）
  position: absolute;
  top: 10px;
  right: 10px;
  // z-index确保按钮在iframe上方显示
  z-index: 999;
  // 按钮样式优化
  padding: 8px 16px;
  background: rgba(45, 140, 240, 0.9);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  // 鼠标悬浮效果
  &:hover {
    background: rgba(45, 140, 240, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  // 禁止文本选中
  user-select: none;
}
</style>