<template>
    <div>
      <el-tag
        :key="tag"
        v-for="tag in value"
        closable
        :disable-transitions="false"
        @close="handleClose(tag)">
        {{tag}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="inputValue"
        ref="saveTagInput"
        size="small"
        @keyup.enter.native="handleInputConfirm"
        @blur="handleInputConfirm"
      >
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 新增</el-button>
      </div>
</template>
<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>

<script>
  export default {
    props: {
      value: {
        type: [String, Number],
        default: [],
      },
    },
    data() {
      return {
        // value: [],
        inputVisible: false,
        inputValue: ''
      };
    },
    methods: {
      handleClose(tag) {
        this.value.splice(this.value.indexOf(tag), 1);
        this.$emit('input', this.value)
      },

      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.value.push(inputValue);
        }
        this.inputVisible = false;
        this.inputValue = '';
        this.$emit('input', this.value)
      }
    }
  }
</script>