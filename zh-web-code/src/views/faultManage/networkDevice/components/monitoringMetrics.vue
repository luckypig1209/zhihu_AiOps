<template>
  <div class="metric-trend-page">
    <div class="top-tip">
      <i class="el-icon-warning"></i>
      {{ $t('common.firstCollectionDataInsufficient') }}
    </div>
    <!-- 顶部时间范围控制 -->
    <div class="time-range-controls">
      <span class="time-label">{{ $t('common.timeRange') }}: </span>
      <el-date-picker v-if="isDatePickerReady" v-model="timeRange" style="width: 356px" type="datetimerange"
        align="right" :picker-options="pickerOptionsPage" :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')"
        :clearable="true" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
        @change="updateAllChartsTimeRange" :default-time="['00:00:00', '23:59:59']" />
      <el-tooltip :content="$t('common.cannotSelectFutureTime')" placement="top">
        <i class="el-icon-question"></i>
      </el-tooltip>
    </div>

    <!-- 默认指标区域 -->
    <a-card class="metric-card">
      <template #title>
        <div class="custom-title">
          <span class="title-marker"></span>
          {{ $t('common.defaultMetricsTop3') }}
          <a-button type="primary" size="small" @click="showDefaultMetricModal" style="margin-left: 10px;">
            {{ $t('common.selectDefaultMetrics') }}
          </a-button>
        </div>
      </template>
      <!-- 指标列表加载中 -->
      <a-spin v-if="listLoading" :tip="$t('common.loadingMetricData')" style="display: block; margin: 20px 0;">
        <div style="height: 300px;"></div>
      </a-spin>
      <!-- 默认指标图表区域 -->
      <div class="chart-row" v-else>
        <div v-for="(item, index) in defaultMetrics" :key="`default_${item.itemId}`" class="chart-item">
          <div class="chart-header">
            <!-- 图表标题和选择器区域 -->
            <div class="chart-header-selectors">
              <!-- 指标名称 -->
              <div class="chart-title">
                {{ getChartTitle(item, index, 'default') }}
              </div>
              
              <!-- 选择器行 -->
              <div class="selector-row">
                <!-- 当数据类型为2且有多个metric选项时，显示分区选择器 -->
                <a-select
                  v-if="chartDataTypes[`defaultChart_${index}`] === 2 && 
                        chartMetricOptions[`defaultChart_${index}`] && 
                        chartMetricOptions[`defaultChart_${index}`].length > 1"
                  v-model="chartSelectedMetricIndex[`defaultChart_${index}`]"
                  size="small"
                  style="width: 100px;"
                  @change="handleSmallChartMetricChange('default', index, item)"
                  :title="getMetricSelectorTitle('default', index)"
                >
                  <a-select-option 
                    v-for="(option, optIndex) in chartMetricOptions[`defaultChart_${index}`]" 
                    :key="optIndex"
                    :value="optIndex"
                  >
                    <el-tooltip placement="top">
                      <div slot="content">
                        <pre>{{ JSON.stringify(option.metric, null, 2) }}</pre>
                      </div>
                      <span>{{ $t('common.partition') + (optIndex + 1) }}</span>
                    </el-tooltip>
                  </a-select-option>
                </a-select>

                <!-- 单位选择器（如果有单位换算选项） -->
                <a-select
                  v-if="hasUnitConversion(item)"
                  v-model="chartSelectedUnit[`defaultChart_${index}`]"
                  size="small"
                  style="width: 100px; margin-left: 4px;"
                  @change="handleUnitChange('default', index, item)"
                  :title="`选择显示单位 - 当前: ${chartSelectedUnit[`defaultChart_${index}`] || item.unit}`"
                >
                  <a-select-option 
                    v-for="option in getUnitOptionsForChart(item)" 
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
            
            <a-button type="text" icon="fullscreen" class="expand-btn" @click="expandChart(item)" />
          </div>
          <!-- 图表加载中/错误提示 -->
          <div :id="`defaultChart_${index}`" class="chart">
            <a-spin v-if="chartLoadings[`defaultChart_${index}`]" :tip="$t('common.loadingChartData')"
              style="height: 100%; display: flex; align-items: center; justify-content: center;">
              <div></div>
            </a-spin>
            <div v-else-if="chartErrors[`defaultChart_${index}`]" class="chart-error">
              {{ $t('common.chartLoadingFailed') }}, <a @click="reloadChart('default', index, item)">{{ $t('common.clickToRetry') }}</a>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <!-- 自定义指标区域 -->
    <a-card class="metric-card">
      <template #title>
        <div class="custom-title">
          <span class="title-marker"></span>
          {{ $t('common.customMetrics') }}
        </div>
      </template>
      <div class="chart-controls">
        <a-button type="primary" @click="openMetricModal" :disabled="listLoading || allMetrics.length < 4">
          {{ $t('common.selectMonitoringMetrics') }}
        </a-button>
        <span class="custom-tip" v-if="allMetrics.length < 4">{{ $t('common.noMoreOptionalMetrics') }}</span>
      </div>
      <!-- 自定义指标图表区域 -->
      <div class="chart-row" v-if="!listLoading">
        <div v-for="(item, index) in customMetrics" :key="`custom_${item.itemId}`" class="chart-item">
          <div class="chart-header">
            <!-- 图表标题和选择器区域 -->
            <div class="chart-header-selectors">
              <!-- 指标名称 -->
              <div class="chart-title">
                <a-tooltip>
                  <template slot="title">
                    {{ getChartTitle(item, index, 'custom') }}
                  </template>
                  <span>{{ getChartTitle(item, index, 'custom') }}</span>
                </a-tooltip>
              </div>
              
              <!-- 选择器行 -->
              <div class="selector-row">
                <!-- 当数据类型为2且有多个metric选项时，显示分区选择器 -->
                <a-select
                  v-if="chartDataTypes[`customChart_${index}`] === 2 && 
                        chartMetricOptions[`customChart_${index}`] && 
                        chartMetricOptions[`customChart_${index}`].length > 1"
                  v-model="chartSelectedMetricIndex[`customChart_${index}`]"
                  size="small"
                  style="width: 100px;"
                  @change="handleSmallChartMetricChange('custom', index, item)"
                  :title="getMetricSelectorTitle('custom', index)"
                >
                  <a-select-option 
                    v-for="(option, optIndex) in chartMetricOptions[`customChart_${index}`]" 
                    :key="optIndex"
                    :value="optIndex"
                  >
                    <el-tooltip placement="top">
                      <div slot="content">
                        <pre>{{ JSON.stringify(option.metric, null, 2) }}</pre>
                      </div>
                      <span>{{ $t('common.partition') + (optIndex + 1) }}</span>
                    </el-tooltip>
                  </a-select-option>
                </a-select>

                <!-- 单位选择器（如果有单位换算选项） -->
                <a-select
                  v-if="hasUnitConversion(item)"
                  v-model="chartSelectedUnit[`customChart_${index}`]"
                  size="small"
                  style="width: 100px; margin-left: 4px;"
                  @change="handleUnitChange('custom', index, item)"
                  :title="`选择显示单位 - 当前: ${chartSelectedUnit[`customChart_${index}`] || item.unit}`"
                >
                  <a-select-option 
                    v-for="option in getUnitOptionsForChart(item)" 
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
            
            <a-button type="text" icon="fullscreen" class="expand-btn" @click="expandChart(item)" />
          </div>
          <!-- 图表加载中/错误提示 -->
          <div :id="`customChart_${index}`" class="chart">
            <a-spin v-if="chartLoadings[`customChart_${index}`]" :tip="$t('common.loadingChartData')"
              style="height: 100%; display: flex; align-items: center; justify-content: center;">
              <div></div>
            </a-spin>
            <div v-else-if="chartErrors[`customChart_${index}`]" class="chart-error">
              {{ $t('common.chartLoadingFailed') }}, <a @click="reloadChart('custom', index, item)">{{ $t('common.clickToRetry') }}</a>
            </div>
          </div>
        </div>
        <!-- 无自定义指标时的占位 -->
        <div class="no-custom-metric" v-if="customMetrics.length === 0 && allMetrics.length >= 4">
          {{ $t('common.pleaseClickToAddCustomMetrics') }}
        </div>
      </div>
    </a-card>

    <!-- 监控指标弹窗（原自定义指标选择弹窗，保留） -->
    <a-modal :title="$t('common.selectMonitoringMetrics')" v-model="metricModalVisible" width="1200px" @ok="handleMetricConfirm"
      :confirmLoading="listLoading"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')">
      <div class="modal-content">
        <a-input v-model="searchKeyword" :placeholder="$t('common.searchMetricName')" style="width: 200px; margin-bottom: 12px;" />
        <a-table :columns="metricColumns" :data-source="filteredMetrics" 
          :pagination="false"
          @change="handleTableChange" row-key="itemId" bordered :loading="listLoading" 
           :locale="{
              emptyText: $t('common.noData')
            }"
          >
          <!-- 指标名称 + 勾选框（默认指标禁用勾选） -->
          <template slot="name" slot-scope="text, record">
            <a-checkbox :checked="selectedMetrics.includes(record.itemId)" @change="(e) => handleMetricCheck(record, e)"
              :disabled="defaultItemIds.includes(record.itemId)">
              {{ text }}
              <span class="default-tag" v-if="defaultItemIds.includes(record.itemId)">{{ $t('common.defaultMetric') }}</span>
            </a-checkbox>
          </template>
          <!-- 格式化指标类型显示（如FLOAT→浮点数） -->
          <template slot="type" slot-scope="text">
            <span>{{ text === 'FLOAT' ? $t('common.floatNumber') : text === 'INT' ? $t('common.integer') : text }}</span>
          </template>
          <!-- 格式化指标值显示（带单位） -->
          <template slot="lastValue" slot-scope="text, record">
            <a-tooltip :title="(record.displayValue || text) ? (record.displayValue || text) : '--'" placement="top">
              <span style="display: inline-block; width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ (record.displayValue || text) ? (record.displayValue || (typeof text === 'string' ? this.formatSmartValue(text) : this.formatSmartValue(parseFloat(text) || text))) : '--' }}</span>
            </a-tooltip>
          </template>
        </a-table>
        <div class="table-pagination">
          <a-pagination 
            v-model="currentPage"
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            :page-size-options="['5', '10', '20']"
            show-size-changer
            show-quick-jumper
            show-total
            :total-render="(total) => $t('common.total') + ` ${total} ${$t('common.items')}`"
            :locale="{
              items_per_page: $t('common.itemsPerPage'),
              jump_to: $t('common.jumpTo'),
              page: $t('common.page')
            }"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </a-modal>

    <!-- 默认指标选择弹窗 -->
    <a-modal :title="$t('common.selectDefaultMetrics')" v-model="defaultMetricModalVisible" width="1200px" @ok="handleDefaultMetricConfirm"
      :confirmLoading="listLoading"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')">
      <div class="modal-content">
        <a-input v-model="searchKeyword" :placeholder="$t('common.searchMetricName')" style="width: 200px; margin-bottom: 12px;" />
        <a-table :columns="metricColumns" :data-source="filteredMetrics" 
          :pagination="false"
          @change="handleTableChange" row-key="itemId" bordered :loading="listLoading" 
           :locale="{
              emptyText: $t('common.noData')
            }"
          >
          <!-- 指标名称 + 勾选框 -->
          <template slot="name" slot-scope="text, record">
            <a-checkbox :checked="defaultMetricsSelected.includes(record.itemId)" @change="(e) => handleDefaultMetricCheck(record, e)">
              {{ text }}
            </a-checkbox>
          </template>
          <!-- 格式化指标类型显示（如FLOAT→浮点数） -->
          <template slot="type" slot-scope="text">
            <span>{{ text === 'FLOAT' ? $t('common.floatNumber') : text === 'INT' ? $t('common.integer') : text }}</span>
          </template>
          <!-- 格式化指标值显示（带单位） -->
          <template slot="lastValue" slot-scope="text, record">
            <a-tooltip :title="(record.displayValue || text) ? (record.displayValue || text) : '--'" placement="top">
              <span style="display: inline-block; width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ (record.displayValue || text) ? (record.displayValue || (typeof text === 'string' ? this.formatSmartValue(text) : this.formatSmartValue(parseFloat(text) || text))) : '--' }}</span>
            </a-tooltip>
          </template>
        </a-table>
        <div class="table-pagination">
          <a-pagination 
            v-model="currentPage"
            :total="total"
            :current="currentPage"
            :page-size="pageSize"
            :page-size-options="['5', '10', '20']"
            show-size-changer
            show-quick-jumper
            show-total
            :total-render="(total) => $t('common.total') + ` ${total} ${$t('common.items')}`"
            :locale="{
              items_per_page: $t('common.itemsPerPage'),
              jump_to: $t('common.jumpTo'),
              page: $t('common.page')
            }"
            @change="handlePageChange"
            @showSizeChange="handleSizeChange"
          />
        </div>
      </div>
    </a-modal>

    <!-- 图表放大弹窗（整合MetricMonitor组件的弹窗功能） -->
    <a-modal v-model="modalVisible" :title="`${currentMetric} ${$t('common.trendAnalysis')}`" width="1000px" @cancel="handleModalCancel"
      :mask-closable="false" :footer="null" class="fixed-height-modal"
      :body-style="{ maxHeight: '80vh', overflowY: 'auto' }">
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
                <span>{{ currentMetric + ' ' + $t('common.partition') + (index + 1) }}</span>
              </el-tooltip>
            </a-select-option>
          </a-select>
        </div>

        <!-- 时间范围筛选和对比选项 -->
        <div class="filter-bar">
          <!-- 弹窗内单位选择器 -->
          <div v-if="expandedChartItem && expandedChartItem.unit && expandedChartItem.unit.trim() !== ''" class="modal-unit-selector">
            <a-select
              v-model="modalCurrentUnit"
              style="width: 100px"
              @change="handleModalUnitChange"
              :options="getUnitOptions(expandedChartItem)"
              :placeholder="$t('common.selectUnit')"
            />
          </div>

          <el-date-picker v-model="timeRangeModal" style="width: 356px" type="datetimerange" align="right"
            :picker-options="pickerOptionsModal" :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')" :clearable="true"
            format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss" @change="handleTimeChangeModal"
            :default-time="['00:00:00', '23:59:59']" />

          <div class="comparison-options">
            <a-checkbox v-model="showMomComparison" @change="handleComparisonChange">
              {{ $t('common.momComparison') }}（{{ $t('common.samePeriodYesterday') }}）
            </a-checkbox>
            <a-checkbox v-model="showYoyComparison" @change="handleComparisonChange">
              {{ $t('common.yoyComparison') }}（{{ $t('common.samePeriodLastWeek') }}）
            </a-checkbox>
          </div>
        </div>

        <!-- 时间范围无效提示 -->
        <div v-if="!isTimeRangeValid" class="time-range-error">
          {{ $t('common.pleaseSelectValidTimeRange') }}
        </div>

        <!-- 图表容器（自适应高度+滑动联动） -->
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
  </div>
