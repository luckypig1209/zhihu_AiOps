// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

// 深度克隆
function deepClone(obj) {
    // 对常见的“非”值，直接返回原来值
    if ([null, undefined, NaN, false].includes(obj)) return obj;
    if (typeof obj !== "object" && typeof obj !== 'function') {
        //原始类型直接返回
        return obj;
    }
    //date类型
    if (obj instanceof Date) {
        const copydata = new Date();
        copydata.setTime(obj.getTime());
        return copydata
    }
    //正则
    if (obj instanceof RegExp) {
        const Constructor = obj.Constructor;  //constructor 属性返回对创建此对象的数组函数的引用
        return new Constructor(obj)
    }
    var o = isArray(obj) ? [] : {};
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
        }
    }
    return o;
}

export default deepClone;
