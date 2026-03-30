<template>
    <div>
        <div v-if="isShow"
            style="background-color: #f8ced3;width: 78%;margin-left: 6%;padding: 4px 0px 4px 6px;margin-top:-10px;margin-bottom: 6px;color: #de374d;">
            {{ $t('common.templateHasBeenUsedAndCannotBeEdited') }}</div>
        <el-form ref="searchForm" :model="searchForm" :rules="rules" label-width="10px" class="asset-form">
            <el-row :gutter="24">
                <el-col :span="8">
                    <el-form-item  prop="name">
                        <el-input v-model="searchForm.metricName" style="width: 100%" :placeholder="$t('common.pleaseInputMetricName')"
                            clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item  prop="name">
                        <el-select v-model="searchForm.grade" style="width: 100%" clearable>
                            <el-option value="low" :label="$t('common.low')"></el-option>
                            <el-option value="medium" :label="$t('common.medium')"></el-option>
                            <el-option value="high" :label="$t('common.high')"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-button type="primary" size="small" @click="handleSearch">{{ $t('common.search') }}</el-button>
                    <el-button size="small" style="margin-left: 12px;" @click="handleReset">{{ $t('common.reset') }}</el-button>
                </el-col>
            </el-row>
            <el-row :gutter="24">
                <el-col :span="20">
                    <el-form-item  prop="name">
                        <div v-if="displaySelectedMetrics.length > 0" class="no-selected-metrics">
                            <el-tag v-for="metric in displaySelectedMetrics" :key="metric.id" :closable="!isShow"
                                @close="removeMetric(metric.id)" style="margin-right: 8px; margin-bottom: 8px;">
                                {{ metric.metricName }}
                            </el-tag>
                        </div>
                        <div v-else class="no-selected-metrics">
                            {{ $t('common.noSelectedMetrics') }}
                        </div>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- 关键：通过v-if控制表格DOM的销毁与重建 -->
        <div v-if="!isRendering">
            <el-table v-loading="loading" :data="tableData" class="tableClass" border
                @selection-change="handleSelectionChange" ref="tableRef" row-key="id">
                <el-table-column type="selection" width="55" :selectable="isSelectable"></el-table-column>
                <el-table-column :label="$t('common.metricName')" align="center" :show-overflow-tooltip="true">
                    <template v-slot="scope">
                        <el-tooltip v-if="scope.row.remark" class="item" effect="dark" :content="scope.row.remark"
                            placement="top">
                            <span>{{ scope.row.metricName }}</span>
                        </el-tooltip>
                        <span v-else>{{ scope.row.metricName }}</span>
                    </template>
                </el-table-column>
                <!-- 异常级别列：仅勾选行显示必填*和错误样式 -->
                <el-table-column align="center">
                    <template slot="header">
                        {{ $t('common.abnormalLevel') }}
                        <!-- 仅当非禁用状态时，提示该列为必填项（整体说明） -->
                        <span v-if="!isShow" style='color:red;'>*</span>
                    </template>
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.grade" :placeholder="$t('common.pleaseSelect')" @change="handleFormChange"
                            :disabled="isShow"
                            :class="{ 'el-input--error': !isShow && scope.row.status === 1 && !scope.row.grade }">
                            <el-option v-for="item in gradeMap" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 判断条件列：仅勾选行显示必填*和错误样式 -->
                <el-table-column align="center">
                    <template slot="header">
                        {{ $t('common.judgmentCondition') }}
                        <span v-if="!isShow" style='color:red;'>*</span>
                    </template>
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.compareType" :placeholder="$t('common.pleaseSelect')" @change="handleFormChange"
                            :disabled="isShow"
                            :class="{ 'el-input--error': !isShow && scope.row.status === 1 && !scope.row.compareType }">
                            <el-option v-for="item in compareTypeMap" :key="item.value" :label="item.label"
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 建议值列：仅勾选行显示必填*和错误样式 -->
                <el-table-column align="center">
                    <template slot="header">
                        {{ $t('common.suggestedValue') }}
                        <span v-if="!isShow" style='color:red;'>*</span>
                    </template>
                    <template slot-scope="scope">
                        <el-input-number v-model="scope.row.compareValue" :label="$t('common.descriptionText')" :disabled="isShow"
                            @change="handleFormChange"
                            :class="{ 'el-input--error': !isShow && scope.row.status === 1 && (scope.row.compareValue === undefined || scope.row.compareValue === null) }">
                        </el-input-number>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div style="display: flex; align-items: center;justify-content: center;margin-top: 15px;" v-if="!isShow">
            <el-button type="primary" @click="handleSubmit()">{{ $t('common.confirm') }}</el-button>
            <el-button @click="handleClose" style="margin-left: 8px">{{ $t('common.cancel') }}</el-button>
        </div>
    </div>
