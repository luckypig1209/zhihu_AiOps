import { getAccessToken } from "@/utils/auth";
// 使用a标签下载
export function fileDown(blobUrl, filename) {
    console.log("blobUrl", blobUrl, filename);
    const x = new window.XMLHttpRequest();
      x.open('GET', blobUrl, true);
      x.setRequestHeader('Authorization', "Bearer " + getAccessToken()); // 携带 Token
      x.responseType = 'blob';
      x.onload = () => {
        console.log("x.response", x.response);
        const url = window.URL.createObjectURL(x.response);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank'
        a.download = filename;
        a.style.display = 'none'
        document.body.append(a)
        a.click();
      };
      x.send();
  }
  export function getFileUrl(path) {
    return `/admin-api/system/file${path}`;
  }


