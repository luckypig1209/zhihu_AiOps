<template>
  <el-dialog :title="opt" :visible.sync ="showModal" :loading="loading" width="800px">
        <el-form ref="form" :model="form" :rules="rules" label-width="160px">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item prop="partnerName" label="合作单位名称">
                <el-input type="text" v-model.trim="form.partnerName" maxlength="30"
                  show-word-limit placeholder="请输入合作单位名称"> </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerCode" label="合作单位编码">
                <el-input
                  type="text"
                  v-model.trim="form.partnerCode"
                  maxlength="32"
                  show-word-limit
                  placeholder="请输入合作单位编码"
                  :disabled="opt === '编辑'"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerAddress" label="合作单位地址">
                <el-input type="text" v-model.trim="form.partnerAddress" maxlength="50" placeholder="请输入合作单位地址">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerTelephone" label="合作单位电话">
                <el-input type="text" v-model.trim="form.partnerTelephone" maxlength="20" placeholder="请输入合作单位电话">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerLegalPerson" label="合作单位法人">
                <el-input type="text" v-model.trim="form.partnerLegalPerson" maxlength="10" placeholder="请输入合作单位法人">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerLicense" label="合作单位营业执照">
                <el-input type="text" v-model.trim="form.partnerLicense" maxlength="40" placeholder="请输入合作单位营业执照">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerNodeCode" label="合作单位组织机构代码">
                <el-input type="text" v-model.trim="form.partnerNodeCode" maxlength="9" placeholder="请输入合作单位组织机构代码">
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="partnerDuty" label="合作单位税号">
                <el-input type="text" v-model.trim="form.partnerDuty" maxlength="20" placeholder="请输入合作单位税号"> </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="isAggregate" label="是否总集">
                <el-radio-group v-model="form.isAggregate">
                  <el-radio :label="1">总集</el-radio>
                  <el-radio :label="0">非总集</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
     <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel" v-if="showDetailFlag">确 定</el-button>
        <el-button type="primary" @click="handleSubmit('form')" v-if="!showDetailFlag" :disabled="isSubmitDisabled">确 定</el-button>
        <el-button @click="cancel" v-if="!showDetailFlag">取 消</el-button>
      </div>
  </el-dialog>
</template>
<script>
import { createPartner, updatePartner, checkPartner } from "@/api/partnerManage";
export default {
  name: "formEdit",
  data() {
    const validateCode = (rule, value, callback) => {
      if (this.opt === "新增") {
        // 检查合作单位是否存在
        const param = {
          partnerCode: value
        }
       checkPartner(param)
          .then((res) => {
            if (res.data) {
              callback(new Error("合作单位编码已存在"));
            } else {
              callback();
            }
          })
          .catch(() => {
            callback(new Error("异步校验出错！"));
          });
      } else {
        callback();
      }
    };
    return {
      isSubmitDisabled: false,
      title: "合作方信息",
      opt: "新增",
      loading: false,
      showModal: false,
      roleName: null,
      disabled: false,
      form: {
        partnerCode: "",
        partnerName: "",
        partnerAddress: "",
        partnerLegalPerson: "",
        partnerTelephone: "",
        partnerLicense: "",
        partnerNodeCode: "",
        partnerDuty: "",
        isAggregate: undefined
      },
      rules: {
        partnerCode: [
          { required: true, message: "请输入合作单位编码", trigger: "blur" },
          { validator: validateCode, trigger: "blur" }
        ],
        partnerName: [{ required: true, message: "请输入合作单位名称", trigger: "blur" }]
      }
    };
  },
  props: ["showDetailFlag"],
  methods: {
    init(row) {
      if (!row) {
        this.opt = "新增";
        this.handleReset();
      } else {
        this.opt = "编辑";
        for (let key in this.form) {
          this.form[key] = row[key];
        }
        this.form["id"] = row.id;
      }
    },
    cancel() {
      this.showModal = false;
    },
    handleReset() {
      this.form = {
        partnerCode: "",
        partnerName: "",
        partnerAddress: "",
        partnerLegalPerson: "",
        partnerLicense: "",
        partnerNodeCode: "",
        partnerNodeName: "",
        isAggregate: undefined,
        partnerTelephone: ""
      };
    },
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.isSubmitDisabled = true;
          let url = createPartner;
          if (this.form.id) {
            url = updatePartner;
          }
          url(this.form).then(res=> {
            this.isSubmitDisabled = false;
            if (res.code === 0) {
                this.$modal.msgSuccess(this.opt + "成功");
                this.showModal = false;
                this.$emit("refreshList");
              } else {
                this.$modal.msgError(this.opt + "失败");
              }
          }).catch(error=>{
            this.isSubmitDisabled = false;
              if (error.response) {
                this.$modal.msgError(this.opt + "失败");
              }
          })
        }
      });
    },
    closeMe() {
      this.isSubmitDisabled = false;
      this.showModal = false;
      this.$emit("refreshList");
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    showModal(val) {
      if (!val) {
        this.$refs.form.resetFields();
        // this.form = {}
      }
    }
  }
};
</script>
