import request from "@/utils/request";
import requestSSO from '@/utils/requestSSO'

/* 获取商品详情的接口 */
/* 获取大屏数据总览*/
export function getSummary(data) {
  return request({
    url: "/dashboard/alarms/summary",
    method: "post",
    data,
  });
}

//告警统计数据TOP分组查询接口
export function getSummaryTop(data) {
  return request({
    url: "/dashboard/alarms/summary/top",
    method: "post",
    data,
  });
}

//告警统计数据TOP分组查询接口
export function getAlarmList(data) {
  return request({
    url: "/dashboard/alarms/list",
    method: "post",
    data,
  });
}

//资产分布数据查询接口
export function getMonitorSummary(data) {
  return request({
    url: "/dashboard/asset-monitor/summary",
    method: "post",
    data,
  });
}
//资源告警总览查询接口
export function getSourceSummary(data) {
  return request({
    url: "/dashboard/asset-alarms/summary",
    method: "post",
    data,
  });
}

//告警设备top5
export function getDeviceTop(data) {
  return request({
    url: "/dashboard/asset-alarms/summary/top",
    method: "post",
    data,
  });
}

//设备性能TOP查询接口
export function getMetriceTop(data) {
  return request({
    url: "/dashboard/asset-metric/summary/top",
    method: "post",
    data,
  });
}

// 获取dataease平台token
export function getZhihuToken(data) {
  return requestSSO({
    url: "/de2api/login/zhihuLogin",
    method: "post",
    data,
  });
}



