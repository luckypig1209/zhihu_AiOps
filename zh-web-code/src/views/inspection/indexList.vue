<template>
    <div class="alarm-history">
        <!-- 查询表单 -->
        <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
            <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
                <a-row :gutter="16">
                    <!-- 名称 -->
                    <a-col :span="6">
                        <a-form-item>
                            <a-input v-model="searchForm.templateName" :placeholder="$t('common.pleaseInputTemplateName')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>

                    <!-- 资源模型（多选） -->
                    <a-col :span="6">
                        <a-form-item>
                            <a-select v-model="searchForm.resourceType" :placeholder="$t('common.pleaseSelectResourceModel')" allowClear>
                                <a-select-option v-for="field in nodeInfo" :key="field.resourceType" :value="field.resourceType">
                                    {{ field.resourceName }}
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
        <a-table style="margin-top: 10px;" rowKey="id" class="custom-table" :columns="columns" :data-source="tableData"
            :pagination="false" :loading="loading" bordered size="middle"
            :locale="{
              emptyText: $t('common.noData')
            }"
        >
            <template slot="name" slot-scope="text,record">
                <a-tooltip placement="top" :title="text">
                    <span class="ellipsis-text link-text" @click="selectShow(record)">{{ text }}</span>
                </a-tooltip>

            </template>
            <template slot="indicatorCount" slot-scope="text,record">
                <a-tooltip placement="top" :title="text">
                    <span class="ellipsis-text link-text" @click="selectAssert(record)">{{ text }}</span>
                </a-tooltip>

            </template>


            <!-- 状态列：Scoped Slot -->
            <template slot="status" slot-scope="text">
                <a-tag class="status-tag" :color="text == 0 ? 'red' : 'green'">
                    {{ text == 0 ? $t('common.notRecovered') : $t('common.recovered') }}
                </a-tag>
            </template>
            <!-- 关联策略数 -->
            <template slot="abnormalSeverityHeader" slot-scope="column">
                <span class="header-with-tooltip">
                    {{ $t('common.associatedStrategyCount') }}
                    <a-tooltip placement="top">
                        <template slot="title">
                            <div>
                                <span>{{ $t('common.numberOfInspectionStrategiesUsingThisTemplate') }}</span>

                            </div>
                        </template>
                        <span class="question-icon">?</span>
                    </a-tooltip>
                </span>
            </template>
            <!-- 关联策略数：Scoped Slot -->
            <template slot="strategyCount" slot-scope="text">
                <span>{{ text }}</span>
            </template>


            <!-- 操作列：Scoped Slot -->
            <template slot="operation" slot-scope="text, record">
                <div class="table-row-actions">

                    <a @click="fzInspection(record.id)">{{ $t('common.copy') }}</a>
                    <a @click="editInspection(record.id)" v-if="record.strategyCount == 0">{{ $t('common.edit') }}</a>
                    <a v-if="record.strategyCount > 0" style="color: #ccc;">{{ $t('common.edit') }}</a>
                    <a @click="handleDelete(record.id)" v-if="record.strategyCount == 0">{{ $t('common.delete') }}</a>
                    <a v-if="record.strategyCount > 0" style="color: #ccc;">{{ $t('common.delete') }}</a>
                </div>
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
        <inspection-form :visible="formVisible" :isEdit="isEdit" :inspectionId="inspectionId"
            @close="formVisible = false" @fetchData="handleSearch" @openMetricModal="handleOpenMetricModal" />

        <el-dialog :title="$t('common.copyTemplate')" :visible.sync="visibleFz" v-if="visibleFz" :loading="loading" width="600px">
            <el-form ref="mbForm" :model="mbForm" :rules="rulesMb" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="templateName" :label="$t('common.templateName')">
                            <el-input type="text" v-model.trim="mbForm.templateName" maxlength="40"
                                :placeholder="$t('common.pleaseInputTemplateName')">
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

        <a-drawer :title="$t('common.templateDetail')" width="666px" placement="right" :closable="true" :visible="nameVisible"
            :mask-closable="false" @close="onClose">
            <el-form ref="assetForm" :model="formDatail" label-width="120px" class="asset-form">

                <el-form-item prop="name">
                    <template #label>
                        <span>{{ $t('common.templateName') }}</span>
                    </template>
                    <div>
                        <el-input v-model="formDatail.templateName" disabled :placeholder="$t('common.pleaseInputTemplateName')" clearable
                            style="width: 100%" />
                    </div>
                </el-form-item>
                <el-form-item prop="deviceType">
                    <template #label>
                        <span>{{ $t('common.applicableDeviceType') }}</span>
                    </template>
                    <div style="display: flex; gap: 10px;">
                        <el-input v-model="formDatail.resourceName" disabled :placeholder="$t('common.pleaseInputTemplateName')" clearable
                            style="width: 100%" />
                        <el-input v-model="formDatail.deviceName" disabled :placeholder="$t('common.pleaseInputTemplateName')" clearable
                            style="width: 100%" />
                    </div>
                </el-form-item>
                <el-form-item>
                    <template #label>
                        <span>{{ $t('common.description') }}</span>
                    </template>
                    <div>
                        <!-- 文本输入（TEXT/STRING） -->
                        <el-input v-model="formDatail.description" type="textarea" :rows="4" readonly :placeholder="$t('common.pleaseInput')"
                            clearable style="width: 100%" />


                    </div>

                </el-form-item>

            </el-form>
        </a-drawer>
        <!-- 指标抽屉 -->
        <a-drawer v-if="isDestory" :title="$t('common.metricConfiguration')" width="880px" placement="right" :closable="true" :visible="zhiBVisible"
            :mask-closable="false" @close="onClose1">
            <zhibiaoDrawer :visible="zhiBVisible" :templateId="templateId" :isShow="isShow" @close="onClose1">
            </zhibiaoDrawer>
        </a-drawer>
    </div>
