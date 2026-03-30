<template>
  <a-drawer
    :title="rowData?.id ? '编辑扫描任务' : '新增扫描任务'"
    :visible="showModal"
    width="800px"
    placement="right"
    :closable="true"
    :mask-closable="false"
    @close="cancel"
  >
    <div style="height: 80vh; overflow-y: auto;">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <!-- 任务名称 -->
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="任务名称" prop="taskName">
              <el-input :disabled="viewMode" v-model="form.taskName" placeholder="请输入任务名称" clearable style="width: 100%;" />
            </el-form-item>
          </el-col>

          <!-- 扫描速度 -->
          <!-- <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="扫描速度" prop="scanSpeed">
              <el-select
                v-model="form.scanSpeed"
                placeholder="请选择扫描速度"
                clearable
                style="width: 100%;"
                show-tooltip
              >
                <el-option
                  label="快速"
                  value="快速"
                  title="快速：快速发现活跃主机和服务，仅扫描常用的1000个端口，常用日常资产盘点、网络监控"
                />
              
              </el-select>
            </el-form-item>
          </el-col> -->

          <!-- 扫描对象 -->
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="扫描对象" prop="scanObjType">
              <el-radio-group :disabled="viewMode" v-model="form.scanObjType" @change="handleScanObjTypeChange">
                <el-radio label="ip_discontinuous">IP范围（不连续）</el-radio>
                <el-radio label="ip_continuous">IP范围（连续）</el-radio>
                <el-radio label="ip_segment">IP网段（掩码）</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <!-- 扫描对象输入框（根据类型切换提示） -->
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="扫描对象值" prop="scanObjValue">
              <el-input
                v-model="form.scanObjValue"
                :placeholder="getScanObjPlaceholder"
                clearable
                :disabled="viewMode"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <!-- 排除地址 -->
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="排除地址" prop="excludeAddr">
              <el-input
                v-model="form.excludeAddr"
                placeholder="请输入IP，多个以英文逗号分隔，示例：10.2.2.2,10.2.3.5"
                clearable
                :disabled="viewMode"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <!-- 扫描时间 -->
          <!-- <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="扫描时间" prop="scanTimeType">
              <el-radio-group :disabled="viewMode" v-model="form.scanTimeType" @change="handleScanTimeTypeChange">
                <el-radio label="immediate">立即执行</el-radio>
                <el-radio label="scheduled">定时执行</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->

          <!-- 定时执行时间选择器 -->
          <el-col :span="20" style="margin-bottom: 20px;" >
            <el-form-item label="执行时间" prop="scheduleScanTime">
              <el-date-picker
              :disabled="viewMode"
                v-model="form.scheduleScanTime"
                value-format="yyyy-MM-dd HH:mm"
                type="datetime"
                placeholder="选择执行时间"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <!-- 描述 -->
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item label="描述" prop="description">
              <el-input
              :disabled="viewMode"
                type="textarea"
                :rows="3"
                v-model="form.description"
                placeholder="请输入描述（非必填）"
                clearable
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <div class="dialog-footer" v-if="!viewMode">
      <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">确 定</el-button>
      <el-button @click="cancel" :disabled="isSubmitDisabled">取 消</el-button>
    </div>
  </a-drawer>
</template>

