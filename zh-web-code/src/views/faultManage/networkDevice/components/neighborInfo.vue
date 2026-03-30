<template>
  <div class="interface-table-container">
    <!-- 立即获取按钮 -->
    <a-button type="primary" @click="handleFetch" style="margin-bottom: 10px;">立即获取</a-button>
    <!-- 表格展示 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      bordered
      :pagination="pagination"
      @change="handleTableChange"
      row-key="id"
    />
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'InterfaceTable',
  data() {
    return {
      // 表格列配置
      columns: [
        {
          title: '网口名称',
          dataIndex: 'interfaceName',
          key: 'interfaceName'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description'
        },
        {
          title: '对端系统名称',
          dataIndex: 'peerSystemName',
          key: 'peerSystemName'
        },
        {
          title: '对端网口名称',
          dataIndex: 'peerInterfaceName',
          key: 'peerInterfaceName'
        }
      ],
      // 表格数据（模拟，实际应从接口获取）
      tableData: [
        {
          id: 1,
          interfaceName: 'GigabitEthernet0/0/1',
          description: '',
          peerSystemName: 'Huawei',
          peerInterfaceName: 'GigabitEthernet0/0/3'
        }
      ],
      // 分页配置
      pagination: {
        total: 1,
        pageSize: 20,
        current: 1
      }
    };
  },
  methods: {
    // 点击“立即获取”按钮的回调
    handleFetch() {
      // 可在此处调用接口获取最新数据，这里简单模拟
      console.log('执行立即获取操作，可请求接口更新 tableData');
      // 示例：若有接口，可这样请求
      // this.$axios.get('/api/fetchData').then(res => {
      //   this.tableData = res.data;
      //   this.pagination.total = res.total;
      // });
    },
    // 表格分页变化回调
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      // 可根据分页信息重新请求数据，这里简单模拟
      console.log('分页变化，当前页：', pagination.current);
    }
  }
});
</script>

<style scoped>
.interface-table-container {
  padding: 16px;
}
.ant-button {
  margin-bottom: 16px;
}
</style>