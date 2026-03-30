<!--
  @description: 调度中心-任务管理
 -->
 <template>
  <div class="app-container">
    <div class="searchArea">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="100px">
        <el-form-item label="执行器">
          <el-select v-model="queryParams.jobGroupId" clearable placeholder="请选择执行器">
            <el-option :label="item.title" :value="item.id" v-for="(item, index) in jobGroupList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.triggerStatus" clearable placeholder="请选择状态">
            <el-option :label="item.label" :value="item.value" v-for="(item, index) in statusList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="queryParams.jobDesc" clearable placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="JobHandler">
          <el-input v-model="queryParams.executorHandler" clearable placeholder="请输入JobHandler" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="queryParams.author" clearable placeholder="请输入负责人" />
        </el-form-item>

        <el-form-item style="margin-left: 6px;">
          <el-button type="primary" size="small" :loading="tableLoading" icon="el-icon-search" @click="handleQuery">搜索</el-button>
          <el-button size="small" icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="tableLoading" :data="list">
      <template slot="empty">
        <div class="no-data">
          <img src="@/assets/images/table-empty.png" alt="">
          <span class="no-text">暂无数据</span>
        </div>
      </template>
      <el-table-column label="任务ID" align="center" prop="id" min-width="100" fixed="left" />
      <el-table-column label="任务描述" align="center" prop="jobDesc" min-width="150" show-overflow-tooltip />
      <el-table-column label="调度类型" align="center" prop="scheduleType" min-width="100" show-overflow-tooltip />
      <el-table-column label="运行模式" align="center" prop="glueType" min-width="130" show-overflow-tooltip />
      <el-table-column label="jobHandler" align="center" prop="executorHandler" min-width="130" show-overflow-tooltip />
      <el-table-column label="负责人" align="center" prop="author" min-width="100" />
      <el-table-column label="状态" align="center" min-width="110">
        <template v-slot="scope">
          <el-tag :type="scope.row.triggerStatus? 'success' : 'info'">
            {{ scope.row.triggerStatus && '启动' || '停止' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="220" align="center" fixed="right">
        <template v-slot="scope">
          <el-button size="small" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="text" v-if="scope.row.triggerStatus" @click="handleStop(scope.row)">停止</el-button>
          <el-button size="small" type="text" v-if="!scope.row.triggerStatus" @click="handleStart(scope.row)">启动</el-button>
          <el-button size="small" type="text" @click="handleChcekOnce(scope.row)">执行一次</el-button>
          <el-button size="small" type="text" @click="handleLog(scope.row)">查询日志</el-button>
        </template>
      </el-table-column>
    </el-table>
<!--    <pagination v-show="total>0" :total="total" :page.sync="query.pageNo" :limit.sync="query.pageSize" @pagination="getList"/>-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => `共 ${total} 条记录`"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 编辑 -->
    <AddEditInfo :taskVisible="taskVisible" :jobGroupList="jobGroupList" :itemData="itemData" />
    <!-- 执行一次 -->
    <CheckOnce :checkVisible="checkVisible" :checkInfo="checkInfo" />
  </div>
</template>

<script>
import { getJobList, getJobGroupList, setStart, setStop } from "@/api/xxJob"
import AddEditInfo from './component/AddEditInfo'
import CheckOnce from './component/CheckOnce'

export default {
  components: { AddEditInfo, CheckOnce },
  data() {
    return {
      tableLoading: false,
      showSearch: true,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
      },
      list: [],
      total: 0,
      statusList: [
        { value: 0, label: '停止' },
        { value: 1, label: '启动' }
      ],
      jobGroupList: [],
      taskVisible: false,
      itemData: {}, // 编辑
      checkVisible: false, // 执行一次
      checkInfo: {},
    }
  },
  created() {
    this.getList()
    this.getJobGroup()
  },
  methods: {
    getList() {
      this.tableLoading = true
      const params = {
        ...this.queryParams,
        jobGroupId: this.queryParams.jobGroupId ? this.queryParams.jobGroupId : undefined,
        triggerStatus: this.queryParams.triggerStatus !== '' ? this.queryParams.triggerStatus : undefined,
      }
      getJobList(params).then(res=> {
        this.list = res.data.list || []
        this.total = res.data.total || 0
        this.tableLoading = false
      }).catch(err =>{
        this.tableLoading = false
      })
    },
    // 获取执行器下拉
    getJobGroup() {
      getJobGroupList().then((res) => {
        this.jobGroupList = res.data || []
      })
    },
    // 搜索
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    // 分页切换
    handlePageChange(page) {
      this.queryParams.pageNo = page;
      this.getList();
    },
    // 每页条数变化
    onShowSizeChange(current, pageSize) {
      this.queryParams.pageSize = pageSize;
      this.currentPage = 1;
      this.getList();
    },
    resetQuery() {
      this.queryParams = {
        pageSize: 10,
        pageNo: 1
      }
      this.getList()
    },
    // 编辑
    handleEdit(row) {
      this.taskVisible = true
      this.itemData = row
    },
    // 执行一次
    handleChcekOnce(row) {
      this.checkVisible = true
      this.checkInfo = row
    },
    // 查询日志
    handleLog(row) {
      this.$router.push(
        {
          path: '/xxl-job-admin/jobLog',
          query: { jobId: row.id, jobDesc: row.jobDesc }
        }
      )
    },
    // 停止
    handleStop(row) {
      this.$confirm("确认停止？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(()=>{
        setStop(row).then((res) => {
          if(res.code === 0) {
            this.getList()
            this.$modal.msgSuccess('停止成功')
          }
        }).catch(() => {})
      })

    },
    // 启动
    handleStart(row) {
      this.$confirm("确认启动？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(()=>{
        setStart(row).then((res) => {
          if(res.code === 0) {
            this.getList()
            this.$modal.msgSuccess('启动成功')
          }
        }).catch(() => {})
      })
    }
  }
}
</script>
<style scoped>
.pagination {
  text-align: right;
  padding: 16px;
  background: #fff;
  margin-left: auto;
  width: 100%;
  /* border-radius: 8px; */
  margin-top: 16px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}
</style>
