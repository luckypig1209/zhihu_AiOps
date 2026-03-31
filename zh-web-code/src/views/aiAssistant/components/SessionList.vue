<template>
  <div class="session-list">
    <div class="session-header">
      <el-button type="primary" size="small" icon="el-icon-plus" @click="createSession" class="new-session-btn">
        新建会话
      </el-button>
    </div>

    <div class="session-groups" v-if="groupedSessions.length > 0">
      <div v-for="group in groupedSessions" :key="group.label" class="session-group">
        <div class="group-label">{{ group.label }}</div>
        <div
          v-for="session in group.sessions"
          :key="session.id"
          class="session-item"
          :class="{ active: session.id === currentSessionId }"
          @click="$emit('select', session.id)"
        >
          <div class="session-info">
            <i class="el-icon-chat-dot-round session-icon"></i>
            <span class="session-title" :title="session.title">{{ session.title }}</span>
          </div>
          <el-button
            type="text"
            icon="el-icon-delete"
            class="delete-btn"
            @click.stop="deleteSession(session.id)"
            title="删除会话"
          ></el-button>
        </div>
      </div>
    </div>

    <div class="empty-sessions" v-else>
      <i class="el-icon-chat-line-square"></i>
      <p>暂无会话记录</p>
      <p class="sub-text">点击上方按钮开始新对话</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SessionList',
  props: {
    currentSessionId: {
      type: String,
      default: ''
    },
    storageKey: {
      type: String,
      default: 'ai_assistant_sessions'
    }
  },
  data() {
    return {
      sessions: []
    }
  },
  computed: {
    groupedSessions() {
      if (this.sessions.length === 0) return []

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const yesterday = today - 86400000

      const groups = {
        today: { label: '今天', sessions: [] },
        yesterday: { label: '昨天', sessions: [] },
        earlier: { label: '更早', sessions: [] }
      }

      this.sessions
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .forEach(s => {
          if (s.updatedAt >= today) {
            groups.today.sessions.push(s)
          } else if (s.updatedAt >= yesterday) {
            groups.yesterday.sessions.push(s)
          } else {
            groups.earlier.sessions.push(s)
          }
        })

      return Object.values(groups).filter(g => g.sessions.length > 0)
    }
  },
  created() {
    this.loadSessions()
  },
  watch: {
    storageKey() {
      this.sessions = []
      this.loadSessions()
    }
  },
  methods: {
    loadSessions() {
      try {
        const saved = localStorage.getItem(this.storageKey)
        if (saved) {
          this.sessions = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载会话列表失败:', e)
        this.sessions = []
      }
    },

    saveSessions() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.sessions))
      } catch (e) {
        console.error('保存会话列表失败:', e)
      }
    },

    createSession() {
      const session = {
        id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      this.sessions.unshift(session)
      this.saveSessions()
      this.$emit('select', session.id)
    },

    deleteSession(id) {
      this.$confirm('确定删除此会话？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const idx = this.sessions.findIndex(s => s.id === id)
        if (idx !== -1) {
          this.sessions.splice(idx, 1)
          this.saveSessions()
          this.$emit('delete', id)
        }
      }).catch(() => {})
    },

    // 外部调用：更新会话
    updateSession(id, data) {
      const session = this.sessions.find(s => s.id === id)
      if (session) {
        Object.assign(session, data, { updatedAt: Date.now() })
        this.saveSessions()
      }
    },

    // 外部调用：获取会话
    getSession(id) {
      return this.sessions.find(s => s.id === id)
    },

    // 外部调用：获取或创建第一个会话
    ensureSession() {
      if (this.sessions.length === 0) {
        this.createSession()
      }
      return this.sessions[0]
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #1890ff;

.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid #e8ecf1;

  .new-session-btn {
    width: 100%;
    background: #fff;
    border: 1px dashed $primary;
    color: $primary;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: rgba($primary, 0.06);
      border-color: $primary;
    }
  }
}

.session-groups {
  flex: 1;
  overflow-y: auto;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 2px;
  }
}

.session-group {
  margin-bottom: 8px;
}

.group-label {
  font-size: 12px;
  color: #909daf;
  padding: 8px 12px 4px;
  letter-spacing: 1px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s;
  margin-bottom: 2px;

  &:hover {
    background: #f0f5ff;

    .delete-btn {
      opacity: 1;
    }
  }

  &.active {
    background: rgba($primary, 0.08);

    .session-title {
      color: $primary;
      font-weight: 500;
    }

    .session-icon {
      color: $primary;
    }
  }

  .session-info {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;

    .session-icon {
      margin-right: 8px;
      color: #b0b8c4;
      font-size: 14px;
      flex-shrink: 0;
    }

    .session-title {
      color: #4a5568;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .delete-btn {
    opacity: 0;
    color: #b0b8c4;
    padding: 4px;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      color: #f56c6c;
    }
  }
}

.empty-sessions {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b0b8c4;

  i {
    font-size: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 4px 0;
    font-size: 14px;
  }

  .sub-text {
    font-size: 12px;
    opacity: 0.7;
  }
}
</style>
