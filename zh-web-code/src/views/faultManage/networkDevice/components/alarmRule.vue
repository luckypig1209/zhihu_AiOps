<template>
  <div class="monitor-rule">
    <!-- {{ $t('common.queryArea') }} -->
    <a-form layout="inline" :model="formState" @submit.prevent>
      <a-row :gutter="16">
        <a-col :span="6">
          <a-input v-model.trim="formState.description" :placeholder="$t('common.name')"  allowClear/>
        </a-col>
        <a-col :span="6">
          <a-select v-model="formState.priority" :placeholder="$t('common.alarmLevel')" allowClear>
            <a-select-option 
              v-for="item in severityOptions" 
              :key="item.value" 
              :value="item.value"
              
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-select v-model="formState.status" :placeholder="$t('common.status')" allowClear>
            <a-select-option 
              v-for="item in statusOptions" 
              :key="item.value" 
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="6">
          <a-button type="primary" @click="getList">{{ $t('common.query') }}</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">{{ $t('common.reset') }}</a-button>
        </a-col>
      </a-row>
    </a-form>

    <!-- 操作按钮 -->
    <div style="margin: 8px 0">
      <a-button 
        type="default" 
        :disabled="selectedRowKeys.length === 0" 
        @click="handleEnable(true)"
      >
        {{ $t('common.enable') }}
      </a-button>
      <a-button 
        type="default" 
        style="margin-left: 8px" 
        :disabled="selectedRowKeys.length === 0" 
        @click="handleEnable(false)"
      >
        {{ $t('common.disable') }}
      </a-button>
    </div>

    <!-- {{ $t('common.tableArea') }} -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: handleRowSelection
      }"
      :loading="loading"
      bordered
      :pagination="false"
      row-key="key"
    >
       <template slot="severity" slot-scope="text">
          <a-tag :color="getStatusColor(severityObj[text])" class="status-tag">
            {{ severityObj[text] }}
          </a-tag>
        </template>
      <!-- 状态列自定义渲染 -->
      <template slot="columnStatus" slot-scope="record">
        <a-switch 
          v-model="record.status" 
          @change="(val) => handleSwitchChange(record, val)"
        />
      </template>
    </a-table>

    <!-- 分页区域 -->
    <div style="margin-top: 8px; text-align: right">
      <a-pagination
        style="text-align: right;"
        :current="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @change="handlePageChange"
        @showSizeChange="handlePageSizeChange"
        :page-size-options="['10', '20', '50', '100']"
        :show-total="total => `${$t('common.total')}: ${total} ${$t('common.items')}`"
      >
       <template slot="buildOptionText" slot-scope="props">
      <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>
      
    </template>
    </a-pagination>
    </div>
  </div>
</template>

