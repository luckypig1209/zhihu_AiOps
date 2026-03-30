<template>
  <a-drawer :title="title" :visible="showModal" width="800px" placement="right" :closable="true" :mask-closable="false"
    @close="cancel">
    <div style="height: 80vh;overflow-y: auto;">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px" validate-on-rule-change="false">
        <div>
          <el-row>
            <!-- 规则名称 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.ruleName')" prop="ruleName">
                <el-input v-model="form.ruleName" :placeholder="$t('common.pleaseEnterRuleName')" clearable style="width: 100%;" />
              </el-form-item>
            </el-col>

            <!-- 资源模型 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.applicableResources')" prop="assetId">
                <div style="display: flex; align-items: center;">
                  <el-row style="width: 100%;">
                    <!-- 资源模型 -->
                    <el-col :span="5">
                      <el-select v-model="form.modelId" :placeholder="$t('common.pleaseSelectResourceModel')" @change="handleResourceModelChange"
                        style="width: 100%;">
                        <el-option v-for="item in resourceModelOptions" :key="item.value" :label="item.label"
                          :value="item.value" />
                      </el-select>
                    </el-col>
                    <!-- 设备类型 -->
                    <el-col :span="5" style="padding-left: 10px;">
                      <el-select v-model="form.deviceType" :placeholder="$t('common.pleaseSelectDeviceType')" @change="handleDeviceTypeChange"
                        :disabled="!form.modelId">
                        <el-option v-for="item in deviceTypeOptions" :key="item.value" :label="item.label"
                          :value="item.value" />
                      </el-select>
                    </el-col>
                    <!-- 全部/分组/选中 -->
                    <el-col :span="4" style="padding-left: 10px;">
                      <el-select 
                        :disabled="!form.deviceType" 
                        :placeholder="$t('common.pleaseSelect')"
                        v-model="resourceType" 
                        @change="onResourceTypeChange"
                        style="width: 100%;"
                      >
                        <el-option :label="$t('common.all')" value="all" />
                        <el-option :label="$t('common.group')" value="group" />
                        <el-option :label="$t('common.selected')" value="selected" />
                      </el-select>
                    </el-col>                    
                    <!-- 分组选择（仅分组时显示） -->
                    <el-col v-if="resourceType === 'group'" :span="8" style="padding-left: 10px;">
                      <el-select 
                        :disabled="!form.deviceType" 
                        multiple 
                        :placeholder="$t('common.pleaseSelectGroup')"
                        v-model="form.assetId.groupIdList" 
                        clearable 
                        filterable 
                        style="width: 100%;"
                        collapse-tags
                      >
                        <el-option 
                          v-for="group in groupOptions" 
                          :key="group.id" 
                          :label="group.name" 
                          :value="group.id" 
                        />
                      </el-select>
                    </el-col>
                    <!-- 资源选择（仅选中时显示） -->
                    <el-col v-if="resourceType === 'selected'" :span="8" style="padding-left: 10px;">
                      <el-select 
                        :disabled="!form.deviceType" 
                        multiple 
                        v-model="form.assetId.assetIdList"
                        clearable 
                        filterable 
                        :placeholder="$t('common.pleaseSelectResource')" 
                        style="width: 100%;"
                        collapse-tags
                      >
                        <el-option 
                          v-for="device in resourceScopeOptions" 
                          :key="device.value" 
                          :label="device.label"
                          :value="device.value"
                        />
                      </el-select>
                    </el-col>
                    <!-- 全选标识（仅全部时显示） -->
                    <!-- <el-col v-if="resourceType === 'all'" :span="6" style="padding-left: 10px; display: flex; align-items: center;">
                      <span style="color: #666;">已选择全部资源</span>
                    </el-col> -->
                  </el-row>
                </div>
              </el-form-item>
            </el-col>

            <!-- 推送指标项 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.pushMetricItems')" prop="pushMetricItems">
                <!-- <el-select v-model="form.pushMetricItems" placeholder="请选择推送指标项" multiple filterable collapse-tags
                  style="width: 100%;" :disabled="!form.deviceType">
                  <el-option v-for="item in pushMetricItemsOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select> -->
                <a-select
                      mode="multiple"
                      v-model="form.pushMetricItems"
                      :disabled="!form.deviceType"
                      allowClear
                      showSearch
                      :placeholder="$t('common.pleaseSelectPushMetricItems')"
                      style="width: 100%;"
                      :collapse-tags="true"
                      :options="pushMetricItemsOptions"
                      :max-tag-count="3"
                      :not-found-content="$t('common.noData')"
                    >
                    </a-select>                
              </el-form-item>
            </el-col>

            <!-- 推送频率 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.pushFrequency')" prop="pushFrequency">
                <el-select v-model="form.pushFrequency" :placeholder="$t('common.pleaseSelectPushFrequency')" style="width: 100%;">
                  <el-option v-for="item in pushFrequencyOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>

            <!-- 推送开关 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.pushSwitch')" prop="pushEnabled">
                <el-switch v-model="form.pushEnabled" />
              </el-form-item>
            </el-col>

            <!-- 备注 -->
            <el-col :span="24">
              <el-form-item :label="$t('common.remark')" prop="remark">
                <el-input type="textarea" :rows="3" v-model="form.remark"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
      <el-button @click="cancel" :disabled="isSubmitDisabled">{{ $t('common.cancel') }}</el-button>
    </div>
  </a-drawer>
