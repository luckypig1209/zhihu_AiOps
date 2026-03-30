<template>
  <a-drawer :title="opt" :visible="showModal" width="1080px" placement="right" :closable="true" :mask-closable="false"
    @close="cancel">
    <div style="height: 80vh;overflow-y: auto;">
      <el-steps :active="activeStep" finish-status="success" simple>
        <el-step :title="$t('common.basicInfo')"></el-step>
        <el-step :title="$t('common.ruleConfiguration')"></el-step>
        <el-step :title="$t('common.notificationConfiguration')" v-if="form.ruleType != 'RECOVER'"></el-step>
      </el-steps>

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <!-- Step 1: 基本信息配置 -->
        <div v-show="activeStep === 0">
          <el-row>
            <el-col :span="22">
              <el-form-item prop="ruleName" :label="$t('common.ruleName')">
                <el-input type="text" v-model.trim="form.ruleName" maxlength="40" :placeholder="$t('common.pleaseInputRuleName')">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="source" :label="$t('common.applicableResources')">
                <el-col :span="21" style="margin-bottom: 10px">
                  <el-button type="primary" icon="el-icon-plus" size="small"
                    @click="handleAddSourceCond">{{ $t('common.addResourceConfiguration') }}</el-button>
                </el-col>

                <el-col :span="22">
                  <table class="m-table">
                    <tr v-for="(row, index) in form.sourceConditions" :key="row.id || index" style="line-height: 66px">
                      <td>
                        <el-form-item :prop="'sourceConditions[' + index + '].leftValue'" label="" label-width="0"
                          :rules="{ required: true, trigger: 'change' }" :show-message="false">
                          <el-select v-model="form.sourceConditions[index].leftValue" filterable
                            @change="changeSourceList(index, form.sourceConditions[index].leftValue, 'edit')">
                            <el-option v-for="field in sourceConditionFields" :key="field.value" :label="field.label"
                              :value="field.value" :disabled="field.disabled" />
                          </el-select>
                        </el-form-item>
                      </td>
                      <!-- <td>
                        <el-form-item
                          :prop="'sourceConditions[' + index + '].operator'"
                          label=""
                          label-width="0"
                          :rules="{ required: true, trigger: 'change' }"
                          :show-message="false"
                        >
                          <el-select
                            v-model="form.sourceConditions[index].operator"
                          >
                            <el-option value="all" :label="$t('common.all')"></el-option>
                            <el-option value="secectd" :label="$t('common.selected')"></el-option>
                          </el-select>
                        </el-form-item>
                      </td> -->
                      <td>
                        <el-form-item style="margin-left: 20px;" v-if="form.sourceConditions[index].operator === 'in'"
                          :prop="'sourceConditions[' + index + '].rightValue'" label-width="0" :show-message="true">
                          <el-select v-model="form.sourceConditions[index].rightValue" multiple filterable clearable>
                            <el-option v-for="field in sourceList[index]" :key="field.value" :label="field.label"
                              :value="field.value" />
                          </el-select>
                          <!-- <div
                            v-if="
                              form.sourceConditions[index].operator == 'in' ||
                              form.sourceConditions[index].operator == 'not in'
                            "
                            class="tag-style"
                          >
                            <el-tag
                              :key="tag"
                              v-for="tag in form.sourceConditions[index].dynamicTags"
                              closable
                              :disable-transitions="false"
                              @close="handleClose(tag, index, 'source')"
                            >
                              {{ tag }}
                            </el-tag>
                            <el-input
                              class="input-new-tag"
                              v-if="form.sourceConditions[index].inputVisible"
                              v-model="inputValue"
                              ref="saveTagInput"
                              size="small"
                              @keyup.enter.native="handleInputConfirm(index, 'source')"
                              @blur="handleInputConfirm(index, 'source')"
                            >
                            </el-input>
                            <el-button
                              v-else
                              class="button-new-tag"
                              size="small"
                              @click="showInput(index, 'source')"
                            >+ {{ $t('common.add') }}</el-button>
                          </div>
                          <el-input
                            v-else
                            v-model="form.sourceConditions[index].rightValue"
                            :placeholder="$t('common.pleaseInputValueMax20')"
                          ></el-input> -->
                        </el-form-item>
                      </td>
                      <!-- <td v-if="form.sourceConditions.length > 1">
                        <el-form-item
                          :prop="'sourceConditions[' + index + '].condition'"
                          label=""
                          label-width="0"
                          :rules="{ required: true, trigger: 'change' }"
                          :show-message="false"
                        >
                          <el-select
                            v-model="form.sourceConditions[index].condition"
                          >
                            <el-option value="and" :label="$t('common.and')"></el-option>
                            <el-option value="or" :label="$t('common.or')"></el-option>
                          </el-select>
                        </el-form-item>
                      </td> -->
                      <td>
                        <el-button style="margin-left: 20px;" type="danger" size="small" icon="el-icon-delete"
                          @click="handleDelSourceRow(index)"></el-button>
                      </td>
                    </tr>
                  </table>
                </el-col>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="ruleDesc" :label="$t('common.ruleDescription')">
                <el-input type="textarea" v-model.trim="form.ruleDesc" maxlength="40" :placeholder="$t('common.pleaseInputRuleDescription')">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="22">
              <el-form-item prop="ruleSwitch" :label="$t('common.ruleSwitch')">
                <el-switch v-model="form.ruleSwitch" active-color="#409EFF" inactive-color="#cccccc"
                  :active-value="true" :inactive-value="false">
                </el-switch>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- Step 2: 规则配置 -->
        <div v-show="activeStep === 1">
          <el-row>
            <el-col :span="21" :offset="1">
              <table class="m-table">
                <tr class="t-head">
                  <th>{{ $t('common.field') }}</th>
                  <th>{{ $t('common.include') }}</th>
                  <th>{{ $t('common.value') }}</th>
                  <th v-if="form.ruleConditions.length > 1">{{ $t('common.conditionConfiguration') }}</th>
                  <th></th>
                </tr>
                <tr v-for="(row, index) in form.ruleConditions" :key="row.id || index" style="line-height: 66px">
                  <td>
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].leftValue'" label=""
                      label-width="0" :rules="{ required: true, trigger: 'change' }" :show-message="false">
                      <el-select v-model="form.ruleConditions[index].leftValue" filterable>
                        <el-option v-for="field in setRuleConditionFields" :key="field.value" :label="field.label"
                          :value="field.value" />
                      </el-select>
                      <!-- <el-input
                        v-model="form.ruleConditions[index].leftValue"
                        placeholder="请输入值"
                      ></el-input> -->
                    </el-form-item>
                  </td>
                  <td>
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].operator'" label=""
                      label-width="0" :rules="{ required: true, trigger: 'change' }" :show-message="false">
                      <el-select v-model="form.ruleConditions[index].operator">
                        <el-option value="contains" :label="$t('common.contains')"></el-option>
                        <el-option value="not contains" :label="$t('common.notContains')"></el-option>
                        <el-option value="in" :label="$t('common.containedIn')"></el-option>
                        <el-option value="not in" :label="$t('common.notContainedIn')"></el-option>
                      </el-select>
                    </el-form-item>
                  </td>
                  <td>
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].rightValue'"
                      label-width="0" :rules="{
                        required: true,
                        max: 64,
                        trigger: 'blur',
                        message: this.$t('common.pleaseInputValueMax64'),
                      }" :show-message="true">
                      <div v-if="
                        form.ruleConditions[index].operator == 'in' ||
                        form.ruleConditions[index].operator == 'not in'
                      " class="tag-style">
                        <el-tag :key="tag" v-for="tag in form.ruleConditions[index].dynamicTags" closable
                          :disable-transitions="false" @close="handleClose(tag, index, 'rule')">
                          {{ tag }}
                        </el-tag>
                        <el-input class="input-new-tag" v-if="form.ruleConditions[index].inputVisible"
                          v-model="inputValue" ref="saveTagInput" size="small"
                          @keyup.enter.native="handleInputConfirm(index, 'rule')"
                          @blur="handleInputConfirm(index, 'rule')">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(index, 'rule')">+ {{ $t('common.add') }}</el-button>
                      </div>
                      <el-input v-else v-model="form.ruleConditions[index].rightValue" maxlength="64"
                        :placeholder="$t('common.pleaseInputValueMax64')"></el-input>
                    </el-form-item>
                  </td>
                  <td v-if="form.ruleConditions.length > 1">
                    <el-form-item style="margin-right: 10px;" :prop="'ruleConditions[' + index + '].condition'" label=""
                      label-width="0" :rules="{ required: true, trigger: 'change' }" :show-message="false">
                      <el-select v-model="form.ruleConditions[index].condition">
                        <el-option value="and" :label="$t('common.and')"></el-option>
                        <el-option value="or" :label="$t('common.or')"></el-option>
                      </el-select>
                    </el-form-item>
                  </td>
                  <td>
                    <el-button type="danger" size="small" icon="el-icon-delete"
                      @click="handleDelRow(index)"></el-button>
                  </td>
                </tr>
              </table>
            </el-col>
            <el-col :span="21" :offset="1">
              <el-button type="primary" icon="el-icon-plus" size="small" @click="handleAddCond">{{ $t('common.addRule') }}</el-button>
            </el-col>
          </el-row>
        </div>

        <!-- Step 3: 通知配置（所有类型） -->
        <div v-show="activeStep === 2 && form.ruleType != 'RECOVER'">
          <el-row>
            <!-- 通知类型选择 -->
            <el-col :span="20" style="margin-bottom: 20px;">
              <el-form-item :label="$t('common.notificationMethod')" :rules="{ required: true, message: $t('common.pleaseSelectNotificationMethod'), trigger: 'change' }"
                prop="channelString">
                <el-checkbox-group v-model="form.channelString">
                  <el-checkbox-button label="dd">{{ $t('common.dingTalk') }}</el-checkbox-button>
                  <el-checkbox-button label="qywx">{{ $t('common.wechatWork') }}</el-checkbox-button>
                  <!-- <el-checkbox-button label="wx">微信</el-checkbox-button>
                  <el-checkbox-button label="dx">短信</el-checkbox-button>
                  <el-checkbox-button label="wh">外呼</el-checkbox-button> -->
                  <el-checkbox-button label="szh">{{ $t('common.telecomServiceDesk') }}</el-checkbox-button>
                </el-checkbox-group>
              </el-form-item>
            </el-col>

            <!-- 动态渲染通知配置卡片 -->
            <el-col :span="24">
              <!-- 钉钉配置 - 新增webhookUrl和secret字段 -->
              <a-card :title="`${getNoticeLabel('dd')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('dd')">
                <el-form :model="noticeTemplates.dd" label-width="10px">
                  <el-row type="flex" v-for="(item, index) in noticeTemplates.dd.value" :key="index" gutter="16">
                    <!-- Webhook URL输入框 -->
                    <el-col :span="10">
                      <el-form-item :prop="`noticeTemplates.dd.value[${index}].webhookUrl`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputWebhookAddress'), trigger: 'blur' }">
                        <el-input v-model="item.webhookUrl"
                          :placeholder="$t('common.pleaseInputDingTalkRobotWebhookAddress')"
                          clearable maxlength="200" />
                      </el-form-item>
                    </el-col>
                    <!-- 加签密钥输入框（可选） -->
                    <el-col :span="10">
                      <el-form-item :prop="`noticeTemplates.dd.value[${index}].secret`"
                        :rules="{ max: 100, message: this.$t('common.secretLengthNotExceed100'), trigger: 'blur' }">
                        <el-input v-model="item.secret" :placeholder="$t('common.pleaseInputRobotSigningSecretOptional')" clearable maxlength="100"
                          show-password />
                        <div class="el-form-item__error" style="position: absolute;">
                          {{ $t('common.ifRobotSetSigningThisItemIsRequired') }}
                        </div>
                      </el-form-item>
                    </el-col>
                    <!-- 删除按钮 -->
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('dd', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    <!-- 新增按钮（仅第一行显示） -->
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('dd')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </a-card>

              <!-- 企业微信配置 - 新增webhookUrl和secret字段 -->
              <a-card :title="`${getNoticeLabel('qywx')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('qywx')">
                <el-form :model="noticeTemplates.qywx" label-width="10px">
                  <el-row type="flex" v-for="(item, index) in noticeTemplates.qywx.value" :key="index" gutter="16">
                    <!-- Webhook URL输入框 -->
                    <el-col :span="10">
                      <el-form-item :prop="`noticeTemplates.qywx.value[${index}].webhookUrl`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputWebhookAddress'), trigger: 'blur' }">
                        <el-input v-model="item.webhookUrl"
                          :placeholder="$t('common.pleaseInputWechatWorkAppPushAddress')"
                          clearable maxlength="200" />
                      </el-form-item>
                    </el-col>
                    <!-- 加签密钥输入框（可选） -->
                    <el-col :span="10">
                      <el-form-item :prop="`noticeTemplates.qywx.value[${index}].secret`"
                        :rules="{ max: 100, message: this.$t('common.secretLengthNotExceed100'), trigger: 'blur' }">
                        <el-input v-model="item.secret" :placeholder="$t('common.pleaseInputAppSigningSecretOptional')" clearable maxlength="100"
                          show-password />
                        <div class="el-form-item__error" style="position: absolute;">
                          {{ $t('common.ifAppSetSigningThisItemIsRequired') }}
                        </div>
                      </el-form-item>
                    </el-col>
                    <!-- 删除按钮 -->
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('qywx', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    <!-- 新增按钮（仅第一行显示） -->
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('qywx')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </a-card>

              <!-- 微信配置 -->
              <a-card :title="`${getNoticeLabel('wx')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('wx')">
                <el-form :model="noticeTemplates.wx" label-width="10px">
                  <el-row type="flex" v-for="(item, index) in noticeTemplates.wx.value" :key="index">
                    <el-col :span="18">
                      <el-form-item :prop="`noticeTemplates.wx.value[${index}].value`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputWechatPushAddress'), trigger: 'blur' }">
                        <el-input v-model="item.value" :placeholder="$t('common.pleaseInputWechatOfficialAccountAppletPushAddress')" clearable maxlength="200" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('wx', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('wx')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </a-card>

              <!-- 短信配置 -->
              <a-card :title="`${getNoticeLabel('dx')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('dx')">
                <el-form :model="noticeTemplates.dx" label-width="10px">
                  <el-row type="flex" v-for="(item, index) in noticeTemplates.dx.value" :key="index">
                    <el-col :span="18">
                      <el-form-item :prop="`noticeTemplates.dx.value[${index}].value`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputSmsInterfaceAddress'), trigger: 'blur' }">
                        <el-input v-model="item.value" :placeholder="$t('common.pleaseInputSmsServiceProviderInterfaceAddress')" clearable
                          maxlength="200" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('dx', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('dx')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </a-card>

              <!-- 外呼配置 -->
              <a-card :title="`${getNoticeLabel('wh')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('wh')">
                <el-form :model="noticeTemplates.wh" label-width="10px">
                  <el-row type="flex" v-for="(item, index) in noticeTemplates.wh.value" :key="index">
                    <el-col :span="18">
                      <el-form-item :prop="`noticeTemplates.wh.value[${index}].value`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputOutboundCallInterfaceAddress'), trigger: 'blur' }">
                        <el-input v-model="item.value" :placeholder="$t('common.pleaseInputOutboundCallServiceProviderInterfaceAddress')"
                          clearable maxlength="200" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('wh', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('wh')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </a-card>

              <!-- 电信集约化服务台配置 -->
              <a-card :title="`${getNoticeLabel('szh')}${$t('common.configuration')}`" style="margin: 0 40px 20px; padding: 16px;"
                v-if="form.channelString.includes('szh')">
                <el-form :model="noticeTemplates.szh" label-width="10px">
                  <!-- <el-row type="flex" v-for="(item, index) in noticeTemplates.szh.value" :key="index" gutter="16">
                  
                    <el-col :span="10">
                      <el-form-item
                        :prop="`noticeTemplates.szh.value[${index}].name`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputTelecomServiceDeskPlatformCustomerName'), trigger: 'blur' }"
                      >
                        <el-input
                          v-model="item.name"
                          :placeholder="$t('common.pleaseInputTelecomServiceDeskPlatformCustomerName')"
                          clearable
                          maxlength="100"
                        />
                      </el-form-item>
                    </el-col>
                   
                    <el-col :span="10">
                      <el-form-item
                        :prop="`noticeTemplates.szh.value[${index}].code`"
                        :rules="{ required: true, message: this.$t('common.pleaseInputTelecomServiceDeskPlatformCustomerCode'), trigger: 'blur' }"
                      >
                        <el-input
                          v-model="item.code"
                          :placeholder="$t('common.pleaseInputTelecomServiceDeskPlatformCustomerCode')"
                          clearable
                          maxlength="50"
                        />
                      </el-form-item>
                    </el-col>
                  
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="danger" ghost @click="removeCondition('szh', index)">{{ $t('common.delete') }}</a-button>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :span="2">
                      <el-form-item>
                        <a-button type="primary" ghost v-if="index === 0" @click="addCondition('szh')">{{ $t('common.add') }}</a-button>
                      </el-form-item>
                    </el-col>
                  </el-row> -->
                  {{ $t('common.telecomServiceDeskNoAdditionalConfigurationNeeded') }}
                </el-form>
              </a-card>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button v-if="activeStep > 0" @click="prevStep">{{ $t('common.previousStep') }}</el-button>
      <el-button v-if="activeStep < (form.ruleType === 'RECOVER' ? 1 : 2)" type="primary"
        @click="nextStep">{{ $t('common.nextStep') }}</el-button>
      <el-button v-if="activeStep === (form.ruleType === 'RECOVER' ? 1 : 2)" type="primary"
        @click="handleSubmit('form')" :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
      <el-button @click="cancel" :disabled="isSubmitDisabled">{{ $t('common.cancel') }}</el-button>
    </div>
  </a-drawer>
</template>

<script>
// import {
//   saveRule,
//   getRuleDetail,
//   getRuleConditionFields,
//   getOrderProgressList,
// } from "@/api/alarm.js";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import {
  getAssetInfoPage,
  getAssetModelPage,
} from "@/api/resource";
import { updateMessage, getRuleDetail } from "@/api/monitor/task";
export default {
  name: "formEdit",
  props: { rowData: Object },
  data() {
    return {
      sourceConditionFields: [],
      sourceList: [],
      activeStep: 0, // 当前步骤
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
        startTime: undefined,
        endTime: undefined,
        mergeFields: [],
        dispatchTime: "",
        ruleConditions: [], // 规则配置条件
        sourceConditions: [], // 资源配置条件（独立于规则条件）
        channelString: [], // 选中的通知类型
      },

      // 通知模板列表
      templateList: {
        3: [], 1: [], 6: [], 4: [], 5: [], 8: [], 9: []
      },

      // 通知类型中文映射
      noticeType: {
        1: this.$t('common.sms'), 3: this.$t('common.siteMessage'), 4: this.$t('common.dingTalk'), 6: this.$t('common.wechatWork'), 5: this.$t('common.wechat'), 8: this.$t('common.outboundCall'), 9: this.$t('common.custom')
      },

      // 规则条件字段
      ruleConditionFields: [
        { value: "alarmTitle", label: this.$t('common.alarmName') },
        { value: "alarmLevel", label: this.$t('common.severity') },
        { value: "alarmStatus", label: this.$t('common.status') },
        { value: "alarmContent", label: this.$t('common.alarmContent') }
      ],
      // 派单流程列表
      orderProgressList: [],
      // 标签输入值
      inputValue: "",

      // 表单校验规则
      rules: {
        ruleName: [
          { required: true, max: 20, message: this.$t('common.pleaseInputRuleNameMax20'), trigger: "blur" }
        ],
        ruleSwitch: [
          { required: true, message: this.$t('common.pleaseSelectWhetherToEnable'), trigger: "change" }
        ],
        dispatchProcessId: [
          { required: true, message: this.$t('common.pleaseSelectProcess'), trigger: "change" }
        ],
        ruleLayer: [
          { required: false, message: this.$t('common.pleaseSelectRuleLevel'), trigger: "change" }
        ],
        ruleType: [
          { required: false, message: this.$t('common.pleaseSelectRuleType'), trigger: "change" }
        ],
        dispatchDelay: [
          { required: false, message: this.$t('common.pleaseInputDispatchDelay'), trigger: "change" },
          { validator: this.getFormValidator(this.$t('common.dispatchDelay')), trigger: "blur" }
        ]
      },

      // 所有通知类型的配置模板，钉钉和企业微信增加webhookUrl和secret参数
      noticeTemplates: {
        dd: { key: 'dd', value: [{ webhookUrl: '', secret: '' }], label: this.$t('common.dingTalk') },
        qywx: { key: 'qywx', value: [{ webhookUrl: '', secret: '' }], label: this.$t('common.wechatWork') },
        wx: { key: 'wx', value: [{ value: '' }], label: this.$t('common.wechat') },
        dx: { key: 'dx', value: [{ value: '' }], label: this.$t('common.sms') },
        wh: { key: 'wh', value: [{ value: '' }], label: this.$t('common.outboundCall') },
        szh: { key: 'szh', value: [{ name: '', code: '' }], label: this.$t('common.telecomServiceDesk') }
      }
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
    // 资源配置字段 - 仅作用于资源配置
    // sourceConditionFields() {
    //   return [
    //     { label: "网络设备", value: "one" },
    //     { label: "数据库", value: "two" }
    //   ];
    // }
  },
  watch: {
    showModal(val) {
      if (val) {
        this.getModelList()
        // 重置所有通知配置
        Object.keys(this.noticeTemplates).forEach(key => {
          if (key === 'dd' || key === 'qywx') {
            this.noticeTemplates[key].value = [{ webhookUrl: '', secret: '' }];
          } else if (key === 'szh') {
            this.noticeTemplates[key].value = [{ name: '', code: '' }];
          } else {
            this.noticeTemplates[key].value = [{ value: '' }];
          }
        });
        // 加载数据
        this.getOrderProgressList();
      } else {
        // 重置表单（同时清空资源配置和规则配置）
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
          startTime: undefined,
          endTime: undefined,
          mergeFields: [],
          dispatchTime: "",
          ruleConditions: [],
          sourceConditions: [],
          channelString: [],
        };
        this.$refs.form?.resetFields();
        this.activeStep = 0;
        this.isSubmitDisabled = false;
      }
    }
  },
  methods: {
    changeSourceList(index, value, type) {
      let params = {
        "pageNo": 1,
        "pageSize": 100,
        "isManaged": null,
        "modelCode": value,
        "conditions": [],
        "status": 1,
        "isMonitorAble": true
      }
      getAssetInfoPage(params).then((res) => {
        this.sourceList[index] = res.data.list.map(item => {
          return {
            label: item.assetAttribute?.name || '',
            value: item.id + ''
          }
        })
        if (type === 'edit') {
          this.form.sourceConditions[index].rightValue = []
        }

        this.$forceUpdate()
      })
    },
    getModelList() {
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.sourceConditionFields = res.data.list.map(item => {
          return {
            label: item.modelName,
            value: item.modelCode
          }
        }) || [];

      });
    },
    // 下一步
    nextStep() {
      let valid = true;
      if (this.activeStep === 0) {
        // 1. 校验基本信息字段
        this.$refs.form.validateField(
          ["ruleName", "ruleSwitch", "ruleLayer", "ruleType", "dispatchProcessId"],
          (error) => { valid = !error; }
        );
        // 2. 校验资源配置（sourceConditions）
        this.form.sourceConditions.forEach((cond, index) => {
          this.$refs.form.validateField(`sourceConditions[${index}].leftValue`, (error) => {
            if (error) valid = false;
          });
          this.$refs.form.validateField(`sourceConditions[${index}].operator`, (error) => {
            if (error) valid = false;
          });
          // 仅当operator为secectd时校验rightValue
          if (cond.operator === 'in') {
            this.$refs.form.validateField(`sourceConditions[${index}].rightValue`, (error) => {
              if (error) valid = false;
            });
          }
        });
      } else if (this.activeStep === 1) {
        // 校验规则配置（ruleConditions）
        if (this.form.ruleConditions.length === 0) {
          this.$message.warning(this.$t('common.pleaseAddAtLeastOneRuleCondition'));
          valid = false;
        } else {
          this.form.ruleConditions.forEach((cond, index) => {
            this.$refs.form.validateField(`ruleConditions[${index}].leftValue`, (error) => {
              if (error) valid = false;
            });
            this.$refs.form.validateField(`ruleConditions[${index}].operator`, (error) => {
              if (error) valid = false;
            });
            this.$refs.form.validateField(`ruleConditions[${index}].rightValue`, (error) => {
              if (error) valid = false;
            });
          });
        }
      }
      if (valid) this.activeStep++;
    },

    // 上一步
    prevStep() {
      this.activeStep--;
    },

    // 表单通用校验器
    getFormValidator(max = 50, min = 0, name = "", checkSpecialChars = false) {
      return (rule, value, callback) => {
        if (value === undefined || value === "") {
          return min > 0 ? callback(new Error(this.$t('common.cannotBeEmpty', { name }))) : callback();
        }
        if ((value + "").indexOf(" ") > -1) {
          return callback(new Error(this.$t('common.doNotEnterSpaces')));
        }
        if (value.length > max) {
          return callback(new Error(this.$t('common.lengthNotExceed', { name, max })));
        }
        if (value.length < min) {
          return callback(new Error(this.$t('common.lengthNotLess', { name, min })));
        }
        if (checkSpecialChars) {
          const reg = /[!@#$%^&*(),.?":{}|<>]/;
          if (reg.test(value)) {
            return callback(new Error(this.$t('common.cannotContainSpecialCharacters', { name })));
          }
        }
        callback();
      };
    },

    // 获取通知类型中文名称
    getNoticeLabel(key) {
      return this.noticeTemplates[key]?.label || key;
    },

    // 新增通知配置项
    addCondition(key) {
      if (key === 'dd' || key === 'qywx') {
        // 钉钉和企业微信添加webhookUrl和secret
        this.noticeTemplates[key].value.push({ webhookUrl: '', secret: '' });
      } else if (key === 'szh') {
        this.noticeTemplates[key].value.push({ name: '', code: '' });
      } else {
        this.noticeTemplates[key].value.push({ value: '' });
      }
    },

    // 删除通知配置项
    removeCondition(key, index) {
      const template = this.noticeTemplates[key];
      if (template.value.length <= 1) {
        const label = this.getNoticeLabel(key);
        this.$message.warning(this.$t('common.pleaseConfigureAtLeastOne', { label }));
        return;
      }
      template.value.splice(index, 1);
    },

    // 删除标签（支持资源配置和规则配置）
    handleClose(tag, index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      targetArr[index].dynamicTags.splice(
        targetArr[index].dynamicTags.indexOf(tag), 1
      );
      this.$forceUpdate();
    },

    // 显示标签输入框（支持资源配置和规则配置）
    showInput(index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      targetArr[index].inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput?.$refs.input?.focus();
      });
    },

    // 确认标签输入（支持资源配置和规则配置）
    handleInputConfirm(index, type = 'rule') {
      const targetArr = type === 'source' ? this.form.sourceConditions : this.form.ruleConditions;
      if (this.inputValue.trim()) {
        targetArr[index].dynamicTags.push(this.inputValue.trim());
        targetArr[index].rightValue = targetArr[index].dynamicTags.join(",");
      }
      targetArr[index].inputVisible = false;
      this.inputValue = "";
    },

    // 新增资源配置条件
    handleAddSourceCond() {
      this.form.sourceConditions.push({
        operator: "in",
        condition: "",
        leftValue: "",
        rightValue: "",
        inputVisible: false,
        dynamicTags: []
      });
    },

    // 删除资源配置行
    handleDelSourceRow(index) {
      // if (this.form.sourceConditions.length <= 1) {
      //   this.$message.warning("至少保留一个资源配置");
      //   return;
      // }
      this.form.sourceConditions.splice(index, 1);
    },

    // 新增规则配置条件
    handleAddCond() {
      this.form.ruleConditions.push({
        operator: "",
        condition: "",
        leftValue: "",
        rightValue: "",
        inputVisible: false,
        dynamicTags: []
      });
    },

    // 删除规则配置行
    handleDelRow(index) {
      // if (this.form.ruleConditions.length <= 1) {
      //   this.$message.warning("至少保留一个规则条件");
      //   return;
      // }
      this.form.ruleConditions.splice(index, 1);
    },

    // 初始化表单
    init(row) {
      this.activeStep = 0;
      if (Object.keys(row).length === 0) {
        this.opt = this.$t('common.add');
        this.$refs.form?.resetFields();
        this.form.ruleConditions = [];
        this.form.sourceConditions = []; // 重置资源配置
      } else {
        this.opt = this.$t('common.edit');
        this.getRuleDetail();
      }
    },

    // 获取规则详情
    getRuleDetail() {
      let data = { ruleId: this.rowData.ruleId };
      // ########## 第一步：替换为用户提供的新模拟数据 ##########
      let res = {
        status: 200,
        message: "Success",
        data: this.rowData,
      };

      if (res.status === 200) {
        const detail = res.data;
        // ########## 第二步：处理 ruleContent（核心！解析为 ruleConditions 数组） ##########
        let ruleConditions = [];
        if (detail.ruleContent) {
          try {
            // 1. 解析 JSON 字符串为数组
            const parsedRuleContent = JSON.parse(detail.ruleContent);
            // 2. 补充页面渲染依赖字段（dynamicTags、inputVisible），并处理 rightValue 格式
            ruleConditions = parsedRuleContent.map(cond => {
              // 若 operator 是 in/not in，dynamicTags 等于 rightValue（数组），否则为空数组
              const dynamicTags = (cond.operator === 'in' || cond.operator === 'not in')
                ? [...(cond.rightValue || [])]
                : [];
              // 若 rightValue 是数组，转为字符串（页面输入框需显示逗号分隔的文本）
              const rightValue = Array.isArray(cond.rightValue)
                ? cond.rightValue.join(",")
                : (cond.rightValue || "");
              return {
                ...cond,
                dynamicTags, // 标签数组（用于in/not in场景）
                inputVisible: false, // 标签输入框显隐状态
                rightValue // 处理为字符串格式
              };
            });
          } catch (e) {
            console.error("解析 ruleContent 失败：", e);
            ruleConditions = [];
          }
        }

        // ########## 第三步：处理 sourceConditions（新数据缺失，初始化空数组避免报错） ##########
        const sourceConditions = JSON.parse(detail.sourceContent) || []; // 无数据时设为空数组changeSourceList
        sourceConditions.forEach((item, index) => {
          this.changeSourceList(index, item.leftValue, 'init')
        })
        // ########## 第四步：赋值表单数据（处理 null/空值兼容） ##########
        this.form = {
          ...detail,
          ruleConditions: ruleConditions, // 替换为解析后的规则条件
          sourceConditions: sourceConditions, // 初始化资源配置（空数组）
          // 处理 null 字段为兼容格式（避免页面渲染异常）
          ruleLayer: detail.ruleLayer || "", // null 转空字符串
          dispatchProcessId: detail.dispatchProcessId || "", // 空字符串保持一致
          dispatchDelay: detail.dispatchDelay, // 保持 null，后续逻辑会处理为 undefined
          startTime: detail.startTime || "", // null 转空字符串（时间选择器兼容）
          endTime: detail.endTime || "", // 同上
          dispatchTime: detail.dispatchTime || "", // 同上
          ruleTag: detail.ruleTag || "" // 空字符串兼容
        };

        // ########## 第五步：回显通知配置（channelParam 映射到 noticeTemplates） ##########
        if (detail.channelParam) {
          Object.keys(detail.channelParam).forEach(key => {
            // 仅处理已定义的通知类型（dd/qywx/wx等）
            if (this.noticeTemplates[key]) {
              this.noticeTemplates[key].value = [...(detail.channelParam[key] || [])];
            }
          });
        }

        // ########## 第六步：兼容原有逻辑（dispatchDelay 为 null 时设为 undefined） ##########
        if (this.form.dispatchDelay == "" || this.form.dispatchDelay == null) {
          this.form.dispatchDelay = undefined;
        }
      }

      // 真实接口调用（保留原逻辑）
      // getRuleDetail(data).then((res) => {
      //   // 同上逻辑
      // });
    },

    // 取消
    cancel() {
      this.showModal = false;
    },

    // 提交表单（包含资源配置和规则配置的独立处理）
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // 1. 校验通知配置
          const noticeValid = this.form.channelString.every(key => {
            return this.noticeTemplates[key].value.every(item => {
              if (key === 'dd' || key === 'qywx') {
                // 钉钉和企业微信验证webhookUrl必填
                return item.webhookUrl.trim() !== '';
              } else if (key === 'szh') {
                // 电信集约化服务台：name和code都必填
                // return item.name.trim() !== '' && item.code.trim() !== '';
                return true
              }
              else {
                // 其他类型：value必填
                return item.value.trim() !== '';
              }
            });
          });
          if (!noticeValid) {
            this.$message.error(this.$t('common.pleaseCompleteAllSelectedNotificationTypeConfiguration'));
            return;
          }

          // 2. 整理提交数据（区分资源配置和规则配置）
          const submitData = { ...this.form };

          // 处理资源配置条件
          // submitData.sourceConditions.forEach((rule) => {
          //   if (rule.operator === "in" || rule.operator === "not in") {
          //     rule.rightValue = JSON.parse(JSON.stringify(rule.dynamicTags));
          //   } else {
          //     rule.rightValue = rule.rightValue ? rule.rightValue.split(",").filter(val => val) : [];
          //   }
          // });

          // 处理规则配置条件
          submitData.ruleConditions.forEach((rule) => {
            if (rule.operator === "in" || rule.operator === "not in") {
              rule.rightValue = JSON.parse(JSON.stringify(rule.dynamicTags));
            } else {
              rule.rightValue = rule.rightValue ? rule.rightValue.split(",").filter(val => val) : [];
            }
          });

          // 处理通知配置
          submitData.channelParam = {};
          this.form.channelString.forEach(key => {
            submitData.channelParam[key] = [...this.noticeTemplates[key].value];
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
          if (submitData.startTime === null || submitData.startTime === undefined) submitData.startTime = "";
          if (submitData.endTime === null || submitData.endTime === undefined) submitData.endTime = "";
          if (submitData.dispatchDelay === null) submitData.dispatchDelay = 0;

          // 3. 提交接口
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
              this.$modal.msgError(this.$t('common.operationFailed'));
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

      // 模拟接口返回
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

      // 真实接口调用
      // getRuleConditionFields().then((res) => {
      //   // 同上逻辑
      // });
    },

    // 获取派单流程列表
    getOrderProgressList() {
      const cache = sessionStorage.getItem("orderProgressList");
      if (cache) {
        this.orderProgressList = JSON.parse(cache);
        this.$nextTick(() => this.init(this.rowData));
        return;
      }

      // 模拟接口返回
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

      // 真实接口调用
      // getOrderProgressList({ pageNo: 1, pageSize: 1000, category: 2 }).then((res) => {
      //   // 同上逻辑
      // });
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
        width: 25%;
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

/* 电信集约化服务台输入框间距调整 */
:deep(.el-row--flex) {
  align-items: center;
}

/* 提示文本样式 */
:deep(.el-form-item__error) {
  font-size: 12px;
  color: #666;
  background-color: #f5f7fa;
  padding: 2px 5px;
  border-radius: 3px;
}

/deep/ .ant-drawer-wrapper-body {
  overflow: hidden;
}
</style>
