<template>
    <div class="monitor-import-container">
        <!-- 搜索条件区域（保留原有） -->
        <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
            <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
                <a-row :gutter="16">
                    <a-col :span="6">
                        <a-form-item>
                            <a-select v-model:value="queryParams.resourceModel" :options="modelList"
                                :placeholder="$t('monitorImport.pleaseSelectResourceModel')" allowClear style="width: 100%;" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="6">
                        <a-form-item>
                            <a-input v-model="queryParams.manufacturer" :placeholder="$t('monitorImport.pleaseEnterManufacturerName')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="6">
                        <a-form-item>
                            <a-input v-model="queryParams.model" :placeholder="$t('monitorImport.pleaseEnterModel')" allowClear
                                style="width: 100%;" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="6" style="display: flex; align-items: center;margin-top: 3px;">
                        <a-button type="primary" ghost @click="handleQuery">{{ $t('monitorImport.query') }}</a-button>
                        <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('monitorImport.reset') }}</a-button>
                    </a-col>
                </a-row>
            </a-form>
            <div class="operation-card">
                <div class="operation-bar">
                    <div class="left-operations">
                        <a-button type="primary" ghost @click="handleAdd">
                            <a-icon type="plus" />{{ $t('monitorImport.add') }}
                        </a-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 一级列表区域（保留原有） -->
        <a-table style="margin-top: 10px;" rowKey="id" class="custom-table" :columns="columns" :data-source="tableData"
            :pagination="false" :loading="loading" bordered size="middle"
            
             :locale="{
               emptyText: $t('common.noData')
             }"
            >
            <template slot="name" slot-scope="text, record">
                <a-tooltip placement="top" :title="record.modelName">
                    <span  @click="selectShow(record)">{{ record.modelName }}</span>
                </a-tooltip>
            </template>
            <template slot="count" slot-scope="text, record">
                <div class="table-row-actions">
                    <a @click="showTemplateList(record)">{{ text || 0 }}</a>
                </div>
            </template>
            <template slot="fileName" slot-scope="text, record">
                    <a-tooltip placement="top" :title="text">
                    <span style="color: #1890ff; cursor: pointer;" @click="downloadTemplate(record)">{{ text }}</span>
                    </a-tooltip>
            </template>            
            <template slot="operation" slot-scope="text, record">
                <div class="table-row-actions">
                    <a @click="handleEdit(record)">{{ $t('monitorImport.edit') }}</a>
                    <a @click="batchDelete(record)">{{ $t('monitorImport.delete') }}</a>
                </div>
            </template>
        </a-table>

        <!-- 一级列表分页（保留原有） -->
        <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
            :show-total="total => `${$t('monitorImport.total')} ${total} ${$t('monitorImport.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
            @change="handlePageChange" @showSizeChange="onShowSizeChange">
            <template slot="buildOptionText" slot-scope="props">
                <span>{{ props.value }}{{ $t('monitorImport.itemsPerPage') }}</span>
            </template>
        </a-pagination>

        <!-- 模板列表弹窗（优化：使用标准 columns + data-source 渲染） -->
        <a-modal :title="$t('monitorImport.monitorTemplateList')" :visible="templateListVisible" width="800px" :footer="null" @cancel="handleTemplateModalCancel">
            <!-- 导入模板按钮区域 -->
            <div style="margin-bottom: 16px;">
                <a-button 
                    type="primary" 
                    @click="openTemplateUpload"
                    icon="upload"
                >
                    {{ $t('monitorImport.importMonitorTemplate') }}
                </a-button>
                <span style="margin-left: 8px; color: #8c8c8c; font-size: 12px;">({{ $t('monitorImport.onlySupportXmlFormatMax5MB') }})</span>
            </div>

            <!-- 模板上传弹窗（嵌套在模板列表弹窗内） -->
            <a-modal 
                :title="$t('monitorImport.importMonitorTemplate')" 
                v-model:visible="templateUploadVisible" 
                width="600px"
                :mask-closable="false"
            >
                <el-form ref="uploadForm" :model="uploadForm" :rules="uploadRules" label-width="0px">
                    <!-- 自动带入一级列表的参数（不可修改） -->
                    <el-form-item>
                        <a-select disabled v-model="uploadForm.resourceModel" :options="modelList"
                            :placeholder="$t('monitorImport.pleaseSelectResourceModel')" allowClear />
                    </el-form-item>
                    <el-form-item>
                        <el-input 
                            v-model="uploadForm.manufacturer" 
                            disabled
                        ></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-input 
                            v-model="uploadForm.model" 
                            disabled
                        ></el-input>
                    </el-form-item>
                    <!-- 模板文件上传 -->
                    <el-form-item prop="templateFile">
                        <el-upload
                            ref="uploader"
                            action="#"
                            :auto-upload="false"
                            :file-list="uploadFileList"
                            accept=".xml"
                            :limit="1"
                            :on-change="handleUploadFileChange"
                            :on-exceed="handleUploadExceed"
                            class="upload-demo"
                        >
                            <el-button size="small" type="primary">{{ $t('monitorImport.selectFile') }}</el-button>
                        </el-upload>
                    </el-form-item>
                </el-form>
                <template v-slot:footer>
                    <a-button @click="templateUploadVisible = false">{{ $t('monitorImport.cancel') }}</a-button>
                    <a-button type="primary" @click="submitTemplateUpload">{{ $t('monitorImport.confirm') }}</a-button>
                </template>
            </a-modal>

            <!-- 模板列表表格（标准用法：:columns="templateColumns" :data-source="templateTableData"） -->
            <a-table 
                :columns="templateColumns"  
                :data-source="templateTableData"  
                style="width: 100%" 
                bordered
                :loading="templateLoading"
                rowKey="id"
                :pagination="false"
            >
                <template slot="templateName" slot-scope="text, record">
                    <a-tooltip placement="top" :title="text">
                        <span style="color: #1890ff; cursor: pointer;" @click="downloadTemplate(record)">{{ text }}</span>
                    </a-tooltip>
                </template>
                <template slot="templateOperation" slot-scope="text, record">
                    <a-button type="link" @click="updateAssetTemplate(record)">{{ $t('monitorImport.updateAssetMonitorTemplate') }}</a-button>
                    <a-button type="link" :disabled="record.isUsed" @click="setAsDefaultTemplate(record)">
                        {{ $t('monitorImport.setAsDefaultTemplate') }}
                    </a-button>
                    <a-button type="link" @click="deleteTemplate(record)" danger>{{ $t('monitorImport.delete') }}</a-button>
                </template>
            </a-table>

            <!-- 模板列表分页组件 -->
            <div style="margin-top: 16px; text-align: right;">
                <a-pagination 
                    :current="templatePageNo" 
                    :page-size="templatePageSize" 
                    :total="templateTotal"
                    :show-total="total => `${$t('monitorImport.total')} ${total} ${$t('monitorImport.templateRecords')}`"
                    :page-size-options="['10', '20', '50']"
                    show-size-changer
                    @change="handleTemplatePageChange"
                    @showSizeChange="handleTemplateSizeChange"
                    :disabled="templateLoading"
                >
                    <template slot="buildOptionText" slot-scope="props">
                        <span>{{ props.value }}{{ $t('monitorImport.itemsPerPage') }}</span>
                    </template>
                </a-pagination>
            </div>
        </a-modal>

        <!-- 新增/编辑弹窗（保留原有优化） -->
        <a-modal :title="dialogTitle" v-model:visible="dialogVisible" width="500px">
            <el-form ref="form" :model="formData" :rules="formRules" label-width="0px" class="el-form-custom">
                <!-- 资源模型：新增可选择，编辑仅展示不可修改 -->
                <el-form-item prop="resourceModel">
                    <template>
                        <a-select :disabled="isEdit" v-model:value="formData.resourceModel" :options="modelList"
                            :placeholder="$t('monitorImport.pleaseSelectResourceModel')" allowClear style="width: 100%;" />
                    </template>
                </el-form-item>
                <!-- 厂家：新增/编辑均可修改 -->
                <el-form-item prop="manufacturer">
                    <el-input v-model="formData.manufacturer" :placeholder="$t('monitorImport.pleaseEnterManufacturerName')" clearable></el-input>
                </el-form-item>
                <!-- 型号：新增/编辑均可修改 -->
                <el-form-item prop="model">
                    <el-input v-model="formData.model" :placeholder="$t('monitorImport.pleaseEnterModel')" clearable></el-input>
                </el-form-item>
                <!-- 文件上传：仅新增状态显示 -->
                <el-form-item 
                    prop="templateFile" 
                    v-if="!isEdit" 
                >
                    <el-upload
                        ref="upload"
                        action="#"  
                        :auto-upload="false"  
                        :file-list="fileList"
                        accept=".xml"
                        :limit="1"
                        :on-change="handleFileChange"  
                        :on-exceed="handleUploadExceed"
                        class="upload-demo"
                    >
                        <el-button size="small" type="primary">{{ $t('monitorImport.clickToUpload') }}</el-button>
                    </el-upload>
                    <div class="upload-tip">{{ $t('monitorImport.supportXmlFormatFileSizeNotExceed5MB') }}</div>
                </el-form-item>
            </el-form>
            <template v-slot:footer>
                <a-button @click="dialogVisible = false">{{ $t('monitorImport.cancel') }}</a-button>
                <a-button type="primary" @click="handleSubmit">{{ $t('monitorImport.confirm') }}</a-button>
            </template>
        </a-modal>

        <!-- 更新资产监控模板弹窗（保留原有） -->
        <a-modal :title="$t('monitorImport.updateAssetMonitorTemplate')" v-model:visible="updateAssetVisible" width="600px">
            <div class="asset-list">
                <div style="margin-bottom: 12px;">
                    <a-checkbox v-model:checked="selectAllAssets" @change="selectAllAssetsChange">{{ $t('monitorImport.selectAll') }}</a-checkbox>
                </div>
               <el-select
                    v-model="selectedAssets"
                    multiple
                    filterable
                    :placeholder="$t('monitorImport.pleaseSelectAsset')"
                    clearable
                    style="width: 100%;"
                >
                    <el-option
                    v-for="asset in assetList"
                    :key="asset.id"
                    :value="asset.id"
                    :label="asset.assetName"
                    >
                    {{ asset.assetName }}
                    </el-option>
                </el-select>
            </div>
            <template v-slot:footer>
                <a-button @click="updateAssetVisible = false">{{ $t('monitorImport.cancel') }}</a-button>
                <a-button type="primary" @click="confirmUpdateAsset">{{ $t('monitorImport.confirm') }}</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script>
