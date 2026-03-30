<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee; margin-bottom: 10px">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;display: flex;">
        <!-- <a-row :gutter="18"> -->
        <!-- 告警级别（多选） -->
        <a-col :span="6">
        <a-form-item>
          <a-select v-model="searchForm.resourceType" @change="handleProvinceChange" :placeholder="$t('indicator.pleaseSelectResourceModel')"
            style="width: 100%; margin-right: 10px">
            <a-select-option v-for="prov in nodeInfo" :key="prov.resourceType" :value="prov.resourceType">
              {{ prov.resourceName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        </a-col>

        <a-col :span="6">
        <a-form-item style="margin-left: 10px;">
          <a-select v-model="searchForm.deviceType" :placeholder="$t('indicator.pleaseSelectDeviceType')" style="width: 100%"
            :disabled="!searchForm.resourceType">
            <a-select-option v-for="city in deviceOptions" :key="city.deviceType" :value="city.deviceType">
              {{ city.deviceTypeName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        </a-col>

        <!-- <a-col :span="8" style="display: flex; align-items: center; padding-top: 3px"> -->
        <a-form-item style="display: flex;min-width: 262px;margin-left: 40px;">
          <a-button type="primary" ghost @click="handleSearch">{{ $t('indicator.query') }}</a-button>
          <a-button type="primary" ghost style="margin-left: 12px" @click="handleReset">{{ $t('indicator.reset') }}</a-button>
        </a-form-item>

        <!-- <a-button type="primary" ghost style="margin-left: 12px;" @click="handleAdd" >新增</a-button> -->
        <!-- </a-col> -->
        <!-- <div style="margin-left: auto;">
          <refreshTime @refresh="fetchData"></refreshTime> 
        </div>           -->
        <!-- </a-row> -->
      </a-form>
    </div>
    <!-- 告警表格 -->
    <a-table style="margin-top: 10px" :columns="columns" :data-source="tableData" :pagination="false" :loading="loading"
      bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
    >
      <!-- 操作列：Scoped Slot -->
      <template slot="metricCount" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="handleAdd(record)">{{ record.metricCount }}</a>
        </div>
      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="(total) => `${$t('indicator.total')} ${total} ${$t('indicator.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('indicator.itemsPerPage') }}</span>
      </template>
    </a-pagination>

    <!-- 编辑模态框 -->
    <edit-modal ref="editModal" :resourceType="resourceType" :deviceType="deviceType"
      @refreshList="fetchData"></edit-modal>
  </div>
</template>

<script>
import moment from "moment";
import {
  getAssetModelPage,
  getAssetModelDetail
} from "@/api/resource";
import { generalPage, indicatorPage, indicatorUpdate } from "@/api/indicator";
import {DICT_TYPE, getDictDatas} from "@/utils/dict";
import refreshTime from "@/components/refresh/index.vue";
import editModal from "./components/editModal.vue";
import { loadAssetTree } from '@/utils/assetData';
export default {
  name: "AlarmHistory",
  components: { editModal, refreshTime },
  props: {
    selectId: {
      type: Object,
      default: 0,
    },
  },
  data() {
    return {
      nodeInfo:'',
      selectName: "",
      nameVisible: false,
      resourceType: "",
      deviceType: "",
      // 查询表单参数
      searchForm: {
        resourceType: undefined,
        deviceType: undefined,
      },
      resourceTypeOptions: [],
      deviceMap: {},

      deviceOptions: [], // 动态的城市选项

      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      visible: false, // 模态框显隐
    };
  },
  created() {
    this.resourceTypeOptions = [
      { value: "networkdevice", label: this.$t('indicator.networkDevice') },
      { value: "securitydevice", label: this.$t('indicator.securityDevice') },
      { value: "storagebase", label: this.$t('indicator.database') },
      { value: "operatesystem", label: this.$t('indicator.operatingSystem') },
      { value: "middleware", label: this.$t('indicator.middleware') },
    ];

    this.deviceMap = {
      networkdevice: [{ value: "1", label: this.$t('indicator.switch') }],
      securitydevice: [{ value: "1", label: this.$t('indicator.securityDevice') }],
      storagebase: [
        { value: "1", label: "mysql" },
        { value: "3", label: "elasticSearch" },
        { value: "4", label: "redis" },
      ],
      operatesystem: [{ value: "1", label: this.$t('indicator.operatingSystem') }],
      middleware: [
        { value: "5", label: "kafka" },
        { value: "6", label: "nginx" },
      ],
    };
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: this.$t('indicator.resourceModel'),
          dataIndex: "resourceName",
          key: "resourceName",
          // scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('indicator.deviceType'),
          dataIndex: "deviceName",
          key: "deviceName",
        },

        {
          title: this.$t('indicator.metricCount'),
          key: "metricCount",
          scopedSlots: { customRender: "metricCount" },
        },
      ];
    },
  },
  mounted() {
    // this.getModelList()
    this.loadNodeInfo();
    this.fetchData();
  },
  methods: {   
    // 异步加载节点信息
    async loadNodeInfo() {
      try {
        this.nodeInfo = await loadAssetTree();
      } catch (error) {
        console.error('加载节点信息失败:', error);
        this.nodeInfo = [];
      }
    },    
    // 当选择省份时触发
    handleProvinceChange(value) {
      // 根据选择的省份，更新城市列表
      // this.deviceOptions = this.deviceMap[value] || [];
      // 清空已选择的城市
      // this.searchForm.deviceType = "";
       if (value === '' || value === undefined) {
            return
        }
        this.searchForm.deviceType = undefined;
        this.deviceOptions = [];
        this.nodeInfo.forEach(item => {
          if(item.resourceType === value){
             this.deviceOptions = item.device
          }
        });
        console.log("Cf-f-as-" + JSON.stringify(this.deviceOptions))
        // let modeId = ''
        // this.resourceTypeOptions.forEach(item =>{
        //     if(item.value === value){
        //         modeId = item.id
        //     }
        // })
        // getAssetModelDetail({ id: modeId }).then((res) => {
        //     let typeValue = ''
        //     if (res.data?.items && res.data.items.length) {
        //     let itemList = res.data.items.map(item => {
        //         return {
        //         itemName: item.itemName,
        //         itemCode: item.itemCode,
        //         itemId: item.id,
        //         itemValue: ''
        //         }
        //     });
        //     itemList.forEach(iItem => {
        //         if (iItem.itemName === '类型') {
        //         typeValue = iItem.itemCode
        //         }

        //     });
        //     this.deviceOptions = getDictDatas(typeValue).map(item => {
        //         return {
        //         label: item.label,
        //         value: item.value,
        //         }
        //     })
        //     }
        // });

    },
    handleAdd(record) {
      this.resourceType = record.resourceType;
      this.deviceType = record.deviceType;
      this.$refs.editModal.showModal = true;
    },
    onClose() {
      this.nameVisible = false;
    },
    getModelList() {
      // 先加载资源模型字段
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.resourceTypeOptions = res.data.list.map(item => ({
          label: item.modelName,
          value: item.modelCode,
          id: item.id
        })) || [];
      });
    },

    // 模拟获取数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize: this.pageSize,
        pageNo: this.currentPage,
        resourceType: this.searchForm.resourceType || undefined,
        deviceType: this.searchForm.deviceType || undefined,
      };
      generalPage(params).then((res) => {
        this.tableData = res.data && res.data.list;
        this.total = (res.data && res.data.total) || 0;
        this.loading = false;
      });
    },
    // 查询
    handleSearch() {
      this.currentPage = 1;
      this.fetchData();
    },
    // 重置
    handleReset() {
      this.searchForm = {
        resourceType: undefined,
        deviceType: undefined,
      };
      this.handleSearch();
    },
    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.fetchData();
    },
  },
};
</script>

<style scoped lang="less">
.alarm-history {
  padding: 20px;
  background: #fff;
  height: 90vh;
  overflow-y: auto;
}

.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  /* border-radius: 8px; */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.operation-buttons {
  display: flex;
  gap: 12px;
}

.severity-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.disposal-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.table-row-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.table-row-actions a {
  color: #1890ff;
  transition: color 0.3s;
}

.table-row-actions a:hover {
  color: #40a9ff;
}

.pagination {
  padding: 16px;
  background: #fff;
  margin-left: auto;
  // width: 360px;
  /* border-radius: 8px; */
  margin-top: 16px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
    text-align: center;
  }

  .ant-table-tbody>tr>td {
    text-align: center;
  }

  .ant-table-tbody>tr:hover>td {
    background: #f0f8ff !important;
  }

.metric-name:hover {
  color: #096dd9;
  text-decoration: underline;
}

/deep/ .ant-table {
  .ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
    text-align: center;
  }

  .ant-table-tbody>tr>td {
    text-align: center;
  }

  .ant-table-tbody>tr:hover>td {
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

/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
  text-align: center;
}

.pagination {
  text-align: right;
}
</style>
