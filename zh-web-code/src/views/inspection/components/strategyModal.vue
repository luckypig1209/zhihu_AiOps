<template>
    <a-drawer :title="isView ? $t('common.viewDetails') : opt" :visible="showModal" width="1080px" placement="right" :closable="true"
        :mask-closable="false" @close="cancel">
        <div style="height: 80vh;overflow-y: auto;padding: 0 16px;">
            <!-- 步骤条：查看模式隐藏 -->
            <el-steps :active="activeStep" finish-status="success" simple :disabled="isView" v-if="!isView">
                <el-step :title="$t('common.basicInfo')"></el-step>
                <el-step :title="$t('common.notificationConfiguration')"></el-step>
            </el-steps>

            <!-- 查看模式：添加区域标题分隔，优化视觉结构 -->
            <div v-if="isView" class="view-mode-title">{{ $t('common.basicInfo') }}</div>
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <!-- Step 1: 基本信息配置 - 查看模式始终显示 -->
                <div v-show="!isView ? activeStep === 0 : true" class="step-content">
                    <el-row>
                        <el-col :span="22">
                            <el-form-item prop="name" :label="$t('common.strategyName')">
                                <el-input type="text" v-model.trim="form.name" maxlength="40" :placeholder="$t('common.pleaseInputStrategyName')"
                                    :disabled="isView">
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="22">
                            <el-form-item>
                                <template #label><span style="color: #ff4949;margin-right: 4px;">*</span>{{ $t('common.inspectionResource') }}</template>
                                <div v-for="(item, index) in form.inspectionList" :key="`source_${index}`"
                                    style="display: flex; gap: 10px; margin-bottom: 20px; ">
                                    <el-select :disabled="isView" :placeholder="$t('common.pleaseSelectInspectionTemplate')" v-model="item.inspectionId"
                                        @change="(val) => oninspectionIdChange(index, val)" clearable filterable
                                        style="width: 30%;">
                                        <el-option v-for="resource in insoestionMbList" :disabled="resource.disabled"
                                            :key="resource.value" :label="resource.label" :value="resource.value" />
                                    </el-select>

                                    <!-- 第二级：全部/分组/选中 -->
                                    <el-select :disabled="isView || !item.inspectionId" :placeholder="$t('common.pleaseSelect')"
                                        v-model="item.resourceType" @change="(val) => onResourceTypeChange(index, val)"
                                        style="width: 30%;">
                                        <el-option :label="$t('common.all')" value="all" />
                                        <el-option :label="$t('common.group')" value="group" />
                                        <el-option :label="$t('common.selected')" value="selected" />
                                    </el-select>

                                    <!-- 第三级：分组选择 -->
                                    <el-select v-if="item.resourceType === 'group'"
                                        :disabled="isView || !item.inspectionId" multiple :placeholder="$t('common.pleaseSelectGroup')"
                                        v-model="item.groupIdList" clearable filterable style="width: 30%;">
                                        <el-option v-for="group in groupOptions" :key="group.value" :label="group.label"
                                            :value="group.value" />
                                    </el-select>

                                    <!-- 第三级：资源选择 -->
                                    <el-select v-if="item.resourceType === 'selected'"
                                        :disabled="isView || !item.inspectionId" multiple v-model="item.assetIdList"
                                        clearable filterable :placeholder="$t('common.pleaseSelectResource')" style="width: 30%;">
                                        <el-option v-for="device in item.deviceOptions || []" :key="device.value"
                                            :label="device.label" :value="device.value">
                                        </el-option>
                                    </el-select>

                                    <div v-if="form.inspectionList.length > 1 && !isView"
                                        @click="handleDelSourceRow(index, item)" style="cursor: pointer;">
                                        <i class="el-icon-remove-outline" style="color: red;"></i>
                                    </div>
                                </div>

                                <a-button v-if="!isView" type="primary" ghost @click="handleAddSourceCond">
                                    <a-icon type="plus" />{{ $t('common.inspectionResource') }}
                                </a-button>
                            </el-form-item>
                        </el-col>
                        <el-col :span="22">
                            <el-form-item prop="radioPc" :label="$t('common.executionFrequency')">
                                <el-radio-group v-model="form.radioPc" :disabled="isView">
                                    <el-radio :label="1">{{ $t('common.single') }}</el-radio>
                                    <el-radio :label="2">{{ $t('common.periodic') }}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col :span="22" v-if="form.radioPc == 1">
                            <el-form-item :label="$t('common.executionTime')" prop="singleHandleTime">
                                <el-date-picker v-model="form.singleHandleTime" :placeholder="$t('common.pleaseSelectExecutionTime')"
                                    value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" type="datetime"
                                    style="width: 240px" :picker-options="pickerOptions" @change="handleTimeChange"
                                    @visible-change="handleDateTimePickerVisibleChange" :disabled="isView" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="22" v-if="form.radioPc == 2">
                            <el-form-item :label="$t('common.cycleTime')" prop="cycleCron" :rules="[
                                { required: true, message: $t('common.pleaseSelectCycleTime'), trigger: 'change' }
                            ]">
                                <el-popover popper-class="pop popStyle"
                                    :popper-options="{ boundariesElement: 'viewport', removeOnDestroy: true }"
                                    v-model="cronPopover">
                                    <cron @change="changeCron" v-model="form.cycleCron" @close="cronPopover = false"
                                        class="cron" ref="cron" :config="cronConfig" :disabled="isView">
                                    </cron>
                                    <el-input slot="reference" :disabled="isView" clearable style="width: 240px"
                                        @click="cronPopover = !isView" v-model="form.cycleCron" :placeholder="$t('common.pleaseSelectCycleTime')"
                                        :readonly="isView"></el-input>
                                </el-popover>
                            </el-form-item>
                            <el-col :span="22">
                                <el-form-item prop="status" :label="$t('common.enabledStatus')">
                                    <el-switch v-model="form.status" active-color="#409EFF" inactive-color="#cccccc"
                                        :active-value="true" :inactive-value="false" :disabled="isView">
                                    </el-switch>
                                </el-form-item>
                            </el-col>
                        </el-col>
                        <el-col :span="22">
                            <el-form-item prop="description" :label="$t('common.description')">
                                <el-input type="textarea" v-model.trim="form.description" maxlength="40"
                                    :placeholder="$t('common.pleaseInputDescription')" :disabled="isView">
                                </el-input>
                            </el-form-item>
                        </el-col>

                    </el-row>
                </div>

                <!-- 查看模式：添加区域标题分隔 -->
                <div v-if="isView" class="view-mode-title">{{ $t('common.notificationConfiguration') }}</div>
                <!-- Step 3: 通知配置 - 查看模式始终显示 -->
                <div v-show="!isView ? activeStep === 1 : true" class="step-content">
                    <el-row>
                        <el-col :span="22">
                            <el-form-item prop="isNotice" :label="$t('common.whetherToNotify')">
                                <el-switch v-model="form.isNotice" active-color="#409EFF" inactive-color="#cccccc"
                                    :active-value="true" :inactive-value="false" :disabled="isView">
                                </el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="22" v-if="form.isNotice">
                            <el-form-item prop="noticeObjIdList" :label="$t('common.notificationObject')">
                                <div style="display: flex;">
                                    <el-select style="width: 356px" v-model="form.noticeObjIdList" multiple filterable
                                        :placeholder="$t('common.pleaseSelectNotificationObject')" :disabled="isView">
                                        <el-option v-for="item in userOptions" :key="item.value" :label="item.label"
                                            :value="item.value + ''"></el-option>
                                    </el-select>
                                    <!-- 配置通知对象按钮：查看模式隐藏 -->
                                    <a-button type="primary" style="margin-left: 10px;" ghost @click="handleAdd"
                                        v-if="!isView">{{ $t('common.configureNotificationObject') }}</a-button>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
                <div v-if="isView">
                    <a-button type="primary" style="margin-left: 10px;" ghost @click="startGots(form)">{{ $t('common.executeImmediately') }}</a-button>
                </div>
            </el-form>
        </div>
        <div class="dialog-footer">
            <!-- 步骤切换按钮：查看模式完全隐藏（无需浏览步骤） -->
            <el-button v-if="activeStep > 0 && !isView" @click="prevStep" :disabled="isSubmitDisabled">{{ $t('common.previousStep') }}</el-button>
            <el-button v-if="activeStep < 1 && !isView" type="primary" @click="nextStep"
                :disabled="isSubmitDisabled">{{ $t('common.nextStep') }}</el-button>
            <!-- 提交按钮：查看模式隐藏 -->
            <el-button v-if="activeStep === 1 && !isView" type="primary" @click="handleSubmit('form')"
                :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
            <!-- 取消按钮：查看模式显示为“关闭” -->
            <el-button v-if="!isView" @click="cancel" :disabled="isSubmitDisabled">
                {{ $t('common.cancel') }}
            </el-button>
        </div>
        <!-- 配置通知对象弹窗：查看模式隐藏 -->
        <obj-modal ref="objModal" :rowData="{}" @refreshList="getUserOptions" :isShowTab="isShowTab"
            :visible="showObjModal" v-if="!isView" @close="showObjModal = false"></obj-modal>

        <!-- cron表达式选择模态框
        <el-dialog title="选择周期" :visible.sync="showCronModal" width="600px" :close-on-click-modal="false">
            <cron v-if="showCronModal" ref="cron" :value="form.cycleCron" @change="cronChange"></cron>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showCronModal = false">关闭</el-button>
                <el-button type="primary" @click="cronConfirm">保存</el-button>
            </div>
        </el-dialog> -->
    </a-drawer>
