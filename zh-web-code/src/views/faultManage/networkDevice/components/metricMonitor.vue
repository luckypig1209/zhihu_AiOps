<template>
  <div class="metric-monitor-container">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-actions">
        <a-input
          v-model="searchKeyword"
          :placeholder="$t('common.pleaseEnterKeywords')" 
          allow-clear
          style="width: 250px;margin-right: 12px;"
        />
        <a-button type="primary" @click="handleSearch" icon="search">{{ $t('common.query') }}</a-button>
        <a-button @click="showMetricSettingsModal" icon="setting" style="margin-left: 12px;">{{ $t('common.indexSettings') }}</a-button>
      </div>
      
      <div class="refresh-right">
        <div>{{ $t('common.lastRefreshTime') }}：{{time}}</div>
        <a-button class="button-refresh" @click="handleManualRefresh">
          {{ $t('common.refresh') }}
        </a-button>
        <div class="refresh-interval">
          <a-dropdown @visibleChange="handleVisibleChange">
            <a-button style="border-radius: 0;">
              {{selectValue === '0'? $t('common.noRefresh') : (parseInt(selectValue) >= 60? (parseInt(selectValue)/60) + 'm': parseInt(selectValue) + 's')}} 
            </a-button>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="0">{{ $t('common.noRefresh') }}</a-menu-item>
                <a-menu-item key="15">15s</a-menu-item>
                <a-menu-item key="30">30s</a-menu-item>
                <a-menu-item key="60">1m</a-menu-item>
                <a-menu-item key="300">5m</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>      
      </div> 
    </div>

    <!-- 指标列表 -->
    <div class="metric-table-container">
      <a-table
        :columns="columns"
        :data-source="filteredMetricList"
        bordered
        rowKey="name"
        :row-class-name="rowClassName"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `${this.$t('common.totalRecords', { total })}`
        }"
        @change="handleTableChange"
      >
        <template slot="name" slot-scope="text,record">
          <el-tooltip placement="top">
            <div slot="content">
              {{ text }}
            </div>
            <span 
              class="metric-name" 
              @click="handleCellClick(record)"
            >
              {{ text }}
            </span>
          </el-tooltip>
        </template>
        <template slot="type" slot-scope="text,record">
          <span 
            :class="textMap[text]" 
          >
            {{ text }}
          </span>
        </template>
        <template slot="unit" slot-scope="text,record">
          <!-- 关键修改：判断unit是否为空，为空显示提示文字，否则显示下拉框 -->
          <template v-if="!record.unit || record.unit.trim() === ''">
            <span class="no-unit-tip">{{ $t('common.noConversionNeeded') }}</span>
          </template>
          <template v-else>
            <a-select
              v-model="record.currentUnit"
              style="width: 100px"
              @change="handleUnitChange(record)"
              :options="getUnitOptions(record)"
:placeholder="$t('common.selectUnit')"
            />
          </template>
        </template>
      </a-table>
    </div>

    <!-- 图表弹窗（固定高度优化） -->
    <a-modal
      v-model="modalVisible"
      :title="`${currentMetric} ${$t('common.trendAnalysis')}`"
      width="1000px"
      @cancel="handleModalCancel"
      :mask-closable="false"
      :footer="null"
      class="fixed-height-modal"
      :body-style="{ maxHeight: '80vh', overflowY: 'auto' }"
    >
      <div class="modal-content">
        
        <!-- Metric选择器（仅type=2时显示） -->
        <div v-if="currentDataType === 2 && metricOptions.length > 1" class="metric-selector">
          <a-select
            v-model="selectedMetricIndex"
            style="width: 100%; margin-bottom: 16px;"
            @change="handleMetricChange"
            :placeholder="$t('common.pleaseSelectMetric')"
          >
            <a-select-option 
              v-for="(option, index) in metricOptions" 
              :key="index"
              :value="index"
            >
              <el-tooltip placement="top">
                <div slot="content">
                  <pre>{{ JSON.stringify(option.metric, null, 2) }}</pre>
                </div>
                <span>{{ currentMetric + ' ' + $t('common.partition')  + (index + 1)}}</span>
              </el-tooltip>
            </a-select-option>
          </a-select>
        </div>

        <!-- 时间范围筛选和对比选项（日期选择器支持分钟精确选择） -->
        <div class="filter-bar">
        <!-- 弹窗内单位选择器 -->
        <div v-if="selectItem.unit && selectItem.unit.trim() !== ''" class="modal-unit-selector" >
          <!-- <span style="margin-right: 8px;">显示单位：</span> -->
          <a-select
            v-model="modalCurrentUnit"
            style="width: 100px"
            @change="handleModalUnitChange"
            :options="getUnitOptions(selectItem)"
            :placeholder="$t('common.selectUnit')"
          />
        </div>

          <el-date-picker
            v-model="timeRange"
            style="width: 356px"
            type="datetimerange"
            align="right"
            :picker-options="pickerOptions"
            :start-placeholder="$t('common.startTime')"
            :end-placeholder="$t('common.endTime')"
            :clearable="true"
            format="yyyy-MM-dd HH:mm:ss" 
            value-format="yyyy-MM-dd HH:mm:ss"
            @change="handleTimeChange"
            :default-time="['00:00:00', '23:59:59']"
          >
          </el-date-picker>  
          <el-tooltip :content="$t('common.cannotSelectTimeAfterCurrentTime')" placement="top">
            <i class="el-icon-question"></i>
          </el-tooltip>        
                
          <div class="comparison-options">
            <a-checkbox 
              v-model="showMomComparison"
              @change="handleComparisonChange"
            >
              {{ $t('common.momComparison') }}（{{ $t('common.samePeriodYesterday') }}）
            </a-checkbox>
            <a-checkbox 
              v-model="showYoyComparison"
              @change="handleComparisonChange"
            >
              {{ $t('common.yoyComparison') }}（{{ $t('common.samePeriodLastWeek') }}）
            </a-checkbox>
          </div>
        </div>

        <!-- 时间范围无效提示 -->
        <div v-if="!isTimeRangeValid" class="time-range-error">
          {{ $t('common.pleaseSelectValidTimeRange') }}
        </div>
        
        <!-- 图表容器（自适应高度+滑动联动，解决同比重合） -->
        <div class="charts-container" v-else ref="chartsContainer">
          <!-- 当前时段图表 -->
          <div class="chart-wrapper">
            <div class="chart-inner" ref="currentChartRef"></div>
          </div>
          
          <!-- 环比图表 -->
          <div class="chart-wrapper" v-if="showMomComparison">
            <div class="chart-inner" ref="momChartRef"></div>
          </div>
          
          <!-- 同比图表 -->
          <div class="chart-wrapper" v-if="showYoyComparison">
            <div class="chart-inner" ref="yoyChartRef"></div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 指标设置弹窗 -->
    <a-modal
      v-model="metricSettingsModalVisible"
      :title="$t('common.indexSettings')"
      width="800px"
      @cancel="handleMetricSettingsCancel"
      :footer="null"
      :mask-closable="false"
    >
      <div class="metric-settings-content">
        <div class="metric-settings-header">
          <a-checkbox v-model="selectAll" @change="handleSelectAll">{{ $t('common.selectAll') }}</a-checkbox>
          <span class="drag-hint">{{ $t('common.dragToAdjustOrder') }}</span>
        </div>
        <div class="metric-settings-list" ref="metricSettingsList">
          <div
            v-for="(metric, index) in metricSettingsList"
            :key="metric.itemId || metric.name"
            class="metric-settings-item"
            draggable="true"
            @dragstart="handleDragStart($event, index)"
            @dragover.prevent
            @drop="handleDrop($event, index)"
          >
            <a-checkbox
              v-model="metric.isVisible"
              @change="handleMetricVisibilityChange(metric)"
            >{{ metric.name }}</a-checkbox>
            <span class="drag-icon">☰</span>
          </div>
        </div>
        <div class="metric-settings-footer">
          <a-button @click="handleMetricSettingsCancel">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" @click="handleMetricSettingsConfirm">{{ $t('common.confirm') }}</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getMonitorList, getMonitorDetail, getUserConfig, saveUserConfig } from "@/api/monitor/task"

