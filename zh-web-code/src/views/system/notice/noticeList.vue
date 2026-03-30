<template>
  <div class="app-container">
    <!-- <doc-alert title="站内信配置" url="https://doc.iocoder.cn/notify/" /> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工单编号" prop="workNo">
        <el-input v-model="queryParams.workNo" placeholder="请输入工单编号" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="通知方式" prop="notifyType">
        <el-select v-model="queryParams.notifyType" placeholder="请选择通知方式" clearable size="small">
          <el-option v-for="dict in allTypes" :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="工单类型" prop="workType">
        <el-select v-model="queryParams.workType" placeholder="请选择工单类型" clearable size="small">
          <el-option v-for="dict in workTypes"
                     :key="dict.value" :label="dict.label" :value="dict.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="模板内容" prop="content">
        <el-input v-model="queryParams.content" placeholder="请输入模板内容" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss" type="daterange"
                        range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" />
      </el-form-item>
      <el-form-item style="margin-left: 6px;">
        <el-button type="primary" size="small" icon="el-icon-search" @click="handleQuery" v-hasPermi="['notice:query']">搜索</el-button>
        <el-button size="small" icon="el-icon-refresh" @click="resetQuery" v-hasPermi="['notice:reset']">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="工单编号" align="center" prop="workNo" />
      <el-table-column label="工单类型" align="center" prop="workType">
      </el-table-column>
      <el-table-column label="通知内容" align="center" prop="content" />
      <el-table-column label="通知方式" align="center" prop="notifyType" />
      <el-table-column label="接收人" align="center" prop="receiver" />
      <el-table-column label="发送状态" align="center" prop="status">
        <template v-slot="scope">
          <span v-if="scope.row.status === true">成功</span>
          <span v-else>失败</span>
<!--          <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="scope.row.status" />-->
        </template>
      </el-table-column>
<!--      <el-table-column label="是否已读" align="center" prop="readStatus">-->
<!--        <template v-slot="scope">-->
<!--          <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="scope.row.readStatus" />-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="通知时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
<!--      <el-table-column label="创建时间" align="center" prop="createTime" width="180">-->
<!--        <template v-slot="scope">-->
<!--          <span>{{ parseTime(scope.row.createTime) }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)"
                     v-hasPermi="['system:notify-message:query']">详细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"
                @pagination="getList"/>

    <!-- 站内信详细-->
    <el-dialog :title="title" :visible.sync="open" width="700px" v-dialogDrag append-to-body>
      <el-form ref="form" :model="form" label-width="160px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="编号：">{{ form.id }}</el-form-item>
            <el-form-item label="工单编号：">{{ form.workNo }}</el-form-item>
            <el-form-item label="工单类型：">
              {{form.workType}}
<!--              <dict-tag :type="DICT_TYPE.USER_TYPE" :value="form.workType"/>-->
            </el-form-item>
            <el-form-item label="通知方式：">
              {{form.notifyType}}
<!--              <dict-tag :type="DICT_TYPE.SYSTEM_NOTIFY_TEMPLATE_TYPE" :value="form.notifyType" />-->
            </el-form-item>
            <el-form-item label="接收人：">{{ form.receiver }}</el-form-item>
            <el-form-item label="通知内容：">{{ form.content }}</el-form-item>
            <el-form-item label="发送状态：">
              <span v-if="form.status === true">成功</span>
              <span v-else>失败</span>
<!--              <dict-tag :type="DICT_TYPE.INFRA_BOOLEAN_STRING" :value="form.status" />-->
            </el-form-item>
            <el-form-item label="通知时间：">{{ parseTime(form.createTime) }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getNotifyMessagePage } from "@/api/system/notify/message";
import {listUser} from "@/api/system/user";
import {listData} from "@/api/system/dict/data";
import {smsRecordList} from "@/api/system/notice";

export default {
  name: "noticeList",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 站内信消息列表
      list: [],
      allTypes:[],
      workTypes:[],
      // 弹出层标题
      title: "消息详情",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        workNo:'',//工单编号
        workType:null,//工单类型
        notifyType:'',//通知方式
        content:'',//通知内容
        createTime: [],
      },
      // 表单参数
      form: {},
    };
  },
  created() {
    this.getList();
    this.getAllTypes()
    this.getWorkTypes()
    // this.queryUser()
  },
  methods: {
    // 获取所有类别
    getAllTypes() {
      let para = {
        pageNo: 1,
        pageSize: 100,
        dictType: 'sms_type'
      }
      listData(para).then(res=> {
        this.allTypes = res.data.list
      })
    },
    // 获取所有类别
    getWorkTypes() {
      let para = {
        pageNo: 1,
        pageSize: 100,
        dictType: 'work_type'
      }
      listData(para).then(res=> {
        this.workTypes = res.data.list
      })
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      let para = {
        pageNo: this.queryParams.pageNo,
        pageSize: this.queryParams.pageSize,
        workNo:this.queryParams.workNo,
        workType:this.queryParams.workType,
        notifyType:Number(this.queryParams.notifyType) || null,
        content:this.queryParams.content,
        beginTime:this.queryParams.createTime[0] || null,
        endTime:this.queryParams.createTime[1]|| null
      }
      smsRecordList(para).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.$refs['queryForm'].validate(valid => {
        if(valid) {
          this.queryParams.pageNo = 1;
          this.getList();
        }
      })
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    }
  }
};
</script>
