import request from "@/utils/request";

//拓扑列表
export function topologyList(query) {
  return request({
    url: "/monitor/topology/page",
    method: "post",
    data: query,
  });
}
// 新增拓扑
export function createAdd(query) {
  return request({
    url: "/monitor/topology/create",
    method: "post",
    data: query,
  });
}
// 编辑拓扑
export function updateTopology(query) {
  return request({
    url: "/monitor/topology/update",
    method: "post",
    data: query,
  });
}
// 查询不同类型资源信息
export function getPageInfo(query) {
  return request({
    url: "/cqt/asset-info/getPage",
    method: "post",
    data: query,
  });
}

// tp详情信息
export function getByIdDetail(query) {
  return request({
    url: `/monitor/topology/getById?id=` + query,
    method: "post",
  });
}
// 外部访问
export function getByIdDetailWb(query) {
  return request({
    url: `/monitor/topology/share/get/` + query,
    method: "get",
  });
}
//删除
export function getByIdDelete(query) {
  return request({
    url: `/monitor/topology/delete/${query.id}`,
    method: "get",
    data: query,
  });
}

//上传
export function uploadFile(data) {
  return request({
    url: `/system/file/upload-file`,
    method: "post",
    data: data,
  });
}
//分享
export function getShare(query) {
  return request({
    url: `/monitor/topology/share/${query.id}`,
    method: "get",
    data: query,
  });
}
export function rename(query) {
  return request({
    url: "/monitor/topology/rename",
    method: "post",
    data: query,
  });
}
//告警信息
export function alarmListss(data) {
  return request({
    url: "/cqt/alarms/page",
    method: "post",
    data: data,
  });
}
