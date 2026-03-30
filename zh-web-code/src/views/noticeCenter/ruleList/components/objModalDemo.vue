<template>
    <a-drawer :title="rowData?.id ? '编辑通知对象' : '新增通知对象'" :visible="showModal" width="1080px" placement="right"
        :closable="true" :mask-closable="false" @close="cancel" style="z-index: 4000;">
        <div style="height: 80vh;overflow-y: auto;">
            <el-form ref="form" :model="form" :rules="rules" label-width="120px">
                <div>
                    <el-row>
                        <!-- 通知对象 -->
                        <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item label="通知对象" prop="groupName">
                                <el-input v-model="form.groupName" placeholder="请输入通知对象" clearable
                                    style="width: 100%;" />
                                <!-- <a-input v-model="form.groupName" placeholder="请输入通知对象" allowClear style="width: 100%;" /> -->
                            </el-form-item>
                        </el-col>

                        <!-- 通知方式单选（保持channelString数组类型） -->
                        <el-col :span="20" style="margin-bottom: 20px;">
                            <el-form-item label="通知方式" prop="channelString">
                                <el-radio-group v-model="selectedChannel" @change="handleChannelChange" size="medium">
                                    <el-radio-button label="dd">钉钉</el-radio-button>
                                    <el-radio-button label="qywx">企业微信</el-radio-button>
                                    <el-radio-button label="szh">电信集约化服务台</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>

                        <!-- 配置区域（div布局统一风格） -->
                        <el-col :span="24">
                            <!-- 钉钉配置 -->
                            <div class="notice-config-section" v-if="form.channelString.includes('dd')">
                                <div class="section-title">{{ getNoticeLabel('dd') }}配置</div>
                                <el-form :model="noticeTemplates.dd" label-width="10px">
                                    <el-row v-for="(item, index) in noticeTemplates.dd.value" :key="index" gutter="16"
                                        style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                                        <el-row type="flex" align="middle">
                                            <!-- Webhook URL输入框 -->
                                            <el-col :span="16">
                                                <el-form-item :prop="`noticeTemplates.dd.value[${index}].webhookUrl`"
                                                    :rules="{ required: true, message: '请输入Webhook地址', trigger: 'blur' }">
                                                    <el-input v-model="item.webhookUrl"
                                                        placeholder="请输入钉钉机器人Webhook地址（例如：https://oapi.dingtalk.com/robot/send?access_token=xxx）"
                                                        clearable maxlength="200" />
                                                </el-form-item>
                                            </el-col>
                                            <!-- 删除按钮 -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button type="danger" ghost
                                                        @click="removeCondition('dd', index)">删除</a-button>
                                                </el-form-item>
                                            </el-col>
                                            <!-- 新增按钮（仅第一行显示） -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button type="primary" ghost v-if="index === 0"
                                                        @click="addCondition('dd')">新增</a-button>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                        <!-- 加签密钥区域 -->
                                        <el-row type="flex" align="middle" style="margin-top: 8px;">
                                            <el-col :span="8">
                                                <el-form-item label=" " style="margin-bottom: 0;">
                                                    <el-switch v-model="item.showSecret" active-text="启用加密方式"
                                                        inactive-text="禁用加密方式"
                                                        style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-form-item v-if="item.showSecret"
                                                    :prop="`noticeTemplates.dd.value[${index}].secret`" :rules="[
                                                        { max: 100, message: '密钥长度不超过100个字符', trigger: 'blur' },
                                                        { required: true, message: '请输入加签密钥', trigger: 'blur' }
                                                    ]">
                                                    <el-input class="inputIcon" v-model="item.secret"
                                                        placeholder="请输入钉钉机器人加签密钥" clearable maxlength="100"
                                                        show-password />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-row>
                                </el-form>
                            </div>

                            <!-- 企业微信配置 -->
                            <div class="notice-config-section" v-if="form.channelString.includes('qywx')">
                                <div class="section-title">{{ getNoticeLabel('qywx') }}配置</div>
                                <el-form :model="noticeTemplates.qywx" label-width="10px">
                                    <el-row v-for="(item, index) in noticeTemplates.qywx.value" :key="index" gutter="16"
                                        style="border-bottom: 1px solid #eee; margin-bottom: 10px; padding-bottom: 10px;">
                                        <el-row type="flex" align="middle">
                                            <!-- Webhook URL输入框 -->
                                            <el-col :span="16">
                                                <el-form-item :prop="`noticeTemplates.qywx.value[${index}].webhookUrl`"
                                                    :rules="{ required: true, message: '请输入Webhook地址', trigger: 'blur' }">
                                                    <el-input v-model="item.webhookUrl"
                                                        placeholder="请输入企业微信应用推送地址（例如：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx）"
                                                        clearable maxlength="200" />
                                                </el-form-item>
                                            </el-col>
                                            <!-- 删除按钮 -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button type="danger" ghost
                                                        @click="removeCondition('qywx', index)">删除</a-button>
                                                </el-form-item>
                                            </el-col>
                                            <!-- 新增按钮（仅第一行显示） -->
                                            <el-col :span="2">
                                                <el-form-item>
                                                    <a-button type="primary" ghost v-if="index === 0"
                                                        @click="addCondition('qywx')">新增</a-button>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                        <!-- 加签密钥区域 -->
                                        <el-row type="flex" align="middle" style="margin-top: 8px;">
                                            <el-col :span="8">
                                                <el-form-item label=" " style="margin-bottom: 0;">
                                                    <el-switch v-model="item.showSecret" active-text="启用加密方式"
                                                        inactive-text="禁用加密方式"
                                                        style="--el-switch-on-color: #1890ff; --el-switch-off-color: #e5e7eb;margin-top: -20px;" />
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="8">
                                                <el-form-item v-if="item.showSecret"
                                                    :prop="`noticeTemplates.qywx.value[${index}].secret`" :rules="[
                                                        { max: 100, message: '密钥长度不超过100个字符', trigger: 'blur' },
                                                        { required: true, message: '请输入加签密钥', trigger: 'blur' }
                                                    ]">
                                                    <el-input class="inputIcon" v-model="item.secret"
                                                        placeholder="请输入企业微信应用加签密钥" clearable maxlength="100"
                                                        show-password />
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-row>
                                </el-form>
                            </div>

                            <!-- 电信集约化服务台配置 -->
                            <div class="notice-config-section" v-if="form.channelString.includes('szh')">
                                <div class="section-title">{{ getNoticeLabel('szh') }}配置</div>
                                <el-form :model="noticeTemplates.szh" label-width="10px">
                                    <div style="padding: 10px 0; color: #666;">
                                        电信集约化服务台无需再额外配置，后台已配置控制
                                    </div>
                                </el-form>
                            </div>
                        </el-col>

                        <!-- 备注输入框（优化：确保prop与form字段对应，支持编辑） -->
                        <el-col :span="20" style="margin-bottom: 20px; margin-top: 10px;">
                            <el-form-item label="备注信息" prop="remark">
                                <el-input type="textarea" :rows="3" v-model="form.remark"
                                    placeholder="请输入备注信息（可选）"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
        </div>

        <!-- 底部按钮 -->
        <div class="dialog-footer">
            <el-button type="primary" @click="handleSubmit('form')" :loading="isSubmitDisabled">确 定</el-button>
            <el-button @click="cancel" :disabled="isSubmitDisabled">取 消</el-button>
        </div>
    </a-drawer>