</template>

<script>
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import {
    getAssetInfoPage,
    getAssetModelPage,
    getAssetGroup
} from "@/api/resource";
import {
    inspectionList,
    assetList,
    strategyAdd,
    inspectionDetail,
    strategyUpdate,
    startGot
} from "@/api/inspection";
// src\views\noticeCenter\ruleList\components\objModal.vue
import objModal from '../../noticeCenter/ruleList/components/objModal.vue'
import { cron } from '@/components/cron'
// import VueCron from '@vue-js-cron/vue2'
// import '@vue-js-cron/vue2/dist/vue-cron.css'
import { getNotificationGroup } from "@/api/notice/notice";
export default {
    components: {
        objModal, cron
    },
    props: {
        // rowData: Object,
        // 新增：查看模式控制参数（父组件传递，true为查看模式）
        isView: {
            type: Boolean,
            default: false
        },
        editId: {
            type: [String, Number],
            default: null
        },
        rowData: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            isShowTab: '',
            showObjModal: false,
            cronPopover: false,
            cron: '',
            // cron组件配置，适配xxl
            cronConfig: {
                quartz: true,        // 使用 Quartz 语法
                showYear: false,     // 不显示年份
                showSecond: false,   // 不显示秒
                allowEmpty: false,   // 不允许空表达式
            },
            insoestionMbList: [],
            userOptions: [],
            //旧参数
            sourceConditionFields: [],
            sourceList: [],
            activeStep: 0, // 当前步骤（编辑模式用，查看模式不影响）
            isSubmitDisabled: false,
            opt: this.$t('common.addInspectionStrategy'),
            isAdd: true,
            loading: false,
            showModal: false,
            showCronModal: false,

            // 当前时间，用于计算selectableRange
            currentTime: new Date(),

            // 日期时间选择器配置
            // pickerOptions: {
            //     disabledDate(time) {
            //         // 只能选择今天及以后的日期
            //         const today = new Date();
            //         today.setHours(0, 0, 0, 0);
            //         return time.getTime() < today.getTime();
            //     },
            //     // 只能选择当前时间及以后的时间
            //     selectableRange: ''
            // },
            pickerOptions: {
                disabledDate: (time) => {
                    // 只能选择今天及以后的日期
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return time.getTime() < today.getTime();
                },
                selectableRange: '',
                // 新增：实时禁用过去的时间点
                disabledTime: (date) => {
                    if (!date) return { disabledHours: () => [] };

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = date.toDateString() === today.toDateString();

                    if (!isToday) return { disabledHours: () => [] };

                    // 今天：禁用当前时间之前的小时
                    const currentHour = today.getHours();
                    const disabledHours = [];
                    for (let i = 0; i < currentHour; i++) {
                        disabledHours.push(i);
                    }

                    return {
                        disabledHours: () => disabledHours,
                        disabledMinutes: (selectedHour) => {
                            // 禁用当前小时中已过去的分钟
                            if (selectedHour !== currentHour) return [];
                            const currentMinute = today.getMinutes();
                            const disabledMinutes = [];
                            for (let i = 0; i < currentMinute; i++) {
                                disabledMinutes.push(i);
                            }
                            return disabledMinutes;
                        }
                    };
                }
            },
            // 新增：记录上次有效时间（用于回滚无效选择）
            lastValidTime: null,

            // 表单数据
            form: {
                name: '',
                status: false,
                handleType: "SINGLE",
                singleHandleTime: null,
                cycleCron: null,
                description: "",
                isNotice: false,
                noticeobjId: null,
                radioPc: 1,
                noticeObjIdList: [],
                // 初始化巡检资源列表
                inspectionList: [{
                    inspectionId: '',
                    assetIdList: [],
                    resourceType: '',
                    groupIdList: [],
                    // groupIdList: [], // 添加groupIdList字段
                    isAllAsset: false, // 添加isAllAsset字段
                    deviceOptions: []
                }]
            },
            // 表单校验规则
            rules: {
                name: [
                    { required: true, message: this.$t('common.pleaseInputInspectionStrategyName'), trigger: "blur" }
                ],
                status: [
                    { required: true, message: this.$t('common.pleaseSelectWhetherToEnable'), trigger: "change" }
                ],
                radioPc: [
                    { required: true, message: this.$t('common.pleaseSelectExecutionFrequency'), trigger: "change" }
                ],
                singleHandleTime: [
                    { required: () => this.form.radioPc == 1, message: this.$t('common.pleaseSelectExecutionTime'), trigger: "change" }
                ],
                cycleCron: [
                    { required: () => this.form.radioPc == 2, message: this.$t('common.pleaseSelectExecutionCycle'), trigger: "change" }
                ],
                noticeObjIdList: [
                    { required: true, message: this.$t('common.pleaseSelectNotificationObject'), trigger: "change" }
                ],
            },
            // 其他数据
            isPickerVisible: false,
            sourceDevices: [],
            groupOptions: []
        };
    },
    watch: {
        // 监听执行频次变化，清空之前选择的时间值
        'form.radioPc'(newVal, oldVal) {
            if (newVal !== oldVal) {
                if (newVal === 1) {
                    // 切换到单次，清空周期时间
                    this.form.cycleCron = null;
                } else if (newVal === 2) {
                    // 切换到周期，清空单次时间
                    this.form.singleHandleTime = null;
                }
            }
        },
        // 监听模态框显示，初始化表单
        showModal(newVal) {
            if (newVal) {
                this.init();
            }
        }
    },
    created() {
        // 组件创建时加载巡检模板数据
        this.fetchData();
        // 加载分组列表数据
        this.loadGroupList();
    },
    methods: {
        // 单次执行
        startGots(form) {
            console.log(form);

            this.$modal
                .confirm(this.$t('common.areYouSureYouWantToExecuteTheCurrentStrategy'))
                .then(() => {  // 箭头函数
                    startGot(form.id).then((res) => {
                        if (res) {
                            this.$message.success(this.$t('common.executionSuccess'));
                            this.handleSearch();  // 此时 this 指向组件实例
                        }

                    });
                })
                .catch(() => { });
        },
        // 加载分组列表
        loadGroupList() {
            getAssetGroup().then((res) => {
                if (res.code === 0 && res.data && Array.isArray(res.data)) {
                    this.groupOptions = res.data.map(group => ({
                        value: String(group.id),
                        label: group.name
                    }));
                }
            }).catch(() => {
                this.$message.error(this.$t('common.failedToGetGroupList'));
            });
        },
        getUserOptions() {
            let params = {
                pageSize: 999,
                pageNo: 1,

            }
            getNotificationGroup(params).then((res) => {
                let userOptions = res.data && res.data.list;
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
                // this.fetchData();
            });
        },
        // cron表达式
        changeCron(val) {
            console.log(val, 'val123');

            // const arrVal = val.trim().split(/\s+/)
            // arrVal[0] = '0'
            // const cronD = arrVal.join(' ')
            this.form.cycleCron = val
        },
        // 处理日期选择器显示状态变化
        handleDateTimePickerVisibleChange(visible) {
            this.isPickerVisible = visible;
            if (visible) {
                const now = new Date();
                now.setSeconds(0, 0);
                this.lastValidTime = this.form.singleHandleTime || now;

                const currentDate = new Date(this.form.singleHandleTime || now);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = currentDate.toDateString() === today.toDateString();

                if (isToday) {
                    const hours = now.getHours().toString().padStart(2, '0');
                    const minutes = now.getMinutes().toString().padStart(2, '0');
                    this.pickerOptions.selectableRange = `${hours}:${minutes} - 23:59`;
                } else {
                    this.pickerOptions.selectableRange = '00:00 - 23:59';
                }
            }
        },
        // 新增：选中时间后校验是否为过去时间
        handleTimeChange(time) {
            if (!time) return;

            const selectedTime = new Date(time);
            const now = new Date();
            now.setSeconds(0, 0); // 忽略秒数差异

            // 如果选中时间在当前时间之前，强制回滚到上次有效时间
            if (selectedTime.getTime() < now.getTime()) {
                this.form.singleHandleTime = this.lastValidTime;
                this.$message.warning(this.$t('common.cannotSelectPastTime'));
            } else {
                this.lastValidTime = time; // 更新有效时间记录
            }
        },
        // 处理日期时间选择器显示变化事件
        // handleDateTimePickerVisibleChange(visible) {
        //     if (visible) {
        //         // 当选择器弹出时，更新时间选择范围
        //         const now = new Date();
        //         // 由于只选到分钟，将秒数设为0
        //         now.setSeconds(0, 0);
        //         const hours = now.getHours().toString().padStart(2, '0');
        //         const minutes = now.getMinutes().toString().padStart(2, '0');
        //         this.pickerOptions.selectableRange = `${hours}:${minutes} - 23:59`;
        //     }
        // },
        // // cron表达式变化监听
        // cronChange(val) {
        //     this.form.cycleCron = val;
        // },
        // // 保存cron表达式
        // cronConfirm() {
        //     this.showCronModal = false;
        // },
        // 获取巡检模板数据
        fetchData() {
            console.log(111111);

            let params = { pageSize: 99, pageNo: 1 }
            inspectionList(params).then((res) => {
                let userOptions = res.data && res.data.list;
                // 添加空值检查，确保即使返回数据为空也不会报错
                if (userOptions && Array.isArray(userOptions)) {
                    this.insoestionMbList = userOptions.map(item => ({
                        label: item.templateName,
                        value: String(item.id),
                        disabled: false
                    }));
                } else {
                    this.insoestionMbList = [];
                }
                console.log(this.insoestionMbList, ' this.insoestionMbList');

            });
        },

        // 巡检模板选择变化处理
        oninspectionIdChange(index, val) {
            console.log(index, val, 'index, val');

            // 当巡检模板变化时，清空对应的设备类型
            console.log(this.form, 'this.form')
            this.form.inspectionList[index].assetIdList = [];
            // 初始化设备选项数组
            this.form.inspectionList[index].deviceOptions = [];

            const targetIds = new Set(this.form.inspectionList.map(item => item.inspectionId));
            this.insoestionMbList = this.insoestionMbList.map(option => {
                // 若当前 option 的 value 存在于 targetIds 中，修改 disabled 为 true，否则保持原状态
                return targetIds.has(option.value)
                    ? { ...option, disabled: true }  // 浅拷贝对象，避免修改原数据
                    : { ...option, disabled: false };
            });
            console.log(this.insoestionMbList);

            // 加载对应模板下的设备类型
            if (val) {
                assetList({ templateId: val }).then((res) => {
                    console.log(res, 'res');
                    let templateList = res.data && res.data.list;

                    // 为当前巡检资源项存储独立的设备列表，筛选出snmpStatus==2的数据
                    const deviceOptions = templateList
                        .filter(item => item.snmpStatus === 2) // 筛选snmpStatus==2的数据
                        .map(item => ({
                            label: item.assetName,
                            value: String(item.id)
                        }));

                    // 只更新当前项的deviceOptions，不再更新全局sourceDevices
                    this.form.inspectionList[index].deviceOptions = deviceOptions;
                    console.log(this.form.inspectionList[index].deviceOptions);

                })
            }
        },

        // 资源类型选择变化处理
        onResourceTypeChange(index, val) {
            console.log(index, val, 'resource type change');

            // 当资源类型变化时，清空相关字段
            if (val === 'all') {
                // 选择全部，清空分组和选中资源
                this.form.inspectionList[index].groupIdList = [];
                this.form.inspectionList[index].assetIdList = [];
            } else if (val === 'group') {
                // 选择分组，清空选中资源
                this.form.inspectionList[index].assetIdList = [];
            } else if (val === 'selected') {
                // 选择选中，清空分组
                this.form.inspectionList[index].groupIdList = [];
            }
        },

        changeType(index, val) {
            // 资源类型变化后的处理逻辑
            console.log('设备类型变化:', index, val);


        },




        changeSourceList(index, value, type) {
            let params = {
                "pageNo": 1,
                "pageSize": 100,
                "isManaged": null,
                "modelCode": value,
                "conditions": [],
                "status": 1,
                "isMonitorAble": true
            };
            getAssetInfoPage(params).then((res) => {
                this.sourceList[index] = res.data.list.map(item => ({
                    label: item.assetAttribute?.name || '',
                    value: item.id + ''
                }));
                if (type === 'edit') {
                    this.form.inspectionList[index].rightValue = [];
                }
                this.$forceUpdate();
            });
        },
        getModelList() {
            getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
                this.sourceConditionFields = res.data.list.map(item => ({
                    label: item.modelName,
                    value: item.modelCode
                })) || [];
            });
        },
        // 下一步：查看模式已隐藏按钮，无需处理
        nextStep() {
            let valid = true;
            // 仅编辑模式执行校验
            if (this.activeStep === 0 && !this.isView) {
                // 1. 校验基本信息字段
                this.$refs.form.validateField(
                    ["ruleName", "ruleSwitch",],
                    (error) => { valid = !error; }
                );
                // 2. 校验资源配置
                this.form.inspectionList.forEach((cond, index) => {
                    this.$refs.form.validateField(`inspectionList[${index}].leftValue`, (error) => {
                        if (error) valid = false;
                    });
                    this.$refs.form.validateField(`inspectionList[${index}].operator`, (error) => {
                        if (error) valid = false;
                    });
                    if (cond.operator === 'in') {
                        this.$refs.form.validateField(`inspectionList[${index}].rightValue`, (error) => {
                            if (error) valid = false;
                        });
                    }
                });
            }
            if (valid) this.activeStep++;
        },

        // 上一步：查看模式已隐藏按钮，无需处理
        prevStep() {
            this.activeStep--;
        },

        // 表单通用校验器
        getFormValidator(max = 50, min = 0, name = "", checkSpecialChars = false) {
            return (rule, value, callback) => {
                if (value === undefined || value === "") {
                    return min > 0 ? callback(new Error(`${name}不能为空`)) : callback();
                }
                if ((value + "").indexOf(" ") > -1) {
                    return callback(new Error("请勿输入空格"));
                }
                if (value.length > max) {
                    return callback(new Error(`${name}长度不超过${max}个字符`));
                }
                if (value.length < min) {
                    return callback(new Error(`${name}长度不低于${min}个字符`));
                }
                if (checkSpecialChars) {
                    const reg = /[!@#$%^&*(),.?":{}|<>]/;
                    if (reg.test(value)) {
                        return callback(new Error(`${name}不能包含特殊字符`));
                    }
                }
                callback();
            };
        },





        // 新增资源配置条件
        handleAddSourceCond() {
            this.form.inspectionList.push({
                inspectionId: "",
                assetIdList: [],
                resourceType: '',
                groupIdList: [],
                // groupIdList: [], // 添加groupIdList字段
                isAllAsset: false, // 添加isAllAsset字段
                deviceOptions: [] // 初始化设备选项数组
            });
        },

        // 删除资源配置行
        handleDelSourceRow(index) {
            this.form.inspectionList.splice(index, 1);
            console.log(this.form.inspectionList, ' this.form.inspectionList');
            const targetIds = new Set(this.form.inspectionList.map(item => item.inspectionId));
            this.insoestionMbList = this.insoestionMbList.map(option => {
                // 若当前 option 的 value 存在于 targetIds 中，修改 disabled 为 true，否则为 false
                return targetIds.has(option.value)
                    ? { ...option, disabled: true }  // 浅拷贝对象，避免修改原数据
                    : { ...option, disabled: false };
            });
        },

        // 加载所有巡检资源项的设备选项
        loadAllDeviceOptions() {
            // 遍历每个巡检资源项
            this.form.inspectionList.forEach((item, index) => {
                const inspectionId = item.inspectionId;
                // 如果有模板ID，调用接口获取设备列表
                if (inspectionId) {
                    assetList({ templateId: inspectionId }).then((res) => {
                        console.log(`获取模板${inspectionId}的设备列表:`, res.data);
                        let templateList = res.data && res.data.list;
                        const deviceOptions = templateList.map(device => ({
                            label: device.assetName,
                            value: String(device.id)
                        }));

                        // 更新当前巡检资源项的设备选项
                        this.$set(this.form.inspectionList[index], 'deviceOptions', deviceOptions);
                        console.log(`模板${inspectionId}的设备选项已更新`);

                        // 确保assetIdList中的ID都是字符串类型，以便正确匹配并显示名称
                        if (item.assetIdList && item.assetIdList.length > 0) {
                            const stringIdList = item.assetIdList.map(id => String(id));
                            this.$set(this.form.inspectionList[index], 'assetIdList', []);
                            // 使用nextTick确保DOM更新后再设置值
                            this.$nextTick(() => {
                                this.$set(this.form.inspectionList[index], 'assetIdList', stringIdList);
                            });
                            console.log(`已更新模板${inspectionId}的assetIdList类型`);
                        }
                    }).catch(error => {
                        console.error(`获取模板${inspectionId}的设备列表失败:`, error);
                    });
                }
            });
        },
        handleAdd() {
            this.isShowTab = 'xj';
            this.$refs.objModal.showModal = true;
        },


        // 初始化表单
        init(row) {
            // 初始化基本参数
            this.activeStep = 0;

            // 无论新增还是编辑，先重置表单
            this.$nextTick(() => {
                this.$refs.form && this.$refs.form.resetFields();
            });
            console.log(this.editId, 'this.editId');
            this.getUserOptions();
            // 有editId时获取详情数据
            if (this.editId) {
                // 设置为编辑模式
                this.opt = this.opt === this.$t('common.copy') ? this.$t('common.copy') : this.$t('common.editInspectionStrategy');
                this.getRuleDetail();
            } else {
                this.opt = this.$t('common.addInspectionStrategy');
                // 重新加载巡检模板列表，确保处于初始状态
                this.fetchData();
                // 初始化空表单
                this.form = {
                    name: '',
                    status: false,
                    handleType: "SINGLE",
                    singleHandleTime: null,
                    cycleCron: null,
                    description: "",
                    isNotice: false,
                    noticeobjId: null,
                    radioPc: 1,
                    noticeObjIdList: [],
                    // 初始化巡检资源列表
                    inspectionList: [{
                        inspectionId: '',
                        assetIdList: [],
                        resourceType: '',
                        groupIdList: [],
                        isAllAsset: false,
                        deviceOptions: []
                    }]
                };
                this.sourceDevices = [];
            }
        },

        // 获取详情
        getRuleDetail() {
            // 调用接口获取详情数据
            inspectionDetail(this.editId).then((res) => {
                try {
                    if (res && res.data) {
                        console.log('获取策略详情:', res.data);
                        // 根据不同状态处理数据
                        const detailData = JSON.parse(JSON.stringify(res.data));

                        // 复制状态：重置ID并添加副本后缀
                                if (this.opt === this.$t('common.copy')) {
                                    detailData.id = '';
                                    detailData.name = `${detailData.name}-${this.$t('common.copy')}`;
                                    detailData.status = false;
                                } else {
                            // 确保status字段在编辑和详情状态下正确回显
                            // 将status值转换为布尔类型，确保与switch组件兼容
                            detailData.status = Boolean(detailData.status);
                        }

                        // 将handleType映射到radioPc
                        if (detailData.handleType) {
                            detailData.radioPc = detailData.handleType === 'SINGLE' ? 1 : 2;
                        } else {
                            detailData.radioPc = 1; // 默认单次
                        }

                        // detailData.mergeFields = ["8", "6"];
                        detailData.cycleCron = detailData.cycleCron ? detailData.cycleCron + '*' : detailData.cycleCron;

                        // 处理inspectionList格式 - 采用更直接的方式避免响应式问题
                        if (!detailData.inspectionList || !detailData.inspectionList.length) {
                            detailData.inspectionList = [{ inspectionId: "", assetIdList: [] }];
                        } else {
                            // 创建一个全新的数组，避免引用问题
                            const newInspectionList = [];
                            console.log(detailData.inspectionList, 'detailData.inspectionList');

                            for (let i = 0; i < detailData.inspectionList.length; i++) {
                                const item = detailData.inspectionList[i];
                                const inspectionId = String(item.inspectionId || "");
                                let assetIdList = [];

                                // 优先从assetList提取
                                if (item.assetList && item.assetList.length > 0) {
                                    console.log('原始item数据:', item);
                                    // 直接创建新数组，不依赖map方法可能的响应式问题
                                    const extractedIds = [];
                                    for (let j = 0; j < item.assetList.length; j++) {
                                        const asset = item.assetList[j];
                                        // 添加null检查，防止访问null的属性
                                        if (asset && asset.id) {
                                            extractedIds.push(asset.id);
                                        }
                                    }
                                    assetIdList = extractedIds;
                                    console.log('提取的assetIdList:', assetIdList);
                                }
                                // 确保assetIdList始终是数组
                                if (!Array.isArray(assetIdList) || assetIdList.length === 0) {
                                    // 如果没有assetList或提取失败，尝试使用item.assetIdList
                                    if (Array.isArray(item.assetIdList)) {
                                        assetIdList = item.assetIdList.map(id => id);
                                    } else {
                                        assetIdList = [];
                                    }
                                }

                                // 确定resourceType
                                let resourceType = '';
                                if (item.isAllAsset) {
                                    resourceType = 'all'; // 全部状态
                                } else if (item.groupIdList && item.groupIdList.length > 0) {
                                    resourceType = 'group'; // 分组状态
                                } else if ((item.assetList && item.assetList.length > 0) || (item.assetIdList && item.assetIdList.length > 0)) {
                                    resourceType = 'selected'; // 选中状态
                                }

                                // 将groupIdList中的id转换为字符串类型，与groupOptions的value类型保持一致
                                const stringGroupIdList = item.groupIdList ? item.groupIdList.map(id => String(id)) : [];

                                // 创建新对象并添加到数组
                                newInspectionList.push({
                                    inspectionId,
                                    assetIdList,
                                    resourceType,
                                    groupIdList: stringGroupIdList, // 使用字符串类型的groupIdList
                                    isAllAsset: item.isAllAsset || false,
                                    groupIds: stringGroupIdList, // 使用字符串类型的groupIds
                                    deviceOptions: [] // 初始化空的设备选项数组
                                });
                            }

                            // 直接赋值，不使用map方法
                            detailData.inspectionList = newInspectionList;
                            console.log('最终处理后的inspectionList:', detailData.inspectionList);
                        }
                        console.log('完整的detailData:', detailData);

                        // 赋值给表单
                        this.form = detailData;

                        // 然后根据每个模板ID调用接口获取完整的设备列表
                        this.loadAllDeviceOptions();
                        const targetIds = new Set(this.form.inspectionList.map(item => item.inspectionId));
                        this.insoestionMbList = this.insoestionMbList.map(option => {
                            // 若当前 option 的 value 存在于 targetIds 中，修改 disabled 为 true
                            return targetIds.has(option.value)
                                ? { ...option, disabled: true }
                                : { ...option, disabled: false };
                        });

                        // 最后再次检查并记录
                        console.log('赋值给form后的inspectionList:', this.form.inspectionList);

                        // 初始化sourceDevices数组 - 使用第一个巡检资源项的设备列表
                        if (this.form.inspectionList && this.form.inspectionList.length > 0 && this.form.inspectionList[0].deviceOptions) {
                            this.sourceDevices = this.form.inspectionList[0].deviceOptions;
                            console.log('初始化sourceDevices:', this.sourceDevices);
                        } else {
                            this.sourceDevices = [];
                        }
                    }
                } catch (dataProcessingError) {
                    console.error('处理策略详情数据时发生错误:', dataProcessingError);
                    this.$message.error(this.$t('common.errorProcessingData'));
                }
            }).catch(error => {
                console.error('API调用失败:', error);
                this.$message.error(this.$t('common.failedToGetData1'));
            });


        },

        // 取消/关闭
        cancel() {
            this.showModal = false;
        },

        // 提交表单（查看模式不会触发，因提交按钮已隐藏）
        handleSubmit(name) {
            // 详情模式下不允许提交表单
            console.log(name, this.isView, this.opt);

            if (this.isView) {
                console.log('详情模式下不允许提交表单');
                return;
            }

            this.$refs[name].validate((valid) => {
                if (valid) {
                    // 校验巡检资源：只要添加了就必填
                    let inspectionValid = true;
                    let errorMsg = '';

                    if (this.form.inspectionList && this.form.inspectionList.length > 0) {
                        for (let i = 0; i < this.form.inspectionList.length; i++) {
                            const item = this.form.inspectionList[i];
                            if (!item.inspectionId) {
                                inspectionValid = false;
                                errorMsg = this.$t('common.inspectionResourceTemplateCannotBeEmpty', { row: i + 1 });
                                break;
                            }
                            if (!item.resourceType) {
                                inspectionValid = false;
                                errorMsg = this.$t('common.resourceTypeCannotBeEmpty', { row: i + 1 });
                                break;
                            }
                            if (item.resourceType === 'group') {
                                if (!item.groupIdList || item.groupIdList.length === 0) {
                                    inspectionValid = false;
                                    errorMsg = this.$t('common.pleaseSelectGroupForRow', { row: i + 1 });
                                    break;
                                }
                            } else if (item.resourceType === 'selected') {
                                if (!item.assetIdList || item.assetIdList.length === 0) {
                                    inspectionValid = false;
                                    errorMsg = this.$t('common.pleaseSelectResourceForRow', { row: i + 1 });
                                    break;
                                }
                            }
                            // 全部类型不需要额外验证
                        }
                    }

                    if (!inspectionValid) {
                        this.$message.error(errorMsg);
                        return;
                    }

                    // 整理提交数据 - 深拷贝避免修改原始表单数据
                    const submitData = JSON.parse(JSON.stringify(this.form));
                    if (submitData.status) {
                        submitData.status = 1
                    } else {
                        submitData.status = 0
                    }
                    if (submitData.radioPc == 1) {
                        submitData.handleType = 'SINGLE'
                    } else {
                        submitData.handleType = 'CYCLE'
                    }
                    submitData.cycleCron = submitData.cycleCron ? submitData.cycleCron.slice(0, -1) : submitData.cycleCron;

                    // 处理inspectionList，添加groupIdList和isAllAsset字段
                    if (submitData.inspectionList && Array.isArray(submitData.inspectionList)) {
                        submitData.inspectionList.forEach(item => {
                            // 根据resourceType设置相应字段
                            if (item.resourceType === 'group') {
                                // 分组类型：添加groupIdList字段并转换为数字类型
                                item.groupIdList = item.groupIdList ? item.groupIdList.map(id => Number(id)) : [];
                                item.isAllAsset = false;
                            } else if (item.resourceType === 'all') {
                                // 全部类型：设置isAllAsset为true
                                item.isAllAsset = true;
                            } else {
                                // 其他类型：设置isAllAsset为false
                                item.isAllAsset = false;
                            }
                        });
                    }

                    // 提交接口
                    console.log(submitData, 'submitData');

                    this.isSubmitDisabled = true;
                    if (this.opt == this.$t('common.addInspectionStrategy')) {
                        strategyAdd(submitData).then((res) => {
                            this.isSubmitDisabled = false;
                            if (res.data) {
                                this.$modal.msgSuccess(this.$t('common.addStrategySuccess'));
                                this.showModal = false;
                                this.$emit("refreshLists");
                            } else {
                                this.$modal.msgError(res.message);
                            }
                        })
                            .catch((error) => {
                                this.isSubmitDisabled = false;
                            });
                    } else if (this.opt == this.$t('common.editInspectionStrategy')) {
                        console.log(submitData, 'submitData');

                        strategyUpdate(submitData).then((res) => {
                            this.isSubmitDisabled = false;
                            if (res.data) {
                                this.$modal.msgSuccess(this.$t('common.editStrategySuccess'));
                                this.showModal = false;
                                this.$emit("refreshLists");
                            } else {
                                this.$modal.msgError(res.message);
                            }
                        })
                            .catch((error) => {
                                this.isSubmitDisabled = false;
                            });
                    } else {

                    }

                }
            });
        },


    }
};
</script>

