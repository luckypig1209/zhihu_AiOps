<!-- 
  @description: 调度管理-执行一次
 -->
<template>
  <el-dialog 
    title="执行一次"
    :visible.sync="checkVisible"
    :before-close="cancel"
    width="650px">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-row :gutter="16">
        <el-col :span="24">
          <el-form-item prop="executorParam" label="任务参数">
            <el-input type="textarea" v-model.trim="form.executorParam" :autosize="{ minRows: 2, maxRows: 5 }" maxlength="600" placeholder="请输入任务参数" show-word-limit></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item prop="addressList" label="机器地址">
            <el-input type="textarea" v-model.trim="form.addressList" :autosize="{ minRows: 2, maxRows: 5 }" maxlength="600" placeholder="请输入本次执行的机器地址，为空则从执行器获取" show-word-limit></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit" :loading="isSubmitDisabled" :disabled="isSubmitDisabled">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { setOnce } from "@/api/xxJob"

export default {
  props: {
    checkVisible: {
      typeof: Boolean,
      required: true,
      default: false
    },
    checkInfo: {
      typeof: Object,
      required: true,
      default: (() => {})
    }
  },
  data() {
    return {
      isSubmitDisabled: false,
      form: {},
      rules: {}
    }
  },
  methods: {
    // 取消
    cancel() {
      this.$parent.checkVisible = false
      this.handleReset()
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    handleReset() {
      this.form = {}
    },
    // 提交
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.isSubmitDisabled = true
          const params = {
            jobId: this.checkInfo.id || '',
            ...this.form,
          }
          setOnce(params).then(res=> {
            this.isSubmitDisabled = false
            if (res.code === 0) {
              this.$modal.msgSuccess('执行成功')
              this.$parent.checkVisible = false
              this.cancel()
              this.$parent.getList()
            }
          }).catch(error=>{
              this.isSubmitDisabled = false
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
