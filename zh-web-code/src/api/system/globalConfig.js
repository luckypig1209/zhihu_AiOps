import request from '@/utils/request'

export function getGlobalConfig() {
  return request({
    url: '/system/global-config/get',
    method: 'post',
  })
}

export function getLogoGlobalConfig() {
  return request({
    url: '/system/global-config/get-logo-config',
    method: 'post',
  })
}

export function updateGlobalConfig(data) {
  return request({
    url: '/system/global-config/update',
    method: 'post',
    data
  })
}
