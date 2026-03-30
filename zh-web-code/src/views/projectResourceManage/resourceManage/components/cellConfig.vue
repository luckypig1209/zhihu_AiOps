<!-- 
  @descript: 自定义表头项弹窗（字段配置）
-->
<template>
  <div class="container">
    <el-drawer
      :visible.sync="cellConfigVisible"
      title="字段配置(可通过拖拽调整顺序)"
      :show-close="false"
      :wrapperClosable="false"
      size="360px"
    >
      <el-form :model="cellCfgForm" ref="cellCfg">
        <el-checkbox v-model="checkAll" @change="handleCheckAll" class="select-all">全选</el-checkbox>
        <div style="margin-bottom: 5px"></div>
        <el-form-item prop="selectedCells" style="height: 78vh; overflow-y: auto;">
          <el-checkbox-group v-model="cellCfgForm.selectedCells" @change="handleSelectChange">
            <!-- <el-col :span="8" v-for="item in this.getDictDatas(DICT_TYPE.BPM_PROCESS_INSTANCE_COMMON_CELLS)" :key="item.value">
              <el-checkbox :label="item.value" :disabled="item.value === 'processInstanceId'">{{ item.label }}</el-checkbox>
            </el-col> -->
            <draggable v-model="allCellList" tag="ul" filter=".unDrag">
              <li v-for="item in allCellList" :key="item.label">
                <el-checkbox :label="item.label" :disabled="item.label === 'processInstanceId'" :class="item.label === 'processInstanceId'? 'unDrag': 'canDrag' ">{{ item.name }}</el-checkbox>
              </li>
            </draggable>            
            <!-- <el-col :span="8" v-for="item in cellList" :key="item.label">
              <el-checkbox :label="item.label">{{ item.name }}</el-checkbox>
            </el-col> -->
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div  class="dialog-footer">
        <el-button type="primary" @click="submit">确定</el-button>
        <el-button @click="handleClose">取消</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import {
  getTableHeadInfo,
  saveCustomField
} from "@/api/resource";
export default {
  components: {
    draggable
  },
  props: {
    cellConfigVisible: {
      required: true,
      default: false,
      type: Boolean
    },
    queryParams:{
      required: true,
      default: false,
      type: Object
    }
  },
  watch: {
    cellConfigVisible: {
      handler(v) {
        if (v) {
          this.formatCurrentFilter()
          // this.handleData()
        }
      }
    }
  },
  data () {
    return {
      allCellList:[], //所有表头像方便拖拽
      cellList: [], // 通用表头项
      cellCfgForm: {
        selectedCells: []
      },
      checkedList:[],
      checkAll: false,
      // demoData: [{"filed":"processInstanceId","name":"工单编号","type":0,"status":1,"sortNumber":0},{"filed":"title","name":"工单标题","type":1,"status":0,"sortNumber":1},{"filed":"tasks","name":"当前节点","type":1,"status":1,"sortNumber":2},{"filed":"assigneeName","name":"当前节点操作人","type":1,"status":1,"sortNumber":3},{"filed":"startUserName","name":"申请人","type":1,"status":0,"sortNumber":4},{"filed":"status","name":"工单状态","type":1,"status":0,"sortNumber":5},{"filed":"result","name":"操作结果","type":1,"status":0,"sortNumber":6},{"filed":"createTime","name":"创建时间","type":1,"status":0,"sortNumber":7},{"filed":"timeConsuming","name":"耗时","type":1,"status":0,"sortNumber":8},{"filed":"type","name":"工单类型","type":1,"status":1,"sortNumber":9},{"filed":"v-field101","name":"单行文本","type":1,"status":0,"sortNumber":10}]
    }
  },
  methods: {
    handleData(){
      let resData = this.demoData
      this.cellCfgForm.selectedCells = []
      this.allCellList = []
      resData.forEach(item =>{
        this.allCellList.push({
          label: item.filed,
          name: item.name
        })
        if(item.status === 1){
          this.cellCfgForm.selectedCells.push(item.filed)
        }
      })
    },
    // resetForm () {
    //   this.cellCfgForm = {
    //     selectedCells: []
    //   }
    //   this.$nextTick(_ => {
    //     this.$refs.cellCfg && this.$refs.cellCfg.clearValidate()
    //   })
    // },
    formatCurrentFilter (v) { // 获取全量字段、已选字段
      const params = {
          ...this.queryParams,
          status: 0
        }
        getTableHeadInfo(params).then(response => { // 已配置字段
          const resData = response.data || []
          this.cellCfgForm.selectedCells = []
          this.allCellList = []
          resData.forEach(item =>{
            if(item.filed !== 'dataSource'){
              this.allCellList.push({
              label: item.filed,
              name: item.name
            })
            }
            if(item.status === 1){
              this.cellCfgForm.selectedCells.push(item.filed)
            }
          })
          this.formatCheckAll()
        })
    },
    handleClose (type) {
      this.cellCfgForm.selectedCells = []
      this.allCellList = []
      this.$emit("cellCfgClose", type)
      this.resetForm('cellCfg')
      this.checkAll = false
    },
    handleCheckAll (value) {
      if (value) {
        const customeCells = this.allCellList.map(item => {
          return item.label
        })
        this.cellCfgForm.selectedCells = [...customeCells]
      } else {
        this.cellCfgForm.selectedCells = ['processInstanceId']
      }
    },
    handleSelectChange (value) {
      if (value.length === this.allCellList.length) {
        return this.checkAll = true
      }
      this.checkAll = false
    },
    submit () {
   
      let selectedCells = []
      this.allCellList.forEach((item,index) =>{
        if(this.cellCfgForm.selectedCells.includes(item.label)){
          selectedCells.push({
            filed: item.label,
            name: item.name,
            type: 1,
            status: 1,
            sortNumber: index
          })
        } else {
          selectedCells.push({
            filed: item.label,
            name: item.name,
            type: 1,
            status: 0,
            sortNumber: index
          })
        }
      })
      const params = {
        modelId: this.queryParams.modelId,
        fieldList: selectedCells,
        formId: null
      }
      saveCustomField(params).then(res => {
        if (res.code === 0) {
          this.$message.success("字段配置成功")
          this.handleClose('submit')
          return
        }
        return this.$message.err("字段配置失败")
      }).catch(_ => {
        
      })
    },
    formatCheckAll () {
      if (this.cellCfgForm.selectedCells.length === this.allCellList.length) {
        this.checkAll = true
      } else {
        this.checkAll = false
      }
    }
  },
  created () {},
}
</script>
<style lang="scss" scoped>
.el-checkbox {
  min-height: 25px;
  // margin-bottom: 25px;
}
.el-form-item {
  margin-bottom: 0px;
}
::v-deep.select-all {
  margin-left: 30px
}
::v-deep.select-all .el-checkbox__label {
  font-size: 18px;
  line-height: 20px;
}
::v-deep.select-all .el-checkbox__input {
  width: 20px;
  height: 22px;
  top: -2px;
}
::v-deep.select-all .el-checkbox__inner {
  width: 19px;
  height: 19px;
  &::after {
    height: 12px;
    left: 7px;
  }
}
::v-deep.el-checkbox-group .el-checkbox__label {
  font-size: 18px;
  line-height: 20px;
  padding-right: 20px;
  white-space: pre-wrap;
}
::v-deep.el-checkbox-group .el-checkbox__input {
  width: 20px;
  height: 22px;
  top: -2px;
}
::v-deep.el-checkbox-group .el-checkbox__inner {
  width: 19px;
  height: 19px;
  &::after {
    height: 12px;
    left: 7px;
  }
}
::v-deep.is-checked .el-checkbox__inner::after {
  height: 12px;
  left: 7px;
}
.dialog-footer {
  text-align: left;
  padding-left: 30px
}
::v-deep .el-drawer__header{
  font-size: 16px;
  font-weight: 1000;
}
</style>
