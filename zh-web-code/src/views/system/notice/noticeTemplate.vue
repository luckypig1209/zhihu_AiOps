<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" v-show="showSearch" inline label-width="100px">
      <el-form-item label="模版名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入模版名称" />
      </el-form-item>
      <el-form-item label="通知方式" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择通知方式" filterable clearable>
          <el-option v-for="(item, index) in allTypes" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" filterable clearable>
          <el-option
            v-for="(item, index) in statusList"
            :label="item.label"
            :value="item.value"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建日期" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="datetimerange"
          style="width: 300px"
          range-separator="至"
          value-format="yyyy-MM-dd HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item style="margin-left: 6px">
        <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="small" plain icon="el-icon-plus" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="tableLoad" :data="tableList" border>
      <template slot="empty">
        <div class="no-data">
          <img src="../../../assets/images/table-empty.png" alt="" />
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column label="模版编码" show-overflow-tooltip align="center" prop="code" />
      <el-table-column label="模版名称" min-width="150px" align="center" prop="name" />
      <el-table-column label="通知方式" min-width="80px" align="center" prop="type">
        <template slot-scope="scope">
          {{ scope.row.typeName }}
        </template>
      </el-table-column>
      <el-table-column label="模版内容" min-width="180px" align="center" prop="content" />
      <el-table-column label="开启状态" min-width="80px" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 1" type="success">{{ statusMap[scope.row.status] }}</el-tag>
          <el-tag v-if="scope.row.status === 2" type="info">{{ statusMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" min-width="130px" align="center" prop="createTime">
        <template slot-scope="scope">
          {{ formatTime(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100px" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <!-- <el-button size="mini" type="text" icon="el-icon-share" @click="handleShare(scope.row)">推送</el-button> -->
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <el-dialog :visible.sync="showAdd" :title="title" :width="addForm.type == '9'? (1200 + 'px') : (800 + 'px')" @close="cancelAdd">
      <div style="display: flex;width: 100%;">
        <el-form style="width:800px" ref="addForm" :model="addForm" label-width="120px">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item
                label="模版编号"
                prop="code"
                :rules="{ required: true, message: '请输入模版编号', trigger: 'blur' }"
              >
                <el-input
                  v-model="addForm.code"
                  maxlength="20"
                  :readonly="title === '修改模版'"
                  placeholder="请输入模版编号"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="模版名称"  :rules="{ required: true, message: '请输入模版名称', trigger: 'blur' }" prop="name">
                <el-input v-model="addForm.name" maxlength="40" placeholder="请输入模版名称" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item
                label="通知方式"
                prop="type"
                :rules="{ required: true, message: '请选择通知方式', trigger: 'change' }"
              >
                <el-select v-model="addForm.type" @change="typeChange" clearable>
                  <el-option
                    v-for="(item, index) in allTypes"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value + index"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>

          <el-col :span="24" v-if="addForm.type == '9'">
              <el-form-item
                label="URL"
                prop="requestUrl"
                :rules="{ required: true, message: '请输入URL', trigger: 'change' }"
              >
              <div style="display: flex;">
                <el-select v-model="addForm.requestMethod" style="width:100px" @input="changeMethod()">
                  <el-option
                    v-for="(item, index) in methodsTypes"
                    :label="item.label"
                    :value="item.value"
                    :key="item.value + index"
                  ></el-option>
                </el-select>
                <el-input v-model="addForm.requestUrl"  placeholder="请输URL" />
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="4" v-if="addForm.type == '9'" style="padding-top: 16px;">
            <h3 style="padding-left: 44px; margin-bottom: 20px">请求参数</h3>
            </el-col>

            <el-col :span="20" v-if="addForm.type == '9'" style="padding-left: 0;">
              <el-tabs v-model="tabValue" >
                <el-tab-pane label="header" name="Header">
                  <Card style=" margin-bottom: 10px;">
                    <!-- <el-button type="success" icon="el-icon-plus" size="small" @click="handleAddCond">添加Header</el-button> -->
                    <table class="m-table">
                      <tr class="t-head">
                        <th>字段</th>
                        <th>值 </th>
                        <th><el-button type="success" icon="el-icon-plus" size="small" @click="handleAddCond">添加</el-button></th>
                      </tr>
                      <tr v-for="(row, index) in addForm.requestHeaderList" :key="'requestHeaderList[' + index + ']'" style="line-height:66px;text-align: center">
                        <td>
                          <el-form-item
                            :prop="'requestHeaderList[' + index + '].leftValue'"
                            label=""
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'change', message: '请输入值且不超过1000个字符' }"
                            :show-message="false"
                          >
                          <el-input  v-model="row.leftValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                          </el-form-item>
                        </td>
                        <td>
                          <el-form-item
                            :prop="'requestHeaderList[' + index + '].rightValue'"
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'blur', message: '请输入值且不超过1000个字符' }"
                            :show-message="true"
                          >
                            <el-input  v-model="row.rightValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                          </el-form-item>
                        </td>
                        <td>
                          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelRow(index)"></el-button>
                        </td>
                      </tr>
                    </table>
                  </Card>
                </el-tab-pane>
                <el-tab-pane v-if="addForm.requestMethod == 'post'" label="body" name="Body">
                    <Card style=" margin-bottom: 10px">
                      <!-- <el-button type="primary" icon="el-icon-plus" size="small" @click="handleBodyAddCond">添加Body</el-button> -->
                      <table class="m-table">
                        <tr class="t-head2">
                          <th>字段</th>
                          <th>类型 </th>
                          <th>值 </th>
                          <th> <el-button type="primary" icon="el-icon-plus" size="small" @click="handleBodyAddCond">添加</el-button></th>
                        </tr>
                        <tr v-for="(row, index) in addForm.requestBodyList" :key="'requestBodyList[' + index + ']'" style="line-height:66px;text-align: center">
                          <td>
                            <el-form-item
                              :prop="'requestBodyList[' + index + '].leftValue'"
                              label=""
                              label-width="0"
                              :rules="{ required: false, max:1000, trigger: 'change', message: '请输入值且不超过1000个字符' }"
                              :show-message="false"
                            >
                            <el-input  v-model="row.leftValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                            </el-form-item>
                          </td>
                          <td>
                            <el-select v-model="row.type" placeholder="请选择" @input="changeRightValue()">
                              <el-option
                                v-for="field in typeList"
                                :key="field.label"
                                :label="field.value"
                                :value="field.label"
                                ></el-option>
                              </el-select>
                          </td>
                          <td>
                            <el-form-item
                              :prop="'requestBodyList[' + index + '].rightValue'"
                              label-width="0"
                              :rules="{ required: false, max:1000, trigger: 'blur', message: '请输入值且不超过1000个字符' }"
                              :show-message="true"
                            >
                            <div style="display: flex;">
                              <el-input v-if="row.type == 'input'"  v-model="row.rightValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                              <el-select v-if="row.type == 'select'" v-model="row.rightValue" placeholder="请选择" @input="changeRightValue()">
                              <el-option
                                v-for="field in fieldList1"
                                :key="field.prop"
                                :label="field.name"
                                :value="field.name"
                                ></el-option>
                              </el-select>
                              <div v-if="row.type == 'array'" class="tag-style">
                                <el-tag
                                  :key="tag"
                                  v-for="tag in row.dynamicTags"
                                  closable
                                  :disable-transitions="false"
                                  @close="handleClose(tag, index)">
                                  {{tag}}
                                </el-tag>
                                <el-input
                                  class="input-new-tag"
                                  v-if="row.inputVisible"
                                  v-model="inputValue"
                                  ref="saveTagInput"
                                  size="small"
                                  @keyup.enter.native="handleInputConfirm(index)"
                                  @blur="handleInputConfirm(index)"
                                >
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(index)">+ 新增</el-button>
                              </div>
                            <!-- <el-button type="success" size="small" icon="el-icon-sort" @click="changeType(index)"></el-button> -->
                            </div>
                            </el-form-item>
                          </td>
                          <td>
                            <el-button type="danger" size="small" icon="el-icon-delete" @click="handleBodyDelRow(index)"></el-button>
                          </td>
                        </tr>
                      </table>
                    </Card>
                </el-tab-pane>
                <el-tab-pane v-if="addForm.requestMethod == 'get'" label="params" name="Params">
                  <Card style=" margin-bottom: 10px;">
                    <table class="m-table">
                      <tr class="t-head">
                        <th>字段</th>
                        <th>值 </th>
                        <th> <el-button type="primary" icon="el-icon-plus" size="small" @click="handleParamsAddCond">添加</el-button></th>
                      </tr>
                      <tr v-for="(row, index) in addForm.requestParamsList" :key="'requestParamsList[' + index + ']'" style="line-height:66px;text-align: center">
                        <td>
                          <el-form-item
                            :prop="'requestParamsList[' + index + '].leftValue'"
                            label=""
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'change', message: '请输入值且不超过1000个字符' }"
                            :show-message="false"
                          >
                          <el-input  v-model="row.leftValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                          </el-form-item>
                        </td>
                        <td>
                          <el-form-item
                            :prop="'requestParamsList[' + index + '].rightValue'"
                            label-width="0"
                            :rules="{ required: false, max:1000, trigger: 'blur', message: '请输入值且不超过1000个字符' }"
                            :show-message="true"
                          >
                          <div style="display: flex;">
                            <el-input v-if="row.type == 'input'"  v-model="row.rightValue" placeholder="请输入值且不超过1000个字符" @input="onInput()"></el-input>
                            <el-select v-else v-model="row.rightValue" placeholder="请选择" @input="changeParamsRightValue()">
                            <el-option
                              v-for="field in fieldList1"
                              :key="field.prop"
                              :label="field.name"
                              :value="field.name"
                              ></el-option>
                            </el-select>
                          <el-button type="success" size="small" icon="el-icon-sort" @click="changeParamsType(index)"></el-button>
                          </div>
                          </el-form-item>
                        </td>
                        <td>
                          <el-button type="danger" size="small" icon="el-icon-delete" @click="handleParamsDelRow(index)"></el-button>
                        </td>
                      </tr>
                    </table>
                  </Card>
                </el-tab-pane>
              </el-tabs>
            </el-col>

            <el-col
              v-if="
                addForm.type == 2 ||
                addForm.type == 4 ||
                addForm.type == 5 ||
                addForm.type == 6 ||
                addForm.type == 7 ||
                addForm.type == 8
              "
              :span="24"
            >
              <el-form-item
                :label="typeName"
                prop="way"
                :rules="{ required: true, message: typePlace, trigger: 'change' }"
              >
                <el-input v-model="addForm.way" maxlength="250" :placeholder="typePlace" />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="(addForm.type != '9' || (addForm.type == '9' && hasTemplete))">
              <el-form-item
                label="模版内容"
                prop="content"
                :rules="{ required: true, message: '请输入模版内容', trigger: 'change' }"
              >
                <span slot="label">
                  <span>模版内容</span>
                  <el-tooltip v-if="addForm.type == 8" content="模版内容内容格式：客户名称|工单编号|工单内容" placement="top" effect="light">
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                  <el-tooltip v-else content="外部自定义字段样式：{xxxx}" placement="top" effect="light">
                    <i class="el-icon-question"></i>
                  </el-tooltip>
                </span>
                <el-input
                  type="textarea"
                  v-model="addForm.content"
                  show-word-limit
                  maxlength="200"
                  placeholder="请输入模版内容"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="(addForm.type != '9' || (addForm.type == '9' && hasTemplete))">
              <el-form-item label="工单字段" prop="fields">
                <el-select v-model="addForm.fields" placeholder="请选择工单字段" multiple @change="flag = false">
                  <el-option
                    v-for="field in fieldList"
                    :key="field.prop"
                    :label="field.name"
                    :value="field.name"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label="开启状态"
                :rules="{ required: true, message: '请选择开启状态', trigger: 'change' }"
                prop="status"
              >
                <el-radio-group v-model="addForm.status">
                  <el-radio :label="1">开启</el-radio>
                  <el-radio :label="2">关闭</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  type="textarea"
                  v-model="addForm.remark"
                  show-word-limit
                  maxlength="200"
                  placeholder="请输入备注"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div v-if="addForm.type == '9'" class="m-show">
          <div class="m-show-top">
            <div style="line-height: 36px;font-weight: 800;">数据预览</div>
            <el-button type="primary" :loading="test_loading" style="margin-left: auto;" @click="testTemplete">测试连接</el-button>
          </div>
          <json-viewer :value="jsonData" :expand-depth="5" copyable  sort></json-viewer>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="modal_loading" @click="addConfirm">确定</el-button>
        <el-button @click="showAdd = false">取消</el-button>
      </div>
    </el-dialog>
    <!-- 推送 -->
    <el-dialog :visible.sync="showPush" title="发送通知" width="700px" @close="cancelPush">
      <el-form ref="pushForm" :model="pushForm" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="22">
            <el-form-item
              label="模版内容"
              prop="content"
              :rules="{ required: true, message: '请输入模版内容', trigger: 'change' }"
            >
              <el-input
                type="textarea"
                v-model="pushForm.content"
                show-word-limit
                maxlength="200"
                :autosize="{ minRows: 2, maxRows: 5 }"
                placeholder="请输入模版内容"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="发送所有人"
              :rules="{ required: true, message: '请选择是否', trigger: 'change' }"
              prop="isAll"
            >
              <el-radio-group v-model="pushForm.isAll" @change="pushForm.receiver = ''">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="pushForm.isAll === '否'">
            <el-form-item
              label="接收人"
              prop="receiver"
              :rules="{ required: pushForm.isAll === '否', message: '请选择是否', trigger: 'change' }"
            >
              <el-select v-model="pushForm.receiver">
                <el-option v-for="item in receiverList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="modal_loading" @click="addConfirm">确定</el-button>
        <el-button @click="cancelPush">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from "moment";
import {
  messageTemplateCreate,
  messageTemplateDelete,
  messageTemplateList,
  messageTemplateUpdate,
  notifyWay,
  getTemplateOrderFields,
  testTempleteAPI
} from "@/api/system/notice";
import { listData } from "@/api/system/dict/data";
import { deepClone } from "@/utils";
import jsonViewer from "vue-json-viewer";
// import codemirror from '@/components/codemirror/index'
export default {
  name: "templateManage",
  components: { 
    jsonViewer, 
    // codemirror 
  },
  data() {
    return {
      showSearch: true,
      typeName: "", //标签
      typePlace: "",
      tpyeMsg: "",
      jsonData:{},
      methodsTypes:[
        {
          label: "post",
          value: "post"
        },
        {
          label: "get",
          value: "get"
        }       
      ],
      statusList: [
        {
          label: "开启",
          value: 1
        },
        {
          label: "关闭",
          value: 2
        }
      ],
      statusMap: {
        1: "开启",
        2: "关闭"
      },
      queryParams: {
        name: "",
        status: "",
        type: "",
        createTime: [],
        pageNo: 1,
        pageSize: 10
      },
      tabValue: 'Header',
      addForm: {
        type: "",
        code: "",
        name: "", //模版名称
        content: "",
        way: "",
        fields: [],
        status: 1,
        remark: "",
        requestHeaderList:[],
        requestBodyList:[],
        requestParamsList:[],
        requestUrl:'',
        requestMethod:'post'
      },
      showPush: false,
      pushForm: {
        content: "",
        isAll: "是",
        receiver: ""
      },
      receiverList: [{ id: "dfda", name: "孙艳" }],
      tableList: [],
      tableLoad: false,
      total: 0,
      // page: { total: 0, pageSize: 10, current: 1 },
      showAdd: false, // 新增类别
      allTypes: [],
      modal_loading: false,
      test_loading: false,
      title: "",
      fieldList: [],
      fieldList1:[],
      flag: false,
      hasTemplete: false,
      inputValue:'',
      typeList:[
        {
          label: "input",
          value: "string类型"
        },
        {
          label: "array",
          value: "数组类型"
        },
        {
          label: "select",
          value: "下拉选择"
        },
      ]
    };
  },
  watch: {
    "addForm.type": {
      handler(val) {
        console.log("va", val, this.addForm.type);
        switch (this.addForm.type) {
          case "2":
            this.typeName = "邮箱账号";
            this.typePlace = "请输入邮箱账号";
            break;
          case "4":
            this.typeName = "钉钉webhook";
            this.typePlace = "请输入钉钉webhook";
            break;
          case "5":
            this.typeName = "微信ID";
            this.typePlace = "请输入微信ID";
            break;
          case "6":
            this.typeName = "企微机器人地址";
            this.typePlace = "请输入企微机器人地址";
            break;
          case "7":
            this.typeName = "飞书机器人地址";
            this.typePlace = "请输入飞书机器人地址";
            break;
          case "8":
            this.typeName = "项目ID";
            this.typePlace = "请输入项目ID";
            break;
        }
      }
    },
    "addForm.content": function (val) {
      if (val == "") {
        this.addForm.fields = [];
        return;
      }
      let arr = val.match(/#(\S*)#/g) || [];
      arr = arr.map((el) => {
        return el.replace(/\#/g, "");
      });
      if (arr.length === 0) {
        this.addForm.fields = [];
      }
      if (arr.length > 0) {
        let d = this.fieldList.filter((v) => {
          return (
            arr.findIndex((el) => {
              return v.name == el;
            }) != -1
          );
        });
        this.addForm.fields = d.map((el) => {
          return el.name;
        });
      }
    },
    "addForm.fields": function (newVal, oldVal) {
      if (this.flag) return;
      if (newVal.length === 0 && oldVal.length === 0) {
        return;
      }
      if (newVal.length > oldVal.length) {
        let arr = newVal.filter((v) => {
          return !oldVal.includes(v);
        });
        this.addForm.content += ` #${arr[0]}#`;
      } else {
        let arr = oldVal.filter((v) => {
          return !newVal.includes(v);
        });
        let reg = new RegExp(` #${arr[0]}#`, "g");
        this.addForm.content = this.addForm.content.replace(reg, "");
      }
    }
  },
  methods: {
    handleClose(tag, index) {
        this.addForm.requestBodyList[index].dynamicTags.splice(this.addForm.requestBodyList[index].dynamicTags.indexOf(tag), 1);
        this.addForm.requestBodyList[index].rightValue = this.addForm.requestBodyList[index].dynamicTags.join(',')
        this.$forceUpdate()
      },

      showInput(index) {
        this.addForm.requestBodyList[index].inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
        this.$forceUpdate()
      },

      handleInputConfirm(index) {
        let inputValue = this.inputValue;      
        if (inputValue) {
          this.addForm.requestBodyList[index].dynamicTags.push(inputValue);
        }
        this.addForm.requestBodyList[index].rightValue = this.addForm.requestBodyList[index].dynamicTags.join(',')
        this.addForm.requestBodyList[index].inputVisible = false
        this.inputValue = '';
        this.$forceUpdate()
      },     
    handleFielsChange() {},
    typeChange() {
      this.addForm.way = "";
    },
    formatTime(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      console.log(this.queryParams);
      this.handleQuery();
    },
    getList() {
      this.tableLoad = true;
      messageTemplateList(this.queryParams).then((res) => {
        this.tableLoad = false;
        this.total = res.data.total;
        res.data.list.forEach((item) => {
          this.allTypes.forEach((items) => {
            if (item.type == items.value) {
              item.typeName = items.label;
            }
          });
        });
        this.tableList = res.data.list; //文旅先隐藏自定义
      });
    },
    handleAdd() {
      this.showAdd = true;
      this.title = "添加模版";
      this.fieldList1 = JSON.parse(JSON.stringify(this.fieldList))
      // this.fieldList1.push({
      //   prop: 'content',
      //   name: '模板内容'
      // })
      this.jsonData = {}
      this.addForm = {
        type: "",
        code: "",
        name: "", //模版名称
        content: "",
        way: "",
        fields: [],
        status: 1,
        remark: "",
        requestHeaderList:[],
        requestBodyList:[],
        requestParamsList:[],
        requestUrl:'',
        requestMethod:'post'
      }
      this.$refs.addForm.resetFields();
      
    },
    handleDel(row) {
      const ids = row.id;
      this.$modal
        .confirm("是否确认删除该模版?")
        .then(function () {
          return messageTemplateDelete({ id: row.id });
        })
        .then(() => {
          this.handleQuery();
          this.$modal.msgSuccess("删除成功");
        });
    },
    handleAddCond() {
      this.addForm.requestHeaderList.push({
            leftValue: "",
            rightValue: "",
        });
        this.$forceUpdate()
    },
    handleDelRow(index) {
      this.addForm.requestHeaderList.splice(index, 1);
      this.$eUpdate()
    },    
    handleBodyDelRow(index) {
      this.addForm.requestBodyList.splice(index, 1);
      this.$forceUpdate()
    },
    handleParamsDelRow(index) {
      this.addForm.requestParamsList.splice(index, 1);
      this.$forceUpdate()
    },    
    changeType(index){
      this.addForm.requestBodyList[index].rightValue = ''
      if(this.addForm.requestBodyList[index].type == 'input'){
        this.addForm.requestBodyList[index].type = 'select'
      } else{
        this.addForm.requestBodyList[index].type = 'input'
      }
      this.changeRightValue()
    },
    changeParamsType(index){
      this.addForm.requestParamsList[index].rightValue = ''
      if(this.addForm.requestParamsList[index].type == 'input'){
        this.addForm.requestParamsList[index].type = 'select'
      } else{
        this.addForm.requestParamsList[index].type = 'input'
      }
      this.changeParamsRightValue()
    },    
    handleBodyAddCond() {
      this.addForm.requestBodyList.push({
            leftValue: "",
            type:'input',
            rightValue: "",
            inputVisible: false,
            dynamicTags:[]
        });
        this.$forceUpdate()
    }, 
    handleParamsAddCond() {
      this.addForm.requestParamsList.push({
            leftValue: "",
            type:'input',
            rightValue: "",
        });
        this.$forceUpdate()
    },     
    handleSubmitData(){
      //操作请求标头
      let requestHeaderObj = {}
      this.addForm.requestHeaderList.forEach(item=>{
            requestHeaderObj[item.leftValue] = item.rightValue
            
      })
      //操作请求体Body
      let requestBodyObj = {}
      this.addForm.requestBodyList.forEach(item =>{
        if(item.type == 'input'){
          requestBodyObj[item.leftValue] = item.rightValue
        } else if(item.type == 'array'){
          requestBodyObj[item.leftValue] = item.rightValue.split(',')
        }else{
          let rightKey = "";
          this.fieldList1.forEach((iitem) => {
            if (iitem.name === item.rightValue) {
              rightKey = iitem.prop;
            }
          });
        requestBodyObj[item.leftValue] = `{${rightKey}}`
        }
            
      })
      //操作请求体Params
      let requestParamsObj = {}
      this.addForm.requestParamsList.forEach(item =>{
        if(item.type == 'input'){
          requestParamsObj[item.leftValue] = item.rightValue
        } else {
          let rightKey = "";
          this.fieldList1.forEach((iitem) => {
            if (iitem.name === item.rightValue) {
              rightKey = iitem.prop;
            }
          });
          requestParamsObj[item.leftValue] = `{${rightKey}}`
        }
            
      })      
          const params = {
              code: this.addForm.code,
              type: Number(this.addForm.type),
              remark: this.addForm.remark,
              name: this.addForm.name,
              way: this.addForm.way,
              status: this.addForm.status,
              content: this.addForm.content,
              requestUrl: this.addForm.requestUrl,
              requestMethod: this.addForm.requestMethod,
              requestHeaders: JSON.stringify(requestHeaderObj),
              requestBody: this.addForm.requestMethod == 'post'? JSON.stringify(requestBodyObj) : '',
              requestParam: this.addForm.requestMethod == 'get'? JSON.stringify(requestParamsObj) : ''
            };

            this.addForm.fields.forEach((field) => {
              let reg = new RegExp(` #${field}#`, "g");
              let key = "";
              this.fieldList.forEach((item) => {
                if (item.name === field) {
                  key = item.prop;
                }
              });
              params.content = params.content.replace(reg, `{${key}}`);
            });   
            return  params     
    },   
    addConfirm() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.modal_loading = true;
          //操作请求标头
          let requestHeaderObj = {}
          this.addForm.requestHeaderList.forEach(item=>{
            requestHeaderObj[item.leftValue] = item.rightValue
            
          })
          //操作请求体
          let requestBodyObj = {}
          this.addForm.requestBodyList.forEach(item =>{
            if(item.type == 'input'){
              requestBodyObj[item.leftValue] = item.rightValue
            } else if(item.type == 'array'){
              requestBodyObj[item.leftValue] = item.rightValue.split(',')
            } else {
              let rightKey = "";
              this.fieldList1.forEach((iitem) => {
                  if (iitem.name === item.rightValue) {
                    rightKey = iitem.prop;
                  }
              });
              requestBodyObj[item.leftValue] = `{${rightKey}}`
            }
            
          })
          //操作请求体Params
          let requestParamsObj = {}
          this.addForm.requestParamsList.forEach(item =>{
            if(item.type == 'input'){
              requestParamsObj[item.leftValue] = item.rightValue
            } else {
              let rightKey = "";
              this.fieldList1.forEach((iitem) => {
                if (iitem.name === item.rightValue) {
                  rightKey = iitem.prop;
                }
              });
              requestParamsObj[item.leftValue] = `{${rightKey}}`
            }
                
          })           
          if (this.title === "添加模版") {
            const params = {
              code: this.addForm.code,
              type: Number(this.addForm.type),
              remark: this.addForm.remark,
              name: this.addForm.name,
              way: this.addForm.way,
              status: this.addForm.status,
              content: this.addForm.content,
              requestUrl: this.addForm.requestUrl,
              requestMethod: this.addForm.requestMethod,
              requestHeaders: JSON.stringify(requestHeaderObj),
              requestBody: this.addForm.requestMethod == 'post'? JSON.stringify(requestBodyObj) : '',
              requestParam: this.addForm.requestMethod == 'get'? JSON.stringify(requestParamsObj) : ''
            };

            this.addForm.fields.forEach((field) => {
              let reg = new RegExp(` #${field}#`, "g");
              let key = "";
              this.fieldList.forEach((item) => {
                if (item.name === field) {
                  key = item.prop;
                }
              });
              params.content = params.content.replace(reg, `{${key}}`);
            });
            console.log(params);
            messageTemplateCreate(params).then((res) => {
              this.modal_loading = false;
              this.$modal.msgSuccess("新增成功");
              this.showAdd = false;
              this.jsonData = {}
              this.handleQuery();
              // this.getAllTypes();
            }).catch(() => {
              this.modal_loading = false;
            });
          } else {
            const params = {
              code: this.addForm.code,
              id: this.addForm.id,
              type: Number(this.addForm.type),
              remark: this.addForm.remark,
              name: this.addForm.name,
              way: this.addForm.way,
              status: this.addForm.status,
              content: this.addForm.content,
              requestUrl: this.addForm.requestUrl,
              requestMethod: this.addForm.requestMethod,
              requestHeaders: JSON.stringify(requestHeaderObj),
              requestBody: this.addForm.requestMethod == 'post'? JSON.stringify(requestBodyObj) : '',
              requestParam: this.addForm.requestMethod == 'get'? JSON.stringify(requestParamsObj) : ''
            };
            this.addForm.fields.forEach((field) => {
              let reg = new RegExp(` #${field}#`, "g");
              let key = "";
              this.fieldList.forEach((item) => {
                if (item.name === field) {
                  key = item.prop;
                }
              });
              params.content = params.content.replace(reg, `{${key}}`);
            });
            messageTemplateUpdate(params).then((res) => {
              this.modal_loading = false;
              this.$modal.msgSuccess("修改成功");
              this.showAdd = false;
              this.jsonData = {}
              this.handleQuery();
              // this.getAllTypes();
            }).catch(() => {
              this.modal_loading = false;
            });
          }
        }
      });
    },
    // 推送
    handleShare(row) {
      this.showPush = true;
      this.pushForm.content = row.content;
    },
    onInput(){
      this.$forceUpdate()
    },
    changeMethod(){
      this.tabValue = 'Header'
      if(this.addForm.requestMethod == 'post'){
        this.changeRightValue()
      } else {
        this.changeParamsRightValue()
      }     
    },
    changeRightValue(){
      this.hasTemplete = false
      this.addForm.requestBodyList.forEach(item =>{
        if(item.rightValue == '模版内容'){
          this.hasTemplete = true
        }
      })
      if(!this.hasTemplete){
        this.addForm.content = ''
        this.addForm.fields = []
      }
      this.$forceUpdate()
    },
    changeParamsRightValue(){
      this.hasTemplete = false
      this.addForm.requestParamsList.forEach(item =>{
        if(item.rightValue == '模版内容'){
          this.hasTemplete = true
        }
      })
      if(!this.hasTemplete){
        this.addForm.content = ''
        this.addForm.fields = []
      }
      this.$forceUpdate()
    },    
    // 编辑
    handleEdit(row) {
      this.isCardShow = false
      this.flag = true;
      this.showAdd = true;
      this.title = "修改模版";
      let obj = deepClone(row);
      obj.fields = [];
      this.jsonData = {}
      this.fieldList.forEach((field) => {
        if (obj.content.indexOf(field.prop) > -1) {
          obj.fields.push(field.name);
        }
        let reg = new RegExp(`{${field.prop}}`, "g");
        obj.content = obj.content.replace(reg, ` #${field.name}#`);
      });
      this.fieldList1 = JSON.parse(JSON.stringify(this.fieldList))
      // this.fieldList1.push({
      //   prop: 'content',
      //   name: '模板内容'
      // })

      this.addForm = obj;
      this.addForm.id = row.id;
      //操作header回显
      this.addForm.requestHeaderList = []
      if(row.requestHeaders && JSON.parse(row.requestHeaders)){
        let requestHeaders = Object.entries(JSON.parse(row.requestHeaders))
        requestHeaders.forEach(item =>{
          this.addForm.requestHeaderList.push({
              leftValue: item[0],
              rightValue: item[1]
          })
        })
      }
      //操作请求体Body回显
      this.addForm.requestBodyList = [] 
      if(row.requestBody && JSON.parse(row.requestBody)){
        let requestHeaderList = Object.entries(JSON.parse(row.requestBody))
        requestHeaderList.forEach(Iitem =>{
          let objType = 'input'
          let dynamicTags = []
          let rightValue = Iitem[1]
            if(Iitem[1][0] == '{' && Iitem[1][Iitem[1].length - 1] == '}'){
              objType = 'select'
              rightValue = Iitem[1].replaceAll('{','').replaceAll('}','')
            }
            if(Array.isArray(Iitem[1])){
              objType = 'array'
              dynamicTags = Iitem[1]
              rightValue = Iitem[1].join(",")
            }
            let rightKey = rightValue
            this.fieldList1.forEach((fitem) => {
                  if (fitem.prop === rightValue) {
                    rightKey = fitem.name;
                  }
            });
            this.addForm.requestBodyList.push({
              leftValue: Iitem[0],
              type: objType,
              rightValue: rightKey,
              inputVisible: false,
              dynamicTags: dynamicTags
            })
         })
      }      
      //操作请求体Parms回显
      this.addForm.requestParamsList = [] 
      if(row.requestParam && JSON.parse(row.requestParam)){
        let requestParamsList = Object.entries(JSON.parse(row.requestParam))
        requestParamsList.forEach(Iitem =>{
          let objType = 'input'
          let rightValue = Iitem[1]
            if(Iitem[1][0] == '{' && Iitem[1][Iitem[1].length - 1] == '}'){
              objType = 'select'
              rightValue = Iitem[1].replaceAll('{','').replaceAll('}','')
            }
            let rightKey = rightValue
            this.fieldList1.forEach((fitem) => {
                  if (fitem.prop === rightValue) {
                    rightKey = fitem.name;
                  }
            });
            this.addForm.requestParamsList.push({
              leftValue: Iitem[0],
              type: objType,
              rightValue: rightKey
            })
         })
      }      
      this.addForm.type = String(row.type);
      if(this.addForm.requestMethod == 'post'){
        this.changeRightValue()
      } else if(this.addForm.requestMethod == 'get') {
        this.changeParamsRightValue()
      }
    },
    cancelAdd() {
      this.$refs.addForm.resetFields();
      this.showAdd = false;
    },
    cancelPush() {
      this.$refs.pushForm.resetFields();
      this.showPush = false;
    },
    // 获取所有类别
    getAllTypes() {
      let para = {
        pageNo: 1,
        pageSize: 100,
        dictType: "sms_type"
      };
      listData(para).then((res) => {
        this.allTypes = res.data.list.filter(item => item.label !='短信' && item.label !='企业微信' ); //文旅
      });
    },
        // 获取所有类别
    testTemplete() {
      this.test_loading = true
      if(this.addForm.requestUrl == "" || this.addForm.requestUrl == null){
        this.$message.error("请输入URL！")
        this.test_loading = false
        return
      }
      testTempleteAPI(this.handleSubmitData()).then((res) => {
        this.jsonData = res.data
        this.test_loading = false
      }).catch(() =>{
        this.test_loading = false
      });
    },
    getTemplateOrderFields() {
      getTemplateOrderFields().then((res) => {
        this.fieldList = Object.entries(res.data).map((item) => {
          return { prop: item[0], name: item[1] };
        });
      });
      // let res = {
      //   data: {
      //     orderNo: "工单编号",
      //     orderTitle: "工单标题",
      //     orderType: "工单类型"
      //   }
      // };
      // this.fieldList = Object.entries(res.data).map((item) => {
      //   return { prop: item[0], name: item[1] };
      // });
    }
  },
  created() {
    this.getAllTypes();
    this.getTemplateOrderFields();
  },
  mounted() {
    this.getList();
  },
  beforeDestroy() {}
};
</script>

