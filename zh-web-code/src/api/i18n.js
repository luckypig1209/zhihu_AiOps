import request from '@/utils/request'

// i18n默认配置
export function getDefaultI18nConfig() {
  return request({
    url: '/system/i18n/default',
    method: 'get',
  })
}

// i18n配置支持信息
export function getI18nSupports() {
  return request({
    url: '/system/i18n/supports',
    method: 'get',
  })
}
