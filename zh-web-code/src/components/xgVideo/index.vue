<template>
  <div class="video-wrapper">
    <div class="video-container">
      <video ref="videoRef" class="video-js vjs-default-skin vjs-big-play-centered" controls width="800"></video>
    </div>
    <div v-if="errorMessage" class="error-message" style="display: none">
      <h3>播放错误</h3>
      <p>{{ errorMessage }}</p>
      <el-button type="primary" @click="retryPlay">重试</el-button>
    </div>
    <div v-if="videoInfo && hasTip" class="video-info" style="display: none">
      <h3>视频信息</h3>
      <p><strong>播放器类型:</strong> {{ videoInfo.playerType }}</p>
      <p><strong>视频 URL:</strong> {{ videoInfo.url }}</p>
    </div>
  </div>
</template>

<script>
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming'; // HLS 插件
import Hls from 'hls.js';

export default {
  props: {
    // 从路由传递的参数
    dictId: {
      type: [String, Number],
      default: ''
    },
    // 视频URL参数
    videoUrl: {
      type: String,
      default: 'http://222.186.132.233:10005/rtp/0BFB0448/hls.m3u8?token=A9D90CECB899011F66529169DE19E4ACCAAA908634D95FC3C910AA709CC85EE3'
    },
    hasTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      player: null,
      hlsPlayer: null,
      errorMessage: '',
      videoInfo: null
    };
  },
  mounted() {
    this.initPlayer();
  },
  beforeDestroy() {
    this.disposePlayer();
  },
  methods: {
    disposePlayer() {
      if (this.player) {
        this.player.dispose();
        this.player = null;
      }
      if (this.hlsPlayer) {
        this.hlsPlayer.destroy();
        this.hlsPlayer = null;
      }
    },

    retryPlay() {
      this.disposePlayer();
      this.initPlayer();
    },

    initPlayer() {
      // 优先使用props传递的视频URL，否则使用默认URL
      const videoUrl = this.videoUrl;

      // 尝试使用 Hls.js 作为首选方案
      if (Hls.isSupported()) {
        this.tryHlsJs(videoUrl);
      } else if (this.$refs.videoRef.canPlayType('application/vnd.apple.mpegurl')) {
        // 如果浏览器原生支持 HLS (Safari)
        this.tryNativeHLS(videoUrl);
      } else {
        // 最后尝试 Video.js
        this.tryVideoJs(videoUrl);
      }
    },

    // 尝试使用 Hls.js
    tryHlsJs(videoUrl) {
      try {
        this.errorMessage = '';
        this.hlsPlayer = new Hls({
          // 缓冲控制相关参数 [citation:6][citation:7]
          maxBufferLength: 60,           // 目标最大缓冲长度（秒），默认30 [citation:7]
          maxBufferSize: 60 * 1024 * 1024, // 最大缓冲大小（字节），默认60MB [citation:7]
          maxMaxBufferLength: 600,       // 允许设置的最大缓冲长度上限（秒）[citation:7]
          backBufferLength: 90,          // 后向缓冲区长度的设置 [citation:5]

          // 网络请求超时控制 [citation:6][citation:7]
          manifestLoadingTimeOut: 15000, // 主m3u8清单加载超时（毫秒），默认10000 [citation:7]
          levelLoadingTimeOut: 15000,    // 音视频等级m3u8加载超时（毫秒），默认10000 [citation:7]
          fragLoadingTimeOut: 30000,     // 媒体分片(TS)加载超时（毫秒），默认20000 [citation:7]

          // 请求重试策略 [citation:7]
          manifestLoadingMaxRetry: 3,    // 主m3u8清单最大重试次数
          levelLoadingMaxRetry: 6,       // 等级m3u8清单最大重试次数
          fragLoadingMaxRetry: 6,        // 媒体分片最大重试次数

          // 启动与质量选择 [citation:5][citation:6]
          autoStartLoad: true,           // 是否自动开始加载
          startPosition: -1,             // 指定开始播放的位置，-1为从直播末尾开始 [citation:7]
          startLevel: -1,                // 初始清晰度等级，-1为自动选择 [citation:7]

          // 性能优化 [citation:6][citation:7]
          enableWorker: true,            // 启用Web Worker进行异步解析 [citation:7]
          lowBufferWatchdogPeriod: 0.5,  // 低缓冲区监测周期（秒）[citation:7]
          highBufferWatchdogPeriod: 3,   // 高缓冲区监测周期（秒）[citation:7]
          // 添加跨域配置
          xhrSetup: (xhr, url) => {
            xhr.withCredentials = false;
          }
        });

        // this.hlsPlayer.loadSource(videoUrl);
        this.hlsPlayer.attachMedia(this.$refs.videoRef);

        this.hlsPlayer.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('视频元素绑定成功，开始加载流');
          this.hlsPlayer.loadSource(videoUrl);
        });

        this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('媒体清单解析完成，可以开始播放');
          this.videoInfo = {
            playerType: 'Hls.js',
            url: videoUrl
          };
          setTimeout(() => {
            console.log('等待时间结束，开始播放');
            this.$refs.videoRef.play().catch(error => {
              console.error('播放失败:', error);
            });
          }, 3000); // 等待3000毫秒，即3秒
        });

        // this.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        //   console.log('HLS manifest parsed successfully');
        //   this.videoInfo = {
        //     playerType: 'Hls.js',
        //     url: videoUrl
        //   };
        // });

        this.hlsPlayer.on(Hls.Events.ERROR, (event, data) => {
          console.error('Hls.js error:', data);

          let errorMsg = `Hls.js 错误: ${data.type} - ${data.details}`;
          if (data.details === 'manifestLoadError') {
            errorMsg += ' (可能是跨域问题或流地址无效)';
          } else if (data.details === 'mediaError') {
            errorMsg += ' (媒体解码错误)';
          }

          this.errorMessage = errorMsg;

          // 如果是致命错误，尝试其他方案
          if (data.fatal) {
            this.hlsPlayer.destroy();
            this.hlsPlayer = null;

            if (data.type === 'networkError') {
              // 网络错误，尝试 Video.js
              this.tryVideoJs(videoUrl);
            } else if (data.type === 'mediaError') {
              // 媒体错误，尝试原生播放
              if (this.$refs.videoRef.canPlayType('application/vnd.apple.mpegurl')) {
                this.tryNativeHLS(videoUrl);
              }
            }
          }
        });

      } catch (error) {
        console.error('Hls.js initialization error:', error);
        this.errorMessage = `Hls.js 初始化错误: ${error.message}`;
        this.tryVideoJs(videoUrl);
      }
    },

    // 尝试浏览器原生 HLS (Safari)
    tryNativeHLS(videoUrl) {
      try {
        this.errorMessage = '';
        this.$refs.videoRef.src = videoUrl;
        this.videoInfo = {
          playerType: 'Native HLS',
          url: videoUrl
        };

        this.$refs.videoRef.addEventListener('error', (e) => {
          console.error('Native HLS error:', e);
          this.errorMessage = '浏览器原生 HLS 播放失败';
          this.tryVideoJs(videoUrl);
        });

      } catch (error) {
        console.error('Native HLS initialization error:', error);
        this.errorMessage = `原生 HLS 初始化错误: ${error.message}`;
        this.tryVideoJs(videoUrl);
      }
    },

    // 尝试使用 Video.js
    tryVideoJs(videoUrl) {
      try {
        this.errorMessage = '';
        this.player = videojs(this.$refs.videoRef, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          responsive: true,
          language: 'zh-CN',
          html5: {
            vhs: {
              overrideNative: true,
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              enableWorker: true,
              // 配置 HLS 播放
              handleManifestRedirects: true,
              handleManifestRepetitions: true
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
            // 跨域配置
            crossorigin: 'anonymous'
          },
          sources: [{
            src: videoUrl,
            type: 'application/x-mpegURL'
          }]
        });

        this.videoInfo = {
          playerType: 'Video.js',
          url: videoUrl
        };

        // 添加错误监听
        this.player.on('error', (e) => {
          console.error('Video.js error:', e);
          const error = this.player.error();
          let errorMsg = `Video.js 错误: ${error ? error.code + ' - ' + error.message : '未知错误'}`;

          if (error && error.code === 3) {
            errorMsg += ' (媒体解码错误，可能是流格式不支持或损坏)';
          }

          this.errorMessage = errorMsg;
        });

        // 监听加载事件
        this.player.on('loadedmetadata', () => {
          console.log('Video metadata loaded');
        });

      } catch (error) {
        console.error('Video.js initialization error:', error);
        this.errorMessage = `Video.js 初始化错误: ${error.message}`;
      }
    }
  }
};
</script>

<style scoped>
.video-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.video-container {
  margin-bottom: 20px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.error-message {
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  color: #f56c6c;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.error-message h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
}

.error-message p {
  margin-bottom: 12px;
  font-size: 14px;
}

.video-info {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  padding: 16px;
  border-radius: 8px;
}

.video-info h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  color: #303133;
}

.video-info p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  word-break: break-all;
}

/* 自定义 Video.js 样式 */
:deep(.video-js) {
  width: 100%;
  height: auto;
}

:deep(.vjs-control-bar) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}
</style>
