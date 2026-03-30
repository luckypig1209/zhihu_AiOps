<template>
  <div class="drawio-embed-viewer">
    <!-- 文件上传和分享控制区域 -->
    <div class="control-panel">
      <div class="upload-section">
        <label class="upload-btn">
          选择XML文件
          <input 
            type="file" 
            accept=".xml,.drawio" 
            @change="handleFileUpload" 
            ref="fileInput"
            class="file-input"
          />
        </label>
        <button 
          @click="generateShareLink" 
          class="share-btn"
          :disabled="!graphXml"
        >
          生成嵌入代码
        </button>
      </div>

      <!-- 嵌入代码显示区域 -->
      <div v-if="embedCode" class="embed-section">
        <p class="embed-title">嵌入代码：</p>
        <textarea 
          ref="embedCodeInput"
          class="embed-code"
          :value="embedCode"
          readonly
          rows="4"
        ></textarea>
        <button @click="copyEmbedCode" class="copy-btn">
          {{ copySuccess ? '✓ 已复制' : '复制代码' }}
        </button>
        <p class="embed-hint">将此代码粘贴到需要嵌入的页面中</p>
      </div>
    </div>

    <!-- 拓扑图预览容器 -->
    <div class="preview-container">
      <iframe 
        ref="previewFrame"
        class="preview-frame"
        :src="previewUrl"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DrawioEmbedViewer',
  data() {
    return {
      graphXml: null,
      previewUrl: 'about:blank',
      embedCode: '',
      copySuccess: false,
      // 默认使用官方查看器，生产环境应替换为自己的部署地址
      viewerBaseUrl: 'https://viewer.diagrams.net/',
      // 内网部署示例：
      // viewerBaseUrl: 'http://your-drawio-server/',
      viewerParams: {
        lightbox: '1',
        highlight: '0000ff',
        edit: '_blank',
        layers: '1',
        nav: '1',
        title: 'Embedded_Diagram'
      }
    };
  },
  methods: {
    // 处理文件上传
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.graphXml = e.target.result;
        this.renderDiagram(this.graphXml);
        this.embedCode = '';
      };
      reader.readAsText(file);
    },
    
    // 渲染拓扑图
    renderDiagram(xml) {
      const encoded = encodeURIComponent(xml);
      const params = this.buildViewerParams();
      this.previewUrl = `${this.viewerBaseUrl}?${params}#R${encoded}`;
    },
    
    // 构建查看器URL参数
    buildViewerParams() {
      return Object.entries(this.viewerParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    },
    
    // 生成嵌入代码
    generateShareLink() {
      if (!this.graphXml) return;
      
      // 对XML进行编码
      const encoded = encodeURIComponent(this.graphXml);
      
      // 生成嵌入代码
      const embedUrl = `${this.viewerBaseUrl}?${this.buildViewerParams()}#R${encoded}`;
    //   this.embedCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0"></iframe>`;
     this.embedCode = embedUrl
      this.copySuccess = false;
    },
    
    // 复制嵌入代码
    copyEmbedCode() {
      if (!this.embedCode) return;
      
      this.$refs.embedCodeInput.select();
      try {
        document.execCommand('copy');
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      } catch (err) {
        console.error('复制失败:', err);
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = this.embedCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.copySuccess = true;
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      }
    }
  }
};
</script>

<style scoped>
.drawio-embed-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

.control-panel {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input {
  display: none;
}

.upload-btn {
  padding: 8px 15px;
  background-color: #6c757d;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #5a6268;
}

.share-btn {
  padding: 8px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.share-btn:hover {
  background-color: #0069d9;
}

.share-btn:disabled {
  background-color: #b3b3b3;
  cursor: not-allowed;
}

.embed-section {
  margin-top: 15px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.embed-title {
  margin: 0 0 10px 0;
  font-weight: bold;
}

.embed-code {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
  resize: vertical;
}

.copy-btn {
  padding: 8px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #218838;
}

.embed-hint {
  margin: 10px 0 0 0;
  font-size: 13px;
  color: #6c757d;
}

.preview-container {
  flex: 1;
  width: 100%;
  position: relative;
}

.preview-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>