<template>
    <el-drawer :title="title" size="40%" :visible="visible" @close="handleClose" :wrapperClosable="false"
        :before-close="handleClose">

        <el-form ref="assetForm" :model="form" :rules="rules" label-width="120px" class="asset-form">

            <el-form-item prop="templateName">
                <template #label>
                    <span>{{ $t('common.templateName') }}</span>
                </template>
                <div>
                    <!-- 文本输入（TEXT/STRING） -->
                    <el-input v-model="form.templateName" :disabled="isEditAble" :placeholder="$t('common.pleaseInputTemplateName')" clearable
                        style="width: 100%" />
                </div>

            </el-form-item>
            <el-form-item prop="deviceType">
                <template #label>
                    <span>{{ $t('common.applicableDeviceType') }}</span>
                </template>
                <div style="display: flex; gap: 10px;">
                    <el-select :disabled="isEditAble" :placeholder="$t('common.pleaseSelectApplicableResourceModel')" v-model="form.resourceType"
                        @change="onResourceTypeChange" clearable filterable style="min-width: 150px;">
                        <el-option v-for="field in nodeInfo" :key="field.resourceType" :label="field.resourceName"
                    :value="field.resourceType"  />
                    </el-select>
                    <el-select :disabled="isEditAble || !form.resourceType" :placeholder="$t('common.pleaseSelectDeviceType')"
                        v-model="form.deviceType" @change="changeType" clearable filterable style="min-width: 150px;">
                        <el-option v-for="item in deviceTypeOptions" :key="item.deviceType" :label="item.deviceTypeName"
                          :value="item.deviceType" />
                    </el-select>
                </div>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <span>{{ $t('common.description') }}</span>
                </template>
                <div>
                    <!-- 文本输入（TEXT/STRING） -->
                    <el-input v-model="form.description" type="textarea" :rows="4" :disabled="isEditAble"
                        :placeholder="$t('common.pleaseInput')" clearable style="width: 100%" />
                </div>
            </el-form-item>
        </el-form>
        <div style="display: flex; align-items: center;justify-content: center;">
            <el-button type="primary" @click="handleSubmit(title)">{{ $t('common.confirm') }}</el-button>
            <el-button @click="handleClose" style="margin-left: 8px">{{ $t('common.cancel') }}</el-button>
        </div>
    </el-drawer>
</template>

