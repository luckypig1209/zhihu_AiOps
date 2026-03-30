import request from "@/utils/request";

export function uploadFile(data) {
  return request({
    url: "/system/file/upload-file-stream",
    method: "post",
    data: data,
  });
}

export function originUpload(data) {
  return request({
    url: "/system/file/",
    method: "post",
    data,
  });
}
