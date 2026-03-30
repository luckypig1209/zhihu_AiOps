<template>
  <a-drawer :title="isView ? $t('common.view') : opt" :visible="showModal" width="1080px" placement="right" :closable="true"
    :mask-closable="false" @close="cancel">
    <div style="height: 80vh;overflow-y: auto;padding: 0 16px;">
      <!-- 步骤条：查看模式隐藏 -->
      <el-steps :active="activeStep" finish-status="success" simple :disabled="isView" v-if="!isView">
        <el-step :title="$t('common.basicInfo')"></el-step>
        <el-step :title="$t('common.ruleConfig')"></el-step>
        <el-step :title="$t('common.notificationConfig')"></el-step>
      </el-steps>

      <!-- 查看模式：添加区域标题分隔，优化视觉结构 -->
      <div v-if="isView" class="view-mode-title">{{ $t('common.basicInfo') }}</div>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <!-- Step 1: 基本信息配置 - 查看模式始终显示 -->
        <div v-show="!isView ? activeStep === 0 : true" class="step-content">
          <el-row>
            <el-col :span="22">
              <el-form-item prop="ruleName" :label="$t('common.ruleName')">
                <el-input type="text" v-model.trim="form.ruleName" maxlength="40" :placeholder="$t('common.enterRuleName')"
                  :disabled="isView">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="source" :label="$t('common.applicableResources')">
                <!-- 新增资源配置按钮：查看模式隐藏 -->
                <el-col :span="21" style="margin-bottom: 10px" v-if="!isView">
                  <el-button type="primary" icon="el-icon-plus" size="small"
                    @click="handleAddSourceCond">{{ $t('common.addResourceConfig') }}</el-button>
                </el-col>

                <el-col :span="22">
                  <!-- 替换原有table为flex布局的循环结构 -->
                  <div v-if="form.sourceConditions.length == 0 && isView">{{ $t('common.all') }}</div>
                  <div v-else
                    v-for="(item, index) in form.sourceConditions"
                    :key="`source_${index}`"
                    style="display: flex; gap: 10px; margin-bottom: 20px; align-items: center;"
                  >
                    <!-- 第一列：资源类型选择（仍保留el-select，仅替换资产和分组） -->
                    <el-select 
                      :disabled="isView" 
                      :placeholder="$t('common.selectResourceModel')" 
                      v-model="item.leftValue"
                      @change="changeSourceList(index, item.leftValue, 'edit')"
                      clearable
                      filterable
                      style="width: 25%;"
                    >
                      <el-option
                        v-for="field in sourceConditionFields"
                        :key="field.value"
                        :label="field.label"
                        :value="field.value"
                        :disabled="field.disabled"
                      />
                    </el-select>

                    <!-- 第二级：全部/分组/选中（仍保留el-select） -->
                    <el-select
                      :disabled="isView || !item.leftValue"
                      :placeholder="$t('common.pleaseSelect')"
                      v-model="item.resourceType"
                      @change="(val) => onResourceTypeChange(index, val, true)"
                      style="width: 15%;"
                    >
                      <el-option :label="$t('common.all')" value="all" />
                      <el-option :label="$t('common.group')" value="group" />
                      <el-option :label="$t('common.selected')" value="selected" />
                    </el-select>

                    <!-- 第三列：分组选择（仅分组时显示）- 替换为a-select -->
                    <a-select
                      v-if="item.resourceType === 'group' && !isView"
                      :disabled="isView || !item.leftValue"
                      mode="multiple"
                      :placeholder="$t('common.selectGroup')"
                      v-model="item.groupIdList"
                      allowClear
                      showSearch
                      style="width: 55%;"
                      :max-tag-count="3"
                      :collapse-tags="!isView"
                      :not-found-content="$t('common.noData')"
                    >
                       <a-select-option v-for="group in groupOptions" :key="`group_${group.id}`"
                                    :value="group.id + ''">
                                    {{ group.name }}
                                </a-select-option>
                    </a-select>

                    <a-select
                      v-if="item.resourceType === 'group' && isView"
                      :disabled="isView || !item.leftValue"
                      mode="multiple"
                      :placeholder="$t('common.selectGroup')"
                      v-model="item.groupIdList"
                      allowClear
                      showSearch
                      style="width: 55%;"
                      :not-found-content="$t('common.noData')"
                               
                    >
                       <a-select-option v-for="group in groupOptions" :key="`group_${group.id}`"
                                    :value="group.id + ''">
                                    {{ group.name }}
                                </a-select-option>
                    </a-select>                    

                    <!-- 第三列：资源选择（仅选中时显示）- 替换为a-select -->
                    <a-select
                      v-if="item.resourceType === 'selected' && !isView"
                      :disabled="isView || !item.leftValue"
                      mode="multiple"
                      v-model="item.rightValue"
                      allowClear
                      showSearch
                      :placeholder="$t('common.selectResource')"
                      style="width: 55%;"
                      :collapse-tags="!isView"
                      :options="sourceList[index]"
                      :max-tag-count="3"
                      :not-found-content="$t('common.noData')"
                    >
                    </a-select>
                    
                    <a-select
                      v-if="item.resourceType === 'selected' && isView"
                      :disabled="isView || !item.leftValue"
                      mode="multiple"
                      v-model="item.rightValue"
                      allowClear
                      showSearch
                      :placeholder="$t('common.selectResource')"
                      style="width: 55%;"
                      :options="sourceList[index]"
                      :not-found-content="$t('common.noData')"
                    >
                    </a-select>                    

                    <!-- 全选按钮（仅选中模式显示，注释保留） -->
                    <!-- <el-button
                      v-if="item.resourceType === 'selected' && !isView"
                      type="primary"
                      size="mini"
                      style="margin-left: 5px;"
                      @click="handleSelectAll(index)"
                    >全选</el-button> -->

                    <!-- 删除按钮 -->
                    <div
                      v-if="form.sourceConditions.length > 1 && !isView"
                      @click="handleDelSourceRow(index)"
                      style="cursor: pointer; margin-left: 5px;"
                    >
                      <i class="el-icon-remove-outline" style="color: red;"></i>
                    </div>
                  </div>
                </el-col>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="ruleDesc" :label="$t('common.ruleDesc')">
                <el-input type="textarea" v-model.trim="form.ruleDesc" maxlength="40" :placeholder="$t('common.enterRuleDesc')"
                  :disabled="isView">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="ruleSwitch" :label="$t('common.ruleSwitch')">
                <el-switch v-model="form.ruleSwitch" active-color="#409EFF" inactive-color="#cccccc"
                  :active-value="true" :inactive-value="false" :disabled="isView">
                </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 查看模式：添加区域标题分隔 -->
        <div v-if="isView" class="view-mode-title">{{ $t('common.ruleConfig') }}</div>
        <!-- Step 2: 规则配置 - 查看模式始终显示 -->
        <div v-show="!isView ? activeStep === 1 : true" class="step-content">
          <el-row>
            <el-col :span="21" :offset="1">
              <table class="m-table">
                <tr class="t-head">
                  <th>{{ $t('common.field') }}</th>
                  <th>{{ $t('common.contains') }}</th>
                  <th>{{ $t('common.value') }}</th>
                  <!-- 移除条件配置列表头 -->
                  <th v-if="!isView"></th> <!-- 操作列：查看模式隐藏 -->
                </tr>
                <tr v-for="(row, index) in form.ruleConditions" :key="row.id || index" style="line-height: 66px">
                  <td style="padding-top: 10px;">
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].leftValue'" label=""
                      label-width="0" :rules="{ required: true, trigger: 'change' }" :show-message="false">
                      <el-select v-model="form.ruleConditions[index].leftValue" filterable :disabled="isView">
                        <el-option v-for="field in setRuleConditionFields" :key="field.value" :label="field.label"
                          :value="field.value" />
                      </el-select>
                    </el-form-item>
                  </td>
                  <td style="padding-top: 10px;">
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].operator'" label=""
                      label-width="0" :rules="{ required: true, trigger: 'change' }" :show-message="false">
                      <el-select v-model="form.ruleConditions[index].operator" :disabled="isView">
                        <el-option value="contains" :label="$t('common.contains')"></el-option>
                        <el-option value="not contains" :label="$t('common.notContains')"></el-option>
                        <el-option value="in" :label="$t('common.containsIn')"></el-option>
                        <el-option value="not in" :label="$t('common.notContainsIn')"></el-option>
                      </el-select>
                    </el-form-item>
                  </td>
                  <td style="padding-top: 10px;">
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].rightValue'"
                      label-width="0" :rules="{
                        required: true,
                        max: 64,
                        trigger: ['blur', 'change'],
                        message: $t('common.enterValueMax64'),
                      }" :show-message="true">
                      <!-- 严重性字段：下拉选择 -->
                      <el-select 
                        v-if="form.ruleConditions[index].leftValue === 'alarmLevel'" 
                        v-model="form.ruleConditions[index].rightValue" 
                        :placeholder="$t('common.selectSeverity')" 
                        :disabled="isView"
                        clearable
                      >
                        <el-option 
                          v-for="item in alarmLevelOptions" 
                          :key="item.value" 
                          :label="item.label" 
                          :value="item.value"
                        />
                      </el-select>
                      <!-- 状态字段：下拉选择 -->
                      <el-select 
                        v-else-if="form.ruleConditions[index].leftValue === 'alarmStatus'" 
                        v-model="form.ruleConditions[index].rightValue" 
                        :placeholder="$t('common.selectStatus')" 
                        :disabled="isView"
                        clearable
                      >
                        <el-option 
                          v-for="item in alarmStatusOptions" 
                          :key="item.value" 
                          :label="item.label" 
                          :value="item.value + ''"
                        />
                      </el-select>
                      <!-- 其他字段：保持原有输入框 -->
                      <el-input 
                        v-else
                        v-model="form.ruleConditions[index].rightValue" 
                        maxlength="64"
                        :placeholder="$t('common.enterValueMax64')" 
                        :disabled="isView"
                      ></el-input>
                    </el-form-item>
                  </td>
                  <!-- 移除条件配置列内容 -->
                  <td v-if="!isView" style="padding-top: 10px;">
                    <!-- 删除规则按钮：查看模式隐藏 -->
                    <el-button type="danger" size="small" icon="el-icon-delete"
                      @click="handleDelRow(index)">{{ $t('common.delete') }}</el-button>
                  </td>
                </tr>
              </table>
            </el-col>
            <!-- 添加规则按钮：查看模式隐藏 -->
            <el-col :span="21" :offset="1" v-if="!isView">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddCond">{{ $t('common.addRule') }}</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- 查看模式：添加区域标题分隔 -->
        <div v-if="isView" class="view-mode-title">{{ $t('common.notificationConfig') }}</div>
        <!-- Step 3: 通知配置 - 查看模式始终显示 -->
        <div v-show="!isView ? activeStep === 2 : true" class="step-content">
          <el-row>
            <el-col :span="22">
              <el-form-item prop="timeRange" :label="$t('common.notificationTime')">
                <template #label>
                  <span>{{ $t('common.notificationTime') }}</span>
                  <el-tooltip :content="$t('common.notificationTimeTooltip')" placement="top">
                    <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
                  </el-tooltip>
                </template>
                <el-time-picker is-range v-model="form.timeRange" :clearable="true" :range-separator="$t('common.to')"
                  :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')" value-format="HH:mm:ss" format="HH:mm"
                  @change="timeChange" :placeholder="$t('common.selectTimeRange')" :disabled="isView">
                </el-time-picker>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="mergeFields" :label="$t('common.notificationObject')">
                <div style="display: flex;">
                  <el-select style="width: 356px" v-model="form.mergeFields" multiple filterable :placeholder="$t('common.selectNotificationObject')"
                    :disabled="isView">
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
      </el-form>
    </div>
    <div class="dialog-footer">
      <!-- 步骤切换按钮：查看模式完全隐藏（无需浏览步骤） -->
      <el-button v-if="activeStep > 0 && !isView" @click="prevStep" :disabled="isSubmitDisabled">{{ $t('common.prevStep') }}</el-button>
      <el-button v-if="activeStep < 2 && !isView" type="primary" @click="nextStep"
        :disabled="isSubmitDisabled">{{ $t('common.nextStep') }}</el-button>
      <!-- 提交按钮：查看模式隐藏 -->
      <el-button v-if="activeStep === 2 && !isView" type="primary" @click="handleSubmit('form')"
        :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
      <!-- 取消按钮：查看模式显示为“关闭” -->
      <el-button @click="cancel" :disabled="isSubmitDisabled">
        {{ isView ? $t('common.close') : $t('common.cancel') }}
      </el-button>
    </div>
    <!-- 配置通知对象弹窗：查看模式隐藏 -->
    <obj-modal ref="editModal" :rowData="{}" @refreshList="fetchData" v-if="!isView"></obj-modal>
  </a-drawer>
