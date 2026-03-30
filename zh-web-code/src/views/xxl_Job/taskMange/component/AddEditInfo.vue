<!-- 
  @description: 调度中心-更新任务
 -->
 <template>
  <el-dialog 
    :visible.sync="taskVisible" 
    title="更新任务"
    width="750px"
    :before-close="cancel"
    >
    <el-form ref="form" :model="form" label-position="right" label-width="125px" :rules="rules">
      <el-tabs>
        <el-tab-pane label="基础配置">
          <el-row :gutter="15">
            <el-col :span="12">
              <el-form-item label="执行器" prop="jobGroup">
                <el-select v-model="form.jobGroup" clearable filterable placeholder="请选择执行器">
                  <el-option :label="item.title" :value="item.id" v-for="(item, index) in jobGroupList" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务描述" prop="jobDesc">
                <el-input v-model.trim="form.jobDesc" maxlength="85" placeholder="请输入任务描述" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="负责人" prop="author">
                <el-input v-model.trim="form.author" maxlength="50" placeholder="请输入负责人" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报警邮件">
                <el-input v-model.trim="form.alarmEmail" maxlength="85" placeholder="请输入报警邮件" clearable />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <el-tabs>
        <el-tab-pane label="调度配置">
          <el-row :gutter="15">
            <el-col :span="12">
              <el-form-item label="调度类型" prop="scheduleType">
                <el-select v-model="form.scheduleType" clearable placeholder="请选择调度类型" @change="typeChange">
                  <el-option :label="item.label" :value="item.value" v-for="(item, index) in scheduleList" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.scheduleType === 'FIX_RATE'">
              <el-form-item label="固定速度" prop="scheduleConf" :rules="[
                { required: true, message: '请输入固定速度', trigger: ['change', 'blur'] },
                { pattern: /^[0-9]+$/, message: '请输入整数'}
              ]">
                <el-input-number v-model.trim="form.scheduleConf" placeholder="请输入(Second)" clearable :min="0" :max="9999" :step="1" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="form.scheduleType === 'CRON'">
              <el-form-item label="Cron表达式" prop="scheduleConf" :rules="[
                { required: true, message: '请输入cron表达式', trigger: 'change' }
              ]">
                <el-popover popper-class="pop" :popper-options="{boundariesElement: 'viewport',removeOnDestroy: true}" v-model="cronPopover">
                  <cron @change="changeCron" @close="cronPopover = false" class="cron" ref="cron"></cron>
                  <el-input slot="reference" clearable @click="cronPopover = true" v-model="form.scheduleConf" placeholder="请输入cron表达式"></el-input>
                </el-popover>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <el-tabs>
        <el-tab-pane label="任务配值">
          <el-row :gutter="15">
            <el-col :span="12">
              <el-form-item label="运行模式" prop="glueType">
                <el-input :value="mapModel[form.glueType]" placeholder="请输入运行模式" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="JobHandler" prop="executorHandler">
                <el-input v-model.trim="form.executorHandler" placeholder="请输入JobHandler" maxlength="50" clearable :disabled="form.glueType !== 'BEAN'"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24"> 
              <el-form-item label="任务参数" >
                <el-input type="textarea" v-model.trim="form.executorParam" :autosize="{ minRows: 2, maxRows: 5 }" maxlength="170" placeholder="请输入任务参数" show-word-limit></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <el-tabs>
        <el-tab-pane label="高级配置">
          <el-row :gutter="15">
            <el-col :span="12">
              <el-form-item label="路由策略" prop="executorRouteStrategy">
                <el-select v-model="form.executorRouteStrategy" clearable placeholder="请选择路由策略">
                  <el-option :label="item.label" :value="item.value" v-for="(item, index) in routerStrList" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="子任务ID">
                <el-input v-model.trim="form.childJobid" placeholder="请输入子任务的任务ID" maxlength="50" clearable></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="调度过期策略">
                <el-select v-model="form.misfireStrategy" clearable placeholder="请选择调度过期策略">
                  <el-option :label="item.label" :value="item.value" v-for="(item, index) in misFireList" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="阻塞处理策略" prop="executorBlockStrategy">
                <el-select v-model="form.executorBlockStrategy" clearable placeholder="请选择阻塞处理策略">
                  <el-option :label="item.label" :value="item.value" v-for="(item, index) in executorList" :key="index"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="任务超时时间(秒)" prop="executorTimeout">
                <el-input-number v-model.trim="form.executorTimeout" placeholder="任务超时时间，单位秒" :min="0" :max="99999" :step="1" clearable style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="失败重试次数" prop="executorFailRetryCount">
                <el-input-number v-model.trim="form.executorFailRetryCount" placeholder="失败重试次数，大于零时生效" :min="0" :max="999" :step="1" clearable style="width:100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <el-form-item style="text-align: center;position: relative;right: 100px" :show-message="false">
        <el-button type="primary" @click="submitModal" :disabled="formLoading"  :loading="formLoading">保 存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { updateTask } from "@/api/xxJob"
