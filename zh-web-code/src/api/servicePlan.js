import request from '@/utils/request'

/* ---计划模板开始--- */

// 查询计划模板
export function getPage(query) {
  return request({
    url: '/cqt/operation-schedule-type/page',
    method: 'post',
    data: query
  })
}

// 获取计划类别
export function getListAll(query) {
  return request({
    url: '/system/dict-data/list-all',
    method: 'post',
    params: query
  })
}
// 查看计划模板
export function getOperationInfo(query) {
  return request({
    url: '/cqt/operation-execute-item/info',
    method: 'post',
    data: query
  })
}

// 删除计划模板
export function deleteOperation(query) {
  return request({
    url: '/cqt/operation-schedule-type/remove',
    method: 'post',
    data: query
  })
}

// 新增计划模板
export function  createOperation(query) {
  return request({
    url: '/cqt/operation-schedule-type/create',
    method: 'post',
    data: query
  })
}

// 修改
export function  updateOperation(query) {
  return request({
    url: '/cqt/operation-execute-item/update',
    method: 'post',
    data: query
  })
}
// 更新计划类别
export function  updateDictData(query) {
  return request({
    url: '/system/dict-data/update',
    method: 'put',
    data: query
  })
}

/* ----计划模板结束---- */

/* ---服务计划管理--- */
// 查询服务计划
export function  getOperationschedulePage(query) {
  return request({
    url: '/cqt/operation-schedule/page',
    method: 'post',
    data: query
  })
}
// 新增服务计划
export function  createOperationschedule(query) {
  return request({
    url: '/cqt/operation-schedule/create',
    method: 'post',
    data: query
  })
}
// 删除服务计划
export function  deleteOperationschedule(query) {
  return request({
    url: '/cqt/operation-schedule/delete',
    method: 'post',
    data: query
  })
}

// 修改服务计划
export function  updateOperationschedule(query) {
  return request({
    url: '/cqt/operation-schedule/update',
    method: 'post',
    data: query
  })
}

// 执行服务计划  确认接口
export function  createOperationExcute(query) {
  return request({
    url: '/cqt/operation-execute-record/create',
    method: 'post',
    data: query
  })
}

// 点击箭头查询执行记录
export function  getOperationExcutePage(query) {
  return request({
    url: '/cqt/operation-execute-record/page',
    method: 'post',
    data: query
  })
}

// 执行记录列表详情
export function  getOperationExcuteDetail(query) {
  return request({
    url: '/cqt/operation-execute-record/get',
    method: 'post',
    data: query
  })
}
// 执行记录列表修改
export function  updateOperationExcute(query) {
  return request({
    url: '/cqt/operation-execute-record/update',
    method: 'post',
    data: query
  })
}

// /* ---服务计划管理--- */
// export function  getOperationschedulePage(query) {
//   return request({
//     url: '/cqt/operation-schedule/page',
//     method: 'post',
//     data: query
//   })
// }

/* ---服务计划统计--- */

// 获取服务计划列表
export function  getStatistics(query) {
  return request({
    url: '/cqt/operation-schedule/statistics',
    method: 'post',
    data: query
  })
}
// 获取计划类别
export function  selectDictNameList(query) {
  return request({
    url: '/cqt/operation-schedule/select-dict-datas',
    method: 'post',
    data: query
  })
}
// 获取服务计划列表
export function  servicePlanList(query) {
  return request({
    url: '/cqt/service-plan-manage/page',
    method: 'post',
    data: query
  })
}
// 获取服务任务计划列表
export function  serviceTaskList(query) {
  return request({
    url: '/cqt/service-plan-manage-task/page',
    method: 'post',
    data: query
  })
}
// 获取待办列表
export function  planTodoList(query) {
  return request({
    url: '/cqt/service-plan-manage-task/todo-page',
    method: 'post',
    data: query
  })
}
// 获取已办列表
export function  planDoneList(query) {
  return request({
    url: '/cqt/service-plan-manage-task/done-page',
    method: 'post',
    data: query
  })
}
// 更新服务计划
export function  servicePlanUpdate(query) {
  return request({
    url: '/cqt/service-plan-manage/update',
    method: 'post',
    data: query
  })
}
// 删除服务计划
export function  servicePlanDelete(query) {
  return request({
    url: '/cqt/service-plan-manage/delete',
    method: 'post',
    data: query
  })
}
// 删除服务计划关联
export function  serviceTaskDelete(query) {
  return request({
    url: '/cqt/service-plan-manage-task/delete',
    method: 'post',
    data: query
  })
}
//新建服务计划
export function  servicePlanCreate(query) {
  return request({
    url: '/cqt/service-plan-manage/create',
    method: 'post',
    data: query
  })
}
//取消服务计划
export function  servicePlanCancel(query) {
  return request({
    url: '/cqt/service-plan-manage/cancel',
    method: 'post',
    data: query
  })
}
//获取服务类别
export function getServiceType(query) {
  return request({
    url: '/cqt/service-type-manage/query-all',
    method: 'post',
    data: query
  })
}
//执行服务计划
export function executeService(query) {
  return request({
    url: '/cqt/service-plan-manage-task/execute',
    method: 'post',
    data: query
  })
}
//转派
export function delegateService(query) {
  return request({
    url: '/cqt/service-plan-manage-task/delegate',
    method: 'post',
    data: query
  })
}
//删除任务
export function taskDelete(query) {
  return request({
    url: '/cqt/service-plan-manage-task/delete',
    method: 'post',
    data: query
  })
}
//用户下拉
export function listByProjectId(query) {
  return request({
    url: '/cqt/service-plan-manage/list-user-by-projectId',
    method: 'post',
    data: query
  })
}
