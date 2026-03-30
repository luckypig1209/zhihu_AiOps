<template>
  <a-drawer
    :title="opt"
    :visible="showModal"
    width="1080px"
    placement="right"
    :closable="true"
    :mask-closable="false"
    @close="cancel"
  >
    <div style="height: 80vh; overflow-y: auto">
      <!-- 步骤条：仅保留通知配置 -->
      <!-- <el-steps :active="0" finish-status="success" simple>
        <el-step title="通知配置"></el-step>
      </el-steps> -->

      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <!-- 仅保留通知配置模块 -->
        <div>
          <el-row>
            <el-col :span="20" style="margin-bottom: 20px">
              <el-form-item
                label="模板名称"
                :rules="{
                  required: true,
                  message: '请输入模板名称',
                  trigger: 'change',
                }"
                prop="channelString"
              >
                <a-input
                  v-model="form.ruleName"
                  placeholder="请输入模板名称"
                  allowClear
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <!-- 通知类型选择 -->
            <el-col :span="10" style="margin-bottom: 20px">
              <el-form-item
                label="适用设备类型"
                :rules="{
                  required: true,
                  message: '请选择适用资源模型',
                  trigger: 'change',
                }"
                prop="selectedProvince"
              >
                <a-select
                  v-model="form.selectedProvince"
                  @change="handleProvinceChange"
                  placeholder="请选择适用资源模型"
                  style="width: 200px; margin-right: 10px"
                  :not-found-content="$t('common.noData')"
                >
                  <a-select-option
                    v-for="prov in provinces"
                    :key="prov.value"
                    :value="prov.value"
                  >
                    {{ prov.label }}
                  </a-select-option>
                </a-select>
              </el-form-item>
            </el-col>

            <el-col :span="10" style="margin-bottom: 20px">
              <el-form-item
                label="适用资源模型"
                :rules="{
                  required: true,
                  message: '请选择适用资源模型',
                  trigger: 'change',
                }"
                prop="selectedCity"
              >
                <a-select
                  v-model="form.selectedCity"
                  placeholder="请选择适用资源模型"
                  style="width: 200px"
                  :disabled="!form.selectedProvince"
                >
                  <a-select-option
                    v-for="city in cities"
                    :key="city.value"
                    :value="city.value"
                  >
                    {{ city.label }}
                  </a-select-option>
                </a-select>
              </el-form-item>
            </el-col>

            <el-col :span="20" style="margin-bottom: 20px">
              <el-form-item label="备注" prop="remarks">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="form.remarks"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="20" style="margin-bottom: 20px">
              <el-form-item label="指标配置" prop="">
                <el-button type="primary"  @click="showModalNew">指标配置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button
        type="primary"
        @click="handleSubmit('form')"
        :loading="isSubmitDisabled"
        >确 定</el-button
      >
      <el-button @click="cancel" :disabled="isSubmitDisabled">取 消</el-button>
    </div>
     <IndicatorConfig
      :visible="configVisible"
      :device-type="selectedDeviceType"
      @save="onSave"
      @update:visible="configVisible = $event"
    />
  </a-drawer>
</template>

<script>
import { updateMessage, getRuleDetail } from "@/api/monitor/task";
import IndicatorConfig from './IndicatorConfig.vue';

