<template>
  <div>
    <!-- <doc-alert title="工作流" url="https://doc.iocoder.cn/bpm" /> -->
    <!-- 列表 -->
    <el-table v-loading="loading" :data="list" max-height="450px">
      <template slot="empty">
        <div class="no-data">
          <img style="width: 160px; height: 160px" src="../../../../assets/images/no-data.png" alt="" />
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column
        show-overflow-tooltip
        label="工单编号"
        align="center"
        prop="processInstanceId"
        min-width="230"
        show-overflow-tooltip
      />
      <el-table-column show-overflow-tooltip label="工单标题" align="center" prop="title" min-width="160" />
      <el-table-column show-overflow-tooltip label="工单类型" align="center" prop="type" min-width="160" />
      <el-table-column label="任务状态" min-width="120" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="当前节点" align="center" prop="tasks" min-width="120">
        <template v-slot="scope">
          <!-- <el-button v-for="task in scope.row.tasks" :key="task.id" type="text">
            <span>{{ task.name }}</span>
          </el-button> -->
          <span v-if="scope.row.tasks && scope.row.tasks.length > 0">{{ scope.row.tasks[0].name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="申请人" align="center" prop="startUserName" min-width="120" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">
        <!-- <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleAudit(scope.row)"
            v-hasPermi="['bpm:task:update']"
            >审批</el-button
          >
        </template> -->
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleAudit(scope.row)"
            v-hasPermi="['bpm:task:update']"
            v-if="hasOptPermi(scope.row)"
            >处理</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-document"
            @click="handleDetail(scope.row)"
            v-hasPermi="['bpm:task:query']"
            v-if="isAdmin && !hasOptPermi(scope.row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
      <!-- <el-table-column label="任务编号" align="center" prop="id" width="320" />
      <el-table-column label="任务名称" align="center" width="220" prop="name" />
      <el-table-column label="所属流程" align="center" width="220" prop="processInstance.name" />
      <el-table-column label="流程发起人" align="center" width="160" prop="processInstance.startUserNickname" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="version" width="80">
        <template v-slot="scope">
          <el-tag type="success" v-if="scope.row.suspensionState === 1">激活</el-tag>
          <el-tag type="warning" v-if="scope.row.suspensionState === 2">挂起</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleAudit(scope.row)"
            v-hasPermi="['bpm:task:update']"
            >审批</el-button
          >
        </template>
      </el-table-column> -->
    </el-table>
    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :pager-count="5"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { getTodoTaskPage } from "@/api/bpm/task";
import { getTodoList } from "@/api/bpm/processInstance.js";
export default {
  name: "BpmTodoTask",
  components: {},
  data() {
    return {
      isAdmin: false,
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 待办任务列表
      list: [],
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 5,
        // name: null,
        // createTime: [],
        roles: this.$store.state.user.roles || undefined
      }
    };
  },
  created() {
    this.isAdmin = this.$store.getters.roles.some((item) => {
      return item === "super_admin";
    });
    this.getList();
  },
  methods: {
    // 判断当前节点操作人是否包含登录用户
    hasOptPermi(row) {
      const nickname = this.$store.getters.nickname;
      let arr = []
      if(row.tasks && row.tasks.length){
        arr = row.tasks.filter((item) => {
        return item.assigneeUser === nickname;
      });
      }
      return arr.length > 0;
    },
    /** 操作详情按钮 */
    handleDetail(row) {
      this.$router.push({ name: "BpmProcessInstanceDetail", query: { id: row.processInstanceId } });
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 操作查询参数
      getTodoList(this.queryParams)
        .then((res) => {
          // 格式化当前工单类型列表
          this.list = res.data.list;
          this.total = res.data.total;
          this.loading = false;
        })
        .finally((_) => {
          this.loading = false;
        });
      // getTodoTaskPage(this.queryParams).then(response => {
      //   this.list = response.data.list;
      //   this.total = response.data.total;
      //   this.loading = false;
      // }
      // ).finally(()=>{
      //   this.loading = false;
      // });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 操作审批按钮 */
    handleAudit(row) {
      this.$router.push({ name: "BpmProcessInstanceDetail", query: { id: row.processInstanceId } });
    }
  }
};
</script>
<style scoped lang="less">
@import "../../../../styles/form.less";
</style>
