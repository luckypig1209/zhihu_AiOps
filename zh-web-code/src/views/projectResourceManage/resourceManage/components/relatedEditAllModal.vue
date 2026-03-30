<template>
  <el-dialog :title="title" :visible.sync="editVisible" width="800px" :before-close="cancel">
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row :gutter="20" style="margin: 0 20px">
      
            <el-col :span="18" v-for="(item, index) in itemsList" :key="index">
              <el-form-item
                v-if="item.itemDataType == 'OPTIONAL'"
                :label="item.itemName"
            
                :prop="item.id + '_模型'"
                :rules="[
                  { required: false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
              <div style="display: flex;">
                <el-select
                  :disabled="item.isEdit"
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请选择${item.itemName}`"
                  clearable
                  filterable
                >
                  <el-option
                   v-for="dict in getDictDatas(item.itemCode)" :key="dict.value" :label="dict.label" :value="dict.label"
                  ></el-option>
                </el-select>
                <el-button @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'DATETIME'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
              <div style="display: flex;">
                <el-time-picker
                 :disabled="item.isEdit"
                  v-model="form[item.id + '_模型']"
                  type="datetime"
                  value-format="HH:mm:ss"
                  :placeholder="`请选择${item.itemName}`"
                >
                </el-time-picker>
                <el-button  @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'DATE'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
              <div style="display: flex;">
                <el-date-picker
                  :disabled="item.isEdit"
                  v-model="form[item.id + '_模型']"
                  type="date"
                  value-format="yyyy-MM-dd"
                  :placeholder="`请选择${item.itemName}`"
                >
                </el-date-picker>
                <el-button @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'INTEGER'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required:  false, message: `请输入${item.itemName}`, trigger: 'blur' },
                  { pattern: /^[1-9]\d*$/, trigger: 'blur', message: '请输入正整数' }
                ]"
              >
              <div style="display: flex;">
                <el-input-number
                  ref="operationInt"
                  controls-position="right"
                  :disabled="item.isEdit"
                  clearable
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  :min="1"
                  autocomplete="off"
                  @input="operationChange(item.id + '_模型', form[item.id + '_模型'])"
                ></el-input-number>
                <el-button  @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'FLOAT'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required:  false, message: `请输入${item.itemName}`, trigger: 'blur' },
                  { pattern: /^(0|([1-9]\d*))(\.\d+)?$/, trigger: 'blur', message: '请输入浮点数' }
                ]"
              >
              <div style="display: flex;">
                <el-input-number
                  ref="operationFloat"
                   precision="2"
                  controls-position="right"
                  :disabled="item.isEdit"
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  autocomplete="off"
                  @input="operationChange(item.id + '_模型', form[item.id + '_模型'])"
                ></el-input-number>
                <el-button type="primary" @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'TEXT'"
                :prop="item.id + '_模型'"
                :label="item.itemName"
                :rules="[
                  { required: false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
              <div style="display: flex;">
                <el-input
                 :disabled="item.isEdit"
                  clearable
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  autocomplete="off"
                />
                <el-button  @click="changeEditStatus(index)">{{item.isEdit? '编辑' : '取消'}}</el-button>
                </div>
              </el-form-item>
            </el-col>
          <!-- </el-tab-pane>
        </el-tabs> -->
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="formSubmit" :loading="formLoad">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCustomerNameByLoginProject, queryProjectNameByLogin } from "@/api/projectManage/improveInfo";
import {
  listSimpleUsers,
  createAssetInfo,
  updateAssetInfo,
  batchUpdateAssetInfo,
  getAssetInfo,
  getAssetModel,
  getAssetTypeList,
  getAssetModelDetail
} from "@/api/resource";
import { listSimpleDepts } from "@/api/system/dept";
export default {
  name: "",
  components: {},
  props: {
    itemId: {
      default: "",
      type: String
    },
    type: {
      default: "related",
      type: String
    },
    title: {
      default: "新增",
      type: String
    },
    visible: {
      default: false,
      type: Boolean
    },
    formData: {
      default: () => {},
      type: Object
    },
    selectionIds: {
      default: () => [],
      type: Array
    },
  },

  data() {
    const validatorUser = (rule, value, callback) => {
      console.log(value, this.form.staffDeptId);
      if (this.form.staffDeptId && this.form.staffDeptId.length != 0) {
        if (!value) {
          callback(new Error("请选择责任人"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    let _this = this;
    return {
      defaultParams: {
        checkStrictly: true,
        value: "id",
        label: "name",
        children: "children",
        multiple: false,
        emitPath: false // 返回子节点
      },
      editVisible: false,
      formLoad: false,
      form: {
        modelId: null,
        items: [],
        staffDeptId: null
      },
      assetTypeList: [],
      modelList: [],
      custList: [], // 客户名称
      projectList: [], // 项目名称
      itemsList: [], // 字段信息
      deptOptions: [],
      userOptions: [],
      staffId: undefined,
      rules: {
        user: [
          // {
          //   required: true,
          //   validator: validatorUser,
          //   message: '请选择负责人',
          //   trigger: 'change'
          // }
        ],
        assetTypeId: {
          required: true,
          message: "请选择资源类型",
          trigger: "change"
        },
        customerId: {
          required: true,
          message: "请选择客户名称",
          trigger: "change"
        },
        projectId: {
          required: true,
          message: "请选择项目名称",
          trigger: "change"
        },
        //ip地址格式校验
        assetIp:{
            pattern: /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/,
            message: '请输入正确的IP地址',
            trigger: 'blur'
        },
        assetName: {
          required: true,
          message: "请输入资源名称",
          trigger: "blur"
        },
        modelId: {
          required: true,
          message: "请选择资源模型",
          trigger: "change"
        },
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.editVisible = val
        this.changeModel(this.formData.modelId);
      } else {
        this.$refs.form.resetFields();
      }
    }
  },
  inject: ["getAssetInfoCount"],
  methods: {
    changeEditStatus(index){
      this.$nextTick(() => {
        this.itemsList[index].isEdit = !this.itemsList[index].isEdit
        this.$forceUpdate()
        });
   
    },
    operationChange(name, value) {
      if (value) {
        this.$nextTick(() => {
          this.form[name] = value;
          this.$forceUpdate();
          this.$refs.form.validateField(name);
        });
      }
    },
    listSimpleUsers(id) {
      id &&
        listSimpleUsers({ deptId: id }).then((res) => {
          this.userOptions = res.data;
        });
    },
    changeDept(val) {
      if (val) {
        this.$set(this.form, "user", "");
        this.form.staffDeptId = val;
        this.listSimpleUsers(val);
      } else {
        this.$set(this.form, "user", "");
        this.userOptions = [];
      }
    },
    async listSimpleDepts() {
      this.deptOptions = [];
      listSimpleDepts().then((res) => {
        this.deptOptions.push(...this.handleTree(res.data, "id"));
      });
      return this.deptOptions;
    },
    // 查询客户列表
    getCustomerNameByLoginProject() {
      getCustomerNameByLoginProject().then((res) => {
        this.custList = res.data;
      });
    },
    queryProjectNameByLogin(val) {
      queryProjectNameByLogin({
        customerId: this.form.customerId || val
      }).then((res) => {
        this.projectList = res.data;
      });
    },
    changeAssetType(val) {
      this.form.modelId = "";
      this.modelList = [];
      this.getAssetModel(val);
      this.$nextTick(() => {
        this.$refs["form"].clearValidate("modelId");
      });
    },
    getAssetModel(val) {
      val &&
        getAssetModel({ assetTypeId: val }).then((res) => {
          this.modelList = res.data;
        });
    },
    getAssetTypeList() {
      getAssetTypeList({}).then((res) => {
        this.assetTypeList = res.data;
      });
    },
    cancel() {
      this.editVisible = false;
      this.$emit("closeAll");
      this.$refs.form.resetFields();
    },
    changeModel(val) {
      for (let key in this.form) {
        if (key.indexOf("_") > -1) {
          delete this.form[key];
        }
      }
      if (val) {
        getAssetModelDetail({ id: val }).then((res) => {
          this.itemsList = res.data.items;
          this.itemsList.forEach(item =>{
            item.isEdit = true
          })
          this.$refs["form"] && this.$refs["form"].clearValidate();
        });
      } else {
        this.itemsList = [];
      }
    },
    formSubmit() {
      let itemsLList = [] 
      this.itemsList.forEach(item =>{
        if( this.form[item.id + '_模型'] !== "" && this.form[item.id + '_模型'] !== null && this.form[item.id + '_模型'] !== undefined && !item.isEdit){
          itemsLList.push({
           itemCode: item.itemCode,
           itemValue: this.form[item.id + '_模型']
        })
        }
      })
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoad = true;
          const params = {
             idList: this.selectionIds,
             modelId: this.formData.modelId,
             items:itemsLList,
            }
          console.log(params);
          batchUpdateAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.$modal.msgSuccess(this.title + "成功");
                  // this.getAssetInfoCount();
                  this.cancel();
                  this.$emit("successAll");
                }
              })
              .catch(() => {
                this.formLoad = false;
              });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">

.iclass-text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 120px;
  &::before {
    content: "*";
    color: #ff4949;
    margin-right: 4px;
  }
}
</style>
