<template>
    <div class="alarm-history">
        <!-- 查询表单 -->
        <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
            <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
                <a-row :gutter="16">
                    <!-- 名称 -->
                    <a-col :span="6">
                        <a-form-item >
                            <a-input v-model="searchForm.templateName" :placeholder="$t('common.pleaseInputStrategyName')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>

                    <!-- 资源模型（多选） -->
                    <a-col :span="6">
                        <a-form-item >
                            <a-select v-model="searchForm.status" :placeholder="$t('common.pleaseSelectStatus')" allowClear style="width: 100%;">
                                <a-select-option v-for="field in statusList" :key="field.value" :value="field.value">
                                    {{ field.label }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>

                    <!-- 操作按钮 -->
                    <a-col :span="6" style="display: flex; align-items: center;margin-top: 3px;">
                        <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
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
                    <a-button type="primary" ghost @click="templateCreate">
                        <a-icon type="plus" />{{ $t('common.create') }}
                    </a-button>

                </div>


            </div>
        </div>

        <!-- 告警表格 -->
        <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
            :loading="loading" bordered size="middle"
            :locale="{
              emptyText: $t('common.noData')
            }"
        >
            <template slot="name" slot-scope="text,record">
                <a-tooltip placement="top" :title="text">
                    <span class="ellipsis-text link-text" @click="viewInspection(record)">{{ text }}</span>
                </a-tooltip>

            </template>
            <template slot="templateName" slot-scope="text">
                <a-tooltip placement="top" :title="text">
                    <span>{{ text }}</span>
                </a-tooltip>

            </template>
            <!-- 告警级别列：Scoped Slot -->
            <template slot="handleType" slot-scope="text">
                <!-- <a-tag class="severity-tag" color="#108ee9"> -->
                {{ text == 'SINGLE' ? $t('common.single') : $t('common.periodic') }}
                <!-- </a-tag> -->
            </template>
            <!-- 通知开关：Scoped Slot -->
            <template slot="isNotice" slot-scope="text, record">
                <a-switch :checked="text === true" @change="(val) => isNoticeSwitchChange(record, val, 'isNotice')" />
            </template>
            <!-- 状态列：Scoped Slot -->
            <template slot="status" slot-scope="text, record">
                <a-switch :checked="text === 1" @change="(val) => statusSwitchChange(record, val, 'status')" />
            </template>


            <!-- 操作列：Scoped Slot -->
            <template slot="operation" slot-scope="text, record">
                <div class="table-row-actions">
                    <a @click="startGots(record.id)">{{ $t('common.execute') }}</a>
                    <a @click="recover(record.id)">{{ $t('common.copy') }}</a>
                    <a @click="editInspection(record.id)" v-if="record.status == 0">{{ $t('common.edit') }}</a>
                    <a v-if="record.status != 0" style="color: #ccc;">{{ $t('common.edit') }}</a>
                    <a @click="handleDelete(record.id)" v-if="record.status == 0">{{ $t('common.delete') }}</a>
                    <a v-if="record.status != 0" style="color: #ccc;">{{ $t('common.delete') }}</a>
                </div>
                <!-- <a-button   type="default" >
                  恢复
                </a-button> -->
            </template>
        </a-table>

        <!-- 分页 -->
        <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
            :show-total="total => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
            @change="handlePageChange" @showSizeChange="onShowSizeChange">
            <template slot="buildOptionText" slot-scope="props">
                <span>{{ props.value }}{{ $t('common.itemsPerPage') }}</span>

            </template>
        </a-pagination>
        <!-- 设备创建/编辑抽屉 -->
        <inspection-form :visible="formVisible" @close="formVisible = false" @fetchData="handleSearch" />


        <a-drawer :title="selectName" width="777px" placement="right" :closable="true" :visible="nameVisible"
            :mask-closable="false" @close="onClose">
            <!-- <alarmHistoryDetail :selectRow="selectRow"></alarmHistoryDetail> -->
        </a-drawer>
        <!-- 设备详情抽屉 -->
        <a-drawer v-if="isDestory" :title="selectName1" width="1080px" placement="right" :closable="true"
            :visible="nameVisible1" :mask-closable="false" @close="onClose1">
            <deviceDetail :selectRow="selectRow1" :assertInfo="assertInfo1"></deviceDetail>
        </a-drawer>
        <edit-modal ref="editModal" :rowData="rowData" :editId="editId" :isView="isView"
            @refreshLists="fetchData"></edit-modal>
        <el-dialog :title="$t('common.copyStrategy')" :visible.sync="visibleFz" v-if="visibleFz" :loading="loading" width="600px">
            <el-form ref="clForm" :model="clForm" :rules="rulesMb" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="newName" :label="$t('common.strategyName')">
                            <el-input type="text" v-model.trim="clForm.newName" maxlength="40" :placeholder="$t('common.pleaseInputStrategyName')">
                            </el-input>
                        </el-form-item>
                    </el-col>

                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addClSubmit('clForm')">{{ $t('common.confirm') }}</el-button>
                <el-button @click="visibleFz = false">{{ $t('common.cancel') }}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="$t('common.notificationConfiguration')" :visible.sync="visibleTz" v-if="visibleTz" :loading="loading" width="600px">
            <el-form ref="tzForm" :model="tzForm" :rules="rulesTz" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="isNotice" :label="$t('common.whetherToNotify')">
                            <el-switch v-model="tzForm.isNotice" active-color="#409EFF" inactive-color="#cccccc"
                                :active-value="true" :inactive-value="false" disabled>
                            </el-switch>
                        </el-form-item>
                    </el-col>
                    <el-col :span="22" v-if="tzForm.isNotice">
                        <el-form-item prop="noticeObjIdList" :label="$t('common.notificationObject')">
                            <div style="display: flex;">
                                <el-select style="width: 356px" v-model="tzForm.noticeObjIdList" multiple filterable
                                    :placeholder="$t('common.pleaseSelectNotificationObject')">
                                    <el-option v-for="item in userOptions" :key="item.value" :label="item.label"
                                        :value="item.value + ''"></el-option>
                                </el-select>
                                <a-button type="primary" style="margin-left: 10px;" ghost
                                    @click="handleAdd">{{ $t('common.configureNotificationObject') }}</a-button>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addTzSubmit('tzForm')">{{ $t('common.confirm') }}</el-button>
                <el-button @click="visibleTz = false">{{ $t('common.cancel') }}</el-button>
            </div>
        </el-dialog>
        <!-- 配置通知对象弹窗 -->
        <obj-modal ref="objModal" :rowData="{}" :isShowTab="isShowTab" @refreshList="getUserOptions"
            :visible="showObjModal" @close="showObjModal = false"></obj-modal>
    </div>
