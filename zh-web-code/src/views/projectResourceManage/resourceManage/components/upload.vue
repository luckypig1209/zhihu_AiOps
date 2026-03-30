<template>
    <el-upload
      class="upload-demo"
      :before-upload="beforeUpload"
      :action="uploadFileUrl"
      :on-success="handleSuccess"
      :on-error="handleError"
      :headers="headers"
      :show-file-list="false"
      :name="fileName">
      <el-button type="primary" icon="el-icon-top" size="small" :loading="loading" :disabled="loading">{{ fileTitle }}</el-button>
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
    }
  },
  data() {
    return {
      uploadFileUrl:  "/admin-api/cqt/asset-info/import", // 请求地址
      headers: { Authorization: "Bearer " + getAccessToken() }, // 设置上传的请求头部
      disabled: false,
      loading: false,
      fileTitle: this.$t('common.batchImport')
    };
  },
  inject: ['getAssetInfoCount'],
  watch: {

  },
  computed: {},
  methods: {
    //导入前
    beforeUpload(file) {
      console.log(file, "beforeUploadfile", file.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

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
        const advancedCode = res.data.split("$_$")[1]
        if (advancedCode) {
          this.$modal.msgWarning('模板数据为空，无需导入');
        } else {
          this.$modal.msgSuccess('导入成功');
        }
        this.disabled = false;
        this.getAssetInfoCount()
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