</template>

<script>
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import {
  getAssetInfoPage,
  getAssetModelPage,
  getAssetGroup
} from "@/api/resource";
import objModal from './objModal.vue'
import { updateMessage, getRuleDetail } from "@/api/monitor/task";
import { getNotificationGroup } from "@/api/notice/notice";
export default {
  name: "formEdit",
  components: { objModal },
  props: {
    rowData: Object,
    // 新增：查看模式控制参数（父组件传递，true为查看模式）
    isView: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      userOptions: [],
      sourceConditionFields: [],
      sourceList: [],
      groupOptions: [], // 新增：分组列表
      originGroupOptions: [],
      activeStep: 0, // 当前步骤（编辑模式用，查看模式不影响）
      isSubmitDisabled: false,
      opt: this.$t('common.add'),
      isAdd: true,
      loading: false,
      showModal: false,
      disabled: false,
      formLoad: false,
      // 表单数据
      form: {
        ruleName: "",
        ruleSwitch: true,
        ruleType: "",
        ruleDesc: "",
        ruleTag: "",
        dispatchProcessId: "",
        dispatchProcessName: "",
        ruleLayer: "",
        dispatchDelay: undefined,
        startTime: "", // 通知开始时间，默认为空字符串
        endTime: "",   // 通知结束时间，默认为空字符串
        mergeFields: [],
        dispatchTime: "",
        ruleConditions: [], // 规则配置条件
        sourceConditions: [], // 资源配置条件
        timeRange: null, // 通知时间范围，默认为空
        mergeFields: [], //通知对象
      },
      // 派单流程列表
      orderProgressList: [],
      // 标签输入值
      inputValue: "",
    };
  },
  computed: {
    // 规则配置字段（去重禁用）- 仅作用于规则配置
    setRuleConditionFields() {
      let fields = [];
      this.ruleConditionFields.forEach((field) => {
        let flag = false;
        this.form.ruleConditions.forEach((cd) => {
          if (cd.leftValue === field.value) flag = true;
        });
        fields.push({
          label: field.label,
          value: field.value,
          disabled: flag
        });
      });
      return fields;
    },
    // 严重性下拉选项
    alarmLevelOptions() {
      return [
        { label: this.$t('common.warning'), value: '1' },
        { label: this.$t('common.normal'), value: '2' },
        { label: this.$t('common.critical'), value: '3' },
        { label: this.$t('common.urgent'), value: '4' },
      ]
    },
    // 状态下拉选项
    alarmStatusOptions() {
      return [
        { value: 0, label: this.$t('common.notRecovered') },
        { value: 1, label: this.$t('common.recovered') },
      ]
    },
    // 规则条件字段
    ruleConditionFields() {
      return [
        { value: "alarmTitle", label: this.$t('common.alarmName') },
        { value: "alarmLevel", label: this.$t('common.severity') },
        { value: "alarmStatus", label: this.$t('common.status') },
        { value: "alarmContent", label: this.$t('common.alarmContent') }
      ]
    },
    // 表单校验规则
    rules() {
      return {
        ruleName: [
          { required: true, max: 20, message: this.$t('common.enterRuleNameMax20'), trigger: "blur" }
        ],
        ruleSwitch: [
          { required: true, message: this.$t('common.pleaseSelectEnable'), trigger: "change" }
        ],
        dispatchProcessId: [
          { required: true, message: this.$t('common.selectProcess'), trigger: "change" }
        ],
        ruleLayer: [
          { required: false, message: this.$t('common.selectRuleLayer'), trigger: "change" }
        ],
        ruleType: [
          { required: false, message: this.$t('common.selectRuleType'), trigger: "change" }
        ],
        dispatchDelay: [
          { required: false, message: this.$t('common.enterDispatchDelay'), trigger: "change" },
          { validator: this.getFormValidator(this.$t('common.dispatchDelay')), trigger: "blur" }
        ],
        mergeFields: [
          { required: true, message: this.$t('common.selectNotificationObject'), trigger: "change" }
        ],
      }
    }
  },
  watch: {
    showModal(val) {
      this.fetchData()
      if (val) {
        this.getModelList();
        this.getOrderProgressList();
      } else {
        // 重置表单
        this.form = {
          ruleName: "",
          ruleSwitch: true,
          ruleType: "",
          ruleDesc: "",
          ruleTag: "",
          dispatchProcessId: "",
          dispatchProcessName: "",
          ruleLayer: "",
          dispatchDelay: undefined,
          startTime: "",
          endTime: "",
          mergeFields: [],
          dispatchTime: "",
          ruleConditions: [],
          sourceConditions: [],
          timeRange: null
        };
        this.$refs.form?.resetFields();
        this.activeStep = 0;
        this.isSubmitDisabled = false;
      }
    }
  },
  methods: {
    // 资源配置全选功能（仅选中模式生效）
    handleSelectAll(index) {
      const item = this.form.sourceConditions[index];
      if (item.resourceType !== 'selected') return;
      if (this.sourceList[index] && this.sourceList[index].length > 0) {
        const allValues = this.sourceList[index].map(item => item.value);
        this.form.sourceConditions[index].rightValue = allValues;
        this.$refs.form.validateField(`sourceConditions[${index}].rightValue`);
      } else {
        this.$message.warning(this.$t('common.noResourceCannotSelectAll'));
      }
    },

    // 资源类型切换逻辑（仅用户主动操作时清空，初始化时保留原始值）
    onResourceTypeChange(index, val, isInitiative = true) {
      const item = this.form.sourceConditions[index];
      // 仅用户主动切换时（isInitiative=true）清空无关字段，回显时跳过
      if (isInitiative) {
        item.groupIdList = [];
        item.rightValue = [];
      }

      if (val === 'all') {
        item.isAllAsset = true;
      } else if (val === 'group') {
        item.isAllAsset = false;
      } else if (val === 'selected') {
        item.isAllAsset = false;
      }
    },

    timeChange() {
      // 当时间范围为空时，设置为空字符串而非null
      this.form.startTime = this.form.timeRange?.[0] || "";
      this.form.endTime = this.form.timeRange?.[1] || "";
    },
    fetchData() {
      let params = { pageSize: 999, pageNo: 1 }
      getNotificationGroup(params).then((res) => {
        let userOptions = res.data && res.data.list;
        this.userOptions = userOptions.map(item => ({
          label: item.groupName,
          value: item.id
        }))
      });
    },
    // 核心优化：选择资源模型后，仅非回显场景默认设置为"全部"
    changeSourceList(index, value, type) {
      if(value === ''){
        this.form.sourceConditions[index].resourceType = '';
        this.form.sourceConditions[index].rightValue = [];
        return
      }
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
          this.form.sourceConditions[index].rightValue = [];
          // 仅编辑新增场景：默认设置为"全部"
          this.form.sourceConditions[index].resourceType = 'all';
          // 主动触发资源类型切换逻辑
          this.onResourceTypeChange(index, 'all', true);
        }
        // 初始化回显场景（type='init'）：不修改resourceType，保留原始值
        this.$forceUpdate();
      });
    },
    getModelList() {
      // 先加载资源模型字段
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.sourceConditionFields = res.data.list.map(item => ({
          label: item.modelName,
          value: item.modelCode
        })) || [];
      });

      // 优先加载分组列表，确保编辑时分组数据已就绪
      getAssetGroup().then((res) => {
        if (res.code === 0 && res.data && Array.isArray(res.data)) {
          this.groupOptions = res.data;
          this.originGroupOptions = [...res.data]; // 保存原始列表
          console.log("分组列表加载完成：", this.groupOptions);
        }
      }).catch(() => {
        this.$message.error(this.$t('common.getGroupListFailed'));
      });
    },
    // 下一步：查看模式已隐藏按钮，无需处理
    nextStep() {
      let valid = true;
      // 仅编辑模式执行校验
      if (this.activeStep === 0 && !this.isView) {
        // 1. 校验基本信息字段
        this.$refs.form.validateField(
          ["ruleName", "ruleSwitch", "ruleLayer", "ruleType", "dispatchProcessId"],
          (error) => { valid = !error; }
        );
        // 2. 校验资源配置
        this.form.sourceConditions.forEach((cond, index) => {
          this.$refs.form.validateField(`sourceConditions[${index}].leftValue`, (error) => {
            if (error) valid = false;
          });
          this.$refs.form.validateField(`sourceConditions[${index}].operator`, (error) => {
            if (error) valid = false;
          });
          if (cond.operator === 'in') {
            if (cond.resourceType === 'group') {
              this.$refs.form.validateField(`sourceConditions[${index}].groupIdList`, (error) => {
                if (error) valid = false;
              });
            } else if (cond.resourceType === 'selected') {
              this.$refs.form.validateField(`sourceConditions[${index}].rightValue`, (error) => {
                if (error) valid = false;
              });
            }
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
          return min > 0 ? callback(new Error(this.$t('common.fieldCannotBeEmpty', { name }))) : callback();
        }
        if ((value + "").indexOf(" ") > -1) {
          return callback(new Error(this.$t('common.doNotInputSpace')));
        }
        if (value.length > max) {
          return callback(new Error(this.$t('common.fieldLengthNotExceed', { name, max })));
        }
        if (value.length < min) {
          return callback(new Error(this.$t('common.fieldLengthNotLess', { name, min })));
        }
        if (checkSpecialChars) {
          const reg = /[!@#$%^&*(),.?":{}|<>]/;
          if (reg.test(value)) {
            return callback(new Error(this.$t('common.fieldCannotContainSpecialChars', { name })));
          }
        }
        callback();
      };
    },

    // 删除标签（仅规则配置）
    handleClose(tag, index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      targetArr[index].dynamicTags.splice(
        targetArr[index].dynamicTags.indexOf(tag), 1
      );
      this.$forceUpdate();
    },

    // 显示标签输入框（仅规则配置）
    showInput(index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      targetArr[index].inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput?.$refs.input?.focus();
      });
    },

    // 确认标签输入（仅规则配置）
    handleInputConfirm(index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      if (this.inputValue.trim()) {
        targetArr[index].dynamicTags.push(this.inputValue.trim());
        targetArr[index].rightValue = targetArr[index].dynamicTags.join(",");
      }
      targetArr[index].inputVisible = false;
      this.inputValue = "";
    },

    // 新增资源配置条件（适配全部/分组/选中）
    handleAddSourceCond() {
      this.form.sourceConditions.push({
        operator: "in",
        condition: "",
        leftValue: "",
        rightValue: [], // 选中资源ID列表
        isAllAsset: false, // 是否全选资源
        groupIdList: [], // 分组ID列表
        resourceType: "", // 初始为空，选择资源模型后自动变为'all'
        inputVisible: false,
        dynamicTags: []
      });
    },

    // 删除资源配置行
    handleDelSourceRow(index) {
      this.form.sourceConditions.splice(index, 1);
    },
    handleAdd() {
      this.$refs.editModal.showModal = true;
    },
    // 新增规则配置条件
    handleAddCond() {
      this.form.ruleConditions.push({
        operator: "",
        condition: "and", // 默认设置为且
        leftValue: "",
        rightValue: "",
        inputVisible: false,
        dynamicTags: []
      });
    },

    // 删除规则配置行（优化：清除对应字段校验缓存，避免残留）
    handleDelRow(index) {
      // 1. 先清除当前索引对应规则的所有校验状态
      this.$refs.form?.clearValidate([
        `ruleConditions[${index}].leftValue`,
        `ruleConditions[${index}].operator`,
        `ruleConditions[${index}].rightValue`
      ]);
      // 2. 删除数组中的对应规则项
      this.form.ruleConditions.splice(index, 1);
      // 3. 若删除后规则数组为空，清除所有表单校验缓存
      if (this.form.ruleConditions.length === 0) {
        this.$refs.form?.clearValidate();
      }
      // 4. 强制更新视图
      this.$forceUpdate();
    },

    // 初始化表单
    init(row) {
      this.activeStep = 0;
      if (Object.keys(row).length === 0) {
        this.opt = this.$t('common.add');
        this.$refs.form?.resetFields();
        this.form.ruleConditions = [];
        this.form.sourceConditions = [];
        // 新增时确保通知时间为空字符串
        this.form.timeRange = null;
        this.form.startTime = "";
        this.form.endTime = "";
      } else {
        this.opt = this.$t('common.edit');
        this.getRuleDetail();
      }
    },

    // 获取规则详情（核心优化：保留原始resourceType，解决回显覆盖问题）
    getRuleDetail() {
      let data = { ruleId: this.rowData.ruleId };
      // 模拟接口返回（真实场景替换为接口调用）
      let res = {
        status: 200,
        message: "Success",
        data: this.rowData,
      };

      if (res.status === 200) {
        const detail = res.data;
        // 处理 ruleContent（解析为 ruleConditions 数组）
        let ruleConditions = [];
        if (detail.ruleContent) {
          try {
            const parsedRuleContent = JSON.parse(detail.ruleContent);
            ruleConditions = parsedRuleContent.map(cond => {
              const rightValue = Array.isArray(cond.rightValue)
                ? cond.rightValue.join(",")
                : (cond.rightValue || "");
              return {
                ...cond,
                condition: cond.condition || "and", // 确保有默认值
                inputVisible: false,
                rightValue
              };
            });
          } catch (e) {
            console.error("解析 ruleContent 失败：", e);
            ruleConditions = [];
          }
        }

        // 先解析原始sourceConditions（保留原始resourceType）
        const originalSourceConditions = JSON.parse(detail.sourceContent) || [];
        // 先给表单赋值基础数据
        this.form = {
          ...detail,
          ruleConditions: ruleConditions,
          sourceConditions: [],
          ruleLayer: detail.ruleLayer || "",
          dispatchProcessId: detail.dispatchProcessId || "",
          dispatchDelay: detail.dispatchDelay,
          startTime: detail.startTime || "",
          endTime: detail.endTime || "",
          dispatchTime: detail.dispatchTime || "",
          ruleTag: detail.ruleTag || "",
          mergeFields: detail.mergeFields || [],
          timeRange: (detail.startTime && detail.endTime) ? [detail.startTime, detail.endTime] : null
        };

        // 等待分组列表加载完成后，处理sourceConditions回显
        this.$nextTick(async () => {
          // 若分组列表未加载完成，等待片刻（兼容接口延迟）
          if (this.groupOptions.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          // 处理sourceConditions并赋值，保留原始resourceType
          const processedSourceConditions = originalSourceConditions.map((item, index) => {
            // 兼容旧数据，补充resourceType（优先使用原始值，不强制覆盖）
            const originalResourceType = item.resourceType || (item.isAllAsset ? 'all' : (item.groupIdList && item.groupIdList.length > 0 ? 'group' : 'selected'));
            // 格式化groupIdList：确保是数组，且值为字符串（与groupOptions的id格式一致）
            if (originalResourceType === 'group') {
              item.groupIdList = Array.isArray(item.groupIdList)
                ? item.groupIdList.map(id => id + '')
                : (item.groupIdList ? [item.groupIdList + ''] : []);
            }
            // 关键：先赋值原始resourceType，再调用changeSourceList（避免被覆盖）
            const processedItem = {
              ...item,
              resourceType: originalResourceType, // 保留原始状态
              isAllAsset: originalResourceType === 'all' // 同步isAllAsset与原始状态
            };
            // 调用changeSourceList（传入type='init'，跳过默认赋值）
            this.changeSourceList(index, item.leftValue, 'init');
            return processedItem;
          });

          // 赋值处理后的sourceConditions
          this.form.sourceConditions = processedSourceConditions;
          // 强制更新组件，触发视图渲染，确保分组选中值回显
          this.$forceUpdate();
        });

        // 兼容原有逻辑（dispatchDelay 为 null 时设为 undefined）
        if (this.form.dispatchDelay == "" || this.form.dispatchDelay == null) {
          this.form.dispatchDelay = undefined;
        }
      }
    },

    // 取消/关闭
    cancel() {
      this.showModal = false;
    },

    // 提交表单（核心优化：ruleConditions同步为ruleContent JSON字符串，清除残留数据）
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // 整理提交数据 - 深拷贝避免修改原始表单数据
          const submitData = JSON.parse(JSON.stringify(this.form));

          // 1. 过滤无效的规则条件（避免空对象提交）
          submitData.ruleConditions = submitData.ruleConditions.filter(rule => {
            return rule.leftValue && rule.operator && (rule.rightValue && rule.rightValue.trim());
          });

          // 2. 为所有规则条件设置默认的condition为and
          submitData.ruleConditions = submitData.ruleConditions.map(cond => ({
            ...cond,
            condition: "and" // 强制设置为且，保持业务一致性
          }));

          // 3. 核心：将 ruleConditions 数组转换为 JSON 字符串，赋值给 ruleContent（同步逻辑）
          submitData.ruleContent = JSON.stringify(submitData.ruleConditions);

          // 格式化sourceConditions（严格匹配要求格式）
          submitData.sourceConditions = submitData.sourceConditions.map(cond => ({
            leftValue: cond.leftValue,
            operator: cond.operator,
            isAllAsset: cond.resourceType === 'all' ? true : false, // 全部=true，其他=false
            groupIdList: cond.groupIdList || [],
            rightValue: cond.rightValue || [],
            condition: cond.condition || ""
          }));

          // 4. （可选）同步sourceConditions为sourceContent JSON字符串
          submitData.sourceContent = JSON.stringify(submitData.sourceConditions);

          // 处理规则配置条件 - 只在提交副本上进行类型转换
          submitData.ruleConditions.forEach((rule) => {
            // 对于'包含于'和'不包含于'，都使用rightValue并转换为数组，保持逻辑一致
            if (rule.operator === "in" || rule.operator === "not in") {
              rule.rightValue = rule.rightValue ? rule.rightValue.split(",").filter(val => val) : [];
            } else {
              // 其他操作符也使用rightValue并转换为数组（可根据业务调整）
              rule.rightValue = rule.rightValue ? rule.rightValue.split(",").filter(val => val) : [];
            }
          });

          // 处理派单流程名称
          this.orderProgressList.forEach(item => {
            if (item.id === submitData.dispatchProcessId) {
              submitData.dispatchProcessName = item.name;
            }
          });

          // 处理特殊字段
          if (submitData.ruleType === "RECOVER") {
            submitData.dispatchDelay = undefined;
            submitData.dispatchProcessId = "";
          }
          if (submitData.dispatchDelay === undefined) submitData.dispatchDelay = null;
          // 确保空的时间值正确提交为空字符串
          submitData.startTime = submitData.startTime || "";
          submitData.endTime = submitData.endTime || "";
          if (submitData.dispatchDelay === null) submitData.dispatchDelay = 0;

          // 提交接口
          this.isSubmitDisabled = true;
          updateMessage(submitData)
            .then((res) => {
              this.isSubmitDisabled = false;
              if (res.data) {
                this.$modal.msgSuccess(this.$t('common.operationSuccess'));
                this.showModal = false;
                this.$emit("refreshList");
              } else {
                this.$modal.msgError(res.message);
              }
            })
            .catch((error) => {
              this.isSubmitDisabled = false;
              // this.$modal.msgError("操作失败");
            });
        }
      });
    },

    // 获取规则条件字段
    getRuleConditionFields() {
      const cache = sessionStorage.getItem("ruleConditionFields");
      if (cache) {
        this.ruleConditionFields = JSON.parse(cache);
        return;
      }

      // 模拟接口返回（真实场景替换为接口调用）
      let res = {
        status: 200,
        data: [
          { "alarmSource": "告警来源" },
          { "alarmLevel": "告警级别" },
          { "alarmType": "告警类型" },
          { "deviceIp": "设备IP" },
          { "deviceName": "设备名称" }
        ]
      };

      if (res.status === 200 && res.data) {
        this.ruleConditionFields = res.data.map(item => ({
          label: Object.values(item)[0],
          value: Object.keys(item)[0]
        }));
        sessionStorage.setItem("ruleConditionFields", JSON.stringify(this.ruleConditionFields));
      }
    },

    // 获取派单流程列表
    getOrderProgressList() {
      const cache = sessionStorage.getItem("orderProgressList");
      if (cache) {
        this.orderProgressList = JSON.parse(cache);
        this.$nextTick(() => this.init(this.rowData));
        return;
      }

      // 模拟接口返回（真实场景替换为接口调用）
      let res = {
        code: 0,
        data: {
          list: [
            { id: "53707d43-73f8-11f0-949b-02420abc0007", name: "告警派单-磐石推送-政务外网-值班" },
            { id: "2f736291-73f8-11f0-949b-02420abc0007", name: "告警派单-磐石推送-政务外网" },
            { id: "93f9192b-818e-11f0-a2a6-02420abc0010", name: "告警派单-信创节点-政务外网-值班" }
          ],
          total: 3
        }
      };

      if (res.code === 0 && res.data?.list) {
        this.orderProgressList = res.data.list.map(item => ({
          id: item.id,
          name: item.name
        }));
        sessionStorage.setItem("orderProgressList", JSON.stringify(this.orderProgressList));
      }

      this.$nextTick(() => this.init(this.rowData));
    }
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
        width: 25%;
      }

      &:nth-child(3) {
        width: 35%; // 调整宽度占比
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
/deep/ .ant-select-selection--multiple{
  min-height: 36px !important;
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