import request from '@/utils/request'

// 查询公告列表
export function listNotice(query) {
  return request({
    url: '/system/notice/page',
    method: 'get',
    params: query
  })
}

// 查询公告详细
export function getNotice(noticeId) {
  return request({
    url: '/system/notice/get?id=' + noticeId,
    method: 'get'
  })
}

// 新增公告
export function addNotice(data) {
  return request({
    url: '/system/notice/create',
    method: 'post',
    data: data
  })
}

// 修改公告
export function updateNotice(data) {
  return request({
    url: '/system/notice/update',
    method: 'put',
    data: data
  })
}

// 删除公告
export function delNotice(noticeId) {
  return request({
    url: '/system/notice/delete?id=' + noticeId,
    method: 'delete'
  })
}

// 推送公告
export function pushNotice(noticeId) {
  return request({
    url: '/system/notice/push?id=' + noticeId,
    method: 'post'
  })
}
// 模版列表
export function messageTemplateList(data) {
  return request({
    url: '/system/message-template/page',
    method: 'post',
    data: data
  })
}
// 测试连接
export function testTempleteAPI(data) {
  return request({
    url: '/bpm/public/message/test',
    method: 'post',
    data: data
  })
}
// 新建模版
export function messageTemplateCreate(data) {
  return request({
    url: '/system/message-template/create',
    method: 'post',
    data: data
  })
}
// 更新模版
export function messageTemplateUpdate(data) {
  return request({
    url: '/system/message-template/update',
    method: 'post',
    data: data
  })
}
// 删除模版
export function messageTemplateDelete(data) {
  return request({
    url: '/system/message-template/delete',
    method: 'post',
    data: data
  })
}
// 消息记录分页
export function smsRecordList(data) {
  return request({
    url: '/system/sms-record/page',
    method: 'post',
    data: data
  })
}
// 消息记录详情
export function smsRecordDetail(data) {
  return request({
    url: '/system/sms-record/get',
    method: 'post',
    data: data
  })
}
// 根据通知方式获取模版
export function notifyWay(data) {
  return request({
    url: '/system/message-template/notify-way',
    method: 'post',
    data: data
  })
}
// 设置通知方式
export function messageCreate(data) {
  return request({
    url: '/bpm/process-message-template/create-by-process',
    method: 'post',
    data: data
  })
}
// 获取通知内容
export function getMessageTemplate(data) {
  return request({
    url: `/bpm/process-message-template/get-by-process?processKey=${data}`,
    method: 'post',
  })
}
// 通知模板 获取工单字段
export function getTemplateOrderFields(data) {
  return request({
    url: `/bpm/process-message-template/get-msg-process-value`,
    method: 'post',
    data: data
  })
}
// 获取任务的通知列表
export function getTaskTemplateList(data) {
  return request({
    url: `/bpm/process-message-template/get-task-templates-list`,
    method: 'post',
    params: data
  })
}
// 获取任务的通知列表
export function getTaskTemplateSwitch(data) {
  return request({
    url: `/bpm/task-message-switch/get-by-key`,
    method: 'post',
    data: data
  })
}

// 获取任务的通知详情
export function getTaskNoticDetail(data) {
  return request({
    url: `/bpm/process-message-template/get-by-process`,
    method: 'post',
    params: data
  })
}