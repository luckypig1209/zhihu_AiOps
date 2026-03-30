<template>
    <div class="alarm-history">
        <!-- 查询表单 -->
        <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
            <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
                <a-row :gutter="16">
                    <!-- 名称 -->
                    <a-col :span="6">
                        <a-form-item >
                            <a-input v-model="searchForm.taskName" :placeholder="$t('common.pleaseInputDialingName')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>

                    <!-- 拨测类型（多选） -->
                    <a-col :span="6">
                        <a-form-item >
                            <a-select v-model="searchForm.taskCategory" :placeholder="$t('common.pleaseSelectDialingType')" allowClear>
                                <a-select-option v-for="field in taskTypeOptions" :key="field.value"
                                    :value="field.value">
                                    {{ field.label }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <!-- 拨测异常资源 -->
                    <a-col :span="6">
                        <a-form-item >
                            <a-input v-model="searchForm.target" :placeholder="$t('common.pleaseInputAbnormalResource')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>

                    <!-- 操作按钮 -->
                    <a-col :span="6" style="display: flex; align-items: center;margin-top: 3px;">
                        <a-button type="primary" ghost @click="handleSearch">{{ $t('common.query') }}</a-button>
                        <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('common.reset') }}</a-button>

                    </a-col>

                </a-row>
            </a-form>
        </div>


        <!-- 告警表格 -->
        <a-table style="margin-top: 10px;" rowKey="id" class="custom-table" :columns="columns" :data-source="tableData"
            :pagination="false" :loading="loading" bordered size="middle"
            :locale="{
              emptyText: $t('common.noData')
            }"
        >
            <template slot="name" slot-scope="text">
                <a-tooltip placement="top" :title={text}>
                    {{ text }}
                </a-tooltip>
            </template>
            <template slot="target" slot-scope="text,record">
              <a-tooltip placement="top" :title={text}>
                {{ text }}
              </a-tooltip>
            </template>
          <template slot="alarmTitle" slot-scope="text,record">
            <a-tooltip placement="top" :title={text}>
              {{ text }}
            </a-tooltip>
          </template>
            <!-- 操作列：Scoped Slot -->
            <template slot="operation" slot-scope="text, record">
                <div class="table-row-actions">

                    <a @click="fzInspection(record)">{{ $t('common.viewResults') }}</a>

                </div>
            </template>
        </a-table>

        <!-- 分页 -->
        <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
            :show-total="total => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
            @change="handlePageChange" @showSizeChange="onShowSizeChange">
            <template slot="buildOptionText" slot-scope="props">
                <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>

            </template>
        </a-pagination>

        <a-drawer :title="$t('common.dialingAbnormalResult')" width="880px" placement="right" :closable="true" :visible="nameVisible"
            :mask-closable="false" @close="onClose">
            <!-- Tab切换 -->
            <div class="tab-container">
                <div class="tab-header">
                    <div class="tab-item" :class="{ active: activeTab === 'dialingDetail' }"
                        @click="activeTab = 'dialingDetail'">
                        {{ $t('common.dialingDetail') }}
                    </div>
                    <div class="tab-item" :class="{ active: activeTab === 'alarmDetail' }"
                        @click="activeTab = 'alarmDetail'">
                        {{ $t('common.alarmDetail') }}
                    </div>
                    <div class="tab-item" :class="{ active: activeTab === 'alarmNotify' }"
                         @click="activeTab = 'alarmNotify'">
                      {{ $t('common.alarmNotification') }}
                    </div>
                </div>

                <!-- Tab内容区 -->
                <div class="tab-content">
                    <!-- 拨测详情Tab -->
                    <div v-if="activeTab === 'dialingDetail'" class="dialing-detail">
                        <div class="detail-section">
                            <div class="detail-label">{{ $t('common.dialingResource') }}:</div>
                            <div class="detail-value">{{ dialingDetailObj.target }}</div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-label">{{ $t('common.ruleConfiguration') }}:</div>
                            <div class="detail-value">{{ dialingDetailObj.ruleDescription }}</div>
                        </div>
                        <div class="detail-section">
                            <div class="detail-label">{{ $t('common.dialingTimeRange') }}:</div>
                            <div class="detail-value">
                                <el-date-picker v-if="isDatePickerReady" v-model="timeRange" style="width: 356px"
                                    type="datetimerange" align="right" :picker-options="pickerOptionsPage"
                                    :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')" :clearable="true"
                                    format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                                    @change="handleTimeRangeChange" :default-time="['00:00:00', '23:59:59']" />
                            </div>
                        </div>
                        <div v-if="dialingDetailData && dialingDetailData.length > 0">
                            <div class="chart-section" v-for="(item, index) in dialingDetailData" :key="index">
                                <div class="chart-header">
                                    <span class="chart-title">{{ item.metricName }}</span>
                                    <a-button type="text" icon="fullscreen" class="expand-btn"
                                        @click="expandChart(item, dialingDetailObj.endTime)" />
                                </div>
                                <div class="chart-content">
                                    <!-- 图表容器 -->
                                    <div :id="`chart-${index}`" style="width: 100%; height: 200px;"></div>
                                    <!-- 暂无数据提示 -->
                                    <div v-if="!chartLoading && chartNoData[index]" class="chart-no-data">
                                        <div style="text-align: center; padding: 40px;">
                                            <img width="80px" height="80px" src="@/assets/images/table-empty.png" alt="" />
                                            <div class="no-text" style="margin-top: 10px;">{{ $t('common.noData') }}</div>
                                        </div>
                                    </div>
                                    <!-- 加载中 -->
                                    <div v-if="chartLoadings[index]" class="chart-loading">
                                        <i class="el-icon-loading"></i>
                                        <span>{{ $t('common.loading') }}...</span>
                                    </div>
                                    <!-- 加载失败 -->
                                    <div v-if="chartErrors[index]" class="chart-error">
                                        <i class="el-icon-circle-close"></i>
                                        <span>{{ $t('common.loadFailed') }}</span>
                                        <el-button type="text" size="small" @click="reloadChart(index)">{{ $t('common.reload') }}</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <div style="margin:150px auto;text-align: center;">
                                <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
                                <div class="no-text" style="margin-top: 10px;">{{ $t('common.noData') }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 告警详情Tab -->
                    <div v-if="activeTab === 'alarmDetail'" class="alarm-detail">
                        <a-row :gutter="16">
                            <a-col :span="8">
                                <p><strong>{{ $t('common.alarmId') }}:</strong> {{ alarmDetailData?.id || '--' }}</p>
                                <p><strong>{{ $t('common.alarmName') }}:</strong> {{ alarmDetailData?.alarmTitle || '--' }}</p>
                                <p><strong>{{ $t('common.status') }}:</strong> <a-tag
                                        :color="alarmDetailData?.alarmStatus == 0 ? 'red' : 'green'">
                                        {{ alarmDetailData?.alarmStatus == 0 ? $t('common.notRecovered') : $t('common.recovered') }}
                                    </a-tag></p>
                            </a-col>
                            <a-col :span="8">
                                <p><strong>{{ $t('common.alarmCount') }}:</strong> {{ alarmDetailData?.alarmCount || '--' }}</p>
                                <p><strong>{{ $t('common.alarmLevel') }}:</strong> <a-tag :color="severityColorMap[alarmDetailData?.alarmLevel]">
                                        {{ severityMap2[alarmDetailData?.alarmLevel] || '' }}
                                    </a-tag></p>
                                <p><strong>{{ $t('common.duration') }}:</strong> {{ alarmDetailData?.lastTime || '--' }}</p>
                            </a-col>
                            <a-col :span="8">
                                <p><strong>{{ $t('common.alarmTime') }}:</strong> {{ alarmDetailData?.alarmTime || '--' }}</p>
                                <p><strong>{{ $t('common.recoverTime') }}:</strong> {{ alarmDetailData?.alarmStatus == 0 ? '--' :
                                    alarmDetailData?.recoverTime || '--' }}</p>
                            </a-col>
                            <a-col :span="24">
                                <div style="display: flex;">
                                    <el-tooltip :content="alarmDetailData?.alarmContent" placement="top">
                                        <p class="content"><strong>{{ $t('common.alarmContent') }}:</strong>{{ alarmDetailData?.alarmContent ||
                                            '--' }}</p>
                                    </el-tooltip>
                                </div>
                            </a-col>
                        </a-row>
                    </div>

                  <!-- 告警通知Tab -->
                  <div v-if="activeTab === 'alarmNotify'" class="alarm-notify">
                    <div class="alerts-list" v-if='alertsNotifyData.length>0'>
                      <a-card
                        v-for="(notifyItem, index) in alertsNotifyData"
                        :key="index"
                        style="margin-bottom: 16px; padding: 12px;"
                      >
                        <p><strong>{{ $t('common.notificationTitle') }}:</strong> {{ notifyItem.notificationTitle }}</p>
                        <p><strong>{{ $t('common.alarmName') }}:</strong> {{ notifyItem.alarmName }}</p>
                        <p><strong>{{ $t('common.resourceName') }}:</strong> {{ notifyItem.resourceName }}</p>
                        <p><strong>{{ $t('common.notificationMethod') }}:</strong>
                          <a-tag class="severity-tag" :color="methodColorMap[notifyItem.notificationMethod]">
                            {{ methodsMap[notifyItem.notificationMethod] }}
                          </a-tag>
                        </p>
                        <p><strong>{{ $t('common.notificationTarget') }}:</strong> {{ notifyItem.notificationTarget }}</p>
                        <p style="display: flex;">
                          <strong>{{ $t('common.notificationContent') }}:</strong>
                          <div class="alert-content">
                            <div v-html="notifyItem.alarmMsg&&notifyItem.alarmMsg.replace(/\n/g, '<br>')">
                            </div>
                          </div>
                        </p>
                        <p>
                          <strong>{{ $t('common.notificationStatus') }}:</strong>
                          <a-tag :color="notifyItem.notificationStatus=='成功'?'green':'red'">{{notifyItem.notificationStatus }}</a-tag>
                        </p>
                        <p><strong>{{ $t('common.notificationTime') }}:</strong> {{ notifyItem.notificationTime }}</p>
                      </a-card>
                    </div>
                    <div v-else  class="top-list-container">
                      <div style="margin: auto;">
                        <img width="120px" height="120px" src="@/assets/images/table-empty.png" alt="" />
                        <div class="no-text" style="text-align: center;">{{ $t('common.noData') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </a-drawer>
        
        <!-- 图表放大弹窗 -->
        <a-modal v-model="modalVisible" :title="currentMetric" width="800px" @cancel="handleModalCancel"
            :mask-closable="false" :footer="null" class="fixed-height-modal"
            :body-style="{ maxHeight: '80vh', overflowY: 'auto' }">
            <div class="modal-content">
                <!-- 时间范围筛选和对比选项 -->
                <div class="filter-bar">
                    <el-date-picker v-model="timeRangeModal" style="width: 356px" type="datetimerange" align="right"
                        :picker-options="pickerOptionsModal" :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')"
                        :clearable="true" format="yyyy-MM-dd HH:mm:ss" value-format="yyyy-MM-dd HH:mm:ss"
                        @change="handleTimeChangeModal" :default-time="['00:00:00', '23:59:59']" />
                </div>

                <!-- 时间范围无效提示 -->
                <div v-if="!isTimeRangeValid" class="time-range-error">
                    {{ $t('common.pleaseSelectValidTimeRange') }}
                </div>

                <!-- 图表容器 -->
                <div class="charts-container" v-else ref="chartsContainer">
                    <!-- 图表加载状态 -->
                    <div v-if="chartLoading" class="chart-loading">
                        <i class="el-icon-loading"></i>
                        <span>{{ $t('common.chartDataLoading') }}...</span>
                    </div>
                    <!-- 暂无数据 -->
                    <div v-else-if="chartNoDataModal" class="chart-no-data-modal">
                        <div style="text-align: center; padding: 80px 0;">
                            <img width="100px" height="100px" src="@/assets/images/table-empty.png" alt="" />
                            <div class="no-text" style="margin-top: 20px; font-size: 16px;">{{ $t('common.noData') }}</div>
                        </div>
                    </div>
                    <!-- 图表加载错误 -->
                    <div v-else-if="chartError" class="chart-error">
                        <i class="el-icon-circle-close"></i>
                        <span>{{ chartError }}</span>
                        <el-button type="primary" size="small" @click="renderCharts">{{ $t('common.reload') }}</el-button>
                    </div>
                    <!-- 图表内容 -->
                    <div v-else>
                        <!-- 当前时段图表 -->
                        <div class="chart-wrapper">
                            <div class="chart-inner" ref="currentChartRef"></div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script>
import moment from 'moment'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import {
    dialingPageLog,
    dialingMetric,
    dialingMlarm
} from "@/api/dialing";
import {pushLogList} from "@/api/message";

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

export default {
    name: 'dialingTask',
    components: {},
    props: {},
    data() {
        return {
            isEdit: false,
            inspectionId: null,
            formVisible: false,
            formDatail: {},
            assertList: [],
            // 颜色映射
            severityColorMap: {
                '4': "red",
                '3': "volcano",
                '2': "orange",
                '1': "blue",
            },
          methodsMap: {
            "dd": this.$t('common.dingTalk'),
            "qywx": this.$t('common.wechatWork'),
            "wx": this.$t('common.wechat'),
            "dx": this.$t('common.sms'),
            "wh": this.$t('common.outboundCall'),
            "yhf": this.$t('common.recovered'),
            'szh': this.$t('common.telecomServiceDesk'),
            'http': 'HTTP'
          },
          // 颜色映射
          methodColorMap: {
            "dd": "volcano",
            "qywx": "volcano",
            "wx": "volcano",
            "dx": "volcano",
            "wh": "volcano",
            "yhf": "volcano",
            'szh':'volcano',
            'http':'volcano'
          },
            selectName: '',
            nameVisible: false,
            selectRow: {},
            selectName1: '',
            zhiBVisible: false,
            selectRow1: {},
            assertInfo1: {
                modelId: undefined,
                assetTypeId: undefined,
                modelCode: undefined,
            },
            isDestory: true,
            // Tab切换相关
            activeTab: 'dialingDetail',
            // 拨测详情数据
            dialingDetailData: [],
            dialingDetailObj: {
                target: '',
                ruleDescription: "",
                endTime: '',
            },
            // 规则单位映射
            ruleUnits: {
                '平均时延（拨测）': "ms",
                '丢包率（拨测）': "%",
                '响应状态码（拨测）': "",
                '响应结果（拨测）': "",
                '响应耗时（拨测）': "ms",
                '请求耗时（拨测）': "ms",
                // 英文映射
                'Response Time (Dialing)': "ms",
                'Response Result (Dialing)': "",
                'Request Time (Dialing)': "ms",
                'Packet Loss Rate (Dialing)': "%",
                'Response Status Code (Dialing)': "",
            },            
            // 告警详情数据
            alarmDetailData: {
                alarmName: '',
                alarmContent: '',
                resourceName: '',
                resourceType: '',
                resourceAddress: '',
                alarmLevel: '',
                alarmContentDetail: ''
            },
            // 时间范围相关
            timeRange: [],
            defaultTimeRange: [],
            isDatePickerReady: false,
            // 图表相关
            chartLoadings: [],
            chartErrors: [],
            chartNoData: [], // 新增：用于标记每个图表是否无数据
            // 图表数据
            delayChartData: [],
            lossChartData: [],
            // 查询表单参数
            searchForm: {
                taskName: '',
                taskId: undefined,
                taskCategory: undefined,
                target: ''
            },
            // 表格数据
            tableData: [],
            loading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0,
            editForm: {
                disposalSuggestion: ''
            },
            mbForm: {
                templateName: '',
                id: ''
            },
            rulesMb: {
                templateName: { required: true, message: "请输入模板名称", trigger: "blur" },
            },
            templateId: '',
            isShow: false,
            timeRangeModal: [],
            pickerOptionsPage: {
                shortcuts: [
                    { text: '最近5分钟', onClick: (picker) => this.setShortcutTime(picker, 5 * 60 * 1000) },
                    { text: '最近15分钟', onClick: (picker) => this.setShortcutTime(picker, 15 * 60 * 1000) },
                    { text: '最近1小时', onClick: (picker) => this.setShortcutTime(picker, 60 * 60 * 1000) },
                    { text: '最近3小时', onClick: (picker) => this.setShortcutTime(picker, 3 * 60 * 60 * 1000) },
                    { text: '最近6小时', onClick: (picker) => this.setShortcutTime(picker, 6 * 60 * 60 * 1000) },
                    { text: '最近1天', onClick: (picker) => this.setShortcutTime(picker, 24 * 60 * 60 * 1000) }
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
            pickerOptionsModal: {
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
                    return Array.from({ length: now.getHours() }, (_, i) => i);
                },
                disabledMinutes: (selectedHour) => {
                    const now = new Date();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedHour === now.getHours()) {
                        return Array.from({ length: now.getMinutes() }, (_, i) => i);
                    }
                    return [];
                }
            },
            currentMetric: '',
            modalVisible: false,
            chartLoading: false,
            chartNoDataModal: false, // 新增：弹窗内图表无数据标记
            alertsNotifyData: [],
        }
    },
    computed: {
        isTimeRangeValid() {
            if (!this.timeRangeModal || this.timeRangeModal.length !== 2) return false;
            const [startStr, endStr] = this.timeRangeModal;
            const startTime = new Date(startStr);
            const endTime = new Date(endStr);
            return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) && startTime < endTime;
        },
        chartCount() {
            return 1;
        },
        columns() {
            return [
                {
                    title: this.$t('common.dialingName'),
                    dataIndex: 'taskName',
                    key: 'taskName',
                    width: '10%',
                    scopedSlots: { customRender: 'name' }
                },
                {
                    title: this.$t('common.dialingType'),
                    dataIndex: 'taskType',
                    key: 'taskType',
                    width: '10%',
                    scopedSlots: { customRender: 'name' },
                    customRender: (text) => {
                      return text === 'HTTP' ? this.$t('common.interfaceDialing') : text === 'TCP' ? this.$t('common.portDialing') : text === 'UDP' ? this.$t('common.portDialing') : text === 'PING' ? this.$t('common.pingDialing') : text;
                    }
                },
                {
                    title: this.$t('common.dialingAbnormalResource'),
                    dataIndex: 'target',
                    key: 'target',
                    width: '20%',
                    scopedSlots: { customRender: 'target' }
                },
                {
                  title: this.$t('common.alarmName'),
                  dataIndex: 'alarmTitle',
                  key: 'alarmTitle',
                  width: '20%',
                  scopedSlots: { customRender: 'alarmTitle' }
                },
                {
                    title: this.$t('common.alarmTime'),
                    dataIndex: 'alarmTime',
                    key: 'alarmTime',
                    width: '15%',
                    customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                },
                {
                  title: this.$t('common.alarmUpdateTime'),
                  dataIndex: 'updateTime',
                  key: 'updateTime',
                  width: '15%',
                  customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                },
                {
                    title: this.$t('common.operation'),
                    key: 'operation',
                    width: '10%',
                    scopedSlots: { customRender: 'operation' }
                }
            ]
        },
        // 拨测类型选项（国际化）
        modelList() {
            return [
                { label: this.$t('common.interfaceDialing'), value: 'HTTP' },
                { label: this.$t('common.portDialing'), value: 'DUAN' },
                { label: this.$t('common.pingDialing'), value: 'PING' }
            ];
        },
        // 任务类型选项（国际化）
        taskTypeOptions() {
            return [
                { value: 'HTTP', label: this.$t('common.interfaceDialing') },
                { value: 'PORT', label: this.$t('common.portDialing') },
                { value: 'PING', label: this.$t('common.pingDialing') }
            ];
        },
        // 告警级别选项（国际化）
        severityList() {
            return [
                { label: this.$t('common.warning'), value: '1' },
                { label: this.$t('common.normal'), value: '2' },
                { label: this.$t('common.critical'), value: '3' },
                { label: this.$t('common.urgent'), value: '4' },
            ];
        },
        // 告警级别映射（国际化）
        severityMap2() {
            return {
                '1': this.$t('common.warning'),
                '2': this.$t('common.normal'),
                '3': this.$t('common.critical'),
                '4': this.$t('common.urgent')
            };
        },
    },
    mounted() {
        const { taskName, taskId } = this.$route.query;
        if (taskId) {
            this.searchForm.taskId = taskId;
        }
        this.fetchData();
        window.addEventListener('resize', this.handleResize);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        this.destroyCharts();
    },
    watch: {
        activeTab(newVal, oldVal) {
            if (newVal === 'dialingDetail' && oldVal !== 'dialingDetail') {
                this.$nextTick(() => {
                    this.dialingDetailData.forEach((_, index) => {
                        this.initChart(index);
                    });
                });
            }
        }
    },
    methods: {
        getNotifyLogList(alarmId) {
          if (alarmId) {
            let params = {
              alarmId: alarmId,
              pageSize: 10,
              pageNo: 1,
            };
            pushLogList(params).then((res) => {
              this.alertsNotifyData = res.data && res.data.list;
            });
          }
        },
        templateCreate() {
            this.isEdit = false;
            this.formVisible = true;
        },
        editInspection(id) {
            this.inspectionId = id;
            this.isEdit = true;
            this.formVisible = true;
        },
        filterOption(input, option) {
            return option.label?.toLowerCase().includes(input.toLowerCase());
        },
        defaultDateRange() {
            const end = moment();
            const start = moment().subtract(1, 'months').startOf('day');
            return [start, end];
        },
        onClose() {
            this.nameVisible = false
        },
        selectShow(row) {
            this.nameVisible = true
            this.selectName = row.name
            this.selectRow = row
        },
        selectAssert(row) {
            this.zhiBVisible = true;
            this.templateId = row.id;
            this.isShow = row.strategyCount == 0 ? false : true;
        },
        onClose1() {
            this.zhiBVisible = false;
            setTimeout(() => {
                this.isDestory = false;
            }, 500);
            setTimeout(() => {
                this.isDestory = true;
            }, 800);
        },
        fetchData() {
            this.loading = true;
            let params = {
                pageSize: this.pageSize,
                pageNo: this.currentPage,
                "taskId": this.searchForm.taskId || undefined,
                "taskName": this.searchForm.taskName || undefined,
                taskCategory: this.searchForm.taskCategory,
                target: this.searchForm.target
            }
            dialingPageLog(params).then((res) => {
                this.tableData = res.data && res.data.list;
                this.total = (res.data && res.data.total) || 0;
                this.loading = false
            });
        },
        handleSearch() {
            this.currentPage = 1;
            this.fetchData();
        },
        handleReset() {
            this.searchForm = {
                taskName: '',
                taskId: undefined,
                taskCategory: undefined,
                target: ''
            };
            this.handleSearch();
        },
        fzInspection(record) {
            this.nameVisible = true;
            this.recordId = record.id;
            this.dialingDetailObj.target = record.target;
            this.dialingDetailObj.ruleDescription = record.ruleDescription;
            this.dialingDetailObj.endTime = record.updateTime;
            this.activeTab = 'dialingDetail';
            this.dialingDetailData = []
            this.alertsNotifyData = []
            this.alarmDetailData = {
                id: this.$t('common.loading') + '...',
                alarmTitle: this.$t('common.loading') + '...',
                alarmContent: this.$t('common.loading') + '...',
                assetName: this.$t('common.loading') + '...',
                alarmLevel: this.$t('common.loading') + '...',
                alarmStatus: this.$t('common.loading') + '...',
                alarmCount: this.$t('common.loading') + '...',
                alarmTime: this.$t('common.loading') + '...',
                recoverTime: this.$t('common.loading') + '...',
                lastTime: this.$t('common.loading') + '...',
            };

            // 初始化默认时间范围
            const timeEndStr = record.updateTime;
            const isoStr = timeEndStr.replace(' ', 'T');
            const timeEnd = new Date(isoStr);
            const timeStart = new Date(timeEnd);
            timeStart.setMinutes(timeStart.getMinutes() - 15);
            this.defaultTimeRange = [
                timeStart,
                timeEnd
            ];
            this.timeRange = this.defaultTimeRange;
            this.isDatePickerReady = true;

            // 初始化图表状态数组
            this.chartLoadings = new Array(this.dialingDetailData.length).fill(false);
            this.chartErrors = new Array(this.dialingDetailData.length).fill(false);
            this.chartNoData = new Array(this.dialingDetailData.length).fill(false);

            let param = {
                id: this.recordId,
                startTime: '',
                endTime: '',
            }
            dialingMetric(param).then((res) => {
                if (res.code === 0 && res.data) {
                    this.dialingDetailData = res.data;
                    // 初始化图表状态数组
                    this.chartLoadings = new Array(this.dialingDetailData.length).fill(false);
                    this.chartErrors = new Array(this.dialingDetailData.length).fill(false);
                    this.chartNoData = new Array(this.dialingDetailData.length).fill(false);
                } else {
                    this.dialingDetailData = [];
                }

                this.$nextTick(() => {
                    this.dialingDetailData.forEach((_, index) => {
                        this.initChart(index);
                    });
                });
            }).catch(() => {
                this.dialingDetailData = [];
                this.$nextTick(() => {
                    this.dialingDetailData.forEach((_, index) => {
                        this.initChart(index);
                    });
                });
            });

            let params = {
                id: record.id,
                startTime: this.timeRange[0],
                endTime: this.timeRange[1]
            }
            dialingMlarm(params).then((res) => {
                if (res.code === 0 && res.data) {
                    const alarmData = res.data;
                    const ipMatch = alarmData.alarmContent.match(/ip地址：([\d.]+)/);
                    const ipAddress = ipMatch ? ipMatch[1] : '--';
                    this.getNotifyLogList(alarmData.id);

                    this.alarmDetailData = {
                        id: alarmData.id || '--',
                        alarmTitle: alarmData.alarmTitle || '--',
                        alarmContent: alarmData.alarmContent || '--',
                        assetName: alarmData.assetName || '--',
                        alarmLevel: alarmData.alarmLevel || '--',
                        alarmStatus: alarmData.alarmStatus || '--',
                        alarmCount: alarmData.alarmCount || '--',
                        alarmTime: alarmData.alarmTime || '--',
                        recoverTime: alarmData.recoverTime || '--',
                        lastTime: alarmData.lastTime || '--',
                    };
                } else {
                    this.alarmDetailData = {
                        id: '--',
                        alarmTitle: '--',
                        alarmContent: '--',
                        assetName: '--',
                        alarmLevel: '--',
                        alarmStatus: '--',
                        alarmCount: '--',
                        alarmTime: '--',
                        recoverTime: '--',
                        lastTime: '--',
                    };
                }
            }).catch(() => {
                this.alarmDetailData = {
                    id: '--',
                    alarmTitle: '--',
                    alarmContent: '--',
                    assetName: '--',
                    alarmLevel: '--',
                    alarmStatus: '--',
                    alarmCount: '--',
                    alarmTime: '--',
                    recoverTime: '--',
                    lastTime: '--',
                };
            });
        },
        handleDelete(id) {
                this.$confirm(this.$t('common.confirmDeleteTemplate'), this.$t('common.tip'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {
                    inspectionDelete({ id: id }).then((res) => {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        this.handleSearch();
                    });
                })
                .catch(() => { });
        },
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchData();
        },
        onShowSizeChange(current, pageSize) {
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.fetchData();
        },
        handleResize() {
            this.dialingDetailData.forEach((_, index) => {
                const chartDom = document.getElementById(`chart-${index}`);
                if (chartDom) {
                    const chartInstance = echarts.getInstanceByDom(chartDom);
                    if (chartInstance) {
                        chartInstance.resize();
                    }
                }
            });
        },
        handleTimeRangeChange() {
            if (!this.selectRow) return;
            const [startTime, endTime] = this.timeRange;

            dialingMetric({ id: this.recordId, startTime, endTime }).then((res) => {
                if (res.code === 0 && res.data) {
                    this.dialingDetailData = res.data;
                    // 重新初始化图表状态数组
                    this.chartLoadings = new Array(this.dialingDetailData.length).fill(false);
                    this.chartErrors = new Array(this.dialingDetailData.length).fill(false);
                    this.chartNoData = new Array(this.dialingDetailData.length).fill(false);
                } else {
                    this.dialingDetailData = []
                }

                this.$nextTick(() => {
                    this.dialingDetailData.forEach((_, index) => {
                        this.initChart(index);
                    });
                });
            }).catch(() => {
                this.dialingDetailData = []
                this.$nextTick(() => {
                    this.dialingDetailData.forEach((_, index) => {
                        this.initChart(index);
                    });
                });
            });
        },
        reloadChart(index) {
            this.initChart(index);
        },
        initChart(index) {
            // 初始化状态
            this.$set(this.chartLoadings, index, true);
            this.$set(this.chartErrors, index, false);
            this.$set(this.chartNoData, index, false);

            try {
                const metric = this.dialingDetailData[index];
                if (!metric) {
                    this.$set(this.chartLoadings, index, false);
                    this.$set(this.chartNoData, index, true);
                    return;
                }

                // 检查数据是否为空
                if (!metric.metricValueList || metric.metricValueList.length === 0) {
                    this.$set(this.chartLoadings, index, false);
                    this.$set(this.chartNoData, index, true);
                    return;
                }

                const chartDom = document.getElementById(`chart-${index}`);
                if (!chartDom) {
                    this.$set(this.chartLoadings, index, false);
                    this.$set(this.chartErrors, index, true);
                    return;
                }

                const chartInstance = echarts.getInstanceByDom(chartDom);
                if (chartInstance) {
                    chartInstance.dispose();
                }

                const chart = echarts.init(chartDom);
                const data = {
                    times: (metric.metricValueList || []).map(item => item.datetime),
                    values: (metric.metricValueList || []).map(item => item.valueFloat)
                };

                // 再次检查数据
                if (data.times.length === 0 || data.values.length === 0) {
                    this.$set(this.chartLoadings, index, false);
                    this.$set(this.chartNoData, index, true);
                    return;
                }

                let chartConfig = this.getChartConfig(metric.metricName, data);
                chart.setOption(chartConfig);
                this.$set(this.chartLoadings, index, false);
            } catch (error) {
                console.error(`初始化图表失败 (${index}):`, error);
                this.$set(this.chartLoadings, index, false);
                this.$set(this.chartErrors, index, true);
            }
        },
        destroyCharts() {
            this.dialingDetailData.forEach((_, index) => {
                const chartDom = document.getElementById(`chart-${index}`);
                if (chartDom) {
                    const chartInstance = echarts.getInstanceByDom(chartDom);
                    if (chartInstance) {
                        chartInstance.dispose();
                    }
                }
            });
        },
        getChartConfig(metricName, data) {
            metricName = metricName || this.$t('common.metric');
            // 根据metricName从ruleUnits中获取对应的单位
            const unit = this.ruleUnits[metricName] || '';
            const dataLength = data.times.length;
            let axisLabelInterval = 0;
            if (dataLength > 20) {
              axisLabelInterval = Math.floor(dataLength / 10);
            } else if (dataLength > 10) {
              axisLabelInterval = Math.floor(dataLength / 5);
            }
            
            // 构建基础配置
            const baseConfig = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        let result = `${params[0].axisValue}<br/>`;
                        result += `${params[0].seriesName}: ${params[0].value}${unit ? ' ' + unit : ''}`;
                        return result;
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: data.times,
                    axisLabel: {
                      interval: axisLabelInterval,
                        formatter: function (value) {
                            return dayjs(value).format('YYYY-MM-DD HH:mm');
                        },
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    name: unit ? `${this.$t('common.unit')}： ${unit}` : '',
                    axisLabel: {
                        formatter: unit ? `{value} ${unit}` : '{value}'
                    }
                },
                series: [
                    {
                        name: metricName,
                        type: 'line',
                        data: data.values,
                        smooth: true
                    }
                ]
            };

            // 根据metricName设置不同的样式
            if (metricName.includes('延时') || metricName.includes('响应时间') || metricName.includes('延迟') || unit === 'ms') {
                return {
                    ...baseConfig,
                    series: [
                        {
                            ...baseConfig.series[0],
                            lineStyle: {
                                color: '#5470c6'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                                    { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                                ])
                            }
                        }
                    ]
                };
            } else if (metricName.includes('丢包') || metricName.includes('丢包率') || metricName.includes('loss') || unit === '%') {
                return {
                    ...baseConfig,
                    yAxis: {
                        ...baseConfig.yAxis,
                        max: 100
                    },
                    series: [
                        {
                            ...baseConfig.series[0],
                            lineStyle: {
                                color: '#ee6666'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(238, 102, 102, 0.3)' },
                                    { offset: 1, color: 'rgba(238, 102, 102, 0.1)' }
                                ])
                            }
                        }
                    ]
                };
            } else if (metricName.includes('状态码') || metricName.includes('响应状态')) {
                return {
                    ...baseConfig,
                    series: [
                        {
                            ...baseConfig.series[0],
                            lineStyle: {
                                color: '#91cc75'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
                                    { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
                                ])
                            }
                        }
                    ]
                };
            } else {
                return {
                    ...baseConfig,
                    series: [
                        {
                            ...baseConfig.series[0],
                            lineStyle: {
                                color: '#fac858'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(250, 200, 88, 0.3)' },
                                    { offset: 1, color: 'rgba(250, 200, 88, 0.1)' }
                                ])
                            }
                        }
                    ]
                };
            }
        },
        generateMockChartData(type) {
            const times = [];
            const values = [];
            const now = dayjs();
            const [startTime] = this.timeRange;
            const start = dayjs(startTime);
            const end = dayjs(now);
            const duration = end.diff(start, 'minute');
            const intervals = Math.min(duration, 30);
            const interval = duration > 30 ? Math.ceil(duration / 30) : 1;

            for (let i = 0; i <= intervals; i++) {
                const time = start.add(i * interval, 'minute');
                times.push(time.format('YYYY-MM-DD HH:mm:00'));

                if (type === 'delay') {
                    values.push(Math.floor(Math.random() * 150) + 50);
                } else if (type === 'loss') {
                    values.push((Math.random() * 10).toFixed(1));
                }
            }

            return { times, values };
        },
        expandChart(item, endTime) {
            const timeEndStr = endTime;
            const isoStr = timeEndStr;
            const timeEnd = new Date(isoStr);
            const timeStart = new Date(timeEnd);
            timeStart.setMinutes(timeStart.getMinutes() - 15);
            const startTimeStr = formatDate(timeStart, 'YYYY-MM-dd HH:mm:ss');
            const endTimeStr = formatDate(timeEnd, 'YYYY-MM-dd HH:mm:ss');

            const param = {
                id: this.recordId,
                caseConfigId: item.caseConfigId,
                startTime: startTimeStr,
                endTime: endTimeStr
            };

            dialingMetric(param).then((res) => {
                if (res.code === 0 && Array.isArray(res.data)) {
                    const chartData = res.data.find(metric => metric.metricName === item.metricName);
                    if (chartData) {
                        this.expandedChartItem = chartData;
                        this.currentMetric = item.metricName;
                        this.modalVisible = true;
                        this.timeRangeModal = [startTimeStr, endTimeStr];
                        this.chartError = null;
                        this.chartNoDataModal = false;

                        this.$nextTick(() => {
                            this.renderCharts();
                        });
                    } else {
                        this.$message.warning(`未找到${item.metricName}的图表数据`);
                    }
                }
            });
        },
        handleModalCancel() {
            this.modalVisible = false;
            if (this.currentChart) {
                this.currentChart.dispose();
                this.currentChart = null;
            }
        },
        renderCharts() {
            console.log('进入renderCharts方法');
            this.chartLoading = true;
            this.chartError = null;
            this.chartNoDataModal = false;

            if (this.currentChart) {
                this.currentChart.dispose();
                this.currentChart = null;
            }

            console.log('时间范围是否有效:', this.isTimeRangeValid);
            console.log('expandedChartItem是否存在:', !!this.expandedChartItem);
            if (!this.isTimeRangeValid || !this.expandedChartItem) {
                this.chartLoading = false;
                return;
            }

            try {
                const metricValueList = this.expandedChartItem.metricValueList || [];
                console.log('指标数据列表:', metricValueList);
                
                // 检查数据是否为空
                if (metricValueList.length === 0) {
                    this.chartLoading = false;
                    this.chartNoDataModal = true;
                    return;
                }

                const chartConfigData = {
                    times: metricValueList.map(item => dayjs(item.datetime).format('YYYY-MM-DD HH:mm:ss')),
                    values: metricValueList.map(item => {
                        const value = item.valueFloat !== undefined ? item.valueFloat : item.value;
                        return typeof value === 'string' ? parseFloat(value) : value;
                    })
                };

                // 再次检查数据是否为空
                if (chartConfigData.times.length === 0 || chartConfigData.values.length === 0) {
                    this.chartLoading = false;
                    this.chartNoDataModal = true;
                    return;
                }

                const chartConfig = this.getChartConfig(this.currentMetric, chartConfigData);
                const dataLength = chartConfigData.times.length;
                let axisLabelInterval = 0;
                if (dataLength > 20) {
                  axisLabelInterval = Math.floor(dataLength / 10);
                } else if (dataLength > 10) {
                  axisLabelInterval = Math.floor(dataLength / 5);
                }

                const option = {
                    title: {
                        text: this.$t('common.currentChart'),
                        left: 'center',
                        textStyle: { fontSize: 14, fontWeight: 'normal' }
                    },
                    tooltip: chartConfig.tooltip,
                    grid: {
                        ...chartConfig.grid,
                        bottom: '15%',
                        top: '15%'
                    },
                    xAxis: {
                        ...chartConfig.xAxis,
                        axisLabel: {
                            interval: axisLabelInterval,
                            formatter: function (value) {
                                return dayjs(value).format('YYYY-MM-DD HH:mm');
                            },
                            rotate: 45
                        }
                    },
                    yAxis: chartConfig.yAxis,
                    dataZoom: [
                        { type: 'inside', start: 0, end: 100, zoomLock: false },
                        { type: 'slider', start: 0, end: 100, bottom: '5%', height: 15 }
                    ],
                    series: chartConfig.series
                };

                console.log('图表配置:', option);
                console.log('图表容器引用:', this.$refs.currentChartRef);
                if (this.$refs.currentChartRef) {
                    console.log('图表容器尺寸:', {
                        width: this.$refs.currentChartRef.clientWidth,
                        height: this.$refs.currentChartRef.clientHeight
                    });
                    this.currentChart = echarts.init(this.$refs.currentChartRef);
                    this.currentChart.showLoading({
                        text: '图表加载中...',
                        textStyle: { fontSize: 14 },
                        effect: 'spin'
                    });
                    this.currentChart.setOption(option);
                    this.currentChart.hideLoading();
                    console.log('图表渲染完成');
                } else {
                    console.error('图表容器引用为空，等待DOM更新后重试...');
                    this.$nextTick(() => {
                        console.log('重试渲染图表...');
                        this.renderCharts();
                    });
                }

            } catch (error) {
                console.error("弹窗图表渲染失败:", error);
                this.chartError = "图表数据加载失败，请稍后重试";
            } finally {
                this.chartLoading = false;
            }
        },
        async fetchChartData(item, timeRange = this.timeRange) {
            const id = this.recordId;
            const [startTime, endTime] = timeRange;

            if (!id || !startTime || !endTime || !item?.metricName) {
                this.$message.warning('图表数据请求参数不完整');
                return null;
            }

            try {
                const res = await dialingMetric({ id, startTime, endTime });
                if (res.code === 0 && Array.isArray(res.data)) {
                    const currentMetricData = res.data.find(metric => metric.metricName === item.metricName);
                    if (currentMetricData && Array.isArray(currentMetricData.metricValueList)) {
                        return currentMetricData.metricValueList.map(data => [
                            dayjs(data.datetime).valueOf(),
                            Number(data.value) || 0
                        ]).sort((a, b) => a[0] - b[0]);
                    } else {
                        return [];
                    }
                } else {
                    this.$message.warning(`获取${item.metricName}数据失败：${res.msg || '无有效数据'}`);
                    return [];
                }
            } catch (err) {
                console.error(`图表数据请求异常（${item.metricName}）:`, err);
                this.$message.error(`获取${item.metricName}图表数据失败`);
                return null;
            }
        },
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
        handleTimeChangeModal(values) {
            if (!values || values.length !== 2) return;

            let startTime, endTime;
            if (values[0] instanceof Date) {
                startTime = values[0];
                endTime = values[1];
            } else {
                startTime = new Date(values[0]);
                endTime = new Date(values[1]);
            }

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                this.$message.warning('时间格式无效');
                return;
            }

            const startTimeStr = formatDate(startTime, 'YYYY-MM-dd HH:mm:ss');
            const endTimeStr = formatDate(endTime, 'YYYY-MM-dd HH:mm:ss');
            this.timeRangeModal = [startTimeStr, endTimeStr];

            const param = {
                id: this.recordId,
                caseConfigId: this.expandedChartItem.caseConfigId,
                startTime: startTimeStr,
                endTime: endTimeStr
            };

            this.chartLoading = true;
            console.log('发起请求的参数:', param);
            dialingMetric(param).then((res) => {
                console.log('API返回的数据:', res);
                if (res.code === 0 && Array.isArray(res.data)) {
                    const chartData = res.data.find(metric => metric.metricName === this.currentMetric);
                    console.log('找到的图表数据:', chartData);
                    if (chartData) {
                        this.expandedChartItem = chartData;
                        this.chartError = null;
                        this.chartNoDataModal = false;
                        this.chartLoading = false;
                        console.log('更新后的expandedChartItem:', this.expandedChartItem);
                        console.log('当前时间范围:', this.timeRangeModal);
                        console.log('时间范围是否有效:', this.isTimeRangeValid);
                        console.log('更新后的chartLoading状态:', this.chartLoading);

                        this.$nextTick(() => {
                            console.log('准备渲染图表...');
                            this.renderCharts();
                        });
                    } else {
                        this.chartError = `未找到${this.currentMetric}的图表数据`;
                        this.chartLoading = false;
                    }
                } else {
                    this.chartError = '获取图表数据失败';
                    this.chartLoading = false;
                }
            }).catch((error) => {
                console.error('请求失败:', error);
                this.chartError = '获取图表数据失败';
                this.chartLoading = false;
            });
        },
        handleSearchModal(keyword) {
            this.searchKeywordModal = keyword;
        },
        handleManualRefresh() {
            this.time = formatDate(new Date(), 'YYYY-MM-dd HH:mm:ss');
            if (this.modalVisible && this.expandedChartItem) {
                this.renderCharts();
            }
        },
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },
        setShortcutTime(picker, timeDiff) {
            const end = new Date();
            const start = new Date(end.getTime() - timeDiff);
            picker.$emit('pick', [start, end]);
        }
    }
}
</script>