</template>

<script>
import moment from 'moment'
import inspectionForm from "./components/inspectionForm.vue";
import zhibiaoDrawer from "./components/zhibiaoDrawer.vue";
import { loadAssetTree } from '@/utils/assetData';
import {
    getAssetModelPage,
} from "@/api/resource";
import {
    inspectionList,
    inspectionDelete,
    getInspectionDatail,
    copyTemplate
} from "@/api/inspection";
import { nodeInfo } from '@/utils/assetData'
export default {
    name: 'AlarmHistory',
    components: { inspectionForm, zhibiaoDrawer },
    props: {

    },
    data() {
        return {
            isEdit: false,
            inspectionId: null,
            formVisible: false,
            nodeInfo: nodeInfo,
            formDatail: {},
            modelList: [],
            assertList: [],
            severityList: [
                { label: this.$t('common.warning'), value: '1' },
                { label: this.$t('common.normal'), value: '2' },
                { label: this.$t('common.critical'), value: '3' },
                { label: this.$t('common.emergency'), value: '4' },
            ],
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
            // 查询表单参数
            searchForm: {
                templateName: '',
                resourceType: undefined
            },
            // 下拉选项
            severityOptions: [
                { value: 0, label: this.$t('common.notRecovered') },
                { value: 1, label: this.$t('common.recovered') },

            ],
            statusOptions: [
                { value: '已恢复', label: this.$t('common.recovered') },
                { value: '未恢复', label: this.$t('common.notRecovered') },
                { value: '处理中', label: this.$t('common.processing') }
            ],

            severityMap: {
                1: this.$t('common.warning'),
                2: this.$t('common.normal'),
                3: this.$t('common.critical'),
                4: this.$t('common.emergency'),

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
                templateName: '',
                id: ''
            }, // 复制
            rulesMb: {
                templateName: { required: true, message: this.$t('common.pleaseInputTemplateName'), trigger: "blur" },

            },
            templateId: '',
            isShow: false
        }
    },
    computed: {
        // 表格列配置
        columns() {
            return [
                {
                    title: this.$t('common.templateName'),
                    dataIndex: 'templateName',
                    key: 'templateName',
                    width: '20%',
                    scopedSlots: { customRender: 'name' }
                },
                {
                    title: this.$t('common.resourceModel'),
                    dataIndex: 'resourceName',
                    key: 'resourceName',
                    width: '10%',
                    scopedSlots: { customRender: 'resourceName' }
                },
                {
                    title: this.$t('common.deviceType'),
                    dataIndex: 'deviceName',
                    key: 'deviceName',
                    width: '12%',

                },
                {
                    title: this.$t('common.metricItems'),
                    dataIndex: 'indicatorCount',
                    key: 'indicatorCount',
                    width: '10%',
                    scopedSlots: { customRender: 'indicatorCount' }

                },
                // {
                //     title: '异常级别',
                //     dataIndex: 'abnormalSeverityHeader',
                //     key: 'abnormalSeverityHeader',
                //     width: '10%',
                //     scopedSlots: {
                //         customRender: 'severity',  // 内容插槽
                //         title: 'resourceSeverityHeader'  // 表头插槽 
                //     }

                // },
                {
                    dataIndex: 'strategyCount',
                    key: 'strategyCount',
                    width: '10%',
                    scopedSlots: {
                        customRender: 'strategyCount',  // 内容插槽
                        title: 'abnormalSeverityHeader'  // 表头插槽
                    }
                },
                {
                    title: this.$t('common.createTime'),
                    dataIndex: 'createTime',
                    key: 'createTime',
                    width: '15%',
                    customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
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
        this.loadNodeInfo()
    },
    methods: {
        async loadNodeInfo() {
            try {
                this.nodeInfo = await loadAssetTree();
            } catch (error) {
                console.error('加载节点信息失败:', error);
                this.nodeInfo = [];
            }
        },         
        //创建打开
        templateCreate() {
            this.isEdit = false;
            this.formVisible = true;
        },
        //编辑打开
        editInspection(id) {
            this.inspectionId = id;
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

        onClose() {
            this.nameVisible = false
        },
        selectShow(row) {
            this.nameVisible = true
            this.selectName = row.name
            this.selectRow = row
            getInspectionDatail(row).then((res) => {
                console.log(res);
                this.formDatail = res.data;
            })

        },
        selectAssert(row) {
            this.zhiBVisible = true;
            this.templateId = row.id;
            this.isShow = row.strategyCount == 0 ? false : true;
            console.log(this.templateId);


        },
        onClose1() {
            this.zhiBVisible = false;
            this.fetchData()
            setTimeout(() => {
                this.isDestory = false;
            }, 500);
            setTimeout(() => {
                this.isDestory = true;
            }, 800);
        },
        // 模拟获取数据
        fetchData(val) {
            console.log(val, 'fetchDatafetchDatafetchData');
            this.loading = true;
            let params = {
                pageSize: this.pageSize,
                pageNo: this.currentPage,

                "templateName": this.searchForm.templateName || undefined,
                "resourceType": this.searchForm.resourceType || undefined,//"networkdevice",

            }
            inspectionList(params).then((res) => {
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

        // 复制
        fzInspection(record) {
            this.mbForm.id = record;
            this.visibleFz = true;
        },
        //复制确认
        addMbSubmit(val) {
            this.$refs[val].validate((valid) => {
                if (valid) {
                    let params = {
                        id: this.mbForm.id,
                        templateName: this.mbForm.templateName
                    }
                    copyTemplate(params).then((res) => {
                        if (res.data) {
                            this.visibleFz = false;
                            this.mbForm.templateName = '';
                            this.$message.success(this.$t('common.copySuccessYouCanClickMetricItemsToModifyConfiguration'));
                            this.handleSearch();
                        }
                    })
                }
            })

        },
        // 处理打开指标项弹框的事件
        handleOpenMetricModal(data) {
            console.log('从新增模板接收到的数据:', data);
            this.templateId = data; // 设置模板ID为新创建的模板ID
            this.isShow = false; // 设置为新增状态
            this.zhiBVisible = true; // 打开指标项弹框
        },
        // 删除
        handleDelete(id) {
            this.$confirm(this.$t('common.areYouSureYouWantToDeleteThisTemplate'), this.$t('common.tip'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            }).then(() => {  // 箭头函数
                    inspectionDelete({ id: id }).then((res) => {
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
    // background-color: #333;
    color: #e8e8e8;
    font-size: 12px;
    cursor: pointer;
    background: #1890ff;
}
</style>