</template>

<script>
import { updateMessage, getRuleDetail } from "@/api/monitor/task";
import { DICT_TYPE, getDictDatas } from "@/utils/dict";
import { indicatorPage } from "@/api/indicator";
import {
  getAssetModelPage,
  getAssetModelDetail,
  getAssetInfoPage,
  savePfmepush,
  getAssetGroup
} from "@/api/resource";
import { getPageInfo } from "@/api/topology";
import { loadAssetTree } from "@/utils/assetData";
export default {
  name: "NoticeConfigForm",
  props: {
    rowData: Object, // 接收外部传入的规则数据（主要用于编辑场景的通知配置回显）
  },
  data() {
    return {
      title: '',
      userOptions: [],
      isSubmitDisabled: false,
      isInit: false,
      showModal: false,
      loading: false,
      resourceType: '', // 新增：全部/分组/选中 标识
      groupOptions: [], // 新增：分组选项列表（需根据实际接口调整）
      originGroupOptions: [],
      itemList: [],
      typeObj: {},
      nodeInfo: [], // 资源树数据
      // 表单数据
      form: {
        ruleName: '',
        modelId: '', // 资源模型
        modelName: '', //资源名称
        deviceType: '',   // 设备类型
        assetId: {
          isAllAsset: false,  //是否全选
          assetIdList: [], // 选中状态
          groupIdList: []  //选中分组状态
        }, // 资源范围（调整为对象格式）
        pushMetricItems: [], // 推送指标项
        pushFrequency: '', // 推送频率
        pushEnabled: true, // 推送开关
        remark: '',
      },

      // 下拉选项
      resourceModelOptions: [
        { label: this.$t('common.server'), value: 'server' },
        { label: this.$t('common.networkDevice'), value: 'network' },
        { label: this.$t('common.storageDevice'), value: 'storage' }
      ],
      deviceTypeOptions: [], // 随资源模型动态更新
      resourceScopeOptions: [], // 随资源模型和设备类型动态更新
      pushMetricItemsOptions: [], //指标模板列表
      pushFrequencyOptions: [
        { label: this.$t('common.every5Minutes'), value: '5m' },
        { label: this.$t('common.every15Minutes'), value: '15m' },
        { label: this.$t('common.every1Hour'), value: '1h' },
        { label: this.$t('common.every2Hours'), value: '2h' },
        { label: this.$t('common.every1Day'), value: '1d' }
      ],

      // 通知模板配置
      noticeTemplates: {
        dd: { key: 'dd', value: [{ webhookUrl: '', secret: '' }], label: this.$t('common.dingTalk') },
        qywx: { key: 'qywx', value: [{ webhookUrl: '', secret: '' }], label: this.$t('common.wecom') },
        szh: { key: 'szh', value: [{ name: '', code: '' }], label: this.$t('common.telecomServiceDesk') }
      },

      // 标签输入值
      inputValue: "",

      // 表单校验规则
      rules: {
        ruleName: [
          { required: true, message: this.$t('common.pleaseEnterRuleName'), trigger: 'blur' }
        ],
        modelId: [
          { required: true, message: this.$t('common.pleaseSelectResourceModel'), trigger: 'change' }
        ],
        deviceType: [
          { required: true, message: this.$t('common.pleaseSelectDeviceType'), trigger: 'change' }
        ],
        assetId: [
          { 
            required: true, 
            validator: (rule, value, callback) => {
              // 自定义校验规则：根据resourceType判断是否选择了对应内容
              if (!this.resourceType) {
                callback(new Error(this.$t('common.pleaseSelectResourceScopeType')));
              } else if (this.resourceType === 'all') {
                // 全部：直接通过
                callback();
              } else if (this.resourceType === 'group' && value.groupIdList.length === 0) {
                callback(new Error(this.$t('common.pleaseSelectGroup')));
              } else if (this.resourceType === 'selected' && value.assetIdList.length === 0) {
                callback(new Error(this.$t('common.pleaseSelectResource')));
              } else {
                callback();
              }
            }, 
            trigger: 'change' 
          }
        ],
        pushMetricItems: [
          { required: true, message: this.$t('common.pleaseSelectPushMetricItems'), trigger: 'change' }
        ],
        pushFrequency: [
          { required: true, message: this.$t('common.pleaseSelectPushFrequency'), trigger: 'change' }
        ],
        pushEnabled: [
          { required: true, message: this.$t('common.pleaseSelectPushSwitch'), trigger: 'change' }
        ],
        channelString: [
          { required: true, message: this.$t('common.pleaseSelectAtLeastOneNotificationMethod'), trigger: 'change' }
        ]
      },
      flagShow: true
    };
  },
  watch: {
    showModal(val) {
      this.isInit = true
      this.getModelList()
      this.loadNodeInfo()
      if (val) {
        // 显示弹窗时：重置通知配置模板
        Object.keys(this.noticeTemplates).forEach(key => {
          if (key === 'dd' || key === 'qywx') {
            this.noticeTemplates[key].value = [{ webhookUrl: '', secret: '' }];
          } else if (key === 'szh') {
            this.noticeTemplates[key].value = [{ name: '', code: '' }];
          }
        });
        // 初始化数据（编辑场景回显）
        this.init(this.rowData);
        // 清除表单验证状态
        this.$nextTick(() => {
          this.$refs.form?.clearValidate();
        });
      } else {
        // 关闭弹窗时：重置表单
        this.form = {
          ruleName: '',
          modelId: '',
          deviceType: '',
          assetId: {
            isAllAsset: false,
            assetIdList: [],
            groupIdList: []
          },
          pushMetricItems: [],
          pushFrequency: '',
          pushEnabled: false,
          remark: '',
        };
        this.resourceType = ''; // 重置资源类型
        this.groupOptions = []; // 重置分组选项
        this.deviceTypeOptions = [];
        this.resourceScopeOptions = [];
        this.pushMetricItemsOptions = []
        this.$refs.form?.resetFields();
        this.isSubmitDisabled = false;
        this.inputValue = "";
      }
    },

    // 监听资源类型变化，更新全选标识
    resourceType(val) {
      if (val === 'all') {
        this.form.assetId.isAllAsset = true;
        this.form.assetId.assetIdList = [];
        this.form.assetId.groupIdList = [];
      } else {
        this.form.assetId.isAllAsset = false;
      }
    }
  },
  methods: {
    getModelList() {
      getAssetModelPage({ pageNo: 1, pageSize: 100 }).then((res) => {
        this.resourceModelOptions = res.data.list.map(item => {
          return {
            label: item.modelName,
            value: item.id,
            modelCode: item.modelCode
          }
        }) || [];
      });
    },

    // 新增：资源类型切换（全部/分组/选中）
    onResourceTypeChange(val) {
      this.resourceType = val;
      // 触发表单校验
      this.$refs.form.validateField('assetId');
      this.form.assetId.groupIdList = []
      this.form.assetId.assetIdList = []
      // 如果是分组类型，加载分组选项（需替换为实际接口）
      if (val === 'group') {
        getAssetGroup().then((res) => {
          if (res.code === 0 && res.data && Array.isArray(res.data)) {
            this.groupOptions = res.data;
            this.originGroupOptions = [...res.data]; // 保存原始列表
          }
        }).catch(() => {
          this.$message.error(this.$t('common.failedToGetGroupList'));
        });
        // this.groupOptions = [
        //   { label: '分组1', value: 201 },
        //   { label: '分组2', value: 205 },
        //   { label: '分组3', value: 208 }
        // ];
      }
    },

    // 资源模型变更时，更新设备类型选项
    handleResourceModelChange(value) {
      if (!this.isInit) {
        this.form.deviceType = '';
        this.form.assetId = {
          isAllAsset: false,
          assetIdList: [],
          groupIdList: []
        };
        this.resourceType = '';
      }
      this.resourceScopeOptions = [];
      this.pushMetricItemsOptions = []
      
      // 从资源模型列表中获取当前选中的资源模型代码
      let currentModelCode = '';
      this.resourceModelOptions.forEach(item => {
        if (item.value == value) {
          currentModelCode = item.modelCode;
        }
      });
      
      // 从nodeInfo中获取对应的设备类型选项
      if (currentModelCode && this.nodeInfo.length > 0) {
        const resource = this.nodeInfo.find(item => item.resourceType === currentModelCode);
        if (resource && resource.device) {
          this.deviceTypeOptions = resource.device.map(item => ({
            label: item.deviceTypeName,
            value: item.deviceType
          }));
          
          // 编辑模式下，将form.deviceType从标签转换为值
          if (this.isInit && this.form.deviceType) {
            const device = this.deviceTypeOptions.find(item => item.label == this.form.deviceType);
            if (device) {
              this.form.deviceType = device.value;
            }
          }
        } else {
          this.deviceTypeOptions = [];
        }
      } else {
        // 备用方案：如果nodeInfo中没有数据，仍然使用原来的方式获取设备类型
        getAssetModelDetail({ id: value }) .then((res) => {
          let typeValue = ''
          if (res.data?.items && res.data.items.length) {
            this.itemList = res.data.items.map(item => {
              return {
                itemName: item.itemName,
                itemCode: item.itemCode,
                itemId: item.id,
                itemValue: ''
              }
            });
            this.itemList.forEach(iItem => {
              if (iItem.itemName === '类型') {
                typeValue = iItem.itemCode
                this.typeObj = iItem
              }
            });
            this.deviceTypeOptions = getDictDatas(typeValue)
            if (this.isInit) {
              this.deviceTypeOptions.forEach(item => {
                if (item.label == this.form.deviceType) {
                  this.form.deviceType = item.value
                }
              })
            }
          }
        });
      }
    },

    // 设备类型变更时，更新资源范围选项
    handleDeviceTypeChange(value) {
      console.log(this.isInit, this.flagShow, 'this.isInit, this.flagShow');

      if (!this.isInit && this.flagShow == false) {
        this.form.pushMetricItems = [];
      }

      setTimeout(() => {
        if (!this.isInit) {
          this.form.assetId = {
            isAllAsset: false,
            assetIdList: [],
            groupIdList: []
          };
          this.resourceType = '';
        }
        let deviceType2 = value
        if (this.isInit) {
          deviceType2 = this.form.deviceType
        }
        
        // 从nodeInfo中获取设备类型的详细信息
        let deviceInfo = {};
        // 先获取当前选中的资源模型代码
        let currentModelCode = '';
        this.resourceModelOptions.forEach(item => {
          if (item.value == this.form.modelId) {
            currentModelCode = item.modelCode;
          }
        });
        
        // 从nodeInfo中查找对应的设备信息
        if (currentModelCode && this.nodeInfo.length > 0) {
          const resource = this.nodeInfo.find(item => item.resourceType === currentModelCode);
          if (resource && resource.device) {
            const device = resource.device.find(item => item.deviceType == deviceType2);
            if (device) {
              deviceInfo = {
                deviceType: device.deviceType,
                deviceTypeName: device.deviceTypeName,
                imgSrc: device.imgSrc,
                label: device.deviceTypeName,
                deviceTypeCode: resource.deviceTypeCode,
                resourceType: currentModelCode,
                resourceName: resource.resourceName
              };
            }
          }
        }
        
        let params = {
          "pageNo": 1,
          "pageSize": 99,
          "deviceType": deviceType2,
          "deviceTypeName": deviceInfo.deviceTypeName || '',
          "imgSrc": deviceInfo.imgSrc || '',
          "label": deviceInfo.label || '',
          "deviceTypeCode": deviceInfo.deviceTypeCode || '',
          "resourceType": deviceInfo.resourceType || '',
          "resourceName": deviceInfo.resourceName || '',
          "deviceName": '',
          "ip": ''
        };
        getPageInfo(params).then((res) => {
          this.resourceScopeOptions = res.data && res.data.list ? res.data.list.map(item => {
            return {
              label: item.assetAttribute?.name || '',
              value: item.id + ''
            };
          }) : [];
          this.$forceUpdate();
        });
        let resourceType2 = ''
        this.resourceModelOptions.forEach(item => {
          if (this.form.modelId == item.value) {
            resourceType2 = item.modelCode
          }
        })

        let params2 = {
          pageSize: 100,
          pageNo: 1,
          resourceType: resourceType2 || undefined,
          deviceType: deviceType2 || undefined,
        };
        indicatorPage(params2).then((res) => {
          let reseData = res?.data?.list || []
          this.pushMetricItemsOptions = reseData.map(item => {
            return {
              label: item.metricName,
              value: item.keyword
            }
          })
          this.isInit = false
        });
      }, 500);
    },

    // 获取通知类型中文名称
    getNoticeLabel(key) {
      return this.noticeTemplates[key]?.label || key;
    },

    // 新增通知配置项（钉钉/企业微信）
    addCondition(key) {
      if (key === 'dd' || key === 'qywx') {
        this.noticeTemplates[key].value.push({ webhookUrl: '', secret: '' });
      } else if (key === 'szh') {
        this.noticeTemplates[key].value.push({ name: '', code: '' });
      }
    },

    // 删除通知配置项
    removeCondition(key, index) {
      const template = this.noticeTemplates[key];
      if (template.value.length <= 1) {
        const label = this.getNoticeLabel(key);
        this.$message.warning(this.$t('common.pleaseConfigureAtLeastOneNotificationInfo', { method: label }));
        return;
      }
      template.value.splice(index, 1);
    },

    // 删除标签（in/not in场景）
    handleClose(tag, index, type = 'notice') {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index]?.dynamicTags) {
        targetArr[index].dynamicTags.splice(
          targetArr[index].dynamicTags.indexOf(tag), 1
        );
        this.$forceUpdate();
      }
    },

    // 显示标签输入框（in/not in场景）
    showInput(index, type = 'notice') {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index]) {
        targetArr[index].inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput?.$refs.input?.focus();
        });
      }
    },

    // 确认标签输入（in/not in场景）
    handleInputConfirm(index, type = 'notice') {
      const targetArr = this.noticeTemplates[type]?.value || [];
      if (targetArr[index] && this.inputValue.trim()) {
        if (!targetArr[index].dynamicTags) targetArr[index].dynamicTags = [];
        targetArr[index].dynamicTags.push(this.inputValue.trim());
        targetArr[index].rightValue = targetArr[index].dynamicTags.join(",");
        targetArr[index].inputVisible = false;
        this.inputValue = "";
      }
    },

    // 初始化表单（编辑场景回显通知配置）
    init(row) {
      console.log(row)
      if (Object.keys(row).length === 0) {
        // 新增场景：重置表单
        this.title = this.$t('common.addPerformancePushRule')
        this.$refs.form?.resetFields();
        this.form = {
          ruleName: '',
          modelId: '', // 资源模型
          modelName: '', //资源名称
          deviceType: '',   // 设备类型
          assetId: {
            isAllAsset: false,
            assetIdList: [],
            groupIdList: []
          }, // 资源范围
          pushMetricItems: [], // 推送指标项
          pushFrequency: '', // 推送频率
          pushEnabled: true, // 推送开关
          remark: '',
        }
        this.resourceType = '';
      } else {
        // 编辑场景：回显数据
        this.title = this.$t('common.editPerformancePushRule')
        this.getRuleDetail();
      }
    },

    // 加载资源树数据
    async loadNodeInfo() {
      try {
        this.nodeInfo = await loadAssetTree();
      } catch (error) {
        console.error('加载节点信息失败:', error);
        this.nodeInfo = [];
      }
    },

    // 获取规则详情（仅回显通知配置相关数据）
    getRuleDetail() {
      let data = { ruleId: this.rowData.ruleId };

      // 模拟接口返回（实际项目替换为真实接口调用）
      let res = {
        status: 200,
        message: "Success",
        data: this.rowData,
      };

      if (res.status === 200) {
        const detail = res.data;
        // 回显基本表单数据
        this.form = {
          ...this.form,
          ruleName: detail.ruleName || '',
          modelId: parseInt(detail.modelId) || '',
          modelName: detail.modelName || '',
          deviceType: detail.deviceType || '',
          assetId: detail.assetId ? (typeof detail.assetId === 'string' ? JSON.parse(detail.assetId) : detail.assetId) : {
            isAllAsset: false,
            assetIdList: [],
            groupIdList: []
          },
          pushMetricItems: JSON.parse(detail.pushMetricItems) || [],
          pushFrequency: detail.pushFrequency || '',
          pushEnabled: detail.pushEnabled || false,
          remark: detail.remark || '',
        };

        // 回显资源类型
        if (this.form.assetId.isAllAsset) {
          this.resourceType = 'all';
        } else if (this.form.assetId.groupIdList.length > 0) {
          this.resourceType = 'group';
          // 加载分组选项
          // this.groupOptions = [
          //   { label: '分组1', value: 201 },
          //   { label: '分组2', value: 205 },
          //   { label: '分组3', value: 208 }
          // ];
          getAssetGroup().then((res) => {
            if (res.code === 0 && res.data && Array.isArray(res.data)) {
              this.groupOptions = res.data;
              this.originGroupOptions = [...res.data]; // 保存原始列表
            }
          }).catch(() => {
            this.$message.error('获取分组列表失败');
          });          
        } else if (this.form.assetId.assetIdList.length > 0) {
          this.resourceType = 'selected';
        }

        // 触发联动，加载对应选项
        if (this.form.modelId) {
          this.handleResourceModelChange(this.form.modelId);

          // 延迟执行，确保设备类型选项已加载
          setTimeout(() => {
            if (this.form.deviceType) {
              this.handleDeviceTypeChange(this.form.deviceType);
              this.flagShow = false
            }
          }, 0);
        }

        // 回显通知配置详情
        if (detail.channelParam) {
          Object.keys(detail.channelParam).forEach(key => {
            if (this.noticeTemplates[key]) {
              this.noticeTemplates[key].value = [...(detail.channelParam[key] || [])];
            }
          });
        }
      }

      // 真实接口调用（替换模拟数据）
      // getRuleDetail(data).then((res) => {
      //   if (res.status === 200) {
      //     // 处理逻辑同上
      //   }
      // });
    },

    // 取消操作：关闭弹窗
    cancel() {
      this.showModal = false;
    },

    // 提交表单
    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let deviceType = ''
          this.deviceTypeOptions.forEach(item => {
            if (item.value == this.form.deviceType) {
              deviceType = item.label
            }
          })
          // 整理提交数据
          const submitData = {
            ...this.form,
            deviceType: deviceType,
            id: this.rowData?.id || undefined, // 编辑场景传ruleId，新增场景可省略
          };

          // 提交接口（保存通知配置）
          this.isSubmitDisabled = true;
          savePfmepush(submitData)
            .then((res) => {
              this.isSubmitDisabled = false;
              if (res.data) {
                this.$modal.msgSuccess(this.$t('common.performancePushConfigSavedSuccessfully'));
                this.showModal = false;
                this.$emit("refreshList"); // 通知父组件刷新列表
              } else {
                this.$modal.msgError(res.message || this.$t('common.saveFailed'));
              }
            })
            .catch((error) => {
              this.isSubmitDisabled = false;
              this.$modal.msgError(this.$t('common.failedToSavePerformancePushConfig'));
              console.error("提交错误：", error);
            });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
/* 标签相关样式 */
.el-tag+.el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}

.tag-style {
  border: 1px solid #dcdfe6;
  padding: 4px;
  margin: 0 8px;
}

/* 步骤条样式 */
.el-steps {
  margin-bottom: 20px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  text-align: right;
  margin-top: 20px;

  :deep(.el-button) {
    margin-left: 8px;
  }
}

/* 卡片样式调整 */
:deep(.ant-card) {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

/* 行布局对齐样式 */
:deep(.el-row--flex) {
  align-items: center;
}

/* 提示文本样式 */
:deep(.el-form-item__error) {
  font-size: 12px;
  //color: #666;
  // background-color: #f5f7fa;
  padding: 2px 5px;
  // border-radius: 3px;
}

/* 抽屉滚动优化 */
:deep(.ant-drawer-wrapper-body) {
  overflow: hidden;
}
/deep/ .ant-select-selection--multiple{
  min-height: 36px !important;
}

:deep(.el-select__tags-text) {
  max-width: 60px;
}
</style>