<template>
  <a-drawer
    title="指标项"
    :visible="showModal"
    width="1080px"
    placement="right"
    :closable="true"
    :mask-closable="false"
    @close="cancel"
  >
    <div style="height: 80vh; overflow-y: auto">
      <a-form
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
        style="font-size: 16px !important"
      >
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="8">
            <a-form-item label="指标名称:">
              <a-input
                v-model="searchForm.ruleName"
                placeholder="请输入指标名称"
                allowClear
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <!-- 操作按钮 -->
          <a-col
            :span="8"
            style="display: flex; align-items: center; padding-top: 3px"
          >
            <a-button type="primary" ghost @click="handleSearch">查询</a-button>
            <a-button
              type="primary"
              ghost
              style="margin-left: 12px"
              @click="handleReset"
              >重置</a-button
            >
            <!-- <a-button type="primary" ghost style="margin-left: 12px;" @click="handleAdd" >新增</a-button> -->
          </a-col>
        </a-row>
      </a-form>
      <!-- 告警表格 -->
      <a-table
        style="margin-top: 10px"
        :columns="columns"
        :data-source="tableData"
        :pagination="false"
        :loading="loading"
        bordered
        size="middle"
      >
        <!-- 操作列：Scoped Slot -->
        <template slot="operation" slot-scope="text, record">
          <div class="table-row-actions">
            <a @click="handleAdd()">6</a>
          </div>
        </template>
      </a-table>

      <!-- 分页 -->
      <a-pagination
        class="pagination"
        :current="currentPage"
        :page-size="pageSize"
        :total="total"
        :show-total="(total) => `共 ${total} 条记录`"
        :page-size-options="['10', '20', '50', '100']"
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="onShowSizeChange"
      >
        <template slot="buildOptionText" slot-scope="props">
          <span>{{ props.value }}{{ $t('common.itemsPerPage') }}</span>
        </template>
      </a-pagination>
    </div>
  </a-drawer>
</template>

<script>
import { updateMessage, getRuleDetail } from "@/api/monitor/task";

export default {
  name: "NoticeConfigForm",
  props: {
    opt: {
      // 操作类型：新增/编辑
      type: String,
      default: "新增通知对象",
    },
    id: {
      // 操作类型：新增/编辑
      type: String,
      default: "",
    },
  },
  data() {
    return {
      searchForm: {
        ruleName: "",
      },
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showModal: false,
      tableData: [],
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        // 初始化数据（编辑场景回显）
        this.init(this.rowData);
      } else {
        // 关闭弹窗时：重置表单
        console.log("关闭");
      }
    },
  },
  computed: {
    // 表格列配置
    columns() {
      return [
        {
          title: "指标性类型",
          dataIndex: "channelString",
          key: "channelString",
        },
        {
          title: "一场级别",
          dataIndex: "channelString",
          key: "channelString",
        },
        {
          title: "判断条件",
          dataIndex: "建议值",
          key: "channelString",
        },
        {
          title: "建议值",
          dataIndex: "channelString",
          key: "channelString",
        },
      ];
    },
  },
  methods: {
    handleSearch() {
      console.log("查询");
    },
    handleReset() {
      this.searchForm.ruleName = "";
    },
    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      // this.fetchData();
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      // this.fetchData();
    },
    // 获取规则详情（仅回显通知配置相关数据）
    getRuleDetail() {
      let data = { id: this.id };
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
.pagination {
  padding: 16px;
  background: #fff;
  margin-left: auto;
  // width: 360px;
  /* border-radius: 8px; */
  margin-top: 16px;
  position: absolute;
  right: 0px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
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