<style scoped lang="less">
.tag :deep(.el-form-item__label:before) {
    content: "*";
    color: #ff4949;
    margin-right: 4px;
}

.m-table {
    width: 100%;
    margin-bottom: 15px;

    .t-head {
        th {
            padding: 8px 0;
            background-color: #edf0f6;

            &:first-child {
                width: 30%;
            }

            &:nth-child(2) {
                width: 30%;
            }

            &:nth-child(3) {
                width: 30%;
            }

            &:nth-child(4) {
                width: 10%;
            }
        }
    }

    td {
        :deep(.el-button--small) {
            font-size: 14px;
        }

        :deep(.el-form-item) {
            margin-bottom: 0;
        }
    }
}

.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}

.tag-style {
    border: 1px solid #dcdfe6;
    padding: 4px;
    margin: 0 8px;
}

/* 步骤条样式 */
.el-steps {
    margin-bottom: 20px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
    text-align: right;
    margin-top: 20px;

    :deep(.el-button) {
        margin-left: 8px;
    }
}

/* 卡片样式调整 */
:deep(.ant-card) {
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

/* 输入框间距调整 */
:deep(.el-row--flex) {
    align-items: center;
}

/* 提示文本样式 */
:deep(.el-form-item__error) {
    font-size: 12px;
    padding: 2px 5px;
}

/deep/ .ant-drawer-wrapper-body {
    overflow: hidden;
}

/* 查看模式：区域标题样式（优化视觉分隔） */
.view-mode-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2329;
    margin: 20px 0 12px;
    padding-left: 8px;
    border-left: 4px solid #1890ff;
}

/* 查看模式：步骤内容间距（避免区域重叠） */
.step-content {
    margin-bottom: 16px;
}

::v-deep .el-icon-question {
    color: #1890ff;
}
</style>
<style>
.popStyle {
    transform: translate3d(380px, 150px, 0px) !important;
}
</style>