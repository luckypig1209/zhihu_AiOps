<template>
  <div class="topology" v-loading="loading">
    <el-row :class="graphBg" style="height: 100%" @contextmenu.native.prevent>
      <!-- toolbar -->
      <div v-if="toolbarShow && currentGraphMode === 'edit'">
        <toolbar-edit></toolbar-edit>
      </div>
      
      <!-- graph-pannel -->
      <el-col class="graph-pannel" v-if="currentGraphMode === 'edit' && graphPanelShow === true" :span="5">
        <div class="pannel-title">{{ $t('common.basicComponents') }}</div>
        <div class="pannel-body">
          <div class="node-type" style="height: 22px;" draggable="true"
            @dragstart="dragstartHandler($event, { label: $t('common.text'), type: 'cc-text', content: $t('common.doubleClickToEditText') })"
            @dragend="dragendHandler">
            {{ $t('common.text') }}
          </div>
          <div class="node-type" style="height: 22px;" draggable="true"
            @dragstart="dragstartHandler($event, { label: $t('common.region'), type: 'region', width: 300, height: 200, backgroundColor: 'rgba(15, 136, 242, 0.3)', borderColor: '#409EFF', borderWidth: 1 })"
            @dragend="dragendHandler">
            {{ $t('common.region') }}
          </div>
        </div>
        <div v-for="(item, index) in nodeTypeList" :key="index">
          <div class="pannel-title" @click="toggleAccordion(index)">
            <span>{{ item.resourceName }}</span>
            <i
              :class="['toggle-icon', expandedItems.includes(index) ? 'el-icon-arrow-down' : 'el-icon-arrow-right']"></i>
          </div>
          <div class="pannel-body" v-show="expandedItems.includes(index)">
            <div class="node-type" v-for="(nodeType, indexs) in item.device" :key="indexs">
              <img :src="nodeType.imgSrc" :alt="nodeType.label" :title="nodeType.desc" draggable="true"
                @dragstart="dragstartHandler($event, nodeType)" @dragend="dragendHandler(nodeType)">
              <label>{{ nodeType.label }}</label>
            </div>
          </div>
        </div>
      </el-col>
      
      <!-- graph-container -->
      <el-col class="graph-container" :span="currentGraphMode === 'edit' && graphPanelShow === true ? 19 : 24"
        ref="graphContainer">
        <div id="mount-topology" @dragenter="dragenterHandler" @dragover="dragoverHandler" @drop="dropHandler"></div>
      </el-col>
      <el-col class="graph-pannel" :span="currentGraphMode === 'edit' ? 0 : 0">
        <div v-if="currentFocus === 'edge'">
          <div class="pannel-title">{{ $t('common.edge') }}</div>
          <div class="pannel-body">
            <span>{{ $t('common.edgeLabel') }}</span>
            <el-input class="params-input" v-model="selectedEdgeParams.label" size="mini"></el-input>
            <div v-for="(value, key) in edgeAppConfig" :key="key">
              <span>{{ value }}</span>
              <el-input class="params-input" v-model="selectedEdgeParams.appConfig[key]" size="mini"></el-input>
            </div>
          </div>
        </div>
        <div v-else-if="currentFocus === 'combo'">
          <div class="pannel-title">{{ $t('common.group') }}</div>
          <div class="pannel-body">
            <span>{{ $t('common.groupLabel') }}</span>
            <el-input class="params-input" v-model="selectedComboParams.label" size="mini"></el-input>
            <span>{{ $t('common.labelPosition') }}</span>
            <el-select class="params-select" v-model="selectedComboParams.labelPosition" placeholder="请选择" size="mini">
              <el-option label="top" value="top"></el-option>
              <el-option label="left" value="left"></el-option>
              <el-option label="right" value="right"></el-option>
              <el-option label="bottom" value="bottom"></el-option>
              <el-option label="center" value="center"></el-option>
            </el-select>
            <span>{{ $t('common.horizontalOffset') }}</span>
            <el-input-number class="params-input-number" v-model="selectedComboParams.labelRefX" :controls="false"
              :min="-100" :max="100" label="标签水平方向偏移" size="mini">
            </el-input-number>
            <span>{{ $t('common.verticalOffset') }}</span>
            <el-input-number class="params-input-number" v-model="selectedComboParams.labelRefY" :controls="false"
              :min="-100" :max="100" label="标签水平方向偏移" size="mini">
            </el-input-number>
            <span>{{ $t('common.groupShape') }}</span>
            <el-select class="params-select" v-model="selectedComboParams.type" placeholder="请选择" size="mini">
              <el-option label="circle" value="circle"></el-option>
              <el-option label="rect" value="rect"></el-option>
            </el-select>
          </div>
        </div>
        <div v-else>
          <div class="pannel-title">{{ $t('common.node') }}</div>
          <div class="pannel-body">
            <span>{{ $t('common.nodeLabel') }}</span>
            <el-input class="params-input" v-model="selectedNodeParams.label" size="mini"></el-input>
            <div v-for="(value, key) in nodeAppConfig" :key="key">
              <span>{{ value }}</span>
              <el-input class="params-input" v-model="selectedNodeParams.appConfig[key]" size="mini"></el-input>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-dialog :title="$t('common.resourceList')" :visible.sync="ziyuanDialogShow" v-if="ziyuanDialogShow" :loading="loading" width="80%"
      @close="closeResourceDialog">
      <div style="position: absolute; top: 0; left: 0; padding: 12px 26px; z-index: 10; font-weight: 600;font-size: 18px;">
        {{ nodeTypeInfo.label }}
      </div>
      
      <!-- 文字样式配置区域 -->
      <div v-if="currentDragInfo.nodeType && currentDragInfo.nodeType.type === 'cc-image'" style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e4e7ed;">
        <div style="font-weight: 600; margin-bottom: 10px; color: #333; font-size: 14px;">{{ $t('common.textStyleConfig') }}</div>
        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center;">
            <span style="min-width: 60px; margin-right: 8px;">{{ $t('common.textColor') }}：</span>
            <el-color-picker v-model="dragTextStyle.color" show-alpha size="small"></el-color-picker>
            <span style="margin-left: 8px; color: #666; font-size: 12px;">{{ dragTextStyle.color }}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="min-width: 60px; margin-right: 8px;">{{ $t('common.fontSize') }}：</span>
            <el-input-number v-model="dragTextStyle.fontSize" :min="8" :max="36" size="small" style="width: 100px;"></el-input-number>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="min-width: 60px; margin-right: 8px;">{{ $t('common.fontWeight') }}：</span>
            <el-select v-model="dragTextStyle.fontWeight" placeholder="请选择" size="small" style="width: 100px;">
              <el-option :label="$t('common.normalFont')" value="normal"></el-option>
                <el-option :label="$t('common.boldFont')" value="bold"></el-option>
                <el-option :label="$t('common.lightFont')" value="lighter"></el-option>
            </el-select>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="min-width: 60px; margin-right: 8px;">{{ $t('common.textPosition') }}：</span>
            <el-select v-model="dragTextStyle.position" placeholder="请选择" size="small" style="width: 100px;">
              <el-option label="底部" value="bottom"></el-option>
              <el-option label="顶部" value="top"></el-option>
              <el-option label="左侧" value="left"></el-option>
              <el-option label="右侧" value="right"></el-option>
              <el-option label="居中" value="center"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      
      <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }" style="font-size: 16px">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item :label="$t('common.name')">
              <a-input v-model="queryForms.name" :placeholder="$t('common.pleaseEnterName')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item :label="$t('common.ip')">
              <a-input v-model="queryForms.ip" :placeholder="$t('common.pleaseEnterIp')" allowClear style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8" style="margin-top: 3px; display: flex">
            <a-button type="primary" ghost @click="getList"> {{ $t('common.query') }} </a-button>
            <a-button type="primary" ghost style="margin-left: 12px" @click="handleReset">{{ $t('common.reset') }}</a-button>
          </a-col>
        </a-row>
      </a-form>
      <el-table v-loading="loading" :data="tableData" class="tableClass" border @select="handleSelect" ref="tableRef">
        <el-table-column type="selection" width="55" :selectable="isRowSelectable">
        </el-table-column>
        <el-table-column :label="$t('common.name')" align="center" :show-overflow-tooltip="true">
          <template v-slot="scope">
            <span>{{ scope.row.assetName }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.ip')" align="center">
          <template v-slot="scope">
            <span>{{ scope.row.assetAttribute.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.port')" align="center">
          <template v-slot="scope">
            <span>{{ scope.row.assetAttribute.port }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.monitoringStatus')" align="center">
          <template v-slot="scope">
            <span
              :style="{ color: scope.row.onlineStatus == '2' ? '#E6A23C' : scope.row.onlineStatus == '3' ? '#F56C6C' : '' }">
              {{ 
                scope.row.onlineStatus == "0" ? $t('common.notMonitored') :
                scope.row.onlineStatus == "1" ? $t('common.normal') :
                scope.row.onlineStatus == "2" ? $t('common.alarm') : $t('common.exception') 
              }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.deliveryStatus')" align="center">
          <template v-slot="scope">
            <span
              :style="{ color: scope.row.snmpStatus == '3' ? '#E6A23C' : scope.row.snmpStatus == '2' ? '#67C23A' : '' }">
              {{ 
                scope.row.snmpStatus == "0" ? $t('common.notDelivered') : 
                scope.row.snmpStatus == "2" ? $t('common.deliverySuccess') : $t('common.deliveryFailed') 
              }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeResourceDialog">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="addTpSubmit">{{ $t('common.confirm') }}</el-button>
      </div>
    </el-dialog>

    <!-- 文本编辑弹窗（仅用于cc-text节点） -->
    <el-dialog :title="textEditDialog.title" :visible.sync="textEditDialog.visible" width="500px" append-to-body
      @closed="resetTextEditForm">
      <el-form ref="textEditForm" :model="textEditDialog.form" :rules="textEditDialog.rules" label-width="80px">
        <el-form-item :label="$t('common.text')" prop="text">
          <el-input v-model="textEditDialog.form.text" :placeholder="$t('common.pleaseEnterTextContent')" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('common.textColor')" prop="color">
          <div style="display: flex; align-items: center;">
            <el-color-picker v-model="textEditDialog.form.color" show-alpha />
            <span style="margin-left: 10px; color: #666">{{ textEditDialog.form.color }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('common.fontSize')" prop="fontSize">
          <el-input-number v-model="textEditDialog.form.fontSize" :min="8" :max="72" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('common.fontWeight')" prop="fontWeight">
          <el-select v-model="textEditDialog.form.fontWeight" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option :label="$t('common.normalFont')" value="normal"></el-option>
                <el-option :label="$t('common.boldFont')" value="bold"></el-option>
                <el-option :label="$t('common.lightFont')" value="lighter"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeTextEditDialog">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveTextEdit">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
    
    <!-- 区域编辑弹窗 -->
    <el-dialog 
      :title="regionEditDialog.title" 
      :visible.sync="regionEditDialog.visible" 
      width="600px" 
      append-to-body 
      @closed="resetRegionEditForm"
    >
      <el-form 
        ref="regionEditForm" 
        :model="regionEditDialog.form" 
        :rules="regionEditDialog.rules" 
        label-width="100px"
      >
        <!-- 区域文字 - 单独一列 -->
        <el-form-item :label="$t('common.region') + $t('common.text')" prop="text">
          <el-input v-model="regionEditDialog.form.text" :placeholder="$t('common.pleaseEnterRegionTextContent')" style="width: 100%" />
        </el-form-item>

        <!-- 文字颜色 - 单独一列 -->
        <el-form-item :label="$t('common.textColor')" prop="textColor">
          <div style="display: flex; align-items: center;">
            <el-color-picker v-model="regionEditDialog.form.textColor" show-alpha />
            <span style="margin-left: 10px; color: #666">{{ regionEditDialog.form.textColor }}</span>
          </div>
        </el-form-item>

        <!-- 字体大小 + 字体粗细 - 同一行两列 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('common.fontSize')" prop="fontSize">
              <el-input-number v-model="regionEditDialog.form.fontSize" :min="8" :max="36" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('common.fontWeight')" prop="fontWeight">
              <el-select v-model="regionEditDialog.form.fontWeight" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
                <el-option :label="$t('common.normalFont')" value="normal"></el-option>
                <el-option :label="$t('common.boldFont')" value="bold"></el-option>
                <el-option :label="$t('common.lightFont')" value="lighter"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 背景颜色 - 单独一列 -->
        <el-form-item :label="$t('common.backgroundColor')" prop="backgroundColor">
          <div style="display: flex; align-items: center;">
            <el-color-picker v-model="regionEditDialog.form.backgroundColor" show-alpha />
            <span style="margin-left: 10px; color: #666">{{ regionEditDialog.form.backgroundColor }}</span>
          </div>
        </el-form-item>

        <!-- 边框颜色 - 单独一列 -->
        <el-form-item :label="$t('common.borderColor')" prop="borderColor">
          <div style="display: flex; align-items: center;">
            <el-color-picker v-model="regionEditDialog.form.borderColor" show-alpha />
            <span style="margin-left: 10px; color: #666">{{ regionEditDialog.form.borderColor }}</span>
          </div>
        </el-form-item>

        <!-- 边框宽度 + 圆角半径 - 同一行两列 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('common.borderWidth')" prop="borderWidth">
              <el-input-number v-model="regionEditDialog.form.borderWidth" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('common.borderRadius')" prop="radius">
              <el-input-number v-model="regionEditDialog.form.radius" :min="0" :max="50" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 透明度 - 单独一列 -->
        <el-form-item :label="$t('common.opacity')" prop="opacity">
          <el-slider v-model="regionEditDialog.form.opacity" :min="0" :max="100" :step="10" show-input />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeRegionEditDialog">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveRegionEdit">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
    
    <!-- 节点文字编辑弹窗（仅用于cc-image节点） -->
    <el-dialog :title="nodeTextEditDialog.title" :visible.sync="nodeTextEditDialog.visible" width="500px" append-to-body
      @closed="resetNodeTextEditForm">
      <el-form ref="nodeTextEditForm" :model="nodeTextEditDialog.form" :rules="nodeTextEditDialog.rules" label-width="100px">
        <el-form-item :label="$t('common.nodeLabel')" prop="label">
          <el-input v-model="nodeTextEditDialog.form.label" :placeholder="$t('common.pleaseEnterNodeLabel')" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('common.textColor')" prop="color">
          <div style="display: flex; align-items: center;">
            <el-color-picker v-model="nodeTextEditDialog.form.color" show-alpha />
            <span style="margin-left: 10px; color: #666">{{ nodeTextEditDialog.form.color }}</span>
          </div>
        </el-form-item>
        <el-form-item :label="$t('common.fontSize')" prop="fontSize">
          <el-input-number v-model="nodeTextEditDialog.form.fontSize" :min="8" :max="36" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('common.fontWeight')" prop="fontWeight">
          <el-select v-model="nodeTextEditDialog.form.fontWeight" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option :label="$t('common.normalFont')" value="normal"></el-option>
            <el-option :label="$t('common.boldFont')" value="bold"></el-option>
            <el-option :label="$t('common.lightFont')" value="lighter"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('common.textPosition')" prop="position">
          <el-select v-model="nodeTextEditDialog.form.position" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
            <el-option :label="$t('common.bottom')" value="bottom"></el-option>
            <el-option :label="$t('common.top')" value="top"></el-option>
            <el-option :label="$t('common.left')" value="left"></el-option>
            <el-option :label="$t('common.right')" value="right"></el-option>
            <el-option :label="$t('common.center')" value="center"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeNodeTextEditDialog">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="saveNodeTextEdit">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { alarmList, alarmListNew } from "@/api/fault";
import { uploadFile } from "@/api/topology";
import _ from 'lodash'
import G6 from '@antv/g6'
import ToolbarPreview from './toolbar-preview'
import ToolbarEdit from './toolbar-edit'
import registerEdge from './edge'
import ccNode from './node'
import ccBehavior from './behavior'
import config from './config'
import theme from './theme'
import initGraph from './graph'
import utils from './utils'
import {
  updateTopology,
  getPageInfo,
  alarmListss
} from "@/api/topology";

ccNode.register(G6)
ccBehavior.register(G6)

// ==================== 优化后的区域节点类型注册（只使用text属性） ====================
G6.registerNode('region', {
  // 绘制区域节点
  draw(cfg, group) {
    const {
      width = 300,
      height = 200,
      backgroundColor = 'rgba(15, 136, 242, 0.3)',
      borderColor = '#409EFF',
      borderWidth = 1,
      radius = 4,
      opacity = 30,
      text = '区域', // 只使用text属性
      textColor = '#ffffff',
      fontSize = 12,
      fontWeight = 'bold',
      resizable = true
    } = cfg;
    
    // 1. 创建主矩形（背景）
    const rect = group.addShape('rect', {
      attrs: {
        x: -width / 2,
        y: -height / 2,
        width,
        height,
        fill: backgroundColor,
        stroke: borderColor,
        lineWidth: borderWidth,
        radius,
        opacity: opacity / 100
      },
      name: 'region-bg',
      draggable: false,
      capture: false
    });
    
    // 2. 创建标签区域（顶部条）
    const labelBarHeight = 24;
    const labelBar = group.addShape('rect', {
      attrs: {
        x: -width / 2,
        y: -height / 2,
        width,
        height: labelBarHeight,
        fill: borderColor,
        stroke: borderColor,
        lineWidth: 0,
        radius: [radius, radius, 0, 0],
        opacity: 0.2,
        cursor: 'move'
      },
      name: 'region-label-bar',
      draggable: true
    });
    
    // 3. 创建标签文字（使用text属性）
    const labelText = group.addShape('text', {
      attrs: {
        x: 0,
        y: -height / 2 + labelBarHeight / 2,
        text: text || '区域',
        fill: textColor,
        fontSize: fontSize,
        fontWeight: fontWeight,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'move'
      },
      name: 'region-label',
      draggable: true
    });
    
    // 4. 创建删除按钮
    const deleteButton = group.addShape('circle', {
      attrs: {
        x: width / 2 - 12,
        y: -height / 2 + 12,
        r: 8,
        fill: '#F56C6C',
        stroke: '#fff',
        lineWidth: 1,
        cursor: 'pointer',
        opacity: 0,
        shadowColor: '#F56C6C',
        shadowBlur: 4
      },
      name: 'region-delete-button'
    });
    
    const deleteIcon = group.addShape('text', {
      attrs: {
        x: width / 2 - 12,
        y: -height / 2 + 12,
        text: '×',
        fill: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
        opacity: 0
      },
      name: 'region-delete-icon'
    });
    
    // 5. 如果支持调整大小，添加控制点
    if (resizable) {
      const handleSize = 3;
      const handleOpacity = 0.9;
      
      const corners = [
        { name: 'region-resize-nw', x: -width / 2, y: -height / 2, cursor: 'nw-resize' },
        { name: 'region-resize-ne', x: width / 2, y: -height / 2, cursor: 'ne-resize' },
        { name: 'region-resize-sw', x: -width / 2, y: height / 2, cursor: 'sw-resize' },
        { name: 'region-resize-se', x: width / 2, y: height / 2, cursor: 'se-resize' }
      ];
      
      corners.forEach(corner => {
        group.addShape('circle', {
          attrs: {
            x: corner.x,
            y: corner.y,
            r: handleSize,
            fill: borderColor,
            stroke: '#fff',
            lineWidth: 1,
            cursor: corner.cursor,
            opacity: handleOpacity
          },
          name: corner.name
        });
      });
    }
    
    return rect;
  },
  
  // 更新区域节点
  update(cfg, node) {
    const group = node.getContainer();
    
    const {
      width = 300,
      height = 200,
      backgroundColor = 'rgba(15, 136, 242, 0.3)',
      borderColor = '#409EFF',
      borderWidth = 1,
      radius = 4,
      opacity = 30,
      text = '区域', // 只使用text属性
      textColor = '#ffffff',
      fontSize = 12,
      fontWeight = 'bold',
      resizable = true
    } = cfg;
    
    const labelBarHeight = 24;
    
    // 更新所有子图形
    ['region-bg', 'region-label-bar', 'region-label', 'region-delete-button', 'region-delete-icon'].forEach(name => {
      const shape = group.find(ele => ele.get('name') === name);
      if (!shape) return;
      
      switch(name) {
        case 'region-bg':
          shape.attr({
            x: -width / 2,
            y: -height / 2,
            width,
            height,
            fill: backgroundColor,
            stroke: borderColor,
            lineWidth: borderWidth,
            radius,
            opacity: opacity / 100
          });
          break;
          
        case 'region-label-bar':
          shape.attr({
            x: -width / 2,
            y: -height / 2,
            width,
            height: labelBarHeight,
            fill: borderColor,
            stroke: borderColor,
            radius: [radius, radius, 0, 0]
          });
          break;
          
        case 'region-label':
          shape.attr({
            x: 0,
            y: -height / 2 + labelBarHeight / 2,
            text: text || '区域',
            fill: textColor,
            fontSize: fontSize,
            fontWeight: fontWeight
          });
          break;
          
        case 'region-delete-button':
          shape.attr({
            x: width / 2 - 12,
            y: -height / 2 + 12
          });
          break;
          
        case 'region-delete-icon':
          shape.attr({
            x: width / 2 - 12,
            y: -height / 2 + 12
          });
          break;
      }
    });
    
    // 更新控制点
    const cornerNames = ['region-resize-nw', 'region-resize-ne', 'region-resize-sw', 'region-resize-se'];
    
    if (resizable) {
      const handleSize = 6;
      const corners = [
        { name: 'region-resize-nw', x: -width / 2, y: -height / 2 },
        { name: 'region-resize-ne', x: width / 2, y: -height / 2 },
        { name: 'region-resize-sw', x: -width / 2, y: height / 2 },
        { name: 'region-resize-se', x: width / 2, y: height / 2 }
      ];
      
      corners.forEach(corner => {
        let shape = group.find(ele => ele.get('name') === corner.name);
        if (!shape) {
          shape = group.addShape('circle', {
            attrs: {
              x: corner.x,
              y: corner.y,
              r: handleSize,
              fill: borderColor,
              stroke: '#fff',
              lineWidth: 1,
              cursor: corner.name.includes('nw') ? 'nw-resize' :
                      corner.name.includes('ne') ? 'ne-resize' :
                      corner.name.includes('sw') ? 'sw-resize' :
                      'se-resize',
              opacity: 0.9
            },
            name: corner.name
          });
        } else {
          shape.attr({
            x: corner.x,
            y: corner.y
          });
        }
      });
      
      // 移除不需要的控制点
      cornerNames.forEach(name => {
        if (!corners.find(c => c.name === name)) {
          const shape = group.find(ele => ele.get('name') === name);
          if (shape) shape.remove();
        }
      });
    } else {
      // 移除所有控制点
      cornerNames.forEach(name => {
        const shape = group.find(ele => ele.get('name') === name);
        if (shape) shape.remove();
      });
    }
  },
  
  getAnchorPoints() {
    return [
      [0, 0], [0.5, 0], [1, 0],
      [0, 0.5], [1, 0.5],
      [0, 1], [0.5, 1], [1, 1]
    ];
  }
});

// ==================== 优化后的文本节点（支持悬浮删除） ====================
G6.registerNode('cc-text', {
  draw(cfg, group) {
    const {
      text = '双击编辑文字', // 使用text属性
      color = '#333333',
      fontSize = 14,
      fontWeight = 'normal',
      x = 0,
      y = 0
    } = cfg;
    
    // 1. 创建文本形状
    const textShape = group.addShape('text', {
      attrs: {
        x: 0,
        y: 0,
        text: text,
        fill: color,
        fontSize: fontSize,
        fontWeight: fontWeight,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer'
      },
      name: 'text-shape',
      draggable: true
    });
    
    // 2. 根据文本内容调整节点大小
    const bbox = textShape.getBBox();
    const padding = 8; // 增加padding以便显示删除按钮
    
    // 3. 创建背景矩形
    const rect = group.addShape('rect', {
      attrs: {
        x: -bbox.width / 2 - padding,
        y: -bbox.height / 2 - padding,
        width: bbox.width + padding * 2,
        height: bbox.height + padding * 2,
        fill: 'rgba(255, 255, 255, 0.8)',
        stroke: 'rgba(220, 223, 230, 0.5)',
        lineWidth: 1,
        radius: 4,
        cursor: 'pointer',
        opacity: 0
      },
      name: 'text-bg',
      draggable: true
    });
    
    // 4. 创建删除按钮（圆形）
    const deleteButton = group.addShape('circle', {
      attrs: {
        x: bbox.width / 2 + padding - 10,
        y: -bbox.height / 2 - padding + 10,
        r: 8,
        fill: '#F56C6C',
        stroke: '#fff',
        lineWidth: 1.5,
        cursor: 'pointer',
        opacity: 0, // 默认隐藏
        shadowColor: '#F56C6C',
        shadowBlur: 4
      },
      name: 'text-delete-button'
    });
    
    // 5. 创建删除图标（叉号）
    const deleteIcon = group.addShape('text', {
      attrs: {
        x: bbox.width / 2 + padding - 10,
        y: -bbox.height / 2 - padding + 10,
        text: '×',
        fill: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
        opacity: 0 // 默认隐藏
      },
      name: 'text-delete-icon'
    });
    
    // 6. 创建编辑提示图标（铅笔）
    const editIcon = group.addShape('text', {
      attrs: {
        x: -bbox.width / 2 - padding + 10,
        y: -bbox.height / 2 - padding + 10,
        text: '',
        fill: '#409EFF',
        fontSize: 10,
        textAlign: 'center',
        textBaseline: 'middle',
        cursor: 'pointer',
        opacity: 0 // 默认隐藏
      },
      name: 'text-edit-icon'
    });
    
    // 将背景矩形放到文本后面
    rect.toBack();
    
    return rect;
  },
  
  update(cfg, node) {
    const group = node.getContainer();
    
    // 查找并更新文本形状
    const textShape = group.find(ele => ele.get('name') === 'text-shape');
    const bgShape = group.find(ele => ele.get('name') === 'text-bg');
    const deleteButton = group.find(ele => ele.get('name') === 'text-delete-button');
    const deleteIcon = group.find(ele => ele.get('name') === 'text-delete-icon');
    const editIcon = group.find(ele => ele.get('name') === 'text-edit-icon');
    
    if (textShape) {
      textShape.attr({
        text: cfg.text || '双击编辑文字',
        fill: cfg.color || '#333333',
        fontSize: cfg.fontSize || 14,
        fontWeight: cfg.fontWeight || 'normal'
      });
      
      // 更新背景和按钮位置
      const bbox = textShape.getBBox();
      const padding = 8;
      
      if (bgShape) {
        bgShape.attr({
          x: -bbox.width / 2 - padding,
          y: -bbox.height / 2 - padding,
          width: bbox.width + padding * 2,
          height: bbox.height + padding * 2
        });
      }
      
      if (deleteButton) {
        deleteButton.attr({
          x: bbox.width / 2 + padding - 10,
          y: -bbox.height / 2 - padding + 10
        });
      }
      
      if (deleteIcon) {
        deleteIcon.attr({
          x: bbox.width / 2 + padding - 10,
          y: -bbox.height / 2 - padding + 10
        });
      }
      
      if (editIcon) {
        editIcon.attr({
          x: -bbox.width / 2 - padding + 10,
          y: -bbox.height / 2 - padding + 10
        });
      }
    }
  },
  
  getAnchorPoints() {
    return [];
  }
});

// ==================== 优化后的区域节点行为，扩展支持文本节点 ====================
G6.registerBehavior('drag-resize-region', {
  getEvents() {
    return {
      'node:mousedown': 'onMousedown',
      'mousemove': 'onMousemove',
      'mouseup': 'onMouseup',
      'node:click': 'onNodeClick',
      'node:mouseenter': 'onNodeMouseenter',
      'node:mouseleave': 'onNodeMouseleave',
      'node:dragstart': 'onNodeDragstart',
      'node:drag': 'onNodeDrag',
      'node:dragend': 'onNodeDragend',
      'node:dblclick': 'onNodeDblclick'
    };
  },
  
  isInLabelBar(ev, node) {
    const model = node.getModel();
    const width = model.width || 300;
    const height = model.height || 200;
    const labelBarHeight = 24;
    
    const nodeX = model.x;
    const nodeY = model.y;
    
    const relX = ev.x - nodeX;
    const relY = ev.y - nodeY;
    
    return relY >= -height/2 && relY <= -height/2 + labelBarHeight &&
           relX >= -width/2 && relX <= width/2;
  },
  
  onNodeClick(ev) {
    const shape = ev.target;
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    const shapeName = shape.get('name');
    
    // 处理区域节点删除
    if (nodeType === 'region') {
      if (shapeName && (shapeName === 'region-delete-button' || shapeName === 'region-delete-icon')) {
        const graph = this.graph;
        graph.removeItem(node);
        ev.stopPropagation();
        return;
      }
    }
    
    // 处理文本节点删除
    if (nodeType === 'cc-text') {
      if (shapeName && (shapeName === 'text-delete-button' || shapeName === 'text-delete-icon')) {
        const graph = this.graph;
        graph.removeItem(node);
        ev.stopPropagation();
        return;
      }
      
      // 处理文本节点编辑图标点击
      if (shapeName && shapeName === 'text-edit-icon') {
        this.graph.emit('text-edit-click', { node });
        ev.stopPropagation();
      }
    }
  },
  
  onNodeDblclick(ev) {
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    if (nodeType === 'region') {
      if (this.isInLabelBar(ev, node)) {
        this.graph.emit('region-edit-click', { node });
        ev.preventDefault();
        ev.stopPropagation();
      }
    } else if (nodeType === 'cc-text') {
      // 文本节点双击编辑
      ev.preventDefault();
      ev.stopPropagation();
      this.graph.emit('text-edit-click', { node });
    } else if (nodeType === 'cc-image') {
      // 图片节点双击编辑文字
      ev.preventDefault();
      ev.stopPropagation();
      this.graph.emit('node-text-edit-click', { node });
    }
  },
  
  onNodeMouseenter(ev) {
    const shape = ev.target;
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    const group = node.getContainer();
    const container = this.graph.getContainer();
    
    // 区域节点鼠标悬停效果
    if (nodeType === 'region') {
      const shapeName = shape.get('name');
      const inLabelBar = this.isInLabelBar(ev, node);
      
      if (inLabelBar) {
        const deleteButton = group.find(ele => ele.get('name') === 'region-delete-button');
        const deleteIcon = group.find(ele => ele.get('name') === 'region-delete-icon');
        
        if (deleteButton) {
          deleteButton.attr('opacity', 1);
        }
        if (deleteIcon) {
          deleteIcon.attr('opacity', 1);
        }
      }
      
      if (shapeName && shapeName.includes('resize')) {
        if (shapeName.includes('nw') || shapeName.includes('se')) {
          container.style.cursor = shapeName.includes('nw') ? 'nw-resize' : 'se-resize';
        } else if (shapeName.includes('ne') || shapeName.includes('sw')) {
          container.style.cursor = shapeName.includes('ne') ? 'ne-resize' : 'sw-resize';
        }
      } else if (shapeName && (shapeName === 'region-delete-button' || shapeName === 'region-delete-icon')) {
        container.style.cursor = 'pointer';
      } else if ((shapeName === 'region-label' || shapeName === 'region-label-bar') && inLabelBar) {
        container.style.cursor = 'move';
      } else {
        container.style.cursor = 'default';
      }
    }
    
    // 文本节点鼠标悬停效果
    if (nodeType === 'cc-text') {
      // 显示删除按钮和编辑图标
      const deleteButton = group.find(ele => ele.get('name') === 'text-delete-button');
      const deleteIcon = group.find(ele => ele.get('name') === 'text-delete-icon');
      const editIcon = group.find(ele => ele.get('name') === 'text-edit-icon');
      const bgShape = group.find(ele => ele.get('name') === 'text-bg');
      
      if (deleteButton) {
        deleteButton.attr('opacity', 1);
      }
      if (deleteIcon) {
        deleteIcon.attr('opacity', 1);
      }
      if (editIcon) {
        editIcon.attr('opacity', 1);
      }
      if (bgShape) {
        bgShape.attr({
          fill: 'rgba(255, 255, 255, 0.95)',
          stroke: 'rgba(220, 223, 230, 0.8)',
          lineWidth: 1.5
        });
      }
      
      // 更新光标样式
      const shapeName = shape.get('name');
      if (shapeName && (shapeName === 'text-delete-button' || shapeName === 'text-delete-icon')) {
        container.style.cursor = 'pointer';
      } else if (shapeName && shapeName === 'text-edit-icon') {
        container.style.cursor = 'pointer';
      } else {
        container.style.cursor = 'move';
      }
    }
  },
  
  onNodeMouseleave(ev) {
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    const group = node.getContainer();
    
    // 区域节点鼠标离开效果
    if (nodeType === 'region') {
      const deleteButton = group.find(ele => ele.get('name') === 'region-delete-button');
      const deleteIcon = group.find(ele => ele.get('name') === 'region-delete-icon');
      
      if (deleteButton) {
        deleteButton.attr('opacity', 0);
      }
      if (deleteIcon) {
        deleteIcon.attr('opacity', 0);
      }
    }
    
    // 文本节点鼠标离开效果
    if (nodeType === 'cc-text') {
      // 隐藏删除按钮和编辑图标
      const deleteButton = group.find(ele => ele.get('name') === 'text-delete-button');
      const deleteIcon = group.find(ele => ele.get('name') === 'text-delete-icon');
      const editIcon = group.find(ele => ele.get('name') === 'text-edit-icon');
      const bgShape = group.find(ele => ele.get('name') === 'text-bg');
      
      if (deleteButton) {
        deleteButton.attr('opacity', 0);
      }
      if (deleteIcon) {
        deleteIcon.attr('opacity', 0);
      }
      if (editIcon) {
        editIcon.attr('opacity', 0);
      }
      if (bgShape) {
        bgShape.attr({
          fill: 'rgba(255, 255, 255, 0.8)',
          stroke: 'rgba(220, 223, 230, 0.5)',
          lineWidth: 1
        });
      }
    }
    
    const container = this.graph.getContainer();
    container.style.cursor = 'default';
  },
  
  onNodeDragstart(ev) {
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    const shape = ev.target;
    const shapeName = shape.get('name');
    
    // 区域节点拖动
    if (nodeType === 'region') {
      if (shapeName === 'region-label' || shapeName === 'region-label-bar') {
        if (this.isInLabelBar(ev, node)) {
          this.graph.set('draggingRegion', true);
          this.graph.set('draggingRegionNode', node);
          this.graph.set('draggingRegionStartPoint', { x: ev.x, y: ev.y });
          
          const model = node.getModel();
          this.graph.set('draggingRegionOriginalPos', {
            x: model.x,
            y: model.y
          });
          
          ev.stopPropagation();
        }
      }
    }
    
    // 文本节点拖动
    if (nodeType === 'cc-text') {
      // 如果点击的是删除按钮或编辑图标，不触发拖动
      if (shapeName && (shapeName === 'text-delete-button' || shapeName === 'text-delete-icon' || shapeName === 'text-edit-icon')) {
        ev.stopPropagation();
        return;
      }
      
      // 文本节点可以整体拖动
      this.graph.set('draggingText', true);
      this.graph.set('draggingTextNode', node);
      this.graph.set('draggingTextStartPoint', { x: ev.x, y: ev.y });
      
      const model = node.getModel();
      this.graph.set('draggingTextOriginalPos', {
        x: model.x,
        y: model.y
      });
    }
  },
  
  onNodeDrag(ev) {
    // 区域节点拖动
    if (this.graph.get('draggingRegion')) {
      const node = this.graph.get('draggingRegionNode');
      const startPoint = this.graph.get('draggingRegionStartPoint');
      const originalPos = this.graph.get('draggingRegionOriginalPos');
      
      if (!node || !startPoint || !originalPos) return;
      
      const dx = ev.x - startPoint.x;
      const dy = ev.y - startPoint.y;
      
      const newX = originalPos.x + dx;
      const newY = originalPos.y + dy;
      
      this.graph.updateItem(node, {
        x: newX,
        y: newY
      });
      
      this.graph.set('draggingRegionStartPoint', { x: ev.x, y: ev.y });
      this.graph.set('draggingRegionOriginalPos', { x: newX, y: newY });
      
      ev.stopPropagation();
    }
    
    // 文本节点拖动
    if (this.graph.get('draggingText')) {
      const node = this.graph.get('draggingTextNode');
      const startPoint = this.graph.get('draggingTextStartPoint');
      const originalPos = this.graph.get('draggingTextOriginalPos');
      
      if (!node || !startPoint || !originalPos) return;
      
      const dx = ev.x - startPoint.x;
      const dy = ev.y - startPoint.y;
      
      const newX = originalPos.x + dx;
      const newY = originalPos.y + dy;
      
      this.graph.updateItem(node, {
        x: newX,
        y: newY
      });
      
      this.graph.set('draggingTextStartPoint', { x: ev.x, y: ev.y });
      this.graph.set('draggingTextOriginalPos', { x: newX, y: newY });
      
      ev.stopPropagation();
    }
  },
  
  onNodeDragend(ev) {
    if (this.graph.get('draggingRegion')) {
      this.graph.set('draggingRegion', false);
      this.graph.set('draggingRegionNode', null);
      this.graph.set('draggingRegionStartPoint', null);
      this.graph.set('draggingRegionOriginalPos', null);
    }
    
    if (this.graph.get('draggingText')) {
      this.graph.set('draggingText', false);
      this.graph.set('draggingTextNode', null);
      this.graph.set('draggingTextStartPoint', null);
      this.graph.set('draggingTextOriginalPos', null);
    }
  },
  
  onMousedown(ev) {
    const shape = ev.target;
    const node = ev.item;
    if (!node) return;
    
    const nodeType = node.getModel().type;
    
    if (nodeType !== 'region') return;
    
    const shapeName = shape.get('name');
    
    if (shapeName && shapeName.includes('resize') && 
        (shapeName === 'region-resize-nw' || shapeName === 'region-resize-ne' ||
         shapeName === 'region-resize-sw' || shapeName === 'region-resize-se')) {
      this.graph.set('regionResizing', true);
      this.graph.set('regionResizeNode', node);
      this.graph.set('regionResizeHandle', shapeName);
      this.graph.set('regionStartPoint', { x: ev.x, y: ev.y });
      
      const model = node.getModel();
      this.graph.set('regionOriginalSize', {
        width: model.width || 300,
        height: model.height || 200,
        x: model.x,
        y: model.y
      });
      
      ev.stopPropagation();
    }
  },
  
  onMousemove(ev) {
    if (!this.graph.get('regionResizing')) return;
    
    const node = this.graph.get('regionResizeNode');
    const handleName = this.graph.get('regionResizeHandle');
    const startPoint = this.graph.get('regionStartPoint');
    const originalSize = this.graph.get('regionOriginalSize');
    
    if (!node || !handleName || !startPoint || !originalSize) return;
    
    const dx = ev.x - startPoint.x;
    const dy = ev.y - startPoint.y;
    
    let newWidth = originalSize.width;
    let newHeight = originalSize.height;
    let newX = originalSize.x;
    let newY = originalSize.y;
    
    switch (handleName) {
      case 'region-resize-nw':
        newWidth = Math.max(100, originalSize.width - dx);
        newHeight = Math.max(100, originalSize.height - dy);
        newX = originalSize.x + dx / 2;
        newY = originalSize.y + dy / 2;
        break;
        
      case 'region-resize-ne':
        newWidth = Math.max(100, originalSize.width + dx);
        newHeight = Math.max(100, originalSize.height - dy);
        newX = originalSize.x + dx / 2;
        newY = originalSize.y + dy / 2;
        break;
        
      case 'region-resize-sw':
        newWidth = Math.max(100, originalSize.width - dx);
        newHeight = Math.max(100, originalSize.height + dy);
        newX = originalSize.x + dx / 2;
        newY = originalSize.y + dy / 2;
        break;
        
      case 'region-resize-se':
        newWidth = Math.max(100, originalSize.width + dx);
        newHeight = Math.max(100, originalSize.height + dy);
        newX = originalSize.x + dx / 2;
        newY = originalSize.y + dy / 2;
        break;
    }
    
    this.graph.updateItem(node, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY
    });
  },
  
  onMouseup() {
    if (this.graph.get('regionResizing')) {
      this.graph.set('regionResizing', false);
      this.graph.set('regionResizeNode', null);
      this.graph.set('regionResizeHandle', null);
      this.graph.set('regionStartPoint', null);
      this.graph.set('regionOriginalSize', null);
    }
  }
});

export default {
  name: 'Topology',
  components: {
    'toolbar-preview': ToolbarPreview,
    'toolbar-edit': ToolbarEdit
  },
  props: {
    nodeTypeList: {
      type: Array,
      default: () => {
        return []
      }
    },
    nodeAppConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    edgeAppConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    graphMode: {
      type: String,
      default: 'edit'
    }
  },
  data() {
    return {
      isProcessingDragEnd: false,
      graphPanelShow: true,
      graphBg: 'default-style',
      toolbarShow: true,
      rightMenuShow: false,
      graphData: {
        nodes: [],
        edges: []
      },
      loading: false,
      clientWidth: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      clientHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      edgeShapeList: [],
      graph: null,
      minimap: null,
      currentGraphMode: this.graphMode,
      currentEdgeShape: {
        guid: 'cc-line',
        label: ''
      },
      currentFocus: 'canvas',
      selectedNode: null,
      selectedNodeParams: {
        label: '',
        appConfig: this.nodeAppConfig
      },
      selectedNodeParamsTimeout: null,
      selectedEdge: null,
      selectedEdgeParams: {
        label: '',
        appConfig: this.edgeAppConfig
      },
      selectedEdgeParamsTimeout: null,
      selectedCombo: null,
      selectedComboParams: {
        label: '',
        labelPosition: '',
        labelRefX: 0,
        labelRefY: 0,
        type: ''
      },
      selectedComboParamsTimeout: null,
      zoomValue: 1,
      nodesInClipboard: [],
      historyIndex: 0,
      undoCount: 0,
      onresizeTimeout: null,
      pasteCount: 0,
      ziyuanDialogShow: false,
      queryForms: {
        name: '',
        ip: ''
      },
      tableData: [],
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
            compareType: undefined,
            itemValue: undefined,
            minValue: undefined,
            maxValue: undefined
          }
        ]
      },
      pagination: {
        total: 0,
        pageSize: 20,
        current: 1,
        pageSizeOptions: [5, 10, 20, 50],
        showSizeChanger: true,
        showQuickJumper: false,
        showTotal: (total, range) => `总计 ${total} 条`,
      },
      selectedRow: null,
      selectedRows: [],
      currentDragInfo: {
        nodeId: null,
        position: { x: 0, y: 0 },
        nodeType: null
      },
      nodeTypeInfo: {},
      expandedItems: [0],
      gjList: [],
      regionChildren: new Map(),
      regionStates: new Map(),
      // 拖拽时文字样式配置
      dragTextStyle: {
        color: '#333333',
        fontSize: 12,
        fontWeight: 'normal',
        position: 'bottom'
      },
      // 文本编辑弹窗（仅用于cc-text节点）
      textEditDialog: {
        visible: false,
        title: '编辑文本',
        form: {
          text: '双击编辑文字',
          color: '#333333',
          fontSize: 14,
          fontWeight: 'normal'
        },
        rules: {
          text: [
            { required: true, message: '请输入文本内容', trigger: 'blur' }
          ]
        },
        currentNode: null,
        pendingNode: null
      },
      // 区域编辑弹窗
      regionEditDialog: {
        visible: false,
        title: '编辑区域',
        form: {
          text: '区域',
          textColor: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          width: 300,
          height: 200,
          backgroundColor: 'rgba(15, 136, 242, 0.3)',
          borderColor: '#409EFF',
          borderWidth: 1,
          radius: 4,
          opacity: 30,
          resizable: true
        },
        rules: {
          text: [
            { required: true, message: '请输入区域文字内容', trigger: 'blur' }
          ],
          width: [
            { required: true, message: '请输入宽度', trigger: 'blur' }
          ],
          height: [
            { required: true, message: '请输入高度', trigger: 'blur' }
          ]
        },
        currentNode: null,
        pendingNode: null
      },
      // 节点文字编辑弹窗（仅用于cc-image节点）
      nodeTextEditDialog: {
        visible: false,
        title: '编辑节点文字',
        form: {
          label: '',
          color: '#333333',
          fontSize: 12,
          fontWeight: 'normal',
          position: 'bottom'
        },
        rules: {
          label: [
            { required: true, message: '请输入节点标签', trigger: 'blur' }
          ]
        },
        currentNode: null
      },
      // 用于区分单击和双击的定时器
      clickTimer: null,
      clickNode: null,
      clickTime: 0,
      doubleClickDelay: 300, // 双击延迟时间（毫秒）
      // 告警数据缓存，用于预加载
      alarmCache: {}
    }
  },
  computed: {
    disableUndo: function () {
      return this.historyIndex === 0 || this.historyIndex - (this.undoCount + 1) < 0
    },
    disableRedo: function () {
      return this.historyIndex === 0 || this.historyIndex === 10 || this.undoCount < 1
    },
    disableCopy: function () {
      return this.selectedNodes.length === 0
    },
    disablePaste: function () {
      return this.nodesInClipboard.length === 0
    },
    disableDelete: function () {
      return this.selectedNodes.length === 0 && this.selectedEdges.length === 0
    },
    hasToken: function () {
      return this.$route && this.$route.query && this.$route.query.token;
    },
    selectedNodes: function () {
      let self = this
      let graph = self.graph
      if (graph && !graph.destroyed) {
        return graph.findAllByState('node', 'selected')
      } else {
        return []
      }
    },
    selectedEdges: function () {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        return graph.findAllByState('edge', 'selected')
      } else {
        return []
      }
    }
  },
  created() {
    this.graphBg = this.currentGraphMode === 'edit' ? 'edit-style' : 'preview-style'
    // 初始化 edgeShapeList
    this.edgeShapeList = [
      { guid: 'cc-line', label: this.$t('common.straightLine'), class: 'iconfont icon-flow-line' },
      { guid: 'cc-brokenline', label: this.$t('common.brokenLine'), class: 'iconfont icon-flow-broken' },
      { guid: 'cc-polyline', label: this.$t('common.polyline'), class: 'iconfont icon-flow-broken' },
      { guid: 'cc-cubic', label: this.$t('common.curve'), class: 'iconfont icon-flow-curve' }
    ]
    // 初始化 currentEdgeShape.label
    this.currentEdgeShape.label = this.$t('common.straightLine')
  },
  mounted() {
    registerEdge(G6, this)
    ccNode.obj.ccImage.sendThis(this)
    ccNode.obj.ccRect.sendThis(this)
    ccNode.obj.ccText.sendThis(this)
    ccBehavior.obj.clickEventEdit.sendThis(this)
    ccBehavior.obj.dragAddEdge.sendThis(this)
    ccBehavior.obj.dragEventEdit.sendThis(this)
    ccBehavior.obj.keyupEventEdit.sendThis(this)
    this.clearHistoryData()
    window.onresize = () => {
      return (() => {
        // this.onresizeHandler()
      })()
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.clearHistoryData()
    next()
  },
  beforeRouteLeave(to, from, next) {
    this.clearHistoryData()
    next()
  },
  beforeDestroy() {
    this.clearHistoryData()
  },
  methods: {
    saveTextEdit() {
      this.$refs.textEditForm.validate((valid) => {
        if (valid) {
          if (this.textEditDialog.currentNode) {
            const node = this.textEditDialog.currentNode;
            const newText = this.textEditDialog.form.text.trim();

            const updatedData = {
              text: newText,
              color: this.textEditDialog.form.color,
              fontSize: this.textEditDialog.form.fontSize,
              fontWeight: this.textEditDialog.form.fontWeight
            };

            this.graph.updateItem(node, updatedData);
          } else if (this.textEditDialog.pendingNode) {
            let graph = this.graph;
            
            let historyData = JSON.stringify(graph.save());
            let key = `graph_history_${this.historyIndex}`;
            this.addHistoryData(key, historyData);

            let nodeId = utils.generateUUID();
            let nodeConfig = {
              id: nodeId,
              x: this.textEditDialog.pendingNode.x,
              y: this.textEditDialog.pendingNode.y,
              type: this.textEditDialog.pendingNode.type,
              text: this.textEditDialog.form.text,
              color: this.textEditDialog.form.color,
              fontSize: this.textEditDialog.form.fontSize,
              fontWeight: this.textEditDialog.form.fontWeight,
              anchorPoints: []
            };

            let node = graph.addItem('node', nodeConfig);

            if (this.undoCount > 0) {
              this.historyIndex = this.historyIndex - this.undoCount;
              for (let i = 1; i <= this.undoCount; i++) {
                let key = `graph_history_${this.historyIndex + i}`;
                this.removeHistoryData(key);
              }
              this.undoCount = 0;
            }
            this.historyIndex += 1;
            key = `graph_history_${this.historyIndex}`;
            let currentData = JSON.stringify(graph.save());
            this.addHistoryData(key, currentData);
          }

          this.closeTextEditDialog();
        }
      });
    },
    
    closeTextEditDialog() {
      this.textEditDialog.visible = false;
    },
    
    resetTextEditForm() {
      if (this.$refs.textEditForm) {
        this.$refs.textEditForm.resetFields();
      }
      this.textEditDialog.form = {
        text: '双击编辑文字',
        color: '#333333',
        fontSize: 14,
        fontWeight: 'normal'
      };
      this.textEditDialog.currentNode = null;
      this.textEditDialog.pendingNode = null;
    },
    
    saveRegionEdit() {
      this.$refs.regionEditForm.validate((valid) => {
        if (valid) {
          if (this.regionEditDialog.currentNode) {
            const node = this.regionEditDialog.currentNode;
            const form = this.regionEditDialog.form;
            
            const updatedData = {
              text: form.text,
              textColor: form.textColor,
              fontSize: form.fontSize,
              fontWeight: form.fontWeight,
              width: form.width,
              height: form.height,
              backgroundColor: form.backgroundColor,
              borderColor: form.borderColor,
              borderWidth: form.borderWidth,
              radius: form.radius,
              opacity: form.opacity,
              resizable: form.resizable
            };
            
            this.graph.updateItem(node, updatedData);
          } else if (this.regionEditDialog.pendingNode) {
            let graph = this.graph;
            
            let historyData = JSON.stringify(graph.save());
            let key = `graph_history_${this.historyIndex}`;
            this.addHistoryData(key, historyData);

            let nodeId = utils.generateUUID();
            let nodeConfig = {
              id: nodeId,
              x: this.regionEditDialog.pendingNode.x,
              y: this.regionEditDialog.pendingNode.y,
              type: 'region',
              text: this.regionEditDialog.form.text,
              textColor: this.regionEditDialog.form.textColor,
              fontSize: this.regionEditDialog.form.fontSize,
              fontWeight: this.regionEditDialog.form.fontWeight,
              width: this.regionEditDialog.form.width,
              height: this.regionEditDialog.form.height,
              backgroundColor: this.regionEditDialog.form.backgroundColor,
              borderColor: this.regionEditDialog.form.borderColor,
              borderWidth: this.regionEditDialog.form.borderWidth,
              radius: this.regionEditDialog.form.radius,
              opacity: this.regionEditDialog.form.opacity,
              resizable: this.regionEditDialog.form.resizable,
              anchorPoints: [
                [0, 0], [0.5, 0], [1, 0],
                [0, 0.5], [1, 0.5],
                [0, 1], [0.5, 1], [1, 1]
              ]
            };

            let node = graph.addItem('node', nodeConfig);
            
            this.regionChildren.set(nodeId, []);
            this.regionStates.set(nodeId, false);

            if (this.undoCount > 0) {
              this.historyIndex = this.historyIndex - this.undoCount;
              for (let i = 1; i <= this.undoCount; i++) {
                let key = `graph_history_${this.historyIndex + i}`;
                this.removeHistoryData(key);
              }
              this.undoCount = 0;
            }
            this.historyIndex += 1;
            key = `graph_history_${this.historyIndex}`;
            let currentData = JSON.stringify(graph.save());
            this.addHistoryData(key, currentData);
          }

          this.closeRegionEditDialog();
        }
      });
    },
    
    closeRegionEditDialog() {
      this.regionEditDialog.visible = false;
    },
    
    resetRegionEditForm() {
      if (this.$refs.regionEditForm) {
        this.$refs.regionEditForm.resetFields();
      }
      this.regionEditDialog.form = {
        text: '区域',
        textColor: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
        width: 300,
        height: 200,
        backgroundColor: 'rgba(15, 136, 242, 0.3)',
        borderColor: '#409EFF',
        borderWidth: 1,
        radius: 4,
        opacity: 30,
        resizable: true
      };
      this.regionEditDialog.currentNode = null;
      this.regionEditDialog.pendingNode = null;
    },
    
    saveNodeTextEdit() {
      this.$refs.nodeTextEditForm.validate((valid) => {
        if (valid) {
          if (this.nodeTextEditDialog.currentNode) {
            const node = this.nodeTextEditDialog.currentNode;
            const nodeData = node.getModel();
            
            // 根据节点类型更新不同的配置
            if (nodeData.type === 'cc-image') {
              // 图片节点更新labelCfg
              const updatedData = {
                label: this.nodeTextEditDialog.form.label,
                labelCfg: {
                  position: this.nodeTextEditDialog.form.position,
                  style: {
                    fill: this.nodeTextEditDialog.form.color,
                    fontSize: this.nodeTextEditDialog.form.fontSize,
                    fontWeight: this.nodeTextEditDialog.form.fontWeight
                  }
                }
              };
              this.graph.updateItem(node, updatedData);
            } else if (nodeData.type === 'cc-text') {
              // 文本节点直接更新样式
              const updatedData = {
                text: this.nodeTextEditDialog.form.label,
                color: this.nodeTextEditDialog.form.color,
                fontSize: this.nodeTextEditDialog.form.fontSize,
                fontWeight: this.nodeTextEditDialog.form.fontWeight
              };
              this.graph.updateItem(node, updatedData);
            } else if (nodeData.type === 'region') {
              // 区域节点更新文字相关配置
              const updatedData = {
                text: this.nodeTextEditDialog.form.label,
                textColor: this.nodeTextEditDialog.form.color,
                fontSize: this.nodeTextEditDialog.form.fontSize,
                fontWeight: this.nodeTextEditDialog.form.fontWeight
              };
              this.graph.updateItem(node, updatedData);
            }
          }
          
          this.closeNodeTextEditDialog();
        }
      });
    },
    
    closeNodeTextEditDialog() {
      this.nodeTextEditDialog.visible = false;
    },
    
    resetNodeTextEditForm() {
      if (this.$refs.nodeTextEditForm) {
        this.$refs.nodeTextEditForm.resetFields();
      }
      this.nodeTextEditDialog.form = {
        label: '',
        color: '#333333',
        fontSize: 12,
        fontWeight: 'normal',
        position: 'bottom'
      };
      this.nodeTextEditDialog.currentNode = null;
    },
    
    alarmLists(nodeId) {
      console.log('调用alarmLists，节点ID:', nodeId);
      let params = {
        "pageSize": 99,
        "pageNo": 1,
        "assetId": nodeId,
        "alarmStatus": "0"
      }
      alarmList(params).then((res) => {
        console.log(res, 'res');
        if (res.data && res.data.list && res.data.list.length > 0) {
          this.gjList = res.data.list;
        } else {
          this.gjList = [];
        }
        this.$forceUpdate();
      })
    },
    onresizeHandler() {
      clearTimeout(this.onresizeTimeout);
      this.onresizeTimeout = setTimeout(() => {
        let graph = this.graph;
        if (graph && !graph.destroyed) {
          let graphContainer = this.$refs.graphContainer.$el;
          let containerStyle = window.getComputedStyle(graphContainer);
          let graphWidth = parseInt(containerStyle.width, 10) - 40;
          let graphHeight = parseInt(containerStyle.height, 10) - 40;

          graph.changeSize(graphWidth, graphHeight);
          graph.get('canvas').set('width', graphWidth);
          graph.get('canvas').set('height', graphHeight);
          this.autoZoomHandler();
        }
      }, 1000);
    },

    openFullScreenLoading() {
      this.loading = true
    },
    closeFullScreenLoading() {
      let self = this
      self.$nextTick(() => {
        self.loading = false
      })
    },

    toggleAccordion(index) {
      const indexInArray = this.expandedItems.indexOf(index);
      if (indexInArray > -1) {
        this.expandedItems.splice(indexInArray, 1);
      } else {
        this.expandedItems.push(index);
      }
    },

    dragstartHandler(event, nodeType) {
      event.dataTransfer.setData('text', JSON.stringify(nodeType))
    },
    dragenterHandler(event) {
      event.preventDefault()
    },
    dragoverHandler(event) {
      event.preventDefault()
    },
    dropHandler(event) {
      let nodeTypeStr = event.dataTransfer.getData('text')
      let nodeType = JSON.parse(nodeTypeStr)
      let clientX = event.clientX
      let clientY = event.clientY

      let graph = this.graph
      if (graph && !graph.destroyed) {
        let droppoint = graph.getPointByClient(clientX, clientY)

        this.currentDragInfo.position = droppoint
        this.currentDragInfo.nodeType = nodeType

        let tempNodeId = utils.generateUUID()
        let tempNodeConfig = {
          id: tempNodeId,
          x: droppoint.x,
          y: droppoint.y,
          style: {
            opacity: 0.5
          }
        }

        if (nodeType.type === 'cc-text') {
          tempNodeConfig.type = nodeType.type
          tempNodeConfig.text = nodeType.content || nodeType.label || '双击编辑文字'
          tempNodeConfig.color = nodeType.color || '#333333'
          tempNodeConfig.fontSize = nodeType.fontSize || 14
          tempNodeConfig.fontWeight = nodeType.fontWeight || 'normal'
          tempNodeConfig.anchorPoints = []
        } else if (nodeType.type === 'region') {
          tempNodeConfig.type = nodeType.type
          tempNodeConfig.text = nodeType.text || nodeType.label || '区域'
          tempNodeConfig.textColor = nodeType.textColor || '#ffffff'
          tempNodeConfig.fontSize = nodeType.fontSize || 12
          tempNodeConfig.fontWeight = nodeType.fontWeight || 'bold'
          tempNodeConfig.width = nodeType.width || 300
          tempNodeConfig.height = nodeType.height || 200
          tempNodeConfig.backgroundColor = nodeType.backgroundColor || 'rgba(15, 136, 242, 0.3)'
          tempNodeConfig.borderColor = nodeType.borderColor || '#409EFF'
          tempNodeConfig.borderWidth = nodeType.borderWidth || 1
          tempNodeConfig.radius = nodeType.radius || 4
          tempNodeConfig.opacity = nodeType.opacity || 30
          tempNodeConfig.resizable = nodeType.resizable !== undefined ? nodeType.resizable : true
          tempNodeConfig.anchorPoints = [
            [0, 0], [0.5, 0], [1, 0],
            [0, 0.5], [1, 0.5],
            [0, 1], [0.5, 1], [1, 1]
          ]
        } else {
          tempNodeConfig.type = 'cc-image'
          tempNodeConfig.label = nodeType.label
          tempNodeConfig.labelCfg = {
            position: 'bottom',
            style: {
              fill: nodeType.textColor || '#333333',
              fontSize: nodeType.fontSize || 12,
              fontWeight: nodeType.fontWeight || 'normal'
            }
          }
          tempNodeConfig.img = nodeType.imgSrc
          tempNodeConfig.size = [42, 42]
          tempNodeConfig.width = 40
          tempNodeConfig.height = 36
          tempNodeConfig.anchorPoints = [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5]
          ]
        }

        let tempNode = graph.addItem('node', tempNodeConfig)

        this.currentDragInfo.nodeId = tempNodeId
      }
    },
    dragendHandler(nodeType) {
      console.log(nodeType, 'nodeType');
      let graph = this.graph;

      if (this.currentDragInfo.nodeId) {
        const currentNodeType = this.currentDragInfo.nodeType;
        console.log(currentNodeType, 'currentNodeType');

        if (currentNodeType && currentNodeType.type === 'cc-text') {
          let tempNode = graph.findById(this.currentDragInfo.nodeId);
          if (tempNode) {
            graph.removeItem(tempNode);
          }

          this.textEditDialog.pendingNode = {
            x: this.currentDragInfo.position.x,
            y: this.currentDragInfo.position.y,
            type: currentNodeType.type
          };
          this.textEditDialog.form.text = currentNodeType.content || '双击编辑文字';
          this.textEditDialog.form.color = currentNodeType.color || '#333333';
          this.textEditDialog.form.fontSize = currentNodeType.fontSize || 14;
          this.textEditDialog.form.fontWeight = currentNodeType.fontWeight || 'normal';
          this.textEditDialog.visible = true;
        } else if (currentNodeType && currentNodeType.type === 'region') {
          let tempNode = graph.findById(this.currentDragInfo.nodeId);
          if (tempNode) {
            graph.removeItem(tempNode);
          }

          this.regionEditDialog.pendingNode = {
            x: this.currentDragInfo.position.x,
            y: this.currentDragInfo.position.y,
            type: currentNodeType.type
          };
          
          if (currentNodeType.width) this.regionEditDialog.form.width = currentNodeType.width;
          if (currentNodeType.height) this.regionEditDialog.form.height = currentNodeType.height;
          if (currentNodeType.backgroundColor) this.regionEditDialog.form.backgroundColor = currentNodeType.backgroundColor;
          if (currentNodeType.borderColor) this.regionEditDialog.form.borderColor = currentNodeType.borderColor;
          if (currentNodeType.borderWidth) this.regionEditDialog.form.borderWidth = currentNodeType.borderWidth;
          if (currentNodeType.radius) this.regionEditDialog.form.radius = currentNodeType.radius;
          if (currentNodeType.opacity) this.regionEditDialog.form.opacity = currentNodeType.opacity;
          if (currentNodeType.text) this.regionEditDialog.form.text = currentNodeType.text;
          else if (currentNodeType.label) this.regionEditDialog.form.text = currentNodeType.label;
          if (currentNodeType.textColor) this.regionEditDialog.form.textColor = currentNodeType.textColor;
          if (currentNodeType.fontSize) this.regionEditDialog.form.fontSize = currentNodeType.fontSize;
          if (currentNodeType.fontWeight) this.regionEditDialog.form.fontWeight = currentNodeType.fontWeight;
          
          this.regionEditDialog.visible = true;
        } else {
          // 对于cc-image节点，初始化拖拽文字样式
          if (currentNodeType && currentNodeType.type === 'cc-image') {
            this.dragTextStyle = {
              color: currentNodeType.textColor || '#333333',
              fontSize: currentNodeType.fontSize || 12,
              fontWeight: currentNodeType.fontWeight || 'normal',
              position: currentNodeType.position || 'bottom'
            };
          }
          
          this.nodeTypeInfo = currentNodeType;
          this.ziyuanDialogShow = true;
          this.pagination.current = 1;
          this.handleSearch();
        }
      }
    },
    closeResourceDialog() {
      let graph = this.graph
      if (graph && !graph.destroyed && this.currentDragInfo.nodeId) {
        let tempNode = graph.findById(this.currentDragInfo.nodeId)
        if (tempNode) {
          graph.removeItem(tempNode)
        }
      }
      this.currentDragInfo = {
        nodeId: null,
        position: { x: 0, y: 0 },
        nodeType: null
      }
      this.ziyuanDialogShow = false
      this.selectedRow = null
      this.selectedRows = []
      if (this.$refs.tableRef) {
        this.$refs.tableRef.clearSelection();
      }
      // 重置拖拽文字样式
      this.dragTextStyle = {
        color: '#333333',
        fontSize: 12,
        fontWeight: 'normal',
        position: 'bottom'
      };
    },

    handleSelectChange(val, row) {
      if (val) {
        if (!this.selectedRows.some(item => item.id === row.id)) {
          this.selectedRows.push(row);
        }
        this.selectedRow = row;
      } else {
        const index = this.selectedRows.findIndex(item => item.id === row.id);
        if (index > -1) {
          this.selectedRows.splice(index, 1);
        }
        if (this.selectedRow && this.selectedRow.id === row.id) {
          this.selectedRow = this.selectedRows.length > 0 ? this.selectedRows[0] : null;
        }
      }
    },

    handleSelect(selection) {
      this.selectedRows = [...selection];
      this.selectedRow = this.selectedRows.length > 0 ? this.selectedRows[0] : null;
    },
    handleSearch() {
      this.pagination.current = 1;
      this.getList();
    },
    handleReset() {
      this.nodeTypeInfo.deviceName = '';
      this.queryForms.name = '';
      this.nodeTypeInfo.ip = '';
      this.queryForms.ip = '';
      this.handleSearch();
    },
    isRowSelectable(row) {
      return !row.disabled;
    },

    getList() {
      this.loading = true
      console.log(this.nodeTypeInfo, 'this.nodeTypeInfo');
      this.nodeTypeInfo.deviceName = this.queryForms.name;
      this.nodeTypeInfo.ip = this.queryForms.ip;
      this.nodeTypeInfo.pageNo = 1;
      this.nodeTypeInfo.pageSize = 99;

      getPageInfo(this.nodeTypeInfo).then((res) => {
        this.tableData = res.data && res.data.list;
        this.pagination.total = (res.data && res.data.total) || 0;

        let existingNodeIds = [];
        if (this.graph && !this.graph.destroyed) {
          const nodes = this.graph.getNodes();
          nodes.forEach(node => {
            const model = node.getModel();
            if (model.assetData && model.assetData.id) {
              existingNodeIds.push(model.assetData.id);
            }
          });
        }

        this.tableData.forEach((item) => {
          if (item.assetAttribute && Object.entries(item.assetAttribute) && Object.entries(item.assetAttribute).length > 0) {
            let objArray = Object.entries(item.assetAttribute)
            objArray.forEach(objItem => {
              item[objItem[0]] = objItem[1]
            })
          }

          if (existingNodeIds.includes(item.id)) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
        });

        this.loading = false

      });
    },
    initTopo(graphData) {
      let self = this
      if (self.graph) {
        self.graph.destroy()
      }
      let graphContainer = self.$refs.graphContainer.$el
      let graphWidth = graphContainer.clientWidth - 20
      let graphHeight = graphContainer.clientHeight - 20
      let plugins = []
      const hasToken = self.$route && self.$route.query && self.$route.query.token;
      let modes = {
        default: [
          'drag-canvas',
          'drag-node',
          {
            type: 'click-select',
            trigger: 'ctrl',
            multiple: true
          }
        ],
        preview: [
          'drag-canvas',
          'zoom-canvas',
          "drag-node",
          ...([{
            type: 'tooltip',
            formatText(model) {
              let tooltipContent = '';

              // 对于区域节点，使用text属性
              if (model.type === 'region' || model.type === 'cc-text') {
                if (model.text) {
                  tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.text}</div>`;
                }
              } else if (model.label) {
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.label}</div>`;
              }

              if (model.assetData && model.assetData.onlineStatus == '2') {
                if (model.assetData && model.assetData.ip) {
                  tooltipContent += `<div style="margin-bottom: 5px;text-align: left;">${self.$t('common.ip')}: ${model.assetData.ip}</div>`;
                } else if (model.ip) {
                  tooltipContent += `<div style="margin-bottom: 5px;text-align: left;">${self.$t('common.ip')}: ${model.ip}</div>`;
                }

                // 检查缓存中是否有数据
                if (self.alarmCache[model.id]) {
                  // 使用缓存数据，直接返回完整HTML
                  const alarmData = self.alarmCache[model.id];
                  let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                  alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                    '</tr>';

                  if (alarmData && alarmData.length > 0) {
                    alarmData.forEach(alarm => {
                      let levelStyle = '';
                      switch (alarm.alarmLevel) {
                        case '1': levelStyle = 'color: #52c41a;'; break;
                        case '2': levelStyle = 'color: #faad14;'; break;
                        case '3': levelStyle = 'color: #fa8c16;'; break;
                        case '4': levelStyle = 'color: #f5222d;'; break;
                        default: levelStyle = 'color: #333;';
                      }

                      alarmHtml += '<tr>' +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                        '</tr>';
                    });
                  } else {
                    alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                  }

                  alarmHtml += '</table>';
                  tooltipContent += alarmHtml;
                } else {
                  tooltipContent += '<div id="alarm-list-container-' + model.id + '" style="font-size: 12px;">' + self.$t('common.loadingAlarmData') + '</div>';
                  
                  if(hasToken){
                    let params = {
                      "id": model.id,
                      "token": hasToken ? self.$route.query.token : ""
                    };

                    alarmListNew(params).then((res) => {
                      // 存入缓存
                      self.alarmCache[model.id] = res.data || [];
                      
                      let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                      alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                        '</tr>';

                      if (res.data && res.data.length > 0) {
                        res.data.forEach(alarm => {
                          let levelStyle = '';
                          switch (alarm.alarmLevel) {
                            case '1': levelStyle = 'color: #52c41a;'; break;
                            case '2': levelStyle = 'color: #faad14;'; break;
                            case '3': levelStyle = 'color: #fa8c16;'; break;
                            case '4': levelStyle = 'color: #f5222d;'; break;
                            default: levelStyle = 'color: #333;';
                          }

                          alarmHtml += '<tr>' +
                            `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                            `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                            `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                            '</tr>';
                        });
                      } else {
                        alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                      }

                      alarmHtml += '</table>';

                      setTimeout(() => {
                        const container = document.getElementById('alarm-list-container-' + model.id);
                        if (container) {
                          container.innerHTML = alarmHtml;
                        }
                      }, 0);
                    });
                  } else {
                    let params = {
                      "pageSize": 99,
                      "pageNo": 1,
                      "assetId": model.id,
                      "alarmStatus": "0"
                    };
                    alarmList(params).then((res) => {
                      // 存入缓存
                      self.alarmCache[model.id] = res.data && res.data.list ? res.data.list : [];
                      
                      let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                      alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                        '</tr>';

                      if (res.data && res.data.list && res.data.list.length > 0) {
                        res.data.list.forEach(alarm => {
                          let levelStyle = '';
                          switch (alarm.alarmLevel) {
                            case '1': levelStyle = 'color: #52c41a;'; break;
                            case '2': levelStyle = 'color: #faad14;'; break;
                            case '3': levelStyle = 'color: #fa8c16;'; break;
                            case '4': levelStyle = 'color: #f5222d;'; break;
                            default: levelStyle = 'color: #333;';
                          }

                          alarmHtml += '<tr>' +
                            `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                            `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                            `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                            '</tr>';
                        });
                      } else {
                        alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                      }

                      alarmHtml += '</table>';

                      setTimeout(() => {
                        const container = document.getElementById('alarm-list-container-' + model.id);
                        if (container) {
                          container.innerHTML = alarmHtml;
                        }
                      }, 0);
                    });                  
                  }
                }

              }

              return tooltipContent;
            }
          },
          {
            type: 'combo-tooltip',
            formatText(model) {
              let tooltipContent = '';

              if (model.label) {
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.label}</div>`;
              }

              // 检查缓存中是否有数据
              if (self.alarmCache[model.id]) {
                // 使用缓存数据，直接返回完整HTML
                const alarmData = self.alarmCache[model.id];
                let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                  '</tr>';

                if (alarmData && alarmData.length > 0) {
                  alarmData.forEach(alarm => {
                    let levelStyle = '';
                    switch (alarm.alarmLevel) {
                      case '1': levelStyle = 'color: #52c41a;'; break;
                      case '2': levelStyle = 'color: #faad14;'; break;
                      case '3': levelStyle = 'color: #fa8c16;'; break;
                      case '4': levelStyle = 'color: #f5222d;'; break;
                      default: levelStyle = 'color: #333;';
                    }

                    alarmHtml += '<tr>' +
                      `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                      `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                      `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                      '</tr>';
                  });
                } else {
                  alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                }

                alarmHtml += '</table>';
                tooltipContent += alarmHtml;
              } else {
                tooltipContent += '<div id="alarm-list-container-combo-' + model.id + '" style="font-size: 12px;">' + self.$t('common.loadingAlarmData') + '</div>';
                
                let params = {
                  "pageSize": 99,
                  "pageNo": 1,
                  "assetId": model.id,
                  "alarmStatus": "0"
                };

                alarmList(params).then((res) => {
                  // 存入缓存
                  self.alarmCache[model.id] = res.data && res.data.list ? res.data.list : [];
                  
                  let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                  alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                    '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                    '</tr>';

                  if (res.data && res.data.list && res.data.list.length > 0) {
                    res.data.list.forEach(alarm => {
                      let levelStyle = '';
                      switch (alarm.alarmLevel) {
                        case '1': levelStyle = 'color: #52c41a;'; break;
                        case '2': levelStyle = 'color: #faad14;'; break;
                        case '3': levelStyle = 'color: #fa8c16;'; break;
                        case '4': levelStyle = 'color: #f5222d;'; break;
                        default: levelStyle = 'color: #333;';
                      }

                      alarmHtml += '<tr>' +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                        '</tr>';
                    });
                  } else {
                    alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                  }

                  alarmHtml += '</table>';

                  setTimeout(() => {
                    const container = document.getElementById('alarm-list-container-combo-' + model.id);
                      if (container) {
                        container.innerHTML = alarmHtml;
                      }
                  }, 0);
                });
              }

              return tooltipContent;
            }
          },
          {
            type: 'edge-tooltip',
            formatText(model) {
              return model.description || 'source:' + self.graph.findById(model.source).getModel().label + ' target:' + self.graph.findById(model.target).getModel().label
            }
          }]),
          'collapse-expand-combo',
        ],
        edit: [
          'drag-node',
          'drag-canvas',
          {
            type: 'click-select',
            trigger: 'ctrl',
            multiple: true
          },
          {
            type: 'brush-select',
            trigger: 'control',
            includeEdges: false
          },
          'right-click-node',
          'right-click-edge',
          'drag-combo',
          'collapse-expand-combo',
          'hover-event-edit',
          'click-event-edit',
          'keyup-event',
          'drag-event-edit',
          'keyup-event-edit',
          'drag-add-edge',
          'drag-resize-region',
          {
            type: 'tooltip',
            formatText(model) {
              let tooltipContent = '';

              // 对于区域节点，使用text属性
              if (model.type === 'region' || model.type === 'cc-text') {
                if (model.text) {
                  tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.text}</div>`;
                }
              } else if (model.label) {
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.label}</div>`;
              }

              if (model.assetData && model.assetData.onlineStatus == '2') {
                if (model.assetData && model.assetData.ip) {
                  tooltipContent += `<div style="margin-bottom: 5px;text-align: left;">${self.$t('common.ip')}: ${model.assetData.ip}</div>`;
                } else if (model.ip) {
                  tooltipContent += `<div style="margin-bottom: 5px;text-align: left;">${self.$t('common.ip')}: ${model.ip}</div>`;
                }

                // 检查缓存中是否有数据
                if (self.alarmCache[model.id]) {
                  // 使用缓存数据，直接返回完整HTML
                  const alarmData = self.alarmCache[model.id];
                  let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                  alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                      '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                      '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                      '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                      '</tr>';

                  if (alarmData && alarmData.length > 0) {
                    alarmData.forEach(alarm => {
                      let levelStyle = '';
                      switch (alarm.alarmLevel) {
                        case '1': levelStyle = 'color: #52c41a;'; break;
                        case '2': levelStyle = 'color: #faad14;'; break;
                        case '3': levelStyle = 'color: #fa8c16;'; break;
                        case '4': levelStyle = 'color: #f5222d;'; break;
                        default: levelStyle = 'color: #333;';
                      }

                      alarmHtml += '<tr>' +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.urgent') : alarm.alarmLevel === '3' ? self.$t('common.critical') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                        `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                        '</tr>';
                    });
                  } else {
                    alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                  }

                  alarmHtml += '</table>';
                  tooltipContent += alarmHtml;
                } else {
                  tooltipContent += '<div id="alarm-list-container-edit-' + model.id + '" style="font-size: 12px;">' + self.$t('common.loadingAlarmData') + '</div>';
                  
                  let params = {
                    "pageSize": 99,
                    "pageNo": 1,
                    "assetId": model.id,
                    "alarmStatus": "0"
                  };

                  alarmList(params).then((res) => {
                    // 存入缓存
                    self.alarmCache[model.id] = res.data && res.data.list ? res.data.list : [];
                    
                    let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                    alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                        '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                        '</tr>';

                    if (res.data && res.data.list && res.data.list.length > 0) {
                      res.data.list.forEach(alarm => {
                        let levelStyle = '';
                        switch (alarm.alarmLevel) {
                          case '1': levelStyle = 'color: #52c41a;'; break;
                          case '2': levelStyle = 'color: #faad14;'; break;
                          case '3': levelStyle = 'color: #fa8c16;'; break;
                          case '4': levelStyle = 'color: #f5222d;'; break;
                          default: levelStyle = 'color: #333;';
                        }

                        alarmHtml += '<tr>' +
                          `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                          `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.emergency') : alarm.alarmLevel === '3' ? self.$t('common.severe') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                          `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                          '</tr>';
                      });
                    } else {
                        alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                      }

                    alarmHtml += '</table>';

                    setTimeout(() => {
                      const container = document.getElementById('alarm-list-container-edit-' + model.id);
                      if (container) {
                        container.innerHTML = alarmHtml;
                      }
                    }, 0);
                  });
                }
              }

              return tooltipContent;
            }
          },
          {
            type: 'combo-tooltip',
            formatText(model) {
              let tooltipContent = '';

              if (model.label) {
                tooltipContent += `<div style="font-weight: bold; margin-bottom: 5px;text-align: left;">${self.$t('common.name')}: ${model.label}</div>`;
              }

              tooltipContent += '<div id="alarm-list-container-combo-edit-' + model.id + '" style="font-size: 12px;">' + self.$t('common.loadingAlarmData') + '</div>';

              let params = {
                "pageSize": 99,
                "pageNo": 1,
                "assetId": model.id,
                "alarmStatus": "0"
              };

              alarmList(params).then((res) => {
                let alarmHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">';
                alarmHtml += '<tr style="background-color: #f5f5f5;">' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmName') + '</th>' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.level') + '</th>' +
                  '<th style="padding: 4px; text-align: left; border: 1px solid #ddd;">' + self.$t('common.alarmTime') + '</th>' +
                  '</tr>';

                if (res.data && res.data.list && res.data.list.length > 0) {
                  res.data.list.forEach(alarm => {
                    let levelStyle = '';
                    switch (alarm.alarmLevel) {
                      case '1': levelStyle = 'color: #52c41a;'; break;
                      case '2': levelStyle = 'color: #faad14;'; break;
                      case '3': levelStyle = 'color: #fa8c16;'; break;
                      case '4': levelStyle = 'color: #f5222d;'; break;
                      default: levelStyle = 'color: #333;';
                    }

                    alarmHtml += '<tr>' +
                      `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTitle || '-'}</td>` +
                      `<td style="padding: 4px; border: 1px solid #ddd; ${levelStyle}">${alarm.alarmLevel === '4' ? self.$t('common.emergency') : alarm.alarmLevel === '3' ? self.$t('common.severe') : alarm.alarmLevel === '2' ? self.$t('common.normal') : self.$t('common.warning')}</td>` +
                      `<td style="padding: 4px; border: 1px solid #ddd;">${alarm.alarmTime || '-'}</td>` +
                      '</tr>';
                  });
                } else {
                  alarmHtml += '<tr><td colspan="3" style="padding: 4px; border: 1px solid #ddd; text-align: center;">' + self.$t('common.noAlarmData') + '</td></tr>';
                }

                alarmHtml += '</table>';

                setTimeout(() => {
                  const container = document.getElementById('alarm-list-container-combo-edit-' + model.id);
                    if (container) {
                      container.innerHTML = alarmHtml;
                    }
                }, 0);
              });

              return tooltipContent;
            }
          }
        ],
        addEdge: [
          'drag-canvas',
          'click-add-edge'
        ],
        multiSelect: [
          {
            type: 'brush-select',
            trigger: 'drag',
            onSelect() {
              this.graph.setMode('edit')
              window.document.getElementById('multi-select').style.backgroundColor = 'transparent'
            }
          }
        ]
      }
      
      self.graph = initGraph.commonGraph(G6, {
        plugins: plugins,
        container: 'mount-topology',
        width: graphWidth,
        height: graphHeight,
        modes: modes,
        graphData: graphData,
        graphMode: self.currentGraphMode
      })
      self.graph.$C = config
      self.graph.setMode(self.currentGraphMode)
      self.graph.refresh()
      self.autoZoomHandler()

      try {
        if (self.$route && self.$route.query && self.$route.query.zoom && self.graph && !self.graph.destroyed) {
          const zoomParamStr = self.$route.query.zoom.toString().trim();
          const zoomParam = parseFloat(zoomParamStr);

          if (!isNaN(zoomParam) && isFinite(zoomParam) &&  Math.round(zoomParam * 10) / 10 === zoomParam && ((zoomParam > 0 && zoomParam <= 5) ||  (zoomParam >= -2 && zoomParam <= -1 && Math.round(zoomParam * 10) / 10 === zoomParam))) {

            console.log(`应用URL缩放参数: ${zoomParam}`);

            const width = self.graph.get('width');
            const height = self.graph.get('height');

            if (width > 0 && height > 0) {
              const center = { x: width / 2, y: height / 2 };

              let zoomFactor = 1.0;
              if (zoomParam > 0 && zoomParam <= 5) {
                zoomFactor = 1.0 + (zoomParam - 1) * 0.5;
              } else if (zoomParam >= -2 && zoomParam <= -1) {
                zoomFactor = 1.0 + zoomParam * 0.2;
              }

              zoomFactor = Math.max(0.5, Math.min(5.0, zoomFactor));

              self.graph.zoomTo(zoomFactor, center);
            } else {
              console.warn('画布尺寸无效，无法应用缩放');
            }
          } else {
            console.warn(`无效的zoom参数: ${zoomParamStr}，只支持0<值≤5（1位小数）或-2≤值≤-1（1位小数），例如1.5、-1.2`);
          }
        }
      } catch (error) {
        console.error('处理zoom参数时发生错误:', error);
      }

      self.addDeleteButtonsToEdges()

      // 修改节点点击事件处理，区分单击和双击
      self.graph.on('node:click', (ev) => {
       if (self.currentGraphMode === 'preview') {
            return;
       }
        const node = ev.item;
        if (!node) return;
        
        const nodeData = node.getModel();
        console.log('节点被点击:', nodeData);

        // 对于cc-text、region节点，直接返回
        if (nodeData.type === 'cc-text' || nodeData.type === 'region') {
          return;
        }

        // 处理cc-image节点的单击与双击冲突
        if (nodeData.type === 'cc-image') {
          const currentTime = new Date().getTime();
          
          // 如果是同一个节点且时间间隔小于双击延迟，则视为双击
          if (self.clickNode === node && (currentTime - self.clickTime) < self.doubleClickDelay) {
            clearTimeout(self.clickTimer);
            self.clickNode = null;
            self.clickTime = 0;
            
            // 触发双击事件
            ev.preventDefault();
            ev.stopPropagation();
            
            // 触发节点文字编辑弹窗
            self.nodeTextEditDialog.currentNode = node;
            self.nodeTextEditDialog.form.label = nodeData.label || '';
            self.nodeTextEditDialog.form.color = nodeData.labelCfg?.style?.fill || '#333333';
            self.nodeTextEditDialog.form.fontSize = nodeData.labelCfg?.style?.fontSize || 12;
            self.nodeTextEditDialog.form.fontWeight = nodeData.labelCfg?.style?.fontWeight || 'normal';
            self.nodeTextEditDialog.form.position = nodeData.labelCfg?.position || 'bottom';
            self.nodeTextEditDialog.visible = true;
            return;
          }
          
          // 记录第一次点击
          self.clickNode = node;
          self.clickTime = currentTime;
          
          // 设置定时器，延迟执行单击操作
          self.clickTimer = setTimeout(() => {
            self.clickNode = null;
            self.clickTime = 0;
            
            // 执行原来的单击逻辑
            const isPreviewMode = self.currentGraphMode === 'preview';
            const hasToken = self.$route && self.$route.query && self.$route.query.token;

            if (!(isPreviewMode && hasToken)) {
              self.$emit('node-click', nodeData);
            } else {
              console.log('预览状态下存在token，不触发侧拉框');
            }
          }, self.doubleClickDelay);
          
          return;
        }

        // 其他节点类型的单击处理
        const isPreviewMode = self.currentGraphMode === 'preview';
        const hasToken = self.$route && self.$route.query && self.$route.query.token;

        if (!(isPreviewMode && hasToken)) {
          self.$emit('node-click', nodeData);
        } else {
          console.log('预览状态下存在token，不触发侧拉框');
        }
      });
      
      // 监听其他节点类型的双击事件
      self.graph.on('node:dblclick', (ev) => {
        const node = ev.item;
        if (!node) return;
        
        const nodeData = node.getModel();
        
        if (self.currentGraphMode === 'preview') {
          return;
        }

        // 清除单击定时器
        if (self.clickTimer) {
          clearTimeout(self.clickTimer);
          self.clickTimer = null;
        }
        
        if (nodeData.type === 'cc-text') {
          ev.preventDefault();
          ev.stopPropagation();
          
          self.textEditDialog.currentNode = node;
          self.textEditDialog.form.text = nodeData.text || '双击编辑文字';
          self.textEditDialog.form.color = nodeData.color || '#333333';
          self.textEditDialog.form.fontSize = nodeData.fontSize || 14;
          self.textEditDialog.form.fontWeight = nodeData.fontWeight || 'normal';
          self.textEditDialog.visible = true;
        } 
        else if (nodeData.type === 'region') {
          self.graph.emit('region-edit-click', { node });
        }
        // cc-image节点的双击已经在click事件中处理
      });
      
      self.graph.on('region-edit-click', (ev) => {
        const node = ev.node;
        const nodeData = node.getModel();
        
        if (self.currentGraphMode === 'preview') {
          return;
        }

        if (nodeData.type === 'region') {
          self.regionEditDialog.currentNode = node;
          self.regionEditDialog.form.text = nodeData.text || '区域';
          self.regionEditDialog.form.textColor = nodeData.textColor || '#ffffff';
          self.regionEditDialog.form.fontSize = nodeData.fontSize || 12;
          self.regionEditDialog.form.fontWeight = nodeData.fontWeight || 'bold';
          self.regionEditDialog.form.width = nodeData.width || 300;
          self.regionEditDialog.form.height = nodeData.height || 200;
          self.regionEditDialog.form.backgroundColor = nodeData.backgroundColor || 'rgba(15, 136, 242, 0.3)';
          self.regionEditDialog.form.borderColor = nodeData.borderColor || '#409EFF';
          self.regionEditDialog.form.borderWidth = nodeData.borderWidth || 1;
          self.regionEditDialog.form.radius = nodeData.radius || 4;
          self.regionEditDialog.form.opacity = nodeData.opacity || 30;
          self.regionEditDialog.form.resizable = nodeData.resizable !== undefined ? nodeData.resizable : true;
          self.regionEditDialog.visible = true;
        }
      });
      
      self.graph.on('text-edit-click', (ev) => {
        const node = ev.node;
        const nodeData = node.getModel();
        
        if (self.currentGraphMode === 'preview') {
          return;
        }

        if (nodeData.type === 'cc-text') {
          self.textEditDialog.currentNode = node;
          self.textEditDialog.form.text = nodeData.text || '双击编辑文字';
          self.textEditDialog.form.color = nodeData.color || '#333333';
          self.textEditDialog.form.fontSize = nodeData.fontSize || 14;
          self.textEditDialog.form.fontWeight = nodeData.fontWeight || 'normal';
          self.textEditDialog.visible = true;
        }
      });
      
      self.graph.on('node-text-edit-click', (ev) => {
        const node = ev.node;
        const nodeData = node.getModel();
        
        if (self.currentGraphMode === 'preview') {
          return;
        }

        if (nodeData.type === 'cc-image') {
          self.nodeTextEditDialog.currentNode = node;
          self.nodeTextEditDialog.form.label = nodeData.label || '';
          self.nodeTextEditDialog.form.color = nodeData.labelCfg?.style?.fill || '#333333';
          self.nodeTextEditDialog.form.fontSize = nodeData.labelCfg?.style?.fontSize || 12;
          self.nodeTextEditDialog.form.fontWeight = nodeData.labelCfg?.style?.fontWeight || 'normal';
          self.nodeTextEditDialog.form.position = nodeData.labelCfg?.position || 'bottom';
          self.nodeTextEditDialog.visible = true;
        }
      });
      
      self.graph.on('node:dragstart', (ev) => {
        const node = ev.item;
        if (!node) return;
        
        const nodeData = node.getModel();
        const shape = ev.target;
        const shapeName = shape.get('name');
        
        if (nodeData.type === 'region' && nodeData.resizable) {
          if (shapeName && (shapeName === 'region-label' || shapeName === 'region-label-bar')) {
            ev.stopPropagation();
          }
        }
      });

      // 预加载告警数据
      self.preloadAlarmData();
      
    },

    // 预加载告警数据
    preloadAlarmData() {
      let self = this;
      if (!self.graph || self.graph.destroyed) return;

      // 重置告警缓存
      self.alarmCache = {};

      // 获取所有节点
      const nodes = self.graph.getNodes();
      // 获取所有组合节点
      const combos = self.graph.getCombos();

      // 预加载节点告警数据
      nodes.forEach(node => {
        const model = node.getModel();
        // 检查节点是否有告警状态
        if ((model.assetData && model.assetData.onlineStatus == '2') || 
            (model.deviceInfo && model.deviceInfo.onlineStatus == '2') ||
            (model.appState && model.appState.alert)) {
          self.loadAlarmDataToCache(model.id);
        }
      });

      // 预加载组合节点告警数据
      combos.forEach(combo => {
        const model = combo.getModel();
        self.loadAlarmDataToCache(model.id);
      });
    },

    // 加载告警数据到缓存
    loadAlarmDataToCache(assetId) {
      let self = this;
      const hasToken = self.$route && self.$route.query && self.$route.query.token;

      if (hasToken) {
        let params = {
          "id": assetId,
          "token": hasToken ? self.$route.query.token : ""
        };

        alarmListNew(params).then((res) => {
          self.alarmCache[assetId] = res.data || [];
        }).catch(error => {
          console.error(`加载节点 ${assetId} 告警数据失败:`, error);
          self.alarmCache[assetId] = [];
        });
      } else {
        let params = {
          "pageSize": 99,
          "pageNo": 1,
          "assetId": assetId,
          "alarmStatus": "0"
        };

        alarmList(params).then((res) => {
          self.alarmCache[assetId] = res.data && res.data.list ? res.data.list : [];
        }).catch(error => {
          console.error(`加载节点 ${assetId} 告警数据失败:`, error);
          self.alarmCache[assetId] = [];
        });
      }
    },
    
    forceLayoutHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        this.openFullScreenLoading()
        let container = document.getElementById('mount-topology');
        let centerX = container.clientWidth / 2;
        let centerY = container.clientHeight / 2;

        graph.updateLayout({
          type: 'force',
          center: [centerX, centerY],
          preventOverlap: true,
          linkDistance: 150,
          nodeStrength: -200,
          iterations: 100,
          onLayoutEnd: () => {
            this.closeFullScreenLoading()
            this.autoZoomHandler();
          }
        })
      }
    },
    changeEdgeShapeHandler(edgeShape) {
      this.currentEdgeShape = _.find(this.edgeShapeList, { 'guid': edgeShape })
      this.graph.$C.edge.type = this.currentEdgeShape['guid']
    },
    undoHandler() {
      if (this.historyIndex > 0 && this.historyIndex - (this.undoCount + 1) >= 0) {
        this.undoCount += 1
        let key = `graph_history_${this.historyIndex - this.undoCount}`
        let historyData = this.getHistoryData(key)
        this.changeGraphData(JSON.parse(historyData))
        this.refreshGraph()
      }
    },
    redoHandler() {
      if (this.undoCount > 0) {
        let key = `graph_history_${this.historyIndex - this.undoCount + 1}`
        let historyData = this.getHistoryData(key)
        this.changeGraphData(JSON.parse(historyData))
        this.undoCount -= 1
        this.refreshGraph()
      }
    },
    copyHandler() {
      this.nodesInClipboard = this.selectedNodes
      this.pasteCount = 0
    },
    pasteHandler() {
      this.pasteCount += 1
      let graph = this.graph
      let nodesInClipboard = this.nodesInClipboard
      if (graph && !graph.destroyed && nodesInClipboard.length > 0) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)
        
        for (let i = 0; i < nodesInClipboard.length; i++) {
          let node = nodesInClipboard[i]
          let model = node.getModel()
          let newModel = {
            ...model,
            id: utils.generateUUID(),
            x: model.x + 10 * this.pasteCount,
            y: model.y + 10 * this.pasteCount
          }
          graph.addItem('node', newModel)
        }
        
        if (this.undoCount > 0) {
          this.historyIndex = this.historyIndex - this.undoCount
          for (let i = 1; i <= this.undoCount; i++) {
            let key = `graph_history_${this.historyIndex + i}`
            this.removeHistoryData(key)
          }
          this.undoCount = 0
        }
        
        this.historyIndex += 1
        key = `graph_history_${this.historyIndex}`
        let currentData = JSON.stringify(graph.save())
        this.addHistoryData(key, currentData)
      }
    },
    deleteHandler() {
      let graph = this.graph

      let nodes = graph.getNodes()
      let edges = graph.getEdges()

      if (nodes.length > 0 || edges.length > 0) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)

        for (let i = nodes.length - 1; i >= 0; i--) {
          graph.removeItem(nodes[i])
        }

        if (this.undoCount > 0) {
          this.historyIndex = this.historyIndex - this.undoCount
          for (let i = 1; i <= this.undoCount; i++) {
            let key = `graph_history_${this.historyIndex + i}`
            this.removeHistoryData(key)
          }
          this.undoCount = 0
        }
        
        this.historyIndex += 1
        key = `graph_history_${this.historyIndex}`
        let currentData = JSON.stringify(graph.save())
        this.addHistoryData(key, currentData)
      }
    },
    
    deleteNodeWithEdges(nodeId) {
      let graph = this.graph
      let node = graph.findById(nodeId)
      if (node) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)

        graph.removeItem(node)

        if (this.undoCount > 0) {
          this.historyIndex = this.historyIndex - this.undoCount
          for (let i = 1; i <= this.undoCount; i++) {
            let key = `graph_history_${this.historyIndex + i}`
            this.removeHistoryData(key)
          }
          this.undoCount = 0
        }
        
        this.historyIndex += 1
        key = `graph_history_${this.historyIndex}`
        let currentData = JSON.stringify(graph.save())
        this.addHistoryData(key, currentData)
      }
    },
    zoomInHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        const width = graph.get('width');
        const height = graph.get('height');
        const center = { x: width / 2, y: height / 2 };

        const currentZoom = graph.getZoom();
        const newZoom = currentZoom * 1.2;

        graph.zoomTo(newZoom, center);
      }
    },
    zoomOutHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        const width = graph.get('width');
        const height = graph.get('height');
        const center = { x: width / 2, y: height / 2 };

        const currentZoom = graph.getZoom();
        const newZoom = currentZoom * 0.8;

        graph.zoomTo(newZoom, center);
      }
    },
    autoZoomHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed && graph.save().nodes.length > 0) {
        const nodes = graph.save().nodes;

        if (nodes.length === 1) {
          const width = graph.get('width');
          const height = graph.get('height');
          const center = { x: width / 2, y: height / 2 };

          const node = graph.findById(nodes[0].id);
          if (node) {
            const nodeModel = node.getModel();
            graph.updateItem(node, {
              x: center.x,
              y: center.y
            });
          }

          graph.zoomTo(1.0, center);
        } else {
          graph.fitView(100, 20)

          const currentZoom = graph.getZoom();
          if (currentZoom > 1.0) {
            graph.zoomTo(1.0);
          }
        }
      }
    },
    resetZoomHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        const width = graph.get('width');
        const height = graph.get('height');
        const center = { x: width / 2, y: height / 2 };

        graph.zoomTo(1, center);
      }
    },
    enableMinimapHandler(enableMinimap) {
      if (enableMinimap) {
        this.minimap = new G6.Minimap({
          size: [200, 120],
          type: 'default',
          className: 'g6-minimap'
        })
        this.graph.addPlugin(this.minimap)
      } else {
        this.graph.removePlugin(this.minimap)
      }
    },
    
    alignHandler(coordinate) {
      let graph = this.graph
      if (this.selectedNodes.length > 1 && this.selectedNode) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)
        
        let cfg = coordinate === 'horizontal' ? { y: this.selectedNode.getModel().y } : { x: this.selectedNode.getModel().x }
        for (let i = 0, len = this.selectedNodes.length; i < len; i++) {
          this.selectedNodes[i].updatePosition(cfg)
        }
        graph.refresh()
        
        if (this.undoCount > 0) {
          this.historyIndex = this.historyIndex - this.undoCount
          for (let i = 1; i <= this.undoCount; i++) {
            let key = `graph_history_${this.historyIndex + i}`
            this.removeHistoryData(key)
          }
          this.undoCount = 0
        }
        
        this.historyIndex += 1
        key = `graph_history_${this.historyIndex}`
        let currentData = JSON.stringify(graph.save())
        this.addHistoryData(key, currentData)
      }
      this.rightMenuShow = false
    },
    createComboHandler() {
      let graph = this.graph
      if (graph && !graph.destroyed && this.selectedNodes.length > 1 && this.selectedNode) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)
        
        let nodeIds = this.selectedNodes.map(item => {
          return item._cfg.id
        })
        
        let combo = graph.createCombo({
          id: utils.generateUUID()
        }, nodeIds)
        
        if (combo) {
          if (this.undoCount > 0) {
            this.historyIndex = this.historyIndex - this.undoCount
            for (let i = 1; i <= this.undoCount; i++) {
              let key = `graph_history_${this.historyIndex + i}`
              this.removeHistoryData(key)
            }
            this.undoCount = 0
          }
          
          this.historyIndex += 1
          let key = `graph_history_${this.historyIndex}`
          let currentData = JSON.stringify(graph.save())
          this.addHistoryData(key, currentData)
        }
        this.rightMenuShow = false
      }
    },
    removeComboHandler() {
      let graph = this.graph
      if (this.selectedCombo) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)
        
        let { nodes: subNodes, combos: subCombos } = this.selectedCombo.getChildren()
        subNodes.forEach(subNode => {
          let subNodeModel = subNode.getModel()
          subNodeModel.comboId = undefined
          subNode.update(subNodeModel)
        })
        subCombos.forEach(subCombo => {
          let subComboModel = subCombo.getModel()
          subComboModel.comboId = undefined
          subCombo.update(subComboModel)
        })
        graph.uncombo(this.selectedCombo)
        
        if (this.undoCount > 0) {
          this.historyIndex = this.historyIndex - this.undoCount
          for (let i = 1; i <= this.undoCount; i++) {
            let key = `graph_history_${this.historyIndex + i}`
            this.removeHistoryData(key)
          }
          this.undoCount = 0
        }
        
        this.historyIndex += 1
        key = `graph_history_${this.historyIndex}`
        let currentData = JSON.stringify(graph.save())
        this.addHistoryData(key, currentData)
        this.rightMenuShow = false
      }
    },
    addNode(clientX, clientY, nodeType) {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let historyData = JSON.stringify(graph.save())
        let key = `graph_history_${this.historyIndex}`
        this.addHistoryData(key, historyData)
        
        let droppoint = graph.getPointByClient(clientX, clientY)
        let node = graph.addItem('node', {
          id: utils.generateUUID(),
          x: droppoint.x,
          y: droppoint.y,
          label: nodeType.label,
          labelCfg: {
            position: 'bottom',
            style: {
              fill: nodeType.textColor || '#333333',
              fontSize: nodeType.fontSize || 12,
              fontWeight: nodeType.fontWeight || 'normal'
            }
          },
          type: 'cc-image',
          img: nodeType.imgSrc,
          size: [42, 42],
          width: 40,
          height: 36,
          anchorPoints: [
            [0.5, 0],
            [1, 0.5],
            [0.5, 1],
            [0, 0.5]
          ],
          appState: {
            alert: false
          }
        })
        
        if (node) {
          if (this.undoCount > 0) {
            this.historyIndex = this.historyIndex - this.undoCount
            for (let i = 1; i <= this.undoCount; i++) {
              let key = `graph_history_${this.historyIndex + i}`
              this.removeHistoryData(key)
            }
            this.undoCount = 0
          }
          
          this.historyIndex += 1
          let key = `graph_history_${this.historyIndex}`
          let currentData = JSON.stringify(graph.save())
          this.addHistoryData(key, currentData)
        }
      }
    },
    unselectAllNodes() {
    },
    addHistoryData(key, value) {
      try {
        sessionStorage.setItem(key, value)
      } catch (oException) {
        if (oException.name === 'QuotaExceededError') {
          console.warn('已经超出本地存储限定大小，清空历史记录！')
          this.clearHistoryData()
          this.historyIndex = 0
          this.undoCount = 0
          sessionStorage.setItem(key, value)
        }
      }
    },
    getHistoryData(key) {
      return sessionStorage.getItem(key)
    },
    removeHistoryData(key) {
      sessionStorage.removeItem(key)
    },
    clearHistoryData() {
      let keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith('graph_history')) {
          sessionStorage.removeItem(key)
        }
      })
    },
    
    refreshGraph() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        graph.refresh()
      }
    },
    getGraphData() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let { nodes, edges, groups, combos } = graph.save()
        let nodeComboIds = []

        nodes.forEach(node => {
          let nodeComboId = node.comboId
          if (typeof nodeComboId !== 'undefined' && nodeComboIds.indexOf(nodeComboId) < 0) {
            nodeComboIds.push(nodeComboId)
          }
        })
        graph.findAll('combo', combo => {
          let comboId = combo.get('model').id
          if (nodeComboIds.indexOf(comboId) < 0) {
            console.log('G6 bug')
            _.remove(combos, combo => {
              return combo.id === comboId
            })
        }
        })
        return {
          nodes: nodes, edges: edges, groups: groups, combos: combos
        }
      } else {
        return { nodes: [], edges: [], groups: [], combos: [] }
      }
    },
    changeGraphData(data) {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        if (data && data.nodes) {
          data.nodes.forEach(node => {
            if (node.deviceInfo?.assetName) {
              node.label = node.deviceInfo.assetName;
            } else if (node.assetName) {
              node.label = node.assetName;
            }
          });
        }
        graph.changeData(data)
        graph.refresh()

        setTimeout(() => {
          this.addDeleteButtonsToEdges()
        }, 100)
      }
    },
    changeGraphSize(graphWidth = 0, graphHeight = 0) {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let graphContainer = this.$refs.graphContainer.$el
        graphWidth = graphWidth || graphContainer.clientWidth
        graphHeight = graphHeight || graphContainer.clientHeight
        graph.changeSize(graphWidth, graphHeight)
      }
    },
    
    addDeleteButtonsToEdges() {
      let graph = this.graph
      if (graph && !graph.destroyed && this.currentGraphMode === 'edit') {
        const base = require('./edge/base').default
        const edges = graph.getEdges()
        edges.forEach(edge => {
          if (base.addDeleteButton && !edge.get('edgeComplete')) {
            base.addDeleteButton(edge)
          }
        })
      }
    },

    changeGraphMode(graphData, graphMode) {
      this.currentGraphMode = graphMode
      this.$emit('update:graphMode', graphMode)
      this.initTopo(graphData)

      setTimeout(() => {
        this.addDeleteButtonsToEdges()
      }, 100)
    },
    changeGraphTheme(themeValue) {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let nodes = graph.getNodes()
        let edges = graph.getEdges()
        switch (themeValue) {
          case 'darkStyle':
            this.graphBg = 'dark-style'
            graph.$T = theme.darkStyle
            for (let i = 0, len = edges.length; i < len; i++) {
              let edge = edges[i]
              let edgeModel = edge.getModel()
              edgeModel.style = graph.$T.edgeStyle.default
              edge.update(edgeModel)
            }
            for (let i = 0, len = nodes.length; i < len; i++) {
              let node = nodes[i]
              let nodeModel = node.getModel()
              nodeModel.labelCfg = graph.$T.nodeLabelCfg
              node.update(nodeModel)
            }
            graph.paint()
            break
          case 'officeStyle':
            this.graphBg = 'office-style'
            graph.$T = theme.officeStyle
            for (let i = 0, len = edges.length; i < len; i++) {
              let edge = edges[i]
              let edgeModel = edge.getModel()
              edgeModel.style = graph.$T.edgeStyle.default
              edge.update(edgeModel)
            }
            for (let i = 0, len = nodes.length; i < len; i++) {
              let node = nodes[i]
              let nodeModel = node.getModel()
              nodeModel.labelCfg = graph.$T.nodeLabelCfg
              node.update(nodeModel)
            }
            graph.paint()
            break
          default:
            this.graphBg = 'default-style'
            graph.$T = theme.defaultStyle
            for (let i = 0, len = edges.length; i < len; i++) {
              let edge = edges[i]
              let edgeModel = edge.getModel()
              edgeModel.style = graph.$T.edgeStyle.default
              edge.update(edgeModel)
            }
            for (let i = 0, len = nodes.length; i < len; i++) {
              let node = nodes[i]
              let nodeModel = node.getModel()
              nodeModel.labelCfg = graph.$T.nodeLabelCfg
              node.update(nodeModel)
            }
            graph.paint()
        }
      }
    },
    downloadFullImage() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let name = 'graph_' + _.now()
        graph.downloadFullImage(name, 'image/png', {
          backgroundColor: '#fff',
          padding: [30, 15, 15, 15]
        })
      }
    },
    downloadImage() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        let name = 'graph_' + _.now()
        graph.downloadImage(name, 'image/png', 'transparent')
      }
    },
    
    getGraphImageDataURL() {
      let graph = this.graph
      if (graph && !graph.destroyed) {
        try {
          const canvas = graph.get('canvas')
          if (!canvas) {
            console.error('未找到canvas实例')
            return null
          }

          const canvasDom = canvas.get('el') || canvas.canvas
          if (canvasDom && canvasDom.toDataURL) {
            const dataURL = canvasDom.toDataURL('image/png')
            console.log('成功获取图片dataURL，长度:', dataURL.length)
            return dataURL
          } else {
            console.error('canvas元素不支持toDataURL方法')
          }
        } catch (error) {
          console.error('获取图谱图片失败:', error)
        }
      } else {
        console.error('图谱实例不存在或已销毁')
      }
      return null
    },
    
    dataURLtoBlob(dataURL) {
      const arr = dataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    getUrl(path) {
      let url = path.indexOf('/static/img/profile') >= 0 ? path : '/admin-api/system/file' + path;
      return url;
    },
    
    async uploadGraphImage() {
      try {
        const dataURL = this.getGraphImageDataURL()

        if (!dataURL) {
          console.error('无法获取图谱图片数据')
          return null
        }

        const blob = this.dataURLtoBlob(dataURL)

        const formData = new FormData()
        formData.append("file", blob, `graph_${Date.now()}.png`);

        const resp = await uploadFile(formData)

        if (resp && resp.code === 0) {
          let url = ''

          if (typeof resp.data === 'string') {
            url = resp.data
          } else if (resp.data && resp.data.url) {
            url = resp.data.url
          } else if (resp.data) {
            url = String(resp.data)
          }

          if (!url) {
            console.error('后端返回的URL为空:', resp)
            return null
          }

          const hasExtension = /\.(png|jpg|jpeg|gif|webp)$/i.test(url)
          if (!hasExtension && !url.startsWith('http')) {
            url += '.png'
          }

          return url
        }

        console.error('图片上传失败，响应格式异常:', resp)
        return null
      }
      catch (error) {
        console.error('图片上传异常:', error)
        return null
      }
    },
    
    handleSelect(selection, row) {
      if (selection.length > 0) {
        this.selectedRows = [...selection];
        this.selectedRow = this.selectedRows.length > 0 ? this.selectedRows[0] : null;
      } else {
        this.selectedRow = null
        this.selectedRows = []
      }
    },
    
    addTpSubmit() {
      if (this.selectedRows && this.selectedRows.length > 0) {
        let graph = this.graph
        if (graph && !graph.destroyed && this.selectedRows.length > 0) {
          if (this.currentDragInfo.nodeId) {
            let tempNode = graph.findById(this.currentDragInfo.nodeId)
            if (tempNode) {
              graph.removeItem(tempNode)
            }
          }

          let historyData = JSON.stringify(graph.save())
          let key = `graph_history_${this.historyIndex}`
          this.addHistoryData(key, historyData)

          const createdNodes = []

          this.selectedRows.forEach((row, index) => {
            let nodeId = utils.generateUUID()

            const xOffset = index * 60;

            let nodeConfig = {
              id: String(row.id) || nodeId,
              x: this.currentDragInfo.position.x + xOffset,
              y: this.currentDragInfo.position.y
            }

            const dragNodeType = this.currentDragInfo.nodeType;

            if (dragNodeType.type === 'cc-text') {
              nodeConfig.type = dragNodeType.type;
              nodeConfig.text = dragNodeType.content || '双击编辑文字';
              nodeConfig.color = dragNodeType.color || '#333333';
              nodeConfig.fontSize = dragNodeType.fontSize || 14;
              nodeConfig.fontWeight = dragNodeType.fontWeight || 'normal';
              nodeConfig.anchorPoints = [];
            } else if (dragNodeType.type === 'region') {
              nodeConfig.type = 'region';
              nodeConfig.text = dragNodeType.text || dragNodeType.label || '区域';
              nodeConfig.textColor = dragNodeType.textColor || '#ffffff';
              nodeConfig.fontSize = dragNodeType.fontSize || 12;
              nodeConfig.fontWeight = dragNodeType.fontWeight || 'bold';
              nodeConfig.width = dragNodeType.width || 300;
              nodeConfig.height = dragNodeType.height || 200;
              nodeConfig.backgroundColor = dragNodeType.backgroundColor || 'rgba(15, 136, 242, 0.3)';
              nodeConfig.borderColor = dragNodeType.borderColor || '#409EFF';
              nodeConfig.borderWidth = dragNodeType.borderWidth || 1;
              nodeConfig.radius = dragNodeType.radius || 4;
              nodeConfig.opacity = dragNodeType.opacity || 30;
              nodeConfig.resizable = dragNodeType.resizable !== undefined ? dragNodeType.resizable : true;
              nodeConfig.anchorPoints = [
                [0, 0], [0.5, 0], [1, 0],
                [0, 0.5], [1, 0.5],
                [0, 1], [0.5, 1], [1, 1]
              ];
              
              this.regionChildren.set(nodeId, []);
              this.regionStates.set(nodeId, false);
            } else {
              // cc-image节点：使用拖拽时配置的文字样式
              nodeConfig.type = 'cc-image';
              nodeConfig.label = row.deviceInfo?.assetName || row.assetName || dragNodeType.label;
              nodeConfig.labelCfg = {
                position: this.dragTextStyle.position,
                style: {
                  fill: this.dragTextStyle.color,
                  fontSize: this.dragTextStyle.fontSize,
                  fontWeight: this.dragTextStyle.fontWeight
                }
              };
              nodeConfig.img = dragNodeType.imgSrc;
              nodeConfig.size = [42, 42];
              nodeConfig.width = 40;
              nodeConfig.height = 36;
              nodeConfig.anchorPoints = [
                [0.5, 0],
                [1, 0.5],
                [0.5, 1],
                [0, 0.5]
              ];
              nodeConfig.assetData = row;
              nodeConfig.appState = {
                alert: row.onlineStatus === 2
              };
            }

            let node = graph.addItem('node', nodeConfig)

            if (node) {
              createdNodes.push(node)
              // 加载告警数据到缓存
              if (row.onlineStatus === 2) {
                this.loadAlarmDataToCache(nodeConfig.id);
              }
            }
          })

          if (createdNodes.length > 0) {
            const selectedNodes = graph.findAllByState('node', 'selected');
            selectedNodes.forEach(node => {
              node.setState('selected', false);
            });
            createdNodes[0].setState('selected', true);
            this.selectedNode = createdNodes[0];

            createdNodes.forEach(node => {
              node.update(node.getModel());
            });

            graph.paint();
          }

          if (createdNodes.length > 0) {
            if (this.undoCount > 0) {
              this.historyIndex = this.historyIndex - this.undoCount
              for (let i = 1; i <= this.undoCount; i++) {
                let key = `graph_history_${this.historyIndex + i}`
                this.removeHistoryData(key)
              }
              this.undoCount = 0
            }
            this.historyIndex += 1
            key = `graph_history_${this.historyIndex}`
            let currentData = JSON.stringify(graph.save())
            this.addHistoryData(key, currentData)
          }
        }

        this.ziyuanDialogShow = false
        this.currentDragInfo = {
          nodeId: null,
          position: { x: 0, y: 0 },
          nodeType: null
        }
        this.selectedRow = null
        this.selectedRows = []
      } else {
        return this.$message.warning(this.$t('common.pleaseSelectResource'));
      }

    }
  },
  watch: {
    layoutType() {
      this.initTopo(this.graphData)
    },
    graphMode() {
      this.currentGraphMode = this.graphMode
      this.graphBg = this.currentGraphMode === 'edit' ? 'edit-style' : 'preview-style'
      this.changeGraphSize()
    },
    selectedNodeParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        let selectedNodeModel = this.selectedNode.getModel()
        if (utils.isObjectValueEqual(selectedNodeModel.appConfig, newVal.appConfig) && selectedNodeModel.label === newVal.label) {
          return
        }
        clearTimeout(this.selectedNodeParamsTimeout)
        this.selectedNodeParamsTimeout = setTimeout(() => {
          selectedNodeModel.label = newVal.label
          selectedNodeModel.appConfig = newVal.appConfig
          this.selectedNode.update(selectedNodeModel)
        }, 500)
      }
    },
    selectedEdgeParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        let selectedEdgeModel = this.selectedEdge.getModel()
        if (utils.isObjectValueEqual(selectedEdgeModel.appConfig, newVal.appConfig) && selectedEdgeModel.label === newVal.label) {
          return
        }
        clearTimeout(this.selectedEdgeParamsTimeout)
        this.selectedEdgeParamsTimeout = setTimeout(() => {
          let selectedEdgeModel = this.selectedEdge.getModel()
          selectedEdgeModel.label = newVal.label
          selectedEdgeModel.appConfig = newVal.appConfig
          this.selectedEdge.update(selectedEdgeModel)
        }, 500)
      }
    },
    selectedComboParams: {
      deep: true,
      handler: function (newVal, oldVal) {
        let selectedComboModel = this.selectedCombo.getModel()
        if (selectedComboModel.label === newVal.label &&
          selectedComboModel.labelCfg.position === newVal.labelPosition &&
          selectedComboModel.labelCfg.refX === newVal.labelRefX &&
          selectedComboModel.labelCfg.refY === newVal.labelRefY &&
          selectedComboModel.type === newVal.type) {
          return
        }
        clearTimeout(this.selectedComboParamsTimeout)
        this.selectedComboParamsTimeout = setTimeout(() => {
          let selectedComboModel = this.selectedCombo.getModel()
          selectedComboModel.label = newVal.label
          selectedComboModel.labelCfg.position = newVal.labelPosition ? newVal.labelPosition : 'top'
          selectedComboModel.labelCfg.refX = newVal.labelRefX ? newVal.labelRefX : 0
          selectedComboModel.labelCfg.refY = newVal.labelRefY ? newVal.labelRefY : 0
          selectedComboModel.type = newVal.type ? newVal.type : 'circle'
          this.selectedCombo.update(selectedComboModel)
        }, 500)
      }
    },
  },
  computed: {
    graphMode() {
      return this.currentGraphMode
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/iconfont/iconfont.css';

::v-deep .el-table__header-wrapper .el-checkbox {
  display: none !important;
}

*[draggable=true] {
  -khtml-user-drag: element;
}

.topology {
  height: 100%;
  margin: 0;
  padding: 0;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.graph-container {
  margin-top: 40px;
  position: relative;
  height: calc(100vh - 50px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  #mount-topology {
    position: relative;
    width: 100%;
    height: calc(100vh - 50px);
  }

  #mount-topology canvas {
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
  }
}

.graph-pannel {
  margin-top: 40px;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  color: #333;
  font-size: 12px;
  text-align: left;
  border-left: 0.1px solid #E6E9ED;
  border-bottom: 0.1px solid #E6E9ED;
  border-right: 0.1px solid #E6E9ED;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .node-type {
    display: inline-block;
    width: 55px;
    height: 55px;
    text-align: center;
    vertical-align: middle;
    border: 0.1px solid transparent;
    margin: 4px;

    img {
      height: 36px;
      width: 36px;
    }

    label {
      width: 50px;
      white-space: nowrap;
      text-overflow: ellipsis;
      -o-text-overflow: ellipsis;
      overflow: hidden;
      font-size: 12px;
      font-weight: 400;
    }
  }

  .node-type:hover {
    cursor: move;
    border: 1px solid #ccc;
  }

  .pannel-title {
    padding-left: 12px;
    height: 32px;
    font-weight: 600;
    color: #000;
    line-height: 32px;
    border-top: 0.1px solid #DCE3E8;
    border-bottom: 0.1px solid #DCE3E8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 12px;
  }

  .pannel-title:hover {
    background-color: #f5f7fa;
  }

  .toggle-icon {
    transition: transform 0.3s ease;
    font-size: 12px;
  }

  .pannel-body {
    transition: all 0.3s ease;
    overflow: hidden;
    padding: 16px 18px;

    span {
      display: block;
    }

    .params-input,
    .params-select,
    .params-input-number {
      margin: 5px 0 10px 0;
    }

    .params-input-number {
      width: 60px;
    }

    .el-input__inner {
      padding: 0 8px !important;
    }
  }
}

.right-menu {
  position: fixed;
  padding: 10px 5px;
  list-style: none;
  background-color: #fff;
  opacity: 1;
  border: 1px solid #DCDFE6;
  border-radius: 10px;

  li {
    padding: 5px;
    list-style-type: none;
    cursor: pointer;
  }

  li:hover {
    color: #409EFF;
  }
}

.default-style {
  background: #fff;
}

.edit-style {
  background-image:
    linear-gradient(to right, #f0f0f0 0.5px, transparent 0.5px),
    linear-gradient(to bottom, #f0f0f0 0.5px, transparent 0.5px);
  background-size: 6px 6px;
  background-position: center center;
  background-color: #ffffff;
}

.preview-style {
  background: transparent !important;
  overflow: hidden !important;
  color: white !important;

  * {
    background-color: transparent !important;
    color: white !important;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dark-style {
  background: #fff;
}

.office-style {
  background-image: linear-gradient(to right, #fef6de 0%, #f3ebd3 100%);
}
</style>

<style lang="scss">
.el-table .el-checkbox__inner {
  width: 18px;
  height: 18px;
}

.el-table .el-checkbox__input.is-checked .el-checkbox__inner::after {
  left: 6px;
}

.g6-tooltip {
  padding: 10px 6px;
  color: #444;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e2e2;
  border-radius: 4px;
}

.graph-container {
  #mount-topology .g6-minimap {
    position: absolute;
    right: 10px;
    bottom: 60px;
    border: 1px solid #e2e2e2;
  }
}

.tableClass {
  max-height: 260px;
  overflow-y: auto;
}
</style>