<template>
    <div class="alarm-history">
        <!-- 查询表单 -->
        <div style="border-bottom: 1px solid #eee; margin-bottom: 10px">
            <a-form :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                style="font-size: 16px !important;display: flex;">
                <a-form-item>
                    <a-input v-model="searchForm.tpName" :placeholder="$t('common.pleaseEnterTopologyName')" allowClear style="width: 100%;" />
                </a-form-item>
                <!-- <a-form-item label="状态" style="margin-left: 10px;">
                    <a-select v-model="searchForm.tpState" placeholder="请选择" style="width: 200px">
                        <a-select-option v-for="state in stateOptions" :key="state.value" :value="state.value">
                            {{ state.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item> -->
                <a-form-item style="display: flex;min-width: 462px;margin-left: 40px;">
                    <a-button type="primary" @click="handleSearch">{{ $t('common.search') }}</a-button>
                    <a-button type="primary" ghost style="margin-left: 12px" @click="handleReset">{{ $t('common.reset') }}</a-button>
                    <a-button type="danger" ghost icon="plus" style="margin-left: 12px"
                        @click="addTpInfo()">{{ $t('common.add') }}</a-button>
                </a-form-item>
            </a-form>
        </div>
        <!-- 告警表格 -->
        <!-- <div style="margin-bottom: 10px;">
            <el-button size="small" type="primary" @click="addTpInfo()">创建</el-button>
        </div> -->

        <!-- 卡片展示区域 -->
        <div v-loading="loading" class="card-container">
            <div v-for="item in tableData" :key="item.id" class="topology-card">
                <!-- 背景图片区域 -->
                <div class="card-image">
                    <div class="card-bg-pattern">
                        <!-- {{ item.imageUrl }} -->

                        <img v-if="item.imageUrl" :src="'/admin-api/system/file' + item.imageUrl" alt="" width="100%"
                            height="100%">
                        <div v-else class="moreClass">{{ $t('common.noData') }}</div>
                        <!-- http://localhost/admin-api/system/file/1/get/8e484290a54337993fd06fb6c41b39dcf1b54aa163b3441559b305083c069a98.png -->
                    </div>
                </div>

                <!-- 操作按钮区域 -->
                <div class="card-actions">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleEdit(item)">{{ $t('common.edit') }}</el-button>
                    <el-button size="mini" type="text" icon="el-icon-view" @click="handlePreview(item)">{{ $t('common.preview') }}</el-button>
                    <el-button size="mini" type="text" icon="el-icon-share" @click="handleShare(item)">{{ $t('common.share') }}</el-button>
                    <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(item)">{{ $t('common.delete') }}</el-button>
                    <!-- 更多选项 -->
                    <el-popover placement="right" trigger="click" popper-class="more-options-popover">
                        <div>
                            <el-button type="text" size="mini" @click="handleDownload(item)">{{ $t('common.exportPNG') }}</el-button>
                            <el-button type="text" size="mini" @click="handleRename(item)">{{ $t('common.rename') }}</el-button>
                        </div>
                        <el-button slot="reference" size="mini" type="text" icon="el-icon-more"></el-button>
                    </el-popover>
                </div>

                <!-- 图谱名称 -->
                <div class="card-name">
                    <template v-if="item.name && item.name.length > 20">
                        <el-tooltip :content="item.name" placement="top">

                            <span style="cursor: pointer;"> {{ item.name }}</span>
                        </el-tooltip>
                    </template>
                    <template v-else>

                        <span style="cursor: pointer;"> {{ item.name }}</span>
                    </template>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <a-pagination class="pagination" :current="currentPage" :page-size="pageSize" :total="total"
            :show-total="(total) => $t('common.totalRecords', { total: total })" :page-size-options="['8']" show-size-changer
            @change="handlePageChange" @showSizeChange="onShowSizeChange">
            <template slot="buildOptionText" slot-scope="props">
                <span>{{ $t('common.recordsPerPage', { size: props.value }) }}</span>
            </template>
        </a-pagination>

        <!-- 编辑模态框 -->
        <!-- <edit-modal ref="editModal" :resourceType="resourceType" :deviceType="deviceType"
            @refreshList="fetchData"></edit-modal> -->
        <el-dialog :title="$t('common.addTopology')" :visible.sync="addShowModalTp" v-if="addShowModalTp" :loading="loading" width="600px">
            <el-form ref="addForm" :model="addForm" :rules="rules" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="name" :label="$t('common.topologyName')">
                            <el-input type="text" v-model.trim="addForm.name" maxlength="40" :placeholder="$t('common.pleaseEnterTopologyName')">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="22">
                        <el-form-item prop="description" label="描述">
                            <el-input type="textarea" :rows="2" v-model.trim="addForm.description" maxlength="200"
                                show-word-limit />
                        </el-form-item>
                    </el-col> -->
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">



                <el-button type="primary" @click="addTpSubmit('addForm')">{{ $t('common.confirm') }}</el-button>
                <el-button @click="resetForm">{{ $t('common.cancel') }}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="$t('common.delete')" :visible.sync="dialogVisibleDeit" width="30%">
            <span>{{ $t('common.confirmDeleteTopology') }}</span>
            <span slot="footer" class="dialog-footer">



                <el-button @click="dialogVisibleDeit = false">{{ $t('common.cancel') }}</el-button>
                <el-button type="primary" @click="deitSupmit()">{{ $t('common.confirm') }}</el-button>
            </span>
        </el-dialog>
        <el-dialog :title="$t('common.rename')" :visible.sync="addShowModalCmm" v-if="addShowModalCmm" :loading="loading" width="600px">
            <el-form ref="cmmForm" :model="cmmForm" :rules="rulesCmm" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item prop="name" :label="$t('common.topologyName')">
                            <el-input type="text" v-model.trim="cmmForm.name" maxlength="40" :placeholder="$t('common.pleaseEnterTopologyName')">
                            </el-input>
                        </el-form-item>
                    </el-col>

                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">



                <el-button type="primary" @click="addUmmSubmit('cmmForm')">{{ $t('common.confirm') }}</el-button>
                <el-button @click="addShowModalCmm = false">{{ $t('common.cancel') }}</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="$t('common.share')" :visible.sync="addShowModalFx" v-if="addShowModalFx" :loading="loading" width="880px">
            <el-form ref="fxForm" label-width="120px">
                <el-row>
                    <el-col :span="22">
                        <el-form-item>
                            <div style="display: flex;">
                                <el-input type="text" v-model.trim="shareUrl" maxlength="40" readonly>
                                </el-input>
                                &nbsp;&nbsp;
                                <el-button type="primary" @click="fzSupmit()">{{ $t('common.copyLink') }}</el-button>
                            </div>

                        </el-form-item>
                    </el-col>

                </el-row>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import moment from "moment";

import { topologyList, createAdd, indicatorUpdate, getByIdDelete, getShare, rename } from "@/api/topology";

import refreshTime from "@/components/refresh/index.vue";
import update from "../../../packages/cc-topology/src/utils/anchor/update";
// import editModal from "./components/editModal.vue";
export default {
    name: "AlarmHistory",
    // editModal
    components: { refreshTime },
    props: {
        // selectId: {
        //     type: Object,
        //     default: 0,
        // },
    },
    data() {
        return {
            selectName: "",
            nameVisible: false,
            resourceType: "",
            deviceType: "",
            // 查询表单参数
            searchForm: {
                tpName: "",
                tpState: "",
            },
            resourceTypeOptions: [
                { value: "networkdevice", label: "网络设备" },
                { value: "securitydevice", label: "安全设备" },
                { value: "storagebase", label: "数据库" },
                { value: "operatesystem", label: "操作系统" },
                { value: "middleware", label: "中间件" },
            ],

            // 城市映射表（模拟后端数据）
            deviceMap: {
                networkdevice: [{ value: "1", label: "交换机" }],
                securitydevice: [{ value: "1", label: "安全设备" }],
                storagebase: [
                    { value: "1", label: "mysql" },
                    { value: "3", label: "elasticSearch" },
                    { value: "4", label: "redis" },
                ],
                operatesystem: [{ value: "1", label: "操作系统" }],
                middleware: [
                    { value: "5", label: "kafka" },
                    { value: "6", label: "nginx" },
                ],
            },

            deviceOptions: [], // 动态的城市选项
            stateOptions: [
                { value: "1", label: "已生成" },
                { value: "2", label: "未生成" },
            ],

            // 表格数据
            tableData: [],
            loading: false,
            currentPage: 1,
            pageSize: 8,
            total: 0,
            visible: false, // 模态框显隐
            addShowModalTp: false,
            addForm: {
                name: "",
                description: '',
                // nodeList: [
                //     {
                //         "deviceId": 185800,
                //         "nodeName": "1",
                //         "xCoordinate": 1.2,
                //         "yCoordinate": 5.5,
                //         "nodeType": 1,
                //         "styleConfig": "(color: \"#FF0000\", size: 20, icon: \"router\")"
                //     },
                //     {
                //         "deviceId": 185789,
                //         "nodeName": "2",
                //         "xCoordinate": 10.2,
                //         "yCoordinate": 50.5,
                //         "nodeType": 1,
                //         "styleConfig": "(color: \"#FF0000\", size: 20, icon: \"router\")"
                //     }
                // ],
                // connectionList: [
                //     {
                //         "sourceDeviceId": 185800,
                //         "targetDeviceId": 185789,
                //         "connectionType": 1,
                //         "extraInfo": "123"
                //     }
                // ]
            },
            rules: {
                name: { required: true, message: this.$t('common.pleaseEnterTopologyName'), trigger: "blur" },

            },
            dialogVisibleDeit: false,
            editId: '',
            addShowModalCmm: false,
            cmmForm: {
                name: '',
                id: ''
            },
            rulesCmm: {
                name: { required: true, message: this.$t('common.pleaseEnterTopologyName'), trigger: "blur" },

            },
            shareUrl: '',
            addShowModalFx: false
        };
    },
    computed: {

    },
    mounted() {
        this.fetchData();
    },
    methods: {
        // 当选择省份时触发
        handleProvinceChange(value) {
            // 根据选择的省份，更新城市列表
            this.deviceOptions = this.deviceMap[value] || [];
            // 清空已选择的城市
            this.searchForm.deviceType = "";
        },
        // 编辑图谱
        handleEdit(row) {
            this.$router.push({
                path: "/show/topologyEdit",
                query: { id: row.id, mode: 'edit' }
            });
        },
        // 预览图谱
        handlePreview(row) {
            this.$router.push({
                path: "/show/topologyEdit",
                query: { id: row.id, mode: 'preview' }
            });
        },
        // 分享图谱
        handleShare(row) {
            // 创建分享链接
            // const shareUrl = window.location.origin + this.$router.resolve({
            //     path: '/demos/topology',
            //     query: { id: row.id, mode: 'preview', share: 'true' }
            // }).href;

            // // 复制到剪贴板
            // navigator.clipboard.writeText(shareUrl).then(() => {
            //     this.$message.success('分享链接已复制到剪贴板');
            // }).catch(() => {
            //     this.$message.error('复制失败，请手动复制');
            // });

            const ids = row.id;
            getShare({ id: ids }).then((res) => {
                console.log(res, 'res');
                console.log(window.location, 'window.location');

                console.log(window.location.origin + '/demos' + res.data, ' window.location');

                // 获取当前语言设置
                const currentLang = localStorage.getItem('accept-language') || 'zh';
                
                // 检查分享链接是否已经包含参数
                const separator = res.data.includes('?') ? '&' : '?';
                // 生成包含语言参数的分享链接
                this.shareUrl = window.location.origin + res.data + separator + 'lang=' + currentLang;
                this.addShowModalFx = true;
                // 复制到剪贴板
                // navigator.clipboard.writeText(this.shareUrl).then(() => {
                //     this.$message.success('分享链接已复制到剪贴板');
                // }).catch(() => {
                //     this.$message.error('复制失败，请手动复制');
                // });
            });
        },
        handleAdd(record) {
            this.resourceType = record.resourceType;
            this.deviceType = record.deviceType;
            this.$refs.editModal.addShowModalTp = true;
        },
        onClose() {
            this.nameVisible = false;
        },

        // 模拟获取数据
        fetchData() {
            this.loading = true;
            let params = {
                pageSize: this.pageSize,
                pageNo: this.currentPage,
                name: this.searchForm.tpName
            };
            topologyList(params).then((res) => {
                // this.tableData = [
                //     {
                //         tpName: '总拓扑图',
                //         id: '1',
                //         tpState: '1',
                //         text: '描述',
                //         createDate: '2025.10.22',
                //         updateDate: '2025.10.22',
                //     }
                // ]

                this.tableData = res.data && res.data.list;
                this.total = (res.data && res.data.total) || 0;

                this.loading = false;
            });
        },
        // 查询
        handleSearch() {
            this.currentPage = 1;
            this.fetchData();
        },
        // 重置
        handleReset() {
            this.currentPage = 1;
            this.pageSize = 8;
            this.searchForm = {
                tpName: ''

            };
            this.handleSearch();
        },
        // 分页切换
        handlePageChange(page) {
            this.currentPage = page;
            this.fetchData();
        },
        // 每页条数变化
        onShowSizeChange(current, pageSize) {
            this.pageSize = pageSize;
            this.currentPage = 1;
            this.fetchData();
        },
        //重置表单
        resetForm() {
            this.addForm.name = "";
            this.addForm.description = "";
            // 清除表单验证状态
            if (this.$refs.addForm) {
                this.$refs.addForm.resetFields();
            }
            this.addShowModalTp = false;
        },
        //新建
        addTpInfo() {
            // 打开前先清空表单内容
            this.addForm.name = "";
            this.addForm.description = "";
            this.addShowModalTp = true;
        },
        //新建确认
        addTpSubmit(val) {
            console.log(val);
            this.$refs[val].validate((valid) => {
                if (valid) {
                    createAdd(this.addForm)
                        .then((res) => {
                            if (res.code === 0) {
                                console.log(`/show/topologyEdit?id=${res.data}`, '`/show/topologyEdit/id=${res.data.id}`');
                                this.$router.push({
                                    path: "/show/topologyEdit",
                                    query: { id: res.data, mode: 'edit' } // 会自动拼接为 ?id=123
                                });
                                // this.$router.push(`/demos/topology?id=${res.data}`);
                                //this.$router.push(`/demos/topology/18`);//需要后端返回一个id
                                this.$modal.msgSuccess(this.$t('common.createSuccess'));
                                this.resetForm(); // 使用resetForm方法关闭弹框并清空表单
                                this.handleSearch();

                            } else {
                                this.$modal.msgError(this.$t('common.createFailed'));
                            }
                        })
                        .catch((error) => {
                            if (error.response) {
                                this.$modal.msgError(this.$t('common.createFailed'));
                            }
                        });
                }
            });

        },
        //删除
        handleDelete(row) {
            this.editId = row.id;
            // this.dialogVisibleDeit = true;
            this.$confirm(this.$t('common.confirmDeleteTopology'), this.$t('common.tip'), {
                    confirmButtonText: this.$t('common.confirm'),
                    cancelButtonText: this.$t('common.cancel'),
                    type: "warning",
                }).then(() => {  // 箭头函数
                    getByIdDelete({ id: this.editId }).then((res) => {
                        this.$message.success(this.$t('common.deleteSuccess'));
                        this.handleSearch();  // 此时 this 指向组件实例
                    });
                })
                .catch(() => { });
        },
        // deitSupmit() {
        //     getByIdDelete({ id: this.editId }).then((res) => {
        //         if (res.data) {
        //             this.$message.success("删除成功");
        //             this.dialogVisibleDeit = false;
        //             this.handleSearch();  // 此时 this 指向组件实例
        //         }

        //     });
        // },
        // 重命名图谱
        handleRename(item) {
            this.cmmForm.id = item.id;
            this.cmmForm.name = item.name;
            this.addShowModalCmm = true;
            // this.$prompt('请输入新的图谱名称', '重命名', {
            //     confirmButtonText: '确定',
            //     cancelButtonText: '取消',
            //     inputValue: item.name
            // }).then(({ value }) => {
            //     console.log(item, value, 'handleRename');
            //     if (value) {
            //         let params = {
            //             id: item.id,
            //             name: value
            //         }
            //         rename(params).then((res) => {
            //             if (res.data) {
            //                 this.$message.success('重命名成功');
            //                 this.handleSearch();
            //             }
            //         })
            //     } else {
            //         this.$message.warning('请输入新的名称');
            //     }
            // }).catch(() => {
            //     this.$message.info('取消重命名');
            // });
        },
        //重命名确认
        addUmmSubmit(val) {
            this.$refs[val].validate((valid) => {
                if (valid) {
                    let params = {
                        id: this.cmmForm.id,
                        name: this.cmmForm.name
                    }
                    rename(params).then((res) => {
                        if (res.data) {
                            this.addShowModalCmm = false;
                            this.$message.success(this.$t('common.renameSuccess'));
                            this.handleSearch();
                        }
                    })
                }
            })

        },
        // 下载图谱
        handleDownload(item) {
            console.log(item, 'item');

            if (item.imageUrl) {
                // 导入文件下载工具
                import('@/utils/fileDown').then(({ fileDown }) => {
                    // 使用fileDown工具函数下载，确保中文文件名正确显示
                    const imageUrl = '/admin-api/system/file' + item.imageUrl;
                    const fileName = `${item.name}.png`;
                    fileDown(imageUrl, fileName);
                    this.$message.success(this.$t('common.topologyDownloadSuccess'));
                });
            } else {
                // 如果没有图片，提示用户需要先预览生成图片
                this.$message.warning(this.$t('common.noPreviewImagePleasePreviewFirst'));
            }
        },
        //复制
        fzSupmit() {
            const textToCopy = this.shareUrl;
            if (!textToCopy) {
                this.$message.warning(this.$t('common.linkIsEmptyCannotCopy'));
                return;
            }
            // 优先尝试使用现代的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.$message.success(this.$t('common.shareLinkCopiedToClipboard'));
                }).catch(() => {
                    this.$message.error(this.$t('common.copyFailedPleaseCopyManually'));
                });
            } else {
                // 回退到传统方法，适用于 HTTP 环境
                try {
                    const textArea = document.createElement('textarea');
                    textArea.value = textToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    const success = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    if (success) {
                        this.$message.success(this.$t('common.shareLinkCopiedToClipboard'));
                    } else {
                        this.$message.error(this.$t('common.copyFailedPleaseCopyManually'));
                    }
                } catch (err) {
                    this.$message.error(this.$t('common.copyFailedPleaseCopyManually'));
                }
            }
        }

    },
};
</script>

