<template>
    <div>
        <a-drawer :title="opt" :visible="visible" width="1080px" placement="right" :closable="true"
            :mask-closable="false" @close="handleClose">
            <div style="height: 80vh;overflow-y: auto;padding: 0 16px;">
                <!-- 步骤条：详情模式隐藏 -->
                <el-steps v-if="!isView" :active="activeStep" finish-status="success" simple>
                    <el-step :title="$t('common.basicInfo')"></el-step>
                    <el-step :title="$t('common.ruleConfiguration')"></el-step>
                    <el-step :title="$t('common.alarmConfiguration')"></el-step>
                </el-steps>

                <el-form ref="form" :model="form" :rules="getCurrentRules()" label-width="120px"
                    :validate-on-rule-change="false">
                    <!-- Step 1: 基本信息配置 - 详情模式全部展示，非详情模式按步骤控制 -->
                    <div v-show="!isView ? (activeStep === 0) : true" class="step-content">
                        <!-- 详情模式模块标题 -->
                        <div v-if="isView" class="view-mode-title">{{ $t('common.basicInfo') }}</div>
                        <el-row>
                            <el-col :span="22">
                                <el-form-item prop="taskName" :label="$t('common.dialingName')">
                                    <el-input type="text" v-model.trim="form.taskName" maxlength="40"
                                        :placeholder="$t('common.pleaseInputDialingName')" :disabled="isView || isEdit"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="22">
                                <el-form-item prop="taskType" :label="$t('common.dialingType')">
                                    <el-select v-model="form.taskType" :placeholder="$t('common.pleaseSelectDialingType')"
                                        @change="handleTaskTypeChange" :disabled="isView || isEdit">
                                        <el-option value="HTTP" :label="$t('common.interfaceDialing')"></el-option>
                                        <el-option value="DUAN" :label="$t('common.portDialing')"></el-option>
                                        <el-option value="PING" :label="$t('common.pingDialing')"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>

                            <!-- 接口拨测参数 -->
                            <div v-if="form.taskType === 'HTTP'" class="task-type-params">
                                <el-col :span="22">
                                    <el-form-item prop="httpConfig.url" :label="$t('common.requestUrl')" required>
                                        <el-input type="text" v-model="form.httpConfig.url" :placeholder="$t('common.pleaseInputRequestUrl')"
                                            :disabled="isView"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="22">
                                    <el-form-item prop="httpConfig.method" :label="$t('common.requestMethod')" required>
                                        <el-radio-group v-model="form.httpConfig.method" :disabled="isView">
                                            <el-radio label="POST">POST</el-radio>
                                            <el-radio label="GET">GET</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <!-- <el-col :span="22">

                                    <el-form-item label="">
                                        <el-button-group style="margin-left: 77%;">
                                            <el-button :type="form.httpConfig.configMode === 'form' ? 'primary' : 'default'"
                                                size="small" @click="switchConfigMode('form')" :disabled="isView">
                                                表单模式
                                            </el-button>
                                            <el-button :type="form.httpConfig.configMode === 'json' ? 'primary' : 'default'"
                                                size="small" @click="switchConfigMode('json')" :disabled="isView">
                                                JSON模式
                                            </el-button>
                                        </el-button-group>
                                    </el-form-item>
                                </el-col> -->

                                <!-- 表单模式 -->
                                <div v-if="form.httpConfig.configMode === 'form'">
                                    <el-col :span="22">
                                        <el-form-item :label="$t('common.requestHeader')">
                                            <div style="margin-bottom: 10px;">
                                                <el-button type="primary" icon="el-icon-plus" size="small"
                                                    @click="addHttpHeader" :disabled="isView">{{ $t('common.addRequestHeader') }}</el-button>
                                                 <el-button-group style="margin-left: 62%;">
                                                    <el-button :type="form.httpConfig.configMode === 'form' ? 'primary' : 'default'"
                                                        size="small" @click="switchConfigMode('form')" :disabled="isView">
                                                        {{ $t('common.formMode') }}
                                                    </el-button>
                                                    <el-button :type="form.httpConfig.configMode === 'json' ? 'primary' : 'default'"
                                                        size="small" @click="switchConfigMode('json')" :disabled="isView">
                                                        {{ $t('common.jsonMode') }}
                                                    </el-button>
                                                </el-button-group>
                                            </div>
                                            <div v-for="(header, index) in form.httpConfig.headers" :key="index"
                                                class="param-item">
                                                <el-form-item label="" :prop="`httpConfig.headers[${index}].name`"
                                                    style="display: inline-block; width: 200px;">
                                                    <el-input v-model="header.name" :placeholder="$t('common.parameterName')"
                                                        :disabled="isView"></el-input>
                                                </el-form-item>
                                                <el-form-item label="" :prop="`httpConfig.headers[${index}].type`"
                                                    style="display: inline-block; width: 120px; margin-left: 10px;">
                                                    <el-select v-model="header.type" @change="() => { header.value = undefined }"
                                                        :disabled="isView">
                                                        <el-option value="String" label="String"></el-option>
                                                        <el-option value="Int" label="Int"></el-option>
                                                        <el-option value="Bool" label="Bool"></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <el-form-item label="" :prop="`httpConfig.headers[${index}].value`"
                                                    style="display: inline-block; width: 250px; margin-left: 10px;">
                                                    <!-- String类型显示普通输入框 -->
                                                    <template v-if="header.type === 'String'">
                                                        <el-input v-model="header.value" :placeholder="$t('common.parameterValue')" clearable
                                                            style=" width: 250px; " :disabled="isView" />
                                                    </template>
                                                    <!-- Int类型显示数字输入框 -->
                                                    <template v-else-if="header.type === 'Int'">
                                                        <el-input-number v-model="header.value" :placeholder="$t('common.pleaseInputNumber')"
                                                            style=" width: 250px; " clearable :disabled="isView"></el-input-number>
                                                    </template>
                                                    <!-- Bool类型显示true/false下拉框 -->
                                                    <template v-else-if="header.type === 'Bool'">
                                                        <el-select v-model="header.value" :placeholder="$t('common.pleaseSelect')" clearable
                                                            style=" width: 250px; " :disabled="isView">
                                                            <el-option label="true" value="true"></el-option>
                                                            <el-option label="false" value="false"></el-option>
                                                        </el-select>
                                                    </template>
                                                </el-form-item>
                                                &nbsp;
                                                <el-button type="danger" icon="el-icon-delete" size="small"
                                                    @click="removeHttpHeader(index)" :disabled="isView"></el-button>
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="22">
                                        <el-form-item :label="$t('common.requestParameter')">
                                            <div style="margin-bottom: 10px;">
                                                <el-button type="primary" icon="el-icon-plus" size="small"
                                                    @click="addHttpParam" :disabled="isView">{{ $t('common.addRequestParameter') }}</el-button>
                                            </div>
                                            <div v-for="(param, paramIndex) in form.httpConfig.params" :key="paramIndex"
                                                class="param-item">
                                                <el-form-item label="" :prop="`httpConfig.params[${paramIndex}].name`"
                                                    style="display: inline-block; width: 200px;">
                                                    <el-input v-model="param.name" :placeholder="$t('common.parameterName')" clearable
                                                        :disabled="isView" />
                                                </el-form-item>
                                                <el-form-item label="" :prop="`httpConfig.params[${paramIndex}].type`"
                                                    style="display: inline-block; width: 120px; margin-left: 10px;">
                                                    <el-select v-model="param.type" :placeholder="$t('common.parameterType')"
                                                        @change="() => { param.value = undefined }" :disabled="isView">
                                                        <el-option label="String" value="string"></el-option>
                                                        <el-option label="Int" value="number"></el-option>
                                                        <el-option label="Boolean" value="boolean"></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <el-form-item label="" :prop="`httpConfig.params[${paramIndex}].value`"
                                                    style="display: inline-block; width: 250px; margin-left: 10px;">
                                                    <!-- string或json类型显示普通输入框 -->
                                                    <template v-if="param.type === 'string'">
                                                        <el-input v-model="param.value" :placeholder="$t('common.parameterValue')" clearable
                                                            :disabled="isView" />
                                                    </template>
                                                    <!-- int类型显示数字输入框 -->
                                                    <template v-else-if="param.type === 'number'">
                                                        <el-input-number v-model="param.value" :placeholder="$t('common.pleaseInputNumber')"
                                                            style=" width: 250px; " clearable :disabled="isView"></el-input-number>
                                                    </template>
                                                    <!-- boolean类型显示true/false下拉框 -->
                                                    <template v-else-if="param.type === 'boolean'">
                                                        <el-select v-model="param.value" :placeholder="$t('common.pleaseSelect')" clearable
                                                            :disabled="isView">
                                                            <el-option label="true" value="true"></el-option>
                                                            <el-option label="false" value="false"></el-option>
                                                        </el-select>
                                                    </template>
                                                </el-form-item>
                                                &nbsp;
                                                <el-button type="danger" icon="el-icon-delete" size="small"
                                                    @click="removeHttpParam(paramIndex)" :disabled="isView"></el-button>
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </div>

                                <!-- JSON模式 -->
                                <div v-if="form.httpConfig.configMode === 'json'">
                                    <el-col :span="22">
                                        <el-form-item :label="$t('common.requestHeaderJson')" prop="httpConfig.headersJson">
                                            <div style="display: flex;padding-top: 4px;">
                                            <el-button type="text" size="small" @click="formatJson('headers')"
                                                :disabled="isView" style="margin-bottom: 8px;">
                                                <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                                            </el-button>
                                            <el-button-group style="margin-left: 62%;">
                                                    <el-button :type="form.httpConfig.configMode === 'form' ? 'primary' : 'default'"
                                                        size="small" @click="switchConfigMode('form')" :disabled="isView">
                                                        {{ $t('common.formMode') }}
                                                    </el-button>
                                                    <el-button :type="form.httpConfig.configMode === 'json' ? 'primary' : 'default'"
                                                        size="small" @click="switchConfigMode('json')" :disabled="isView">
                                                        {{ $t('common.jsonMode') }}
                                                    </el-button>
                                                </el-button-group>
                                            </div>
                                            <el-input v-model="form.httpConfig.headersJson" type="textarea" :rows="4"
                                                :placeholder='$t("common.requestHeaderJsonPlaceholder")'
                                                clearable @blur="validateJson('headers')" :disabled="isView" />
                                            <div v-if="form.httpConfig.headersJsonError"
                                                style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                                                {{ form.httpConfig.headersJsonError }}
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="22">
                                        <el-form-item :label="$t('common.requestParameterJson')" prop="httpConfig.paramsJson">
                                            <el-button type="text" size="small" @click="formatJson('params')"
                                                :disabled="isView" style="margin-bottom: 8px;">
                                                <i class="el-icon-refresh"></i> {{ $t('common.formatJson') }}
                                            </el-button>
                                            <el-input v-model="form.httpConfig.paramsJson" type="textarea" :rows="8"
                                                :placeholder='$t("common.requestParameterJsonPlaceholder")'
                                                clearable @blur="validateJson('params')" :disabled="isView" />
                                            <div v-if="form.httpConfig.paramsJsonError"
                                                style="color: #ff4949; font-size: 12px; margin-top: 4px;">
                                                {{ form.httpConfig.paramsJsonError }}
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </div>

                                <el-col :span="22">
                                    <el-button type="primary" style="margin-left: 120px;margin-bottom: 10px;"
                                        @click="testHttpConnection" :disabled="isView">{{ $t('common.interfaceTest') }}</el-button>
                                </el-col>
                            </div>

                            <!-- PING测参数 -->
                            <div v-if="form.taskType === 'PING'" class="task-type-params">
                                <el-col :span="22">
                                    <el-form-item>
                                        <template #label>
                                        <span style='color: red;'>*</span> {{ $t('common.dialingResource') }}
                                        </template>
                                        <div style="margin-bottom: 10px;">
                                            <el-tooltip :content="$t('common.dialingResourceTooltip')" placement="top">
                                                <i class="el-icon-question" style="margin-right: 10px;"></i>
                                            </el-tooltip>
                                            <el-button type="primary" icon="el-icon-plus" size="small"
                                                @click="addPingResource" :disabled="isView">{{ $t('common.addDialingResource') }}</el-button>

                                        </div>
                                        <div v-for="(resource, index) in form.pingConfig.resources" :key="index"
                                            class="param-item">
                                            <el-autocomplete v-model="resource.ip" :fetch-suggestions="querySearch"
                                                :placeholder="$t('common.pleaseInputIpAddressOrSelectAsset')" :prop="`pingConfig.resources.${index}.ip`"
                                                style="flex: 1; margin-right: 10px;" :trigger-on-focus="false" clearable
                                                value-key="name"
                                                @select="(item) => { resource.assetId = item.assetId; resource.ip = item.ip; }"
                                                @change="resource.assetId = null" :disabled="isView">
                                                <template slot-scope="{ item }">
                                                    <div class="name">{{ item.name }}({{ item.ip }})</div>
                                                </template>
                                            </el-autocomplete>
                                            <el-button type="danger" icon="el-icon-delete" size="small"
                                                @click="removePingResource(index)"
                                                :disabled="isView || form.pingConfig.resources.length <= 1"></el-button>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </div>

                            <!-- 端口拨测参数 -->
                            <div v-if="form.taskType === 'DUAN'" class="task-type-params">
                                <el-col :span="22">
                                    <el-form-item prop="portConfig.protocol" :label="$t('common.protocolType')">
                                        <el-select v-model="form.portConfig.protocol" :placeholder="$t('common.pleaseSelectProtocolType')"
                                            :disabled="isView || isEdit">
                                            <el-option value="TCP" label="TCP"></el-option>
                                            <el-option value="UDP" label="UDP"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="22">
                                    <el-form-item>
                                        <template #label>
                                       <span style='color: red;'>*</span> {{ $t('common.dialingResource') }}
                                        </template>
                                        <div style="margin-bottom: 10px;">
                                            <el-tooltip :content="$t('common.dialingResourceTooltip')" placement="top">
                                                <i class="el-icon-question" style="margin-right: 10px;"></i>
                                            </el-tooltip>
                                            <el-button type="primary" icon="el-icon-plus" size="small"
                                                @click="addPortResource" :disabled="isView">{{ $t('common.addDialingResource') }}</el-button>

                                        </div>
                                        <div v-for="(resource, index) in form.portConfig.resources" :key="index"
                                            class="param-item">
                                            <el-autocomplete v-model="resource.ip" :fetch-suggestions="querySearch"
                                                :placeholder="$t('common.pleaseInputIpAddressOrSelectAsset')" style="width: 300px; margin-right: 10px;"
                                                :trigger-on-focus="false" clearable value-key="name"
                                                @select="(item) => { resource.assetId = item.assetId; resource.ip = item.ip; if (item.port) { resource.port = item.port; resource.originalPort = item.port; } else { resource.port = ''; resource.originalPort = ''; } }"
                                                @change="resource.assetId = null; resource.originalPort = '';"
                                                :disabled="isView">
                                                <template slot-scope="{ item }">
                                                    <div class="name">{{ item.name }}({{ item.ip }})</div>
                                                </template>
                                            </el-autocomplete>
                                            &nbsp;&nbsp;{{ $t('common.port') }}&nbsp;&nbsp;
                                            <el-input v-model="resource.port" :placeholder="$t('common.port')"
                                                style="width: 200px; margin-right: 10px;"
                                                @change="handlePortChange(resource)" :disabled="isView"></el-input>
                                            <el-button type="danger" icon="el-icon-delete" size="small"
                                                @click="removePortResource(index)"
                                                :disabled="isView || form.portConfig.resources.length <= 1"></el-button>
                                        </div>
                                    </el-form-item>
                                </el-col>
                            </div>

                            <el-col :span="22">
                                <el-form-item :label="$t('common.remark')">
                                    <el-input type="textarea" v-model="form.remark" :placeholder="$t('common.pleaseInputRemark')" :rows="3"
                                        :disabled="isView"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="22">
                                <el-form-item prop="enabled" :label="$t('common.enabled')">
                                    <el-switch v-model="form.enabled" active-color="#409EFF" inactive-color="#cccccc"
                                        :active-value="true" :inactive-value="false" :disabled="isView"></el-switch>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>

                    <!-- Step 2: 规则配置 - 详情模式全部展示，非详情模式按步骤控制 -->
                    <div v-show="!isView ? (activeStep === 1) : true" class="step-content" style="margin-top: 16px;">
                        <!-- 详情模式模块标题 -->
                        <div v-if="isView" class="view-mode-title">{{ $t('common.ruleConfiguration') }}</div>
                        <el-row>
                            <el-col :span="22">
                                <el-form-item>
                                       <template #label>
                                       <span style='color: red;'>*</span> {{ $t('common.dialingRule') }}
                                        </template>
                                    <div style="margin-bottom: 10px;">
                                        <el-button type="primary" icon="el-icon-plus" size="small" @click="addRule"
                                            :disabled="isView">{{ $t('common.addRule') }}</el-button>
                                    </div>
                                    <div v-for="(rule, index) in form.rules" :key="index" class="rule-item">
                                        <el-select v-model="rule.name" :placeholder="$t('common.pleaseSelectRuleName')"
                                            style="width: 200px; margin-right: 10px;" @change="handleRuleChange(index)"
                                            :disabled="isView">
                                            <el-option v-for="option in getAvailableRuleOptions(index)"
                                                :key="option.value" :label="option.label" :value="option.value"
                                                :disabled="isRuleNameSelected(option.value, index)"></el-option>
                                        </el-select>
                                        <el-select v-model="rule.condition" :placeholder="$t('common.condition')"
                                            style="width: 100px; margin-right: 10px;" :disabled="isView">
                                            <el-option value="=" label="="></el-option>
                                            <el-option value="!=" label="≠"></el-option>
                                            <el-option value=">" label=">" v-show="!rule.ruleOptions || rule.ruleOptions.length === 0"></el-option>
                                            <el-option value=">=" label=">=" v-show="!rule.ruleOptions || rule.ruleOptions.length === 0"></el-option>
                                            <el-option value=" <" label="<" v-show="!rule.ruleOptions || rule.ruleOptions.length === 0"></el-option>
                                            <el-option value="<=" label="<=" v-show="!rule.ruleOptions || rule.ruleOptions.length === 0"></el-option>
                                        </el-select>
                                        <template v-if="rule.ruleOptions">
                                            <el-select v-model="rule.value" :placeholder="$t('common.selectStatus')"
                                                style="width: 100px; margin-right: 10px;" :disabled="isView">
                                                <el-option :value="item.value" :label="item.label"
                                                    v-for="item in rule.ruleOptions" :key="item.value"></el-option>
                                            </el-select>
                                        </template>
                                        <template v-else>
                                            <el-input v-model.number="rule.value" :placeholder="$t('common.value')" type="number"
                                                style="width: 100px; margin-right: 10px;" :disabled="isView"></el-input>
                                            <span style="margin-right: 10px;">{{ rule.unit }}</span>
                                        </template>
                                        <el-select v-model="rule.level" :placeholder="$t('common.level')"
                                            style="width: 120px; margin-right: 10px;" :disabled="isView" v-show="false">
                                            <el-option value="预警" label="预警"></el-option>
                                            <el-option value="普通" label="普通"></el-option>
                                            <el-option value="严重" label="严重"></el-option>
                                            <el-option value="紧急" label="紧急"></el-option>
                                        </el-select>
                                        <el-button type="danger" icon="el-icon-delete" size="small"
                                            @click="removeRule(index)"
                                            :disabled="isView || form.rules.length <= 1"></el-button>
                                    </div>
                                </el-form-item>
                            </el-col>
                            <el-col :span="22">
                                <el-form-item prop="duration" :label="$t('common.duration')" required>
                                    <el-input-number v-model="form.duration" :min="1" :max="60" :step="1"
                                        :placeholder="$t('common.minute')" style="width: 150px;" :disabled="isView"></el-input-number>
                                    <span style="margin-left: 10px;">{{ $t('common.minute') }}</span>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>

                    <!-- Step 3: 告警配置 - 详情模式全部展示，非详情模式按步骤控制 -->
                    <div v-show="!isView ? (activeStep === 2) : true" class="step-content" style="margin-top: 16px;">
                        <!-- 详情模式模块标题 -->
                        <div v-if="isView" class="view-mode-title">{{ $t('common.alarmConfiguration') }}</div>
                        <el-row>
                            <el-col :span="22">
                                <el-form-item :label="$t('common.alarmTime')">
                                    <template #label>
                                        <span>{{ $t('common.alarmTime') }}</span>
                                        <el-tooltip :content="$t('common.alarmTimeTooltip')"
                                            placement="top">
                                            <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
                                        </el-tooltip>
                                    </template>
                                    <el-time-picker is-range v-model="form.alarmTime" :clearable="true"
                                        range-separator="至" :start-placeholder="$t('common.startTime')" :end-placeholder="$t('common.endTime')"
                                        value-format="HH:mm" format="HH:mm" :placeholder="$t('common.selectTimeRange')"
                                        :disabled="isView"></el-time-picker>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="22">
                                <el-form-item prop="mergeFields" :label="$t('common.notificationObject')">
                                    <div style="display: flex;">
                                        <el-select style="width: 356px" v-model="form.mergeFields" multiple filterable
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
                </el-form>
            </div>
            <div class="dialog-footer">
                <!-- 上一步/下一步：详情模式隐藏 -->
                <el-button v-if="!isView && activeStep > 0" @click="prevStep" :disabled="isSubmitDisabled">{{ $t('common.previousStep') }}</el-button>
                <el-button v-if="!isView && activeStep < 2" type="primary" @click="nextStep"
                    :disabled="isSubmitDisabled">{{ $t('common.nextStep') }}</el-button>
                <!-- 确定按钮：详情模式隐藏 -->
                <el-button v-if="activeStep === 2 && !isView" type="primary" @click="handleSubmit('form')"
                    :disabled="isSubmitDisabled" :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
                <el-button @click="handleClose" :disabled="isSubmitDisabled">{{ $t('common.close') }}</el-button>
            </div>
            <!-- 配置通知对象弹窗：查看模式隐藏 -->
            <obj-modal ref="editModal" :rowData="{}" @refreshList="fetchData" v-if="!isView"></obj-modal>
        </a-drawer>

        <!-- 接口测试结果弹窗 -->
        <el-dialog :title="$t('common.interfaceTestResult')" :visible.sync="testVisible" width="600px">
            <pre><code class="hljs" v-html="testResult"></code></pre>
            <span slot="footer" class="dialog-footer">
                <el-button @click="testVisible = false">{{ $t('common.close') }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { dialingTaskAdd, dialingTaskUpdate, inspectionDetail, dialingTaskUpdateList, assetList, httpTest, dialingZcList } from '@/api/dialing';
import objModal from "@/views/noticeCenter/ruleList/components/objModal.vue";
import { getNotificationGroup } from "@/api/notice/notice";
import { html_beautify } from 'js-beautify';
import hljs from "highlight.js/lib/highlight";
import "highlight.js/styles/github-gist.css";
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
    name: "tackForm",
    components: { objModal },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        isEdit: {
            type: Boolean,
            default: false
        },
        isView: {
            type: Boolean,
            default: false
        },
        mockDatas: {
            type: Object,
            default: () => {
                return {}
            }
        }
    },
    data() {
        return {
            showModal: false,
            userOptions: [],
            activeStep: 0,
            isSubmitDisabled: false,
            loading: false,
            testVisible: false,
            testResult: "",
            fullRuleOptions: [], // 保存完整的规则数据，用于查找templateId和ruleId

            // 表单数据
            form: {
                taskName: "",
                taskType: "",
                httpConfig: {
                    url: "",
                    method: "GET",
                    headers: [],
                    params: [],
                    configMode: "form",
                    headersJson: "",
                    paramsJson: "",
                    headersJsonError: "",
                    paramsJsonError: ""
                },
                pingConfig: {
                    resources: [{ ip: "", assetId: null }]
                },
                portConfig: {
                    protocol: "TCP",
                    resources: [{ ip: "", port: '', assetId: null, originalPort: '' }]
                },
                remark: "",
                enabled: true,
                rules: [{
                    name: "",
                    condition: "",
                    value: 0,
                    unit: "",
                    level: "普通"
                }],
                duration: 1,
                alarmTime: null,
                alarmNotifyRuleId: null,
                mergeFields: []
            },

            // 规则配置选项
            ruleOptions: [],
            // 保存上一个规则名称，用于重复选择时恢复
            previousRuleName: "",

            // 规则单位映射
            ruleUnits: {
                '平均时延（拨测）': "ms",
                '丢包率（拨测）': "%",
                '响应状态码（拨测）': "",
                '响应结果（拨测）': "",
                '响应耗时（拨测）': "ms",
                '请求耗时（拨测）': "ms",
            },

            // 表单校验规则
            rules: {
                taskName: [
                    { required: true, message: this.$t('common.pleaseInputDialingName'), trigger: "blur" },
                    { max: 40, message: this.$t('common.dialingNameMaxLength'), trigger: "blur" }
                ],
                taskType: [
                    { required: true, message: this.$t('common.pleaseSelectDialingType'), trigger: "blur" }
                ],
                duration: [
                  { required: true, message: this.$t('common.pleaseInputDuration'), trigger: "blur" }
                ],
                enabled: [
                    { required: true, message: this.$t('common.pleaseSelectEnabled'), trigger: "change" }
                ]
            }
        };
    },
    created() {
        // 如果是编辑模式，加载详情数据
        if (this.isEdit && this.inspectionId) {
            this.loadInspectionDetail();
        }
    },
    computed: {
        // 抽屉标题
        opt() {
            if (this.isView) {
                return this.$t('common.dialingDetail');
            } else if (this.isEdit) {
                return this.$t('common.editDialing');
            } else {
                return this.$t('common.addDialing');
            }
        },
        // HTTP配置的动态校验规则
        httpConfigRules() {
            const httpReg = /^https?:\/\/.+/;
            return {
                'httpConfig.url': [
                    {
                        required: this.form.taskType === 'HTTP',
                        message: this.$t('common.pleaseInputRequestUrl'),
                        trigger: "blur"
                    },
                    {
                        pattern: httpReg,  // 新增：http/https 正则校验
                        message: this.$t('common.pleaseInputValidUrl'),
                        trigger: "blur",
                        // 非必填时，空值跳过正则校验（关键：避免空值触发正则错误）
                        validator: (rule, value, callback) => {
                            // 仅当 taskType 是 HTTP 且有值时，才执行正则校验
                            if (this.form.taskType === 'HTTP' && value) {
                                if (!httpReg.test(value)) {
                                    return callback(new Error(this.$t('common.pleaseInputValidUrl')));
                                }
                            }
                            callback();
                        }
                    }
                ],
                'httpConfig.method': [
                    { required: this.form.taskType === 'HTTP', message: this.$t('common.pleaseSelectRequestMethod'), trigger: "change" }
                ]
            };
        },
        // PING配置的动态校验规则
        pingConfigRules() {
            // 为每个资源IP字段动态生成验证规则
            const rules = {
                'pingConfig.resources': [
                    { required: this.form.taskType === 'PING', message: "请至少添加一个拨测资源", trigger: "change" }
                ]
            };

            // 为每个资源的IP字段添加必填验证
            this.form.pingConfig.resources.forEach((_, index) => {
                rules[`pingConfig.resources.${index}.ip`] = [
                    {
                        required: this.form.taskType === 'PING',
                        message: "请输入IP地址",
                        trigger: "blur"
                    },
                    {
                        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                        message: "请输入有效的IP地址",
                        trigger: "blur",
                        required: this.form.taskType === 'PING'
                    }
                ];
            });

            return rules;
        },
        // PORT配置的动态校验规则
        portConfigRules() {
            const rules = {
                'portConfig.protocol': [
                    { required: this.form.taskType === 'DUAN', message: this.$t('common.pleaseSelectProtocolType'), trigger: "blur" }
                ],
                'portConfig.resources': [
                    { required: this.form.taskType === 'DUAN', message: this.$t('common.pleaseAddAtLeastOneDialingResource'), trigger: "change" }
                ]
            };

            // 为每个资源的IP和端口字段添加必填验证
            this.form.portConfig.resources.forEach((_, index) => {
                // IP地址必填验证
                rules[`portConfig.resources.${index}.ip`] = [
                    {
                        required: this.form.taskType === 'DUAN',
                        message: this.$t('common.pleaseInputIpAddress'),
                        trigger: "blur"
                    },
                    {
                        pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                        message: this.$t('common.pleaseInputValidIpAddress'),
                        trigger: "blur",
                        required: this.form.taskType === 'DUAN'
                    }
                ];

                // 端口必填验证
                rules[`portConfig.resources.${index}.port`] = [
                    {
                        required: this.form.taskType === 'DUAN',
                        message: this.$t('common.pleaseInputPort'),
                        trigger: "blur"
                    },
                    {
                        type: 'number',
                        message: this.$t('common.pleaseInputValidPortNumber'),
                        trigger: "blur",
                        required: this.form.taskType === 'DUAN'
                    },
                    {
                        min: 1,
                        max: 65535,
                        message: this.$t('common.portNumberMustBeBetween1And65535'),
                        trigger: "blur",
                        required: this.form.taskType === 'DUAN'
                    }
                ];
            });

            return rules;
        }
    },
    watch: {
        visible(val) {
            if (val) {
                this.initForm();
                this.fetchData();
            }
        }
    },
    methods: {
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
        handleAdd() {
            this.$refs.editModal.showModal = true;
        },
        //规则数据类型
        dialingTaskUpdateLists() {
            // 使用表单中实际填写的taskType参数
            let taskType = this.form.taskType;
            if (this.form.taskType == "DUAN") {
                taskType = this.form.portConfig.protocol
            }
            return dialingTaskUpdateList({ taskType: taskType }).then((res) => {
                console.log(res);
                if (res) {
                    // 保存完整的规则数据，用于后续查找templateId和ruleId
                    this.fullRuleOptions = res.data;
                    this.ruleOptions = res.data.map(item => {
                        // 处理ruleOptions，将key转换为value以匹配模板中的使用
                        const processedRuleOptions = item.ruleOptions ? item.ruleOptions.map(option => ({
                            value: option.key,
                            label: option.label
                        })) : null;
                        return {
                            value: item.ruleId,
                            label: item.ruleName,
                            ruleOptions: processedRuleOptions,
                            unitName: item.unitName
                        }
                    })
                }
            })
        },
        initForm() {
            this.activeStep = 0;
            this.isSubmitDisabled = false;

            if (this.isView && this.mockDatas) {
                this.opt = this.$t('common.dialingDetail');
                this.loadTaskDetail();
                // 详情模式下从基础信息页面开始
                this.activeStep = 0;
            } else if (this.isEdit && this.mockDatas) {
                this.opt = this.$t('common.editDialing');
                this.loadTaskDetail();
            } else {
                this.opt = this.$t('common.addDialing');
                this.resetForm();
            }
        },

        resetForm() {
            this.form = {
                taskName: "",
                taskType: "HTTP",
                httpConfig: {
                    url: "",
                    method: "GET",
                    headers: [],
                    params: [],
                    configMode: "form",
                    headersJson: "",
                    paramsJson: "",
                    headersJsonError: "",
                    paramsJsonError: ""
                },
                pingConfig: {
                    resources: [{ ip: "" }]
                },
                portConfig: {
                    protocol: "TCP",
                    resources: [{ ip: "", port: '' }]
                },
                remark: "",
                enabled: true,
                rules: [{
                    name: "",
                    condition: "",
                    value: 0,
                    unit: "",
                    level: "紧急",
                    ruleOptions: null
                }],
                duration: 1,
                alarmTime: null,
                alarmNotifyRuleId: null,
                mergeFields: [],
            };
            this.$refs.form?.resetFields();
        },

        loadTaskDetail() {
            this.$refs.form?.clearValidate();
            // 检查mockDatas是否有值
            if (!this.mockDatas || Object.keys(this.mockDatas).length === 0) {
                console.error('mockDatas is empty');
                return;
            }
            // 使用传入的mockDatas数据
            const mockData = this.mockDatas;

            // 解析taskParams
            const taskParams = JSON.parse(mockData.taskParams);

            // 填充表单数据
            let displayTaskType = mockData.taskType;
            // 如果是TCP或UDP，显示为DUAN
            if (displayTaskType === 'TCP' || displayTaskType === 'UDP') {
                displayTaskType = 'DUAN';
            }

            // 解析告警时间
            let alarmTime = null;
            if (mockData.alarmDuration && mockData.alarmDuration !== '全天' && mockData.alarmDuration !== 'All day') {
                // 解析alarmDuration格式 "09:23-11:23" 为数组
                alarmTime = mockData.alarmDuration.split('-');
            }

            this.form = {
                taskName: mockData.taskName,
                taskType: displayTaskType,
                enabled: mockData.taskStatus === "ENABLE",
                remark: mockData.taskDescription,
                // 根据任务类型设置对应配置
                httpConfig: {
                    url: "",
                    method: "GET",
                    headers: [],
                    params: [],
                    configMode: "form",
                    headersJson: "",
                    paramsJson: "",
                    headersJsonError: "",
                    paramsJsonError: ""
                },
                pingConfig: {
                    resources: []
                },
                portConfig: {
                    protocol: "TCP",
                    resources: [{ ip: "", port: '' }]
                },
                // 设置告警规则
                rules: taskParams.alarmRules ? taskParams.alarmRules.rules.map(rule => ({
                    name: rule.ruleId, // 使用实际的ruleId作为name值，确保能正确回显
                    condition: rule.ruleCondition,
                    ruleOptions: rule.ruleOptions,
                    value: rule.ruleThreshold, // 保持字符串类型，与el-select选项值类型一致
                    unit: "", // 需要根据实际情况映射
                    level: {
                        'warning': '预警',
                        'normal': '普通',
                        'critical': '严重',
                        'emergency': '紧急'
                    }[rule.rulePriority] || '紧急'
                })) : [],
                duration: taskParams.alarmRules ? taskParams.alarmRules.duration : 1,
                alarmNotifyRuleId: taskParams.alarmNotifyRule ? taskParams.alarmNotifyRule.id : '',
                mergeFields: taskParams.alarmNotifyRule ? taskParams.alarmNotifyRule.mergeFields : [],
                alarmTime: alarmTime
            };

            // 根据任务类型填充具体配置
            if (mockData.taskType === 'PING' && taskParams.pingParams) {
                // 解析otherObjs中的IP地址
                const ips = taskParams.pingParams.otherObjs.split(',');
                this.form.pingConfig.resources = ips.map(ip => ({ ip: ip.trim() }));
            } else if ((mockData.taskType === 'TCP' || mockData.taskType === 'UDP') && taskParams.portParams) {
                // 解析otherObjs中的IP:PORT
                const ipPorts = taskParams.portParams.otherObjs.split(',');
                this.form.portConfig.protocol = mockData.taskType;
                this.form.portConfig.resources = ipPorts.map(ipPort => {
                    const [ip, port] = ipPort.split(':');
                    return { ip: ip.trim(), port: port.trim() };
                });
            } else if (mockData.taskType === 'HTTP' && taskParams.httpParams) {
                // 处理HTTP参数，映射字段名和类型
                const httpParams = taskParams.httpParams;
                this.form.httpConfig = {
                    url: httpParams.requestUrl,
                    method: httpParams.requestMethod,
                    headers: httpParams.requestHeaders ? httpParams.requestHeaders.map(header => ({
                        name: header.paramName,
                        type: header.paramType,
                        value: header.paramValue
                    })) : [],
                    params: httpParams.requestParams ? httpParams.requestParams.map(param => ({
                        name: param.paramName,
                        // 映射参数类型，移除custom类型
                        type: {
                            'String': 'string',
                            'Int': 'number',
                            'boolean': 'boolean',
                            'custom': 'custom'
                        }[param.paramType] || 'string',
                        value: param.paramValue
                    })) : [],
                    configMode: "form",
                    headersJson: "",
                    paramsJson: "",
                    headersJsonError: "",
                    paramsJsonError: ""
                };
            }

            // 加载任务详情后立即加载规则选项
            this.$nextTick(() => {
                this.dialingTaskUpdateLists().then(() => {
                    // Now that fullRuleOptions is loaded, update the rules with correct ruleOptions
                    if (this.form.rules && this.form.rules.length > 0) {
                        this.form.rules.forEach(rule => {
                            // Find the matching rule in fullRuleOptions
                            const matchedRule = this.fullRuleOptions.find(option => option.ruleId === rule.name);
                            if (matchedRule) {
                                // Update ruleOptions with the correct format
                                rule.ruleOptions = matchedRule.ruleOptions ? matchedRule.ruleOptions.map(option => ({
                                    value: option.key,
                                    label: option.label
                                })) : null;
                                // Also update the unit if needed
                                rule.unit = matchedRule.unitName;
                            } else {
                                rule.ruleOptions = null;
                                rule.unit = "";
                            }
                        });
                    }
                });
            });
        },

        // 切换配置模式
        switchConfigMode(mode) {
            if (this.form.httpConfig.configMode === mode) return;

            try {
                if (mode === 'json') {
                    // 从表单模式转换为JSON模式
                    const headersJson = this.formHttpToJson(this.form.httpConfig.headers);
                    const paramsJson = this.formHttpToJson(this.form.httpConfig.params);

                    this.form.httpConfig.headersJson = headersJson;
                    this.form.httpConfig.paramsJson = paramsJson;
                    this.form.httpConfig.headersJsonError = "";
                    this.form.httpConfig.paramsJsonError = "";
                } else {
                    // 从JSON模式转换为表单模式
                    const headers = this.jsonToFormHttp(this.form.httpConfig.headersJson, true);
                    const params = this.jsonToFormHttp(this.form.httpConfig.paramsJson, false);

                    this.form.httpConfig.headers = headers;
                    this.form.httpConfig.params = params;
                }

                this.form.httpConfig.configMode = mode;
            } catch (error) {
                console.error('切换配置模式失败:', error);
                this.$message.error(this.$t('common.configModeSwitchFailed'));
            }
        },

        // 表单数据转换为JSON字符串
        formHttpToJson(formData) {
            if (!formData || formData.length === 0) {
                return "";
            }

            const jsonObj = {};
            formData.forEach(item => {
                if (item.name && item.name.trim()) {
                    let value = item.value;
                    // 根据类型转换值
                    if (item.type === 'Int' || item.type === 'number') {
                        value = Number(value);
                    } else if (item.type === 'Bool' || item.type === 'boolean') {
                        value = value === 'true' || value === true;
                    }
                    jsonObj[item.name] = value;
                }
            });

            return JSON.stringify(jsonObj, null, 2);
        },

        // JSON字符串转换为表单数据
        jsonToFormHttp(jsonStr, isHeader = false) {
            if (!jsonStr || !jsonStr.trim()) {
                return [];
            }

            try {
                const jsonObj = JSON.parse(jsonStr);
                const result = [];

                Object.keys(jsonObj).forEach(key => {
                    const value = jsonObj[key];
                    let type = 'string';
                    let formattedValue = value;

                    if (typeof value === 'number') {
                        type = isHeader ? 'Int' : 'number';
                    } else if (typeof value === 'boolean') {
                        type = isHeader ? 'Bool' : 'boolean';
                        formattedValue = value.toString();
                    } else if (typeof value === 'string') {
                        // 对于字符串类型，根据 isHeader 参数设置正确的类型
                        type = isHeader ? 'String' : 'string';
                    }

                    result.push({
                        name: key,
                        type: type,
                        value: formattedValue
                    });
                });

                return result;
            } catch (error) {
                console.error('JSON解析失败:', error);
                this.$message.error(this.$t('common.jsonFormatIncorrect'));
                return [];
            }
        },

        // 格式化JSON
        formatJson(type) {
            try {
                let jsonStr = '';
                if (type === 'headers') {
                    jsonStr = this.form.httpConfig.headersJson;
                    if (!jsonStr || !jsonStr.trim()) {
                        this.form.httpConfig.headersJson = '{}';
                        return;
                    }
                    const jsonObj = JSON.parse(jsonStr);
                    this.form.httpConfig.headersJson = JSON.stringify(jsonObj, null, 2);
                    this.form.httpConfig.headersJsonError = "";
                } else if (type === 'params') {
                    jsonStr = this.form.httpConfig.paramsJson;
                    if (!jsonStr || !jsonStr.trim()) {
                        this.form.httpConfig.paramsJson = '{}';
                        return;
                    }
                    const jsonObj = JSON.parse(jsonStr);
                    this.form.httpConfig.paramsJson = JSON.stringify(jsonObj, null, 2);
                    this.form.httpConfig.paramsJsonError = "";
                }
            } catch (error) {
                console.error('JSON格式化失败:', error);
                const errorMsg = this.$t('common.jsonFormatError') + error.message;
                if (type === 'headers') {
                    this.form.httpConfig.headersJsonError = errorMsg;
                } else if (type === 'params') {
                    this.form.httpConfig.paramsJsonError = errorMsg;
                }
                this.$message.error(this.$t('common.jsonFormatErrorPleaseCheck'));
            }
        },

        // 验证JSON
        validateJson(type) {
            try {
                let jsonStr = '';
                if (type === 'headers') {
                    jsonStr = this.form.httpConfig.headersJson;
                    if (!jsonStr || !jsonStr.trim()) {
                        this.form.httpConfig.headersJsonError = "";
                        return true;
                    }
                    JSON.parse(jsonStr);
                    this.form.httpConfig.headersJsonError = "";
                    return true;
                } else if (type === 'params') {
                    jsonStr = this.form.httpConfig.paramsJson;
                    if (!jsonStr || !jsonStr.trim()) {
                        this.form.httpConfig.paramsJsonError = "";
                        return true;
                    }
                    JSON.parse(jsonStr);
                    this.form.httpConfig.paramsJsonError = "";
                    return true;
                }
            } catch (error) {
                console.error('JSON验证失败:', error);
                const errorMsg = this.$t('common.jsonFormatError') + error.message;
                if (type === 'headers') {
                    this.form.httpConfig.headersJsonError = errorMsg;
                } else if (type === 'params') {
                    this.form.httpConfig.paramsJsonError = errorMsg;
                }
                return false;
            }
        },

        // 拨测类型变化处理
        handleTaskTypeChange() {
            let taskType = this.form.taskType;
            this.$refs.form?.clearValidate();
            this.form.taskType = taskType;
            // 清空其他类型的配置
            if (this.form.taskType !== 'HTTP') {
                this.form.httpConfig = {
                    url: "",
                    method: "GET",
                    headers: [],
                    params: [],
                    configMode: "form",
                    headersJson: "",
                    paramsJson: "",
                    headersJsonError: "",
                    paramsJsonError: ""
                };
            }
            if (this.form.taskType !== 'PING') {
                this.form.pingConfig = { resources: [{ ip: "", assetId: null }] };
            }
            if (this.form.taskType !== 'DUAN') {
                this.form.portConfig = { protocol: "TCP", resources: [{ ip: "", port: '', assetId: null, originalPort: '' }] };
            }
            // 重置规则
            this.form.rules = [{
                name: "",
                condition: "",
                value: 0,
                unit: "",
                level: "紧急",
                ruleOptions: null
            }];
        },

        // 获取规则单位
        getRuleUnit(ruleName) {
            return this.ruleUnits[ruleName] || "";
        },

        // 获取当前拨测类型相关的验证规则
        getCurrentRules() {
            // 基础规则始终包含
            const currentRules = { ...this.rules };

            // 根据当前拨测类型添加对应规则
            if (this.form.taskType === 'HTTP') {
                Object.assign(currentRules, this.httpConfigRules);
            } else if (this.form.taskType === 'PING') {
                Object.assign(currentRules, this.pingConfigRules);
            } else if (this.form.taskType === 'DUAN' || this.form.taskType === 'TCP' || this.form.taskType === 'UDP') {
                Object.assign(currentRules, this.portConfigRules);
            }

            return currentRules;
        },

        // 规则变化处理
        handleRuleChange(index) {
            const currentRule = this.form.rules[index];
            console.log(currentRule, 'currentRule');

            const ruleName = currentRule.name;

            // 根据选择的规则名称，从fullRuleOptions中查找对应的规则，并将其ruleOptions字段赋值给当前规则对象
            const matchedRule = this.fullRuleOptions?.find(option => option.ruleId === ruleName);
            if (matchedRule) {
                // 处理ruleOptions，将key转换为value以匹配模板中的使用
                currentRule.ruleOptions = matchedRule.ruleOptions ? matchedRule.ruleOptions.map(option => ({
                    value: option.key,
                    label: option.label
                })) : null;
                if (currentRule.ruleOptions && currentRule.ruleOptions.length > 0) {
                  currentRule.value = matchedRule.ruleOptions[0].key;
                } else {
                  currentRule.value = '0';
                }
                currentRule.unit = matchedRule.unitName;
            } else {
                currentRule.ruleOptions = null;
                currentRule.unit = '';
            }
        },

        // 获取当前规则选择框可用的规则选项
        getAvailableRuleOptions(index) {
            return this.ruleOptions;
        },

        // 检查规则名称是否已被其他规则选择
        isRuleNameSelected(ruleValue, currentIndex) {
            // 如果规则值为空，不禁用
            if (!ruleValue) {
                return false;
            }

            // 遍历所有规则，检查是否有其他规则使用了相同的规则名称
            for (let i = 0; i < this.form.rules.length; i++) {
                if (i !== currentIndex && this.form.rules[i].name === ruleValue) {
                    return true;
                }
            }

            return false;
        },

        // 下一步
        nextStep() {
            // 基本信息校验
            if (this.activeStep === 0) {
                // 验证当前步骤的表单数据
                this.$refs.form.validate(valid => {
                    // 额外检查PING拨测的IP输入框是否为空
                    let pingIpValid = true;
                    if (this.form.taskType === 'PING') {
                        for (let i = 0; i < this.form.pingConfig.resources.length; i++) {
                            const resource = this.form.pingConfig.resources[i];
                            if (!resource.ip || !resource.ip.trim()) {
                                pingIpValid = false;
                                break;
                            }
                        }
                    }

                    // 检查端口拨测的IP和端口是否完整
                    let portIpValid = true;
                    let portValid = true;
                    if (this.form.taskType === 'DUAN') {
                        for (let i = 0; i < this.form.portConfig.resources.length; i++) {
                            const resource = this.form.portConfig.resources[i];
                            // 检查IP是否为空
                            if (!resource.ip || !resource.ip.trim()) {
                                portIpValid = false;
                                break;
                            }
                            // 检查端口是否为空
                            if (!resource.port || !resource.port.toString().trim()) {
                                portValid = false;
                                break;
                            }
                        }
                    }

                    // 检查HTTP配置
                    let httpValid = true;
                    if (this.form.taskType === 'HTTP') {
                        if (this.form.httpConfig.configMode === 'form') {
                            // 表单模式验证
                            let httpHeadersValid = true;
                            let httpParamsValid = true;
                            let httpHeadersUnique = true;
                            let httpParamsUnique = true;

                            // 验证请求头
                            const headerNames = [];
                            for (let i = 0; i < this.form.httpConfig.headers.length; i++) {
                                const header = this.form.httpConfig.headers[i];
                                if ((!header.name || !header.name.trim()) || (!header.value && header.value !== 0 || !String(header.value).trim())) {
                                    httpHeadersValid = false;
                                    break;
                                }
                                // 检查请求头名称是否重复
                                const headerName = header.name.trim();
                                if (headerNames.includes(headerName)) {
                                    httpHeadersUnique = false;
                                    break;
                                }
                                headerNames.push(headerName);
                            }

                            // 验证请求参数
                            const paramNames = [];
                            for (let i = 0; i < this.form.httpConfig.params.length; i++) {
                                const param = this.form.httpConfig.params[i];
                                if ((!param.name || !param.name.trim()) || (!param.value && param.value !== 0 || !String(param.value).trim())) {
                                    httpParamsValid = false;
                                    break;
                                }
                                // 检查请求参数名称是否重复
                                const paramName = param.name.trim();
                                if (paramNames.includes(paramName)) {
                                    httpParamsUnique = false;
                                    break;
                                }
                                paramNames.push(paramName);
                            }

                            if (!httpHeadersValid) {
                                this.$message.error(this.$t('common.pleaseFillAllRequestHeaderNamesAndValues'));
                                httpValid = false;
                            } else if (!httpParamsValid) {
                                this.$message.error(this.$t('common.pleaseFillAllRequestParameterNamesAndValues'));
                                httpValid = false;
                            } else if (!httpHeadersUnique) {
                                this.$message.error(this.$t('common.requestHeaderNamesCannotDuplicate'));
                                httpValid = false;
                            } else if (!httpParamsUnique) {
                                this.$message.error(this.$t('common.requestParameterNamesCannotDuplicate'));
                                httpValid = false;
                            }
                        } else {
                            // JSON模式验证
                            if (this.form.httpConfig.headersJson && !this.validateJson('headers')) {
                                httpValid = false;
                            }
                            if (this.form.httpConfig.paramsJson && !this.validateJson('params')) {
                                httpValid = false;
                            }
                        }
                    }

                    if (valid && pingIpValid && portIpValid && portValid && httpValid) {
                        console.log(valid, 'valid');
                        // 调用dialingTaskUpdateLists方法并传递taskType参数
                        this.dialingTaskUpdateLists();
                        this.activeStep++;
                    } else if (!pingIpValid) {
                        this.$message.error(this.$t('common.pleaseFillAllPingDialingResourceIpAddresses'));
                    } else if (!portIpValid) {
                        this.$message.error(this.$t('common.pleaseFillAllPortDialingResourceIpAddresses'));
                    } else if (!portValid) {
                        this.$message.error(this.$t('common.pleaseFillAllPortDialingResourcePorts'));
                    } else if (!httpValid && this.form.taskType === 'HTTP') {
                        if (this.form.httpConfig.configMode === 'json') {
                            this.$message.error(this.$t('common.pleaseCheckJsonFormat'));
                        }
                    }
                });
            }
            // 规则配置校验
            else if (this.activeStep === 1) {
                let valid = true;
                // 校验至少有一条规则
                if (this.form.rules.length === 0) {
                    valid = false;
                    this.$message.error(this.$t('common.pleaseConfigureAtLeastOneDialingRule'));
                } else {
                    // 校验每条规则
                    for (let i = 0; i < this.form.rules.length; i++) {
                        const rule = this.form.rules[i];
                        if (!rule.name || !rule.condition || rule.value === undefined) {
                            valid = false;
                            this.$message.error(this.$t('common.pleaseConfigureAllRulesCompletely'));
                            break;
                        }
                    }
                }

                if (valid) {
                    this.activeStep++;
                }
            }
        },

        // 上一步
        prevStep() {
            this.activeStep--;
        },

        // 添加HTTP请求头
        addHttpHeader() {
            this.form.httpConfig.headers.push({ name: "", type: "String", value: "" });
        },

        // 移除HTTP请求头
        removeHttpHeader(index) {
            this.form.httpConfig.headers.splice(index, 1);
        },

        // 添加HTTP请求参数
        addHttpParam() {
            this.form.httpConfig.params.push({ name: "", type: "string", value: "" });
        },

        // 移除HTTP请求参数
        removeHttpParam(index) {
            this.form.httpConfig.params.splice(index, 1);
        },

        // 添加PING资源
        addPingResource() {
            this.form.pingConfig.resources.push({ ip: "", assetId: null });
        },

        // 移除PING资源
        removePingResource(index) {
            if (this.form.pingConfig.resources.length > 1) {
                this.form.pingConfig.resources.splice(index, 1);
            }
        },

        // 模糊搜索资产
        querySearch(queryString, cb) {
            // 调用资产列表API获取匹配的资产
            dialingZcList({ ip: queryString }).then(response => {
                // 直接从response.data获取数据
                const assets = response.data || [];

                // 处理搜索结果，确保数据格式正确
                const results = assets
                    .filter(asset => asset && asset.assetAttribute) // 过滤掉没有assetAttribute的资产
                    .map(asset => {
                        const attribute = asset.assetAttribute;
                        return {
                            id: asset.id,
                            assetId: asset.id, // 保持与原有逻辑兼容
                            ip: attribute.ip || '',
                            name: attribute.name || attribute.ip || '未命名资产', // 确保有name属性，与value-key对应
                            assetName: attribute.name || '未命名资产',
                            port: attribute.port
                        };
                    })
                    .filter(item => item.ip); // 过滤掉没有IP的资产

                // 如果没有搜索到结果，不显示任何选项
                if (results.length === 0) {
                    cb([]);
                } else {
                    cb(results);
                }
            }).catch(error => {
                console.error('搜索资产失败:', error);
                cb([]);
            });
        },

        // 添加PORT资源
        addPortResource() {
            this.form.portConfig.resources.push({ ip: "", port: '', assetId: null, originalPort: '' });
        },
        // 处理端口变化
        handlePortChange(resource) {
            // 如果有assetId且端口号发生了变化，则清除assetId
            if (resource.assetId && resource.port.toString() !== resource.originalPort?.toString()) {
                resource.assetId = null;
            }
            // 更新原始端口记录
            resource.originalPort = resource.port;
        },

        // 移除PORT资源
        removePortResource(index) {
            if (this.form.portConfig.resources.length > 1) {
                this.form.portConfig.resources.splice(index, 1);
            }
        },

        // 添加规则
        addRule() {
            this.form.rules.push({
                name: "",
                condition: "",
                value: 0,
                unit: "",
                level: "紧急",
                ruleOptions: null
            });
        },

        // 移除规则
        removeRule(index) {
            if (this.form.rules.length > 1) {
                this.form.rules.splice(index, 1);
            }
        },

        // 接口测试
        testHttpConnection() {
            // URL必填校验
            if (!this.form.httpConfig.url) {
                this.$message.error(this.$t('common.pleaseFillRequestUrlFirst'));
                return;
            }

            // 根据配置模式进行验证
            if (this.form.httpConfig.configMode === 'form') {
                // 表单模式验证
                let httpHeadersValid = true;
                let httpParamsValid = true;
                let httpHeadersUnique = true;
                let httpParamsUnique = true;

                // 验证请求头
                const headerNames = [];
                for (let i = 0; i < this.form.httpConfig.headers.length; i++) {
                    const header = this.form.httpConfig.headers[i];
                    if ((!header.name || !header.name.trim()) || (!header.value && header.value !== 0 || !String(header.value).trim())) {
                        httpHeadersValid = false;
                        break;
                    }
                    // 检查请求头名称是否重复
                    const headerName = header.name.trim();
                    if (headerNames.includes(headerName)) {
                        httpHeadersUnique = false;
                        break;
                    }
                    headerNames.push(headerName);
                }

                // 验证请求参数
                const paramNames = [];
                for (let i = 0; i < this.form.httpConfig.params.length; i++) {
                    const param = this.form.httpConfig.params[i];
                    if ((!param.name || !param.name.trim()) || (!param.value && param.value !== 0 || !String(param.value).trim())) {
                        httpParamsValid = false;
                        break;
                    }
                    // 检查请求参数名称是否重复
                    const paramName = param.name.trim();
                    if (paramNames.includes(paramName)) {
                        httpParamsUnique = false;
                        break;
                    }
                    paramNames.push(paramName);
                }

                // 校验结果检查
                if (!httpHeadersValid) {
                    this.$message.error(this.$t('common.pleaseFillAllRequestHeaderNamesAndValues'));
                    return;
                } else if (!httpParamsValid) {
                    this.$message.error(this.$t('common.pleaseFillAllRequestParameterNamesAndValues'));
                    return;
                } else if (!httpHeadersUnique) {
                    this.$message.error(this.$t('common.requestHeaderNamesCannotDuplicate'));
                    return;
                } else if (!httpParamsUnique) {
                    this.$message.error(this.$t('common.requestParameterNamesCannotDuplicate'));
                    return;
                }
            } else {
                // JSON模式验证
                if (this.form.httpConfig.headersJson && !this.validateJson('headers')) {
                    this.$message.error(this.$t('common.requestHeaderJsonFormatError'));
                    return;
                }
                if (this.form.httpConfig.paramsJson && !this.validateJson('params')) {
                    this.$message.error(this.$t('common.requestParameterJsonFormatError'));
                    return;
                }
            }

            // 构建测试参数
            let parms = {
                taskType: "HTTP",
                "taskParams": {
                    "httpParams": {
                        "requestUrl": this.form.httpConfig.url,
                        "requestMethod": this.form.httpConfig.method,
                        "requestHeaders": [],
                        "requestParams": [],
                    }
                }
            };

            // 根据配置模式构建数据
            if (this.form.httpConfig.configMode === 'form') {
                // 表单模式
                parms.taskParams.httpParams.requestHeaders = this.form.httpConfig.headers.map(header => ({
                    paramName: header.name,
                    paramType: header.type,
                    paramValue: header.value
                }));
                parms.taskParams.httpParams.requestParams = this.form.httpConfig.params.map(param => ({
                    paramName: param.name,
                    paramType: param.type === 'string' ? 'String' :
                              param.type === 'number' ? 'Int' :
                              param.type === 'boolean' ? 'boolean' : 'String',
                    paramValue: param.value
                }));
            } else {
                // JSON模式
                try {
                    if (this.form.httpConfig.headersJson && this.form.httpConfig.headersJson.trim()) {
                        const headersObj = JSON.parse(this.form.httpConfig.headersJson);
                        parms.taskParams.httpParams.requestHeaders = Object.keys(headersObj).map(key => ({
                            paramName: key,
                            paramType: this.getValueType(headersObj[key]),
                            paramValue: headersObj[key]
                        }));
                    }
                    if (this.form.httpConfig.paramsJson && this.form.httpConfig.paramsJson.trim()) {
                        const paramsObj = JSON.parse(this.form.httpConfig.paramsJson);
                        parms.taskParams.httpParams.requestParams = Object.keys(paramsObj).map(key => ({
                            paramName: key,
                            paramType: this.getValueType(paramsObj[key]),
                            paramValue: paramsObj[key]
                        }));
                    }
                } catch (error) {
                    console.error('JSON解析失败:', error);
                    this.$message.error("JSON数据解析失败，请检查格式");
                    return;
                }
            }

            this.loading = true;
            httpTest(parms).then((res) => {
                this.loading = false;
                if (res.data) {
                    try {
                        const parsed = JSON.parse(res.data);
                        console.log(parsed);
                        const formatted = JSON.stringify(parsed, null, 2);
                        console.log(formatted);
                        this.testVisible = true;
                        this.testResult = hljs.highlight('json', formatted, true).value;
                    } catch (error) {
                        this.testVisible = true;
                        if ((res.data.startsWith('<html')  || res.data.startsWith('<!DOCTYPE')) && res.data.includes('>')) {
                          this.testResult = hljs.highlight('html', html_beautify(res.data, {indent_size: 2, wrap_line_length: 0, preserve_newlines: false}), true).value;
                        } else {
                          this.testResult = hljs.highlight('plaintext', res.data, true).value;
                        }
                    }
                } else {
                    this.$message.error(this.$t('common.interfaceTestFailedNoValidDataReturned'));
                }
            }).catch(error => {
                this.loading = false;
                console.error('接口测试失败:', error);
            })

        },

        // 获取值的类型
        getValueType(value) {
            if (typeof value === 'number') {
                return 'Int';
            } else if (typeof value === 'boolean') {
                return 'boolean';
            } else {
                return 'String';
            }
        },

        // 加载详情数据
        loadInspectionDetail() {
            this.loading = true;
            inspectionDetail(this.inspectionId).then(res => {
                if (res.data) {
                    const data = res.data;
                    // 处理详情数据
                    this.form = {
                        ...data,
                        // 处理时间范围
                        alarmTime: data.alarmStartTime && data.alarmEndTime ? [data.alarmStartTime, data.alarmEndTime] : null,
                        alarmStartTime: undefined,
                        alarmEndTime: undefined
                    };

                    // 调用dialingTaskUpdateLists获取规则数据
                    this.dialingTaskUpdateLists();
                    // 在获取到规则数据后处理ruleOptions
                    if (this.form.rules && Array.isArray(this.form.rules)) {
                        this.form.rules.forEach(rule => {
                            // 设置规则单位
                            rule.unit = this.getRuleUnit(rule.name);
                            // 根据规则name(即ruleId)查找对应的ruleOptions
                            const matchedRule = this.fullRuleOptions.find(option => option.ruleId == rule.name);
                            if (matchedRule && matchedRule.ruleOptions) {
                                rule.ruleOptions = matchedRule.ruleOptions.map(option => ({
                                    value: option.key,
                                    label: option.label
                                }));
                            } else {
                                rule.ruleOptions = null;
                            }
                        });
                    }
                }
            }).finally(() => {
                this.loading = false;
            });
        },

        // 表单提交
        handleSubmit(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.isSubmitDisabled = true;

                    // 构造taskParams数据
                    console.log(this.form.rules, 'this.form.rules');
                    const taskParams = {
                        // 告警规则
                        alarmNotifyRule: {
                            id: this.form.alarmNotifyRuleId,
                            mergeFields: this.form.mergeFields,
                        },
                        alarmRules: {
                            duration: this.form.duration,
                            durationUnit: 'm', // 默认为分钟
                            rules: this.form.rules.map(rule => {
                                // 根据规则名称查找对应的templateId和ruleId
                                console.log(this.fullRuleOptions);

                                const matchedRule = this.fullRuleOptions?.find(option => option.ruleId === rule.name) || {};
                                return {
                                    templateId: matchedRule.templateId || 1, // 使用接口返回的templateId，默认值1
                                    ruleId: matchedRule.ruleId || 1, // 使用接口返回的ruleId，默认值1
                                    ruleCondition: rule.condition,
                                    ruleOptions: rule.ruleOptions,
                                    ruleThreshold: rule.value.toString(),
                                    rulePriority: {
                                        '预警': 'warning',
                                        '普通': 'normal',
                                        '严重': 'critical',
                                        '紧急': 'emergency'
                                    }[rule.level]
                                };
                            })
                        },
                        // 告警时间
                        alarmTimes: {
                            startTime: this.form.alarmTime ? `${this.form.alarmTime[0]}:00` : null,
                            endTime: this.form.alarmTime ? `${this.form.alarmTime[1]}:00` : null
                        }
                    };

                    // 根据拨测类型添加对应的参数
                    if (this.form.taskType === 'HTTP') {
                        // 构建HTTP参数
                        const httpParams = {
                            requestUrl: this.form.httpConfig.url,
                            requestMethod: this.form.httpConfig.method,
                            requestHeaders: [],
                            requestParams: []
                        };

                        if (this.form.httpConfig.configMode === 'form') {
                            // 表单模式
                            httpParams.requestHeaders = this.form.httpConfig.headers.map(header => ({
                                paramName: header.name,
                                paramType: header.type,
                                paramValue: header.value
                            }));
                            httpParams.requestParams = this.form.httpConfig.params.map(param => ({
                                paramName: param.name,
                                paramType: param.type === 'string' ? 'String' :
                                          param.type === 'number' ? 'Int' :
                                          param.type === 'boolean' ? 'boolean' : 'String',
                                paramValue: param.value
                            }));
                        } else {
                            // JSON模式
                            try {
                                if (this.form.httpConfig.headersJson && this.form.httpConfig.headersJson.trim()) {
                                    const headersObj = JSON.parse(this.form.httpConfig.headersJson);
                                    httpParams.requestHeaders = Object.keys(headersObj).map(key => ({
                                        paramName: key,
                                        paramType: this.getValueType(headersObj[key]),
                                        paramValue: headersObj[key]
                                    }));
                                }
                                if (this.form.httpConfig.paramsJson && this.form.httpConfig.paramsJson.trim()) {
                                    const paramsObj = JSON.parse(this.form.httpConfig.paramsJson);
                                    httpParams.requestParams = Object.keys(paramsObj).map(key => ({
                                        paramName: key,
                                        paramType: this.getValueType(paramsObj[key]),
                                        paramValue: paramsObj[key]
                                    }));
                                }
                            } catch (error) {
                                console.error('JSON解析失败:', error);
                                this.$message.error("JSON数据解析失败，请检查格式");
                                this.isSubmitDisabled = false;
                                return;
                            }
                        }

                        taskParams.httpParams = httpParams;
                    } else if (this.form.taskType === 'PING') {
                        // 所有资源都存入otherObjs中，assetIdList保持为空数组
                        const allResources = this.form.pingConfig.resources;

                        taskParams.pingParams = {
                            assetIdList: [],
                            otherObjs: allResources.map(item => item.ip).join(',')
                        };
                    } else if (this.form.portConfig.protocol === 'TCP' || this.form.portConfig.protocol === 'UDP') {
                        // 所有资源都存入otherObjs中，assetIdList保持为空数组
                        const allResources = this.form.portConfig.resources;

                        taskParams.portParams = {
                            assetIdList: [],
                            otherObjs: allResources.map(item => `${item.ip}:${item.port}`).join(',')
                        };
                    }

                    // 构造提交数据
                    console.log(this.form, 'this.form');

                    // 构造提交数据
                    const submitData = {
                        taskName: this.form.taskName,
                        taskType: this.form.taskType != "DUAN" ? this.form.taskType : this.form.portConfig.protocol,
                        taskStatus: this.form.enabled ? 'ENABLE' : 'DISABLE',
                        taskDescription: this.form.remark,
                        taskParams: taskParams
                    };

                    // 在编辑模式下添加id字段
                    if (this.isEdit && this.mockDatas.id) {
                        submitData.id = this.mockDatas.id;
                    }

                    console.log('提交数据:', submitData);

                    // 调用接口
                    const apiMethod = this.isEdit ? dialingTaskUpdate : dialingTaskAdd;

                    apiMethod(submitData).then(res => {
                        this.isSubmitDisabled = false;
                        this.$message.success(this.isEdit ? this.$t('common.editSuccess') : this.$t('common.addSuccess'));
                        this.handleClose(true);
                    }).catch(error => {
                        this.isSubmitDisabled = false;
                        console.error("提交失败:", error);
                    });
                } else {
                    return false;
                }
            });
        },

        // 关闭抽屉
        handleClose(success = false) {
            this.$emit("close", success);
            if (success) {
                this.$emit("fetchData");
            }
        }
    }
};
</script>

<style scoped>
.step-content {
    margin-top: 20px;
    padding: 20px;
    background-color: #fafafa;
    border-radius: 4px;
}

.task-type-params {
    margin-top: 20px;
    border-radius: 4px;
}

.param-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.rule-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    background-color: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
}

.dialog-footer {
    text-align: right;
    padding: 10px 20px;
    border-top: 1px solid #f0f0f0;
}

.view-mode-title {
    font-size: 16px;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 12px;
    color: #333;
    border-left: 3px solid #409EFF;
    padding-left: 8px;
}
:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}
:deep(.el-dialog .el-dialog__body) {
  max-height: 66vh;
}
</style>
