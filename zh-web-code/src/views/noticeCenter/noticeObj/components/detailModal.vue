<template>
    <a-drawer :title="$t('common.notificationObjectDetail')" :visible="showModal" width="1080px" placement="right" :closable="true"
        :mask-closable="false" @close="cancel">
        <div style="height: 80vh;overflow-y: auto;">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <div>
                    <el-row>
                        <!-- 通知对象 -->
                        <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item :label="$t('common.notificationObject')" prop="groupName">
                                <el-input disabled v-model="form.groupName" :placeholder="$t('common.enterNotificationObject')" clearable
                                    style="width: 100%;" />
                                <!-- <a-input v-model="form.groupName" placeholder="请输入通知对象" allowClear style="width: 100%;" /> -->
                            </el-form-item>
                        </el-col>

                        <!-- 通知方式单选（保持channelString数组类型） -->
                        <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item :label="$t('common.notificationMethod')" prop="channelString">
                                <el-radio-group disabled v-model="selectedChannel" @change="handleChannelChange"
                                    size="medium">
                                    <el-radio-button label="dd">{{ $t('common.dingTalk') }}</el-radio-button>
                                    <el-radio-button label="qywx">{{ $t('common.wecom') }}</el-radio-button>
                                    <el-radio-button label="szh">{{ $t('common.telecomServiceDesk') }}</el-radio-button>
                                    <el-radio-button label="http">HTTP</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>

                        <!-- 配置区域（div布局统一风格） -->
                        <el-col :span="24">
                            <!-- 钉钉配置 -->
                            <div class="notice-config-section" v-if="form.channelString.includes('dd')">
                                <div class="section-title">{{ getNoticeLabel('dd') }}{{ $t('common.configuration') }}</div>
                                <el-form :model="noticeTemplates.dd" label-width="10px">
                                    <el-row v-for="(item, index) in noticeTemplates.dd.value" :key="index" :gutter="16"
                                        style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                                        <el-row type="flex" align="middle">
                                            <!-- Webhook URL输入框 -->
                                            <el-col :span="16">
                                                <el-form-item :prop="`value[${index}].webhookUrl`"
                                                    :rules="{ required: true, message: $t('common.pleaseEnterWebhookAddress'), trigger: 'blur' }">
                                                    <el-input disabled v-model="item.webhookUrl"
                                                        :placeholder="$t('common.enterDingTalkRobotWebhookAddress')"
                                                        clearable maxlength="200" />
                                                </el-form-item>
                                            </el-col>
                                            <!-- 删除按钮 -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button type="danger" ghost disabled
                                                        @click="removeCondition('dd', index)">{{ $t('common.delete') }}</a-button>
                                                </el-form-item>
                                            </el-col>
                                            <!-- 新增按钮（仅第一行显示） -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button disabled type="primary" ghost v-if="index === 0"
                                                        @click="addCondition('dd')">{{ $t('common.add') }}</a-button>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                        <!-- 加签密钥区域 -->
                                        <el-row type="flex" align="middle" style="margin-top: 8px;">
                                            <el-col :span="12">
                                                <el-form-item label=" " style="margin-bottom: 0;">
                                                    <el-switch disabled v-model="item.showSecret" :active-text="$t('common.enableEncryptionMethod')"
                                                        :inactive-text="$t('common.disableEncryptionMethod')"
                                                        style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-form-item v-if="item.showSecret" :prop="`value[${index}].secret`"
                                                    :rules="[
                                                        { max: 100, message: $t('common.secretLengthCannotExceed100Characters'), trigger: 'blur' },
                                                        { required: true, message: $t('common.pleaseEnterSigningSecret'), trigger: 'blur' }
                                                    ]">
                                                    <el-input class="inputIcon" v-model="item.secret" disabled
                                                        :placeholder="$t('common.enterDingTalkRobotSigningSecret')" clearable maxlength="100"
                                                        show-password />
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
                                    <el-row v-for="(item, index) in noticeTemplates.qywx.value" :key="index"
                                        :gutter="16"
                                        style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                                        <el-row type="flex" align="middle">
                                            <!-- Webhook URL输入框 -->
                                            <el-col :span="16">
                                                <el-form-item :prop="`value[${index}].webhookUrl`"
                                                    :rules="{ required: true, message: $t('common.pleaseEnterWebhookAddress'), trigger: 'blur' }">
                                                    <el-input disabled v-model="item.webhookUrl"
                                                        :placeholder="$t('common.enterWecomAppPushAddress')"
                                                        clearable maxlength="200" />
                                                </el-form-item>
                                            </el-col>
                                            <!-- 删除按钮 -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button disabled type="danger" ghost
                                                        @click="removeCondition('qywx', index)">{{ $t('common.delete') }}</a-button>
                                                </el-form-item>
                                            </el-col>
                                            <!-- 新增按钮（仅第一行显示） -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button disabled type="primary" ghost v-if="index === 0"
                                                        @click="addCondition('qywx')">{{ $t('common.add') }}</a-button>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                        <!-- 加签密钥区域 -->
                                        <el-row type="flex" align="middle" style="margin-top: 8px;">
                                            <el-col :span="12">
                                                <el-form-item label=" " style="margin-bottom: 0;">
                                                    <el-switch disabled v-model="item.showSecret" :active-text="$t('common.enableEncryptionMethod')"
                                                        :inactive-text="$t('common.disableEncryptionMethod')"
                                                        style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-form-item v-if="item.showSecret" :prop="`value[${index}].secret`"
                                                    :rules="[
                                                        { max: 100, message: $t('common.secretLengthCannotExceed100Characters'), trigger: 'blur' },
                                                        { required: true, message: $t('common.pleaseEnterSigningSecret'), trigger: 'blur' }
                                                    ]">
                                                    <el-input class="inputIcon" disabled v-model="item.secret"
                                                        :placeholder="$t('common.enterWecomAppSigningSecret')" clearable maxlength="100"
                                                        show-password />
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
                                      <el-switch v-model="noticeTemplates.szh.IsEncrypted" disabled
                                        style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;" />
                                    </el-form-item>
                                  </el-col>
                                </el-row>
                              </el-form>
                            </div>                            

                          <!-- HTTP接口配置（优化JSON/表单转换） -->
                          <div class="notice-config-section" v-if="form.channelString.includes('http')">
                            <div class="section-title">{{ getNoticeLabel('http') }}{{ $t('common.configuration') }}</div>
                            <el-form :model="noticeTemplates.http" label-width="120px">
                              <!-- 请求URL -->
                              <el-row type="flex" align="middle">
                                <el-col :span="16">
                                  <el-form-item prop="webhookUrl" :label="$t('common.requestUrl')"
                                                :rules="{ required: true, message: $t('common.enterRequestUrlAddress'), trigger: 'blur' }">
                                    <el-input disabled v-model="noticeTemplates.http.webhookUrl" :placeholder="$t('common.enterRequestUrlAddress')" clearable
                                              maxlength="500" />
                                  </el-form-item>
                                </el-col>
                              </el-row>

                              <!-- 请求方法 + JSON模式切换 -->
                              <el-row type="flex" align="middle" style="margin-top: 10px; justify-content: space-between;">
                                <el-col :span="8">
                                  <el-form-item :label="$t('common.requestMethod')" prop="method">
                                    <el-radio-group disabled v-model="noticeTemplates.http.method">
                                      <el-radio label="POST">{{ $t('common.postMethod') }}</el-radio>
                                      <el-radio label="GET">{{ $t('common.getMethod') }}</el-radio>
                                    </el-radio-group>
                                  </el-form-item>
                                </el-col>
                                <el-col :span="8" style="text-align: right;">
                                  <el-button-group>
                                    <el-button disabled :type="noticeTemplates.http.configMode === 'form' ? 'primary' : 'default'"
                                               size="small" @click="switchConfigMode('form')">
                                      {{ $t('common.formMode') }}
                                    </el-button>
                                    <el-button disabled :type="noticeTemplates.http.configMode === 'json' ? 'primary' : 'default'"
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
                                    <el-form-item :label="$t('common.requestHeader')" prop="headers">
                                      <div style="margin-bottom: 10px;">
                                        <el-button disabled type="primary" size="small" @click="addHeader">{{ $t('common.addRequestHeader') }}</el-button>
                                      </div>
                                      <div v-for="(header, headerIndex) in noticeTemplates.http.headers" :key="headerIndex"
                                           class="header-item">
                                        <el-form-item label="" :prop="`headers[${headerIndex}].name`"
                                                      style="display: inline-block; width: 200px;">
                                          <el-input disabled v-model="header.name" :placeholder="$t('common.parameterName')" clearable />
                                        </el-form-item>
                                        <el-form-item label="" :prop="`headers[${headerIndex}].type`"
                                                      style="display: inline-block; width: 120px; margin-left: 10px;">
                                          <el-select disabled v-model="header.type" :placeholder="$t('common.parameterType')" @change="() => { header.value = '' }">
                                            <el-option label="String" value="string"></el-option>
                                            <el-option label="Int" value="number"></el-option>
                                            <el-option label="Boolean" value="boolean"></el-option>
                                          </el-select>
                                        </el-form-item>
                                        <el-form-item label="" :prop="`headers[${headerIndex}].value`"
                                                      style="display: inline-block; width: 250px; margin-left: 10px;">
                                          <template v-if="header.type === 'string'">
                                            <el-input disabled v-model="header.value" :placeholder="$t('common.parameterValue')" clearable />
                                          </template>
                                          <template v-else-if="header.type === 'number'">
                                            <el-input disabled v-model.number="header.value" :placeholder="$t('common.pleaseEnterNumber')" clearable type="number" />
                                          </template>
                                          <template v-else-if="header.type === 'boolean'">
                                            <el-select disabled v-model="header.value" :placeholder="$t('common.pleaseSelect')" clearable>
                                              <el-option label="true" value="true"></el-option>
                                              <el-option label="false" value="false"></el-option>
                                            </el-select>
                                          </template>
                                        </el-form-item>
                                        <el-button disabled type="danger" size="small" @click="removeHeader(headerIndex)"
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
                                        <el-button disabled type="primary" size="small" @click="addParam">{{ $t('common.addRequestParameter') }}</el-button>
                                      </div>
                                      <div v-for="(param, paramIndex) in noticeTemplates.http.params" :key="paramIndex"
                                           class="param-item">
                                        <el-form-item label="" :prop="`params[${paramIndex}].name`"
                                                      style="display: inline-block; width: 200px;">
                                          <el-input disabled v-model="param.name" :placeholder="$t('common.parameterName')" clearable />
                                        </el-form-item>
                                        <el-form-item label="" :prop="`params[${paramIndex}].type`"
                                                      style="display: inline-block; width: 120px; margin-left: 10px;">
                                          <el-select disabled v-model="param.type" :placeholder="$t('common.parameterType')" @change="() => { param.value = '' }">
                                            <el-option label="String" value="string"></el-option>
                                            <el-option label="Int" value="number"></el-option>
                                            <el-option label="Boolean" value="boolean"></el-option>
                                            <el-option :label="$t('common.existingDataItem')" value="custom"></el-option>
                                          </el-select>
                                        </el-form-item>
                                        <el-form-item label="" :prop="`params[${paramIndex}].value`"
                                                      style="display: inline-block; width: 250px; margin-left: 10px;">
                                          <template v-if="param.type === 'string'">
                                            <el-input disabled v-model="param.value" :placeholder="$t('common.parameterValue')" clearable />
                                          </template>
                                          <template v-else-if="param.type === 'number'">
                                            <el-input disabled v-model.number="param.value" :placeholder="$t('common.pleaseEnterNumber')" clearable type="number" />
                                          </template>
                                          <template v-else-if="param.type === 'boolean'">
                                            <el-select disabled v-model="param.value" :placeholder="$t('common.pleaseSelect')" clearable>
                                              <el-option label="true" value="true"></el-option>
                                              <el-option label="false" value="false"></el-option>
                                            </el-select>
                                          </template>
                                          <template v-else-if="param.type === 'custom'">
                                            <el-select disabled v-model="param.value" :placeholder="$t('common.selectExistingDataItem')" clearable>
                                              <el-option :label="$t('common.alarmId')" value="告警ID"></el-option>
                                              <el-option :label="$t('common.alarmName')" value="告警名称"></el-option>
                                              <el-option :label="$t('common.alarmLevel')" value="告警级别"></el-option>
                                              <el-option :label="$t('common.alarmContent')" value="告警内容"></el-option>
                                              <el-option :label="$t('common.alarmTag')" value="告警标签"></el-option>
                                              <el-option :label="$t('common.alarmTime')" value="告警时间"></el-option>
                                              <el-option :label="$t('common.customContent')" value="自定义内容"></el-option>
                                            </el-select>
                                          </template>
                                        </el-form-item>
                                        <el-button disabled type="danger" size="small" @click="removeParam(paramIndex)"
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
                                          <el-input disabled v-model="param.customContent" type="textarea" maxlength="200"
                                                    style="min-width: 497px;" :rows="3" :placeholder="$t('common.enterCustomContent')" clearable />
                                        </el-form-item>
                                        <el-form-item :label="$t('common.existingDataItem')" v-if="param.value === '自定义内容'"
                                                      style="margin-top: 10px; display: block; width: 616px;">
                                          <el-select disabled v-model="param.selectedDataItem" :placeholder="$t('common.selectExistingDataItem')" clearable
                                                     @change="addDataItemToCustomContent(param, param.selectedDataItem)">
                                            <el-option :label="$t('common.alarmId')" value="告警ID"></el-option>
                                            <el-option :label="$t('common.alarmName')" value="告警名称"></el-option>
                                            <el-option :label="$t('common.alarmLevel')" value="告警级别"></el-option>
                                            <el-option :label="$t('common.alarmContent')" value="告警内容"></el-option>
                                            <el-option :label="$t('common.alarmTag')" value="告警标签"></el-option>
                                            <el-option :label="$t('common.alarmTime')" value="告警时间"></el-option>
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
                                      <el-button disabled type="text" size="small" @click="formatJson('headers')"
                                                 style="margin-bottom: 8px;">
                                        <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                                      </el-button>
                                      <el-input disabled v-model="noticeTemplates.http.headersJson" type="textarea" :rows="4"
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
                                      <el-button disabled type="text" size="small" @click="formatJson('body')" style="margin-bottom: 8px;">
                                        <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                                      </el-button>
                                      <el-input disabled v-model="noticeTemplates.http.bodyJson" type="textarea" :rows="8"
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

                              <!-- 接口测试按钮 -->
                              <el-row style="margin-top: 15px;margin-left: 120px;">
                                <el-col :span="24">
                                  <el-button disabled type="primary" @click="testConnectivity">{{ $t('common.interfaceTest') }}</el-button>
                                </el-col>
                              </el-row>
                            </el-form>
                          </div>

                        </el-col>
                        <!-- <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item label="创建者" prop="creatorName">
                                <el-input disabled v-model="form.creatorName" clearable style="width: 100%;" />

                            </el-form-item>
                        </el-col>
                        <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item label="创建时间" prop="createTime">
                                <el-input disabled v-model="form.createTime" placeholder="--" clearable
                                    style="width: 100%;" />

                            </el-form-item>
                        </el-col> -->
                        <!-- 备注输入框（优化：确保prop与form字段对应，支持编辑） -->
                        <el-col :span="20" style="margin-bottom: 20px; margin-top: 10px;">
                            <el-form-item :label="$t('common.remarkInfo')" prop="remark">
                                <el-input disabled type="textarea" :rows="3" v-model="form.remark"
                                    :placeholder="$t('common.enterRemarkInfoOptional')"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
        </div>

        <!-- 底部按钮 -->
        <!-- <div class="dialog-footer">
            <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">确 定</el-button>
            <el-button @click="cancel" :disabled="isSubmitDisabled">取 消</el-button>
        </div> -->
    </a-drawer>
