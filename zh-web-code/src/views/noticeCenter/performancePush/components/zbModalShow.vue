<template>
    <a-drawer :title="$t('common.metricItems')" :visible="showModal" width="680px" placement="right" :closable="true" :mask-closable="false"
        @close="cancel">
        <div style="height: 80vh; overflow-y: auto">
            <!-- 告警表格 -->
            <a-table :columns="columns" :data-source="dataSource" :pagination="false" :row-key="(record) => record.id"
                :locale="{
                    emptyText: $t('common.noData')
                }"
                >
                <!-- 自定义列渲染 -->
                <template slot="operation" slot-scope="text, record">
                    <template v-if="isAdmin && !record.isEditing">
                        <a-button type="link" @click="startEdit(record)">{{ $t('common.edit') }}</a-button>
                    </template>
                    <template v-else-if="isAdmin && record.isEditing">
                        <a-button type="primary" size="small" @click="saveEdit(record)"
                            style="margin-right: 8px">{{ $t('common.save') }}</a-button>
                        <a-button size="small" @click="cancelEdit(record)">{{ $t('common.cancel') }}</a-button>
                    </template>
                    <template v-else>
                        <!-- 非管理员不可见操作按钮 -->
                    </template>
                </template>

                <!-- 可编辑的单元格 -->
                <template slot="unit" slot-scope="text, record">
                    <template v-if="!record.isEditing">{{ text }}</template>
                    <template v-else>
                        <a-input v-model="record.unit" />
                    </template>
                </template>

                <template slot="grade" slot-scope="text, record">
                    <template v-if="!record.isEditing">{{ gradeMap[text] }}</template>
                    <template v-else>
                        <a-select v-model="record.grade" style="width: 100%">
                            <a-select-option value="low">{{ $t('common.low') }}</a-select-option>
                            <a-select-option value="medium">{{ $t('common.medium') }}</a-select-option>
                            <a-select-option value="high">{{ $t('common.high') }}</a-select-option>
                        </a-select>
                    </template>
                </template>

                <template slot="compareType" slot-scope="text, record">
                    <template v-if="!record.isEditing">{{
                        compareTypeMap[text]
                        }}</template>
                    <template v-else>
                        <a-select v-model="record.compareType" style="width: 100%">
                            <a-select-option value="1">{{ $t('common.equalTo') }}</a-select-option>
                            <a-select-option value="2">{{ $t('common.notEqualTo') }}</a-select-option>
                            <a-select-option value="3">{{ $t('common.greaterThan') }}</a-select-option>
                            <a-select-option value="4">{{ $t('common.lessThanOrEqualTo') }}</a-select-option>
                            <a-select-option value="5">{{ $t('common.lessThan') }}</a-select-option>
                            <a-select-option value="6">{{ $t('common.greaterThanOrEqualTo') }}</a-select-option>
                        </a-select>
                    </template>
                </template>

                <template slot="compareValue" slot-scope="text, record">
                    <template v-if="!record.isEditing">{{ text }}</template>
                    <template v-else>
                        <a-input-number v-model="record.compareValue" style="width: 100%" />
                    </template>
                </template>

                <template slot="remark" slot-scope="text, record">
                    <template v-if="!record.isEditing">{{ text }}</template>
                    <template v-else>
                        <a-input v-model="record.remark" style="width: 100%" />
                    </template>
                </template>
            </a-table>
        </div>
    </a-drawer>
</template>

