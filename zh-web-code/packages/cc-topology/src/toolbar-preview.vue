<template>
  <div class="toolbar">
    <div class="pull-right">
      <div class="graph-ops">
        <i class="iconfont icon-clear" :title="$t('common.delete')" :class="$parent.disableDelete ? 'disabled' : ''" @click="$parent.$parent.deleteHandler"></i>
        <span class="separator"></span>
        <i class="iconfont icon-zoom-in" id="zoom-in" :title="$t('common.zoomIn')" @click="$parent.$parent.zoomInHandler"></i>
        <i class="iconfont icon-zoom-out" :title="$t('common.zoomOut')" @click="$parent.$parent.zoomOutHandler"></i>
        <i class="iconfont icon-fit" :title="$t('common.autoZoom')" @click="$parent.$parent.autoZoomHandler"></i>
        <i class="iconfont icon-actualsize" :title="$t('common.resetZoom')" @click="$parent.$parent.resetZoomHandler"></i>
        <i class="iconfont icon-download" id="download" :title="$t('common.downloadImage')" @click="$parent.$parent.downloadFullImage"></i>
        <span class="separator"></span>
        <el-checkbox @change="$parent.$parent.enableMinimapHandler"
          style="margin-left: 8px; vertical-align: middle;color: #ededed">
          {{ $t('common.minimap') }}
        </el-checkbox>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ToolbarEdit'
}
</script>

<style lang="scss" scoped>
.toolbar {
  position: absolute;
  width: 100%;
  color: #333;
  text-align: left;
  vertical-align: middle;
  line-height: 42px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  z-index: 999;

  .graph-ops {
    display: inline-block;
    vertical-align: middle;
    margin: 0 16px;

    i {
      width: 20px;
      height: 20px;
      margin: 0 6px;
      line-height: 20px;
      color: #EDEDED;
      text-align: center;
      border-radius: 2px;
      display: inline-block;
      border: 1px solid rgba(2, 2, 2, 0);
    }

    i:hover {
      cursor: pointer;
      border: 1px solid #E9E9E9;
    }

    .disabled {
      color: rgba(0, 0, 0, 0.25);
    }

    .disabled:hover {
      cursor: not-allowed;
      border: 1px solid rgba(2, 2, 2, 0);
    }

    .icon-select {
      background-color: #EEEEEE;
    }

    .separator {
      margin: 4px;
      border-left: 1px solid #E9E9E9;
      vertical-align: middle;
    }
  }
}
</style>
<style lang="scss">
.graph-ops {
  .el-checkbox__input {
    vertical-align: baseline;

    .el-checkbox__inner {
      color: #EDEDED !important;
      background-color: transparent !important;
    }
  }

  .el-checkbox__label {
    vertical-align: text -bottom;
  }
}
</style>