</template>

<script>
import { saveNotificationGroup, getNotificationGroupDetail } from "@/api/notice/notice";

export default {
    name: "NoticeConfigForm",
    props: {
        rowData: { // 编辑场景传参：回显数据（含id）
            type: Object,
            default: () => ({}) // 初始化为空对象，避免undefined
        },
        opt: { // 兼容原有传参，实际已用动态标题替代，可后续删除
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
            selectedChannel: "", // 单选绑定值（中转用）

            // 优化2：form明确初始化所有字段（含remark），确保响应式
            form: {
                groupName: "",
                channelString: [], // 格式：['dd']/['qywx']/['szh']
                remark: "", // 关键：初始化remark字段，解决编辑无响应问题
                creatorName: "",
                createTime: ""
            },

            // 通知模板配置
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
                szh: { key: "szh", value: [{ name: "", code: "" }], label: "电信集约化服务台" },
              http: {
                key: "http",
                webhookUrl: "",
                method: "POST",
                // 表单模式字段
                headers: [],
                params: [],
                // JSON模式字段
                configMode: "form", // form/json 切换标识
                headersJson: "",    // 请求头JSON字符串
                bodyJson: "",       // 请求体JSON字符串
                headersJsonError: "", // JSON校验错误提示
                bodyJsonError: "",   // JSON校验错误提示
                label: "HTTP"
              }
            },

            inputValue: "" // 标签输入值（预留扩展）
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
                this.form = { groupName: "", channelString: [], remark: "", creatorName: "", createTime: "" };
                this.selectedChannel = "";
                this.$refs.form?.resetFields();
                this.isSubmitDisabled = false;
                this.inputValue = "";
            }
        }
    },
    computed: {
        // 表单校验规则（国际化）
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
    methods: {
        // 重置通知模板
        resetNoticeTemplates() {
            Object.keys(this.noticeTemplates).forEach(key => {
                if (key === "dd" || key === "qywx") {
                    this.noticeTemplates[key].value = [{ webhookUrl: "", secret: "", showSecret: false }];
                } else if (key === "szh") {
                    this.noticeTemplates[key].value = [{ name: "", code: "" }];
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

        // 获取通知方式标签（国际化）
        getNoticeLabel(key) {
            const labelMap = {
                dd: this.$t('common.dingTalk'),
                qywx: this.$t('common.wecom'),
                szh: this.$t('common.telecomServiceDesk'),
                http: 'HTTP'
            };
            return labelMap[key] || key;
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
            } else if (key === "szh") {
                this.noticeTemplates[key].value.push({ name: "", code: "" });
            }
        },

        // 删除配置项（至少保留1个）
        removeCondition(key, index) {
            const template = this.noticeTemplates[key];
            if (template.value.length <= 1) {
                this.$message.warning(this.$t('common.pleaseConfigureAtLeastOneNotificationInfo', { method: this.getNoticeLabel(key) }));
                return;
            }
            template.value.splice(index, 1);
        },

        // 初始化表单（编辑场景回显）
        init(row) {
            if (!row?.id) { // 新增场景：row无id
                this.$refs.form?.resetFields();
            } else { // 编辑场景：有id才调用详情接口
                this.getNotificationGroupDetail();
            }
        },

        // 编辑场景：获取详情并回显（优化3：JSON解析容错+remark回显）
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
                    console.error("JSON解析错误：", e);
                    this.$message.error(this.$t('common.dataFormatAbnormalPleaseRefresh'));
                    return;
                }

                // 1. 回显基础表单（含remark）
                this.form.groupName = detail.groupName || "";
                this.form.remark = detail.remark || ""; // 关键：回显备注，支持编辑
                this.form.creatorName = detail.creatorName || "";
                this.form.createTime = detail.createTime || "";
                this.form.channelString = channelString;
                this.selectedChannel = channelString[0] || "";

                // 2. 回显通知配置
                if (channelParam) {
                    Object.keys(channelParam).forEach(key => {
                        if (this.noticeTemplates[key]) {
                          if (key === "http") {
                            const httpConfig = channelParam[key][0];
                            if (httpConfig) {
                              this.noticeTemplates.http.webhookUrl = String(httpConfig.webhookUrl || "");
                              this.noticeTemplates.http.method = httpConfig.method || "POST";

                              // 回显表单模式数据
                              this.noticeTemplates.http.headers = (httpConfig.headers || []).map(header => ({
                                name: String(header.paramName || ""),
                                value: String(header.paramValue || ""),
                                type: "string"
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

                              // 同步生成JSON模式数据
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

                // 额外校验配置项合法性
                const noticeValid = this.form.channelString.every(key => {
                    return this.noticeTemplates[key].value.every(item => {
                        if (key === "dd" || key === "qywx") {
                            return item.webhookUrl.trim() !== "" && (!item.showSecret || item.secret.trim() !== "");
                        }
                        return true; // 电信集约化服务台无需校验
                    });
                });

                if (!noticeValid) {
                    this.$message.error(this.$t('common.pleaseCompleteAllNotificationConfig'));
                    return;
                }

                // 组装提交数据
                const submitData = {
                    ...this.form,
                    id: this.rowData?.id || undefined, // 编辑传id，新增不传
                    channelParam: {}
                };
                this.form.channelString.forEach(key => {
                    submitData.channelParam[key] = [...this.noticeTemplates[key].value];
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
                        // this.$modal.msgError("通知配置保存失败");
                        console.error("提交错误：", error);
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

.inputIcon {
    :deep(.el-input__inner) {
        padding-right: 60px;
    }
}
</style>
