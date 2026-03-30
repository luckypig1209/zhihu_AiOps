<template>
  <div
    class="scroll-wrapper"
    ref="container"
    :style="{ height: `${height}px` }"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div
      class="scroll-content"
      :style="{ transform: `translateY(${offset}px)` }"
    >
      <div
        v-for="(item, index) in visibleItems"
        :key="`${uid}-${index}`"
        class="scroll-item"
      >
        <slot :item="item">{{ item }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, required: true },
    height: { type: Number, default: 300 },
    speed: { type: Number, default: 1 },
    itemHeight: { type: Number, default: 40 },
  },
  data() {
    return {
      offset: 0,
      timer: null,
      isPaused: false,
      uid: Math.random().toString(36).substr(2, 9),
      visibleCount: 0,
    };
  },
  computed: {
    visibleItems() {
      return [...this.items, ...this.items.slice(0, this.visibleCount)];
    },
  },
  watch: {
    items: {
      immediate: true,
      handler() {
        if (this.items.length > 3) {
          this.$nextTick(this.initScroll);
        }
      },
    },
  },
  mounted() {
    if (this.items.length > 3) {
      this.initScroll();
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    initScroll() {
      clearInterval(this.timer);
      this.offset = 0;
      this.visibleCount = Math.ceil(this.height / this.itemHeight) + 2;
      this.startScroll();
    },
    startScroll() {
      this.timer = setInterval(() => {
        if (this.isPaused || !this.items.length) return;

        this.offset -= this.speed;

        if (Math.abs(this.offset) >= this.items.length * this.itemHeight) {
          this.offset = 0;
        }
      }, 75);
    },
    pause() {
      this.isPaused = true;
    },
    resume() {
      this.isPaused = false;
    },
  },
};
</script>

<style scoped>
.scroll-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
}

.scroll-content {
  position: absolute;
  width: 98%;
  will-change: transform;
}

.scroll-item {
  height: 40px;
  display: flex;
  align-items: center;
  /* padding: 0 20px; */
  /* border-bottom: 1px solid rgba(255,255,255,0.3); */
  font-size: 16px;
  color: #fff;
  /* background: rgba(255,255,255,0.7); */
  transition: all 0.3s;
  /* background-image: url("../../../assets/images/dataScreen/userContent.png"); */
  background-size: 100% 100%;
}

.scroll-item:hover {
  /* background: rgba(255,255,255,0.9); */
  transform: scale(1.02);
  cursor: pointer;
}
</style>
