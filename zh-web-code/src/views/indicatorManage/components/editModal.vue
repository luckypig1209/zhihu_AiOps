<template>
  <a-drawer :title="$t('indicator.metricItems')" :visible="showModal" width="1080px" placement="right" :closable="true" :mask-closable="false"
    @close="cancel">
    <div style="height: 80vh; overflow-y: auto">
      <!-- 告警表格 -->
      <a-table :columns="columns" :data-source="dataSource" :pagination="false" :row-key="(record) => record.id" 
        @change="handlePaginationChange" bordered 
         :locale="{
              emptyText: $t('common.noData')
            }"
            
        >
        <!-- 自定义列渲染 -->
        <template slot="operation" slot-scope="text, record">
          <template v-if="isAdmin && !record.isEditing">
            <a-button type="link" @click="startEdit(record)">{{ $t('indicator.edit') }}</a-button>
          </template>
          <template v-else-if="isAdmin && record.isEditing">
            <a-button type="primary" size="small" @click="saveEdit(record)" style="margin-right: 8px">{{ $t('indicator.save') }}</a-button>
            <a-button size="small" @click="cancelEdit(record)">{{ $t('indicator.cancel') }}</a-button>
          </template>
        </template>

        <!-- 可编辑的单元格 -->
        <template slot="unit" slot-scope="text, record">
          <template v-if="!record.isEditing">{{ text }}</template>
          <template v-else>
            <a-input v-model="record.unit" />
          </template>
        </template>

        <template slot="grade" slot-scope="text, record">
          <template v-if="!record.isEditing">{{ gradeMap[text] }}</template>
          <template v-else>
            <a-select v-model="record.grade" style="width: 100%">
              <a-select-option value="low">{{ $t('indicator.low') }}</a-select-option>
              <a-select-option value="medium">{{ $t('indicator.medium') }}</a-select-option>
              <a-select-option value="high">{{ $t('indicator.high') }}</a-select-option>
            </a-select>
          </template>
        </template>

        <template slot="compareType" slot-scope="text, record">
          <template v-if="!record.isEditing">{{ compareTypeMap[text] }}</template>
          <template v-else>
            <a-select v-model="record.compareType" style="width: 100%">
              <a-select-option value="1">{{ $t('indicator.equal') }}</a-select-option>
              <a-select-option value="2">{{ $t('indicator.notEqual') }}</a-select-option>
              <a-select-option value="5">{{ $t('indicator.lessThan') }}</a-select-option>
              <a-select-option value="4">{{ $t('indicator.lessThanOrEqual') }}</a-select-option>
              <a-select-option value="3">{{ $t('indicator.greaterThan') }}</a-select-option>
              <a-select-option value="6">{{ $t('indicator.greaterThanOrEqual') }}</a-select-option>
            </a-select>
          </template>
        </template>

        <template slot="compareValue" slot-scope="text, record">
          <template v-if="!record.isEditing">{{ text }}</template>
          <template v-else>
            <a-input-number v-model="record.compareValue" style="width: 100%" />
          </template>
        </template>

        <template slot="remark" slot-scope="text, record">
          <template v-if="!record.isEditing">
            <template v-if="text && text.length > 10">
              <el-tooltip :content="text" placement="top">
                <!-- <div
                  style="width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;">
                  {{ text }}
                </div> -->
                <span style="cursor: pointer;"> {{ text }}</span>
              </el-tooltip>
            </template>
            <template v-else>
              <!-- <div
                style="width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;">
                {{ text }}
                
              </div> -->
              <span style="cursor: pointer;"> {{ text }}</span>
            </template>
          </template>
          <template v-else>
            <a-input v-model="record.remark" style="width: 100%" />
          </template>
        </template>
      </a-table>
      <a-pagination class="pagination" :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total"
        :show-total="(total) => `${$t('indicator.total')} ${total} ${$t('indicator.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
        @change="handlePageChange" @showSizeChange="onShowSizeChange">
        <template slot="buildOptionText" slot-scope="props">
          <span>{{ props.value }}{{ $t('indicator.itemsPerPage') }}</span>
        </template>
      </a-pagination>      
    </div>
  </a-drawer>
</template>

<script>
import { indicatorPage, indicatorUpdate } from "@/api/indicator";

