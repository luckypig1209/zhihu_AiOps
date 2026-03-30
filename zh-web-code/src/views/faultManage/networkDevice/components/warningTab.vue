<template>
  <a-card size="small" :bordered="false" class="monitor-container">
    <!-- 查询条件区域 -->
    <div style="border-bottom: 1px solid #eee; margin-bottom: 10px">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px">
        <a-row :gutter="16">
          <!-- 名称 -->
          <a-col :span="4">
            <a-form-item>
              <a-input v-model="queryForms.name" :placeholder="$t('common.placeholder.name')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :span="4">
            <a-form-item>
              <a-select v-model="searchForm.onlineStatus" :options="onlineStatusOptions" :placeholder="$t('common.placeholder.monitorStatus')"
                allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="4" v-if="assertInfo.modelCode !== 'ztkeeper'">
            <a-form-item>
              <a-select v-model="searchForm.snmpStatus" :options="snmpStatusOptions" :placeholder="$t('common.placeholder.issueStatus')" allowClear
                style="width: 100%" />
            </a-form-item>
          </a-col>

          <!-- 触发时间（时间范围） -->
          <a-col :span="8" style="margin-top: 3px; display: flex">
            <a-button type="primary" ghost @click="searchQuery"> {{ $t('common.search') }} </a-button>
            <a-button type="primary" ghost style="margin-left: 12px" @click="handleReset">{{ $t('common.reset') }}</a-button>
            <div style="margin-left: 10px">
              <img v-if="showAll" style="width: 24px; height: 24px" src="@/assets/images/loudouoon.png" alt=""
                @click="changeShowAll" />
              <img v-else style="width: 24px; height: 24px" src="@/assets/images/loudouoff.png" alt=""
                @click="changeShowAll" />
            </div>
          </a-col>
          <div style="margin-left: auto; margin-top: -3px">
            <refreshTime @refresh="getList"></refreshTime>
          </div>
        </a-row>
      </a-form>

      <el-form ref="queryForm" v-if="showAll" :model="queryParams" size="small" :inline="true" style="margin-left: 2%;">
        <el-row type="flex">
          <el-col :span="11">
            <template>
              <div v-for="(condition, index) in queryParams.conditions" :key="index">
                <el-form-item label="" v-if="itemList.length > 0">
                  <el-select popper-class="popper-class" v-model="condition.itemId" :popper-append-to-body="true"
                    @change="(val) => handleConditionChange(val, index)" :placeholder="$t('common.selectFilterCondition')" clearable filterable>
                    <el-option :value="item.id" v-for="(item, idx) in itemList" :key="item.id + idx"
                      :label="item.itemName">
                      <el-tooltip placement="top" :disabled="item.itemName.length < 10">
                        <div slot="content">
                          <span>{{ item.itemName }}</span>
                        </div>
                        <div class="iclass-text-ellipsis">
                          {{ item.itemName }}
                        </div>
                      </el-tooltip>
                    </el-option>
                  </el-select>
                </el-form-item>

                <!-- 分组标签控件：单独渲染 -->
                <el-form-item label="" prop="" v-if="condition.itemId === 'GROUP_FILTER'">
                  <el-select
                    v-model="condition.itemValue"
                    multiple
                    filterable
                    :placeholder="$t('common.selectGroup')"
                    style="width: 240px"
                    clearable
                  >
                    <el-option
                      v-for="group in groupOptions"
                      :key="group.id"
                      :label="group.name"
                      :value="group.id"
                    />
                  </el-select>
                </el-form-item>

                <!-- 监控方式筛选控件：单独渲染 -->
                <el-form-item label="" prop="" v-if="condition.itemId === 'MONITOR_METHOD_FILTER'">
                  <el-select
                    v-model="condition.itemValue"
                    :placeholder="$t('common.selectMonitorMethod')"
                    style="width: 240px"
                    clearable
                  >
                    <el-option
                      v-for="method in monitorMethodOptions"
                      :key="method.value"
                      :label="method.label"
                      :value="method.value"
                    />
                  </el-select>
                </el-form-item>

                <!-- 原有其他类型控件 -->
                <el-form-item label="" prop="" v-else-if="condition.compareType != 'between' && condition.itemId !== 'GROUP_FILTER' && condition.itemId !== 'MONITOR_METHOD_FILTER'">
                  <el-date-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATE'
                  " v-model="condition.itemValue" :placeholder="$t('common.selectDate')" value-format="yyyy-MM-dd" type="date"
                    style="width: 240px" />
                  <el-time-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATETIME'
                  " v-model="condition.itemValue" :placeholder="$t('common.selectTime')" value-format="HH:mm:ss" style="width: 240px" />
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'INTEGER'
                  " clearable v-model="condition.itemValue" :placeholder="$t('common.inputSearchContent')" :min="1"></el-input-number>
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'FLOAT'
                  " precision="2" v-model="condition.itemValue" :placeholder="$t('common.inputSearchContent')"></el-input-number>
                  <el-select v-if="
                    itemList.length > 0 && getItemDataType(condition.itemId) === 'OPTIONAL'"
                    v-model="condition.itemValue" :placeholder="$t('common.select')" @change="changeType" clearable filterable>
                    <el-option v-for="dict in getDictDatas(condition.itemCode)" :key="dict.value"
                      :label="dict.label" :value="dict.value" />
                  </el-select>
                  <el-input v-if="
                    itemList.length > 0 && !getItemDataType(condition.itemId)
                  " v-model.trim="condition.itemValue" :placeholder="$t('common.inputSearchContent')" style="width: 240px" clearable></el-input>
                </el-form-item>

                <el-form-item label="" prop="" v-if="condition.compareType == 'between'">
                  <el-date-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATE'
                  " v-model="condition.minValue" :placeholder="$t('common.selectDate')" value-format="yyyy-MM-dd" type="date"
                    style="width: 240px" />
                  <el-time-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATETIME'
                  " v-model="condition.minValue" :placeholder="$t('common.selectTime')" value-format="HH:mm:ss" style="width: 240px" />
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'INTEGER'
                  " clearable v-model="condition.minValue" :placeholder="$t('common.inputSearchContent')" :min="1"></el-input-number>
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'FLOAT'
                  " precision="2" v-model="condition.minValue" :placeholder="$t('common.inputSearchContent')"></el-input-number>
                  <el-input v-if="
                    itemList.length > 0 && !getItemDataType(condition.itemId)
                  " v-model.trim="condition.minValue" :placeholder="$t('common.inputSearchContent')" style="width: 240px" clearable></el-input>
                </el-form-item>

                <el-form-item label="~" prop="" v-if="condition.compareType == 'between'">
                  <el-date-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATE'
                  " v-model="condition.maxValue" :placeholder="$t('common.selectDate')" value-format="yyyy-MM-dd" type="date"
                    style="width: 240px" />
                  <el-time-picker v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'DATETIME'
                  " v-model="condition.maxValue" :placeholder="$t('common.selectTime')" value-format="HH:mm:ss" style="width: 240px" />
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'INTEGER'
                  " clearable v-model="condition.maxValue" :placeholder="$t('common.inputSearchContent')" :min="1"></el-input-number>
                  <el-input-number v-if="
                    itemList.length > 0 &&
                    getItemDataType(condition.itemId) === 'FLOAT'
                  " precision="2" v-model="condition.maxValue" :placeholder="$t('common.inputSearchContent')"></el-input-number>
                  <el-input v-if="
                    itemList.length > 0 && !getItemDataType(condition.itemId)
                  " v-model.trim="condition.maxValue" :placeholder="$t('common.inputSearchContent')" style="width: 240px" clearable></el-input>
                </el-form-item>

                <el-form-item>
                  <a-button type="danger" ghost v-if="queryParams.conditions.length > 1"
                    @click="removeCondition(index)">
                    {{ $t('common.delete') }}
                  </a-button>
                </el-form-item>
              </div>
            </template>
          </el-col>
          <el-col :span="10">
            <a-button type="primary" ghost @click="addCondition">
              {{ $t('common.addFilterCondition') }}
            </a-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <!-- 操作按钮区域 -->
    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="primary" ghost @click="handleCreate">
            <a-icon type="plus" />{{ $t('common.add') }}
          </a-button>
          <a-dropdown>
            <a-button>{{ $t('common.more') }} <a-icon type="down" /></a-button>
            <a-menu slot="overlay" @click="handleBatchOperation">
              <a-menu-item key="batchDelete">{{ $t('common.delete') }}</a-menu-item>
              <a-menu-item key="batchImport">{{ $t('common.import') }}</a-menu-item>
              <a-menu-item key="batchAddGroup">{{ $t('common.add') }}{{ $t('menu.group') }}</a-menu-item>
              <a-menu-item key="batchClearGroup">{{ $t('menu.clearGroup') }}</a-menu-item>
              <a-menu-item key="batchCreate">{{ $t('menu.batchCreate') }}</a-menu-item>
            </a-menu>
          </a-dropdown>
          <a-button type="primary" ghost @click="handleExport"> {{ $t('common.export') }} </a-button>
        </div>
        <div class="right-operations">
          <a-button @click="handleSetting">
            <a-icon type="setting" />{{ $t('common.setting') }}
          </a-button>
        </div>
      </div>
    </div>

    <!-- 设备表格：修复loading绑定 -->
    <div class="table-container">
      <el-table
        :data="tableData"
        v-loading="tableLoading.spinning"
        :loading-text="tableLoading.tip"
        :loading-delay="tableLoading.delay"
        border
        @selection-change="onSelectChange"
        row-key="id"
        size="medium"
        fit
      >
        <!-- 动态渲染所有列 -->
        <template v-for="(col, index) in tableHeader" >
          <el-table-column type="selection" v-if="index === 0"   :selectable="isRowSelectable"  width="55" align="center"></el-table-column>
          <!-- 名称列特殊处理 -->
          <el-table-column
            v-if="col.dataIndex === 'name'"
            :label="col.title"
            :width="col.width || 180"
            show-overflow-tooltip
            :resizable="true"
          >
            <template slot-scope="scope">
              <span
                style="color: #1890ff; cursor: pointer; display: inline-block; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                @click="selectShow(scope.row)">
                {{ scope.row[col.dataIndex] }}
              </span>
            </template>
          </el-table-column>

          <!-- 监控状态列特殊处理 -->
          <el-table-column
            v-else-if="col.dataIndex === 'onlineStatus'"
            :label="col.title"
            :width="col.width || 100"
            :resizable="true"
             fixed="right"
          >
            <template slot="header">
               <span>{{ $t('common.monitorStatusTitle') }}</span> <el-tooltip class="item" effect="dark" placement="top">
                <div slot="content">
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span
                      style="display: inline-block; width: 8px; height: 8px; background-color: #67c23a; border-radius: 50%; margin-right: 8px;"></span>
                    <span>{{ $t('common.normalMonitorStatus') }}</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span
                      style="display: inline-block; width: 8px; height: 8px; background-color: #e6a23c; border-radius: 50%; margin-right: 8px;"></span>
                    <span>{{ $t('common.warningMonitorStatus') }}</span>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                    <span
                      style="display: inline-block; width: 8px; height: 8px; background-color: #f56c6c; border-radius:50%; margin-right: 8px;"></span>
                    <span>{{ $t('common.exceptionMonitorStatus') }}</span>
                  </div>
                  <div style="display: flex; align-items: center;">
                    <span
                      style="display: inline-block; width: 8px; height: 8px; background-color: #909399; border-radius: 50%; margin-right: 8px;"></span>
                    <span>{{ $t('common.unknownMonitorStatus') }}</span>
                  </div>
                </div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <el-tag :type="getStatusColor(scope.row[col.dataIndex])" class="status-tag">
                {{ getStatusText(scope.row[col.dataIndex]) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 下发状态列特殊处理 -->
          <el-table-column
            v-else-if="col.dataIndex === 'snmpStatus'"
            :label="col.title"
            :width="col.width || 100"
            :resizable="true"
             fixed="right"
          >
            <template slot-scope="scope">
              <el-tag :type="getSnmpStatusColor(scope.row[col.dataIndex])" class="status-tag">
                {{ getSnmpStatusText(scope.row[col.dataIndex]) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-else-if="col.dataIndex === 'createTime'"
            :label="col.title"
            :width="col.width || 100"
            :resizable="true"

          >
            <template slot-scope="scope">
                {{scope.row.createTime}}
            </template>
          </el-table-column>
          <el-table-column
              v-else-if="col.dataIndex === 'groupTags'"
              :label="$t('common.groupTag')"
              width="220"
              
              :resizable="true"
            >
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.groupTags.join(',')" placement="top">
                <div class="group-tags-container">
                  <el-tag
                    v-for="(tag, idx) in scope.row.groupTags.slice(0,3)"
                    :key="idx"
                    type="info"
                    size="mini"
                    style="margin-right: 4px; margin-bottom: 0;"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag
                    v-if="scope.row.groupTags.length > 3"
                    type="default"
                    size="mini"
                    style="margin-bottom: 0;"
                  >
                    +{{ scope.row.groupTags.length - 3 }}个
                  </el-tag>
                </div>
                </el-tooltip>
              </template>
            </el-table-column>

          <!-- 监控方式特殊处理 -->
          <el-table-column
            v-else-if="col.dataIndex === 'monitorMethod'"
            :label="$t('common.monitorMethod')"
            :width="col.width || 80"
            :resizable="true"
            fixed="right"
          >
            <template slot-scope="scope">
              <span v-if="assertInfo.modelCode === 'networkdevice'
            || assertInfo.modelCode === 'storagedevice'
            || assertInfo.modelCode === 'terminaldevice' || assertInfo.modelCode === 'securitydevice'">{{monitorTypeList1[scope.row[col.dataIndex]]}}</span>
            <span v-else>{{monitorTypeList2[scope.row[col.dataIndex]]}}</span>
            </template>
          </el-table-column>
          <!-- 操作列特殊处理 -->
          <el-table-column
            v-else-if="col.dataIndex === 'operation'"
            :label="col.title"
            :min-width="220"
            fixed="right"
            :resizable="true"
          >
            <template slot-scope="scope">
              <el-button :disabled="scope.row?.dataSource === '资源同步'" type="text" size="small" @click="handleMoreOperation(scope.row, 'edit')">
                {{ $t('common.edit') }}
              </el-button>
              <el-button :disabled="scope.row?.dataSource === '资源同步'" type="text" size="small" @click="handleMoreOperation(scope.row, 'delete')">
                {{ $t('common.delete') }}
              </el-button>
              <el-button type="text" size="small" v-if="assertInfo.modelCode !== 'ztkeeper'" :disabled="scope.row?.monitorMethod == 0" @click="handleMoreOperation(scope.row, 'issue')">
                {{ $t('menu.issue') }}
              </el-button>
              <el-button type="text" size="small" @click="openAddGroupModal(scope.row)" class="op-btn">
                  {{ $t('productGroup.addGroup') }}
                </el-button>
            </template>
          </el-table-column>

          <!-- 普通列渲染 - 自适应宽度 -->
          <el-table-column
            v-else
            :label="col.title"
            :prop="col.dataIndex"
            :width="col.width || (isNarrowScreen ? 100 : 120)"
            show-overflow-tooltip
            :resizable="true"
          />
        </template>
      </el-table>

      <!-- 分页 -->
      <a-pagination class="pagination" :current="pagination.current" :page-size="pagination.pageSize"
        :total="pagination.total" :show-total="(total) => $t('common.totalRecords', { total: pagination.total })"
        :page-size-options="['10', '20', '50', '100']" show-size-changer show-quick-jumper @change="handlePageChange"
        @showSizeChange="onShowSizeChange">
        <template slot="buildOptionText" slot-scope="props">
          <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>
        </template>
      </a-pagination>
    </div>

    <!-- 设备详情抽屉 -->
    <a-drawer v-if="isDestory" :title="selectName" width="1080px" placement="right" :closable="true"
      :visible="nameVisible" :mask-closable="false" @close="onClose">
      <deviceDetail :selectRow="selectRow" :assertInfo="assertInfo"></deviceDetail>
    </a-drawer>

    <!-- 导入模态框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
    <el-form ref="uploadForm" :model="upload" size="small" :inline="true">
      <el-form-item :label="$t('common.monitorMethod')" style="margin-bottom: 16px;">
        <el-select v-model="upload.monitorType" :placeholder="$t('common.selectMonitorMethod')" style="width: 100%;">
          <el-option
            v-for="item in monitorTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline;margin-right: 10px;margin-top: 6px;"
            @click="importTemplate"
          >{{ $t('common.networkDevice.upload.downloadTemplate') }}</el-link>
    </el-form>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :before-upload="beforeUpload"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-change="handleFileChange"
        :on-success="handleFileSuccess"
        :on-exceed="handleExceed"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">{{ $t('common.networkDevice.upload.dragHint') }}</div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>{{ $t('common.networkDevice.upload.fileTypeHint') }}</span>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm" :disabled="disabledBtn">{{ $t('common.networkDevice.upload.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('common.networkDevice.upload.cancel') }}</el-button>
      </div>
    </el-dialog>

    <!-- 设备创建/编辑抽屉 -->
    <device-form :visible="formVisible" v-if="closeDevice" :is-edit="isEditForm" :initial-data="formInitialData" :assertInfo="assertInfo"
      @close="closeDeviceForm" @createDevice="handleCreateDevice" @updateDevice="handleUpdateDevice"
      @upload-excel="handleUploadExcel" />

    <!-- 导出模态框 -->
    <export-modal :visible="exportModalVisible" :default-fields="visibleColumns"
      :all-fields="tableHeader.filter((col) => col.dataIndex !== 'operation')" @cancel="handleExportCancel"
      @confirm="handleExportConfirm" />

    <!-- 设置模态框 -->
    <setting-modal :cellConfigVisible="settingModalVisible" :queryParams="queryParams" @cellCfgClose="cellCfgClose" />

    <!-- 添加分组模态框 -->
    <el-dialog
      :title="$t('common.addGroupTag')"
      :visible.sync="addGroupModalVisible"
      width="400px"
      append-to-body
    >
      <el-form :model="groupForm" label-width="80px">
        <el-form-item :label="$t('common.groupTag')">
          <el-select
            v-model="groupForm.selectedTags"
            multiple
            filterable
            :placeholder="$t('common.pleaseSelectOrInputGroupTag')"
            clearable
            style="width: 100%"
            @change="handleGroupSelectChange"
          >
            <el-option
              v-for="tag in groupOptions"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addGroupModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmAddGroup" >{{ $t('common.confirm') }}</el-button>
      </div>
    </el-dialog>
  </a-card>
</template>

<script>
import refreshTime from "@/components/refresh/index.vue";
import DeviceForm from "./deviceForm.vue";
import ExportModal from "./ExportModal.vue";
import SettingModal from "./SettingModal.vue";
import {
  getAssetModel,
  getAssetInfoPage,
  deleteAssetInfo,
  batchDeleteAssetInfo,
  exportTemplate,
  updateProcessInstance,
  exportAssetInfo,
  getAssetModelPage,
  getTableHeadInfo,
  getAssetModelDetail,
  impTemplate,
  getAssetGroup,
  addAssetGroups,
  getMonitorMethod,
  batchCreate, importAssetInfo
} from "@/api/resource";
import { getBaseHeader } from "@/utils/request";
import { issue } from "@/api/monitor/task";
import deviceDetail from "./deviceDetail.vue";
import { getDictDatas } from "@/utils/dict";
export default {
  name: "NetworkMonitorList",
  components: {
    DeviceForm,
    ExportModal,
    SettingModal,
    deviceDetail,
    refreshTime,
  },
  data() {
    return {
      disabledBtn: false,
      flag: 1,
      uploadFile: undefined,
      closeDevice: true,
      typeList: [],
      exportLoading: false,
      // 用户导入参数
      upload: {
        open: false,
        title: "",
        isUploading: false,
        headers: getBaseHeader(),
        monitorType: '',
        url: `/admin-api/cqt/asset-info/import/{modelId}`,
      },
      monitorTypeOptions: [],
      tableLoad: false,
      queryForms: {
        name: "",
        ip: "",
        port: "",
        dType: " ",
      },
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
        conditions: [
          {
            itemId: undefined,
            compareType: "like",
            itemValue: undefined,
            itemCode: undefined,
            minValue: undefined,
            maxValue: undefined,
          },
        ],
      },
      loading: false,
      // 修复loading配置
      tableLoading: {
        spinning: false,
        tip: '数据加载中，请稍候...',
        delay: 300,
      },
      selectedRowKeys: [],
      selectName: "",
      selectRow: {},
      searchForm: {},
      manufacturerOptions: [
        { label: "华为", value: "华为" },
        { label: "TP-Link", value: "TP-Link" },
        { label: "锐捷", value: "锐捷" },
        { label: "新华三", value: "新华三" },
        { label: "思科", value: "思科" },
      ],

      // 动态列配置（从接口获取）
      tableHeader: [],
      columns: [],
      defaultVisibleColumns: [],
      visibleColumns: [],
      tableData: [],
      pagination: {
        total: 0,
        pageSize: 10,
        current: 1,
        pageSizeOptions: [5, 10, 20, 50],
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: (total, range) => `总计 ${total} 条`,
      },
      nameVisible: false,
      formVisible: false,
      isEditForm: false,
      formInitialData: {},
      exportModalVisible: false,
      settingModalVisible: false,
      deleteLoading: false,
      assertInfo: {
        modelId: undefined,
        assetTypeId: undefined,
        modelCode: undefined,
      },
      itemList: [],
      originItemList: [],
      isDestory: true,
      showAll: false,
      // 屏幕宽度状态
      isNarrowScreen: false,
      screenWidth: 0,
      // 分组相关（从接口获取）
      groupOptions: [],
      // 监控方式筛选选项
      monitorMethodOptions: [],
      addGroupModalVisible: false,
      groupForm: {
        selectedTags: [],
        targetRow: null,
        targetIds: []
      },
      groupSearchLoading: false,
      // 保存原始分组列表，用于搜索重置
      originGroupOptions: [],
      // 是否是批量添加分组模式
      isBatchAddGroup: false,
      monitorTypeList1:{
        0: this.$t('common.notMonitored'),
        1: 'SNMP',
        2: 'PING'
      },

    monitorTypeList3:{
        0: this.$t('common.notMonitored'),
        2: 'PING'
      },
    monitorTypeList2:{
        0: this.$t('common.notMonitored'),
        1: this.$t('common.monitored'),
     },      
    };
  },
  mounted() {
    if(this.$route.query && this.$route.query?.isFrom === 'product'){
      this.closeDevice = true
      setTimeout(() => {
        this.formVisible = true
      }, 3000);
    }
    let type = this.$route.path.split("/");

    // 初始化：获取模型并加载表头
    getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
      let dataList = res.data.list || [];
      dataList.forEach((item) => {
        if (type[type.length - 1] && type[type.length - 1] === item.modelCode) {
          this.queryParams.modelId = item.id;
          this.upload.url = "/admin-api/cqt/asset-info/import/" + item.id;
          this.assertInfo = {
            modelId: item.id,
            assetTypeId: item.assetTypeId,
            modelName: item.modelName,
            modelCode: item.modelCode,
          };
          this.getTableHead();
          this.getList();
          this.getModel();
          this.initMonitorTypeOptions(item.modelCode);
        }
      });
    });

    // 初始化获取分组列表
    this.loadGroupList();

    // 初始化屏幕宽度检测
    this.checkScreenWidth();
    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {

  },
  methods: {
    searchQuery(){
      this.pagination.current = 1
      this.pagination.pageSize = 10
      this.getList()
    },
    // 初始化监控方式选项（用于导入）
    initMonitorTypeOptions(modelCode) {
      getMonitorMethod({modelId: this.queryParams.modelId}).then((res) => {
         this.monitorTypeOptions = res.data.map(item =>{
          return {
            label: item.monitorMethodName,
            value: item.monitorMethod
          }
         })
      })
    },
    // 加载分组列表
    loadGroupList() {
      getAssetGroup().then((res) => {
        if (res.code === 0 && res.data && Array.isArray(res.data)) {
          this.groupOptions = res.data;
          this.originGroupOptions = [...res.data];
        }
      }).catch(() => {
        this.$message.error(this.$t('common.getGroupListFailed'));
      });
    },
    // 判断行是否可选择
    isRowSelectable(row) {
      return !(row?.dataSource && row?.dataSource === '资源同步');
    },
    changeType(val) {
      console.log(val);
    },
    /** 下载模板操作 */
    importTemplate() {
      if (!this.upload.monitorType) {
        this.$message.warning(this.$t('common.pleaseSelectMonitorMethod'));
        return;
      }
      let params = {
        modelId: this.queryParams.modelId,
        monitorMethod: this.upload.monitorType
      };
      impTemplate(params).then((response) => {
        this.$download.excel(response, this.$t('common.networkDevice.upload.templateName'));
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = this.$t('common.networkDevice.assetImport');
      this.upload.open = true;
      this.uploadFile = undefined;
    },
    changeShowAll() {
      this.showAll = !this.showAll;
      // 切换筛选条件显示状态后重新计算布局
      this.$nextTick(() => {
        this.checkScreenWidth();
      });
    },
    beforeUpload(file) {
      const fileName = file.name;
      const validExtensions = [".xls", ".xlsx"];
      const extension = "." + fileName.split(".").pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        this.$message.error(this.$t('common.uploadFileExtensionNotAllowed', { extension }));
        return false;
      }
      this.flag = '2';
      return true;
    },
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    handleFileChange(response, file, fileList) {
      this.uploadFile = file.raw || file;
      this.flag = '2';
    },
    handleExceed(files, fileList) {
      this.$message.error(this.$t('common.uploadMultipleFilesNotAllowed'));
    },
    handleFileSuccess(response, file, fileList) {
      this.uploadFile = undefined;
      if (response.code !== 0) {
        this.$modal.msgError({
          message: response.msg.replace(/\n/g, "<br>"),
          dangerouslyUseHTMLString: true,
        });
        this.upload.open = false;
        this.upload.isUploading = false;
        this.getList();
        this.$refs.upload.clearFiles();
        return;
      }
      this.flag = '1';
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      let data = response.data;
      this.$modal.msgSuccess(data);
      this.getList();
    },
    submitUpload() {
      if (this.flag === '2'){
        this.disabledBtn = true;
        let formData = new FormData();
        formData.append('file', this.uploadFile[0].raw);
        importAssetInfo(this.queryParams.modelId, formData)
          .then((res) => {
            if (res.code === 0) {
              this.disabledBtn = false;
              this.$message.success(res.data)
              this.cancel()
              // this.hideenPanle(res.data)
            }else{
              this.disabledBtn = false
              // this.$modal.msgError(res.msg)
            }
          })
          .catch((err) => {
            this.disabledBtn = false
          });
      }
    },
    submitFileForm() {
      console.log(this.uploadFile)
      if (!this.uploadFile) {
        this.$message.error(this.$t('common.pleaseSelectFileToUpload'));
        return;
      }
      this.submitUpload(this.uploadFile);
      // this.$refs.upload.submit();
    },
    cancel() {
      this.upload.open = false;
      this.uploadFile = undefined;
      this.$refs.upload.clearFiles();
      this.getList()
      this.flag = '1';
    },
    getModel() {
      this.itemList = [];
      getAssetModelDetail({ id: this.queryParams.modelId })
        .then((res) => {
          if (res.data?.items && res.data.items.length) {
            let staticName = ["name"];
            this.originItemList = res.data.items;
            this.itemList = res.data.items.filter(
              (item) => !staticName.includes(item.itemCode)
            );

            // 注入分组标签项到动态筛选列表
            const groupFilterItem = {
              id: "GROUP_FILTER",
              itemName: this.$t('common.groupTag'),
              itemCode: "groupIdList",
              itemDataType: "GROUP",
            };

            // 注入监控方式筛选项到动态筛选列表
            let monitorMethodOptions = [];
            if (this.assertInfo.modelCode === 'networkdevice' ||
                this.assertInfo.modelCode === 'storagedevice' ||
                this.assertInfo.modelCode === 'terminaldevice' || this.assertInfo.modelCode === 'securitydevice') {
                  if(this.assertInfo.modelCode === 'terminaldevice'){
                     monitorMethodOptions = [
                      { value: '0', label: this.$t('common.notMonitored') },
                      { value: '2', label: 'PING' }
                    ];
                  } else {
                      monitorMethodOptions = [
                      { value: '0', label: this.$t('common.notMonitored') },
                      { value: '1', label: 'SNMP' },
                      { value: '2', label: 'PING' }
                    ];
                  }

            } else {
              monitorMethodOptions = [
                { value: '0', label: this.$t('common.notMonitored') },
                { value: '1', label: this.$t('common.monitored') }
              ];
            }
            this.monitorMethodOptions = monitorMethodOptions;

            const monitorMethodFilterItem = {
              id: "MONITOR_METHOD_FILTER",
              itemName: this.$t('common.monitorMethod'),
              itemCode: "monitorMethod",
              itemDataType: "OPTIONAL",
            };

            this.originItemList.push(groupFilterItem, monitorMethodFilterItem);
            this.itemList.push(groupFilterItem, monitorMethodFilterItem);
          }
        })
        .catch(() => { });
    },
    addCondition() {
      this.queryParams.conditions.push({
        itemId: undefined,
        compareType: "like",
        itemValue: undefined,
        minValue: undefined,
        maxValue: undefined,
        itemCode: undefined
      });
    },
    removeCondition(index) {
      this.queryParams.conditions.splice(index, 1);
    },
    handleConditionChange(val, index) {
      const selectedItem = this.itemList.find((item) => item.id === val);
      if (selectedItem) {
        this.queryParams.conditions[index].itemCode = selectedItem.itemCode;
        this.queryParams.conditions[index].itemValue = '';
        // 分组标签参数初始化
        if (val === 'GROUP_FILTER') {
          this.queryParams.conditions[index].itemCode = 'groupIdList';
          this.queryParams.conditions[index].compareType = 'in';
        }
        // 监控方式筛选参数初始化
        if (val === 'MONITOR_METHOD_FILTER') {
          this.queryParams.conditions[index].itemCode = 'monitorMethod';
          this.queryParams.conditions[index].compareType = 'eq';
        }
      }
    },
    batchDelete() {
      // 过滤掉不可删除的行
      const deletableIds = this.selectedRowKeys.filter(id => {
        const row = this.tableData.find(item => item.id === id);
        return !(row?.dataSource && row?.dataSource === '资源同步');
      });

      if (deletableIds.length === 0) {
        this.$message.warning(this.$t('common.pleaseSelectAssetDataToDelete'));
        return;
      }

      const params = { ids: deletableIds };
      this.$confirm(this.$t('common.confirmDeleteSelectedRows'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      })
        .then((_) => {
          this.tableLoading = {
            spinning: true,
            tip: '批量删除中，请稍候...',
            delay: 0
          };
          return batchDeleteAssetInfo(params);
        })
        .then((res) => {
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.getList();
          } else {
            this.$message.error(this.$t('common.deleteFailed'));
          }
        })
        .catch(() => {
          this.tableLoading.spinning = false;
          this.$message({ type: "info", message: this.$t('common.operationCancelled') });
        });
    },
    // 批量下发方法
    handleBatchCreate() {
      // 过滤掉不可下发的行（资源同步数据）
      const validIds = this.selectedRowKeys.filter(id => {
        const row = this.tableData.find(item => item.id === id);
        return !(row?.dataSource && row?.dataSource === '资源同步');
      });

      if (validIds.length === 0) {
        this.$message.warning(this.$t('common.cannotBatchIssueResourceSyncData'));
        return;
      }

      // 显示下发中状态
      this.tableLoading = {
        spinning: true,
        tip: '批量下发中，请稍候...',
        delay: 0
      };

      // 构造参数 {ids: [1,2,3]}
      const params = { ids: validIds };
      batchCreate(params)
        .then((res) => {
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.batchIssueSuccess'));
            setTimeout(() => this.getList(), 1000);
          } else {
            this.$message.error(res.msg || this.$t('common.batchIssueFailed'));
            setTimeout(() => this.getList(), 1000);
          }
        })
        .catch(() => {
          this.tableLoading.spinning = false;
          this.$message.error(this.$t('common.batchIssueFailed'));
          setTimeout(() => this.getList(), 1000);
        });
    },
    getTableHead() {
      this.tableHeader = [];
      this.tableLoad = true;
      this.tableLoading = {
        spinning: true,
        tip: '加载表头中...',
        delay: 300
      };
      this.queryParams.status = 1;
      getTableHeadInfo(this.queryParams).then((res) => {
        this.tableLoading.spinning = false;
        let resData = res.data || [];
        // 构建表头配置
        resData.forEach((item) => {
          if (
            item.filed !== "assetName" &&
            item.filed !== "assetTypeName" &&
            item.filed !== "modelName" &&
            item.filed !== "createTime" &&
            item.status === 1
          ) {
            // 根据屏幕宽度动态设置列宽
            const baseWidth = this.isNarrowScreen ? 100 : 120;
            this.tableHeader.push({
              dataIndex: item.filed,
              key: item.filed,
              title: item.name,
              width: item.filed === "name" ? (this.isNarrowScreen ? 150 : 180) : baseWidth,
            });
          }
        });
        if(this.assertInfo.modelCode !== 'ztkeeper'){
        // 添加固定列
        this.tableHeader.push(
          {
          dataIndex: "groupTags",
          key: "groupTags",
          title: this.$t('common.groupTag'),
          width: 220
          },
          // {
          //   dataIndex: "monitorMethod",
          //   key: "monitorMethod",
          //   title: this.$t('common.monitorMethod'),
          //   width: 60,
          // },
          {
            dataIndex: "onlineStatus",
            key: "onlineStatus",
            title: this.$t('common.monitorStatus.title'),
            width: 140,
          },
          {
            dataIndex: "snmpStatus",
            key: "snmpStatus",
            title: this.$t('common.issueStatus'),
            width: 140,
          },
          {
            dataIndex: "createTime",
            key: "createTime",
            title: this.$t('common.createTime'),
            width: this.isNarrowScreen ? 150 : 180,
          },
          {
            dataIndex: "operation",
            key: "operation",
            title: this.$t('common.operation'),
          }
        );
        } else {
                  // 添加固定列
        this.tableHeader.push(
          {
          dataIndex: "groupTags",
          key: "groupTags",
          title: this.$t('common.groupTag'),
           },
          {
            dataIndex: "onlineStatus",
            key: "onlineStatus",
            title: this.$t('common.monitorStatus.title'),
            width: 100,
          },
          {
            dataIndex: "createTime",
            key: "createTime",
            title: this.$t('common.createTime'),
            width: this.isNarrowScreen ? 150 : 180,
          },
          {
            dataIndex: "operation",
            key: "operation",
            title: this.$t('common.operation'),
          }
        );
        }
        this.tableLoad = false;
      }).catch(() => {
        this.tableLoading.spinning = false;
      });
    },
    // 检查屏幕宽度并设置状态
    checkScreenWidth() {
      this.screenWidth = window.innerWidth;
      this.isNarrowScreen = this.screenWidth < 1366;

      // 如果表格已加载，重新设置列宽
      if (this.tableHeader.length > 0) {
        this.adjustColumnWidths();
      }
    },
    // 根据屏幕宽度调整列宽
    adjustColumnWidths() {
      const baseWidth = this.isNarrowScreen ? 100 : 120;
      this.tableHeader.forEach(col => {
        if (col.dataIndex === 'name') {
          col.width = this.isNarrowScreen ? 150 : 180;
        } else if (col.dataIndex === 'groupTags') {
          col.width = 220;
        } else {
          col.width = baseWidth;
        }
      });
    },
    // 窗口大小变化处理
    handleResize() {
      this.checkScreenWidth();
    },
    cellCfgClose(type) {
      this.settingModalVisible = false;
      if (type === "submit") {
        this.getTableHead();
      }
    },
    updateTableColumns() {
      this.columns = [
        ...this.visibleColumns,
        this.tableHeader.find((col) => col.dataIndex === "operation"),
      ].filter(Boolean);
    },
    onClose() {
      this.nameVisible = false;
      setTimeout(() => {
        this.isDestory = false;
      }, 500);
      setTimeout(() => {
        this.isDestory = true;
      }, 800);
    },
    selectShow(row) {
      this.nameVisible = true;
      this.selectName = row.name;
      this.selectRow = row;
    },
    filterItemCode(value) {
      let code = "";
      this.originItemList.forEach((item) => {
        if (item.itemCode === value) {
          code = item.id;
        }
      });
      return code;
    },
    getList() {
      // 立即触发加载状态
      this.tableLoading = {
        spinning: true,
        tip: '数据加载中，请稍候...',
        delay: 300
      };

      let params = {
        ...this.queryParams,
        pageNo: this.pagination.current,
        pageSize: this.pagination.pageSize,
        onlineStatus: this.searchForm.onlineStatus || undefined,
        snmpStatus: this.searchForm.snmpStatus || undefined,
        modelCode: this.assertInfo.modelCode,
        isMonitorAble: true, // 与 groupIdList 同级
        groupIdList: [], // 初始化分组ID数组（最外层）
        monitorMethod: undefined, // 初始化监控方式
      };
      let conditionsArray = [];
      let groupIdList = []; // 临时存储分组ID
      let monitorMethodValue; // 临时存储监控方式值

      // 遍历动态条件，分离分组标签、监控方式筛选和普通筛选
      params.conditions.forEach((item) => {
        if (item.itemId) {
          // 提取分组标签的groupIdList
          if (item.itemId === 'GROUP_FILTER' && item.itemValue && Array.isArray(item.itemValue)) {
            groupIdList = item.itemValue; // 获取分组ID数组
          }
          // 提取监控方式筛选的monitorMethod
          else if (item.itemId === 'MONITOR_METHOD_FILTER' ) {
            monitorMethodValue = item.itemValue; // 获取监控方式值
          } else {
            // 普通筛选条件存入conditionsArray
            conditionsArray.push(item);
          }
        }
      });

      // 固定名称筛选（原有逻辑，保持不变）
      if (this.queryForms.name && this.queryForms.name !== "") {
        conditionsArray.push({
          itemValue: this.queryForms.name,
          compareType: "like",
          itemId: this.filterItemCode("name") || "",
        });
      }

      if (this.queryForms.port && this.queryForms.port !== "") {
        conditionsArray.push({
          itemValue: this.queryForms.port,
          compareType: "like",
          itemId: this.filterItemCode("port") || "",
        });
      }

      // ========== 核心修改：将groupIdList和monitorMethod挂载到params最外层 ==========
      params.groupIdList = groupIdList;
      params.monitorMethod = monitorMethodValue;
      // 更新conditions数组（移除分组标签项和监控方式筛选项，仅保留普通筛选条件）
      params.conditions = JSON.parse(JSON.stringify(conditionsArray));

      getAssetInfoPage(params).then((res) => {
        // 关闭加载状态
        this.tableLoading.spinning = false;
        this.tableData = res.data?.list || [];
        this.pagination.total = res.data?.total || 0;
        // 处理表格数据格式 + 初始化分组
        this.tableData.forEach((item) => {
          // 初始化分组标签（如果没有则为空数组）
          item.groupTags = []
          if (!item.assetGroupList) {
            item.groupTags = [];
          } else {
            item.assetGroupList.forEach(it => {
              item.groupTags.push(it.name)
            })
          }
          // 处理资产属性
          if (item.assetAttribute && Object.entries(item.assetAttribute).length > 0) {
            Object.entries(item.assetAttribute).forEach(([key, value]) => {
              if (key.includes('asset_optional_')) {
                const dict = getDictDatas(key)?.find(d => d.value === value);
                item[key] = dict?.label || value;
              } else {
                item[key] = value;
              }
            });
          }
          // 处理SNMP响应数据
          if (item.assetSnmpResp && Object.entries(item.assetSnmpResp).length > 0) {
            Object.entries(item.assetSnmpResp).forEach(([key, value]) => {
              if (key !== "id") item[key] = value;
            });
          }
        });
      }).catch(() => {
        // 错误时关闭加载状态
        this.tableLoading.spinning = false;
      });
    },
    handleReset() {
      this.queryForms = { name: undefined, ip: "", port: "", dType: " " };
      this.searchForm = { onlineStatus: undefined, snmpStatus: undefined };
      this.queryParams.conditions = [
        {
          itemId: undefined,
          compareType: "like",
          itemValue: undefined,
          itemCode: undefined,
          minValue: undefined,
          maxValue: undefined,
        },
      ];
      this.pagination.current = 1;
      this.getList();
    },
    handlePageChange(page) {
      this.pagination.current = page;
      this.getList();
    },
    onShowSizeChange(current, pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.current = 1;
      this.getList();
    },
    handleCreate() {
      this.closeDevice = true
      setTimeout(() => {
        this.formVisible = true;
        this.isEditForm = false;
        this.formInitialData = {};
      }, 100);
    },
    handleMoreOperation(record, key) {
      if (key === "edit") {
        this.closeDevice = true
        setTimeout(() => {
          this.formVisible = true;
          this.isEditForm = true;
          this.formInitialData = record;
        },100)
      } else if (key === "view") {
        this.selectShow(record);
      } else if (key === "delete") {
        this.handleDelete(record);
      } else if (key === "issue") {
        this.handlEissue(record);
      }
    },
    handlEissue(record) {
      // 显示下发中状态
      this.tableLoading = {
        spinning: true,
        tip: this.$t('common.issuingPleaseWait'),
        delay: 0
      };
      issue({ id: record.id }).then((res) => {
        // 关闭加载状态
        this.tableLoading.spinning = false;
        if (res.data) {
          this.$modal.msgSuccess(this.$t('common.issueSuccess'));
          setTimeout(() => this.getList(), 1000);
        } else {
          setTimeout(() => this.getList(), 1000);
          this.$message.error(res.msg);
        }
      }).catch(() => {
        // 错误时关闭加载状态
        this.tableLoading.spinning = false;
        setTimeout(() => this.getList(), 1000);
        // this.$message.error(this.$t('common.issueFailed'));
      });
    },
    handleDelete(row) {
      if (row?.dataSource && row?.dataSource === '资源同步') {
        this.$message.warning(this.$t('common.resourceSyncDataCannotBeDeleted'));
        return;
      }

      const ids = row.id;
      this.$confirm(this.$t('common.confirmDeleteResourceData'), this.$t('common.systemPrompt'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      })
        .then((_) => {
          // 显示删除中状态
          this.tableLoading = {
            spinning: true,
            tip: this.$t('common.deletingPleaseWait'),
            delay: 0
          };
          return deleteAssetInfo({ id: ids });
        })
        .then((res) => {
          // 关闭加载状态
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.deleteSuccess'));
            this.getList();
          } else {
            this.$message.error(this.$t('common.deleteFailed'));
          }
        })
        .catch(() => {
          // 取消或错误时关闭加载状态
          this.tableLoading.spinning = false;
          this.$message({ type: "info", message: this.$t('common.operationCancelled') });
        });
    },
    handleCreateDevice() {
      this.$message.success(this.$t('common.deviceCreateSuccess'));
      this.formVisible = false;
      setTimeout(() => {
        this.closeDevice = false
      }, 500);
      this.getList();
    },
    closeDeviceForm(){
      this.formVisible = false;
      setTimeout(() => {
        this.closeDevice = false
      }, 500);
    },
    handleUpdateDevice() {
      this.$message.success(this.$t('common.deviceEditSuccess'));
      this.getList();
      this.formVisible = false;
      setTimeout(() => {
        this.closeDevice = false
      }, 500);
    },
    handleUploadExcel(formData) {
      this.$message.success(this.$t('common.fileUploadSuccess'));
      this.getList();
    },
    handleBatchOperation({ key }) {
      if (key === "batchDelete") {
        // 检查是否有选中的可删除行
        const deletableRows = this.selectedRowKeys.filter(id => {
          const row = this.tableData.find(item => item.id === id);
          return !(row?.dataSource && row?.dataSource === '资源同步');
        });

        if (deletableRows.length === 0) {
          this.$message.warning(this.$t('common.pleaseSelectAssetDataToDelete'));
          return;
        }

        this.batchDelete();
      } else if (key === 'batchImport') {
        this.handleImport();
      } else if (key === 'batchAddGroup') {
        // 批量添加分组
        if (this.selectedRowKeys.length === 0) {
          this.$message.warning(this.$t('common.pleaseSelectAssetsToAddGroup'));
          return;
        }
        this.isBatchAddGroup = true;
        this.groupForm.targetIds = this.selectedRowKeys;
        this.groupForm.selectedTags = [];
        this.addGroupModalVisible = true;
      } else if (key === 'batchClearGroup') {
        this.groupForm.targetIds = this.selectedRowKeys;
        // 批量清空分组
        if (this.selectedRowKeys.length === 0) {
          this.$message.warning(this.$t('common.pleaseSelectAssetsToClearGroup'));
          return;
        }
        this.$confirm(this.$t('common.confirmClearAllGroups'), this.$t('common.tip'), {
          type: 'warning',
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel')
        }).then(() => {
        addAssetGroups({
          groupIdList: [],
          assetIdList: this.groupForm.targetIds
        }).then((res) => {
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.clearGroupSuccess'));
            this.getList();
          } else {
            this.$message.error(res.msg || this.$t('common.clearGroupFailed'));
          }
        }).catch(() => {
          this.tableLoading.spinning = false;
          this.$message.error(this.$t('common.clearGroupFailed'));
        });
        });
      } else if (key === 'batchCreate') {
        this.handleBatchCreate();
      }
    },
  // 获取项目的数据类型
  getItemDataType(itemId) {
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
         if (item.itemDataType == "OPTIONAL" && itemId == item.id) {
          type = "OPTIONAL";
          break;
        }
      }
      return type;
  },
    handleExport() {
      
       this.$confirm(this.$t('common.confirmExportAssetInfo'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
          let params = {
            ...this.queryParams,
            onlineStatus: this.searchForm.onlineStatus || undefined,
            snmpStatus: this.searchForm.snmpStatus || undefined,
            isMonitorAble: true, // 与 groupIdList 同级
            groupIdList: [], // 初始化分组ID数组（最外层）
            monitorMethod: undefined, // 初始化监控方式
          };
          let conditionsArray = [];
          let groupIdList = []; // 临时存储分组ID
          let monitorMethodValue; // 临时存储监控方式值

          // 遍历动态条件，分离分组标签、监控方式筛选和普通筛选
          params.conditions.forEach((item) => {
            if (item.itemId) {
              // 提取分组标签的groupIdList
              if (item.itemId === 'GROUP_FILTER' && item.itemValue && Array.isArray(item.itemValue)) {
                groupIdList = item.itemValue;
              }
              // 提取监控方式筛选的monitorMethod
              else if (item.itemId === 'MONITOR_METHOD_FILTER' ) {
                monitorMethodValue = item.itemValue;
              } else {
                conditionsArray.push(item);
              }
            }
          });

          // 固定名称筛选（原有逻辑，保持不变）
          if (this.queryForms.name !== "") {
            conditionsArray.push({
              itemValue: this.queryForms.name,
              compareType: "like",
              itemId: this.filterItemCode("name") || "",
            });
          }

          if (this.queryForms.port !== "") {
            conditionsArray.push({
              itemValue: this.queryForms.port,
              compareType: "like",
              itemId: this.filterItemCode("port") || "",
            });
          }

          // ========== 核心修改：将groupIdList和monitorMethod挂载到params最外层 ==========
          params.groupIdList = groupIdList;
          params.monitorMethod = monitorMethodValue;
          // 更新conditions数组（移除分组标签项和监控方式筛选项）
          params.conditions = JSON.parse(JSON.stringify(conditionsArray));

          this.exportLoading = true;
          return exportAssetInfo(params);
        })
        .then((response) => {
          this.$download.excel(response, this.$t('common.assetInformationListData') + '.xls');
          this.exportLoading = false;
        })
        .catch(() => {
          this.exportLoading = false;
        });
    },
    handleExportCancel() {
      this.exportModalVisible = false;
    },
    handleExportConfirm(data) {
      const { fields, fieldLabels, range } = data;
      console.log("导出字段：", fieldLabels);
      console.log("导出范围：", range === "all" ? "全部" : "筛选");
      this.$message.success(this.$t('common.exportRequestSent'));
      this.exportModalVisible = false;
    },
    handleSetting() {
      this.settingModalVisible = true;
    },
    handleSettingCancel() {
      this.settingModalVisible = false;
    },
    handleSettingConfirm(visibleColumns) {
      this.visibleColumns = visibleColumns;
      this.updateTableColumns();
      this.settingModalVisible = false;
    },
    handleTableChange(pagination) {
      this.pagination.current = pagination.current;
      this.pagination.pageSize = pagination.pageSize;
      this.getList();
    },
    handleSync(record) {
      this.$message.info(this.$t('common.startSyncDevice', { name: record.name }));
    },
    getStatusColor(status) {
      switch (status) {
        case 1: return "success";
        case 2: return "warning";
        case 3: return "danger";
        default: return "info";
      }
    },
    getSnmpStatusColor(status) {
      switch (status) {
        case 2: return "success";
        case 1: return "info";
        case 3: return "danger";
        default: return "info";
      }
    },
    getSnmpStatusText(status) {
      const statusMap = {
        0: this.$t('common.snmpStatus.notIssued'),
        1: this.$t('common.snmpStatus.issuing'),
        2: this.$t('common.snmpStatus.issuedSuccess'),
        3: this.$t('common.snmpStatus.issuedFailed'),
      };
      return statusMap[status] || this.$t('common.snmpStatus.notIssued');
    },
    getStatusText(status) {
      const statusMap = {
        1: this.$t('common.monitorStatus.normal'),
        0: this.$t('common.monitorStatus.notMonitored'),
        2: this.$t('common.monitorStatus.warning'),
        3: this.$t('common.monitorStatus.exception'),
      };
      return statusMap[status] || this.$t('common.monitorStatus.exception');
    },
    onSelectChange(selection) {
      // 只保留可选择的行
      const validSelection = selection.filter(item => !(item?.dataSource && item?.dataSource === '资源同步'));
      this.selectedRowKeys = validSelection.map(row => row.id);
    },
    // 分组相关方法
    openAddGroupModal(row) {
      // 单个资产添加分组
      this.isBatchAddGroup = false;
      this.groupForm.targetRow = row;
      this.groupForm.targetIds = [];

      this.groupForm.selectedTags = [];
      row.groupTags.forEach(item => {
        this.groupOptions.forEach(gItem =>{
          if(gItem.name === item)this.groupForm.selectedTags.push(gItem.id)
        })
      })
      this.addGroupModalVisible = true;
    },
    remoteSearchGroup(query) {
      // 分组模糊搜索
      this.groupSearchLoading = true;
      setTimeout(() => {
        this.groupSearchLoading = false;
        if (query) {
          this.groupOptions = this.originGroupOptions.filter(tag =>
            tag.name.toLowerCase().includes(query.toLowerCase())
          );
        } else {
          this.groupOptions = [...this.originGroupOptions];
        }
      }, 300);
    },
    // 处理分组选择变化
    handleGroupSelectChange() {
      //...
    },
    // 确认添加分组
    confirmAddGroup() {
      if (this.groupForm.selectedTags.length === 0) {
        this.$message.warning(this.$t('common.pleaseSelectGroupTag'));
        return;
      }

      // 显示加载状态
      this.tableLoading = {
        spinning: true,
        tip: '添加分组中，请稍候...',
        delay: 0
      };

      if (this.isBatchAddGroup) {
        // 批量添加分组
        const groupIdList = this.groupForm.selectedTags;
        const assetIdList = this.groupForm.targetIds;

        addAssetGroups({
          groupIdList: groupIdList,
          assetIdList: assetIdList
        }).then((res) => {
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.batchAddGroupSuccess'));
            this.addGroupModalVisible = false;
            this.isBatchAddGroup = false;
            this.getList();
          } else {
            this.$message.error(res.msg || this.$t('common.batchAddGroupFailed'));
          }
        }).catch(() => {
          this.tableLoading.spinning = false;
          this.$message.error(this.$t('common.batchAddGroupFailed'));
        });
      } else {
        // 单个添加分组
        const assertId = this.groupForm.targetRow.id;
        const groupIdList = this.groupForm.selectedTags;

        addAssetGroups({
          assetId: assertId,
          groupIdList: groupIdList
        }).then((res) => {
          this.tableLoading.spinning = false;
          if (res.code === 0) {
            this.$message.success(this.$t('common.addGroupSuccess'));
            // 更新前端显示
            const newGroupNames = groupIdList.map(id => {
              const group = this.originGroupOptions.find(g => g.id === id);
              return group ? group.name : '';
            }).filter(name => name);

            this.groupForm.targetRow.groupTags = [
              ...new Set([...this.groupForm.targetRow.groupTags, ...newGroupNames])
            ];

            this.addGroupModalVisible = false;
            this.getList();
          } else {
            this.$message.error(res.msg || this.$t('common.addGroupFailed'));
          }
        }).catch(() => {
          this.tableLoading.spinning = false;
          this.$message.error(this.$t('common.addGroupFailed'));
        });
      }
    }
  },
  computed: {
    onlineStatusOptions() {
      return [
        { value: "0", label: this.$t('common.monitorStatus.notMonitored') },
        { value: "1", label: this.$t('common.monitorStatus.normal') },
        { value: "2", label: this.$t('common.monitorStatus.warning') },
        { value: "3", label: this.$t('common.monitorStatus.exception') },
      ];
    },
    snmpStatusOptions() {
      return [
        { value: "0", label: this.$t('common.snmpStatus.notIssued') },
        { value: "2", label: this.$t('common.snmpStatus.issuedSuccess') },
        { value: "3", label: this.$t('common.snmpStatus.issuedFailed') },
      ];
    }
  },
};
</script>