</template>

<script>
import { saveNotificationGroup, getNotificationGroupDetail } from "@/api/notice/notice";

export default {
    name: "NoticeConfigForm",
    props: {
        rowData: { // 编辑场景传参：回显数据（含id）
            type: Object,
            default: () => ({}) // 初始化为空对象，避免undefined
        },
        opt: { // 兼容原有传参，实际已用动态标题替代，可后续删除
            type: String,
            default: "新增通知对象"
        }
    },
    data() {
        return {
            userOptions: [],
            isSubmitDisabled: false,
            showModal: false,
            loading: false,
            selectedChannel: "", // 单选绑定值（中转用）

            // 优化2：form明确初始化所有字段（含remark），确保响应式
            form: {
                groupName: "",
                channelString: [], // 格式：['dd']/['qywx']/['szh']
                remark: "", // 关键：初始化remark字段，解决编辑无响应问题
            },

            // 通知模板配置
            noticeTemplates: {
                dd: {
                    key: "dd",
                    value: [{ webhookUrl: "", secret: "", showSecret: false }],
                    label: "钉钉"
                },
                qywx: {
                    key: "qywx",
                    value: [{ webhookUrl: "", secret: "", showSecret: false }],
                    label: "企业微信"
                },
                szh: { key: "szh", value: [{ name: "", code: "" }], label: "电信集约化服务台" }
            },

            inputValue: "", // 标签输入值（预留扩展）

            // 表单校验规则
            rules: {
                groupName: [
                    { required: true, message: "请填写通知对象名称", trigger: ["blur", "change", "input"] }
                ],
                channelString: [
                    { required: true, message: "请至少选择一种通知方式", trigger: ["blur", "change"] }
                ]
            }
        };
    },
    watch: {
        showModal(val) {
            if (val) {
                // 弹窗显示：重置模板 + 初始化数据
                this.resetNoticeTemplates();
                this.init(this.rowData);
            } else {
                // 弹窗关闭：重置所有状态（含remark）
                this.form = { groupName: "", channelString: [], remark: "" };
                this.selectedChannel = "";
                this.$refs.form?.resetFields();
                this.isSubmitDisabled = false;
                this.inputValue = "";
            }
        }
    },
    methods: {
        // 重置通知模板
        resetNoticeTemplates() {
            Object.keys(this.noticeTemplates).forEach(key => {
                if (key === "dd" || key === "qywx") {
                    this.noticeTemplates[key].value = [{ webhookUrl: "", secret: "", showSecret: false }];
                } else if (key === "szh") {
                    this.noticeTemplates[key].value = [{ name: "", code: "" }];
                }
            });
        },

        // 获取通知方式中文标签
        getNoticeLabel(key) {
            return this.noticeTemplates[key]?.label || key;
        },

        // 单选切换：同步到form.channelString数组
        handleChannelChange(val) {
            this.form.channelString = val ? [val] : [];
            // 手动触发表单字段验证，解决选择后错误提示不关闭的问题
            this.$nextTick(() => {
                this.$refs.form?.validateField('channelString');
            });
        },

        // 新增配置项
        addCondition(key) {
            if (key === "dd" || key === "qywx") {
                this.noticeTemplates[key].value.push({
                    webhookUrl: "",
                    secret: "",
                    showSecret: false
                });
            } else if (key === "szh") {
                this.noticeTemplates[key].value.push({ name: "", code: "" });
            }
        },

        // 删除配置项（至少保留1个）
        removeCondition(key, index) {
            const template = this.noticeTemplates[key];
            if (template.value.length <= 1) {
                this.$message.warning(`至少配置一个${this.getNoticeLabel(key)}信息`);
                return;
            }
            template.value.splice(index, 1);
        },

        // 初始化表单（编辑场景回显）
        init(row) {
            if (!row?.id) { // 新增场景：row无id
                // this.$refs.form?.resetFields();
                this.form = { groupName: "", channelString: [], remark: "" };
            } else { // 编辑场景：有id才调用详情接口
                this.getNotificationGroupDetail();
            }
        },

        // 编辑场景：获取详情并回显（优化3：JSON解析容错+remark回显）
        getNotificationGroupDetail() {
            const data = { id: this.rowData.id };
            // 真实项目保留接口调用，此处用mock演示
            // getNotificationGroupDetail(data).then(res => { ... })
            const mockRes = {
                status: 200,
                message: "Success",
                data: this.rowData
            };

            if (mockRes.status === 200) {
                const detail = mockRes.data;
                // 优化：try-catch处理JSON解析，避免格式错误导致报错
                let channelString = [];
                let channelParam = {};
                try {
                    channelString = detail.channelString ? JSON.parse(detail.channelString) : [];
                    channelParam = detail.channelParam ? JSON.parse(detail.channelParam) : {};
                } catch (e) {
                    console.error("JSON解析错误：", e);
                    this.$message.error("数据格式异常，请刷新重试");
                    return;
                }

                // 1. 回显基础表单（含remark）
                this.form.groupName = detail.groupName || "";
                this.form.remark = detail.remark || ""; // 关键：回显备注，支持编辑
                this.form.channelString = channelString;
                this.selectedChannel = channelString[0] || "";

                // 2. 回显通知配置
                if (channelParam) {
                    Object.keys(channelParam).forEach(key => {
                        if (this.noticeTemplates[key]) {
                            this.noticeTemplates[key].value = channelParam[key].map(item => ({
                                ...item,
                                showSecret: !!item.secret // 有secret自动打开加签
                            }));
                        }
                    });
                }
            }
        },

        // 取消操作
        cancel() {
            this.showModal = false;
        },

        // 提交表单
        handleSubmit(formName) {
            this.$refs[formName].validate(valid => {
                if (!valid) return;

                // 额外校验配置项合法性
                const noticeValid = this.form.channelString.every(key => {
                    return this.noticeTemplates[key].value.every(item => {
                        if (key === "dd" || key === "qywx") {
                            return item.webhookUrl.trim() !== "" && (!item.showSecret || item.secret.trim() !== "");
                        }
                        return true; // 电信集约化服务台无需校验
                    });
                });

                if (!noticeValid) {
                    this.$message.error("请完善所有选中通知类型的配置信息");
                    return;
                }

                // 组装提交数据
                const submitData = {
                    ...this.form,
                    id: this.rowData?.id || undefined, // 编辑传id，新增不传
                    channelParam: {}
                };
                this.form.channelString.forEach(key => {
                    submitData.channelParam[key] = [...this.noticeTemplates[key].value];
                });

                // 提交接口
                this.isSubmitDisabled = true;
                saveNotificationGroup(submitData)
                    .then(res => {
                        this.isSubmitDisabled = false;
                        if (res.data) {
                            this.$modal.msgSuccess("通知配置保存成功");
                            this.showModal = false;
                            this.$emit("refreshList"); // 通知父组件刷新列表
                        } else {
                            this.$modal.msgError(res.message || "保存失败");
                        }
                    })
                    .catch(error => {
                        this.isSubmitDisabled = false;
                        // this.$modal.msgError("通知配置保存失败");
                        console.error("提交错误：", error);
                    });
            });
        },

        // 标签操作方法（预留扩展，当前未使用）
        handleClose(tag, index, type = "notice") {
            const targetArr = this.noticeTemplates[type]?.value || [];
            if (targetArr[index]?.dynamicTags) {
                targetArr[index].dynamicTags.splice(targetArr[index].dynamicTags.indexOf(tag), 1);
                this.$forceUpdate();
            }
        },
        showInput(index, type = "notice") {
            const targetArr = this.noticeTemplates[type]?.value || [];
            if (targetArr[index]) {
                targetArr[index].inputVisible = true;
                this.$nextTick(() => {
                    this.$refs.saveTagInput?.$refs.input?.focus();
                });
            }
        },
        handleInputConfirm(index, type = "notice") {
            const targetArr = this.noticeTemplates[type]?.value || [];
            if (targetArr[index] && this.inputValue.trim()) {
                if (!targetArr[index].dynamicTags) targetArr[index].dynamicTags = [];
                targetArr[index].dynamicTags.push(this.inputValue.trim());
                targetArr[index].rightValue = targetArr[index].dynamicTags.join(",");
                targetArr[index].inputVisible = false;
                this.inputValue = "";
            }
        }
    }
};
</script>

<style scoped lang="less">
/* 配置区域样式 */
.notice-config-section {
    margin: 0 40px 20px;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fff;
}

/* 配置区域标题样式 */
.section-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f2f2f2;
}

/* 标签相关样式（预留） */
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

/* 步骤条样式（预留） */
.el-steps {
    margin-bottom: 20px;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
    text-align: right;
    margin-top: 20px;

    :deep(.el-button) {
        margin-left: 8px;
    }
}

/* 行布局对齐样式 */
:deep(.el-row--flex) {
    align-items: center;
}

/* 错误提示样式 */
:deep(.el-form-item__error) {
    font-size: 12px;
    color: #ff4d4f;
    background-color: #fef0f0;
    padding: 2px 5px;
    border-radius: 3px;
}

/* 抽屉滚动优化 */
:deep(.ant-drawer-wrapper-body) {
    overflow: hidden;
}

/* 开关样式微调 */
:deep(.el-switch__label) {
    font-size: 12px;
    padding: 0 8px;
}

.inputIcon {
    :deep(.el-input__inner) {
        padding-right: 60px;
    }
}
</style>