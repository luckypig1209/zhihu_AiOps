<template>
  <el-drawer :title="title" size="40%" :visible="visible" @close="handleClose" :wrapperClosable="false"
    :before-close="handleClose">
    <el-tabs v-model="activeTab" style="margin-left: 20px;margin-right: 20px;">
      <!-- 资产信息 Tab -->
      <el-tab-pane :label="$t('common.assetInfo')" name="manual">
        <!-- 资产信息表单：Element UI 表单通过 model/rules 绑定，ref 用于校验 -->
        <el-form ref="assetForm" :model="form" :rules="rules" label-width="150px" class="asset-form">

          <!-- 动态生成字段：根据 itemsList 渲染不同类型表单项 -->
          <el-form-item v-for="(item, index) in itemsList" :key="index" :label="item.itemName" :prop="`${item.id}_模型`"
            :required="item.isRequired">
            <template #label>
              <!-- <el-tooltip content="厂家型号影响监控指标项，如有调整请重新下发!" placement="top">
                <i class="el-icon-question" v-if="item.itemCode === 'cmdbBrand'" style="width: 24px;
                  line-height: 32px;
                 "></i>
              </el-tooltip> -->
              <span>{{ item.itemName }}</span>
            </template>
            <!-- 下拉选择（OPTIONAL） -->
            <div
              v-if="item.itemCode !== 'cmdbBrand' && item.itemCode !== 'cmdbSpu' && item.itemCode !== 'asset_optional_monitor_type'">
              <el-select v-if="item.itemDataType === 'OPTIONAL'" v-model="form[`${item.id}_模型`]" :disabled="isEditAble"
                :placeholder="$t('common.pleaseSelect')" @change="changeType" clearable filterable>
                <el-option v-for="dict in getDictDatas(item.itemCode)" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>

              <!-- 时间选择器（DATETIME） -->
              <el-time-picker v-else-if="item.itemDataType === 'DATETIME'" v-model="form[`${item.id}_模型`]"
                :disabled="isEditAble" format="HH:mm:ss" value-format="HH:mm:ss" :placeholder="$t('common.pleaseSelectTime')" style="width: 100%"
                clearable />

              <!-- 日期选择器（DATE） -->
              <el-date-picker v-else-if="item.itemDataType === 'DATE'" v-model="form[`${item.id}_模型`]"
                :disabled="isEditAble" type="date" format="yyyy-MM-dd" value-format="yyyy-MM-dd" :placeholder="$t('common.pleaseSelectDate')"
                style="width: 100%" clearable />

              <!-- 整数输入（INTEGER） -->
              <el-input v-else-if="item.itemDataType === 'INTEGER'" v-model="form[`${item.id}_模型`]"
                :disabled="isEditAble" @change="(val) => operationChange(`${item.id}_模型`, val)" :placeholder="$t('common.pleaseInputPositiveInteger')"
                controls-position="right" style="width: 100%" />

              <!-- 浮点数输入（FLOAT） -->
              <el-input-number v-else-if="item.itemDataType === 'FLOAT'" v-model="form[`${item.id}_模型`]"
                :disabled="isEditAble" :precision="2" @change="(val) => operationChange(`${item.id}_模型`, val)"
                :placeholder="$t('common.pleaseInputUpToTwoDecimal')" style="width: 100%" />

              <!-- 文本输入（TEXT/STRING） -->
              <el-input v-else-if="item.itemDataType === 'TEXT' || item.itemDataType === 'STRING'"
                v-model="form[`${item.id}_模型`]" :disabled="isEditAble" :placeholder="$t('common.pleaseInputContent')" clearable
                style="width: 100%" />
            </div>

            <div v-else style="display: flex;">
              <!-- <el-tooltip content="厂家型号影响监控指标项，如有调整请重新下发!" placement="top">
                <i class="el-icon-question" v-if="item.itemCode === 'cmdbBrand'" style="width: 24px;
                  line-height: 32px;
                 "></i>
              </el-tooltip>       -->

              <el-select v-if="item.itemCode === 'cmdbBrand'" v-model="form[`${item.id}_模型`]" :disabled="isEditAble"
                :placeholder="$t('common.pleaseSelect')" clearable filterable @change="selectSpu">
                <el-option v-for="dict in selectKeyList" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
              <el-select v-if="item.itemCode === 'cmdbSpu'" v-model="form[`${item.id}_模型`]" @change="showSpuTip = true"
                :disabled="isEditAble" :placeholder="$t('common.pleaseSelect')" clearable filterable>
                <el-option v-for="dict in selectSpuList" :key="dict.spu" :label="dict.spuName" :value="dict.spu" />
              </el-select>

            </div>
            <div v-if="item.itemCode == 'cmdbBrand' && showBrandTip"
              style="color: red; font-size: 12px; margin-top: 4px;">
              {{ $t('common.brandModelAffectsMonitoringIndicators') }}
            </div>
            <div v-if="item.itemCode == 'cmdbSpu' && showSpuTip" style="color: red; font-size: 12px; margin-top: 4px;">
              {{ $t('common.brandModelAffectsMonitoringIndicators') }}
            </div>
          </el-form-item>

           <el-form-item  :label="$t('common.monitorMethod')" prop="monitorMethod">
             <template #label  v-if="assertInfo.modelCode === 'networkdevice' || assertInfo.modelCode === 'storagedevice' || assertInfo.modelCode === 'terminaldevice'|| assertInfo.modelCode === 'securitydevice'">
               <span>{{ $t('common.monitorMethod') }}</span>
               <el-tooltip placement="top">
                 <div slot="content">
                   <div v-if="assertInfo.modelCode === 'terminaldevice'">
                     {{ $t('common.pingThroughIcmp') }}
                   </div>
                   <div v-else>
                     {{ $t('common.snmpThroughSnmpProtocol') }}
                     <br/>
                     {{ $t('common.pingThroughIcmp') }}
                   </div>
                 </div>
                 <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
               </el-tooltip>
             </template>

            <el-select v-if="assertInfo.modelCode === 'networkdevice'
            || assertInfo.modelCode === 'storagedevice' || assertInfo.modelCode === 'securitydevice'" v-model="form.monitorMethod"
                 :placeholder="$t('common.pleaseSelect')" clearable filterable @change="changeMonitor">
                <el-option v-for="dict in monitorTypeList1" :key="dict.value" :label="dict.label"
                  :value="dict.value"  />
                  </el-select>
             <el-select v-else-if="assertInfo.modelCode === 'terminaldevice'" v-model="form.monitorMethod"
                        :placeholder="$t('common.pleaseSelect')" clearable filterable @change="changeMonitor">
               <el-option v-for="dict in monitorTypeList3" :key="dict.value" :label="dict.label"
                          :value="dict.value"/>
             </el-select>
             <el-select v-else-if="assertInfo.modelCode === 'ztkeeper'" v-model="form.monitorMethod"
                        :placeholder="$t('common.pleaseSelect')" clearable filterable @change="changeMonitor">
               <el-option v-for="dict in monitorTypeList4" :key="dict.value" :label="dict.label"
                          :value="dict.value" />
             </el-select>
            <el-select v-else  v-model="form.monitorMethod"
                 :placeholder="$t('common.pleaseSelect')" clearable filterable @change="changeMonitor" :disabled="!originHasMonitor.includes(assertInfo.modelCode)">
                <el-option v-for="dict in monitorTypeList2" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
                  </el-select>
            </el-form-item>
          <!-- 提交/取消按钮 -->
          <!-- <el-form-item>
            <el-button type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
            <el-button @click="handleClose" style="margin-left: 8px">{{ $t('common.cancel') }}</el-button>
          </el-form-item> -->
        </el-form>
      </el-tab-pane>

      <!-- 监控信息 Tab -->
      <el-tab-pane :label="$t('common.monitorInfo')" name="file" v-if="hasMonitor.includes(assertInfo.modelCode) && form.monitorMethod != 0">
        <div v-if="selectMonitorType == 1">
          <!-- 硬件资产 -->
          <el-form v-if="assertInfo.modelCode === 'networkdevice'
            || assertInfo.modelName === 'AC'
            || assertInfo.modelName === '物理机'
            || assertInfo.modelCode === 'storagedevice'
            || assertInfo.modelCode === 'securitydevice'" ref="monitorForm" :model="form1" :rules="rules1"
            label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.port')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.port0To65535')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.snmpVersion')" prop="snmpVersion"
              :rules="{ required: true, message: $t('common.pleaseSelectSnmpVersion'), trigger: ['blur', 'change'] }">
              <el-select v-model="form1.snmpVersion" :placeholder="$t('common.pleaseSelectSnmpVersion')" clearable>
                <el-option label="SNMP v2c" value="v2c" />
                <el-option label="SNMP v3" value="v3" />
              </el-select>
            </el-form-item>

            <el-form-item :label="$t('common.snmpGroup')" prop="snmpGroup" v-if="form1.snmpVersion === 'v2c'"
              :rules="{ required: true, message: $t('common.pleaseInputSnmpGroup'), max: 32, trigger: ['blur', 'change'] }">
              <el-input v-model="form1.snmpGroup" :placeholder="$t('common.pleaseInputSnmpGroup')" clearable />
            </el-form-item>

            <!-- v3 -->
            <el-form-item :label="$t('common.contextName')" prop="contextName" v-if="form1.snmpVersion === 'v3'"
              :rules="{ required: false, message: $t('common.pleaseInputContextName'), trigger: ['blur', 'change'] }">
              <el-input  v-model="form1.contextName" :placeholder="$t('common.pleaseInputContextName')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.securityName')" prop="securityName" v-if="form1.snmpVersion === 'v3'"
              :rules="{ required: true, message: $t('common.pleaseInputSecurityName'), max: 32, trigger: ['blur', 'change'] }">
              <el-input  v-model="form1.securityName" :placeholder="$t('common.pleaseInputSecurityName')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.securityLevel')" prop="securityLevel" v-if="form1.snmpVersion === 'v3'"
              :rules="{ required: true, message: $t('common.pleaseSelectSecurityLevel'), trigger: ['blur', 'change'] }">
              <el-select v-model="form1.securityLevel" :placeholder="$t('common.pleaseSelectSecurityLevel')" clearable>
                <el-option label="noAuthNoPriv" value="noAuthNoPriv" />
                <el-option label="authNoPriv" value="authNoPriv" />
                <el-option label="authPriv" value="authPriv" />
              </el-select>
            </el-form-item>

            <!-- authNoPriv -->
            <el-form-item :label="$t('common.authProtocol')" prop="authProtocol" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authNoPriv'"
              :rules="{ required: true, message: $t('common.pleaseSelectAuthProtocol'), trigger: ['blur', 'change'] }">
              <el-select v-model="form1.authProtocol" :placeholder="$t('common.pleaseSelectAuthProtocol')" clearable>
                <el-option label="MD5" value="MD5" />
                <el-option label="SHA" value="SHA" />
                <el-option label="SHA224" value="SHA224" />
                <el-option label="SHA256" value="SHA256" />
                <el-option label="SHA384" value="SHA384" />
                <el-option label="SHA512" value="SHA512" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.authPass')" prop="authPass" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authNoPriv'"
              :rules="[
                { required: true, message: $t('common.pleaseInputAuthPass'), trigger: ['blur', 'change'] },
                { min: 8, message: $t('common.authPassMinLength'), trigger: ['blur', 'change'] }
              ]">
              <el-input show-password  v-model="form1.authPass" :placeholder="$t('common.pleaseInputAtLeast8DigitsAuthPassword')" clearable />
            </el-form-item>

            <!-- authPriv -->
            <el-form-item :label="$t('common.authProtocol')" prop="authProtocol" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authPriv'"
              :rules="{ required: true, message: $t('common.pleaseSelectAuthProtocol'), trigger: ['blur', 'change'] }">
              <el-select v-model="form1.authProtocol" :placeholder="$t('common.pleaseSelectAuthProtocol')" clearable>
                <el-option label="MD5" value="MD5" />
                <el-option label="SHA" value="SHA" />
                <el-option label="SHA224" value="SHA224" />
                <el-option label="SHA256" value="SHA256" />
                <el-option label="SHA384" value="SHA384" />
                <el-option label="SHA512" value="SHA512" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.authPass')" prop="authPass" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authPriv'"
              :rules="[
                { required: true, message: $t('common.pleaseInputAuthPass'), trigger: ['blur', 'change'] },
                { min: 8, message: $t('common.authPassMinLength'), trigger: ['blur', 'change'] }
              ]">
              <el-input show-password v-model="form1.authPass" :placeholder="$t('common.pleaseInputAtLeast8DigitsAuthPassword')" clearable />
            </el-form-item>
            <el-form-item :label="$t('common.privacyProtocol')" prop="privacyProtocol" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authPriv'"
              :rules="{ required: true, message: $t('common.pleaseSelectPrivacyProtocol'), trigger: ['blur', 'change'] }">
              <el-select v-model="form1.privacyProtocol" :placeholder="$t('common.pleaseSelectPrivacyProtocol')" clearable>
                <el-option label="DES" value="DES" />
                <el-option label="AES128" value="AES128" />
                <el-option label="AES192" value="AES192" />
                <el-option label="AES256" value="AES256" />
                <el-option label="AES192C" value="AES192C" />
                <el-option label="AES256C" value="AES256C" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.privacyPass')" prop="privacyPass" v-if="form1.snmpVersion === 'v3' && form1.securityLevel === 'authPriv'"
            :rules="[
              { required: true, message: $t('common.pleaseInputPrivacyPass'), trigger: ['blur', 'change'] },
              { min: 8, message: $t('common.privacyPassMinLength'), trigger: ['blur', 'change'] }
            ]">
              <el-input show-password  v-model="form1.privacyPass" :placeholder="$t('common.pleaseInputAtLeast8DigitsPrivacyPassword')" clearable />
            </el-form-item>
            <!-- <el-form-item label="SNMP批量请求" prop="batchPostFlag">
            <el-switch v-model="form1.batchPostFlag" active-text="开启" inactive-text="关闭" />
          </el-form-item> -->

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
          <!-- 中间件 -->
          <!-- nginx -->
          <div class="top-tip" v-if="assertInfo.modelCode === 'middleware' && selectType === 'nginx'">
            <i class="el-icon-warning"></i>
            {{ $t('common.defaultGetMonitorDataThroughStubStatus') }}
          </div>
          <el-form v-if="assertInfo.modelCode === 'middleware' && selectType === 'nginx'" ref="monitorForm"
            :model="form1" :rules="rules1" label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.port')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.port0To65535')" clearable />
            </el-form-item>
            <el-form-item :label="$t('common.stubUrl')" prop="stubUrl" :rules="[
              { required: true, message: $t('common.pleaseInputStubUrl'), trigger: ['blur', 'change'] },
            ]">
              <template #label>
                <span>{{ $t('common.stubUrl') }}</span>
                <el-tooltip placement="top">

                  <div slot="content">
                    <div>{{ $t('common.configureStubStatusInNginxConf') }}</div>
                    <div>{{ $t('common.configurationExample') }}：</div>
                    <div style="padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; line-height: 1.6;">
                      server {<br>
                      &nbsp;&nbsp;listen 29092;<br>
                      &nbsp;&nbsp;location /status {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d32f2f;">stub_status on;</span><br>
                      &nbsp;&nbsp;}<br>
                      }<br>
                    </div>

                    <div>{{ $t('common.stubUrlIs') }}：<span style="color: #1890ff;">http://ip:29092/status</span></div>
                  </div>
                  <i class="el-icon-question" style="width: 24px;
                  line-height: 32px;
                 "></i>
                </el-tooltip>
              </template>

              <el-input v-model="form1.stubUrl" :placeholder="$t('common.pleaseInputStubUrl')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.vtsUrl')" prop="vts_url">
              <template #label>
                <span>{{ $t('common.vtsUrl') }}</span>
                <el-tooltip placement="top">
                  <div slot="content">
                    <div>{{ $t('common.configureVtsInNginxConf') }}</div>
                    <div>{{ $t('common.configurationExample') }}（{{ $t('common.ensureNginxVtsModuleInstalled') }}）：</div>
                    <div style="padding: 8px; border-radius: 4px; font-family: monospace; font-size: 12px; line-height: 1.6;">
                      http {<br>
                      &nbsp;&nbsp;...<br>
                      &nbsp;&nbsp;<span style="color: #d32f2f;">vhost_traffic_status_zone;</span> # {{ $t('common.mustAddEnableSharedMemory') }}<br>
                      &nbsp;&nbsp;<span style="color: #d32f2f;">vhost_traffic_status_filter_by_host on;</span><br>
                      &nbsp;&nbsp;server {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;listen 29091;<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;location /vts_url {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d32f2f;">vhost_traffic_status_display;</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #d32f2f;">vhost_traffic_status_display_format prometheus; </span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;}<br>
                      &nbsp;&nbsp;}<br>
                      &nbsp;&nbsp;...<br>
                      }
                    </div>
                    <div style="margin-top: 8px;">{{ $t('common.vtsUrlIs') }}：<span style="color: #1890ff;">http://ip:29091/vts_url</span></div>
                  </div>
                  <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
                </el-tooltip>
              </template>
              <el-input v-model="form1.vtsUrl" :placeholder="$t('common.pleaseInputVtsUrl')" clearable />
            </el-form-item>

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
          <!-- Kafka -->
          <div class="top-tip2" v-if="assertInfo.modelCode === 'middleware' && selectType === 'Kafka'">
            <div>
              <i class="el-icon-warning"></i>
              {{ $t('common.getKafkaMonitorDataThroughJmx') }}
            </div>
            <div>{{ $t('common.pleaseConfigure') }}
              <el-link href="http://121.229.159.15:58080/download/jolokia-agent-jvm-javaagent.jar" target="_blank"
                :underline="false">
                <span style="color: blue;cursor: pointer;">jolokia-agent-jvm-javaagent.jar</span>
              </el-link>
              {{ $t('common.pathToKafkaStartupParameters') }}:
            </div>
            <div>
              KAFKA_HEAP_OPTS="-javaagent:<span
                style="color: crimson;">${{ $t('common.jolokiaAgentPath') }}</span>/jolokia-agent-jvm-javaagent.jar=port=8081,host=0.0.0.0"
            </div>

          </div>
          <el-form v-if="assertInfo.modelCode === 'middleware' && selectType === 'Kafka'" ref="monitorForm"
            :model="form1" :rules="rules1" label-width="150px" class="monitor-form" style="margin-top: 20px">

            <el-form-item
              :label="$t('common.monitorAddress')"
              prop="monitorAddress"
              :rules="[
                { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
                {
                  // 核心：修改后的正则表达式，支持单个/多个带端口IP（英文逗号分隔）
                  pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?):\d+(\,((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?):\d+)*$/,
                  message: $t('common.pleaseInputValidMonitorAddress'),
                  trigger: ['blur', 'change']
                }
              ]"
            >
              <template #label>
                <span>{{ $t('common.monitorAddress') }}</span>
                <el-tooltip placement="top">
                  <template #content> <!-- 注意：Element UI 2.x+ 推荐使用 #content 替代 slot="content" -->
                    <div>
                      <div>{{ $t('common.singleAddress') }}：192.168.0.193:9094</div>
                      <div>{{ $t('common.multipleClusterAddresses') }}：192.168.0.193:9094,192.168.0.193:9094,192.168.0.195:9094</div>
                    </div>
                  </template>
                  <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
                </el-tooltip>
              </template>
              <el-input v-model="form1.monitorAddress" :placeholder="$t('common.pleaseInputMonitorAddress')" clearable />
            </el-form-item>


            <el-form-item :label="$t('common.securityAuthMechanism')" prop="scram" :rules="[
              { required: true, message: $t('common.pleaseSelectSecurityAuthenticationMechanism'), trigger: ['blur', 'change'] },
            ]">
              <el-select v-model="form1.scram" :placeholder="$t('common.pleaseSelectSecurityAuthenticationMechanism')" clearable>
                <el-option :label="$t('common.notInvolved')" :value="$t('common.notInvolved')" />
                <el-option label="plain" value="plain" />
                <el-option label="sha512" value="sha512" />
                <el-option label="sha256" value="sha256" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('common.account')" prop="userName"
              :rules="{ required: true, message: $t('common.pleaseInputAccount'), trigger: ['blur', 'change'] }" v-if="form1.scram !== $t('common.notInvolved')">
              <el-input v-model="form1.userName" :placeholder="$t('common.pleaseInputAccount')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.password')" prop="password"
              :rules="{ required: true, message: $t('common.pleaseInputPassword'), trigger: ['blur', 'change'] }" v-if="form1.scram !== $t('common.notInvolved')">
              <el-input v-model="form1.password" :placeholder="$t('common.pleaseInputPassword')" show-password clearable />
            </el-form-item>



            <el-form-item :label="$t('common.jmxAddress')" prop="jmxAddress"
              :rules="{ required: false, message: $t('common.pleaseInputJmxAddress'), trigger: ['blur', 'change'] }">
              <template #label>
                <span>{{ $t('common.jmxAddress') }}</span>
                <el-tooltip placement="top">

                  <div slot="content">
                    <div>
                      {{ $t('common.ensureJolokiaAgentAddedToKafkaStartupParameters') }}
                    </div>
                  </div>
                  <i class="el-icon-question" style="width: 24px;
                  line-height: 32px;
                 "></i>
                </el-tooltip>
              </template>
              <el-input v-model="form1.jmxAddress" :placeholder="$t('common.pleaseInputJmxAddressExample')"
                clearable />
            </el-form-item>

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>

          <!-- tomcat -->
          <div class="top-tip" v-if="assertInfo.modelCode === 'middleware' && selectType === 'tomcat'">
            <div>
              <i class="el-icon-warning"></i>
              {{ $t('common.getTomcatMonitorDataThroughJmx') }}
              <div>{{ $t('common.pleaseConfigure') }} <el-link href="http://121.229.159.15:58080/download/jolokia-agent-jvm-javaagent.jar"
                  target="_blank" :underline="false">
                  <span style="color: blue;cursor: pointer;">jolokia-agent-jvm-javaagent.jar</span>
                </el-link>{{ $t('common.pathToTomcatStartupParameters') }}，{{ $t('common.addInCatalinaSh') }}：
              </div>
              <div>JAVA_OPTS="$JAVA_OPTS-javaagent:<span
                  style="color: crimson;">${{ $t('common.jolokiaAgentPath') }}</span>/jolokia-agent-jvm-javaagent.jar=port=8081,host=0.0.0.0"
              </div>
              <div>{{ $t('common.configurationCompleted') }}，{{ $t('common.restartTomcat') }}</div>
            </div>
          </div>
          <el-form v-if="assertInfo.modelCode === 'middleware' && selectType === 'tomcat'" ref="monitorForm"
            :model="form1" :rules="rules1" label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.port')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.port0To65535')" clearable />
            </el-form-item>
            <el-form-item :label="$t('common.jmxAddress')" prop="jmxAddress"
              :rules="{ required: true, message: $t('common.pleaseInputJmxAddress'), trigger: ['blur', 'change'] }">
              <template #label>
                <span>{{ $t('common.jmxAddress') }}</span>
                <el-tooltip placement="top">

                  <div slot="content">
                    <div>{{ $t('common.ensureJolokiaAgentAddedToTomcatStartupParameters') }}</div>
                  </div>
                  <i class="el-icon-question" style="width: 24px;
                  line-height: 32px;
                 "></i>
                </el-tooltip>
              </template>
              <el-input v-model="form1.jmxAddress" :placeholder="$t('common.pleaseInputJmxAddressExample')"
                clearable />
            </el-form-item>

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
          <!-- 操作系统 -->
          <div class="top-tip2" v-if="assertInfo.modelCode === 'operatesystem' && selectType === 'windows'">
            <div>
              <i class="el-icon-warning"></i>
              {{ $t('common.manualMonitoringRequired') }}<span style="color: #1890ff; cursor: pointer;"  @click="openWinRMDialog">{{ $t('common.operationInstructions') }}</span>
            </div>


          </div>
          <el-form v-if="assertInfo.modelCode === 'operatesystem' && selectType === 'linux'" ref="monitorForm" :model="form1" :rules="rules1"
            label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>


            <el-form-item :label="$t('common.sshPort')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputSshPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.sshPort0To65535')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.account')" prop="userName"
              :rules="{ required: true, message: $t('common.pleaseInputRootAccount'), trigger: ['blur', 'change'] }">
              <el-input :disabled="true" v-model="form1.userName" :placeholder="$t('common.pleaseInputRootAccount')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.rootPassword')" prop="password"
              :rules="{ required: true, message: $t('common.pleaseInputRootPassword'), trigger: ['blur', 'change'] }">
              <el-input v-model="form1.password" :placeholder="$t('common.pleaseInputRootPassword')" show-password clearable />
            </el-form-item>


            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
          <el-form v-if="assertInfo.modelCode === 'operatesystem' && selectType === 'windows'" ref="monitorForm" :model="form1" :rules="rules1"
            label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>


            <el-form-item :label="$t('common.port')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <template #label>
                <span>{{ $t('common.port') }}</span>
                <el-tooltip placement="top">

                  <div slot="content">
                    <div>{{ $t('common.pleaseFillInWinrmPort') }}</div>
                      <div>winrm enumerate winrm/config/listener</div>
                  </div>
                  <i class="el-icon-question" style="width: 24px;
                  line-height: 32px;
                 "></i>
                </el-tooltip>
              </template>
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.port0To65535')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.user')" prop="userName"
              :rules="{ required: true, message: $t('common.pleaseInputUserName'), trigger: ['blur', 'change'] }">
              <el-input  v-model="form1.userName" :placeholder="$t('common.pleaseInputUserName')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.password')" prop="password"
              :rules="{ required: true, message: $t('common.pleaseInputPassword'), trigger: ['blur', 'change'] }">
              <el-input v-model="form1.password" :placeholder="$t('common.pleaseInputPassword')" show-password clearable />
            </el-form-item>


            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 数据库 -->
          <el-form v-if="assertInfo.modelCode === 'storagebase'" ref="monitorForm" :model="form1" :rules="rules1"
            label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.port')" prop="monitorPort" :rules="[
              { required: true, message: $t('common.pleaseInputPort'), trigger: ['blur', 'change'] },
              { pattern: /^(0|[1-9]\d{0,4})$/, message: $t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
            ]">
              <el-input v-model="form1.monitorPort" :placeholder="$t('common.port0To65535')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.oracleServiceName')" v-if="selectType === 'oracle'" prop="contextName"
              :rules="{ required: true, message: $t('common.pleaseInputOracleServiceName'), trigger: ['blur', 'change'] }">
              <el-input v-model="form1.contextName" :placeholder="$t('common.pleaseInputOracleServiceName')" clearable />
            </el-form-item>


            <el-form-item :label="$t('common.userName')" v-if="selectType === 'redis'" prop="userName"
              :rules="{ required: false, message: $t('common.pleaseInputUserName'), trigger: ['blur', 'change'] }">
              <el-input v-model="form1.userName" :placeholder="$t('common.pleaseInputUserName')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.userName')" v-else prop="userName"
              :rules="{ required: true, message: $t('common.pleaseInputUserName'), trigger: ['blur', 'change'] }">
              <el-input v-model="form1.userName" :placeholder="$t('common.pleaseInputUserName')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.password')" v-if="selectType === 'redis'" prop="password"
              :rules="{ required: false, message: $t('common.pleaseInputPassword'), trigger: ['blur', 'change'] }">
              <template #label>
                <span>{{ $t('common.password') }}</span>
                <el-tooltip placement="top">
                  <div slot="content">
                    <div>{{ $t('common.ifPasswordSetPleaseFillIn') }}</div>
                  </div>
                  <i class="el-icon-question" style="width: 24px; line-height: 32px;"></i>
                </el-tooltip>
              </template>
              <el-input show-password v-model="form1.password" :placeholder="$t('common.pleaseInputPassword')" clearable />
            </el-form-item>

            <el-form-item :label="$t('common.password')" v-else prop="password"
              :rules="{ required: true, message: $t('common.pleaseInputPassword'), trigger: ['blur', 'change'] }">
              <el-input show-password v-model="form1.password" :placeholder="$t('common.pleaseInputPassword')" clearable />
            </el-form-item>

            <!-- <el-form-item label="主机端口" prop="hostPort" :rules="[
            { required: false, message: this.$t('common.pleaseEnterHostPort'), trigger: ['blur', 'change'] },
            { pattern: /^(0|[1-9]\d{0,4})$/, message: this.$t('common.portMustBeIntegerBetween0And65535'), trigger: ['blur', 'change'] }
          ]">
            <el-input v-model="form1.hostPort" placeholder="端口（0-65535）" clearable />
          </el-form-item>
          <el-form-item label="主机用户名" prop="hostUser">
            <el-input v-model="form1.hostUser" placeholder="请输入主机用户名" clearable />
          </el-form-item>

          <el-form-item label="主机密码" prop="hostPass">
            <el-input show-password v-model="form1.hostPass" placeholder="请输入主机密码" clearable />
          </el-form-item> -->

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
          <!-- docker -->
          <div class="top-tip" v-if="assertInfo.modelCode === 'docker'">
            <div>
              <i class="el-icon-warning"></i>
              {{ $t('common.pleaseCompleteOperatingSystemMonitoringFirst') }}
            </div>
          </div>
          <el-form v-if="assertInfo.modelCode === 'docker'" ref="monitorForm" :model="form1" :rules="rules1"
            label-width="150px" class="monitor-form" style="margin-top: 20px">
            <el-form-item :label="$t('common.operatingSystem')" prop="hostAssetId" :rules="[
              { required: true, message: $t('common.pleaseSelectOperatingSystem'), trigger: ['blur', 'change'] },
            ]">
              <el-select v-model="form1.hostAssetId" :placeholder="$t('common.pleaseSelectOperatingSystem')" clearable filterable>
                <el-option v-for="item in hostAssetIdList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>



          </el-form>
        </div>
        <div v-else>
          <div class="top-tip2" >
            <div>
              <i class="el-icon-warning"></i>
              {{ $t('common.rtspAddressRequired') }}<span style="color: #1890ff; cursor: pointer;"  @click="openRtspDialog">{{ $t('common.operationInstructions') }}</span>
            </div>
          </div>
          <el-form ref="monitorForm" :model="form1" :rules="rules1" label-width="150px" class="monitor-form"
            style="margin-top: 20px">
            <el-form-item :label="$t('common.ipAddress')" prop="monitorIp" :rules="[
              { required: true, message: $t('common.pleaseInputMonitorAddress'), trigger: ['blur', 'change'] },
              {
                pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
                message: $t('common.pleaseInputValidIpAddress'),
                trigger: ['blur', 'change']
              }
            ]">
              <el-input v-model="form1.monitorIp" :placeholder="$t('common.pleaseInputIpAddress')" clearable />
            </el-form-item>
            <el-form-item v-if="assertInfo.modelCode === 'terminaldevice'" :label="$t('common.rtspAddress')" prop="" :rules="[
              { required: false, message: $t('common.pleaseInputRtspAddress'), trigger: ['blur', 'change'] },

            ]">
              <el-input v-model="form1.videoRtspUrl" :placeholder="$t('common.pleaseInputRtspAddress')" clearable />
            </el-form-item>

            <el-form-item>
              <el-button :loading="buttonLoading" @click="handleTest"
                style="background: orange; color: #fff; border: none">
                {{ $t('common.testConnectivity') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div style="display: flex; align-items: center;justify-content: center;">
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('common.confirm') }}</el-button>
      <el-button @click="handleClose" style="margin-left: 8px">{{ $t('common.cancel') }}</el-button>
    </div>
    <div class="errorInfoClass" v-if="activeTab == 'file' && errorInfoText && assetTypeName == 'Hardware Asset'"
      style="background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 6px; padding: 16px;margin-left: 10px; margin-top: 16px; color: #262626; line-height: 1.8;">
      <div style="font-weight: 500; margin-bottom: 8px;"><i class="el-icon-warning-outline" style="color: red;"></i>
        {{ $t('common.connectionTestFailed') }}
      </div>
      <div>{{ $t('common.checkParameterCorrectness') }}</div>
      <div>{{ $t('common.manualTestConnectivity') }}</div>
      <div style="margin: 0px 10px;background: #eee;font-size: 12px;color: 666;">
        <div>{{ $t('common.executeInZhihuInstallationDirectory') }}</div>
        <div v-if="form.monitorMethod === 2">{{ $t('common.ping3TimesWith5SecondTimeout') }}</div>
        <div v-if="form.monitorMethod === 2">ping -c 3 -w 5 {{ $t('common.ipAddress') }}</div>
        <div v-if="form1.snmpVersion === 'v2c' && form.monitorMethod !== 2">sh pkg/tools/envCheck.sh snmpwalk -v 2c -c {{ $t('common.communityName') }} {{ $t('common.ipAddress') }}</div>
        <div v-if="form1.snmpVersion === 'v3' && form.monitorMethod !== 2">sh pkg/tools/envCheck.sh snmpwalk -v 3 -l {{ $t('common.authenticationMethod') }} -a {{ $t('common.encryptionProtocol') }} -A {{ $t('common.password') }} -u {{ $t('common.name') }} {{ $t('common.ipAddress') }}</div>
        <div>{{ $t('common.example') }}：</div>
        <div v-if="form.monitorMethod === 2">ping  -c 3 -w 5 192.168.56.18</div>
        <div v-if="form.monitorMethod === 2">{{ $t('common.pingTestResultExplanation') }}</div>
        <div v-if="form1.snmpVersion === 'v2c' && form.monitorMethod !== 2">sh pkg/tools/envCheck.sh snmpwalk -v 2c -c admin@123 192.168.56.10</div>
        <div v-if="form1.snmpVersion === 'v3' && form.monitorMethod !== 2">sh pkg/tools/envCheck.sh snmpwalk -v 3 -l authNoPriv -a SHA -A admin@123 -u zabbix 192.168.56.18</div>
      </div>
      <div style="margin-top: 8px; font-size: 14px; color: #595959;">
        {{ $t('common.referToOfficialDocumentation') }}<a>{{ $t('common.zhihuNetworkConnectivityTestOperationGuide') }}</a>，{{ $t('common.ifProblemPersistsContactSupport') }}。
      </div>
    </div>
    <div class="errorInfoClass" v-if="activeTab == 'file' && errorInfoText && assetTypeName == 'Software Asset'"
      style="background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 6px; padding: 16px;margin-left: 10px; margin-top: 16px; color: #262626; line-height: 1.8;">
      <div style="font-weight: 500; margin-bottom: 8px;"><i class="el-icon-warning-outline" style="color: red;"></i>
        {{ $t('common.connectionTestFailed') }}
      </div>
      <div>{{ $t('common.checkParameterCorrectness') }}</div>
      <div>{{ $t('common.manualTestConnectivity') }}</div>
      <div style="margin: 0px 10px;background: #eee;font-size: 12px;color: 666;">
        <div>{{ $t('common.executeInZhihuInstallationDirectory') }}</div>
        <div>sh pkg/tools/envCheck.sh telnet  {{ $t('common.ipAddress') }} {{ $t('common.portNumber') }}</div>
        <div>{{ $t('common.example') }}：</div>
        <div>sh pkg/tools/envCheck.sh telnet 192.168.0.233 58080</div>
        <div></div>
      </div>
      <div style="margin-top: 8px; font-size: 14px; color: #595959;">
        {{ $t('common.referToOfficialDocumentation') }}<a>{{ $t('common.zhihuNetworkConnectivityTestOperationGuide') }}</a>，{{ $t('common.ifProblemPersistsContactSupport') }}。
      </div>
    </div>
  <!-- 新增：WinRM操作说明弹窗 -->
    <el-dialog
      :title="$t('common.winrmOperationGuide')"
      :visible.sync="winRMDialogVisible"
      width="600px"
      append-to-body
    >
      <div class="winrm-tip-content">
        <h4 style="margin-bottom: 12px;">{{ $t('common.method1ManualStartWinrm') }}</h4>
        <p>{{ $t('common.openCommandPromptAsAdministrator') }}</p>
        <div class="code-block">winrm quickconfig</div>
        <p>{{ $t('common.followPromptsToExecute') }} <span style="color: #f56c6c;">y</span></p>
        <img style="width: 100%; height: 160px" :src="operatesystem1Image" alt="" />
        <p style="margin-top: 16px;">{{ $t('common.openCommandPromptAsAdministrator') }}</p>
        <div class="code-block">Get-Service WinRM</div>
        <img style="width: 100%; height: 160px" src="../../../../assets/zhihu/operatesystem2.png" alt="" />
        <p style="margin-top: 12px;">{{ $t('common.statusRunningMeansServiceStarted') }}</p>
        <div class="code-block">Start-Service WinRM</div>
        <div class="code-block">Set-Service WinRM -StartupType Automatic  # {{ $t('common.setToStartAutomaticallyOptional') }}</div>
      </div>
    </el-dialog>

    <el-dialog
      :title="$t('common.howToGetRtspAddress')"
      :visible.sync="rtspDialogVisible"
      width="700px"
      append-to-body
    >
      <div class="winrm-tip-content">
        <img style="width: 100%" :src="showRtspImg()"/>
      </div>
    </el-dialog>
  </el-drawer>
