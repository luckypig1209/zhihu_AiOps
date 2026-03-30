/**
 * 已关联项目
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
                node-key="id"
                :props="defaultProps"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                ref="tree"
                :default-expand-all="false"
                highlight-current
                @node-click="handleNodeClick"
                :default-expanded-keys="defaultExpand"
                accordion
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
          </div>
        </el-card>
      </el-col>
      <el-col :span="24 - moduleWidth" :xs="24">
        <hamburger id="hamburger-container" :is-active="opened" class="hamburger-module" @toggleClick="toggleSideBar" />
        <!-- <el-form ref="queryForm" :model="queryParams" size="small" v-show="showSearch" :inline="true"> 单条件查询
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              style="width: 100%"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item label="" v-if="itemList.length > 0">
            <el-select
              popper-class="popper-class"
              v-model="queryParams.condition.itemId"
              :popper-append-to-body="false"
              @change="handleConditionChange"
              placeholder="请选择筛选条件"
              clearable
              filterable
            >
              <el-option
                :value="item.id"
                v-for="(item, index) in itemList"
                :key="item.id + index"
                :label="item.itemName"
              >
                <el-tooltip
                  placement="top"
                  :disabled="item.itemName.length<10"
                >
                  <div slot="content">
                    <span>{{ item.itemName }}</span>
                  </div>
                  <div class="iclass-text-ellipsis">{{ item.itemName }}</div>
                </el-tooltip>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="" prop="">
            <el-select v-model="queryParams.condition.compareType">
            <el-option label="匹配" value="like" />
            <el-option label="范围" value="between" />
          </el-select>
          </el-form-item>          
          <el-form-item label="" prop="" v-if="queryParams.condition.compareType != 'between'">
            <el-date-picker
              v-if="itemList.length > 0 && itemDataType === 'DATE'"
              v-model="queryParams.condition.itemValue"
              placeholder="请选择日期"
              value-format="yyyy-MM-dd"
              type="date"
              style="width: 240px"
            />
            <el-time-picker
              v-if="itemList.length > 0 && itemDataType === 'DATETIME'"
              v-model="queryParams.condition.itemValue"
              placeholder="请选择时间"
              value-format="HH:mm:ss"
              style="width: 240px"
            />
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'INTEGER'"
                  clearable
                   v-model="queryParams.condition.itemValue"
                  placeholder="请输入搜索内容"
                  :min="1"
                ></el-input-number>
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'FLOAT'"
                   precision="2"
                  v-model="queryParams.condition.itemValue"
                   placeholder="请输入搜索内容"
            ></el-input-number>                
            <el-input
              v-if="itemList.length > 0 && !itemDataType"
              v-model.trim="queryParams.condition.itemValue"
              placeholder="请输入搜索内容"
              style="width: 240px"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="" prop="" v-if="queryParams.condition.compareType == 'between'">
            <el-date-picker
              v-if="itemList.length > 0 && itemDataType === 'DATE'"
              v-model="queryParams.condition.minValue"
              placeholder="请选择日期"
              value-format="yyyy-MM-dd"
              type="date"
              style="width: 240px"
            />
            <el-time-picker
              v-if="itemList.length > 0 && itemDataType === 'DATETIME'"
              v-model="queryParams.condition.minValue"
              placeholder="请选择时间"
              value-format="HH:mm:ss"
              style="width: 240px"
            />
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'INTEGER'"
                  clearable
                   v-model="queryParams.condition.minValue"
                  placeholder="请输入搜索内容"
                  :min="1"
                ></el-input-number>
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'FLOAT'"
                   precision="2"
                  v-model="queryParams.condition.minValue"
                   placeholder="请输入搜索内容"
            ></el-input-number>                
            <el-input
              v-if="itemList.length > 0 && !itemDataType"
              v-model.trim="queryParams.condition.minValue"
              placeholder="请输入搜索内容"
              style="width: 240px"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="~" prop="" v-if="queryParams.condition.compareType == 'between'">
            <el-date-picker
              v-if="itemList.length > 0 && itemDataType === 'DATE'"
              v-model="queryParams.condition.maxValue"
              placeholder="请选择日期"
              value-format="yyyy-MM-dd"
              type="date"
              style="width: 240px"
            />
            <el-time-picker
              v-if="itemList.length > 0 && itemDataType === 'DATETIME'"
              v-model="queryParams.condition.maxValue"
              placeholder="请选择时间"
              value-format="HH:mm:ss"
              style="width: 240px"
            />
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'INTEGER'"
                  clearable
                   v-model="queryParams.condition.maxValue"
                  placeholder="请输入搜索内容"
                  :min="1"
                ></el-input-number>
            <el-input-number
                  v-if="itemList.length > 0 && itemDataType === 'FLOAT'"
                   precision="2"
                  v-model="queryParams.condition.maxValue"
                   placeholder="请输入搜索内容"
            ></el-input-number>                
            <el-input
              v-if="itemList.length > 0 && !itemDataType"
              v-model.trim="queryParams.condition.maxValue"
              placeholder="请输入搜索内容"
              style="width: 240px"
              clearable
            ></el-input>
          </el-form-item>

          <el-form-item style="margin-left: 10px">
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
          </el-form-item>
          <el-form-item >
         
        </el-form-item>
        </el-form> -->
        <el-form ref="queryForm" :model="queryParams" size="small" v-show="showSearch" :inline="true">
  <el-form-item label="创建时间" prop="createTime">
    <el-date-picker
      v-model="queryParams.createTime"
      style="width: 100%"
      value-format="yyyy-MM-dd HH:mm:ss"
      type="daterange"
      range-separator="-"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :default-time="['00:00:00', '23:59:59']"
    />
  </el-form-item>
  
  <!-- 循环渲染多个条件 -->
    <el-row :gutter="20">
      <el-col  :xs="24">
       <el-card v-if="queryParams.conditions.length > 0">
      <template v-for="(condition, index) in queryParams.conditions" >
        <div>
        <el-form-item label="" v-if="itemList.length > 0">
          <el-select
            popper-class="popper-class"
            v-model="condition.itemId"
            :popper-append-to-body="true"
            @change="(val) => handleConditionChange(val, index)"
            placeholder="请选择筛选条件"
            clearable
            filterable
          >
            <el-option
              :value="item.id"
              v-for="(item, idx) in itemList"
              :key="item.id + idx"
              :label="item.itemName"
            >
              <el-tooltip
                placement="top"
                :disabled="item.itemName.length<10"
              >
                <div slot="content">
                  <span>{{ item.itemName }}</span>
                </div>
                <div class="iclass-text-ellipsis">{{ item.itemName }}</div>
              </el-tooltip>
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="" prop="">
          <el-select v-model="condition.compareType">
            <el-option label="匹配" value="like" />
            <el-option label="范围" value="between" />
          </el-select>
        </el-form-item>          
        
        <el-form-item label="" prop="" v-if="condition.compareType != 'between'">
          <el-date-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
            v-model="condition.itemValue"
            placeholder="请选择日期"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 240px"
          />
          <el-time-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
            v-model="condition.itemValue"
            placeholder="请选择时间"
            value-format="HH:mm:ss"
            style="width: 240px"
          />
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
            clearable
            v-model="condition.itemValue"
            placeholder="请输入搜索内容"
            :min="1"
          ></el-input-number>
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
            precision="2"
            v-model="condition.itemValue"
            placeholder="请输入搜索内容"
          ></el-input-number>                
          <el-input
            v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
            v-model.trim="condition.itemValue"
            placeholder="请输入搜索内容"
            style="width: 240px"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="" prop="" v-if="condition.compareType == 'between'">
          <el-date-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
            v-model="condition.minValue"
            placeholder="请选择日期"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 240px"
          />
          <el-time-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
            v-model="condition.minValue"
            placeholder="请选择时间"
            value-format="HH:mm:ss"
            style="width: 240px"
          />
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
            clearable
            v-model="condition.minValue"
            placeholder="请输入搜索内容"
            :min="1"
          ></el-input-number>
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
            precision="2"
            v-model="condition.minValue"
            placeholder="请输入搜索内容"
          ></el-input-number>                
          <el-input
            v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
            v-model.trim="condition.minValue"
            placeholder="请输入搜索内容"
            style="width: 240px"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="~" prop="" v-if="condition.compareType == 'between'">
          <el-date-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATE'"
            v-model="condition.maxValue"
            placeholder="请选择日期"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 240px"
          />
          <el-time-picker
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'DATETIME'"
            v-model="condition.maxValue"
            placeholder="请选择时间"
            value-format="HH:mm:ss"
            style="width: 240px"
          />
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'INTEGER'"
            clearable
            v-model="condition.maxValue"
            placeholder="请输入搜索内容"
            :min="1"
          ></el-input-number>
          <el-input-number
            v-if="itemList.length > 0 && getItemDataType(condition.itemId) === 'FLOAT'"
            precision="2"
            v-model="condition.maxValue"
            placeholder="请输入搜索内容"
          ></el-input-number>                
          <el-input
            v-if="itemList.length > 0 && !getItemDataType(condition.itemId)"
            v-model.trim="condition.maxValue"
            placeholder="请输入搜索内容"
            style="width: 240px"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="removeCondition(index)">删除</el-button>
        </el-form-item>
        </div>
      </template>
      </el-card>
          </el-col>
  </el-row>
  <el-form-item style="margin-left: 10px; margin-top: 10px;">
    <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">搜索</el-button>
    <el-button icon="el-icon-refresh" size="small" @click="resetQuery">重置</el-button>
    <el-button type="success" icon="el-icon-plus" size="small" @click="addCondition">添加条件</el-button>
  </el-form-item>
</el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['cqt:asset-info:create']" type="primary" plain size="small" icon="el-icon-plus" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <file-upload v-hasPermi="['cqt:asset-info:import']" @success="getList"></file-upload>
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['cqt:asset-info:export']" type="warning" icon="el-icon-bottom" @click="downLoadTemplate" size="small">下载模板</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" v-hasPermi="['cqt:asset-info:batchDelete']" :loading="deleteLoading" @click="batchDelete" size="small" :disabled="!selectionRows.length"
              >批量删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button  @click="handleBatchEdit" v-hasPermi="['cqt:asset-info:batchEdit']"  size="small" :disabled="!selectionRows.length"
              >批量编辑</el-button
            >
          </el-col>
          <el-col :span="1.5">
           <el-button type="warning" v-hasPermi="['cqt:asset-info:export-data']" icon="el-icon-bottom" @click="handleExport" size="small">导出</el-button>
          </el-col>   
          <el-col :span="1.5">
           <el-button type="danger"  icon="el-icon-bottom" @click="batchExport" size="small" v-hasPermi="['cqt:asset-info:batchExport']">批量导出</el-button>
          </el-col>             
          <el-col :span="1.5">
           <el-button   
            type="primary"
            icon="el-icon-setting"
            size="small"   @click="handleCellConfig" v-hasPermi="['cqt:asset-info:cloums-setting']">字段配置</el-button>
          </el-col>                
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table ref="selectionTableRef"  border :data="dataList" v-loading="tableLoad" :header-cell-style="cellStyle"  @sort-change="handleSortChange"  @selection-change="handleSelectionChange">
          <!-- 多选列 -->
          <!-- <el-table-column align="center" width="55" >
            <template slot="header" slot-scope="{ row }">
              <el-tooltip content="暂无可删除数据">
                <el-checkbox
                  v-model="selectAllStatus"
                  @change="selectAllChange"
                  :checked="selectAllStatus"
                ></el-checkbox>
              </el-tooltip>
            </template>
            <template slot-scope="{ row }">
              <el-checkbox-group v-model="selectionRows" @change="tableSelectedRowChange">
                <el-checkbox
                  class="expand-checkbox"
                  :key="row.id"
                  :label="row.id"
                ></el-checkbox>
              </el-checkbox-group>
            </template>
          </el-table-column> -->
          <el-table-column  type="selection"  width="55" />
          <el-table-column
            v-for="column in tableHeader"
            :key="column.prop"
            :label="column.label"
            :prop="column.prop"
            :width="column.width"
            align="center"
            show-overflow-tooltip
            :sortable="column.sortable"
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
          <el-table-column row-class-name="rowName" label="操作" width="180px" fixed="right" align="center">
            <template v-slot="scope">
              <!-- <el-button size="mini" type="text" v-if="scope.row.modelName === '云服务器'" icon="el-icon-plus" @click="handleExpand(scope.row)">申请缩扩容</el-button> -->
              <el-button
                size="mini"
                type="text"
                v-if="scope.row.modelName === '云服务器' && scope.row.lastProcessInstanceId"
                icon="el-icon-view"
                @click="handleDetail(scope.row)"
                >申请详情</el-button
              >
              <el-button size="mini" type="text" v-hasPermi="['cqt:asset-info:update']" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="mini" type="text" icon="el-icon-document" @click="handleDetailProduct(scope.row)">详情</el-button>
              <el-button
                size="mini"
                type="text"
                v-hasPermi="['cqt:asset-info:delete']"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
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
      :type="'related'"
      :title="editTitle"
      :formData="form"
      @success="getList"
    />
    <relatedAllEditModal
      :visible.sync="batchEditVisible"
      :selectionIds="selectionRows"
      @closeAll="closeAllVisible"
      :type="'related'"
      title="批量编辑"
      :formData="selectForm"
      @successAll="getList"
    />
    <el-dialog title="模板下载" :visible.sync="visible" width="500px">
      <el-form ref="templateForm" :model="templateForm" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="资源模型" prop="modelId">
              <el-select v-model="templateForm.modelId" placeholder="请选择资源模型" clearable filterable>
                <el-option
                  :value="item.id"
                  v-for="item in assetModelList"
                  :key="item.id"
                  :label="item.modelName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit" :disabled="isSubmitDisabled">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog title="申请缩扩容" :visible.sync="expandVisible" width="50%">
      <parser :key="new Date().getTime()" :form-conf="detailForm" @submit="submitForm" />
    </el-dialog> -->
    <!-- 字段配置弹窗 -->
    <CellConfig
      :cellConfigVisible="cellConfigVisible"
      :queryParams = "queryParams"
      @cellCfgClose="cellCfgClose"
    ></CellConfig>    
  </div>
</template>

<script>
import { getCustomerNameByLoginProject, queryProjectNameByLogin } from "@/api/projectManage/improveInfo";
import fileUpload from "./upload";
import relatedEditModal from "./relatedEditModal";
import relatedAllEditModal from "./relatedEditAllModal";
import { getForm } from "@/api/bpm/form";
import { createProcessInstance } from "@/api/bpm/processInstance";
import {
  getAssetModel,
  getAssetInfoPage,
  deleteAssetInfo,
  batchDeleteAssetInfo,
  exportTemplate,
  updateProcessInstance,
  exportAssetInfo,
  getTableHeadInfo
} from "@/api/resource";
// import Parser from "@/components/parser/Parser";
import { decodeFields } from "@/utils/formGenerator";
import loginVue from "../../../login.vue";
import Hamburger from '@/components/Hamburger'
import CellConfig from "./cellConfig.vue";
export default {
  name: "",
  components: { fileUpload, relatedEditModal, Hamburger, CellConfig, relatedAllEditModal },
  props: {
    type: {
      default: "live",
      type: String
    },
    assetTypeList: {
      default: () => [],
      type: Array
    }
    // assetModelList: {
    //   default: () => [],
    //   type: Array
    // }
  },

  // watch: {
  //   'queryParams.condition.itemValue': {
  //     handler(val) {
  //       if (val) {
  //         this.queryParams.condition.itemValue = val.replace(/^\s+|\s+$/g, '')
  //       }
  //     },
  //     deep: true
  //   }
  // },
  data() {
    return {
      showAll: false,
      tableHeader: [],
      itemList: [], // 模型属性列表
      // 表单详情
      detailForm: {
        fields: []
      },
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
      assetModelList: [],
      expandVisible: false,
      deleteLoading:false,
      visible: false, // 下载模板弹框
      isSubmitDisabled: false, // 提交按钮是否禁用
      showSearch: true,
      editVisible: false,
      batchEditVisible: false,
      selectForm:{},
      editTitle: "新增",
      customerList: [],
      projectList: [],
      assetTypeId: "",
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        isManaged: null,
        customerId: undefined,
        projectId: undefined,
        assetTypeId: undefined,
        createTime: undefined,
        modelId: undefined,
        assetIp: undefined,
        dataSource: undefined,
        // condition: {
        //   itemId: "",
        //   itemValue: "",
        //   minValue:"",
        //   maxValue:"",
        //   compareType:""
        // }
        conditions: [
          // {
          //   itemId: undefined,
          //   compareType: undefined,
          //   itemValue: undefined,
          //   minValue: undefined,
          //   maxValue: undefined
          // }
        ]        
      },
      itemArray:[],
      loading: false,
      activeIndex: null,
      total: 0,
      form: {},
      templateForm: {},
      rules: {
        modelId: { required: true, type: "number", message: "请选择资源模型", trigger: "change" }
      },
      dataList: [],
      tableLoad: false,
      processInstanceId: null,
      totalPage: null,
      defaultExpand: [], // 默认展开项id
      // deleteableTableRows: [], // 可删除的行
      selectionRows: [], // 选中行
      selectAllStatus: false, // 全选状态
      moduleWidth: 4,
      opened: true,
      cellConfigVisible: false, // 字段配置弹窗状态
    };
  },
  watch: {},
  computed: {
    // itemDataType() {
    //   let type = "";
    //   for (let i = 0, len = this.itemList.length; i < len; i++) {
    //     let item = this.itemList[i];
    //     if (item.itemDataType == "DATE" && this.queryParams.condition.itemId == item.id) {
    //       type = "DATE";
    //       break;
    //     }
    //     if (item.itemDataType == "DATETIME" && this.queryParams.condition.itemId == item.id) {
    //       type = "DATETIME";
    //       break;
    //     }
    //     if (item.itemDataType == "FLOAT" && this.queryParams.condition.itemId == item.id) {
    //       type = "FLOAT";
    //       break;
    //     }
    //     if (item.itemDataType == "INTEGER" && this.queryParams.condition.itemId == item.id) {
    //       type = "INTEGER";
    //       break;
    //     }
    //   }
    //   return type;
    // }
  },
  created() {
    this.searchModelList("init");
    this.getCustomerNameByLoginProject();
  },
  methods: {
    handleSortChange({ prop, order }) {
      this.queryParams.isDesc = order === 'ascending' ? true : false
      this.queryParams.sortFiled =  prop
      this.getList()
    },
    handleCellConfig() {
      // 打开表头配置弹窗
      this.cellConfigVisible = true;
    },   
    cellCfgClose(type) {
      this.cellConfigVisible = false;
      if (type === "submit") {
        // 配置字段后刷新列表
        this.getTableHead()
      }
    },     
    handleExport() {
      let params = Object.assign({}, this.queryParams);
      delete params.pageNo;
      delete params.pageSize;
      exportAssetInfo(params).then((res) => {
        this.$download.excel(res, "资产信息.xls");
      });
    },    
    batchExport(){
      let params = Object.assign({}, this.queryParams);
      delete params.pageNo;
      delete params.pageSize;
      const selectionIds = this.selectionRows;
      params.idList = selectionIds
      exportAssetInfo(params).then((res) => {
        this.$download.excel(res, "资产信息.xls");
      });
    },
    // handleConditionChange() {
    //   this.queryParams.condition.itemValue = "";
    // },
    onShowNameTipsMouseenter(e) {
      console.log('sdsd',e)
      var target = e.target;
      let textLength = target.clientWidth;
      let containerLength = target.scrollWidth;
      if (textLength<containerLength) {
        this.tooltipTitle = e.target.innerText;
        this.showTitle = false;
      } else {
        this.showTitle = true;
      }
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      this.dataList = [];
      this.total = 0;
      return data.name.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data, node) {
      console.log('322',data)
      this.assetTypeId = data.assetTypeId || node.parent.data.assetTypeId;
      if (data.id) {
        this.queryParams.modelId = data.id;
        this.queryParams.conditions = []     
        this.queryParams.isDesc = ""
        this.queryParams.sortFiled =  ""
        this.$refs.tree.setCurrentKey(this.queryParams.modelId);
        this.itemList = data.items || [];
        this.itemArray = this.itemList.map(item => {
          return item.itemName
        })
        this.handleQuery();
        // this.tableHeader = [
        //   //   {
        //   //   label: '客户名称',
        //   //   prop: 'customerName',
        //   // },
        //   {
        //     label: "资源类型",
        //     prop: "assetTypeName"
        //   },
        //   {
        //     label: "资源名称",
        //     prop: "assetName"
        //   },
        //   // {
        //   //   label: "IP地址",
        //   //   prop: "assetIp",
        //   //   width: 180
        //   // },
        //   // {
        //   //   label: '唯一标识',
        //   //   prop: 'uniqueCode',
        //   // },
        //   {
        //     label: "资源数据来源",
        //     prop: "dataSource",
        //     width: 220
        //   },
        //   {
        //     label: "资源模型",
        //     prop: "modelName"
        //   },
        //   {
        //     label: "创建时间",
        //     prop: "createTime",
        //     width: 150
        //   }
        // ];
        this.getTableHead()
        this.handleQuery();
        // this.itemList.forEach((item) => {

        // });
      }
    },
    getTableHead(){
      this.tableHeader = []
        this.tableLoad = true
        this.queryParams.status = 1
        getTableHeadInfo(this.queryParams).then((res) => {
          let resData = res.data
          resData.forEach(item =>{
            if(item.filed !== 'dataSource'){
              this.tableHeader.push({
              prop: item.filed,
              label: item.name,
                  sortable: this.itemArray.indexOf(item.name) > -1? 'custom' : false
              });
            }

          })
          this.tableLoad = false
        }) 
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (column.label === "操作") {
        return {
          borderTopRightRadius: "8px",
          borderBottomRightRadius: "8px"
        };
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
        // {
        //   label: "IP地址",
        //   prop: "assetIp",
        //   width: 180
        // },
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
      // if (!this.modelQueryParams.modelName) {
      //   this.getModelList("init");
      // } else {
      //   this.$nextTick(() => {
      //     this.$refs.tree.filter(this.modelQueryParams.modelName);
      //   });
      // }
      this.getModelList("init");
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
        this.assetModelList = res.data;
        this.modelList = this.getNewModelList(res.data);
        this.assetTypeId = this.modelList[0].assetTypeId;
        this.queryParams.modelId = this.modelList[0].children[0].id;
        this.defaultExpand = [this.modelList[0].id];
        this.itemList = this.modelList[0].children[0].items || [];
        this.itemArray = this.itemList.map(item => {
          return item.itemName
        })
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(this.modelList[0].children[0].id);
        });

        this.handleQuery();
        // if (val) {
        //   this.itemList.forEach((item) => {
        //     this.tableHeader.push({
        //       prop: item.itemCode,
        //       label: item.itemName
        //     });
        //   });
        // }
        this.getTableHead()
      });
    },
    handleDetail(row) {
      this.getDetail(row.lastProcessInstanceId);
    },
    getDetail(id) {
      this.$router.push({
        path: "/bpm/process-instance/detail",
        query: {
          id: id
        }
      });
    },
    addCondition() {
      this.queryParams.conditions.push({
        itemId: undefined,
        compareType: undefined,
        itemValue: undefined,
        minValue: undefined,
        maxValue: undefined
      })
    },
  
    // 删除查询条件
    removeCondition(index) {
      this.queryParams.conditions.splice(index, 1)
    }, 
  // 修改后的条件变化处理
  handleConditionChange(val, index) {
    // 根据itemId获取数据类型
    const selectedItem = this.itemList.find(item => item.id === val)
    if (selectedItem) {
      // 这里可以根据需要处理数据类型相关逻辑
    }
  },
  
  // 获取项目的数据类型
  getItemDataType(itemId) {
    // const item = this.itemList.find(i => i.id === itemId)
    // return item ? item.dataType : null
    let type = "";
      for (let i = 0, len = this.itemList.length; i < len; i++) {
        let item = this.itemList[i];
        if (item.itemDataType == "DATE" && itemId == item.id) {
          type = "DATE";
          break;
        }
        if (item.itemDataType == "DATETIME" && itemId == item.id) {
          type = "DATETIME";
          break;
        }
        if (item.itemDataType == "FLOAT" && itemId == item.id) {
          type = "FLOAT";
          break;
        }
        if (item.itemDataType == "INTEGER" && itemId == item.id) {
          type = "INTEGER";
          break;
        }
      }
      return type;
  },       
    handleExpand(row) {
      this.row = row;
      getForm(3).then((res) => {
        // 设置值
        const data = res.data;
        this.detailForm = {
          ...JSON.parse(data.conf),
          fields: decodeFields(data.fields)
        };
        this.expandVisible = true;
      });
    },
    /** 提交按钮 */
    submitForm(params) {
      this.$modal.loading("正在提交，请稍候...");
      if (!params) {
        return;
      }
      // 设置表单禁用
      const conf = params.conf;
      conf.disabled = true; // 表单禁用
      conf.formBtns = false; // 按钮隐藏

      // 提交表单，创建流程
      const variables = params.values;
      createProcessInstance({
        processDefinitionId: "asset_resource:2:e713e550-c0d2-11ee-b875-02420abc000b",
        variables: variables
      })
        .then((response) => {
          const params = {
            assetId: this.row.id,
            processInstanceId: response.data
          };
          updateProcessInstance(params).then((res) => {
            setTimeout(this.$modal.closeLoading(), 1000);
            this.$modal.msgSuccess("申请成功");
            this.expandVisible = false;
            this.getList();
          });
        })
        .catch(() => {
          conf.disabled = false; // 表单开启
          conf.formBtns = true; // 按钮展示
        });
    },
    downLoadTemplate() {
      this.visible = true;
      this.templateForm = {
        modelId: this.queryParams.modelId
      };
      this.$nextTick(() => {
        this.$refs.templateForm.clearValidate();
      });
    },
    submit() {
      this.$refs.templateForm.validate((valid) => {
        if (valid) {
          exportTemplate(this.templateForm).then((res) => {
            this.$download.excel(res, "项目资源资产管理模板.xls");
            this.visible = false;
            this.$refs.templateForm.resetFields();
          });
        }
      });
    },
    // 查询客户列表
    getCustomerNameByLoginProject() {
      getCustomerNameByLoginProject().then((res) => {
        this.customerList = res.data;
      });
    },
    // 查询项目列表
    queryProjectNameByLogin() {
      this.queryParams.projectId = undefined;
      queryProjectNameByLogin({
        customerId: this.queryParams.customerId
      }).then((res) => {
        this.projectList = res.data;
      });
    },
    changeShowAll(){
      this.showAll = !this.showAll
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
        this.queryParams.conditions = [
        ] 
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleAdd() {
      this.editVisible = true;
      this.editTitle = "新增";
      this.form = {
        assetTypeId: this.assetTypeId,
        modelId: this.queryParams.modelId
      };
    },
    handleEdit(row) {
      this.editVisible = true;
      this.editTitle = "编辑";
      this.form = Object.assign({}, row);
    },
    handleDetailProduct(row){
      this.editVisible = true;
      this.editTitle = "详情";
      this.form = Object.assign({}, row);
    },
    closeVisible() {
      this.editVisible = false;
      // this.getList();
    },
    closeAllVisible(){
      this.batchEditVisible = false;
    },
    getList() {
      // if(this.queryParams.condition.compareType == 'between'){
      //   this.queryParams.condition.itemValue = ""
      // } else {
      //   // this.queryParams.condition.compareType = ""
      //   this.queryParams.condition.minValue = ""
      //   this.queryParams.condition.maxValue = ""

      // }
      getAssetInfoPage(this.queryParams).then((res) => {
        this.dataList = res.data && res.data.list;
        this.total = (res.data && res.data.total) || 0;
        this.dataList.forEach((item) => {
          if(item.assetAttribute && Object.entries(item.assetAttribute) && Object.entries(item.assetAttribute).length > 0){
            let objArray = Object.entries(item.assetAttribute)
            objArray.forEach(objItem =>{
              item[objItem[0]] = objItem[1]
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
        // 初始化可删除列表、全选状态、选中行数据
        // this.deleteableTableRows = this.dataList.filter((item) => {
        //   return item.dataSource === "人工录入";
        // });
        this.selectAllStatus = false;
        this.selectionRows = [];
        // console.log('dataList==', this.dataList)
      });
    },
    handleDelete(row) {
      const ids = row.id;
      this.$modal
        .confirm("是否确认删除该资源数据?")
        .then(function () {
          return deleteAssetInfo({ id: ids });
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {});
    },
    toggleSideBar() {
       this.opened = !this.opened
       if(this.opened){
        this.moduleWidth = 4
       } else {
        this.moduleWidth = 0
       }
    },
    // selectAllChange(value) {
    //   // 表头全选事件
    //   if (value) {
    //     if (this.deleteableTableRows.length === 0) {
    //       this.$message.warning("暂无可删除的资产");
    //       return;
    //     }
    //     this.selectionRows = this.deleteableTableRows.map((item) => item.id);
    //   } else {
    //     this.selectionRows = [];
    //   }
    // },
    // tableSelectedRowChange() {
    //   if (this.selectionRows.length === this.deleteableTableRows.length) {
    //     this.selectAllStatus = true;
    //     return;
    //   }
    //   this.selectAllStatus = false;
    // },
    handleSelectionChange(val) {
       this.selectionRows = []
       if(val.length){
          this.selectionRows = val.map(item =>{
            return item.id
          })
       }
      },
    handleBatchEdit(){
      const selectionIds = this.selectionRows;
      this.batchEditVisible = true;
      const selectRows =  this.dataList.filter(item => selectionIds.indexOf(item.id) > -1)
      this.selectForm = Object.assign({}, selectRows[0]);
    },
    batchDelete() {
      // 批量删除
      const selectionIds = this.selectionRows;
      const params = {
        ids: selectionIds
      };
      this.$confirm("该操作将删除选中行，是否继续", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then((_) => {
          // 调用删除接口
          this.deleteLoading = true;
          batchDeleteAssetInfo(params).then((res) => {
            if (res.code === 0) {
              this.deleteLoading = false;
              this.$message.success("删除成功");
              this.getList();
            }
          });
        })
        .catch((_) => {
          this.deleteLoading = false;
          this.$message({
            type: "info",
            message: "已取消操作"
          });
        });
    }
  }
};
</script>
<style scoped>
.rowName {
  border-radius: 10px;
}
</style>
<style scoped lang="less">
.el-select {
  width: 200px;
}

.el-select ::v-deep .popper-class {
  width: 200px;
}

.iclass-text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.span-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
::v-deep.el-table .expand-checkbox .el-checkbox__label {
  display: none;
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
  /deep/ .ivu-select-dropdown{
  z-index: 9999 !important;
}  
// /deep/.el-table td {
//   border: 0;
// }
// /deep/.el-table {
//   border: 0;
// }
// /deep/ .el-table--group::after, .el-table--border::after{
//  width: 0
// }
</style>