</template>

<script>
import moment from 'moment'
// import alarmHistoryDetail from './alarmHistoryDetail.vue'
import { getAlarmHistory, recoverApi } from "@/api/monitor/task";
import inspectionForm from "./components/inspectionForm.vue";
import objModal from '../noticeCenter/ruleList/components/objModal.vue'
import editModal from './components/strategyModal.vue'
import {
    getAssetModelPage,
} from "@/api/resource";
import {
    strategyList,
    strategyDelete,
    copyStrategy,
    enableInspection,
    closeInspection,
    noticeUpdate,
    startGot
} from "@/api/inspection";
import { getNotificationGroup } from "@/api/notice/notice";
import deviceDetail from '@/views/faultManage/networkDevice/components/deviceDetail'
export default {
    name: 'AlarmHistory',
    // alarmHistoryDetail
    components: { deviceDetail, inspectionForm, editModal, objModal },
    props: {

    },
    data() {
        return {
            rowData: {},
            isView: false,
            formVisible: false,
            visibleFz: false,
            showObjModal: false,
            clForm: {
                newName: '',
                id: ''
            }, // 复制
            rulesMb: {
                newName: { required: true, message: this.$t('common.pleaseInputStrategyName'), trigger: "blur" },

            },
            visibleTz: false,
            tzForm: {
                id: '',
                isNotice: true,
                noticeObjIdList: []
            },
            userOptions: [],
            modelList: [],
            assertList: [],
            statusList: [
                { label: this.$t('common.on'), value: '1' },
                { label: this.$t('common.off'), value: '0' },
            ],

            selectName: '',
            nameVisible: false,
            selectRow: {},
            selectName1: '',
            nameVisible1: false,
            selectRow1: {},
            assertInfo1: {
                modelId: undefined,
                assetTypeId: undefined,
                modelCode: undefined,
            },
            isDestory: true,
            // 查询表单参数
            searchForm: {
                name: '',
                resourceName: '',
                status: undefined,
            },

            // 表格数据
            tableData: [],
            loading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0,
            visible: false, // 模态框显隐
            editForm: {
                disposalSuggestion: ''
            },
            currentEditRecord: null, // 当前编辑的告警记录
            editId: null,
            rulesTz: {},
            isShowTab: ''
        }
    },
    computed: {
        // 表格列配置
        columns() {
            return [
                {
                    title: this.$t('common.strategyName'),
                    dataIndex: 'name',
                    key: 'name',
                    width: '20%',
                    scopedSlots: { customRender: 'name' }
                },
                {
                    title: this.$t('common.inspectionTemplate'),
                    dataIndex: 'templateName',
                    key: 'templateName',
                    width: '10%',
                    scopedSlots: { customRender: 'templateName' }
                },
                {
                    title: this.$t('common.executionFrequency'),
                    dataIndex: 'handleType',
                    key: 'handleType',
                    width: '12%',
                    scopedSlots: { customRender: 'handleType' }


                },

                {
                    title: this.$t('common.lastExecutionTime'),
                    // dataIndex: 'triggerLastTime',
                    dataIndex: 'lastHandleTime',
                    key: 'lastHandleTime',
                    width: '15%',
                    customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'
                },
                {
                    title: this.$t('common.nextExecutionTime'),
                    dataIndex: 'triggerNextTime',
                    key: 'triggerNextTime',
                    width: '15%',
                    customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '--'
                },
                {
                    title: this.$t('common.notificationSwitch'),
                    dataIndex: 'isNotice',
                    key: 'isNotice',
                    width: '10%',
                    scopedSlots: { customRender: 'isNotice' }

                },
                {
                    title: this.$t('common.enabledStatus'),
                    dataIndex: 'status',
                    key: 'status',
                    width: '10%',
                    scopedSlots: { customRender: 'status' }

                },

                {
                    title: this.$t('common.operation'),
                    key: 'operation',
                    width: '10%',
                    scopedSlots: { customRender: 'operation' }
                }
            ]
        },
        // 计算默认值：前一个月 00:00:00 到现在


    },
    mounted() {
        console.log(this.nodeInfo, 'nodeInfo');

        this.fetchData();
        this.getModelList()
    },
    methods: {
        getUserOptions() {
            let params = {
                pageSize: 999,
                pageNo: 1,

            }
            getNotificationGroup(params).then((res) => {
                let userOptions = res.data && res.data.list;
                // this.userOptions = userOptions.map(item => {
                //     return {
                //         label: item.groupName,
                //         value: item.id
                //     }
                // })
                this.userOptions = userOptions
                    // 过滤掉channelString包含"szh"（电信集约化服务台类型）的数据
                    .filter(item => {
                        try {
                            const channelArray = JSON.parse(item.channelString);
                            return !channelArray.includes("szh") && !channelArray.includes("http");
                        } catch (e) {
                            // 如果解析失败，默认保留该数据
                            return true;
                        }
                    })
                    .map(item => {
                        return {
                            label: item.groupName,
                            value: item.id
                        }
                    })
            });
        },
        handleAdd() {
            this.isShowTab = 'xj';
            this.$refs.objModal.showModal = true;
        },
        //策略通知配置确认
        addTzSubmit(val) {
            this.$refs[val].validate((valid) => {
                if (valid) {
                    let params = {
                        id: this.tzForm.id,
                        isNotice: this.tzForm.isNotice,
                        noticeObjIdList: this.tzForm.noticeObjIdList
                    }
                    noticeUpdate(params).then((res) => {
                        if (res.data) {

                            this.visibleTz = false;
                            this.$message.success(this.$t('common.configurationSuccessful'));
                            this.handleSearch();
                        }
                    })
                }
            })

        },
        isNoticeSwitchChange(record, val, field = 'status') {
            console.log(`更新记录${field}:`, record, '新状态:', val);
            if (val) {
                this.tzForm.id = record.id;
                this.tzForm.noticeObjIdList = [];
                this.visibleTz = true;
                this.getUserOptions();
            } else {
                this.$modal
                    .confirm(this.$t('common.areYouSureYouWantToCloseStrategyNotification'))
                    .then(() => {  // 箭头函数
                        let params = {
                            id: record.id,
                            isNotice: false
                        }
                        noticeUpdate(params).then((res) => {
                            this.$message.success(this.$t('common.closeSuccess'));
                            this.handleSearch();  // 此时 this 指向组件实例
                        });
                    })
                    .catch(() => { });
                // noticeUpdate({ id: record.id }).then((res) => {
                //     if (res.data) {
                //         this.$message.success('关闭成功')
                //         this.handleSearch();
                //     }
                // })
            }
        },
        //启用状态变更
        statusSwitchChange(record, val) {
            console.log(record, val);

            if (val) {
                enableInspection({ id: record.id }).then((res) => {
                    if (res.data) {
                        this.$message.success(this.$t('common.enableSuccess'))
                        this.handleSearch();
                    }
                })
            } else {
                closeInspection({ id: record.id }).then((res) => {
                    if (res.data) {
                        this.$message.success(this.$t('common.closeSuccess'))
                        this.handleSearch();
                    }
                })
            }
        },
        //创建打开
        templateCreate() {
            this.rowData = {};
            this.editId = null;
            this.isView = false;
            this.$refs.editModal.showModal = true;
        },
        filterOption(input, option) {
            console.log('111111', option);
            return option.label?.toLowerCase().includes(input.toLowerCase());
        },
        //编辑
        editInspection(val) {
            console.log(val, 'val');

            // 编辑状态
            this.editId = val;
            this.isView = false; // 编辑模式
            this.opt = '编辑';
            this.$refs.editModal.showModal = true;
        },
        //详情
        viewInspection(row) {
            // 详情状态
            this.rowData = row;
            this.editId = row.id;
            this.isView = true; // 详情模式
            this.opt = '详情';
            this.$refs.editModal.showModal = true;
        },
        defaultDateRange() {
            const end = moment(); // 当前时间
            const start = moment().subtract(1, 'months').startOf('day'); // 前一个月的第一天 00:00:00

            return [start, end];
        },

        // 复制
        recover(record) {
            this.clForm.id = record;
            this.clForm.newName = '';
            this.visibleFz = true;

        },
        //复制策略确认
        addClSubmit(val) {
            this.$refs[val].validate((valid) => {
                if (valid) {
                    let params = {
                        id: this.clForm.id,
                        newName: this.clForm.newName
                    }
                    copyStrategy(params).then((res) => {
                        if (res.data) {

                            this.visibleFz = false;
                            this.$message.success(this.$t('common.copySuccess'));
                            this.handleSearch();
                        }
                    })
                }
            })

        },
        onClose() {
            this.nameVisible = false
        },
        selectShow(row) {
            this.nameVisible = true
            this.selectName = row.name
            this.selectRow = row
        },

        onClose1() {
            this.nameVisible1 = false;

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
                name: this.searchForm.templateName || undefined,
                "resourceName": this.searchForm.resourceName || undefined,
                "status": this.searchForm.status || undefined,

            }
            strategyList(params).then((res) => {
                this.tableData = res.data && res.data.list;
                this.tableData = this.tableData.map((item) => {
                    return {
                        ...item,
                        templateName: item.inspectionList ? item.inspectionList.map(val => val.inspectionName).join(';') : ''
                        // nameStr = inspectionArr.map(item => item.inspectionName).join(';');
                    }
                })
                console.log(this.tableData);

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
                status: undefined
            };
            this.handleSearch();
        },

        // 单次执行
        startGots(id) {
            console.log(id);

            this.$modal
                this.$confirm(this.$t('common.confirmExecuteCurrentStrategy'), this.$t('common.tip'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {  // 箭头函数
                    startGot(id).then((res) => {
                        if (res) {
                            this.$message.success(this.$t('common.executeSuccess'));
                            this.handleSearch();  // 此时 this 指向组件实例
                        }

                    });
                })
                .catch(() => { });
        },
        // 删除
        handleDelete(id) {
            this.$modal
                this.$confirm(this.$t('common.confirmDeleteTemplate'), this.$t('common.tip'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {  // 箭头函数
                    strategyDelete(id).then((res) => {
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
</style>