import { 
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateList,
    getGeneralPageList,
    downloadTemplateXml, //下载
    batchdeleteTemplate,
    getAssetList,  //资产列表
    setTemplate //设置默认模版
} from "@/api/monitor/monitorImport";
import { getAssetModelPage, batchCreate } from "@/api/resource";
import { getAccessToken } from "@/utils/auth";

export default {
    name: 'MonitorImport',
    data() {
        return {
            modelList:[],
            resourceOptions: [],
            queryParams: {
                pageNum: 1,
                pageSize: 10,
                resourceModel: undefined,
                manufacturer: '',
                model: ''
            },
            total: 0,
            tableData: [], // 一级列表数据
            loading: false,
            currentPage: 1,
            pageSize: 10,
            templateListVisible: false,
            templateLoading: false,
            // 模板列表专属数据（替代原 currentRow.monitorTemplates）
            templateTableData: [],
            currentRow: {
                defaultTemplate: null,
                count: 0,
                id: '',
                modelCode: '',
                brand: '',
                spu: '',
                modelName: ''
            },
            currentTemplate: null,
            // 模板列表分页配置
            templatePageNo: 1,
            templatePageSize: 10,
            templateTotal: 0,
            // 模板列表弹窗内的上传相关
            templateUploadVisible: false,
            uploadForm: {
                resourceModel: undefined,
                manufacturer: '',
                model: '',
                templateFile: null
            },
            uploadRules: {},
            uploadFileList: [],
            // 新增/编辑弹窗相关
            dialogVisible: false,
            dialogTitle: '',
            isEdit: false,
            formData: {
                resourceModel: undefined,
                manufacturer: '',
                model: '',
                templateFile: null
            },
            formRules: {},
            fileList: [],
            // 更新资产弹窗相关
            updateAssetVisible: false,
            assetList: [], // 资产列表（接口获取）
            selectedAssets: [],
            selectAllAssets: false
        }
    },
    computed: {
        // 一级列表列配置（原有不变）
        columns() {
            return [
                {
                    title: this.$t('monitorImport.resourceModel'),
                    dataIndex: 'modelCode',
                    key: 'modelCode',
                    width: '20%',
                    scopedSlots: { customRender: 'name' }
                },
                {
                    title: this.$t('monitorImport.manufacturer'),
                    dataIndex: 'brand',
                    key: 'brand',
                    width: '20%'
                },
                {
                    title: this.$t('monitorImport.model'),
                    dataIndex: 'spu',
                    key: 'spu',
                    width: '10%'
                },
                {
                    title: this.$t('monitorImport.monitorTemplate'),
                    dataIndex: 'count',
                    key: "count",
                    scopedSlots: { customRender: "count" },
                },
                {
                    title: this.$t('monitorImport.defaultTemplate'),
                    dataIndex: 'fileName',
                    key: 'fileName',
                    width: '20%',
                    scopedSlots: { customRender: "fileName" },
                },
                {
                    title: this.$t('monitorImport.operation'),
                    key: 'operation',
                    width: '10%',
                    scopedSlots: { customRender: 'operation' }
                }
            ];
        },
        // 模板列表专属列配置（新增：替代内联列）
        templateColumns() {
            return [
                {
                    title: this.$t('monitorImport.templateFile'),
                    dataIndex: 'name',
                    key: 'name',
                    width: 200,
                    scopedSlots: { customRender: 'templateName' }
                },
                {
                    title: this.$t('monitorImport.importTime'),
                    dataIndex: 'importTime',
                    key: 'importTime',
                    width: 180
                },
                {
                    title: this.$t('monitorImport.operation'),
                    key: 'templateOperation',
                    width: 350,
                    scopedSlots: { customRender: 'templateOperation' }
                }
            ];
        }
    },
    mounted() {
        // 初始化表单验证规则
        this.uploadRules = {
            templateFile: [{ required: true, message: this.$t('monitorImport.pleaseSelectTemplateFile'), trigger: 'change' }]
        };
        this.formRules = {
            resourceModel: [{ required: true, message: this.$t('monitorImport.pleaseSelectResourceModel'), trigger: 'change' }],
            manufacturer: [{ required: true, message: this.$t('monitorImport.pleaseEnterManufacturerName'), trigger: 'blur' }],
            model: [{ required: true, message: this.$t('monitorImport.pleaseEnterModel'), trigger: 'blur' }],
            templateFile: [{ required: true, message: this.$t('monitorImport.pleaseUploadTemplateFile'), trigger: 'change' }]
        };
        
        // 初始化资源选项
        this.resourceOptions = [
            { label: this.$t('monitorImport.networkDevice'), value: '1' },
            { label: this.$t('monitorImport.securityDevice'), value: '2' },
            { label: this.$t('monitorImport.terminalDevice'), value: '3' },
            { label: this.$t('monitorImport.storageDevice'), value: '4' },
        ];
        
        this.getModelList().then(() => {
            this.getList();
        });
    },
    methods: {
        getModelList() {
            return getAssetModelPage({pageNo:1,pageSize:100,assetTypeId: 87}).then((res) => {
                this.modelList = res.data?.list?.map(item =>{
                    return {
                        label: item.modelName,
                        value: item.modelCode
                    }
                }) || [];
            });  
        },         
        getList() {
            this.loading = true;
            const requestParams = {
                pageNo: this.queryParams.pageNum,
                pageSize: this.queryParams.pageSize,
                brand: this.queryParams.manufacturer,
                spu: this.queryParams.model,
                modelCode: this.queryParams.resourceModel
            };
            getGeneralPageList(requestParams)
                .then((res) => {
                    if (res.code === 0) {
                        const { list, total } = res.data;
                        this.tableData = list.map(item => ({
                            ...item,
                            resourceModel: item.modelCode || '',
                            manufacturer: item.brand || '',
                            model: item.spu || '',
                            defaultTemplateName: item.fileName || '',
                            count: item.count || 0,
                            modelName: item.modelName || ''
                        }));
                        this.total = total;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message.error(res.msg || this.$t('monitorImport.getListDataFailed'));
                    }
                })
                .catch((err) => {
                    console.error('列表数据请求失败：', err);
                    this.tableData = [];
                    this.total = 0;
                    // this.$message.error('获取列表数据失败');
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleQuery() {
            this.queryParams.pageNum = 1;
            this.currentPage = 1;
            this.getList();
        },
        handleReset() {
            this.queryParams = {
                pageNum: 1,
                pageSize: 10,
                resourceModel: undefined,
                manufacturer: '',
                model: ''
            };
            this.currentPage = 1;
            this.pageSize = 10;
            this.getList();
        },
        handlePageChange(page) {
            this.currentPage = page;
            this.queryParams.pageNum = page;
            this.getList();
        },
        onShowSizeChange(current, pageSize) {
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.queryParams.pageSize = pageSize;
            this.queryParams.pageNum = 1;
            this.getList();
        },
        showTemplateList(row) {
            // 深拷贝一级列表数据
            this.currentRow = JSON.parse(JSON.stringify({
                ...row,
                count: row.count || 0
            }));
            // 重置模板列表分页参数
            this.templatePageNo = 1;
            this.templatePageSize = 10;
            this.templateTotal = 0;
            // 清空旧的模板列表数据
            this.templateTableData = [];
            // 打开模板列表弹窗
            this.templateListVisible = true;
            // 弹窗渲染后加载模板数据
            this.$nextTick(() => {
                this.getTemplateList();
            });
        },
        /**
         * 加载监控模板列表（优化：更新 templateTableData 专属数据）
         */
        getTemplateList() {
            if (this.templateLoading) return;
            this.templateLoading = true;
            const requestParams = {
                pageNo: this.templatePageNo,
                pagesize: this.templatePageSize,
                brand: this.currentRow.brand || this.currentRow.manufacturer || '',
                spu: this.currentRow.spu || this.currentRow.model || '',
                modelCode: this.currentRow.modelCode || this.currentRow.resourceModel || ''
            };

            getTemplateList(requestParams)
                .then((res) => {
                    if (res.code === 0) {
                        const { list, total } = res.data;
                        // 格式化数据后赋值给模板列表专属数据 templateTableData
                        this.templateTableData = list.map(item => ({
                            id: item.id || Date.now(),
                            name: item.fileName || `${this.$t('monitorImport.unnamedTemplate')}_${item.id || Date.now()}`,
                            importTime: item.createTime || this.$t('monitorImport.noImportTime'),
                            isDefault: item.isDefault || false,
                            brand: item.brand || '',
                            spu: item.spu || '',
                            modelCode: item.modelCode || '',
                            sequence: item.sequence || 0,
                            isUsed: item.isUsed 
                        }));
                        this.templateTotal = total || 0;
                        this.currentRow.count = total || 0;
                    } else {
                        this.templateTableData = [];
                        this.templateTotal = 0;
                        this.currentRow.count = 0;
                        this.$message.error(res.msg || this.$t('monitorImport.getMonitorTemplateListFailed'));
                    }
                })
                .catch((err) => {
                    console.error('监控模板列表请求失败：', err);
                    this.templateTableData = [];
                    this.templateTotal = 0;
                    this.currentRow.count = 0;
                    // this.$message.error('获取监控模板列表失败');
                })
                .finally(() => {
                    this.templateLoading = false;
                });
        },
        /**
         * 模板列表分页切换
         */
        handleTemplatePageChange(page) {
            if (page === this.templatePageNo) return;
            this.templatePageNo = page;
            this.getTemplateList();
        },
        /**
         * 模板列表每页条数切换
         */
        handleTemplateSizeChange(current, pageSize) {
            if (pageSize === this.templatePageSize) return;
            this.templatePageSize = pageSize;
            this.templatePageNo = 1;
            this.getTemplateList();
        },
        /**
         * 模板列表弹窗关闭事件
         */
        handleTemplateModalCancel() {
            this.templateListVisible = false;
            // 清空模板列表专属数据
            this.templateTableData = [];
            // 清空当前行数据
            this.currentRow = {
                defaultTemplate: null,
                count: 0,
                id: '',
                modelCode: '',
                brand: '',
                spu: '',
                modelName: ''
            };
            // 重置分页参数
            this.templatePageNo = 1;
            this.templatePageSize = 10;
            this.templateTotal = 0;
            // 清空上传相关状态
            this.templateUploadVisible = false;
            this.uploadFileList = [];
            this.uploadForm = {
                resourceModel: undefined,
                manufacturer: '',
                model: '',
                templateFile: null
            };
        },
        // 打开模板上传弹窗
        openTemplateUpload() {
            this.uploadForm = {
                resourceModel: this.currentRow.modelCode || this.currentRow.resourceModel || '',
                manufacturer: this.currentRow.brand || this.currentRow.manufacturer || '',
                model: this.currentRow.spu || this.currentRow.model || '',
                templateFile: null
            };
            this.uploadFileList = [];
            this.templateUploadVisible = true;
            this.$nextTick(() => {
                if (this.$refs.uploadForm) {
                    this.$refs.uploadForm.clearValidate();
                }
            });
        },
        // 文件上传超出数量限制的提示
        handleUploadExceed(files, fileList) {
            this.$message.warning(`${this.$t('monitorImport.onlySupportUploadOneXmlFile')}！${this.$t('monitorImport.currentlySelected')}${fileList.length}${this.$t('monitorImport.files')}`);
        },
        // 模板上传的文件变更事件（新增XML格式校验）
        handleUploadFileChange(uploadFile, uploadFileList) {
            // 1. 格式校验：只允许XML文件
            const isXML = uploadFile.name?.toLowerCase().endsWith('.xml');
            const xmlMimeTypes = ['application/xml', 'text/xml', 'application/x-xml'];
            const isCorrectMimeType = xmlMimeTypes.includes(uploadFile.raw?.type);
            
            if (!isXML || !isCorrectMimeType) {
                this.$message.error(this.$t('monitorImport.onlySupportUploadXmlFormatFile'));
                // 清空文件列表，不允许选择非XML文件
                this.uploadFileList = [];
                this.uploadForm.templateFile = null;
                return;
            }

            // 2. 大小校验（优化：改为5MB）
            const fileSize = uploadFile.size / 1024 / 1024; // 转MB
            if (fileSize > 5) {
                this.$message.error(this.$t('monitorImport.fileSizeCannotExceed5MB'));
                this.uploadFileList = [];
                this.uploadForm.templateFile = null;
                return;
            }

            // 3. 数量校验：确保只保留最后选择的一个文件
            if (uploadFileList.length > 1) {
                this.uploadFileList = [uploadFileList[uploadFileList.length - 1]];
                this.$message.warning(this.$t('monitorImport.autoReplacedWithLatestSelectedFile'));
            } else {
                this.uploadFileList = uploadFileList;
            }

            // 4. 正常处理文件
            if (this.uploadFileList.length > 0) {
                this.uploadForm.templateFile = this.uploadFileList[0].raw;
            } else {
                this.uploadForm.templateFile = null;
            }
            if (this.$refs.uploadForm) {
                this.$refs.uploadForm.validateField('templateFile');
            }
        },
        // 提交模板上传
        submitTemplateUpload() {
            this.$refs.uploadForm.validate((valid) => {
                if (!valid) return;

                const formData = new FormData();
                formData.append('brand', this.uploadForm.manufacturer.trim());
                formData.append('spu', this.uploadForm.model.trim());
                formData.append('modelCode', this.uploadForm.resourceModel);
                formData.append('file', this.uploadForm.templateFile);

                createTemplate(formData)
                    .then((res) => {
                        if (res.code === 0) {
                            this.$message.success(this.$t('monitorImport.templateImportSuccess'));
                            this.templateUploadVisible = false;
                            // 刷新模板列表专属数据
                            this.getTemplateList();
                            // 同步刷新一级列表
                            this.getList();
                        } else {
                            this.$message.error(res.msg || this.$t('monitorImport.templateImportFailed'));
                        }
                    })
                    .catch((err) => {
                        console.error('模板导入失败：', err);
                        // this.$message.error('模板导入失败');
                    });
            });
        },
        /**
         * 修复后的下载模板方法 - 解决文件空白问题
         */
        downloadTemplate(template) {
            const templateId = template.id;
            if (!templateId) {
                this.$message.warning(this.$t('monitorImport.templateIdInvalidCannotDownload'));
                return;
            }

            // 显示加载提示
            // const loading = this.$message.loading('正在下载模板...', 0);
            
            // 直接调用封装的API方法，确保responseType为blob
            downloadTemplateXml(templateId)
                .then(async (response) => {
                    // loading(); // 关闭加载提示
                    
                    // 处理不同的响应格式（axios响应对象 或 直接返回blob）
                    let blob = response;
                    if (response.data && response.data instanceof Blob) {
                        blob = response.data;
                    }

                    // 检查blob是否为空
                    if (blob.size === 0) {
                        this.$message.error(this.$t('monitorImport.downloadFailedTemplateFileIsEmpty'));
                        return;
                    }

                    // 验证文件类型（XML）
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        if (typeof content === 'string' && !content.startsWith('<?xml')) {
                            console.warn('下载的文件不是有效的XML文件', content);
                            this.$message.warning(this.$t('monitorImport.downloadedFileMayNotBeValidXmlFormat'));
                        }
                    };
                    reader.readAsText(blob);

                    // 获取文件名
                    let fileName = template.name || template.fileName || this.$t('monitorImport.monitorTemplateXml');
                    
                    // 尝试从响应头获取文件名
                    if (response.headers) {
                        const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
                        if (contentDisposition) {
                            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                            if (filenameMatch && filenameMatch[1]) {
                                try {
                                    fileName = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
                                } catch (e) {
                                    console.warn('文件名解码失败:', e);
                                }
                            }
                        }
                    }
                    
                    // 创建下载链接并触发下载
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = fileName;
                    link.style.display = 'none';
                    
                    document.body.appendChild(link);
                    link.click();
                    
                    // 清理资源
                    setTimeout(() => {
                        window.URL.revokeObjectURL(downloadUrl);
                        document.body.removeChild(link);
                    }, 100);
                    
                    this.$message.success(`${this.$t('monitorImport.template')}${fileName}${this.$t('monitorImport.downloadSuccess')}`);
                })
                .catch((error) => {
                    loading(); // 关闭加载提示
                    console.error('下载失败:', error);
                    
                    // 详细的错误提示
                    // if (error.response && error.response.status === 404) {
                    //     this.$message.error('下载失败：模板文件不存在');
                    // } else if (error.response && error.response.status === 500) {
                    //     this.$message.error('下载失败：服务器内部错误');
                    // } else if (error.message && error.message.includes('Network Error')) {
                    //     this.$message.error('下载失败：网络连接异常，请检查网络');
                    // } else {
                    //     this.$message.error(`下载失败: ${error.message || '未知错误，请稍后重试'}`);
                    // }
                });
        },
        /**
         * 打开更新资产弹窗并通过接口获取资产列表
         */
        updateAssetTemplate(template) {
            if (!template || !template.id) {
                this.$message.warning(this.$t('monitorImport.templateIdInvalidCannotGetAssetList'));
                return;
            }
            this.currentTemplate = template;
            this.selectedAssets = [];
            this.selectAllAssets = false;
            // 调用getAssetList接口，传入模板ID
            getAssetList({ id: template.id })
                .then((res) => {
                    if (res.code === 0) {
                        // 提取接口返回的id和assetName，赋值给assetList
                        this.assetList = res.data.map(item => ({
                            id: item.id,
                            assetName: item.assetName || this.$t('monitorImport.unnamedAsset')
                        })) || [];
                    } else {
                        this.assetList = [];
                        this.$message.error(res.msg || this.$t('monitorImport.getAssetListFailed'));
                    }
                })
                .catch((err) => {
                    console.error('获取资产列表失败：', err);
                    this.assetList = [];
                    // this.$message.error('获取资产列表失败，请稍后重试');
                })
                .finally(() => {
                    // 最后打开弹窗
                    this.updateAssetVisible = true;
                });
        },
        /**
         * 设为默认模板
         */
        setAsDefaultTemplate(template) {
            if (!template || !template.id) {
                this.$message.warning(this.$t('monitorImport.templateIdInvalidCannotSetDefault'));
                return;
            }
            this.$confirm(this.$t('monitorImport.confirmSetAsDefaultTemplate'), this.$t('common.tip'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            })
                .then(() => {
                    // 调用设为默认模板接口
                    setTemplate({ id: template.id })
                        .then((res) => {
                            if (res.code === 0) {
                                this.$message.success(this.$t('monitorImport.setDefaultTemplateSuccess'));
                                // 更新本地模板列表默认状态
                                if (this.templateTableData && this.templateTableData.length > 0) {
                                    this.templateTableData.forEach(item => {
                                        item.isDefault = item.id === template.id;
                                    });
                                }
                                // 更新当前行默认模板信息
                                this.currentRow.defaultTemplate = template;
                                this.currentRow.defaultTemplateName = template.name;
                                // 刷新模板列表
                                this.$nextTick(() => {
                                    this.getTemplateList();
                                    this.getList();
                                });
                            } else {
                                this.$message.error(res.msg || this.$t('monitorImport.setDefaultTemplateFailed'));
                            }
                        })
                        .catch((err) => {
                            console.error('设置默认模板失败：', err);
                            // this.$message.error('设置默认模板失败，请稍后重试');
                        });
                });
        },
        /**
         * 删除模板
         */
        deleteTemplate(template) {
            if (!template || !template.id) {
                this.$message.warning(this.$t('monitorImport.templateIdInvalidCannotDelete'));
                return;
            }
            this.$confirm(this.$t('monitorImport.confirmDeleteTemplate'), this.$t('common.tip'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            })
                .then(() => {
                    // 调用删除模板接口
                    deleteTemplate({ id: template.id })
                        .then((res) => {
                            if (res.code === 0) {
                                this.$message.success(this.$t('monitorImport.templateDeleteSuccess'));
                                // 刷新模板列表
                                this.getTemplateList();
                                // 刷新一级列表
                                this.getList();
                                // 若删除的是默认模板，清空当前行默认模板记录
                                if (this.currentRow.defaultTemplate && this.currentRow.defaultTemplate.id === template.id) {
                                    this.currentRow.defaultTemplate = null;
                                    this.currentRow.defaultTemplateName = '';
                                }
                            } else {
                                this.$message.error(res.msg || this.$t('monitorImport.templateDeleteFailed'));
                            }
                        })
                        .catch((err) => {
                            console.error('模板删除失败：', err);
                            // this.$message.error('模板删除失败，请稍后重试');
                        });
                });
        },
        batchDelete(template) {
            if (!template || !template.id) {
                this.$message.warning(this.$t('monitorImport.templateIdInvalidCannotDelete'));
                return;
            }
            this.$confirm(this.$t('monitorImport.confirmDeleteTemplate'), this.$t('common.tip'), {
                confirmButtonText: this.$t('common.confirm'),
                cancelButtonText: this.$t('common.cancel'),
                type: "warning",
            })
                .then(() => {
                    // 调用删除模板接口
                    batchdeleteTemplate({ id: template.id })
                        .then((res) => {
                            if (res.code === 0) {
                                this.$message.success(this.$t('monitorImport.templateDeleteSuccess'));
                                // 刷新一级列表
                                this.getList();
                            } else {
                                this.$message.error(res.msg || this.$t('monitorImport.templateDeleteFailed'));
                            }
                        })
                        .catch((err) => {
                            console.error('模板删除失败：', err);
                            // this.$message.error('模板删除失败，请稍后重试');
                        });
                });
        },
        handleAdd() {
            this.dialogTitle = this.$t('monitorImport.addMonitorTemplate');
            this.isEdit = false;
            this.formData = {
                resourceModel: undefined,
                manufacturer: '',
                model: '',
                templateFile: null
            };
            this.fileList = [];
            this.dialogVisible = true;
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate();
                }
            });
        },
        handleEdit(row) {
            this.dialogTitle = this.$t('monitorImport.editMonitorTemplate');
            this.isEdit = true;
            this.formData = { 
                resourceModel: row.modelCode || row.resourceModel || '',
                manufacturer: row.brand || row.manufacturer || '',
                model: row.spu || row.model || '',
                id: row.id || '',
                templateFile: null
            };
            this.fileList = [];
            this.dialogVisible = true;
            this.$nextTick(() => {
                if (this.$refs.form) {
                    this.$refs.form.clearValidate();
                }
            });
        },
        // 新增/编辑弹窗的文件变更事件（新增XML格式校验）
        handleFileChange(uploadFile, uploadFileList) {
            // 1. 格式校验：只允许XML文件
            const isXML = uploadFile.name?.toLowerCase().endsWith('.xml');
            const xmlMimeTypes = ['application/xml', 'text/xml', 'application/x-xml'];
            const isCorrectMimeType = xmlMimeTypes.includes(uploadFile.raw?.type);
            
            if (!isXML || !isCorrectMimeType) {
                this.$message.error(this.$t('monitorImport.onlySupportUploadXmlFormatFile'));
                // 清空文件列表，不允许选择非XML文件
                this.fileList = [];
                this.formData.templateFile = null;
                return;
            }

            // 2. 大小校验（优化：改为5MB）
            const fileSize = uploadFile.size / 1024 / 1024; // 转MB
            if (fileSize > 5) {
                this.$message.error(this.$t('monitorImport.fileSizeCannotExceed5MB'));
                this.fileList = [];
                this.formData.templateFile = null;
                return;
            }

            // 3. 数量校验：确保只保留最后选择的一个文件
            if (uploadFileList.length > 1) {
                this.fileList = [uploadFileList[uploadFileList.length - 1]];
                this.$message.warning(this.$t('monitorImport.autoReplacedWithLatestSelectedFile'));
            } else {
                this.fileList = uploadFileList;
            }

            // 4. 正常处理文件
            if (!this.isEdit && this.fileList.length > 0) {
                this.formData.templateFile = this.fileList[0].raw;
            } else {
                this.formData.templateFile = null;
            }
            if (this.$refs.form) {
                this.$refs.form.validateField('templateFile');
            }
        },
        handleSubmit() {
            this.$refs.form.validate((valid) => {
                if (!valid) return;

                if (!this.isEdit) {
                    const formData = new FormData();
                    formData.append('brand', this.formData.manufacturer.trim());
                    formData.append('spu', this.formData.model.trim());
                    formData.append('modelCode', this.formData.resourceModel);
                    formData.append('file', this.formData.templateFile);

                    createTemplate(formData)
                        .then((res) => {
                            if (res.code === 0) {
                                this.$message.success(this.$t('monitorImport.addSuccess'));
                                this.dialogVisible = false;
                                this.getList();
                            } else {
                                this.$message.error(res.msg || this.$t('monitorImport.addFailed'));
                            }
                        })
                        .catch((err) => {
                            console.error('新增监控模板失败：', err);
                            // this.$message.error('新增失败');
                        });
                } else {
                    const editParams = new FormData();
                    editParams.append('id', this.formData.id);
                    editParams.append('brand', this.formData.manufacturer.trim());
                    editParams.append('spu', this.formData.model.trim());                    
                    updateTemplate(editParams)
                        .then((res) => {
                            if (res.code === 0) {
                                this.$message.success(this.$t('monitorImport.editSuccess'));
                                this.dialogVisible = false;
                                this.getList();
                            } else {
                                this.$message.error(res.msg || this.$t('monitorImport.editFailed'));
                            }
                        })
                        .catch((err) => {
                            console.error('编辑监控模板失败：', err);
                            // this.$message.error('编辑失败');
                        });
                }
            });
        },
        selectAllAssetsChange(e) {
            this.selectedAssets = e.target.checked ? this.assetList.map(asset => asset.id) : [];
        },
        confirmUpdateAsset() {
            if (this.selectedAssets.length === 0) {
                this.$message.warning(this.$t('monitorImport.pleaseSelectAssetToUpdate'));
                return;
            }
            const params = { ids: this.selectedAssets };
            batchCreate(params)
                .then((res) => {
                if (res.code === 0) {
                    this.$message.success(this.$t('monitorImport.batchIssuanceSuccess'));
                     this.updateAssetVisible = false;
                    setTimeout(() => this.getTemplateList(), 1000);
                } else {
                    this.$message.error(res.msg || this.$t('monitorImport.batchIssuanceFailed'));
                     this.updateAssetVisible = false;
                    setTimeout(() => this.getTemplateList(), 1000);
                }
                })
                .catch(() => {
                // this.$message.error(this.$t('monitorImport.batchIssuanceFailed'));
                 this.updateAssetVisible = false;
                setTimeout(() => this.getTemplateList(), 1000);
                });           
        },
        getResourceModelName(value) {
            const modelMap = {
                networkDevice: '网络设备',
                securityDevice: '安全设备',
                terminalDevice: '终端设备',
                storageDevice: '存储设备'
            };
            return modelMap[value] || value;
        },
        selectShow(record) {
            this.$message.info(`查看资源模型详情：${record.modelName || record.modelCode || record.resourceModel}`);
        },
        handleSizeChange(current, pageSize) {
            this.queryParams.pageSize = pageSize;
            this.getList();
        },
        handleCurrentChange(pageNum) {
            this.queryParams.pageNum = pageNum;
            this.getList();
        },
        fetchData() {
            this.getList();
        }
    },
    watch: {
        selectedAssets(val) {
            if (val && this.assetList.length > 0) {
                this.selectAllAssets = val.length === this.assetList.length;
            }
        }
    }
}
</script>

