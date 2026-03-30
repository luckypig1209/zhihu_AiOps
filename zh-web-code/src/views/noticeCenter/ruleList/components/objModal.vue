<template>
  <a-drawer :title="rowData?.id ? $t('common.editNotificationObject') : $t('common.addNotificationObject')" :visible="showModal" width="1080px" placement="right"
    :closable="true" :mask-closable="false" @close="cancel" style="z-index: 4000;">
    <div style="height: 80vh;overflow-y: auto;">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <div>
          <el-row>
            <!-- 通知对象 -->
            <el-col :span="20" style="margin-bottom: 20px;">
              <el-form-item :label="$t('common.notificationObject')" prop="groupName">
                <el-input v-model="form.groupName" :placeholder="$t('common.enterNotificationObject')" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>

            <!-- 通知方式单选（保持channelString数组类型） -->
            <el-col :span="20" style="margin-bottom: 20px;">
              <el-form-item :label="$t('common.notificationMethod')" prop="channelString">
                <el-radio-group v-model="selectedChannel" @change="handleChannelChange" size="medium">
                  <el-radio-button label="dd">{{ $t('common.dingTalk') }}</el-radio-button>
                  <el-radio-button label="qywx">{{ $t('common.wecom') }}</el-radio-button>
                  <el-radio-button label="szh" v-if="isShowTab != 'xj'">{{ $t('common.telecomServiceDesk') }}</el-radio-button>
                  <el-radio-button label="http" v-if="isShowTab != 'xj'">HTTP</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <!-- 配置区域（div布局统一风格） -->
            <el-col :span="24">
              <!-- 钉钉配置 -->
              <div class="notice-config-section" v-if="form.channelString.includes('dd')">
                <div class="section-title">{{ $t('common.dingTalk') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.dd" label-width="10px">
                  <el-row v-for="(item, index) in noticeTemplates.dd.value" :key="index" :gutter="16"
                    style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                    <el-row type="flex" align="middle">
                      <!-- Webhook URL输入框 -->
                      <el-col :span="16">
                        <el-form-item label="" :prop="`value[${index}].webhookUrl`"
                          :rules="{ required: true, message: $t('common.enterWebhookAddress'), trigger: 'blur' }">
                          <el-input v-model="item.webhookUrl"
                            :placeholder="$t('common.enterDingTalkWebhookAddress')"
                            clearable maxlength="200" />
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
                    <!-- 加签密钥区域 -->
                    <el-row type="flex" align="middle" style="margin-top: 8px;">
                      <el-col :span="8">
                        <el-form-item label=" " style="margin-bottom: 0;">
                          <el-switch v-model="item.showSecret" :active-text="$t('common.enableEncryption')" :inactive-text="$t('common.disableEncryption')"
                            style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item v-if="item.showSecret" label="" :prop="`value[${index}].secret`" :rules="[
                          { max: 100, message: $t('common.secretLengthMax100'), trigger: 'blur' },
                          { required: true, message: $t('common.enterSignatureSecret'), trigger: 'blur' }
                        ]">
                          <el-input class="inputIcon" v-model="item.secret" :placeholder="$t('common.enterDingTalkSignatureSecret')" clearable
                            maxlength="100" show-password />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-row>
                </el-form>
              </div>

              <!-- 企业微信配置 -->
              <div class="notice-config-section" v-if="form.channelString.includes('qywx')">
                <div class="section-title">{{ $t('common.wecom') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.qywx" label-width="10px">
                  <el-row v-for="(item, index) in noticeTemplates.qywx.value" :key="index" :gutter="16"
                    style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                    <el-row type="flex" align="middle">
                      <!-- Webhook URL输入框 -->
                      <el-col :span="16">
                        <el-form-item label="" :prop="`value[${index}].webhookUrl`"
                          :rules="{ required: true, message: $t('common.enterWebhookAddress'), trigger: 'blur' }">
                          <el-input v-model="item.webhookUrl"
                            :placeholder="$t('common.enterWecomWebhookAddress')"
                            clearable maxlength="200" />
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
                    <!-- 加签密钥区域 -->
                    <el-row type="flex" align="middle" style="margin-top: 8px;">
                      <el-col :span="8">
                        <el-form-item label=" " style="margin-bottom: 0;">
                          <el-switch v-model="item.showSecret" :active-text="$t('common.enableEncryption')" :inactive-text="$t('common.disableEncryption')"
                            style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item v-if="item.showSecret" label="" :prop="`value[${index}].secret`" :rules="[
                          { max: 100, message: $t('common.secretLengthMax100'), trigger: 'blur' },
                          { required: true, message: $t('common.enterSignatureSecret'), trigger: 'blur' }
                        ]">
                          <el-input class="inputIcon" v-model="item.secret" :placeholder="$t('common.enterWecomSignatureSecret')" clearable
                            maxlength="100" show-password />
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-row>
                </el-form>
              </div>

              <!-- 电信集约化服务台配置 -->
              <div class="notice-config-section" v-if="form.channelString.includes('szh')">
                <div class="section-title">{{ $t('common.telecomServiceDesk') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.szh" label-width="100px">
                  <!-- 安全网关开关 -->
                  <el-row type="flex" align="middle" style="margin-top: 16px;">
                    <el-col :span="8">
                      <el-form-item :label="$t('common.securityGateway')" style="margin-bottom: 0;">
                        <template #label>
                          <span>{{ $t('common.securityGateway') }}</span>
                          <el-tooltip placement="top" style="z-index: 4020 !important;">
                            <div slot="content">
                              {{ $t('common.securityGatewayTooltip') }}
                            </div>
                            <i class="el-icon-question" style="width: 24px;line-height: 32px;"></i>
                          </el-tooltip>
                        </template>
                        <el-switch v-model="noticeTemplates.szh.IsEncrypted"
                          style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>

              <!-- HTTP接口配置 -->
              <div class="notice-config-section" v-if="form.channelString.includes('http')">
                <div class="section-title">HTTP{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.http" label-width="120px">
                  <!-- 请求URL输入框 -->
                  <el-row type="flex" align="middle">
                    <el-col :span="16">
                      <el-form-item prop="webhookUrl" :label="$t('common.requestUrl')"
                        :rules="{ required: true, message: $t('common.enterRequestUrlAddress'), trigger: 'blur' }">
                        <el-input v-model="noticeTemplates.http.webhookUrl" :placeholder="$t('common.enterRequestUrlAddress')" clearable
                          maxlength="500" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 请求方法选择 + 模式切换 -->
                  <el-row type="flex" align="middle" style="margin-top: 10px; justify-content: space-between;">
                    <el-col :span="8">
                      <el-form-item :label="$t('common.requestMethod')" prop="method">
                        <el-radio-group v-model="noticeTemplates.http.method">
                          <el-radio label="POST">POST</el-radio>
                          <el-radio label="GET">GET</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8" style="text-align: right;">
                      <el-button-group>
                        <el-button :type="noticeTemplates.http.configMode === 'form' ? 'primary' : 'default'"
                          size="small" @click="switchHttpConfigMode('form')">
                          {{ $t('common.formMode') }}
                        </el-button>
                        <el-button :type="noticeTemplates.http.configMode === 'json' ? 'primary' : 'default'"
                          size="small" @click="switchHttpConfigMode('json')">
                          {{ $t('common.jsonMode') }}
                        </el-button>
                      </el-button-group>
                    </el-col>
                  </el-row>

                  <!-- 表单模式 -->
                  <div v-if="noticeTemplates.http.configMode === 'form'">
                    <!-- 请求头配置 -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestHeader')" prop="headers">
                          <div style="margin-bottom: 10px;">
                            <el-button type="primary" size="small" @click="addHeader">{{ $t('common.addRequestHeader') }}</el-button>
                          </div>
                          <div v-for="(header, headerIndex) in noticeTemplates.http.headers" :key="headerIndex"
                            class="header-item">
                            <el-form-item label="" :prop="`headers[${headerIndex}].name`"
                              style="display: inline-block; width: 200px;">
                              <el-input v-model="header.name" :placeholder="$t('common.parameterName')" clearable />
                            </el-form-item>
                            <el-form-item label="" :prop="`headers[${headerIndex}].type`"
                              style="display: inline-block; width: 120px; margin-left: 10px;">
                              <el-select v-model="header.type" :placeholder="$t('common.parameterType')" @change="() => { header.value = '' }">
                                <el-option label="String" value="string"></el-option>
                                <el-option label="Int" value="number"></el-option>
                                <el-option label="Boolean" value="boolean"></el-option>
                              </el-select>
                            </el-form-item>
                            <el-form-item label="" :prop="`headers[${headerIndex}].value`"
                              style="display: inline-block; width: 250px; margin-left: 10px;">
                              <template v-if="header.type === 'string'">
                                <el-input v-model="header.value" :placeholder="$t('common.parameterValue')" clearable />
                              </template>
                              <template v-else-if="header.type === 'number'">
                                <el-input v-model.number="header.value" :placeholder="$t('common.pleaseInputNumber')" clearable type="number" />
                              </template>
                              <template v-else-if="header.type === 'boolean'">
                                <el-select v-model="header.value" :placeholder="$t('common.pleaseSelect')" clearable>
                                  <el-option label="true" value="true"></el-option>
                                  <el-option label="false" value="false"></el-option>
                                </el-select>
                              </template>
                            </el-form-item>
                            <el-button type="danger" size="small" @click="removeHeader(headerIndex)"
                              style="margin-left: 10px;">{{ $t('common.delete') }}</el-button>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <!-- 请求参数配置 -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestParameter')" prop="params">
                          <div style="margin-bottom: 10px;">
                            <el-button type="primary" size="small" @click="addParam">{{ $t('common.addRequestParameter') }}</el-button>
                          </div>
                          <div v-for="(param, paramIndex) in noticeTemplates.http.params" :key="paramIndex"
                            class="param-item">
                            <el-form-item label="" :prop="`params[${paramIndex}].name`"
                              style="display: inline-block; width: 200px;">
                              <el-input v-model="param.name" :placeholder="$t('common.parameterName')" clearable />
                            </el-form-item>
                            <el-form-item label="" :prop="`params[${paramIndex}].type`"
                              style="display: inline-block; width: 120px; margin-left: 10px;">
                              <el-select v-model="param.type" :placeholder="$t('common.parameterType')" @change="() => { param.value = '' }">
                                <el-option label="String" value="string"></el-option>
                                <el-option label="Int" value="number"></el-option>
                                <el-option label="Boolean" value="boolean"></el-option>
                                <el-option :label="$t('common.existingDataItem')" value="custom"></el-option>
                              </el-select>
                            </el-form-item>
                            <el-form-item label="" :prop="`params[${paramIndex}].value`"
                              style="display: inline-block; width: 250px; margin-left: 10px;">
                              <template v-if="param.type === 'string'">
                                <el-input v-model="param.value" :placeholder="$t('common.parameterValue')" clearable />
                              </template>
                              <template v-else-if="param.type === 'number'">
                                <el-input v-model.number="param.value" :placeholder="$t('common.pleaseInputNumber')" clearable type="number" />
                              </template>
                              <template v-else-if="param.type === 'boolean'">
                                <el-select v-model="param.value" :placeholder="$t('common.pleaseSelect')" clearable>
                                  <el-option label="true" value="true"></el-option>
                                  <el-option label="false" value="false"></el-option>
                                </el-select>
                              </template>
                              <template v-else-if="param.type === 'custom'">
                                <el-select v-model="param.value" :placeholder="$t('common.selectExistingDataItem')" clearable>
                                  <el-option :label="$t('common.alarmId')" :value="alarmIdValue"></el-option>
                                  <el-option :label="$t('common.alarmName')" :value="alarmNameValue"></el-option>
                                  <el-option :label="$t('common.alarmLevel')" :value="alarmLevelValue"></el-option>
                                  <el-option :label="$t('common.alarmContent')" :value="alarmContentValue"></el-option>
                                  <el-option :label="$t('common.alarmTag')" :value="alarmTagValue"></el-option>
                                  <el-option :label="$t('common.alarmTime')" :value="alarmTimeValue"></el-option>
                                  <el-option :label="$t('common.customContent')" :value="customContentValue"></el-option>
                                </el-select>
                              </template>
                            </el-form-item>
                            <el-button type="danger" size="small" @click="removeParam(paramIndex)"
                              style="margin-left: 10px;">{{ $t('common.delete') }}</el-button>
                            <!-- 当选择自定义内容时显示文本输入框 -->
                            <el-form-item v-if="param.value === customContentValue" style="margin-top: 10px; display: flex;">
                              <template #label>
                                <div style="display: flex; align-items: center;">
                                  <span style="color: #ff4949;margin-right: 4px;">*</span>
                                  <span>{{ $t('common.customContent') }}</span>
                                  <el-tooltip style="z-index: 4020 !important;" :content="$t('common.customContentTooltip')"
                                    placement="top">
                                    <i class="el-icon-question"
                                      style="width: 14px; line-height: 32px; margin-left: 5px;"></i>
                                  </el-tooltip>
                                </div>
                              </template>

                              <el-input v-model="param.customContent" type="textarea" maxlength="200"
                                style="min-width: 497px;" :rows="3" :placeholder="$t('common.enterCustomContent')" clearable />
                            </el-form-item>
                            <el-form-item :label="$t('common.existingDataItem')" v-if="param.value === customContentValue"
                              style="margin-top: 10px; display: block; width: 616px;">
                              <el-select v-model="param.selectedDataItem" :placeholder="$t('common.selectExistingDataItem')" clearable
                                @change="addDataItemToCustomContent(param, param.selectedDataItem)">
                                <el-option :label="$t('common.alarmId')" :value="$t('common.alarmId')"></el-option>
                                <el-option :label="$t('common.alarmName')" :value="$t('common.alarmName')"></el-option>
                                <el-option :label="$t('common.alarmLevel')" :value="$t('common.alarmLevel')"></el-option>
                                <el-option :label="$t('common.alarmContent')" :value="$t('common.alarmContent')"></el-option>
                                <el-option :label="$t('common.alarmTag')" :value="$t('common.alarmTag')"></el-option>
                                <el-option :label="$t('common.alarmTime')" :value="$t('common.alarmTime')"></el-option>
                              </el-select>
                            </el-form-item>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- JSON模式 -->
                  <div v-if="noticeTemplates.http.configMode === 'json'">
                    <!-- 请求头JSON编辑 -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestHeaderJson')" prop="headersJson">
                          <el-button type="text" size="small" @click="formatJson('headers')"
                            style="margin-bottom: 8px;">
                            <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                          </el-button>
                          <el-input v-model="noticeTemplates.http.headersJson" type="textarea" :rows="4"
                            :placeholder="$t('common.requestHeaderJsonExample')" clearable
                            @blur="validateJson('headers')" />
                          <div v-if="noticeTemplates.http.headersJsonError"
                            style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                            {{ noticeTemplates.http.headersJsonError }}
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <!-- 请求体JSON编辑 -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestBodyJson')" prop="bodyJson">
                          <el-button type="text" size="small" @click="formatJson('body')" style="margin-bottom: 8px;">
                            <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                          </el-button>
                          <el-input v-model="noticeTemplates.http.bodyJson" type="textarea" :rows="8"
                            :placeholder="$t('common.requestBodyJsonExample')"
                            clearable @blur="validateJson('body')" />
                          <div v-if="noticeTemplates.http.bodyJsonError"
                            style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                            {{ noticeTemplates.http.bodyJsonError }}
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- 接口测试 -->
                  <el-row style="margin-top: 10px;">
                    <el-col :span="24">
                      <el-form-item>
                        <el-button type="primary" @click="testConnectivity">{{ $t('common.interfaceTest') }}</el-button>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </el-col>

            <!-- 备注输入框（优化：确保prop与form字段对应，支持编辑） -->
            <el-col :span="20" style="margin-bottom: 20px; margin-top: 10px;">
              <el-form-item :label="$t('common.remarkInfo')" prop="remark">
                <el-input type="textarea" :rows="3" v-model="form.remark" :placeholder="$t('common.enterRemarkInfoOptional')"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
      <el-button @click="cancel" :disabled="isSubmitDisabled">{{ $t('common.cancel') }}</el-button>
    </div>
  </a-drawer>
</template>

<script>
import { saveNotificationGroup, getNotificationGroupDetail, httpLt } from "@/api/notice/notice";

export default {
  name: "NoticeConfigForm",
  props: {
    rowData: { // 编辑场景传参：回显数据（含id）
      type: Object,
      default: () => ({}) // 初始化为空对象，避免undefined
    },
    opt: { // 兼容原有传参，实际已用动态标题替代，可后续删除
        type: String,
        default: ''
     },
    isShowTab: {
      type: String,
      default: ""
    },
  },
  computed: {
    customContentValue() {
      return this.$t('common.customContent');
    },
    alarmIdValue() {
      return this.$t('common.alarmId');
    },
    alarmNameValue() {
      return this.$t('common.alarmName');
    },
    alarmLevelValue() {
      return this.$t('common.alarmLevel');
    },
    alarmContentValue() {
      return this.$t('common.alarmContent');
    },
    alarmTagValue() {
      return this.$t('common.alarmTag');
    },
    alarmTimeValue() {
      return this.$t('common.alarmTime');
    },
  },
  data() {
    return {
      userOptions: [],
      isSubmitDisabled: false,
      showModal: false,
      loading: false,
      selectedChannel: "", // 单选绑定值（中转用）

      // 优化2：form明确初始化所有字段（含remark），确保响应式
      form: {
        groupName: "",
        channelString: [], // 格式：['dd']/['qywx']/['szh']
        remark: "", // 关键：初始化remark字段，解决编辑无响应问题
      },

      // 通知模板配置
      noticeTemplates: {
        dd: {
          key: "dd",
          value: [{ webhookUrl: "", secret: "", showSecret: false }],
          label: this.$t('common.dingTalk')
        },
        qywx: {
          key: "qywx",
          value: [{ webhookUrl: "", secret: "", showSecret: false }],
          label: this.$t('common.wechatWork')
        },
        szh: {
          key: "szh",
          label: this.$t('common.telecomServiceDesk'),
          IsEncrypted: false // 安全网关开关
        },
        http: {
          key: "http",
          label: 'HTTP',
          webhookUrl: "",
          method: "POST",
          // 表单模式字段
          configMode: "form", // form/json 切换标识
          headers: [],
          params: [],
          // JSON模式字段
          headersJson: "",
          bodyJson: "",
          headersJsonError: "",
          bodyJsonError: ""
        }
      },

      inputValue: "", // 标签输入值（预留扩展）

      // 表单校验规则
      rules: {
        groupName: [
          { required: true, message: this.$t('common.pleaseFillNotificationObjectName'), trigger: ["blur", "change", "input"] }
        ],
        channelString: [
          { required: true, message: this.$t('common.pleaseSelectAtLeastOneNotificationMethod'), trigger: ["blur", "change"] }
        ]
      }
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        // 弹窗显示：重置模板 + 初始化数据
        this.resetNoticeTemplates();
        this.init(this.rowData);
      } else {
        // 弹窗关闭：重置所有状态（含remark）
        this.form = { groupName: "", channelString: [], remark: "" };
        this.selectedChannel = "";
        this.$refs.form?.resetFields();
        this.isSubmitDisabled = false;
        this.inputValue = "";
      }
    },
    // 监听HTTP配置模式切换
    'noticeTemplates.http.configMode'(newMode, oldMode) {
      if (newMode === 'json' && oldMode === 'form') {
        // 表单转JSON
        this.formToJson();
      } else if (newMode === 'form' && oldMode === 'json') {
        // JSON转表单
        this.jsonToForm();
      }
    }
  },
  methods: {
    // 重置通知模板
    resetNoticeTemplates() {
      Object.keys(this.noticeTemplates).forEach(key => {
        if (key === "dd" || key === "qywx") {
          this.noticeTemplates[key].value = [{ webhookUrl: "", secret: "", showSecret: false }];
        } else if (key === "szh") {
          this.noticeTemplates[key] = {
            key: "szh",
            label: this.$t('common.telecomServiceDesk'),
            IsEncrypted: false
          };
        } else if (key === "http") {
          this.noticeTemplates[key] = {
            key: "http",
            label: 'HTTP',
            webhookUrl: "",
            method: "POST",
            configMode: "form",
            headers: [],
            params: [],
            headersJson: "",
            bodyJson: "",
            headersJsonError: "",
            bodyJsonError: ""
          };
        }
      });
    },

    // 获取通知方式中文标签
    getNoticeLabel(key) {
      return this.noticeTemplates[key]?.label || key;
    },

    // 切换HTTP配置模式
    switchHttpConfigMode(mode) {
      this.noticeTemplates.http.configMode = mode;
    },

    // 表单转JSON
    formToJson() {
      const httpConfig = this.noticeTemplates.http;
      
      // 1. 请求头转JSON
      try {
        const headersObj = {};
        httpConfig.headers.forEach(header => {
          if (header.name && header.name.trim()) {
            headersObj[header.name.trim()] = header.value || "";
          }
        });
        httpConfig.headersJson = JSON.stringify(headersObj, null, 2);
        httpConfig.headersJsonError = "";
      } catch (e) {
        httpConfig.headersJsonError = this.$t('common.requestHeaderJsonFormatFailed');
      }

      // 2. 请求体转JSON
      try {
        const bodyObj = {};
        httpConfig.params.forEach(param => {
          if (param.name && param.name.trim()) {
            let paramValue = param.value;
            if (param.type === 'custom') {
              if (param.value === this.customContentValue) {
                paramValue = param.customContent || "";
              } else {
                paramValue = `#${param.value}#`;
              }
            }
            bodyObj[param.name.trim()] = paramValue;
          }
        });
        httpConfig.bodyJson = JSON.stringify(bodyObj, null, 2);
        httpConfig.bodyJsonError = "";
      } catch (e) {
        httpConfig.bodyJsonError = this.$t('common.requestBodyJsonFormatFailed');
      }
    },

    // JSON转表单
    jsonToForm() {
      const httpConfig = this.noticeTemplates.http;
      
      // 清空原有数据
      httpConfig.headers = [];
      httpConfig.params = [];

      // 1. 解析请求头JSON
      try {
        if (httpConfig.headersJson.trim()) {
          const headersObj = JSON.parse(httpConfig.headersJson);
          Object.keys(headersObj).forEach(name => {
            const value = headersObj[name];
            let type = "string";
            if (typeof value === 'number') {
              type = "number";
            } else if (typeof value === 'boolean') {
              type = "boolean";
            }
            httpConfig.headers.push({
              name,
              value: String(value),
              type
            });
          });
        }
        httpConfig.headersJsonError = "";
      } catch (e) {
        httpConfig.headersJsonError = this.$t('common.requestHeaderJsonParseFailed');
      }

      // 2. 解析请求体JSON
      try {
        if (httpConfig.bodyJson.trim()) {
          const bodyObj = JSON.parse(httpConfig.bodyJson);
          Object.keys(bodyObj).forEach(name => {
            let value = bodyObj[name];
            let type = "string";
            let customContent = "";
            
            // 判断是否为自定义数据项
            if (typeof value === 'string' && value.includes('#')) {
              // 尝试提取已有数据项
              const matches = value.match(/#([^#]+)#/g);
              if (matches && matches.length > 0) {
                type = "custom";
                // 如果是多个数据项组合，认为是自定义内容
                if (matches.length > 1) {
                  customContent = value;
                  value = this.customContentValue;
                } else {
                  // 单个数据项
                  const extractedValue = matches[0].replace(/#/g, '');
                  value = extractedValue;
                }
              }
            } else if (typeof value === 'number') {
              type = "number";
            } else if (typeof value === 'boolean') {
              type = "boolean";
            }

            httpConfig.params.push({
              name,
              value: String(value),
              type,
              customContent,
              selectedDataItem: ""
            });
          });
        }
        httpConfig.bodyJsonError = "";
      } catch (e) {
        httpConfig.bodyJsonError = this.$t('common.requestBodyJsonParseFailed');
      }
    },

    // 格式化JSON
    formatJson(type) {
      const httpConfig = this.noticeTemplates.http;
      const jsonStr = type === 'headers' ? httpConfig.headersJson : httpConfig.bodyJson;
      
      try {
        if (jsonStr.trim()) {
          const obj = JSON.parse(jsonStr);
          const formattedJson = JSON.stringify(obj, null, 2);
          if (type === 'headers') {
            httpConfig.headersJson = formattedJson;
            httpConfig.headersJsonError = "";
          } else {
            httpConfig.bodyJson = formattedJson;
            httpConfig.bodyJsonError = "";
          }
        }
      } catch (e) {
        if (type === 'headers') {
          httpConfig.headersJsonError = this.$t('common.jsonFormatError');
        } else {
          httpConfig.bodyJsonError = this.$t('common.jsonFormatError');
        }
      }
    },

    // 校验JSON格式
    validateJson(type) {
      const httpConfig = this.noticeTemplates.http;
      const jsonStr = type === 'headers' ? httpConfig.headersJson : httpConfig.bodyJson;
      
      try {
        if (jsonStr.trim()) {
          JSON.parse(jsonStr);
        }
        if (type === 'headers') {
          httpConfig.headersJsonError = "";
        } else {
          httpConfig.bodyJsonError = "";
        }
      } catch (e) {
        if (type === 'headers') {
          httpConfig.headersJsonError = this.$t('common.jsonFormatError');
        } else {
          httpConfig.bodyJsonError = this.$t('common.jsonFormatError');
        }
      }
    },

    // 单选切换：同步到form.channelString数组
    handleChannelChange(val) {
      this.form.channelString = val ? [val] : [];
      // 手动触发表单字段验证，解决选择后错误提示不关闭的问题
      this.$nextTick(() => {
        this.$refs.form?.validateField('channelString');
      });
    },

    // 新增配置项
    addCondition(key) {
      if (key === "dd" || key === "qywx") {
        this.noticeTemplates[key].value.push({
          webhookUrl: "",
          secret: "",
          showSecret: false
        });
      }
    },

    // 新增请求头
    addHeader() {
      this.noticeTemplates.http.headers.push({ name: "", value: "", type: "string" });
    },

    // 删除请求头
    removeHeader(headerIndex) {
      this.noticeTemplates.http.headers.splice(headerIndex, 1);
    },

    // 新增参数
    addParam() {
      this.noticeTemplates.http.params.push({ name: "", type: "string", value: "", customContent: "", selectedDataItem: "" });
    },
    
    // 添加数据项到自定义内容
    addDataItemToCustomContent(param, dataItem) {
      if (dataItem) {
        // 如果自定义内容已有值，添加空格分隔
        const separator = param.customContent ? ' ' : '';
        // 以 #数据项# 格式添加到自定义内容后面
        param.customContent += separator + `#${dataItem}#`;
        // 清空选择，允许再次选择相同项
        param.selectedDataItem = "";
      }
    },

    // 删除参数
    removeParam(paramIndex) {
      this.noticeTemplates.http.params.splice(paramIndex, 1);
    },

    // 测试接口连通性
    testConnectivity() {
      let httpConfig = this.noticeTemplates.http;
      const errors = [];

      if (!httpConfig.webhookUrl.trim()) {
        errors.push(this.$t('common.interfaceUrlCannotBeEmpty'));
      }

      // 根据不同模式进行校验
      if (httpConfig.configMode === 'json') {
        // JSON模式校验
        if (httpConfig.headersJson.trim()) {
          try {
            JSON.parse(httpConfig.headersJson);
          } catch (e) {
            errors.push(this.$t('common.requestHeaderJsonFormatError'));
          }
        }
        if (httpConfig.bodyJson.trim()) {
          try {
            JSON.parse(httpConfig.bodyJson);
          } catch (e) {
            errors.push(this.$t('common.requestBodyJsonFormatError'));
          }
        }
      } else {
        // 表单模式校验
        if (httpConfig.headers && httpConfig.headers.length > 0) {
          const headerNameMap = new Map();
          for (let i = 0; i < httpConfig.headers.length; i++) {
            const name = httpConfig.headers[i].name && httpConfig.headers[i].name.trim();
            if (name && headerNameMap.has(name)) {
              const firstIndex = headerNameMap.get(name);
              errors.push(`${this.$t('common.requestHeaderNameDuplicate', { firstIndex: firstIndex + 1, currentIndex: i + 1, name })}`);
              break;
            } else if (name) {
              headerNameMap.set(name, i);
            }
          }

          // 校验请求头参数名和值非空
          for (let i = 0; i < httpConfig.headers.length; i++) {
            const header = httpConfig.headers[i];
            const name = (header.name || '').trim();
            const value = String(header.value || '').trim();
            if (!name) {
              errors.push(`${this.$t('common.requestHeaderNameCannotBeEmpty', { index: i + 1 })}`);
              break;
            }
            if (!value) {
              errors.push(`${this.$t('common.requestHeaderValueCannotBeEmpty', { index: i + 1 })}`);
              break;
            }
          }
        }

        // 校验请求参数名称唯一性
        if (httpConfig.params && httpConfig.params.length > 0) {
          const paramNameMap = new Map();
          for (let i = 0; i < httpConfig.params.length; i++) {
            const name = httpConfig.params[i].name && httpConfig.params[i].name.trim();
            if (name && paramNameMap.has(name)) {
              const firstIndex = paramNameMap.get(name);
              errors.push(`${this.$t('common.requestParameterNameDuplicate', { firstIndex: firstIndex + 1, currentIndex: i + 1, name })}`);
              break;
            } else if (name) {
              paramNameMap.set(name, i);
            }
          }

          // 校验请求参数名和值非空，以及自定义内容的校验
          for (let i = 0; i < httpConfig.params.length; i++) {
            const param = httpConfig.params[i];
            const name = (param.name || '').trim();
            const value = String(param.value || '').trim();
            if (!name) {
              errors.push(`${this.$t('common.requestParameterNameCannotBeEmpty', { index: i + 1 })}`);
              break;
            }
            if (!value) {
              errors.push(`${this.$t('common.requestParameterValueCannotBeEmpty', { index: i + 1 })}`);
              break;
            }
            // 如果参数值为自定义内容，需要校验customContent是否存在且不为空
            if (value === this.customContentValue) {
              const customContent = (param.customContent || '').trim();
              if (!customContent) {
                errors.push(`${this.$t('common.customContentCannotBeEmpty', { index: i + 1 })}`);
                break;
              }
            }
          }
        }
      }

      // 如果有错误，显示第一个错误并返回
      if (errors.length > 0) {
        this.$message.error(errors[0]);
        return;
      }

      // 组装测试参数
      let convertedHeaders = [];
      let convertedBody = [];

      if (httpConfig.configMode === 'json') {
        // JSON模式转换
        try {
          if (httpConfig.headersJson.trim()) {
            const headersObj = JSON.parse(httpConfig.headersJson);
            convertedHeaders = Object.keys(headersObj).map(name => ({
              paramName: name,
              paramValue: String(headersObj[name])
            }));
          }
          if (httpConfig.bodyJson.trim()) {
            const bodyObj = JSON.parse(httpConfig.bodyJson);
            convertedBody = Object.keys(bodyObj).map(name => ({
              paramName: name,
              paramValue: String(bodyObj[name]),
              paramType: "STRING"
            }));
          }
        } catch (e) {
          this.$message.error(this.$t('common.jsonParseFailed'));
          return;
        }
      } else {
        // 表单模式转换
        convertedHeaders = (httpConfig.headers || []).map(header => ({
          paramName: header.name || '',
          paramValue: header.value || ''
        }));
        
        convertedBody = (httpConfig.params || []).map(param => {
          const bodyItem = {
            paramName: param.name || '',
            paramValue: param.type === 'custom' && param.value ? `#${param.value}#` : (param.value || ''),
            paramType: param.type === 'custom' ? "STRING" : param.type === 'number' ? "INT" : param.type.toUpperCase()
          };
          // 如果是自定义内容类型且有customContent值，将其添加到body对象中
          if (param.type === 'custom' && param.value === this.customContentValue && param.customContent) {
            bodyItem.customContent = param.customContent;
          }
          return bodyItem;
        });
      }

      let params = {
        url: httpConfig.webhookUrl.trim(),
        method: httpConfig.method,
        headers: convertedHeaders,
        body: convertedBody
      };
      
      httpLt(params).then((res) => {
        console.log(res);
        if (res.success) {
          this.$message.success(this.$t('common.interfaceTestSuccess'));
        } else {
          this.$message.error(res.error);
        }
      })
    },

    // 删除配置项（至少保留1个）
    removeCondition(key, index) {
      const template = this.noticeTemplates[key];
      if (template.value.length <= 1) {
        this.$message.warning(`${this.$t('common.atLeastConfigureOne')} ${this.getNoticeLabel(key)} ${this.$t('common.information')}`);
        return;
      }
      template.value.splice(index, 1);
    },

    // 初始化表单（编辑场景回显）
    init(row) {
      if (!row?.id) { // 新增场景：row无id
        this.form = { groupName: "", channelString: [], remark: "" };
      } else { // 编辑场景：有id才调用详情接口
        this.getNotificationGroupDetail();
      }
    },

    // 编辑场景：获取详情并回显
    getNotificationGroupDetail() {
      const data = { id: this.rowData.id };
      // 真实项目保留接口调用，此处用mock演示
      // getNotificationGroupDetail(data).then(res => { ... })
      const mockRes = {
        status: 200,
        message: "Success",
        data: this.rowData
      };

      if (mockRes.status === 200) {
        const detail = mockRes.data;
        // 优化：try-catch处理JSON解析，避免格式错误导致报错
        let channelString = [];
        let channelParam = {};
        try {
          channelString = detail.channelString ? JSON.parse(detail.channelString) : [];
          channelParam = detail.channelParam ? JSON.parse(detail.channelParam) : {};
        } catch (e) {
          console.error(this.$t('common.jsonParseError'), e);
          this.$message.error(this.$t('common.dataFormatAbnormalPleaseRefresh'));
          return;
        }

        // 1. 回显基础表单（含remark）
        this.form.groupName = detail.groupName || "";
        this.form.remark = detail.remark || ""; // 关键：回显备注，支持编辑
        this.form.channelString = channelString;
        this.selectedChannel = channelString[0] || "";

        // 2. 回显通知配置
        if (channelParam) {
          Object.keys(channelParam).forEach(key => {
            if (this.noticeTemplates[key]) {
              if (key === "szh") {
                const szhConfig = channelParam[key][0] || {};
                this.noticeTemplates.szh.IsEncrypted = szhConfig.IsEncrypted || false;
              } else if (key === "http") {
                const httpConfig = channelParam[key][0];
                if (httpConfig) {
                  this.noticeTemplates.http.webhookUrl = httpConfig.webhookUrl || "";
                  this.noticeTemplates.http.method = httpConfig.method || "POST";
                  
                  // 回显表单模式数据
                  this.noticeTemplates.http.headers = (httpConfig.headers || []).map(header => ({
                    name: header.paramName || "",
                    value: header.paramValue || "",
                    type: header.paramType ? header.paramType.toLowerCase() : "string"
                  }));
                  
                  this.noticeTemplates.http.params = (httpConfig.body || []).map(param => {
                    let paramValue = param.paramValue || "";
                    let type = "string";
                    let customContent = "";
                    
                    // 处理自定义数据项
                    if (param.paramValue && param.paramValue.startsWith('#') && param.paramValue.endsWith('#')) {
                      const extractedValue = param.paramValue.slice(1, -1);
                      if (extractedValue === this.customContentValue) {
                        paramValue = this.customContentValue;
                        type = "custom";
                        customContent = param.customContent || "";
                      } else {
                        paramValue = extractedValue;
                        type = "custom";
                      }
                    } else {
                      type = param.paramType ? param.paramType.toLowerCase() : "string";
                    }
                    
                    return {
                      name: param.paramName || "",
                      value: paramValue,
                      type: type,
                      customContent: customContent,
                      selectedDataItem: ""
                    };
                  });
                  
                  // 同步生成JSON模式数据
                  this.formToJson();
                }
              } else {
                this.noticeTemplates[key].value = channelParam[key].map(item => ({
                  ...item,
                  showSecret: !!item.secret // 有secret自动打开加签
                }));
              }
            }
          });
        }
      }
    },

    // 取消操作
    cancel() {
      this.showModal = false;
    },

    // 提交表单
    handleSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;

        // 额外校验配置项合法性
        const errors = [];

        // 先进行HTTP特有校验
        if (this.form.channelString.includes("http")) {
          const httpConfig = this.noticeTemplates.http;

          if (!httpConfig.webhookUrl.trim()) {
            errors.push(this.$t('common.interfaceUrlCannotBeEmpty'));
          }

          // JSON模式校验
          if (httpConfig.configMode === 'json') {
            if (httpConfig.headersJson.trim()) {
              try {
                JSON.parse(httpConfig.headersJson);
              } catch (e) {
                errors.push(this.$t('common.requestHeaderJsonFormatError'));
              }
            }
            if (httpConfig.bodyJson.trim()) {
              try {
                JSON.parse(httpConfig.bodyJson);
              } catch (e) {
                errors.push(this.$t('common.requestBodyJsonFormatError'));
              }
            }
          } else {
            // 表单模式校验
            if (httpConfig.headers && httpConfig.headers.length > 0) {
              const headerNameMap = new Map();
              for (let i = 0; i < httpConfig.headers.length; i++) {
                const name = httpConfig.headers[i].name && httpConfig.headers[i].name.trim();
                if (name && headerNameMap.has(name)) {
                  const firstIndex = headerNameMap.get(name);
                  errors.push(`${this.$t('common.requestHeaderNameDuplicate', { firstIndex: firstIndex + 1, currentIndex: i + 1, name })}`);
                  break;
                } else if (name) {
                  headerNameMap.set(name, i);
                }
              }

              // 校验请求头参数名和值非空
              for (let i = 0; i < httpConfig.headers.length; i++) {
                const header = httpConfig.headers[i];
                const name = (header.name || '').trim();
                const value = String(header.value || '').trim();
                if (!name) {
                  errors.push(`${this.$t('common.requestHeaderNameCannotBeEmpty', { index: i + 1 })}`);
                  break;
                }
                if (!value) {
                  errors.push(`${this.$t('common.requestHeaderValueCannotBeEmpty', { index: i + 1 })}`);
                  break;
                }
              }
            }

            // 校验请求参数名称唯一性
            if (httpConfig.params && httpConfig.params.length > 0) {
              const paramNameMap = new Map();
              for (let i = 0; i < httpConfig.params.length; i++) {
                const name = httpConfig.params[i].name && httpConfig.params[i].name.trim();
                if (name && paramNameMap.has(name)) {
                  const firstIndex = paramNameMap.get(name);
                  errors.push(`${this.$t('common.requestParameterNameDuplicate', { firstIndex: firstIndex + 1, currentIndex: i + 1, name })}`);
                  break;
                } else if (name) {
                  paramNameMap.set(name, i);
                }
              }

              // 校验请求参数名和值非空，以及自定义内容的校验
              for (let i = 0; i < httpConfig.params.length; i++) {
                const param = httpConfig.params[i];
                const name = (param.name || '').trim();
                const value = String(param.value || '').trim();
                if (!name) {
                  errors.push(`${this.$t('common.requestParameterNameCannotBeEmpty', { index: i + 1 })}`);
                  break;
                }
                if (!value) {
                  errors.push(`${this.$t('common.requestParameterValueCannotBeEmpty', { index: i + 1 })}`);
                  break;
                }
                // 如果参数值为自定义内容，需要校验customContent是否存在且不为空
                if (value === this.customContentValue) {
                  const customContent = (param.customContent || '').trim();
                  if (!customContent) {
                    errors.push(`${this.$t('common.customContentCannotBeEmpty', { index: i + 1 })}`);
                    break;
                  }
                }
              }
            }
          }
        }

        // 如果已经有错误，显示第一个错误并返回
        if (errors.length > 0) {
          this.$message.error(errors[0]);
          return;
        }

        const noticeValid = this.form.channelString.every(key => {
          if (key === "http") {
            // HTTP的非空校验已经在前面处理了
            return this.noticeTemplates.http.method;
          } else if (key === "szh") {
            // 电信集约化服务台仅保留安全网关开关，无需额外校验
            return true;
          }
          // 其他通知方式按原数组方式处理
          else if (this.noticeTemplates[key].value) {
            return this.noticeTemplates[key].value.every(item => {
              if (key === "dd" || key === "qywx") {
                return item.webhookUrl.trim() !== "" && (!item.showSecret || item.secret.trim() !== "");
              }
              return true;
            });
          }
          return true;
        });

        if (!noticeValid) {
          this.$message.error(this.$t('common.pleaseCompleteAllSelectedNotificationTypes'));
          return;
        }

        // 组装提交数据
        const submitData = {
          ...this.form,
          id: this.rowData?.id || undefined, // 编辑传id，新增不传
          channelParam: {}
        };
        
        this.form.channelString.forEach(key => {
          if (key === "http") {
            // HTTP接口按后端要求的格式组装，转换字段名称和结构
            const httpConfig = this.noticeTemplates.http;
            let convertedHeaders = [];
            let convertedBody = [];
            
            // 根据模式处理数据
            if (httpConfig.configMode === 'json') {
              // JSON模式转换
              try {
                if (httpConfig.headersJson.trim()) {
                  const headersObj = JSON.parse(httpConfig.headersJson);
                  convertedHeaders = Object.keys(headersObj).map(name => ({
                    paramName: name,
                    paramValue: String(headersObj[name])
                  }));
                }
                if (httpConfig.bodyJson.trim()) {
                  const bodyObj = JSON.parse(httpConfig.bodyJson);
                  convertedBody = Object.keys(bodyObj).map(name => ({
                    paramName: name,
                    paramValue: String(bodyObj[name]),
                    paramType: "STRING"
                  }));
                }
              } catch (e) {
                this.$message.error(this.$t('common.jsonParseFailed'));
                return;
              }
            } else {
              // 表单模式转换
              convertedHeaders = (httpConfig.headers || []).map(header => ({
                paramName: header.name || '',
                paramValue: header.value || ''
              }));
              
              convertedBody = (httpConfig.params || []).map(param => {
                const bodyItem = {
                  paramName: param.name || '',
                  paramValue: param.type === 'custom' && param.value ? `#${param.value}#` : (param.value || ''),
                  paramType: param.type === 'custom' ? "STRING" : param.type === 'number' ? "INT" : param.type.toUpperCase()
                };
                // 如果是自定义内容类型且有customContent值，将其添加到body对象中
                if (param.type === 'custom' && param.value === this.customContentValue && param.customContent) {
                  bodyItem.customContent = param.customContent;
                }
                return bodyItem;
              });
            }

            // 构建符合后端要求的HTTP接口数据结构
            const httpData = {
              key: "http",
              webhookUrl: httpConfig.webhookUrl.trim(),
              method: httpConfig.method,
              headers: convertedHeaders,
              body: convertedBody
            };

            submitData.channelParam[key] = [httpData];
          } else if (key === "szh") {
            // 电信集约化服务台数据组装（仅保留安全网关开关）
            submitData.channelParam[key] = [{
              IsEncrypted: this.noticeTemplates.szh.IsEncrypted
            }];
          } else {
            submitData.channelParam[key] = [...this.noticeTemplates[key].value];
          }
        });

        // 提交接口
        this.isSubmitDisabled = true;
        saveNotificationGroup(submitData)
          .then(res => {
            this.isSubmitDisabled = false;
            if (res.data) {
              this.$modal.msgSuccess(this.$t('common.notificationConfigSaveSuccess'));
              this.showModal = false;
              this.$emit("refreshList"); // 通知父组件刷新列表
            } else {
              this.$modal.msgError(res.message || this.$t('common.saveFailed'));
            }
          })
          .catch(error => {
            this.isSubmitDisabled = false;
            console.error(this.$t('common.submitError'), error);
          });
      });
    },

    // 标签操作方法（预留扩展，当前未使用）
    handleClose(tag, index, type = "notice") {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index]?.dynamicTags) {
        targetArr[index].dynamicTags.splice(targetArr[index].dynamicTags.indexOf(tag), 1);
        this.$forceUpdate();
      }
    },
    showInput(index, type = "notice") {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index]) {
        targetArr[index].inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput?.$refs.input?.focus();
        });
      }
    },
    handleInputConfirm(index, type = "notice") {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index] && this.inputValue.trim()) {
        if (!targetArr[index].dynamicTags) targetArr[index].dynamicTags = [];
        targetArr[index].dynamicTags.push(this.inputValue.trim());
        targetArr[index].rightValue = targetArr[index].dynamicTags.join(",");
        targetArr[index].inputVisible = false;
        this.inputValue = "";
      }
    }
  }
};
</script>

<style scoped lang="less">
/* 配置区域样式 */
.notice-config-section {
  margin: 0 40px 20px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
}

/* HTTP接口样式 */
.header-item,
.param-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* 确保表单项目正确显示 */
.header-item .el-form-item,
.param-item .el-form-item {
  margin-bottom: 0;
}

/* 配置区域标题样式 */
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f2f2;
}

/* 标签相关样式（预留） */
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

/* 步骤条样式（预留） */
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

/* 行布局对齐样式 */
:deep(.el-row--flex) {
  align-items: center;
}

/* 错误提示样式 */
:deep(.el-form-item__error) {
  font-size: 12px;
  color: #ff4d4f;
  background-color: #fef0f0;
  padding: 2px 5px;
  border-radius: 3px;
}

/* 抽屉滚动优化 */
:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}

/* 开关样式微调 */
:deep(.el-switch__label) {
  font-size: 12px;
  padding: 0 8px;
}

/* 问题图标样式 */
::v-deep .el-icon-question {
  color: #1890ff;
  cursor: pointer;
}

.inputIcon {
  :deep(.el-input__inner) {
    padding-right: 60px;
  }
}
</style>