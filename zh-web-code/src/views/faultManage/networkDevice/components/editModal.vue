/**
 * 隐患管理-隐患列表-新增，编辑
 * @router hazardList
 * @autor zm
 * @date 2023/09/27
 */
 <template>
  <Modal :title="modalTitle" v-model="show" :width="700" class-name="vertical-center-modal">
    <Form ref="form" :model="form" :rules="rules" inline :label-width="140">
      <Row :gutter="24">
        <Col span="24">
          <FormItem label="告警标题:" prop="alarmTitle">
            <Input disabled v-model.trim="form.alarmTitle" maxlength="20" clearable placeholder="请输入告警标题" />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col span="24">
          <FormItem label="告警内容:" prop="alarmContent">
            <Input
              style="width: 500px;"
              disabled
              v-model.trim="form.alarmContent"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              show-word-limit
              maxlength="500"
              placeholder="请输入告警内容"
            ></Input>
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col span="12">
          <FormItem label="告警级别:" prop="alarmLevel">
            <el-select  disabled v-model="form.alarmLevel" placeholder="请选择告警级别" clearable filterable>
              <el-option value="全部">全部</el-option>
              <el-option value="紧急告警">紧急告警</el-option>
              <el-option value="重要告警">重要告警</el-option>
              <el-option value="次要告警">次要告警</el-option>
              <el-option value="提示告警">提示告警</el-option>
            </el-select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="告警时间:" prop="createTime">
            <DatePicker
              disabled
              type="date"
              v-model="form.createTime"
              :editable="false"
              placeholder="请选择告警时间"
              style="width: 100%"
              :options="options"
            ></DatePicker>
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col span="12">
          <FormItem label="设备名称:" prop="devName">
            <Input  disabled v-model.trim="form.devName" maxlength="20" clearable placeholder="请输入设备名称" />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="设备IP:" prop="devIp">
            <Input  disabled v-model.trim="form.devIp" maxlength="20" clearable placeholder="请输入设备IP" />
          </FormItem>
        </Col>
      </Row>
      <Row :gutter="24">
        <Col span="24">
          <FormItem label="操作要求:" prop="processingDemand">
            <Input
              style="width: 500px;"
              v-model.trim="form.processingDemand"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 5 }"
              show-word-limit
              maxlength="500"
              placeholder="请输入操作要求"
            ></Input>
          </FormItem>
        </Col>
      </Row>
<!--      <Row :gutter="24">-->
<!--        <Col span="12">-->
<!--          <FormItem label="审核人:" prop="alarmTitle">-->
<!--            <Input v-model.trim="form.alarmTitle" maxlength="20" clearable placeholder="请输入审核人" />-->
<!--          </FormItem>-->
<!--        </Col>-->
<!--        <Col span="12">-->
<!--          <FormItem label="审核人联系方式:" prop="alarmTitle">-->
<!--            <Input v-model.trim="form.alarmTitle" maxlength="20" clearable placeholder="请输入审核人联系方式" />-->
<!--          </FormItem>-->
<!--        </Col>-->
<!--      </Row>-->
    </Form>
    <div slot="footer" style="text-align: center">
      <Button type="default" style="margin-right: 10px" @click="resetForm">取消</Button>
      <Button type="primary" style="margin-right: 10px" @click="subForm()" :loading="subLoad" :disabled="subLoad"
        >确定</Button
      >
    </div>
  </Modal>
</template>

 <script>
//  import fileUpload from '../../../projectManage/improveProjectInfo/components/fileUpload';
import moment from "moment";
 import {hazardListAdd, hazardListUpdate, processCreate} from "@/api/hazard";
 import {listSimpleUsers, listUser} from "@/api/system/user";
 import {queryProjectNameByLogin} from "@/api/projectManage/improveInfo";
 import {createProcess} from "@/api/fault";
// import serviceinfoApi from "@/api/frontApi/huwei/service-info.js";
// import userInfoApi from "@/api/account/user-info.js";
export default {
  name: "",
  components: { },
  props: {
    itemData: {
      default: () => {
        return {};
      },
      type: Object
    }
  },
  data() {
    return {
      modalTitle: "",
      show: false,
      form: {
        alarmTitle: "",
        alarmLevel: "",
        createTime: "",
        alarmContent: "",
        processingDemand:'',
        devName:'',
        devIp:'',
      },
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      },
      rules: {
        alarmTitle: { required: true, message: "请填写告警标题", trigger: "blur" },
        alarmLevel: { required: true, message: "请选择告警级别", trigger: "change" },
        // createTime: { required: true, message: "请选择告警时间", trigger: "change", type: "date" },
        alarmContent: { required: true, message: "请填写告警内容", trigger: "change" },
        processingDemand: { required: true, message: "请输入操作要求", trigger: "change" },
        devName: { required: true, message: "请填写设备名称", trigger: "blur" },
        devIp: { required: true, message: "请填写设备IP", trigger: "blur" },
      },
      proList: [],
      manageList: [],
      subLoad: false
    };
  },
  computed: {},
  watch: {
    show(val) {
      if (!val) {
        this.$refs["form"].resetFields();
        this.form.pitfallUrl = "";
        this.form.fileName = "";
      } else {
        if (this.modalTitle == "派单") {

          // this.getPro(this.itemData.projectName);
          this.form = {
            alarmTitle: this.itemData.alarmTitle,
            alarmLevel: this.itemData.alarmLevel,
            createTime: moment(this.itemData.createTime).format("YYYY-MM-DD"),
            alarmContent: this.itemData.alarmContent,
            processingDemand: this.itemData.processingDemand,
            devName: this.itemData.devName,
            devIp: this.itemData.devIp,
          };
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.show = false;
    },
    subForm(num) {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.subLoad = true;
          let data = {
            id:this.itemData.id,
            processingDemand: this.form.processingDemand,
          };
          createProcess(data)
                .then((res) => {
                  console.log(res);
                  if (res.code == 0) {
                    this.$Message.success('更新成功');
                    this.subLoad = false
                    this.show = false;
                    this.$emit("success");
                  } else {
                    this.$Message.error(res.msg);
                  }
                })
                .catch((err) => {
                  this.subLoad = false
                  console.log(err);
                })

        }
      });
    },
    queryProjectNameByLogin() {
        queryProjectNameByLogin({
          customerId: ''
        }).then(res=> {
          this.proList = res.data
        })
    },
    getManageList() {
      listUser().then(res=>{
        if (res.code === 0){
          this.manageList = res.data.list || [];
        }
      })
    }
  },
  created() {
    this.getManageList();
    this.queryProjectNameByLogin()
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

 <style scoped lang="less">
</style>