<style scoped lang="less">
.alarm-history {
    padding: 20px;
    background: #fff;
    min-height: 89vh;
}

/* 卡片容器样式 */
.card-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    margin-top: 20px;

    @media (max-width: 1600px) {
        grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
}

/* 拓扑图卡片样式 */
.topology-card {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    background: #fff;
    cursor: pointer;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }
}

/* 卡片图片区域 */
.card-image {
    height: 120px;
    overflow: hidden;
    position: relative;
    // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .card-bg-pattern {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        background-image:
            radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px),
            radial-gradient(rgba(255, 255, 255, 0.1) 2px, transparent 2px);
        background-size: 30px 30px;
        background-position: 0 0, 15px 15px;
        opacity: 0.8;
        transition: all 0.3s ease;

        .moreClass {
            width: 100%;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #999;
            font-size: 14px;
        }
    }

    &:hover .card-bg-pattern {
        opacity: 1;
        transform: scale(1.02);
    }
}

/* 卡片操作按钮区域 */
.card-actions {
    padding: 10px;
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    position: relative;
    align-items: center;
}

/* 更多选项下拉菜单样式 */
.more-options {
    position: absolute;
    right: 10px;
    top: 100%;
    margin-top: 5px;
    background: white;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 5px 0;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    min-width: 100px;
    z-index: 1000;
}

