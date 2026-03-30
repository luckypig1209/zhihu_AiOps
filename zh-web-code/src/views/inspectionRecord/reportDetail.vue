<template>
  <div class="inspection-report-container">
    <!-- 顶部标题和按钮 -->
    <div class="header">
      <a-button @click="back" class="back-button">{{ $t('common.back') }}</a-button>

      <div class="button-group">
        <a-dropdown :trigger="['click']" class="export-dropdown">
          <a-button class="export-button">
            {{ $t('common.export') }} <a-icon type="down" />
          </a-button>
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="exportToPDF">
              <a-icon type="file-pdf" /> {{ $t('common.exportPDF') }}
            </a-menu-item>
            <a-menu-item key="2" @click="exportToImage">
              <a-icon type="picture" /> {{ $t('common.exportImage') }}
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div ref="contentContainer">
      <div class="title" style="margin: auto;">
        <h1 style="margin-bottom: 20px;color: rgba(24, 144, 255, 0.9);">{{ reportInfo.inspectionRecordName || '' }}</h1>
      </div>
      <!-- 总览部分 -->
      <div class="overview-container">
        <!-- 第一行：巡检项统计 + 异常级别统计 + 资源统计 -->
        <a-row :gutter="24" style="margin-bottom: 16px;">
          <!-- 巡检项统计 -->
          <a-col :span="8">
            <a-card class="card-container" style="height: 220px;">
              <template #title>
                <div class="custom-title">
                  <span class="title-marker"></span>
                  {{ $t('common.inspectionItemStatistics') }}
                </div>
              </template>
              <div class="chart-and-stats">
                <!-- 巡检项环形进度条 -->
                <div class="circle-progress-container">
                  <div class="progress-wrapper">
                    <a-progress type="circle" :percent="inspectionPassRate"
                      :status="getProgressStatus(inspectionPassRate)" :stroke-width="10" :width="140" :format="() => ''"
                      :class="{ 'progress-zero': Number(inspectionPassRate) === 0 }"></a-progress>
                    <!-- 自定义中间文本 -->
                    <div class="progress-inner">
                      <span class="progress-percent">{{ inspectionPassRate }}%</span>
                      <span class="progress-label">{{ $t('common.passRate') }}</span>
                    </div>
                  </div>
                </div>

                <div class="stat-cards">
                  <div class="stat-card">
                    <div>
                      <div class="stat-label">{{ $t('common.normal2') }}</div>
                      <div class="stat-value normal">{{ inspectionStats.normal }}</div>
                    </div>
                    <div>
                      <div class="stat-label">{{ $t('common.exception') }}</div>
                      <div class="stat-value abnormal">{{ inspectionStats.abnormal }}</div>
                    </div>
                    <div>
                      <div class="stat-label">{{ $t('common.unknown') }}</div>
                      <div class="stat-value unknown">{{ inspectionStats.unknown }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 异常级别统计 - 关键修改：添加custom-pie-card类名 -->
          <a-col :span="8">
            <a-card class="card-container custom-pie-card" style="height: 220px;">
              <template #title>
                <div class="custom-title">
                  <span class="title-marker"></span>
                  {{ $t('common.exceptionLevelStatistics') }}
                </div>
              </template>
              <div class="chart-and-stats">
                <!-- 关键修改：添加pie-chart-wrapper容器 -->
                <div class="pie-chart-wrapper">
                  <div ref="severityChart" class="chart-container"></div>
                </div>
                <div class="stat-cards" style="margin-top: -50px;">
                  <div class="stat-card" style="flex-direction: column;">
                    <div style="display: flex;line-height: 32px;">
                      <div class="stat-label">{{ $t('common.high') }}</div>
                      <div class="stat-value critical" style="margin-left: 12px;">{{ severityStats.critical }}</div>
                    </div>

                    <div style="display: flex;line-height: 32px;">
                      <div class="stat-label">{{ $t('common.medium') }}</div>
                      <div class="stat-value major" style="margin-left: 12px;">{{ severityStats.major }}</div>
                    </div>

                    <div style="display: flex;line-height: 32px;">
                      <div class="stat-label">{{ $t('common.low') }}</div>
                      <div class="stat-value minor" style="margin-left: 12px;color: #1890ff;">{{ severityStats.minor }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 资源统计 -->
          <a-col :span="8">
            <a-card class="card-container" style="height: 220px;">
              <template #title>
                <div class="custom-title">
                  <span class="title-marker"></span>
                  {{ $t('common.resourceStatistics') }}
                </div>
              </template>
              <div class="chart-and-stats">
                <!-- 资源环形进度条 -->
                <div class="circle-progress-container">
                  <div class="progress-wrapper">
                    <a-progress type="circle" :percent="resourcePassRate" :status="getProgressStatus(resourcePassRate)"
                      :stroke-width="10" :width="140" :format="() => ''"
                      :class="{ 'progress-zero': Number(resourcePassRate) === 0 }"></a-progress>
                    <!-- 自定义中间文本 -->
                    <div class="progress-inner">
                      <span class="progress-percent">{{ resourcePassRate }}%</span>
                      <span class="progress-label">{{ $t('common.passRate') }}</span>
                    </div>
                  </div>
                </div>

                <div class="stat-cards">
                  <div class="stat-card">
                    <div>
                      <div class="stat-label">{{ $t('common.normal2') }}</div>
                      <div class="stat-value normal">{{ resourceStats.normal }}</div>
                    </div>
                    <div>
                      <div class="stat-label">{{ $t('common.exception') }}</div>
                      <div class="stat-value abnormal">{{ resourceStats.abnormal }}</div>
                    </div>
                    <!-- <div>
                      <div class="stat-label">{{ $t('common.unknown') }}</div>
                      <div class="stat-value unknown">{{ resourceStats.unknown }}</div>
                    </div> -->
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <!-- 第二行：异常指标TOP5 + 资源异常率TOP5 -->
        <a-row :gutter="24">
          <!-- 异常指标TOP5 -->
          <a-col :span="12">
            <a-card class="card-container top5-container">
              <template #title>
                <div class="custom-title">
                  <span class="title-marker"></span>
                  {{ $t('common.exceptionMetricsTop5') }}
                </div>
              </template>
              <div class="top-list-container">
                <div v-for="(item, index) in top5Metrics" :key="index" class="top-item"
                  :class="{ 'top-item-first': index === 0, 'top-item-second': index === 1, 'top-item-third': index === 2, 'top-item-other': index >= 3 }">
                  <div class="top-rank">{{ index + 1 }}</div>
                  <div class="top-info">
                    <div class="top-name">{{ item.name }}</div>
                    <div class="top-bar-container">
                      <div class="top-bar" :style="{ width: `${(item.count / (top5Metrics[0]?.count || 1)) * 100}%` }">
                      </div>
                    </div>
                  </div>
                  <div class="top-count">{{ item.count }}{{ $t('common.times') }}</div>
                </div>
                <!-- 无数据提示 -->
                <div v-if="top5Metrics.length === 0" class="no-data">{{ $t('common.noAbnormal') }}</div>
              </div>
            </a-card>
          </a-col>

          <!-- 资源异常率TOP5 -->
          <a-col :span="12">
            <a-card class="card-container top5-container">
              <template #title>
                <div class="custom-title">
                  <span class="title-marker"></span>
                  {{ $t('common.resourceExceptionRateTop5') }}
                </div>
              </template>
              <div class="top-list-container">
                <div v-for="(item, index) in top5Resources" :key="index" class="top-item"
                  :class="{ 'top-item-first': index === 0, 'top-item-second': index === 1, 'top-item-third': index === 2, 'top-item-other': index >= 3 }">
                  <div class="top-rank">{{ index + 1 }}</div>
                  <div class="top-info">
                    <div class="top-name">{{ item.name }}</div>
                    <div class="top-bar-container">
                      <div class="top-bar" :style="{ width: `${(item.rate / (top5Resources[0]?.rate || 1)) * 100}%` }">
                      </div>
                    </div>
                  </div>
                  <div class="top-count">{{ (item.rate * 100).toFixed(0) }}%</div>
                </div>
                <!-- 无数据提示 -->
                <div v-if="top5Resources.length === 0" class="no-data">{{ $t('common.noAbnormal') }}</div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 异常明细部分 -->
      <div class="dashboard-container" style="margin-top: 16px;">
        <a-card class="card-container table-container">
          <template #title>
            <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.exceptionDetails') }}
              </div>
          </template>
          <a-table 
            :columns="abnormalColumns" 
            :data-source="abnormalData" 
            rowKey="id" 
            :pagination="false"
            class="custom-table"
            :locale="{
              emptyText: $t('common.noAbnormalData')
            }"
          >
            <template slot="name" slot-scope="text,record">
              <a-tooltip placement="top" :title="text">
                <span class="ellipsis-text normal-text"> {{ text }}</span>
              </a-tooltip>
            </template>
            <template slot="severity" slot-scope="text">
              <span :class="getSeverityClass(text)">{{ text }}</span>
            </template>
          </a-table>
        </a-card>
      </div>

    </div>
    <!-- 资源明细部分 - 关键修改区域 -->
    <div class="dashboard-container" style="margin-top: 16px;">
      <a-card class="card-container table-container">
        <template #title>
          <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.inspectionDetails') }}
                <!-- 新增：模型选择下拉框 -->
                <div style="margin-left: 20px; display: inline-block;">
                  <a-select v-model="selectedModelName" style="width: 180px;" @change="handleModelChange"
                    :placeholder="$t('common.selectModel')" :not-found-content="$t('common.noData')">
                <a-select-option v-for="(model, index) in allModelData" :key="index" :value="model.modelName">
                  {{ model.modelName }}
                </a-select-option>
              </a-select>
            </div>
          </div>
        </template>

        <a-table 
          :columns="resourceColumns" 
          :data-source="resourceData" 
          rowKey="assetId" 
          :pagination="false" 
          class="custom-table" 
          @change="handleTableChange"
          :locale="{
            emptyText: $t('common.noResourceData')
          }"
        >
          <template slot="name" slot-scope="text,record">
            <a-tooltip placement="top" :title="text">
              <span class="ellipsis-text link-text" @click="selectShow(record)"> {{ text }}</span>
            </a-tooltip>
          </template>

          <template slot="severity" slot-scope="text">
            <div class="severity-count">
              <span class="critical">{{ text.highErrorCount }}</span>
              <span class="major">{{ text.mediumErrorCount }}</span>
              <span class="warning">{{ text.lowErrorCount }}</span>
            </div>
          </template>

          <template slot="metricNames" slot-scope="text">
            <div class="metric-names-container">
              <span v-for="(metric, idx) in text" :key="idx" class="metric-tag">
                {{ metric }}
              </span>
            </div>
          </template>
        </a-table>
        <!-- 分页 -->
        <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
          :show-total="(total) => $t('common.totalRecords', { total: total })" :page-size-options="['8']" show-size-changer
          @change="handlePageChange" @showSizeChange="onShowSizeChange">
          <template slot="buildOptionText" slot-scope="props">
            <span>{{ props.value }}{{ $t('common.itemsPerPage') }}</span>
          </template>
        </a-pagination>
      </a-card>
    </div>

    <!-- 加载提示 -->
    <a-modal :visible="isExporting" :footer="null" :closable="false" width="300px" centered>
      <div style="text-align: center; padding: 20px;">
        <a-spin size="large" />
        <p style="margin-top: 16px;">{{ exportMessage }}</p>
      </div>
    </a-modal>

    <a-drawer :title="selectName" width="777px" placement="right" :closable="true" :visible="nameVisible"
      :mask-closable="false" @close="onClose">
      <inspectionDetail :selectRow="selectRow" v-if="nameVisible"></inspectionDetail>
    </a-drawer>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Progress, Select } from 'ant-design-vue';
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import inspectionDetail from './inspectionDetail.vue'
import {
  getInspectionAssetStatistics, //巡检项统计 正常、异常、未知
  getInspectionErrorLevel, //异常级别统计
  getInspectionIndicatorGeneral, // 资源统计 资源正常、异常
  getInspectionIndicatorTop, //巡检指标异常率Top5
  getInspectionResourceTop, // 资源异常率Top5
  getLogList, // 异常明细
  getAssetModelList // 按照模块展示各个资源模型的巡检明细
} from "@/api/inspectionRecord";

