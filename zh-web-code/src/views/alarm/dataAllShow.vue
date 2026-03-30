<template>
  <div class="dashboard-container">
    <!-- 第一行：告警级别分布 + 告警恢复率 + 未恢复告警分布 -->
    <a-row :gutter="24" style="margin-bottom: 16px;">
      <a-col :span="8">
        <a-card class="card-container">
          <template #title>
            <div class="custom-title">
              <span class="title-marker"></span>
              {{ $t('common.alarmLevelDistribution') }}
            </div>
        </template>
          <div ref="alertLevelChart" class="chart-container"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="card-container">
          <template #title>
            <div class="custom-title">
              <span class="title-marker"></span>
              {{ $t('common.alarmRecoveryRate') }}
            </div>
        </template>
          <div ref="alertRecoveryChart" class="chart-container"></div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="card-container">
          <template #title>
            <div class="custom-title">
              <span class="title-marker"></span>
              {{ $t('common.unrecoveredAlarmDistribution') }}
            </div>
        </template>
          <div ref="unrecoveredAlertChart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 第二行：告警统计 + 告警趋势统计 -->
    <a-row :gutter="24" style="margin-bottom: 16px;">
      <a-col :span="8">
        <a-card class="card-container">
          <template #title>
            <div style="display: flex;">
              <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.alarmStatistics') }}
              </div>
              <div style="display: flex;margin-left: auto;width: 30%;">
                <el-select size="mini" v-model="form4.alarmSTime" :placeholder="$t('common.pleaseSelectAlarmRange')" style="width: 100%;" @change="fetchAlertStatData">
                  <el-option
                    v-for="item in timeList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </div>
        </template>
          <div ref="alertStatChart" class="chart-container"></div>
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card class="card-container">
          <template #title>
            <div style="display: flex;">
              <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.alarmTrendStatistics') }}
              </div>
              <div style="display: flex;margin-left: auto;width: 40%;">
                <el-select size="mini" v-model="form.alarmStatus" multiple clearable :placeholder="$t('common.pleaseSelectAlarmLevel')"
                  :collapse-tags="true"
                  style="width: 60%;"
                  @change="fetchAlertTrendData">
                  <el-option
                    v-for="item in severityMap"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select size="mini" v-model="form.alarmSTime" :placeholder="$t('common.pleaseSelectAlarmRange')" style="width: 35%;margin-left: 3%;"
                  @change="fetchAlertTrendData">
                  <el-option
                    v-for="item in timeList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </div>
        </template>
          <!-- 关键修改：为告警趋势统计图表容器添加专属类名 -->
          <div ref="alertTrendChart" class="chart-container alert-trend-chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 第三行：TOP5 资源模型 + TOP5 资源名称 + TOP5 告警名称 -->
    <a-row :gutter="24">
      <a-col :span="8">
        <a-card class="card-container" style="height: 55vh;">
          <template #title>
            <div style="display: flex;">
              <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.top5ResourceModels') }}
              </div>
              <div style="display: flex;margin-left: auto;width: 65%;">
                <el-select size="mini" v-model="form1.alarmStatus" multiple clearable :placeholder="$t('common.pleaseSelectAlarmLevel')"
                  :collapse-tags="true"
                  style="width: 60%;"
                  @change="fetchTopResourceModels">
                  <el-option
                    v-for="item in severityMap"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select size="mini" v-model="form1.alarmSTime" :placeholder="$t('common.pleaseSelectAlarmRange')" style="width: 35%;margin-left: 3%;"
                  @change="fetchTopResourceModels">
                  <el-option
                    v-for="item in timeList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </div>
        </template>
          <div class="top-list-container" v-if="topResourceModels.length > 0">
            <div
              v-for="(item, index) in topResourceModels"
              :key="index"
              class="top-item"
              :class="{ 'top-item-first': index === 0, 'top-item-second': index === 1, 'top-item-third': index === 2, 'top-item-other': index === 3 || index === 4 }"
            >
              <div class="top-rank">{{ index + 1 }}</div>
              <div class="top-info">
                <div class="top-name">{{ item.name }}</div>
                <div class="top-bar-container">
                  <div class="top-bar" :style="{ width: `${(item.count / topResourceModels[0].count) * 100}%` }"></div>
                </div>
              </div>
              <div class="top-count">{{ item.count }}{{ $t('common.times') }}</div>
            </div>
          </div>
           <div v-else  class="top-list-container">
            <div style="margin: auto;">
              <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
              <div class="no-text">{{ $t('common.noData') }}</div>
            </div>
       </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="card-container" style="height: 55vh;">
          <template #title>
            <div style="display: flex;">
              <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.top5ResourceNames') }}
              </div>
              <div style="display: flex;margin-left: auto;width: 70%;">
                <el-select size="mini" v-model="form2.alarmStatus" multiple clearable :placeholder="$t('common.pleaseSelectAlarmLevel')"
                  :collapse-tags="true"
                  style="width: 50%;"
                  @change="fetchTopResourceNames">
                  <el-option
                    v-for="item in severityMap"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select size="mini" v-model="form2.assetModelIds"   :collapse-tags="true" multiple clearable :placeholder="$t('common.pleaseSelectModel')" style="width: 55%;margin-left: 3%;"

                @change="fetchTopResourceNames">
                  <el-option
                    v-for="item in modelList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </div>
        </template>
          <div class="top-list-container" v-if="topResourceNames.length > 0">
            <div
              v-for="(item, index) in topResourceNames"
              :key="index"
              class="top-item"
              :class="{ 'top-item-first': index === 0, 'top-item-second': index === 1, 'top-item-third': index === 2, 'top-item-other': index === 3 || index === 4 }"
            >
              <div class="top-rank">{{ index + 1 }}</div>
              <div class="top-info">
                <div class="top-name">{{ item.name }}</div>
                <div class="top-bar-container">
                  <div class="top-bar" :style="{ width: `${(item.count / topResourceNames[0].count) * 100}%` }"></div>
                </div>
              </div>
              <div class="top-count">{{ item.count }}{{ $t('common.times') }}</div>
            </div>
          </div>
           <div v-else  class="top-list-container">
            <div style="margin: auto;">
              <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
              <div class="no-text">{{ $t('common.noData') }}</div>
            </div>
       </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="card-container" style="height: 55vh;">
          <template #title>
            <div style="display: flex;">
              <div class="custom-title">
                <span class="title-marker"></span>
                {{ $t('common.top5AlarmNames') }}
              </div>
              <div style="display: flex;margin-left: auto;width: 70%;">
                <el-select size="mini" v-model="form3.alarmStatus" multiple clearable :placeholder="$t('common.pleaseSelectAlarmLevel')"
                  :collapse-tags="true"
                  style="width: 50%;"
                  @change="fetchTopAlertTitles">
                  <el-option
                    v-for="item in severityMap"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select size="mini" v-model="form3.assetModelIds"   :collapse-tags="true" multiple clearable :placeholder="$t('common.pleaseSelectModel')" style="width: 55%;margin-left: 3%;"
                  @change="fetchTopAlertTitles">
                  <el-option
                    v-for="item in modelList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </div>
            </div>
        </template>
          <div class="top-list-container" v-if="topAlertNames.length > 0">
            <div
              v-for="(item, index) in topAlertNames"
              :key="index"
              class="top-item"
              :class="{ 'top-item-first': index === 0, 'top-item-second': index === 1, 'top-item-third': index === 2, 'top-item-other': index === 3 || index === 4 }"
            >
              <div class="top-rank">{{ index + 1 }}</div>
              <div class="top-info">
                <div class="top-name">{{ item.name }}</div>
                <div class="top-bar-container">
                  <div class="top-bar" :style="{ width: `${(item.count / topAlertNames[0].count) * 100}%` }"></div>
                </div>
              </div>
              <div class="top-count">{{ item.count }}{{ $t('common.times') }}</div>
            </div>
          </div>
           <div v-else  class="top-list-container">
            <div style="margin: auto;">
              <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
              <div class="no-text">{{ $t('common.noData') }}</div>
            </div>
       </div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import {
  getPriority,    // 告警级别分布API
  getResolved,    // 告警恢复率API
  getDistribution, // 未恢复告警分布API
  getDaily,        // 告警统计（日统计）API
  getTrend,         // 告警趋势统计API
  getTop, // 告警统计TOP总览接口
} from '@/api/monitor/alarm'
import {
  getAssetModelPage,
} from "@/api/resource";
export default {
  data() {
    return {
      form: { alarmStatus: [], alarmSTime: '7' }, // 趋势统计：默认5天，默认选中所有级别
      form1: { alarmStatus: [], alarmSTime: '7' }, // TOP5-资源模型：默认5天，默认所有级别
      form2: { alarmStatus: [], assetModelIds: [] }, // TOP5-资源名称：默认5天，默认所有级别
      form3: { alarmStatus: [], assetModelIds: [] }, // TOP5-告警名称：默认5天，默认所有级别
      form4: { alarmSTime: '7' }, // 告警统计时间范围默认7天
      timeList: [
        { label: this.$t('common.7days'), value: '7' },
        { label: this.$t('common.15days'), value: '15' },
        { label: this.$t('common.30days'), value: '30' },

      ],
      modelList:[],
      // TOP5 数据（初始Mock，API请求后替换）
      topResourceModels: [
        { name: '物理机', count: 15 },
        { name: '网络设备', count: 11 },
        { name: '虚拟化', count: 6 },
        { name: '应用', count: 2 },
        { name: '站点', count: 2 },
      ],
      topResourceNames: [
        { name: '戴尔服务器211', count: 11 },
        { name: '办公汇聚交换机', count: 7 },
        { name: 'Vmware ESXi-205', count: 4 },
        { name: '戴尔服务器213', count: 4 },
        { name: '网页负载均衡', count: 2 },
      ],
      topAlertNames: [
        { name: 'ICMP Ping 不通', count: 7 },
        { name: '网口 Gi1/0/9: copper: 状态异常', count: 4 },
        { name: '网口 Gi1/0/2: copper: 状态异常', count: 3 },
        { name: '网口 GigabitEthernet1/0/13: 状态异常', count: 2 },
        { name: '网口 GigabitEthernet1/0/5: 状态异常', count: 1 },
      ],
      // 图表实例
      alertLevelChart: null,
      alertRecoveryChart: null,
      unrecoveredAlertChart: null,
      alertStatChart: null,
      alertTrendChart: null,
      // 告警级别分布数据（API存储）
      alertLevelData: [],
      // 告警级别分布总数（新增：用于环形图中心展示）
      alertLevelTotal: 0,
      // 告警恢复率数据（API存储）
      resolvedData: {
        resolvedRate: '0%',
        resolvedAlarmCount: 0,
        firingAlarmCount: 0,
        totalAlarmCount: 0
      },
      // 未恢复告警分布数据（API存储）
      unrecoveredData: {
        xAxisData: [],    // 资源模型名称列表（x轴）
        seriesData: []    // 各告警级别的数据列表
      },
      // 告警统计（日统计）数据（API存储）
      alertStatData: {
        xAxisData: [],    // 日期列表（x轴）
        seriesData: []    // 各告警级别的数据列表
      },
      // 告警趋势统计数据（API存储）
      alertTrendData: {
        xAxisData: [],    // 日期列表（x轴）
        seriesData: []    // 各资源模型的趋势数据列表
      },
      // 告警级别颜色映射（适配API返回的“XX告警”格式，兼容原key）
      levelColorMap: {
        '紧急': 'rgba(245, 63, 63, 0.6)',
        '紧急告警': 'rgba(245, 63, 63, 0.6)',
        '严重': 'rgba(255, 125, 0, 0.6)',
        '重要告警': 'rgba(255, 125, 0, 0.6)',
        '普通': 'rgba(0, 180, 42, 0.6)',
        '一般告警': 'rgba(0, 180, 42, 0.6)',
        '预警': 'rgba(24, 144, 255, 0.6)',
        '提示警告': 'rgba(24, 144, 255, 0.6)',
        '次要告警': 'rgba(153, 102, 255, 0.6)',
        '未分类': 'rgba(169, 169, 169, 0.6)',
        'Urgent': 'rgba(245, 63, 63, 0.6)',
        'Critical': 'rgba(255, 125, 0, 0.6)',
        'Normal': 'rgba(0, 180, 42, 0.6)',
        'Warning': 'rgba(24, 144, 255, 0.6)',
        'Minor': 'rgba(153, 102, 255, 0.6)'
      },
      // 资源模型颜色映射（与原Mock颜色保持一致）
      modelColorMap: {
        '网络设备': 'rgba(24, 144, 255, 0.4)',
        '终端设备': 'rgba(245, 63, 63, 0.4)',
        '物理机': 'rgba(255, 125, 0, 0.4)',
        '存储': 'rgba(0, 180, 42, 0.4)',
        '虚拟化': 'rgba(255, 170, 0, 0.4)',
        '安全设备': 'rgba(153, 102, 255, 0.4)',
        '操作系统': 'rgba(102, 204, 204, 0.4)',
        '中间件': 'rgba(204, 102, 204, 0.4)',
        '数据库': 'rgba(204, 204, 102, 0.4)',
        '未知模型': 'rgba(169, 169, 169, 0.4)'
      },
      // 告警级别值->名称映射（用于匹配API返回的alarmLevelName）
      levelValueToName: {
        '1': '预警',
        '2': '普通',
        '3': '严重',
        '4': '紧急'
      },
      // 告警恢复率颜色映射（与整体风格统一）
      resolvedColorMap: {
        resolved: 'rgba(0, 180, 42, 0.5)', // 已恢复-绿色
        firing: 'rgba(245, 63, 63, 0.5)'   // 未恢复-红色
      }
    };
  },
  computed: {
    // 告警级别下拉选项（国际化）
    severityMap() {
      return [
        { label: this.$t('common.warning'), value: '1' },
        { label: this.$t('common.normal'), value: '2' },
        { label: this.$t('common.critical'), value: '3' },
        { label: this.$t('common.urgent'), value: '4' },
      ];
    },
    // 告警级别值->名称映射（用于匹配API返回的alarmLevelName）
    levelValueToName() {
      return {
        '1': this.$t('common.warning'),
        '2': this.$t('common.normal'),
        '3': this.$t('common.critical'),
        '4': this.$t('common.urgent')
      };
    }
  },
  methods: {
    // -------------------------- 告警级别分布相关（核心优化部分） --------------------------
    async fetchAlertLevelData() {
      try {
        const res = await getPriority({});
        if (res.code === 0 && Array.isArray(res.data?.priorityCounts)) {
          // 1. 处理原始数据，每个类型追加数字
          const processedData = res.data.priorityCounts
            .filter(item => item.alarmCount > 0)
            .map(item => ({
              name: `${item.alarmLevelName}`, // 名称保留原格式，后续通过label展示数字
              value: item.alarmCount,
              itemStyle: {
                color: this.levelColorMap[item.alarmLevelName] || 'rgba(169, 169, 169, 0.6)'
              }
            }));
          // 2. 计算告警总数
          this.alertLevelTotal = processedData.reduce((total, item) => total + item.value, 0);
          this.alertLevelData = processedData;
          this.initAlertLevelChart();
        } else {
          console.error('告警级别数据格式异常', res);
          this.useDefaultAlertLevelData();
        }
      } catch (error) {
        console.error('告警级别API请求失败', error);
        this.useDefaultAlertLevelData();
      }
    },
    useDefaultAlertLevelData() {
      // 1. 默认数据每个类型保留原名称（后续通过label展示数字）
      const defaultData = [
        { name: '紧急', value: 2, itemStyle: { color: 'rgba(245, 63, 63, 0.6)' } },
        { name: '严重', value: 31, itemStyle: { color: 'rgba(255, 125, 0, 0.6)' } },
        { name: '普通', value: 2, itemStyle: { color: 'rgba(0, 180, 42, 0.6)' } },
        { name: '次要告警', value: 17, itemStyle: { color: 'rgba(153, 102, 255, 0.6)' } },
        { name: '未分类', value: 2, itemStyle: { color: 'rgba(169, 169, 169, 0.6)' } }
      ];
      // 2. 计算默认数据总数
      this.alertLevelTotal = defaultData.reduce((total, item) => total + item.value, 0);
      this.alertLevelData = defaultData;
      this.initAlertLevelChart();
    },
    initAlertLevelChart() {
      const chartDom = this.$refs.alertLevelChart;
      if (!chartDom) return;
      if (this.alertLevelChart) this.alertLevelChart.dispose();
      this.alertLevelChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
          if(params.name==''){
            return ''
          }
          // 当数据为空时不显示tooltip
          if (!this.alertLevelData || this.alertLevelData.length === 0) {
            return '';
          }
          // 数据存在时使用原格式
          return `${params.name}: ${params.value} (${params.percent}%)`;
        }.bind(this)
        },
        series: [
          // 主环形图：每个类型后显示数字（通过label.formatter实现）
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: this.alertLevelData,
            // 核心优化1：每个类型后加数字（格式：名称 + 数量）
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}', // 关键配置：名称后追加数字
              fontSize: 12,
              color: '#333'
            },
            labelLine: { show: true, length: 8, length2: 12 },
            itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
          },
          // 中心文本：显示总数（通过空数据系列的label实现）
          {
            type: 'pie',
            radius: ['0%', '30%'], // 内圈半径，小于主环形图内半径
            center: ['50%', '50%'],
            data: [{ value: 1, name: '' }], // 空数据占位
            itemStyle: { color: 'transparent' }, // 透明背景，不影响主图表
            // 核心优化2：环形图中间展示两行文本（数字在上，总数在下）
            label: {
              show: true,
              position: 'center',
              // 关键修改：使用换行符实现两行显示，调整字体大小和粗细
              formatter: `${this.alertLevelTotal}\n${this.$t('common.total')}`,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#666',
              // 调整文本行高，让两行更美观
              lineHeight: 20
            },
            labelLine: { show: false }
          }
        ],
        legend: {
            // orient: 'horizontal',  // 水平排列
            // left: 'center',        // 水平居中
            // top: '1%',            // 放置在顶部
            orient: 'vertical', bottom: 'center', left: 'left',
            data: this.alertLevelData.map(item => item.name),
            textStyle: { fontSize: 12 },
            // itemGap: 25  // 增加图例项之间的间距
          },

        grid: { top: '10%', bottom: '20%' }
      };
      this.alertLevelChart.setOption(option);
    },

    // -------------------------- 告警恢复率相关 --------------------------
    async fetchResolvedData() {
      try {
        const res = await getResolved({});
        if (res.code === 0 && res.data) {
          this.resolvedData = {
            totalAlarmCount: res.data.totalAlarmCount || 0,
            firingAlarmCount: res.data.firingAlarmCount || 0,
            resolvedAlarmCount: res.data.resolvedAlarmCount || 0,
            resolvedRate: res.data.resolvedRate || '0%'
          };
          this.initAlertRecoveryChart();
        } else {
          console.error('告警恢复率数据格式异常', res);
          this.useDefaultResolvedData();
        }
      } catch (error) {
        console.error('告警恢复率API请求失败', error);
        this.useDefaultResolvedData();
      }
    },
    getModelList(){
      getAssetModelPage({pageNo:1,pageSize:100}).then((res) => {
              this.modelList = res.data.list.map(item =>{
                return {
                  label: item.modelName,
                  value: item.id
                }
              }) || [];

            });
      },
    useDefaultResolvedData() {
      this.resolvedData = { totalAlarmCount: 54, firingAlarmCount: 37, resolvedAlarmCount: 17, resolvedRate: '31.48%' };
      this.initAlertRecoveryChart();
    },
     roundTo2Decimals(num) {
        return Math.round(num * 100) / 100;
      },
    initAlertRecoveryChart() {
      const chartDom = this.$refs.alertRecoveryChart;
      if (!chartDom) return;
      if (this.alertRecoveryChart) this.alertRecoveryChart.dispose();

      this.alertRecoveryChart = echarts.init(chartDom);
      const resolvedRateNum = parseFloat(this.resolvedData.resolvedRate) || 0;
      const firingRateNum = 100 - resolvedRateNum;

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: params => {
            // 判断两个数据是否都为0
            if ( this.resolvedData.resolvedAlarmCount == 0 && this.resolvedData.firingAlarmCount == 0) {
              return ''; // 返回空字符串，不展示tooltip
            }

            const status = params.name === this.$t('common.resolved') ? this.$t('common.resolved') : this.$t('common.firing');
            const count = status === this.$t('common.resolved') ? this.resolvedData.resolvedAlarmCount : this.resolvedData.firingAlarmCount;
            return `${status}: ${count} (${params.value}%)`;
          }
        },
        series: [
          {
            name: '恢复率',
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: { show: true, position: 'center', formatter: `${this.resolvedData.resolvedRate}`, fontSize: 24, fontWeight: 'bold', color: '#333' },
            labelLine: { show: false },
            data: [
              { value: this.roundTo2Decimals(resolvedRateNum), name: this.$t('common.resolved'), itemStyle: { color: this.resolvedColorMap.resolved } },
              { value: this.roundTo2Decimals(firingRateNum), name: this.$t('common.firing'), itemStyle: { color: this.resolvedColorMap.firing } }
            ]
          }
        ],
        legend: { orient: 'vertical', bottom: 'center', left: 'left', data: [this.$t('common.resolved'), this.$t('common.firing')], textStyle: { fontSize: 12 } }
      };
      this.alertRecoveryChart.setOption(option);
    },

    // -------------------------- 未恢复告警分布相关 --------------------------
    async fetchUnrecoveredData() {
      try {
        const res = await getDistribution({alarmStatus:'0'});
        if (res.code === 0 && Array.isArray(res.data)) {
          this.processUnrecoveredData(res.data);
          this.initUnrecoveredAlertChart();
        } else {
          console.error('未恢复告警分布数据格式异常', res);
          this.useDefaultUnrecoveredData();
        }
      } catch (error) {
        console.error('未恢复告警分布API请求失败', error);
        this.useDefaultUnrecoveredData();
      }
    },
    processUnrecoveredData(apiData) {
      const xAxisData = apiData.map(item => item.modelName || '未知模型');
      const allLevels = new Set();
      apiData.forEach(model => {
        model.priorityCounts?.forEach(priority => priority.alarmLevelName && allLevels.add(priority.alarmLevelName));
      });
      const levelList = Array.from(allLevels);
      const seriesData = levelList.map(level => {
        const data = apiData.map(model => {
          const target = model.priorityCounts?.find(priority => priority.alarmLevelName === level);
          return target?.alarmCount || 0;
        });
        return {
          name: level,
          type: 'bar',
          stack: 'total',
          data,
          itemStyle: { color: this.levelColorMap[level] || 'rgba(169, 169, 169, 0.5)' }
        };
      });
      this.unrecoveredData = { xAxisData, seriesData };
    },
    useDefaultUnrecoveredData() {
      this.unrecoveredData = {
        xAxisData: ['网络设备', '安全设备', '物理机', '存储', '操作系统', '中间件', '数据库'], // 7个类型
        seriesData: [
          { name: '紧急告警', type: 'bar', stack: 'total', data: [10, 1, 6, 1, 1, 2, 1], itemStyle: { color: 'rgba(245, 63, 63, 0.5)' } },
          { name: '重要告警', type: 'bar', stack: 'total', data: [0, 0, 0, 1, 0, 0, 0], itemStyle: { color: 'rgba(255, 125, 0, 0.5)' } },
          { name: '一般告警', type: 'bar', stack: 'total', data: [0, 1, 0, 0, 1, 0, 0], itemStyle: { color: 'rgba(0, 180, 42, 0.6)' } },
          { name: '提示警告', type: 'bar', stack: 'total', data: [0, 0, 1, 0, 0, 0, 0], itemStyle: { color: 'rgba(24, 144, 255, 0.5)' } }
        ]
      };
      this.initUnrecoveredAlertChart();
    },
    initUnrecoveredAlertChart() {
      const chartDom = this.$refs.unrecoveredAlertChart;
      if (!chartDom) return;
      if (this.unrecoveredAlertChart) this.unrecoveredAlertChart.dispose();

      this.unrecoveredAlertChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          // 恢复tooltip显示（原代码误设为false）
          show: true,
          formatter: params => {
            let tip = `<div>${params[0].name}</div>`;
            params.forEach(item => item.value > 0 && (tip += `<div>${item.seriesName}: ${item.value} ${this.$t('common.times')}</div>`));
            return tip;
          }
        },
        xAxis: {
          type: 'category',
          data: this.unrecoveredData.xAxisData,
          axisLabel: {
            rotate: 15,
            fontSize: 12,
            overflow: 'truncate',
            interval: 0 // 强制显示所有x轴标签（避免默认隐藏）
          }
        },
        yAxis: { type: 'value', name: this.$t('common.quantity'), nameTextStyle: { fontSize: 12 }, min: 0 },
        // 核心修复：移除错误的map方法，直接使用seriesData
        series: this.unrecoveredData.seriesData,
        legend: {
          data: this.unrecoveredData.seriesData.map(item => item.name),
          top: 0,
          left: 'center',
          textStyle: { fontSize: 12 },
          formatter: name => name.length > 6 ? `${name.slice(0, 6)}...` : name
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%', // 增加底部间距，避免x轴标签被截断
          top: '15%',
          containLabel: true
        }
      };
      this.unrecoveredAlertChart.setOption(option);
    },

    // -------------------------- 告警统计（日统计）相关 --------------------------
    getDaysParam(timeValue) {
      return timeValue === 'all' ? 30 : Number(timeValue) || 5;
    },
    async fetchAlertStatData() {
      try {
        const days = this.getDaysParam(this.form4.alarmSTime);
        const res = await getDaily({ days });
        if (res.code === 0 && Array.isArray(res.data)) {
          this.processAlertStatData(res.data);
          this.initAlertStatChart();
        } else {
          console.error('告警统计数据格式异常', res);
          this.useDefaultAlertStatData();
        }
      } catch (error) {
        console.error('告警统计API请求失败', error);
        this.useDefaultAlertStatData();
      }
    },
    processAlertStatData(apiData) {
      const xAxisData = apiData.map(item => {
        const date = item.alarmDate || '';
        return date ? date.slice(5) : '未知日期';
      });
      const allLevels = new Set();
      apiData.forEach(dayData => {
        dayData.priorityCounts?.forEach(priority => priority.alarmLevelName && allLevels.add(priority.alarmLevelName));
      });
      const levelList = Array.from(allLevels);

      const seriesData = levelList.map(level => {
        const data = apiData.map(dayData => {
          const target = dayData.priorityCounts?.find(priority => priority.alarmLevelName === level);
          return target?.alarmCount || 0;
        });
        return {
          name: level,
          type: 'bar',
          stack: 'total',
          data,
          itemStyle: { color: this.levelColorMap[level] || 'rgba(169, 169, 169, 0.5)' }
        };
      });

      this.alertStatData = { xAxisData, seriesData };
    },
    useDefaultAlertStatData() {
      this.alertStatData = {
        xAxisData: ['09-09', '09-10', '09-11', '09-12', '09-14', '09-15', '09-16'],
        seriesData: [
          { name: '紧急告警', type: 'bar', stack: 'total', data: [0, 0, 2, 0, 0, 7, 0], itemStyle: { color: 'rgba(245, 63, 63, 0.5)' } },
          { name: '重要告警', type: 'bar', stack: 'total', data: [0, 0, 0, 0, 0, 2, 0], itemStyle: { color: 'rgba(255, 125, 0, 0.5)' } },
          { name: '一般告警', type: 'bar', stack: 'total', data: [2, 8, 1, 4, 1, 0, 12], itemStyle: { color: 'rgba(0, 180, 42, 0.6)' } }
        ]
      };
      this.initAlertStatChart();
    },
    initAlertStatChart() {
      const chartDom = this.$refs.alertStatChart;
      if (!chartDom) return;
      if (this.alertStatChart) this.alertStatChart.dispose();

      this.alertStatChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => {
            let tip = `<div>${params[0].name}</div>`;
            params.forEach(item => item.value > 0 && (tip += `<div>${item.seriesName}: ${item.value} ${this.$t('common.times')}</div>`));
            return tip;
          }
        },
        xAxis: { type: 'category', data: this.alertStatData.xAxisData, axisLabel: { fontSize: 12, overflow: 'truncate' } },
        yAxis: { type: 'value', name: this.$t('common.quantity'), nameTextStyle: { fontSize: 12 }, min: 0 },
        series: this.alertStatData.seriesData,
        legend: { data: this.alertStatData.seriesData.map(item => item.name), top: 0, left: 'center', textStyle: { fontSize: 12 }, formatter: name => name.length > 6 ? `${name.slice(0, 6)}...` : name },
        grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true }
      };
      this.alertStatChart.setOption(option);
    },

    // -------------------------- 告警趋势统计相关（已优化：面积图改折线图 + X轴只显示月日） --------------------------
    getTrendParams() {
      const { alarmSTime, alarmStatus } = this.form;
      const days = this.getDaysParam(alarmSTime);
      const alarmLevels = alarmStatus.length > 0 ? alarmStatus.map(val => Number(val)) : [];
      return { days, alarmLevels };
    },
    async fetchAlertTrendData() {
      try {
        const params = this.getTrendParams();
        const res = await getTrend(params);
        if (res.code === 0 && Array.isArray(res.data)) {
          this.processAlertTrendData(res.data);
          this.initAlertTrendChart();
        } else {
          console.error('告警趋势数据格式异常', res);
          this.useDefaultAlertTrendData();
        }
      } catch (error) {
        console.error('告警趋势API请求失败', error);
        this.useDefaultAlertTrendData();
      }
    },
    processAlertTrendData(apiData) {
      // 优化1：X轴日期处理为“月-日”格式（去掉年份）
      const xAxisData = apiData.map(item => {
        const date = item.alarmDate || '未知日期';
        return date !== '未知日期' ? date.slice(-5) : date; // 截取最后5个字符（如“2025-08-01”→“08-01”）
      });

      const allModels = new Set();
      apiData.forEach(dayData => {
        dayData.modelAlarmCounts?.forEach(model => {
          const modelName = model.modelName || '未知模型';
          allModels.add(modelName);
        });
      });
      const modelList = Array.from(allModels);
      const { alarmStatus } = this.form;
      const selectedLevelNames = alarmStatus.map(val => this.levelValueToName[val]) || [];
      const seriesData = modelList.map(modelName => {
        const dailyData = apiData.map(dayData => {
          const targetModel = dayData.modelAlarmCounts?.find(model => (model.modelName || '未知模型') === modelName);
          if (!targetModel || !targetModel.priorityCounts) return 0;

          return targetModel.priorityCounts.reduce((total, priority) => {
            const levelName = priority.alarmLevelName;
            if (selectedLevelNames.length === 0 || selectedLevelNames.includes(levelName)) {
              return total + (priority.alarmCount || 0);
            }
            return total;
          }, 0);
        });

        const lineColor = this.modelColorMap[modelName]?.replace('0.4)', '0.8)') || this.modelColorMap['未知模型'].replace('0.4', '0.8');

        // 优化2：去掉areaStyle属性，只保留折线图配置
        return {
          name: modelName,
          type: 'line', // 保持折线图类型
          lineStyle: { color: lineColor }, // 保留线条样式
          data: dailyData,
          symbol: 'circle', // 数据点样式
          symbolSize: 4 // 数据点大小
        };
      });

      this.alertTrendData = { xAxisData, seriesData };
    },
    useDefaultAlertTrendData() {
      // 优化1：默认X轴数据改为“月-日”格式（去掉年份）
      this.alertTrendData = {
        xAxisData: ['08-01', '08-04', '08-08', '08-09', '08-11', '08-13', '08-19'],
        seriesData: [
          // 优化2：去掉所有series的areaStyle属性，只保留折线配置
          { name: '网络设备', type: 'line', lineStyle: { color: 'rgba(24, 144, 255, 0.8)' }, data: [12, 8, 10, 15, 7, 20, 14], symbol: 'circle', symbolSize: 4 },
          { name: '终端设备', type: 'line', lineStyle: { color: 'rgba(245, 63, 63, 0.8)' }, data: [5, 3, 6, 4, 8, 10, 6], symbol: 'circle', symbolSize: 4 },
          { name: '物理机', type: 'line', lineStyle: { color: 'rgba(255, 125, 0, 0.8)' }, data: [8, 12, 9, 11, 15, 18, 12], symbol: 'circle', symbolSize: 4 },
          { name: '存储', type: 'line', lineStyle: { color: 'rgba(0, 180, 42, 0.8)' }, data: [3, 2, 4, 3, 5, 7, 4], symbol: 'circle', symbolSize: 4 },
          { name: '虚拟化', type: 'line', lineStyle: { color: 'rgba(255, 170, 0, 0.8)' }, data: [6, 9, 7, 10, 12, 15, 10], symbol: 'circle', symbolSize: 4 }
        ]
      };
      this.initAlertTrendChart();
    },
    initAlertTrendChart() {
      const chartDom = this.$refs.alertTrendChart;
      if (!chartDom) return;
      if (this.alertTrendChart) this.alertTrendChart.dispose();

      this.alertTrendChart = echarts.init(chartDom);
      const legendData = this.alertTrendData.seriesData.map(item => item.name);
      const legendDataArray = [];
      const legendDemo = [];
      let gridTop = "15%";
      const singleRowSize = 6;
      if (legendData.length > singleRowSize) {
        // 一行显示6个，换算一下
        const rows = Math.ceil(legendData.length / singleRowSize);
        console.log(rows);
        for (let i = 0; i < rows; i++) {
          let start = i * singleRowSize;
          let end = start + singleRowSize;
          legendDataArray.push(legendData.slice(start, end));
          gridTop = 15 + (i * 8) + "%";
        }
      } else {
        legendDataArray.push(legendData);
      }
      legendDataArray.forEach((item, index) => {
        legendDemo.push({
          data: item,
          top: index * 20,
          left: 'center',
          type: 'scroll',
          textStyle: { fontSize: 12 },
          formatter: name => name.length > 8 ? `${name.slice(0, 8)}...` : name
        });
      });
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let tip = `<div>${params[0].name}</div>`;
            params.forEach(item =>  (tip += `<div>${item.seriesName}: ${item.value} ${this.$t('common.times')}</div>`));
            return tip;
          },
          // 关键优化：开启tooltip的浮层溢出卡片时的显示策略
          confine: false, // 允许tooltip超出图表容器
          appendToBody: true // 将tooltip挂载到body上，避免被卡片截断
        },
        grid: { left: '5%', right: '4%', bottom: '5%', top: gridTop, containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: this.alertTrendData.xAxisData, axisLabel: { rotate: 15, fontSize: 12, overflow: 'truncate' } },
        yAxis: { type: 'value', name: this.$t('common.quantity'), min: 0, nameTextStyle: { fontSize: 12 } },
        // legend: { data: this.alertTrendData.seriesData.map(item => item.name), top: 0, left: 'center', textStyle: { fontSize: 12 }, formatter: name => name.length > 8 ? `${name.slice(0, 8)}...` : name },
        legend: legendDemo,
        series: this.alertTrendData.seriesData
      };
      this.alertTrendChart.setOption(option);
    },

    // -------------------------- TOP5 资源模型相关（API改造） --------------------------
    async fetchTopResourceModels() {
      try {
        const days = this.getDaysParam(this.form1.alarmSTime);
        const alarmLevels = this.form1.alarmStatus.length > 0
          ? this.form1.alarmStatus.map(val => Number(val))
          : [];
        const data = { days, alarmLevels };

        const res = await getTop(data, 'asset-model');
        if (res.code === 0 && Array.isArray(res.data)) {
          this.topResourceModels = res.data
            .filter(item => item.alarmCount > 0)
            .map(item => ({
              name: item.typeObjectName || '未知资源模型',
              count: item.alarmCount || 0
            })).sort((a, b) => b.count - a.count)
            .slice(0, 5);
        } else {
          console.error('TOP5-资源模型数据格式异常', res);
          this.useDefaultTopResourceModels();
        }
      } catch (error) {
        console.error('TOP5-资源模型API请求失败', error);
        this.useDefaultTopResourceModels();
      }
    },
    useDefaultTopResourceModels() {
      this.topResourceModels = [
        { name: '物理机', count: 15 },
        { name: '网络设备', count: 11 },
        { name: '虚拟化', count: 6 },
        { name: '应用', count: 2 },
        { name: '站点', count: 2 },
      ];
    },

    // -------------------------- TOP5 资源名称相关（API改造） --------------------------
    async fetchTopResourceNames() {
      try {
        // const days = this.getDaysParam(this.form2.alarmSTime);
        const alarmLevels = this.form2.alarmStatus.length > 0
          ? this.form2.alarmStatus.map(val => Number(val))
          : [];
        // const assetModelIds = this.form3.assetModelIds.length > 0
        //   ? this.form3.assetModelIds.map(val => Number(val))
        //   : [];
        const data = { assetModelIds: this.form2.assetModelIds, alarmLevels };

        const res = await getTop(data, 'asset');
        if (res.code === 0 && Array.isArray(res.data)) {
          this.topResourceNames = res.data
            .filter(item => item.alarmCount > 0)
            .map(item => ({
              name: item.typeObjectName || '未知资源名称',
              count: item.alarmCount || 0
            })).sort((a, b) => b.count - a.count)
            .slice(0, 5);
        } else {
          console.error('TOP5-资源名称数据格式异常', res);
          this.useDefaultTopResourceNames();
        }
      } catch (error) {
        console.error('TOP5-资源名称API请求失败', error);
        this.useDefaultTopResourceNames();
      }
    },
    useDefaultTopResourceNames() {
      this.topResourceNames = [
        { name: '戴尔服务器211', count: 11 },
        { name: '办公汇聚交换机', count: 7 },
        { name: 'Vmware ESXi-205', count: 4 },
        { name: '戴尔服务器213', count: 4 },
        { name: '网页负载均衡', count: 2 },
      ];
    },

    // -------------------------- TOP5 告警名称相关（API改造） --------------------------
    async fetchTopAlertTitles() {
      try {
        // const days = this.getDaysParam(this.form3.alarmSTime);
        const alarmLevels = this.form3.alarmStatus.length > 0
          ? this.form3.alarmStatus.map(val => Number(val))
          : [];
        // const assetModelIds = this.form3.assetModelIds.length > 0
        //   ? this.form3.assetModelIds.map(val => Number(val))
        //   : [];
        const data = { assetModelIds: this.form3.assetModelIds, alarmLevels };

        const res = await getTop(data, 'alarm-title');
        if (res.code === 0 && Array.isArray(res.data)) {
          this.topAlertNames = res.data
            .filter(item => item.alarmCount > 0)
            .map(item => ({
              name: item.typeObjectName || '未知告警名称',
              count: item.alarmCount || 0
            })).sort((a, b) => b.count - a.count)
            .slice(0, 5);
        } else {
          console.error('TOP5-告警名称数据格式异常', res);
          this.useDefaultTopAlertTitles();
        }
      } catch (error) {
        console.error('TOP5-告警名称API请求失败', error);
        this.useDefaultTopAlertTitles();
      }
    },
    useDefaultTopAlertTitles() {
      this.topAlertNames = [
        { name: 'ICMP Ping 不通', count: 7 },
        { name: '网口 Gi1/0/9: copper: 状态异常', count: 4 },
        { name: '网口 Gi1/0/2: copper: 状态异常', count: 3 },
        { name: '网口 GigabitEthernet1/0/13: 状态异常', count: 2 },
        { name: '网口 GigabitEthernet1/0/5: 状态异常', count: 1 },
      ];
    },

    // -------------------------- 通用方法 --------------------------
    handleResize() {
      setTimeout(() => {
        this.alertLevelChart && this.alertLevelChart.resize();
        this.alertRecoveryChart && this.alertRecoveryChart.resize();
        this.unrecoveredAlertChart && this.unrecoveredAlertChart.resize();
        this.alertStatChart && this.alertStatChart.resize();
        this.alertTrendChart && this.alertTrendChart.resize();
      }, 100);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchAlertLevelData();
      this.fetchResolvedData();
      this.fetchUnrecoveredData();
      this.fetchAlertStatData();
      this.fetchAlertTrendData();
      this.fetchTopResourceModels();
      this.fetchTopResourceNames();
      this.fetchTopAlertTitles();
      this.getModelList()

      window.addEventListener('resize', this.handleResize);
    });
  },
  beforeDestroy() {
    this.alertLevelChart && this.alertLevelChart.dispose();
    this.alertRecoveryChart && this.alertRecoveryChart.dispose();
    this.unrecoveredAlertChart && this.unrecoveredAlertChart.dispose();
    this.alertStatChart && this.alertStatChart.dispose();
    this.alertTrendChart && this.alertTrendChart.dispose();
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
  background-color: #f5f7fa;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  min-width: 1450px;
}