.more-options .el-button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 5px 20px;
    margin: 0;
    border-radius: 0;
}

.more-options .el-button:hover {
    background-color: #f5f7fa;
}


/* 卡片名称区域 */
.card-name {
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}

.search-card {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-operations {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    /* border-radius: 8px; */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.operation-buttons {
    display: flex;
    gap: 12px;
}

.severity-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.status-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.disposal-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 500;
}

.table-row-actions {
    display: flex;
    gap: 12px;
}

.table-row-actions a {
    color: #1890ff;
    transition: color 0.3s;
}

.table-row-actions a:hover {
    color: #40a9ff;
}

.pagination {
    padding: 16px;
    background: #fff;
    margin-left: auto;
    // width: 360px;
    /* border-radius: 8px; */
    margin-top: 16px;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

.ant-form-item {
    margin-bottom: 16px;
}

.ant-table-thead>tr>th {
    background: #fafafa;
    font-weight: 600;
}

.ant-table-tbody>tr:hover>td {
    background: #f0f8ff !important;
}

.metric-name:hover {
    color: #096dd9;
    text-decoration: underline;
}

/deep/ .ant-table {
    .ant-table-thead>tr>th {
        background: #fafafa;
        font-weight: 600;
    }

    .ant-table-tbody>tr:hover>td {
        background: #e6f7ff;
    }
}

/deep/ .ant-pagination {
    margin-top: 16px;

    @media (max-width: 576px) {

        .ant-pagination-item,
        .ant-pagination-prev,
        .ant-pagination-next,
        .ant-pagination-jump-prev,
        .ant-pagination-jump-next {
            margin-bottom: 8px;
        }
    }
}

/deep/ .ant-table-thead>tr>th {
    background: #e6f0fb !important;
}

.pagination {
    text-align: right;
}
</style>
<style>
.more-options-popover {
    min-width: 100px !important;
    padding: 0;
}

.more-options-popover>div {
    display: flex;
    flex-direction: column;
}

/* 让el-icon-more图标竖着展示 */
.el-icon-more {
    position: relative;
    width: 16px;
    height: 16px;
    line-height: 21px;
    text-align: center;
}

.el-icon-more::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.el-icon-more::after {
    content: "⋯";
    font-size: 16px;
    letter-spacing: 2px;
    transform: rotate(90deg);
    display: inline-block;
    margin-top: -2px;
}

.more-options-popover .el-button {
    padding: 8px 0;
    margin: 0;
    text-align: center;
    border-radius: 0;
}
</style>