export default {
  components: {
    'a-progress': Progress,
    'a-select': Select,
    'a-select-option': Select.Option,
    inspectionDetail
  },
  name: 'InspectionReport',
  data() {
    return {
      reportInfo: {
        inspectionRecordId: '',
        inspectionRecordName: ''
      },
      selectName: '',
      nameVisible: false,
      selectRow: {},
      currentPage: 1,
      pageSize: 8,
      total: 0,
      // 排序状态管理
      sortField: '',
      sortOrder: '',
      // 图表实例
      severityChart: null,
      // 导出状态
      isExporting: false,
      exportMessage: '',

      // 总览数据（初始化时设置为空或0）
      inspectionStats: {
        total: 0,
        normal: 0,
        abnormal: 0,
        unknown: 0
      },
      severityStats: {
        critical: 0,
        major: 0,
        minor: 0,
        total: 0
      },
      resourceStats: {
        total: 0,
        normal: 0,
        abnormal: 0,
      },
      // 初始化空数组，从接口获取真实数据
      top5Metrics: [],
      top5Resources: [],

      // 异常明细数据
      abnormalData: [],

      // 关键修改：新增模型相关数据
      allModelData: [], // 存储所有模型数据
      selectedModelName: '', // 当前选中的模型名称

      // 资源明细数据 - 关键修改：更新列定义
      // resourceColumns 移至 computed 属性
      resourceData: [], // 当前页显示的数据
      allResourceData: [], // 存储当前模型的所有资源数据（用于前端分页）
      assetMonitorType: getDictDatas(DICT_TYPE.ASSETMONITORTYPE),
      // otherParams 移至 computed 属性
    };
  },
  computed: {
    // 计算巡检项通过率
    inspectionPassRate() {
      if (this.inspectionStats.total === 0) return '0.0';
      return ((this.inspectionStats.normal / this.inspectionStats.total) * 100).toFixed(1);
    },
    // 计算资源通过率
    resourcePassRate() {
      if (this.resourceStats.total === 0) return '0.0';
      return ((this.resourceStats.normal / this.resourceStats.total) * 100).toFixed(1);
    },
    // 异常明细列定义
    abnormalColumns() {
      return [
        { title: this.$t('common.name'), dataIndex: 'name', key: 'name', width: 120, scopedSlots: { customRender: 'name' } },
        { title: this.$t('common.ipAddress'), dataIndex: 'ip', key: 'ip', width: 120 },
        { title: this.$t('common.resourceModel'), dataIndex: 'resourceModel', key: 'resourceModel', width: 120 },
        { title: this.$t('common.inspectionItem'), dataIndex: 'itemName', key: 'itemName', width: 120 },
        { title: this.$t('common.condition'), dataIndex: 'condition', key: 'condition', width: 100 },
        { title: this.$t('common.suggestedValue'), dataIndex: 'suggested', key: 'suggested', width: 100 },
        { title: this.$t('common.currentValue'), dataIndex: 'current', key: 'current', width: 100 },
        { title: this.$t('common.abnormalLevel'), dataIndex: 'severity', key: 'severity', width: 100, scopedSlots: { customRender: 'severity' } }
      ];
    },
    // 资源明细列定义
    resourceColumns() {
      return [
        { title: this.$t('common.name'), dataIndex: 'assetName', key: 'assetName', width: 120, scopedSlots: { customRender: 'name' } },
        { title: this.$t('common.deviceType'), dataIndex: 'deviceType', key: 'deviceType', width: 120 },
        { title: this.$t('common.ipAddress'), dataIndex: 'ip', key: 'ip', width: 120 },
        { title: this.$t('common.totalInspectionItems'), dataIndex: 'totalMetrics', key: 'totalMetrics', width: 100 },
        { title: this.$t('common.normalItems'), dataIndex: 'normalCount', key: 'normalCount', width: 80 },
        {
          title: this.$t('common.exceptionItems'),
          dataIndex: 'errorCount',
          key: 'errorCount',
          width: 80,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
        },
        {
          title: this.$t('common.unknownItems'),
          dataIndex: 'unknownCount',
          key: 'unknownCount',
          width: 80,
          sorter: true,
          sortDirections: ['ascend', 'descend'],
        },
        { title: this.$t('common.passRate'), dataIndex: 'passRate', key: 'passRate', width: 100 },
        { title: this.$t('common.abnormalLevel'), dataIndex: '', key: 'severity', width: 150, scopedSlots: { customRender: 'severity' } },
      ];
    },
    // 其他参数映射
    otherParams() {
      return {
        1: this.$t('common.equalTo'),
        2: this.$t('common.notEqualTo'),
        3: this.$t('common.greaterThan'),
        4: this.$t('common.greaterThanOrEqualTo'),
        5: this.$t('common.lessThan'),
        6: this.$t('common.lessThanOrEqual')
      };
    }
  },
  methods: {
    onClose() {
      this.nameVisible = false;
    },
    selectShow(row) {
      this.nameVisible = true
      this.selectName = row.assetName
      this.selectRow = row
    },
    // 处理表格排序/筛选变化
    handleTableChange(pagination, filters, sorter) {
      if (sorter.field) {
        this.sortField = sorter.field;
        this.sortOrder = sorter.order;
      }
      this.updateResourceData(); // 前端处理排序，不再调用接口
    },
    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.updateResourceData(); // 前端分页，不再调用接口
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.updateResourceData(); // 前端处理，不再调用接口
    },
    back() {
      this.$router.go(-1);
    },
    // 获取异常级别样式
    getSeverityClass(severity) {
      switch (severity) {
        case this.$t('common.high'):
          return 'severity critical';
        case this.$t('common.medium'):
          return 'severity major';
        case this.$t('common.low'):
          return 'severity warning';
        default:
          return 'severity normal';
      }
    },
    // 根据百分比获取进度条状态
    getProgressStatus(percent) {
      const value = Number(percent);
      if (value < 60) return 'exception';
      if (value < 80) return 'active';
      return 'success';
    },
    // 初始化异常级别统计图表 - 关键修改：优化tooltip配置
    initSeverityChart() {
      const chartDom = this.$refs.severityChart;
      if (!chartDom) return;

      if (this.severityChart) this.severityChart.dispose();
      this.severityChart = echarts.init(chartDom);

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)',
          // 关键修改：添加以下配置
          confine: false, // 不限制在图表容器内
          appendToBody: true, // 添加到body元素下
          padding: [10, 15], // 增加内边距
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // 半透明背景
          borderColor: '#e8f4f8',
          borderWidth: 1,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textStyle: {
            whiteSpace: 'normal' // 允许文本换行
          }
        },
        legend: {
          show: false,
          orient: 'vertical',
          left: 10,
          data: [this.$t('common.high'), this.$t('common.medium'), this.$t('common.low')]
        },
        series: [
          {
            name: this.$t('common.abnormalLevel'),
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              position: 'center',
              formatter: [`${this.severityStats.total}`, this.$t('common.total')].join('\n'),
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.severityStats.critical, name: this.$t('common.high'), itemStyle: { color: '#f53f3f' } },
              { value: this.severityStats.major, name: this.$t('common.medium'), itemStyle: { color: '#ff7d00' } },
              { value: this.severityStats.minor, name: this.$t('common.low'), itemStyle: { color: '#1890ff' } },
            ]
          }
        ]
      };

      this.severityChart.setOption(option);
    },
    // 响应窗口大小变化
    handleResize() {
      if (this.severityChart) this.severityChart.resize();
    },
    // 导出总览为PDF
    async exportToPDF() {
      this.isExporting = true;
      this.exportMessage = this.$t('common.generatingPDF');

      try {
        // 确保图表渲染完成
        await this.$nextTick();

        // 获取要导出的内容容器
        const container = this.$refs.contentContainer;

        // 生成容器的截图
        const canvas = await html2canvas(container, {
          useCORS: true, // 允许跨域图片
          scale: 2, // 提高分辨率
          logging: false,
          backgroundColor: '#ffffff'
        });

        // 获取图片数据
        const imgData = canvas.toDataURL('image/jpeg', 1.0);

        // 创建PDF文档 - 使用横向模式更适合宽内容
        const pdf = new jsPDF('l', 'mm', 'a4'); // 横向A4纸
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // 计算图片尺寸以适应PDF
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // 计算比例，让图片完全适应页面，保留少量边距
        const ratio = Math.min((pdfWidth - 10) / imgWidth, (pdfHeight - 10) / imgHeight);
        const scaledWidth = imgWidth * ratio;
        const scaledHeight = imgHeight * ratio;

        // 居中放置图片
        const x = (pdfWidth - scaledWidth) / 2;
        const y = (pdfHeight - scaledHeight) / 2;

        // 添加图片到PDF
        pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);

        // 保存PDF
        pdf.save(this.$t('common.inspectionOverviewReport') + '.pdf');

        this.$message.success(this.$t('common.pdfExportSuccess'));
      } catch (error) {
        console.error(this.$t('common.pdfExportFailed'), error);
        this.$message.error(this.$t('common.exportFailedPleaseRetry'));
      } finally {
        this.isExporting = false;
      }
    },
    // 导出为图片
    async exportToImage() {
      this.isExporting = true;
      this.exportMessage = this.$t('common.generatingImage');

      try {
        // 确保图表渲染完成
        await this.$nextTick();

        // 获取要导出的内容容器
        const container = this.$refs.contentContainer;

        // 生成容器的截图
        const canvas = await html2canvas(container, {
          useCORS: true, // 允许跨域图片
          scale: 2, // 提高分辨率
          logging: false,
          backgroundColor: '#ffffff'
        });

        // 创建下载链接
        const link = document.createElement('a');
        link.download = this.$t('common.inspectionOverviewReport') + '.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.$message.success(this.$t('common.imageExportSuccess'));
      } catch (error) {
        console.error(this.$t('common.imageExportFailed'), error);
        this.$message.error(this.$t('common.exportFailedPleaseRetry'));
      } finally {
        this.isExporting = false;
      }
    },
    // 获取巡检项统计数据
    async fetchInspectionStats() {
      try {
        const response = await getInspectionAssetStatistics({
          inspectionRecordId: this.reportInfo.inspectionRecordId
        });

        if (response.code === 0 && response.data) {
          const data = response.data;
          // 更新巡检项统计数据
          this.inspectionStats = {
            normal: data.healthyCount || 0,  // 正常资产数量
            abnormal: data.errorCount || 0,   // 异常资产数量
            unknown: data.unknownCount || 0,                      // 接口未返回未知数量，设为0
            total: (data.healthyCount || 0) + (data.errorCount || 0) + (data.unknownCount || 0) // 总数 = 正常 + 异常
          };
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetInspectionStatistics'), error);
        this.$message.error(this.$t('common.failedToGetInspectionStatistics'));
      }
    },
    // 获取异常级别统计数据
    async fetchSeverityStats() {
      try {
        const response = await getInspectionErrorLevel({
          inspectionRecordId: this.reportInfo.inspectionRecordId
        });

        if (response.code === 0 && response.data) {
          const data = response.data;
          // 更新异常级别统计数据
          this.severityStats = {
            critical: data.highCount || 0,    // 高级别数量
            major: data.mediumCount || 0,     // 中级别数量
            minor: data.lowCount || 0,        // 低级别数量
            total: (data.highCount || 0) + (data.mediumCount || 0) + (data.lowCount || 0)  // 总数
          };

          // 更新图表数据
          this.initSeverityChart();
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetSeverityStatistics'), error);
        this.$message.error(this.$t('common.failedToGetSeverityStatistics'));
      }
    },
    // 获取资源统计数据
    async fetchResourceStats() {
      try {
        const response = await getInspectionIndicatorGeneral({
          inspectionRecordId: this.reportInfo.inspectionRecordId
        });

        if (response.code === 0 && response.data) {
          const data = response.data;
          // 更新资源统计数据
          this.resourceStats = {
            normal: data.healthyCount || 0,    // 正常数量
            abnormal: data.errorCount || 0, // 异常数量
            total: data.healthyCount + data.errorCount    // 总数
          };
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetResourceStatistics'), error);
        this.$message.error(this.$t('common.failedToGetResourceStatistics'));
      }
    },
    // 获取异常指标TOP5数据
    async fetchTop5Metrics() {
      try {
        const response = await getInspectionIndicatorTop({
          inspectionRecordId: this.reportInfo.inspectionRecordId
        });

        if (response.code === 0 && response.data) {
          // 转换接口数据格式适配前端展示
          this.top5Metrics = response.data.map(item => ({
            name: item.itemName || this.$t('common.unknown'),
            count: item.exceptionCount || 0,
            itemKey: item.itemKey
          })).slice(0, 5); // 只取前5条
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetAbnormalMetricsTop5'), error);
      }
    },
    // 获取资源异常率TOP5数据
    async fetchTop5Resources() {
      try {
        const response = await getInspectionResourceTop({
          inspectionRecordId: this.reportInfo.inspectionRecordId
        });

        if (response.code === 0 && response.data) {
          // 转换接口数据格式适配前端展示
          this.top5Resources = response.data.map(item => ({
            name: item.resourceName || this.$t('common.unknown'),
            rate: item.exception_rate || 0,
            totalCount: item.total_count || 0,
            errorCount: item.error_count || 0,
            resourceId: item.resourceId
          })).slice(0, 5); // 只取前5条
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetResourceAbnormalityRateTop5'), error);
      }
    },
    // 获取异常明细数据
    async fetchAbnormalData() {
      try {
        const response = await getLogList({
          inspectionRecordId: this.reportInfo.inspectionRecordId,
          status: 0
        });

        if (response.code === 0 && response.data) {
          // 转换接口数据到前端展示格式
          this.abnormalData = response.data.map(item => ({
            id: item.id,
            name: item.assetInfoRespVO?.assetName || '--',
            ip: item.assetInfoRespVO?.assetAttribute?.ip || '--', // 接口无IP字段时用实体名称替代
            resourceModel: item.assetInfoRespVO?.modelName || '--',
            itemName: item.itemName || '--',
            condition: this.otherParams[item.otherParam] || '--', // 生成判断条件文本
            suggested: item.originalParam || '-', // 建议值（原始阈值）
            current: item.compareValue || '-', // 当前值（实际检测值）
            severity: this.mapGradeToSeverity(item.grade) // 转换风险等级
          }));
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetAbnormalDetailsPleaseRetry'), error);
        this.$message.error(this.$t('common.failedToGetAbnormalDetailsPleaseRetry'));
      }
    },
    // 关键修改：获取所有资源模型巡检数据
    async fetchResourceData() {
      try {
        const params = {
          inspectionRecordId: this.reportInfo.inspectionRecordId
        };

        const response = await getAssetModelList(params);

        if (response.code === 0 && response.data) {
          // 存储所有模型数据
          this.allModelData = response.data || [];

          // 默认选中第一个模型
          if (this.allModelData.length > 0) {
            this.selectedModelName = this.allModelData[0].modelName;
            // 加载第一个模型的数据
            this.loadModelData(this.allModelData[0]);
          }
        }
      } catch (error) {
        console.error(this.$t('common.failedToGetResourceModelOverviewPleaseRetry'), error);
        this.$message.error(this.$t('common.failedToGetResourceModelOverviewPleaseRetry'));
      }
    },
    // 关键修改：加载选中模型的数据
    loadModelData(selectedModel) {
      // 获取选中模型的所有资源数据
      const modelData = selectedModel.data || [];

      // 转换数据格式
      this.allResourceData = modelData.map(item => ({
        inspectionRecordId: this.reportInfo.inspectionRecordId,
        assetId: item.assetId,
        assetName: item.assetName || '--',
        assetType: item.assetType || '--',
        deviceType: item.deviceType || '--',
        ip: item.assetInfo?.assetAttribute?.ip || '--',
        totalMetrics: item.totalMetrics || 0,
        normalCount: item.normalCount || 0,
        errorCount: item.errorCount || 0,
        unknownCount: item.unknownCount || 0,
        passRate: item.passRate || '0.00%',
        highErrorCount: item.highErrorCount || 0,
        mediumErrorCount: item.mediumErrorCount || 0,
        lowErrorCount: item.lowErrorCount || 0,
        metricNames: item.metricNames || [],
        assetInfo: item.assetInfo,
        originalData: item
      }));

      // 更新总数
      this.total = this.allResourceData.length;

      // 重置分页
      this.currentPage = 1;

      // 初始化分页数据
      this.updateResourceData();
    },
    // 关键修改：处理模型切换
    handleModelChange(modelName) {
      this.selectedModelName = modelName;
      // 找到选中的模型数据
      const selectedModel = this.allModelData.find(model => model.modelName === modelName);
      if (selectedModel) {
        this.loadModelData(selectedModel);
      }
    },
    // 更新当前页的资源数据（前端分页和排序）
    updateResourceData() {
      let displayData = [...this.allResourceData];

      // 处理排序
      if (this.sortField && this.sortOrder) {
        displayData.sort((a, b) => {
          const isAsc = this.sortOrder === 'ascend';
          // 处理数字类型排序
          if (typeof a[this.sortField] === 'number' && typeof b[this.sortField] === 'number') {
            return isAsc ? a[this.sortField] - b[this.sortField] : b[this.sortField] - a[this.sortField];
          }
          // 处理字符串类型排序（如通过率）
          return isAsc
            ? String(a[this.sortField]).localeCompare(String(b[this.sortField]))
            : String(b[this.sortField]).localeCompare(String(a[this.sortField]));
        });
      }

      // 处理分页
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.resourceData = displayData.slice(start, end);
    },
    // 映射接口风险等级到前端显示文本
    mapGradeToSeverity(grade) {
      switch (grade) {
        case 'high':
          return this.$t('common.high');
        case 'medium':
          return this.$t('common.medium');
        case 'low':
          return this.$t('common.low');
        default:
          return this.$t('common.unknown');
      }
    },
    // 生成判断条件文本
    getConditionText(item) {
      console.log("Cf----" + JSON.stringify(this.assetMonitorType))
      this.assetMonitorType.forEach(el => {
        if (el.value == item.otherParam) {
          return el.label;
        }
      });
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.id && this.$route.query.name) {
      this.reportInfo.inspectionRecordName = this.$route.query.name
      this.reportInfo.inspectionRecordId = this.$route.query.id;

      // 获取所有统计数据
      this.fetchInspectionStats();
      this.fetchSeverityStats();
      this.fetchResourceStats();
      this.fetchTop5Metrics();
      this.fetchTop5Resources();
      // 获取异常明细数据
      this.fetchAbnormalData();
      // 获取资源模型巡检总览数据
      this.fetchResourceData();
    }

    // 初始化图表
    this.initSeverityChart();

    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 销毁图表实例
    if (this.severityChart) this.severityChart.dispose();

    // 移除事件监听
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
/* 原有样式保持不变 */
.inspection-report-container {
  padding: 16px;
  background-color: #f5f7fa;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  min-width: 1200px;
}

/* 顶部标题和按钮 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}

.title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: center;
}

.title p {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 12px;
}

.export-button {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.export-button:hover {
  background-color: #096dd9;
  border-color: #096dd9;
}

.back-button {
  background-color: #fff;
  border-color: #d9d9d9;
  color: #333;
}

.back-button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.export-dropdown {
  margin-left: 8px;
}

/* 仪表盘容器 */
.dashboard-container {
  margin-bottom: 0;
}

/* 总览容器 */
.overview-container {
  margin-bottom: 16px;
}

/* 卡片样式 */
.card-container {
  height: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.top5-container {
  height: 350px;
}

.table-container {
  height: auto;
}

.card-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 卡片标题样式 */
.card-container>>>.ant-card-head {
  min-height: 40px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.card-container>>>.ant-card-head-title {
  padding: 8px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* 卡片内容样式 - 关键修改：默认样式保持不变 */
.card-container>>>.ant-card-body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  background-color: #fff;
  box-sizing: border-box;
}

/* 关键修改：异常级别统计卡片的特殊样式 */
.custom-pie-card>>>.ant-card-body {
  overflow: visible !important;
  /* 取消溢出隐藏 */
  position: relative;
}

/* 关键修改：饼图容器包装器 */
.pie-chart-wrapper {
  width: 50%;
  height: 100%;
  min-height: 220px;
  box-sizing: border-box;
  margin-top: -50px;
  position: relative;
  z-index: 1;
  /* 确保图表在卡片内容之上 */
}

/* 自定义标题样式 */
.custom-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
}

.title-marker {
  width: 4px;
  height: 16px;
  background-color: rgba(24, 144, 255, 0.9);
  border-radius: 2px;
  flex-shrink: 0;
}

/* 图表和统计卡片容器 */
.chart-and-stats {
  display: flex;
  height: 100%;
  padding: 8px 0;
  box-sizing: border-box;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 100%;
}

/* 环形进度条容器 */
.circle-progress-container {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

/* 进度条包装器 - 用于定位中间文本 */
.progress-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
}

/* 自定义进度条中间文本 */
.progress-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.progress-percent {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.progress-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.progress-total {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

/* 统计卡片容器 */
.stat-cards {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 12px;
  box-sizing: border-box;
}

/* 统计卡片样式 */
.stat-card {
  background-color: #fff;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.stat-value.normal {
  color: #52c41a;
}

.stat-value.abnormal {
  color: #f53f3f;
}

.stat-value.unknown {
  color: #faad14;
}

.stat-value.critical {
  color: #f53f3f;
}

.stat-value.major {
  color: #ff7d00;
}

.stat-value.minor {
  color: #faad14;
}

/* TOP5列表样式 */
.top-list-container {
  padding: 12px;
  height: 100%;
  overflow: hidden;
}

.top-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: #f9fafc;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.top-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #f0f7ff;
}

/* TOP5排名边框颜色 */
.top-item-first {
  border-left: 4px solid rgba(245, 63, 63, 0.7);
}

.top-item-second {
  border-left: 4px solid rgba(255, 125, 0, 0.7);
}

.top-item-third {
  border-left: 4px solid rgba(255, 170, 0, 0.7);
}

.top-item-other {
  border-left: 4px solid rgba(83, 159, 245, 0.7);
}

.top-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

/* TOP5排名背景色 */
.top-item-first .top-rank {
  background-color: rgba(245, 63, 63, 0.7);
}

.top-item-second .top-rank {
  background-color: rgba(255, 125, 0, 0.7);
}

.top-item-third .top-rank {
  background-color: rgba(255, 170, 0, 0.7);
}

.top-item-other .top-rank {
  background-color: rgba(83, 159, 245, 0.7);
}

.top-info {
  flex: 1;
  overflow: hidden;
}

.top-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-bar-container {
  height: 8px;
  background-color: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.top-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

/* TOP5进度条颜色 */
.top-item-first .top-bar {
  background-color: rgba(245, 63, 63, 0.6);
}

.top-item-second .top-bar {
  background-color: rgba(255, 125, 0, 0.6);
}

.top-item-third .top-bar {
  background-color: rgba(255, 170, 0, 0.6);
}

.top-item-other .top-bar {
  background-color: rgba(83, 159, 245, 0.6);
}

.top-count {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-left: 12px;
  flex-shrink: 0;
}

/* 无数据提示样式 */
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

/* ========== 表格样式优化 ========== */
.custom-table {
  margin-bottom: 16px;
}

/* 表格整体样式优化 */
.custom-table>>>.ant-table {
  --ant-table-header-text-align: left;
  --ant-table-cell-text-align: left;
}

/* 表头单元格样式 - 左对齐，统一内边距 */
.custom-table>>>.ant-table-thead>tr>th {
  background-color: #f9fafc;
  font-weight: 600;
  color: #333;
  text-align: left !important;
  /* 强制左对齐 */
  padding: 12px 16px !important;
  /* 统一内边距 */
  vertical-align: middle !important;
  /* 垂直居中 */
  border-bottom: 1px solid #f0f0f0;
}

/* 表体单元格样式 - 左对齐，统一内边距 */
.custom-table>>>.ant-table-tbody>tr>td {
  text-align: left !important;
  /* 强制左对齐 */
  padding: 12px 16px !important;
  /* 统一内边距，与表头保持一致 */
  vertical-align: middle !important;
  /* 垂直居中 */
  border-bottom: 1px solid #f0f0f0;
}

/* 悬停效果优化 */
.custom-table>>>.ant-table-tbody>tr:hover>td {
  background-color: #f0f7ff;
}

/* 解决表格列宽不一致问题 */
.custom-table>>>.ant-table-column-has-fix-left,
.custom-table>>>.ant-table-column-has-fix-right {
  text-align: left !important;
}

/* 异常级别单元格样式适配 */
.custom-table>>>.severity {
  display: inline-block;
  /* 确保样式正常显示 */
  vertical-align: middle;
}

/* 异常级别计数单元格样式适配 */
.custom-table>>>.severity-count {
  align-items: center;
  justify-content: flex-start;
  /* 左对齐显示 */
}

/* 巡检项名称标签容器适配 */
.custom-table>>>.metric-names-container {
  justify-content: flex-start;
  /* 左对齐显示 */
}

/* 无数据提示样式优化 */
.custom-table>>>.ant-table-placeholder {
  text-align: center;
}

/* 样式类 */
.severity {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.severity.critical {
  background-color: rgba(245, 63, 63, 0.1);
  color: rgba(245, 63, 63, 0.9);
}

.severity.major {
  background-color: rgba(255, 125, 0, 0.1);
  color: rgba(255, 125, 0, 0.9);
}

.severity.minor {
  background-color: rgba(255, 170, 0, 0.1);
  color: rgba(255, 170, 0, 0.9);
}

.severity.warning {
  background-color: rgba(24, 144, 255, 0.1);
  color: rgba(24, 144, 255, 0.9);
}

.severity.normal {
  background-color: rgba(0, 180, 42, 0.1);
  color: rgba(0, 180, 42, 0.9);
}

.severity-count {
  display: flex;
  gap: 4px;
}

.severity-count span {
  display: inline-block;
  width: 24px;
  height: 24px;
  /* border-radius: 50%; */
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  line-height: 24px;
}

.severity-count .critical {
  background-color: rgba(245, 63, 63, 0.8);
}

.severity-count .major {
  background-color: rgba(255, 125, 0, 0.8);
}

.severity-count .minor {
  background-color: rgba(255, 170, 0, 0.8);
}

.severity-count .warning {
  background-color: rgba(24, 144, 255, 0.8);
}

/* 导出下拉菜单样式 */
.export-dropdown>>>.ant-dropdown-menu {
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.export-dropdown>>>.ant-dropdown-menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-dropdown>>>.ant-dropdown-menu-item:hover {
  background-color: #f0f7ff;
}

::v-deep .ant-table-thead>tr>th {
  background: #e6f0fb !important;
}

.pagination {
  text-align: right;
}

/* 进度条为0%时的灰化样式 */
::v-deep .progress-zero .ant-progress-circle-path {
  stroke: #e8e8e8 !important;
  stroke-dasharray: 0 !important;
}

::v-deep .progress-zero .ant-progress-circle-trail {
  stroke: #f5f5f5 !important;
}

/* 0%时中间文字也置灰 */
.progress-zero .progress-percent,
.progress-zero .progress-label {
  color: #cccccc !important;
}

/* 关键修改：确保tooltip不会被其他元素遮挡 */
::v-deep .echarts-tooltip {
  z-index: 9999 !important;
  pointer-events: none;
  /* 避免影响其他元素交互 */
}

/* 新增：巡检项名称标签样式 */
.metric-names-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.metric-tag {
  background-color: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

/* 调整select组件样式 */
::v-deep .ant-select {
  margin-left: 16px;
}

/* 核心：统一文本和省略号颜色的样式 */
::v-deep .ant-table-tbody>tr>td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip; /* 改为clip，由子元素控制省略号 */
  max-width: 200px;
  box-sizing: border-box;
}

.ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  padding-right: 4px; /* 避免省略号被截断 */
}

/* 普通文本样式（异常明细名称） */
.normal-text {
  color: #333;
}

/* 链接文本样式（巡检明细名称） */
.link-text {
  color: #1890ff;
  cursor: pointer;
  transition: color 0.2s;
}

.link-text:hover {
  color: #096dd9; /* hover时颜色变化，省略号也会同步 */
}
</style>