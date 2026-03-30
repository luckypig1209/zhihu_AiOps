<template>
  <div class="device-detail-page">
    <!-- 顶部标签栏 -->
    <a-tabs v-model="activeTab" class="device-tabs">
      <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.title"></a-tab-pane>
    </a-tabs>
    <!-- 网络设备 -->
    <!-- <div v-if="assertInfo.modelCode === 'networkdevice'">   -->
    <allShow :selectRow="selectRow" v-if="activeTab == 'overview'"></allShow>
    <videoPlayer v-if="activeTab == 'videoPlayer' && assertInfo.modelCode === 'terminaldevice'" 
      :video-url="videoUrl"
      video-title="测试监控视频" poster-url="https://picsum.photos/800/450" :isLive="true" />
    <!-- <hardwareStatus v-if="activeTab == 'hardware'"></hardwareStatus> -->
    <!-- <netWorkStatus v-if="activeTab == 'network'"></netWorkStatus> -->
    <!-- <neighborInfo v-if="activeTab == 'neighbor'"></neighborInfo> -->
    <monitoringMetrics :selectRow="selectRow" v-if="activeTab == 'trend'"></monitoringMetrics>
    <metricMonitor :selectId="selectRow.id" v-if="activeTab == 'monitor'"></metricMonitor>
    <alarmRule :selectId="selectRow.id" v-if="activeTab == 'alarm-rule' && assertInfo.modelCode !== 'ztkeeper'"></alarmRule>
    <alarmHistory :selectId="selectRow.id" v-if="activeTab == 'alarm-history'"></alarmHistory>

  </div>
</template>

<script>
import Vue from 'vue';
import * as echarts from 'echarts';
import allShow from './allShow.vue'
import hardwareStatus from './hardwareStatus.vue'
import netWorkStatus from './netWorkStatus.vue'
import neighborInfo from './neighborInfo.vue'
import monitoringMetrics from './monitoringMetrics.vue'
import metricMonitor from './metricMonitor.vue'
import alarmRule from './alarmRule.vue'
import alarmHistory from './alarmHistory.vue';
import videoPlayer from '@/components/xgVideo/index.vue'
import {
  getPlayUrl,// 获取视频地址
} from '@/api/productFind'
export default Vue.extend({
  name: 'DeviceDetail',
  components: {
    allShow,
    hardwareStatus,
    netWorkStatus,
    neighborInfo,
    monitoringMetrics,
    metricMonitor,
    alarmRule,
    alarmHistory,
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
      videoUrl: '',
      activeTab: 'overview',
      tabs: [
        { key: 'overview', title: this.$t('common.overview') },
        // { key: 'hardware', title: '硬件状态' },
        // { key: 'network', title: '网络状态' },
        // { key: 'neighbor', title: '邻居信息' },
        { key: 'trend', title: this.$t('common.metricTrend') },
        { key: 'monitor', title: this.$t('common.monitoringMetrics') },
        { key: 'alarm-rule', title: this.$t('common.alarmRule') },
        { key: 'alarm-history', title: this.$t('common.alarmHistory') }
      ],
      videoInfo:{},
    };
  },
  mounted() {
  
    if(this.assertInfo.modelCode === 'terminaldevice'){
      this.tabs =  [
        { key: 'overview', title: this.$t('common.overview') },
        { key: 'videoPlayer', title: this.$t('common.videoDetail') },
        // { key: 'hardware', title: '硬件状态' },
        // { key: 'network', title: '网络状态' },
        // { key: 'neighbor', title: '邻居信息' },
        { key: 'trend', title: this.$t('common.metricTrend') },
        { key: 'monitor', title: this.$t('common.monitoringMetrics') },
        { key: 'alarm-rule', title: this.$t('common.alarmRule') },
        { key: 'alarm-history', title: this.$t('common.alarmHistory') }
      ]
      this.videoInfo = {
        devId: this.selectRow?.videoDevId || undefined,
        channelld: this.selectRow?.videoChannelId  || undefined,
        loginName: this.selectRow?.videoCustomerAccount || undefined,
      }
      let params = {
        // "devId": this.videoInfo.devId,
        // "channelId": this.videoInfo.channelld,
        // "customerAccount": this.videoInfo.loginName,
        assetId: this.selectRow?.id || '',
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
      });
    } else if(this.assertInfo.modelCode === 'ztkeeper'){
      this.tabs =  [
        { key: 'overview', title: this.$t('common.overview') },
        // { key: 'videoPlayer', title: '视频详情' },
        // { key: 'hardware', title: '硬件状态' },
        // { key: 'network', title: '网络状态' },
        // { key: 'neighbor', title: '邻居信息' },
        { key: 'trend', title: this.$t('common.metricTrend') },
        { key: 'monitor', title: this.$t('common.monitoringMetrics') },
        // { key: 'alarm-rule', title: '告警规则' },
        { key: 'alarm-history', title: this.$t('common.alarmHistory') }
      ]
    }
  },
  beforeDestroy() {
  },
  methods: {
  }
});
</script>

<style scoped></style>