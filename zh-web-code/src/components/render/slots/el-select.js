export default {
  options(h, conf, key) {
    const list = []
    if(conf.options && conf.options.length > 0) {
      conf.options.forEach(item => {
        list.push(<el-option label={item.label} value={item.value} disabled={item.disabled}></el-option>)
      })
    } else {
      conf.__slot__.options.forEach(item => {
        list.push(<el-option label={item.label} value={item.value} disabled={item.disabled}></el-option>)
      })
    }
    return list
  }
}
