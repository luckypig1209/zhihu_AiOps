<template>
  <el-upload
        class="upload-demo"
        :before-upload="beforeUpload"
        :action="uploadFileUrl"
        :on-success="handleSuccess"
        :on-error="handleError"
        :headers="headers"
        :data="{dataType: dataType}"
        :show-file-list="false"
        :name="fileName">
        <el-button type="primary"  size="small" :loading="loading" :disabled="loading">{{ $t('common.batchImport') }}</el-button>
      </el-upload>  
   
</template>

<script>
// import { resourceImportError } from "@/api/projectManage/improveInfo";
import { getAccessToken } from "@/utils/auth";
import {exportAssetErrorInfo} from "@/api/resource";
export default {
  name: "",
  components: {},
  props: {
    fileName: {
      default: "file",
      type: String
    },
    type: {
      default: 0,
      type: Number
    },
    url: {
      default: "",
      type: String
    },
    dataType:{
      default: "",
      type: String
    }
  },
  data() {
    return {
      uploadFileUrl:  "/admin-api/system/dict-data/import", // 请求地址
      headers: { Authorization: "Bearer " + getAccessToken() }, // 设置上传的请求头部
      dictData:{},
      disabled: false,
      loading: false,
      fileTitle: this.$t('common.batchImport'),
    };
  },
  inject: ['getAssetInfoCount'],
  watch: {

  },
  computed: {},
  methods: {
    //导入前
    beforeUpload(file) {
      this.dictData = {
        dataType: this.dataType
      }
      if(this.dataType == ""){
        this.$modal.msgWarning("请输入字典类型！");
        return false;
      }
      if(file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type == 'application/vnd.ms-excel') {
        this.loading = true;
        this.fileTitle = "上传中...";
        return true;
      } else {
        this.$modal.msgWarning("请上传下载模板提供的xlsx格式的文件！");
        return false;
      }
      // console.log(file);
      // this.loading = true;
      // this.fileTitle = "上传中...";

      // this.modalForm.fileUrl = file;
      // return true;
    },
    // 导入成功
    handleSuccess(res) {
      console.log(res);
      this.loading = false;
      this.fileTitle = this.$t('common.batchImport');
      if (res.code === 0) {
        let creatNum = res.data.createDictDataList.length || 0
        let failNum = Object.entries(res.data.failureDictDataList).length || 0
        let failReason = failNum> 0? ',失败原因：' + JSON.stringify(res.data.failureDictDataList) : ''
        let updateNum = res.data.updateDictDataList.length || 0
        this.$modal.msgSuccess("批量导入新建了" + creatNum + "个, 更新了" + updateNum + '个, 导入失败' + failNum + '个 ' + failReason);
        this.dictOpen = false
      } else {
        if (res.data == null){
          this.$modal.msgError(res.msg);
        }else{
          this.$Modal.confirm({
            title: "导入异常",
            content: `<p>${res.msg}</p>`,
            okText: "下载",
            onOk: () => {
              let batchId = res.msg.split('根据批次下载查看：');
              let data = {
                batchId: batchId[1] ? batchId[1] : "",
                delete: false
              };
              this.importErrorDown(data);
            },
            onCancel: () => {
              this.$modal.msgSuccess("已取消");
            }
          });
        }
      }
      this.$emit("success", true);
    },
    // 导入失败
    handleError(file) {
      console.log('导入失败=====', file);
      this.loading = false;
      this.fileTitle = this.$t('common.batchImport');
    },
    importErrorDown(data) {
      // let msg = this.$modal.msgSuccess("正在下载中");
      exportAssetErrorInfo(data)
        .then((res) => {
          if (!res) {
            this.$Message.warning("下载失败");
            return;
          }
          console.log('data',res);
          console.log('hear',res.headers)
          // let fileName = window.decodeURI(res.headers["download-filename"]);
          let link = document.createElement("a");
          link.href = window.URL.createObjectURL(new Blob([res]));
          link.target = "_blank";
          link.download = '错误数据.xls';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          this.$Message.success("下载成功");
        })
        .catch((err) => {
          console.log(err);
        })
        // .finally(() => {
        //   msg();
        // });
    }
  }
};
</script>
