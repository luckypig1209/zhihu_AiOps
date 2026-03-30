<template>
  <a-card size="small" :bordered="false" class="monitor-container">
    <!-- 查询条件区域 -->
    <!-- <div class="search-card">
      <a-form-model
        ref="searchFormRef"
        :model="searchForm"
        layout="inline"
        @keyup.enter.native="handleSearch"
      >
        <a-form-model-item label="名称" prop="name">
          <a-input v-model="searchForm.name" placeholder="请输入名称" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="IP地址" prop="ip">
          <a-input v-model="searchForm.ip" placeholder="请输入IP地址" allow-clear />
        </a-form-model-item>
        <a-form-model-item label="制造商" prop="manufacturer">
          <a-select
            v-model="searchForm.manufacturer"
            placeholder="请选择制造商"
            allow-clear
            style="width: 120px"
          >
            <a-select-option
              v-for="item in manufacturerOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="端口" prop="port">
          <a-input v-model="searchForm.port" placeholder="请输入端口" allow-clear />
        </a-form-model-item>
     
        <a-form-model-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
          <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
        </a-form-model-item>
      </a-form-model>
    </div> -->
      <el-form ref="queryForm" :model="queryParams" size="small"  :inline="true">
        <el-row :gutter="20">
          <el-col  :xs="24">
          
          <template v-for="(condition, index) in queryParams.conditions" >
            <div>
            <el-form-item label="" v-if="itemList.length > 0">
              <el-select
                popper-class="popper-class"
                v-model="condition.itemId"
                :popper-append-to-body="true"
                @change="(val) => handleConditionChange(val, index)"
                placeholder="请选择筛选条件"
                clearable
                filterable
              >
                <el-option
                  :value="item.id"
                  v-for="(item, idx) in itemList"
                  :key="item.id + idx"
                  :label="item.itemName"
                >
                  <el-tooltip
                    placement="top"
                    :disabled="item.itemName.length<10"
                  >
                    <div slot="content">
                      <span>{{ item.itemName }}</span>
                    </div>
                    <div class="iclass-text-ellipsis">{{ item.itemName }}</div>
                  </el-tooltip>
                </el-option>
              </el-select>
            </el-form-item>
            
            <el-form-item label="" prop="">
              <el-select v-model="condition.compareType">
                <el-option label="匹配" value="like" />
                <el-option label="范围" value="between" />
              </el-select>
            </el-form-item>          
            
            <el-form-item label="" prop="" v-if="condition.compareType != 'between'">
              <el-date-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
                v-model="condition.itemValue"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd"
                type="date"
                style="width: 240px"
              />
              <el-time-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
                v-model="condition.itemValue"
                placeholder="请选择时间"
                value-format="HH:mm:ss"
                style="width: 240px"
              />
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
                clearable
                v-model="condition.itemValue"
                placeholder="请输入搜索内容"
                :min="1"
              ></el-input-number>
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
                precision="2"
                v-model="condition.itemValue"
                placeholder="请输入搜索内容"
              ></el-input-number>                
              <el-input
                v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
                v-model.trim="condition.itemValue"
                placeholder="请输入搜索内容"
                style="width: 240px"
                clearable
              ></el-input>
            </el-form-item>
            
            <el-form-item label="" prop="" v-if="condition.compareType == 'between'">
              <el-date-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
                v-model="condition.minValue"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd"
                type="date"
                style="width: 240px"
              />
              <el-time-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
                v-model="condition.minValue"
                placeholder="请选择时间"
                value-format="HH:mm:ss"
                style="width: 240px"
              />
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
                clearable
                v-model="condition.minValue"
                placeholder="请输入搜索内容"
                :min="1"
              ></el-input-number>
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
                precision="2"
                v-model="condition.minValue"
                placeholder="请输入搜索内容"
              ></el-input-number>                
              <el-input
                v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
                v-model.trim="condition.minValue"
                placeholder="请输入搜索内容"
                style="width: 240px"
                clearable
              ></el-input>
            </el-form-item>
            
            <el-form-item label="~" prop="" v-if="condition.compareType == 'between'">
              <el-date-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
                v-model="condition.maxValue"
                placeholder="请选择日期"
                value-format="yyyy-MM-dd"
                type="date"
                style="width: 240px"
              />
              <el-time-picker
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
                v-model="condition.maxValue"
                placeholder="请选择时间"
                value-format="HH:mm:ss"
                style="width: 240px"
              />
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
                clearable
                v-model="condition.maxValue"
                placeholder="请输入搜索内容"
                :min="1"
              ></el-input-number>
              <el-input-number
                v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
                precision="2"
                v-model="condition.maxValue"
                placeholder="请输入搜索内容"
              ></el-input-number>                
              <el-input
                v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
                v-model.trim="condition.maxValue"
                placeholder="请输入搜索内容"
                style="width: 240px"
                clearable
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <!-- <el-button type="danger" v-if="queryParams.conditions.length > 1" icon="el-icon-delete" size="small" @click="removeCondition(index)">删除</el-button> -->
              <a-button type="danger" ghost  v-if="queryParams.conditions.length > 1" @click="removeCondition(index)">
                删除
              </a-button>
            </el-form-item>
            </div>
          </template>
         
              </el-col>
      </el-row>
      </el-form>

    <!-- 操作按钮区域 -->
    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="primary" ghost @click="handleCreate">
            <a-icon type="plus" />创建
          </a-button>
          <a-dropdown>
            <a-button>批量操作 <a-icon type="down" /></a-button>
            <a-menu slot="overlay" @click="handleBatchOperation">
              <a-menu-item key="batchDelete">批量删除</a-menu-item>
            </a-menu>
          </a-dropdown>         
          <a-button type="primary" ghost @click="addCondition">
            添加筛选条件
          </a-button>
            <a-button type="primary" ghost @click="getList">
            查询
          </a-button>
        </div>
        <div class="right-operations">
          <a-button @click="handleSetting">
            <a-icon type="setting" />设置
          </a-button>
          <a-button style="margin-left: 8px" @click="handleExport">
            <a-icon type="download" />导出
          </a-button>
        </div>
      </div>
    </div>

    <!-- 设备表格 -->
    <div>
      <a-table
        :columns="tableHeader"
        :data-source="tableData"
        :pagination="pagination"
        :loading="loading"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
        row-key="id"
        bordered
        size="middle"
      >
        <template slot="status" slot-scope="text">
          <a-tag :color="getStatusColor(text)" class="status-tag">
            {{ getStatusText(text) }}
          </a-tag>
        </template>
        
        <template slot="group" slot-scope="text">
          <div v-if="text && text.length">
            <a-tag v-for="item in text" :key="item" class="group-tag">
              {{ item }}
            </a-tag>
          </div>
          <span v-else>-</span>
        </template>
        
        <template slot="operation" slot-scope="text, record">
          <a-button type="link" size="small" @click="handleMoreOperation(record, 'edit')">
            编辑
          </a-button>
          <a-button type="link" size="small" @click="handleMoreOperation(record, 'delete')">
            删除
          </a-button>            
          <!-- <a-dropdown :trigger="['click']">
            <a-button type="link" size="small">
              更多 <a-icon type="down" />
            </a-button>
            <a-menu slot="overlay" @click="handleMoreOperation(record, $event)">
              <a-menu-item key="edit">编辑</a-menu-item>
              <a-menu-item key="delete" style="color: #ff4d4f">删除</a-menu-item>
            </a-menu>
          </a-dropdown> -->
        </template>
      </a-table>
    </div>

    <!-- 设备详情抽屉 -->
    <a-drawer
      :title="selectName"
      width="1080px"
      placement="right"
      :closable="true"
      :visible="nameVisible"
       :mask-closable="false"
      @close="onClose"
    >
      <device-detail></device-detail>
    </a-drawer>

    <!-- 设备创建/编辑抽屉 -->
    <device-form
      :visible="formVisible"
      :is-edit="isEditForm"
      :initial-data="formInitialData"
      :assertInfo="assertInfo"
      @close="formVisible = false"
      @createDevice="handleCreateDevice"
      @updateDevice="handleUpdateDevice"
      @upload-excel="handleUploadExcel"
    />

    <!-- 导出模态框 -->
    <export-modal
      :visible="exportModalVisible"
      :default-fields="visibleColumns"
      :all-fields="tableHeader.filter(col => col.dataIndex !== 'operation')"
      @cancel="handleExportCancel"
      @confirm="handleExportConfirm"
    />

    <!-- 设置模态框 -->
    <setting-modal
      :cellConfigVisible="settingModalVisible"
      :queryParams = "queryParams"
      @cellCfgClose="cellCfgClose"
    />
  </a-card>
