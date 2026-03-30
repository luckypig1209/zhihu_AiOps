<template>
  <el-dialog :title="opt" :visible.sync="showModal" :loading="loading" width="900px">
    <el-row>
      <el-col :offset="1" :span="21">
        <el-steps simple :active="active" finish-status="success">
          <el-step title="基础信息配置"></el-step>
          <el-step title="能力配置"></el-step>
          <el-step title="测试发布"></el-step>
        </el-steps>
      </el-col>
    </el-row>
    <steps-content v-if="showModal" :activeStep="active"></steps-content>
    <el-button v-if="active > 0" type="primary" style="margin-top: 12px" @click="back">上一步</el-button>
    <el-button type="primary" style="margin-top: 12px" @click="next">下一步</el-button>
  </el-dialog>
</template>
<script>
import stepsContent from "./stepsContent.vue";
export default {
  name: "",
  data() {
    return {
      opt: "",
      showModal: false,
      loading: false,
      active: 0
    };
  },
  components: { stepsContent },
  methods: {
    next() {
      if (this.active++ === 2) this.active = 0;
    },
    back() {}
  },
  watch: {
    showModal: function (val) {
      if (val) {
      } else {
        this.active = 0;
      }
    }
  },
  created() {}
};
</script>
<style lang="less" scoped>
// max-width: ;
/deep/ .el-step__title.is-success {
  color: #6999f5;
}
/deep/ .el-step__head.is-success {
  color: #6999f5;
  border-color: #6999f5;
}
</style>