// 自定义日期格式化函数
const formatDate = (date, formatStr) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return formatStr
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds); 
};

// 防抖函数（优化滑动联动性能）
const debounce = (fn, delay = 30) => {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
};

// 单位换算配置
const unitConversions = {
  // 带宽单位
  bandwidth: {
    baseUnit: 'bps',
    units: [
      { value: 'bps', label: 'bps', factor: 1 },
      { value: 'Kbps', label: 'Kbps', factor: 1/1000 },
      { value: 'Mbps', label: 'Mbps', factor: 1/1000000 },
      { value: 'Gbps', label: 'Gbps', factor: 1/1000000000 }
    ]
  },
  // 百分比
  percent: {
    baseUnit: '%',
    units: [
      { value: '%', label: '%', factor: 1 }
    ]
  },
  // 次/秒
  '次/秒': {
    baseUnit: '次/秒',
    units: [
      { value: '次/秒', label: '次/秒', factor: 1 }
    ]
  },
  // 流量/容量单位
  bytes: {
    baseUnit: 'byte',
    units: [
      { value: 'byte', label: 'byte', factor: 1 },
      { value: 'bit', label: 'bit', factor: 1 * 8 },
      { value: 'KB', label: 'KB', factor: 1/1024 },
      { value: 'MB', label: 'MB', factor: 1/(1024*1024) },
      { value: 'GB', label: 'GB', factor: 1/(1024*1024*1024) },
      { value: 'TB', label: 'TB', factor: 1/(1024*1024*1024*1024) }
    ]
  },
  // 速率单位
  pps: {
    baseUnit: 'pps',
    units: [
      { value: 'pps', label: 'pps', factor: 1 },
      { value: 'Kpps', label: 'Kpps', factor: 1/1000 },
      { value: 'Mpps', label: 'Mpps', factor: 1/1000000 }
    ]
  },
  // 磁盘读写速率
  bytesPerSecond: {
    baseUnit: 'byte/s',
    units: [
      { value: 'byte/s', label: 'byte/s', factor: 1 },
      { value: 'KB/s', label: 'KB/s', factor: 1/1024 },
      { value: 'MB/s', label: 'MB/s', factor: 1/(1024*1024) },
      { value: 'GB/s', label: 'GB/s', factor: 1/(1024*1024*1024) }
    ]
  },
  // I/O操作数
  ops: {
    baseUnit: 'ops/s',
    units: [
      { value: 'ops/s', label: 'ops/s', factor: 1 },
      { value: 'Kops/s', label: 'Kops/s', factor: 1/1000 },
      { value: 'Mops/s', label: 'Mops/s', factor: 1/1000000 }
    ]
  },
  // 时间单位
  time: {
    baseUnit: 'μs',
    units: [
      {value: 'μs',  label: 'μs', factor: 1  },
      { value: 'ms', label: 'ms', factor: 1 / 1000 },
      { value: 's', label: 's', factor: 1/1000000 },
      { value: 'min', label: 'min', factor: 1/(1000000*60) }
    ]
  },
   'V': {
    baseUnit: 'V',
    units: [
      { value: 'V', label: 'V', factor: 1 }
    ]
  },
  'A': {
    baseUnit: 'A',
    units: [
      { value: 'A', label: 'A', factor: 1 }
    ]
  },  
  'KW': {
    baseUnit: 'KW',
    units: [
      { value: 'KW', label: 'KW', factor: 1 }
    ]
  },
  'KVAR': {
    baseUnit: 'KVAR',
    units: [
      { value: 'KVAR', label: 'KVAR', factor: 1 }
    ]
  },
  'HZ': {
    baseUnit: 'HZ',
    units: [
      { value: 'HZ', label: 'HZ', factor: 1 }
    ]
  },
  'KVA': {
    baseUnit: 'KVA',
    units: [
      { value: 'KVA', label: 'KVA', factor: 1 }
    ]
  },
  'cosφ': {
    baseUnit: 'cosφ',
    units: [
      { value: 'cosφ', label: 'cosφ', factor: 1 }
    ]
  },
  '℃': {
    baseUnit: '℃',
    units: [
      { value: '℃', label: '℃', factor: 1 }
    ]
  },
  'RH%': {
    baseUnit: 'RH%',
    units: [
      { value: 'RH%', label: 'RH%', factor: 1 }
    ]
  },
  'mΩ': {
    baseUnit: 'mΩ',
    units: [
      { value: 'mΩ', label: 'mΩ', factor: 1 }
    ]
  },
  '%RH': {
    baseUnit: '%RH',
    units: [
      { value: '%RH', label: '%RH', factor: 1 }
    ]
  },
  '%HR': {
    baseUnit: '%HR',
    units: [
      { value: '%HR', label: '%HR', factor: 1 }
    ]
  },    
  'p': {
    baseUnit: 'p',
    units: [
      { value: 'p', label: 'p', factor: 1 }
    ]
  }    
};

// 单位关键词映射（根据unit字段判断类型）
const unitKeywordMap = {
  'bps': 'bandwidth',
  'Kbps': 'bandwidth',
  'Mbps': 'bandwidth',
  'Gbps': 'bandwidth',
  'bytes': 'bytes',
  'B': 'bytes',
  'byte': 'bytes',
  'bit': 'bytes',
  'KB': 'bytes',
  'MB': 'bytes',
  'GB': 'bytes',
  'TB': 'bytes',
  'pps': 'pps',
  'Kpps': 'pps',
  'Mpps': 'pps',
  'byte/s': 'bytesPerSecond',
  'KB/s': 'bytesPerSecond',
  'MB/s': 'bytesPerSecond',
  'GB/s': 'bytesPerSecond',
  'ops/s': 'ops',
  'Kops/s': 'ops',
  'Mops/s': 'ops',
  'ms': 'time',
  'μs': 'time',
  's': 'time',
  'min': 'time',
  '%': 'percent', // 百分比（无需换算）
  'Packets/s': 'Packets',
  '次/秒':'次/秒', // 文件输出（无需换算）
  'V': 'V',
  'A': 'A',
  'KW': 'KW',
  'KVAR': 'KVAR',
  'HZ': 'HZ',
  'KVA': 'KVA',
  'cosφ': 'cosφ',
  '℃': '℃',
  'RH%': 'RH%',
  'mΩ': 'mΩ',
  '%RH': '%RH',
  '%HR': '%HR',
  'p': 'p'
};

// 根据unit字段判断单位类型
const getUnitTypeByUnitValue = (unit) => {
  if (!unit) return null;
  // 去除空格并统一格式
  const cleanUnit = unit.trim().toLowerCase();
  
  // 优先匹配带斜杠的单位，如 byte/s
  if (cleanUnit.includes('/')) {
    for (const [keyword, type] of Object.entries(unitKeywordMap)) {
      if (keyword.includes('/') && cleanUnit === keyword.toLowerCase()) {
        return type;
      }
    }
  }
  
  // 遍历关键词映射表，按关键词长度降序排列，优先匹配更具体的关键词
  const sortedKeywords = Object.keys(unitKeywordMap).sort((a, b) => b.length - a.length);
  for (const keyword of sortedKeywords) {
    if (cleanUnit.includes(keyword.toLowerCase())) {
      return unitKeywordMap[keyword];
    }
  }
  return null;
};

