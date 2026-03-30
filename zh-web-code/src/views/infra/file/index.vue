<template>
  <div class="app-container">
    <!-- <doc-alert title="上传下载" url="https://doc.iocoder.cn/file/"/> -->
    <!-- 搜索工作栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="18px">
      <el-form-item prop="path">
        <el-input v-model="queryParams.path" :placeholder="$t('common.pleaseEnterFilePath')" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item  prop="createTime">
        <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
                        type="daterange"
                        range-separator="-" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')"
                        :default-time="['00:00:00', '23:59:59']"/>
      </el-form-item>
      <el-form-item style="margin-left: 0;">
        <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.search') }}</el-button>
        <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="small" @click="handleAdd">{{ $t('common.uploadFile') }}</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 列表 -->
    <el-table v-loading="loading" :data="list">
      <el-table-column :label="$t('common.fileName')" :show-overflow-tooltip="true" align="center" min-width="200px" prop="name"/>
      <el-table-column :label="$t('common.filePath')" :show-overflow-tooltip="true" align="center" min-width="250px" prop="path"/>
      <el-table-column :label="$t('common.fileUrl')" :show-overflow-tooltip="true" align="center" min-width="300px" prop="url"/>
      <el-table-column :label="$t('common.fileSize')" align="center" prop="size" min-width="120px" :formatter="sizeFormat"/>
      <el-table-column :label="$t('common.fileType')" :show-overflow-tooltip="true" align="center" prop="type" width="180px"/>
      <el-table-column :label="$t('common.fileContent')" align="center" prop="content" min-width="150px">
        <template v-slot="scope">
          <image-preview v-if="scope.row.type&&scope.row.type.indexOf('image/') === 0" :src="scope.row.url"
                         :width="'100px'"></image-preview>
          <video v-else-if="scope.row.type&&scope.row.type.indexOf('video/') === 0" :width="'100px'">
            <source :src="scope.row.url"/>
          </video>
          <i v-else>{{ $t('common.cannotPreview') }}，{{ $t('common.click') }}
            <a href="javascript:void(0);" @click="downLoad(getFileUrl + scope.row.configId + '/get/' + scope.row.path,scope.row.name)" :title="scope.row.name" style="font-size:12px;vertical-align: baseline;color: #4380F3;"> {{ $t('common.download') }}</a>
            <!-- <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" target="_blank"
                     :href="getFileUrl + scope.row.configId + '/get/' + scope.row.path">下载
            </el-link> -->
          </i>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.uploadTime')" align="center" prop="createTime" min-width="170px">
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.operation')" align="center" class-name="small-padding fixed-width" min-width="100px">
        <template v-slot="scope">
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['system:file:delete']">{{ $t('common.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
<!--    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize"-->
<!--                @pagination="getList"/>-->
    <a-pagination
      class="pagination"
      :current="queryParams.pageNo"
      :page-size="queryParams.pageSize"
      :total="total"
      :show-total="total => $t('common.totalRecords', { total: total })"
      :page-size-options="['5', '10', '50', '100']"
      show-size-changer
      show-quick-jumper
      @change="handlePageChange"
      @showSizeChange="onShowSizeChange"
    />

    <!-- 对话框(添加 / 修改) -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" :auto-upload="false" drag
                 :headers="upload.headers" :action="upload.url" :data="upload.data" :disabled="upload.isUploading"
                 :on-change="handleFileChange"
                 :on-progress="handleFileUploadProgress"
                 :on-success="handleFileSuccess">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          {{ $t('common.dragFileHere') }} <em>{{ $t('common.clickToUpload') }}</em>
        </div>
        <!-- <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入 jpg、png、gif 格式文件！</div> -->
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">{{ $t('common.confirm') }}</el-button>
        <el-button @click="upload.open = false">{{ $t('common.cancel') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {deleteFile, getFilePage} from "@/api/infra/file";
import {getAccessToken} from "@/utils/auth";
import ImagePreview from "@/components/ImagePreview";
import { getBaseHeader } from "@/utils/request";

export default {
  name: "InfraFile",
  components: {
    ImagePreview
  },
  data() {
    return {
      getFileUrl: '/admin-api/system/file/',
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件列表
      list: [],
      // 弹出层标题
      title: "",
      // 查询参数
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        path: null,
        type: null,
        createTime: []
      },
      // 用户导入参数
      upload: {
        open: false, // 是否显示弹出层
        title: "", // 弹出层标题
        isUploading: false, // 是否禁用上传
        url:  "/admin-api/system/file/upload", // 请求地址
        headers: getBaseHeader(),
        data: {} // 上传的额外数据，用于文件名
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
    /** 查询列表 */
    getList() {
      this.loading = true;
      // 执行查询
      getFilePage(this.queryParams).then(response => {
        this.list = response.data.list;
        this.total = response.data.total;
        this.loading = false;
      });
    },
    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 表单重置 */
    reset() {
      this.form = {
        content: undefined,
      };
      this.resetForm("form");
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
    /** 新增按钮操作 */
    handleAdd() {
      this.upload.open = true;
      this.upload.title = this.$t('common.uploadFile');
    },
    /** 操作上传的文件发生变化 */
    handleFileChange(file, fileList) {

    },
    /** 操作文件上传中 */
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true; // 禁止修改
    },
    /** 发起文件上传 */
    submitFileForm() {
      this.$refs.upload.submit();
    },
    /** 文件上传成功操作 */
    handleFileSuccess(response, file, fileList) {
      // 清理
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // 提示成功，并刷新
      this.$modal.msgSuccess(this.$t('common.addSuccess'));
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const id = row.id;
      this.$confirm(this.$t('common.confirmDeleteFile', { id: id }), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        return deleteFile(id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess(this.$t('common.deleteSuccess'));
      }).catch(() => {
      });
    },
    // 用户昵称展示
    sizeFormat(row, column) {
      const unitArr = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const srcSize = parseFloat(row.size);
      const index = Math.floor(Math.log(srcSize) / Math.log(1024));
      let size = srcSize / Math.pow(1024, index);
      size = size.toFixed(2);//保留的小数位数
      return size + ' ' + unitArr[index];
    },
  }
};
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
