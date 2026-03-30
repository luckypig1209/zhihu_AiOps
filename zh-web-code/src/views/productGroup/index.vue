<template>
  <div class="task-manage">
    <!-- 条件查询区域 -->
    <div style="border-bottom: 1px solid #eee;margin-bottom: 10px;">
      <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="font-size: 16px !important;">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item >
              <a-input v-model="searchForm.name" :placeholder="$t('productGroup.pleaseEnterName')" allowClear style="width: 100%;" />
            </a-form-item>
          </a-col>

          <a-col :span="8" style="display: flex; align-items: center;padding-top: 3px;">
            <a-button type="primary" ghost @click="handleSearch">{{ $t('productGroup.query') }}</a-button>
            <a-button type="primary" ghost style="margin-left: 12px;" @click="handleReset">{{ $t('productGroup.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="operation-card">
      <div class="operation-bar">
        <div class="left-operations">
          <a-button type="primary" ghost @click="openGroupModal()">
            <a-icon type="plus" />{{ $t('productGroup.addGroup') }}
          </a-button>
        </div>
      </div>
    </div>

    <a-table style="margin-top: 10px;" :columns="columns" :data-source="tableData" :pagination="false"
      :loading="loading" bordered size="middle"
      :locale="{
        emptyText: $t('common.noData')
      }"
      class="table-auto-scroll"
    >
      <template slot="name" slot-scope="text">
        {{ text }}
      </template>

      <template slot="assetCount" slot-scope="text, record">
        <a style="color: #1890ff; cursor: pointer;" @click="openResourceModal(record)">
          {{ text }}
        </a>
      </template>

      <template slot="operation" slot-scope="text, record">
        <div class="table-row-actions">
          <a @click="openGroupModal(record)">{{ $t('productGroup.edit') }}</a>
          <a @click="handleDelete(record)">{{ $t('productGroup.delete') }}</a>
        </div>
      </template>
    </a-table>

    <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
      :show-total="total => `${$t('productGroup.total')} ${total} ${$t('productGroup.records')}`" :page-size-options="['10', '20', '50', '100']" show-size-changer
      @change="handlePageChange" @showSizeChange="onShowSizeChange">
    </a-pagination>

    <a-modal
      :title="resoureTitle"
      v-model="resourceModalVisible"
      :width="1000"
      @cancel="handleResourceModalCancel"
      :mask-closable="false"
    >
      <a-form 
        layout="inline"  
        style="margin-bottom: 10px; align-items: center;"  
      >
        <a-form-item 
          
          :label-col="{ span: 0 }"  
          :wrapper-col="{ span: 24 }"  
          style="margin-right: 16px;"  
        >
          <a-input 
            v-model="resourceSearchForm.name" 
            :placeholder="$t('productGroup.pleaseEnterName')" 
            allowClear 
            style="width: 160px;" 
          />
        </a-form-item>
        
        <a-form-item 
        
          :label-col="{ span: 0 }"
          :wrapper-col="{ span: 24 }"
           style="width: 160px;"
        >
           <a-select v-model:value="resourceSearchForm.model" :options="modelList"
                                :placeholder="$t('productGroup.pleaseSelectResourceModel')" allowClear style="width: 100%;" :not-found-content="$t('common.noData')" />
        </a-form-item>
        
        <a-form-item 
        
          :label-col="{ span: 0 }"
          :wrapper-col="{ span: 24 }"
          style="margin-right: 16px"
        >
          <a-input 
            v-model="resourceSearchForm.ip" 
            :placeholder="$t('productGroup.pleaseEnterIP')" 
            allowClear 
            style="width: 160px;"
          />
        </a-form-item>
        
        <a-form-item  style="margin-left: 10px;">
          <a-button type="primary" ghost @click="searchResource" >{{ $t('productGroup.query') }}</a-button>
          <a-button type="primary" ghost style="margin-left: 12px;" @click="resetResourceSearch">{{ $t('productGroup.reset') }}</a-button>
        </a-form-item>
      </a-form>

      <a-button type="primary" ghost style="margin-bottom: 10px;" @click="batchRemoveResource" :disabled="selectedResourceIds.length === 0 || resourceLoading">
        {{ $t('productGroup.batchRemove') }}
      </a-button>

      <a-table
        :columns="resourceColumns"
        :data-source="filteredResourceList"
        :pagination="false"
        bordered
        size="small"
        row-key="id"
        :row-selection="{
          selectedRowKeys: selectedResourceIds,
          onChange: handleResourceSelectChange,
          disabled: resourceLoading
        }"
        :loading="resourceLoading"
        :locale="{
          emptyText: $t('common.noData')
        }"
      >
        <template slot="operation" slot-scope="text, record">
          <a @click="removeResource(record)" :disabled="resourceLoading">{{ $t('productGroup.remove') }}</a>
        </template>
      </a-table>

      <div style="text-align: right; margin-top: 10px;">
        <a-pagination
          :current="resourceCurrentPage"
          :page-size="resourcePageSize"
          :total="resourceTotal"
          :show-total="total => `${$t('productGroup.total')} ${total} ${$t('productGroup.records')}`"
          @change="handleResourcePageChange"
          @showSizeChange="handleResourceSizeChange"
        />
      </div>

      <template slot="footer">
        <a-button @click="handleResourceModalCancel">{{ $t('productGroup.cancel') }}</a-button>
        <a-button type="primary" @click="handleResourceSave" :loading="resourceSaving">{{ $t('productGroup.save') }}</a-button>
      </template>
    </a-modal>

    <el-dialog
      :title="groupModalTitle"
      :visible.sync="groupModalVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form 
        ref="groupFormRef"
        :model="groupForm" 
        :rules="groupRules"
        label-width="130px"
      >
        <el-form-item 
          :label="$t('productGroup.groupTagName')" 
          prop="groupName"
        >
          <el-input 
            v-model="groupForm.groupName" 
            :placeholder="$t('productGroup.pleaseEnterGroupTagName')" 
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="groupModalVisible = false">{{ $t('productGroup.cancel') }}</el-button>
        <el-button type="primary" @click="confirmGroupOperate">{{ $t('productGroup.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import {
  getAssetGroupList,// 分组列表
  createassetGroup, // 新增资产分组
  updateassetGroup, // 更新资产分组
  deleteassetGroup, // 资产分组删除
  getAssetPage, // 资产分组关联资产列表（POST接口）
  saveAsset //保存资产到分组
} from '@/api/assetGroup'
import { getAssetModelPage, 
 } from "@/api/resource";
// 资源模型选项（实际项目中建议从接口获取）
const RESOURCE_MODEL_OPTIONS = ['5B', '6B', '8B', '10B']

export default {
  name: 'TaskManage',
  data() {
    return {
      resoureTitle:'',
      // 分组列表相关（适配接口字段）
      searchForm: { 
        name: '', // 对应接口的name参数（原taskName）
        pageNo: 1,
        pageSize: 10
      },
      tableData: [], // 存储接口返回的分组列表
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 资源弹框相关
      resourceModalVisible: false,
      resourceLoading: false, // 资源列表加载状态
      resourceSaving: false, // 保存操作加载状态
      currentGroup: null, // 当前打开弹框的分组
      originResourceList: [], // 原始资源列表（用于计算需要保留的资产）
      filteredResourceList: [], // 接口返回的资源列表（已分页）
      resourceSearchForm: { 
        name: '', // 资产名称搜索（对应接口的assetName）
        model: undefined, // 资源模型（接口可能未使用，保留筛选）
        ip: '' // IP搜索（接口可能未使用，保留本地筛选）
      },
      resourceModelOptions: RESOURCE_MODEL_OPTIONS,
      resourceCurrentPage: 1, // 资源列表当前页
      resourcePageSize: 10, // 资源列表每页条数
      resourceTotal: 0, // 资源列表总条数（接口返回）
      selectedResourceIds: [], // 选中的资源ID（用于批量移除）
      removedResourceIds: [], // 记录被移除的资源ID
      modelList:[],
      // 新增/编辑分组共用弹框相关
      groupModalVisible: false,
      currentEditGroup: null, // 当前编辑的分组（null表示新增）
      groupForm: {}, // 初始化空对象，避免undefined
      groupRules: {
        groupName: [
          { required: true, message: this.$t('productGroup.pleaseEnterGroupTagName'), trigger: 'blur' },
          { min: 1, max: 30, message: this.$t('productGroup.groupNameLengthLimit'), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 分组列表列配置（适配接口返回字段）
    columns() {
      return [
        {
          title: this.$t('productGroup.name'),
          dataIndex: 'name',
          key: 'name',
          width: '15%',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('productGroup.assetCount'),
          dataIndex: 'assetCount',
          key: 'assetCount',
          width: '20%',
          scopedSlots: { customRender: 'assetCount' }
        },
        {
          title: this.$t('productGroup.creator'),
          dataIndex: 'creatorName',
          key: 'creatorName',
          width: '15%'
        },
        {
          title: this.$t('productGroup.createTime'),
          dataIndex: 'createTime',
          key: 'createTime',
          width: '25%',
          customRender: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
        {
          title: this.$t('productGroup.operation'),
          key: 'operation',
          width: '25%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    // 资源列表列配置（适配接口返回字段）
    resourceColumns() {
      return [
        { title: this.$t('productGroup.name'), dataIndex: 'assetName', key: 'assetName', width: '20%' },
        { title: this.$t('productGroup.resourceModel'), dataIndex: 'modelName', key: 'modelName', width: '20%', customRender: (text) => text || '-' },
        { title: this.$t('productGroup.deviceType'), dataIndex: 'deviceTypeName', key: 'deviceTypeName', width: '20%', customRender: (text) => text || '-' },
        { title: this.$t('productGroup.ip'), dataIndex: 'ip', key: 'ip', width: '20%', customRender: (text) => text || '-' },
        {
          title: this.$t('productGroup.operation'),
          key: 'operation',
          width: '20%',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    // 弹框标题：根据当前状态动态切换
    groupModalTitle() {
      return this.currentEditGroup ? this.$t('productGroup.editAssetGroup') : this.$t('productGroup.addAssetGroup')
    },
    // 计算需要保留的资产ID列表（原始列表 - 移除列表）
    remainAssetIds() {
      if (!this.originResourceList || this.originResourceList.length === 0) return []
      // 获取原始所有资产ID
      const originIds = this.originResourceList.map(item => item.id)
      // 过滤掉被移除的ID
      return originIds.filter(id => !this.removedResourceIds.includes(id))
    }
  },
  mounted() {
    // 页面加载时调用真实接口获取分组列表
    this.fetchAssetGroupList()
    this.getModelList()
  },
  methods: {
    getModelList() {
            return getAssetModelPage({pageNo:1,pageSize:100}).then((res) => {
                this.modelList = res.data?.list?.map(item =>{
                    return {
                        label: item.modelName,
                        value: item.modelName
                    }
                }) || [];
            });  
    },     
    /**
     * 调用真实接口获取资产分组列表
     * 替换原fetchMockData方法，适配接口传参和返回格式
     */
    fetchAssetGroupList() {
      this.loading = true
      // 构造接口请求参数（严格按照接口要求）
      const params = {
        pageNo: this.currentPage,
        pageSize: this.pageSize,
        name: this.searchForm.name || '' // 名称搜索参数，为空时传空字符串
      }
      
      getAssetGroupList(params)
        .then(response => {
          const { code, data, msg } = response
          if (code === 0 && data) {
            // 接口返回成功，适配表格数据格式
            this.tableData = data.list || []
            this.total = data.total || 0
          } else {
            this.$message.error(`${this.$t('productGroup.getGroupListFailed')}：${msg || this.$t('productGroup.unknownError')}`)
            this.tableData = []
            this.total = 0
          }
        })
        .catch(error => {
          this.$message.error(this.$t('productGroup.getGroupListRequestFailed'))
          console.error('分组列表接口错误：', error)
          this.tableData = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 打开资源列表弹框（调用真实接口getAssetPage）
     * @param {Object} record - 当前分组记录
     */
    openResourceModal(record) {
      this.currentGroup = record
      this.resourceModalVisible = true
      this.resourceCurrentPage = 1
      this.selectedResourceIds = []
      this.removedResourceIds = [] // 重置移除记录
      // 重置搜索条件
      this.resoureTitle = record.name
      this.resourceSearchForm = { name: '', model: undefined, ip: '' }
      // 调用接口加载资源列表
      this.fetchResourceList()
    },

    /**
     * 调用真实接口getAssetPage获取资源列表
     * POST方法，传参：groupId、pageNo、pagesize、assetName
     */
    fetchResourceList() {
      this.resourceLoading = true
      // 构造接口请求参数（严格按照要求）
      const params = {
        groupId: this.currentGroup.id,
        pageNo: this.resourceCurrentPage,
        pagesize: this.resourcePageSize,
        // 核心修复：使用资源弹框的搜索表单，而非分组表单
        deviceName: this.resourceSearchForm.name || undefined ,
        resourceType: this.resourceSearchForm.model || undefined ,
        ip: this.resourceSearchForm.ip || undefined ,
      }
      
      getAssetPage(params)
        .then(response => {
          const { code, data, msg } = response
          if (code === 0 && data) {
            // 接口返回成功，直接使用列表数据（已分页）
            this.originResourceList = data.list || [] // 保存原始列表
            this.filteredResourceList = data.list || []
            this.filteredResourceList = this.filteredResourceList.map(item =>{
              let typeName = ''
              return {
                  ...item,
                  ip: item?.assetAttribute?.ip || '',
                  typeName: typeName
              }
            })

            this.resourceTotal = data.total || 0
            // 本地二次筛选（IP和资源模型，若接口不支持则本地处理）
            // this.localFilterResourceList()
          } else {
            this.$message.error(`${this.$t('productGroup.getGroupResourceListFailed')}：${msg || this.$t('productGroup.unknownError')}`)
            this.originResourceList = []
            this.filteredResourceList = []
            this.resourceTotal = 0
          }
        })
        .catch(error => {
          this.$message.error(this.$t('productGroup.getGroupResourceRequestFailed'))
          console.error('分组资源接口错误：', error)
          this.originResourceList = []
          this.filteredResourceList = []
          this.resourceTotal = 0
        })
        .finally(() => {
          this.resourceLoading = false
        })
    },

    /**
     * 本地二次筛选资源列表（IP和资源模型）
     * 若接口支持这些筛选条件，可移至接口参数中
     */
    localFilterResourceList() {
      let list = [...this.filteredResourceList]
      // 过滤掉已标记移除的资源
      list = list.filter(item => !this.removedResourceIds.includes(item.id))
      // 按资源模型筛选
      if (this.resourceSearchForm.model) {
        list = list.filter(item => item.model === this.resourceSearchForm.model)
      }
      // 按IP模糊查询
      if (this.resourceSearchForm.ip) {
        list = list.filter(item => item.ip?.includes(this.resourceSearchForm.ip))
      }
      this.filteredResourceList = list
    },

    // 资源查询（重新调用接口）
    searchResource() {
      this.resourceCurrentPage = 1
      this.fetchResourceList()
    },

    // 重置资源查询条件（重新调用接口）
    resetResourceSearch() {
      this.resourceSearchForm = { name: '', model: undefined, ip: '' }
      this.resourceCurrentPage = 1
      this.fetchResourceList()
    },

    // 资源分页切换（重新调用接口）
    handleResourcePageChange(page) {
      this.resourceCurrentPage = page
      this.fetchResourceList()
    },

    // 资源每页条数变化（重新调用接口）
    handleResourceSizeChange(current, pageSize) {
      this.resourcePageSize = pageSize
      this.resourceCurrentPage = 1
      this.fetchResourceList()
    },

    // 资源选择变化（批量操作）
    handleResourceSelectChange(selectedRowKeys) {
      this.selectedResourceIds = selectedRowKeys
    },

    /**
     * 单个移除资源（仅标记，不实际删除）
     * @param {Object} record - 要移除的资源记录
     */
    removeResource(record) {
      this.$confirm(this.$t('productGroup.confirmMarkRemoveResource'), this.$t('productGroup.tip'), { type: 'warning' })
        .then(() => {
          // 标记为移除（仅记录ID，不删除原始数据）
          if (!this.removedResourceIds.includes(record.id)) {
            this.removedResourceIds.push(record.id)
          }
          // 更新当前显示列表
          this.localFilterResourceList()
          // 清空选中状态
          this.selectedResourceIds = []
          this.$message.info(this.$t('productGroup.markedRemoveResource'))
        })
        .catch(() => {})
    },

    /**
     * 批量移除资源（仅标记，不实际删除）
     */
    batchRemoveResource() {
      this.$confirm(this.$t('productGroup.confirmBatchMarkRemoveResource'), this.$t('productGroup.tip'), { type: 'warning' })
        .then(() => {
          // 批量标记移除
          this.selectedResourceIds.forEach(id => {
            if (!this.removedResourceIds.includes(id)) {
              this.removedResourceIds.push(id)
            }
          })
          // 更新当前显示列表
          this.localFilterResourceList()
          // 清空选中状态
          this.selectedResourceIds = []
          this.$message.info(`${this.$t('productGroup.markedRemove')} ${this.removedResourceIds.length} ${this.$t('productGroup.resourcesClickSaveToTakeEffect')}`)
        })
        .catch(() => {})
    },

    /**
     * 保存资源变更（调用saveAsset接口）
     */
    handleResourceSave() {
      if (!this.currentGroup || !this.currentGroup.id) {
        this.$message.error(this.$t('productGroup.missingGroupIdCannotSave'))
        return
      }

      this.resourceSaving = true
      // 构造保存接口参数
      const saveParams = {
        groupId: this.currentGroup.id,
        assetIdList: this.remainAssetIds // 保留的资产ID列表
      }

      // 调用保存接口
      saveAsset(saveParams)
        .then(response => {
          const { code, data, msg } = response
          if (code === 0 && data) {
            this.$message.success(msg || this.$t('productGroup.resourceSaveSuccess'))
            // 关闭弹框
            this.resourceModalVisible = false
            // 刷新分组列表
            this.fetchAssetGroupList()
          } else {
            this.$message.error(`${this.$t('productGroup.saveFailed')}：${msg || this.$t('productGroup.interfaceRequestException')}`)
          }
        })
        .catch(error => {
          this.$message.error(this.$t('productGroup.saveRequestFailed'))
          console.error('保存资源接口错误：', error)
        })
        .finally(() => {
          this.resourceSaving = false
        })
    },

    /**
     * 取消资源弹框（二次确认）
     */
    handleResourceModalCancel() {
      // 判断是否有未保存的修改
      if (this.removedResourceIds.length > 0) {
        this.$confirm(this.$t('productGroup.unsavedRemoveOperationConfirmClose'), this.$t('productGroup.tip'), {
          type: 'warning',
          okText: this.$t('productGroup.confirm'),
          cancelText: this.$t('productGroup.cancel')
        }).then(() => {
          // 确认关闭
          this.resourceModalVisible = false
          // 重置状态
          this.resetResourceModalState()
        }).catch(() => {
          // 取消关闭
        })
      } else {
        // 无修改直接关闭
        this.resourceModalVisible = false
        this.resetResourceModalState()
      }
    },

    /**
     * 重置资源弹框状态
     */
    resetResourceModalState() {
      this.removedResourceIds = []
      this.selectedResourceIds = []
      this.originResourceList = []
      this.filteredResourceList = []
      this.resourceCurrentPage = 1
      this.resourceSaving = false
      this.currentGroup = null
    },

    // 分组列表查询（调用真实接口）
    handleSearch() {
      this.currentPage = 1
      this.fetchAssetGroupList()
    },

    // 分组列表重置（调用真实接口）
    handleReset() {
      this.searchForm = { name: '', pageNo: 1, pageSize: 10 }
      this.handleSearch()
    },

    // 分组分页切换（调用真实接口）
    handlePageChange(page) {
      this.currentPage = page
      this.fetchAssetGroupList()
    },

    // 分组每页条数变化（调用真实接口）
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize
      this.currentPage = 1
      this.fetchAssetGroupList()
    },

    /**
     * 打开新增/编辑分组弹框
     * @param {Object} record - 编辑时传入的分组记录，新增时不传
     */
    openGroupModal(record = null) {
      this.currentEditGroup = record
      this.groupModalVisible = true
      
      this.$nextTick(() => {
        if (record) {
          // 编辑状态：填充表单数据
          this.groupForm = { groupName: record.name }
        } else {
          // 新增状态：重置表单
          this.groupForm = { groupName: '' }
          this.$refs.groupFormRef?.resetFields()
        }
      })
    },

    /**
     * 确认新增/编辑分组操作
     * 根据currentEditGroup状态判断调用哪个接口
     */
    confirmGroupOperate() {
      this.$refs.groupFormRef.validate((isValid, error) => {
        if (isValid) {
          const params = {
            name: this.groupForm.groupName,
            // 其他可选字段：description（分组描述）等，根据接口要求添加
          }

          // 编辑状态需添加id参数
          if (this.currentEditGroup) {
            params.id = this.currentEditGroup.id
          }

          // 根据状态选择接口
          const apiPromise = this.currentEditGroup 
            ? updateassetGroup(params) 
            : createassetGroup(params)

          apiPromise
            .then(response => {
              const { code, msg } = response
              if (code === 0) {
                const successMsg = this.currentEditGroup ? this.$t('productGroup.editGroupSuccess') : this.$t('productGroup.addGroupSuccess')
                this.$message.success(successMsg)
                this.groupModalVisible = false
                this.fetchAssetGroupList() // 重新获取分组列表
              } else {
                const errorMsg = this.currentEditGroup 
                  ? `${this.$t('productGroup.editGroupFailed')}：${msg || this.$t('productGroup.unknownError')}` 
                  : `${this.$t('productGroup.addGroupFailed')}：${msg || this.$t('productGroup.unknownError')}`
                this.$message.error(errorMsg)
              }
            })
            .catch(error => {
              console.error(`${this.currentEditGroup ? '编辑' : '新增'}分组接口错误：`, error)
            })
        } else {
          // 校验失败处理
          console.log('表单校验失败：', error)
          this.$message.warning(this.$t('productGroup.pleaseFillCorrectGroupInfo'))
        }
      })
    },

    // 弹框关闭时重置表单（避免残留校验状态和数据）
    handleDialogClose() {
      this.$refs.groupFormRef?.resetFields()
      this.currentEditGroup = null // 重置编辑状态
      this.groupForm = {} // 清空表单，避免残留数据
    },

    // 删除分组（对接真实接口）
    handleDelete(record) {
      // 判断是否有关联资产
      const hasAsset = record.assetCount && record.assetCount > 0
      const confirmContent = hasAsset 
        ? this.$t('productGroup.hasResourceAssociatedConfirmDelete')
        : this.$t('productGroup.confirmDeleteGroup')
      
      this.$confirm(confirmContent, this.$t('productGroup.tip'), { type: 'warning' })
        .then(() => {
          // 构造删除请求参数（通常只需传入id）
          deleteassetGroup(record.id)
            .then(response => {
              const { code, msg } = response
              if (code === 0) {
                this.$message.success(this.$t('productGroup.groupDeleteSuccess'))
                // 重新获取分组列表
                this.fetchAssetGroupList()
              } else {
                this.$message.error(`${this.$t('productGroup.groupDeleteFailed')}：${msg || this.$t('productGroup.unknownError')}`)
              }
            })
            .catch(error => {
              this.$message.error(this.$t('productGroup.deleteGroupRequestFailed'))
              console.error('删除分组接口错误：', error)
            })
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped lang="less">
// .table-auto-scroll {
//   max-height: 490px;
//   overflow-y: auto;
// }

.task-manage {
  padding: 20px;
  background: #fff;
  height: 90vh;
  overflow-y: auto;
}

.operation-card {
  margin-bottom: 16px;
}

.table-row-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-row-actions a {
  color: #1890ff;
  transition: color 0.3s;
  &:hover {
    color: #40a9ff;
  }
  &[disabled] {
    color: #bfbfbf;
    cursor: not-allowed;
  }
}

.pagination {
  text-align: right;
  margin-top: 16px;
}

/* 表格样式优化 */
/deep/ .ant-table-thead>tr>th {
  background: #e6f0fb !important;
  font-weight: 600;
}

/deep/ .ant-table-tbody>tr:hover>td {
  background: #e6f7ff !important;
}

/* 修复表单换行：确保inline布局下的表单项目不换行 */
/deep/ .ant-form-inline {
  display: flex;
  flex-wrap: nowrap; /* 禁止换行 */
  align-items: center; /* 垂直居中 */
}

/* 调整表单项目间距和内边距 */
/deep/ .ant-form-inline .ant-form-item {
  margin-bottom: 0 !important; /* 取消底部间距 */
  display: flex;
  align-items: center; /* 标签和输入框垂直居中 */
}

/* 调整标签样式，确保紧凑 */
/deep/ .ant-form-item-label {
  padding-right: 8px !important; /* 标签右侧间距减小 */
  white-space: nowrap; /* 标签不换行 */
}

/* Element Plus 表单样式适配 */
.el-form-item {
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
}

/* 弹框按钮样式适配 */
::v-deep .el-dialog__footer {
  text-align: right;
}

::v-deep .el-button + .el-button {
  margin-left: 12px;
}

/* 解决 Element Plus 与 Ant Design Vue 样式冲突 */
::v-deep .el-dialog {
  z-index: 1001 !important;
}

/* 禁用状态样式优化 */
/deep/ .ant-table-row a[disabled],
/deep/ .ant-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>