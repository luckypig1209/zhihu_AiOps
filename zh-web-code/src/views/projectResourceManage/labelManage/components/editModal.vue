<template>
  <Modal :title="title" v-model="show" :width="1200" class-name="modal-center" :z-index="999">
    <Form ref="form" :model="form" :rules="rules" :label-width="80">
      <FormItem :label="$t('common.assetType')" prop="assetTypeId">
        <Select v-model="form.assetTypeId" filterable :disabled="!form.isEditAble" clearable :placeholder="$t('common.selectAssetType')">
          <Option v-for="item in assetTypeList" :value="item.id" :key="item.id">{{ item.typeName }}</Option>
        </Select>
      </FormItem>
      <FormItem :label="$t('common.modelCode')" prop="modelCode">
        <Input v-model.trim="form.modelCode" :disabled="title === $t('common.edit')" :placeholder="$t('common.enterModelCode')" show-word-limit></Input>
      </FormItem>
      <FormItem :label="$t('common.modelName')" prop="modelName">
        <Input v-model.trim="form.modelName" :disabled="!form.isEditAble" :placeholder="$t('common.enterModelName')" maxlength="20" show-word-limit></Input>
      </FormItem>
      <FormItem :label="$t('common.modelDescription')" prop="modelDescription">
        <Input v-model.trim="form.modelDescription" :disabled="!form.isEditAble" :placeholder="$t('common.enterModelDescription')" type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }" maxlength="500" show-word-limit></Input>
      </FormItem>
      <!-- <FormItem :label="$t('common.modelIcon')" prop="iconFileId">
        <Upload
          :headers="headers"
          :before-upload="handleBeforeUpload"
          :on-success="handleSuccess"
          :show-upload-list="false"
          :action="uploadFileUrl"
          v-if="picture == '' || !picture"
        >
          <Button type="text" icon="ios-cloud-upload-outline" :loading="fileLoad">{{ $t('common.uploadIcon') }}</Button>
        </Upload>
        <div class="img-box" v-else>
          <img :src="getUrl(picture)" />
          <div class="action" @click="deleteImg">
            <Icon type="ios-trash-outline" size="16" />
          </div>
        </div>
      </FormItem> -->
      <Table :columns="columns" :data="form.dataList" :loading="tableLoad" draggable @on-drag-drop="onDragDrop">
        <template slot-scope="{ row, index }" slot="itemCode">
          <FormItem label="" :label-width="0" :prop="'dataList[' + index + '].itemCode'"
            :rules="[{ required: true, trigger: 'blur' }]" :show-message="false">
            <Input v-if="form.dataList[index].itemDataType !== 'OPTIONAL'" v-model.trim="form.dataList[index].itemCode"
              :placeholder="$t('common.enterPropertyCode')" maxlength="20" show-word-limit
              :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble"></Input>
            <Select v-else v-model="form.dataList[index].itemCode" :transfer="true" filterable clearable
              :placeholder="$t('common.select')" :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble">
              <Option v-for="optionItem in optionList" :key="optionItem.value" :label="optionItem.label"
                :value="optionItem.value"></Option>
            </Select>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="itemName">
          <FormItem label="" :label-width="0" :prop="'dataList[' + index + '].itemName'"
            :rules="[{ required: true, trigger: 'blur' }]" :show-message="false">
            <Input v-model.trim="form.dataList[index].itemName" :placeholder="$t('common.enter')" maxlength="20" show-word-limit
              :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="itemDataType">
          <FormItem label="" :label-width="0" :prop="'dataList[' + index + '].itemDataType'"
            :rules="[{ required: true, trigger: 'change' }]" :show-message="false">
            <Select v-model="form.dataList[index].itemDataType" :transfer="true" filterable clearable :placeholder="$t('common.select')"
              :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble">
              <Option value="OPTIONAL" :label="$t('common.enumType')"></Option>
              <Option value="INTEGER" :label="$t('common.integerType')"></Option>
              <Option value="FLOAT" :label="$t('common.floatType')"></Option>
              <Option value="DATE" :label="$t('common.dateType')"></Option>
              <Option value="DATETIME" :label="$t('common.timeType')"></Option>
              <Option value="TEXT" :label="$t('common.textType')"></Option>
            </Select>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="isRequired">
          <FormItem label="" :label-width="0" :prop="'dataList[' + index + '].isRequired'"
            :rules="[{ required: true, trigger: 'change' }]" :show-message="false">
            <Select v-model="form.dataList[index].isRequired" :transfer="true" filterable clearable :placeholder="$t('common.select')"
              :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble">
              <Option value="Y" :label="$t('common.yes')"></Option>
              <Option value="N" :label="$t('common.no')"></Option>
            </Select>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="isUnique">
          <FormItem label="" :label-width="0" :prop="'dataList[' + index + '].isUnique'"
            :rules="[{ required: true, trigger: 'change' }]" :show-message="false">
            <Select v-model="form.dataList[index].isUnique" :transfer="true" filterable clearable :placeholder="$t('common.select')"
              :disabled="title === $t('common.edit') && !form.dataList[index].isEditAble">
              <Option value="Y" :label="$t('common.yes')"></Option>
              <Option value="N" :label="$t('common.no')"></Option>
            </Select>
          </FormItem>
        </template>
      </Table>
    </Form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="formSubmit" :loading="formLoad">{{ $t('common.confirm') }}</el-button>
      <el-button @click="show = false">{{ $t('common.cancel') }}</el-button>
    </div>
  </Modal>
