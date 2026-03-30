import { deepClone } from '@/utils/index'

const componentChild = {}
/**
 * 将./slots中的文件挂载到对象componentChild上
 * 文件名为key，对应JSON配置中的__config__.tag
 * 文件内容为value，解析JSON配置中的__slot__
 */
const slotsFiles = require.context('./slots', false, /\.js$/)
const keys = slotsFiles.keys() || []
keys.forEach(key => {
  const tag = key.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = slotsFiles(key).default
  componentChild[tag] = value
})

function vModel(dataObject, defaultValue) {
  dataObject.props.value = defaultValue

  dataObject.on.input = val => {
    this.$emit('input', val)
  }
}

function mountSlotFiles(h, confClone, children) {
  const childObjs = componentChild[confClone.__config__.tag]
  if (childObjs) {
    Object.keys(childObjs).forEach(key => {
      const childFunc = childObjs[key]
      if (confClone.__slot__ && confClone.__slot__[key]) {
        children.push(childFunc(h, confClone, key))
      }
    })
  }
}

function emitEvents(confClone) {
  ['on', 'nativeOn'].forEach(attr => {
    const eventKeyList = Object.keys(confClone[attr] || {})
    eventKeyList.forEach(key => {
      const val = confClone[attr][key]
      if (typeof val === 'string') {
        confClone[attr][key] = event => this.$emit(val, event)
      }
    })
  })
}

function catchData(confClone) {
  const {
    tableDataType, url, method, requestBody, dataPath
  } = confClone.__config__
  if (tableDataType === 'dynamic' && url && method) {
    if (isValidUrl(url)) {
      const queryObj = {
        method,
        url
      }
      if (method === 'post') {
        queryObj.headers = {
          'Content-Type': 'application/json'
        }
        queryObj.data = requestBody
      }
      // 到底用什么发请求取决于你自己的需求
      this.$axios(queryObj).then(({ data }) => {
        // 这里做下兼容
        if (dataPath) {
          dataPath.split('.').forEach(path => {
            data = data[path]
          })
        }
        // 更新数据
        if (data instanceof Array) {
          this.$emit('input', data)
        } else {
          this.$message.error('数据非Array')
        }
      })
    }
  }
}
function catchDirectData(confClone) {
  const {
    directs
  } = confClone
  console.log("cdf==d=sa=d=22222")
  if (!directs) return
  directs.forEach(direct => {
    // 静态数据转换
    if (direct.type === 'static') {
      try {
        // 截取数据
        const text = direct.data.substring(1, direct.data.length - 1)
        direct.arrData = JSON.parse(text)
      } catch (error) {
        direct.arrData = []
      }
    } else if (direct.type === 'dynamic' && direct.method && direct.url) { // 动态数据转换
      if (isValidUrl(direct.url)) {
        const queryObj = {
          method: direct.method,
          url: direct.url
        }
        if (direct.method === 'post') {
          queryObj.headers = {
            'Content-Type': 'application/json'
          }
          queryObj.data = direct.requestBody
        }
        // 到底用什么发请求取决于你自己的需求
        this.$axios(queryObj).then(({ data }) => {
          // 更新数据
          try {
            if (direct.map) {
              direct.arrData = eval(`(${direct.map})(data)`)
            } else {
              direct.arrData = data
            }
          } catch (error) {
            this.$message.error('数据解析失败')
          }
        })
      }
    } else {
      this.$message.error('请检查请求参数是否完整')
    }
  })
}

function buildDataObject(confClone, dataObject) {
  Object.keys(confClone).forEach(key => {
    const val = confClone[key]
    if (key === '__vModel__') {
      vModel.call(this, dataObject, confClone.__config__.defaultValue)
    } else if (dataObject[key] !== undefined) {
      if (dataObject[key] === null
        || dataObject[key] instanceof RegExp
        || ['boolean', 'string', 'number', 'function'].includes(typeof dataObject[key])) {
        dataObject[key] = val
      } else if (Array.isArray(dataObject[key])) {
        dataObject[key] = [...dataObject[key], ...val]
      } else {
        dataObject[key] = { ...dataObject[key], ...val }
      }
    } else {
      dataObject.attrs[key] = val
    }
  })

  // 清理属性
  clearAttrs(dataObject)
}

function clearAttrs(dataObject) {
  delete dataObject.attrs.__config__
  delete dataObject.attrs.__slot__
  delete dataObject.attrs.__methods__
}

function makeDataObject() {
  // 深入数据对象：
  // https://cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
  return {
    class: {},
    attrs: {},
    props: {},
    domProps: {},
    nativeOn: {},
    on: {},
    style: {},
    directives: [],
    scopedSlots: {},
    slot: null,
    key: null,
    ref: null,
    refInFor: true
  }
}

import editTable from '@/components/editTable/index.vue'
export default {
  props: {
    conf: {
      type: Object,
      required: true
    }
  },
  components: {
    editTable,
  },
  mounted() {
    // 动态请求数据
    catchData.call(this, this.conf)
    // 获取字典数据
    catchDirectData.call(this, this.conf)
  },
  render(h) {
    const dataObject = makeDataObject()
    const confClone = deepClone(this.conf)
    const children = this.$slots.default || []

    // 如果slots文件夹存在与当前tag同名的文件，则执行文件中的代码
    mountSlotFiles.call(this, h, confClone, children)

    // 将字符串类型的事件，发送为消息
    emitEvents.call(this, confClone)

    // 将json表单配置转化为vue render可以识别的 “数据对象（dataObject）”
    buildDataObject.call(this, confClone, dataObject)

    return h(this.conf.__config__.tag, dataObject, children)
  }
}
