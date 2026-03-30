<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item :label="$t('userProfile.form.nickname')" prop="nickName">
      <el-input v-model="user.nickname" />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.mobile')" prop="mobile">
      <el-input v-model="user.mobile" maxlength="11" />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.email')" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.gender')">
      <el-radio-group v-model="user.sex">
        <el-radio :label="1">{{ $t('userProfile.form.male') }}</el-radio>
        <el-radio :label="2">{{ $t('userProfile.form.female') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{ $t('userProfile.button.save') }}</el-button>
      <el-button type="danger" size="mini" @click="close">{{ $t('userProfile.button.close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/system/user";

export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      // 表单校验
      rules: {
        nickname: [
          { required: true, message: this.$t('userProfile.validation.nickname'), trigger: "blur" }
        ],
        email: [
          { required: true, message: this.$t('userProfile.validation.email'), trigger: "blur" },
          {
            type: "email",
            message: this.$t('userProfile.validation.emailFormat'),
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          { required: true, message: this.$t('userProfile.validation.mobile'), trigger: "blur" },
          {
            pattern: /^1[3|456789][0-9]\d{8}$/,
            message: this.$t('userProfile.validation.mobileFormat'),
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateUserProfile(this.user).then(response => {
            this.$modal.msgSuccess(this.$t('userProfile.message.saveSuccess'));
          });
        }
      });
    },
    close() {
      this.$tab.closePage();
    }
  }
};
</script>
