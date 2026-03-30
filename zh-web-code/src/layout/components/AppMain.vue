<template>
  <section :class="key === '/schedule/work_schedule'? 'app-main no-scroll':'app-main'">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view v-if="!$route.meta.link" :key="key" />
      </keep-alive>
    </transition>
    <iframe-toggle />
  </section>
</template>

<script>
import iframeToggle from "./IframeToggle/index"

export default {
  name: 'AppMain',
  components: { iframeToggle },
  computed: {
    cachedViews() {
      return this.$store.state.tagsView.cachedViews
    },
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
.app-main {
  /* 50= navbar  50  */
  height: 90vh !important;
  // width: 98%;
  position: relative;
  // overflow: hidden;
  border-radius: 0;
  box-shadow: 0;
  margin: 10px;
  background-color: rgba(0, 0, 0, 0); 
  overflow-y: hidden;
  height:  calc(100vh - 150px);;
  // padding-top: 20px;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 99 = navbar + tags-view = 50 + 59 */
    // min-height: calc(100vh - 130px);
    &.no-scroll { // 值班表页面禁用section滚动
      overflow: hidden;
    }
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 17px;
  }
}
</style>
