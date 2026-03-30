/**
 * 未关联项目
 */
<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="moduleWidth" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <img
              src="../../../../assets/images/model-icon.png"
              alt=""
              style="width: 12px; margin: 0 10px 4px 0; vertical-align: middle"
            />
            <span style="font-size: 16px">资源模型</span>
          </div>
          <div>
            <div class="head-container">
              <el-input
                v-model="modelQueryParams.modelName"
                placeholder="请输入资源模型"
                @change="searchModelList"
                clearable
                size="small"
                prefix-icon="el-icon-search"
                style="margin: 10px 0"
              />
            </div>
            <div class="head-container">
              <el-tree
                :data="modelList"
                :props="defaultProps"
                node-key="id"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                ref="tree"
                default-expand-all
                highlight-current
                @node-click="handleNodeClick"
              >
                <el-tooltip
                  :disabled="showTitle"
                  effect="dark"
                  :content="tooltipTitle"
                  placement="top"
                  slot-scope="{ node, data }"
                >
                  <span class="span-ellipsis" @mouseover="onShowNameTipsMouseenter">{{ node.label }}</span>
                </el-tooltip>
              </el-tree>
            </div>
            <!-- <div class="container infinite-list" v-infinite-scroll="load" infinite-scroll-disabled="disabled"
          infinite-scroll-distance="20" style="overflow:auto">
              <div class="list infinite-list-item" 
              :style="{background: index == activeIndex ? '#D8E5FF': '#fff', borderRadius: index == activeIndex ? '6px': '0'}"
              v-for="(item, index) in modelList" :key="index"
              @click="clickType(item, index)" @mouseenter="mouseenter(item)" @mouseleave="mouseleave(item)">
                <span class="model-name" :title="item.modelName">{{ item.modelName }}</span>
              </div>
              <p class="tip" v-if="loading">加载中...</p>
              <p class="tip" v-if="noMore && modelList.length > 10">没有更多了</p>
            </div> -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="24 - moduleWidth" :xs="24">
        <hamburger id="hamburger-container" :is-active="opened" class="hamburger-module" @toggleClick="toggleSideBar" />
        <el-form ref="queryForm" :model="queryParams" size="small" v-show="showSearch" :inline="true">
          <!-- <el-form-item label="资源类型" prop="assetType">
            <el-select
              v-model="queryParams.assetTypeId"
              placeholder="请选择资源类型"
              learable
              filterable
              style="width: 100%"
            >
              <el-option :value="item.id" v-for="item in assetTypeList" :label="item.typeName" :key="item.id"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="IP地址" prop="assetIp">
            <el-input v-model.trim="queryParams.assetIp" placeholder="请输入IP地址" clearable></el-input>
          </el-form-item>
          <el-form-item label="资源数据来源" prop="dataSource">
            <el-select v-model="queryParams.dataSource" placeholder="请选择资源数据来源" clearable filterable>
              <el-option value="" label="全部"></el-option>
              <el-option value="虎威同步" label="虎威同步"></el-option>
              <el-option value="人工录入" label="人工录入"></el-option>
              <el-option value="凌霄同步" label="凌霄同步"></el-option>
              <el-option value="自动同步" label="自动同步"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="资源模型" prop="modelId">
            <el-select  v-model="queryParams.modelId" placeholder="请选择资源模型" clearable filterable>
              <el-option :value="item.id" v-for="item in assetModelList" :key="item.id" :label="item.modelName"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              style="width: 240px"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item label="" v-if="itemList.length > 0">
            <el-select v-model="queryParams.condition.itemId" placeholder="请选择筛选条件" clearable filterable>
              <el-option
                :value="item.id"
                v-for="(item, index) in itemList"
                :key="item.id + index"
                :label="item.itemName"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-date-picker
              v-if="itemList.length > 0 && itemDataType"
              v-model="queryParams.condition.itemValue"
              placeholder="请选择时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="date"
              style="width: 240px"
            />
            <el-input
              v-if="itemList.length > 0 && !itemDataType"
              v-model.trim="queryParams.condition.itemValue"
              placeholder="请输入搜索内容"
              style="width: 240px"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <!-- <el-button type="warning" icon="el-icon-bottom" @click="handleExport">导出</el-button> -->
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table :data="dataList" v-loading="tableLoad">
          <el-table-column
            v-for="column in tableHeader"
            :key="column.prop"
            :label="column.label"
            :prop="column.prop"
            :width="column.width"
            align="center"
          >
            <!-- <template slot="header">
            <span v-if="column.prop =='uniqueCode'" style="color: red;">唯一标识</span>
          </template> -->
          </el-table-column>
          <template slot="empty">
            <div class="no-data">
              <img src="../../../../assets/images/table-empty.png" alt="" />
              <span class="no-text">暂无数据</span>
            </div>
          </template>
          <el-table-column label="操作" width="160px" fixed="right" align="center">
            <template v-slot="scope">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">关联项目</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    <relatedEditModal
      :visible.sync="editVisible"
      @close="closeVisible"
      :type="'unrelated'"
      :title="editTitle"
      :formData="form"
      @success="getList"
    />
  </div>
