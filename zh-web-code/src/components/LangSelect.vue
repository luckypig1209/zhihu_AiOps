<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="language-select">
      <i class="el-icon-menu"></i>
      <span>{{ currentLanguage }}</span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
      <el-dropdown-item command="en-US">English</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'LangSelect',
  computed: {
    currentLanguage() {
      const language = localStorage.getItem("accept-language") || this.$i18n.locale
      return language === 'zh-CN' ? '中文' : 'English'
    }
  },
  methods: {
    handleSetLanguage(lang) {
      let localLanguage = 'zh';
      if (lang === 'zh-CN') {
        localLanguage = 'zh';
      } else if (lang === 'en-US') {
        localLanguage = 'en';
      }
      this.$i18n.locale = localLanguage;
      localStorage.setItem('accept-language', lang);
      this.$message.success(`Language changed to ${lang === 'zh-CN' ? '中文' : 'English'}`);
      // 刷新页面以确保所有组件都使用新语言
      window.location.reload();
    }
  }
}
</script>

<style scoped>
.language-select {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  height: 40px;
  border-radius: 4px;
  transition: all 0.3s;
}

.language-select:hover {
  background-color: #f5f7fa;
}

.language-select i {
  margin-right: 5px;
  font-size: 16px;
}
</style>
