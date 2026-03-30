<template>
  <span>
    <template v-for="(dict, index) in this.getDictDatas2(type, value)">
      <!-- 默认样式 -->
      <span  :style="{width: dict.label.length == 1 ? '34px' :dict.label.length > 3 ? '90px' : '70px', textAlign: 'center'}" v-if="dict.colorType === 'default' || dict.colorType === '' || dict.colorType === undefined" :key="dict.value" :index="index"
            :class="dict.cssClass ? dict.cssClass : 'default'">{{ dict.label }}</span>
      <!-- Tag 样式 -->
      <el-tag v-else :disable-transitions="true" :key="dict.value" :index="index" :type="dict.colorType" :class="dict.cssClass" :style="{width: dict.label.length == 1 ? '34px' :dict.label.length > 3 ? '90px' : '70px', textAlign: 'center'}">
        {{ dict.label }}
      </el-tag>
    </template>
  </span>
</template>

<script>
export default {
  name: "DictTag",
  props: {
    type: String,
    value: [Number, String, Boolean, Array],
  },
};
</script>
<style scoped>
.default {
  display: inline-block;
  background-color: #EDF0F6;
    border-color: #e4eaf3;
    /* color: #4380f3; */
    display: inline-block;
    height: 32px;
    padding: 0 10px;
    line-height: 30px;
    font-size: 12px;
    color: #a1adc5;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    white-space: nowrap;
}
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