</template>

<script>
import { indicatorList, updateTemplateIndicator } from "@/api/inspection";
import { Message } from 'element-ui'

export default {
    name: 'DeviceForm',
    props: {
        visible: { type: Boolean, default: false },
        isShow: { type: Boolean, default: false },
        templateId: { type: Number, default: null },
    },
    data() {
        return {
            searchForm: {
                grade: '',
                metricName: ''
            },
            rules: {},
            tableData: [],
            loading: false,
            // 核心优化：分离展示的已选指标和表格中当前选中的指标
            allSelectedMetrics: new Map(), // key: 指标id，value: 指标完整数据（用于提交和校验）
            gradeMap: [
                { value: 'low', label: this.$t('common.low') },
                { value: 'medium', label: this.$t('common.medium') },
                { value: 'high', label: this.$t('common.high') }
            ],
            compareTypeMap: [
                { value: '1', label: this.$t('common.equalTo') },
                { value: '2', label: this.$t('common.notEqualTo') },
                { value: '3', label: this.$t('common.greaterThan') },
                { value: '4', label: this.$t('common.greaterThanOrEqualTo') },
                { value: '5', label: this.$t('common.lessThan') },
                { value: '6', label: this.$t('common.lessThanOrEqual') }
            ],
            // 新增：用于展示的已选指标（不随筛选变化）
            displaySelectedMetrics: [],
            isFirstLoad: true,
            // 控制表格DOM渲染的开关
            isRendering: false,
            isSettingSelection: false,
        };
    },
    computed: {
        // 计算表格中当前选中的ID集合（仅用于表格状态管理）
        currentSelectedIds() {
            return new Set(this.tableData.filter(row => row.status === 1).map(row => row.id));
        }
    },
    watch: {
        visible: {
            handler(val) {
                if (val) {
                    this.allSelectedMetrics.clear();
                    this.displaySelectedMetrics = [];
                    this.isFirstLoad = true;
                    this.handleSearch();
                } else {
                    this.resetForms();
                }
            },
            immediate: true
        }
    },
    methods: {
        handleClose() {
            this.resetForms();
            this.$emit('close');
        },
        resetForms() {
            this.searchForm = { grade: '', metricName: '' };
            this.allSelectedMetrics.clear();
            this.displaySelectedMetrics = [];
            this.tableData = [];
            this.isFirstLoad = true;
        },
        handleSearch() {
            if (this.loading) return;
            if (!this.templateId) {
                console.log('templateId为空，不执行查询');
                return;
            }

            this.loading = true;
            // 关键1：先销毁表格DOM
            this.isRendering = true;

            const params = {
                pageNo: 1,
                pageSize: 99,
                grade: this.searchForm.grade,
                metricName: this.searchForm.metricName,
                templateId: this.templateId
            };

            indicatorList(params).then((res) => {
                if (res.code === 0) {
                    let newData = res.data.list || [];

                    // 核心修复1：首次加载时，先把接口返回的已选中指标同步到全局缓存和展示列表
                    if (this.isFirstLoad) {
                        newData.forEach(row => {
                            if (row.status === 1) {
                                // 把接口返回的已配置数据完整存入全局缓存
                                const metricData = {
                                    id: row.id,
                                    grade: row.grade || '',
                                    compareType: row.compareType || '',
                                    compareValue: row.compareValue ?? null,
                                    status: 1,
                                    metricName: row.metricName
                                };
                                this.allSelectedMetrics.set(row.id, metricData);
                                
                                // 同时添加到展示列表中（不重复添加）
                                if (!this.displaySelectedMetrics.find(m => m.id === row.id)) {
                                    this.displaySelectedMetrics.push({
                                        id: row.id,
                                        metricName: row.metricName
                                    });
                                }
                            }
                        });
                        this.isFirstLoad = false;
                    }

                    // 核心优化：合并全局缓存的已选指标数据到新表格数据
                    newData = newData.map(row => {
                        // 如果该指标在全局缓存中，用缓存的配置覆盖（保留grade/compareType等）
                        if (this.allSelectedMetrics.has(row.id)) {
                            return {
                                ...row,
                                ...this.allSelectedMetrics.get(row.id),
                                status: 1
                            };
                        }
                        // 不在缓存中，默认status为0（未选中）
                        return { ...row, status: 0 };
                    });

                    // 关键2：等待DOM销毁后，再赋值数据并重建表格
                    setTimeout(() => {
                        this.tableData = newData;
                        // 关键3：重建表格DOM
                        this.isRendering = false;

                        // 关键4：DOM重建后同步选中状态
                        this.$nextTick(() => {
                            this.syncTableSelection();
                        });
                    }, 50); // 50ms确保DOM已销毁
                } else {
                    this.tableData = [];
                    this.allSelectedMetrics.clear();
                    this.displaySelectedMetrics = [];
                    Message.error(res.msg || this.$t('common.queryFailed'));
                    this.isRendering = false; // 失败时也需要重建DOM
                }
            }).catch((error) => {
                console.error('查询出错:', error);
                this.tableData = [];
                this.allSelectedMetrics.clear();
                this.displaySelectedMetrics = [];
                Message.error(this.$t('common.queryError'));
                this.isRendering = false;
            }).finally(() => {
                this.loading = false;
            });
        },
        // 同步选中状态（此时表格是全新DOM，无历史状态干扰）
        syncTableSelection() {
            if (!this.$refs.tableRef || !this.tableData.length) return;

            console.log('syncTableSelection被调用，当前全局选中ID:', Array.from(this.allSelectedMetrics.keys()));

            // 设置标志位，避免触发handleSelectionChange
            this.isSettingSelection = true;

            // 先清空选择
            this.$refs.tableRef.clearSelection();

            // 然后设置所有选中项（从全局缓存中获取）
            this.tableData.forEach(row => {
                const isSelected = this.allSelectedMetrics.has(row.id);
                if (isSelected) {
                    this.$refs.tableRef.toggleRowSelection(row, true);
                    console.log(`syncTableSelection: 设置行${row.id}为选中状态`);
                }
            });

            // 延迟清除标志位，确保选择事件已处理完成
            this.$nextTick(() => {
                this.isSettingSelection = false;
                console.log('syncTableSelection: 完成设置，清除isSettingSelection标志');
            });
        },
        handleSelectionChange(selection) {
            // 如果是程序自动设置选中状态，则不执行操作
            if (this.isSettingSelection) {
                console.log('handleSelectionChange: 程序自动设置中，跳过');
                return;
            }

            console.log('handleSelectionChange被调用:', selection);

            // 构建当前表格中选中的ID集合
            const currentSelectedIds = new Set(selection.map(item => item.id));

            // 处理当前表格中未选中的行：从全局缓存和展示列表中移除
            this.tableData.forEach(row => {
                if (!currentSelectedIds.has(row.id)) {
                    this.allSelectedMetrics.delete(row.id);
                    // 同时从展示列表中移除
                    this.displaySelectedMetrics = this.displaySelectedMetrics.filter(metric => metric.id !== row.id);
                }
            });

            // 处理当前表格中选中的行：更新到全局缓存
            selection.forEach(row => {
                // 如果全局缓存中已有，更新数据；否则添加
                if (this.allSelectedMetrics.has(row.id)) {
                    const existingMetric = this.allSelectedMetrics.get(row.id);
                    this.allSelectedMetrics.set(row.id, {
                        ...existingMetric,
                        grade: row.grade || existingMetric.grade,
                        compareType: row.compareType || existingMetric.compareType,
                        compareValue: row.compareValue ?? existingMetric.compareValue,
                        status: 1
                    });
                } else {
                    this.allSelectedMetrics.set(row.id, {
                        id: row.id,
                        grade: row.grade || '',
                        compareType: row.compareType || '',
                        compareValue: row.compareValue ?? null,
                        status: 1,
                        metricName: row.metricName
                    });
                    
                    // 同时添加到展示列表中（不重复添加）
                    if (!this.displaySelectedMetrics.find(m => m.id === row.id)) {
                        this.displaySelectedMetrics.push({
                            id: row.id,
                            metricName: row.metricName
                        });
                    }
                }
            });

            // 更新表格数据的status字段
            this.tableData.forEach(row => {
                row.status = this.allSelectedMetrics.has(row.id) ? 1 : 0;
            });

            console.log('当前全局缓存已选指标:', Array.from(this.allSelectedMetrics.entries()));
            console.log('当前展示的已选指标:', this.displaySelectedMetrics);
        },
        handleFormChange() {
            // 核心优化：同步修改后的数据到全局缓存
            this.tableData.forEach(row => {
                if (this.allSelectedMetrics.has(row.id)) {
                    const existingMetric = this.allSelectedMetrics.get(row.id);
                    this.allSelectedMetrics.set(row.id, {
                        ...existingMetric,
                        grade: row.grade || existingMetric.grade,
                        compareType: row.compareType || existingMetric.compareType,
                        compareValue: row.compareValue ?? existingMetric.compareValue
                    });
                }
            });
        },
        // 删除已选指标标签
        removeMetric(id) {
            console.log('删除指标ID:', id);

            // 从全局缓存中移除
            this.allSelectedMetrics.delete(id);

            // 从展示列表中移除
            this.displaySelectedMetrics = this.displaySelectedMetrics.filter(metric => metric.id !== id);

            // 如果当前表格中有该行，更新其状态并取消选中
            const currentRow = this.tableData.find(row => row.id === id);
            if (currentRow) {
                currentRow.status = 0;
                
                // 取消表格行的选中状态
                if (this.$refs.tableRef) {
                    this.$refs.tableRef.toggleRowSelection(currentRow, false);
                }
            }

            console.log('删除后全局缓存:', Array.from(this.allSelectedMetrics.entries()));
            console.log('删除后展示的已选指标:', this.displaySelectedMetrics);
        },
        // 优化：全局必填校验方法（校验所有缓存的已选指标）
        validateTableFields() {
            // 核心优化：校验全局缓存中的所有已选指标
            const selectedRows = Array.from(this.allSelectedMetrics.values());
            if (selectedRows.length === 0) {
                Message.warning(this.$t('common.pleaseSelectAtLeastOneMetricBeforeSubmitting'));
                return false;
            }

            let isValid = true;
            let errorMsg = '';

            // 遍历所有已选指标，逐个校验三个必填字段
            for (const row of selectedRows) {
                // 校验异常级别
                if (!row.grade) {
                    isValid = false;
                    errorMsg = this.$t('common.abnormalLevelCannotBeEmpty', { metricName: row.metricName });
                    break;
                }
                // 校验判断条件
                if (!row.compareType) {
                    isValid = false;
                    errorMsg = this.$t('common.judgmentConditionCannotBeEmpty', { metricName: row.metricName });
                    break;
                }
                // 校验建议值（排除undefined/null，支持0值）
                if (row.compareValue === undefined || row.compareValue === null) {
                    isValid = false;
                    errorMsg = this.$t('common.suggestedValueCannotBeEmpty', { metricName: row.metricName });
                    break;
                }
            }

            // 校验不通过时弹出错误提示
            if (!isValid) {
                Message.error(errorMsg);
                return false;
            }

            return true;
        },
        handleSubmit() {
            // 第一步：执行必填校验，不通过则阻止提交
            if (!this.validateTableFields()) {
                return;
            }

            // 核心修改：所有指标都上传，只是根据选中状态设置不同的status值
            const params = {
                itemList: this.tableData.map(row => {
                    // 检查该指标是否在全局缓存中（已选中）
                    if (this.allSelectedMetrics.has(row.id)) {
                        const cachedMetric = this.allSelectedMetrics.get(row.id);
                        return {
                            id: row.id,
                            grade: cachedMetric.grade,
                            compareType: cachedMetric.compareType,
                            compareValue: cachedMetric.compareValue,
                            status: 1 // 选中状态
                        };
                    } else {
                        // 未选中的指标，status为0
                        return {
                            id: row.id,
                            grade: row.grade || '',
                            compareType: row.compareType || '',
                            compareValue: row.compareValue ?? null,
                            status: 0 // 未选中状态
                        };
                    }
                })
            };

            console.log('提交给后端的参数:', params);

            updateTemplateIndicator(params).then((res) => {
                if (res && res.code === 0) {
                    Message.success(this.$t('common.saveSuccess'));
                    this.$emit('close');
                } else {
                    Message.error(res.msg || this.$t('common.saveFailed'));
                }
            }).catch(() => {
                Message.error(this.$t('common.saveFailed'));
            });
        },
        handleReset() {
            this.searchForm = { grade: '', metricName: '' };
            // 重置时保留全局缓存和展示列表，仅清空当前表格的选中状态
            this.handleSearch();
        },
        // 控制表格行是否可选择
        isSelectable(row, index) {
            // 当isShow为true时（模板已被使用），不允许选择
            return !this.isShow;
        }
    }
};
</script>

<style scoped lang="less">
:deep(.el-input-number--medium) {
    width: 150px;
}

:deep(.el-table__row--selected) {
    background-color: #f5fafe !important;
}

.no-selected-metrics {
    padding: 0 15px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    color: #909399;
    background-color: #f5f7fa;
}

// 新增：必填项为空时的错误样式（与Element UI默认错误样式一致）
:deep(.el-input--error) {
    .el-input__inner {
        border-color: #f56c6c !important;
        box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.2) !important;
    }
    .el-input-number__decrease,
    .el-input-number__increase {
        border-color: #f56c6c !important;
    }
}

// 修复表格列标题红色*的样式
:deep(.el-table .el-table-column__label) {
    span[style="color:red;"] {
        margin-left: 2px;
    }
}
</style>