export default {
  name: 'MetricMonitor',
  props: {
    selectId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      textMap: {
        "数字": 'number metric-type',
        "浮点数": 'float metric-type',
        "字符": 'character metric-type',
        "文本": 'text metric-type',
        "无符号数字": 'noText metric-type',
      },
      selectItem: {},
      modalCurrentUnit: '', // 弹窗中的当前选择单位
      metricList: [
        { name: 'ICMP Ping', type: '数字', interval: '1m', createTime: '2025-08-28 16:13:04', lastValue: '1', status: 'normal', unit: '', currentUnit: '', originalValue: 1 },
        { name: 'ICMP Ping 丢包率', type: '浮点数', interval: '1m', createTime: '2025-08-28 16:13:04', lastValue: '0.0%', status: 'normal', unit: '%', currentUnit: '%', originalValue: 0.0 },
        { name: 'ICMP Ping 延迟', type: '浮点数', interval: '1m', createTime: '2025-08-28 16:13:04', lastValue: '0.03 s', status: 'warning', unit: 'ms', currentUnit: 's', originalValue: 30 },
        { name: '系统联系人', type: '字符', interval: '1m', createTime: '2025-08-28 15:42:04', lastValue: 'R&D Beijing, Huawei Technologies co.,Ltd.', status: 'normal', unit: '', currentUnit: '' },
        { name: 'CPU 使用率', type: '浮点数', interval: '1m', createTime: '2025-08-28 16:13:04', lastValue: '85.0%', status: 'critical', unit: '%', currentUnit: '%', originalValue: 85.0 },
        { name: '系统描述', type: '文本', interval: '1m', createTime: '2025-08-28 15:42:04', lastValue: 'S5700-28C-HI Huawei Versatile Routing Platform Soft...', status: 'normal', unit: '', currentUnit: '' },
        { name: '系统位置', type: '字符', interval: '1m', createTime: '2025-08-28 15:42:04', lastValue: 'Beijing China', status: 'normal', unit: '', currentUnit: '' },
        { name: '系统名称', type: '字符', interval: '1m', createTime: '2025-08-28 15:42:04', lastValue: 'Huawei', status: 'normal', unit: '', currentUnit: '' },
        { name: '系统 ObjectID', type: '字符', interval: '1m', createTime: '2025-08-28 15:42:04', lastValue: 'iso.3.6.1.4.1.2011.2.23.169', status: 'normal', unit: '', currentUnit: '' },
        { name: '运行时长', type: '数字', interval: '1m', createTime: '2025-08-28 16:13:04', lastValue: '23687 uptime', status: 'normal', unit: 's', currentUnit: 's', originalValue: 23687 }
      ],
      filteredMetricList: [],
      searchKeyword: '',
      modalVisible: false,
      currentMetric: '',
      timeRange: [],
      momRange: [],
      yoyRange: [],
      showMomComparison: false,
      showYoyComparison: false,
      currentChart: null,
      momChart: null,
      yoyChart: null,
      time: '2025-08-27 09:16:08',
      timer: null,
      selectValue: '0',
      resizeHandler: null,
      activeIndex: -1,
      isMouseInChart: false,
      chartLoading: false,
      loading: false,
      chartError: null,
      selectedDateTime: null,
      currentDataType: 1,
      metricOptions: [],
      selectedMetricIndex: 0,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 指标设置相关
      metricSettingsModalVisible: false,
      metricSettingsList: [],
      selectAll: false,
      draggedIndex: -1,
      pickerOptions: {
        shortcuts: [
          {
            text: this.$t('common.last5Minutes'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * (1/12));
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('common.last15Minutes'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * (1/4));
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('common.last1Hour'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('common.last3Hours'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 3);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('common.last6Hours'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 6);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: this.$t('common.last1Day'),
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', [start, end]);
            }
          }
        ],
        disabledDate: (time) => {
          return time.getTime() > Date.now();
        },
        disabledHours: () => {
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = this.selectedDateTime ? new Date(this.selectedDateTime) : null;
          if (selectedDate && selectedDate.getTime() === today.getTime()) {
            return Array.from({ length: now.getHours() }, (_, i) => i);
          }
          return [];
        },
        disabledMinutes: (selectedHour) => {
          const now = new Date();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDate = this.selectedDateTime ? new Date(this.selectedDateTime) : null;
          if (selectedDate && selectedDate.getTime() === today.getTime() && selectedHour === now.getHours()) {
            return Array.from({ length: now.getMinutes() }, (_, i) => i);
          }
          return [];
        }
      }
    }
  },
  computed: {
    isTimeRangeValid() {
      if (!this.timeRange || this.timeRange.length !== 2) return false;
      const [startStr, endStr] = this.timeRange;
      const startTime = new Date(startStr);
      const endTime = new Date(endStr);
      return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && startTime < endTime;
    },
    chartCount() {
      let count = 1;
      if (this.showMomComparison) count++;
      if (this.showYoyComparison) count++;
      return count;
    },
    selectedMetricData() {
      if (this.currentDataType === 2 && this.metricOptions.length > 0) {
        return this.metricOptions[this.selectedMetricIndex] || null;
      }
      return null;
    },
    // 获取当前选择单位的换算因子
    currentUnitFactor() {
      if (!this.selectItem || !this.modalCurrentUnit) return 1;
      // 获取单位类型（基于原始单位）
      const unitType = getUnitTypeByUnitValue(this.selectItem.unit);
      if (!unitType || !unitConversions[unitType]) return 1;
      const unitConfig = unitConversions[unitType];
      
      // 查找原始单位的换算因子（用于将原始值转换为基准单位）
      const originalUnitConfig = unitConfig.units.find(u => u.value === this.selectItem.unit);
      const originalFactor = originalUnitConfig ? originalUnitConfig.factor : 1;
      
      // 查找目标单位的换算因子（用于将基准单位转换为目标单位）
      const targetUnitConfig = unitConfig.units.find(u => u.value === this.modalCurrentUnit);
      const targetFactor = targetUnitConfig ? targetUnitConfig.factor : 1;
      
      // 总的换算因子 = (1/原始因子) * 目标因子
      // 因为原始因子表示：原始单位 = 基准单位 * 原始因子
      // 所以：基准单位 = 原始单位 / 原始因子 = 原始单位 * (1/原始因子)
      // 然后：目标单位 = 基准单位 * 目标因子
      return (1 / originalFactor) * targetFactor;
    },
    // 表格列配置
    columns() {
      return [
        { 
          title: this.$t('common.name'), 
          dataIndex: 'name', 
          key: 'name', 
          scopedSlots: { customRender: 'name' },
          width: 200
        },
        {
          title: this.$t('common.collectionInterval'),
          dataIndex: 'interval',
          key: 'interval',
          width: 100
        },
        {
          title: this.$t('common.createTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: 180,
          sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime)
        },
        {
          title: this.$t('common.lastCollectionValue'),
          dataIndex: 'displayValue',
          key: 'displayValue',
          width: 200,
          ellipsis: {
            showTitle: true
          },
          customRender: (text, record) => {
            const className = this.getValueClass(record, text);
            // 对显示值进行智能格式化（如果需要）
            const formattedText = record.isStringType ? text : this.formatSmartValue(parseFloat(text) || text);
            return (
              <a-tooltip title={formattedText} placement="top">
                <span class={className} style="display: inline-block; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{formattedText}</span>
              </a-tooltip>
            );
          }
        },
        {
          title: this.$t('common.unit'),
          dataIndex: 'unit',
          key: 'unit',
          width: 120,
          scopedSlots: { customRender: 'unit' }
        },
      ];
    }
  },
  created() {
    this.getList();
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    this.timeRange = [
      formatDate(start, 'YYYY-MM-dd HH:mm:ss'),
      formatDate(end, 'YYYY-MM-dd HH:mm:ss')
    ];
    this.calcCompareRanges();
    this.time = formatDate(new Date(), 'YYYY-MM-dd HH:mm:ss'); 
    this.resizeHandler = () => {
      this.adjustChartHeights();
      const activeCharts = [this.currentChart, this.momChart, this.yoyChart].filter(chart => chart);
      activeCharts.forEach(chart => chart.resize());
    };
    window.addEventListener('resize', this.resizeHandler);
  },
  methods: {
    // 智能格式化数值显示
    formatSmartValue(value) {
      if (value === 0) return '0';
      if (value === null || value === undefined) return '--';
      if (typeof value === 'string') return value;
      
      const absValue = Math.abs(value);
      
      // 根据数值大小选择不同的显示策略
      if (absValue >= 1000) {
        // 大数：使用千分位分隔，保留2位小数
        // return value.toLocaleString(undefined, {
        //   minimumFractionDigits: 0,
        //   maximumFractionDigits: 2
        // });
        return value.toFixed(3).replace(/\.?0+$/, '');
      } else if (absValue >= 1) {
        // 常规数：保留3位小数
        return value.toFixed(3).replace(/\.?0+$/, '');
      } else if (absValue >= 0.001) {
        // 小数：保留足够的小数位数显示有效数字
        const decimalPlaces = Math.max(3, Math.ceil(-Math.log10(absValue)) + 2);
        return value.toFixed(Math.min(decimalPlaces, 6));
      } else {
        // 极小数：使用科学计数法
        return value.toExponential(2);
      }
    },
    
    // 为长字符串添加换行
    addLineBreaks(text, maxLength = 30) {
      if (typeof text !== 'string') return text;
      if (text.length <= maxLength) return text;
      
      // 按空格或标点符号分割，避免在单词中间换行
      const words = text.split(/(\s|,|;|\.|\:|\-)/);
      let result = '';
      let currentLine = '';
      
      for (const word of words) {
        if (currentLine.length + word.length <= maxLength) {
          currentLine += word;
        } else {
          result += currentLine + '<br/>';
          currentLine = word;
        }
      }
      
      if (currentLine) {
        result += currentLine;
      }
      
      return result;
    },
    
    // 图表坐标轴数值格式化
    formatChartAxisValue(value) {
      if (value === 0) return '0';
      
      const absValue = Math.abs(value);
      
      // 根据数值大小采用不同的显示策略
      if (absValue >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
      } else if (absValue >= 1000) {
        return (value / 1000).toFixed(2) + 'K';
      } else if (absValue >= 0.01) {
        // 常规小数：保留2位小数
        return value.toFixed(2);
      } else if (absValue >= 0.001) {
        // 较小数：保留3位小数
        return value.toFixed(3);
      } else if (absValue >= 0.00001) {
        // 极小数：保留更多小数位
        const decimalPlaces = Math.ceil(-Math.log10(absValue)) + 1;
        return value.toFixed(Math.min(decimalPlaces, 6));
      } else {
        // 使用科学计数法
        return value.toExponential(1);
      }
    },
    
    // 根据数值自动选择最优显示单位
    getOptimalDisplayUnit(originalValue, unitType) {
      if (!unitType || !unitConversions[unitType]) return null;
      
      const unitConfig = unitConversions[unitType];
      const units = unitConfig.units;
      
      // 找到使数值在1-1000范围内的单位
      for (let i = units.length - 1; i >= 0; i--) {
        const convertedValue = originalValue * units[i].factor;
        if (Math.abs(convertedValue) >= 1 && Math.abs(convertedValue) < 1000) {
          return units[i].value;
        }
      }
      
      // 如果都找不到，返回基础单位
      return unitConfig.baseUnit;
    },
    
    // 检查单位换算是否合适（避免显示过多0）
    checkUnitSuitability(originalValue, targetUnit, unitType) {
      if (!unitType || !unitConversions[unitType]) return targetUnit;
      
      const unitConfig = unitConversions[unitType];
      const currentFactor = unitConfig.units.find(u => u.value === targetUnit)?.factor || 1;
      const convertedValue = originalValue * currentFactor;
      
      // 如果换算后的值太小（小于0.001），建议使用更小的单位
      if (Math.abs(convertedValue) < 0.001 && convertedValue !== 0) {
        const smallerUnit = unitConfig.units.find(u => u.factor < currentFactor);
        if (smallerUnit) {
          return smallerUnit.value;
        }
      }
      
      return targetUnit;
    },
    
    async getList() {
      try {
        this.loading = true
        // 使用后端分页，传递currentPage和pageSize参数
        let params = {
          id: this.selectId,
          pageNo: this.currentPage,
          pageSize: this.pageSize,
          itemName: this.searchKeyword.trim().toLowerCase().trim()
        }
        const res = await getMonitorList(params);
        // 适配新的返回结构：res.data.listitemName
        const listData = res.data.list || res.data || [];
        this.total = res.data.total || listData.length;
        this.metricList = listData.map(item => {
          // 检查是否为字符串类型的监控项
          const isStringType = item.type === '字符' || item.type === '文本' || !item.unit;
          
          // 初始化原始值和显示值
          let rawValue;
          let baseValue;
          if (isStringType) {
            // 字符串类型：直接使用原始值
            rawValue = item.lastValue;
            baseValue = item.lastValue;
          } else {
            // 数值类型：解析为数值
            rawValue = this.parseOriginalValue(item.lastValue, item.unit);
            // 初始使用后端传来的原始单位
            const initialUnit = item.unit;
            
            // 计算基准单位值（用于单位切换时的换算）
            const unitType = getUnitTypeByUnitValue(initialUnit);
            baseValue = rawValue;
            if (unitType && unitConversions[unitType]) {
              const unitConfig = unitConversions[unitType];
              const sourceUnitConfig = unitConfig.units.find(u => u.value === initialUnit);
              if (sourceUnitConfig) {
                // 转换为基准单位值（基准单位的factor为1）
                baseValue = rawValue / sourceUnitConfig.factor;
              }
            }
          }
          
          return {
            ...item,
            originalValue: baseValue, // 存储基准单位值，用于换算
            displayValue: isStringType ? rawValue : this.formatSmartValue(rawValue), // 初始显示原始值，不进行换算
            currentUnit: item.unit,
            isStringType: isStringType // 标记是否为字符串类型
          };
        });
        
        // 直接使用获取的数据，后端已分页并排序
        this.filteredMetricList = [...this.metricList];
        
        this.loading = false
      } catch (error) {
        console.error("获取监控列表失败:", error);
        this.loading = false
        this.$message.error(this.$t('monitor.getMonitorListFailed'));
      }
    },
    // 解析原始数值
    parseOriginalValue(value, unit) {
      if (typeof value === 'string') {
        value = value.replace(/[^\d.]/g, '');
      }
      return parseFloat(value) || 0;
    },
    // 获取单位选项
    getUnitOptions(record) {
      // 关键修改：根据unit字段判断单位类型
      const unitType = getUnitTypeByUnitValue(record.unit);
      if (unitType && unitConversions[unitType]) {
        return unitConversions[unitType].units.map(u => ({
          value: u.value,
          label: u.label
        }));
      }
      return [];
    },
    // 处理单位切换
    handleUnitChange(record) {
      // 字符串类型的监控项不需要单位换算
      if (record.isStringType) {
        return;
      }
      
      const unitType = getUnitTypeByUnitValue(record.unit);
      if (unitType) {
        // 尊重用户的选择，不再自动调整单位
        record.displayValue = this.convertValue(record.originalValue, record.currentUnit, unitType);
      }
      // 如果当前弹窗打开的是这个指标，同步更新弹窗的单位
      if (this.modalVisible && this.selectItem.name === record.name) {
        this.modalCurrentUnit = record.currentUnit;
        this.handleModalUnitChange();
      }
    },
    // 处理弹窗中的单位切换
    handleModalUnitChange() {
      // 更新列表中的单位选择
      if (this.selectItem && this.filteredMetricList.length > 0) {
        const index = this.filteredMetricList.findIndex(item => item.name === this.selectItem.name);
        if (index !== -1) {
          this.filteredMetricList[index].currentUnit = this.modalCurrentUnit;
          // 字符串类型的监控项不需要单位换算
          if (!this.filteredMetricList[index].isStringType) {
            // 重新计算显示值
            const unitType = getUnitTypeByUnitValue(this.selectItem.unit);
            this.filteredMetricList[index].displayValue = this.convertValue(
              this.filteredMetricList[index].originalValue, 
              this.modalCurrentUnit, 
              unitType
            );
          }
        }
      }
      // 重新渲染图表
      this.$nextTick(() => {
        this.renderCharts();
      });
    },
    // 数值转换（返回格式化的字符串）
    convertValue(originalValue, targetUnit, unitType) {
      if (!unitType || !unitConversions[unitType]) {
        return this.formatSmartValue(originalValue);
      }
      
      const unitConfig = unitConversions[unitType];
      const targetUnitConfig = unitConfig.units.find(u => u.value === targetUnit);
      
      if (targetUnitConfig) {
        const convertedValue = originalValue * targetUnitConfig.factor;
        return this.formatSmartValue(convertedValue);
      }
      
      return this.formatSmartValue(originalValue);
    },
    // 转换图表数据值（返回数字）
    convertChartValue(value) {
      if (!this.selectItem || !this.modalCurrentUnit) return value;
      
      // 获取单位类型（基于原始单位）
      const unitType = getUnitTypeByUnitValue(this.selectItem.unit);
      if (!unitType || !unitConversions[unitType]) return value;
      
      const unitConfig = unitConversions[unitType];
      
      // 查找原始单位的换算因子
      const originalUnitConfig = unitConfig.units.find(u => u.value === this.selectItem.unit);
      if (!originalUnitConfig) return value;
      
      // 查找目标单位的换算因子
      const targetUnitConfig = unitConfig.units.find(u => u.value === this.modalCurrentUnit);
      if (!targetUnitConfig) return value;
      
      // 计算换算因子：目标单位 = 原始单位 * (targetFactor / originalFactor)
      const conversionFactor = targetUnitConfig.factor / originalUnitConfig.factor;
      
      return value * conversionFactor;
    },
    rowClassName(record) {
      switch (record.status) {
        case 'critical': return 'row-critical';
        case 'warning': return 'row-warning';
        default: return '';
      }
    },
    handleVisibleChange(visible) {
      if (!visible) {
        this.clearTimer();
      }
    },
    handleMenuClick({ key }) {
      this.selectValue = key;
      this.clearTimer();
      if (key !== '0') {
        const interval = Number(key) * 1000;
        this.timer = setInterval(() => {
          this.handleManualRefresh();
        }, interval);
      }
    },
    handleManualRefresh() {
      this.time = formatDate(new Date(), 'YYYY-MM-dd HH:mm:ss');
      this.getList();
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    getValueClass(record, value) {
      if (record.type === '浮点数') {
        if (value.includes('%')) {
          const num = parseFloat(value);
          if (num > 80) return 'value-critical';
          if (num > 50) return 'value-warning';
        } else if (value.includes('s')) {
          const num = parseFloat(value);
          if (num > 0.1) return 'value-critical';
          if (num > 0.05) return 'value-warning';
        }
      }
      return 'value-normal';
    },
    handleCellClick(record) {
      this.currentMetric = record.name;
      this.modalVisible = true;
      this.selectItem = { ...record }; // 深拷贝避免引用问题
      this.modalCurrentUnit = record.currentUnit; // 同步单位选择
      this.chartError = null;
      this.currentDataType = 1;
      this.metricOptions = [];
      this.selectedMetricIndex = 0;
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },
    handleMetricChange() {
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },
    formatMetricLabel(metric) {
      const priorityKeys = ['instance', 'address', 'host_ip', 'host', 'port', 'name', 'job'];
      for (const key of priorityKeys) {
        if (metric[key]) {
          return `${key}: ${metric[key]}`;
        }
      }
      const excludeKeys = ['__name__'];
      for (const [key, value] of Object.entries(metric)) {
        if (!excludeKeys.includes(key) && value) {
          return `${key}: ${value}`;
        }
      }
      if (metric['__name__']) {
        return metric['__name__'];
      }
      const entries = Object.entries(metric);
      if (entries.length > 0) {
        const displayEntries = entries.slice(0, 2);
        return displayEntries.map(([k, v]) => `${k}:${v}`).join(' ');
      }
      return this.$t('monitor.unnamedMetric');
    },
    handleSearch() {
      this.getList();
    },
    handleTableChange(pagination, filters) {
      this.currentPage = pagination.current;
      this.pageSize = pagination.pageSize;
      this.getList();
    },
    handleTimeChange(values) {
      this.timeRange = values;
      this.selectedDateTime = values[0] ? new Date(values[0]) : null;
      this.calcCompareRanges();
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },
    handleComparisonChange() {
      this.calcCompareRanges();
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },
    calcCompareRanges() {
      if (!this.isTimeRangeValid) return;
      const [startStr, endStr] = this.timeRange;
      const startTime = new Date(startStr);
      const endTime = new Date(endStr);
      this.momRange = [
        formatDate(new Date(startTime.getTime() - 24 * 60 * 60 * 1000),'YYYY-MM-dd HH:mm:ss'),
        formatDate(new Date(endTime.getTime() - 24 * 60 * 60 * 1000),'YYYY-MM-dd HH:mm:ss')
      ];
      this.yoyRange = [
        formatDate(new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000),'YYYY-MM-dd HH:mm:ss'),
        formatDate(new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000),'YYYY-MM-dd HH:mm:ss')
      ];
    },
    getIntervalMs(intervalStr) {
      const match = intervalStr.match(/^(\d+)([a-z]+)$/);
      if (!match) return 60 * 1000;
      const num = parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case 'm': return num * 60 * 1000;
        case 's': return num * 1000;
        case 'h': return num * 60 * 60 * 1000;
        default: return 60 * 1000;
      }
    },
    adjustChartHeights() {
      if (!this.$refs.chartsContainer) return;
      const modalBody = this.$refs.chartsContainer.parentElement;
      const modalBodyHeight = modalBody ? modalBody.clientHeight : 600;
      const filterBar = document.querySelector('.filter-bar');
      const filterBarHeight = filterBar ? filterBar.offsetHeight : 0;
      // 增加单位选择器的高度计算
      const unitSelector = document.querySelector('.modal-unit-selector');
      const unitSelectorHeight = unitSelector ? unitSelector.offsetHeight : 0;
      const margins = 40;
      const availableHeight = Math.max(300, modalBodyHeight - filterBarHeight - unitSelectorHeight - margins);
      const baseHeight = Math.floor(availableHeight / this.chartCount);
      const chartHeight = Math.max(200, baseHeight);
      [this.$refs.currentChartRef, this.$refs.momChartRef, this.$refs.yoyChartRef]
        .filter(ref => ref)
        .forEach(ref => {
          ref.style.height = `${chartHeight}px`;
        });
    },
    async renderCharts() {
      this.chartLoading = true;
      this.chartError = null;
      
      // 清理现有图表
      [this.currentChart, this.momChart, this.yoyChart].forEach(chart => {
        if (chart) {
          chart.off('click');
          chart.off('mouseover');
          chart.off('mousemove');
          chart.getZr().off('mouseout');
          chart.getZr().off('mouseover');
          chart.dispose();
        }
      });
      this.currentChart = null;
      this.momChart = null;
      this.yoyChart = null;
      this.activeIndex = -1;
      this.isMouseInChart = false;

      if (!this.isTimeRangeValid || !this.currentMetric) {
        this.chartLoading = false;
        return;
      }

      try {
        // 先获取当前时段的数据，这会设置正确的metricOptions
        const currentResult = await this.fetchChartData(this.timeRange);
        if (!currentResult) {
          this.chartLoading = false;
          return;
        }
        
        const { xData: currentXData, seriesData: currentSeriesData, originalValues: currentOriginalValues } = currentResult;
        
        const renderChart = async (dom, timeRange, color, title, isCurrent = false) => {
          if (!dom) return null;
          const chart = echarts.init(dom);
          chart.showLoading({
            text: this.$t('common.metricMonitor.loading'),
            textStyle: { fontSize: 14 },
            effect: 'spin'
          });

          let xData, seriesData, originalValues;
          
          if (isCurrent) {
            // 当前时段，使用已经获取的数据
            xData = currentXData;
            seriesData = currentSeriesData;
            originalValues = currentOriginalValues;
          } else {
            // 环比/同比时段，重新获取数据
            const result = await this.fetchChartData(timeRange);
            if (!result) {
              chart.hideLoading();
              return null;
            }
            xData = result.xData;
            seriesData = result.seriesData;
            originalValues = result.originalValues;
          }
          
          // 转换数据值为当前单位
          const convertedSeriesData = seriesData.map(value => this.convertChartValue(value));
          
          const dataLength = xData.length;
          let axisLabelInterval = 0;
          if (dataLength > 20) {
            axisLabelInterval = Math.floor(dataLength / 10);
          } else if (dataLength > 10) {
            axisLabelInterval = Math.floor(dataLength / 5);
          }
          
          const option = {
            title: {
              text: title,
              left: 'center',
              textStyle: {
                fontSize: 14,
                fontWeight: 'normal'
              }
            },
            tooltip: { 
              trigger: 'axis',
              formatter: (params) => {
                const dataIndex = params[0].dataIndex;
                const originalValue = originalValues[dataIndex];
                const value = params[0].value;
                const unit = this.modalCurrentUnit || this.selectItem.unit || '';
                
                // 如果原始值是字符串，直接显示原始值并添加换行
                let displayValue = originalValue;
                if (typeof originalValue === 'string') {
                  displayValue = this.addLineBreaks(originalValue);
                } else {
                  // 使用智能格式化显示数值
                  displayValue = this.formatSmartValue(value);
                }
                
                return `${params[0].name}<br/>${this.currentMetric}: ${displayValue}${typeof originalValue !== 'string' ? unit : ''}`;
              },
              axisPointer: { type: 'line', z: 10 },
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: '#1890ff',
              borderWidth: 1
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '15%',
              top: '15%',
              containLabel: true
            },
            xAxis: { 
              type: 'category', 
              data: xData,
              axisLabel: {
                rotate: 45,
                interval: axisLabelInterval,
                fontSize: 10,
                margin: 8,
                formatter: (value) => {
                  if (value.length > 10) {
                    return value.substring(5, 16);
                  }
                  return value;
                }
              },
              axisLine: { lineStyle: { color: '#000' } }
            },
            yAxis: { 
              type: 'value', 
              name: this.getAxisName(this.modalCurrentUnit || this.selectItem.unit),
              nameLocation: 'end',
              nameGap: 20,
              nameTextStyle: { fontSize: 12 },
              axisLine: { lineStyle: { color: '#000' } },
              splitLine: { lineStyle: { color: '#f5f5f5' } },
              // 优化数值显示格式
              axisLabel: {
                formatter: (value) => {
                  return this.formatChartAxisValue(value);
                }
              }
            },
            dataZoom: [
              {
                type: 'inside',
                start: 0,
                end: 100,
                zoomLock: false
              },
              {
                type: 'slider',
                start: 0,
                end: 100,
                bottom: '5%',
                height: 15
              }
            ],
            series: [{
              name: this.currentMetric,
              type: 'line',
              data: convertedSeriesData,
              smooth: true,
              showSymbol: true,
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                color: '#bfbfbf',
                borderColor: '#1890ff',
                borderWidth: 1.5
              },
              allowPointSelect: true,
              lineStyle: { width: 2, color },
              itemStyle: { color, borderWidth: 2, borderColor: '#fff' },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: `${color}33` },
                  { offset: 1, color: `${color}00` }
                ])
              },
              emphasis: {
                itemStyle: { symbolSize: 10 },
                lineStyle: { width: 3 }
              }
            }]
          };

          chart.setOption(option);
          chart.hideLoading();
          return chart;
        };

        // 渲染当前时段图表
        this.currentChart = this.$refs.currentChartRef ? 
          await renderChart(this.$refs.currentChartRef, this.timeRange, '#1890ff', this.$t('common.metricMonitor.currentPeriod'), true) : null;
        
        // 渲染环比图表
        if (this.showMomComparison && this.$refs.momChartRef) {
          this.momChart = await renderChart(
            this.$refs.momChartRef, 
            this.momRange, 
            '#faad14', 
            this.$t('common.metricMonitor.momComparison'),
            false
          );
        }
        
        // 渲染同比图表
        if (this.showYoyComparison && this.$refs.yoyChartRef) {
          this.yoyChart = await renderChart(
            this.$refs.yoyChartRef, 
            this.yoyRange, 
            '#52c41a', 
            this.$t('common.metricMonitor.yoyComparison'),
            false
          );
        }

        this.setupChartLinkage();
        
      } catch (error) {
        console.error("图表渲染失败:", error);
        this.chartError = this.$t('monitor.chartLoadFailed');
        this.$message.error(this.$t('monitor.chartLoadFailed'));
      } finally {
        this.chartLoading = false;
      }
    },
    async fetchChartData(timeRange) {
      const [startStr, endStr] = timeRange;
      try {
        const res = await getMonitorDetail(
          this.selectId, 
          this.selectItem.itemId || '', 
          startStr, 
          endStr, 
          this.selectItem.valueType || ''
        );
        // 适配新的返回结构：res.data.data.result
        const detailData = res.data.data || res.data;
        this.currentDataType = detailData.type;
        
        // 所有数据统一按 type === 2 处理
        const newMetricOptions = detailData.result || [];
        
        // 关键修改：确保使用正确的时间范围
        // 当获取环比数据时，需要基于传入的 timeRange 重新获取数据
        
        // 检查是否需要更新 metricOptions
        const shouldUpdateOptions = this.shouldUpdateMetricOptions(newMetricOptions);
        
        // 注意：这里不能每次都更新 metricOptions，因为环比/同比的 metric 列表应该是一样的
        // 只有当时间范围是当前时段时才更新主列表
        if (timeRange === this.timeRange && shouldUpdateOptions) {
          const currentSelection = this.metricOptions.length > 0 && 
            this.selectedMetricIndex < this.metricOptions.length 
            ? this.getMetricIdentifier(this.metricOptions[this.selectedMetricIndex].metric)
            : null;
          
          this.metricOptions = newMetricOptions;
          
          if (currentSelection && newMetricOptions.length > 0) {
            let foundIndex = 0;
            for (let i = 0; i < newMetricOptions.length; i++) {
              const metricId = this.getMetricIdentifier(newMetricOptions[i].metric);
              if (metricId === currentSelection) {
                foundIndex = i;
                break;
              }
            }
            this.selectedMetricIndex = foundIndex;
          } else {
            this.selectedMetricIndex = 0;
          }
        }
        
        // 根据当前选择的 metric 获取数据
        let selectedData = null;
        
        // 如果是当前时段，使用更新后的 metricOptions
        if (timeRange === this.timeRange) {
          selectedData = this.metricOptions[this.selectedMetricIndex] || null;
        } else {
          // 对于环比/同比，从返回的数据中找到对应的 metric
          // 这里需要根据当前选择的 metric 标识来匹配
          const currentMetricId = this.getMetricIdentifier(
            this.metricOptions[this.selectedMetricIndex]?.metric || {}
          );
          
          for (const option of newMetricOptions) {
            if (this.getMetricIdentifier(option.metric) === currentMetricId) {
              selectedData = option;
              break;
            }
          }
          
          // 如果没有找到匹配的，使用第一个
          if (!selectedData && newMetricOptions.length > 0) {
            selectedData = newMetricOptions[0];
          }
        }
        
        if (!selectedData || !selectedData.list || selectedData.list.length === 0) {
          return { xData: [], seriesData: [] };
        }
        
        const xData = [];
        const seriesData = [];
        const originalValues = [];
        
        selectedData.list.forEach(item => {
          xData.push(item.datetime);
          const value = item.valueFloat !== undefined ? item.valueFloat : parseFloat(item.value);
          seriesData.push(isNaN(value) ? 0 : value);
          originalValues.push(item.value); // 保存原始值
        });
        
        return { xData, seriesData, originalValues };
      } catch (error) {
        console.error("获取监控详情失败:", error);
        this.$message.error(this.$t('monitor.getMonitorDetailFailed'));
        throw error;
      }
    },
    shouldUpdateMetricOptions(newOptions) {
      if (this.metricOptions.length === 0) return true;
      if (this.metricOptions.length !== newOptions.length) return true;
      for (let i = 0; i < newOptions.length; i++) {
        const newMetric = newOptions[i].metric;
        const oldMetric = this.metricOptions[i]?.metric;
        if (!oldMetric) return true;
        const newId = this.getMetricIdentifier(newMetric);
        const oldId = this.getMetricIdentifier(oldMetric);
        if (newId !== oldId) return true;
      }
      return false;
    },
    getMetricIdentifier(metric) {
      const priorityKeys = ['instance', 'address', 'host_ip', 'host', 'port', 'name', 'job'];
      for (const key of priorityKeys) {
        if (metric[key]) {
          return `${key}:${metric[key]}`;
        }
      }
      return Object.keys(metric)
        .sort()
        .map(key => `${key}:${metric[key]}`)
        .join('|');
    },
    setupChartLinkage() {
      const activeCharts = [this.currentChart, this.momChart, this.yoyChart].filter(chart => chart);
      if (activeCharts.length <= 1) return;

      const debouncedSync = debounce((activeIndex) => {
        if (!this.isMouseInChart) return;
        this.syncAllCharts(activeIndex);
      }, 20);

      this.syncAllCharts = (activeIndex) => {
        if (this.activeIndex === activeIndex) return;
        this.activeIndex = activeIndex;

        activeCharts.forEach(chart => {
          chart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
          chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: activeIndex
          });
          chart.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: activeIndex,
            position: 'top'
          });
          chart.dispatchAction({
            type: 'showAxisPointer',
            axisPointer: {
              type: 'line',
              value: activeIndex,
              axis: 'x',
              z: 20,
              lineStyle: { color: '#1890ff', width: 2 }
            }
          });
        });
      };

      const clearAllHighlights = () => {
        if (!this.isMouseInChart) {
          this.activeIndex = -1;
          activeCharts.forEach(chart => {
            chart.dispatchAction({ type: 'downplay', seriesIndex: 0 });
            chart.dispatchAction({ type: 'hideTip' });
            chart.dispatchAction({ type: 'hideAxisPointer' });
          });
        }
      };

      activeCharts.forEach(chart => {
        chart.getZr().on('mouseover', () => {
          this.isMouseInChart = true;
        });
        chart.getZr().on('mouseout', () => {
          this.isMouseInChart = false;
          clearAllHighlights();
        });
        chart.on('click', (params) => {
          if (params.componentType === 'series' && params.seriesIndex === 0) {
            this.syncAllCharts(params.dataIndex);
          }
        });
        chart.on('mouseover', (params) => {
          if (params.componentType === 'series' && params.seriesIndex === 0) {
            this.syncAllCharts(params.dataIndex);
          }
        });
        chart.on('mousemove', (params) => {
          if (params.componentType === 'series' && params.seriesIndex === 0) {
            debouncedSync(params.dataIndex);
          }
        });
      });

      const container = this.$refs.chartsContainer;
      if (container) {
        container.addEventListener('mouseleave', () => {
          this.isMouseInChart = false;
          clearAllHighlights();
        });
      }
    },
    getAxisName(unit) {
      if (!unit) return this.$t('common.value');
      if (unit.includes('%')) {
        return `${this.$t('common.percentage')}(${unit})`;
      } else if (unit.includes('s') || unit.includes('ms')) {
        return `${this.$t('common.time')}(${unit})`;
      } else if (unit.includes('bps') || unit.includes('B/s')) {
        return `${this.$t('common.rate')}(${unit})`;
      } else if (unit.includes('pps')) {
        return `${this.$t('common.packetRate')}(${unit})`;
      } else if (unit.includes('ops')) {
        return `${this.$t('common.ioRate')}(${unit})`;
      }
      return `${this.$t('common.value')}(${unit})`;
    },
    getUnitSuffix(unit) {
      if (unit) {
        return unit;
      }
      return '';
    },
    handleModalCancel() {
      this.modalVisible = false;
      [this.currentChart, this.momChart, this.yoyChart].forEach(chart => {
        if (chart) {
          chart.off('click');
          chart.off('mouseover');
          chart.off('mousemove');
          chart.getZr().off('mouseout');
          chart.getZr().off('mouseover');
          chart.dispose();
        }
      });
      this.currentChart = null;
      this.momChart = null;
      this.yoyChart = null;
      this.metricOptions = [];
      this.selectedMetricIndex = 0;
    },
    // 指标设置相关方法
    async showMetricSettingsModal() {
      try {
        // 从getUserConfig接口获取所有指标的配置数据
        const userConfig = await this.loadUserConfig();
        
        // 初始化指标设置列表，显示所有指标，使用用户配置的isVisible和sortOrder
        this.metricSettingsList = userConfig.map(config => ({
          itemId: config.itemId,
          name: config.itemName || config.itemId,
          isVisible: config.isVisible,
          sortOrder: config.sortOrder
        }));
        
        // 按sortOrder排序
        this.metricSettingsList.sort((a, b) => a.sortOrder - b.sortOrder);
        
        // 检查是否所有指标都被选中
        const allChecked = this.metricSettingsList.every(item => item.isVisible);
        this.selectAll = allChecked;
        
        this.metricSettingsModalVisible = true;
      } catch (error) {
        console.error('获取用户配置失败:', error);
        // 出错时使用当前页面的指标
        this.metricSettingsList = this.metricList.map((metric, index) => ({
          ...metric,
          isVisible: true,
          sortOrder: index + 1
        }));
        this.selectAll = true;
        this.metricSettingsModalVisible = true;
      }
    },
    handleMetricSettingsCancel() {
      this.metricSettingsModalVisible = false;
    },
    async handleMetricSettingsConfirm() {
      try {
        // 准备保存的数据
        const configList = this.metricSettingsList.map((metric, index) => ({
          itemId: metric.itemId || metric.name,
          itemName: metric.name,
          sortOrder: index + 1,
          isVisible: metric.isVisible
        }));

        // 调用保存接口
        await saveUserConfig({
          assetId: this.selectId,
          configList
        });
        
        this.$message.success(this.$t('monitor.metricSettingsSaved'));
        this.metricSettingsModalVisible = false;
        
        // 重新加载指标列表
        this.getList();
      } catch (error) {
        console.error('保存指标设置失败:', error);
        this.$message.error(this.$t('monitor.saveMetricSettingsFailed'));
      }
    },
    handleSelectAll(e) {
      const checked = e.target.checked;
      this.selectAll = checked;
      this.metricSettingsList.forEach(metric => {
        metric.isVisible = checked;
      });
    },
    handleMetricVisibilityChange(metric) {
      // 检查是否所有指标都被选中
      const allChecked = this.metricSettingsList.every(item => item.isVisible);
      this.selectAll = allChecked;
    },
    handleDragStart(event, index) {
      this.draggedIndex = index;
      event.dataTransfer.effectAllowed = 'move';
    },
    handleDrop(event, index) {
      event.preventDefault();
      if (this.draggedIndex !== -1 && this.draggedIndex !== index) {
        // 移动指标项
        const draggedItem = this.metricSettingsList[this.draggedIndex];
        this.metricSettingsList.splice(this.draggedIndex, 1);
        this.metricSettingsList.splice(index, 0, draggedItem);
      }
      this.draggedIndex = -1;
    },
    async loadUserConfig() {
      try {
        const res = await getUserConfig(this.selectId);
        if (res.code === 0 && res.data) {
          return res.data;
        }
        return [];
      } catch (error) {
        console.error('获取用户配置失败:', error);
        return [];
      }
    },
    async applyUserConfig() {
      try {
        const userConfig = await this.loadUserConfig();
        if (userConfig.length > 0) {
          // 创建配置映射，方便查找
          const configMap = {};
          userConfig.forEach(config => {
            configMap[config.itemId] = config;
          });
          
          // 过滤出可见的指标
          let visibleMetrics = this.metricList.filter(metric => {
            const config = configMap[metric.itemId || metric.name];
            return config ? config.isVisible : true;
          });
          
          // 根据配置排序
          visibleMetrics.sort((a, b) => {
            const configA = configMap[a.itemId || a.name];
            const configB = configMap[b.itemId || b.name];
            const orderA = configA ? configA.sortOrder : 9999;
            const orderB = configB ? configB.sortOrder : 9999;
            return orderA - orderB;
          });
          
          // 更新filteredMetricList，不修改metricList和total
          this.filteredMetricList = visibleMetrics;
        }
      } catch (error) {
        console.error('应用用户配置失败:', error);
      }
    }
  },
  watch: {
    modalVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.adjustChartHeights();
        });
      }
    }
  },
  beforeDestroy() {
    this.clearTimer();
    clearTimeout(this.searchTimer);
    [this.currentChart, this.momChart, this.yoyChart].forEach(chart => {
      if (chart) {
        chart.off('click');
        chart.off('mouseover');
        chart.off('mousemove');
        chart.getZr().off('mouseout');
        chart.getZr().off('mouseover');
        chart.dispose();
      }
    });
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
</script>

<style scoped>
.metric-monitor-container {
  padding:0 20px;
  background-color: #fff;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

/* 指标设置弹窗样式 */
.metric-settings-content {
  padding: 20px 0;
}

.metric-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.drag-hint {
  color: #999;
  font-size: 14px;
}

.metric-settings-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.metric-settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: grab;
  transition: all 0.3s;
}

.metric-settings-item:hover {
  background-color: #f5f5f5;
  border-color: #1890ff;
}

.metric-settings-item:active {
  cursor: grabbing;
}

.drag-icon {
  font-size: 18px;
  color: #999;
  user-select: none;
}

.metric-settings-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.header-actions {
  display: flex;
  align-items: center;
}

.metric-table-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px;
}

