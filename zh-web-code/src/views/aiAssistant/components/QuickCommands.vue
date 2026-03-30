<template>
  <div class="quick-commands">
    <div class="commands-header">
      <h3>快捷指令</h3>
      <div class="header-actions">
        <el-tooltip content="模型配置" placement="top">
          <el-button type="text" icon="el-icon-cpu" @click="$emit('open-model-config')"></el-button>
        </el-tooltip>
        <el-tooltip content="Skills 编辑" placement="top">
          <el-button type="text" icon="el-icon-edit-outline" @click="$emit('open-skills-editor')"></el-button>
        </el-tooltip>
        <el-tooltip content="指令配置" placement="top">
          <el-button type="text" icon="el-icon-setting" @click="$emit('open-config')"></el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="commands-body">
      <div v-for="group in commandGroups" :key="group.category" class="command-group">
        <div class="group-title">
          <i :class="group.icon"></i>
          <span>{{ group.category }}</span>
        </div>
        <div class="command-list">
          <div
            v-for="cmd in group.commands"
            :key="cmd.id"
            class="command-item"
            @click="$emit('execute', cmd.content)"
            :title="cmd.content"
          >
            <i :class="cmd.icon || 'el-icon-right'"></i>
            <span>{{ cmd.name }}</span>
          </div>
        </div>
      </div>

      <div v-if="commandGroups.length === 0" class="empty-commands">
        <i class="el-icon-magic-stick"></i>
        <p>暂无快捷指令</p>
        <el-button type="text" @click="$emit('open-config')">去配置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
const COMMANDS_STORAGE_KEY = 'ai_assistant_commands'

// 默认预设指令
const DEFAULT_COMMANDS = [
  {
    id: 'default_1',
    name: '查询CPU使用率',
    content: '查询最近1小时内CPU总使用率',
    icon: 'el-icon-data-line',
    category: '指标查询'
  },
  {
    id: 'default_2',
    name: '查询内存使用率',
    content: '查询最近1小时内存使用率',
    icon: 'el-icon-coin',
    category: '指标查询'
  },
  {
    id: 'default_3',
    name: '查询磁盘使用情况',
    content: '查询磁盘使用情况',
    icon: 'el-icon-box',
    category: '指标查询'
  },
  {
    id: 'default_4',
    name: '关键字查询监控对象',
    content: '通过关键字查询监控对象',
    icon: 'el-icon-search',
    category: '监控对象查询'
  },
  {
    id: 'default_5',
    name: 'IP查询监控对象',
    content: '通过IP查询监控对象',
    icon: 'el-icon-position',
    category: '监控对象查询'
  },
  {
    id: 'default_6',
    name: '操作系统监控统计',
    content: '查询操作系统下有多少监控对象',
    icon: 'el-icon-monitor',
    category: '监控对象查询'
  },
  {
    id: 'default_7',
    name: '网络设备数量',
    content: '查询目前监控了多少网络设备',
    icon: 'el-icon-connection',
    category: '监控对象查询'
  },
  {
    id: 'default_8',
    name: '查看当前告警',
    content: '查看当前告警',
    icon: 'el-icon-warning-outline',
    category: '告警与巡检'
  },
  {
    id: 'default_9',
    name: '执行全面巡检',
    content: '执行全面巡检',
    icon: 'el-icon-finished',
    category: '告警与巡检'
  }
]

export default {
  name: 'QuickCommands',
  data() {
    return {
      commands: []
    }
  },
  computed: {
    commandGroups() {
      const groups = {}
      this.commands.forEach(cmd => {
        const cat = cmd.category || '其他'
        if (!groups[cat]) {
          groups[cat] = {
            category: cat,
            icon: this.getCategoryIcon(cat),
            commands: []
          }
        }
        groups[cat].commands.push(cmd)
      })
      return Object.values(groups)
    }
  },
  created() {
    this.loadCommands()
  },
  methods: {
    loadCommands() {
      try {
        const saved = localStorage.getItem(COMMANDS_STORAGE_KEY)
        if (saved) {
          this.commands = JSON.parse(saved)
        } else {
          this.commands = [...DEFAULT_COMMANDS]
          this.saveCommands()
        }
      } catch (e) {
        console.error('加载快捷指令失败:', e)
        this.commands = [...DEFAULT_COMMANDS]
      }
    },

    saveCommands() {
      try {
        localStorage.setItem(COMMANDS_STORAGE_KEY, JSON.stringify(this.commands))
      } catch (e) {
        console.error('保存快捷指令失败:', e)
      }
    },

    // 外部调用：更新指令列表
    updateCommands(newCommands) {
      this.commands = newCommands
      this.saveCommands()
    },

    // 获取指令数据（供配置弹窗使用）
    getCommands() {
      return [...this.commands]
    },

    getCategoryIcon(category) {
      const iconMap = {
        '指标查询': 'el-icon-data-analysis',
        '监控对象查询': 'el-icon-search',
        '告警与巡检': 'el-icon-warning-outline',
        '其他': 'el-icon-more'
      }
      return iconMap[category] || 'el-icon-folder'
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-commands {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.commands-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eceef5;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
  }

  .header-actions {
    display: flex;
    gap: 2px;
  }

  .el-button {
    color: #8c8c9a;
    padding: 4px;
    font-size: 16px;

    &:hover {
      color: #1890ff;
    }
  }
}

.commands-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e0e0e0;
    border-radius: 2px;
  }
}

.command-group {
  margin-bottom: 16px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #8c8c9a;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  i {
    font-size: 13px;
    color: #1890ff;
  }
}

.command-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #4a4a5a;

  &:hover {
    background: #f0f5ff;
    color: #1890ff;
    transform: translateX(2px);

    i {
      color: #1890ff;
    }
  }

  i {
    font-size: 14px;
    color: #b0b0b8;
    flex-shrink: 0;
    transition: color 0.2s;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.empty-commands {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #b0b0b8;

  i {
    font-size: 40px;
    margin-bottom: 12px;
  }

  p {
    margin: 4px 0 12px;
    font-size: 14px;
  }
}
</style>
