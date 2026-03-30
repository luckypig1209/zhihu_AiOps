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
      <!-- 告警表格 -->
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="pagination"
        :row-key="(record) => record.id"
        @change="handlePaginationChange"
      >
        <!-- 自定义列渲染 -->
        <template slot="operation" slot-scope="text, record">
          <template v-if="isAdmin && !record.isEditing">
            <a-button type="link" @click="startEdit(record)">编辑</a-button>
          </template>
          <template v-else-if="isAdmin && record.isEditing">
            <a-button
              type="primary"
              size="small"
              @click="saveEdit(record)"
              style="margin-right: 8px"
              >保存</a-button
            >
            <a-button size="small" @click="cancelEdit(record)">取消</a-button>
          </template>
          <template v-else>
            <!-- 非管理员不可见操作按钮 -->
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
              <a-select-option value="low">低</a-select-option>
              <a-select-option value="medium">中</a-select-option>
              <a-select-option value="high">高</a-select-option>
            </a-select>
          </template>
        </template>

        <template slot="compareType" slot-scope="text, record">
          <template v-if="!record.isEditing">{{
            compareTypeMap[text]
          }}</template>
          <template v-else>
            <a-select v-model="record.compareType" style="width: 100%">
              <a-select-option value="1">等于</a-select-option>
              <a-select-option value="2">不等于</a-select-option>
              <a-select-option value="3">大于</a-select-option>
              <a-select-option value="4">小于等于</a-select-option>
              <a-select-option value="5">小于</a-select-option>
              <a-select-option value="6">大于等于</a-select-option>
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
          <template v-if="!record.isEditing">{{ text }}</template>
          <template v-else>
            <a-input v-model="record.remark" style="width: 100%" />
          </template>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script>
import { indicatorPage, indicatorUpdate } from "@/api/indicator";

export default {
  name: "NoticeConfigForm",
  props: {
    opt: {
      // 操作类型：新增/编辑
      type: String,
      default: "新增通知对象",
    },
    resourceType: {
      // 操作类型：新增/编辑
      type: String,
      default: "",
    },
    deviceType: {
      // 操作类型：新增/编辑
      type: String,
      default: "",
    },
  },
  data() {
    return {
      gradeMap: {
        low: "低",
        medium: "中",
        high: "高",
      },
      compareTypeMap: {
        1: "等于",
        2: "不等于",
        3: "大于",
        4: "大于等于",
        5: "小于",
        6: "不等于",
      },
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      showModal: false,
      isAdmin: true, // 模拟超级管理员权限
      dataSource: [],
      columns: [
        {
          title: "名称",
          dataIndex: "metricName",
          key: "metricName",
        },
        {
          title: "单位",
          dataIndex: "unit",
          key: "unit",
          scopedSlots: { customRender: "unit" },
        },
        {
          title: "级别",
          dataIndex: "grade",
          key: "grade",
          scopedSlots: { customRender: "grade" },
        },
        {
          title: "判断条件",
          dataIndex: "compareType",
          key: "compareType",
          scopedSlots: { customRender: "compareType" },
        },
        {
          title: "建议值",
          dataIndex: "compareValue",
          key: "compareValue",
          scopedSlots: { customRender: "compareValue" },
        },
        {
          title: "注释",
          dataIndex: "remark",
          key: "remark",
          scopedSlots: { customRender: "remark" },
        },
        {
          title: "操作",
          key: "operation",
          scopedSlots: { customRender: "operation" },
        },
      ],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showTotal: (total) => `总计: ${total} 条`,
        showSizeChanger: true,
        showQuickJumper: true,
      },
    };
  },
  watch: {
    showModal(val) {
      if (val) {
        // 初始化数据（编辑场景回显）
        this.init();
      } else {
        // 关闭弹窗时：重置表单
        console.log("关闭");
        this.pagination.current = 1;
        this.pagination.pageSize = 10;
      }
    },
  },
  computed: {},
  methods: {
    init() {
      this.loading = true;
      let params = {
        pageSize: this.pagination.pageSize,
        pageNo: this.pagination.current,
        resourceType: this.resourceType || undefined,
        deviceType: this.deviceType || undefined,
      };
      indicatorPage(params).then((res) => {
        let data = res.data && res.data.list;
        this.dataSource = data.map((item) => {
          return {
            ...item,
            isEditing: false,
          };
        });
        // this.dataSource = res.data && res.data.list;
        this.total = (res.data && res.data.total) || 0;
        this.loading = false;
      });
    },
    startEdit(record) {
      this.$set(record, "isEditing", true);
    },

    saveEdit(record) {
      // 这里可以调用 API 保存数据
      console.log("保存:", record);
      this.$set(record, "isEditing", false);
      indicatorUpdate(record)
        .then((res) => {
          if (res.data) {
            this.$modal.msgSuccess("保存成功");
            this.init();
          } else {
            this.$modal.msgError(res.message || "保存失败");
          }
        })
        .catch((error) => {
          this.$modal.msgError("保存失败");
        });
    },

    cancelEdit(record) {
      // 恢复原数据（可选：回滚到原始值）
      this.$set(record, "isEditing", false);
      this.init();
    },
    // 分页切换
    showSizeChanger(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.init();
    },
    handlePaginationChange(pagination, filters, sorter) {
      console.log("分页变化:", pagination);

      // 更新当前页和每页大小
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;

      // 重新加载数据
      this.init();
    },

    // 取消操作：关闭弹窗
    cancel() {
      this.showModal = false;
    },
  },
  created() {
    const roles = this.$store.getters && this.$store.getters.roles;
    console.log("roles", roles);
    if (roles.includes("system_admin")) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
      this.columns.pop();
    }
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
