<template>
  <el-dialog title="Skills 知识库编辑" :visible.sync="dialogVisible" width="900px" top="4vh" :close-on-click-modal="false" class="skills-editor-dialog">
    <div class="skills-layout">
      <!-- 左侧：skill 列表 -->
      <div class="skills-list">
        <div
          v-for="skill in skills"
          :key="skill.name"
          class="skill-item"
          :class="{ active: currentSkill === skill.name }"
          @click="selectSkill(skill)"
        >
          <i class="el-icon-document"></i>
          <div class="skill-info">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-size">{{ formatSize(skill.size) }}</span>
          </div>
        </div>
        <div v-if="skills.length === 0 && !loading" class="empty-tip">
          <i class="el-icon-warning-outline"></i>
          <p>未加载到 Skills</p>
          <p class="sub">请检查 WebSocket 连接</p>
        </div>
      </div>
      <!-- 右侧：编辑器 -->
      <div class="skill-editor">
        <div v-if="currentSkill" class="editor-header">
          <span class="editor-title">api_{{ currentSkill }}.md</span>
          <el-tag size="mini" :type="modified ? 'warning' : 'info'">{{ modified ? '已修改' : '未修改' }}</el-tag>
        </div>
        <textarea
          v-if="currentSkill"
          v-model="editorContent"
          class="editor-textarea"
          spellcheck="false"
          @input="modified = true"
        ></textarea>
        <div v-else class="editor-placeholder">
          <i class="el-icon-edit-outline"></i>
          <p>选择左侧 Skill 开始编辑</p>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="dialogVisible = false">关闭</el-button>
      <el-button size="small" type="primary" :loading="saving" :disabled="!modified" @click="handleSave">
        保存并生效
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import wsService from '@/utils/websocketService'

export default {
  name: 'SkillsEditorDialog',
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      skills: [],
      currentSkill: '',
      editorContent: '',
      modified: false,
      saving: false,
      loading: false
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(val) { this.$emit('update:visible', val) }
    }
  },
  watch: {
    visible(val) {
      if (val) this.loadSkills()
    }
  },
  methods: {
    async loadSkills() {
      if (!wsService.isConnected) {
        this.$message.warning('WebSocket 未连接，无法加载 Skills')
        return
      }
      this.loading = true
      try {
        const res = await wsService.getSkills()
        if (res.skills) {
          this.skills = res.skills
          if (this.skills.length > 0 && !this.currentSkill) {
            this.selectSkill(this.skills[0])
          }
        }
      } catch (e) {
        this.$message.error('加载 Skills 失败: ' + e.message)
      } finally {
        this.loading = false
      }
    },
    selectSkill(skill) {
      if (this.modified) {
        this.$confirm('当前内容已修改但未保存，是否切换？', '提示', {
          confirmButtonText: '切换',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this._doSelect(skill)
        }).catch(() => {})
      } else {
        this._doSelect(skill)
      }
    },
    _doSelect(skill) {
      this.currentSkill = skill.name
      this.editorContent = skill.content || ''
      this.modified = false
    },
    async handleSave() {
      if (!this.currentSkill) return
      this.saving = true
      try {
        await wsService.updateSkill(this.currentSkill, this.editorContent)
        this.modified = false
        // 更新本地列表中的 size
        const skill = this.skills.find(s => s.name === this.currentSkill)
        if (skill) {
          skill.content = this.editorContent
          skill.size = this.editorContent.length
        }
        this.$message.success(`Skill "${this.currentSkill}" 已保存并实时生效`)
      } catch (e) {
        this.$message.error('保存失败: ' + e.message)
      } finally {
        this.saving = false
      }
    },
    formatSize(bytes) {
      if (!bytes) return ''
      if (bytes < 1024) return bytes + ' B'
      return (bytes / 1024).toFixed(1) + ' KB'
    }
  }
}
</script>

<style lang="scss" scoped>
$primary: #1890ff;

.skills-editor-dialog {
  ::v-deep .el-dialog__body {
    padding: 0;
  }
}

.skills-layout {
  display: flex;
  height: 60vh;
  border-top: 1px solid #e8ecf1;
  border-bottom: 1px solid #e8ecf1;
}

.skills-list {
  width: 200px;
  border-right: 1px solid #e8ecf1;
  overflow-y: auto;
  background: #fafbfc;
  padding: 8px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;

  i { color: #b0b8c4; font-size: 15px; }

  &:hover { background: #f0f5ff; }
  &.active {
    background: rgba($primary, 0.1);
    i { color: $primary; }
    .skill-name { color: $primary; font-weight: 500; }
  }
}

.skill-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.skill-name {
  font-size: 13px;
  color: #4a5568;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skill-size {
  font-size: 11px;
  color: #b0b8c4;
}

.skill-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #e8ecf1;
  background: #fafbfc;
}

.editor-title {
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
  font-family: 'Monaco', 'Consolas', monospace;
}

.editor-textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 16px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  background: #fff;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #d0d5dd; border-radius: 3px; }
}

.editor-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b0b8c4;

  i { font-size: 40px; margin-bottom: 12px; }
  p { font-size: 14px; }
}

.empty-tip {
  text-align: center;
  padding: 40px 16px;
  color: #b0b8c4;

  i { font-size: 32px; margin-bottom: 8px; display: block; }
  p { margin: 4px 0; font-size: 13px; }
  .sub { font-size: 12px; opacity: 0.7; }
}
</style>
