<template>
    <div>
        <Card title="">
            <div style="display: flex;  width: 100%; margin-right: 20px; margin-bottom: 10px;">
                
                <el-select
                    :disabled="false"
                    :placeholder="$t('common.pleaseSelectTheme')"
                    :search-placeholder="$t('common.searchTheme')"
                    v-model="valueTheme"
                    style="width: 150px; margin-right: 20px;"
                    @change="selectTheme"
                    searchable>
                    <el-option v-for="option in listTheme"
                        :key="option"
                        :label="option"
                        :value="option">
                    </el-option>
                </el-select>
 
                <!-- <el-select
                    :disabled="false"
                    :placeholder="$t('common.pleaseSelectLanguage')"
                    :search-placeholder="$t('common.searchLanguage')"
                    v-model="valueCodeLang"
                    style="width: 150px; margin-right: 20px;"
                    @change="selectLang"
                    :font-size="large"
                    searchable>
                    <el-option v-for="option in listCodeLang"
                        :key="option"
                        :label="option"
                        :value="option">
                    </el-option>
                </el-select> -->
 
                <el-button theme="primary" icon="script-file" class="mr10" @click="copyCode()">{{ $t('common.copyCode') }}</el-button>
                <el-button v-if="valueCodeLang === 'json'" theme="primary" icon="eye" class="mr10" @click="formatCode()">{{ $t('common.beautifyCode') }}</el-button>
 
            </div>
 
            <editor
                ref="aceEditor"
                v-model="content"
                @init="editorInit"
                width="100%"
                height="400px"
                :lang="lang"
                :theme="theme"
                :options="{
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true,
                    tabSize: 6, fontSize: 14,
                    readOnly: readOnly,//设置是否只读
                    showPrintMargin: false //去除编辑器里的竖线
                }"
            ></editor>
        </Card>
        
    </div>
</template>
 
<script>
    export default {
        components: {
            editor: require('vue2-ace-editor')
        },
        props: {
            // 是否只读
            readOnly: {
                type: Boolean,
                default: false
            },
            // 要展示的代码
            codeData: {
                type: String,
                default: ''
            },
            // 默认的主题
            valueTheme: {
                type: String,
                default: 'dracula'
            },
            // 默认的语言
            valueCodeLang: {
                type: String,
                default: 'json'
            }
        },
        data () {
            return {
                listTheme: [
                    'dracula',
                    'chrome',
                    'chaos',
                    'clouds',
                    'clouds_midnight',
                    'xcode',
                    'monokai',
                    'ambiance',
                    'dreamweaver',
                    'eclipse',
                    'github',
                    'idle_fingers'
                ],
                listCodeLang: [
                    'json',
                    'yaml',
                    'xml',
                    'java',
                    'text',
                    'javascript',
                    'scheme',
                    'lua',
                    'mysql',
                    'perl',
                    'powershell',
                    'python',
                    'ruby',
                    'sql',
                    'hjson',
                    'ini'
                ],
            
                content: '',
                theme: '',
                lang: ''
            }
        },
        mounted () {
            // 初始化编辑器
            this.editorInit()
            // 初始化主题、语言
            this.theme = this.valueTheme
            this.lang = this.valueCodeLang
            // 若传输代码，则展示代码
            if (this.codeData) {
                console.log(this.codeData)
                this.$refs.aceEditor.editor.setValue(this.codeData)
            }
        },
        methods: {
            selectTheme (newValue, oldValue) {
                if (newValue) {
                    this.theme = newValue
                }
            },
            selectLang (newValue, oldValue) {
                if (newValue) {
                    this.lang = newValue
                }
            },
            editorInit () { // 初始化
                require('brace/ext/language_tools')
                require('brace/ext/beautify')
                require('brace/ext/error_marker')
                require('brace/ext/searchbox')
                require('brace/ext/split')
 
                // 循坏加载语言，通过点击按钮切换
                for (let s = 0; s < this.listCodeLang.length; s++) {
                    require('brace/snippets/' + this.listCodeLang[s])
                }
                for (let j = 0; j < this.listCodeLang.length; j++) {
                    require('brace/mode/' + this.listCodeLang[j])
                }
 
                // 循坏加载主题，通过点击按钮切换
                for (let i = 0; i < this.listTheme.length; i++) {
                    require('brace/theme/' + this.listTheme[i])
                }
            },
 
            copyCode () {
                const code = this.$refs.aceEditor.editor.getValue()
                
                // 复制到剪切板
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(code)
                    // 复制成功 给提示 此处省略
                } else {
                    // 复制失败 给提示 此处省略
                    alert(this.$t('common.browserDoesNotSupportAutoCopy'))
                }
            },
 
            formatCode () {
                const string = JSON.stringify(JSON.parse(this.$refs.aceEditor.editor.getValue()), null, 2)
                this.$refs.aceEditor.editor.setValue(string)
            }
        
            // getValue () { // 获取编辑器中的值
            //     console.log('编辑器中第一个换行符的位置：' + this.$refs.aceEditor.editor.getValue().indexOf('\n'))
            // }
        }
    }
</script>
 
<style>
 
</style>