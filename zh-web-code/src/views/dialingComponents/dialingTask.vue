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
                    <a-col :span="6">
                        <a-form-item >
                            <a-select v-model="searchForm.taskStatus" :placeholder="$t('common.pleaseSelect')" allowClear>
                                <a-select-option v-for="field in taskStatusOptions" :key="field.value"
                                    :value="field.value">
                                    {{ field.label }}
                                </a-select-option>
                            </a-select>
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

        <!-- 批量操作 + 导出 + 设置 -->
        <!-- 操作按钮区域 -->
        <div class="operation-card">
            <div class="operation-bar">
                <div class="left-operations">
                    <a-button type="primary" ghost @click="taskCreate">
                        <a-icon type="plus" />{{ $t('common.addDialing') }}
                    </a-button>

                </div>


            </div>
        </div>

        <!-- 告警表格 -->
        <a-table style="margin-top: 10px;" rowKey="id" class="custom-table" :columns="columns" :data-source="tableData"
            :pagination="false" :loading="loading" bordered size="middle"
            :locale="{
              emptyText: $t('common.noData')
            }"
        >
            <!-- 名称 -->
            <template slot="name" slot-scope="text, record">
                <a-tooltip placement="top" :title="text">
                    <span class="ellipsis-text link-text" @click="selectShow(record)">{{ text }}</span>
                </a-tooltip>
            </template>
            <!-- 拨测类型 -->
            <template slot="taskType" slot-scope="text">
                <span>{{ text === 'HTTP' ? this.$t('common.interfaceDialing') : text === 'PORT' ? this.$t('common.portDialing') : text === 'PING' ? this.$t('common.pingDialing') : text
                }}</span>
                <!-- <span>{{ text }}</span> -->
            </template>
            <!-- 是否启用 -->
            <template slot="taskStatus" slot-scope="text, record">
                <a-switch :checked="text === 'ENABLE'" @change="(val) => taskStatusChange(record, val, 'taskStatus')" />
            </template>
            <!-- 操作列 -->
            <template slot="operation" slot-scope="text, record">
                <div class="table-row-actions">
                    <a v-if="record.taskStatus != 'ENABLE'" @click="editInspection(record)">{{ $t('common.edit') }}</a>
                    <a v-else class="disabled-link">{{ $t('common.edit') }}</a>
                    <a @click="fzInspection(record)">{{ $t('common.exceptionDialingResult') }}</a>
                    <a v-if="record.taskStatus != 'ENABLE'" @click="handleDelete(record)">{{ $t('common.delete') }}</a>
                   <a v-else class="disabled-link">{{ $t('common.delete') }}</a>
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
        <!-- 设备创建/编辑抽屉 -->
        <tack-form :visible="formVisible" :isEdit="isEdit" :isView="isView" :mockDatas="mockData" @close="handleClose"
            @fetchData="handleSearch" />

        <el-dialog :title="$t('common.copyTemplate')" :visible.sync="visibleFz" v-if="visibleFz" :loading="loading" width="600px">
            <el-form ref="mbForm" :model="mbForm" :rules="rulesMb" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="taskName" :label="$t('common.templateName')">
                            <el-input type="text" v-model.trim="mbForm.taskName" maxlength="40" :placeholder="$t('common.pleaseInputTemplateName')">
                            </el-input>
                        </el-form-item>
                    </el-col>

                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addMbSubmit('mbForm')">{{ $t('common.confirm') }}</el-button>
                <el-button @click="visibleFz = false">{{ $t('common.cancel') }}</el-button>
            </div>
        </el-dialog>



    </div>
</template>

