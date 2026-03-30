<template>
  <div style="position: relative;">
    <div
      v-if="type === '2'"
      class="verify-img-out"
      :style="{height: (parseInt(setSize.imgHeight) + vSpace) + 'px'}"
    >
      <div
        class="verify-img-panel"
        :style="{width: setSize.imgWidth,
                 height: setSize.imgHeight,}"
      >
        <img :src="backImgBase?('data:image/png;base64,'+backImgBase):defaultImg" alt="" style="width:100%;height:100%;display:block">
        <div v-show="showRefresh" class="verify-refresh" @click="refresh">
          <i class="iconfont icon-refresh" />
        </div>
        <!-- 添加滑动引导动画 -->
        <div v-if="showGuide" class="verify-guide">
          <div class="guide-arrow">→</div>
          <div class="guide-text">{{ $t('common.slideVerify.guideText') }}</div>
        </div>
        <transition name="tips">
          <span v-if="tipWords" class="verify-tips" :class="passFlag ?'suc-bg':'err-bg'">{{ tipWords }}</span>
        </transition>
      </div>
    </div>
    <!-- 公共部分 -->
    <div
      class="verify-bar-area"
      :style="{width: setSize.imgWidth,
               height: barSize.height,
               'line-height':barSize.height}"
    >
      <span class="verify-msg">{{ $t('common.slideVerify.explain') }}</span>
      <div
        class="verify-left-bar"
        :style="{width: (leftBarWidth!==undefined)?leftBarWidth: barSize.height, height: barSize.height, 'border-color': leftBarBorderColor, transaction: transitionWidth}"
      >
        <span class="verify-msg" v-text="finishText" />
        <div
          class="verify-move-block"
          :style="{width: barSize.height, height: barSize.height, 'background-color': moveBlockBackgroundColor, left: moveBlockLeft, transition: transitionLeft}"
          @touchstart="start"
          @mousedown="start"
        >
          <i
            :class="['verify-icon iconfont', iconClass]"
            :style="{color: iconColor}"
          />
          <div
            v-if="type === '2'"
            class="verify-sub-block"
            :style="{'width':Math.floor(parseInt(setSize.imgWidth)*47/310)+ 'px',
                     'height': setSize.imgHeight,
                     'top':'-' + (parseInt(setSize.imgHeight) + vSpace) + 'px',
                     'background-size': setSize.imgWidth + ' ' + setSize.imgHeight,
            }"
          >
            <img :src="'data:image/png;base64,'+blockBackImgBase" alt="" style="width:100%;height:100%;display:block">
          </div>
        </div>
      </div>
      <!-- 添加进度提示 -->
      <div v-if="showProgress" class="verify-progress">
        <div class="progress-bar" :style="{width: progressWidth + '%'}"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/babel">
/**
 * VerifySlide
 * @description 滑块
 * */
import { aesEncrypt } from '@/utils/ase'
import { resetSize } from './../utils/util'
import { reqGet, reqCheck } from '@/api/login'

