<template>
  <div class="monitor-template-container">
    <!-- 查询条件区域 -->
    <div class="search-section">
      <a-form layout="inline">
        <a-form-item :label="$t('monitorTemplate.templateName')">
          <a-input 
            v-model="queryParams.templateName" 
            :placeholder="$t('monitorTemplate.pleaseEnterTemplateName')"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item :label="$t('monitorTemplate.resourceModel')">
          <a-select 
            v-model="queryParams.resourceModel" 
            :placeholder="$t('monitorTemplate.pleaseSelectResourceModel')"
            allow-clear
            style="width: 200px"
          >
            <a-select-option value="networkDevice">{{ $t('monitorTemplate.networkDevice') }}</a-select-option>
            <a-select-option value="securityDevice">{{ $t('monitorTemplate.securityDevice') }}</a-select-option>
            <a-select-option value="server">{{ $t('monitorTemplate.server') }}</a-select-option>
            <a-select-option value="database">{{ $t('monitorTemplate.database') }}</a-select-option>
            <a-select-option value="middleware">{{ $t('monitorTemplate.middleware') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('monitorTemplate.deviceType')">
          <a-select 
            v-model="queryParams.deviceType" 
            :placeholder="$t('monitorTemplate.pleaseSelectDeviceType')"
            allow-clear
            style="width: 200px"
          >
            <a-select-option value="router">{{ $t('monitorTemplate.router') }}</a-select-option>
            <a-select-option value="switch">{{ $t('monitorTemplate.switch') }}</a-select-option>
            <a-select-option value="firewall">{{ $t('monitorTemplate.firewall') }}</a-select-option>
            <a-select-option value="mysql">{{ $t('monitorTemplate.mysql') }}</a-select-option>
            <a-select-option value="oracle">{{ $t('monitorTemplate.oracle') }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleQuery">{{ $t('monitorTemplate.query') }}</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">{{ $t('monitorTemplate.reset') }}</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-section">
      <a-button type="primary" @click="handleAdd">
        <a-icon type="plus" />{{ $t('monitorTemplate.add') }}
      </a-button>
    </div>

    <!-- 监控模板列表 -->
    <a-table 
      :columns="columns" 
      :data-source="tableData" 
      :loading="loading"
      :pagination="pagination"
      @change="handleTableChange"
      bordered
      row-key="id"
      :locale="{ emptyText: $t('common.noData') }"
    >
      <!-- 监控模板名称 -->
      <template slot="templateName" slot-scope="text, record">
        <a>{{ text }}</a>
      </template>
      
      <!-- 监控指标项 - 点击查看 -->
      <template slot="metricCount" slot-scope="text, record">
        <a @click="showMetricModal(record)">{{ text || 0 }}</a>
      </template>
      
      <!-- 告警规则 - 点击查看 -->
      <template slot="ruleCount" slot-scope="text, record">
        <a @click="showRuleModal(record)">{{ text || 0 }}</a>
      </template>
      
      <!-- 当前版本 -->
      <template slot="version" slot-scope="text, record">
        <a-tag color="blue">v{{ text || '1.0' }}</a-tag>
      </template>
      
      <!-- 操作 -->
      <template slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">{{ $t('monitorTemplate.edit') }}</a>
        <a-divider type="vertical" />
        <a @click="handleDelete(record)">{{ $t('monitorTemplate.delete') }}</a>
        <a-divider type="vertical" />
        <a @click="showHistory(record)">{{ $t('monitorTemplate.historyVersion') }}</a>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <a-modal 
      :title="dialogTitle" 
      :visible="dialogVisible" 
      width="900px"
      :confirm-loading="confirmLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <template slot="footer">
        <a-button @click="handleCancel">{{ $t('monitorTemplate.cancel') }}</a-button>
        <a-button type="primary" @click="handleSubmit">{{ $t('monitorTemplate.confirm') }}</a-button>
        <a-button type="primary" v-if="isEdit" @click="handleSubmitAndDeploy">{{ $t('monitorTemplate.confirmAndDeploy') }}</a-button>
      </template>
      <a-form-model 
        ref="form" 
        :model="formData" 
        :rules="formRules" 
        :label-col="{ span: 6 }" 
        :wrapper-col="{ span: 16 }"
      >
        <!-- 监控模板名称 -->
        <a-form-model-item :label="$t('monitorTemplate.templateName')" prop="templateName">
          <a-input 
            v-model="formData.templateName" 
            :placeholder="$t('monitorTemplate.pleaseEnterTemplateName')"
            :disabled="isEdit"
          />
        </a-form-model-item>
        
        <!-- 适用资源（级联下拉） -->
        <a-form-model-item :label="$t('monitorTemplate.resourceModel')" prop="resourceModel">
          <a-cascader 
            v-model="formData.resourceModelPath" 
            :options="resourceOptions" 
            :placeholder="$t('monitorTemplate.pleaseSelectResourceModel')"
            :disabled="isEdit"
            :field-names="{ label: 'name', value: 'value', children: 'children' }"
            style="width: 100%"
          />
        </a-form-model-item>
        
        <!-- 厂家和型号（仅硬件设备显示） -->
        <template v-if="showHardwareFields">
          <a-form-model-item :label="$t('monitorTemplate.manufacturer')" prop="manufacturer">
            <a-input v-model="formData.manufacturer" :placeholder="$t('monitorTemplate.pleaseEnterManufacturer')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('monitorTemplate.model')" prop="model">
            <a-input v-model="formData.model" :placeholder="$t('monitorTemplate.pleaseEnterModel')" />
          </a-form-model-item>
        </template>
        
        <!-- 监控指标 -->
        <a-divider orientation="left">{{ $t('monitorTemplate.monitorMetrics') }}</a-divider>
        <a-form-model-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
          <a-table 
            :columns="metricColumns" 
            :data-source="formData.metrics" 
            :pagination="false"
            size="small"
            bordered
          >
            <template slot="metricName" slot-scope="text, record, index">
              <a-select 
                v-if="record.isEdit" 
                v-model="record.metricId" 
                :options="metricOptions"
                @change="(value) => handleMetricChange(value, index)"
                style="width: 100%"
              />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="action" slot-scope="record, index">
              <a v-if="!record.isEdit" @click="handleEditMetric(index)">{{ $t('monitorTemplate.edit') }}</a>
              <a v-else @click="handleSaveMetric(index)">{{ $t('monitorTemplate.save') }}</a>
              <a-divider type="vertical" />
              <a @click="handleDeleteMetric(index)" danger>{{ $t('monitorTemplate.delete') }}</a>
            </template>
          </a-table>
          <a-button type="primary" @click="handleAddMetric" style="margin-top: 8px">
            <a-icon type="plus" />{{ $t('monitorTemplate.addMetric') }}
          </a-button>
        </a-form-model-item>
        
        <!-- 告警规则 -->
        <a-divider orientation="left">{{ $t('monitorTemplate.alarmRules') }}</a-divider>
        <a-form-model-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
          <div style="margin-bottom: 8px">
            <a-button @click="handleBatchEnable" size="small">{{ $t('monitorTemplate.batchEnable') }}</a-button>
            <a-button @click="handleBatchDisable" size="small" style="margin-left: 8px">{{ $t('monitorTemplate.batchDisable') }}</a-button>
          </div>
          <a-table 
            :columns="ruleColumns" 
            :data-source="formData.rules" 
            :pagination="false"
            size="small"
            bordered
            :row-selection="{ selectedRowKeys: selectedRuleKeys, onChange: onSelectRuleChange }"
          >
            <template slot="ruleName" slot-scope="text, record, index">
              <span>{{ text }}</span>
            </template>
            <template slot="ruleType" slot-scope="text">
              <a-tag :color="text === 'threshold' ? 'orange' : 'blue'">
                {{ text === 'threshold' ? $t('monitorTemplate.thresholdType') : $t('monitorTemplate.eventType') }}
              </a-tag>
            </template>
            <template slot="alarmLevel" slot-scope="text">
              <a-tag :color="getAlarmLevelColor(text)">
                {{ getAlarmLevelText(text) }}
              </a-tag>
            </template>
            <template slot="enabled" slot-scope="text">
              <a-switch :checked="text" @change="(checked) => handleRuleEnableChange(checked, record.id)" />
            </template>
            <template slot="action" slot-scope="record, index">
              <a @click="handleEditRule(index)">{{ $t('monitorTemplate.edit') }}</a>
              <a-divider type="vertical" />
              <a @click="handleDeleteRule(index)" danger>{{ $t('monitorTemplate.delete') }}</a>
            </template>
          </a-table>
          <a-button type="primary" @click="handleAddRule" style="margin-top: 8px">
            <a-icon type="plus" />{{ $t('monitorTemplate.addRule') }}
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 监控指标项弹窗 -->
    <a-modal 
      :title="$t('monitorTemplate.metricList')" 
      :visible="metricModalVisible" 
      width="1000px"
      :footer="null"
      @cancel="metricModalVisible = false"
    >
      <a-table 
        :columns="metricDetailColumns" 
        :data-source="currentMetricData" 
        :pagination="false"
        bordered
      >
        <template slot="metricName" slot-scope="text">{{ text }}</template>
        <template slot="expression" slot-scope="text">{{ text }}</template>
        <template slot="metricType" slot-scope="text">{{ text }}</template>
        <template slot="level" slot-scope="text">
          <a-tag :color="getAlarmLevelColor(text)">{{ getAlarmLevelText(text) }}</a-tag>
        </template>
        <template slot="interval" slot-scope="text">{{ text }}</template>
      </a-table>
    </a-modal>

    <!-- 告警规则弹窗 -->
    <a-modal 
      :title="$t('monitorTemplate.ruleList')" 
      :visible="ruleModalVisible" 
      width="1000px"
      :footer="null"
      @cancel="ruleModalVisible = false"
    >
      <a-table 
        :columns="ruleDetailColumns" 
        :data-source="currentRuleData" 
        :pagination="false"
        bordered
      >
        <template slot="ruleName" slot-scope="text">{{ text }}</template>
        <template slot="ruleType" slot-scope="text">
          <a-tag :color="text === 'threshold' ? 'orange' : 'blue'">
            {{ text === 'threshold' ? $t('monitorTemplate.thresholdType') : $t('monitorTemplate.eventType') }}
          </a-tag>
        </template>
        <template slot="condition" slot-scope="text">{{ text }}</template>
        <template slot="operator" slot-scope="text">{{ text }}</template>
        <template slot="threshold" slot-scope="text">{{ text || '-' }}</template>
        <template slot="duration" slot-scope="text, record">{{ text }} {{ record.durationUnit }}</template>
        <template slot="alarmLevel" slot-scope="text">
          <a-tag :color="getAlarmLevelColor(text)">{{ getAlarmLevelText(text) }}</a-tag>
        </template>
        <template slot="enabled" slot-scope="text">
          <a-tag :color="text ? 'green' : 'red'">{{ text ? $t('monitorTemplate.enabled') : $t('monitorTemplate.disabled') }}</a-tag>
        </template>
      </a-table>
    </a-modal>

    <!-- 历史版本弹窗 -->
    <a-modal 
      :title="$t('monitorTemplate.historyVersion')" 
      :visible="historyModalVisible" 
      width="900px"
      :footer="null"
      @cancel="historyModalVisible = false"
    >
      <a-table 
        :columns="historyColumns" 
        :data-source="historyData" 
        :pagination="false"
        bordered
        row-key="version"
      >
        <template slot="version" slot-scope="text">v{{ text }}</template>
        <template slot="status" slot-scope="text">
          <a-tag :color="text === 'using' ? 'green' : 'red'">
            {{ text === 'using' ? $t('monitorTemplate.using') : $t('monitorTemplate.abandoned') }}
          </a-tag>
        </template>
        <template slot="action" slot-scope="record">
          <a @click="viewHistoryVersion(record)">{{ $t('monitorTemplate.view') }}</a>
          <a-divider type="vertical" />
          <a v-if="record.status !== 'using'" @click="handleRestoreVersion(record)">{{ $t('monitorTemplate.restore') }}</a>
          <span v-else style="color: #999">{{ $t('monitorTemplate.currentUsing') }}</span>
        </template>
      </a-table>
    </a-modal>

    <!-- 查看历史版本详情弹窗 -->
    <a-modal 
      :title="$t('monitorTemplate.versionDetail')" 
      :visible="versionDetailVisible" 
      width="900px"
      :footer="null"
      @cancel="versionDetailVisible = false"
    >
      <a-form-model :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item :label="$t('monitorTemplate.templateName')">
          <a-input v-model="versionDetailData.templateName" disabled />
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.resourceModel')">
          <a-cascader 
            v-model="versionDetailData.resourceModelPath" 
            :options="resourceOptions"
            disabled
            :field-names="{ label: 'name', value: 'value', children: 'children' }"
            style="width: 100%"
          />
        </a-form-model-item>
        <template v-if="versionDetailData.showHardwareFields">
          <a-form-model-item :label="$t('monitorTemplate.manufacturer')">
            <a-input v-model="versionDetailData.manufacturer" disabled />
          </a-form-model-item>
          <a-form-model-item :label="$t('monitorTemplate.model')">
            <a-input v-model="versionDetailData.model" disabled />
          </a-form-model-item>
        </template>
        
        <a-divider orientation="left">{{ $t('monitorTemplate.monitorMetrics') }}</a-divider>
        <a-table 
          :columns="metricColumns" 
          :data-source="versionDetailData.metrics" 
          :pagination="false"
          size="small"
          bordered
        >
          <template slot="metricName" slot-scope="text">{{ text }}</template>
        </a-table>
        
        <a-divider orientation="left">{{ $t('monitorTemplate.alarmRules') }}</a-divider>
        <a-table 
          :columns="ruleDetailColumns" 
          :data-source="versionDetailData.rules" 
          :pagination="false"
          size="small"
          bordered
        >
          <template slot="ruleName" slot-scope="text">{{ text }}</template>
          <template slot="ruleType" slot-scope="text">
            <a-tag :color="text === 'threshold' ? 'orange' : 'blue'">
              {{ text === 'threshold' ? $t('monitorTemplate.thresholdType') : $t('monitorTemplate.eventType') }}
            </a-tag>
          </template>
          <template slot="alarmLevel" slot-scope="text">
            <a-tag :color="getAlarmLevelColor(text)">{{ getAlarmLevelText(text) }}</a-tag>
          </template>
        </a-table>
      </a-form-model>
    </a-modal>

    <!-- 告警规则编辑弹窗 -->
    <a-modal 
      :title="ruleFormTitle" 
      :visible="ruleFormVisible" 
      width="700px"
      :confirm-loading="ruleFormLoading"
      @ok="handleRuleSubmit"
      @cancel="ruleFormVisible = false"
    >
      <a-form-model 
        ref="ruleForm" 
        :model="ruleFormData" 
        :rules="ruleFormRules" 
        :label-col="{ span: 6 }" 
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item :label="$t('monitorTemplate.ruleName')" prop="ruleName">
          <a-input v-model="ruleFormData.ruleName" :placeholder="$t('monitorTemplate.pleaseEnterRuleName')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.ruleType')" prop="ruleType">
          <a-select v-model="ruleFormData.ruleType" :placeholder="$t('monitorTemplate.pleaseSelectRuleType')">
            <a-select-option value="threshold">{{ $t('monitorTemplate.thresholdType') }}</a-select-option>
            <a-select-option value="event">{{ $t('monitorTemplate.eventType') }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.condition')" prop="condition">
          <a-input v-model="ruleFormData.condition" :placeholder="$t('monitorTemplate.pleaseEnterCondition')" />
        </a-form-model-item>
        <a-form-model-item v-if="ruleFormData.ruleType === 'threshold'" :label="$t('monitorTemplate.operator')" prop="operator">
          <a-select v-model="ruleFormData.operator" :placeholder="$t('monitorTemplate.pleaseSelectOperator')">
            <a-select-option value=">">{{ $t('monitorTemplate.greaterThan') }}</a-select-option>
            <a-select-option value="<">{{ $t('monitorTemplate.lessThan') }}</a-select-option>
            <a-select-option value="=">{{ $t('monitorTemplate.equal') }}</a-select-option>
            <a-select-option value="!=">{{ $t('monitorTemplate.notEqual') }}</a-select-option>
            <a-select-option value=">=">{{ $t('monitorTemplate.greaterThanOrEqual') }}</a-select-option>
            <a-select-option value="<=">{{ $t('monitorTemplate.lessThanOrEqual') }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item v-if="ruleFormData.ruleType === 'threshold'" :label="$t('monitorTemplate.threshold')" prop="threshold">
          <a-input-number v-model="ruleFormData.threshold" :min="0" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.duration')" prop="duration">
          <a-input-number v-model="ruleFormData.duration" :min="0" :step="1" style="width: 100%" />
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.durationUnit')" prop="durationUnit">
          <a-select v-model="ruleFormData.durationUnit" :placeholder="$t('monitorTemplate.pleaseSelectDurationUnit')">
            <a-select-option value="s">{{ $t('monitorTemplate.second') }}</a-select-option>
            <a-select-option value="m">{{ $t('monitorTemplate.minute') }}</a-select-option>
            <a-select-option value="h">{{ $t('monitorTemplate.hour') }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.alarmLevel')" prop="alarmLevel">
          <a-select v-model="ruleFormData.alarmLevel" :placeholder="$t('monitorTemplate.pleaseSelectAlarmLevel')">
            <a-select-option value="warning">{{ $t('monitorTemplate.warning') }}</a-select-option>
            <a-select-option value="normal">{{ $t('monitorTemplate.normal') }}</a-select-option>
            <a-select-option value="serious">{{ $t('monitorTemplate.serious') }}</a-select-option>
            <a-select-option value="critical">{{ $t('monitorTemplate.critical') }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('monitorTemplate.remark')" prop="remark">
          <a-textarea v-model="ruleFormData.remark" :rows="3" :placeholder="$t('monitorTemplate.pleaseEnterRemark')" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'MonitorTemplate',
  data() {
    return {
      // 查询条件
      queryParams: {
        templateName: '',
        resourceModel: '',
        deviceType: ''
      },
      
      // 表格相关
      columns: [
        { title: this.$t('monitorTemplate.templateName'), dataIndex: 'templateName', key: 'templateName', scopedSlots: { customRender: 'templateName' } },
        { title: this.$t('monitorTemplate.resourceModel'), dataIndex: 'resourceModel', key: 'resourceModel' },
        { title: this.$t('monitorTemplate.deviceType'), dataIndex: 'deviceType', key: 'deviceType' },
        { title: this.$t('monitorTemplate.metricCount'), dataIndex: 'metricCount', key: 'metricCount', scopedSlots: { customRender: 'metricCount' }, align: 'center' },
        { title: this.$t('monitorTemplate.ruleCount'), dataIndex: 'ruleCount', key: 'ruleCount', scopedSlots: { customRender: 'ruleCount' }, align: 'center' },
        { title: this.$t('monitorTemplate.version'), dataIndex: 'version', key: 'version', scopedSlots: { customRender: 'version' }, align: 'center' },
        { title: this.$t('monitorTemplate.action'), key: 'action', scopedSlots: { customRender: 'action' }, align: 'center', width: 200 }
      ],
      tableData: [],
      loading: false,
      pagination: {
        current: 1,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '50'],
        showSizeChanger: true,
        showTotal: (total) => `${this.$t('monitorTemplate.total')} ${total} ${this.$t('monitorTemplate.records')}`,
        locale: { items_per_page: this.$t('monitorTemplate.itemsPerPage') }
      },
      total: 0,
      
      // 新增/编辑弹窗
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      confirmLoading: false,
      formData: {
        id: null,
        templateName: '',
        resourceModelPath: [],
        resourceModel: '',
        manufacturer: '',
        model: '',
        metrics: [],
        rules: []
      },
      formRules: {
        templateName: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterTemplateName'), trigger: 'blur' }],
        resourceModelPath: [{ required: true, message: this.$t('monitorTemplate.pleaseSelectResourceModel'), trigger: 'change' }],
        manufacturer: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterManufacturer'), trigger: 'blur' }],
        model: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterModel'), trigger: 'blur' }]
      },
      
      // 资源选项（级联下拉）
      resourceOptions: [
        { name: this.$t('monitorTemplate.networkDevice'), value: 'networkDevice', children: [
          { name: this.$t('monitorTemplate.router'), value: 'router' },
          { name: this.$t('monitorTemplate.switch'), value: 'switch' }
        ]},
        { name: this.$t('monitorTemplate.securityDevice'), value: 'securityDevice', children: [
          { name: this.$t('monitorTemplate.firewall'), value: 'firewall' }
        ]},
        { name: this.$t('monitorTemplate.server'), value: 'server', children: [] },
        { name: this.$t('monitorTemplate.database'), value: 'database', children: [
          { name: this.$t('monitorTemplate.mysql'), value: 'mysql' },
          { name: this.$t('monitorTemplate.oracle'), value: 'oracle' }
        ]},
        { name: this.$t('monitorTemplate.middleware'), value: 'middleware', children: [] }
      ],
      
      // 监控指标相关
      metricColumns: [
        { title: this.$t('monitorTemplate.metricName'), dataIndex: 'metricName', key: 'metricName', scopedSlots: { customRender: 'metricName' } },
        { title: this.$t('monitorTemplate.expression'), dataIndex: 'expression', key: 'expression' },
        { title: this.$t('monitorTemplate.metricType'), dataIndex: 'metricType', key: 'metricType' },
        { title: this.$t('monitorTemplate.level'), dataIndex: 'level', key: 'level' },
        { title: this.$t('monitorTemplate.interval'), dataIndex: 'interval', key: 'interval' },
        { title: this.$t('monitorTemplate.action'), key: 'action', scopedSlots: { customRender: 'action' }, width: 150 }
      ],
      metricOptions: [],
      
      // 告警规则相关
      ruleColumns: [
        { title: '', key: 'selection', scopedSlots: { customRender: 'selection' } },
        { title: this.$t('monitorTemplate.ruleName'), dataIndex: 'ruleName', key: 'ruleName', scopedSlots: { customRender: 'ruleName' } },
        { title: this.$t('monitorTemplate.ruleType'), dataIndex: 'ruleType', key: 'ruleType', scopedSlots: { customRender: 'ruleType' } },
        { title: this.$t('monitorTemplate.alarmLevel'), dataIndex: 'alarmLevel', key: 'alarmLevel', scopedSlots: { customRender: 'alarmLevel' } },
        { title: this.$t('monitorTemplate.duration'), dataIndex: 'duration', key: 'duration' },
        { title: this.$t('monitorTemplate.enabled'), dataIndex: 'enabled', key: 'enabled', scopedSlots: { customRender: 'enabled' } },
        { title: this.$t('monitorTemplate.action'), key: 'action', scopedSlots: { customRender: 'action' }, width: 150 }
      ],
      selectedRuleKeys: [],
      
      // 监控指标弹窗
      metricModalVisible: false,
      currentMetricData: [],
      metricDetailColumns: [
        { title: this.$t('monitorTemplate.metricName'), dataIndex: 'metricName', key: 'metricName' },
        { title: this.$t('monitorTemplate.expression'), dataIndex: 'expression', key: 'expression' },
        { title: this.$t('monitorTemplate.metricType'), dataIndex: 'metricType', key: 'metricType' },
        { title: this.$t('monitorTemplate.level'), dataIndex: 'level', key: 'level' },
        { title: this.$t('monitorTemplate.interval'), dataIndex: 'interval', key: 'interval' }
      ],
      
      // 告警规则弹窗
      ruleModalVisible: false,
      currentRuleData: [],
      ruleDetailColumns: [
        { title: this.$t('monitorTemplate.ruleName'), dataIndex: 'ruleName', key: 'ruleName' },
        { title: this.$t('monitorTemplate.ruleType'), dataIndex: 'ruleType', key: 'ruleType' },
        { title: this.$t('monitorTemplate.condition'), dataIndex: 'condition', key: 'condition' },
        { title: this.$t('monitorTemplate.operator'), dataIndex: 'operator', key: 'operator' },
        { title: this.$t('monitorTemplate.threshold'), dataIndex: 'threshold', key: 'threshold' },
        { title: this.$t('monitorTemplate.duration'), dataIndex: 'duration', key: 'duration' },
        { title: this.$t('monitorTemplate.alarmLevel'), dataIndex: 'alarmLevel', key: 'alarmLevel' },
        { title: this.$t('monitorTemplate.enabled'), dataIndex: 'enabled', key: 'enabled' }
      ],
      
      // 历史版本
      historyModalVisible: false,
      historyData: [],
      historyColumns: [
        { title: this.$t('monitorTemplate.version'), dataIndex: 'version', key: 'version', scopedSlots: { customRender: 'version' } },
        { title: this.$t('monitorTemplate.status'), dataIndex: 'status', key: 'status', scopedSlots: { customRender: 'status' } },
        { title: this.$t('monitorTemplate.createTime'), dataIndex: 'createTime', key: 'createTime' },
        { title: this.$t('monitorTemplate.operator'), dataIndex: 'operator', key: 'operator' },
        { title: this.$t('monitorTemplate.action'), key: 'action', scopedSlots: { customRender: 'action' } }
      ],
      currentTemplateId: null,
      
      // 版本详情
      versionDetailVisible: false,
      versionDetailData: {
        templateName: '',
        resourceModelPath: [],
        manufacturer: '',
        model: '',
        showHardwareFields: false,
        metrics: [],
        rules: []
      },
      
      // 告警规则编辑弹窗
      ruleFormVisible: false,
      ruleFormTitle: '',
      ruleFormLoading: false,
      ruleFormData: {
        id: null,
        ruleName: '',
        ruleType: 'threshold',
        condition: '',
        operator: '>',
        threshold: null,
        duration: 0,
        durationUnit: 's',
        alarmLevel: 'normal',
        remark: ''
      },
      ruleFormRules: {
        ruleName: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterRuleName'), trigger: 'blur' }],
        ruleType: [{ required: true, message: this.$t('monitorTemplate.pleaseSelectRuleType'), trigger: 'change' }],
        condition: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterCondition'), trigger: 'blur' }],
        operator: [{ required: true, message: this.$t('monitorTemplate.pleaseSelectOperator'), trigger: 'change' }],
        threshold: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterThreshold'), trigger: 'change' }],
        duration: [{ required: true, message: this.$t('monitorTemplate.pleaseEnterDuration'), trigger: 'blur' }],
        durationUnit: [{ required: true, message: this.$t('monitorTemplate.pleaseSelectDurationUnit'), trigger: 'change' }],
        alarmLevel: [{ required: true, message: this.$t('monitorTemplate.pleaseSelectAlarmLevel'), trigger: 'change' }]
      },
      editingRuleIndex: -1
    };
  },
  computed: {
    showHardwareFields() {
      const lastValue = this.formData.resourceModelPath[this.formData.resourceModelPath.length - 1];
      return lastValue && ['router', 'switch', 'firewall'].includes(lastValue);
    }
  },
  created() {
    this.getTableData();
    this.getMetricOptions();
  },
  methods: {
    // 查询表格数据
    getTableData() {
      this.loading = true;
      // Mock 数据
      setTimeout(() => {
        this.tableData = [
          { id: 1, templateName: '网络设备监控模板', resourceModel: '网络设备', deviceType: '路由器', metricCount: 6, ruleCount: 5, version: '1.0', isUsing: true },
          { id: 2, templateName: '网络设备监控模板', resourceModel: '网络设备', deviceType: '交换机', metricCount: 7, ruleCount: 4, version: '1.2', isUsing: false },
          { id: 3, templateName: '数据库监控模板', resourceModel: '数据库', deviceType: 'MySQL', metricCount: 8, ruleCount: 2, version: '2.0', isUsing: true }
        ];
        this.total = this.tableData.length;
        this.loading = false;
      }, 500);
    },
    
    // 获取指标选项
    getMetricOptions() {
      // Mock 数据
      this.metricOptions = [
        { label: 'CPU 利用率', value: 1 },
        { label: '内存利用率', value: 2 },
        { label: '磁盘使用率', value: 3 },
        { label: '网络流量', value: 4 }
      ];
    },
    
    // 查询
    handleQuery() {
      this.pagination.current = 1;
      this.getTableData();
    },
    
    // 重置
    handleReset() {
      this.queryParams = {
        templateName: '',
        resourceModel: '',
        deviceType: ''
      };
      this.handleQuery();
    },
    
    // 新增
    handleAdd() {
      this.isEdit = false;
      this.dialogTitle = this.$t('monitorTemplate.add');
      this.formData = {
        id: null,
        templateName: '',
        resourceModelPath: [],
        resourceModel: '',
        manufacturer: '',
        model: '',
        metrics: [],
        rules: []
      };
      this.dialogVisible = true;
    },
    
    // 编辑
    handleEdit(record) {
      this.isEdit = true;
      this.dialogTitle = this.$t('monitorTemplate.edit');
      this.formData = {
        id: record.id,
        templateName: record.templateName,
        resourceModelPath: [record.resourceModel],
        resourceModel: record.resourceModel,
        manufacturer: '华为',
        model: record.deviceType,
        metrics: [
          { metricId: 1, metricName: 'CPU 利用率', expression: 'cpu.usage', metricType: '自动发现', level: 'normal', interval: '5m', isEdit: false }
        ],
        rules: [
          { id: 1, ruleName: 'CPU 过高告警', ruleType: 'threshold', condition: 'cpu.usage', operator: '>', threshold: 80, duration: 5, durationUnit: 'm', alarmLevel: 'serious', enabled: true }
        ]
      };
      this.dialogVisible = true;
    },
    
    // 删除
    handleDelete(record) {
      // 检查是否有使用中的规则
      const hasUsingRules = record.isUsing || false;
      
      if (hasUsingRules) {
        this.$message.warning(this.$t('monitorTemplate.templateInUseCannotDelete'));
        return;
      }
      
      this.$confirm({
        title: this.$t('monitorTemplate.confirmDelete'),
        content: `${this.$t('monitorTemplate.templateName')}: ${record.templateName}`,
        okText: this.$t('monitorTemplate.confirm'),
        cancelText: this.$t('monitorTemplate.cancel'),
        onOk: () => {
          this.$message.success(this.$t('monitorTemplate.deleteSuccess'));
          this.getTableData();
        }
      });
    },
    
    // 提交（确认）
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          setTimeout(() => {
            this.confirmLoading = false;
            this.dialogVisible = false;
            
            // 编辑时更新版本号
            if (this.isEdit) {
              const record = this.tableData.find(item => item.id === this.formData.id);
              if (record) {
                const versionParts = record.version.split('.');
                versionParts[versionParts.length - 1] = parseInt(versionParts[versionParts.length - 1]) + 1;
                record.version = versionParts.join('.');
              }
            }
            
            this.$message.success(this.$t('monitorTemplate.saveSuccess'));
            this.getTableData();
          }, 1000);
        }
      });
    },
    
    // 确认并下发
    handleSubmitAndDeploy() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.confirmLoading = true;
          setTimeout(() => {
            this.confirmLoading = false;
            this.dialogVisible = false;
            
            // 编辑时更新版本号
            if (this.isEdit) {
              const record = this.tableData.find(item => item.id === this.formData.id);
              if (record) {
                const versionParts = record.version.split('.');
                versionParts[versionParts.length - 1] = parseInt(versionParts[versionParts.length - 1]) + 1;
                record.version = versionParts.join('.');
              }
            }
            
            this.$message.success(this.$t('monitorTemplate.deploySuccess'));
            this.getTableData();
          }, 1000);
        }
      });
    },
    
    // 取消
    handleCancel() {
      this.dialogVisible = false;
    },
    
    // 表格变化
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.getTableData();
    },
    
    // 显示监控指标弹窗
    showMetricModal(record) {
      this.currentTemplateId = record.id;
      this.currentMetricData = [
        { metricName: 'CPU 利用率', expression: 'cpu.usage', metricType: '自动发现', level: 'normal', interval: '5m' },
        { metricName: '内存利用率', expression: 'memory.usage', metricType: '手动配置', level: 'serious', interval: '1m' }
      ];
      this.metricModalVisible = true;
    },
    
    // 显示告警规则弹窗
    showRuleModal(record) {
      this.currentTemplateId = record.id;
      this.currentRuleData = [
        { ruleName: 'CPU 过高告警', ruleType: 'threshold', condition: 'cpu.usage', operator: '>', threshold: 80, duration: 5, durationUnit: 'm', alarmLevel: 'serious', enabled: true },
        { ruleName: '内存溢出告警', ruleType: 'event', condition: 'memory.overflow', operator: '=', threshold: null, duration: 0, durationUnit: 's', alarmLevel: 'critical', enabled: false }
      ];
      this.ruleModalVisible = true;
    },
    
    // 显示历史版本
    showHistory(record) {
      this.currentTemplateId = record.id;
      this.historyData = [
        { version: '1.0', status: 'abandoned', createTime: '2024-01-01 10:00:00', operator: 'admin', 
          templateName: record.templateName, resourceModelPath: [record.resourceModel], 
          manufacturer: '华为', model: record.deviceType,
          metrics: [{ metricName: 'CPU 利用率', expression: 'cpu.usage', metricType: '自动发现', level: 'normal', interval: '5m' }],
          rules: [{ ruleName: 'CPU 过高告警', ruleType: 'threshold', condition: 'cpu.usage', operator: '>', threshold: 80, duration: 5, durationUnit: 'm', alarmLevel: 'serious', enabled: true }]
        },
        { version: '1.1', status: 'abandoned', createTime: '2024-01-15 14:30:00', operator: 'user1',
          templateName: record.templateName, resourceModelPath: [record.resourceModel],
          manufacturer: '华为', model: record.deviceType,
          metrics: [{ metricName: 'CPU 利用率', expression: 'cpu.usage', metricType: '自动发现', level: 'normal', interval: '5m' }],
          rules: [{ ruleName: 'CPU 过高告警', ruleType: 'threshold', condition: 'cpu.usage', operator: '>', threshold: 80, duration: 5, durationUnit: 'm', alarmLevel: 'serious', enabled: true }]
        },
        { version: '2.0', status: 'using', createTime: '2024-02-01 09:00:00', operator: 'admin',
          templateName: record.templateName, resourceModelPath: [record.resourceModel],
          manufacturer: '华为', model: record.deviceType,
          metrics: [{ metricName: 'CPU 利用率', expression: 'cpu.usage', metricType: '自动发现', level: 'normal', interval: '5m' }],
          rules: [{ ruleName: 'CPU 过高告警', ruleType: 'threshold', condition: 'cpu.usage', operator: '>', threshold: 80, duration: 5, durationUnit: 'm', alarmLevel: 'serious', enabled: true }]
        }
      ];
      this.historyModalVisible = true;
    },
    
    // 查看历史版本详情
    viewHistoryVersion(record) {
      this.versionDetailData = {
        templateName: record.templateName,
        resourceModelPath: record.resourceModelPath,
        manufacturer: record.manufacturer,
        model: record.model,
        showHardwareFields: record.resourceModelPath.some(item => ['router', 'switch', 'firewall'].includes(item)),
        metrics: record.metrics,
        rules: record.rules
      };
      this.versionDetailVisible = true;
    },
    
    // 恢复版本
    handleRestoreVersion(record) {
      this.$confirm({
        title: this.$t('monitorTemplate.confirmRestore'),
        content: `${this.$t('monitorTemplate.version')}: v${record.version}`,
        okText: this.$t('monitorTemplate.confirm'),
        cancelText: this.$t('monitorTemplate.cancel'),
        onOk: () => {
          // 更新历史版本状态
          this.historyData.forEach(item => {
            item.status = item.version === record.version ? 'using' : 'abandoned';
          });
          // 更新主表数据
          const currentRecord = this.tableData.find(item => item.id === this.currentTemplateId);
          if (currentRecord) {
            currentRecord.version = record.version;
          }
          this.$message.success(this.$t('monitorTemplate.restoreSuccess'));
          this.historyModalVisible = false;
        }
      });
    },
    
    // 监控指标相关方法
    handleAddMetric() {
      this.formData.metrics.push({
        metricId: null,
        metricName: '',
        expression: '',
        metricType: '',
        level: '',
        interval: '',
        isEdit: true
      });
    },
    
    handleEditMetric(index) {
      this.$set(this.formData.metrics[index], 'isEdit', true);
    },
    
    handleSaveMetric(index) {
      this.$set(this.formData.metrics[index], 'isEdit', false);
    },
    
    handleDeleteMetric(index) {
      this.formData.metrics.splice(index, 1);
    },
    
    handleMetricChange(value, index) {
      const metric = this.metricOptions.find(m => m.value === value);
      if (metric) {
        this.$set(this.formData.metrics[index], 'metricName', metric.label);
      }
    },
    
    // 告警规则相关方法
    handleAddRule() {
      this.ruleFormData = {
        id: null,
        ruleName: '',
        ruleType: 'threshold',
        condition: '',
        operator: '>',
        threshold: null,
        duration: 0,
        durationUnit: 's',
        alarmLevel: 'normal',
        remark: ''
      };
      this.editingRuleIndex = -1;
      this.ruleFormTitle = this.$t('monitorTemplate.addRule');
      this.ruleFormVisible = true;
    },
    
    handleEditRule(index) {
      this.editingRuleIndex = index;
      this.ruleFormData = { ...this.formData.rules[index] };
      this.ruleFormTitle = this.$t('monitorTemplate.editRule');
      this.ruleFormVisible = true;
    },
    
    handleDeleteRule(index) {
      this.formData.rules.splice(index, 1);
    },
    
    handleRuleSubmit() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.editingRuleIndex === -1) {
            this.formData.rules.push({ ...this.ruleFormData, id: Date.now() });
          } else {
            this.$set(this.formData.rules, this.editingRuleIndex, { ...this.ruleFormData });
          }
          this.ruleFormVisible = false;
        }
      });
    },
    
    handleRuleEnableChange(checked, ruleId) {
      const rule = this.formData.rules.find(r => r.id === ruleId);
      if (rule) {
        rule.enabled = checked;
      }
    },
    
    onSelectRuleChange(selectedRowKeys) {
      this.selectedRuleKeys = selectedRowKeys;
    },
    
    handleBatchEnable() {
      this.formData.rules.forEach(rule => {
        if (this.selectedRuleKeys.includes(rule.id)) {
          rule.enabled = true;
        }
      });
      this.selectedRuleKeys = [];
    },
    
    handleBatchDisable() {
      this.formData.rules.forEach(rule => {
        if (this.selectedRuleKeys.includes(rule.id)) {
          rule.enabled = false;
        }
      });
      this.selectedRuleKeys = [];
    },
    
    // 恢复版本
    handleRestoreVersion(record) {
      this.$confirm({
        title: this.$t('monitorTemplate.confirmRestore'),
        content: `${this.$t('monitorTemplate.version')}: v${record.version}`,
        okText: this.$t('monitorTemplate.confirm'),
        cancelText: this.$t('monitorTemplate.cancel'),
        onOk: () => {
          this.$message.success(this.$t('monitorTemplate.restoreSuccess'));
          this.historyModalVisible = false;
          this.getTableData();
        }
      });
    },
    
    // 辅助方法
    getAlarmLevelColor(level) {
      const colorMap = {
        warning: 'yellow',
        normal: 'blue',
        serious: 'orange',
        critical: 'red'
      };
      return colorMap[level] || 'default';
    },
    
    getAlarmLevelText(level) {
      const textMap = {
        warning: this.$t('monitorTemplate.warning'),
        normal: this.$t('monitorTemplate.normal'),
        serious: this.$t('monitorTemplate.serious'),
        critical: this.$t('monitorTemplate.critical')
      };
      return textMap[level] || level;
    }
  }
};
</script>

<style scoped>
.monitor-template-container {
  padding: 24px;
}

.search-section {
  margin-bottom: 16px;
}

.operation-section {
  margin-bottom: 16px;
}

.custom-table >>> .ant-table-thead > tr > th {
  background-color: #e6f7ff;
  font-weight: 600;
}

.custom-table >>> .ant-table-tbody > tr:hover > td {
  background-color: #e6f7ff;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