</template>

<script>
import { getAccessToken } from "@/utils/auth";
import { getDictDatas } from "@/utils/dict";
import { getAssetTypeList, createAssetModel, updateAssetModel, getAssetModelDetail, getOptionListAPI } from "@/api/resource";

export default {
  name: "AssetModelForm",
  components: {},
  props: {
    itemId: {
      default: "",
      type: String
    },
    assetTypeId: {
      default: undefined,
      type: Number
    }
  },
  data() {
    return {
      loading: false,
      picture: "",
      fileLoad: false,
      optionList: [],
      uploadFileUrl: "/admin-api/system/file/upload-file",
      headers: { Authorization: "Bearer " + getAccessToken() },
      form: {
        assetTypeId: undefined,
        isEditAble: true,
        dataList: []
      },
      rules: {},
      show: false,
      title: "",
      assetTypeList: [],
      columns: [],
      tableLoad: false,
      formLoad: false,
      // 使用标志位来判断是新增还是编辑，而不是比较title字符串
      isAddMode: true
    };
  },
  created() {
    this.title = this.$t('common.add');
    this.rules = {
      assetTypeId: { required: true, type: "number", message: this.$t('common.pleaseSelectAssetType'), trigger: "change" },
      modelName: { required: true, message: this.$t('common.pleaseEnterModelName'), trigger: "blur" },
      modelCode: {
        required: true,
        pattern: /^[a-zA-Z_]{1,50}$/,
        message: this.$t('common.pleaseEnterCorrectModelCode'),
        trigger: 'blur'
      }
    };
    this.columns = [
      {
        title: this.$t('common.displayOrder'),
        key: "ordernum",
        align: "center",
        width: 100,
        render: (h, params) => h("span", params.index + 1)
      },
      {
        title: this.$t('common.propertyDataType'),
        slot: "itemDataType",
        align: "center",
        width: 150
      },
      {
        title: this.$t('common.propertyCode'),
        slot: "itemCode",
        align: "center",
        minWidth: 140
      },
      {
        title: this.$t('common.fieldName'),
        slot: "itemName",
        align: "center",
        minWidth: 140
      },
      {
        title: this.$t('common.isRequired'),
        slot: "isRequired",
        align: "center",
        width: 120
      },
      {
        title: this.$t('common.isUnique'),
        slot: "isUnique",
        align: "center",
        width: 120
      },
      {
        title: this.$t('common.operation'),
        key: "aciton",
        align: "center",
        width: 120,
        render: (h, params) => {
          // if (!this.form.isEditAble) {
          //   return h("span", "--");
          // }
          const isAddDefaultRow = this.isAddMode && params.row.isDefault;
          const isEditNameRow = !this.isAddMode && params.row.isEditAble === false;
          const disableDelete = isAddDefaultRow || isEditNameRow;

          return h("div", [
            h("Icon", {
              props: { type: "ios-add-circle-outline" },
              style: {
                fontSize: "18px",
                color: "#4380F3",
                cursor: "pointer",
                marginRight: "20px",
                fontWeight: "600"
              },
              on: {
                click: () => {
                  this.form.dataList.splice(params.index + 1, 0, {
                    itemName: "",
                    isShow: "Y",
                    isRequired: "",
                    itemCode: "",
                    itemDataType: "",
                    isUnique: "",
                    isEditAble: true,
                    isDefault: false
                  });
                }
              }
            }),
            h("Icon", {
              props: { type: "ios-remove-circle-outline" },
              style: {
                fontSize: "18px",
                color: disableDelete ? "#ccc" : "#4380F3",
                cursor: disableDelete ? "not-allowed" : "pointer",
                fontWeight: "600",
                zIndex: 99999
              },
              on: disableDelete ? {} : {
                click: () => {
                  if (this.form.dataList.length === 1) {
                    this.$modal.msgWarning(this.$t('common.mustKeepAtLeastOneRow'));
                    return;
                  }
                  this.$confirm(this.$t('common.confirmDeleteThisRow'), this.$t('common.tip'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                  }).then(() => {
                    this.form.dataList.splice(params.index, 1);
                  });
                }
              }
            })
          ]);
        }
      }
    ];
  },
  watch: {
    show(val) {
      this.getAssetTypeList();
      this.getOptionList();
      this.formLoad = false;

      if (val) {
        if (this.isAddMode) {
          this.picture = "";
          this.form = {
            assetTypeId: this.assetTypeId,
            isEditAble: true,
            dataList: [
              {
                itemName: this.$t('common.name'),
                itemCode: "name",
                itemDataType: "TEXT",
                isRequired: "Y",
                isUnique: "Y",
                isShow: "Y",
                isDefault: true
              }
            ]
          };
        } else {
          this.loading = true;
          this.getDetail();
        }
      } else {
        this.$refs.form?.resetFields();
        this.form.isEditAble = true;
        this.form.dataList = [];
      }
    }
  },
  methods: {
    getUrl(path) {
      return "/admin-api/system/file" + path;
    },
    getAssetTypeList() {
      getAssetTypeList({}).then((res) => {
        this.assetTypeList = res.data;
      });
    },
    getOptionList() {
      getOptionListAPI({ type: "asset_optional" }).then((res) => {
        this.optionList = res.data.map(item => ({
          label: item.name,
          value: item.type
        }));
      });
    },
    handleBeforeUpload(file) {
      const allowTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
      if (!allowTypes.includes(file.type)) {
        this.$modal.msgWarning(this.$t('common.pleaseUploadJpgPngGifImage'));
        return false;
      }
      const fileSize = file.size / 1024 / 1024;
      if (fileSize > 100) {
        this.$modal.msgWarning(this.$t('common.uploadedImageCannotExceed100mb'));
        return false;
      }
      this.picture = URL.createObjectURL(file);
    },
    handleSuccess(res) {
      if (res.code === 0) {
        this.form.iconFileId = res.data.documentId;
        this.picture = res.data.url;
        this.$modal.msgSuccess(this.$t('common.imageUploadSuccess'));
        this.fileLoad = false;
      }
    },
    deleteImg() {
      this.picture = "";
      this.form.iconFileId = "";
    },
    getDetail() {
      getAssetModelDetail({ id: this.itemId })
        .then((res) => {
          this.loading = false;
          if (res.code === 0) {
            const obj = res.data || {};
            this.form = {
              assetTypeId: obj.assetTypeId,
              modelName: obj.modelName,
              modelCode: obj.modelCode,
              modelDescription: obj.modelDescription,
              iconFileId: obj.iconFileId,
              isEditAble: obj.isEditAble,
              dataList: []
            };
            this.picture = obj.iconFile ? obj.iconFile.url : "";

            const arr = obj.items.map(element => ({
              id: element.id,
              itemName: element.itemName,
              itemCode: element.itemCode,
              isEditAble: element.isEditAble,
              itemDataType: element.itemDataType,
              isRequired: element.isRequired === true ? "Y" : "N",
              isUnique: element.isUnique === true ? "Y" : "N",
              isShow: "Y",
              isDefault: false
            }));
            this.form.dataList = arr.length ? arr : [
              {
                itemName: "",
                isShow: "Y",
                isRequired: "",
                itemCode: "",
                isEditAble: false,
                itemDataType: "",
                isUnique: "",
                isDefault: false
              }
            ];
          } else {
            this.$Message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    formSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let isValid = true;
          let errorMsg = "";
          this.form.dataList.forEach(item => {
            if (!/^[a-zA-Z_]{1,50}$/.test(item.itemCode)) {
              isValid = false;
              errorMsg = this.$t('common.propertyCodeDoesNotMeetRules', { code: item.itemCode });
            }
          });
          if (!isValid) {
            this.$Message.error(errorMsg);
            this.formLoad = false;
            return;
          }

          const submitData = {
            assetTypeId: this.form.assetTypeId,
            modelName: this.form.modelName,
            modelDescription: this.form.modelDescription,
            iconFileId: this.form.iconFileId,
            modelCode: this.form.modelCode,
            items: this.form.dataList.map((el, index) => ({
              id: el.id? el.id : undefined,
              itemName: el.itemName,
              itemCode: el.itemCode,
              itemDataType: el.itemDataType,
              isUnique: el.isUnique === "Y",
              isRequired: el.isRequired === "Y",
              itemSort: (index + 1).toString()
            }))
          };

          const apiFn = this.isAddMode ? createAssetModel : updateAssetModel;
          if (!this.isAddMode) {
            submitData.id = this.itemId;
          }

          this.formLoad = true;
          apiFn(submitData)
            .then((res) => {
              if (res.code === 0) {
                this.$modal.msgSuccess(`${this.title}${this.$t('common.success')}`);
                this.show = false;
                this.$emit("success", this.title, this.form.modelName, this.form.modelCode);
              } else {
                this.$modal.msgError(`${this.title}${this.$t('common.failure')}`);
              }
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => {
              this.formLoad = false;
            });
        }
      });
    },
    onDragDrop(first, end) {
      first = parseInt(first);
      end = parseInt(end);
      const tmp = this.form.dataList[first];

      if (first < end) {
        for (let i = first + 1; i <= end; i++) {
          this.form.dataList.splice(i - 1, 1, this.form.dataList[i]);
        }
        this.form.dataList.splice(end, 1, tmp);
      } else if (first > end) {
        for (let i = first; i > end; i--) {
          this.form.dataList.splice(i, 1, this.form.dataList[i - 1]);
        }
        this.form.dataList.splice(end, 1, tmp);
      }
    }
  },
  mounted() { },
  beforeDestroy() { }
};
</script>

<style lang="less" scoped>
.img-box {
  widows: 80px;
  display: flex;
  align-items: center;

  img {
    width: 50px;
    vertical-align: middle;
    margin-right: 20px;
  }
}

/deep/.ivu-table {
  .ivu-table-body {
    tr:hover {
      cursor: move;
    }

    .ivu-form-item {
      margin-bottom: 0;
    }
  }

  .ivu-poptip-rel {
    width: 100%;
  }
}
</style>
<style lang="less">
.ivu-select-dropdown ul {
  padding-left: 0 !important;
}
</style>