</template>

<script>
import moment from "moment";
import DeviceForm from "./deviceForm.vue";
import ExportModal from "./ExportModal.vue";
import SettingModal from "./SettingModal.vue";
import {
  getAssetModel,
  getAssetInfoPage,
  deleteAssetInfo,
  batchDeleteAssetInfo,
  exportTemplate,
  updateProcessInstance,
  exportAssetInfo,
  getAssetModelPage,
  getTableHeadInfo,
  getAssetModelDetail
} from "@/api/resource";
export default {
  name: "NetworkMonitorList",
  components: { DeviceForm, ExportModal, SettingModal },
  data() {
    return {
      tableLoad: false,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        isManaged: null,
        customerId: undefined,
        projectId: undefined,
        assetTypeId: undefined,
        createTime: undefined,
        modelId: undefined,
        assetIp: undefined,
        dataSource: undefined,
        conditions: [
          {
            itemId: undefined,
            compareType: undefined,
            itemValue: undefined,
            minValue: undefined,
            maxValue: undefined
          }
        ]        
      },      
      loading: false,
      selectedRowKeys: [],
      selectName: "",
      searchForm: {
        name: "",
        ip: "",
        // manufacturer: "",
        port: "",
        // status: "",
      },
      manufacturerOptions: [
        { label: "华为", value: "华为" },
        { label: "TP-Link", value: "TP-Link" },
        { label: "锐捷", value: "锐捷" },
        { label: "新华三", value: "新华三" },
        { label: "思科", value: "思科" },
      ],
      statusOptions: [
        { label: "异常", value: "abnormal" },
        { label: "告警", value: "warning" },
        { label: "正常", value: "normal" },
      ],
      // 所有可能的表格列（操作列除外，操作列固定显示）
      tableHeader: [],
      // tableHeader: [
      //   {
      //     title: "名称",
      //     dataIndex: "name",
      //     key: "name",
      //     width: 200,
      //   },
      
      //   {
      //     title: "设备类型",
      //     dataIndex: "deviceType",
      //     key: "deviceType",
      //     width: 120,
      //   },
      //   {
      //     title: "IP 地址",
      //     dataIndex: "ipAddress",
      //     key: "ipAddress",
      //     width: 120,
      //   },
      //   {
      //     title: "制造商",
      //     dataIndex: "manufacturer",
      //     key: "manufacturer",
      //     width: 120,
      //   },
      //   {
      //     title: "型号",
      //     dataIndex: "model",
      //     key: "model",
      //     width: 180,
      //     ellipsis: true,
      //   },
      //   {
      //     title: "SN",
      //     dataIndex: "sn",
      //     key: "sn",
      //     width: 120,
      //   },
      
      //   {
      //     title: "位置",
      //     dataIndex: "location",
      //     key: "location",
      //     width: 150,
      //     ellipsis: true,
      //   },
      //   {
      //     title: "操作",
      //     dataIndex: "operation",
      //     key: "operation",
      //     width: 150,
      //     fixed: "right",
      //     scopedSlots: { customRender: "operation" },
      //   },
      // ],
      columns: [], // 表格实际显示的列（由 visibleColumns + 操作列组成）
      defaultVisibleColumns: [], // 设置的“默认可见列”（初始化时用）
      visibleColumns: [], // 控制表格显示的列（不包含操作列）
      tableData: [],
      pagination: {
        total: 0,
        pageSize: 20,
        current: 1,
        pageSizeOptions: [5, 10, 20, 50],
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: (total, range) => `总计 ${total} 条`,
      },
      nameVisible: false,
      formVisible: false,
      isEditForm: false,
      formInitialData: {},
      exportModalVisible: false,
      settingModalVisible: false,
      deleteLoading: false,
      assertInfo: {
        modelId: undefined,
        assetTypeId: undefined,
        modelCode: undefined
      },
      itemList: [], // 动态字段配置列表（从接口获取）
    };
  },
  mounted() {
      let type = this.$route.path.split('/')
    // 初始化：排除“操作列”，设置默认可见列
      getAssetModelPage({pageNo:1,pageSize:10}).then((res) => {
        let dataList = res.data.list || [];
        dataList.forEach(item =>{
          if(type[type.length - 1] && type[type.length - 1] === item.modelCode){
            this.queryParams.modelId = item.id
            this.assertInfo = {
              modelId: item.id,
              assetTypeId: item.assetTypeId,
              modelName: item.modelName,
              modelCode: item.modelCode
            }
            this.getTableHead()
            this.getList();
            this.getModel()
          }
        })
        
      });    
  },
  methods: {
    getModel() {
      this.itemList = [];

      // 2. 接口获取模型字段配置
      getAssetModelDetail({ id: this.queryParams.modelId })
        .then((res) => {
          if (res.data?.items && res.data.items.length) {
            this.itemList = res.data.items;
          } else {
          }
        })
        .catch(() => {
       
        });
    },    
    addCondition() {
      this.queryParams.conditions.push({
        itemId: undefined,
        compareType: undefined,
        itemValue: undefined,
        minValue: undefined,
        maxValue: undefined
      })
    },
  
    // 删除查询条件
    removeCondition(index) {
      this.queryParams.conditions.splice(index, 1)
    }, 
  // 修改后的条件变化处理
  handleConditionChange(val, index) {
    // 根据itemId获取数据类型
    const selectedItem = this.itemList.find(item => item.id === val)
    if (selectedItem) {
      // 这里可以根据需要处理数据类型相关逻辑
    }
  },
  
  // 获取项目的数据类型
  getItemDataType(itemId) {
    // const item = this.itemList.find(i => i.id === itemId)
    // return item ? item.dataType : null
    let type = "";
      for (let i = 0, len = this.itemList.length; i < len; i++) {
        let item = this.itemList[i];
        if (item.itemDataType == "DATE" && itemId == item.id) {
          type = "DATE";
          break;
        }
        if (item.itemDataType == "DATETIME" && itemId == item.id) {
          type = "DATETIME";
          break;
        }
        if (item.itemDataType == "FLOAT" && itemId == item.id) {
          type = "FLOAT";
          break;
        }
        if (item.itemDataType == "INTEGER" && itemId == item.id) {
          type = "INTEGER";
          break;
        }
      }
      return type;
  },      
    batchDelete() {
      // 批量删除
      const selectionIds = this.selectedRowKeys;
      const params = {
        ids: selectionIds
      };
      this.$confirm("该操作将删除选中行，是否继续", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then((_) => {
          // 调用删除接口
          this.deleteLoading = true;
          batchDeleteAssetInfo(params).then((res) => {
            if (res.code === 0) {
              this.deleteLoading = false;
              this.$message.success("删除成功");
              this.getList();
            }
          });
        })
        .catch((_) => {
          this.deleteLoading = false;
          this.$message({
            type: "info",
            message: "已取消操作"
          });
        });
    },
    getTableHead(){
      this.tableHeader = []
        this.tableLoad = true
        this.queryParams.status = 1
        getTableHeadInfo(this.queryParams).then((res) => {
          let resData = res.data
          resData.forEach(item =>{
            if(item.filed !== 'dataSource'){
              this.tableHeader.push({
                dataIndex: item.filed,
                key: item.filed,
                title: item.name,
              });
            }

          })
          this.tableHeader.push(
              {
            title: "操作",
            dataIndex: "operation",
            key: "operation",
            width: 150,
            fixed: "right",
            scopedSlots: { customRender: "operation" },
          }
          )
          this.tableLoad = false
        }) 
    },   
    cellCfgClose(type) {
      this.settingModalVisible = false;
      if (type === "submit") {
        // 配置字段后刷新列表
        this.getTableHead()
      }
    },       
    updateTableColumns() {
      // 表格列 = 可见列 + 操作列
      this.columns = [
        ...this.visibleColumns,
        this.tableHeader.find((col) => col.dataIndex === "operation"), // 固定显示操作列
      ].filter(Boolean); // 确保操作列存在
    },
    onClose() {
      this.nameVisible = false;
    },
    selectShow(row) {
      this.nameVisible = true;
      this.selectName = row.name;
    },
    getList() {
      this.loading = true
      let params = {
        ...this.queryParams,
        ...this.searchForm
      }
       getAssetInfoPage(params).then((res) => {
        this.tableData = res.data && res.data.list;
        this.pagination.total = (res.data && res.data.total) || 0;
        this.tableData.forEach((item) => {
          if(item.assetAttribute && Object.entries(item.assetAttribute) && Object.entries(item.assetAttribute).length > 0){
            let objArray = Object.entries(item.assetAttribute)
            objArray.forEach(objItem =>{
              item[objItem[0]] = objItem[1]
            })
          }
          
        });
        this.loading = false
      });
    },
    handleSearch() {
      this.pagination.current = 1;
      this.getList();
    },
    handleReset() {
      this.$refs.searchFormRef.resetFields();
      this.handleSearch();
    },
    handleCreate() {
      this.formVisible = true;
      this.isEditForm = false;
      this.formInitialData = {};
    },
    handleMoreOperation(record, key ) {
      if (key === "edit") {
        this.formVisible = true;
        this.isEditForm = true;
        this.formInitialData = record;
      } else if (key === "view") {
        this.selectShow(record);
      } else if (key === "delete") {
        this.handleDelete(record)
      }
    },
    handleDelete(row) {
      const ids = row.id;
      this.$modal
        .confirm("是否确认删除该资源数据?")
        .then(function () {
          return deleteAssetInfo({ id: ids });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },  
    handleCreateDevice() {
      this.$message.success("设备创建成功");
      this.formVisible = false;
      this.getList();

    },
    handleUpdateDevice() {
      this.$message.success("设备编辑成功");
      this.getList();
      this.formVisible = false;
    },
    handleUploadExcel(formData) {
      this.$message.success("文件上传成功，正在导入...");
      this.getList();
    },
    handleBatchOperation({ key }) {
      if (key === "batchDelete") {
        this.batchDelete()
      }
    },
    handleExport() {
      this.exportModalVisible = true;
    },
    handleExportCancel() {
      this.exportModalVisible = false;
    },
    handleExportConfirm(data) {
      const { fields, fieldLabels, range } = data;
      console.log("导出字段：", fieldLabels);
      console.log("导出范围：", range === "all" ? "全部" : "筛选");
      this.$message.success("导出请求已发送");
      this.exportModalVisible = false;
    },
    handleSetting() {
      this.settingModalVisible = true;
    },
    handleSettingCancel() {
      this.settingModalVisible = false;
    },
    handleSettingConfirm(visibleColumns) {
      this.visibleColumns = visibleColumns;
      this.updateTableColumns();
      this.settingModalVisible = false;
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.getList();
    },
    handleSync(record) {
      this.$message.info(`开始同步设备: ${record.name}`);
    },
    getStatusColor(status) {
      switch (status) {
        case "normal":
          return "green";
        case "abnormal":
          return "red";
        case "warning":
          return "orange";
        default:
          return "gray";
      }
    },
    getStatusText(status) {
      const statusMap = {
        normal: "正常",
        abnormal: "异常",
        warning: "告警",
      };
      return statusMap[status] || "未知";
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
  },
};
</script>

<style scoped lang="less">
.monitor-container {
  padding: 4px;
  background: #fff;
  min-height: 69vh;
}

.search-card {
  margin-bottom: 16px;
  /deep/ .ant-form-item {
    margin-bottom: 16px;
  }
  @media (max-width: 1200px) {
    /deep/ .ant-form-item {
      display: flex;
      width: 100%;
      margin-right: 0;
    }
    /deep/ .ant-form-item-label {
      width: 80px;
      text-align: left;
    }
    /deep/ .ant-form-item-control-wrapper {
      flex: 1;
    }
  }
}

.operation-card {
  margin-bottom: 16px;
  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    .left-operations {
      display: flex;
      gap: 8px;
    }
    .right-operations {
      display: flex;
    }
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      .right-operations {
        margin-top: 12px;
      }
    }
  }
}

.status-tag {
  margin-right: 0;
  min-width: 50px;
  text-align: center;
}

.group-tag {
  margin-bottom: 4px;
}

/deep/ .ant-table {
  .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }
  .ant-table-tbody > tr:hover > td {
    background: #e6f7ff;
  }
}

/deep/ .ant-pagination {
  margin-top: 16px;
  @media (max-width: 576px) {
    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next,
    .ant-pagination-jump-prev,
    .ant-pagination-jump-next {
      margin-bottom: 8px;
    }
  }
}
/deep/ .ant-table-thead > tr > th {
  background: #e6f0fb !important;
}
</style>