<style scoped lang="less">
.monitor-container {
  padding: 4px;
  background: #fff;
  min-height: 69vh;
  height: 90vh;
  width: 100%;
  overflow-x: auto;
}

.search-card {
  margin-bottom: 16px;

  /deep/ .ant-form-item {
    margin-bottom: 16px;
  }

  @media (max-width: 1200px) {
    /deep/ .ant-form-item {
      display: flex;
      width: 100%;
      margin-right: 0;
    }

    /deep/ .ant-form-item-label {
      width: 80px;
      text-align: left;
    }

    /deep/ .ant-form-item-control-wrapper {
      flex: 1;
    }
  }
}

.operation-card {
  margin-bottom: 16px;

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    .left-operations {
      display: flex;
      gap: 8px;
    }

    .right-operations {
      display: flex;
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;

      .right-operations {
        margin-top: 12px;
      }
    }
  }
}

.status-tag {
  margin-right: 0;
  min-width: 50px;
  text-align: center;
}

.group-tag {
  margin-bottom: 4px;
}

.table-container {
  width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
}

/deep/ .ant-table {
  .ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
  }

  .ant-table-tbody>tr:hover>td {
    background: #e6f7ff;
  }
}

/deep/ .ant-pagination {
  margin-top: 16px;

  @media (max-width: 576px) {

    .ant-pagination-item,
    .ant-pagination-prev,
    .ant-pagination-next,
    .ant-pagination-jump-prev,
    .ant-pagination-jump-next {
      margin-bottom: 8px;
    }
  }
}

