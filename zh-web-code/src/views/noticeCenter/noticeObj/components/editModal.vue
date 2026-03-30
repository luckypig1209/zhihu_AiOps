<template>
<div>
  <a-drawer :title="rowData?.id ? $t('common.editNotificationObject') : $t('common.addNotificationObject')" :visible="showModal" width="1080px" placement="right"
    :closable="true" :mask-closable="false" @close="cancel">
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

            <!-- 通知方式单选 -->
            <el-col :span="20" style="margin-bottom: 20px;">
              <el-form-item :label="$t('common.notificationMethod')" prop="channelString">
                <el-radio-group v-model="selectedChannel" @change="handleChannelChange" size="medium">
                  <el-radio-button label="dd">{{ $t('common.dingTalk') }}</el-radio-button>
                  <el-radio-button label="qywx">{{ $t('common.wecom') }}</el-radio-button>
                  <el-radio-button label="szh">{{ $t('common.telecomServiceDesk') }}</el-radio-button>
                  <el-radio-button label="http">HTTP</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>

            <!-- 配置区域 -->
            <el-col :span="24">
              <!-- 钉钉配置 -->
              <div class="notice-config-section" v-if="form.channelString.includes('dd')">
                <div class="section-title">{{ getNoticeLabel('dd') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.dd" label-width="10px">
                  <el-row v-for="(item, index) in noticeTemplates.dd.value" :key="index" :gutter="16"
                    style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                    <el-row type="flex" align="middle">
                      <el-col :span="16">
                        <el-form-item :prop="`value[${index}].webhookUrl`"
                          :rules="{ required: true, message: $t('common.enterWebhookAddress'), trigger: 'blur' }">
                          <el-input v-model="item.webhookUrl"
                            :placeholder="$t('common.enterDingTalkWebhookAddress')"
                            clearable maxlength="200" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="2">
                        <el-form-item>
                          <a-button type="danger" ghost @click="removeCondition('dd', index)">{{ $t('common.delete') }}</a-button>
                        </el-form-item>
                      </el-col>
                      <el-col :span="2">
                        <el-form-item>
                          <a-button type="primary" ghost v-if="index === 0" @click="addCondition('dd')">{{ $t('common.add') }}</a-button>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row type="flex" align="middle" style="margin-top: 8px;">
                      <el-col :span="8">
                        <el-form-item label=" " style="margin-bottom: 0;">
                          <el-switch v-model="item.showSecret" :active-text="$t('common.enableEncryption')" :inactive-text="$t('common.disableEncryption')"
                            style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item v-if="item.showSecret" :prop="`value[${index}].secret`" :rules="[
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
                <div class="section-title">{{ getNoticeLabel('qywx') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.qywx" label-width="10px">
                  <el-row v-for="(item, index) in noticeTemplates.qywx.value" :key="index" :gutter="16"
                    style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                    <el-row type="flex" align="middle">
                      <el-col :span="16">
                        <el-form-item :prop="`value[${index}].webhookUrl`"
                          :rules="{ required: true, message: $t('common.enterWebhookAddress'), trigger: 'blur' }">
                          <el-input v-model="item.webhookUrl"
                            :placeholder="$t('common.enterWecomWebhookAddress')"
                            clearable maxlength="200" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="2">
                        <el-form-item>
                          <a-button type="danger" ghost @click="removeCondition('qywx', index)">{{ $t('common.delete') }}</a-button>
                        </el-form-item>
                      </el-col>
                      <el-col :span="2">
                        <el-form-item>
                          <a-button type="primary" ghost v-if="index === 0" @click="addCondition('qywx')">{{ $t('common.add') }}</a-button>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row type="flex" align="middle" style="margin-top: 8px;">
                      <el-col :span="8">
                        <el-form-item label=" " style="margin-bottom: 0;">
                          <el-switch v-model="item.showSecret" :active-text="$t('common.enableEncryption')" :inactive-text="$t('common.disableEncryption')"
                            style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="8">
                        <el-form-item v-if="item.showSecret" :prop="`value[${index}].secret`" :rules="[
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
                <div class="section-title">{{ getNoticeLabel('szh') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.szh" label-width="100px">
                  <el-row type="flex" align="middle" style="margin-top: 16px;">
                    <el-col :span="8">
                      <el-form-item :label="$t('common.securityGateway')" style="margin-bottom: 0;">
                        <template #label>
                          <span>{{ $t('common.securityGateway') }}</span>
                          <el-tooltip placement="top">
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

              <!-- HTTP接口配置（优化JSON/表单转换：body与headers互转逻辑一致） -->
              <div class="notice-config-section" v-if="form.channelString.includes('http')">
                <div class="section-title">{{ getNoticeLabel('http') }}{{ $t('common.configuration') }}</div>
                <el-form :model="noticeTemplates.http" label-width="120px">
                  <!-- 请求URL -->
                  <el-row type="flex" align="middle">
                    <el-col :span="16">
                      <el-form-item prop="webhookUrl" :label="$t('common.requestUrl')"
                        :rules="{ required: true, message: $t('common.pleaseEnterRequestUrl'), trigger: 'blur' }">
                        <el-input v-model="noticeTemplates.http.webhookUrl" :placeholder="$t('common.pleaseEnterRequestUrl')" clearable
                          maxlength="500" />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <!-- 请求方法 + JSON模式切换 -->
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
                          size="small" @click="switchConfigMode('form')">
                          {{ $t('common.formMode') }}
                        </el-button>
                        <el-button :type="noticeTemplates.http.configMode === 'json' ? 'primary' : 'default'"
                          size="small" @click="switchConfigMode('json')">
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
                        <el-form-item :label="$t('common.requestHeaders')" prop="headers">
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
                              <el-select v-model="header.type" :placeholder="$t('common.parameterType')" @change="() => { header.value = undefined }">
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
                                <!-- <el-input v-model.number="header.value" placeholder="请输入数字" clearable type="number" /> -->
                               <el-input-number v-model="header.value" :placeholder="$t('common.pleaseEnterNumber')" 
                                                             clearable></el-input-number>
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
                        <el-form-item :label="$t('common.requestParameters')" prop="params">
                          <div style="margin-bottom: 10px;">
                            <el-button type="primary" size="small" @click="addParam">{{ $t('common.addParameter') }}</el-button>
                          </div>
                          <div v-for="(param, paramIndex) in noticeTemplates.http.params" :key="paramIndex"
                            class="param-item">
                            <el-form-item label="" :prop="`params[${paramIndex}].name`"
                              style="display: inline-block; width: 200px;">
                              <el-input v-model="param.name" :placeholder="$t('common.parameterName')" clearable />
                            </el-form-item>
                            <el-form-item label="" :prop="`params[${paramIndex}].type`"
                              style="display: inline-block; width: 120px; margin-left: 10px;">
                              <el-select v-model="param.type" :placeholder="$t('common.parameterType')" @change="() => { param.value = undefined }">
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
                                <!-- <el-input v-model.number="param.value" placeholder="请输入数字" clearable type="number" /> -->
                                 <el-input-number v-model="param.value" :placeholder="$t('common.pleaseEnterNumber')" 
                                                             clearable></el-input-number>
                              </template>
                              <template v-else-if="param.type === 'boolean'">
                                <el-select v-model="param.value" :placeholder="$t('common.pleaseSelect')" clearable>
                                  <el-option label="true" value="true"></el-option>
                                  <el-option label="false" value="false"></el-option>
                                </el-select>
                              </template>
                              <template v-else-if="param.type === 'custom'">
                                <el-select v-model="param.value" :placeholder="$t('common.selectExistingDataItem')" clearable>
                                  <el-option :label="$t('common.alertId')" value="告警ID"></el-option>
                                  <el-option :label="$t('common.alertName')" value="告警名称"></el-option>
                                  <el-option :label="$t('common.alertLevel')" value="告警级别"></el-option>
                                  <el-option :label="$t('common.alertContent')" value="告警内容"></el-option>
                                  <el-option :label="$t('common.alertLabel')" value="告警标签"></el-option>
                                  <el-option :label="$t('common.alertTime')" value="告警时间"></el-option>
                                  <el-option :label="$t('common.customContent')" value="自定义内容"></el-option>
                                </el-select>
                              </template>
                            </el-form-item>
                            <el-button type="danger" size="small" @click="removeParam(paramIndex)"
                              style="margin-left: 10px;">{{ $t('common.delete') }}</el-button>
                            <el-form-item v-if="param.value === '自定义内容'" style="margin-top: 10px; display: flex;">
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
                                style="min-width: 497px;" :rows="3" :placeholder="$t('common.pleaseEnterCustomContent')" clearable />
                            </el-form-item>
                            <el-form-item :label="$t('common.existingDataItem')" v-if="param.value === '自定义内容'"
                              style="margin-top: 10px; display: block; width: 616px;">
                              <el-select v-model="param.selectedDataItem" :placeholder="$t('common.selectExistingDataItem')" clearable
                                @change="addDataItemToCustomContent(param, param.selectedDataItem)">
                                <el-option :label="$t('common.alertId')" value="告警ID"></el-option>
                                <el-option :label="$t('common.alertName')" value="告警名称"></el-option>
                                <el-option :label="$t('common.alertLevel')" value="告警级别"></el-option>
                                <el-option :label="$t('common.alertContent')" value="告警内容"></el-option>
                                <el-option :label="$t('common.alertLabel')" value="告警标签"></el-option>
                                <el-option :label="$t('common.alertTime')" value="告警时间"></el-option>
                              </el-select>
                            </el-form-item>
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- JSON模式（body仿照headers，保留类型+自定义内容映射） -->
                  <div v-if="noticeTemplates.http.configMode === 'json'">
                    <!-- 请求头JSON编辑 -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestHeadersJson')" prop="headersJson">
                          <el-button type="text" size="small" @click="formatJson('headers')"
                            style="margin-bottom: 8px;">
                            <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                          </el-button>
                          <el-input v-model="noticeTemplates.http.headersJson" type="textarea" :rows="4"
                            placeholder='例如：{"Content-Type":"application/json","Token":"xxx"}' clearable
                            @blur="validateJson('headers')" />
                          <div v-if="noticeTemplates.http.headersJsonError"
                            style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                            {{ noticeTemplates.http.headersJsonError }}
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <!-- 请求体JSON编辑（完全仿照headers逻辑，保留参数类型+自定义内容注释） -->
                    <el-row style="margin-top: 10px;">
                      <el-col :span="24">
                        <el-form-item :label="$t('common.requestBodyJson')" prop="bodyJson">
                          <el-button type="text" size="small" @click="formatJson('body')" style="margin-bottom: 8px;">
                            <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                          </el-button>
                          <el-input v-model="noticeTemplates.http.bodyJson" type="textarea" :rows="8"
                            placeholder='例如：{"alertId":"#告警ID#","alertName":"#告警名称#","customContent":"#告警时间# #告警标签#"}'
                            clearable @blur="validateJson('body')" />
                          <div v-if="noticeTemplates.http.bodyJsonError"
                            style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                            {{ noticeTemplates.http.bodyJsonError }}
                          </div>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </div>

                  <!-- 接口测试按钮 -->
                  <el-row style="margin-top: 15px;margin-left: 120px;">
                    <el-col :span="24">
                      <el-button type="primary" @click="testConnectivity" :loading="testLoading">{{ $t('common.interfaceTest') }}</el-button>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </el-col>

            <!-- 备注输入框 -->
            <el-col :span="20" style="margin-bottom: 20px; margin-top: 10px;">
              <el-form-item :label="$t('common.remark')" prop="remark">
                <el-input type="textarea" :rows="3" v-model="form.remark" :placeholder="$t('common.pleaseEnterRemarkOptional')"></el-input>
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

      <!-- 接口测试结果弹窗 -->
  <el-dialog :title="$t('common.interfaceTestResult')" :visible.sync="testVisible" width="800px">
    <pre><code class="hljs" v-html="testResult"></code></pre>
    <span slot="footer" class="dialog-footer">
      <el-button @click="testVisible = false">{{ $t('common.close') }}</el-button>
    </span>
  </el-dialog>
  </div>
</template>

<script>
import { saveNotificationGroup, getNotificationGroupDetail, httpLt } from "@/api/notice/notice";
import { html_beautify } from 'js-beautify';
import hljs from "highlight.js/lib/highlight";
import "highlight.js/styles/github-gist.css";

// 注册highlight.js语言
hljs.registerLanguage("json", require("highlight.js/lib/languages/json"));
hljs.registerLanguage("java", require("highlight.js/lib/languages/java"));
hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("html", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("vue", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("plaintext", require("highlight.js/lib/languages/plaintext"));
hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"));
hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"));
hljs.registerLanguage("typescript", require("highlight.js/lib/languages/typescript"));

export default {
  name: "NoticeConfigForm",
  props: {
    rowData: {
      type: Object,
      default: () => ({})
    },
    opt: {
      type: String,
      default: "新增通知对象"
    }
  },
  data() {
    return {
      userOptions: [],
      isSubmitDisabled: false,
      showModal: false,
      loading: false,
      selectedChannel: "",
      
      // 新增：接口测试相关变量
      testLoading: false,
      testVisible: false,
      testResult: "",
      
      form: {
        groupName: "",
        channelString: [],
        remark: "",
      },
      noticeTemplates: {
        dd: {
          key: "dd",
          value: [{ webhookUrl: "", secret: "", showSecret: false }],
          label: "钉钉"
        },
        qywx: {
          key: "qywx",
          value: [{ webhookUrl: "", secret: "", showSecret: false }],
          label: "企业微信"
        },
        szh: {
          key: "szh",
          value: [{ name: "", code: "" }],
          label: "电信集约化服务台",
          IsEncrypted: false
        },
        http: {
          key: "http",
          webhookUrl: "",
          method: "POST",
          // 表单模式字段
          headers: [],
          params: [],
          // JSON模式字段
          configMode: "form", // form/json 切换标识
          headersJson: "",    // 请求头JSON字符串（含类型注释）
          bodyJson: "",       // 请求体JSON字符串（含类型+自定义内容注释，仿照headers）
          headersJsonError: "", // 请求头JSON校验错误
          bodyJsonError: "",   // 请求体JSON校验错误
          label: "HTTP"
        }
      },
      inputValue: "",
    };
  },
  computed: {
    rules() {
      if (!this.$t) return {};
      return {
        groupName: [
          { required: true, message: this.$t('common.pleaseEnterNotificationObjectName'), trigger: ["blur", "change", "input"] }
        ],
        channelString: [
          { required: true, message: this.$t('common.pleaseSelectAtLeastOneNotificationMethod'), trigger: ["blur", "change"] }
        ]
      };
    }
  },
  watch: {
    showModal(val) {
      if (val) {
        this.resetNoticeTemplates();
        this.init(this.rowData);
      } else {
        this.form = { groupName: "", channelString: [], remark: "" };
        this.selectedChannel = "";
        this.$refs.form?.resetFields();
        this.isSubmitDisabled = false;
        this.inputValue = "";
      }
    },
    // 监听表单模式切换，自动同步数据（headers和body同步互转）
    'noticeTemplates.http.configMode'(newMode, oldMode) {
      if (newMode === 'json' && oldMode === 'form') {
        // 表单转JSON：headers和body同步处理，body仿照headers逻辑
        this.formToJson();
      } else if (newMode === 'form' && oldMode === 'json') {
        // JSON转表单：headers和body同步解析，body仿照headers逻辑
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
          this.noticeTemplates[key].value = [{ name: "", code: "" }];
          this.noticeTemplates[key].IsEncrypted = false;
        } else if (key === "http") {
          this.noticeTemplates[key] = {
            ...this.noticeTemplates[key],
            webhookUrl: "",
            method: "POST",
            headers: [],
            params: [],
            configMode: "form",
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
      const labelMap = {
        dd: this.$t('common.dingTalk'),
        qywx: this.$t('common.wecom'),
        szh: this.$t('common.telecomServiceDesk'),
        http: 'HTTP'
      };
      return labelMap[key] || key;
    },

    // 切换配置模式（form/json）
    switchConfigMode(mode) {
      this.noticeTemplates.http.configMode = mode;
    },

    // 核心优化：表单模式转JSON模式（body完全仿照headers逻辑，保留参数类型+自定义内容）
    formToJson() {
      const httpConfig = this.noticeTemplates.http;
      // 1. 请求头转JSON（原有逻辑，保留类型映射注释）
      try {
        const headersObj = {};
        const headersTypeMap = {}; // 存储请求头名称与类型的映射
        httpConfig.headers.forEach(header => {
          if (header.name) {
            const headerName = header.name.trim();
            headersObj[headerName] = header.value;
            headersTypeMap[headerName] = header.type || "string"; // 记录类型
          }
        });
        // 生成请求头JSON（主体+类型映射注释）
        let headersJson = JSON.stringify(headersObj, null, 2);
        if (Object.keys(headersTypeMap).length > 0) {
          headersJson += `/*headersType:${JSON.stringify(headersTypeMap)}*/`;
        }
        httpConfig.headersJson = headersJson;
        httpConfig.headersJsonError = "";
      } catch (e) {
        httpConfig.headersJsonError = "请求头JSON格式化失败";
      }

      // 2. 请求体转JSON（完全仿照headers逻辑，新增参数类型映射+自定义内容映射）
      try {
        const bodyObj = {};
        const bodyTypeMap = {}; // 存储请求体参数名称与类型的映射（仿照headersTypeMap）
        const bodyCustomContentMap = {}; // 存储请求体自定义内容映射
        httpConfig.params.forEach(param => {
          if (param.name) {
            const paramName = param.name.trim();
            let paramValue = param.value;

            // 记录参数类型（仿照headers的类型记录逻辑）
            bodyTypeMap[paramName] = param.type || "string";

            // 处理自定义数据项
            if (param.type === 'custom') {
              if (paramValue === '自定义内容') {
                // 标记为#自定义内容#，并存储customContent
                bodyObj[paramName] = "#自定义内容#";
                bodyCustomContentMap[paramName] = param.customContent || "";
              } else {
                // 普通已有数据项
                bodyObj[paramName] = `#${paramValue}#`;
              }
            } else {
              // 普通参数（保留原始值）
              bodyObj[paramName] = paramValue;
            }
          }
        });

        // 生成请求体JSON（主体+类型映射注释+自定义内容注释，完全仿照headers）
        let bodyJson = JSON.stringify(bodyObj, null, 2);
        let extraComments = "";
        // 添加类型映射注释（仿照headers）
        if (Object.keys(bodyTypeMap).length > 0) {
          extraComments += `/*bodyType:${JSON.stringify(bodyTypeMap)}*/`;
        }
        // 添加自定义内容映射注释
        if (Object.keys(bodyCustomContentMap).length > 0) {
          extraComments += `/*bodyCustom:${JSON.stringify(bodyCustomContentMap)}*/`;
        }
        // 拼接最终的bodyJson
        if (extraComments) {
          bodyJson += extraComments;
        }

        httpConfig.bodyJson = bodyJson;
        httpConfig.bodyJsonError = "";
      } catch (e) {
        httpConfig.bodyJsonError = "请求体JSON格式化失败：" + e.message;
      }
    },

    // 核心优化：JSON模式转表单模式（body完全仿照headers逻辑，解析类型+自定义内容）
    jsonToForm() {
      const httpConfig = this.noticeTemplates.http;
      // 清空原有表单数据
      httpConfig.headers = [];
      httpConfig.params = [];

      // 1. 请求头JSON转表单（原有逻辑，解析类型映射注释）
      try {
        if (httpConfig.headersJson.trim()) {
          let headersJson = httpConfig.headersJson;
          let headersTypeMap = {};
          // 分离类型映射注释
          const typeMatch = headersJson.match(/\/\*headersType:(.*?)\*\//);
          if (typeMatch) {
            headersTypeMap = JSON.parse(typeMatch[1]);
            headersJson = headersJson.replace(/\/\*headersType:.*?\*\//, "").trim();
          }
          // 解析请求头主体
          const headersObj = JSON.parse(headersJson);
          Object.keys(headersObj).forEach(name => {
            const value = headersObj[name];
            // 优先使用映射中的类型，无则自动判断
            let type = headersTypeMap[name] || "string";
            if (!headersTypeMap[name]) {
              if (typeof value === 'number') {
                type = "number";
              } else if (typeof value === 'boolean') {
                type = "boolean";
              }
            }
            httpConfig.headers.push({
              name,
              value,
              type // 回填类型字段
            });
          });
        }
        httpConfig.headersJsonError = "";
      } catch (e) {
        httpConfig.headersJsonError = "请求头JSON解析失败：" + e.message;
      }

      // 2. 请求体JSON转表单（完全仿照headers逻辑，解析类型映射+自定义内容映射）
      try {
        if (httpConfig.bodyJson.trim()) {
          let bodyJson = httpConfig.bodyJson;
          let bodyTypeMap = {}; // 解析请求体参数类型映射（仿照headers）
          let bodyCustomContentMap = {}; // 解析请求体自定义内容映射
          
          // 第一步：分离并解析类型映射注释（仿照headers的类型注释解析）
          const bodyTypeMatch = bodyJson.match(/\/\*bodyType:(.*?)\*\//);
          if (bodyTypeMatch) {
            bodyTypeMap = JSON.parse(bodyTypeMatch[1]);
            bodyJson = bodyJson.replace(/\/\*bodyType:.*?\*\//, "").trim();
          }

          // 第二步：分离并解析自定义内容映射注释
          const bodyCustomMatch = bodyJson.match(/\/\*bodyCustom:(.*?)\*\//);
          if (bodyCustomMatch) {
            bodyCustomContentMap = JSON.parse(bodyCustomMatch[1]);
            bodyJson = bodyJson.replace(/\/\*bodyCustom:.*?\*\//, "").trim();
          }

          // 第三步：解析请求体主体JSON（仿照headers的主体解析）
          const bodyObj = JSON.parse(bodyJson);
          Object.keys(bodyObj).forEach(name => {
            let value = bodyObj[name];
            // 优先使用映射中的类型，无则自动判断（完全仿照headers逻辑）
            let type = bodyTypeMap[name] || "string";
            let customContent = bodyCustomContentMap[name] || ""; // 回填自定义内容

            // 自动判断类型（当无映射时，仿照headers）
            if (!bodyTypeMap[name]) {
              if (typeof value === 'number') {
                type = "number";
              } else if (typeof value === 'boolean') {
                type = "boolean";
              } else if (typeof value === 'string' && value.startsWith('#') && value.endsWith('#')) {
                // 识别自定义数据项，自动标记类型为custom
                type = "custom";
                value = value.slice(1, -1); // 去除#包裹
              }
            } else if (type === "custom" && typeof value === 'string' && value.startsWith('#') && value.endsWith('#')) {
              // 当有类型映射且类型为custom时，也需要去除#包裹
              value = value.slice(1, -1); // 去除#包裹
            }

            // 回填请求体表单数据（仿照headers的回填逻辑）
            httpConfig.params.push({
              name,
              value,
              type,
              customContent,
              selectedDataItem: ""
            });
          });
        }
        httpConfig.bodyJsonError = "";
      } catch (e) {
        httpConfig.bodyJsonError = "请求体JSON解析失败：" + e.message;
      }
    },

    // 格式化JSON（支持headers和body，body仿照headers处理注释）
    formatJson(type) {
      const httpConfig = this.noticeTemplates.http;
      const jsonStr = type === 'headers' ? httpConfig.headersJson : httpConfig.bodyJson;
      try {
        if (jsonStr.trim()) {
          let pureJson = jsonStr;
          let extraData = {};
          let extraComment = "";
          // 处理请求头类型注释
          if (type === 'headers') {
            const typeMatch = pureJson.match(/\/\*headersType:(.*?)\*\//);
            if (typeMatch) {
              extraData = JSON.parse(typeMatch[1]);
              pureJson = pureJson.replace(/\/\*headersType:.*?\*\//, "").trim();
              extraComment = `/*headersType:${JSON.stringify(extraData)}*/`;
            }
          } else if (type === 'body') {
            // 处理请求体注释：先处理类型注释，再处理自定义内容注释（仿照headers）
            let typeData = {};
            let customData = {};
            // 解析类型注释
            const typeMatch = pureJson.match(/\/\*bodyType:(.*?)\*\//);
            if (typeMatch) {
              typeData = JSON.parse(typeMatch[1]);
              pureJson = pureJson.replace(/\/\*bodyType:.*?\*\//, "").trim();
            }
            // 解析自定义内容注释
            const customMatch = pureJson.match(/\/\*bodyCustom:(.*?)\*\//);
            if (customMatch) {
              customData = JSON.parse(customMatch[1]);
              pureJson = pureJson.replace(/\/\*bodyCustom:.*?\*\//, "").trim();
            }
            // 拼接额外注释
            if (Object.keys(typeData).length > 0) {
              extraComment += `/*bodyType:${JSON.stringify(typeData)}*/`;
            }
            if (Object.keys(customData).length > 0) {
              extraComment += `/*bodyCustom:${JSON.stringify(customData)}*/`;
            }
          }
          // 格式化纯JSON
          const obj = JSON.parse(pureJson);
          const formattedJson = JSON.stringify(obj, null, 2);
          // 重新拼接注释
          let finalJson = formattedJson;
          if (extraComment) {
            finalJson += extraComment;
          }
          // 赋值回对应字段
          if (type === 'headers') {
            httpConfig.headersJson = finalJson;
            httpConfig.headersJsonError = "";
          } else {
            httpConfig.bodyJson = finalJson;
            httpConfig.bodyJsonError = "";
          }
        }
      } catch (e) {
        if (type === 'headers') {
          httpConfig.headersJsonError = "JSON格式错误：" + e.message;
        } else {
          httpConfig.bodyJsonError = "JSON格式错误：" + e.message;
        }
      }
    },

    // 校验JSON格式（支持headers和body，body仿照headers分离注释后校验）
    validateJson(type) {
      const httpConfig = this.noticeTemplates.http;
      const jsonStr = type === 'headers' ? httpConfig.headersJson : httpConfig.bodyJson;
      try {
        if (jsonStr.trim()) {
          // 分离注释后校验（body仿照headers处理多注释）
          let pureJson = jsonStr;
          if (type === 'headers') {
            pureJson = pureJson.replace(/\/\*headersType:.*?\*\//, "").trim();
          } else if (type === 'body') {
            // 移除请求体的类型注释和自定义内容注释
            pureJson = pureJson.replace(/\/\*bodyType:.*?\*\//, "").trim();
            pureJson = pureJson.replace(/\/\*bodyCustom:.*?\*\//, "").trim();
          }
          if (pureJson) {
            JSON.parse(pureJson);
          }
        }
        if (type === 'headers') {
          httpConfig.headersJsonError = "";
        } else {
          httpConfig.bodyJsonError = "";
        }
      } catch (e) {
        if (type === 'headers') {
          httpConfig.headersJsonError = "JSON格式错误：" + e.message;
        } else {
          httpConfig.bodyJsonError = "JSON格式错误：" + e.message;
        }
      }
    },

    // 单选切换
    handleChannelChange(val) {
      this.form.channelString = val ? [val] : [];
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
      } else if (key === "szh") {
        this.noticeTemplates[key].value.push({ name: "", code: "" });
      }
    },

    // 新增请求头
    addHeader() {
      this.noticeTemplates.http.headers.push({ 
        name: "", 
        value: "", 
        type: "string" // 默认类型为string
      });
    },

    // 删除请求头
    removeHeader(headerIndex) {
      this.noticeTemplates.http.headers.splice(headerIndex, 1);
      // 同步更新JSON模式
      if (this.noticeTemplates.http.configMode === 'json') {
        this.formToJson();
      }
    },

    // 新增参数
    addParam() {
      this.noticeTemplates.http.params.push({
        name: "",
        type: "string",
        value: "",
        customContent: "",
        selectedDataItem: ""
      });
    },

    // 添加数据项到自定义内容
    addDataItemToCustomContent(param, dataItem) {
      if (dataItem) {
        const separator = param.customContent ? ' ' : '';
        param.customContent += separator + `#${dataItem}#`;
        param.selectedDataItem = "";
        // 同步更新JSON模式
        if (this.noticeTemplates.http.configMode === 'json') {
          this.formToJson();
        }
      }
    },

    // 删除参数
    removeParam(paramIndex) {
      this.noticeTemplates.http.params.splice(paramIndex, 1);
      // 同步更新JSON模式
      if (this.noticeTemplates.http.configMode === 'json') {
        this.formToJson();
      }
    },

    // 删除配置项
    removeCondition(key, index) {
      if (key === "http") return;
      const template = this.noticeTemplates[key];
      if (template.value.length <= 1) {
        this.$message.warning(this.$t('common.pleaseConfigureAtLeastOneNotificationInfo', { method: this.getNoticeLabel(key) }));
        return;
      }
      template.value.splice(index, 1);
    },

    // 初始化表单
    init(row) {
      if (!row?.id) {
        this.form = { groupName: "", channelString: [], remark: "" };
        return;
      }
      this.getNotificationGroupDetail();
    },

    // 获取详情并回显
    getNotificationGroupDetail() {
      const data = { id: this.rowData.id };
      const mockRes = {
        status: 200,
        message: "Success",
        data: this.rowData
      };

      if (mockRes.status === 200) {
        const detail = mockRes.data;
        let channelString = [];
        let channelParam = {};
        try {
          channelString = detail.channelString ? JSON.parse(detail.channelString) : [];
          channelParam = detail.channelParam ? JSON.parse(detail.channelParam) : {};
        } catch (e) {
          console.error("JSON解析错误：", e);
          this.$message.error("数据格式异常，请刷新重试");
          return;
        }

        this.form.groupName = detail.groupName || "";
        this.form.remark = detail.remark || "";
        this.form.channelString = channelString;
        this.selectedChannel = channelString[0] || "";

        if (channelParam) {
          Object.keys(channelParam).forEach(key => {
            if (this.noticeTemplates[key]) {
              if (key === "http") {
                const httpConfig = channelParam[key][0];
                if (httpConfig) {
                  this.noticeTemplates.http.webhookUrl = String(httpConfig.webhookUrl || "");
                  this.noticeTemplates.http.method = httpConfig.method || "POST";

                  // 回显表单模式数据（请求头携带type）
                  this.noticeTemplates.http.headers = (httpConfig.headers || []).map(header => ({
                    name: String(header.paramName || ""),
                    value: String(header.paramValue || ""),
                    type: header.paramType ? (header.paramType.toLowerCase() === 'int' ? 'number' : header.paramType.toLowerCase()) : "string"
                  }));

                  this.noticeTemplates.http.params = (httpConfig.body || []).map(param => {
                    let paramValue = String(param.paramValue || "");
                    let type = "string";
                    let customContent = "";

                    const customMatch = paramValue.match(/^#(.*)#$/);
                    if (customMatch) {
                      const extractedValue = String(customMatch[1]);
                      if (extractedValue === "自定义内容") {
                        paramValue = extractedValue;
                        type = "custom";
                        customContent = String(param.customContent || "");
                      } else {
                        paramValue = extractedValue;
                        type = "custom";
                      }
                    } else {
                      if (param.paramType === "INT") {
                        type = "number";
                      } else if (param.paramType === "BOOLEAN") {
                        type = "boolean";
                      } else {
                        type = "string";
                      }
                    }

                    return {
                      name: String(param.paramName || ""),
                      value: paramValue,
                      type: type,
                      customContent: String(customContent || ""),
                      selectedDataItem: ""
                    };
                  });

                  // 同步生成JSON模式数据（headers和body同步处理）
                  this.formToJson();
                }
              } else if (key === "szh") {
                const szhConfig = channelParam[key][0] || {};
                this.noticeTemplates.szh.IsEncrypted = !!szhConfig.IsEncrypted;
                this.noticeTemplates.szh.value = channelParam[key].map(item => ({
                  name: item.name || "",
                  code: item.code || ""
                }));
              } else {
                this.noticeTemplates[key].value = channelParam[key].map(item => ({
                  ...item,
                  showSecret: !!item.secret
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

        const errors = [];
        const httpConfig = this.noticeTemplates.http;

        // HTTP模式校验
        if (this.form.channelString.includes("http")) {
          if (!String(httpConfig.webhookUrl || '').trim()) {
            errors.push(this.$t('common.httpInterfaceUrlCannotBeEmpty'));
          }
          if (!httpConfig.method) {
            errors.push(this.$t('common.httpRequestMethodCannotBeEmpty'));
          }

          // JSON模式校验
          if (httpConfig.configMode === 'json') {
            // 校验请求头JSON
            try {
              if (httpConfig.headersJson.trim()) {
                let pureHeadersJson = httpConfig.headersJson.replace(/\/\*headersType:.*\*\//, "").trim();
                if (pureHeadersJson) {
                  JSON.parse(pureHeadersJson);
                }
              }
            } catch (e) {
              errors.push(this.$t('common.requestHeadersJsonFormatError') + e.message);
            }
            // 校验请求体JSON（仿照headers的校验逻辑）
            try {
              if (httpConfig.bodyJson.trim()) {
                let pureBodyJson = httpConfig.bodyJson;
                // 移除请求体的所有注释后校验
                pureBodyJson = pureBodyJson.replace(/\/\*bodyType:.*\*\//, "").trim();
                pureBodyJson = pureBodyJson.replace(/\/\*bodyCustom:.*\*\//, "").trim();
                if (pureBodyJson) {
                  JSON.parse(pureBodyJson);
                }
              }
            } catch (e) {
              errors.push(this.$t('common.requestBodyJsonFormatError') + e.message);
            }
          } else {
            // 表单模式原有校验
            if (httpConfig.headers && httpConfig.headers.length > 0) {
              for (let i = 0; i < httpConfig.headers.length; i++) {
                const name = String(httpConfig.headers[i].name || '').trim();
                const value = String(httpConfig.headers[i].value || '').trim();
                const type = httpConfig.headers[i].type;
                if (!name) {
                  errors.push(this.$t('common.requestHeaderNameCannotBeEmpty', { index: i + 1 }));
                  break;
                }
                if (!value) {
                  errors.push(this.$t('common.requestHeaderValueCannotBeEmpty', { index: i + 1 }));
                  break;
                }
                if (!type) {
                  errors.push(this.$t('common.requestHeaderTypeCannotBeEmpty', { index: i + 1 }));
                  break;
                }
              }
            }

            if (httpConfig.params && httpConfig.params.length > 0) {
              for (let i = 0; i < httpConfig.params.length; i++) {
                const param = httpConfig.params[i];
                const name = String(param.name || '').trim();
                const value = String(param.value || '').trim();
                const type = param.type;

                if (!name) {
                  errors.push(this.$t('common.parameterNameCannotBeEmpty', { index: i + 1 }));
                  break;
                }
                if (!value) {
                  errors.push(this.$t('common.parameterValueCannotBeEmpty', { index: i + 1 }));
                  break;
                }
                if (!type) {
                  errors.push(this.$t('common.parameterTypeCannotBeEmpty', { index: i + 1 }));
                  break;
                }
                if (param.type === 'custom' && value === '自定义内容') {
                  const customContent = String(param.customContent || '').trim();
                  if (!customContent) {
                    errors.push(this.$t('common.parameterCustomContentCannotBeEmpty', { index: i + 1 }));
                    break;
                  }
                }
              }
            }
          }
        }

        if (errors.length > 0) {
          this.$message.error(errors[0]);
          return;
        }

        // 其他通知方式校验
        const noticeValid = this.form.channelString.every(key => {
          if (key === "http") return true;
          else if (this.noticeTemplates[key].value) {
            return this.noticeTemplates[key].value.every(item => {
              if (key === "dd" || key === "qywx") {
                return String(item.webhookUrl || '').trim() !== "" && (!item.showSecret || String(item.secret || '').trim() !== "");
              }
              return true;
            });
          }
          return true;
        });

        if (!noticeValid) {
          this.$message.error("请完善所有选中通知类型的配置信息");
          return;
        }

        // 组装提交数据
        const submitData = {
          ...this.form,
          id: this.rowData?.id || undefined,
          channelParam: {}
        };

        this.form.channelString.forEach(key => {
          if (key === "http") {
            let convertedHeaders = [];
            let convertedBody = [];

            // 根据模式处理数据
            if (httpConfig.configMode === 'json') {
              // JSON模式：解析JSON为表单结构（body仿照headers解析类型+自定义内容）
              try {
                let headersTypeMap = {};
                let headersJson = httpConfig.headersJson;
                // 分离请求头类型映射
                const typeMatch = headersJson.match(/\/\*headersType:(.*)\*\//);
                if (typeMatch) {
                  headersTypeMap = JSON.parse(typeMatch[1]);
                  headersJson = headersJson.replace(/\/\*headersType:.*\*\//, "").trim();
                }
                const headersObj = headersJson.trim() ? JSON.parse(headersJson) : {};
                convertedHeaders = Object.keys(headersObj).map(name => ({
                  paramName: name,
                  paramValue: String(headersObj[name]),
                  paramType: headersTypeMap[name] ? (headersTypeMap[name] === 'number' ? 'INT' : headersTypeMap[name].toUpperCase()) : 'STRING'
                }));

                // 解析请求体JSON（仿照headers，解析类型+自定义内容）
                let bodyTypeMap = {};
                let bodyCustomContentMap = {};
                let bodyJson = httpConfig.bodyJson;
                // 分离类型映射
                const bodyTypeMatch = bodyJson.match(/\/\*bodyType:(.*)\*\//);
                if (bodyTypeMatch) {
                  bodyTypeMap = JSON.parse(bodyTypeMatch[1]);
                  bodyJson = bodyJson.replace(/\/\*bodyType:.*\*\//, "").trim();
                }
                // 分离自定义内容映射
                const bodyCustomMatch = bodyJson.match(/\/\*bodyCustom:(.*)\*\//);
                if (bodyCustomMatch) {
                  bodyCustomContentMap = JSON.parse(bodyCustomMatch[1]);
                  bodyJson = bodyJson.replace(/\/\*bodyCustom:.*\*\//, "").trim();
                }
                const bodyObj = bodyJson ? JSON.parse(bodyJson) : {};
                convertedBody = Object.keys(bodyObj).map(name => {
                  let value = bodyObj[name];
                  let type = "STRING";

                  // 识别自定义数据项
                  if (typeof value === 'string' && value.startsWith('#') && value.endsWith('#')) {
                    const innerValue = value.slice(1, -1);
                    value = `#${innerValue}#`;
                    type = "STRING";
                  } else if (typeof value === 'number') {
                    type = "INT";
                  } else if (typeof value === 'boolean') {
                    type = "BOOLEAN";
                  }

                  // 优先使用JSON中的类型映射
                  if (bodyTypeMap[name]) {
                    type = bodyTypeMap[name] === 'number' ? 'INT' : (bodyTypeMap[name] === 'boolean' ? 'BOOLEAN' : bodyTypeMap[name].toUpperCase());
                  }

                  // 构建参数（注入customContent）
                  const param = {
                    paramName: name,
                    paramValue: String(value),
                    paramType: type
                  };

                  // 补充customContent字段
                  if (bodyCustomContentMap[name]) {
                    param.customContent = bodyCustomContentMap[name];
                  }

                  return param;
                });
              } catch (e) {
                this.$message.error("JSON解析失败：" + e.message);
                return;
              }
            } else {
              // 表单模式：转换请求头（携带type）和请求体
              convertedHeaders = (httpConfig.headers || []).map(header => ({
                paramName: String(header.name || ''),
                paramValue: String(header.value || ''),
                paramType: header.type === 'number' ? 'INT' : (header.type === 'boolean' ? 'BOOLEAN' : header.type.toUpperCase())
              }));

              convertedBody = (httpConfig.params || []).map(param => {
                const bodyItem = {
                  paramName: String(param.name || ''),
                  paramValue: param.type === 'custom' && param.value ? `#${String(param.value)}#` : String(param.value || ''),
                  paramType: param.type === 'custom' ? "STRING" : param.type === 'number' ? "INT" : param.type.toUpperCase()
                };
                if (param.type === 'custom' && param.value === '自定义内容' && param.customContent) {
                  bodyItem.customContent = param.customContent;
                }
                return bodyItem;
              });
            }

            submitData.channelParam[key] = [{
              key: "http",
              webhookUrl: String(httpConfig.webhookUrl || '').trim(),
              method: httpConfig.method,
              headers: convertedHeaders,
              body: convertedBody
            }];
          } else if (key === "szh") {
            submitData.channelParam[key] = this.noticeTemplates[key].value.map(item => ({
              ...item,
              IsEncrypted: this.noticeTemplates[key].IsEncrypted
            }));
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
              this.$emit("refreshList");
            } else {
              this.$modal.msgError(res.message || "保存失败");
            }
          })
          .catch(error => {
            this.isSubmitDisabled = false;
            console.error("提交错误：", error);
          });
      });
    },

    // 接口测试（修改后）
    testConnectivity() {
      let httpConfig = this.noticeTemplates.http;
      const errors = [];

      if (!String(httpConfig.webhookUrl || '').trim()) {
        errors.push(this.$t('common.interfaceUrlCannotBeEmpty'));
      }

      // 模式校验
      if (httpConfig.configMode === 'json') {
        try {
          if (httpConfig.headersJson.trim()) {
            let pureHeadersJson = httpConfig.headersJson.replace(/\/\*headersType:.*\*\//, "").trim();
            if (pureHeadersJson) JSON.parse(pureHeadersJson);
          }
        } catch (e) {
          errors.push(this.$t('common.requestHeaderJsonFormatError') + ": " + e.message);
        }
        try {
          if (httpConfig.bodyJson.trim()) {
            let pureBodyJson = httpConfig.bodyJson;
            pureBodyJson = pureBodyJson.replace(/\/\*bodyType:.*\*\//, "").trim();
            pureBodyJson = pureBodyJson.replace(/\/\*bodyCustom:.*\*\//, "").trim();
            if (pureBodyJson) JSON.parse(pureBodyJson);
          }
        } catch (e) {
          errors.push(this.$t('common.requestParameterJsonFormatError') + ": " + e.message);
        }
      } else {
        // 原有表单校验逻辑 - 统一修复为安全字符串操作
        if (httpConfig.headers && httpConfig.headers.length > 0) {
          const headerNameMap = new Map();
          for (let i = 0; i < httpConfig.headers.length; i++) {
            const name = String(httpConfig.headers[i].name || '').trim();
            if (name && headerNameMap.has(name)) {
              const firstIndex = headerNameMap.get(name);
              errors.push(`第${firstIndex + 1}项和第${i + 1}项的请求头名称重复: ${name}`);
              break;
            } else if (name) {
              headerNameMap.set(name, i);
            }
          }

          for (let i = 0; i < httpConfig.headers.length; i++) {
            const header = httpConfig.headers[i];
            const name = String(header.name || '').trim();
            const value = String(header.value || '').trim();
            const type = header.type;
            if (!name) {
              errors.push(this.$t('common.requestHeaderNameCannotBeEmpty', { index: i + 1 }));
              break;
            }
            if (!value) {
              errors.push(this.$t('common.requestHeaderValueCannotBeEmpty', { index: i + 1 }));
              break;
            }
            if (!type) {
              errors.push(this.$t('common.requestHeaderTypeCannotBeEmpty', { index: i + 1 }));
              break;
            }
          }
        }

        if (httpConfig.params && httpConfig.params.length > 0) {
          const paramNameMap = new Map();
          for (let i = 0; i < httpConfig.params.length; i++) {
            const name = String(httpConfig.params[i].name || '').trim();
            if (name && paramNameMap.has(name)) {
              const firstIndex = paramNameMap.get(name);
              errors.push(this.$t('common.requestParameterNamesCannotDuplicate', { firstIndex: firstIndex + 1, currentIndex: i + 1, name: name }));
              break;
            } else if (name) {
              paramNameMap.set(name, i);
            }
          }

          for (let i = 0; i < httpConfig.params.length; i++) {
            const param = httpConfig.params[i];
            // 核心修复：先强制转为字符串，再兜底空字符串，最后trim
            const name = String(param.name || '').trim();
            const value = String(param.value || '').trim();
            if (!name) {
              errors.push(this.$t('common.requestParameterNameCannotBeEmpty', { index: i + 1 }));
              break;
            }
            if (!value) {
              errors.push(this.$t('common.requestParameterValueCannotBeEmpty', { index: i + 1 }));
              break;
            }
            if (value === '自定义内容') {
              const customContent = String(param.customContent || '').trim();
              if (!customContent) {
                errors.push(this.$t('common.customContentCannotBeEmpty', { index: i + 1 }));
                break;
              }
            }
          }
        }
      }

      if (errors.length > 0) {
        this.$message.error(errors[0]);
        return false;
      }

      // 组装测试参数
      let convertedHeaders = [];
      let convertedBody = [];

      if (httpConfig.configMode === 'json') {
        // JSON模式转换（body仿照headers，解析类型+自定义内容）
        try {
          let headersTypeMap = {};
          let headersJson = httpConfig.headersJson;
          // 分离请求头类型映射
          const typeMatch = headersJson.match(/\/\*headersType:(.*)\*\//);
          if (typeMatch) {
            headersTypeMap = JSON.parse(typeMatch[1]);
            headersJson = headersJson.replace(/\/\*headersType:.*\*\//, "").trim();
          }
          const headersObj = headersJson.trim() ? JSON.parse(headersJson) : {};
          convertedHeaders = Object.keys(headersObj).map(name => ({
            paramName: name,
            paramValue: String(headersObj[name]),
            paramType: headersTypeMap[name] ? (headersTypeMap[name] === 'number' ? 'INT' : headersTypeMap[name].toUpperCase()) : 'STRING'
          }));

          // 解析请求体JSON（仿照headers，解析类型+自定义内容）
          let bodyTypeMap = {};
          let bodyCustomContentMap = {};
          let bodyJson = httpConfig.bodyJson;
          const bodyTypeMatch = bodyJson.match(/\/\*bodyType:(.*)\*\//);
          if (bodyTypeMatch) {
            bodyTypeMap = JSON.parse(bodyTypeMatch[1]);
            bodyJson = bodyJson.replace(/\/\*bodyType:.*\*\//, "").trim();
          }
          const bodyCustomMatch = bodyJson.match(/\/\*bodyCustom:(.*)\*\//);
          if (bodyCustomMatch) {
            bodyCustomContentMap = JSON.parse(bodyCustomMatch[1]);
            bodyJson = bodyJson.replace(/\/\*bodyCustom:.*\*\//, "").trim();
          }
          const bodyObj = bodyJson ? JSON.parse(bodyJson) : {};
          convertedBody = Object.keys(bodyObj).map(name => {
            let value = bodyObj[name];
            let type = "STRING";
            if (typeof value === 'number') {
              type = "INT";
            } else if (typeof value === 'boolean') {
              type = "BOOLEAN";
            }
            // 优先使用JSON中的类型映射
            if (bodyTypeMap[name]) {
              type = bodyTypeMap[name] === 'number' ? 'INT' : (bodyTypeMap[name] === 'boolean' ? 'BOOLEAN' : bodyTypeMap[name].toUpperCase());
            }

            const param = {
              paramName: name,
              paramValue: String(value),
              paramType: type
            };

            if (bodyCustomContentMap[name]) {
              param.customContent = bodyCustomContentMap[name];
            }

            return param;
          });
        } catch (e) {
          this.$message.error("JSON解析失败：" + e.message);
          return;
        }
      } else {
        // 表单模式转换（携带请求头类型）
        convertedHeaders = (httpConfig.headers || []).map(header => ({
          paramName: String(header.name || ''),
          paramValue: String(header.value || ''),
          paramType: header.type === 'number' ? 'INT' : (header.type === 'boolean' ? 'BOOLEAN' : header.type.toUpperCase())
        }));
        convertedBody = (httpConfig.params || []).map(param => {
          const bodyItem = {
            paramName: String(param.name || ''),
            paramValue: param.type === 'custom' && param.value ? `#${param.value}#` : (param.value || ''),
            paramType: param.type === 'custom' ? "STRING" : param.type === 'number' ? "INT" : param.type.toUpperCase()
          };
          if (param.type === 'custom' && param.value === '自定义内容' && param.customContent) {
            bodyItem.customContent = param.customContent;
          }
          return bodyItem;
        });
      }

      let params = {
        url: String(httpConfig.webhookUrl || '').trim(),
        method: httpConfig.method,
        headers: convertedHeaders,
        body: convertedBody
      };

      this.testLoading = true;
      httpLt(params).then((res) => {
        this.testLoading = false;
        console.log(res);
        if (res.success) {
          // 接口测试成功，显示结果弹窗
          this.testVisible = true;
          let result = res.data || res.result || JSON.stringify(res, null, 2);
          
          try {
            // 尝试解析为JSON
            const parsed = JSON.parse(result);
            const formatted = JSON.stringify(parsed, null, 2);
            this.testResult = hljs.highlight('json', formatted, true).value;
          } catch (error) {
            // 如果不是JSON，尝试判断是否为HTML
            if (result && (result.startsWith('<html') || result.startsWith('<!DOCTYPE')) && result.includes('>')) {
              this.testResult = hljs.highlight('html', html_beautify(result, {indent_size: 2, wrap_line_length: 0, preserve_newlines: false}), true).value;
            } else {
              this.testResult = hljs.highlight('plaintext', result, true).value;
            }
          }
        } else {
          this.$message.error(res.error || "接口测试失败");
        }
      }).catch(err => {
        this.testLoading = false;
        this.$message.error("测试请求异常：" + err.message);
      });
    },

    // 标签操作方法（预留）
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
.notice-config-section {
  margin: 0 40px 20px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f2f2;
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

.header-item,
.param-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fafafa;
}

.header-item:hover,
.param-item:hover {
  background-color: #f5f5f5;
}

.tag-style {
  border: 1px solid #dcdfe6;
  padding: 4px;
  margin: 0 8px;
}

.el-steps {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;

  :deep(.el-button) {
    margin-left: 8px;
  }
}

:deep(.el-row--flex) {
  align-items: center;
}

:deep(.el-form-item__error) {
  font-size: 12px;
  color: #ff4d4f;
  background-color: #fef0f0;
  padding: 2px 5px;
  border-radius: 3px;
}

:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}

:deep(.el-switch__label) {
  font-size: 12px;
  padding: 0 8px;
}

.inputIcon {
  :deep(.el-input__inner) {
    padding-right: 60px;
  }
}
</style>