<template>
  <el-drawer
    :title="title"
    size="40%"
    :visible="visible"
    @close="handleClose"
    :before-close="handleClose"
  >
    <el-tabs v-model="activeTab" style="margin-left: 20px;margin-right: 20px;">
      <!-- 资产信息 Tab -->
      <el-tab-pane label="资产信息" name="manual">
        <!-- 资产信息表单：Element UI 表单通过 model/rules 绑定，ref 用于校验 -->
        <el-form
          ref="assetForm"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="asset-form"
        >

          <!-- 动态生成字段：根据 itemsList 渲染不同类型表单项 -->
          <el-form-item
            v-for="(item, index) in itemsList"
            :key="index"
            :label="item.itemName"
            :prop="`${item.id}_模型`"  
            :required="item.isRequired"
          >
            <!-- 下拉选择（OPTIONAL） -->
            <el-select
              v-if="item.itemDataType === 'OPTIONAL'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              placeholder="请选择"
              clearable
              filterable
            >
              <el-option
                v-for="dict in getDictDatas(item.itemCode)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>

            <!-- 时间选择器（DATETIME） -->
            <el-time-picker
              v-else-if="item.itemDataType === 'DATETIME'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              placeholder="请选择时间"
              style="width: 100%"
              clearable
            />

            <!-- 日期选择器（DATE） -->
            <el-date-picker
              v-else-if="item.itemDataType === 'DATE'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="请选择日期"
              style="width: 100%"
              clearable
            />

            <!-- 整数输入（INTEGER） -->
            <el-input-number
              v-else-if="item.itemDataType === 'INTEGER'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              :min="1"
              @change="(val) => operationChange(`${item.id}_模型`, val)"
              placeholder="请输入正整数"
              controls-position="right"
              style="width: 100%"
            />

            <!-- 浮点数输入（FLOAT） -->
            <el-input-number
              v-else-if="item.itemDataType === 'FLOAT'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              :precision="2"
              @change="(val) => operationChange(`${item.id}_模型`, val)"
              placeholder="请输入最多2位小数"
              style="width: 100%"
            />

            <!-- 文本输入（TEXT/STRING） -->
            <el-input
              v-else-if="item.itemDataType === 'TEXT' || item.itemDataType === 'STRING'"
              v-model="form[`${item.id}_模型`]"
              :disabled="isEditAble"
              placeholder="请输入内容"
              clearable
              style="width: 100%"
            />
          </el-form-item>

          <!-- 提交/取消按钮 -->
          <el-form-item>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
            <el-button @click="handleClose" style="margin-left: 8px">取消</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 监控信息 Tab -->
      <el-tab-pane label="监控信息" name="file">
         <!-- 硬件资产 -->
        <el-form
          v-if="assertInfo.modelName === '网络设备' 
                || assertInfo.modelName === 'AC'
                || assertInfo.modelName === '物理机'
                || assertInfo.modelName === '存储'
                || assertInfo.modelName === '安全设备'"
          ref="monitorForm"
          :model="form1"
          :rules="rules1"
          label-width="120px"
          class="monitor-form"
          style="margin-top: 20px"
        >
          <el-form-item label="监控地址" prop="monitorAddress">
            <el-input-group compact style="display: flex;">
              <el-input
                v-model="form1.monitorIp"
                placeholder="IP地址"
                clearable
              />
              <span style="margin: 0 10px;">:</span>
              <el-input
                v-model="form1.monitorPort"
                placeholder="端口"
                style="width: 120px"
                clearable
              />
            </el-input-group>
          </el-form-item>

          <el-form-item label="SNMP版本" prop="snmpVersion">
            <el-select
              v-model="form1.snmpVersion"
              placeholder="请选择SNMP版本"
              clearable
            >
              <el-option label="SNMP v2c" value="v2c" />
              <el-option label="SNMP v3" value="v3" />
            </el-select>
          </el-form-item>

          <el-form-item label="SNMP团体名" prop="snmpCommunity">
            <el-input
              v-model="form1.snmpCommunity"
              type="password"
              placeholder="请输入SNMP团体名"
              clearable
            />
          </el-form-item>

          <el-form-item label="SNMP批量请求" prop="snmpBatch">
            <el-switch v-model="form1.snmpBatch" active-text="开启" inactive-text="关闭" />
          </el-form-item>

          <el-form-item>
            <el-button
              @click="handleTest"
              style="background: orange; color: #fff; border: none"
              :disabled="!form1.monitorIp || !form1.snmpCommunity"
            >
              测试连接
            </el-button>
          </el-form-item>
        </el-form>
        <!-- 终端设备 -->
         <el-form
          v-if="assertInfo.modelName === '终端设备' "
          ref="monitorForm"
          :model="form1"
          :rules="rules1"
          label-width="120px"
          class="monitor-form"
          style="margin-top: 20px"
        >
          <el-form-item label="监控地址" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="监控地址"
                clearable
              />
          </el-form-item>

          <el-form-item label="监控间隔时间" prop="snmpVersion">
            <el-select
              v-model="form1.snmpVersion"
              placeholder="请选择SNMP版本"
              clearable
            >
              <el-option label="10s" value="10" />
              <el-option label="60s" value="60" />
            </el-select>
          </el-form-item>

         

      

          <el-form-item>
            <el-button
              @click="handleTest"
              style="background: orange; color: #fff; border: none"
              :disabled="!form1.monitorIp || !form1.snmpCommunity"
            >
              测试连接
            </el-button>
          </el-form-item>
        </el-form>
        <!-- 操作系统 -->
         <el-form
          v-if="assertInfo.modelName === '操作系统' "
          ref="monitorForm"
          :model="form1"
          :rules="rules1"
          label-width="120px"
          class="monitor-form"
          style="margin-top: 20px"
        >
          <el-form-item label="IP地址" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="IP地址"
                clearable
              />
          </el-form-item>

         <el-form-item label="SSH端口" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="SSH端口"
                clearable
              />
          </el-form-item>

          <el-form-item label="root账号" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="root账号"
                clearable
              />
          </el-form-item>

          <el-form-item label="root密码" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="root密码"
                clearable
              />
          </el-form-item>

          <el-form-item label="主机名" prop="monitorAddress">
            <el-input
                v-model="form1.monitorIp"
                placeholder="主机名"
                clearable
              />
          </el-form-item>

          <el-form-item>
            <el-button
              @click="handleTest"
              style="background: orange; color: #fff; border: none"
              :disabled="!form1.monitorIp || !form1.snmpCommunity"
            >
              测试连接
            </el-button>
          </el-form-item>
        </el-form>        
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script>
import { Message } from 'element-ui';
import {
  listSimpleUsers,
  createAssetInfo,
  updateAssetInfo,
  getAssetInfo,
  getAssetModel,
  getAssetTypeList,
  getAssetModelDetail
} from "@/api/resource";
import { tileLayer } from 'leaflet';
export default {
  name: 'DeviceForm',
  props: {
    visible: { type: Boolean, default: false },
    isEdit: { type: Boolean, default: false },
    initialData: { type: Object, default: () => ({}) }, // 编辑模式初始数据
    assertInfo:{type: Object, default: () => ({})}
  },
  data() {
    return {
      isEditAble: false, // 控制表单是否禁用（可扩展为"查看模式"）
      activeTab: 'manual', // 当前激活的Tab
      fileList: [], // 上传文件列表

      // 1. 资产信息表单模型（Element UI 需显式声明，非Form实例）
      form: {
        name: '', // 设备名称（基础字段）
        group: '默认根群组', // 所属群组（默认值）
        manufacturer: '', // 制造商
        agent: 'none', // 代理类型（默认无）
        expireTime: null, // 过期时间
        location: '' // 设备位置
        // 动态字段将通过 $set 追加：${item.id}_模型
      },

      // 2. 监控信息表单模型
      form1: {
        monitorIp: '', // 监控IP
        monitorPort: '161', // 监控端口（默认161）
        snmpVersion: 'v2c', // SNMP版本（默认v2c）
        snmpCommunity: '', // SNMP团体名
        snmpBatch: true // 批量请求（默认开启）
      },

      // 制造商下拉选项
      manufacturerOptions: [
        { label: '华为', value: '华为' },
        { label: 'TP-Link', value: 'TP-Link' },
        { label: '锐捷', value: '锐捷' },
        { label: '新华三', value: '新华三' },
        { label: '思科', value: '思科' }
      ],

      // 3. 表单校验规则（基础规则 + 动态规则）
      rules: {
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        manufacturer: [{ required: true, message: '请选择制造商', trigger: 'change' }],
        group: [{ required: true, message: '请输入所属群组', trigger: 'blur' }],
        agent: [{ required: true, message: '请选择代理类型', trigger: 'change' }]
      },

      // 4. 监控表单校验规则
      rules1: {
        monitorIp: [{ required: true, message: '请输入监控IP', trigger: 'blur' }],
        monitorPort: [
          { required: true, message: '请输入监控端口', trigger: 'blur' },
          { pattern: /^[0-9]{1,5}$/, message: '端口需为1-5位数字', trigger: 'blur' }
        ],
        snmpVersion: [{ required: true, message: '请选择SNMP版本', trigger: 'change' }],
        snmpCommunity: [{ required: true, message: '请输入SNMP团体名', trigger: 'blur' }]
      },

      itemsList: [], // 动态字段配置列表（从接口获取）
      formLoad: false,
      // modelId: undefined, //模型id
      // assetTypeId: undefined, //资产类型id
      assetName:''
    };
  },
  computed: {
    // 抽屉标题（根据编辑/新增模式切换）
    title() {
      return this.isEdit ? '编辑' + this.assertInfo.modelName : '创建' + this.assertInfo.modelName;
    }
  },
  watch: {
    // 抽屉显示/隐藏时的初始化/重置逻辑
    visible(val) {
      if (val) {        
        this.$nextTick(() => { // 确保DOM渲染完成后操作表单
          if (this.isEdit) {
            this.changeModel(this.assertInfo.modelId);
           
            // this.initEditData(); // 编辑模式：填充初始数据
          } else {
            this.changeModel(this.assertInfo.modelId); // 新增模式：加载默认模型（222为默认模型ID）
          }
        });
      } else {
        this.resetForms(); // 关闭抽屉：重置所有表单
        this.fileList = []; // 清空上传文件
      }
    }
  },
  methods: {
    getDetail(id) {
      getAssetInfo({ id: id }).then((res) => {
        this.form = res.data;
        let items = res.data.assetAttribute;
         
        let objArray = Object.entries(items)
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
     
       
        // console.log("items===", this.items, this.form);
        // this.getAssetModel(this.assetTypeId);
        // this.$nextTick(() => {
        //   this.$refs.form.clearValidate();
        // });
      });
    },    
    // 关闭抽屉：向父组件emit关闭事件
    handleClose() {
      this.clearDynamicFields()
      this.$emit('close')
    },
    getMonitorType(modelCode){
      let monitorType = 0
      switch (modelCode) {
        case 'storagebase': //数据库
          monitorType = 2
          break;
        case 'networkdevice': //网络设备
          monitorType = 1
          break;      
        default:
          break;
      }
      return monitorType
    },
    handleSubmit() {
      this.$refs.assetForm.validate((valid) => {
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

            if (key.indexOf("_主键") > 0 && this.assertInfo.modelId) {
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
          
        
          console.log("ne==", newItems);
          this.form.items = newItems.length > 0 && this.assertInfo.modelId == this.form.modelId ? newItems : items;
          this.itemsList.forEach(item =>{
            this.form.items.forEach(iItem =>{
              if(iItem.itemId == item.id){
                iItem.itemCode = item.itemCode
              }
            }) 
          })
          let assertName = ''
          this.form.items.forEach(item =>{
            if(item.itemCode === 'name'){
              assertName = item.itemValue
            }
          })
          console.log(this.form);
          const params = {
            id: this.form.id? this.form.id : undefined, // id
            assetTypeId: this.assertInfo.assetTypeId, // 资产类型ID
            assetName:  assertName,
            modelId: this.assertInfo.modelId, // 模型ID
            modelCode: this.assertInfo.modelCode, //模型标识
            items: this.assertInfo.modelId ? this.form.items : [], // 模型列表
            assetSnmp:{
              monitorType: this.getMonitorType(this.assertInfo.modelCode)
            }
          };
          console.log(params);
          if (this.title === "创建网络设备") {
            createAssetInfo(params)
              .then((res) => {
                if (res.code === 0) {
                  this.formLoad = false;
                  this.$modal.msgSuccess("新增成功");
               
                  this.handleClose();
                  this.$emit("createDevice");
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
                   this.handleClose();
                  this.$emit("updateDevice");
                }
              })
              .catch(() => {
                this.formLoad = false;
              });
          }
        }
      });
    },


    // 动态字段值变更（确保响应式：Element UI 普通对象需用 $set）
    operationChange(field, value) {
      this.$set(this.form, field, value);
    },

    // 加载模型字段配置（新增/编辑通用）
    changeModel(modelId) {
      if (!modelId) {
        this.itemsList = [];
        return;
      }

      // 1. 清空现有动态字段和规则
      this.clearDynamicFields();

      // 2. 接口获取模型字段配置
      getAssetModelDetail({ id: modelId })
        .then((res) => {
          if (res.data?.items && res.data.items.length) {
            this.itemsList = res.data.items;
            this.generateDynamicRules(); // 生成动态校验规则

            // 编辑模式：填充动态字段初始值
            if (this.isEdit) {
              this.getDetail(this.initialData.id);
            } else {
              // 新增模式：初始化动态字段为空（避免v-model绑定警告）
              this.itemsList.forEach(item => {
                this.$set(this.form, `${item.id}_模型`, '');
              });
            }
          } else {
            Message.error('模型字段加载失败，未找到配置');
          }
        })
        .catch(() => {
          Message.error('模型字段请求异常，请检查接口');
        });
    },

    // 生成动态字段校验规则（适配Element UI规则格式）
    generateDynamicRules() {
      this.itemsList.forEach(item => {
        const fieldName = `${item.id}_模型`;
        // 基础规则：必填项 + 提示信息
        const baseRule = {
          required: item.isRequired,
          message: item.isRequired 
            ? `请输入${item.itemName}` 
            : `请选择${item.itemName}`,
          // 触发时机：选择/日期类用change，输入类用blur
          trigger: ['OPTIONAL', 'DATE', 'DATETIME'].includes(item.itemDataType) 
            ? 'change' 
            : 'blur'
        };

        // 扩展规则：数据格式校验（整数/浮点数）
        const fieldRules = [baseRule];
        if (item.itemDataType === 'INTEGER') {
          fieldRules.push({
            pattern: /^[1-9]\d*$/,
            message: `${item.itemName}需为正整数`,
            trigger: 'blur'
          });
        } else if (item.itemDataType === 'FLOAT') {
          fieldRules.push({
            pattern: /^(0|([1-9]\d*))(\.\d{1,2})?$/,
            message: `${item.itemName}最多支持2位小数`,
            trigger: 'blur'
          });
        }

        // 动态添加规则到rules（确保响应式）
        this.$set(this.rules, fieldName, fieldRules);
      });
    },


    // 编辑模式：填充动态字段初始值
    setEditDynamicFields() {
      const { initialData } = this;
      if (!initialData || !this.itemsList.length) return;

      this.itemsList.forEach(item => {
        const fieldName = `${item.id}_模型`;
        // 假设initialData中动态字段key与fieldName一致
        if (initialData[fieldName] !== undefined) {
          this.$set(this.form, fieldName, initialData[fieldName]);
        } else {
          this.$set(this.form, fieldName, ''); // 默认空值
        }
      });
    },

    // 清空动态字段和规则（避免残留）
    clearDynamicFields() {
      // 1. 删除form中的动态字段（含"_模型"后缀）
      // Object.keys(this.form).forEach(key => {
      //   if (key.includes('_模型')) {
      //     this.$delete(this.form, key);
      //   }
      // });

      // // 2. 删除rules中的动态规则
      // Object.keys(this.rules).forEach(key => {
      //   if (key.includes('_模型')) {
      //     this.$delete(this.rules, key);
      //   }
      // });
      this.form = {}
      this.rules ={}
    },

    // 重置所有表单（关闭抽屉时调用）
    resetForms() {
      // 重置资产表单
      if (this.$refs.assetForm) {
        this.$refs.assetForm.resetFields();
      }
      // 重置监控表单
      if (this.$refs.monitorForm) {
        this.$refs.monitorForm.resetFields();
      }
      // 清空动态字段列表
      this.itemsList = [];
    },

    // 获取字典数据（示例：实际项目需对接字典接口）
    getDictDatas(code) {
      const dictMap = {
        device_status: [
          { label: '在线', value: 'online' },
          { label: '离线', value: 'offline' },
          { label: '故障', value: 'error' }
        ],
        device_type: [
          { label: '路由器', value: 'router' },
          { label: '交换机', value: 'switch' },
          { label: '防火墙', value: 'firewall' }
        ]
        // 可扩展更多字典类型
      };
      return dictMap[code] || [];
    },

    // SNMP连接测试
    handleTest() {
      const monitorForm = this.$refs.monitorForm;
      if (!monitorForm) {
        Message.error('监控表单未加载完成');
        return;
      }

      // 校验监控表单
      monitorForm.validate((isValid) => {
        if (!isValid) return;

        // 测试逻辑（实际项目替换为SNMP测试接口）
        Message.info('正在测试SNMP连接...');
        // 示例：调用测试接口
        // testSnmpConnect(this.form1).then(res => {
        //   if (res.success) Message.success('SNMP连接成功');
        //   else Message.error('SNMP连接失败：' + res.message);
        // });
      });
    },

    // 上传文件校验（仅允许Excel）
    beforeUpload(file) {
      const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isXLSX) {
        Message.error('仅支持上传 .xlsx 格式的Excel文件');
        return false;
      }
      // 限制文件大小（可选）
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        Message.error('文件大小不能超过10MB');
        return false;
      }
      return true;
    },

    // 上传文件变更（更新文件列表）
    handleUploadChange(file, fileList) {
      // 仅保留最新选择的一个文件（可改为多文件）
      this.fileList = [fileList[fileList.length - 1]];
    },

    // 确认导入文件
    handleFileUpload() {
      if (this.fileList.length === 0) {
        Message.warning('请先选择导入文件');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.fileList[0].raw); // raw为Element UI的原始文件对象

      // 向父组件emit上传事件（实际项目可直接调用导入接口）
      this.$emit('uploadExcel', formData);
      this.fileList = [];
      Message.success('导入请求已发送，等待处理...');
    },

    // 下载导入模板
    downloadTemplate() {
      // 实际项目替换为模板下载接口
      // window.open('/api/device/exportTemplate', '_blank');
      Message.info('模板下载功能待实现（请配置下载接口）');
    }
  }
};
</script>

<style scoped>
/* 表单样式调整 */
.asset-form, .monitor-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

/* 上传区域样式 */
.upload-section {
  margin-top: 30px;
  padding: 20px;
  border-top: 1px dashed #e6e6e6;
  text-align: center;
}

.upload-section p {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

/* 按钮样式补充 */
.el-button[style*="background: orange"]:hover {
  background: #ff8c00 !important;
}
::v-deep .el-form-item__label {
  font-weight: bold !important;
}
</style>