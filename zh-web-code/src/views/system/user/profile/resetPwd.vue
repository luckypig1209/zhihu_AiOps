<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item :label="$t('userProfile.form.username')" prop="username">
      <el-input :disabled="true" v-model="userInfo.username" :placeholder="$t('userProfile.form.username')" />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.oldPassword')" prop="oldPassword">
      <el-input v-model="user.oldPassword" :placeholder="$t('userProfile.form.oldPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.newPassword')" prop="newPassword">
      <el-input v-model="user.newPassword" :placeholder="$t('userProfile.form.newPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item :label="$t('userProfile.form.confirmPassword')" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" :placeholder="$t('userProfile.form.confirmPassword')" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">{{ $t('userProfile.button.save') }}</el-button>
      <el-button type="danger" size="mini" @click="close">{{ $t('userProfile.button.close') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserPwd, newUpdateUserPwd } from "@/api/system/user";
import {aesEncrypt} from "@/utils/ase";

export default {
  props: {
    userInfo: {
      type: Object
    }
  },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error(this.$t('userProfile.validation.confirmPasswordMatch')));
      } else {
        callback();
      }
    };
    const strongPassword = (rule, value, callback) => {
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`^_{}+="',~.\())@$!%*?&])[A-Za-z\d`^_{}+="',~.\())@$!%*?&]{8,}$/;
      if (strongRegex.test(value)) {
        return callback()
      }
      return callback(new Error(this.$t('userProfile.validation.newPasswordStrong')))
    }
    return {
      test: "1test",
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        oldPassword: [
          { required: true, message: this.$t('userProfile.validation.oldPassword'), trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: this.$t('userProfile.validation.newPassword'), trigger: "blur" },
          { min: 8, max: 20, message: this.$t('userProfile.validation.newPasswordLength'), trigger: "blur" },
          { validator: strongPassword, trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: this.$t('userProfile.validation.confirmPassword'), trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          newUpdateUserPwd(this.userInfo.username, aesEncrypt(this.user.oldPassword), aesEncrypt(this.user.newPassword)).then(
            response => {
              this.$modal.msgSuccess(this.$t('userProfile.message.saveSuccess'));
            }
          );
        }
      });
    },
    close() {
      this.$tab.closePage();
    }
  }
};
</script>
