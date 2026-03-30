import Vue from 'vue'
import VueI18n from 'vue-i18n'
import elementEnLocale from 'element-ui/lib/locale/lang/en'
import elementZhLocale from 'element-ui/lib/locale/lang/zh-CN'
import antEnLocale from 'ant-design-vue/lib/locale-provider/en_US'
import antZhLocale from 'ant-design-vue/lib/locale-provider/zh_CN'
import iviewEnLocale from 'view-design/dist/locale/en-US'
import iviewZhLocale from 'view-design/dist/locale/zh-CN'
import enLocale from './langs/en'
import zhLocale from './langs/zh'

Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale,
    ...elementEnLocale,
    ...antEnLocale,
    ...iviewEnLocale
  },
  zh: {
    ...zhLocale,
    ...elementZhLocale,
    ...antZhLocale,
    ...iviewZhLocale
  }
}

// 从URL参数中获取语言设置
function getLocaleFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('lang');
}

// 创建i18n实例
const i18n = new VueI18n({
  locale: getLocaleFromUrl() || localStorage.getItem('accept-language') || process.env.VUE_APP_DEFAULT_LOCALE || 'en',
  messages
})

export default i18n