<style scoped>
.monitor-import-container {
    padding: 20px;
    background: #fff;
    height: 90vh;
    min-width: 1280px;
    overflow: auto;
}

.search-area {
    margin-bottom: 20px;
}

.list-area {
    margin-top: 20px;
}

.pagination-container {
    margin-top: 20px;
    text-align: right;
}

.asset-list {
    margin-bottom: 20px;
}

.asset-list .ant-checkbox {
    margin-right: 20px;
    margin-bottom: 10px;
}

.asset-list .ant-select {
    width: 100%;
}

.upload-demo .ant-upload-drag {
    display: block;
    margin-top: 8px;
}

.upload-tip {
    margin-top: 8px;
    color: #8c8c8c;
    font-size: 12px;
}

:deep(.ant-modal-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

:deep(.ant-table-column-has-actions) {
    text-align: center;
}

:deep(.ant-form-item-label > label) {
    font-weight: 500;
}

:deep(.ant-form-item-disabled .ant-upload),
:deep(.el-form-item.is-disabled .ant-upload) {
    opacity: 0.6;
    cursor: not-allowed;
}

:deep(.ant-select-multiple .ant-select-selection-item) {
    margin-bottom: 4px;
}

.el-form-custom {
    width: 100%;
    padding: 0 10px;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #333;
}

:deep(.el-input__inner),
:deep(.el-select__wrapper) {
    width: 100%;
}
</style>
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
    height: 90vh;
    min-width: 1280px;
    overflow: auto;
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
</style>