/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
}

.pagination {
  text-align: right;
  margin-top: 16px;
}

/deep/ .ant-table-body {
  overflow-x: auto;
}

/deep/ .ant-card-body {
  max-height: 88vh;
  overflow-y: auto;
}

/deep/ .ant-table-tbody>tr>td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

::v-deep .el-icon-question {
  color: #1890ff;
}

/* 分组标签容器样式：一行展示，去除底部边距 */
.group-tags-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  overflow: hidden;
}

/* 优化表格单元格样式，使其内容更紧凑 */
/deep/ .el-table-column {
  &.is-leaf {
    padding: 0 8px; /* 减少内边距 */
  }
}

/* 表格自适应样式 */
/deep/ .el-table {
  width: 100% !important;
  table-layout: auto !important; /* 自动列宽 */
}

/* 固定表格行高度为32px */
/deep/ .el-table__row {
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
}

/* 固定表格单元格高度和行高 */
/deep/ .el-table__row > td {
  height: 48px !important;
  line-height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  padding: 0 8px !important;
}

/* 固定表格头部高度 */
/deep/ .el-table__header-wrapper .el-table__row {
  height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
}

/deep/ .el-table__header-wrapper .el-table__row > th {
  height: 48px !important;
  line-height: 48px !important;
  min-height: 48px !important;
  max-height: 48px !important;
  padding: 0 8px !important;
}

