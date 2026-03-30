<template>
  <el-dialog :title="opt" :visible.sync="showModal" :loading="loading" width="800px">
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="22">
          <el-form-item prop="sourceId" label="数据源编码">
            <el-input type="text" v-model.trim="form.sourceId" maxlength="40" placeholder="请输入数据源编码">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item prop="sourceName" label="数据源名称">
            <el-input type="text" v-model.trim="form.sourceName" maxlength="40" placeholder="请输入数据源名称">
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item prop="type" label="数据库类型">
            <el-select v-model="form.type" clearable placeholder="请选择数据库类型">
              <el-option label="MySQL" value="mysql" />
              <el-option label="ES" value="es" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item prop="jdbcUrl" label="JDBC URL">
            <el-input
              type="textarea"
              :rows="2"
              v-model.trim="form.jdbcUrl"
              maxlength="200"
              placeholder="请输入JDBC URL"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="userName" label="用户名">
            <el-input
              type="text"
              v-model.trim="form.userName"
              maxlength="20"
              :auto-complete="false"
              placeholder="请输入用户名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="password" label="密码">
            <el-input
              show-password
              v-model.trim="form.password"
              maxlength="20"
              :auto-complete="false"
              placeholder="请输入密码"
            />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item prop="limit" label="权限">
            <el-radio v-model="form.limit" label="1">公开</el-radio>
            <el-radio v-model="form.limit" label="2">不公开</el-radio>
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item prop="remark" label="备注">
            <el-input type="textarea" :rows="2" v-model.trim="form.remark" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel" v-if="!isDetail">取 消</el-button>
      <el-button @click="testConnect" v-if="!isDetail">测试连接</el-button>
      <el-button type="primary" @click="handleSubmit('form')" v-if="!isDetail">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: "formEdit",
  data() {
    return {
      isSubmitDisabled: false,
      opt: "新增",
      isDetail: false,
      loading: false,
      showModal: false,
      disabled: false,
      form: {
        sourceName: "",
        sourceId: "",
        type: "",
        jdbcUrl: "",
        userName: "",
        password: "",
        limit: "1",
        remark: ""
      },
      categoryDictDatas: [],
      wsProgressList: [],
      columns: [
        {
          title: "字段",
          key: "ordernum",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("span", params.index + 1);
          }
        },
        {
          title: "值",
          key: "topicName",
          align: "center",
          minWidth: 180,
          render: (h, params) => {
            return h("Input", {
              style: {
                width: "100%"
              },
              props: {
                value: this.dataList[params.index].topicName,
                maxlength: "20",
                "show-word-limit": true
              },
              on: {
                input: (val) => {
                  this.dataList[params.index].topicName = val;
                }
              }
            });
          }
        }
      ],
      dataList: [],
      tableLoad: false,
      rules: {
        sourceName: { required: true, message: "请输入规则名称", trigger: "blur" },
        switch: { required: true, message: "请选择开关", trigger: "change" },
        level: { required: true, message: "请选择规则层级", trigger: "change" },
        delay: { required: true, message: "请输入派单时延", trigger: "blur" },
        progress: { required: true, message: "请选择派单流程", trigger: "change" }
      }
    };
  },
  props: { rowData: Object },
  methods: {
    init(row) {
      if (Object.keys(row).length === 0) {
        this.opt = "新增";
      } else {
        this.opt = "编辑";
        this.form = Object.assign({}, row);
      }
    },
    cancel() {
      this.showModal = false;
    },
    testConnect() {},
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let flag = true;
          for (let i = 0; i < this.dataList.length; i++) {
            let item = this.dataList[i];
            if (item.topicName == "" || item.remark == "") {
              this.$modal.msgWarning(`第${i + 1}行数据未填写完整，请检查！`);
              flag = false;
              break;
            }
          }
          if (!flag) return;
          this.formLoad = true;
          console.log(flag);

          this.isSubmitDisabled = true;
          let url = createPlatform;
          if (this.form.id) {
            url = updatePlatform;
          }
          this.$set(this.form, "xplatformRelTopicDOList", this.dataList);
          url(this.form)
            .then((res) => {
              this.isSubmitDisabled = false;
              if (res.code === 0) {
                this.$modal.msgSuccess("操作成功");
                this.showModal = false;
                this.$emit("refreshList");
              } else {
                this.$modal.msgError("操作失败");
              }
            })
            .catch((error) => {
              this.isSubmitDisabled = false;
              if (error.response) {
                this.$modal.msgError("操作失败");
              }
            });
        }
      });
    }
  },
  mounted() {},
  watch: {
    showModal(val) {
      if (val) {
        this.init(this.rowData);
      } else {
        this.$refs.form.resetFields();
      }
    }
  }
};
</script>
<style scoped>
.tag :deep(.el-form-item__label:before) {
  content: "*";
  color: #ff4949;
  margin-right: 4px;
}
</style>
