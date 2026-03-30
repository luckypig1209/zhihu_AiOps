<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('common.export')"
    width="520px"
    @cancel="handleCancel"
    @ok="handleOk"
    :ok-text="$t('common.confirm')"
    :cancel-text="$t('common.cancel')"
  >
    <div class="export-modal">
      <!-- 字段选择区 -->
      <div class="field-section">
        <p>{{ $t('common.fields') }}：</p>
        <a-checkbox v-model="selectAll" @change="handleSelectAll">{{ $t('common.all') }}</a-checkbox>
        <a-checkbox @change="handleDefault">{{ $t('common.default') }}</a-checkbox>
        <div class="field-list">
          <a-checkbox-group v-model="selectedFields">
            <a-row :gutter="24">
              <a-col :span="8" v-for="(field, index) in fieldOptions" :key="index">
                <a-checkbox :value="field.value">{{ field.label }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </div>
      </div>
      <!-- 范围选择区 -->
      <div class="range-section">
        <p>{{ $t('common.range') }}：</p>
        <a-radio-group v-model="exportRange">
          <a-radio value="all">{{ $t('common.all') }}</a-radio>
          <a-radio value="filtered">{{ $t('common.filtered') }}</a-radio>
        </a-radio-group>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: "ExportModal",
  props: {
    visible: Boolean,
    defaultFields: Array, // 父组件传递的“默认选中字段”
    allFields: Array, // 父组件传递的“所有可选字段”
  },
  data() {
    return {
      selectAll: false,
      exportRange: "all",
      selectedFields: [],
      fieldOptions: [],
    };
  },
  watch: {
    visible(val) {
      if (val) this.initData();
    },
  },
  methods: {
    initData() {
      // 格式化字段为“标签-值”结构
      this.fieldOptions = this.allFields.map((field) => ({
        label: field.title,
        value: field.dataIndex,
      }));
      // 初始化选中字段为“默认字段”
      this.selectedFields = this.defaultFields.map((field) => field.dataIndex);
      // 初始化“全选”状态
      this.selectAll = this.selectedFields.length === this.fieldOptions.length;
    },
    handleSelectAll(e) {
      if (e.target.checked) {
        // 全选：选中所有字段
        this.selectedFields = this.fieldOptions.map((field) => field.value);
      } else {
        // 取消全选：清空选中
        this.selectedFields = [];
      }
    },
    handleDefault() {
      // 重置为“默认字段”
      this.selectedFields = this.defaultFields.map((field) => field.dataIndex);
      this.selectAll = this.selectedFields.length === this.fieldOptions.length;
    },
    handleCancel() {
      this.$emit("cancel");
    },
    handleOk() {
      // 筛选出选中字段的“标签”，用于提示或后端传参
      const selectedFieldLabels = this.fieldOptions
        .filter((field) => this.selectedFields.includes(field.value))
        .map((field) => field.label);
      this.$emit("confirm", {
        fields: this.selectedFields,
        fieldLabels: selectedFieldLabels,
        range: this.exportRange,
      });
    },
  },
};
</script>

<style scoped>
.export-modal {
  .field-section,
  .range-section {
    margin-bottom: 16px;
    p {
      margin-bottom: 8px;
      font-weight: 500;
    }
  }
  .field-list {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>