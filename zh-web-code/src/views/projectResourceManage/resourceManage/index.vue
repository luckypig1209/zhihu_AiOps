/* 项目资源资产管理 */
<template>
  <div class="tab">
    <!-- <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="江苏省医疗保障局" name="related"> -->
    <related-project
      ref="related"
      :assetTypeList="assetTypeList"
      :assetModelList="assetModelList"
      @success="getAssetInfoCount"
    ></related-project>
    <!-- </el-tab-pane> -->
    <!-- <el-tab-pane :label="countData.notManaged" name="unrelated">
        <unrelated-project ref="unrelated" :assetTypeList="assetTypeList" :assetModelList="assetModelList"></unrelated-project>
      </el-tab-pane> -->
    <!-- </el-tabs> -->
  </div>
</template>

<script>
import relatedProject from "./components/relatedProject.vue";
import unrelatedProject from "./components/unrelatedProject.vue";
import { getAssetInfoCount, getAssetTypeList, getAssetModel } from "@/api/resource";
export default {
  props: {
    id: {
      default: "",
      type: String
    }
  },
  provide() {
    return {
      getAssetInfoCount: this.getAssetInfoCount
    };
  },
  components: { relatedProject, unrelatedProject },
  data() {
    return {
      activeName: "related",
      countData: {
        managed: null, // 已关联项目数量
        notManaged: null // 未关联项目数量
      },
      assetTypeList: [],
      assetModelList: []
    };
  },
  created() {
    // this.getAssetInfoCount();
    this.getAssetTypeList();
    // this.getAssetModel();
  },
  methods: {
    getAssetInfoCount() {
      getAssetInfoCount({
        isManaged: null
      }).then((res) => {
        this.countData = {
          managed: `项目（${res.data.totalCount}）`
        };
        // this.countData = {
        //   managed: `已关联项目（${res.data.managedCount}）` ,
        //   notManaged: `未关联项目（${res.data.notManagedCount}）`
        // };
      });
    },
    // 获取资产类型列表
    getAssetTypeList() {
      getAssetTypeList({}).then((res) => {
        this.assetTypeList = res.data;
      });
    },
    // 获取资产模型列表
    // getAssetModel() {
    //   getAssetModel({}).then(res=> {
    //     this.assetModelList = res.data;
    //     console.log(this.assetModelList);
    //   })
    // },
    handleClick(tab, event) {
      if (tab.name === "related") {
        this.$refs.related.searchModelList();
        this.$refs.related.getCustomerNameByLoginProject();
      } else {
        this.$refs.unrelated.searchModelList();
        // this.$refs.unrelated.getList();
      }
    }
  }
};
</script>

<style scoped lang="less">
.tab {
  margin: 10px;
  padding: 16px 10px;
}
.tab :deep(.el-tabs__item) {
  height: 46px;
  font-size: 16px;
  font-weight: 550;
}
</style>