</template>

<script>
import {
  listSimpleUsers,
  createAssetInfo,
  updateAssetInfo,
  getAssetInfo,
  getAssetModel,
  getAssetTypeList,
  getAssetModelDetail,
  getAssetInfoPage
} from "@/api/resource";
import { tileLayer } from 'leaflet';
import { testSnmp, getSpuGroupByBrand } from "@/api/monitor/task";
export default {
  name: 'DeviceForm',
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    initialData: { type: Object, default: () => ({}) }, // 编辑模式初始数据
    assertInfo: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      rtspImgSrc: require('@/assets/zhihu/rtsp.jpg'),
      monitorTypeList1: [
        {
            value: 0,
            label: this.$t('common.notMonitored')
        },
        {
            value: 1,
            label: "SNMP"
        },
        {
            value: 2,
            label: "PING"
        },
      ],
      monitorTypeList2:[
        {
            value: 0,
            label: this.$t('common.notMonitored')
        },
        {
            value: 1,
            label: this.$t('common.monitored')
        },
      ],
      monitorTypeList3: [
        {
          value: 0,
          label: this.$t('common.notMonitored')
        },
        {
          value: 2,
          label: "PING"
        },
      ],
      monitorTypeList4: [
        {
          value: 0,
          label: this.$t('common.notMonitored')
        },
      ],
      winRMDialogVisible: false,
      rtspDialogVisible: false,
      assetTypeName: '',
      originHasMonitor: ['networkdevice', 'storagedevice','storagebase', 'operatesystem', 'securitydevice', 'middleware', 'docker','terminaldevice'],
      hasMonitor: ['networkdevice', 'storagedevice', 'storagebase', 'operatesystem', 'securitydevice', 'middleware', 'docker','terminaldevice'],
      buttonLoading: false,
      submitLoading: false,
      isEditAble: false, // 控制表单是否禁用（可扩展为"查看模式"）
      activeTab: 'manual', // 当前激活的Tab
      fileList: [], // 上传文件列表
      hostAssetIdList: [], //操作系统list
      // 1. 资产信息表单模型（Element UI 需显式声明，非Form实例）
      form: {
        name: '', // 设备名称（基础字段）
        group: '默认根群组', // 所属群组（默认值）
        manufacturer: '', // 制造商
        agent: 'none', // 代理类型（默认无）
        expireTime: null, // 过期时间
        location: '', // 设备位置
        monitorMethod: 0,
        // 动态字段将通过 $set 追加：${item.id}_模型
      },

      // 2. 监控信息表单模型
      form1: {
        monitorIp: '',
        monitorPort: null,
        snmpVersion: '',
        snmpGroup: '',
        batchPostFlag: '',
        // hostPort: '',
        // hostUser: '',
        // hostPass: ''
      },
      originForm1: {
        monitorIp: '',
        monitorPort: null,
        snmpVersion: '',
        snmpGroup: '',
        batchPostFlag: '',
        // hostPort: '',
        // hostUser: '',
        // hostPass: ''
      },

      // 制造商下拉选项
      manufacturerOptions: [
        { label: this.$t('common.huawei'), value: '华为' },
        { label: 'TP-Link', value: 'TP-Link' },
        { label: this.$t('common.ruijie'), value: '锐捷' },
        { label: this.$t('common.h3c'), value: '新华三' },
        { label: 'Cisco', value: '思科' }
      ],

      // 3. 表单校验规则（基础规则 + 动态规则）
      rules: {
        name: [{ required: true, message: this.$t('common.pleaseInputDeviceName'), trigger: 'blur' }],
        manufacturer: [{ required: true, message: this.$t('common.pleaseSelectManufacturer'), trigger: 'change' }],
        group: [{ required: true, message: this.$t('common.pleaseInputGroup'), trigger: 'blur' }],
        agent: [{ required: true, message: this.$t('common.pleaseSelectAgentType'), trigger: 'change' }],
        monitorMethod: [
          { required: true, message: this.$t('common.pleaseSelectMonitorMethod'), trigger: ['blur', 'change'] }
        ]
      },

      // 4. 监控表单校验规则（优化monitorPort规则：0-65535整数）
      rules1: {
        // monitorIp: [{ required: true, message: this.$t('common.pleaseInputMonitorIp'), trigger: 'blur' }],
        monitorPort: [
          { required: true, message: this.$t('common.pleaseInputMonitorPort'), trigger: 'blur' },
          { pattern: /^(0|[1-9]\d{0,4})$/, message: this.$t('common.portMustBeInteger'), trigger: 'blur' }
        ],
        snmpVersion: [{ required: true, message: this.$t('common.pleaseSelectSnmpVersion'), trigger: 'change' }],
        snmpCommunity: [{ required: true, message: this.$t('common.pleaseInputSnmpCommunity'), trigger: 'blur' }],
        nginxName: [{ required: true, message: this.$t('common.pleaseInputNginxInstanceName'), trigger: 'blur' }],
        stub_url: [{ required: true, message: 'Please input stub_url', trigger: 'blur' }],
      },

      itemsList: [], // 动态字段配置列表（从接口获取）
      formLoad: false,
      // modelId: undefined, //模型id
      // assetTypeId: undefined, //资产类型id
      assetName: '',
      selectKeyList: [],
      selectObj: {},
      selectSpuList: [],
      selectType: 'Kafka',
      selectTypeNumber: undefined,
      errorInfoText: false,
      showBrandTip: false, // 控制厂家提示显示
      showSpuTip: false, // 控制型号提示显示
      selectMonitorType: '1'
    };
  },
  computed: {
    // 抽屉标题（根据编辑/新增模式切换）
    title() {
      return this.isEdit ? this.$t('common.edit') + ' ' + this.assertInfo.modelName : this.$t('common.create') + ' ' + this.assertInfo.modelName;
    },
    // 制造商下拉选项
    manufacturerOptions() {
      return [
        { label: this.$t('common.huawei'), value: '华为' },
        { label: 'TP-Link', value: 'TP-Link' },
        { label: this.$t('common.ruijie'), value: '锐捷' },
        { label: this.$t('common.h3c'), value: '新华三' },
        { label: 'Cisco', value: '思科' }
      ];
    },
    // 硬件资产和软件资产的国际化配置
    hardwareAsset() {
      return this.$t('common.hardwareAsset');
    },
    softwareAsset() {
      return this.$t('common.softwareAsset');
    },
    // 根据语言返回对应的WinRM快速配置图片路径
    operatesystem1Image() {
      return this.$i18n.locale === 'zh' ? require('../../../../assets/zhihu/operatesystem1.png') : require('../../../../assets/zhihu/operatesystem1_en.png');
    },
  },
  watch: {
    // 抽屉显示/隐藏时的初始化/重置逻辑
    visible(val) {
      if (val) {
        this.$nextTick(() => { // 确保DOM渲染完成后操作表单
          this.getSpuGroupByBrandList()
          this.getHostList()
          if (this.isEdit) {
            this.changeMonitor(this.assertInfo.monitorMethod);
            this.changeModel(this.assertInfo.modelId);
            // this.initEditData(); // 编辑模式：填充初始数据
          } else {
            this.changeMonitor(0);
            this.changeModel(this.assertInfo.modelId); // 新增模式：加载默认模型（222为默认模型ID）
          }

        });
      } else {
        this.resetForms(); // 关闭抽屉：重置所有表单
        this.fileList = []; // 清空上传文件
      }
    }
  },
  methods: {
    showRtspImg() {
      let language = localStorage.getItem('accept-language');
      if (language) {
        if (language === 'zh-CN') {
          return require('@/assets/zhihu/rtsp.jpg');
        } else if (language === 'en-US') {
          return require('@/assets/zhihu/rtsp_en.jpg');
        } else {
          return require('@/assets/zhihu/rtsp.jpg');
        }
      }
    },
    openWinRMDialog() {
      this.winRMDialogVisible = true;
    },
    openRtspDialog() {
      this.rtspDialogVisible = true;
    },
    changeMonitor(value) {
      // 不监控 0  snmp 1  ping 2
      this.$nextTick(() => {
        if (value == 0) {
          this.hasMonitor = []
          this.selectMonitorType = 0
          this.form1 = {}
        } else if (value == 1) {
          this.hasMonitor = JSON.parse(JSON.stringify(this.originHasMonitor))
          this.selectMonitorType = 1
          if(this.assertInfo.modelCode === 'operatesystem' && this.selectType === 'windows'){
            // this.form1.monitorPort = 5985
            this.$set(this.form1, 'monitorPort', 5985);
          }
          if(this.assertInfo.modelCode === 'operatesystem' && this.selectType === 'linux'){
            // this.form1.userName = 'root'
            this.$set(this.form1, 'userName', 'root');
            // this.form1.monitorPort = null;
            this.$set(this.form1, 'monitorPort', '');
          }
        } else if (value == 2) {
          this.hasMonitor = JSON.parse(JSON.stringify(this.originHasMonitor))
          this.selectMonitorType = 2
        }

      });

    },
    getSpuGroupByBrandList() {
      getSpuGroupByBrand({ modelCode: this.assertInfo.modelCode }).then((res) => {
        this.selectObj = res.data
        this.selectKeyList = Object.entries(this.selectObj).map(item => {
          return {
            label: item[0],
            value: item[1][0]?.brandKey || ''
          }
        })

      })
    },
    getHostList() {
      let params = {
        "pageNo": 1,
        "pageSize": 10,
        "isManaged": null,
        "modelId": 195,
        "onlineStatusList": [1, 2],
        "status": 1,
        "modelCode": "operatesystem",
        "isMonitorAble": true,
        "conditions":[{"compareType":"like","itemValue":"2","itemCode":"asset_optional_operate_system_type"}]
      };

      getAssetInfoPage(params).then((res) => {
        let hostAssetIdList = res?.data?.list || []
        this.hostAssetIdList = hostAssetIdList.map(item => {
          return {
            label: item.assetName,
            value: item.id
          }
        })
      });
    },
    getDetail(id) {
      getAssetInfo({ id: id }).then((res) => {
        this.form = res.data;
        let items = res.data.assetAttribute;
        if(items.cmdbBrand){
          this.selectSpu(items.cmdbBrand)
        }

        if (items?.asset_optional_middleware_type) {
          if (items?.asset_optional_middleware_type == 5) {
            this.selectType = 'Kafka'
            this.selectTypeNumber = 5
          } else if (items?.asset_optional_middleware_type == 6) {
            this.selectType = 'nginx'
            this.selectTypeNumber = 6
          } else {
            this.selectType = 'tomcat'
            this.selectTypeNumber = 8
          }
        }

        if (items?.asset_optional_operate_system_type) {
          if (items?.asset_optional_operate_system_type == 2) {
            this.selectType = 'linux'
            this.selectTypeNumber = 2
          } else if (items?.asset_optional_operate_system_type == 10) {
            this.selectType = 'windows'
            this.selectTypeNumber = 10
          }
        }
        if (items?.asset_optional_databaeType) {

          if (items.asset_optional_databaeType == 4) {
            this.selectType = 'redis'
            this.selectTypeNumber = 4
          } else if (items.asset_optional_databaeType == 3) {
            this.selectType = 'elasticSearch'
            this.selectTypeNumber = 3
          } else if (items.asset_optional_databaeType == 9) {
            this.selectType = '达梦'
            this.selectTypeNumber = 9
          } else if (items.asset_optional_databaeType == 11) {
            this.selectType = 'oracle'
            this.selectTypeNumber = 11
          } else {
            this.selectType = 'mysql'
            this.selectTypeNumber = 1
          }
        }

        let objArray = Object.entries(items)
        if (objArray && objArray.length > 0) {
          this.itemsList.forEach(item => {
            objArray.forEach(childItem => {
              if (childItem[0] === item.itemCode) {
                this.$set(this.form, item.id + "_模型", childItem[1]);
                this.$set(this.form, item.id + "_" + item.id + "_主键", item.id);
                this.$set(this.form, item.id + "_isEditAble", item.isEditAble);
              }
            })
          })
        }
        this.changeMonitor(res.data.monitorMethod)
        let assetSnmpResp = res.data.assetSnmpResp || this.originForm1
        if (assetSnmpResp?.batchPostFlag == 0) {
          assetSnmpResp.batchPostFlag = false
        } else {
          assetSnmpResp.batchPostFlag = true
        }
        if (assetSnmpResp?.monitorPort === '' || assetSnmpResp?.monitorPort === '0') {
          assetSnmpResp.monitorPort = null
        }
        setTimeout(() => {
           this.form1 = JSON.parse(JSON.stringify(assetSnmpResp))
        }, 200);

        // console.log("items===", this.items, this.form);
        // this.getAssetModel(this.assetTypeId);
        // this.$nextTick(() => {
        //   this.$refs.form.clearValidate();
        // });

      });
    },
    // 关闭抽屉：向父组件emit关闭事件
    handleClose() {
      this.clearDynamicFields()
      this.showBrandTip = false
      this.showSpuTip = false
      this.$emit('close')
    },
    getMonitorType(modelCode) {
      let monitorType = 0
      switch (modelCode) {
        case 'storagebase': //数据库
          monitorType = 2
          break;
        case 'networkdevice': //网络设备
          monitorType = 1
          break;
        default:
          break;
      }
      return monitorType
    },
    getMonitorForm(modelCode) {
      let form = {}
      switch (modelCode) {
        case 'storagebase': //数据库
          form = {
            userName: this.form1.userName || undefined,
            password: this.form1.password || undefined,
            monitorIp: this.form1.monitorIp || undefined,
            monitorPort: this.form1.monitorPort || undefined,
            contextName:  this.form1.contextName || undefined,
            // hostPort: this.form1.hostPort || undefined,
            // hostUser: this.form1.hostUser || undefined,
            // hostPass: this.form1.hostPass || undefined,
          }
          break;
        case 'networkdevice': //网络设备
          form = this.activeSnmpFields()
          // form = {
          //   monitorIp: this.form1.monitorIp || undefined,
          //   monitorPort: this.form1.monitorPort || undefined,
          //   snmpVersion: this.form1.snmpVersion || undefined,
          //   snmpGroup: this.form1.snmpGroup || undefined,
          //   batchPostFlag: this.form1.batchPostFlag ? 1 : 0,
          //   contextName: this.form1.contextName || undefined,
          //   securityName: this.form1.securityName || undefined,
          //   securityLevel: this.form1.securityLevel || undefined,
          //   authProtocol: this.form1.authProtocol || undefined,
          //   authPass: this.form1.authPass || undefined,
          //   privacyProtocol: this.form1.privacyProtocol || undefined,
          //   privacyPass: this.form1.privacyPass || undefined,
          // }
          break;
          case 'storagedevice': //存储设备
          form = this.activeSnmpFields()
          // form = {
          //   monitorIp: this.form1.monitorIp || undefined,
          //   monitorPort: this.form1.monitorPort || undefined,
          //   snmpVersion: this.form1.snmpVersion || undefined,
          //   snmpGroup: this.form1.snmpGroup || undefined,
          //   batchPostFlag: this.form1.batchPostFlag ? 1 : 0,
          //   contextName: this.form1.contextName || undefined,
          //   securityName: this.form1.securityName || undefined,
          //   securityLevel: this.form1.securityLevel || undefined,
          //   authProtocol: this.form1.authProtocol || undefined,
          //   authPass: this.form1.authPass || undefined,
          //   privacyProtocol: this.form1.privacyProtocol || undefined,
          //   privacyPass: this.form1.privacyPass || undefined,
          // }
          break;
        case 'terminaldevice': //终端设备
          form = {
            monitorIp: this.form1.monitorIp || undefined,
            videoDevId: this.form1.videoDevId || undefined,
            videoChannelId: this.form1.videoChannelId || undefined,
            videoRtspUrl: this.form1.videoRtspUrl || undefined,
            videoCustomerAccount: this.form1.videoCustomerAccount || undefined,
          }
          break;
        case 'securitydevice': //安全设备
          form = this.activeSnmpFields()
          // form = {
          //   monitorIp: this.form1.monitorIp || undefined,
          //   monitorPort: this.form1.monitorPort || undefined,
          //   snmpVersion: this.form1.snmpVersion || undefined,
          //   snmpGroup: this.form1.snmpGroup || undefined,
          //   batchPostFlag: this.form1.batchPostFlag ? 1 : 0,
          //   contextName: this.form1.contextName || undefined,
          //   securityName: this.form1.securityName || undefined,
          //   securityLevel: this.form1.securityLevel || undefined,
          //   authProtocol: this.form1.authProtocol || undefined,
          //   authPass: this.form1.authPass || undefined,
          //   privacyProtocol: this.form1.privacyProtocol || undefined,
          //   privacyPass: this.form1.privacyPass || undefined,
          // }
          break;
        case 'operatesystem': //操作系统
          form = {
            monitorIp: this.form1.monitorIp || undefined,
            monitorPort: this.form1.monitorPort || undefined,
            userName: this.form1.userName || undefined,
            password: this.form1.password || undefined,
          }
          break;
        case 'middleware': //中间件
          if (this.selectType === 'nginx' || this.selectType === 'Kafka') {
            form = {
              monitorIp: this.form1.monitorIp || undefined,
              monitorPort: this.form1.monitorPort || undefined,
              monitorAddress: this.form1.monitorAddress || undefined,
              userName: this.form1.userName || undefined,
              password: this.form1.password || undefined,
              stubUrl: this.form1.stubUrl || undefined,
              vtsUrl: this.form1.vtsUrl || undefined,
              scram: this.form1.scram || undefined,
              jmxAddress: this.form1.jmxAddress || undefined,
            }
          } else {
            form = {
              monitorIp: this.form1.monitorIp || undefined,
              monitorPort: this.form1.monitorPort || undefined,
              jmxAddress: this.form1.jmxAddress || undefined,
            }
          }

          break;
        case 'docker': //docker
          form = {
            hostAssetId: this.form1.hostAssetId || undefined,
          }
        default:
          break;
      }
      return form
    },
    activeSnmpFields() {
      const fields = {
        monitorIp: this.form1.monitorIp || undefined,
        monitorPort: this.form1.monitorPort || undefined,
        snmpVersion: this.form1.snmpVersion || undefined,
        batchPostFlag: this.form1.batchPostFlag ? 1 : 0
      };

      if (this.form1.snmpVersion === 'v2c') {
        fields.snmpGroup = this.form1.snmpGroup || undefined;
      } else if (this.form1.snmpVersion === 'v3') {
        fields.contextName = this.form1.contextName || undefined;
        fields.securityName = this.form1.securityName || undefined;
        fields.securityLevel = this.form1.securityLevel || undefined;

        if (this.form1.securityLevel === 'authNoPriv') {
          fields.authProtocol = this.form1.authProtocol || undefined;
          fields.authPass = this.form1.authPass || undefined;
        } else if (this.form1.securityLevel === 'authPriv') {
          fields.authProtocol = this.form1.authProtocol || undefined;
          fields.authPass = this.form1.authPass || undefined;
          fields.privacyProtocol = this.form1.privacyProtocol || undefined;
          fields.privacyPass = this.form1.privacyPass || undefined;
        }
      }

      return fields;
  },
    changeType(val) {
      console.log(val)
      switch (val) {
        case '1':
          this.selectType = 'mysql'
          this.selectTypeNumber = 1
          break;
        case '11':
          this.selectType = 'oracle'
          this.selectTypeNumber = 11
         break;
        case '2':
          this.selectType = 'linux'
          this.selectTypeNumber = 2
          this.$set(this.form1, 'userName', 'root');
          this.$set(this.form1, 'monitorPort', '');
          // this.form1.userName = 'root'
          // this.form1.monitorPort = null;
          break;
        case '9':
          this.selectType = '达梦'
          this.selectTypeNumber = 9
          break;
        case '10':
          this.selectType = 'windows'
          this.selectTypeNumber = 10
          // this.form1.userName = ''
          // this.form1.monitorPort = 5985;
          this.$set(this.form1, 'userName', '');
          this.$set(this.form1, 'monitorPort', 5985);
          this.isEditAble = false;
          break;
        case '3':
          this.selectType = 'elasticSearch'
          this.selectTypeNumber = 3
          break;
        case '4':
          this.selectType = 'redis'
          this.selectTypeNumber = 4
          break;
        case '6':
          this.selectType = 'nginx'
          this.selectTypeNumber = 6
          this.form1 = {
            monitorIp: undefined,
            monitorPort: undefined,
            stubUrl: undefined,
            vtsUrl: undefined,
          }
          break;
        case '5':
          this.selectType = 'Kafka'
          this.selectTypeNumber = 5
          this.form1 = {
            monitorIp: undefined,
            monitorPort: undefined,
            monitorAddress: undefined,
            userName: undefined,
            password: undefined,
            scram: undefined,
            jmxAddress: undefined,
          }
          break;
        case '8':  //tomcat
          this.selectType = 'tomcat'
          this.selectTypeNumber = 8
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
    handleSubmit() {
      this.$refs.assetForm.validate((valid) => {
        if (valid) {
          this.formLoad = true;
          this.submitLoading = true
          let items = [];
          let newItems = [];
          for (let key in this.form) {

            console.log(key.indexOf("_模型"));
            if (key.indexOf("_模型") > 0) {
              items.push({
                itemId: Number(key.split("_模型")[0]), // 模型ID
                itemValue: this.form[key] // 模型名称
              });
            }

            if (key.indexOf("_主键") > 0 && this.assertInfo.modelId) {
              const index = key.split("_")[0];
              items.forEach((item) => {
                if (item.itemId == index) {
                  newItems.push({
                    id: Number(key.split("_")[1]) || undefined, // 模型ID
                    itemId: item.itemId, // 模型ID
                    itemValue: item.itemValue // 模型名称
                  });
                }
              });
            }
          }


          console.log("ne==", newItems);
          this.form.items = newItems.length > 0 && this.assertInfo.modelId == this.form.modelId ? newItems : items;
          this.itemsList.forEach(item => {
            this.form.items.forEach(iItem => {
              if (iItem.itemId == item.id) {
                iItem.itemCode = item.itemCode
              }
            })
          })
          let assertName = ''
          this.form.items.forEach(item => {
            if (item.itemCode === 'name') {
              assertName = item.itemValue
            }
          })
          let assetSnmp = this.getMonitorForm(this.assertInfo.modelCode)
          const params = {
            id: this.form.id ? this.form.id : undefined, // id
            assetTypeId: this.assertInfo.assetTypeId, // 资产类型ID
            modelId: this.assertInfo.modelId, // 模型ID
            modelCode: this.assertInfo.modelCode, //模型标识
            monitorMethod: this.form.monitorMethod || undefined, // 监控方式
            items: this.assertInfo.modelId ? this.form.items : [], // 模型列表
            assetSnmp: {
              ...assetSnmp,
              // monitorType: this.getMonitorType(this.assertInfo.modelCode),
              // pmMonitorType: this.assertInfo.modelCode === 'storagebase'? 1: ''
            }
          };
          console.log(params);
          if (!this.form.id) {
            createAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.submitLoading = false
                  //  Message.success("新增成功");
                  this.handleClose();
                  this.$emit("createDevice");
                }
              })
              .catch(() => {
                this.formLoad = false;
                this.submitLoading = false
              });
          } else {
            updateAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.submitLoading = false
                  // Message.success(this.title + "成功");
                  this.handleClose();
                  this.$emit("updateDevice");
                }
              })
              .catch(() => {
                this.formLoad = false;
                this.submitLoading = false
              });
          }
        }
      });
    },


    // 动态字段值变更（确保响应式：Element UI 普通对象需用 $set）
    operationChange(field, value) {
      this.$set(this.form, field, value);
    },

    // 加载模型字段配置（新增/编辑通用）
    changeModel(modelId) {
      if (!modelId) {
        this.itemsList = [];
        return;
      }

      // 1. 清空现有动态字段和规则
      this.clearDynamicFields();

      // 2. 接口获取模型字段配置
      getAssetModelDetail({ id: modelId })
        .then((res) => {
          this.assetTypeName = res.data.assetTypeName || '';
          if (res.data?.items && res.data.items.length) {
            this.itemsList = res.data.items;
            this.generateDynamicRules(); // 生成动态校验规则

            // 编辑模式：填充动态字段初始值
            if (this.isEdit) {
              this.getDetail(this.initialData.id);
            } else {
              // 新增模式：初始化动态字段为空（避免v-model绑定警告）
              this.itemsList.forEach(item => {
                this.$set(this.form, `${item.id}_模型`, '');
              });

              this.itemsList.forEach(item => {
                if (this.$route.query && this.$route.query?.isFrom === 'product') {
                  if (item.itemCode === 'ip') {
                    this.$set(this.form, `${item.id}_模型`, this.$route.query?.ip || '');
                  }
                  if (item.itemCode === 'port') {
                    this.$set(this.form, `${item.id}_模型`, this.$route.query?.port || '');
                  }

                }

              });

            }
          } else {
            this.$message.error(this.$t('common.modelFieldLoadingFailed'));
          }
        })
        .catch(() => {
          this.$message.error(this.$t('common.modelFieldRequestError'));
        });
    },

    // 生成动态字段校验规则（适配Element UI规则格式）
    generateDynamicRules() {
      this.itemsList.forEach(item => {
        const fieldName = `${item.id}_模型`;
        // 基础规则：必填项 + 提示信息
        const baseRule = {
          required: item.isRequired,
          message: item.isRequired
            ? `${this.$t('common.pleaseInput')} ${item.itemName}`
            : `${this.$t('common.pleaseSelect')} ${item.itemName}`,
          // 触发时机：选择/日期类用change，输入类用blur
          // trigger: ['OPTIONAL', 'DATE', 'DATETIME'].includes(item.itemDataType)
          //   ? 'change'
          //   : 'blur'
          trigger: ["blur", "change"]
        };

        // 扩展规则：数据格式校验（整数/浮点数）
        const fieldRules = [baseRule];
        if (item.itemDataType === 'INTEGER') {
          fieldRules.push({
            pattern: /^[1-9]\d*$/,
            message: `${item.itemName} ${this.$t('common.mustBePositiveInteger')}`,
            trigger: 'blur'
          });
        } else if (item.itemDataType === 'FLOAT') {
          fieldRules.push({
            pattern: /^(0|([1-9]\d*))(\.\d{1,2})?$/,
            message: `${item.itemName} ${this.$t('common.maxSupportTwoDecimalPlaces')}`,
            trigger: 'blur'
          });
        }

        // 动态添加规则到rules（确保响应式）
        this.$set(this.rules, fieldName, fieldRules);
      });
    },


    // 编辑模式：填充动态字段初始值
    setEditDynamicFields() {
      const { initialData } = this;
      if (!initialData || !this.itemsList.length) return;

      this.itemsList.forEach(item => {
        const fieldName = `${item.id}_模型`;
        // 假设initialData中动态字段key与fieldName一致
        if (initialData[fieldName] !== undefined) {
          this.$set(this.form, fieldName, initialData[fieldName]);
        } else {
          this.$set(this.form, fieldName, ''); // 默认空值
        }
      });
    },

    // 清空动态字段和规则（避免残留）
    clearDynamicFields() {
      // 1. 删除form中的动态字段（含"_模型"后缀）
      Object.keys(this.form).forEach(key => {
        if (key.includes('_模型')) {
          this.$delete(this.form, key);
        }
      });

      // 2. 删除rules中的动态规则
      Object.keys(this.rules).forEach(key => {
        if (key.includes('_模型')) {
          this.$delete(this.rules, key);
        }
      });
      this.form1 = {}
      this.form = {monitorMethod: 0}
      this.activeTab = 'manual'
    },

    // 重置所有表单（关闭抽屉时调用）
    resetForms() {
      // 重置资产表单
      if (this.$refs.assetForm) {
        this.$refs.assetForm.resetFields();
      }
      // 重置监控表单
      if (this.$refs.monitorForm) {
        this.$refs.monitorForm.resetFields();
      }
      // 清空动态字段列表
      this.itemsList = [];
    },

    // 获取字典数据（示例：实际项目需对接字典接口）
    // getDictDatas(code) {
    //   const dictMap = {
    //     device_status: [
    //       { label: '在线', value: 'online' },
    //       { label: '离线', value: 'offline' },
    //       { label: '故障', value: 'error' }
    //     ],
    //     device_type: [
    //       { label: '路由器', value: 'router' },
    //       { label: '交换机', value: 'switch' },
    //       { label: '防火墙', value: 'firewall' }
    //     ]
    //     // 可扩展更多字典类型
    //   };
    //   return dictMap[code] || [];
    // },
    selectSpu(val) {
      this.showBrandTip = true;
      this.itemsList.forEach(item => {
        if (item.itemCode === 'cmdbSpu') {
          this.form[`${item.id}_模型`] = ''
        }
      })
      console.log("Cf-f-a-f" + val)
      let selectObj = Object.entries(this.selectObj)
      selectObj.forEach(item => {
        if (item[1][0].brandKey === val) {
          this.selectSpuList = item[1]
        }
      })

    },
    // SNMP连接测试
    handleTest() {

      const monitorForm = this.$refs.monitorForm;
      if (!monitorForm) {
        this.$message.error(this.$t('common.monitorFormNotLoaded'));
        return;
      }
      // 校验监控表单
      monitorForm.validate((isValid) => {
        if (!isValid) return;
        this.buttonLoading = true
        // 测试逻辑（实际项目替换为SNMP测试接口）
        testSnmp({
          ...this.form1,
          pmMonitorType: this.selectTypeNumber,
          modelCode:this.assertInfo.modelCode
        }).then(res => {
          if (res.data) {
            this.$message.success(this.$t('common.testConnectivitySuccess'));
            this.errorInfoText = false;
          } else {
            // this.$message.error('测试连通性失败！');
            this.$message.error(res.msg)
            this.errorInfoText = true;
          }
          this.buttonLoading = false
        }).catch(() => {
          // this.$message.error('测试连通性失败！');
          this.buttonLoading = false
        });
      });
    },

    // 上传文件校验（仅允许Excel）
    beforeUpload(file) {
      const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isXLSX) {
        this.$message.error(this.$t('common.onlySupportXlsxFile'));
        return false;
      }
      // 限制文件大小（可选）
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.$message.error(this.$t('common.fileSizeCannotExceed10MB'));
        return false;
      }
      return true;
    },

    // 上传文件变更（更新文件列表）
    handleUploadChange(file, fileList) {
      // 仅保留最新选择的一个文件（可改为多文件）
      this.fileList = [fileList[fileList.length - 1]];
    },

    // 确认导入文件
    handleFileUpload() {
      if (this.fileList.length === 0) {
        this.$message.warning(this.$t('common.pleaseSelectImportFile'));
        return;
      }

      const formData = new FormData();
      formData.append('file', this.fileList[0].raw); // raw为Element UI的原始文件对象

      // 向父组件emit上传事件（实际项目可直接调用导入接口）
      this.$emit('uploadExcel', formData);
      this.fileList = [];
      this.$message.success(this.$t('common.importRequestSent'));
    },

    // 下载导入模板
    downloadTemplate() {
      // 实际项目替换为模板下载接口
      // window.open('/api/device/exportTemplate', '_blank');
      this.$message.info(this.$t('common.templateDownloadNotImplemented'));
    }
  }
};
</script>

<style scoped="scoped">
/* 表单样式调整 */
.asset-form,
.monitor-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 28px;
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
.winrm-tip-content {
  line-height: 1.8;
  color: #606266;
}
::v-deep .el-dialog__body{
  max-height: 500px !important
}
.code-block {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px 0;
  font-family: monospace;
  color: #333;
}
</style>
