import request from "@/utils/request";

//巡检模板列表
export function inspectionList(query) {
  return request({
    url: "/zhihu/inspection/page",
    method: "post",
    data: query,
  });
}
// 新增模板
export function inspectionAdd(query) {
  return request({
    url: "/zhihu/inspection/create",
    method: "post",
    data: query,
  });
}
// 编辑模板
export function inspectionUpdate(query) {
  return request({
    url: "/zhihu/inspection/update",
    method: "post",
    data: query,
  });
}
// 复制模板
export function copyTemplate(query) {
  return request({
    url: `/zhihu/inspection/copy-template?id=${query.id}&templateName=${query.templateName}`,
    method: "post",
  });
}
//模板详情
export function getInspectionDatail(query) {
  return request({
    url: `/zhihu/inspection/get/${query.id}`,
    method: "get",
    data: query,
  });
}
//单次执行
export function startGot(query) {
  return request({
    url: `/zhihu/inspection-strategy/start/${query}`,
    method: "get",
    data: query,
  });
}
//删除
export function inspectionDelete(query) {
  return request({
    url: `/zhihu/inspection/delete?id=${query.id}`,
    method: "post",
    data: query,
  });
}
//查询指标列表
export function indicatorList(query) {
  return request({
    url: "/zhihu/inspection/indicator-page",
    method: "post",
    data: query,
  });
}
//模板指标项修改
export function updateTemplateIndicator(query) {
  return request({
    url: "/zhihu/inspection/update-template-indicator",
    method: "post",
    data: query,
  });
}

//巡检策略列表
export function strategyList(query) {
  return request({
    url: "/zhihu/inspection-strategy/page",
    method: "post",
    data: query,
  });
}
// 新增策略
export function strategyAdd(query) {
  return request({
    url: "/zhihu/inspection-strategy/create",
    method: "post",
    data: query,
  });
}
//查询策略详情
export function inspectionDetail(query) {
  return request({
    url: `/zhihu/inspection-strategy/get/` + query,
    method: "get",
  });
}

// 查询模板下的资产
export function assetList(query) {
  return request({
    url: "/zhihu/inspection/asset-list",
    method: "post",
    data: query,
  });
}
// 编辑策略
export function strategyUpdate(query) {
  return request({
    url: "/zhihu/inspection-strategy/update",
    method: "post",
    data: query,
  });
}
// 复制策略
export function copyStrategy(query) {
  return request({
    url: `/zhihu/inspection-strategy/copy/${query.id}?newName=${query.newName}`,
    method: "get",
  });
}
// 启动策略
export function enableInspection(query) {
  return request({
    url: `/zhihu/inspection-strategy/enable/${query.id}`,
    method: "get",
  });
}
// 关闭策略
export function closeInspection(query) {
  return request({
    url: `/zhihu/inspection-strategy/close/${query.id}`,
    method: "get",
  });
}
//通知打开关闭
export function noticeUpdate(query) {
  return request({
    url: "/zhihu/inspection-strategy/notice/update",
    method: "post",
    data: query,
  });
}

//删除巡检策略
export function strategyDelete(query) {
  return request({
    url: `/zhihu/inspection-strategy/delete/` + query,
    method: "get",
  });
}
