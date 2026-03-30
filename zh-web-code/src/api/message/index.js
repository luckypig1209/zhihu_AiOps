import request from "@/utils/request";


/* 消息通知记录*/
/* 获取大屏数据总览*/
export function pushLogList(data) {
  return request({
    url: "/zhihu/push-log/page",
    method: "post",
    data,
  });
}

//告警统计数据TOP分组查询接口
export function getAlarmLog(logId) {
  return request({
    url: `/zhihu/push-log/getAlarmLog?logId=${logId}`,
    method: "post",
  });
}

