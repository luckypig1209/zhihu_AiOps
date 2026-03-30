<!--
  @description: 调度中心-调度日志
 -->
 <template>
  <div class="app-container">
    <div class="searchArea">
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
        <el-form-item label="执行器">
          <el-select v-model="queryParams.jobGroupId" clearable placeholder="请选择执行器">
            <el-option :label="item.title" :value="item.id" v-for="(item, index) in jobGroupList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="queryParams.jobDesc" clearable placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="执行结果">
          <el-select v-model="queryParams.logStatus" clearable placeholder="请选择状态">
            <el-option :label="item.label" :value="item.value" v-for="(item, index) in statusList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调度时间">
          <DatePicker :editable="false" v-model="queryParams.filterTime" type="daterange" @on-change="timeChange" placeholder="请选择调度时间" style="width: 220px;"/>
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
      <el-table-column label="任务ID" align="center" prop="jobId" min-width="100" fixed="left" />
      <el-table-column label="调度时间" align="center" prop="triggerTime" min-width="150">
        <template v-slot="scope">
          {{ scope.row.triggerTime && formatTime(scope.row.triggerTime) || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="调度结果" align="center" min-width="100">
        <template v-slot="scope">
          <div :style="{ color: scope.row.triggerCode === 200 ? '#67C23A' : '#F56C6C'}">
            {{ handleMap[scope.row.triggerCode] }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="调度备注" align="center" min-width="80">
        <template v-slot="scope">
          <span class="view" @click="handleView(scope.row)">查看</span>
        </template>
      </el-table-column>
      <el-table-column label="执行时间" align="center" prop="handleTime" min-width="150">
        <template v-slot="scope">
          {{ scope.row.handleTime && formatTime(scope.row.handleTime) || '--' }}
        </template>
      </el-table-column>
      <el-table-column label="执行结果" align="center" min-width="110">
        <template v-slot="scope">
          <div :style="{ color: scope.row.handleCode === 200 ? '#67C23A' : '#F56C6C'}">
            {{ handleMap[scope.row.handleCode] }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="执行备注" align="center" prop="handleMsg" min-width="100" show-overflow-tooltip/>
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

    <!-- 备注详情 -->
    <el-dialog
      title="调度备注"
      :visible.sync="triggerVisible"
      :width="content && content.includes('<!DOCTYPE html>')? '51%': '25%'"
      :close-on-click-modal="false"
    >
      <div class="content" v-html="content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getJobLog, getJobGroupList, getJobLogInfo } from "@/api/xxJob"
import moment from "moment"

export default {
  data() {
    return {
      tableLoading: false,
      showSearch: true,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        jobId: '',
        jobDesc: ''
      },
      list: [],
      total: 0,
      statusList: [ // 状态
        { value: 1, label: '成功' },
        { value: 2, label: '失败' },
        { value: 3, label: '进行中' },
      ],
      handleMap: {
        200: '成功',
        500: '失败',
        502: '失败'
      },
      jobGroupList: [],
      triggerVisible: false, // 调度备注
      content: '',
      filterTime: '' // 查询时间
    }
  },
  created() {
    this.getList()
    this.getJobGroup()
  },
  methods: {
    timeChange(val) {
      this.filterTime = val[0] ? [val[0] + ' 00:00:00', val[1] + ' 23:59:59'] : undefined
    },
    getList() {
      this.tableLoading = true
      const params = {
        ...this.queryParams,
        jobGroupId: this.queryParams.jobGroupId ? this.queryParams.jobGroupId : undefined,
        jobId: this.queryParams.jobId ? this.queryParams.jobId : undefined,
        logStatus: this.queryParams.logStatus && this.queryParams.logStatus !== '' ? this.queryParams.logStatus : undefined,
        filterTime: this.queryParams.filterTime && this.queryParams.filterTime.length === 2 ? `${this.queryParams.filterTime[0] + ' - ' + this.queryParams.filterTime[1]}` : undefined,
      }
      getJobLog(params).then(res=> {
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
    // 时间转换
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
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
      this.filterTime = ''
      this.getList()
    },
    // 弹出备注
    handleView(row) {
      getJobLogInfo(row.id).then((res) => {
        if(res.code === 0 && res.data) {
          this.triggerVisible = true
          this.content = res.data
        } else {
          this.$modal.msgWarning('暂无调度备注')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  .view {
    color: #409EFF;
    cursor: pointer;
  }
  .content {
    padding: 0 0 24px 12px;
    white-space: pre-wrap;
    line-height: 25px;
  }
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
