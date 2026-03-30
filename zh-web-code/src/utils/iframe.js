import axios from 'axios'
import {Message, MessageBox, Notification} from 'element-ui'
import store from '@/store'
import {getAccessToken, getRefreshToken, getTenantId, setToken} from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import {getPath, getTenantEnable} from "@/utils/ruoyi";
import {refreshToken} from "@/api/login";

// 需要忽略的提示。忽略后，自动 Promise.reject('error')
const ignoreMsgs = [
  "无效的刷新令牌", // 刷新令牌被删除时，不用提示
  "刷新令牌已过期" // 使用刷新令牌，刷新获取新的访问令牌时，结果因为过期失败，此时需要忽略。否则，会导致继续 401，无法跳转到登出界面
]

// 是否显示重新登录
export let isRelogin = { show: false };
// Axios 无感知刷新令牌，参考 https://www.dashingdog.cn/article/11 与 https://segmentfault.com/a/1190000020210980 实现
// 请求队列
let requestList = []
// 是否正在刷新中
let isRefreshToken = false

axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
// 创建axios实例
const kibana = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: '/', // 此处的 /admin-api/ 地址，原因是后端的基础路径为 /admin-api/
  // baseURL: '/admin-api/',
  // 超时
  timeout: 30000,
  // 禁用 Cookie 等信息
  withCredentials: false,
})
// request拦截器
kibana.interceptors.request.use(config => {
  // 是否需要设置 token
  config.headers['Authorization'] = 'Bearer ' + getAccessToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8'
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?';
    for (const propName of Object.keys(config.params)) {
      const value = config.params[propName];
      const part = encodeURIComponent(propName) + '='
      if (value !== null && typeof(value) !== "undefined") {
        if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            let params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + '='
            url += subPart + encodeURIComponent(value[key]) + "&";
          }
        } else {
          url += part + encodeURIComponent(value) + "&";
        }
      }
    }
    url = url.slice(0, -1);
    config.params = {};
    config.url = url;
  }
  return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

// 响应拦截器
kibana.interceptors.response.use(async res => {
  return res.request.response;
}, error => {
    console.log('err' + error)
    let {message} = error;
    if (message === "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default kibana