<script>
import { indicatorPage, indicatorUpdate } from "@/api/indicator";
import { getAssetModelDetails } from '@/api/resource';
export default {
    name: "NoticeConfigForm",
    props: {
        opt: {
            // 操作类型：新增/编辑
            type: String,
            default: "addNotificationObject",
        },
        resourceType: {
            // 操作类型：新增/编辑
            type: String,
            default: "",
        },
        deviceType: {
            // 操作类型：新增/编辑
            type: String,
            default: "",
        },
        recordId: {
            // 操作类型：新增/编辑
            type: String,
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            showModal: false,
            isAdmin: true, // 模拟超级管理员权限
            dataSource: [],
            columns: [
                {
                    title: this.$t('common.metricName'),
                    dataIndex: "metricName",
                    key: "metricName",
                },
                // {
                //     title: "单位",
                //     dataIndex: "unit",
                //     key: "unit",
                //     scopedSlots: { customRender: "unit" },
                // },
                // {
                //     title: "级别",
                //     dataIndex: "grade",
                //     key: "grade",
                //     scopedSlots: { customRender: "grade" },
                // },
                // {
                //     title: "判断条件",
                //     dataIndex: "compareType",
                //     key: "compareType",
                //     scopedSlots: { customRender: "compareType" },
                // },
                // {
                //     title: "建议值",
                //     dataIndex: "compareValue",
                //     key: "compareValue",
                //     scopedSlots: { customRender: "compareValue" },
                // },
                {
                    title: this.$t('common.remark'),
                    dataIndex: "remark",
                    key: "remark",
                    scopedSlots: { customRender: "remark" },
                },
                // {
                //     title: "操作",
                //     key: "operation",
                //     scopedSlots: { customRender: "operation" },
                // },
            ],

        };
    },
    watch: {
        showModal(val) {
            if (val) {
                // 初始化数据（编辑场景回显）
                this.init();
            } else {
                // 关闭弹窗时：重置表单
                console.log("关闭");
            }
        },
    },
    computed: {
        gradeMap() {
            return {
                low: this.$t('common.low'),
                medium: this.$t('common.medium'),
                high: this.$t('common.high'),
            };
        },
        compareTypeMap() {
            return {
                1: this.$t('common.equalTo'),
                2: this.$t('common.notEqualTo'),
                3: this.$t('common.greaterThan'),
                4: this.$t('common.greaterThanOrEqualTo'),
                5: this.$t('common.lessThan'),
                6: this.$t('common.lessThanOrEqual'),
            };
        },
    },
    methods: {
        init() {
            this.loading = true;
            // let params = {
            //     resourceType: this.resourceType || undefined,
            //     deviceType: this.deviceType || undefined,
            // };
            getAssetModelDetails(this.recordId).then((res) => {
                let data = res.data;
                this.dataSource = data.map((item) => {
                    return {
                        ...item,
                        isEditing: false,
                    };
                });
                this.loading = false;
            });
        },
        startEdit(record) {
            this.$set(record, "isEditing", true);
        },

        saveEdit(record) {
            // 这里可以调用 API 保存数据
            console.log("保存:", record);
            this.$set(record, "isEditing", false);
            indicatorUpdate(record)
                .then((res) => {
                    if (res.data) {
                        this.$modal.msgSuccess(this.$t('common.saveSuccess'));
                        this.init();
                    } else {
                        this.$modal.msgError(res.message || this.$t('common.saveFailed'));
                    }
                })
                .catch((error) => {
                    this.$modal.msgError(this.$t('common.saveFailed'));
                });
        },

        cancelEdit(record) {
            // 恢复原数据（可选：回滚到原始值）
            this.$set(record, "isEditing", false);
            this.init();
        },


        // 取消操作：关闭弹窗
        cancel() {
            this.showModal = false;
        },
    },
    created() {
        const roles = this.$store.getters && this.$store.getters.roles;
        console.log("roles", roles);
        if (roles.includes("system_admin")) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
            // this.columns.pop();
        }
    },
};
</script>

<style scoped lang="less">
/* 标签相关样式 */
.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}

.tag-style {
    border: 1px solid #dcdfe6;
    padding: 4px;
    margin: 0 8px;
}

/* 步骤条样式 */
.el-steps {
    margin-bottom: 20px;
}

.pagination {
    padding: 16px;
    background: #fff;
    margin-left: auto;
    // width: 360px;
    /* border-radius: 8px; */
    margin-top: 16px;
    position: absolute;
    right: 0px;
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

/* 弹窗底部按钮样式 */
.dialog-footer {
    text-align: right;
    margin-top: 20px;

    :deep(.el-button) {
        margin-left: 8px;
    }
}

/* 卡片样式调整 */
:deep(.ant-card) {
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
        0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

/* 行布局对齐样式 */
:deep(.el-row--flex) {
    align-items: center;
}

/* 提示文本样式 */
:deep(.el-form-item__error) {
    font-size: 12px;
    color: #666;
    background-color: #f5f7fa;
    padding: 2px 5px;
    border-radius: 3px;
}

/* 抽屉滚动优化 */
:deep(.ant-drawer-wrapper-body) {
    overflow: hidden;
}
</style>