export default {
    functional: true,
    props: {
      // 函数文本
      text: {
        type: String,
        default: ''
      },
      // 值 scope.row[item.prop]
      data: {
        type: [Object, Array, String, Number, Boolean, Function, undefined]
      },
      // 行 scope.row
      row: {
        type: [Object, Array, String, Number, Boolean, Function, undefined]
      },
      isDisabled:{
        type: [Boolean, false]
      },
      originRow: {
        type: [Object, Array, String, Number, Boolean, Function, undefined]
      },
      // 字典数据
      directs: {
        type: [Array, undefined]
      },
      // 回调函数，调用触发更新
      changeCallback: {
        type: [Function]
      }
    },
    render(createElement, { props }) {
      try {
      /*
          text示例
          function render(h,data,row,directs,changeCallback){
            return h('div',data+300)
          }
      */
  
        return eval(`(${props.text})(createElement, props.data, props.row,props.originRow, props.isDisabled, props.directs, props.changeCallback)`)
      } catch (error) {
        return createElement('span', props.data)
      }
    }
  }