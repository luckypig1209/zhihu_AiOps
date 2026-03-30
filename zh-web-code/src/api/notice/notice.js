import request from "@/utils/request";
//消息组查询
export function getNotificationGroup(data) {
  return request({
    url: "/zhihu/notificationGroup/page",
    method: "post",
    data: data,
  });
}
//消息查询
export function getNotificationGroupDetail(data) {
  return request({
    url: "/zhihu/notificationGroup/get",
    method: "post",
    data: data,
  });
}
//消息删除
export function deleteNotificationGroup(data) {
  return request({
    url: buildUrlWithParams("/zhihu/notificationGroup/delete", data),
    method: "post",
  });
}
//消息保存
export function saveNotificationGroup(data) {
  return request({
    url: "/zhihu/notificationGroup/save",
    method: "post",
    data: data,
  });
}
function buildUrlWithParams(baseUrl, data) {
  // 如果没有数据，直接返回基础URL
  if (!data) return baseUrl;

  // 收集所有查询参数
  const params = [];
  for (const key in data) {
    // 只处理对象自身的属性
    if (data.hasOwnProperty(key)) {
      // 获取值，如为undefined或null则使用空字符串
      const value = data[key] ?? "";
      // 编码参数值并添加到数组
      params.push(`${key}=${encodeURIComponent(value)}`);
    }
  }

  // 如果有参数，拼接URL
  return params.length > 0 ? `${baseUrl}?${params.join("&")}` : baseUrl;
}
//测试http接口
export function httpLt(data) {
  return request({
    url: "/zhihu/testConnection/http",
    method: "post",
    data: data,
  });
}
