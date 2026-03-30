<template>
  <el-container>
    <el-header height="60px" v-if="soureType != '1'">
      <el-row>
        <el-col :span="16" style="text-align: left">
          <div class="navbar-brand" @click="huitui()">
            <i class="el-icon-back"></i>&nbsp;
            <span> {{ tupuInfo.name }} </span>
          </div>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <div class="navbar-btns">
            <div v-if="graphMode === 'preview'">
              <el-button size="mini" @click="handleEditClick">{{ $t('common.edit') }}</el-button>
              <el-button size="mini" @click="handleRefreshClick">{{ $t('common.refresh') }}</el-button>
              <el-dropdown @command="toggleAutoRefresh" style="margin-left: 10px;">
                <el-button class="refresh-button" size="mini">
                  <span v-if="autoRefresh.interval === 'close'">{{ $t('common.close') }}</span>
                  <span v-else>{{ autoRefresh.interval }}{{ $t('common.minute') }}{{ $t('common.refresh') }}</span>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="1">1{{ $t('common.minute') }}</el-dropdown-item>
                  <el-dropdown-item command="5">5{{ $t('common.minute') }}</el-dropdown-item>
                  <el-dropdown-item command="10">10{{ $t('common.minute') }}</el-dropdown-item>
                  <el-dropdown-item command="30">30{{ $t('common.minute') }}</el-dropdown-item>
                  <el-dropdown-item command="close">{{ $t('common.close') }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
            <div v-if="graphMode === 'edit'">
              <el-button size="mini" @click="handleLayoutClick">{{ $t('common.autoLayout') }}</el-button>
              <el-button size="mini" @click="handleGraphDataSave">{{ $t('common.save') }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <cc-topology ref="topology" :graph-data="graphData" :node-type-list="nodeTypeList"
        :node-app-config="nodeAppConfig" @node-click="handleNodeClick">
      </cc-topology>
      <a-drawer :title="selectName" v-if="nameVisible" width="1080px" placement="right" :closable="true"
        :visible="nameVisible" :mask-closable="false" @close="nameVisible = false">
        <deviceDetail :selectRow="selectRow"></deviceDetail>
      </a-drawer>
    </el-main>
  </el-container>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import { CCTopology } from '../../../packages/index'
import { getRandomArrayElements } from '../../utils/tpindex'
import { getByIdDetail, updateTopology, getByIdDetailWb } from "@/api/topology";
import deviceDetail from "../faultManage/networkDevice/components/deviceDetail.vue";
import { loadAssetTree } from '../../utils/assetData';

export default {
  name: 'DemoTopology',
  components: {
    'cc-topology': CCTopology,
    'deviceDetail': deviceDetail
  },
  data() {
    return {
      selectName: "",
      selectRow: {},
      nameVisible: false,
      selectedNode: null,
      graphData: {
        nodes: [],
        edges: []
      },
      nodeTypeList: [],
      nodeInfo: [],
      flattenedData: [],
      nodeAppConfig: {
        ip: this.$t('common.nodeIp'),
        port: this.$t('common.nodePort'),
        sysName: this.$t('common.deviceName')
      },
      autoRefresh: {
        enable: false,
        interval: 5
      },
      autoRefreshTimer: null,
      dataUpdateTime: this.$t('common.noRelatedData'),
      graphMode: 'preview',
      infoId: '',
      nodeList: [],
      connectionList: [],
      tupuInfo: {},
      soureType: '',
      imageUrl: ''
    }
  },
  async mounted() {
    console.log(this.$route.query, 'this.$route.query');
    this.infoId = this.$route.query.id;
    this.soureType = this.$route.query.soureType;
    this.graphMode = this.$route.query.mode ? this.$route.query.mode : 'preview';
    console.log('this.graphMode-------' + this.graphMode);

    // 异步加载节点信息
    if (this.graphMode !== 'preview') {
      await this.loadNodeInfo();
    }

    // 执行处理
    this.flattenedData = this.infoList(this.nodeInfo);
    // 处理数据：为每个device项添加imgSrc和label
    this.nodeTypeList = this.nodeInfo.map(item => {
      const updatedDevices = item.device.map(device => {
        let imgSrc;
        switch (device.deviceTypeName) {
          case '交换机':
            imgSrc = require('@/assets/images/srcImg/jhj.png');
            break;
          case '路由器':
            imgSrc = require('@/assets/images/srcImg/lyq.png');
            break;
          case '安全设备':
            imgSrc = require('@/assets/images/srcImg/aqsb.png');
            break;
          case 'mysql':
            imgSrc = require('@/assets/images/srcImg/mysql.png');
            break;
          case 'elasticSearch':
            imgSrc = require('@/assets/images/srcImg/elasticSearch.png');
            break;
          case 'redis':
            imgSrc = require('@/assets/images/srcImg/redis.png');
            break;
          case '操作系统':
            imgSrc = require('@/assets/images/srcImg/czxt.png');
            break;
          case 'kafka':
            imgSrc = require('@/assets/images/srcImg/kafka.png');
            break;
          case 'nginx':
            imgSrc = require('@/assets/images/srcImg/nginx.png');
            break;
          case '摄像头':
            imgSrc = require('@/assets/images/srcImg/sxt.png');
            break;
          case '存储设备':
            imgSrc = require('@/assets/images/srcImg/cunchu.png');
            break;
          case '门禁':
            imgSrc = require('@/assets/images/srcImg/menjin.png');
            break;
          case 'oracle':
            imgSrc = require('@/assets/images/srcImg/oracle.png');
            break;            
          case 'linux':
            imgSrc = require('@/assets/images/srcImg/linux.png');
            break;
          case 'windows':
            imgSrc = require('@/assets/images/srcImg/windows.png');
            break;            
          case '达梦':
            imgSrc = require('@/assets/images/srcImg/达梦.png');
            break;
          case 'sqlServer':
            imgSrc = require('@/assets/images/srcImg/sqlserver.png');
            break;
          case 'tomcat':
            imgSrc = require('@/assets/images/srcImg/tomcat.png');
            break;
          case 'docker':
            imgSrc = require('@/assets/images/srcImg/docker.png');
            break;
          // 处理未匹配的情况（默认图片）
          default:
            imgSrc = require('@/assets/images/srcImg/yhd.png');
            console.warn(`未匹配的设备类型：${device.deviceTypeName}`);
        }
        // 统一返回处理后的对象
        return {
          ...device,
          imgSrc,
          label: device.deviceTypeName,
          deviceTypeCode: item.deviceTypeCode,
          resourceType: item.resourceType,
          resourceName: item.resourceName,
        };
      });
      return {
        ...item,
        device: updatedDevices
      };
    });

    this.initGraphData()
    let theme = 'defaultStyle'
    this.$refs.topology.changeGraphTheme(theme)

    // 仅在预览模式下启用1分钟刷新功能
    if (this.graphMode === 'preview') {
      this.toggleAutoRefresh(1)
    }
  },
  methods: {
    // 异步加载节点信息
    async loadNodeInfo() {
      try {
        this.nodeInfo = await loadAssetTree();
      } catch (error) {
        console.error('加载节点信息失败:', error);
        this.nodeInfo = [];
      }
    },
    // 处理节点点击事件
    handleNodeClick(nodeModel) {
      console.log('节点被点击:', nodeModel);
      this.selectedNode = nodeModel;
      this.nameVisible = true;
      this.selectName = nodeModel.assetData.modelName;
      this.selectRow = nodeModel.assetData;
    },

    // 平铺处理函数
    infoList(data) {
      const result = [];
      data.forEach(parent => {
        const parentBase = {
          resourceType: parent.resourceType,
          resourceName: parent.resourceName,
          deviceTypeCode: parent.deviceTypeCode || null,
        };
        parent.device.forEach(child => {
          result.push({
            ...parentBase,
            deviceType: child.deviceType,
            deviceTypeName: child.deviceTypeName
          });
        });
      });
      return result;
    },

    async handleEditClick() {
      // 进入编辑模式时清除自动刷新定时器
      clearInterval(this.autoRefreshTimer)
      this.graphMode = 'edit'
      let graphData = _.cloneDeep(this.graphData)
      this.$refs.topology.changeGraphMode(graphData, 'edit')

      if (this.graphMode !== 'preview') {
        await this.loadNodeInfo();
      }

      // 执行处理
      this.flattenedData = this.infoList(this.nodeInfo);
      // 处理数据：为每个device项添加imgSrc和label
      this.nodeTypeList = this.nodeInfo.map(item => {
        const updatedDevices = item.device.map(device => {
          let imgSrc;
          switch (device.deviceTypeName) {
            case '交换机':
              imgSrc = require('@/assets/images/srcImg/jhj.png');
              break;
            case '路由器':
              imgSrc = require('@/assets/images/srcImg/lyq.png');
              break;
            case '安全设备':
              imgSrc = require('@/assets/images/srcImg/aqsb.png');
              break;
            case 'mysql':
              imgSrc = require('@/assets/images/srcImg/mysql.png');
              break;
            case 'elasticSearch':
              imgSrc = require('@/assets/images/srcImg/elasticSearch.png');
              break;
            case 'redis':
              imgSrc = require('@/assets/images/srcImg/redis.png');
              break;
            case '操作系统':
              imgSrc = require('@/assets/images/srcImg/czxt.png');
              break;
            case 'kafka':
              imgSrc = require('@/assets/images/srcImg/kafka.png');
              break;
            case 'nginx':
              imgSrc = require('@/assets/images/srcImg/nginx.png');
              break;
            case '摄像头':
              imgSrc = require('@/assets/images/srcImg/sxt.png');
              break;
            case '存储设备':
              imgSrc = require('@/assets/images/srcImg/cunchu.png');
              break;
            case '门禁':
              imgSrc = require('@/assets/images/srcImg/menjin.png');
              break;
          case 'oracle':
            imgSrc = require('@/assets/images/srcImg/oracle.png');
            break;                
            case 'linux':
              imgSrc = require('@/assets/images/srcImg/linux.png');
              break;
            case 'windows':
              imgSrc = require('@/assets/images/srcImg/windows.png');
              break;              
            case '达梦':
              imgSrc = require('@/assets/images/srcImg/达梦.png');
              break;
            case 'sqlServer':
              imgSrc = require('@/assets/images/srcImg/sqlserver.png');
              break;
            case 'tomcat':
              imgSrc = require('@/assets/images/srcImg/tomcat.png');
              break;
            case 'docker':
              imgSrc = require('@/assets/images/srcImg/docker.png');
              break;
            // 处理未匹配的情况（默认图片）
            default:
              imgSrc = require('@/assets/images/srcImg/yhd.png');
              console.warn(`未匹配的设备类型：${device.deviceTypeName}`);
          }
          return {
            ...device,
            imgSrc,
            label: device.deviceTypeName,
            deviceTypeCode: item.deviceTypeCode,
            resourceType: item.resourceType,
            resourceName: item.resourceName,
          };
        });
        return {
          ...item,
          device: updatedDevices
        };
      });
    },
    handleRefreshClick() {
      // 仅在预览模式下允许刷新
      if (this.graphMode === 'preview') {
        this.initGraphData()
      }
    },
    handleLayoutClick() {
      this.$refs.topology.forceLayoutHandler()
    },
    handlePreviewClick() {
      this.graphMode = 'preview'
      let graphData = _.cloneDeep(this.graphData)
      this.$refs.topology.changeGraphMode(graphData, 'preview')
      // 切换到预览模式后，重新启用自动刷新
      this.toggleAutoRefresh(1)
      this.handleRefreshClick()
    },
    huitui() {
      this.$router.go(-1)
    },
    toggleAutoRefresh(command) {
      // 仅在预览模式下允许设置自动刷新
      if (this.graphMode === 'preview' && command && command !== 'close') {
        this.autoRefresh.interval = Number(command)
        clearInterval(this.autoRefreshTimer)
        this.autoRefreshTimer = setInterval(() => {
          this.initGraphData()
        }, this.autoRefresh.interval * 60 * 1000)
        this.$once('hook:beforeDestroy', () => {
          clearInterval(this.autoRefreshTimer)
        })
      } else {
        this.autoRefresh.interval = command
        clearInterval(this.autoRefreshTimer)
      }
    },
    //获取当前图谱信息
    initGraphData() {
      // 异步请求获取远程的 graphData
      if (this.$route.query.id) {
        getByIdDetail(this.infoId).then((res) => {
          console.log(res);
          if (res.code == '0') {
            this.tupuInfo = res.data;
            // 解析设备节点
            const deviceNodes = this.tupuInfo.nodeList && this.tupuInfo.nodeList.length > 0 ? this.tupuInfo.nodeList.map(item => {
              const nodeData = JSON.parse(item.extraInfo);
              // 如果存在deviceInfo和onlineStatus，更新到assetData中
              if (item.deviceInfo && item.deviceInfo.onlineStatus !== undefined) {
                if (!nodeData.assetData) {
                  nodeData.assetData = {};
                }
                nodeData.assetData.onlineStatus = item.deviceInfo.onlineStatus;
              }
              // 使用deviceInfo.assetName更新节点label
              if (item.deviceInfo && item.deviceInfo.assetName) {
                nodeData.label = item.deviceInfo.assetName;
              }
              return nodeData;
            }) : [];

            // 解析文本节点和区域节点
            let extraNodes = [];
            if (this.tupuInfo.extraInfo) {
              try {
                extraNodes = JSON.parse(this.tupuInfo.extraInfo);
              } catch (e) {
                console.error('解析额外节点失败:', e);
                extraNodes = [];
              }
            }

            // 合并设备节点、文本节点和区域节点
            const allNodes = [...deviceNodes, ...extraNodes];

            this.graphData = {
              id: this.tupuInfo.id,
              name: this.tupuInfo.name,
              description: this.tupuInfo.description,
              nodes: allNodes,
              edges: this.tupuInfo.connectionList && this.tupuInfo.connectionList.length > 0 ? this.tupuInfo.connectionList.map(item => {
                return JSON.parse(item.extraInfo)
              }) : [],
            }
            console.log(this.graphData, ' this.graphData');

            let graphData = _.cloneDeep(this.graphData)
            this.$refs.topology.initTopo(graphData)
            // 确保初始化后应用正确的模式
            this.$refs.topology.changeGraphMode(graphData, this.graphMode)
          }

        })
      } else {
        getByIdDetailWb(this.$route.query.token).then((res) => {
          console.log(res);
          if (res.code == '0') {
            this.tupuInfo = res.data;
            // 解析设备节点
            const deviceNodes = this.tupuInfo.nodeList && this.tupuInfo.nodeList.length > 0 ? this.tupuInfo.nodeList.map(item => {
              const nodeData = JSON.parse(item.extraInfo);
              // 如果存在deviceInfo和onlineStatus，更新到assetData中
              if (item.deviceInfo && item.deviceInfo.onlineStatus !== undefined) {
                if (!nodeData.assetData) {
                  nodeData.assetData = {};
                }
                nodeData.assetData.onlineStatus = item.deviceInfo.onlineStatus;
              }
              // 使用deviceInfo.assetName更新节点label
              if (item.deviceInfo && item.deviceInfo.assetName) {
                nodeData.label = item.deviceInfo.assetName;
              }
              return nodeData;
            }) : [];

            // 解析文本节点和区域节点
            let extraNodes = [];
            if (this.tupuInfo.extraInfo) {
              try {
                extraNodes = JSON.parse(this.tupuInfo.extraInfo);
              } catch (e) {
                console.error('解析额外节点失败:', e);
                extraNodes = [];
              }
            }

            // 合并设备节点、文本节点和区域节点
            const allNodes = [...deviceNodes, ...extraNodes];

            this.graphData = {
              id: this.tupuInfo.id,
              name: this.tupuInfo.name,
              description: this.tupuInfo.description,
              nodes: allNodes,
              edges: this.tupuInfo.connectionList && this.tupuInfo.connectionList.length > 0 ? this.tupuInfo.connectionList.map(item => {
                return JSON.parse(item.extraInfo)
              }) : [],
            }
            console.log(this.graphData, ' this.graphData');

            let graphData = _.cloneDeep(this.graphData)
            this.$refs.topology.initTopo(graphData)
            // 确保初始化后应用正确的模式
            this.$refs.topology.changeGraphMode(graphData, this.graphMode)
          }

        })
      }
    },
    async handleGraphDataSave() {
      try {
        let { nodes, edges, groups, combos } = this.$refs.topology.getGraphData()
        console.log({ nodes, edges, groups, combos });

        // 上传图谱图片并获取相对路径
        if (nodes && nodes.length > 0) {
          this.imageUrl = await this.$refs.topology.uploadGraphImage()
        } else {
          this.imageUrl = '';
        }

        // 将节点分为设备节点、文本节点和区域节点
        const deviceNodes = [];
        const extraNodes = []; // 存储文本节点和区域节点

        nodes.forEach(item => {
          console.log(item.assetData, 'item.assetData');
          // 检查assetData是否存在，处理非设备节点的情况
          const hasAssetData = item.assetData && item.assetData.id;

          if (hasAssetData) {
            // 设备节点，保持在nodeList中
            deviceNodes.push({
              deviceId: item.assetData.id,
              nodeName: item.assetData.assetName,
              xCoordinate: item.x,
              yCoordinate: item.y,
              nodeType: 1, // 1表示设备节点
              styleConfig: '',
              extraInfo: JSON.stringify(item)
            });
          } else {
            // 非设备节点：文本节点或区域节点，添加到extraNodes数组
            if (item.type === 'cc-text' || item.type === 'cc-text-new' || item.type === 'region' || item.type === 'cc-region') {
              extraNodes.push(item);
            }
          }
        });

        // 设备节点列表
        this.nodeList = deviceNodes;
        // 文本节点和区域节点列表（作为extraInfo字段）
        this.extraNodes = extraNodes;
        this.connectionList = edges.map((val) => {
          return {
            sourceDeviceId: val.source,
            targetDeviceId: val.target,
            connectionType: 1,
            extraInfo: JSON.stringify(val)
          }
        })
        
        let params = {
          id: this.tupuInfo.id,
          name: this.tupuInfo.name,
          description: this.tupuInfo.description,
          nodeList: this.nodeList,
          connectionList: this.connectionList,
          // 保存文本节点和区域节点信息
          extraInfo: JSON.stringify(this.extraNodes),
          // 添加图谱图片相对路径
          imageUrl: this.imageUrl
        }
        
        updateTopology(params).then((res) => {
          console.log(res);
          if (res.data) {
            this.$message.success(this.$t('common.saveSuccess'))
          } else {
            this.$message.warning(this.$t('common.saveFailed'))
          }
        })
      } catch (error) {
        console.error('保存拓扑图失败:', error)
        this.$message.error(this.$t('common.saveError'))
      }
    },
    getRelatedData() {
      this.dataUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss')
      let graphData = _.cloneDeep(this.$refs.topology.getGraphData())
      let { nodes, edges } = graphData
      let randomNodeIds = getRandomArrayElements(nodes, 1).map(x => {
        return x.id
      })
      for (let i = 0, len = nodes.length; i < len; i++) {
        let node = nodes[i]
        console.log(node, 'node');

        if (randomNodeIds.indexOf(node.id) > -1) {
          node.description = `<p class="tooltips-title text-center">${node.label}</p>
                <table class="tooltips-table">
                <tr>
                <td style="text-align:left;color:#303133">${this.$t('common.nodeIp')}: ${node.assetData.modelName}</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#303133">${this.$t('common.deviceName')}: ${node.assetData.modelName}</td>
                </tr>
                <tr>
                <td style="text-align:left;color:#303133">${this.$t('common.createTime')}: ${node.assetData.createTime}</td>
                </tr>
                </table>`
          node.appState.alert = true
        } else {
          nodes[i].appState.alert = false
          nodes[i]['description'] = '<p class="tooltips-title text-center">' + this.$t('common.noData') + '</p>'
        }
      }
      this.$refs.topology.changeGraphData(graphData)
    }
  },
  watch: {
    graphMode(value) {
      console.log(value, '+++++');

      if (value === 'preview') {
        let theme = 'defaultStyle'
        this.$refs.topology.changeGraphTheme(theme)
      } else {
        let theme = 'defaultStyle'
        this.$refs.topology.changeGraphTheme(theme)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-container {
  height: 100%;

  .el-header {
    line-height: 60px;
    text-align: center;
    background-color: #FDFDFD;
    box-shadow: 0 2px 8px rgba(229, 229, 229, 0.5);

    .navbar-brand {
      cursor: pointer;
      display: flex;
      font-weight: 500;
      align-items: end;
      margin: 20px 18px 0 6px;
      line-height: 22px;
      font-size: 20px;
      color: #096dd9;

      img {
        vertical-align: middle;
      }

      span {
        vertical-align: middle;
        color: #096dd9;
      }
    }

    .navbar-title {
      vertical-align: middle;
      text-align: center;
      font-size: 20px;
    }

    .navbar-btns {
      vertical-align: middle;
      text-align: right;

      .el-button:last-child {
        margin-right: 20px;
      }

      .el-button--text {
        color: #06080A;
      }
    }
  }

  .el-main {
    margin: 0;
    padding: 0;
    text-align: center;
  }

  .el-footer {
    width: 100%;
    line-height: 55px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.45);
    background-color: #06080A;
    border: none;
    border-top: 1px solid rgba(197, 203, 217, 0.3);
  }
}
</style>