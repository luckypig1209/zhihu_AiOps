import moment from "moment"
// 打乱数组的顺序
import randomArray from './methods/randomArray.js'
// 对象和数组的深度克隆
import deepClone from './methods/deepClone.js'
// 对象深度拷贝
import deepMerge from './methods/deepMerge.js'
// 规则检验
import test from './methods/test.js'
// 随机数
import random from './methods/random.js'
// 去除空格
import trim from './methods/trim.js'
// 防抖方法
import debounce from './methods/debounce.js'
// 节流方法
import throttle from './methods/throttle.js'

/**
 * 客户名称，地址脱敏
 *
 * @param {str} func 传入的字符串
 * @param {type} func 0:地址，1:客户
 * @return str
 */
function textEllipsis(str, type) {
  if (!str) {
    return "";
  }
  let len = Math.ceil(str.length / 3)
  let star = "";
  for (let i = 0; i < len; i++) {
    star += "*";
  }
  return type == 0 ? str.substring(0, str.length - len) + star : str.substring(0, len) + star + str.substring(len + len);
}
/**
 * 表格中，多行显示toolTip
 *
 * @param {lines} func 行数
 * @param {content} func 显示内容
 * @return str
 */
function toolTip(h, lines, content) {
  return h('Tooltip', {
    props: { placement: 'bottom-start', transfer: true, maxWidth: 440 }
  }, [
    h('span', { style: { textOverflow: 'ellipsis', whiteSpace: 'normal', overflow: 'hidden', display: '-webkit-box', webkitBoxOrient: 'vertical', webkitLineClamp: lines + '' } }, content),
    h('span', { slot: 'content', style: { whiteSpace: 'normal', wordBreak: 'break-all' } }, content)
  ])
}
/**
 * textarea文本框保留回行空格
 * @param {text} func 文本
 * @return str
 */
function preText(text = "") {
  if (!text) { return "" } else {
    return text
      .replace(/\r\n/g, "<br/>")
      .replace(/\n/g, "<br/>")
      .replace(/\s/g, "&nbsp;");
  }
}
/**
 * textarea文本框回填
 * @param {text} func 文本
 * @return str
 */
function rnText(text = "") {
  if (!text) { return "" } else {
    return text.replace(/<br\/>/g, "\n").replace(/&nbsp;/g, "s");
  }
}

/**
 * 秒转为天时分秒
 * @param {text} func 文本
 * @return str
 */
function durationFormat(time) {
  if (!time || time == 0) return "0秒";
  const d = moment.duration(time, "seconds");
  let str = "";
  if (Math.floor(d.asDays()) > 0) {
    str =
      Math.floor(d.asDays()) +
      "天" +
      d.hours() +
      "时" +
      d.minutes() +
      "分" +
      d.seconds() +
      "秒";
  } else if (d.hours() > 0) {
    str = d.hours() + "时" + d.minutes() + "分" + d.seconds() + "秒";
  } else if (d.minutes() > 0) {
    str = d.minutes() + "分" + d.seconds() + "秒";
  } else {
    str = d.seconds() + "秒";
  }
  return str;
}

// function durationFormat(value) {
//   let theTime = parseInt(value);// 秒
//   let theTime1 = 0;// 分
//   let theTime2 = 0;// 小时

//   if (theTime > 60) {
//     theTime1 = parseInt(theTime / 60);
//     theTime = parseInt(theTime % 60);

//     if (theTime1 > 60) {
//       theTime2 = parseInt(theTime1 / 60);
//       theTime1 = parseInt(theTime1 % 60);
//     }
//   }
//   let result = '' + parseInt(theTime) + '秒';
//   if (theTime1 > 0) {
//     result = '' + parseInt(theTime1) + '分' + result;
//   }
//   if (theTime2 > 0) {
//     result = '' + parseInt(theTime2) + '小时' + result;
//   }
//   return result;
// }
const $u = {
  randomArray,
  deepClone,
  deepMerge,
  test,
  random,
  trim,
  debounce,
  throttle,
  textEllipsis,
  toolTip,
  preText,
  rnText,
  durationFormat
}

const install = Vue => {
  Vue.prototype.$u = $u
}

export default {
  install
}
