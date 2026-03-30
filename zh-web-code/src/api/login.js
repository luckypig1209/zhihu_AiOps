import request from '@/utils/request'
import requestSSO from '@/utils/requestSSO'
import { getRefreshToken } from '@/utils/auth'
import service from '@/utils/request'

// 登录方法
export function login(username, password, captchaVerification, socialType, socialCode, socialState) {
  const data = {
    username,
    password,
    captchaVerification,
    // 社交相关
    socialType,
    socialCode,
    socialState
  }
  return request({
    url: '/system/auth/login',
    method: 'post',
    data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/auth/get-permission-info',
    method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/system/auth/logout',
    method: 'post'
  })
}

// 社交授权的跳转
export function socialAuthRedirect(type, redirectUri) {
  return request({
    url: '/system/auth/social-auth-redirect?type=' + type + '&redirectUri=' + redirectUri,
    method: 'get'
  })
}

// 社交快捷登录，使用 code 授权码
export function socialLogin(type, code, state) {
  return request({
    url: '/system/auth/social-login',
    method: 'post',
    data: {
      type,
      code,
      state
    }
  })
}

// 获取登录验证码
export function sendSmsCode(mobile, scene) {
  return request({
    url: '/system/auth/send-sms-code',
    method: 'post',
    data: {
      mobile,
      scene
    }
  })
}

// 短信验证码登录
export function smsLogin(mobile, code) {
  return request({
    url: '/system/auth/sms-login',
    method: 'post',
    data: {
      mobile,
      code
    }
  })
}

// 刷新访问令牌
export function refreshToken() {
  return service({
    url: '/system/auth/refresh-token?refreshToken=' + getRefreshToken(),
    method: 'post'
  })
}

// ========== OAUTH 2.0 相关 ==========

export function getAuthorize(clientId) {
  return request({
    url: '/system/oauth2/authorize?clientId=' + clientId,
    method: 'get'
  })
}

export function authorize(responseType, clientId, redirectUri, state,
  autoApprove, checkedScopes, uncheckedScopes) {
  // 构建 scopes
  const scopes = {}
  for (const scope of checkedScopes) {
    scopes[scope] = true
  }
  for (const scope of uncheckedScopes) {
    scopes[scope] = false
  }
  // 发起请求
  return service({
    url: '/system/oauth2/authorize',
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    params: {
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      state: state,
      auto_approve: autoApprove,
      scope: JSON.stringify(scopes)
    },
    method: 'post'
  })
}

// 获取验证图片  以及token
export function reqGet(data) {
  return request({
    url: 'system/captcha/get',
    method: 'post',
    data
  })
}

// 滑动或者点选验证
export function reqCheck(data) {
  return request({
    url: '/system/captcha/check',
    method: 'post',
    data
  })
}
export function getActiveVersion(data) {
  return request({
    url: '/system/version/query-active-version',
    method: 'post',
    data
  })
}
export function getAllVersions(data) {
  return request({
    url: '/system/version/query-all',
    method: 'post',
    data
  })
}
//首页-工作小结
export function getWorkSummary(data) {
  return request({
    url: '/bpm/process-instance/query-work-order',
    method: 'post',
    data
  })
}
//首页-我的合作方
export function getPartnerList(data) {
  return request({
    url: '/cqt/workbench/query-partners',
    method: 'post',
    data
  })
}
//首页-我的客户项目
export function getCustomerList(data) {
  return request({
    url: '/cqt/workbench/query-customers',
    method: 'post',
    data
  })
}
//首页-告警-申告
export function getFourCount(data) {
  return request({
    url: '/cqt/workbench/count',
    method: 'post',
    data
  })
}
//首页-商机
export function getOpportunityTotal(data) {
  return request({
    url: '/cqt/workbench/query-opportunity-total',
    method: 'post',
    data
  })
}
// 24.4.8医保局定制化首页
// 总体数据
export function getAlarm() { // 获取告警数
  return request({
    url: '/cqt/alarms/page',
    method: 'post',
    data: {
      messageType: "ADD"
    }
  })
}
export function getErrorSheet(data) { // 获取故障单
  return request({
    url: '/cqt/workbench/work-order/get-count',
    method: 'post',
    data
  })
}
export function getHiddenTrouble(data) { // 获取隐患单
  return request({
    url: '/cqt/hidden-danger-identification/page',
    method: 'post',
    data
  })
}
export function getSchedule() { // 获取服务计划
  return request({
    // url: '/cqt/workbench/service-plan/page',
    url: '/cqt/service-plan-manage-task/todo-page',
    method: 'post',
    data: {
      pageNo: 1,
      pageSize: 10
    }
  })
}
//趋势
//告警
export function getAlarmChange(data) {
  return request({
    url: '/cqt/alarms/static',
    method: 'post',
    data:data
  })
}
//隐患
export function getDangerChange(data) {
  return request({
    url: '/cqt/hidden-danger-identification/static',
    method: 'post',
    data:data
  })
}
//工单
export function getProcessInChange(data) {
  return request({
    url: '/bpm/process-instance/static',
    method: 'post',
    data:data
  })
}
//计划
export function getPlanChange(data) {
  return request({
    url: '/cqt/service-plan-manage/static',
    method: 'post',
    data:data
  })
}
//资产信息
export function getProductInfo() { // 获取资产信息
  return request({
    url: '/cqt/asset-info/total-static',
    method: 'get',
  })
}
// 待办已办
export function getMyTodo(data) { // 我的任务:待办
  return request({
    url: '/bpm/process-instance/todo-page',
    // url: '/bpm/task/todo-page',
    method: 'post',
    // method: 'get',
    data
  })
}
// 获取服务计划列表
export function  getMyservicePlan(data) {
  return request({
    url: '/cqt/service-plan-manage/page',
    method: 'post',
    data
  })
}
export function getMyDone(data) { // 我的任务:已办
  return request({
    url: '/bpm/process-instance/done-page',
    // url: '/bpm/task/done-page',
    method: 'post',
    // method: 'get',
    data
  })
}
export function getAllSheet(status) { // 所有工单, 1进行中, 2已完成
  return request({
    url: '/bpm/process-instance/process-page',
    method: 'post',
    data: {
      status
    }
  })
}
export function getAllProcess(data) { // 我的发起, 1进行中, 2已完成
  return request({
    url: '/bpm/process-instance/my-process-page',
    method: 'post',
    data
  })
}

// 资产信息
export function getAssetInfo(data) {
  return request({
    url: '/cqt/workbench/asset/page',
    method: 'post',
    data
  })
}

// 上传license文件
export function getUploadFile(params) {
  return request({
    url: '/system/license/load',
    method: 'post',
    params
  })
}
// license文件信息
export function getLicenseInfo(params) {
  return request({
    url: '/system/license/product-info',
    method: 'post',
    params
  })
}
// license校验
export function getLicenseVerify(params) {
  return request({
    url: '/system/license/inner-verify',
    method: 'post',
    params
  })
}
// 获取licenseCpu序列号
export function getLicenseCpu(params) {
  return request({
    url: '/system/license/cpu-number',
    method: 'post',
    params
  })
}
// 当日值班
export class socialBindLogin {
}
// 信息化管家
export function getSsoTokenAPI() {
  return requestSSO({
    url: '/acc/redirect/sso/1001',
    method: 'get',
  })
}
