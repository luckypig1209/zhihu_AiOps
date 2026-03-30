<template>
  <div class="step-wrap">
    <div class="step-content" ref="content">
      <div class="step">
        <el-form ref="baseForm" :model="baseForm" :rules="baseRules" size="small" label-width="100px">
          <el-row>
            <el-col :offset="2" :span="19">
              <el-form-item label="API标识" prop="apiId">
                <el-input
                  v-model.trim="baseForm.serviceName"
                  placeholder="请输入API标识"
                  maxlength="30"
                ></el-input> </el-form-item
            ></el-col>
            <el-col :offset="2" :span="19">
              <el-form-item label="API名称" prop="apiName">
                <el-input
                  v-model.trim="baseForm.apiName"
                  placeholder="请输入API名称"
                  maxlength="30"
                ></el-input> </el-form-item
            ></el-col>
            <el-col :offset="2" :span="19">
              <el-form-item label="能力类型" prop="type">
                <el-select v-model="baseForm.type">
                  <el-option label="数据库" value="database"></el-option>
                  <el-option label="通用API" value="api"></el-option>
                  <el-option label="脚本" value="script"></el-option>
                  <el-option label="告警接口" value="alarmApi"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :offset="2" :span="19" v-if="baseForm.type === 'database'">
              <el-form-item
                label="数据源"
                prop="dataSource"
                :rules="{ required: baseForm.type === 'database', message: '请选择数据源', trigger: 'change' }"
              >
                <el-select v-model="baseForm.dataSource">
                  <el-option label="常青藤MySQL数据库1" value="database1"></el-option>
                  <el-option label="常青藤MySQL数据库2" value="database2"></el-option>
                  <el-option label="常青藤MySQL数据库3" value="database3"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="19" :offset="2" v-if="baseForm.type === 'database'">
              <el-form-item label="SQL语句:" prop="sql">
                <CodeEdit lang="sql" :theme="baseForm.theme" v-model="baseForm.sql" height="200px" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="step">
        <el-row>
          <h3>请求头</h3>
          <table class="m-table">
            <tr class="t-head">
              <th>字段名*</th>
              <th>字段类型*</th>
              <th>字段描述</th>
            </tr>
            <tr>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <i class="el-icon-plus" style="color: green"></i>
                <i class="el-icon-delete" style="color: red; margin-left: 5px"></i>
              </td>
            </tr>
          </table>
        </el-row>
        <el-row>
          <h3>入参列表</h3>
          <table class="m-table">
            <tr class="t-head">
              <th>字段名*</th>
              <th>字段类型*</th>
              <th>字段描述</th>
            </tr>
            <tr>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <i class="el-icon-plus" style="color: green"></i>
                <i class="el-icon-delete" style="color: red; margin-left: 5px"></i>
              </td>
            </tr>
          </table>
        </el-row>
        <el-row>
          <h3>出参列表</h3>
          <table class="m-table">
            <tr class="t-head">
              <th>字段名*</th>
              <th>字段类型*</th>
              <th>操作规则</th>
              <th>字段描述</th>
            </tr>
            <tr>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <i class="el-icon-plus" style="color: green"></i>
                <i class="el-icon-delete" style="color: red; margin-left: 5px"></i>
              </td>
            </tr>
          </table>
        </el-row>
      </div>
      <div class="step">
        <el-row>
          <h3>请求头</h3>
          <table class="m-table">
            <tr class="t-head">
              <th>字段名*</th>
              <th>字段类型*</th>
              <th>字段描述</th>
            </tr>
            <tr>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
            </tr>
          </table>
        </el-row>
        <el-row>
          <h3>入参列表</h3>
          <table class="m-table">
            <tr class="t-head">
              <th>字段名*</th>
              <th>字段类型*</th>
              <th>字段描述</th>
            </tr>
            <tr>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
              <td>
                <el-input></el-input>
              </td>
            </tr>
          </table>
        </el-row>
        <el-row>
          <h3>测试结果</h3>
          <json-viewer :value="resJson" :expand-depth="5" copyable boxed sort></json-viewer>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import CodeEdit from "./codeEdit.vue";
import jsonViewer from "vue-json-viewer";
export default {
  name: "stepsContent",
  components: { CodeEdit, jsonViewer },
  props: {
    activeStep: Number
  },
  watch: {
    activeStep: function (val) {
      this.toggleStepContent(val);
    }
  },
  data() {
    return {
      active: 0,
      baseForm: {
        apiId: "",
        apiName: "",
        type: "",
        theme: "textmate",
        sql: ""
      },
      content: "",
      baseRules: {
        apiId: [{ required: true, trigger: "blur", message: "请输入API标识" }],
        apiName: [{ required: true, trigger: "blur", message: "请输入API名称" }],
        type: [{ required: true, trigger: "change", message: "请选择类型" }]
      },
      resJson: {
        code: 200,
        data: [
          { name: "aaaa", value: "1111" },
          { name: "aaaa", value: "1111" },
          { name: "aaaa", value: "1111" }
        ]
      }
    };
  },
  methods: {
    toggleStepContent(val) {
      this.$refs.content.style.transform = `translateX(${-33.33 * Number(val)}%)`;
    }
  },
  created() {}
};
</script>
<style lang="less" scoped>
.step-wrap {
  width: 100%;
  overflow: hidden;
}
.step-content {
  width: 300%;
  display: flex;
  padding-top: 20px;
  transition: all ease 0.5s;
  .step {
    width: 33.33%;
    flex-shrink: 0;
  }
}
.m-table {
  width: 100%;
  margin-bottom: 15px;
  margin-top: 10px;
  .t-head {
    th {
      padding: 8px 0;
      background-color: #edf0f6;
      // &:first-child {
      //   width: 30%;
      // }
      // &:nth-child(2) {
      //   width: 60%;
      // }
    }
  }
  td {
    .el-button--small {
      padding: 9px 10px;
      font-size: 14px;
    }
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
    i {
      cursor: pointer;
    }
  }
}
</style>