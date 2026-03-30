import request from "@/utils/request";
//拨测接口仓库
//----------------------------

//拨测列表
export function dialingPageList(query) {
  return request({
    url: "/monitor/dialing-test-task/page",
    method: "post",
    data: query,
  });
}
// 新增拨测
export function dialingTaskAdd(query) {
  return request({
    url: "/monitor/dialing-test-task/create",
    method: "post",
    data: query,
  });
}
// 编辑拨测
export function dialingTaskUpdate(query) {
  return request({
    url: "/monitor/dialing-test-task/update",
    method: "post",
    data: query,
  });
}
//查询拨测任务告警规则接口
export function dialingTaskUpdateList(query) {
  return request({
    url: "/monitor/dialing-test-task/alarm-rules/list",
    method: "post",
    data: query,
  });
}
//http接口测试
export function httpTest(query) {
  return request({
    url: "/monitor/dialing-test-task/http-test",
    method: "post",
    data: query,
  });
}
//拨测查询资产ip接口
export function dialingZcList(query) {
  return request({
    url: "/monitor/dialing-test-task/asset/list",
    method: "post",
    data: query,
  });
}
//拨测异常结果列表
export function dialingPageLog(query) {
  return request({
    url: "/monitor/dialing-test-task/record/page",
    method: "post",
    data: query,
  });
}

//删除拨测
export function dialingTaskDelete(query) {
  return request({
    url: `/monitor/dialing-test-task/delete`,
    method: "post",
    data: query,
  });
}
//查询拨测性能数据接口
export function dialingMetric(query) {
  return request({
    url: "/monitor/dialing-test-task/record/metric",
    method: "post",
    data: query,
  });
}
//查询拨测告警数据接口
export function dialingMlarm(query) {
  return request({
    url: "/monitor/dialing-test-task/record/alarm",
    method: "post",
    data: query,
  });
}
//列表启用
export function triggerStatus(query) {
  return request({
    url: "/monitor/dialing-test-task/trigger-status",
    method: "post",
    data: query,
  });
}
