<template>
  <div>
    <!-- <el-row>
      <el-col :span="4"> </el-col>
    </el-row> -->
    <!--editor插件-->
    <!--其中的@input中的方法就是子组件值改变时调用的方法，该方法会给父组件传入改变值-->
    <editor
      :value="content"
      @input="handleInput"
      @init="editorInit"
      :lang="aceConfig.selectLang"
      :theme="aceConfig.selectTheme"
      :options="aceConfig.options"
      width="100%"
      :height="height"
    />
  </div>
</template>

<script>
// 编辑器主题
const themes = ["xcode", "eclipse", "textmate", "monokai", "cobalt", "solarized_light"];
// 编辑器语言
const langs = ["c_cpp", "java", "javascript", "golang"];
// tabs
const tabs = [2, 4, 8];
// 字体大小
const fontSizes = [14, 15, 16, 17, 18, 19, 20, 21, 22];
// 编辑器选项
const options = {
  tabSize: 4, // tab默认大小
  showPrintMargin: false, // 去除编辑器里的竖线
  fontSize: 20, // 字体大小
  highlightActiveLine: true, // 高亮配置
  enableBasicAutocompletion: true, //启用基本自动完成
  enableSnippets: true, // 启用代码段
  enableLiveAutocompletion: true // 启用实时自动完成
};
export default {
  name: "CodeEdit",
  components: {
    editor: require("vue2-ace-editor")
  },
  data() {
    return {
      visible: false, // 模态窗口显示控制
      aceConfig: {
        // 代码块配置
        langs, // 语言
        themes, // 主题
        tabs, // tab空格
        fontSizes,
        options, // 编辑器属性设置
        selectTheme: this.theme, // 默认选择的主题
        selectLang: this.lang, // 默认选择的语言
        readOnly: false // 是否只读
      }
    };
  },
  // 接收父组件v-model传来的值
  model: {
    prop: "content",
    event: "change"
  },
  props: {
    content: String, // content就是上面prop中声明的值，要保持一致
    theme: String,
    lang: String,
    height: {
      type: String,
      default: "100%"
    }
  },
  watch: {
    theme: function (val) {
      this.handleThemeChange(val);
    }
  },
  methods: {
    // 当该组件中的值改变时，通过该方法将该组件值传给父组件，实现组件间双向绑定
    handleInput(e) {
      this.$emit("change", e); // 这里e是每次子组件修改的值，change就是上面event中声明的，不要变
    },
    // 显示'编辑器设置'模态窗口
    showSettingModal() {
      this.visible = true;
    },
    // '编辑器设置'模态窗口确认按钮回调
    handleOk() {
      this.visible = false;
      // this.editorInit()
    },
    // 代码块主题切换
    handleThemeChange(value) {
      this.aceConfig.selectTheme = value;
      this.editorInit();
    },
    // 代码块语言切换
    handleLangChange(value) {
      this.aceConfig.selectLang = value;
      this.editorInit();
    },
    // tab切换
    handleTabChange(value) {
      this.aceConfig.options.tabSize = value;
      this.editorInit();
    },
    // 字体大小切换
    handleFontChange(value) {
      this.aceConfig.options.tabSize = value;
      this.editorInit();
    },
    // 代码块初始化
    editorInit() {
      require("brace/ext/language_tools"); // language extension prerequsite...
      require(`brace/mode/${this.aceConfig.selectLang}`); // 语言
      require(`brace/theme/${this.aceConfig.selectTheme}`); // 主题
    }
  }
};
</script>

<style scoped>
.settingTitle {
  font-size: larger;
}
.settingDescription {
  font-size: small;
  color: #a8a8af;
}
</style>