<style scoped lang="less">
::v-deep .ant-table-tbody>tr>td {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.alarm-history {
    padding: 20px;
    background: #fff;
    height: 89vh;
    min-width: 1280px;
    overflow-x: auto;
}

.search-card {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
}

.operation-buttons {
    display: flex;
    gap: 12px;
}

.severity-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.status-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.disposal-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.table-row-actions {
    display: flex;
    gap: 12px;
}

.table-row-actions a {
    color: #1890ff;
    transition: color 0.3s;
}

.table-row-actions a:hover {
    color: #40a9ff;
}

.pagination {
    padding: 16px;
    background: #fff;
    margin-left: auto;
    margin-top: 16px;
}

.ant-form-item {
    margin-bottom: 16px;
}

.ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
}

.ant-table-tbody>tr:hover>td {
    background: #f0f8ff !important;
}

.metric-name:hover {
    color: #096dd9;
    text-decoration: underline;
}

/deep/ .ant-table {
    .ant-table-thead>tr>th {
        background: #fafafa;
        font-weight: 600;
    }

    .ant-table-tbody>tr:hover>td {
        background: #e6f7ff;
    }
}

/deep/ .ant-pagination {
    margin-top: 16px;

    @media (max-width: 576px) {
        .ant-pagination-item,
        .ant-pagination-prev,
        .ant-pagination-next,
        .ant-pagination-jump-prev,
        .ant-pagination-jump-next {
            margin-bottom: 8px;
        }
    }
}

