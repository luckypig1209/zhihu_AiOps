<template>
  <div class="page-container">
    <!-- 搜索和筛选区域 -->
    <div class="search-filter-bar">
      <a-input
        v-model="searchKeyword"
        placeholder="关键词"
        style="width: 200px; margin-right: 8px;"
        @press-enter="handleSearch"
      >
        <a-icon
          slot="suffix"
          type="search"
          @click="handleSearch"
        />
      </a-input>
      <a-radio-group v-model="statusFilter" @change="handleFilterChange" style="margin-left: auto;">
        <a-radio-button value="全部">全部</a-radio-button>
        <a-radio-button value="正常">正常</a-radio-button>
        <a-radio-button value="异常">异常</a-radio-button>
        <a-radio-button value="告警">告警</a-radio-button>
        <a-radio-button value="未知">未知</a-radio-button>
      </a-radio-group>
    </div>
    <!-- 数据表格区域 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    >
      <template slot="empty">
        <div style="text-align: center;">
          <a-icon type="inbox" style="font-size: 24px; color: #ccc;" />
          <p style="margin-top: 8px; color: #ccc;">暂无数据</p>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'DataTableComponent',
  data() {
    return {
      // 搜索关键词
      searchKeyword: '',
      // 状态筛选
      statusFilter: '全部',
      // 表格列配置
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: '状态',
          dataIndex:'status',
          key:'status'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: '入流量',
          dataIndex: 'inTraffic',
          key: 'inTraffic'
        },
        {
          title: '出流量',
          dataIndex: 'outTraffic',
          key: 'outTraffic'
        },
        {
          title: '带宽',
          dataIndex: 'bandwidth',
          key: 'bandwidth'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      // 表格数据（模拟，实际应从接口获取）
      tableData: [],
      // 分页配置
      pagination: {
        total: 0,
        pageSize: 20,
        current: 1
      }
    };
  },
  created() {
    // 模拟初始化获取数据，实际应替换为接口请求
    this.fetchData();
  },
  methods: {
    // 获取表格数据，实际应替换为接口请求
    fetchData() {
      // 这里先模拟空数据，你可根据筛选条件等请求真实接口
      this.tableData = [];
      this.pagination.total = 0;
    },
    // 搜索操作
    handleSearch() {
      // 重置页码
      this.pagination.current = 1;
      // 根据关键词等条件请求数据，这里调用 fetchData 模拟
      this.fetchData();
    },
    // 筛选状态改变
    handleFilterChange() {
      this.pagination.current = 1;
      this.fetchData();
    },
    // 表格分页、排序等变化
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.fetchData();
    }
  }
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}
.search-filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
</style>