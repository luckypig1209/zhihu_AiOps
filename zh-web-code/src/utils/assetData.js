import request from "@/utils/request";

// 异步获取资源类型树结构
export async function getAssetTree() {
  try {
    const response = await request({
      url: "/cqt/asset-info/getAssetTree",
      method: "post",
    });
    // 假设接口返回的数据结构与原nodeInfo数组格式一致
    return response.data || [];
  } catch (error) {
    console.error("获取资源类型树结构失败:", error);
    // 返回空数组作为降级处理
    return [];
  }
}

// 初始化资源类型树结构（支持异步调用）
let nodeInfo = [];
let isLoading = false;
let loadPromise = null;

// 加载资源类型树数据
export async function loadAssetTree() {
  // if (nodeInfo.length > 0) {
  //   return nodeInfo;
  // }

  if (isLoading) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = getAssetTree()
    .then((data) => {
      nodeInfo = data;
      return nodeInfo;
    })
    .finally(() => {
      isLoading = false;
    });

  return loadPromise;
}

// 根据资源类型获取对应的设备数据
export function getDevicesByResourceType(resourceType) {
  const resource = nodeInfo.find((item) => item.resourceType === resourceType);
  return resource ? resource.devices : [];
}

// 根据资源类型获取对应的资源名称
export function getResourceNameByType(resourceType) {
  const resource = nodeInfo.find((item) => item.resourceType === resourceType);
  return resource ? resource.name : "";
}

// 默认导出，保持向后兼容
export default {
  getDevicesByResourceType,
  getResourceNameByType,
  loadAssetTree,
};
