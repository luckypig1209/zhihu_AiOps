// 引入util
import request from '@/utils/request'
// 分组列表
export function getAssetGroupList(data) {
  return request({
    url: '/cmdb/asset-group/page',
    method: 'post',
    data: data
  })
}
//新增资产分组
export function createassetGroup(data) {
  return request({
    url: '/cmdb/asset-group/create',
    method: 'post',
    data: data
  })
}
//更新资产分组
export function updateassetGroup(data) {
  return request({
    url: '/cmdb/asset-group/update',
    method: 'post',
    data: data
  })
}
//资产分组删除
export function deleteassetGroup(id) {
  return request({
    url: '/cmdb/asset-group/delete/' + id,
    method: 'get',
  })
}

//保存资产到分组
export function saveAsset(data) {
  return request({
    url: '/cmdb/asset-group/asset/save',
    method: 'post',
    data:data
  })
}

//资产分组关联资产列表
export function getAssetPage(data) {
  return request({
    url: '/cmdb/asset-group/getAssetPage',
    method: 'post',
    data:data
  })
}
