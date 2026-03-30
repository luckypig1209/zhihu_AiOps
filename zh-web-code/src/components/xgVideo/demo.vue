<template>
  <div class="device-detail-page" style="min-height: 80vh;" v-loading="!isLoading" >
     <videoPlayer
      v-if="isLoading"
      :video-url="videoUrl"
      :hasTip="false"
      video-title="测试监控视频" poster-url="https://picsum.photos/800/450" :isLive="true" />

  </div>
</template>

<script>
import Vue from 'vue';
import * as echarts from 'echarts';
import videoPlayer from '@/components/xgVideo/index.vue'
import {
  getPlayUrl,// 获取视频地址
} from '@/api/productFind'
export default Vue.extend({
  name: 'DeviceDetail',
  components: {
   
    videoPlayer
  },
  props: {
    selectRow: {
      type: Object,
      default: {
        id: 0
      }
    },
    assertInfo: {
      type: Object,
      default: {
        modelCode: 'networkdevice'
      }
    }
  },
  data() {
    return {
     isLoading: false,
      videoUrl: '',
      activeTab: 'overview',
      tabs: [
        { key: 'overview', title: '总览' },
        // { key: 'hardware', title: '硬件状态' },
        // { key: 'network', title: '网络状态' },
        // { key: 'neighbor', title: '邻居信息' },
        { key: 'trend', title: '指标趋势' },
        { key: 'monitor', title: '监控指标' },
        { key: 'alarm-rule', title: '告警规则' },
        { key: 'alarm-history', title: '告警历史' }
      ],
      videoInfo:{},
    };
  },
  mounted() {
    if(this.$route.query && this.$route.query?.assetId !== ''){
       this.isLoading = false  
      let params = {
        // "devId": this.videoInfo.devId,
        // "channelId": this.videoInfo.channelld,
        // "customerAccount": this.videoInfo.loginName,
        assetId: this.$route.query?.assetId || '',
        "urlType": "hls"
      }
      getPlayUrl(params).then(res => {
        let playUrl = res.data.playUrl;
        // 判断是否为相对地址（以/开头）
        if (playUrl.startsWith('/')) {
          // 获取当前页面的origin，并去除端口部分
          const origin = window.location.origin;
          const host = origin.replace(/:\d+$/, ''); // 移除端口号
          // 拼接完整URL
          playUrl = `${host}:21080${playUrl}`;
        }
        this.videoUrl = playUrl;
        this.isLoading = true
      });

    }

  },
  beforeDestroy() {
  },
  methods: {
  }
});
</script>

<style scoped></style>