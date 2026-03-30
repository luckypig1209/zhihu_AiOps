/**
 * 作台视图-预警总数
 * @router index
 * @autor zm
 * @date 2023/03/24
 */
<template>
  <Modal v-model="show" :title="showTitle" class-name="modal-center" :footer-hide="true" width="960">
    <Table row-key="id" :columns="columns" :data="tableList" :loading="tableLoad">
      <template slot-scope="{ row }" slot="action">
        <Button type="primary" size="small" style="margin-right: 5px" @click="handleEdit(row)">编辑</Button>
        <Button type="error" size="small" @click="handleDel(row)">删除</Button>
      </template>
    </Table>
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
            <FormItem label="预警类型">
              <Select v-model="optForm.type" prop="type" clearable filterable :disabled="opt === '编辑'">
                <Option value="低流量">低流量</Option>
                <Option value="重复故障">重复故障</Option>
                <Option value="单路由">单路由</Option>
                <Option value="其他预警">其他预警</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="22">
            <FormItem label="预警发现人:" prop="discoverer">
              <Input v-model="optForm.discoverer"></Input>
            </FormItem>
          </Col>
          <Col span="22">
            <FormItem label="预警描述:" prop="description">
              <Input type="textarea" row="4" maxlength="200" show-word-limit v-model="optForm.description"></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="cancelAdd">取消</Button>
        <Button type="primary" :loading="modal_loading" @click="addConfirm">确认</Button>
      </div>
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
        {
          title: "项目名称",
          key: "projectName",
          align: "center",
          tooltip: true,
          minWidth: 200
        },
        {
          title: "预警标签",
          key: "typeEnum",
          align: "center",
          tooltip: true,
          minWidth: 200
        },
        // {
        //   title: '预警类型',
        //   key: 'type',
        //   align: 'center',
        //   minWidth: 160
        // },
        {
          title: "预警来源",
          key: "source",
          align: "center",
          minWidth: 160
        },
        {
          title: "预警描述",
          key: "busiContent",
          align: "center",
          tooltip: true,
          minWidth: 200
        },
        {
          title: "预警发现时间",
          key: "occurTime",
          align: "center",
          minWidth: 200
        },
        {
          title: "预警发现人",
          key: "creatorName",
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
      opt: "预警录入",
      optForm: {
        discoverer: "",
        type: "",
        projectId: "",
        description: ""
      },
      itemList: [],
      rules: {
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
        busiType: "服务危机",
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
    // 修改某一行中的状态
    changeRowStatus(row, index) {
      this.$Modal.confirm({
        title: "提示：",
        content: "确认转换吗?",
        onOk: () => {
          // this.tableList[index].changeStatus = row.changeStatus;
          this.$http
            .post(window.BACKSTAGE + "/customer/view/warn/update", row)
            .then((res) => {
              if (res.data.code === 200) {
                this.$Message.success(res.data.msg);
                // this.getList();
              } else {
                this.$Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        },
        onCancel: () => {
          row.changeStatus = this.tableList[index].changeStatus;
        }
      });
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
        this.opt = "预警录入";
      }
      this.custName = row.custName;
      this.modalShow = true;
    },
    // 新增，修改提交
    addConfirm() {
      this.$refs.optForm.validate((valid) => {
        if (valid) {
          this.modal_loading = true;
          let url = "/customer/view/warn/update";
          let params = {
            custName: this.custName,
            ...this.optForm
          };
          if (this.opt === "预警录入") {
            url = "/customer/view/warn/save";
            delete params.id;
          }
          this.$http
            .post(window.BACKSTAGE + url, params)
            .then((res) => {
              this.modal_loading = false;
              if (res.data.code === 200) {
                this.$Message.success(res.data.msg);
                this.cancelAdd();
                this.getList();
              } else {
                this.$Message.error(res.data.msg);
              }
            })
            .finally(() => {
              this.modal_loading = false;
            });
        }
      });
    },
    cancelAdd() {
      this.$refs.optForm.resetFields();
      this.modalShow = false;
    },
    handleDel(row) {
      this.$Modal.confirm({
        title: "提示：",
        content: "确认删除？",
        onOk: () => {
          this.$http
            .post(window.BACKSTAGE + "/customer/view/warn/delete", row)
            .then((res) => {
              if (res.data.code === 200) {
                this.$Message.success(res.data.msg);
                this.getList();
              } else {
                this.$Message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        },
        onCancel: () => {
          this.$Message.info("已取消");
        }
      });
    }
  },
  created() {
    let nameStorage = sessionStorage.getItem("superUserInfo")
      ? JSON.parse(sessionStorage.getItem("superUserInfo"))
      : "";

    if (nameStorage) {
      this.optForm.discoverer = nameStorage.user.accountname ? nameStorage.user.accountname : nameStorage.user.username;
    }
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>

