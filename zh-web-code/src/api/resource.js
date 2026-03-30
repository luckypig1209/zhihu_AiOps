import request from "@/utils/request";
/* ---资产类型--- */
// 获得资产类型分页
export function getAssetTypePage(query) {
  return request({
    url: "/cqt/asset-type/page",
    method: "post",
    data: query,
  });
}
// 获取资产类型下拉框数据
export function getAssetTypeList(query) {
  return request({
    url: "/cqt/asset-type/list",
    method: "post",
    data: query,
  });
}
// 获取资产类型枚举型
export function getOptionListAPI(query) {
  return request({
    url: "/system/dict-type/list-all-by-conditions",
    method: "post",
    data: query,
  });
}
export function saveCustomField(query) {
  return request({
    url: "/cqt/asset-info/user-config/save",
    method: "post",
    data: query,
  });
}
// 创建资产类型
export function createAssetType(query) {
  return request({
    url: "/cqt/asset-type/create",
    method: "post",
    data: query,
  });
}
// 更新资产类型
export function updateAssetType(query) {
  return request({
    url: "/cqt/asset-type/update",
    method: "post",
    data: query,
  });
}
// 删除资产类型
export function deleteAssetType(query) {
  return request({
    url: "/cqt/asset-type/delete",
    method: "post",
    data: query,
  });
}
/* ---资产模型--- */
// 获取资产模型分页
export function getAssetModelPage(query) {
  return request({
    url: "/cqt/asset-model/page",
    method: "post",
    data: query,
  });
}
// 获取资产模型下拉列表
export function getAssetModel(query) {
  return request({
    url: "/cqt/asset-model/list",
    method: "post",
    data: query,
  });
}
// 获取资产模型详情
export function getAssetModelDetail(query) {
  return request({
    url: "/cqt/asset-model/get",
    method: "post",
    data: query,
  });
}
// 获取指标项详情
export function getAssetModelDetails(id) {
  return request({
    url: "/zhihu/pfmepush/get?ruleId=" + id,
    method: "post",
  });
}
// 创建资产模型
export function createAssetModel(query) {
  return request({
    url: "/cqt/asset-model/create",
    method: "post",
    data: query,
  });
}
// 更新资产模型
export function updateAssetModel(query) {
  return request({
    url: "/cqt/asset-model/update",
    method: "post",
    data: query,
  });
}

// 删除资产模型
export function deleteAssetModel(query) {
  return request({
    url: "/cqt/asset-model/delete",
    method: "post",
    data: query,
  });
}

/* ---资产信息--- */

// 查询资产数量信息
export function getAssetInfoCount(query) {
  return request({
    url: "/cqt/asset-info/count",
    method: "post",
    data: query,
  });
}

// 获取资产信息
export function getAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/get",
    method: "post",
    data: query,
  });
}
// 获取资产信息分页
export function getAssetInfoPage(query) {
  return request({
    url: "/cqt/asset-info/page",
    method: "post",
    data: query,
  });
}
// 获取资产表头
export function getTableHeadInfo(query) {
  return request({
    url: "/cqt/asset-info/user-config/get",
    method: "post",
    data: query,
  });
}
// 更新资产信息
export function updateAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/update",
    method: "post",
    data: query,
  });
}
// 导入资产信息
export function importAssetInfo(modelId, query) {
  return request({
    url: "/cqt/asset-info/import/" + modelId,
    method: "post",
    data: query,
  });
}
// 导出资产信息
// export function exportAssetInfo(query) {
//   return request({
//     url: '/cqt/asset-info/export',
//     method: 'post',
//     data: query,
//     responseType: 'blob'
//   })
// }
// 导出资产错误信息
export function exportAssetErrorInfo(query) {
  return request({
    url: "/cqt/poi/error-message/export",
    method: "post",
    data: query,
    responseType: "blob",
  });
}
// 删除资产信息
export function deleteAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/delete",
    method: "post",
    data: query,
  });
}
export function batchDeleteAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/all-delete",
    method: "post",
    data: query,
  });
}

// 创建资产信息
export function createAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/create",
    method: "post",
    data: query,
  });
}
// 导出项目资产信息模板
export function exportTemplate(query) {
  return request({
    url: "/cqt/asset-info/export-template",
    method: "post",
    data: query,
    responseType: "blob",
  });
}

// 获取用户精简信息列表
export function listSimpleUsers(query) {
  return request({
    url: "/system/user/list-all-simple",
    method: "post",
    data: query,
  });
}

// 资源与申请流程ID绑定
export function updateProcessInstance(query) {
  return request({
    url: "/cqt/asset-info/update-process-instance",
    method: "post",
    data: query,
  });
}

// 批量更新资产信息
export function batchUpdateAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/batchUpdate",
    method: "post",
    data: query,
  });
}
//下载模板
export function impTemplate(query) {
  return request({
    url: "/cqt/asset-info/export-template",
    method: "post",
    responseType: "blob",
    data: query,
  });
}
// 导出资产
export function exportAssetInfo(query) {
  return request({
    url: "/cqt/asset-info/export",
    method: "post",
    data: query,
    responseType: "blob",
  });
}

//
// 列表查询
export function getPfmepushList(data) {
  return request({
    url: "/zhihu/pfmepush/page",
    method: "post",
    data: data,
  });
}

// 规则保存与更新
export function savePfmepush(data) {
  return request({
    url: "/zhihu/pfmepush/save",
    method: "post",
    data: data,
  });
}
// 更新状态
export function stopPfmepush(id) {
  return request({
    url: "/zhihu/pfmepush/stop?ruleId=" + id,
    method: "post",
  });
}
// 删除
export function deletePfmepush(id) {
  return request({
    url: "/zhihu/pfmepush/delete?ruleId=" + id,
    method: "post",
  });
}
// 资产分组列表无分页
export function getAssetGroup() {
  return request({
    url: "/cmdb/asset-group/list",
    method: "get",
  });
}
// 添加资产到多个分组
export function addAssetGroups(data) {
  return request({
    url: "/cmdb/asset-group/asset/add",
    method: "post",
    data: data,
  });
}
// 批量添加多个资产到一个分组
export function addAssetsGroup(data) {
  return request({
    url: "/cmdb/asset-group/asset/save",
    method: "post",
    data: data,
  });
}
// 资产信息模版监控方法接口
export function getMonitorMethod(data) {
  return request({
    url: "/cqt/asset-info/monitor-method",
    method: "post",
    data: data,
  });
}

// 批量监控
export function batchCreate(data) {
  return request({
    url: "/zhihu/snmp/batchCreate",
    method: "post",
    data: data,
  });
}
