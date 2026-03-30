<template>
  <el-dialog :title="title" :visible.sync="editVisible" width="860px" :before-close="cancel">
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row :gutter="20" style="margin: 0 20px">
        <!-- <el-tabs>
            <el-tab-pane label="项目信息">
              <el-col :span="12">
                <el-form-item label="客户名称" prop="customerId">
                  <el-select v-model="form.customerId" placeholder="请选择客户名称" clearable @change="queryProjectNameByLogin">
                    <el-option v-for="(item, index) in custList" :key="index" :label="item.customerName" :value="item.id"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="项目名称" prop="projectId">
                   <el-select v-model="form.projectId" placeholder="请选择项目名称" clearable>
                    <el-option v-for="(item, index) in projectList" :key="item.id + index" :label="item.projectName" :value="item.id"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-tab-pane>
          </el-tabs> -->
        <el-tabs>
          <el-tab-pane label="基础信息">
            <el-col :span="12">
              <el-form-item label="资源类型" prop="assetTypeId">
                <el-select
                  @change="changeAssetType"
                  :disabled="isEditAble"
                  v-model="form.assetTypeId"
                  placeholder="请选择资源类型"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    :value="item.id"
                    v-for="item in assetTypeList"
                    :label="item.typeName"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资源名称" prop="assetName">
                <el-input
                  maxlength="20"
                  :disabled="isEditAble"
                  show-word-limit
                  clearable
                  v-model="form.assetName"
                  placeholder="请输入资源名称"
                  autocomplete="off"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="资源模型" prop="modelId">
                <el-select
                  v-model="form.modelId"
                  placeholder="请选择资源模型"
                  :disabled="isEditAble"
                  clearable
                  filterable
                  style="width: 100%"
                  @change="changeModel"
                >
                  <el-option
                    :value="item.id"
                    v-for="(item, index) in modelList"
                    :label="item.modelName"
                    :key="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>        
            <!-- <el-col :span="12">
              <el-form-item label="IP地址" prop="assetIp">
                <el-input
                  maxlength="20"
                  :disabled="isEditAble"
                  show-word-limit
                  clearable
                  v-model="form.assetIp"
                  placeholder="请输入IP地址"
                  autocomplete="off"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input type="textarea" clearable v-model="form.remark" placeholder="请输入备注" autocomplete="off" />
              </el-form-item>
            </el-col>
            <el-col :span="14">
              <el-form-item label="责任人" prop="staffDeptId">
                <el-cascader
                  :options="deptOptions"
                  v-model="form.staffDeptId"
                  :props="defaultParams"
                  @change="changeDept"
                  clearable
                  style="width: 100%"
                  placeholder="请选择部门"
                  :show-all-levels="true"
                ></el-cascader>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="" label-width="0" prop="user">
                <el-select v-model="form.user" placeholder="请选择负责人" clearable style="width: 100%">
                  <el-option
                    v-for="item in userOptions"
                    :key="item.id"
                    :label="item.nickname"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col> -->
          </el-tab-pane>
        </el-tabs>
        <el-tabs>
          <el-tab-pane label="模型信息" v-if="form.modelId">
            <el-col :span="24" v-for="(item, index) in itemsList" :key="index">
              <el-form-item
                v-if="item.itemDataType == 'OPTIONAL'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
                <el-select
                  :disabled="isEditAble"
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请选择${item.itemName}`"
                  clearable
                  filterable
                >
                  <el-option
                   v-for="dict in getDictDatas(item.itemCode)" :key="dict.value" :label="dict.label" :value="dict.label"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'DATETIME'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
                <el-time-picker
                  :disabled="isEditAble"
                  v-model="form[item.id + '_模型']"
                  type="datetime"
                  value-format="HH:mm:ss"
                  :placeholder="`请选择${item.itemName}`"
                >
                </el-time-picker>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'DATE'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >
                <el-date-picker
                  :disabled="isEditAble"
                  v-model="form[item.id + '_模型']"
                  type="date"
                  value-format="yyyy-MM-dd"
                  :placeholder="`请选择${item.itemName}`"
                >
                </el-date-picker>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'INTEGER'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' },
                  { pattern: /^[1-9]\d*$/, trigger: 'blur', message: '请输入正整数' }
                ]"
              >
                <el-input-number
                  ref="operationInt"
                  controls-position="right"
                  :disabled="isEditAble"
                  clearable
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  :min="1"
                  autocomplete="off"
                  @input="operationChange(item.id + '_模型', form[item.id + '_模型'])"
                ></el-input-number>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'FLOAT'"
                :label="item.itemName"
                :prop="item.id + '_模型'"
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' },
                  { pattern: /^(0|([1-9]\d*))(\.\d+)?$/, trigger: 'blur', message: '请输入浮点数' }
                ]"
              >
                <el-input-number
                  ref="operationFloat"
                  precision="2"
                  controls-position="right"
                  :disabled="isEditAble"
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  autocomplete="off"
                  @input="operationChange(item.id + '_模型', form[item.id + '_模型'])"
                ></el-input-number>
              </el-form-item>
              <el-form-item
                v-if="item.itemDataType == 'TEXT' || item.itemDataType == 'STRING'"
                :prop="item.id + '_模型'"
                :label="item.itemName"
             
                :rules="[
                  { required: item.isRequired ? true : false, message: `请输入${item.itemName}`, trigger: 'blur' }
                ]"
              >

                <el-input
                  :disabled="isEditAble"
                  clearable
                  v-model="form[item.id + '_模型']"
                  :placeholder="`请输入${item.itemName}`"
                  autocomplete="off"
                />
              </el-form-item>
            </el-col>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer" v-if="!isEditAble">
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
      isEditAble: false,
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
        }
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        console.log('233',this.formData)
        this.editVisible = val;
        console.log(this.editVisible);
        this.getAssetTypeList();
        // this.getAssetModel();
        this.getCustomerNameByLoginProject();
        this.form = {
          modelId: null,
          items: [],
          staffDeptId: []
        };
        if (this.title == "新增") {
          this.listSimpleDepts();
          this.form.assetTypeId = this.formData.assetTypeId;
          this.changeAssetType(this.form.assetTypeId);
          this.form.modelId = this.formData.modelId;
          this.changeModel(this.formData.modelId);
        }
        if (this.title == "详情") {
          this.isEditAble = true
        } else {
           this.isEditAble = false
        }
          
        if (this.title == "编辑" || this.title == "关联项目" || this.title == "详情") {
          this.modelId = this.formData.modelId;
          let _this = this;
          let result = this.listSimpleDepts();
          result.then((data) => {
            data && _this.getDetail(this.formData.id);
          });
          this.queryProjectNameByLogin(this.formData.customerId);
          this.changeModel(this.formData.modelId);
        }
      } else {
        this.$refs.form.resetFields();
      }
    }
    // formData: {
    //   handler(val) {
    //     if (this.title == "编辑" || this.title == "关联项目") {
    //       this.modelId = val.modelId;
    //       let _this = this;
    //       let result = this.listSimpleDepts();
    //       result.then((data) => {
    //         data && _this.getDetail(val.id);
    //       });
    //       this.queryProjectNameByLogin(val.customerId);
    //       this.changeModel(val.modelId);
    //     }
    //   },
    //   deep: true
    // }
  },
  inject: ["getAssetInfoCount"],
  methods: {
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
    getDetail(id) {
      getAssetInfo({ id: id }).then((res) => {
        this.form = res.data;
        this.items = res.data.assetAttribute;
        this.form.staffDeptId = res.data.staffs && res.data.staffs.length > 0 ? res.data.staffs[0].staffDeptId : "";
        this.$set(this.form, "user", (res.data.staffs && res.data.staffs.length > 0 && res.data.staffs[0].staffUserId) || "");
        this.listSimpleUsers((res.data.staffs && res.data.staffs.length > 0 && res.data.staffs[0].staffDeptId) || "");
        this.staffId = res.data.staffs && res.data.staffs.length > 0 ? res.data.staffs[0].id : null;
        
        // if(this.items ){
        //   let objArray = Object.entries(this.items)
        //   console.log("Cf-f-a-this.itemsList" + JSON.stringify(this.form))
        //   objArray.forEach(item =>{
        //       this.$set(this.form, item[0] + "_模型", item[1]);
        //       this.$set(this.form, item.itemId + "_" + item.id + "_主键", item.id);
        //   })
        //   // console.log("Cf==fas==fa" + JSON.stringify(objArray))
        // }
        
        let objArray = Object.entries(this.items)
        if(objArray && objArray.length > 0){
          this.itemsList.forEach(item =>{
            objArray.forEach(childItem =>{
              if(childItem[0] === item.itemCode){
                  this.$set(this.form, item.id + "_模型", childItem[1]);
                  this.$set(this.form, item.id + "_" + item.id + "_主键", item.id);
                  this.$set(this.form, item.id + "_isEditAble", item.isEditAble);
              }
            })
          })
        }
     
        // this.items.forEach((item) => {
        //   this.$set(this.form, item.itemId + "_模型", item.itemValue);
        //   this.$set(this.form, item.itemId + "_" + item.id + "_主键", item.id);
        //   this.$set(this.form, item.itemId + "_isEditAble", item.isEditAble);
        // });
        console.log("items===", this.items, this.form);
        this.getAssetModel(this.form.assetTypeId);
        this.$nextTick(() => {
          this.$refs.form.clearValidate();
        });
      });
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
      this.$emit("close");
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
          this.$refs["form"] && this.$refs["form"].clearValidate();
        });
      } else {
        this.itemsList = [];
      }
    },
    formSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.formLoad = true;
          let items = [];
          let newItems = [];
          for (let key in this.form) {
            console.log(key.indexOf("_模型"));
            if (key.indexOf("_模型") > 0) {
              items.push({
                itemId: Number(key.split("_模型")[0]), // 模型ID
                itemValue: this.form[key] // 模型名称
              });
            }
            if (key.indexOf("_主键") > 0 && this.modelId) {
              const index = key.split("_")[0];
              items.forEach((item) => {
                if (item.itemId == index) {
                  newItems.push({
                    id: Number(key.split("_")[1]) || undefined, // 模型ID
                    itemId: item.itemId, // 模型ID
                    itemValue: item.itemValue // 模型名称
                  });
                }
              });
            }
          }
          console.log(this.modelId, this.form.modelId, newItems, items);
          console.log("ne==", newItems);
          this.form.items = newItems.length > 0 && this.modelId == this.form.modelId ? newItems : items;
          this.itemsList.forEach(item =>{
            this.form.items.forEach(iItem =>{
              if(iItem.itemId == item.id){
                iItem.itemCode = item.itemCode
              }
            }) 
          })
          console.log(this.form);
          const params = {
            id: this.form.id, // id
            projectId: this.form.projectId, // 项目ID
            assetTypeId: this.form.assetTypeId, // 资产类型ID
            assetName: this.form.assetName, // 资产名称
            modelId: this.form.modelId, // 模型ID
            assetIp: this.form.assetIp, // 资产IP
            remark: this.form.remark, // 备注
            items: this.form.modelId ? this.form.items : [], // 模型列表
            staffs:
              (this.form.user == "" || this.form.user == undefined) &&
              (this.form.staffDeptId == "" || this.form.staffDeptId == undefined)
                ? []
                : [
                    {
                      id: this.staffId,
                      staffDeptId: this.form.staffDeptId,
                      staffUserId: this.form.staffDeptId ? this.form.user : "" // 用户ID
                    }
                  ]
          };
          console.log(params);
          if (this.title === "新增") {
            createAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.$modal.msgSuccess("新增成功");
                  // this.visible = false;
                  this.cancel();
                  this.$emit("success");
                }
              })
              .catch(() => {
                this.formLoad = false;
              });
          } else {
            updateAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.$modal.msgSuccess(this.title + "成功");
                  this.getAssetInfoCount();
                  this.cancel();
                  this.$emit("success");
                }
              })
              .catch(() => {
                this.formLoad = false;
              });
          }
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