<script>
import moment from 'moment'
import tackForm from "./components/tackForm.vue";
import {
    getAssetModelPage,
} from "@/api/resource";
import {
    dialingPageList,
    dialingTaskDelete,
    triggerStatus,
    copyTemplate
} from "@/api/dialing";
import { nodeInfo } from '@/utils/assetData'
export default {
    name: 'dialingTask',
    components: { tackForm },
    props: {

    },
    data() {
        return {
            // 新增/编辑任务弹窗
            isEdit: false,
            // 详情模式
            isView: false,
            inspectionId: null,
            // 新增/编辑任务弹窗可见性
            formVisible: false,
            nodeInfo: nodeInfo,
            formDatail: {},
            modelList: [],
            assertList: [],
            selectName: '',
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
            // 查询表单参数
            searchForm: {
                taskName: '',
                taskCategory: undefined,
                taskStatus: undefined
            },

            severityMap: {
                1: '预警',
                2: '普通',
                3: '严重',
                4: '紧急',

            },
            // 颜色映射
            severityColorMap: {
                5: 'red',
                4: 'red',
                3: 'volcano',
                2: 'orange',
                1: 'blue'
            },
            statusColorMap: {
                1: 'green',
                0: 'red',
            },

            // 表格数据
            tableData: [],
            loading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0,
            visibleFz: false, // 模态框显隐
            editForm: {
                disposalSuggestion: ''
            },
            mbForm: {
                taskName: '',
                id: ''
            }, // 复制
            rulesMb: {
                taskName: { required: true, message: this.$t('common.pleaseInputTemplateName'), trigger: "blur" },

            },
            templateId: '',
            isShow: false,
            mockData: {}
        }
    },
    computed: {
        // 表格列配置
        columns() {
            return [
                {
                    title: this.$t('common.dialingName'),
                    dataIndex: 'taskName',
                    key: 'taskName',
                    width: '20%',
                    scopedSlots: { customRender: 'name' }
                },
                {
                    title: this.$t('common.dialingType'),
                    dataIndex: 'taskType',
                    key: 'taskType',
                    width: '10%',
                    customRender: (text) => {
                        return text === 'HTTP' ? this.$t('common.interfaceDialing') : text === 'TCP' ? this.$t('common.portDialing') : text === 'UDP' ? this.$t('common.portDialing') : text === 'PING' ? this.$t('common.pingDialing') : text;
                    }
                },

                {
                    title: this.$t('common.alarmTime'),
                    dataIndex: 'alarmDuration',
                    key: 'alarmDuration',
                    width: '12%'
                },
                {
                    title: this.$t('common.createTime'),
                    dataIndex: 'createTime',
                    key: 'createTime',
                    width: '10%',
                    customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'
                },
                {
                    title: this.$t('common.enabled'),
                    dataIndex: 'taskStatus',
                    key: 'taskStatus',
                    width: '10%',
                    scopedSlots: { customRender: 'taskStatus' }
                },
                {
                    title: this.$t('common.operation'),
                    key: 'operation',
                    width: '15%',
                    scopedSlots: { customRender: 'operation' }
                }
            ]
        },
        // 任务类型选项（国际化）
        taskTypeOptions() {
            return [
                { value: 'HTTP', label: this.$t('common.interfaceDialing') },
                { value: 'PORT', label: this.$t('common.portDialing') },
                { value: 'PING', label: this.$t('common.pingDialing') }
            ];
        },
        // 任务状态选项（国际化）
        taskStatusOptions() {
            return [
                { value: 'ENABLE', label: this.$t('common.on') },
                { value: 'DISABLE', label: this.$t('common.off') }
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
        severityMap() {
            return {
                '1': this.$t('common.warning'),
                '2': this.$t('common.normal'),
                '3': this.$t('common.critical'),
                '4': this.$t('common.urgent')
            };
        },
        // 计算默认值：前一个月 00:00:00 到现在


    },
    mounted() {
        console.log(this.nodeInfo, 'nodeInfo');

        this.fetchData();
        this.getModelList()
    },
    methods: {
        //启用状态变更
        taskStatusChange(record, val) {
            console.log(record, val);
            // this.handleSearch();
            if (val) {
                this.loading = true;
                triggerStatus({ id: record.id, taskStatus: 'ENABLE' }).then((res) => {
                    if (res.data) {
                        this.$message.success(this.$t('common.turnOnSuccess'))
                        this.handleSearch();
                    }
                }).finally(() => {this.loading = false;})
            } else {
                this.loading = true;
                triggerStatus({ id: record.id, taskStatus: 'DISABLE' }).then((res) => {
                    if (res.data) {
                        this.$message.success(this.$t('common.turnOffSuccess'))
                        this.handleSearch();
                    }
                }).finally(() => {this.loading = false;})
            }
        },
        //创建打开
        taskCreate() {
            this.isEdit = false;
            this.formVisible = true;
        },
        //编辑打开
        editInspection(mockData) {
            this.mockData = mockData;
            console.log(JSON.parse(this.mockData.taskParams), 'this.mockData');

            this.isEdit = true;
            this.formVisible = true;
        },
        filterOption(input, option) {
            console.log('111111', option);
            return option.label?.toLowerCase().includes(input.toLowerCase());
        },
        defaultDateRange() {
            const end = moment(); // 当前时间
            const start = moment().subtract(1, 'months').startOf('day'); // 前一个月的第一天 00:00:00

            return [start, end];
        },


        //详情打开
        selectShow(mockData) {
            // this.selectName = row.name
            // this.selectRow = row
            this.mockData = mockData;
            console.log(JSON.parse(this.mockData.taskParams), 'this.mockData');

            this.isView = true;
            this.formVisible = true;

        },
        // 关闭弹窗时重置状态
        handleClose() {
            this.formVisible = false;
            this.isEdit = false;
            this.isView = false;
        },
        selectAssert(row) {
            this.zhiBVisible = true;
            this.templateId = row.id;
            this.isShow = row.strategyCount == 0 ? false : true;
            console.log(this.templateId);


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
        // 模拟获取数据
        fetchData() {
            this.loading = true;
            let params = {
                pageSize: this.pageSize,
                pageNo: this.currentPage,
                taskName: this.searchForm.taskName,
                taskCategory: this.searchForm.taskCategory,
                taskStatus: this.searchForm.taskStatus,
                // "templateName": this.searchForm.templateName || undefined,
                // "resourceType": this.searchForm.resourceType || undefined,//"networkdevice",

            }
            dialingPageList(params).then((res) => {
                this.tableData = res.data && res.data.list;
                this.total = (res.data && res.data.total) || 0;
                this.loading = false
            });
        },
        // 查询
        handleSearch() {
            this.currentPage = 1;
            this.fetchData();
        },
        // 重置
        handleReset() {
            this.searchForm = {
                name: '',
            };
            this.handleSearch();
        },

        // 查看异常结果
        fzInspection(record) {
            this.$router.push({ path: '/faultManage/dialingComponents/dialingLog', query: { taskName: record.taskName, taskId: record.id } });
        },
        //复制确认
        addMbSubmit(val) {
            this.$refs[val].validate((valid) => {
                if (valid) {
                    let params = {
                        id: this.mbForm.id,
                        taskName: this.mbForm.taskName
                    }
                    copyTemplate(params).then((res) => {
                        if (res.data) {
                            this.visibleFz = false;
                            this.$message.success(this.$t('common.copySuccess'));
                            this.handleSearch();
                        }
                    })
                }
            })

        },
        // 删除
        handleDelete(record) {
            if (!record) {
                console.error(this.$t('common.recordDoesNotExist'));
                this.$message.error(this.$t('common.recordDoesNotExist'));
                return;
            }
            const id = record.id || record;
            console.log(id, 'id');


this.$confirm(this.$t('common.confirmDeleteDialing'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {  // 箭头函数
                    dialingTaskDelete({ id: id }).then((res) => {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        this.handleSearch();  // 此时 this 指向组件实例
                    });
                })
                .catch(() => { });
        },
        // 分页切换
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchData();
        },
        // 每页条数变化
        onShowSizeChange(current, pageSize) {
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.fetchData();
        },


        getModelList() {
            getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
                this.modelList = res.data.list.map(item => {
                    return {
                        label: item.modelName,
                        value: item.modelCode
                    }
                }) || [];

            });
        },
    }
}
</script>

<style scoped lang="less">
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
    /* border-radius: 8px; */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
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
    // width: 360px;
    /* border-radius: 8px; */
    margin-top: 16px;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
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

.question-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #333;
    color: #e8e8e8;
    font-size: 12px;
    cursor: pointer;
}

.disabled-link {
  color: #ccc !important;
  cursor: not-allowed;
  text-decoration: none;
}
</style>