<style scoped lang="less">
.btns {
  display: flex;
  justify-content: space-between;
}
.ivu-card {
  min-height: 100%;
}
.ivu-date-picker {
  width: 100%;
}
/deep/.highlight {
  color: #ed4014;
  font-style: normal;
}
/deep/ .ivu-select .ivu-select-dropdown ul li {
  white-space: pre-line;
}
/deep/ .ivu-btn-info {
  color: #fff;
  background-color: #2db7f5;
  border-color: #2db7f5;
}
.span-after {
  position: relative;
  .span-opt {
    position: absolute;
    width: 100px;
    height: 30px;
    top: 0;
    left: 0;
  }
}
// .add-tpl-modal {
.m-table {
  width: 88%;
  margin: 0 auto;
  .m-table-header {
    position: relative;
    display: flex;
    background: #e5ebf7;
    border-radius: 8px;
    .m-table-header-col {
      flex-grow: 1;
      text-align: center;
      padding: 8px 0;
      width: 30%;
      text-align: center;
      flex-shrink: 0;
      &:first-child {
        width: 20%;
      }
      &:nth-child(2) {
        width: 20%;
      }
    }
  }
  .m-table-body-row {
    position: relative;
    display: flex;
    // border-bottom: 1px solid #dfdfdf;
    .m-table-body-col {
      padding: 5px;
      flex-shrink: 0;
      width: 30%;
      text-align: center;
      flex-shrink: 0;
      &:first-child {
        width: 20%;
      }
      &:nth-child(2) {
        width: 20%;
      }
    }
  }
  .m-opt {
    position: absolute;
    top: 8px;
    right: -50px;
  }
}
/deep/.ivu-select-disabled {
  .ivu-select-selection {
    background-color: #fff;
    color: #515a6e;
  }
}
/deep/ .el-textarea .el-input__count {
  line-height: 14px;
}
// }
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
  .t-head2 {
    th {
      padding: 8px 0;
      background-color: #edf0f6;
      &:first-child {
        width: 25%;
      }
      &:nth-child(2) {
        width: 20%;
      }
      &:nth-child(3) {
        width: 35%;
      }
    }
  }
  td {
    .el-button--small {
      padding: 9px 10px;
      font-size: 14px;
    }
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }
}
.m-show {
  border-left: 1px solid #dfdfdf; 
  padding: 8px;
  margin-left: 8px;
  width: 376px;
}
.m-show-top {
  display: flex; 
  width: 100%; 
  border-bottom: 1px solid #dfdfdf;
  padding-bottom: 8px
}
/deep/ div.jsoneditor-outer{
  min-height: 300px;
}
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
.tag-style{
    border: 1px solid #DCDFE6;
    padding: 4px;
    margin: 0 8px;
  }
</style>