<script>
import {getRuleList, updateRuleStatus, batchUpdateRuleStatus} from "@/api/monitor/task";
export default {
  name: 'MonitorRule',
  props:{
    selectId:{
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      formState: {
        name: undefined,
        severity: undefined,
        status: undefined
      },

      dataSource: [
        { key: 1, severity: '普通', name: 'CPU 使用率持续 5 分钟大于 90%', status: true },
        { key: 2, severity: '紧急', name: 'ICMP Ping 不通', status: true },
        { key: 3, severity: '普通', name: 'ICMP Ping 丢包率持续 5 分钟大于 20%', status: true },
        { key: 4, severity: '普通', name: 'ICMP Ping 5 分钟平均延迟大于 0.15 秒', status: true },
        { key: 5, severity: '严重', name: 'SNMP 不可用', status: true },
        { key: 6, severity: '普通', name: '内存使用率持续 5 分钟大于 90%', status: true },
        { key: 7, severity: '预警', name: '系统名称发生变更', status: true },
        { key: 8, severity: '预警', name: '软件层面发生重启', status: true },
        { key: 9, severity: '普通', name: '风扇 0:3: 状态异常', status: true },
        { key: 10, severity: '严重', name: '网口 InLoopBack0: 带宽使用率持续 15 分钟大于 90%', status: true }
      ],
      selectedRowKeys: [],
      selectedArray:[],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 65
      },
      tableData:[],
      loading: false
    }
  },
  computed: {
    // 告警级别选项
    severityOptions() {
      return [
        { label: this.$t('common.warning'), value: '1' },
        { label: this.$t('common.normal'), value: '2' },
        { label: this.$t('common.critical'), value: '3' },
        { label: this.$t('common.urgent'), value: '4' },
      ];
    },
    // 告警级别对象
    severityObj() {
      return {
        '1': this.$t('common.warning'),
        '2': this.$t('common.normal'),
        '3': this.$t('common.critical'),
        '4': this.$t('common.urgent'),
      };
    },
    // 状态选项
    statusOptions() {
      return [
        { value: '0', label: this.$t('common.enable') },
        { value: '1', label: this.$t('common.disable') }
      ]
    },
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('common.alarmLevel'),
          dataIndex: 'priorityName',
          width: 120,
          scopedSlots: { customRender: 'severity' }
        },
        {
          title: this.$t('common.name'),
          dataIndex: 'description'
        },
        {
          title: this.$t('common.status'),
          key: 'status',
          scopedSlots: { customRender: 'columnStatus' }
        }
      ]
    }
  },
  mounted(){
    this.getList()
  },
  methods: {

    getList() {
      this.loading = true;
      let params = {
        pageSize:this.pagination.pageSize,
        pageNo: this.pagination.current,
        id: this.selectId,
        status:  this.formState.status,
        description:this.formState.description,
        priority: this.formState.priority
      }
       getRuleList(params).then((res) => {
        this.tableData = res.data && res.data.list;
        this.tableData.forEach(item =>{
          item.priorityName = item.priority
          if(item.status == '0'){
            item.status = true
          }else {
            item.status = false
          } 
        })
         this.pagination.total = (res.data && res.data.total) || 0;
         this.loading = false
      });      
    },
    // 获取状态标签颜色
    getStatusColor(status) {
      switch (status) {
        case this.$t('common.warning'):
          return 'blue';
        case this.$t('common.normal'):
          return 'orange';
        case this.$t('common.critical'):
          return 'red';          
        case this.$t('common.urgent'):
          return 'red';  
        default:
          return '#fff';
      }
    },
    // getPriorityName(priority){
    //   switch (key) {
    //     case value:
          
    //       break;
      
    //     default:
    //       break;
    //   }
    // },
    
    // 获取状态文本  
    handleQuery() {
      this.pagination.current = 1 // 查询后重置页码
      // 实际场景应调用接口获取数据
    },
    handleReset() {
      this.formState = { name: undefined, severity: undefined, status: undefined }
      this.pagination.current = 1
      this.getList()
    },
    handleRowSelection(keys) {
      let arrayObj = []
      this.tableData.forEach((item,index) =>{
        if(keys.includes(index)){
          arrayObj.push(item)
        }
      })
      this.selectedRowKeys = keys
      this.selectedArray = arrayObj
    },
    handleSwitchChange(record, val) {
      // record.status = val // 实际场景应调用接口更新状态
      let params = {
        id: this.selectId,
        ruleId: record.triggerid || undefined,
        action: val? '0':'1',
        templateId: record.templateid || undefined,
        templateRuleId: record.templateRuleId || undefined,
      }
     updateRuleStatus(params).then((res) => {
      if(res.data){
        this.$message.success(this.$t('common.updateStatusSuccess'));
        this.getList()
      } else {
         this.$message.error(this.$t('common.updateStatusFailed'));
      }
       
      });  
    },
    handleEnable(val) {
      let data = []
      this.selectedArray.forEach(item =>{
        data.push(
          {
            id: this.selectId,
            ruleId: item.triggerid || undefined,
            action: val? '0':'1',
            templateId: item.templateid || undefined,
             templateRuleId: item.templateRuleId || undefined,
          })}
      )
      batchUpdateRuleStatus({
        updateList: data
      }).then((res) =>{
       if(res.data){
        this.$message.success(this.$t('common.batchUpdateStatusSuccess'));
        this.selectedRowKeys = []
        this.getList()
      } else {
         this.$message.error(this.$t('common.batchUpdateStatusFailed'));
      }
      })
    },
    handleDisable() {
      let data = []
      this.selectedRowKeys.forEach(item =>{
        data.push({
          id: this.selectId,
          ruleId: item.triggerId,
          // "templateId": "",
          // "templateRuleId": "",
           action: '1' 
        })
      })
      batchUpdateRuleStatus({
        updateList: data
      }).then((res) =>{
        this.getList()
      })   
    },
    handlePageChange(page) {
      this.pagination.current = page
      this.getList()
    },
    handlePageSizeChange(current, pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.current = 1 // 切换页大小时重置页码
      this.getList()
    }
  }
}
</script>

<style scoped>
.monitor-rule {
  padding: 0 16px;
}
.status-tag {
  margin-right: 0;
  min-width: 50px;
  text-align: center;
}
</style>