<script>
import { createScanTask, updateScanTask } from '@/api/productFind';
export default {
  name: "TaskForm",
  props: {
    rowData: {
      type: Object,
      default: () => ({}),
    },
    viewMode: {  // 新增：查看模式控制 props，默认false（编辑/新增模式）
      type: Boolean,
      default: false,
    },    
  },
  data() {
    return {
      showModal: false,
      isSubmitDisabled: false,
      form: {
        taskName: "",
        scanSpeed: "快速",
        scanObjType: "ip_discontinuous",
        scanObjValue: "",
        excludeAddr: "",
        scanTimeType: "immediate",
        scheduleScanTime: "",
        description: "",
        id: "",
      },
      rules: {
        taskName: [
          { required: true, message: "请输入任务名称", trigger: "blur" },
        ],
        scanSpeed: [
          { required: true, message: "请选择扫描速度", trigger: "blur" },
        ],
        scanObjType: [
          { required: true, message: "请选择扫描对象类型", trigger: "change" },
        ],
        scanObjValue: [
          { required: true, message: "请输入扫描对象值", trigger: "blur" },
        ],
        scanTimeType: [
          { required: true, message: "请选择扫描时间类型", trigger: "change" },
        ],
        scheduleScanTime: [
          {
            required: false,
            message: "请选择定时执行时间",
            trigger: "blur",

          },
        ],
      },
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        this.initForm();
      } else {
        this.form = {
          taskName: "",
          scanSpeed: "快速",
          scanObjType: "ip_discontinuous",
          scanObjValue: "",
          excludeAddr: "",
          scanTimeType: "immediate",
          scheduleScanTime: "",
          description: "",
          id: "",
        };
        this.$refs.form?.resetFields();
        this.isSubmitDisabled = false;
      }
    },
  },
  computed: {
    getScanObjPlaceholder() {
      const placeholders = {
        ip_discontinuous: "请输入IP，多个以英文逗号分隔，示例：10.2.2.2,10.2.3.5",
        ip_continuous: "请输入IP范围，以-连接，示例：10.2.12.0-255",
        ip_segment: "请输入带有子网掩码的网段，示例：10.2.12.0/24",
      };
      return placeholders[this.form.scanObjType] || "";
    },
  },
  methods: {
    // 显示弹窗
    show() {
      this.showModal = true;
    },

    // 初始化表单
    initForm() {
 
      if (this.rowData.id) {
        // 编辑场景回显数据（适配父组件传入的 record 格式）
        this.form = {
          id: this.rowData?.id || '',
          taskName: this.rowData?.taskName || '',
          // 优化：优先使用rowData中的扫描速度，无则默认快速
          scanSpeed: this.rowData?.scanSpeed || "快速",
          // 优化：优先使用rowData中的扫描对象类型，无则默认不连续IP
          scanObjType: this.rowData?.scanObjType || "ip_discontinuous",
          scanObjValue: this.rowData?.scanObj || "", // 父组件 scanObj 对应接口 scanTarget
          excludeAddr: this.rowData?.excludeTarget || "", // 排除地址回显
          scanTimeType: this.rowData?.scheduleScanTime ? "scheduled" : "immediate",
          scheduleScanTime: this.rowData?.scheduleScanTime || "",
          // 修复：备注回显（使用rowData的description或taskDescription字段）
          description: this.rowData?.taskDescription || "",
        };
      } else {
        // 新增场景初始化
        this.form = {
          taskName: "",
          scanSpeed: "快速",
          scanObjType: "ip_discontinuous",
          scanObjValue: "",
          excludeAddr: "",
          scanTimeType: "immediate",
          scheduleScanTime: "",
          description: "",
          id: "",
        };
      }
    },

    // 扫描对象类型切换
    handleScanObjTypeChange() {
      this.form.scanObjValue = "";
    },

    // 扫描时间类型切换
    handleScanTimeTypeChange() {
      if (this.form.scanTimeType === "immediate") {
        this.form.scheduleScanTime = "";
      }
    },

    // 取消操作
    cancel() {
      this.showModal = false;
    },

    // 提交表单（联调新增/编辑接口）
    handleSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) return;

        // 组装接口提交数据
        const submitData = {
          taskName: this.form.taskName,
          // scanSpeed: this.form.scanSpeed, // 补充：扫描速度
          scanObjType: this.form.scanObjType, // 补充：扫描对象类型
          scanTarget: this.form.scanObjValue, // 扫描对象值映射接口 scanTarget
          excludeTarget: this.form.excludeAddr || "", // 保留：排除地址（空值处理为""）
          taskDescription: this.form.description || "", // 任务描述（空值处理为""）
          scanTimeType: this.form.scanTimeType || "", // 补充：扫描时间类型
          scheduleScanTime: this.form.scheduleScanTime  || "", // 补充：定时时间（立即执行时传空）
        };

        // 编辑场景补充任务ID
        if (this.rowData.id) {
          submitData.id = this.rowData.id;
        }

        this.isSubmitDisabled = true;
        // 区分新增/编辑接口请求
        const requestPromise = this.rowData.id 
          ? updateScanTask(submitData) 
          : createScanTask(submitData);

        requestPromise
          .then(res => {
            if (res.code === 0 && res.data) {
              const tipText = this.rowData.id ? "编辑" : "新增";
              this.$message.success(`任务${tipText}成功`);
              this.showModal = false;
              this.$emit("refreshList"); // 提交成功后刷新列表
            } else {
              const tipText = this.rowData.id ? "编辑" : "新增";
              this.$message.error(`${tipText}失败：${res.msg || "接口请求异常"}`);
            }
          })
          .catch(err => {
            const tipText = this.rowData.id ? "编辑" : "新增";
            this.$message.error(`${tipText}任务失败，请重试`);
            console.error("接口请求异常：", err);
          })
          .finally(() => {
            this.isSubmitDisabled = false; // 无论成功失败，恢复按钮状态
          });
      });
    },
  },
};
</script>

<style scoped lang="less">
.dialog-footer {
  text-align: right;
  margin-top: 20px;

  :deep(.el-button) {
    margin-left: 8px;
  }
}
</style> 