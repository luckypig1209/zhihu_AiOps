/**
 * 作台视图-线索总数
 * @router index
 * @autor zm
 * @date 2023/03/24
 */
<template>
  <Modal v-model="show" :title="showTitle" class-name="modal-center" :footer-hide="true" width="960">
    <Table :columns="columns" :data="tableList" :loading="tableLoad"> </Table>
    <div style="text-align: right; width: 100%">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        style="padding: 10px"
      ></Page>
    </div>
    <!-- 新增、修改 -->
    <Modal v-model="modalShow" :title="opt" width="600">
      <Form ref="optForm" :model="optForm" :rules="rules" inline :label-width="120">
        <Row>
          <!-- <Col span="22">
            <FormItem label="客户名称:">
              {{ custName }}
            </FormItem>
          </Col>
          <Col span="22">
            <FormItem label="项目名称:" prop="projectId">
              <Select v-model="optForm.projectId" clearable filterable :disabled="opt === '编辑'">
                <Option v-for="item in itemList" :value="item.id" :key="item.id">{{ item.itemName }}</Option>
              </Select>
            </FormItem>
          </Col> -->
          <!-- <Col span="22">
            <FormItem label="专线号:" prop="phone">
              <Input v-model="optForm.phone"></Input>
            </FormItem>
          </Col> -->
          <Col span="22">
            <FormItem label="线索类型" prop="type">
              <Select v-model="optForm.type" clearable filterable :disabled="opt === '编辑'">
                <Option value="带宽扩容">带宽扩容</Option>
                <Option value="网站、高频境外访问">网站、高频境外访问</Option>
                <Option value="合同即将到期">合同即将到期</Option>
                <Option value="资源利用率高">资源利用率高</Option>
                <Option value="其他">其他</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="22">
            <FormItem label="线索发现人:" prop="discoverer">
              <Input v-model="optForm.discoverer"></Input>
            </FormItem>
          </Col>
          <Col span="22">
            <FormItem label="线索描述:" prop="description">
              <Input type="textarea" row="4" maxlength="200" show-word-limit v-model="optForm.description"></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  </Modal>
</template>

<script>
import { opportunityList } from "@/api/myCustomer";

export default {
  name: "",
  components: {},
  data() {
    return {
      show: false,
      showTitle: "",
      columns: [
        // {
        //   title: "线索类型",
        //   key: "type",
        //   align: "center",
        //   tooltip: true,
        //   minWidth: 200
        // },
        {
          title: "线索类型",
          key: "typeEnum",
          align: "center",
          minWidth: 140
        },
        {
          title: "线索来源",
          key: "source",
          align: "center",
          minWidth: 160
        },
        {
          title: "线索描述",
          key: "busiContent",
          align: "center",
          tooltip: true,
          minWidth: 200
        },
        {
          title: "线索发现时间",
          key: "occurTime",
          align: "center",
          minWidth: 200
        },
        {
          title: "线索发现人",
          key: "creatorName",
          align: "center",
          minWidth: 160
        },
        {
          title: "线索是否转化",
          key: "changeStatus",
          align: "center",
          minWidth: 160
        }
        // {
        //   title: "操作",
        //   slot: "action",
        //   width: 130,
        //   align: "center",
        //   fixed: "right"
        // }
      ],
      tableList: [],
      tableLoad: false,
      page: { total: 0, pageSize: 5, current: 1 },
      custName: "",
      modalShow: false,
      opt: "线索录入",
      optForm: {
        // custName: '',
        discoverer: "",
        type: "",
        projectId: "",
        description: "",
        changeStatus: "否"
      },
      itemList: [],
      rules: {
        type: [{ required: true, message: "请选择线索类型", trigger: "change" }],
        description: [{ required: true, message: "请输入描述", trigger: "blur" }]
      },
      modal_loading: false
    };
  },
  computed: {},
  watch: {
    show(val) {
      if (val) {
        this.getList();
      } else {
        this.page = { total: 0, pageSize: 5, current: 1 };
        this.dataList = [];
      }
    }
  },
  methods: {
    getList() {
      this.tableLoad = true;
      let data = {
        pageNo: this.page.current, // 当前页
        pageSize: this.page.pageSize, // 每页显示记录数
        custName: this.custName,
        busiType: "潜在商机",
        typeEnum: this.showTitle
      };
      opportunityList(data)
        .then((res) => {
          this.tableLoad = false;
          if (res.code === 0) {
            this.tableList = res.data.list;
            this.page.total = Number(res.data.total);
          } else {
            this.tableList = [];
            this.page.total = 0;
          }
        })
        .catch(() => {
          this.tableLoad = false;
          this.tableList = [];
          this.page.total = 0;
        });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    // 修改
    handleEdit(row) {
      this.$refs.optForm.resetFields();
      if (row) {
        for (let key in this.optForm) {
          this.optForm[key] = row[key] || "";
        }
        this.optForm.id = row.id;
        this.opt = "编辑";
      } else {
        this.optForm.type = "";
        this.opt = "线索录入";
      }
      this.custName = row.custName;
      this.modalShow = true;
    },
    cancelAdd() {
      this.$refs.optForm.resetFields();
      this.modalShow = false;
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>
