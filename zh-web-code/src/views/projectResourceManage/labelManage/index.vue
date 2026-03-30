/* 资源模型管理 */
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="4" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <img src="../../../assets/images/type-icon.png" alt=""
              style="width: 16px; margin: 0 10px 4px 0; vertical-align: middle" />
            <span style="font-size: 16px">{{ $t('common.assetType') }}</span>
            <el-button v-hasPermi="['cqt:asset-type:create']" style="float: right; padding: 4px 0" type="text"
              @click="addAssetType">
              <i class="el-icon-circle-plus-outline">{{ $t('common.add') }}</i>
            </el-button>
          </div>
          <div>
            <div class="head-container">
              <el-input v-model="typeQueryParams.typeName" :placeholder="$t('common.enterAssetType')" @change="searchTypeList" clearable
                size="small" prefix-icon="el-icon-search" maxlength="20" style="margin: 10px 0" />
            </div>
            <div class="container infinite-list" v-infinite-scroll="load" infinite-scroll-disabled="disabled"
              infinite-scroll-distance="20" style="overflow: auto">
              <div class="list infinite-list-item" :style="{
                background: index == activeIndex ? '#D8E5FF' : '#fff',
                borderRadius: index == activeIndex ? '6px' : '0'
              }" v-for="(item, index) in typeList" :key="index" @click="clickType(item, index)"
                @mouseenter="mouseenter(item)" @mouseleave="mouseleave(item)">
                <span class="type-name" :title="item.typeName" :style="item.status == '0' ? { color: '#ccc' } : ''">
                  <!-- <i v-if="item.image" :class="item.image" style="margin-right: 6px; vertical-align: middle;"></i> -->
                  {{ item.typeName }}
                </span>
                <span v-show="item.show || index == activeIndex" style="display: flex;">
                  <i v-if="item.typeName != 'Hardware Asset' && item.typeName != 'Software Asset' && item.typeName != 'Virtual Asset' && item.typeName != 'Data Center Asset'"
                    class="el-icon-edit" @click.stop="handleEdit(item)"></i>
                  <i v-if="item.typeName != 'Hardware Asset' && item.typeName != 'Software Asset' && item.typeName != 'Virtual Asset' && item.typeName != 'Data Center Asset'"
                    class="el-icon-delete" :style="!$auth.hasPermi('cqt:asset-type:delete') ? { color: '#ccc', cursor: 'not-allowed' } : ''"
                    @click.stop="$auth.hasPermi('cqt:asset-type:delete') && handleDel(item)"></i>
                </span>
              </div>
              <p class="tip" v-if="loading">{{ $t('common.loading') }}</p>
              <p class="tip" v-if="noMore && typeList.length > 10">{{ $t('common.noMore') }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="20" :xs="24">
        <el-form ref="queryForm" :model="queryParams" size="small" v-show="showSearch" inline label-width="80px">
          <el-form-item  prop="modelName">
            <el-input v-model.trim="queryParams.modelName" :placeholder="$t('common.enterModelName')" maxlength="20"></el-input>
          </el-form-item>
          <el-form-item  prop="createTime">
            <el-date-picker v-model="queryParams.createTime" style="width: 240px" value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange" range-separator="-" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')"
              :default-time="['00:00:00', '23:59:59']" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="small" @click="handleQuery">{{ $t('common.search') }}</el-button>
            <el-button icon="el-icon-refresh" size="small" @click="resetQuery">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" v-hasPermi="['cqt:asset-model:create']" plain icon="el-icon-plus" size="small"
              @click="handleAdd">{{ $t('common.add') }}</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
        <el-table v-loading="loading" :data="dataList" border>
          <template slot="empty">
            <div class="no-data">
              <img src="../../../assets/images/table-empty.png" alt="" />
              <span class="no-text">{{ $t('common.noData') }}</span>
            </div>
          </template>
          <el-table-column :label="$t('common.assetType')" show-overflow-tooltip align="center" prop="assetTypeName" />
          <el-table-column :label="$t('common.modelName')" show-overflow-tooltip align="center" prop="modelName" />
          <el-table-column :label="$t('common.modelDescription')" show-overflow-tooltip align="center" prop="modelDescription" />
          <el-table-column :label="$t('common.createTime')" show-overflow-tooltip width="150" align="center" prop="createTime" />
          <!-- <el-table-column :label="$t('common.modelIcon')" width="120px" align="center" prop="iconFile">
            <template slot-scope="scope">
              <img v-if="scope.row.iconFile" style="width: 40px" :src="getUrl(scope.row.iconFile.url)" alt="" />
            </template>
          </el-table-column> -->
          <el-table-column :label="$t('common.operation')" width="120px" align="center" class-name="small-padding fixed-width">
            <template v-slot="scope">
              <el-button size="mini" type="text" v-hasPermi="['cqt:asset-model:update']" icon="el-icon-edit"
                @click="handleUpdate(scope.row)">{{ $t('common.edit') }}</el-button>
              <el-button size="mini" type="text" :disabled="!scope.row.isEditAble || !$auth.hasPermi('cqt:asset-model:delete')" icon="el-icon-delete"
                @click="handleDelete(scope.row)">{{ $t('common.delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <a-pagination class="pagination" :current="queryParams.pageNo" :page-size="queryParams.pageSize" :total="total"
          :show-total="total => `${$t('common.total')} ${total} ${$t('common.records')}`" :page-size-options="['5', '10', '50', '100']" show-size-changer
          show-quick-jumper @change="handlePageChange" @showSizeChange="onShowSizeChange" />
      </el-col>
    </el-row>
    <el-dialog :title="title" :visible.sync="visible" @close="cancel" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="0">
        <el-row :gutter="16">
          <el-col :span="24">

            <el-form-item prop="typeName">
              <el-input v-model="form.typeName" :placeholder="$t('common.enterAssetCategoryName')" maxlength="50" show-word-limit style="width: 100%;"></el-input>
            </el-form-item>
            <el-form-item prop="image">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.image" :placeholder="$t('common.clickToSelectMenuIcon')" clearable style="width: 100%;">
                  <svg-icon v-if="form.image" slot="prefix" :icon-class="form.image" class="el-input__icon"
                    style="height: 32px;width: 16px;" />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
              <!-- <el-select v-model="form.image" :placeholder="$t('common.selectAssetIcon')" clearable style="width: 100%;">
                <el-option v-for="icon in iconList" :key="icon.value" :label="icon.label" :value="icon.value">
                  <span style="display:inline-flex; align-items:center;">
                    <i :class="icon.value" style="margin-right:8px;"></i>{{ icon.label }}
                  </span>
                </el-option>
              </el-select> -->
            </el-form-item>
            <el-form-item prop="status">
              <el-radio-group v-model="form.status" style="width: 100%;">
                <el-radio label="1">{{ $t('common.show') }}</el-radio>
                <el-radio label="0">{{ $t('common.hide') }}</el-radio>
              </el-radio-group>


            </el-form-item>
            <el-form-item prop="sort">
              <el-input-number v-model="form.sort" :min="4" :step="1" :placeholder="$t('common.enterSortNumber')"
                style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit" :disabled="isSubmitDisabled">{{ $t('common.confirm') }}</el-button>
        <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
      </div>
    </el-dialog>
    <edit-modal ref="modal" @success="createMenu" @createMenu="createMenu" :itemId="itemId"
      :assetTypeId="queryParams.assetTypeId"></edit-modal>
  </div>
</template>

<script>
import {
  getAssetTypePage,
  createAssetType,
  updateAssetType,
  deleteAssetType,
  getAssetModelPage,
  deleteAssetModel
} from "@/api/resource";
import { listMenu, addMenu, updateMenu, delMenu } from "@/api/system/menu";
import IconSelect from "@/components/IconSelect";
import editModal from "./components/editModal.vue";
export default {
  components: { editModal, IconSelect },
  data() {
    return {
      activeIndex: null,
      showSearch: true,
      total: 0,
      loading: false,
      totalPage: 0,
      originTypeName: '',
      originProductName: '',
      originSelectCode: '',
      typeQueryParams: {
        pageNo: 1,
        pageSize: 10,
        typeName: ""
      },
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        assetTypeId: undefined,
        modelName: undefined,
        createTime: undefined
      },
      form: {
        typeName: '',
        image: '',
        status: '1',
        // statusType: true,
        sort: 4
      },
      iconList: [
        { label: this.$t('common.device'), value: 'el-icon-s-tools' },
        { label: this.$t('common.server'), value: 'el-icon-cpu' },
        { label: this.$t('common.database'), value: 'el-icon-data-line' },
        { label: this.$t('common.network'), value: 'el-icon-link' },
        { label: this.$t('common.storage'), value: 'el-icon-folder' },
        { label: this.$t('common.application'), value: 'el-icon-s-management' },
        { label: this.$t('common.security'), value: 'el-icon-lock' },
        { label: this.$t('common.container'), value: 'el-icon-box' },
        { label: this.$t('common.middleware'), value: 'el-icon-s-operation' },
        { label: this.$t('common.loadBalancer'), value: 'el-icon-s-cooperation' },
        { label: this.$t('common.monitor'), value: 'el-icon-s-data' }
      ],
      rules: {
        typeName: [
          { required: true, message: this.$t('common.pleaseEnterAssetCategoryName'), trigger: 'blur' },
          { max: 50, message: this.$t('common.assetCategoryNameCannotExceed50Chars'), trigger: 'blur' }
        ],
        status: [
          { required: true, message: this.$t('common.pleaseSelectWhetherToShow'), trigger: 'change' }
        ],
        sort: [
          { required: true, message: this.$t('common.pleaseEnterSortNumber'), trigger: 'blur' },
          { type: 'number', min: 4, message: this.$t('common.sortNumberMustBeGreaterThanOrEqualTo4'), trigger: 'blur' }
        ]
      },
      typeList: [],
      title: '',
      visible: false, // 资源类型弹框显示
      dataList: [],
      tableLoad: false,
      itemId: "",
      isSubmitDisabled: false,
      queryMenuParams: {
        name: undefined,
        visible: undefined
      },
    };
  },
  computed: {
    noMore() {
      // 当起始页数大于等于总页数时停止加载
      return this.typeQueryParams.pageNo >= this.totalPage;
    },
    disabled() {
      return this.loading || this.noMore;
    }
  },
  created() {
    this.title = this.$t('common.newAssetCategory');
    this.searchTypeList();
    this.getList();
    // document.addEventListener('keydown', this.disableEnterKey);
  },
  mounted() { },
  methods: {
    // 选择图标
    selected(name) {
      this.form.image = name;
    },
    // getMenuList(){
    //   listMenu(this.queryMenuParams).then(response => {
    //     this.menuList = this.handleTree(response.data, "id");
    //   });
    // },
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
    createMenu(type, modelName, modelCode) {
      this.tableLoad = true;
      getAssetModelPage(this.queryParams).then((res) => {
        this.tableLoad = false;
        this.dataList = res.data.list || [];
        this.total = res.data.total || 0;
        let firstMenu = this.dataList[0]
        let parentMenu = []
        if (type === this.$t('common.add')) {
          listMenu({ name: firstMenu.assetTypeName }).then(response => {
            parentMenu = response.data
            let form = {
              parentId: parentMenu[0]?.id,
              name: modelName,
              type: 2,
              sort: 3,
              status: 0,
              visible: true,
              keepAlive: true,
              alwaysShow: true,
              path: modelCode,
              component: "faultManage/networkDevice/index",
              permission: modelCode,
              componentName: modelCode
            }
            addMenu(form).then(response => {

            }).catch(() => {
            });
          });
        } else {
          listMenu({ name: this.originProductName }).then(response => {  //更新
            parentMenu = response.data
            listMenu({ path: modelCode }).then(response => {
              let childMenu = response.data
              if (childMenu.length === 0) {
                return
              }
              let form = {
                id: childMenu[0]?.id,
                parentId: childMenu[0]?.parentId,
                name: modelName,
                type: 2,
                sort: 2,
                status: 0,
                visible: true,
                keepAlive: true,
                alwaysShow: true,
                path: modelCode,
                component: "faultManage/networkDevice/index",
                permission: modelCode,
                componentName: modelCode
              }
              updateMenu(form).then(response => {

              }).catch(() => {
              });
            })

          });
        }
      });
    },
    disableEnterKey(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    getUrl(path) {
      return "/admin-api/system/file" + path;
    },
    clickType(item, index) {
      this.queryParams.assetTypeId = item.id;
      this.$set(item, "show", true);
      this.activeIndex = index;
      this.handleQuery();
    },
    mouseenter(item) {
      this.$set(item, "show", true);
    },
    mouseleave(item) {
      this.$set(item, "show", false);
    },
    searchTypeList() {
      this.typeQueryParams.pageNo = 1;
      this.typeList = [];
      this.getTypeList();
    },
    handleDel(row) {
      this.$confirm(this.$t('common.confirmDelete'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function () {
          return deleteAssetType({ id: row.id });
        })
        .then(() => {
          this.deleteAssertMenu(row)
          this.activeIndex = null;
          this.typeList = [];
          this.getList();
          this.searchTypeList();
          this.$modal.msgSuccess(this.$t('common.deleteSuccess'));
        });
    },
    deleteMenu(row) {
      listMenu({ name: row.modelName }).then(response => {
        if (response.data && response.data.length > 0) {
          delMenu(response.data[0]?.id).then(response => {

          }).catch(() => {
          });
        }
      })
    },
    deleteAssertMenu(row) {
      listMenu({ name: row.typeName }).then(response => {
        if (response.data && response.data.length > 0) {
          delMenu(response.data[0]?.id).then(response => {

          }).catch(() => {
          });
        }

      })
    },
    handleEdit(row) {
      console.log("编辑资源类型", row);
      this.visible = true;
      this.title = this.$t('common.editAssetType');

      this.originTypeName = row.typeName
      this.form = Object.assign({}, row);
      console.log(this.form, 'this.form');
      this.form.status = String(this.form.status);
      // 正确处理状态转换，显示(true)对应status=0，隐藏(false)对应status=1
      // if (row.status === 0 || row.status === '0') {
      //   this.form.statusType = true; // 状态为0表示显示
      // } else {
      //   this.form.statusType = false; // 状态为1表示隐藏
      // }
    },
    cancel() {
      this.$refs.form.resetFields();
      this.visible = false;
    },
    load() {
      //滑到底部时进行加载
      this.loading = true;
      setTimeout(() => {
        this.typeQueryParams.pageNo += 1; //滚动条到底时，页码自增 1
        this.getTypeList(); //调用接口
      }, 500);
    },
    sortAssets(assets) {
      // 定义需要排在前面的元素顺序（使用国际化标签）
      const priorityOrder = [
        'Hardware Asset',
        'Software Asset',
        'Virtual Asset',
        'Data Center Asset'
      ];

      // 分离出需要排在前面的元素和其他元素
      const priorityItems = [];
      const otherItems = [];

      // 首先收集优先级元素
      priorityOrder.forEach(typeName => {
        const item = assets.find(asset => asset.typeName === typeName);
        if (item) {
          item.disabled = false
          priorityItems.push(item);
        }
      });

      // 收集其他元素，排除已经添加到优先级数组中的元素
      assets.forEach(asset => {
        if (!priorityOrder.includes(asset.typeName)) {
          asset.disabled = true
          otherItems.push(asset);
        }
      });

      // 合并两个数组，优先级元素在前，其他元素在后
      return [...priorityItems, ...otherItems];
    },
    // 资产类型分页
    getTypeList() {
      console.log(this.typeQueryParams);
      getAssetTypePage(this.typeQueryParams).then((res) => {
        this.totalPage = Math.ceil(res.data.total / this.typeQueryParams.pageSize); // 向上取整
        this.loading = false;
        // // 过滤掉status等于1的项（隐藏的项）
        // let filteredList = res.data.list.filter(item => item.status !== 1);
        // let typeList = this.typeList.concat(filteredList);
        let typeList = this.typeList.concat(res.data.list);
        this.typeList = this.sortAssets(typeList)
        this.typeTotal = res.data.total;
      });
    },
    // 新增资源类型
    addAssetType() {
      this.visible = true;
      this.form = {
        typeName: '',
        image: '',
        status: '1',
        // statusType: true,
        sort: 4
      };
      this.title = this.$t('common.newAssetCategory');
    },
    generateRandomString() {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      let result = '';

      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      return result;
    },
    // 资源类型提交
    submit() {

      this.$refs["form"].validate((valid) => {
        if (valid) {

          const url = this.title === this.$t('common.newAssetCategory') ? createAssetType : updateAssetType;
          const msg = this.title === this.$t('common.newAssetCategory') ? this.$t('common.addSuccess') : this.$t('common.updateSuccess');
          // 根据statusType设置status值：显示(true)对应0，隐藏(false)对应1
          // if (this.form.statusType === true || this.form.statusType === 'true' || this.form.statusType === 1 || this.form.statusType === '1') {
          //   this.form.status = 0; // 显示状态对应status=0
          // } else {
          //   this.form.status = 1; // 隐藏状态对应status=1
          // }

          url(this.form).then((res) => {
            let typeName = this.form.typeName
            if (res.code === 0) {

              this.$modal.msgSuccess(msg);
              // this.visible = false;
              this.activeIndex = null;
              this.typeList = [];
              this.searchTypeList();
              this.getList();
              if (this.title === this.$t('common.newAssetCategory')) {
                let parentMenu = []
                //新增资源类型，默认父节点为资产中心模块
                listMenu({ name: this.$t('common.assetCenter') }).then(response => {
                  parentMenu = response.data
                  console.log(this.form, 'this.form3');

                  let form = {
                    parentId: parentMenu[0]?.id,
                    name: typeName,
                    type: 1,
                    sort: this.form.sort,//4,
                    // status: this.form.status,
                    visible: this.form.status == '1' ? true : false,
                    status: this.form.status == '1' ? 0 : 1,
                    // visible: true,
                    icon: this.form.image,//'dict',
                    keepAlive: true,
                    alwaysShow: true,
                    path: this.generateRandomString()
                    // "parentId": 1269,
                    // "name": "测试",
                    // "icon": "bug",
                    // "type": 1,
                    // "sort": 5,
                    // "status": 0,
                    // "visible": true,
                    // "keepAlive": true,
                    // "alwaysShow": true,
                    // "path": "add"
                  }
                  addMenu(form).then(response => {
                    this.visible = false;
                  }).catch(() => {
                  });
                })
              } else {
                listMenu({ name: this.$t('common.assetCenter') }).then(response => {  //更新
                  let parentMenu = response.data
                  listMenu({ menuName: this.originTypeName }).then(response => {

                    let childMenu = response.data
                    if (childMenu.length === 0) {
                      return
                    }
                    let form = {
                      id: childMenu[0]?.id,
                      parentId: parentMenu[0]?.id,
                      name: typeName,
                      type: 2,
                      sort: this.form.sort,
                      status: this.form.status == '1' ? 0 : 1,
                      visible: this.form.status == '1' ? true : false,
                      keepAlive: true,
                      alwaysShow: true,
                      icon: this.form.image,
                      path: childMenu[0]?.path,
                      // component:"faultManage/networkDevice/index",
                      // permission:childMenu[0]?.permission,
                      // componentName:childMenu[0]?.componentName
                    }
                    updateMenu(form).then(response => {
                      this.visible = false;
                    }).catch(() => {
                    });
                  })

                });
              }
            }
          });
        }
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.assetTypeId = null;
      this.activeIndex = null;
      this.handleQuery();
    },
    getList() {
      this.tableLoad = true;
      getAssetModelPage(this.queryParams).then((res) => {
        this.tableLoad = false;
        this.dataList = res.data.list || [];
        this.total = res.data.total || 0;
      });
    },
    handleAdd() {
      this.$refs.modal.isAddMode = true;
      this.$refs.modal.title = this.$t('common.add');
      this.$refs.modal.show = true;
    },
    handleUpdate(row) {
      this.$refs.modal.isAddMode = false;
      this.$refs.modal.title = this.$t('common.edit');
      this.$refs.modal.show = true;
      this.originProductName = row.assetTypeName
      this.originSelectCode = row.modelCode
      this.itemId = row.id + "";
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$confirm(this.$t('common.confirmDeleteAssetModel'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(function () {
          return deleteAssetModel({ id: ids });
        })
        .then(() => {
          this.deleteMenu(row)
          this.getList();
          // this.queryParams.assetTypeId = null;
          this.$modal.msgSuccess(this.$t('common.deleteSuccess'));
        })
        .catch(() => { });
    }
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.disableEnterKey);
  }
};
</script>
<style scoped lang="scss">
.box-card {
  min-height: calc(100vh - 160px);
}

.title {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: #EDF0F6;
  border-radius: 2px;
  border: 1px solid #cfd5e0;

  span {
    font-size: 18px;
  }
}

.container {

  // height: 500px;
  // overflow-y: auto;
  // border: 1px solid black;
  // height: 500px;
  .tip {
    color: #c0c4cc;
    text-align: center;
  }

  i {
    font-size: 16px;
    margin-right: 10px;
    // color: #CFD5E0;
  }

  .list {
    padding: 10px 0 10px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    .type-name {
      width: 120px;
      display: inline-block;
      white-space: nowrap;
      /* 不换行 */
      overflow: hidden;
      /* 隐藏超出部分 */
      text-overflow: ellipsis;
      /* 显示省略号 */
    }

    span {
      font-size: 14px;
    }

    &:hover {
      background: #f4f8ff;
      color: #34354b;
    }
  }
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

::v-deep .el-icon-question {
  color: #1890ff;
}
</style>