/* 优化loading样式 */
::v-deep .el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
}

::v-deep .el-loading-spinner {
  top: 40%; /* 调整loading位置 */
}

::v-deep .el-loading-text {
  color: #1890ff; /* 加载文本颜色 */
  font-size: 14px;
  margin-top: 16px;
}

/* 窄屏幕适配 */
@media (max-width: 1366px) {
  /deep/ .el-table-column {
    &.is-leaf {
      padding: 0 4px; /* 更窄的内边距 */
    }
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;

    .left-operations, .right-operations {
      width: 100%;
      margin-bottom: 8px;
    }
  }
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .monitor-container {
    height: auto;
    min-height: 100vh;
  }

  .operation-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .left-operations, .right-operations {
    width: 100%;
    flex-wrap: wrap;
  }

  .pagination {
    text-align: center;
  }
}

/* 资源同步行样式 */
::v-deep .el-table__row[data-source="资源同步"] {
  background-color: #f5f5f5;

  .el-checkbox {
    cursor: not-allowed;

    .el-checkbox__inner {
      background-color: #f5f5f5;
      border-color: #dcdcdc;
    }
  }

  .el-button--text:disabled {
    color: #ccc;
    cursor: not-allowed;
  }
}
/* 1. 给固定列添加背景色，避免透显左侧文字 */
::v-deep .el-table__fixed-right {
  background-color: #fff !important;
  /* 修复固定列边框衔接问题 */
  border-left: 1px solid #ebeef5 !important;
}
</style>