export default {
  name: "NoticeConfigForm",
  props: {
    opt: {
      type: String,
      default: "新增通知对象",
    },
    resourceType: {
      type: String,
      default: "",
    },
    deviceType: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      gradeMap: {},
      compareTypeMap: {},
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showModal: false,
      isAdmin: true,
      dataSource: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      // 新增：存储每条记录的原始数据，用于取消编辑时回滚
      originalData: new Map(), // key: record.id, value: 原始数据对象
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        this.init();
      } else {
        this.pagination.current = 1;
        this.pagination.pageSize = 10;
        this.originalData.clear(); // 关闭弹窗时清空原始数据缓存
      }
    },
  },
  methods: {
    init() {
      this.loading = true;
      const params = {
        pageSize: this.pagination.pageSize,
        pageNo: this.pagination.current,
        resourceType: this.resourceType || undefined,
        deviceType: this.deviceType || undefined,
      };
      indicatorPage(params).then((res) => {
        const data = res.data?.list || [];
        this.dataSource = data.map((item) => ({
          ...item,
          isEditing: false,
        }));
        // 初始化原始数据缓存
        data.forEach(item => {
          this.originalData.set(item.id, { ...item });
        });
        this.pagination.total = res.data?.total || 0;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    startEdit(record) {
      // 存储当前记录的原始数据（防止多次编辑时覆盖原始值）
      if (!this.originalData.has(record.id)) {
        this.originalData.set(record.id, { ...record });
      }
      this.$set(record, "isEditing", true);
    },

    saveEdit(record) {
      // 必填项校验
      if (!record.grade) {
        this.$modal.msgError(this.$t('indicator.levelIsRequired'));
        return;
      }
      if (!record.compareType) {
        this.$modal.msgError(this.$t('indicator.judgmentConditionIsRequired'));
        return;
      }
      if (record.compareValue === undefined || record.compareValue === null) {
        this.$modal.msgError(this.$t('indicator.suggestedValueIsRequired'));
        return;
      }

      // 调用API保存当前记录
      this.loading = true;
      indicatorUpdate(record)
        .then((res) => {
          if (res.data) {
            this.$modal.msgSuccess(this.$t('indicator.saveSuccess'));
            // 保存成功后更新原始数据缓存
            this.originalData.set(record.id, { ...record });
            this.$set(record, "isEditing", false);
          } else {
            this.$modal.msgError(res.message || this.$t('indicator.saveFailed'));
          }
        })
        .catch((error) => {
          this.$modal.msgError(this.$t('indicator.saveFailed'));
        })
        .finally(() => {
          this.loading = false;
        });
    },

    cancelEdit(record) {
      // 从缓存中获取原始数据回滚
      const original = this.originalData.get(record.id);
      if (original) {
        const index = this.dataSource.findIndex(item => item.id === record.id);
        if (index > -1) {
          // 深拷贝原始数据，避免引用问题
          this.dataSource.splice(index, 1, { ...original, isEditing: false });
        }
      } else {
        // 若没有原始数据，仅关闭编辑状态
        this.$set(record, "isEditing", false);
      }
    },

    handlePageChange(page) {
      this.pagination.current = page;
      this.init();
    },  
    onShowSizeChange(current, pageSize) {
      this.pagination.current = current;
      this.pagination.pageSize = pageSize;
      this.init(); // 分页切换时重新加载数据，清空编辑状态
    },
    cancel() {
      this.showModal = false;
    },
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('indicator.name'),
          dataIndex: "metricName",
          key: "metricName",
        },
        {
          title: this.$t('indicator.unit'),
          dataIndex: "unit",
          key: "unit",
          scopedSlots: { customRender: "unit" },
        },
        {
          title: () => <span><span style="color: red">*</span> {this.$t('indicator.level')}</span>,
          dataIndex: "grade",
          key: "grade",
          scopedSlots: { customRender: "grade" },
        },
        {
          title: () => <span><span style="color: red">*</span> {this.$t('indicator.judgmentCondition')}</span>,
          dataIndex: "compareType",
          key: "compareType",
          scopedSlots: { customRender: "compareType" },
        },
        {
          title: () => <span><span style="color: red">*</span> {this.$t('indicator.suggestedValue')}</span>,
          dataIndex: "compareValue",
          key: "compareValue",
          scopedSlots: { customRender: "compareValue" },
        },
        {
          title: this.$t('indicator.remark'),
          dataIndex: "remark",
          key: "remark",
          width: 200,
          scopedSlots: { customRender: "remark" },
        },
        {
          title: this.$t('indicator.operation'),
          key: "operation",
          scopedSlots: { customRender: "operation" },
        },
      ];
    },
  },
  created() {
    const roles = this.$store.getters?.roles || [];
    this.isAdmin = roles.includes("system_admin");
    
    // 初始化映射表
    this.gradeMap = {
      low: this.$t('indicator.low'),
      medium: this.$t('indicator.medium'),
      high: this.$t('indicator.high'),
    };
    this.compareTypeMap = {
      1: this.$t('indicator.equal'),
      2: this.$t('indicator.notEqual'),
      5: this.$t('indicator.lessThan'),
      4: this.$t('indicator.lessThanOrEqual'),
      3: this.$t('indicator.greaterThan'),
      6: this.$t('indicator.greaterThanOrEqual'),
    };
    
    // 初始化分页
    this.pagination = {
      total: 0,
      current: 1,
      pageSize: 10,
      showTotal: (total) => `${this.$t('indicator.total')} ${total} ${this.$t('indicator.records')}`,
      showSizeChanger: true,
      showQuickJumper: true,
    };
  },
};
</script>

<style scoped lang="less">
::v-deep .ant-table-tbody>tr>td {
  white-space: nowrap;
  /* 禁止换行 */
  overflow: hidden;
  /* 溢出隐藏 */
  text-overflow: ellipsis;
  /* 显示省略号 */
  max-width: 200px;
  /* 可选：限制单元格最大宽度（根据需求调整） */
}

/* 标签相关样式 */
.el-tag+.el-tag {
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

.el-steps {
  margin-bottom: 20px;
}

.pagination {
  padding: 16px;
  background: #fff;
  margin-left: auto;
  margin-top: 16px;
  position: absolute;
  right: 0px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;

  :deep(.el-button) {
    margin-left: 8px;
  }
}

:deep(.ant-card) {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

:deep(.el-row--flex) {
  align-items: center;
}

:deep(.el-form-item__error) {
  font-size: 12px;
  color: #666;
  background-color: #f5f7fa;
  padding: 2px 5px;
  border-radius: 3px;
}

:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}
</style>