<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      :file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :headers="headers"
      class="upload-file-uploader"
      ref="fileUpload"
    >
      <!-- 上传按钮 -->
      <el-button size="mini" type="primary">{{ $t('common.selectFile') }}</el-button>
      <!-- 上传提示 -->
      <div class="el-upload__tip" slot="tip" v-if="showTip">
        {{ $t('common.pleaseUpload') }}
        <template v-if="fileSize">
          {{ $t('common.sizeNotExceed') }} <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </template>
        <template v-if="fileType">
          {{ $t('common.formatIs') }} <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
        </template>
        {{ $t('common.file') }}
      </div>
    </el-upload>

    <!-- 文件列表 -->
    <transition-group class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="index" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <!--        <el-link :href="getUrl(file.taskAttachmentPath)" :underline="false" target="_blank">-->
        <!--          <span class="el-icon-document"> {{ file.taskAttachmentName }} </span>-->
        <!--        </el-link>-->
        <a
          class="fileName"
          href="javascript:void(0);"
          @click="downLoad(getFileUrl(file.taskAttachmentPath), file.taskAttachmentName)"
          :title="file.taskAttachmentName"
        >
          {{ file.taskAttachmentName }}
        </a>
        <div class="ele-upload-list__item-content-action">
          <el-link :underline="false" @click="handleDelete(index)" type="danger">{{ $t('common.delete') }}</el-link>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import { getAccessToken } from "@/utils/auth";

export default {
  name: "FileUpload",
  props: {
    // 值
    value: [String, Object, Array],
    // 数量限制
    limit: {
      type: Number,
      default: 5
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["doc", "docx", "xls", "xlsx", "pdf", "zip", "rar"]
    },
    // 是否显示提示
    isShowTip: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      number: 0,
      uploadList: [],
      baseUrl: '',
      uploadFileUrl:  "/admin-api/system/file/upload-file", // 请求地址 /admin-api/system/file/upload
      headers: { Authorization: "Bearer " + getAccessToken() }, // 设置上传的请求头部
      fileList: []
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          console.log("ds", val);
          let temp = 1;
          // 首先将值转为数组
          const list = Array.isArray(val) ? val : this.value.split(",");
          // 然后将数组转为对象数组
          this.fileList = list.map((item) => {
            item = { taskAttachmentName: item.taskAttachmentName, taskAttachmentPath: item.taskAttachmentPath };
            item.uid = item.uid || new Date().getTime() + temp++;
            return item;
          });
          console.log("sdd", this.fileList);
        } else {
          this.fileList = [];
          return [];
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 是否显示提示
    showTip() {
      return this.isShowTip && (this.fileType || this.fileSize);
    }
  },
  methods: {
    getUrl(path) {
      return  "/admin-api/system/file" + path;
    },
    // 上传前校检格式和大小
    handleBeforeUpload(file) {
      // 校检文件类型
      if (this.fileType) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        const isTypeOk = this.fileType.some((type) => {
          if (file.type.indexOf(type) > -1) return true;
          if (fileExtension && fileExtension.indexOf(type) > -1) return true;
          return false;
        });
        if (!isTypeOk) {
          this.$modal.msgError(`${$t('common.fileFormatIncorrect')}, ${$t('common.pleaseUpload')}${this.fileType.join("/")}${$t('common.formatFile')}!`);
          return false;
        }
      }
      // 校检文件大小
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`${$t('common.uploadFileSizeCannotExceed')} ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading(`${$t('common.uploadingFilePleaseWait')}...`);
      this.number++;
      return true;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`${$t('common.uploadFileNumberCannotExceed')} ${this.limit} ${$t('common.uploadFileNumberCannotExceedUnit')}!`);
    },
    // 上传失败
    handleUploadError(err) {
      this.$modal.msgError(`${$t('common.uploadImageFailedPleaseRetry')}`);
      this.$modal.closeLoading();
    },
    // 上传成功回调
    handleUploadSuccess(res, file) {
      console.log("dsds", res, file);
      if (res.code === 0) {
        this.uploadList.push({ taskAttachmentName: res.data.name, taskAttachmentPath: res.data.url });
        this.uploadedSuccessfully();
      } else {
        this.number--;
        this.$modal.closeLoading();
        this.$modal.msgError(res.msg);
        this.$refs.fileUpload.handleRemove(file);
        this.uploadedSuccessfully();
      }
    },
    // 删除文件
    handleDelete(index) {
      this.fileList.splice(index, 1);
      // this.$emit("input", this.listToString(this.fileList));
      this.$emit("input", this.fileList)
    },
    // 上传结束操作
    uploadedSuccessfully() {
      if (this.number > 0 && this.uploadList.length === this.number) {
        console.log("td", this.uploadList);
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.fileList);
        this.$modal.closeLoading();
      }
    },
    // 获取文件名称
    getFileName(name) {
      if (name.lastIndexOf("/") > -1) {
        return name.slice(name.lastIndexOf("/") + 1);
      } else {
        return "";
      }
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        strs += list[i].url + separator;
      }
      return strs != "" ? strs.substr(0, strs.length - 1) : "";
    }
  }
};
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  line-height: 2;
  margin-bottom: 10px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.fileName {
  margin-left: 8px;
  font-size: 14px;
  text-decoration: underline;
  color: #4380f3;
  display: inline-block;
  &:hover {
    color: #4380f3;
  }
  max-width: 240px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