import { cron } from '@/components/cron'

export default {
  components: { cron },
  props: {
    taskVisible: {
      type: Boolean,
      require: true,
      default: false
    },
    jobGroupList: {
      type: Array,
      require: true,
      default:(() => [])
    },
    itemData: {
      type: Object,
      require: true,
      default:(() => {})
    }
  },
  data() {
    return {
      formLoading: false,
      scheduleList: [ // 调度类型
        { label: '无', value: 'NONE' },
        { label: 'CRON', value: 'CRON' },
        { label: '固定速度', value: 'FIX_RATE' }
      ],
      mapModel: { // 运行模式
        'BEAN': 'BEAN',
        'GLUE_GROOVY': 'GLUE(Java)',
        'GLUE_SHELL': 'GLUE(Shell)',
        'GLUE_PYTHON': 'GLUE(Python)',
        'GLUE_PHP': 'GLUE(PHP)',
        'GLUE_NODEJS': 'GLUE(Nodejs)',
        'GLUE_POWERSHELL': 'GLUE(PowerShell)'
      },
      routerStrList: [ // 路由策略
        { label: '第一个', value: 'FIRST' },
        { label: '最后一个', value: 'LAST' },
        { label: '轮询', value: 'ROUND' },
        { label: '随机', value: 'RANDOM' },
        { label: '一致性HASH', value: 'CONSISTENT_HASH' },
        { label: '最不经常使用', value: 'LEAST_FREQUENTLY_USED' },
        { label: '最近最久未使用', value: 'LEAST_RECENTLY_USED' },
        { label: '故障转移', value: 'FAILOVER' },
        { label: '忙碌转移', value: 'BUSYOVER' },
        { label: '分片广播', value: 'SHARDING_BROADCAST' }
      ],
      misFireList: [ // 调度过期策略
        { label: '忽略', value: 'DO_NOTHING' },
        { label: '立即执行一次', value: 'FIRE_ONCE_NOW' }
      ],
      executorList: [ // 阻塞处理策略
        { label: '单机串行', value: 'SERIAL_EXECUTION' },
        { label: '丢弃后续调度', value: 'DISCARD_LATER' },
        { label: '覆盖之前调度', value: 'COVER_EARLY' },
      ],
      cronPopover: false,
      cron: '',
      form: {},
      rules: {
        jobGroup: [
          { required: true, message: '请选择执行器', trigger: 'change' }
        ],
        jobDesc: [
          { required: true, message: '请填写任务描述', trigger: ['blur', 'change'] }
        ],
        author: [
          { required: true, message: '请填写负责人', trigger: ['blur', 'change'] }
        ],
        scheduleType: [
          { required: true, message: '请选择调度类型', trigger: 'change' },
        ],
        executorHandler: [
          { required: true, message: '请填写JobHandler', trigger: ['blur', 'change'] },
        ],
        executorRouteStrategy: [
          { required: true, message: '请选择路由策略', trigger: 'change' }
        ],
        executorBlockStrategy: [
          { required: true, message: '请选择阻塞处理策略', trigger: 'change' },
        ],
        executorTimeout: [
          { pattern: /^[0-9]+$/, message: '请输入整数'}
        ],
        executorFailRetryCount: [
          { pattern: /^[0-9]+$/, message: '请输入整数'}
        ]
      }
    }
  },
  watch: {
    itemData: {
      handler(val){
        this.form = JSON.parse(JSON.stringify(val))
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
      },
      deep: true
    }
  },
  methods: {
    cancel(){
      this.$parent.itemData = {}
      this.$parent.taskVisible = false
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    // 提交
    submitModal(){
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submit() 
        }
      })
    },
    submit(){
      this.formLoading = true
      const params = {
        ...this.form
      }
      updateTask(params).then((res) => {
        if (res.code === 0) {
          this.$modal.msgSuccess('更新成功')
          this.$parent.getList()
          this.cancel()
        }
        this.formLoading = false
      }).catch(() => {
        this.formLoading = false
      })
    },
    // cron表达式
    changeCron(val) {
      const arrVal = val.trim().split(/\s+/)
      arrVal[0] = '0'
      const cronD = arrVal.join(' ')
      this.form.scheduleConf = cronD
    },
    // 调度类型修改
    typeChange() {
      this.form.scheduleConf = ''
    }
  }
}
</script>

<style scoped lang="less">
  ::v-deep .ivu-form-item-content {
    line-height: 38px;
  }
  ::v-deep .el-tab-pane {
    margin-top: 10px;
  }
  ::v-deep .el-input-number__decrease,
  ::v-deep .el-input-number__increase {
    display: none!important;
  }
  ::v-deep .el-input-number--medium .el-input__inner {
    padding-right: 16px !important;
    padding-left: 16px !important;
    text-align: left !important;
  }
</style>
