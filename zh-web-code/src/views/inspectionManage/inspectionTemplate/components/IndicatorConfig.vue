<template>
  <a-modal
    :visible="visible"
    title="指标配置"
    width="800px"
    @ok="handleOk"
    @cancel="handleCancel"
    :mask-closable="false"
  >
    <div class="indicator-config">
      <!-- 搜索区域 -->
      <div class="search-bar">
        <a-row :gutter="16">
          <a-col :span="8" style="display:flex;align-items: center;">
            <a-label>指标名称：</a-label>
            <a-input
              v-model="searchName"
              placeholder="请输入指标名称"
              style="width: 140px;"
            />
          </a-col>
          <a-col :span="8" style="display:flex;align-items: center;">
            <a-label>异常级别：</a-label>
            <a-select
              v-model="searchLevel"
              placeholder="请选择异常级别"
              style="width: 140px;"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="低">低</a-select-option>
              <a-select-option value="中">中</a-select-option>
              <a-select-option value="高">高</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="8" style="display: flex; align-items: center;">
            <a-button type="primary" @click="query">查询</a-button>
            <a-button style="margin-left: 8px;" @click="reset">重置</a-button>
          </a-col>
        </a-row>
      </div>

      <!-- 指标列表 -->
      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="filteredIndicators"
          :pagination="pagination"
          :loading="loading"
          rowKey="id"
          :scroll="{ x: 'max-content' }"
        >
          <!-- 指标名称列 -->
          <template #name="{ text, record }">
            <div class="name-cell">
              <span>{{ record.name }}</span>
              <a-tooltip v-if="record.remark" :title="record.remark">
                <i class="anticon anticon-info-circle" style="color: #1890ff; margin-left: 4px; cursor: pointer;"></i>
              </a-tooltip>
            </div>
          </template>

          <!-- 异常级别列 -->
          <template #level="{ text, record }">
            <a-tag :color="getLevelColor(text)">
              {{ text }}
            </a-tag>
            <a-icon type="edit" class="edit-icon" @click="editField(record, 'level')" />
          </template>

          <!-- 判断条件列 -->
          <template #condition="{ text, record }">
            <span>{{ text }}</span>
            <a-icon type="edit" class="edit-icon" @click="editField(record, 'condition')" />
          </template>

          <!-- 建议值列 -->
          <template #suggestValue="{ text, record }">
            <span>{{ text }}</span>
            <a-icon type="edit" class="edit-icon" @click="editField(record, 'suggestValue')" />
          </template>

          <!-- 操作列 -->
          <template #action="{ record }">
            <a-popconfirm
              title="确定要删除该指标吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="removeIndicator(record)"
            >
              <a-icon type="delete" style="color: red; cursor: pointer;" />
            </a-popconfirm>
          </template>
        </a-table>
      </div>
    </div>
  </a-modal>
</template>

<script>
export default {
  name: 'IndicatorConfig',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    deviceType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      searchName: '',
      searchLevel: '',
      // 模拟指标库数据（实际应从接口获取）
      indicators: [
        {
          id: 1,
          name: 'CPU使用率',
          level: '高',
          condition: '大于等于',
          suggestValue: '10',
          remark: '0: up, 1: down'
        },
        {
          id: 2,
          name: '风扇转速',
          level: '高',
          condition: '等于',
          suggestValue: '1',
          remark: '单位：rpm'
        },
        {
          id: 3,
          name: '内存占用',
          level: '中',
          condition: '超过',
          suggestValue: '80%',
          remark: '阈值可动态调整'
        }
      ],
      // 当前用户修改后的指标（用于保存）
      userIndicators: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  computed: {
    filteredIndicators() {
      let list = this.userIndicators.length > 0 ? this.userIndicators : this.indicators;

      if (this.searchName) {
        list = list.filter(item => item.name.includes(this.searchName));
      }
      if (this.searchLevel && this.searchLevel !== '') {
        list = list.filter(item => item.level === this.searchLevel);
      }

      const start = (this.pagination.current - 1) * this.pagination.pageSize;
      const end = start + this.pagination.pageSize;
      this.pagination.total = list.length;

      return list.slice(start, end);
    },
    columns() {
      return [
        {
          title: '指标名称',
          dataIndex: 'name',
          key: 'name',
          scopedSlots: { customRender: 'name' },
          ellipsis: true
        },
        {
          title: '异常级别',
          dataIndex: 'level',
          key: 'level',
          scopedSlots: { customRender: 'level' },
          width: 120
        },
        {
          title: '判断条件',
          dataIndex: 'condition',
          key: 'condition',
          scopedSlots: { customRender: 'condition' },
          width: 150
        },
        {
          title: '建议值',
          dataIndex: 'suggestValue',
          key: 'suggestValue',
          scopedSlots: { customRender: 'suggestValue' },
          width: 120
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' },
          width: 80
        }
      ];
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadIndicators();
      }
    }
  },
  methods: {
    getLevelColor(level) {
      switch (level) {
        case '低': return '#108ee9';
        case '中': return '#faad14';
        case '高': return '#f5222d';
        default: return '#000';
      }
    },

    loadIndicators() {
      // 这里可以调用接口获取当前设备类型的指标
      // 临时使用本地数据
      this.userIndicators = [];
      this.searchName = '';
      this.searchLevel = '';
      this.query();
    },

    query() {
      this.pagination.current = 1;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },

    reset() {
      this.searchName = '';
      this.searchLevel = '';
      this.query();
    },

    editField(record, field) {
      const value = prompt(`请输入新的${field}：`, record[field]);
      if (value !== null && value.trim() !== '') {
        record[field] = value.trim();
      }
    },

    removeIndicator(record) {
      const index = this.userIndicators.findIndex(i => i.id === record.id);
      if (index > -1) {
        this.userIndicators.splice(index, 1);
      }
    },

    handleOk() {
      // 如果用户未修改，则使用默认指标库
      if (this.userIndicators.length === 0) {
        this.$emit('save', this.indicators);
      } else {
        this.$emit('save', this.userIndicators);
      }
      this.handleCancel();
    },

    handleCancel() {
      this.$emit('update:visible', false);
      this.userIndicators = []; // 清空自定义配置
    }
  }
};
</script>

<style scoped>
.indicator-config {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.name-cell {
  display: flex;
  align-items: center;
}

.edit-icon {
  margin-left: 8px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}

.ant-table td {
  padding: 8px 12px;
}
</style>