::v-deep .row-critical {
  background-color: #fff1f0 !important;
}

::v-deep .row-warning {
  background-color: #fffbe6 !important;
}

.metric-name {
  color: #1890ff;
  cursor: pointer;
  transition: all 0.3s;
}
.metric-type.noText {
  color: #1890ff;
  font-weight: bold;
  background-color: #E6F7FF;
  padding: 2px 4px;
  border-radius: 3px;
}
.metric-type.number{
   color: #0066cc;
  font-weight: bold;
  background-color: #eef6ff;
  padding: 2px 4px;
  border-radius: 3px;
}
.metric-type.float{
 color: #cc7700;
  font-weight: bold;
  background-color: #fff5eb;
  padding: 2px 4px;
  border-radius: 3px;
  border-left: 3px solid #ff9900;
}
.metric-type.character{
 color: #7700cc;
  background-color: #f5f0ff;
  padding: 2px 4px;
  border-radius: 4px;
  font-style: italic;
}
.metric-type.text{
 color: #aa5500;
  background-color: #fdf5f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-style: italic;
}

.metric-name:hover {
  color: #096dd9;
  text-decoration: underline;
}

/* 新增：无单位提示文字样式 */
.no-unit-tip {
  color: #999;
  font-size: 12px;
  display: inline-block;
  line-height: 32px; /* 与下拉框高度保持一致 */
}

