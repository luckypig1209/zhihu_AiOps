<template>
  <div @click="click">
    <span class="circle-bg" @click="click" >
      <svg-icon :icon-class="isFullscreen?'exit-fullscreen':'fullscreen'"  />
    </span>
  </div>
</template>

<script>
import screenfull from 'screenfull'

export default {
  name: 'Screenfull',
  data() {
    return {
      isFullscreen: false
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.destroy()
  },
  methods: {
    click() {
      if (!screenfull.isEnabled) {
        this.$message({ message: '你的浏览器不支持全屏', type: 'warning' })
        return false
      }
      screenfull.toggle()
    },
    change() {
      this.isFullscreen = screenfull.isFullscreen
    },
    init() {
      if (screenfull.isEnabled) {
        screenfull.on('change', this.change)
      }
    },
    destroy() {
      if (screenfull.isEnabled) {
        screenfull.off('change', this.change)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.screenfull-svg {
  display: inline-block;
  cursor: pointer;
  fill: #333;;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
  border: 1px solid #333;
}
.circle-bg {
  display: inline-block;
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    font-size: 16px;
    color: #333;
  }
}
</style>