</template>

<script>
import Vue from 'vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import {
  getMonitorList,
  getMonitorDetail,
  saveUserCache,
  getUserCache,
  saveDefaultUserCache,
  getDefaultUserCache
} from "@/api/monitor/task";

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
  '百分比': {
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
      { value: 'bit', label: 'bit', factor: 1 * 8},
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
  'byte': 'bytes',
  'B': 'bytes',
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
  's': 'time',
  'min': 'time',
  '%': '百分比',
  'Packets/s': 'Packets',
  '次/秒': '次/秒', // 文件输出（无需换算）
  // 新增无需处理的单位
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

export default Vue.extend({
  data() {
    return {
      // ---------------------- 原组件基础变量 ----------------------
      timeRange: [],
      defaultTimeRange: [],
      isDatePickerReady: false,
      pickerOptionsPage: {
        shortcuts: [
          { text: this.$t('common.last5Minutes'), onClick: (picker) => this.setShortcutTime(picker, 5 * 60 * 1000) },
          { text: this.$t('common.last15Minutes'), onClick: (picker) => this.setShortcutTime(picker, 15 * 60 * 1000) },
          { text: this.$t('common.last1Hour'), onClick: (picker) => this.setShortcutTime(picker, 60 * 60 * 1000) },
          { text: this.$t('common.last3Hours'), onClick: (picker) => this.setShortcutTime(picker, 3 * 60 * 60 * 1000) },
          { text: this.$t('common.last6Hours'), onClick: (picker) => this.setShortcutTime(picker, 6 * 60 * 60 * 1000) },
          { text: this.$t('common.last1Day'), onClick: (picker) => this.setShortcutTime(picker, 24 * 60 * 60 * 1000) }
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
      },

      allMetrics: [],
      defaultMetrics: [],
      customMetrics: [],
      selectedMetrics: [],
      searchKeyword: '',
      metricModalVisible: false,

      listLoading: false,
      chartLoadings: {},
      chartErrors: {},

      // 分页相关
      currentPage: 1,
      pageSize: 10,
      total: 0,

      defaultCharts: [],
      customCharts: [],
      expandedChartItem: null,

      chartDataTypes: {},
      chartMetricOptions: {},
      chartSelectedMetricIndex: {},
      chartSelectedUnit: {}, // 存储每个小图表选择的单位
      chartOriginalData: {}, // 存储每个小图表的原始数据（未换算单位的数据）

      // ---------------------- 弹窗相关变量 ----------------------
      modalVisible: false,
      currentMetric: '',
      timeRangeModal: [],
      momRange: [],
      yoyRange: [],
      showMomComparison: false,
      showYoyComparison: false,
      currentChart: null,
      momChart: null,
      yoyChart: null,
      resizeHandler: null,
      activeIndex: -1,
      isMouseInChart: false,
      chartLoading: false,
      chartError: null,
      
      currentDataType: 2,
      metricOptions: [],
      selectedMetricIndex: 0,
      defaultMetricsSelected: [],
      defaultMetricModalVisible: false,
      
      // 单位换算相关
      modalCurrentUnit: '',
      unitConversions: unitConversions,
      unitKeywordMap: unitKeywordMap,
      
      pickerOptionsModal: {
        shortcuts: [
          { text: this.$t('common.last5Minutes'), onClick: (picker) => this.setShortcutTime(picker, 5 * 60 * 1000) },
          { text: this.$t('common.last15Minutes'), onClick: (picker) => this.setShortcutTime(picker, 15 * 60 * 1000) },
          { text: this.$t('common.last1Hour'), onClick: (picker) => this.setShortcutTime(picker, 60 * 60 * 1000) },
          { text: this.$t('common.last3Hours'), onClick: (picker) => this.setShortcutTime(picker, 3 * 60 * 60 * 1000) },
          { text: this.$t('common.last6Hours'), onClick: (picker) => this.setShortcutTime(picker, 6 * 60 * 60 * 1000) },
          { text: this.$t('common.last1Day'), onClick: (picker) => this.setShortcutTime(picker, 24 * 60 * 60 * 1000) }
        ]
      },
      
      // 新增：存储不同时间范围的metric数据
      momMetricOptions: [],
      yoyMetricOptions: [],
      momMetricData: {},
      yoyMetricData: {}
    };
  },
  props: {
    selectRow: {
      type: Object,
      default: () => ({ id: 0 })
    }
  },
  computed: {
    filteredMetrics() {
      if (!this.allMetrics.length) return [];
      const filtered = this.allMetrics.filter(item =>
        item.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
      // 更新总数
      this.total = filtered.length;
      // 返回当前页的数据
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return filtered.slice(start, end);
    },

    defaultItemIds() {
      return this.defaultMetrics.map(item => item.itemId);
    },
    // 指标表格列配置
    metricColumns() {
      return [
        { title: this.$t('common.metricName'), dataIndex: 'name', key: 'name', scopedSlots: { customRender: 'name' } },
        { title: this.$t('common.metricType'), dataIndex: 'type', key: 'type', scopedSlots: { customRender: 'type' } },
        { title: this.$t('common.collectionInterval'), dataIndex: 'interval', key: 'interval', width: 120 },
        { title: this.$t('common.createTime'), dataIndex: 'createTime', key: 'createTime', width: 180 },
        { title: this.$t('common.lastCollectionValue'), dataIndex: 'lastValue', key: 'lastValue', width: 300,
          scopedSlots: { customRender: 'lastValue' }
        },
      ];
    },

    isTimeRangeValid() {
      if (!this.timeRangeModal || this.timeRangeModal.length !== 2) return false;
      const [startStr, endStr] = this.timeRangeModal;
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
    }
  },
  watch: {
    'selectRow.id': {
      immediate: true,
      handler(newId) {
        if (newId && newId > 0) {
          this.fetchMonitorList(newId);
        } else {
          this.clearAllData();
        }
      }
    },

    modalVisible(val) {
      if (val) {
        this.$nextTick(() => {
          this.adjustChartHeights();
        });
      }
    }
  },
  created() {
    // 初始化页面顶部默认时间范围（近1小时）
    const timeEnd = dayjs();
    const timeStart = timeEnd.subtract(1, 'hour');
    this.defaultTimeRange = [
      timeStart.format('YYYY-MM-DD HH:mm:ss'),
      timeEnd.format('YYYY-MM-DD HH:mm:ss')
    ];
    this.timeRange = this.defaultTimeRange;
    this.isDatePickerReady = true;

    // 弹窗内：初始化默认时间范围（近1小时）
    const endModal = new Date();
    const startModal = new Date(endModal.getTime() - 60 * 60 * 1000);
    this.timeRangeModal = [
      formatDate(startModal, 'YYYY-MM-dd HH:mm:ss'),
      formatDate(endModal, 'YYYY-MM-dd HH:mm:ss')
    ];
    this.calcCompareRanges();

    // 弹窗内：初始化窗口resize处理器
    this.resizeHandler = () => {
      this.adjustChartHeights();
      const activeCharts = [this.currentChart, this.momChart, this.yoyChart].filter(chart => chart);
      activeCharts.forEach(chart => chart.resize());
    };
    window.addEventListener('resize', this.resizeHandler);
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    this.destroyAllCharts();

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
  },
  methods: {
    // ---------------------- 单位换算相关方法 ----------------------
    
    // 检查指标是否有单位换算选项
    hasUnitConversion(item) {
      if (!item || !item.unit || item.unit.trim() === '') return false;
      const unitType = getUnitTypeByUnitValue(item.unit);
      return unitType;
    },

    // 获取小图表的单位选项
    getUnitOptionsForChart(item) {
      if (!item || !item.unit) return [];
      const unitType = getUnitTypeByUnitValue(item.unit);
      if (unitType && this.unitConversions[unitType]) {
        return this.unitConversions[unitType].units;
      }
      return [];
    },

    // 获取小图表的单位换算因子
    getUnitFactorForChart(chartId, item) {
      const selectedUnit = this.chartSelectedUnit[chartId];
      if (!selectedUnit || !item || !item.unit) return 1;
      
      const unitType = getUnitTypeByUnitValue(item.unit);
      if (unitType && this.unitConversions[unitType]) {
        const unitConfig = this.unitConversions[unitType];
        // 查找原始单位配置
        const originalUnitConfig = unitConfig.units.find(u => u.value === item.unit);
        const originalFactor = originalUnitConfig ? originalUnitConfig.factor : 1;
        
        // 查找目标单位配置
        const targetUnitConfig = unitConfig.units.find(u => u.value === selectedUnit);
        const targetFactor = targetUnitConfig ? targetUnitConfig.factor : 1;
        
        // 计算换算因子：目标单位 = 原始单位 * (目标因子 / 原始因子)
        return targetFactor / originalFactor;
      }
      return 1;
    },

    // 处理小图表单位变化
    handleUnitChange(type, index, item) {
      const chartId = `${type}Chart_${index}`;
      this.reloadChart(type, index, item);
    },

    // 智能格式化数值显示
    formatSmartValue(value) {
      if (value === 0) return '0';
      if (value === null || value === undefined || value === '') return '--';
      if (typeof value === 'string') return value;
      
      const absValue = Math.abs(value);
      
      // 根据数值大小选择不同的显示策略
      if (absValue >= 1000) {
        // 大数：使用千分位分隔，保留2位小数
        return value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
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

    // ---------------------- 小图表相关方法 ----------------------
    
    // 获取图表标题
    getChartTitle(item, index, type) {
      const chartId = `${type}Chart_${index}`;
      
      if (this.chartDataTypes[chartId] === 2 && 
          this.chartMetricOptions[chartId] && 
          this.chartMetricOptions[chartId].length > 1) {
        const selectedIndex = this.chartSelectedMetricIndex[chartId] || 0;
        return `${item.name}`;
      }
      
      return item.name;
    },

    // 获取分区选择器标题
    getMetricSelectorTitle(type, index) {
      const chartId = `${type}Chart_${index}`;
      const selectedIndex = this.chartSelectedMetricIndex[chartId] || 0;
      const metricOptions = this.chartMetricOptions[chartId] || [];
      
      if (metricOptions[selectedIndex] && metricOptions[selectedIndex].metric) {
        const metric = metricOptions[selectedIndex].metric;
        const priorityKeys = ['instance', 'address', 'host_ip', 'host', 'port', 'name', 'job'];
        
        for (const key of priorityKeys) {
          if (metric[key]) {
            return `${key}: ${metric[key]}`;
          }
        }
        
        return JSON.stringify(metric, null, 2);
      }
      
      return '选择分区';
    },

    // 更新图表数据类型信息
    updateChartDataType(chartId, dataType, metricOptions = [], selectedIndex = 0) {
      this.$set(this.chartDataTypes, chartId, dataType);
      this.$set(this.chartMetricOptions, chartId, metricOptions);
      this.$set(this.chartSelectedMetricIndex, chartId, selectedIndex);
    },

    // 处理小图表metric选择变化
    handleSmallChartMetricChange(type, index, item) {
      const chartId = `${type}Chart_${index}`;
      this.reloadChart(type, index, item);
    },

    // ---------------------- 原组件核心方法 ----------------------
    // 1. 拉取监控指标列表
    async fetchMonitorList(id) {
      this.listLoading = true;
      this.clearChartData();
      try {
          let params = {
          id: id,
          pageNo: 1,
          pageSize: 100,
          itemName: ''
        }
        const res = await getMonitorList(params);
        if (res.code === 0) {
          // 适配新的返回结构：res.data.list
          const listData = res.data.list || res.data || [];
          this.allMetrics = listData || [];
          this.total = res.data.total || this.allMetrics.length;

          // 从接口获取已保存的默认指标
          const defaultCacheRes = await getDefaultUserCache({ assetId: id });
          if (defaultCacheRes.code === 0 && Array.isArray(defaultCacheRes.data) && defaultCacheRes.data.length > 0) {
            this.defaultMetrics = this.allMetrics
              .filter(item => defaultCacheRes.data.includes(item.itemId.toString()))
              .slice(0, 3); // 最多显示3个默认指标
          } else {
            // 如果没有保存的默认指标，使用前3个
            this.defaultMetrics = this.allMetrics.slice(0, 3);
          }

          // 从接口获取已保存的自定义指标
          const cacheRes = await getUserCache({ assetId: id });
          if (cacheRes.code === 0 && Array.isArray(cacheRes.data)) {
            this.selectedMetrics = cacheRes.data;
            this.customMetrics = this.allMetrics
              .filter(item => !this.defaultItemIds.includes(item.itemId) && this.selectedMetrics.includes(item.itemId));
          } else {
            this.selectedMetrics = [];
            this.customMetrics = [];
          }
          
          // 为指标添加单位换算相关字段
          this.allMetrics = this.allMetrics.map(item => {
            // 解析原始值和单位
            const parsedData = this.parseOriginalValue(item.lastValue, item.unit);
            const unitType = getUnitTypeByUnitValue(parsedData.unit || item.unit || '');
            
            return {
              ...item,
              originalValue: parsedData.originalValue,
              unit: parsedData.unit || item.unit || '',
              displayValue: typeof parsedData.originalValue === 'string' ? parsedData.originalValue : (this.formatSmartValue(parsedData.originalValue) + (parsedData.unit ? ' ' + parsedData.unit : ''))
            };
          });
          
          // 更新默认和自定义指标
          this.defaultMetrics = this.defaultMetrics.map(item => 
            this.allMetrics.find(m => m.itemId === item.itemId) || item
          );
          this.customMetrics = this.customMetrics.map(item => 
            this.allMetrics.find(m => m.itemId === item.itemId) || item
          );
          
          // 初始化小图表的单位选择
          this.initializeChartUnits();
          
          this.$nextTick(() => {
            setTimeout(() => {
              this.initDefaultCharts();
              this.initCustomCharts();
            }, 100);
          });
        } else {
          this.$message.error(this.$t('monitor.getMetricListFailed'));
          this.clearAllData();
        }
      } catch (err) {
        console.error('指标列表请求异常:', err);
        this.$message.error(this.$t('monitor.getMetricListFailedRetry'));
        this.clearAllData();
      } finally {
        this.listLoading = false;
      }
    },

    // 初始化小图表单位选择
    initializeChartUnits() {
      // 初始化默认指标图表的单位选择
      this.defaultMetrics.forEach((item, index) => {
        const chartId = `defaultChart_${index}`;
        if (this.hasUnitConversion(item)) {
          const unitOptions = this.getUnitOptionsForChart(item);
          if (unitOptions.length > 0) {
            // 默认选择后端传入的原始单位
            const originalUnit = item.unit;
            // 检查原始单位是否在可选单位列表中
            const hasOriginalUnit = unitOptions.some(u => u.value === originalUnit);
            this.$set(this.chartSelectedUnit, chartId, hasOriginalUnit ? originalUnit : unitOptions[0].value);
          }
        }
      });

      // 初始化自定义指标图表的单位选择
      this.customMetrics.forEach((item, index) => {
        const chartId = `customChart_${index}`;
        if (this.hasUnitConversion(item)) {
          const unitOptions = this.getUnitOptionsForChart(item);
          if (unitOptions.length > 0) {
            // 默认选择后端传入的原始单位
            const originalUnit = item.unit;
            // 检查原始单位是否在可选单位列表中
            const hasOriginalUnit = unitOptions.some(u => u.value === originalUnit);
            this.$set(this.chartSelectedUnit, chartId, hasOriginalUnit ? originalUnit : unitOptions[0].value);
          }
        }
      });
    },

    // 解析原始数值
    parseOriginalValue(value, unit) {
      let originalValue = '--';
      let extractedUnit = unit || '';
      
      if (value === null || value === undefined || value === '') {
        // 空值处理
        originalValue = '--';
      } else if (typeof value === 'string') {
        // 检查是否为纯数字字符串（包括带千分位的数字）
        const numMatch = value.replace(/,/g, '').replace(/[^\d.]/g, '');
        if (numMatch && !isNaN(parseFloat(numMatch)) && numMatch === value.replace(/,/g, '')) {
          // 纯数字字符串，提取数值
          originalValue = parseFloat(numMatch) || 0;
        } else {
          // 包含非数字内容的字符串，保留原始值
          originalValue = value;
        }
      } else if (typeof value === 'number') {
        originalValue = value;
      }
      
      return {
        originalValue,
        unit: extractedUnit
      };
    },

    // 2. 获取图表数据
    async fetchChartData(item, timeRange = this.timeRange, forModal = false, selectedMetricIndex = 0, isCompareRange = false) {
      const { id } = this.selectRow;
      const [startTime, endTime] = timeRange;
      
      if (!id || !startTime || !endTime || !item?.itemId) {
        this.$message.warning(this.$t('monitor.chartDataParamsIncomplete'));
        return forModal ? { xData: [], seriesData: [] } : null;
      }

      try {
        const res = await getMonitorDetail(id, item.itemId, startTime, endTime, item.valueType);
        // 适配新的返回结构：res.data.data.result
        const detailData = res.data.data || res.data;
        this.currentDataType = detailData.type;
        
        // 所有数据统一按 type === 2 处理
        const newMetricOptions = detailData.result || [];
        
        if (forModal) {
          // 弹窗请求
          const xData = [];
          const seriesData = [];
          const originalValues = [];
          
          // 从返回的数据中找到对应的 metric
          let selectedData = null;
          if (this.metricOptions.length > 0) {
            const currentMetricId = this.getMetricIdentifier(
              this.metricOptions[this.selectedMetricIndex]?.metric || {}
            );
            
            for (const option of newMetricOptions) {
              if (this.getMetricIdentifier(option.metric) === currentMetricId) {
                selectedData = option;
                break;
              }
            }
          }
          
          // 如果没有找到匹配的，使用第一个
          if (!selectedData && newMetricOptions.length > 0) {
            selectedData = newMetricOptions[0];
          }
          
          if (selectedData && selectedData.list) {
            selectedData.list.forEach(item => {
              xData.push(item.datetime);
              const value = item.valueFloat !== undefined ? item.valueFloat : parseFloat(item.value);
              seriesData.push(isNaN(value) ? 0 : value);
              originalValues.push(item.value);
            });
          }
          
          return { xData, seriesData, originalValues };
        } else {
          // 页面小图表请求
          const metricOptions = newMetricOptions;
          let chartData = [];
          
          const safeIndex = Math.min(selectedMetricIndex, metricOptions.length - 1);
          const selectedIndex = Math.max(0, safeIndex);
          
          if (metricOptions.length > 0 && metricOptions[selectedIndex]?.list) {
            chartData = metricOptions[selectedIndex].list.map(item => [
              dayjs(item.datetime).valueOf(),
              item.valueFloat !== undefined ? item.valueFloat : Number(item.value) || 0,
              item.value // 保留原始值
            ]).sort((a, b) => a[0] - b[0]);
          }
          
          return { 
            chartData, 
            dataType: 2, 
            metricOptions,
            selectedIndex
          };
        }
      } catch (err) {
        console.error(`图表数据请求异常（${item.name}）:`, err);
        this.$message.error(this.$t('monitor.getMetricChartDataFailed', { name: item.name }));
        return forModal ? { xData: [], seriesData: [] } : { chartData: [], dataType: 2, metricOptions: [] };
      }
    },

    // 3. 创建原组件图表配置项（更新：支持单位换算）
    createChartOption(item, chartData, chartId = '') {
      chartData = chartData || [];
      
      // 获取单位换算因子
      let unitFactor = 1;
      let currentUnit = item.unit || '';
      let displayUnit = currentUnit;
      
      if (chartId && this.hasUnitConversion(item)) {
        unitFactor = this.getUnitFactorForChart(chartId, item);
        const selectedUnit = this.chartSelectedUnit[chartId];
        if (selectedUnit) {
          displayUnit = selectedUnit;
        }
      } else {
        // 如果没有单位换算选项，使用原始单位
        displayUnit = currentUnit;
      }
      
      // 应用单位换算
      const convertedData = chartData.map(item => [
        item[0],
        item[1] * unitFactor,
        item[2] // 原始值
      ]);
      
      const xData = convertedData.map(item => dayjs(item[0]).format('YYYY-MM-DD HH:mm:ss'));
      const dataLength = xData.length;
      let axisLabelInterval = 0;
      if (dataLength > 20) {
        axisLabelInterval = Math.floor(dataLength / 10);
      } else if (dataLength > 10) {
        axisLabelInterval = Math.floor(dataLength / 5);
      }
      const seriesData = convertedData.map(item => item[1]);
      const originalValues = convertedData.map(item => item[2]);

      let titleText = item.name;
      if (chartId && this.chartDataTypes[chartId] === 2 && 
          this.chartMetricOptions[chartId] && 
          this.chartMetricOptions[chartId].length > 1) {
        const selectedIndex = this.chartSelectedMetricIndex[chartId] || 0;
        titleText = `${item.name} ${this.$t('common.partition')}${selectedIndex + 1}`;
      }

      return {
        grid: {
          left: '8%',
          right: '4%',
          bottom: '25%',
          top: '5%',
          containLabel: true
        },
        dataZoom: [
          { type: 'inside', start: 0, end: 100, throttleDelay: 50 },
          {
            type: 'slider',
            top: '80%',
            bottom: '5%',
            start: 0,
            end: 100,
            throttleDelay: 50,
            height: 6,
            handleStyle: { width: 10, height: 6, borderRadius: 3, borderColor: '#1890ff' },
            fillerStyle: { color: 'rgba(24, 144, 255, 0.2)' }
          }
        ],
        xAxis: {
          type: 'category',
          data: xData,
          axisLabel: {
            rotate: 50,
            interval: axisLabelInterval,
            fontSize: 10,
            formatter: (value) => value.length > 10 ? value.substring(5, 16) : value
          },
          axisLine: { lineStyle: { color: '#000' } }
        },
        yAxis: {
          type: 'value',
          min: 0,
          name: displayUnit ? `${this.$t('common.unit')}: ${displayUnit}` : '',
          nameTextStyle: { fontSize: 11 },
          axisLabel: { 
            textStyle: { fontSize: 11 },
            formatter: (value) => {
              return this.formatChartAxisValue(value);
            }
          },
          splitLine: { lineStyle: { color: '#f0f0f0' } }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'line', label: { backgroundColor: '#6a7985' } },
          formatter: (params) => {
            const time = dayjs(params[0].axisValue).format('YYYY-MM-DD HH:mm:ss');
            const dataIndex = params[0].dataIndex;
            const originalValue = originalValues[dataIndex];
            const value = params[0].data;
            
            // 如果原始值是字符串，直接显示原始值并添加换行
            let displayValue = originalValue;
            if (typeof originalValue === 'string') {
              displayValue = this.addLineBreaks(originalValue);
            } else {
              displayValue = this.formatSmartValue(value);
            }
            
            const unit = displayUnit ? ` ${displayUnit}` : '';
            return `${time}<br/>${params[0].marker}${params[0].seriesName}: ${displayValue}${typeof originalValue !== 'string' ? unit : ''}`;
          },
          z: 99999,
          appendToBody: true
        },
        series: [{
          name: titleText,
          type: 'line',
          smooth: true,
          data: seriesData,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#e6f7ff' },
              { offset: 1, color: 'rgba(58,77,233,0.1)' }
            ])
          },
          lineStyle: { width: 2, color: '#1890ff' },
          symbol: 'circle',
          symbolSize: 4,
          showSymbol: false
        }]
      };
    },

    // 4. 初始化默认指标图表
    async initDefaultCharts() {
      this.defaultCharts.forEach(chart => chart && chart.dispose());
      this.defaultCharts = [];

      for (let [index, item] of this.defaultMetrics.entries()) {
        const chartId = `defaultChart_${index}`;
        const chartDom = document.getElementById(chartId);
        if (!chartDom) continue;

        this.$set(this.chartLoadings, chartId, true);
        this.$set(this.chartErrors, chartId, false);

        try {
          const result = await this.fetchChartData(item);
          if (result === null) {
            this.$set(this.chartErrors, chartId, true);
            continue;
          }

          // 存储原始数据
          this.$set(this.chartOriginalData, chartId, result.chartData);

          this.updateChartDataType(
            chartId, 
            result.dataType, 
            result.metricOptions, 
            result.selectedIndex
          );

          const myChart = echarts.init(chartDom);
          this.defaultCharts[index] = myChart;
          const option = this.createChartOption(item, result.chartData, chartId);
          myChart.setOption(option);

          myChart.resize = function () {
            echarts.getInstanceByDom(chartDom)?.resize();
          };
        } catch (err) {
          console.error(`默认图表初始化失败（${item.name}）:`, err);
          this.$set(this.chartErrors, chartId, true);
        } finally {
          this.$set(this.chartLoadings, chartId, false);
        }
      }
    },

    // 5. 初始化自定义指标图表
    async initCustomCharts() {
      this.customCharts.forEach(chart => chart && chart.dispose());
      this.customCharts = [];

      for (let [index, item] of this.customMetrics.entries()) {
        const chartId = `customChart_${index}`;
        const chartDom = document.getElementById(chartId);
        if (!chartDom) continue;

        this.$set(this.chartLoadings, chartId, true);
        this.$set(this.chartErrors, chartId, false);

        try {
          const result = await this.fetchChartData(item);
          if (result === null) {
            this.$set(this.chartErrors, chartId, true);
            continue;
          }

          // 存储原始数据
          this.$set(this.chartOriginalData, chartId, result.chartData);

          this.updateChartDataType(
            chartId, 
            result.dataType, 
            result.metricOptions, 
            result.selectedIndex
          );

          const myChart = echarts.init(chartDom);
          this.customCharts[index] = myChart;
          const option = this.createChartOption(item, result.chartData, chartId);
          myChart.setOption(option);

          myChart.resize = function () {
            echarts.getInstanceByDom(chartDom)?.resize();
          };
        } catch (err) {
          console.error(`自定义图表初始化失败（${item.name}）:`, err);
          this.$set(this.chartErrors, chartId, true);
        } finally {
          this.$set(this.chartLoadings, chartId, false);
        }
      }
    },

    // 6. 重新加载单个图表
    async reloadChart(type, index, item) {
      const chartId = type === 'default' ? `defaultChart_${index}` : `customChart_${index}`;
      this.$set(this.chartLoadings, chartId, true);
      this.$set(this.chartErrors, chartId, false);

      try {
        const selectedMetricIndex = this.chartSelectedMetricIndex[chartId] || 0;
        
        const result = await this.fetchChartData(item, this.timeRange, false, selectedMetricIndex);
        if (result === null) {
          this.$set(this.chartErrors, chartId, true);
          return;
        }

        // 存储原始数据
        this.$set(this.chartOriginalData, chartId, result.chartData);

        this.updateChartDataType(
          chartId, 
          result.dataType, 
          result.metricOptions, 
          selectedMetricIndex
        );

        const chart = type === 'default' ? this.defaultCharts[index] : this.customCharts[index];
        if (chart) {
          const option = this.createChartOption(item, result.chartData, chartId);
          chart.setOption(option, true);
        }
      } catch (err) {
        console.error(`图表重试失败（${item.name}）:`, err);
        this.$set(this.chartErrors, chartId, true);
      } finally {
        this.$set(this.chartLoadings, chartId, false);
      }
    },

    // 7. 时间范围变更，更新所有图表
    updateAllChartsTimeRange() {
      if (!this.timeRange || this.timeRange.length < 2) return;
      this.initDefaultCharts();
      this.initCustomCharts();
      if (this.modalVisible && this.expandedChartItem) {
        this.timeRangeModal = [...this.timeRange];
        this.calcCompareRanges();
        this.renderCharts();
      }
    },

    // 8. 指标勾选事件
    handleMetricCheck(record, e) {
      const { itemId } = record;
      const isChecked = e.target.checked;

      if (isChecked) {
        if (!this.selectedMetrics.includes(itemId)) {
          this.selectedMetrics.push(itemId);
        }
      } else {
        this.selectedMetrics = this.selectedMetrics.filter(id => id !== itemId);
      }
    },

    // 9. 确认选择自定义指标
    async handleMetricConfirm() {
      this.metricModalVisible = false;
      this.customMetrics = this.allMetrics
        .filter(item => !this.defaultItemIds.includes(item.itemId) && this.selectedMetrics.includes(item.itemId));

      try {
        await saveUserCache({
          assetId: this.selectRow.id,
          itemIdList: this.selectedMetrics
        });
        this.$message.success(this.$t('monitor.customMetricsSaved'));
      } catch (err) {
        console.error('保存自定义指标失败:', err);
        this.$message.error(this.$t('monitor.saveCustomMetricsFailed'));
      }

      // 初始化自定义指标图表的单位选择
      this.initializeChartUnits();
      
      this.$nextTick(() => this.initCustomCharts());
    },

    // 10. 打开默认指标选择弹窗
    showDefaultMetricModal() {
      // 初始化默认指标选择状态
      this.defaultMetricsSelected = this.defaultMetrics.map(item => item.itemId);
      this.defaultMetricModalVisible = true;
    },

    // 11. 处理默认指标勾选
    handleDefaultMetricCheck(record, e) {
      const { itemId } = record;
      const isChecked = e.target.checked;

      if (isChecked) {
        if (!this.defaultMetricsSelected.includes(itemId)) {
          this.defaultMetricsSelected.push(itemId);
        }
      } else {
        this.defaultMetricsSelected = this.defaultMetricsSelected.filter(id => id !== itemId);
      }
    },

    // 12. 确认选择默认指标
    async handleDefaultMetricConfirm() {
      this.defaultMetricModalVisible = false;
      
      // 最多选择3个默认指标
      const selectedIds = this.defaultMetricsSelected.slice(0, 3);
      this.defaultMetrics = this.allMetrics
        .filter(item => selectedIds.includes(item.itemId));

      try {
        await saveDefaultUserCache({
          assetId: this.selectRow.id,
          itemIdList: selectedIds
        });
        this.$message.success(this.$t('monitor.defaultMetricsSaved'));
      } catch (err) {
        console.error('保存默认指标失败:', err);
        this.$message.error(this.$t('monitor.saveDefaultMetricsFailed'));
      }

      // 重新初始化默认指标图表的单位选择
      this.initializeChartUnits();
      
      this.$nextTick(() => this.initDefaultCharts());
    },

    // 13. 表格分页/排序变更
    handleTableChange(pagination) {
      console.log('表格分页变更:', pagination);
      // 更新分页信息
      this.currentPage = pagination.current;
      this.pageSize = pagination.pageSize;
      this.total = pagination.total;
    },

    // 处理页码变化
    handlePageChange(page, pageSize) {
      this.currentPage = page;
      this.pageSize = pageSize;
    },

    // 处理每页条数变化
    handleSizeChange(current, size) {
      this.pageSize = size;
      this.currentPage = 1; // 重置到第一页
    },

    // 11. 窗口 resize 适配
    handleResize() {
      this.defaultCharts.forEach(chart => chart && chart.resize());
      this.customCharts.forEach(chart => chart && chart.resize());
    },

    // 12. 销毁所有图表实例
    destroyAllCharts() {
      this.defaultCharts.forEach(chart => chart && chart.dispose());
      this.customCharts.forEach(chart => chart && chart.dispose());
      this.defaultCharts = [];
      this.customCharts = [];
    },

    // 13. 清空图表数据
    clearChartData() {
      this.destroyAllCharts();
      this.chartLoadings = {};
      this.chartErrors = {};
      this.chartDataTypes = {};
      this.chartMetricOptions = {};
      this.chartSelectedMetricIndex = {};
      this.chartSelectedUnit = {};
      this.chartOriginalData = {};
    },

    // 14. 清空所有数据
    clearAllData() {
      this.allMetrics = [];
      this.defaultMetrics = [];
      this.customMetrics = [];
      this.selectedMetrics = [];
      this.clearChartData();
    },

    // 15. 打开指标选择弹窗
    openMetricModal() {
      this.metricModalVisible = true;
    },

    // ---------------------- 弹窗相关方法 ----------------------
    // 获取单位选项
    getUnitOptions(item) {
      const unitType = getUnitTypeByUnitValue(item.unit);
      if (unitType && this.unitConversions[unitType]) {
        return this.unitConversions[unitType].units.map(u => ({
          value: u.value,
          label: u.label
        }));
      }
      return [];
    },

    // 处理弹窗中的单位切换
    handleModalUnitChange() {
      this.$nextTick(() => {
        this.renderCharts();
      });
    },

    // 1. 打开图表放大弹窗
    expandChart(item) {
      this.expandedChartItem = { ...item };
      this.currentMetric = item.name;
      this.modalVisible = true;
      
      // 重置type=2相关数据
      this.currentDataType = 2;
      this.metricOptions = [];
      this.selectedMetricIndex = 0;
      this.momMetricOptions = [];
      this.yoyMetricOptions = [];
      this.momMetricData = {};
      this.yoyMetricData = {};
      
      // 设置弹窗单位选择器初始值
      if (this.expandedChartItem.currentUnit) {
        this.modalCurrentUnit = this.expandedChartItem.currentUnit;
      } else {
        // 默认选择后端传入的原始单位
        this.modalCurrentUnit = this.expandedChartItem.unit || '';
      }
      
      // 弹窗内：初始化默认时间范围（近1小时）
      const endModal = new Date();
      const startModal = new Date(endModal.getTime() - 60 * 60 * 1000);
      this.timeRangeModal = [
        formatDate(startModal, 'YYYY-MM-dd HH:mm:ss'),
        formatDate(endModal, 'YYYY-MM-dd HH:mm:ss')
      ];
      this.chartError = null;
      
      // 计算环比同比时间范围
      this.calcCompareRanges();
      
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },

    // 2. 处理Metric选择变化（仅type=2）
    handleMetricChange() {
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },

    // 3. 格式化Metric标签显示
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
      
      return '未命名Metric';
    },

    // 4. 弹窗关闭处理
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
      this.momMetricOptions = [];
      this.yoyMetricOptions = [];
      this.momMetricData = {};
      this.yoyMetricData = {};
    },

    // 5. 计算对比时间范围（修改：使用弹窗时间范围）
    calcCompareRanges() {
      if (!this.timeRangeModal || this.timeRangeModal.length !== 2) return;

      const [startStr, endStr] = this.timeRangeModal;
      const startTime = new Date(startStr);
      const endTime = new Date(endStr);

      // 环比：-1天
      this.momRange = [
        formatDate(new Date(startTime.getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-dd HH:mm:ss'),
        formatDate(new Date(endTime.getTime() - 24 * 60 * 60 * 1000), 'YYYY-MM-dd HH:mm:ss')
      ];

      // 同比：-7天
      this.yoyRange = [
        formatDate(new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-dd HH:mm:ss'),
        formatDate(new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000), 'YYYY-MM-dd HH:mm:ss')
      ];
    },

    // 6. 转换采集间隔为毫秒
    getIntervalMs(intervalStr) {
      if (!intervalStr) return 60 * 1000;
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

    // 7. 调整图表高度（弹窗内图表自适应）
    adjustChartHeights() {
      if (!this.$refs.chartsContainer) return;

      const modalBody = this.$refs.chartsContainer.parentElement;
      const modalBodyHeight = modalBody ? modalBody.clientHeight : 600;

      const filterBar = document.querySelector('.filter-bar');
      const unitSelector = document.querySelector('.modal-unit-selector');
      const filterBarHeight = filterBar ? filterBar.offsetHeight : 0;
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

    // 8. 渲染弹窗内图表
    async renderCharts() {
      this.chartLoading = true;
      this.chartError = null;

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

      if (!this.isTimeRangeValid || !this.expandedChartItem) {
        this.chartLoading = false;
        return;
      }

      const metric = this.expandedChartItem;
      
      try {
        // 获取当前时段数据
        const currentResult = await this.fetchChartData(metric, this.timeRangeModal, true, 0, false);
        if (!currentResult) {
          this.chartLoading = false;
          return;
        }
        
        const { xData: currentXData, seriesData: currentSeriesData, originalValues: currentOriginalValues } = currentResult;

        const renderChart = async (dom, timeRange, color, title, isCurrent = false, isMom = false, isYoy = false) => {
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
            const result = await this.fetchChartData(metric, timeRange, true, 0, true);
            if (!result) {
              chart.hideLoading();
              return null;
            }
            xData = result.xData;
            seriesData = result.seriesData;
            originalValues = result.originalValues;
          }
          
          // 获取单位换算因子
          let unitFactor = 1;
          let displayUnit = metric.unit || '';
          if (this.modalCurrentUnit && this.hasUnitConversion(metric)) {
            const unitType = getUnitTypeByUnitValue(metric.unit);
            if (unitType && this.unitConversions[unitType]) {
              const unitConfig = this.unitConversions[unitType];
              // 查找原始单位配置
              const originalUnitConfig = unitConfig.units.find(u => u.value === metric.unit);
              const originalFactor = originalUnitConfig ? originalUnitConfig.factor : 1;
              
              // 查找目标单位配置
              const targetUnitConfig = unitConfig.units.find(u => u.value === this.modalCurrentUnit);
              if (targetUnitConfig) {
                // 计算换算因子：目标单位 = 原始单位 * (目标因子 / 原始因子)
                unitFactor = targetUnitConfig.factor / originalFactor;
                displayUnit = this.modalCurrentUnit;
              }
            }
          }
          
          // 转换数据值为当前单位
          const convertedSeriesData = seriesData.map(value => value * unitFactor);
          
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
                
                // 如果原始值是字符串，直接显示原始值
                let displayValue = originalValue;
                if (typeof originalValue !== 'string') {
                  displayValue = this.formatSmartValue(value);
                }
                
                const unit = displayUnit ? ` ${displayUnit}` : '';
                return `${params[0].name}<br/>${this.currentMetric}: ${displayValue}${typeof originalValue !== 'string' ? unit : ''}`;
              },
              axisPointer: { type: 'line', z: 10 },
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: '#1890ff',
              borderWidth: 1,
              z: 99999,
              appendToBody: true
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
              name: displayUnit ? `${this.$t('common.unit')}: ${displayUnit}` : '',
              nameLocation: 'end',
              nameGap: 20,
              nameTextStyle: { fontSize: 12 },
              axisLine: { lineStyle: { color: '#000' } },
              splitLine: { lineStyle: { color: '#f5f5f5' } },
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
          await renderChart(this.$refs.currentChartRef, this.timeRangeModal, '#1890ff', this.$t('common.metricMonitor.currentPeriod'), true, false, false) : null;
        
        // 渲染环比图表
        if (this.showMomComparison && this.$refs.momChartRef) {
          this.momChart = await renderChart(
            this.$refs.momChartRef, 
            this.momRange, 
            '#faad14', 
            this.$t('common.metricMonitor.momComparison'),
            false, true, false
          );
        }
        
        // 渲染同比图表
        if (this.showYoyComparison && this.$refs.yoyChartRef) {
          this.yoyChart = await renderChart(
            this.$refs.yoyChartRef, 
            this.yoyRange, 
            '#52c41a', 
            this.$t('common.metricMonitor.yoyComparison'),
            false, false, true
          );
        }

        this.setupChartLinkage();
        
      } catch (error) {
        console.error("弹窗图表渲染失败:", error);
        this.chartError = "图表数据加载失败，请稍后重试";
        this.$message.error(this.$t('monitor.chartLoadFailed'));
      } finally {
        this.chartLoading = false;
      }
    },

    // 9. 判断是否需要更新metricOptions
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

    // 10. 获取metric的唯一标识
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

    // 11. 图表联动核心逻辑（滑动联动）
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

    // 12. 弹窗内时间范围变化处理
    handleTimeChangeModal(values) {
      this.timeRangeModal = values;
      this.calcCompareRanges();
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },

    // 13. 弹窗内对比选项变化处理
    handleComparisonChange() {
      this.calcCompareRanges();
      this.$nextTick(() => {
        this.adjustChartHeights();
        this.$nextTick(() => {
          this.renderCharts();
        });
      });
    },

    // 14. 时间选择器快捷选项设置
    setShortcutTime(picker, timeDiff) {
      const end = new Date();
      const start = new Date(end.getTime() - timeDiff);
      picker.$emit('pick', [start, end]);
    }
  }
});
</script>

<style scoped>
/* ---------------------- 原组件样式 ---------------------- */
.metric-trend-page {
  padding: 0 20px;
  background-color: #fff;
  font-family: "Microsoft YaHei", sans-serif;
}

.time-range-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 8px 0;
}

.time-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.metric-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.chart-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.chart-item {
  flex: 1 1 calc(33.333% - 16px);
  min-width: 260px;
  max-width: 268px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  height: 280px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f5f5f5;
  min-height: 50px;
}

.chart-header-selectors {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-weight: 500;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.selector-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.selector-row .ant-select {
  font-size: 11px;
}

.selector-row .ant-select-sm {
  height: 24px;
  line-height: 22px;
}

.expand-btn {
  color: #999;
  font-size: 12px;
  padding: 2px 4px;
  flex-shrink: 0;
  margin-top: 2px;
}

.expand-btn:hover {
  color: #1890ff;
}

.chart {
  width: 100%;
  height: calc(100% - 50px);
  flex-grow: 1;
  position: relative;
}

.chart-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f50;
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.8);
}

