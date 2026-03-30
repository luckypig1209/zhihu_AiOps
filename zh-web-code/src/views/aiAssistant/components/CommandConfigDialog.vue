<template>
  <el-dialog
    title="快捷指令配置"
    :visible.sync="dialogVisible"
    width="700px"
    top="6vh"
    :close-on-click-modal="false"
    @open="onOpen"
    class="command-config-dialog"
  >
    <div class="config-toolbar">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addCommand">
        添加指令
      </el-button>
      <el-button size="small" icon="el-icon-refresh" @click="resetToDefault">
        恢复默认
      </el-button>
    </div>

    <div class="config-list">
      <div
        v-for="(cmd, index) in editCommands"
        :key="cmd.id"
        class="config-item"
      >
        <div class="item-header">
          <span class="item-index">#{{ index + 1 }}</span>
          <el-button
            type="text"
            icon="el-icon-delete"
            class="item-delete"
            @click="removeCommand(index)"
          ></el-button>
        </div>

        <el-form :inline="false" label-width="80px" size="small">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="指令名称">
                <el-input v-model="cmd.name" placeholder="显示名称" maxlength="20"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分类">
                <el-select v-model="cmd.category" placeholder="选择分类" allow-create filterable>
                  <el-option label="指标查询" value="指标查询"></el-option>
                  <el-option label="监控对象查询" value="监控对象查询"></el-option>
                  <el-option label="告警与巡检" value="告警与巡检"></el-option>
                  <el-option label="其他" value="其他"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="指令内容">
            <el-input
              v-model="cmd.content"
              type="textarea"
              :rows="2"
              placeholder="实际发送的文本内容"
              maxlength="200"
              show-word-limit
            ></el-input>
          </el-form-item>

          <el-form-item label="图标">
            <el-select v-model="cmd.icon" placeholder="选择图标">
              <el-option
                v-for="icon in iconOptions"
                :key="icon.value"
                :label="icon.label"
                :value="icon.value"
              >
                <i :class="icon.value" style="margin-right: 8px;"></i>
                <span>{{ icon.label }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <div v-if="editCommands.length === 0" class="empty-config">
        <i class="el-icon-document-add"></i>
        <p>暂无指令，点击上方按钮添加</p>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveCommands" :disabled="!isValid">保存生效</el-button>
    </div>
  </el-dialog>
</template>

<script>
const COMMANDS_STORAGE_KEY = 'ai_assistant_commands'

const DEFAULT_COMMANDS = [
  { id: 'default_1', name: '查询CPU使用率', content: '查询最近1小时内CPU总使用率', icon: 'el-icon-data-line', category: '指标查询' },
  { id: 'default_2', name: '查询内存使用率', content: '查询最近1小时内存使用率', icon: 'el-icon-coin', category: '指标查询' },
  { id: 'default_3', name: '查询磁盘使用情况', content: '查询磁盘使用情况', icon: 'el-icon-box', category: '指标查询' },
  { id: 'default_4', name: '关键字查询监控对象', content: '通过关键字查询监控对象', icon: 'el-icon-search', category: '监控对象查询' },
  { id: 'default_5', name: 'IP查询监控对象', content: '通过IP查询监控对象', icon: 'el-icon-position', category: '监控对象查询' },
  { id: 'default_6', name: '操作系统监控统计', content: '查询操作系统下有多少监控对象', icon: 'el-icon-monitor', category: '监控对象查询' },
  { id: 'default_7', name: '网络设备数量', content: '查询目前监控了多少网络设备', icon: 'el-icon-connection', category: '监控对象查询' },
  { id: 'default_8', name: '查看当前告警', content: '查看当前告警', icon: 'el-icon-warning-outline', category: '告警与巡检' },
  { id: 'default_9', name: '执行全面巡检', content: '执行全面巡检', icon: 'el-icon-finished', category: '告警与巡检' }
]

export default {
  name: 'CommandConfigDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editCommands: [],
      iconOptions: [
        { label: '折线图', value: 'el-icon-data-line' },
        { label: '数据分析', value: 'el-icon-data-analysis' },
        { label: '硬币', value: 'el-icon-coin' },
        { label: '盒子', value: 'el-icon-box' },
        { label: '搜索', value: 'el-icon-search' },
        { label: '定位', value: 'el-icon-position' },
        { label: '显示器', value: 'el-icon-monitor' },
        { label: '连接', value: 'el-icon-connection' },
        { label: '警告', value: 'el-icon-warning-outline' },
        { label: '完成', value: 'el-icon-finished' },
        { label: 'CPU', value: 'el-icon-cpu' },
        { label: '消息', value: 'el-icon-message' },
        { label: '设置', value: 'el-icon-setting' },
        { label: '文档', value: 'el-icon-document' },
        { label: '时钟', value: 'el-icon-time' },
        { label: '星标', value: 'el-icon-star-off' }
      ]
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    },
    isValid() {
      return this.editCommands.every(cmd => cmd.name.trim() && cmd.content.trim())
    }
  },
  methods: {
    onOpen() {
      try {
        const saved = localStorage.getItem(COMMANDS_STORAGE_KEY)
        this.editCommands = saved ? JSON.parse(saved).map(c => ({ ...c })) : DEFAULT_COMMANDS.map(c => ({ ...c }))
      } catch (e) {
        this.editCommands = DEFAULT_COMMANDS.map(c => ({ ...c }))
      }
    },

    addCommand() {
      this.editCommands.push({
        id: 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: '',
        content: '',
        icon: 'el-icon-right',
        category: '其他'
      })
    },

    removeCommand(index) {
      this.editCommands.splice(index, 1)
    },

    resetToDefault() {
      this.$confirm('确定恢复为默认快捷指令？当前配置将被覆盖。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.editCommands = DEFAULT_COMMANDS.map(c => ({ ...c }))
      }).catch(() => {})
    },

    saveCommands() {
      // 过滤空指令
      const validCommands = this.editCommands.filter(c => c.name.trim() && c.content.trim())
      try {
        localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(validCommands))
        this.$emit('saved', validCommands)
        this.dialogVisible = false
        this.$message.success('快捷指令配置已保存')
      } catch (e) {
        this.$message.error('保存失败: ' + e.message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.command-config-dialog {
  ::v-deep .el-dialog__body {
    padding: 16px 20px;
    max-height: 65vh;
    overflow-y: auto;
  }
}

.config-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  background: #f9fafb;
  border: 1px solid #eceef5;
  border-radius: 8px;
  padding: 12px 16px;

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .item-index {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      background: #f0f2ff;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .item-delete {
      color: #c0c4cc;
      &:hover { color: #f56c6c; }
    }
  }

  .el-form-item {
    margin-bottom: 8px;
  }
}

.empty-config {
  text-align: center;
  padding: 40px 0;
  color: #c0c4cc;

  i {
    font-size: 40px;
    margin-bottom: 8px;
    display: block;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
