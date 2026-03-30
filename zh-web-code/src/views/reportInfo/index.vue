<template>
  <div v-loading="urlLoading" style="height: calc(100vh - 130px);margin-top: 50px;">
    <iframe id="kibana" class="iframe-style" :src="externalUrl" ref="Iframe"  frameborder="0" width="100%" height="100%"></iframe>
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
export default {
  components: { iFrame },
  data() {
    return {
      externalUrl: '/faultManage/alarmScreen',
      urlLoading: false
    }
  },
  mounted(){
    let url = getDictDatas(DICT_TYPE.ALARM_URL)
    if(url.length && url[0]){
      this.externalUrl = url[0].value
    }
  }
}
</script>
<style scoped lang="less">
.iframe-style{
  margin-top: -50px;
  height: calc(100% + 50px)
}
</style>