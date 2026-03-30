<template>
    <div>
      <el-table :data="value" v-bind="$attrs" style="width: 100%">
        <!-- 序号列 -->
        <el-table-column
          v-if="showNumber"
          label="序号"
          type="index"
          align="center"
          width="55px"
          :fixed="fixedNumber ? 'left' : null"
        />
        <!-- 内容列 -->
        <!-- :fixed="item.fixed" -->
        <el-table-column
          v-for="item in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :width="item.width || 'auto'"
          :align="item.align || 'center'"
          :sortable="item.sortable"
          :resizable="item.resizable"
          :fixed="item.fixed"
          :show-overflow-tooltip="item.showOverflowTooltip"
          :render-header="addTag"
        >
        
          <template slot-scope="scope">   
                         
            <!-- 修改 -->
            <div v-if="editRows[scope.$index] && item._editType != 'disabled'">
              <el-input
                v-if="item._editType == 'number'"
                v-model="scope.row[item.prop]"
                type="number"
                size="small"
                :disabled=" originCloumns[scope.$index] && originCloumns[scope.$index][item.prop] != '' && originCloumns[scope.$index][item.prop] != null "
              />
              <el-input v-else v-model="scope.row[item.prop]" size="small"   :disabled="originCloumns[scope.$index] && originCloumns[scope.$index][item.prop] != '' && originCloumns[scope.$index][item.prop] != null" />
            </div>
            <!-- 显示 -->
            <div v-else>
              <!-- 链接类型 -->
              <el-link
                v-if="item._columnDataType == 'link'"
                type="primary"
                @click="handleClickLink(scope.row[item.prop])"
              >
                {{ scope.row[item.prop] }}
              </el-link>
              <!-- 图片类型 -->
              <el-image
                v-else-if="item._columnDataType == 'picture'"
                style="width: 50px; height: 50px"
                :src="scope.row[item.prop]"
                :preview-src-list="[scope.row[item.prop]]"
              />
              <!-- 金额类型 -->
              <span v-else-if="item._columnDataType == 'amount'">{{
                Number(scope.row[item.prop]).toFixed(2)
              }}</span>
              <!-- 自定义类型 -->
              <Column
                v-else-if="item._columnDataType == 'customer' || item._columnDataType == 'file' || item._columnDataType == 'date'"
                :text="item._customerHTML"
                :data="scope.row[item.prop]"
                :row="scope.row"
                :directs="directs"
                :change-callback="handleChange"
                :isDisabled="item.isDisabled"
                :originRow="originCloumns[scope.$index]"
              />
              <!-- 文本类型 -->
              <span v-else>{{ scope.row[item.prop] }}</span>
            </div>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column
          v-if="addAble || editAble || delAble"
          label="操作"
          width="130px"
          align="center"
          :fixed="fixedEdit ? 'right' : null"
        >
          <template slot="header" slot-scope="scope">
            <el-button
              v-show="addAble"
              size="mini"
              type="text"
              style="font-size: 16px; color: #67c23a"
              icon="el-icon-plus"
              @click="handleAdd(scope.$index, scope.row)"
            />
            <span v-show="!addAble">操作</span>
          </template>
          <template slot-scope="scope">
            <el-button
              v-show="editAble"
              size="mini"
              type="text"
              style="font-size: 16px"
              :icon="editRows[scope.$index] ? 'el-icon-check' : 'el-icon-edit'"
             
              @click="handleEdit(scope.$index, scope.row)"
            />
            <el-button
              v-show="delAble"
              size="mini"
              type="text"
              style="font-size: 16px; color: #f56c6c"
              :disabled="columns[scope.$index].isDisabled  && originEditRows[scope.$index]? true : false"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index, scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </template>
  
  <script>
  import Column from './clounm.js'
  
  export default {
    components: {
      Column
    },
    props: {
      // 列
      columns: {
        type: Array,
        required: true
      },
      // 数据
      value: {
        type: Array,
        required: true
      },
      // 数据字典
      directs: {
        type: Array,
        default: () => ([])
      },
      // 是否可新增
      addAble: {
        type: Boolean,
        default: true
      },
      // 是否可编辑
      editAble: {
        type: Boolean,
        default: true
      },
      // 是否可删除
      delAble: {
        type: Boolean,
        default: true
      },
      // 固定序号列
      fixedNumber: {
        type: Boolean,
        default: true
      },
      // 固定操作列
      fixedEdit: {
        type: Boolean,
        default: true
      },
      // 是否显示序号
      showNumber: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        // 单独把row编辑状态拿出来而不是放在row数据中
        editRows: [],
        originCloumns: [],
        originEditRows: []
      }
    },
    created() {
      this.editRows = this.value.map(item => false)
      this.originCloumns = JSON.parse(JSON.stringify(this.value))
      this.originEditRows =  this.value.map(item => true)
    },
    methods: {
      addTag(h, { column }) {
        let mustEdit = false
        this.columns.forEach(item =>{
          if(item.label == column.label){
            mustEdit = item.mustEdit
          }
        })
        if(mustEdit){
          return [
            h("span", { style: "color:#F56C6C" }, "*"),
            h("span", " " + column.label),
          ];
        } else {
          return [
            h("span", " " + column.label),
          ];
        }

      },
      // 新增
      handleAdd(idx, row) {
        const obj = {}
        this.columns.forEach(column => {
          obj[column.prop] = null
        })        
        const originObj = {}
        this.columns.forEach(column => {
          originObj[column.prop] = ""
        })
        this.value.push(obj)
        this.originCloumns.push(originObj)
        this.editRows.push(false)
        this.$emit('input', this.value)
      },
      // 修改
      handleEdit(idx, row) {
        if (this.editRows[idx]) {
          this.$emit('input', this.value)
        }
        this.$set(this.editRows, idx, !this.editRows[idx])
      },
      // 删除
      handleDelete(idx, row) {
        this.value.splice(idx, 1)
        this.editRows.splice(idx, 1)
        this.originCloumns.splice(idx, 1)
        this.$emit('input', this.value)
      },
      // 自定义类型触发的更新
      handleChange() {
        this.$emit('input', this.value)
      },
      // 点击外链
      handleClickLink(url) {
        if (url) {
          if (!url.includes('https') && !url.includes('http')) {
            url = `http://${url}`
          }
          window.open(url)
        }
      }
    }
  }
  </script>