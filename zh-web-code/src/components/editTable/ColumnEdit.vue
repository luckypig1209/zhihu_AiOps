<template>
    <div v-show="show" class="edit-container">
        <div class="edit-title">
            编辑列属性
        </div>
      <el-form v-if="activeColumn" label-width="80px">
        <el-form-item label="字段">
          <el-input :value="activeColumn.prop" size="mini" @input="columnPropChange" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="activeColumn.label" size="mini" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="activeColumn._columnDataType" size="mini"  @input="columnDataTypeChange">
            <el-option label="文本" value="text" />
            <el-option label="下拉选择框" value="customer" />
            <el-option label="日期" value="date" />
            <el-option label="附件" value="file" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="activeColumn._columnDataType == 'customer'" label-width="0">
          <Card style=" margin-bottom: 10px;">
                  
                    <table class="m-table">
                      <tr class="t-head">
                        <th>键</th>
                        <th>值 </th>
                        <th><el-button type="success" icon="el-icon-plus" size="small" @click="handleAddCond">添加</el-button></th>
                      </tr>
                      <tr v-for="(row, index) in activeColumn._customerHTML2" :key="'requestHeaderList[' + index + ']'" style="line-height:66px;text-align: center">
                        <td>
                          <el-form-item
                            :prop="'requestHeaderList[' + index + '].leftValue'"
                            label=""
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'change', message: '请输入值且不超过1000个字符' }"
                            :show-message="false"
                          >
                          <el-input  v-model="row.label" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                          </el-form-item>
                        </td>
                        <td>
                          <el-form-item
                            :prop="'requestHeaderList[' + index + '].rightValue'"
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'blur', message: '请输入值且不超过1000个字符' }"
                            :show-message="true"
                          >
                            <el-input  v-model="row.value" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                          </el-form-item>
                        </td>
                        <td>
                          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelRow(index)"></el-button>
                        </td>
                      </tr>
                    </table>
                  </Card>
        </el-form-item>   
        <el-form-item label="编辑格式">
          <el-select v-model="activeColumn._editType" size="mini">
            <el-option label="文本" value="text" />
            <el-option label="数值" value="number" />
            <el-option label="禁止编辑" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="宽度">
          <el-input v-model="activeColumn.width" placeholder="不填就是auto" min="0" size="mini" type="number" />
        </el-form-item>
        <el-form-item label="对其方式">
          <el-radio-group v-model="activeColumn.align" size="mini">
            <el-radio-button label="left">
              居右
            </el-radio-button>
            <el-radio-button label="center">
              居中
            </el-radio-button>
            <el-radio-button label="right">
              居右
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="固定列">
          <el-radio-group v-model="activeColumn.fixed" size="mini">
            <el-radio-button :label="null">
              无
            </el-radio-button>
            <el-radio-button label="left">
              左
            </el-radio-button>
            <el-radio-button label="right">
              右
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否排序">
          <el-switch v-model="activeColumn.sortable" size="mini" />
        </el-form-item>
        <el-form-item label="溢出隐藏">
          <el-switch v-model="activeColumn.showOverflowTooltip" size="mini" />
        </el-form-item>
        <el-form-item label="是否必填">
          <el-switch v-model="activeColumn.mustEdit" size="mini" />
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script>
  import { getAccessToken } from "@/utils/auth";
  import { fileDown } from "@/utils/fileDown";
  let globalEvent = () => {}
  export default {
    props: ['activeColumn'],
    data() {
      return {
        show: false,
        fileList: []
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
                //监控上传文件列表
        handleChange(file, fileList, scope) {
        this.formInfo.userListDto[scope.$index].fileIdList.push(file.name)
        },
        handleRemove(file, fileList, scope) {
        this.formInfo.userListDto[scope.$index].fileIdList = []
        },
        handleExceed() {
        this.$tips.tipWarning(`个人简历只能上传一个文件`)
        },
      columnDataTypeChange(){
        if(this.activeColumn._columnDataType == 'file'){ //附件
          this.activeColumn._customerHTML = 
          `function render(h,data,row,originRow,isDisabled,directs,changeCallback){
              var textLengthBool = originRow.${this.activeColumn.prop} && originRow.${this.activeColumn.prop}.length && originRow.${this.activeColumn.prop}.length > 0? true : false

              const mm = (file) => {
                  try {
                    // window.open("/admin-api/infra/file"+file.url, '_blank')
                       const x = new window.XMLHttpRequest();
                        x.open('GET', "/admin-api/infra/file"+file.url, true);
                        x.setRequestHeader('Authorization', "Bearer ${getAccessToken()}"); // 携带 Token
                        x.responseType = 'blob';
                        x.onload = () => {
                          console.log("x.response", x.response);
                          const url = window.URL.createObjectURL(x.response);
                          const a = document.createElement('a');
                          a.href = url;
                          a.target = '_blank'
                          a.download = file.name;
                          a.style.display = 'none'
                          document.body.append(a)
                          a.click();
                        };
                        x.send();
                    // this.$message.success('下载文件成功！');
                  } catch (error) {
                    // this.$message.error('解析路径失败！');
                  }
                  
                }
              return h( "el-upload",
              {
                  props: {
                    action: '/admin-api/infra/file/upload-file',
                    headers: { Authorization: "Bearer ${getAccessToken()}"  },
                    disabled: isDisabled? textLengthBool : false,
                    fileList: row.${this.activeColumn.prop},
                    onPreview: mm,
                    onSuccess: function(response, file, fileList) {
                      row.${this.activeColumn.prop} = fileList.map(item =>{
                        return {
                          name: item.response.data.name,
                          url: item.response.data.url
                        }
                      });
                       changeCallback();
                    }
                    // 传递props
                },
                  on: {
                    'before-upload': (file) => {
                    // 操作上传前的事件
                  },
                    'files-changed': (value) => {
                    // 操作更新modelValue的事件
                  }
                },
                  attrs: {
                  // 设置非props属性
                }
              },
              [
                            h(
                              "el-button",
                {
                              props: {
                                type:'primary'
                  }
                },
                "附件"
                          ),
              ]
            );
            }`
        } else if(this.activeColumn._columnDataType == 'date'){ //日期
          
          this.activeColumn._customerHTML =  
            `function render(h, data, row,originRow, isDisabled, directs, cb) {     
                var textLengthBool = originRow.${this.activeColumn.prop} === '' || originRow.${this.activeColumn.prop} === null? false : true
                
                return h(
                    "el-date-picker",
                    {
                    style:{
                      width: '100%'
                    },
                    props: {
                        placeholder: "请选择",
                        disabled: isDisabled? textLengthBool : false,
                        type: 'datetime',
                        value: row.${this.activeColumn.prop}, // 这里将v-model绑定为column1
                    },
                    on: {
                        input: (value) => {
                        // 更新值
                        row.${this.activeColumn.prop} = value;
                        cb();
                        },
                    },
                    },
                );
                }`
        }
        this.$forceUpdate()
      },
      updateData(){
        this.activeColumn._customerHTML = 
          `function render(h, data, row,originRow, isDisabled, directs, cb) {
                //表格类型
                const direct = ${JSON.stringify(this.activeColumn._customerHTML2)} //下拉选择
  
                // 创建option，这里可以进行数据映射和筛选
                const optionVNodes = direct.map((option) =>
                    h("el-option", {
                    props: {
                        value: option.value,
                        label: option.label,
                    },
                    })
                );
                var textLengthBool = originRow.${this.activeColumn.prop} === '' || originRow.${this.activeColumn.prop} === null? false : true
                return h(
                    "el-select",
                    {
                    // el-select 属性
                    props: {
                        placeholder: "请选择",
                        disabled: isDisabled? textLengthBool : false,
                        value: row.${this.activeColumn.prop}, // 这里将v-model绑定为column1
                        size: "small", // 设置尺寸为最小
                    },
                    on: {
                        input: (value) => {
                        // 更新值
                        row.${this.activeColumn.prop} = value;
                        cb();
                        },
                    },
                    },
                    optionVNodes
                );
                }`
        },
     handleAddCond() {
        if(!this.activeColumn._customerHTML2){
            this.activeColumn._customerHTML2 = []
        }
        this.activeColumn._customerHTML2.push({
                label: "",
                value: "",
         });
        this.$forceUpdate()
        this.updateData()
     },
     handleDelRow(index) {
        this.activeColumn._customerHTML2.splice(index, 1);
        this.$forceUpdate()
        this.updateData()
     },
     onInput(){
        this.$forceUpdate()
        this.updateData()
     },
      // 列字段修改
      columnPropChange(value) {
        this.$parent.columnPropChange(this.activeColumn, value)
      }
    }
  }
  
  </script>
  
  <style lang="scss" scoped>
        .m-table {
        width: 100%;
        margin-bottom: 10px;
        margin-top: 10px;
        .t-head {
            th {
            padding: 8px 0;
            background-color: #edf0f6;
            &:first-child {
                width: 30%;
            }
            &:nth-child(2) {
                width: 45%;
            }
            &:nth-child(3) {
                width: 15%;
            }
            }
        }
        td {
            .el-button--small {
            padding: 9px 10px;
            font-size: 14px;
            }
            ::v-deep .el-form-item {
            margin-bottom: 0;
            }
        }
        }
    .edit-container {
      position: absolute;
      top: 0;
      left: 0px;
      transform: translateX(-100%);
      width: 600px;
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