<template>
  <div class="alarm-history">
    <!-- 查询表单 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="6">
            <a-form-item>
              <a-input v-model="searchForm.groupName" :placeholder="$t('common.enterNotificationObject')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <!-- 告警级别（多选） -->
          <a-col :span="8">
            <a-form-item>
              <a-select v-model="searchForm.channelType" :options="messageList" :placeholder="$t('common.selectNotificationMethod')" allowClear
                style="width: 100%;" showArrow />
            </a-form-item>
          </a-col>

          <!-- 操作按钮 -->
          <a-col :span="8" style="display: flex; align-items: center;padding-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('common.search') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('common.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="primary" ghost @click="handleAdd">
            <a-icon type="plus" />{{ $t('common.create') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 告警表格 -->
    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
      class="table-auto-scroll"
    >
      <!-- 通知对象列：点击名称弹详情 -->
      <template slot="groupName" slot-scope="text, record">
        <!-- <a class="ellipsis-text normal-text" @click="handleView(record)">
          {{ text }}
        </a> -->
        <span class="ellipsis-text link-text" @click="handleView(record)"> {{ text }}</span>
      </template>

      <!-- 通知方式列：格式化显示 -->
      <template slot="channelString" slot-scope="text">
        {{ handleChannelString(text) }}
      </template>
      <template slot="remark" slot-scope="text">
        <el-tooltip :content="text" placement="top" effect="dark">
          <div class="remark-column">
            {{ text }}
          </div>
          <!-- <span style="cursor: pointer;"> {{ text }}</span> -->
        </el-tooltip>

      </template>

      <!-- 操作列 -->
      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="handleEdit(record)">{{ $t('common.edit') }}</a>
          <a @click="handleDelete(record.id)">{{ $t('common.delete') }}</a>
        </div>
      </template>
    </a-table>

    <!-- 分页 -->
    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => $t('common.totalRecords', { total })" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
      <template slot="buildOptionText" slot-scope="props">
        <span>{{ props.value }}{{ $t('common.perPage') }}</span>
      </template>
    </a-pagination>

    <!-- 新增：详情弹框（独立非复用） -->
    <a-modal :title="$t('common.notificationObjectDetail')" :visible="detailVisible" :width="600" :mask-closable="false" @cancel="handleDetailCancel"
      footer="null">
      <div class="detail-content">
        <div class="detail-item">
          <span class="detail-label">{{ $t('common.notificationObjectName') }}：</span>
          <span class="detail-value">{{ detailData.groupName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('common.notificationMethod') }}：</span>
          <span class="detail-value">{{ handleChannelString(detailData.channelString) || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('common.creator') }}：</span>
          <span class="detail-value">{{ detailData.creatorName || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('common.createTime') }}：</span>
          <span class="detail-value">{{ detailData.createTime ? detailData.createTime : '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ $t('common.remark') }}：</span>
          <span class="detail-value">{{ detailData.remark || '-' }}</span>
        </div>
        <!-- 可根据实际需求补充其他字段 -->
      </div>
      <div slot="footer" style="text-align: center;">
        <!-- <a-button type="primary" @click="handleDetailCancel">关闭</a-button> -->
      </div>
    </a-modal>

    <!-- 编辑模态框 -->
    <edit-modal ref="editModal" :rowData="rowData" @refreshList="fetchData"></edit-modal>
    <!-- 详情展示框 -->
    <detail-modal ref="detailModal" :rowData="detailData" @refreshList="fetchData"></detail-modal>
  </div>
</template>

<script>
import moment from 'moment'
import { getNotificationGroup, deleteNotificationGroup, saveNotificationGroup } from "@/api/notice/notice";
import refreshTime from '@/components/refresh/index.vue'
import editModal from './components/editModal.vue'
import detailModal from './components/detailModal.vue'

export default {
  name: 'AlarmHistory',
  components: { editModal, refreshTime, detailModal },
  props: {
    selectId: {
      type: Object,
      default: 0
    }
  },
  data() {
    return {
      // 新增：详情弹框相关状态
      detailVisible: false, // 详情弹框显隐
      detailData: {}, // 详情弹框数据

      // 查询表单参数
      searchForm: {
        groupName: '',
        channelType: undefined // 修复原代码未定义的channelType字段
      },
      // 表格数据
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      rowData: {}, // 编辑弹框数据
    }
  },
  computed: {
    // 表格列配置（新增通知对象列的点击事件）
    columns() {
      // if (!this.$t) return [];
      // const $t = this.$t;
      return [
        {
          title: this.$t('common.notificationObject'),
          dataIndex: 'groupName',
          key: 'groupName',
          width: '15%',
          scopedSlots: { customRender: 'groupName' } // 绑定详情点击的自定义渲染
        },
        {
          title: this.$t('common.notificationMethod'),
          dataIndex: 'channelString',
          key: 'channelString',
          width: '15%',
          scopedSlots: { customRender: 'channelString' }
        },
        {
          title: this.$t('common.creator'),
          dataIndex: 'creatorName',
          key: 'creatorName',
          width: '15%',
        },
        {
          title: this.$t('common.createTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: '15%',
          customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
        },
        { title: this.$t('common.remark'), dataIndex: 'remark', key: 'remark', width: '15%', scopedSlots: { customRender: 'remark' } },
        {
          title: this.$t('common.operation'),
          key: 'operation',
          width: '15%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    // 通知方式映射（国际化）
    messageObj() {
      // if (!this.$t) return {};
      // const $t = this.$t;
      return {
        dd: this.$t('common.dingTalk'),
        qywx: this.$t('common.wecom'),
        wx: this.$t('common.wechat'),
        dx: this.$t('common.sms'),
        wh: this.$t('common.outboundCall'),
        szh: this.$t('common.telecomServiceDesk'),
        http: 'HTTP'
      };
    },
    // 通知方式列表（国际化）
    messageList() {
      // if (!this.$t) return [];
      // const $t = this.$t;
      return [
        { label: this.$t('common.dingTalk'), value: 'dd' },
        { label: this.$t('common.wecom'), value: 'qywx' },
        // { label: $t('common.wechat'), value: 'wx' },
        // { label: $t('common.sms'), value: 'dx' },
        // { label: $t('common.outboundCall'), value: 'wh' },
        { label: this.$t('common.telecomServiceDesk'), value: 'szh' },
        { label: this.$t('common.http'), value: 'http' }
      ];
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    // 格式化通知方式（复用）
    handleChannelString(text) {
      if (!text) return '';
      let arrayArray = JSON.parse(text);
      let arrayVal = arrayArray.map(item => this.messageObj[item] || '').join(',');
      return arrayVal;
    },

    // 新增：打开详情弹框
    handleView(row) {
      // 深拷贝数据，避免引用影响原表格
      console.log(row);

      this.detailData = JSON.parse(JSON.stringify(row));
      // this.detailVisible = true;
      this.$refs.detailModal.showModal = true;
    },

    // 新增：关闭详情弹框
    handleDetailCancel() {
      this.detailVisible = false;
      this.detailData = {}; // 清空详情数据
    },

    // 打开编辑弹框
    handleAdd() {
      this.rowData = {};
      this.$refs.editModal.showModal = true;
    },

    // 获取表格数据
    fetchData() {
      this.loading = true;
      let params = {
        pageSize: this.pageSize,
        pageNo: this.currentPage,
        groupName: this.searchForm.groupName || undefined,
        channelType: this.searchForm.channelType !== undefined ? [this.searchForm.channelType] : undefined
      };
      getNotificationGroup(params).then((res) => {
        this.tableData = res.data?.list || [];
        this.total = res.data?.total || 0;
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
        groupName: '',
        channelType: undefined
      };
      this.handleSearch();
    },

    // 编辑弹框
    handleEdit(row) {
      this.rowData = JSON.parse(JSON.stringify(row));
      this.$refs.editModal.showModal = true;
    },

    // 删除
    handleDelete(id) {
      
      this.$confirm(this.$t('common.confirmDeleteNotificationRule'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          return deleteNotificationGroup({ groupId: id });
        })
        .then(() => {
          this.$message.success(this.$t('common.deleteNotificationRuleSuccess'));
          this.fetchData();
        })
        .catch(() => { });
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
    }
  }
}
</script>

<style scoped lang="less">
.table-auto-scroll {
  max-height: 490px;
  overflow-y: auto;
}

.alarm-history {
  padding: 20px;
  background: #fff;
  min-height: 89vh;
}

/* 新增：详情弹框样式 */
.detail-content {
  padding: 10px 0;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.detail-label {
  width: 120px;
  color: #666;
  font-weight: 500;
  text-align: right;
  margin-right: 16px;
}

.detail-value {
  flex: 1;
  color: #333;
  word-break: break-all; // 处理长文本换行
}

.operation-card {
  margin-bottom: 16px;
}

.table-row-actions {
  display: flex;
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
  text-align: right;
  margin-top: 16px;
}

/* 表格样式优化 */
/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
  font-weight: 600;
}

/deep/ .ant-table-tbody>tr:hover>td {
  background: #e6f7ff !important;
}

/deep/ .ant-form-item {
  margin-bottom: 16px;
}

/* 备注列单独样式 */
.remark-column {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

/* 核心：统一文本和省略号颜色的样式 */
::v-deep .ant-table-tbody>tr>td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip; /* 改为clip，由子元素控制省略号 */
  max-width: 200px;
  box-sizing: border-box;
}

.ellipsis-text {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  padding-right: 4px; /* 避免省略号被截断 */
}

/* 普通文本样式（异常明细名称） */
.normal-text {
  color: #333;
}

/* 链接文本样式（巡检明细名称） */
.link-text {
  color: #1890ff;
  cursor: pointer;
  transition: color 0.2s;
}

.link-text:hover {
  color: #096dd9; /* hover时颜色变化，省略号也会同步 */
}
</style>