<script>
import {
    inspectionAdd,
    getInspectionDatail,
    inspectionUpdate
} from "@/api/inspection";
import { loadAssetTree } from '@/utils/assetData';
import { Message } from 'element-ui'
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
import {
  getAssetModelPage,
  getAssetModelDetail
} from "@/api/resource";
export default {
    name: 'DeviceForm',
    props: {
        visible: { type: Boolean, default: false },
        isEdit: { type: Boolean, default: false },
        inspectionId: { type: Number, default: null },
        initialData: { type: Object, default: () => ({}) }, // 编辑模式初始数据
        assertInfo: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            deviceTypeOptions:[],
            nodeInfo: [],
            isEditAble: false, // 控制表单是否禁用（可扩展为"查看模式"）
            // 1. 资产信息表单模型（Element UI 需显式声明，非Form实例）
            form: {
                templateName: '', // 设备名称（基础字段）
                description: '',
                resourceType: null,
                deviceType: null // 设备类型（使用null防止默认选中第一个选项）
            },

            // 2. 监控信息表单模型
            form1: {
                monitorIp: '',
                monitorPort: null,
                snmpVersion: '',
                snmpGroup: '',
                batchPostFlag: '',
                hostPort: '',
                hostUser: '',
                hostPass: ''
            },
            // 3. 表单校验规则（基础规则 + 动态规则）
            rules: {
                templateName: [{ required: true, message: this.$t('common.pleaseInputTemplateName'), trigger: 'blur' }],
                deviceType: [{ required: true, message: this.$t('common.pleaseSelectDeviceType'), trigger: 'change' }],

            },
            formLoad: false,
            selectType: 'Kafka',
        };
    },
    computed: {
        // 抽屉标题（根据编辑/新增模式切换）
        title() {
            return this.isEdit ? this.$t('common.editTemplate') : this.$t('common.addTemplate');
        },
    },
    watch: {
        // 抽屉显示/隐藏时的初始化/重置逻辑
        visible(val) {
            if (val) {
                this.$nextTick(() => { // 确保DOM渲染完成后操作表单
                    // 加载资源类型数据
                    this.loadNodeInfo();
                    if (this.isEdit) {
                        this.getDetail(this.inspectionId);
                    } else {
                        this.form = {
                            templateName: '', // 设备名称（基础字段）
                            description: '',
                            resourceType: null,
                            deviceType: null // 设备类型（使用null防止默认选中第一个选项）
                        };
                        // 清除校验状态
                        if (this.$refs.assetForm) {
                            this.$refs.assetForm.clearValidate();
                        }
                    }
                });
            } else {

                this.resetForms(); // 关闭抽屉：重置所有表单
            }
        }
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

        //详情信息查询
        getDetail(id) {
            getInspectionDatail({ id: id }).then((res) => {
                this.form = res.data;
                this.form.deviceType = Number(this.form.deviceType);
                this.firstLoad(this.form.resourceType)
                if (this.$refs.assetForm) {
                    this.$refs.assetForm.clearValidate();
                }
            });
        },
        // 关闭抽屉：向父组件emit关闭事件
        handleClose() {
            // 在关闭抽屉时重置表单状态
            this.resetForms();
            this.$emit('close')
        },
        firstLoad(value){
            if (value === '' || value === undefined) {
                    return
                }
                // this.form.deviceType = undefined;
                this.deviceTypeOptions = [];
                this.nodeInfo.forEach(item => {
                if(item.resourceType === value){
                    this.deviceTypeOptions = item.device
                }
                });
        },
        onResourceTypeChange(value) {
            if (value === '' || value === undefined) {
                    return
                }
                this.form.deviceType = undefined;
                this.deviceTypeOptions = [];
                this.nodeInfo.forEach(item => {
                if(item.resourceType === value){
                    this.deviceTypeOptions = item.device
                }
                });

        },


        changeType(val) {

            switch (val) {
                case '1':
                    this.selectType = 'mysql'
                    break;
                case '4':
                    this.selectType = 'redis'
                    break;
                case '6':
                    this.selectType = 'nginx'
                    this.form1 = {
                        monitorIp: undefined,
                        monitorPort: undefined,
                        stubUrl: undefined,
                        vtsUrl: undefined,
                    }
                    break;
                case '5':
                    this.selectType = 'Kafka'
                    this.form1 = {
                        monitorIp: undefined,
                        monitorPort: undefined,
                        userName: undefined,
                        password: undefined,
                        scram: undefined,
                        jmxAddress: undefined,
                    }
                    break;
                case '8':  //tomcat
                    this.selectType = 'tomcat'
                    this.form1 = {
                        monitorIp: undefined,
                        monitorPort: undefined,
                        jmxAddress: undefined,
                    }
                    break;

                default:
                    break;
            }
        },
        handleSubmit(title) {
            this.$refs.assetForm.validate((valid) => {
                if (valid) {
                    this.formLoad = true;
                    // 根据选中的资源类型和设备类型获取对应的名称
                    let resourceName = '';
                    let deviceTypeName = '';

                    // 获取资源名称
                    const selectedResource = this.nodeInfo.find(item => item.resourceType === this.form.resourceType);
                    if (selectedResource) {
                        resourceName = selectedResource.resourceName;
                    }
                    const selectDevice =  this.deviceTypeOptions.find(item => item.deviceType === this.form.deviceType);
                    if (selectDevice) {
                        deviceTypeName = selectDevice.deviceTypeName;
                    }

                    const params = {
                        "templateName": this.form.templateName,
                        "resourceType": this.form.resourceType,
                        "resourceName": resourceName,
                        "deviceType": this.form.deviceType,
                        "deviceName": deviceTypeName,
                        description: this.form.description,
                    }
                    console.log(params);
                    if (!this.isEdit) {
                        inspectionAdd(params)
                            .then((res) => {
                                if (res.code === 0 && res.data) {
                                    this.formLoad = false;
                                    Message.success(this.$t('common.addSuccess'));
                                    // 先获取数据，再关闭当前弹框
                                    this.$emit("fetchData", res.data);
                                    // 传递res.data并触发打开指标项弹框的事件
                                    this.$emit("openMetricModal", res.data);
                                    // 最后关闭当前弹框
                                    this.handleClose();
                                }
                            })
                            .catch(() => {
                                this.formLoad = false;
                            });
                    } else {
                        params.id = this.form.id;
                        inspectionUpdate(params)
                            .then((res) => {
                                if (res.code === 0 && res.data) {
                                    this.formLoad = false;
                                    Message.success(this.$t('common.editSuccess'));
                                    this.handleClose();
                                    this.$emit("fetchData");
                                }
                            })
                            .catch(() => {
                                this.formLoad = false;
                            });
                    }
                }
            });
        },


        // 重置所有表单（关闭抽屉时调用）
        resetForms() {
            this.form = {
                templateName: '', // 设备名称（基础字段）
                description: '',
                resourceType: null,
                deviceType: null // 设备类型（使用null防止默认选中第一个选项）
            };
        }


    }
};
</script>

<style scoped="scoped">
/* 表单样式调整 */
.asset-form,
.monitor-form {
    margin-top: 20px;
    padding: 0px 20px;
}

.el-form-item {
    margin-bottom: 20px;
}

/* 上传区域样式 */
.upload-section {
    margin-top: 30px;
    padding: 20px;
    border-top: 1px dashed #e6e6e6;
    text-align: center;
}

.upload-section p {
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
}

/* 按钮样式补充 */
.el-button[style*="background: orange"]:hover {
    background: #ff8c00 !important;
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

.top-tip2 {
    background-color: #e6f7ff;
    border: 1px solid #bae7ff;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 16px;
    align-items: center;
    color: #606266;
}

.el-icon-warning {
    color: #faad14;
    margin-right: 8px;
    font-size: 16px;
}


::v-deep .el-icon-question {
    color: #1890ff;
}
</style>