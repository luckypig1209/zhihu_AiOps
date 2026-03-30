<template>
    <div>
      <el-tooltip class="item" effect="dark" :content="value" placement="right">
          <i class="el-icon-warning-outline"></i>
      </el-tooltip>
    </div>
  </template>
  
  <script>
  export default {
    name: "form-remark",
    props: {
      value: {
        type: [String, Number],
        default: "",
      },
    },
  };
  </script>
  
  <style lang="scss" >
  </style>
  