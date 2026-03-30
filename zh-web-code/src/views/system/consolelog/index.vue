<template>
  <div class="app-container">
    <!-- 搜索工作栏 -->
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="18px"
    >
      <el-form-item  prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          :placeholder="$t('common.consoleLog.search.placeholder.keyword')"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item >
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="-"
          :start-placeholder="$t('common.consoleLog.search.placeholder.startTime')"
          :end-placeholder="$t('common.consoleLog.search.placeholder.endTime')"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 360px"
          @change="handleTimeChange"
        />
      </el-form-item>

      <el-form-item style="margin-left: 6px">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.consoleLog.button.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.consoleLog.button.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <div v-loading="loading">
      <div
        id="log-container"
        ref="logContainer"
        class="log-container"
        @scroll="onScroll"
      ></div>
    </div>
  </div>
</template>

<script>
import { list } from "@/api/system/consolelog";

export default {
  name: "SystemConsoleLog",
  data() {
    // 局部安全格式化函数（避免 this 问题）
    const formatDateTime = (date) => {
      const pad = n => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneMinteAgo = new Date(now.getTime() - 60 * 1000);

    return {
      loading: false,
      showSearch: true,
      allLines: [],
      hasMore: true,

      timeRange: [formatDateTime(oneMinteAgo), formatDateTime(now)],

      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },

      queryParams: {
        pageNo: 1,
        pageSize: 100,
        keyword: '',
        startTime: formatDateTime(oneMinteAgo),
        endTime: formatDateTime(now)
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    formatDateTime(date) {
      const pad = n => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },

    validateTimeRange(startStr, endStr) {
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (isNaN(start) || isNaN(end)) {
        this.$message.error(this.$t('common.consoleLog.message.error.invalidTime'));
        return false;
      }
      if (start > end) {
        this.$message.error(this.$t('common.consoleLog.message.error.timeRange'));
        return false;
      }
      const diffHours = (end - start) / (1000 * 60 * 60);
      if (diffHours > 24) {
        this.$message.error(this.$t('common.consoleLog.message.error.timeLimit'));
        return false;
      }
      return true;
    },

    handleTimeChange(val) {
      if (val && val.length === 2) {
        const [start, end] = val;
        if (this.validateTimeRange(start, end)) {
          this.queryParams.startTime = start;
          this.queryParams.endTime = end;
          this.resetAndReload();
        } else {
          // 校验失败，恢复原值
          this.timeRange = [this.queryParams.startTime, this.queryParams.endTime];
        }
      }
    },

    resetAndReload() {
      this.allLines = [];
      this.hasMore = true;
      this.getList();
    },

    getList() {
      const { startTime, endTime } = this.queryParams;
      if (!startTime || !endTime) {
        this.$message.warning(this.$t('common.consoleLog.message.warning.selectTime'));
        return;
      }

      if (!this.validateTimeRange(startTime, endTime)) {
        return;
      }

      this.loading = true;
      const params = { ...this.queryParams, pageNo: 1 };

      list(params)
        .then(response => {
          const lines = Array.isArray(response.data) ? response.data : [];
          this.allLines = [...lines];
          this.renderLogs();
          // this.scrollToBottom();
          this.loading = false;
          this.hasMore = lines.length >= this.queryParams.pageSize;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    loadMore() {
      if (this.loading || !this.hasMore) return;

      this.loading = true;
      const nextPage = Math.floor(this.allLines.length / this.queryParams.pageSize) + 1;
      const params = { ...this.queryParams, pageNo: nextPage };

      list(params)
        .then(response => {
          const newLines = Array.isArray(response.data) ? response.data : [];
          if (newLines.length > 0) {
            this.allLines.push(...newLines);
            this.renderLogs();
            // this.$nextTick(() => {
            //   const c = this.$refs.logContainer;
            //   if (c) c.scrollTop = c.scrollHeight;
            // });
            this.hasMore = newLines.length >= this.queryParams.pageSize;
          } else {
            this.hasMore = false;
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },

    renderLogs() {
      const container = this.$refs.logContainer;
      if (!container) return;

      container.innerHTML = '';

      if (this.allLines.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'log-empty-hint';
        emptyDiv.textContent = this.$t('common.consoleLog.empty.hint');
        container.appendChild(emptyDiv);
        return;
      }

      const fragment = document.createDocumentFragment();
      this.allLines.forEach((line, index) => {
        const lineNumber = index + 1;
        const escapedLine = this.escapeHtml(line);
        let contentClass = '';
        if (line.includes('ERROR')) contentClass = 'error';
        else if (line.includes('WARN')) contentClass = 'warn';
        else if (line.includes('INFO')) contentClass = 'info';
        else if (line.includes('DEBUG')) contentClass = 'debug';

        const div = document.createElement('div');
        div.className = 'log-line';
        div.innerHTML = `
      <span class="line-number">${lineNumber}</span>
      <span class="line-content ${contentClass}">${escapedLine}</span>
    `;
        fragment.appendChild(div);
      });

      container.appendChild(fragment);
    },

    onScroll(e) {
      const container = e.target;
      if (
        container.scrollHeight - container.scrollTop - container.clientHeight <= 5 &&
        this.hasMore
      ) {
        this.loadMore();
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.logContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    escapeHtml(text) {
      if (typeof text !== 'string') return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },

    handleQuery() {
      if (!this.timeRange || this.timeRange.length !== 2) {
        this.$message.warning(this.$t('common.consoleLog.message.warning.selectTime'));
        return;
      }
      this.resetAndReload();
    },

    resetQuery() {
      this.queryParams.keyword = '';

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneMinteAgo = new Date(now.getTime() - 60 * 1000);
      const range = [this.formatDateTime(oneMinteAgo), this.formatDateTime(now)];

      this.timeRange = range;
      this.queryParams.startTime = range[0];
      this.queryParams.endTime = range[1];

      this.resetAndReload();
    }
  }
};
</script>

<style lang="scss">
.log-container {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.4;
  background: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  height: 72vh;
  overflow-y: auto;
}

.log-line {
  display: flex;
  white-space: pre;
  margin: 0;
}

.line-number {
  color: #999;
  text-align: right;
  padding-right: 10px;
  user-select: none;
  min-width: 40px;
}

.line-content {
  flex: 1;
  overflow-wrap: break-word;
  word-break: break-all;
}

.log-empty-hint {
  color: #888;
  font-family: monospace;
  white-space: pre-wrap; // 保留换行和空格
  padding: 40px 20px;
  text-align: center;
  line-height: 1.6;
}

.error { color: red; font-weight: bold; }
.warn  { color: orange; }
.info  { color: green; }
.debug { color: gray; }
</style>
