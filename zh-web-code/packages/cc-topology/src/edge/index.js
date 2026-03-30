/**
 * @author: wenyuan
 * @data: 2019/07/18
 * @repository: https://github.com/wenyuan
 * @description: register edges
 */

import ccLine from './cc-line'
import ccBrokenline from './cc-brokenline'
import ccPolyline from './cc-polyline'
import ccCubic from './cc-cubic'

const obj = {
  ccLine,
  ccBrokenline,
  ccPolyline,
  ccCubic
}

export default function(G6, vm = null) {
  Object.values(obj).map(item => {
    // 如果提供了Vue实例并且边配置中有sendThis方法，就传递Vue实例
    if (vm && item.options && item.options.sendThis) {
      item.options.sendThis(vm);
    }
    G6.registerEdge(item.name, item.options, item.extendName)
  })
}
