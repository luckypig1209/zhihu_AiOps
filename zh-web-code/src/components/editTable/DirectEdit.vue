<template>
    <div v-show="show" class="edit-container">
      <div class="edit-title">
        编辑数据字典
      </div>
      <el-form v-if="activeColumn" label-width="80px">
        <el-form-item label="字典名称">
          <el-input v-model="activeColumn.name" size="mini" />
        </el-form-item>
        <el-form-item label="字典类型">
          <el-select v-model="activeColumn.type" size="mini">
            <el-option label="静态" value="static" />
            <el-option label="动态" value="dynamic" />
          </el-select>
        </el-form-item>
  
        <el-form-item v-if="activeColumn.type == 'static'" label="字典数据">
          <el-input
            v-model="activeColumn.data"
            type="textarea"
            :rows="4"
            placeholder="请输入[ {label,value},{label,value},{label,value} ]的字典数据"
          />
        </el-form-item>
  
        <el-form-item v-if="activeColumn.type == 'dynamic'" label="请求方式">
          <el-select v-model="activeColumn.method" size="mini">
            <el-option label="get" value="get" />
            <el-option label="post" value="post" />
          </el-select>
        </el-form-item>
  
        <el-form-item v-if="activeColumn.type == 'dynamic'" label="请求地址">
          <el-input v-model="activeColumn.url" size="mini" />
        </el-form-item>
  
        <el-form-item v-if="activeColumn.type == 'dynamic' && activeColumn.method === 'post'" label="请求体">
          <el-input
            v-model="activeColumn.requestBody"
            type="textarea"
            :rows="4"
            placeholder="请输入请求体(application/json)格式"
          />
        </el-form-item>
        <el-form-item v-if="activeColumn.type == 'dynamic'" label="数据转换函数">
          <el-input
            v-model="activeColumn.map"
            type="textarea"
            :rows="4"
            placeholder="数据转换函数例如:function(response){ return response.data }"
          />
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  let globalEvent = () => {}
  export default {
    props: ['activeColumn'],
    data() {
      return {
        show: false
      }
    },
    mounted() {
      // 挂载全局事件
      globalEvent = event => {
        if (!this.$el.contains(event.target) && !event.target.className.includes('edit-btn-flag')) {
          this.show = false
        }
      }
      document.body.addEventListener('click', globalEvent)
    },
    beforeDestroy() {
      document.body.removeEventListener('click', globalEvent)
    },
    methods: {
    }
  }
  </script>
  
  <style lang="scss" scoped>
    .edit-container {
      position: absolute;
      top: 0;
      left: 0px;
      transform: translateX(-100%);
      width: 270px;
      height: 100%;
      padding: 5px 10px 5px;
      border: 1px solid #eee;
      z-index: 3;
      background: #fff;
      overflow: auto;
      box-sizing: border-box;
  
      .edit-title {
        font-weight: 400;
        color: #1f2f3d;
        line-height: 35px;
        letter-spacing: 1.5px;
        font-size: 16px;
        border-bottom: 1px solid #eee;
        margin-bottom: 5px;
      }
    }
  
    ::v-deep .el-form-item {
      margin-bottom: 10px
    }
  
  </style>