.card-container {
  height: 300px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  background: #fff;
}

.card-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* 卡片标题样式 */
.card-container >>> .ant-card-head {
  min-height: 40px;
  padding: 0 16px;
  background-color: #fff;
  border-bottom: 0;
}

/* 卡片内容样式 - 确保不遮挡图表 */
.card-container >>> .ant-card-body {
  flex: 1;
  padding: 16px;
  overflow: visible !important;
  background-color: #fff;
  box-sizing: border-box;
  margin-top: 10px;
  /* 关键优化：为告警趋势统计卡片的body添加溢出可见，不影响其他卡片 */
  &.alert-trend-card-body {
    overflow: visible !important;
  }
}

/* 图表容器基础样式 */
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 220px;
  box-sizing: border-box;
}

/* 关键优化：告警趋势统计图表容器专属样式，确保tooltip不被截断 */
.alert-trend-chart-container {
  position: relative;
  overflow: visible !important;
}

/* TOP5 列表样式 */
.top-list-container {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  box-sizing: border-box;
}

.top-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #f9fafc;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.top-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background-color: #f0f7ff;
}

/* TOP5 排名边框颜色 */
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
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
  flex-shrink: 0;
}

/* TOP5 排名背景色 */
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
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-bar-container {
  height: 6px;
  background-color: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.top-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease-in-out;
}

/* TOP5 进度条颜色 */
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

/* 响应式调整 */
@media (max-width: 1200px) {
  .card-container {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .card-container {
    height: 320px;
  }
}

.custom-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-marker {
  width: 4px;
  height: 16px;
  background-color: rgba(24, 144, 255, 0.9);
  border-radius: 2px;
  flex-shrink: 0;
}
.no-text{
  text-align: center;
  font-weight: 600;
}
</style>