export default {
  name: 'VerifySlide',
  props: {
    captchaType: {
      type: String,
    },
    type: {
      type: String,
      default: '1'
    },
    mode: {
      type: String,
      default: 'fixed'
    },
    vSpace: {
      type: Number,
      default: 5
    },
    explain: {
      type: String,
      default: function() {
        return this.$t('common.slideVerify.explain')
      }
    },
    imgSize: {
      type: Object,
      default() {
        return {
          width: '310px',
          height: '155px'
        }
      }
    },
    blockSize: {
      type: Object,
      default() {
        return {
          width: '50px',
          height: '50px'
        }
      }
    },
    barSize: {
      type: Object,
      default() {
        return {
          width: '310px',
          height: '40px'
        }
      }
    },
    defaultImg: {
      type: String,
      default: ''
    },
    // 新增配置项
    tolerance: { // 容错范围，单位像素
      type: Number,
      default: 8
    },
    maxTime: { // 最大验证时间（秒），超过此时间不会失败，只是提示
      type: Number,
      default: 30
    },
    showGuide: { // 是否显示引导
      type: Boolean,
      default: true
    },
    showProgress: { // 是否显示进度条
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      secretKey: '',
      passFlag: '',
      backImgBase: '',
      blockBackImgBase: '',
      backToken: '',
      startMoveTime: '',
      endMovetime: '',
      tipsBackColor: '',
      tipWords: '',
      text: '',
      finishText: '',
      setSize: {
        imgHeight: 0,
        imgWidth: 0,
        barHeight: 0,
        barWidth: 0
      },
      top: 0,
      left: 0,
      moveBlockLeft: undefined,
      leftBarWidth: undefined,
      moveBlockBackgroundColor: undefined,
      leftBarBorderColor: '#ddd',
      iconColor: undefined,
      iconClass: 'icon-right',
      status: false,
      isEnd: false,
      showRefresh: true,
      transitionLeft: '',
      transitionWidth: '',
      // 新增数据
      progressWidth: 0,
      guideTimer: null,
      timeLimitTimer: null,
      remainingTime: this.maxTime
    }
  },
  computed: {
    barArea() {
      return this.$el.querySelector('.verify-bar-area')
    },
    resetSize() {
      return resetSize
    }
  },
  watch: {
    type: {
      immediate: true,
      handler() {
        this.init()
      }
    }
  },
  mounted() {
    this.$el.onselectstart = function() {
      return false
    }
  },
  beforeDestroy() {
    this.clearTimers()
  },
  methods: {
    init() {
      this.text = this.explain
      this.getPictrue()
      this.$nextTick(() => {
        const setSize = this.resetSize(this)
        for (const key in setSize) {
          this.$set(this.setSize, key, setSize[key])
        }
        this.$parent.$emit('ready', this)
      })

      this.bindEvents()
      this.startGuideAnimation()
    },

    // 绑定事件
    bindEvents() {
      const _this = this

      // 移除旧事件
      window.removeEventListener('touchmove', _this.move)
      window.removeEventListener('mousemove', _this.move)
      window.removeEventListener('touchend', _this.end)
      window.removeEventListener('mouseup', _this.end)

      // 绑定新事件
      window.addEventListener('touchmove', _this.move)
      window.addEventListener('mousemove', _this.move)
      window.addEventListener('touchend', _this.end)
      window.addEventListener('mouseup', _this.end)
    },

    // 开始引导动画
    startGuideAnimation() {
      if (!this.showGuide) return

      this.clearTimers()
      this.guideTimer = setInterval(() => {
        const guide = this.$el.querySelector('.verify-guide')
        if (guide) {
          guide.style.opacity = guide.style.opacity === '0.5' ? '1' : '0.5'
        }
      }, 800)
    },

    // 清除定时器
    clearTimers() {
      if (this.guideTimer) {
        clearInterval(this.guideTimer)
        this.guideTimer = null
      }
      if (this.timeLimitTimer) {
        clearInterval(this.timeLimitTimer)
        this.timeLimitTimer = null
      }
    },

    // 开始时间限制计时
    startTimeLimit() {
      this.remainingTime = this.maxTime
      this.clearTimers()

      this.timeLimitTimer = setInterval(() => {
        this.remainingTime--
        if (this.remainingTime <= 0) {
          this.clearTimers()
          this.tipWords = this.$t('common.slideVerify.timeLimit')
          setTimeout(() => {
            this.refresh()
          }, 2000)
        }
      }, 1000)
    },

    // 鼠标按下
    start: function(e) {
      let x
      e = e || window.event
      if (!e.touches) {
        x = e.clientX
      } else {
        x = e.touches[0].pageX
      }
      this.startLeft = Math.floor(x - this.barArea.getBoundingClientRect().left)
      this.startMoveTime = +new Date()

      if (this.isEnd === false) {
        this.text = ''
        this.moveBlockBackgroundColor = '#337ab7'
        this.leftBarBorderColor = '#337AB7'
        this.iconColor = '#fff'
        // 隐藏引导
        this.showGuide = false
        this.clearTimers()
        // 开始时间限制
        this.startTimeLimit()

        e.stopPropagation()
        this.status = true
      }
    },

    // 鼠标移动
    move: function(e) {
      let x
      e = e || window.event
      if (this.status && this.isEnd === false) {
        if (!e.touches) {
          x = e.clientX
        } else {
          x = e.touches[0].pageX
        }
        const bar_area_left = this.barArea.getBoundingClientRect().left
        let move_block_left = x - bar_area_left

        if (move_block_left >= this.barArea.offsetWidth - parseInt(parseInt(this.blockSize.width) / 2) - 2) {
          move_block_left = this.barArea.offsetWidth - parseInt(parseInt(this.blockSize.width) / 2) - 2
        }
        if (move_block_left <= 0) {
          move_block_left = parseInt(parseInt(this.blockSize.width) / 2)
        }

        this.moveBlockLeft = (move_block_left - this.startLeft) + 'px'
        this.leftBarWidth = (move_block_left - this.startLeft) + 'px'

        // 更新进度条
        const maxMove = this.barArea.offsetWidth - parseInt(this.blockSize.width)
        const currentMove = parseInt(this.moveBlockLeft)
        this.progressWidth = (currentMove / maxMove) * 100
      }
    },

    // 鼠标松开
    end: function() {
      this.endMovetime = +new Date()
      const _this = this

      if (this.status && this.isEnd === false) {
        this.clearTimers()

        let moveLeftDistance = parseInt((this.moveBlockLeft || '').replace('px', ''))
        moveLeftDistance = moveLeftDistance * 310 / parseInt(this.setSize.imgWidth)
        if (isNaN(moveLeftDistance)) {
          this.status = false
          return;
        }
        const data = {
          captchaType: this.captchaType,
          'pointJson': this.secretKey ?
            aesEncrypt(JSON.stringify({
              x: moveLeftDistance,
              y: 5.0,
              tolerance: this.tolerance // 传递容错范围
            }), this.secretKey) :
            JSON.stringify({
              x: moveLeftDistance,
              y: 5.0,
              tolerance: this.tolerance
            }),
          'token': this.backToken
        }

        reqCheck(data).then(res => {
          if (res.repCode === '0000') {
            this.handleSuccess(moveLeftDistance)
          } else {
            this.handleFailure(_this, moveLeftDistance, res)
          }
        }).catch(error => {
        console.error('验证请求失败:', error)
        this.handleFailure(_this, moveLeftDistance, { repMsg: this.$t('common.slideVerify.networkError') })
      })

        this.status = false
      }
    },

    // 处理验证成功
    handleSuccess(moveLeftDistance) {
      this.moveBlockBackgroundColor = '#5cb85c'
      this.leftBarBorderColor = '#5cb85c'
      this.iconColor = '#fff'
      this.iconClass = 'icon-check'
      this.showRefresh = false
      this.isEnd = true
      this.progressWidth = 100

      const timeSpent = ((this.endMovetime - this.startMoveTime) / 1000).toFixed(2)

      // 根据花费时间给出不同的鼓励提示
      let encouragement = ''
      if (timeSpent < 3) {
        encouragement = this.$t('common.slideVerify.encouragement.fast')
      } else if (timeSpent < 8) {
        encouragement = this.$t('common.slideVerify.encouragement.good')
      } else {
        encouragement = this.$t('common.slideVerify.encouragement.success')
      }

      this.tipWords = `${encouragement} ${timeSpent}s${this.$t('common.slideVerify.success')}`

      const captchaVerification = this.secretKey ?
        aesEncrypt(this.backToken + '---' + JSON.stringify({
          x: moveLeftDistance,
          y: 5.0
        }), this.secretKey) :
        this.backToken + '---' + JSON.stringify({ x: moveLeftDistance, y: 5.0 })

      // 延长成功提示显示时间
      setTimeout(() => {
        this.tipWords = ''
        this.$parent.closeBox()
        this.$parent.$emit('success', { captchaVerification })
      }, 1500) // 从1000ms延长到1500ms

      if (this.mode === 'pop') {
        setTimeout(() => {
          this.$parent.clickShow = false
          this.refresh()
        }, 2000) // 从1500ms延长到2000ms
      }

      this.passFlag = true
    },

    // 处理验证失败
    handleFailure(_this, moveLeftDistance, res) {
      this.moveBlockBackgroundColor = '#d9534f'
      this.leftBarBorderColor = '#d9534f'
      this.iconColor = '#fff'
      this.iconClass = 'icon-close'
      this.passFlag = false

      // 更友好的错误提示
      let errorMsg = this.$t('common.slideVerify.failure')
      if (res.repMsg && res.repMsg.includes('位置')) {
        errorMsg = this.$t('common.slideVerify.positionError')
      } else if (res.repMsg) {
        errorMsg = res.repMsg
      }

      this.tipWords = errorMsg

      // 延长失败提示显示时间
      setTimeout(function() {
        _this.refresh()
      }, 2000) // 从1000ms延长到2000ms

      this.$parent.$emit('error', this)
    },

    refresh: function() {
      this.showRefresh = true
      this.finishText = ''
      this.progressWidth = 0

      this.transitionLeft = 'left .3s'
      this.moveBlockLeft = 0

      this.leftBarWidth = undefined
      this.transitionWidth = 'width .3s'

      this.leftBarBorderColor = '#ddd'
      this.moveBlockBackgroundColor = '#fff'
      this.iconColor = '#000'
      this.iconClass = 'icon-right'
      this.isEnd = false
      this.showGuide = this.$props.showGuide

      this.clearTimers()
      this.getPictrue()

      setTimeout(() => {
        this.transitionWidth = ''
        this.transitionLeft = ''
        this.startGuideAnimation()
      }, 300)
    },

    // 请求背景图片和验证图片
    getPictrue() {
      const data = {
        captchaType: this.captchaType,
        clientUid: localStorage.getItem('slider'),
        ts: Date.now(),
        config: { // 传递配置到后端
          tolerance: this.tolerance,
          maxTime: this.maxTime
        }
      }
      reqGet(data).then(res => {
        if (res.repCode === '0000') {
          this.backImgBase = res.repData.originalImageBase64
          this.blockBackImgBase = res.repData.jigsawImageBase64
          this.backToken = res.repData.token
          this.secretKey = res.repData.secretKey
        } else {
          this.tipWords = res.repMsg
        }

        if (res.repCode === '6201') {
          this.backImgBase = null
          this.blockBackImgBase = null
        }
      }).catch(error => {
        console.error('获取验证码失败:', error)
        this.tipWords = this.$t('common.slideVerify.loadError')
      })
    },
  },
}
</script>

<style scoped>
/* 新增样式 */
.verify-guide {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 20px;
  border-radius: 20px;
  transition: opacity 0.8s ease;
  z-index: 10;
}

.guide-arrow {
  font-size: 24px;
  margin-bottom: 5px;
  animation: bounce 1.5s infinite;
}

.guide-text {
  font-size: 14px;
}

@keyframes bounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(10px); }
}

.verify-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #f0f0f0;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #337ab7, #5cb85c);
  transition: width 0.1s ease;
  border-radius: 0 0 4px 4px;
}

/* 优化原有样式 */
.verify-tips {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  z-index: 100;
  line-height: 16px;
}

.verify-refresh {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 6px;
  transition: all 0.3s ease;
}

.verify-refresh:hover {
  background: rgba(255, 255, 255, 1);
  transform: rotate(180deg);
}
</style>