.chart-error a {
  color: #1890ff;
  margin-left: 4px;
  cursor: pointer;
}

.chart-controls {
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-tip {
  font-size: 12px;
  color: #999;
}

.no-custom-metric {
  flex: 1 1 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  border: 1px dashed #f0f0f0;
  border-radius: 4px;
}

.modal-content {
  padding: 8px 0;
}

.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.default-tag {
  margin-left: 8px;
  font-size: 11px;
  color: #1890ff;
}

.custom-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}

.title-marker {
  width: 4px;
  height: 16px;
  background-color: #1890ff;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ---------------------- 弹窗样式 ---------------------- */
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
  font-size: 12px;
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

.chart-inner {
  width: 100%;
  transition: height 0.3s ease;
}

::v-deep .echarts-loading-text {
  color: #1890ff !important;
}

::v-deep .echarts-loading-spinner {
  border-color: rgba(24, 144, 255, 0.2) !important;
  border-top-color: #1890ff !important;
}

.top-tip {
  background-color: #e6f7ff;
  border: 1px solid #bae7ff;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: #606266;
}

.top-tip .el-icon-warning {
  color: #faad14;
  margin-right: 8px;
  font-size: 16px;
}

/* ---------------------- 响应式适配 ---------------------- */
@media (max-width: 1200px) {
  .chart-item {
    flex: 1 1 calc(50% - 16px);
  }
}

@media (max-width: 768px) {
  .chart-item {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .time-range-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .el-date-picker {
    width: 100% !important;
  }

  ::v-deep .fixed-height-modal {
    width: 95% !important;
  }

  ::v-deep .fixed-height-modal .ant-modal-content {
    height: 550px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-inner {
    min-height: 160px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chart-header-selectors {
    margin-bottom: 8px;
  }
  
  .selector-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .selector-row .ant-select {
    width: 100% !important;
    margin-left: 0 !important;
    margin-bottom: 4px;
  }
  
  .expand-btn {
    align-self: flex-end;
  }
}
</style>