</template>

<script>
import { getAssetModel, getAssetInfoPage, exportAssetInfo, deleteAssetInfo } from "@/api/resource";
import relatedEditModal from "./relatedEditModal";
import Hamburger from '@/components/Hamburger'

export default {
  name: "",
  components: { relatedEditModal, Hamburger },
  props: {
    assetTypeList: {
      default: () => [],
      type: Array
    },
    assetModelList: {
      default: () => [],
      type: Array
    }
  },
  data() {
    return {
      tableHeader: [
        //   {
        //   label: '客户名称',
        //   prop: 'customerName',
        // },
        {
          label: "资源类型",
          prop: "assetTypeName"
        },
        {
          label: "资源名称",
          prop: "assetName"
        },
        {
          label: "IP地址",
          prop: "assetIp",
          width: 180
        },
        // {
        //   label: '唯一标识',
        //   prop: 'uniqueCode',
        // },
        // {
        //   label: "资源数据来源",
        //   prop: "dataSource",
        //   width: 180
        // },
        {
          label: "资源模型",
          prop: "modelName"
        },
        {
          label: "创建时间",
          prop: "createTime",
          width: 150
        }
      ],
      itemList: [], // 模型属性列表
      defaultProps: {
        children: "children",
        label: "name"
      },
      tooltipTitle: "",
      showTitle: true,
      modelQueryParams: {
        modelName: ""
      },
      modelList: [],
      loading: false,
      activeIndex: null,
      visible: false,
      showSearch: true,
      editVisible: false,
      editTitle: "新增",
      customerList: [],
      // assetTypeList: [], // 资产类型
      modelList: [], // 资源属性
      projectList: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        isManaged: false,
        assetType: undefined,
        createTime: undefined,
        modelId: undefined,
        assetIp: undefined,
        dataSource: undefined,
        condition: {
          itemId: "",
          itemValue: ""
        }
      },
      dataList: [],
      total: 0,
      form: {},
      tableLoad: false,
      formLoad: false,
      totalPage: null,
      moduleWidth: 4,
      opened: true
    };
  },
  computed: {
    itemDataType() {
      const type = this.itemList.filter(
        (item) => item.itemDataType == "DATETIME" && this.queryParams.condition.itemId == item.id
      );
      return type.length > 0 ? true : false;
    }
  },
  created() {},
  methods: {
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      this.dataList = [];
      this.total = 0;
      return data.name.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.modelId = data.id;
      this.getList();
    },
    onShowNameTipsMouseenter(e) {
      var target = e.target;
      let textLength = target.clientWidth;
      let containerLength = target.scrollWidth;
      if (textLength < containerLength) {
        this.tooltipTitle = e.target.innerText;
        this.showTitle = false;
      } else {
        this.showTitle = true;
      }
    },
    // 节点单击事件
    handleNodeClick(data) {
      console.log(data);
      if (data.id) {
        this.queryParams.modelId = data.id;
        this.queryParams.condition.itemId = "";
        this.queryParams.condition.itemValue = "";
        this.itemList = data.items || [];
        this.handleQuery();
        this.tableHeader = [
          //   {
          //   label: '客户名称',
          //   prop: 'customerName',
          // },
          {
            label: "资源类型",
            prop: "assetTypeName"
          },
          {
            label: "资源名称",
            prop: "assetName"
          },
          {
            label: "IP地址",
            prop: "assetIp",
            width: 180
          },
          // {
          //   label: '唯一标识',
          //   prop: 'uniqueCode',
          // },
          // {
          //   label: "资源数据来源",
          //   prop: "dataSource",
          //   width: 220
          // },
          {
            label: "资源模型",
            prop: "modelName"
          },
          {
            label: "创建时间",
            prop: "createTime",
            width: 150
          }
        ];
        this.itemList.forEach((item) => {
          this.tableHeader.push({
            prop: item.itemCode,
            label: item.itemName
          });
        });
      }
    },
    searchModelList() {
      this.tableHeader = [
        //   {
        //   label: '客户名称',
        //   prop: 'customerName',
        // },
        {
          label: "资源类型",
          prop: "assetTypeName"
        },
        {
          label: "资源名称",
          prop: "assetName"
        },
        {
          label: "IP地址",
          prop: "assetIp",
          width: 180
        },
        // {
        //   label: '唯一标识',
        //   prop: 'uniqueCode',
        // },
        // {
        //   label: "资源数据来源",
        //   prop: "dataSource",
        //   width: 220
        // },
        {
          label: "资源模型",
          prop: "modelName"
        },
        {
          label: "创建时间",
          prop: "createTime",
          width: 150
        }
      ];
      if (!this.modelQueryParams.modelName) {
        this.getModelList("init");
      } else {
        this.$nextTick(() => {
          this.$refs.tree.filter(this.modelQueryParams.modelName);
        });
      }
    },
    toggleSideBar() {
       this.opened = !this.opened
       if(this.opened){
        this.moduleWidth = 4
       } else {
        this.moduleWidth = 0
       }
    },    
    getNewModelList(arr) {
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        let arrIndex = newArr.findIndex((item, index, arrr) => {
          return item.assetTypeId === arr[i].assetTypeId;
        });
        if (arrIndex == -1) {
          //不存在数据的添加数据
          newArr.push({
            assetTypeId: arr[i].assetTypeId,
            name: arr[i].assetTypeName,
            id: arr[i].id,
            items: arr[i].items,
            children:
              arr[i].assetTypeName !== arr[i].modelName
                ? [{ id: arr[i].id, items: arr[i].items, name: arr[i].modelName }]
                : []
          });
        } else {
          // 有则往里面添加
          newArr[arrIndex].children.push({ id: arr[i].id, items: arr[i].items, name: arr[i].modelName });
        }
      }
      return newArr;
    },
    // 资源模型
    getModelList(val) {
      getAssetModel(this.modelQueryParams).then((res) => {
        this.modelList = this.getNewModelList(res.data);
        console.log("this.modelList====", this.modelList);
        this.queryParams.modelId = this.modelList[0].children[0].id;
        this.itemList = this.modelList[0].children[0].items || [];
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.modelList[0].children[0].id);
        });

        this.handleQuery();
        if (val) {
          this.itemList.forEach((item) => {
            this.tableHeader.push({
              prop: item.itemCode,
              label: item.itemName
            });
          });
        }
      });
    },
    closeVisible() {
      this.editVisible = false;
      // this.getList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleExport() {
      let params = Object.assign({}, this.queryParams);
      delete params.pageNo;
      delete params.pageSize;
      exportAssetInfo(params).then((res) => {
        this.$download.excel(res, "未关联项目.xls");
      });
    },
    handleAdd() {
      this.editVisible = true;
      this.editTitle = "新增";
      this.form = {};
    },
    handleEdit(row) {
      this.editVisible = true;
      this.editTitle = "关联项目";
      this.form = Object.assign({}, row);
    },
    getList() {
      getAssetInfoPage(this.queryParams).then((res) => {
        this.dataList = res.data.list;
        this.total = res.data.total;
        this.dataList.forEach((item) => {
          if(item.assetAttribute && Object.entries(item.assetAttribute) && Object.entries(item.assetAttribute).length > 0){
            let objArray = Object.entries(item.assetAttribute)
            objArray.forEach(objItem =>{
              item[objItem[0]] = objItem[0]
            })
          }
          // item.items &&
          //   item.items.length > 0 &&
          //   item.items.forEach((child) => {
          //     this.tableHeader.forEach((header) => {
          //       if (header.prop != child.itemCode) {
          //         if (child.itemCode !== "id") {
          //           item[child.itemCode] = child.itemValue;
          //         }
          //       }
          //     });
          //   });
        });
        // this.dataList.map(item => {
        //   return
        // })
      });
    }
  }
};
</script>
<style scoped lang="scss">
.box-card {
  min-height: calc(100vh - 240px);
}
.title {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: #EDF0F6;
  border-radius: 2px;
  border: 1px solid #cfd5e0;
  span {
    font-size: 18px;
  }
}
.container {
  .tip {
    color: #c0c4cc;
    text-align: center;
  }
  i {
    font-size: 16px;
    margin-right: 10px;
  }
  .list {
    padding: 10px 0 10px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    .model-name {
      display: inline-block;
      white-space: nowrap; /* 不换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
    }
    span {
      font-size: 14px;
    }
    &:hover {
      background: #f4f8ff;
      color: #34354b;
    }
  }
}
.hamburger-module {
    line-height: 32px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    padding: 0px 8px 0px 0px !important;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }
</style>

