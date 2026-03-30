/**
 * 工作台视图-工作项-产品项目承接
 * @router index
 * @autor zm
 * @date 2023/03/22
 */
<template>
  <div>
    <Table :columns="columns" :data="dataList" :loading="tableLoad">
      <template slot="aciton" slot-scope="{ row }">
        <span style="margin-right: 5px; color: #1c5fb3; cursor: pointer" @click="dirToInfo(row)">完善资料</span>
        <span style="margin-right: 5px; color: #1c5fb3; cursor: pointer" v-if="row.dispatchId" @click="openEdit(row)"
          >查看派单策略</span
        >
        <span style="margin-right: 5px; color: #1c5fb3; cursor: pointer" v-else @click="openAdd(row)"
          >制定派单策略</span
        >
        <span
          style="margin-right: 5px; cursor: pointer"
          :style="{ color: row.finishStatus === '已办结' ? '#666' : '#1c5fb3' }"
          @click="handleFinish(row)"
          >办结</span
        >
        <span style="color: #1c5fb3; cursor: pointer" @click="dirToFiles(row)">项目文档上传</span>
      </template>
    </Table>
    <div style="text-align: right; width: 100%" v-if="page.total > 0">
      <Page
        :total="page.total"
        :page-size="page.pageSize"
        :current="page.current"
        @on-change="changePage"
        show-total
        size="small"
      ></Page>
    </div>
    <Modal :title="title" width="600" v-model="show">
      <Form ref="optForm" :model="optForm" :rules="rules" inline :label-width="180">
        <Row>
          <Col span="20">
            <FormItem label="客户名称:">
              {{ detail.custName }}
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="项目名称:">
              {{ detail.itemName }}
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="总集单位:">
              {{ detail.aggregateUnit }}
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="总集接单岗:" prop="primeContractorUnit">
              <Input v-model="optForm.primeContractorUnit" maxlength="30" />
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="总集接单人:" prop="primeContractorStaff">
              <Input v-model="optForm.primeContractorStaff" maxlength="20" />
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="总集接单人联系方式:" prop="primeContractorStaffPhone">
              <Input v-model="optForm.primeContractorStaffPhone" maxlength="20" />
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="SLA服务级别:" prop="slaLevel">
              <Select v-model="optForm.slaLevel" @on-change="optForm.taskLimit = slaMap[optForm.slaLevel]">
                <Option value="SLA-1小时">SLA-1小时</Option>
                <Option value="SLA-2小时">SLA-2小时</Option>
                <Option value="SLA-3小时">SLA-3小时</Option>
                <Option value="SLA-4小时">SLA-4小时</Option>
                <Option value="SLA-6小时">SLA-6小时</Option>
                <Option value="SLA-8小时">SLA-8小时</Option>
                <Option value="SLA-10小时">SLA-10小时</Option>
                <Option value="SLA-12小时">SLA-12小时</Option>
                <Option value="SLA-24小时">SLA-24小时</Option>
                <Option value="SLA-48小时">SLA-48小时</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="20">
            <FormItem label="全阻操作时限（小时）:" prop="taskLimit">
              <Input v-model="optForm.taskLimit" readonly />
            </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="cancelAdd">取消</Button>
        <Button type="primary" :loading="modal_loading" @click="addConfirm">确认</Button>
      </div>
    </Modal>
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
        // {
        //   title: '客户名称',
        //   key: 'custName',
        //   minWidth: 160,
        //   ellipsis: true,
        //   tooltip: true
        // },
        // {
        //   title: '项目名称',
        //   key: 'itemName',
        //   minWidth: 160,
        //   ellipsis: true,
        //   tooltip: true
        // },
        {
          title: "执行状态",
          key: "finishStatus",
          width: 120
        },
        {
          title: "操作",
          slot: "aciton",
          key: "action",
          width: 170
        }
      ],
      page: { total: 0, pageSize: 5, current: 1 },
      show: false,
      title: "",
      opt: "",
      custList: [],
      itemList: [],
      optForm: {
        primeContractorUnit: "",
        primeContractorStaff: "",
        primeContractorStaffPhone: "",
        slaLevel: "",
        projectId: "",
        taskLimit: ""
      },
      detail: {
        custName: "",
        itemName: "",
        aggregateUnit: ""
      },
      rules: {
        primeContractorUnit: [{ required: true, message: "此为必填项", trigger: "blur" }],
        primeContractorStaff: [{ required: true, message: "此为必填项", trigger: "blur" }],
        primeContractorStaffPhone: [
          // { required: true, pattern: /^1[0-9]{10}$/, message: "请填写正确的手机号码", trigger: "blur" }
          { required: true, message: "此为必填项", trigger: "blur" }
        ],
        slaLevel: [{ required: true, message: "此为必填项", trigger: "change" }],
        taskLimit: [
          {
            required: false,
            pattern: /^[+]{0,1}([1-9][0-9]{0,})$|^[+]{0,1}([1-9][0-9]{0,}\.\d+)$|^[+]{0,1}([0]\.(?!0+$)\d{1,})$/,
            message: "请输入大于0的数字",
            trigger: "blur"
          }
        ]
      },
      itemData: {},
      modal_loading: false,
      slaMap: {
        "SLA-1小时": 1,
        "SLA-2小时": 2,
        "SLA-3小时": 3,
        "SLA-4小时": 4,
        "SLA-6小时": 6,
        "SLA-8小时": 8,
        "SLA-10小时": 10,
        "SLA-12小时": 12,
        "SLA-24小时": 24,
        "SLA-48小时": 48
      }
    };
  },
  computed: {},
  methods: {
    getList() {
      this.tableLoad = true;
      let data = {
        pageNum: this.page.current,
        pageSize: this.page.pageSize,
        afterSaleTimeEnd: "",
        afterSaleTimeStart: "",
        cityName: "",
        custName: "",
        finishStatus: "未办结",
        itemName: "",
        time: []
      };
      this.$http
        .post(window.BACKSTAGE + "/item/queryList1", data)
        .then((res) => {
          console.log(res, "产品项目承接");
          if (res.data.code === 200) {
            this.dataList = res.data.data.list || [];
            this.page.total = Number(res.data.data.total) || 0;
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.tableLoad = false;
        });
    },
    changePage(val) {
      this.page.current = val;
      this.getList();
    },
    // 新增策略
    openAdd(row) {
      this.optForm.projectId = row.id;
      this.optForm.id = "";
      this.detail = {
        custName: row.custName,
        itemName: row.itemName,
        aggregateUnit: row.aggregateUnit
      };
      this.title = "制定派单策略";
      this.opt = "新增";
      this.show = true;
      if (!row.custName || !row.itemName || !row.aggregateUnit) {
        this.$Modal.error({
          title: "错误",
          content: "资料不完整，请先完善资料",
          onOk: () => {
            this.cancelAdd();
          }
        });
      }
    },
    // 修改策略
    openEdit(row) {
      this.optForm.projectId = row.id;
      this.optForm.id = row.dispatchId;
      this.detail = {
        custName: row.custName,
        itemName: row.itemName,
        aggregateUnit: row.aggregateUnit
      };
      this.title = "派单策略";
      this.opt = "编辑";
      this.$http.post(window.BACKSTAGE + "/api/dispatchStrategy/selectOne", { id: row.dispatchId }).then((res) => {
        if (res.data.code === "0000") {
          let result = res.data.data;
          for (let key in this.optForm) {
            this.optForm[key] = result[key] || "";
          }
        }
      });
      this.show = true;
    },
    handleFinish(row) {
      this.$Modal.confirm({
        title: "提示：",
        content: "确认办结?",
        onOk: () => {
          this.$http
            .post(window.BACKSTAGE + "/api/pBaseInfo/fishStatus", { id: row.id })
            .then((res) => {
              if (res.data.code === "0000") {
                this.$Message.success(res.data.message);
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
    },
    // 跳转完善资料
    dirToInfo(row) {
      this.$router.push({ path: "/perfectInfo", query: { id: row.id } });
    },
    // 跳转文件上传
    dirToFiles(row) {
      this.$router.push({ path: "/itemFiles", query: { id: row.id, itemName: row.itemName, itemNo: row.itemNo } });
    },
    // 新增，修改提交
    addConfirm() {
      this.$refs.optForm.validate((valid) => {
        if (valid) {
          this.modal_loading = true;
          let data = {
            ...this.optForm
          };
          let url = "/api/dispatchStrategy/update";
          if (this.opt === "新增") {
            url = "/api/dispatchStrategy/insert";
          }
          this.$http
            .post(window.BACKSTAGE + url, data)
            .then((res) => {
              this.modal_loading = false;
              if (res.data.code === "0000") {
                this.$Message.success(res.data.message);
                this.cancelAdd();
                this.getList();
              } else {
                this.$Message.error(res.data.message || "操作失败");
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
      this.show = false;
    }
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$bus.$on("refreshProjectDetailList", () => {
      this.getList();
    });
  },
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
</style>
