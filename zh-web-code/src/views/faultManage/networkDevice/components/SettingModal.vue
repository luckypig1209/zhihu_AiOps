<template>
  <a-modal
    v-model:visible="cellConfigVisible"
    :title="$t('common.setting')"
    width="550px"
    @cancel="handleClose"
    @ok="submit"
    :ok-text="$t('common.confirm')"
    :cancel-text="$t('common.cancel')"
  >
    <div class="setting-modal">
      <a-checkbox v-model="checkAll" @change="handleCheckAll">{{ $t('common.all') }}</a-checkbox>
      <!-- <a-checkbox @change="handleDefaultColumns">默认</a-checkbox> -->
      <div class="column-list">
        <a-checkbox-group v-model="cellCfgForm.selectedCells">
          <a-row :gutter="24">
            <a-col :span="8" v-for="(item, index) in allCellList" :key="index" style="min-width: 150px;">
              <a-checkbox  :value="item.label">{{ item.name }}</a-checkbox>
            </a-col>
          </a-row>
        </a-checkbox-group>
      </div>
    </div>
  </a-modal>
</template>

<script>
import {
  getTableHeadInfo,
  saveCustomField
} from "@/api/resource";
export default {
  name: "SettingModal",
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
  data() {
    return {
      selectAllColumns: false,
      selectedColumnKeys: [],
      allCellList:[], //所有表头像方便拖拽
      cellList: [], // 通用表头项
      cellCfgForm: {
        selectedCells: []
      },
      checkedList:[],
      checkAll: false,
    };
  },
  watch: {
    cellConfigVisible(val) {
      if (val)   this.formatCurrentFilter();
    },
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
             if(item.filed !== 'assetName' && 
                item.filed !== "assetTypeName" &&
                item.filed !== "modelName" ){
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
            // sortNumber: index
          })
        } else {
          selectedCells.push({
            filed: item.label,
            name: item.name,
            type: 1,
            status: 0,
            // sortNumber: index
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
          this.$message.success(this.$t('common.fieldConfigSuccess'))
          this.handleClose('submit')
          return
        }
        return this.$message.err(this.$t('common.fieldConfigFailed'))
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
};
</script>

<style scoped>
.setting-modal {
  .column-list {
    max-height: 250px;
    overflow: hidden;
    margin-top: 8px;
  }
}
</style>