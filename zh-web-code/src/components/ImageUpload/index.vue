<template>
  <div class="component-upload-image">
    <el-upload
        multiple
        :action="uploadFileUrl"
        list-type="picture-card"
        :on-success="handleUploadSuccess"
        :before-upload="handleBeforeUpload"
        :limit="limit"
        :on-error="handleUploadError"
        :on-exceed="handleExceed"
        name="file"
        :on-remove="handleRemove"
        :show-file-list="true"
        :headers="headers"
        :file-list="fileList"
        :on-preview="handlePictureCardPreview"
        :class="{hide: this.fileList.length >= this.limit}"
    >
      <i class="el-icon-plus"></i>
    </el-upload>

    <!-- 上传提示 -->
    <div class="el-upload__tip" slot="tip" v-if="showTip">
      {{ $t('common.pleaseUpload') }}
      <template v-if="fileSize"> {{ $t('common.sizeNotExceed') }} <b style="color: #f56c6c">{{ fileSize }}MB</b> </template>
      <template v-if="fileType"> {{ $t('common.formatIs') }} <b style="color: #f56c6c">{{ fileType.join("/") }}</b> </template>
      {{ $t('common.file') }}
    </div>

    <el-dialog
        :visible.sync="dialogVisible"
        :title="$t('common.preview')"
        width="800"
        append-to-body
    >
      <img
          :src="dialogImageUrl"
          style="display: block; max-width: 100%; margin: 0 auto"
      />
    </el-dialog>
  </div>
</template>

<script>
import { getAccessToken } from "@/utils/auth";

export default {
  props: {
    value: [String, Object, Array],
    // 图片数量限制
    limit: {
      type: Number,
      default: 5,
    },
    // 大小限制(MB)
    fileSize: {
      type: Number,
      default: 5,
    },
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: {
      type: Array,
      default: () => ["png", "jpg", "jpeg"],
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
      dialogImageUrl: "",
      dialogVisible: false,
      hideUpload: false,
      uploadFileUrl:  "/admin-api/system/file/upload", // 请求地址
      headers: { Authorization: "Bearer " + getAccessToken() }, // 设置上传的请求头部
      fileList: []
    };
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          // 首先将值转为数组, 当只穿了一个图片时，会报map方法错误
          const list = Array.isArray(val) ? val :  Array.isArray(this.value.split(',')) ? this.value.split(','): Array.of(this.value);
          // 然后将数组转为对象数组
          this.fileList = list.map(item => {
            if (typeof item === "string") {

              item = { name: item, url: item };
            }
            return item;
          });
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
    },
  },
  methods: {
    // 删除图片
    handleRemove(file, fileList) {
      const findex = this.fileList.map(f => f.name).indexOf(file.name);
      if(findex > -1) {
        this.fileList.splice(findex, 1);
        this.$emit("input", this.listToString(this.fileList));
      }
    },
    // 上传成功回调
    handleUploadSuccess(res) {

      this.uploadList.push({ name: res.data, url: '/admin-api/system/file' + res.data });
      if (this.uploadList.length === this.number) {
        this.fileList = this.fileList.concat(this.uploadList);
        this.uploadList = [];
        this.number = 0;
        this.$emit("input", this.listToString(this.fileList));
        this.$modal.closeLoading();
      }
    },
    // 上传前loading加载
    handleBeforeUpload(file) {
      let isImg = false;
      if (this.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
          fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = this.fileType.some(type => {
          if (file.type.indexOf(type) > -1) return true;
          return !!(fileExtension && fileExtension.indexOf(type) > -1);
        });
      } else {
        isImg = file.type.indexOf("image") > -1;
      }

      if (!isImg) {
        this.$modal.msgError(`${$t('common.fileFormatIncorrect')}, ${$t('common.pleaseUpload')}${this.fileType.join("/")}${$t('common.imageFormatFile')}!`);
        return false;
      }
      if (this.fileSize) {
        const isLt = file.size / 1024 / 1024 < this.fileSize;
        if (!isLt) {
          this.$modal.msgError(`${$t('common.uploadImageSizeCannotExceed')} ${this.fileSize} MB!`);
          return false;
        }
      }
      this.$modal.loading(`${$t('common.uploadingImagePleaseWait')}...`);
      this.number++;
    },
    // 文件个数超出
    handleExceed() {
      this.$modal.msgError(`${$t('common.uploadFileNumberCannotExceed')} ${this.limit} ${$t('common.uploadFileNumberCannotExceedUnit')}!`);
    },
    // 上传失败
    handleUploadError() {
      this.$modal.msgError(`${$t('common.uploadImageFailedPleaseRetry')}`);
      this.$modal.closeLoading();
    },
    // 预览
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 对象转成指定字符串分隔
    listToString(list, separator) {
      let strs = "";
      separator = separator || ",";
      for (let i in list) {
        strs += list[i].url.replace(this.baseUrl, "") + separator;
      }
      return strs !== '' ? strs.substr(0, strs.length - 1) : '';
    }
  }
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
  display: none;
}
// 去掉动画效果
:deep(.el-list-enter-active, .el-list-leave-active) {
  transition: all 0s;
}

:deep(.el-list-enter, .el-list-leave-active) {
  opacity: 0;
  transform: translateY(0);
}
</style>

