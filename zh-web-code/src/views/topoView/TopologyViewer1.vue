<template>
  <div class="drawio-viewer">
    <!-- 文件上传区域 -->
    <div class="upload-section">
      <input 
        type="file" 
        accept=".xml,.drawio" 
        @change="handleFileUpload" 
        ref="fileInput"
      />
      <button @click="shareDiagram" :disabled="!graphXml">分享拓扑图</button>
      <div v-if="shareUrl" class="share-info">
        <p>分享链接：</p>
        <input type="text" :value="shareUrl" readonly />
        <button @click="copyShareUrl">复制链接</button>
      </div>
    </div>
    
    <!-- 图形渲染容器 -->
    <iframe 
      ref="diagramFrame"
      class="diagram-frame"
      :src="iframeSrc"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'DrawioViewer',
  data() {
    return {
      graphXml: null,
      iframeSrc: 'about:blank',
      shareUrl: '',
      shareId: ''
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
        this.shareUrl = ''; // 清除之前的分享链接
      };
      reader.readAsText(file);
    },
    
    // 渲染图形
    renderDiagram(xml) {
      // 对 XML 进行编码，以便在 URL 中传递
      const encoded = encodeURIComponent(xml);
      
      // 使用 Draw.io 的查看器模式
      // 这里使用官方在线查看器，内网环境可以部署自己的 Draw.io 实例
      this.iframeSrc = `https://viewer.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram#R${encoded}`;
      
      // 如果是内网部署，替换为内网地址，例如：
      // this.iframeSrc = `http://your-internal-drawio-server/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Untitled%20Diagram#R${encoded}`;
    },
    
    // 分享图形
    shareDiagram() {
      if (!this.graphXml) return;
      
      // 生成唯一ID作为分享标识
      this.shareId = 'drawio-' + Date.now();
      
      // 存储图形数据到本地（在实际应用中，这里应该发送到服务器）
      localStorage.setItem(this.shareId, this.graphXml);
      
      // 生成分享URL（这里使用本地URL，实际应用中应该是服务器地址）
      this.shareUrl = `${window.location.origin}${window.location.pathname}#/shared/${this.shareId}`;
    },
    
    // 复制分享链接
    copyShareUrl() {
      const input = document.createElement('input');
      input.value = this.shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('链接已复制到剪贴板');
    },
    
    // 加载共享图形（用于iframe嵌入）
    loadSharedDiagram(shareId) {
      const xml = localStorage.getItem(shareId);
      if (xml) {
        this.graphXml = xml;
        this.renderDiagram(xml);
      }
    }
  },
  mounted() {
    // 如果有分享ID，加载共享图形
    if (this.$route.params.shareId) {
      this.loadSharedDiagram(this.$route.params.shareId);
    }
  }
};
</script>

<style scoped>
.drawio-viewer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.upload-section {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.diagram-frame {
  flex: 1;
  width: 100%;
  border: 1px solid #e0e0e0;
}

.share-info {
  margin-top: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
}

.share-info input {
  width: 70%;
  padding: 5px;
  margin-right: 5px;
}
</style>