.value-normal {
  color: #52c41a;
}

.value-warning {
  color: #faad14;
  font-weight: 500;
}

.value-critical {
  color: #f5222d;
  font-weight: 500;
}

::v-deep .fixed-height-modal .ant-modal-content {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

::v-deep .fixed-height-modal .ant-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: #1890ff #f0f0f0;
}

::v-deep .fixed-height-modal .ant-modal-body::-webkit-scrollbar {
  width: 6px;
}

::v-deep .fixed-height-modal .ant-modal-body::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

::v-deep .fixed-height-modal .ant-modal-body::-webkit-scrollbar-thumb {
  background-color: #1890ff;
  border-radius: 3px;
}

.metric-selector {
  margin-bottom: 16px;
}

.metric-selector .ant-select {
  width: 100%;
}

.modal-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 弹窗单位选择器样式 */
.modal-unit-selector {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.filter-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.comparison-options {
  display: flex;
  gap: 16px;
  align-items: center;
}

.time-range-error {
  color: #f5222d;
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  flex: 1;
}

.chart-wrapper {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 16px;
  transition: all 0.3s;
  flex-shrink: 0;
  min-height: 200px;
}

.chart-wrapper:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.chart-title {
  font-size: 14px;
  color: #1f2329;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 500;
}

.chart-inner {
  width: 100%;
  transition: height 0.3s ease;
}

.refresh-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  line-height: 1;
}

.refresh-interval {
  display: inline-block;
}

.button-refresh {
  margin-top: 0;
  margin-left: 10px;
  border-radius: 0;
  width: 70px;
}

@media (max-width: 1200px) {
  .filter-bar {
    display: flex;
  }
  
  .comparison-options {
    display: flex;
  }
}

@media (max-width: 768px) {
  ::v-deep .fixed-height-modal {
    width: 95% !important;
  }
  
  ::v-deep .fixed-height-modal .ant-modal-content {
    height: 550px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions .ant-input-search {
    width: 100% !important;
  }
  
  .refresh-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .chart-inner {
    min-height: 160px;
  }
}

::v-deep .echarts-loading-text {
  color: #1890ff !important;
}

::v-deep .echarts-loading-spinner {
  border-color: rgba(24, 144, 255, 0.2) !important;
  border-top-color: #1890ff !important;
}
</style>