/deep/ .ant-table-thead>tr>th {
    background: #e6f0fb !important;
}

.pagination {
    text-align: right;
}

/* Tab切换样式 */
.tab-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.tab-header {
    display: flex;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 20px;
}

.tab-item {
    padding: 12px 24px;
    cursor: pointer;
    font-size: 16px;
    color: #666;
    position: relative;
    transition: all 0.3s;
}

.tab-item:hover {
    color: #1890ff;
}

.tab-item.active {
    color: #1890ff;
    font-weight: 600;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #1890ff;
}

.tab-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
}

/* 拨测详情样式 */
.dialing-detail {
    padding: 10px;
}

.detail-section {
    display: flex;
    margin-bottom: 16px;
    align-items: flex-start;
}

.detail-label {
    width: 120px;
    font-weight: 600;
    color: #333;
    margin-right: 16px;
    text-align: right;
    padding-top: 4px;
}

.detail-value {
    flex: 1;
    color: #666;
    word-break: break-word;
    line-height: 2.0;
}

.alerts-list {
  padding: 8px;
}

.chart-section {
    margin-bottom: 24px;
}

.chart-title {
    font-weight: 600;
    margin-bottom: 12px;
    color: #333;
}

.chart-content {
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 12px;
    background-color: #fafafa;
    position: relative;
    height: 220px;
    overflow: hidden;
}

.chart-header {
    display: flex;
    justify-content: space-between;
}

/* 暂无数据样式 */
.chart-no-data {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 1);
    z-index: 5;
}

.chart-no-data-modal {
    width: 100%;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
}

/* 图表加载和错误状态样式 */
.chart-loading,
.chart-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #666;
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 4px;
    z-index: 10;
}

.chart-loading .el-icon,
.chart-error .el-icon {
    font-size: 16px;
}

.chart-loading .el-icon {
    color: #1890ff;
    animation: rotate 1.5s linear infinite;
}

.chart-error .el-icon {
    color: #f56c6c;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* 弹窗图表容器样式 */
.charts-container {
    width: 100%;
    height: 100%;
    padding: 10px;
}

.chart-wrapper {
    margin-bottom: 20px;
    position: relative;
}

.chart-inner {
    width: 100%;
    height: 400px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background-color: #fff;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f5f5f5;
}

.top-list-container {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  box-sizing: border-box;
}

.no-text {
    color: #999;
    font-size: 14px;
}
</style>