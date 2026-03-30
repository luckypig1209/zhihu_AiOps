<template>
  <a-drawer
    :title="drawerTitle"
    :visible="showModal"
    width="1080px"
    placement="right"
    :closable="true"
    :mask-closable="false"
    @close="cancel"
  >
    <div style="height: 80vh; overflow-y: auto;">
      <!-- 顶部Tab切换：使用a-tabs -->
      <a-tabs
        v-model:activeKey="activeTab"
        @change="handleTabChange"
        style="margin-bottom: 16px;"
      >
        <a-tab-pane :tab="$t('productFind.assetList')" key="assetList" />
        <a-tab-pane :tab="$t('productFind.ipUsage')" key="ipUsage" />
      </a-tabs>

      <!-- 资产列表Tab内容 -->
      <div v-if="activeTab === 'assetList'">
        <el-form
          :inline="true"
          :model="assetQueryForm"
          class="asset-query-form"
          style="margin-bottom: 16px;"
        >
          <el-form-item :label="$t('productFind.ip')">
            <el-input
              v-model="assetQueryForm.ip"
              :placeholder="$t('productFind.pleaseEnterIPFuzzySearch')"
              clearable
            />
          </el-form-item>
          <!-- <el-form-item label="资产匹配结果">
            <el-select
              v-model="assetQueryForm.matchResult"
              placeholder="请选择"
              clearable
            >
              <el-option label="IP匹配、端口不匹配" value="IP_MATCH_PORT_NOT_MATCH" />
              <el-option label="IP不匹配" value="IP_NOT_MATCH" />
              <el-option label="IP、端口均匹配" value="IP_PORT_MATCH" />
            </el-select>
          </el-form-item> -->
          <el-form-item>
            <el-button type="primary" @click="queryAssetList">{{ $t('productFind.query') }}</el-button>
            <el-button @click="resetAssetQuery">{{ $t('productFind.reset') }}</el-button>
            <el-button type="primary" @click="exportAssetList">{{ $t('productFind.export') }}</el-button>
          </el-form-item>
        </el-form>

        <el-table
          :data="filteredAssetList"
          border
          style="width: 100%;"
          v-loading="assetLoading"
        >
          <el-table-column prop="ip" :label="$t('productFind.ip')" width="250" />
          <el-table-column prop="port" :label="$t('productFind.port')" width="80" />
          <el-table-column prop="service" :label="$t('productFind.serviceType')" width="150" />
          <el-table-column prop="version" :label="$t('productFind.softwareVersion')" width="160" />
          <el-table-column prop="matchStatusStr" :label="$t('productFind.assetMatchResult')" width="180">
            <template #default="scope">
              <span :class="`match-tag ${scope.row.matchStatus}`">
                {{ scope.row.matchStatusStr }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('productFind.operation')" width="200">
            <template #default="scope">
              <el-button
                type="text"
                @click="manageAsset(scope.row)"
                :disabled="scope.row.matchStatus === 'IP_MATCH_PORT_MATCH'"
                size="small"
              >
                {{ $t('productFind.manageAsset') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 资产列表分页 -->
        <el-pagination
          @size-change="handleAssetSizeChange"
          @current-change="handleAssetCurrentChange"
          :current-page="assetCurrentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="assetPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="assetTotal"
          style="margin-top: 16px; text-align: right;"
        />

        <!-- 纳管资产弹框：增加z-index确保层级 -->
        <el-dialog
          :title="$t('productFind.manageAsset')"
          :visible.sync="manageAssetVisible"
          width="30%"
          :before-close="cancelManageAsset"
          :modal-append-to-body="false"
          :z-index="2001"
        >
          <el-form :model="manageForm" label-width="120px" ref="manageForm">
            <el-form-item 
              :label="$t('productFind.assetModel')" 
              prop="assetModel"
              :rules="{ required: true, message: $t('productFind.pleaseSelectAssetModel'), trigger: 'change' }"
            >
              <el-select
                v-model="manageForm.assetModel"
                :placeholder="$t('productFind.pleaseSelect')"
                clearable
              >
                 <el-option v-for="field in sourceConditionFields" :key="field.value" :label="field.label"
                    :value="field.value" :disabled="field.disabled" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="cancelManageAsset">{{ $t('productFind.cancel') }}</el-button>
              <el-button type="primary" @click="confirmManageAsset">{{ $t('productFind.confirm') }}</el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 资源模型新增页弹框：增加z-index确保层级 -->
        <el-dialog
          :title="`${$t('productFind.create')}${currentModelLabel}`"
          v-model="createAssetVisible"
          width="50%"
          :before-close="cancelCreateAsset"
          :modal-append-to-body="false"
          :z-index="2002"
        >
          <el-form 
            :model="createForm" 
            label-width="120px" 
            ref="createForm"
            :rules="createFormRules"
          >
            <el-form-item :label="$t('productFind.assetName')" prop="name">
              <el-input v-model="createForm.name" :placeholder="$t('productFind.pleaseEnterAssetName')" />
            </el-form-item>
            <el-form-item :label="$t('productFind.ipAddress')" prop="ip">
              <el-input v-model="createForm.ip" :placeholder="$t('productFind.pleaseEnterIPAddress')" disabled />
            </el-form-item>
            <el-form-item :label="$t('productFind.portNumber')" prop="port">
              <el-input v-model="createForm.port" :placeholder="$t('productFind.pleaseEnterPortNumber')" />
            </el-form-item>
            <el-form-item :label="$t('productFind.belongsToDepartment')" prop="department">
              <el-select v-model="createForm.department" :placeholder="$t('productFind.pleaseSelectDepartment')">
                <el-option :label="$t('productFind.techDepartment')" value="tech" />
                <el-option :label="$t('productFind.operationsDepartment')" value="ops" />
                <el-option :label="$t('productFind.businessDepartment')" value="business" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('productFind.remark')" prop="remark">
              <el-input 
                v-model="createForm.remark" 
                :placeholder="$t('productFind.pleaseEnterRemark')" 
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="cancelCreateAsset">{{ $t('productFind.cancel') }}</el-button>
              <el-button type="primary" @click="confirmCreateAsset">{{ $t('productFind.save') }}</el-button>
            </div>
          </template>
        </el-dialog>
      </div>

      <!-- IP使用情况Tab内容 -->
      <div v-if="activeTab === 'ipUsage'">
        <div class="ip-legend" style="margin-bottom: 10px;">
          <div class="legend-item">
            <span class="color-block occupied"></span>
            <span>{{ $t('productFind.statusMark') }}</span>
          </div>
          <div class="legend-item">
             <a-tag  color="#1890ff">
                  {{ $t('productFind.occupied') }}
             </a-tag>
           
          </div>
          <div class="legend-item">
            <a-tag  color="#bfbfbf">
                  {{ $t('productFind.idle') }}
             </a-tag>
          </div>
          <div class="legend-item">
            <a-tag  color="#ff4d4f">
                  {{ $t('productFind.excluded') }}
             </a-tag>
          </div>
        </div>

        <div class="ip-blocks" v-loading="ipLoading">
          <div
            v-for="(ipItem, index) in ipBlocks"
            :key="index"
            class="ip-block"
            :class="{
              'occupied': ipItem.status === 'USED',
              'idle': ipItem.status === 'IDLE',
              'excluded': ipItem.status === 'EXCLUDE'
            }"
            :title="ipItem.ip"
          >
            {{ ipItem.lastPart }}
          </div>
          <div v-if="ipBlocks.length === 0 && !ipLoading" class="empty-ip">
            {{ $t('productFind.noIPUsageData') }}
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import {
  getRecordAssetList,// 结果列表
  getIpUse, // 查询ip地址使用接口
  exportAsset // 导出资产接口
} from '@/api/productFind'
import {
  getAssetModelPage,
} from "@/api/resource";
// 引入文件下载相关工具（如果项目中没有，可使用以下简单实现）
import axios from 'axios';

export default {
  name: "AssetDetailDrawer",
  data() {
    return {
      sourceConditionFields:[],
      showModal: false,
      activeTab: "assetList", // 激活的Tab：assetList/ipUsage
      drawerTitle: this.$t('productFind.assetDetail'),

      // 资产列表相关（新增分页参数）
      assetQueryForm: {
        ip: "",
        matchResult: ""
      },
      filteredAssetList: [], // 筛选后的资产列表
      assetLoading: false,
      assetCurrentPage: 1, // 资产列表当前页
      assetPageSize: 10, // 资产列表每页条数
      assetTotal: 0, // 资产列表总条数

      // 纳管资产弹框
      manageAssetVisible: false,
      manageForm: {
        assetModel: ""
      },
      currentManageRow: null,

      // 资源模型新增页弹框
      createAssetVisible: false,
      createForm: {
        name: "",
        ip: "",
        port: "",
        department: "",
        remark: ""
      },
      createFormRules: {
        name: [
          { required: true, message: this.$t('productFind.pleaseEnterAssetName'), trigger: 'blur' },
          { max: 50, message: this.$t('productFind.nameLengthCannotExceed50Characters'), trigger: 'blur' }
        ],
        ip: [
          { required: true, message: this.$t('productFind.ipAddressCannotBeEmpty'), trigger: 'blur' }
        ],
        port: [
          { required: true, message: this.$t('productFind.pleaseEnterPortNumber'), trigger: 'blur' },
          { type: 'number', message: this.$t('productFind.pleaseEnterNumber'), trigger: 'blur' },
          { min: 1, max: 65535, message: this.$t('productFind.portNumberMustBeBetween1And65535'), trigger: 'blur' }
        ],
        department: [
          { required: true, message: this.$t('productFind.pleaseSelectDepartment'), trigger: 'change' }
        ]
      },
      currentModelLabel: "",
      modelLabels: {
        networkDevice: this.$t('productFind.networkDevice'),
        database: this.$t('productFind.database'),
        server: this.$t('productFind.server'),
        securityDevice: this.$t('productFind.securityDevice')
      },
      selectRow: {}, // 接收父组件传入的record

      // IP使用情况相关
      ipQueryForm: {
        ipRange: ""
      },
      ipBlocks: [], // IP方块数据
      ipLoading: false
    };
  },
  methods: {
    // 打开抽屉
    open(record) {
      this.showModal = true;
      this.selectRow = record;
      // 打开时默认加载第一页资产数据
      this.assetCurrentPage = 1;
      this.queryAssetList();
      this.getModelList()
    },

    // 关闭抽屉
    cancel() {
      this.showModal = false;
      this.resetAll();
    },

    // 重置所有状态
    resetAll() {
      this.activeTab = "assetList";
      this.assetQueryForm = { ip: "", matchResult: "" };
      this.filteredAssetList = [];
      this.assetCurrentPage = 1;
      this.assetPageSize = 10;
      this.assetTotal = 0;
      this.manageAssetVisible = false;
      this.manageForm.assetModel = "";
      this.currentManageRow = null;
      this.createAssetVisible = false;
      this.createForm = { name: "", ip: "", port: "", department: "", remark: "" };
      this.ipQueryForm.ipRange = "";
      this.ipBlocks = [];
    },

    // Tab切换回调
    handleTabChange(key) {
      this.activeTab = key;
      // 切换到IP使用情况Tab时，自动查询
      if (key === 'ipUsage' && this.ipBlocks.length === 0 && this.selectRow.id) {
        this.queryIpUsage();
      }
    },
    getModelList() {
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.sourceConditionFields = res.data.list.map(item => {
          return {
            label: item.modelName,
            value: item.modelCode
          }
        }) || [];

      });
    },
    // 资产列表查询（联调getRecordAssetList接口）
    queryAssetList() {
      if (!this.selectRow.id) {
        this.$message.error(this.$t('productFind.missingRecordIDCannotQuery'));
        return;
      }

      this.assetLoading = true;
      // 构建接口请求参数
      const params = {
        pageNo: this.assetCurrentPage,
        pageSize: this.assetPageSize,
        ip: this.assetQueryForm.ip || '',
        recordId: this.selectRow.id // 从selectRow取id赋值
      };

      getRecordAssetList(params)
        .then(res => {
          if (res.code === 0) {
            const { list, total } = res.data;
            this.filteredAssetList = list;
            this.assetTotal = total;
          } else {
            this.$message.error(`获取资产列表失败：${res.msg || '接口请求异常'}`);
            this.filteredAssetList = [];
            this.assetTotal = 0;
          }
        })
        .catch(err => {
          this.$message.error('获取资产列表失败，请重试');
          console.error('接口请求异常：', err);
          this.filteredAssetList = [];
          this.assetTotal = 0;
        })
        .finally(() => {
          this.assetLoading = false;
        });
    },

    // 资产列表分页-每页条数变化
    handleAssetSizeChange(val) {
      this.assetPageSize = val;
      this.queryAssetList();
    },

    // 资产列表分页-当前页变化
    handleAssetCurrentChange(val) {
      this.assetCurrentPage = val;
      this.queryAssetList();
    },

    // 资产列表重置
    resetAssetQuery() {
      this.assetQueryForm = { ip: "", matchResult: "" };
      this.assetCurrentPage = 1;
      this.queryAssetList();
    },

    // 资产列表导出（联调exportAsset接口）
    exportAssetList() {
      if (!this.selectRow.id) {
        this.$message.error(this.$t('productFind.missingRecordIDCannotExport'));
        return;
      }

      this.assetLoading = true;
      
      // 构建导出接口参数
      const exportParams = {
        recordId: this.selectRow.id
      };

      // 调用导出接口
      exportAsset(exportParams)
        .then(response => {
          this.$download.excel(response, this.$t('productFind.assetData') + ".xls");
          this.$message.success(this.$t('productFind.exportSuccess'));
          this.assetLoading = false;
        })
        .catch(err => {
          this.$message.error(this.$t('productFind.exportFailedPleaseRetry'));
          console.error('导出接口请求异常：', err);
        })
        .finally(() => {
          this.assetLoading = false;
        });
    },

    // 纳管资产弹框-打开
    manageAsset(row) {
      this.currentManageRow = row;
      this.manageForm.assetModel = "";
      this.manageAssetVisible = true;
      // 强制刷新表单验证状态
      this.$nextTick(() => {
        this.$refs.manageForm?.resetFields();
      });
    },

    // 纳管资产弹框-取消
    cancelManageAsset() {
      this.manageAssetVisible = false;
      this.$refs.manageForm?.resetFields();
    },

    // 纳管资产弹框-确认
    confirmManageAsset() {
      this.$refs.manageForm.validate(valid => {
        if (valid) {
          this.currentModelLabel = this.modelLabels[this.manageForm.assetModel];
          // 填充表单数据
          this.createForm = {
            name: `${this.currentModelLabel}-${this.currentManageRow.ip}`,
            ip: this.currentManageRow.ip,
            port: this.currentManageRow.port.toString(),
            department: "",
            remark: `${this.$t('productFind.autoManage')}：${this.currentManageRow.service}`
          };

          switch (this.manageForm.assetModel) {
            case 'docker':
               this.$router.push({ path: "/product/wYzBsYna/docker", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break;

            case 'networkdevice':
               this.$router.push({ path: "/product/CSBNCYei/networkdevice", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break;
              
            case 'terminaldevice':
               this.$router.push({ path: "/product/CSBNCYei/terminaldevice", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break;        
              
            case 'securitydevice':
               this.$router.push({ path: "/product/CSBNCYei/securitydevice", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break; 
            case 'storagebase':
               this.$router.push({ path: "/product/qpdYSMIz/storagebase", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break; 
            case 'operatesystem':
               this.$router.push({ path: "/product/qpdYSMIz/operatesystem", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break;       
              
            case 'middleware':
               this.$router.push({ path: "/product/qpdYSMIz/middleware", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break;                                                                                    
                        
            case 'storagedevice':
               this.$router.push({ path: "/product/CSBNCYei/storagedevice", query: { isFrom: 'product',  ip: this.currentManageRow.ip,
                    port: this.currentManageRow.port.toString(),  }});
              break; 
            default:
              break;
          }
          this.manageAssetVisible = false;
          this.createAssetVisible = true;
        }
      });
    },

    // 资源模型新增页-取消
    cancelCreateAsset() {
      this.createAssetVisible = false;
      this.$refs.createForm?.resetFields();
    },

    // 资源模型新增页-确认
    confirmCreateAsset() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          // 模拟保存
          this.assetLoading = true;
          setTimeout(() => {
            console.log("新增资产数据:", this.createForm);
            this.$message.success(`${this.currentModelLabel}${this.$t('productFind.createdSuccessfully')}`);
            this.createAssetVisible = false;
            this.assetLoading = false;
          }, 600);
        }
      });
    },

    // IP使用情况查询（联调getIpUse接口）
    queryIpUsage() {
      if (!this.selectRow.id) {
        this.$message.error(this.$t('productFind.missingRecordIDCannotQuery'));
        return;
      }

      this.ipLoading = true;
      // 构建接口请求参数
      const params = {
        id: this.selectRow.id // 从selectRow取id赋值
      };

      getIpUse(params)
        .then(res => {
          if (res.code === 0) {
            this.ipBlocks = res.data;
          } else {
            this.$message.error(`${this.$t('productFind.failedToGetIPUsage')}：${res.msg || this.$t('productFind.interfaceRequestException')}`);
            this.ipBlocks = [];
          }
        })
        .catch(err => {
          this.$message.error(this.$t('productFind.failedToGetIPUsagePleaseRetry'));
          console.error('接口请求异常：', err);
          this.ipBlocks = [];
        })
        .finally(() => {
          this.ipLoading = false;
        });
    },

    // IP使用情况重置
    resetIpQuery() {
      this.ipBlocks = [];
    }
  }
};
</script>

<style scoped lang="less">
.asset-query-form,
.ip-query-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

// 匹配结果标签样式
.match-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;

  &.IP_MATCH_PORT_MATCH {
    background-color: #40a9ff;
  }
  &.IP_MATCH_PORT_NOT_MATCH {
    background-color: #faad14;
  }
  &.IP_NOT_MATCH {
    background-color: #f75d3b;
  }
  &.IP_PORT_MATCH {
    background-color: #52c41a;
  }
}

// IP使用情况样式
.ip-legend {
  display: flex;
  gap: 20px;
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    .color-block {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }
  }
}

.ip-blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  min-height: 100px;

  .ip-block {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  // 调整颜色：占用蓝色、空闲灰色、剔除红色
  .occupied {
    background-color: #1890ff;
    color: #fff;
  }
  .idle {
    background-color: #bfbfbf;
    color: #fff;
  }
  .excluded {
    background-color: #ff4d4f;
    color: #fff;
  }

  .empty-ip {
    width: 100%;
    text-align: center;
    color: #999;
    padding: 20px 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
}

// 解决Loading样式问题
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.7);
}
</style>