export default {
  name: "NoticeConfigForm",
  components: { IndicatorConfig },
  props: {
    rowData: Object, // 接收外部传入的规则数据（主要用于编辑场景的通知配置回显）
    opt: {
      // 操作类型：新增/编辑
      type: String,
      default: "新增通知对象",
    },
  },
  data() {
    return {
       configVisible: false,
      selectedDeviceType: 'server',
      provinces: [
        { value: "guangdong", label: "广东省" },
        { value: "jiangsu", label: "江苏省" },
        { value: "sichuan", label: "四川省" },
      ],

      // 城市映射表（模拟后端数据）
      cityMap: {
        guangdong: [
          { value: "guangzhou", label: "广州市" },
          { value: "shenzhen", label: "深圳市" },
        ],
        jiangsu: [
          { value: "nanjing", label: "南京市" },
          { value: "suzhou", label: "苏州市" },
        ],
        sichuan: [
          { value: "chengdu", label: "成都市" },
          { value: "mianyang", label: "绵阳市" },
        ],
      },
      cities: [], // 动态的城市选项
      userOptions: [],
      isSubmitDisabled: false,
      showModal: false,
      loading: false,

      // 表单数据：仅保留通知配置相关字段
      form: {
        ruleName: "",
        remarks: "",
        selectedProvince: "", // 当前选中的省份
        selectedCity: "", // 当前选中的城市
      },

      // 通知模板配置：仅保留需要的通知类型（钉钉/企业微信/电信集约化服务台）
      noticeTemplates: {
        dd: {
          key: "dd",
          value: [{ webhookUrl: "", secret: "" }],
          label: "钉钉",
        },
        qywx: {
          key: "qywx",
          value: [{ webhookUrl: "", secret: "" }],
          label: "企业微信",
        },
        szh: { key: "szh", value: [{ name: "", code: "" }], label: "电信集约化服务台" },
      },

      // 标签输入值（用于通知配置中in/not in场景的标签输入）
      inputValue: "",

      // 表单校验规则：仅保留通知类型选择的校验
      rules: {
        channelString: [
          {
            required: true,
            message: "请至少选择一种通知方式",
            trigger: "change",
          },
        ],
      },
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        // 显示弹窗时：重置通知配置模板
        Object.keys(this.noticeTemplates).forEach((key) => {
          if (key === "dd" || key === "qywx") {
            this.noticeTemplates[key].value = [{ webhookUrl: "", secret: "" }];
          } else if (key === "szh") {
            this.noticeTemplates[key].value = [{ name: "", code: "" }];
          }
        });
        // 初始化数据（编辑场景回显）
        this.init(this.rowData);
      } else {
        // 关闭弹窗时：重置表单
        this.form = { channelString: [] };
        this.$refs.form?.resetFields();
        this.isSubmitDisabled = false;
        this.inputValue = "";
      }
    },
  },
  methods: {
     showModalNew() {
      this.configVisible = true;
    },
    onSave(indicators) {
      console.log('保存的指标:', indicators);
      // 提交到后端或更新状态
    },
     // 当选择省份时触发
    handleProvinceChange(value) {
      // 根据选择的省份，更新城市列表
      this.cities = this.cityMap[value] || [];
      // 清空已选择的城市
      this.form.selectedCity = "";
    },
    

 

    

 

   


    // 初始化表单（编辑场景回显通知配置）
    init(row) {
      if (Object.keys(row).length === 0) {
        // 新增场景：重置表单
        this.$refs.form?.resetFields();
      } else {
        // 编辑场景：回显通知配置
        this.getRuleDetail();
      }
    },

    // 获取规则详情（仅回显通知配置相关数据）
    getRuleDetail() {
      let data = { ruleId: this.rowData.ruleId };
      // 模拟接口返回（实际项目替换为真实接口调用）
      let res = {
        status: 200,
        message: "Success",
        data: this.rowData,
      };

      if (res.status === 200) {
        const detail = res.data;
        // 1. 回显选中的通知类型
        this.form.channelString = detail.channelString || [];

        // 2. 回显通知配置详情（钉钉/企业微信/电信集约化服务台）
        if (detail.channelParam) {
          Object.keys(detail.channelParam).forEach((key) => {
            if (this.noticeTemplates[key]) {
              this.noticeTemplates[key].value = [
                ...(detail.channelParam[key] || []),
              ];
            }
          });
        }
      }

      // 真实接口调用（替换模拟数据）
      // getRuleDetail(data).then((res) => {
      //   if (res.status === 200) {
      //     const detail = res.data;
      //     this.form.channelString = detail.channelString || [];
      //     if (detail.channelParam) {
      //       Object.keys(detail.channelParam).forEach(key => {
      //         if (this.noticeTemplates[key]) {
      //           this.noticeTemplates[key].value = [...(detail.channelParam[key] || [])];
      //         }
      //       });
      //     }
      //   }
      // });
    },

    // 取消操作：关闭弹窗
    cancel() {
      this.showModal = false;
    },

    // 提交表单（仅提交通知配置相关数据）
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // 1. 校验通知配置详情的合法性
          const noticeValid = this.form.channelString.every((key) => {
            return this.noticeTemplates[key].value.every((item) => {
              if (key === "dd" || key === "qywx") {
                // 钉钉/企业微信：校验webhookUrl必填
                return item.webhookUrl.trim() !== "";
              } else if (key === "szh") {
                // 电信集约化服务台：无需额外校验（后台已配置）
                return true;
              }
              return true;
            });
          });

          if (!noticeValid) {
            this.$message.error("请完善所有选中通知类型的配置信息");
            return;
          }

          // 2. 整理提交数据（仅包含通知配置）
          const submitData = {
            ...this.form,
            ruleId: this.rowData?.ruleId || "", // 编辑场景传ruleId，新增场景可省略
            channelParam: {}, // 通知配置详情
          };

          // 组装通知配置参数
          this.form.channelString.forEach((key) => {
            submitData.channelParam[key] = [...this.noticeTemplates[key].value];
          });

          // 3. 提交接口（保存通知配置）
          this.isSubmitDisabled = true;
          updateMessage(submitData)
            .then((res) => {
              this.isSubmitDisabled = false;
              if (res.data) {
                this.$modal.msgSuccess("通知配置保存成功");
                this.showModal = false;
                this.$emit("refreshList"); // 通知父组件刷新列表
              } else {
                this.$modal.msgError(res.message || "保存失败");
              }
            })
            .catch((error) => {
              this.isSubmitDisabled = false;
              this.$modal.msgError("通知配置保存失败");
              console.error("提交错误：", error);
            });
        }
      });
    },
  },
};
</script>

<style scoped lang="less">
/* 标签相关样式 */
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.tag-style {
  border: 1px solid #dcdfe6;
  padding: 4px;
  margin: 0 8px;
}

/* 步骤条样式 */
.el-steps {
  margin-bottom: 20px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
  margin-top: 20px;
  :deep(.el-button) {
    margin-left: 8px;
  }
}

/* 卡片样式调整 */
:deep(.ant-card) {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

/* 行布局对齐样式 */
:deep(.el-row--flex) {
  align-items: center;
}

/* 提示文本样式 */
:deep(.el-form-item__error) {
  font-size: 12px;
  color: #666;
  background-color: #f5f7fa;
  padding: 2px 5px;
  border-radius: 3px;
}

/* 抽屉滚动优化 */
:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}
</style>
