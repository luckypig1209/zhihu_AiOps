import Vue from 'vue'

import Element from 'element-ui'
import './assets/styles/element-variables.scss'
import iView from "view-design";
import "view-design/dist/styles/iview.css";
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import '@/assets/styles/index.scss' // global css
import '@/assets/styles/ruoyi.scss' // ruoyi css
import App from './App'
import store from './store'
import router from './router'
import directive from './directive' // directive
import plugins from './plugins' // plugins
import $u from "@/utils/common";
import { fileDown, getFileUrl } from '@/utils/fileDown'

import './assets/icons' // icon
import './permission' // permission control
// import './tongji' // 百度统计
import { getDicts } from "@/api/system/dict/data";
import moment from "moment";
import { getConfigKey } from "@/api/infra/config";
import { parseTime, resetForm, handleTree, addBeginAndEndTime, divide} from "@/utils/ruoyi";
import { ButtonLimited, dataTag } from "./views/admin";

import {DICT_TYPE, getDictDataLabel, getDictDatas, getDictDatas2} from "@/utils/dict";
// import JsonViewer from 'vue-json-viewer'
// Vue.use(JsonViewer)
import '@fortawesome/fontawesome-free/css/all.min.css'

// import Editor from 'vue2-ace-editor'
// Vue.component('editor', Editor)
// 1. 引入 Ant Design Vue 及其样式文件
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css'; // 引入预构建的样式
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
import enUS from 'ant-design-vue/lib/locale-provider/en_US';

// 引入国际化配置
import i18n from './i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en'
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'



// 2. 全局注册组件
Vue.use(Antd);
// 字典标签组件
import DictTag from '@/components/DictTag'
import DocAlert from '@/components/DocAlert'

// 全局方法挂载
Vue.prototype.getDicts = getDicts
Vue.prototype.$moment = moment;
Vue.prototype.getConfigKey = getConfigKey
Vue.prototype.parseTime = parseTime
Vue.prototype.resetForm = resetForm
Vue.prototype.getDictDatas = getDictDatas
Vue.prototype.getDictDatas2 = getDictDatas2
Vue.prototype.getDictDataLabel = getDictDataLabel
Vue.prototype.DICT_TYPE = DICT_TYPE
Vue.prototype.handleTree = handleTree
Vue.prototype.addBeginAndEndTime = addBeginAndEndTime
Vue.prototype.divide = divide
Vue.prototype.$bus = new Vue();
Vue.prototype.downLoad = fileDown
Vue.prototype.getFileUrl = getFileUrl
Vue.use($u)
// 全局组件挂载
Vue.component('DictTag', DictTag)
Vue.component('DocAlert', DocAlert)
// Vue.component('Pagination', Pagination)
// Vue.component('RightToolbar', RightToolbar)
Vue.component('Treeselect', Treeselect)
Vue.component("Button", ButtonLimited);
// 头部标签插件
import VueMeta from 'vue-meta'
Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
});
Vue.use(directive)
Vue.use(plugins)
Vue.use(VueMeta)
// Vue.use(hljs.vuePlugin);

// bpmnProcessDesigner 需要引入
// import MyPD from "@/components/bpmnProcessDesigner/package/index.js";
// Vue.use(MyPD);
// import "@/components/bpmnProcessDesigner/package/theme/index.scss";
// import "bpmn-js/dist/assets/diagram-js.css";
// import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
// import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
// import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

// Form Generator 组件需要使用到 tinymce
// import Tinymce from '@/components/tinymce/index.vue'
// Vue.component('tinymce', Tinymce)
// // Form Generator 组件需要使用到 editTable
// import editTable from '@/components/editTable/index.vue'
// Vue.component('editTable', editTable)
// // Form Generator 组件需要使用到 editTable
// import formTooltip from '@/components/formTooltip/index.vue'
// Vue.component('formTooltip', formTooltip)
// // Form Generator 组件需要使用到 foemtip
// import formTip from '@/components/formTip/index.vue'
// Vue.component('formTip', formTip)
// import VueSignature from "vue-signature-pad";
// Vue.use(VueSignature);
// // Form Generator 组件需要使用到 手写签名
// import formSignature from '@/components/formSignature/index.vue'
// Vue.component('formSignature', formSignature)
import '@/assets/icons'
import request from "@/utils/request" // 实现 form generator 使用自己定义的 axios request 对象
// console.log(request)
import 'leaflet/dist/leaflet.css'
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})
Vue.use(L)
Vue.prototype.$axios = request
import '@/styles/index.scss'
Vue.prototype.getFormValidator = function(max=50, min=0, name='', checkSpecialChars=false) {
  const _this = this;
  return function (rule, value, callback) {
    // 校验空格
    //  console.log('eee',value,value.length)
    if(value===undefined||value===""){
      if(min>0){
        return callback(new Error(_this.$t('fieldCannotBeEmpty', {name: name})));
      }else{
        return callback();
      }

    }
    if (value && (value + '').indexOf(" ") > -1) {
      return callback(new Error(_this.$t('doNotInputSpace')));
    }

    // 校验长度
    if (value && value.length > max ) {
      return callback(new Error(_this.$t('fieldLengthNotExceed', {name: name, max: max})));
    }
    if (value && value.length <min ) {
      return callback(new Error(_this.$t('fieldLengthNotLess', {name: name, min: min})));
    }

    // 如果需要校验特殊字符
    if (checkSpecialChars) {
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (specialCharRegex.test(value)) {
        return callback(new Error(_this.$t('fieldCannotContainSpecialChars', {name: name})));
      }
    }

    // 校验通过
    return callback();
  }
}
// 默认点击背景不关闭弹窗
import ElementUI from 'element-ui'
ElementUI.Dialog.props.closeOnClickModal.default = false

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */

Vue.use(Element, {
  size: localStorage.getItem("size") || "medium", // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
});

Vue.config.productionTip = false


new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h('a-config-provider', {
    props: {
      locale: i18n.locale === 'en' ? enUS : zhCN  // 根据当前语言设置
    }
  }, [h(App)])
})
