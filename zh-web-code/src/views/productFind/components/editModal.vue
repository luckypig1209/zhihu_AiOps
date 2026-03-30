<template>
  <a-drawer
    :title="rowData?.id ? $t('productFind.editScanTask') : $t('productFind.addScanTask')"
    :visible="showModal"
    width="800px"
    placement="right"
    :closable="true"
    :mask-closable="false"
    @close="cancel"
  >
    <div style="height: 80vh; overflow-y: auto;">
      <el-form ref="form" :model="form" :rules="rules" :label-width="0" label-width="150px">
        <el-row>
          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item prop="taskName" :label="$t('productFind.taskName')">
              <el-input :disabled="viewMode" v-model="form.taskName" :placeholder="$t('productFind.pleaseEnterTaskName')" clearable style="width: 100%;" />
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

          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item prop="scanObjType" :label="$t('productFind.scanObject')">
              <el-radio-group :disabled="viewMode" v-model="form.scanObjType" @change="handleScanObjTypeChange">
                <el-radio label="ip_discontinuous">{{ $t('productFind.ipRangeDiscontinuous') }}</el-radio>
                <el-radio label="ip_continuous">{{ $t('productFind.ipRangeContinuous') }}</el-radio>
                <el-radio label="ip_segment">{{ $t('productFind.ipSegmentWithMask') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item prop="scanObjValue" :label="$t('productFind.scanObjectValue')">
              <el-input
                v-model="form.scanObjValue"
                :placeholder="getScanObjPlaceholder"
                clearable
                :disabled="viewMode"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item prop="excludeAddr" :label="$t('productFind.excludeAddress')">
              <el-input
                v-model="form.excludeAddr"
                :placeholder="$t('productFind.pleaseEnterIPMultipleSeparatedByCommas')"
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

          <el-col :span="20" style="margin-bottom: 20px;" >
            <el-form-item prop="scheduleScanTime" :label="$t('productFind.executionTime')">
              <el-date-picker
              :disabled="viewMode"
                v-model="form.scheduleScanTime"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm"
                type="datetime"
                :placeholder="$t('productFind.selectExecutionTime')"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>

          <el-col :span="20" style="margin-bottom: 20px;">
            <el-form-item prop="description" :label="$t('productFind.description')">
              <el-input
              :disabled="viewMode"
                type="textarea"
                :rows="3"
                v-model="form.description"
                :placeholder="$t('productFind.pleaseEnterDescriptionOptional')"
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
      <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">{{ $t('productFind.confirm') }}</el-button>
      <el-button @click="cancel" :disabled="isSubmitDisabled">{{ $t('productFind.cancel') }}</el-button>
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
          { required: true, message: this.$t('productFind.pleaseEnterTaskName'), trigger: "blur" },
        ],
        scanSpeed: [
          { required: true, message: this.$t('productFind.pleaseSelectScanSpeed'), trigger: "blur" },
        ],
        scanObjType: [
          { required: true, message: this.$t('productFind.pleaseSelectScanObjectType'), trigger: "change" },
        ],
        scanObjValue: [
          { required: true, message: this.$t('productFind.pleaseEnterScanObjectValue'), trigger: "blur" },
        ],
        scanTimeType: [
          { required: true, message: this.$t('productFind.pleaseSelectScanTimeType'), trigger: "change" },
        ],
        scheduleScanTime: [
          {
            required: false,
            message: this.$t('productFind.pleaseSelectScheduledExecutionTime'),
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
        ip_discontinuous: this.$t('productFind.pleaseEnterIPMultipleSeparatedByCommas'),
        ip_continuous: this.$t('productFind.pleaseEnterIPRangeConnectedWithHyphen'),
        ip_segment: this.$t('productFind.pleaseEnterNetworkSegmentWithSubnetMask'),
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
          scanSpeed: this.rowData?.scanSpeed || this.$t('productFind.fast'),
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
          scanSpeed: this.$t('productFind.fast'),
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
              const tipText = this.rowData.id ? this.$t('productFind.edit') : this.$t('productFind.add');
              this.$message.success(`${this.$t('productFind.task')}${tipText}${this.$t('productFind.success')}`);
              this.showModal = false;
              this.$emit("refreshList"); // 提交成功后刷新列表
            } else {
              const tipText = this.rowData.id ? this.$t('productFind.edit') : this.$t('productFind.add');
              this.$message.error(`${tipText}${this.$t('productFind.failed')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
            }
          })
          .catch(err => {
            const tipText = this.rowData.id ? this.$t('productFind.edit') : this.$t('productFind.add');
            // this.$message.error(`${tipText}任务失败，请重试`);
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
