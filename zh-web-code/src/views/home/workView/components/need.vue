/**
 * 工作台视图-工作项-客户需求
 * @router index
 * @autor zm
 * @date 2023/03/22
 */
<template>
  <div>
    <Table :columns="columns" :data="dataList" :loading="tableLoad"></Table>
    <div style="text-align: right; width: 100%">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        size="small"
        style="padding: 10px"
      ></Page>
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  components: {},
  data() {
    return {
      dataList: [],
      tableLoad: false,
      columns: [
        {
          title: "客户名称",
          key: "customerName"
        },
        {
          title: "局站名称",
          key: "stationName"
        },
        {
          title: "设备名称",
          key: "equipmentName"
        },
        {
          title: "信号名称",
          key: "signalName"
        },
        {
          title: "采集值",
          key: "signalValue"
        }
      ],
      page: { total: 0, pageSize: 10, current: 1 }
    };
  },
  computed: {},
  methods: {
    changePage(val) {
      this.page.current = val;
      this.getList();
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>
