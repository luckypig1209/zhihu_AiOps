<!-- @format -->
<template xmlns="">
  <div class="cyber-login-container" v-if="!($route.query && $route.query.code && $route.query.code == 'portal')">
    <!-- 科技感背景元素 -->
    <div class="cyber-background">
      <div class="cyber-grid"></div>
      <div class="cyber-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="cyber-lines">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>
    </div>

    <!-- 登录内容 -->
    <div class="cyber-login-content">
      <!-- 顶部logo -->
      <div class="cyber-logo-box">
        <div class="logo-icon">
          <img :src="logoImg" alt="">
          <!--          <img src="@/assets/zhihu/zh.png" alt="智护" />-->
          <div class="logo-glow"></div>
        </div>
        <span class="logo-text">{{ sysLoginPageName }}</span>
      </div>

      <!-- 登录卡片 -->
      <div class="cyber-login-card">
        <div class="card-glow"></div>
        <div class="card-inner">
          <!-- 标题区域 -->
          <div class="cyber-title-box">
            <div class="title-main">{{ $t('login.title.main') }}</div>
            <div class="title-sub">{{ $t('login.title.sub') }}</div>
            <div class="title-underline"></div>
          </div>

          <!-- 表单区域 -->
          <el-tabs class="cyber-tabs" v-model="loginForm.loginType" style="float: none">
            <el-tab-pane :label="$t('login.tab.uname')" name="uname"></el-tab-pane>
          </el-tabs>

          <el-form ref="loginForm" :model="loginForm" :rules="LoginRules" class="cyber-login-form">
            <!-- 租户输入框 -->
            <el-form-item prop="tenantName" v-if="tenantEnable">
              <div class="input-container">
                <div class="input-icon">
                  <img src="../assets/images/login/tenant.png" alt="" />
                </div>
                <el-input v-model="loginForm.tenantName" type="text" auto-complete="off" :placeholder="$t('login.placeholder.tenant')"
                  class="cyber-input"></el-input>
                <div class="input-underline"></div>
              </div>
            </el-form-item>

            <!-- 账号密码登录 -->
            <div v-if="loginForm.loginType === 'uname'">
              <el-form-item prop="username">
                <div class="input-container">
                  <div class="input-icon">
                    <img src="../assets/images/login/user.png" alt="" />
                  </div>
                  <el-input v-model="loginForm.username" type="text" auto-complete="off" :placeholder="$t('login.placeholder.username')"
                    class="cyber-input"></el-input>
                  <div class="input-underline"></div>
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="input-container">
                  <div class="input-icon">
                    <img src="../assets/images/login/password.png" alt="" />
                  </div>
                  <el-input v-model="loginForm.password" type="password" auto-complete="off" :placeholder="$t('login.placeholder.password')"
                    @keyup.enter.native="getCode" class="cyber-input" show-password></el-input>
                  <div class="input-underline"></div>
                </div>
              </el-form-item>

              <div class="cyber-options">
                <el-checkbox v-model="loginForm.rememberMe" class="cyber-checkbox">
                  {{ $t('login.options.rememberMe') }}
                </el-checkbox>
                <div class="option-links">
<!--                  <span @click="resetPwdModel = true">重置密码</span>-->
                  <span @click="checkLicense">{{ $t('login.options.license') }}</span>
                </div>
              </div>
            </div>

            <!-- 登录按钮 -->
            <el-form-item style="width: 100%">
              <el-button :loading="loading" class="cyber-login-btn" @click="getCode">
                <span class="btn-text" v-if="!loading">{{ $t('login.button.login') }}</span>
                <span class="btn-text" v-else>{{ $t('login.button.logging') }}</span>
                <div class="btn-gradient"></div>
                <div class="btn-glow"></div>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 版本信息 -->
      <div class="version">{{ versionCode }}</div>
    </div>

    <!-- 图形验证码组件 -->
    <Verify ref="verify" :captcha-type="'blockPuzzle'" :img-size="{ width: '400px', height: '200px' }"
      @success="handleLogin" />

    <!-- License弹窗 -->
    <UpdateLicense :dialogLicenseVisible="dialogLicenseVisible" :licenseData="licenseData" @license="licenseTime">
    </UpdateLicense>

    <!-- 重置密码弹窗 -->
    <a-modal title="重置密码" v-model="resetPwdModel" width="800px" :mask-closable="false" class="cyber-modal">
      <el-form ref="form" :model="user" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" placeholder="请输入用户名" class="cyber-input" />
        </el-form-item>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password class="cyber-input" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password class="cyber-input" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="user.confirmPassword" placeholder="请确认密码" type="password" show-password
            class="cyber-input" />
        </el-form-item>
      </el-form>
      <div slot="footer" style="text-align: center">
        <button class="cyber-btn primary" @click="submit">保存</button>
        <button class="cyber-btn danger" @click="close">关闭</button>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { getTenantIdByName } from "@/api/system/tenant";
import { SystemUserSocialTypeEnum } from "@/utils/constants";
import { getCaptchaEnable, getTenantEnable } from "@/utils/ruoyi";
import {
  getPassword,
  getRememberMe,
  getTenantName,
  getUsername,
  removePassword,
  removeRememberMe,
  removeTenantName,
  removeUsername,
  setPassword,
  setRememberMe,
  setTenantId,
  setTenantName,
  setUsername,
} from "@/utils/auth";
import {
  getActiveVersion,
  getLicenseInfo,
  getLicenseVerify,
  getSsoTokenAPI,
} from "@/api/login";
import {
  getDefaultI18nConfig,
} from "@/api/i18n";
import store from "@/store";
import Verify from "@/components/Verifition/Verify";
// import dragIcon from "@/views/alImg";
import { newUpdateUserPwd } from "@/api/system/user";
import UpdateLicense from "./components/updateLicense.vue";
import { aesEncrypt } from "@/utils/ase";
import { getLogoGlobalConfig } from "@/api/system/globalConfig";
export default {
  name: "Login",
  components: {
    Verify,
    // dragIcon,
    UpdateLicense,
  },
  computed: {
    // sysLoginPageName() {
    //   return localStorage.getItem("sysLoginPageName") || (this.$t && this.$t('common.systemGlobalConfig.default.sysLoginPageName')) || '服务决定产品价值';
    // },
    // sysMenuPageName() {
    //   return localStorage.getItem("sysMenuPageName") || (this.$t && this.$t('common.appShortTitle')) || '智护';
    // },
    pageWidth() {
      return window.innerWidth
    }
  },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error(this.$t('login.validation.passwordConfirm')));
      } else {
        callback();
      }
    };
    const strongPassword = (rule, value, callback) => {
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`^_{}+="',~.())@$!%*?&])[A-Za-z\d`^_{}+="',~.())@$!%*?&]{8,}$/;
      if (strongRegex.test(value)) {
        return callback()
      }
      return callback(new Error(this.$t('login.validation.passwordStrength')))
    }
    return {
      logoImg: localStorage.getItem('sysIconUrl') || require('@/assets/zhihu/zh.png'),
      name: this.sysLoginPageName,
      sysLoginPageName: localStorage.getItem("sysLoginPageName") || (this.$t && this.$t('common.systemGlobalConfig.default.sysLoginPageName')) || '服务决定产品价值',
      sysMenuPageName: localStorage.getItem("sysMenuPageName") || (this.$t && this.$t('common.appShortTitle')) || '智护',
      codeUrl: "",
      captchaEnable: true,
      tenantEnable: true,
      mobileCodeTimer: 0,
      versionCode: "",
      loginForm: {
        // loginType: "uname",
        // username: "admin",
        // password: "admin123",
        // captchaVerification: "",
        // mobile: "",
        // mobileCode: "",
        // rememberMe: false,
        // tenantName: "演示",
        loginType: "uname",
        username: "",
        password: "",
        captchaVerification: "",
        mobile: "",
        mobileCode: "",
        rememberMe: false,
        tenantName: "",
        isOverTime: false,
      },
      scene: 21,
      dialogLicenseVisible: false,
      licenseData: "",
      LoginRules: {
        username: [{ required: true, trigger: "blur", message: this.$t('login.validation.username') }],
        password: [{ required: true, trigger: "blur", message: this.$t('login.validation.password') }],
        mobile: [
          { required: true, trigger: "blur", message: this.$t('login.validation.mobile') },
          {
            validator: function (rule, value, callback) {
              if (
                /^(?:(?:\+|00)86)?1(?:3[\d]|4[5-79]|5[0-35-9]|6[5-7]|7[0-8]|8[\d]|9[189])\d{8}$/.test(
                  value
                ) === false
              ) {
                callback(new Error(this.$t('login.validation.mobileFormat')));
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
        tenantName: [
          { required: true, trigger: "blur", message: this.$t('login.validation.tenant') },
          {
            validator: (rule, value, callback) => {
              // debugger
              getTenantIdByName(value).then((res) => {
                const tenantId = res.data;
                if (tenantId && tenantId >= 0) {
                  // 设置租户
                  setTenantId(tenantId);
                  callback();
                } else {
                  callback(this.$t('login.validation.tenantExist'));
                }
              });
            },
            trigger: "blur",
          },
        ],
      },
      loading: false,
      redirect: undefined,
      // 枚举
      SysUserSocialTypeEnum: SystemUserSocialTypeEnum,
      resetPwdModel: false,
      user: {
        username: undefined,
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        username: [
          { required: true, message: this.$t('user.usernameRequired'), trigger: "blur" }
        ],
        oldPassword: [
          { required: true, message: this.$t('user.oldPassword'), trigger: "blur" }
        ],
        newPassword: [
          { required: true, message: this.$t('user.newPassword'), trigger: "blur" },
          { min: 8, max: 20, message: this.$t('user.passwordLength'), trigger: "blur" },
          { validator: strongPassword, trigger: "blur" }
        ],
        confirmPassword: [
          { required: true, message: this.$t('user.confirmPassword'), trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getDefaultI18nConfig();
    this.getLogoConfig();
    this.getActiveVersion();
    this.licenseTime();  //lince暂时隐藏
    // 租户开关
    this.tenantEnable = getTenantEnable();
    if (this.tenantEnable) {
      getTenantIdByName(this.loginForm.tenantName).then((res) => {
        // 设置租户
        const tenantId = res.data;
        if (tenantId && tenantId >= 0) {
          setTenantId(tenantId);
        }
      });
    }
    // 验证码开关
    this.captchaEnable = getCaptchaEnable();
    // 重定向地址
    this.redirect = this.$route.query.redirect
      ? decodeURIComponent(this.$route.query.redirect)
      : undefined;
    this.getCookie();
    //三方登录
    if (
      this.$route.query &&
      this.$route.query.code &&
      this.$route.query.code == "portal" &&
      this.$route.query.accessToken &&
      this.$route.query.refreshToken
    ) {
      setTimeout(() => {
        this.ssoLogin();
      }, 1000);
    }
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          newUpdateUserPwd(this.user.username, aesEncrypt(this.user.oldPassword), aesEncrypt(this.user.newPassword)).then(
            response => {
              this.$modal.msgSuccess(this.$t('login.message.saveSuccess'));
              this.close()
            }
          );
        }
      });
    },
    close() {
      this.$refs["form"].resetFields();
      this.user = {};
      this.resetPwdModel = false;
    },
    ssoLogin() {
      localStorage.setItem("ACCESS_TOKEN", this.$route.query.accessToken);
      localStorage.setItem("REFRESH_TOKEN", this.$route.query.refreshToken);
      store.commit("SET_passwordExpire", this.$route.query.passwordExpire);
      this.$router.push({ path: "/" }).catch(() => { });
    },
    // 校验license证书
    checkLicense() {
      getLicenseInfo()
        .then((res) => {
          this.licenseData = res.data;
          this.dialogLicenseVisible = true;
        })
        .catch((err) => {
          this.licenseData = "";
          this.dialogLicenseVisible = true;
        });
    },
    // 获取过期时间并设置提醒
    licenseTime() {
      // this.isOverTime = false
      // getLicenseInfo().then((res) => {
      //   const licenseData = res.data;
      //   const timeMillis = Date.parse(licenseData.expireTime + " 23:59:59") - new Date();
      //   const timeDays = timeMillis / (24 * 60 * 60 * 1000);
      //   if (licenseData.type === 3) return;
      //   if (timeDays < 8 && timeDays >= 0) {
      //     this.$message.warning(
      //       `license还剩${Math.round(timeDays)}天失效，请及时更新license`
      //     );
      //   } else if (timeDays < 0) {
      //     this.$message.warning(`license已失效，请及时更新license`);
      //     this.isOverTime = true
      //   }
      // });
      this.isOverTime = false
      getLicenseInfo().then((res) => {
        const licenseData = res.data;
        if (licenseData.type === 3) return;

        const now = new Date();
        const expireTime = new Date(licenseData.expireTime + " 23:59:59");
        now.setHours(0, 0, 0, 0);
        expireTime.setHours(0, 0, 0, 0);
        // 计算毫秒差
        const timeDiff = expireTime.getTime() - now.getTime();
        // 将毫秒差转换为天数
        const dayDiff = timeDiff / (1000 * 3600 * 24) + 1;
        console.log(dayDiff);
        if (dayDiff <= 7 && dayDiff >= 0) {
          if (dayDiff === 0) {
            this.$message.warning(
              this.$t('login.message.licenseTodayExpire')
            );
          } else if (dayDiff === 1) {
            this.$message.warning(
              this.$t('login.message.licenseTomorrowExpire')
            );
          } else {
            this.$message.warning(
              this.$t('login.message.licenseExpire', { days: Math.round(dayDiff) })
            );
          }
        } else if (dayDiff < 0) {
          this.$message.warning(this.$t('login.message.licenseExpired'));
          this.isOverTime = true
        }
      });
      // getLicenseVerify().then(res=>{
      //   if (res.data.code === 0){
      //     this.$message.success(res.data.msg)
      //   }else{
      //     this.$message.warning(res.data.msg)
      //   }
      // }).catch(err=>{
      // })
    },

    getDefaultI18nConfig() {
      getDefaultI18nConfig().then((res) => {
        if (res.data) {
          const defaultLocale = res.data.defaultLocale;
          localStorage.setItem("accept-language", defaultLocale);
          // 设置i18n语言
          this.$i18n.locale = defaultLocale === 'en-US' ? 'en' : 'zh';
        }
      });
    },
    getActiveVersion() {
      getActiveVersion().then((res) => {
        this.versionCode = res.data.id;
        localStorage.setItem("version", JSON.stringify(res.data));
      });
    },
    getLogoConfig() {
      this.$nextTick(() => {
        getLogoGlobalConfig().then((res) => {
          if (res.data) {
            if (res.data.sysIconUrl) {
              this.logoImg = res.data.sysIconUrl
              localStorage.setItem("sysIconUrl", res.data.sysIconUrl);
            } else {
              localStorage.removeItem("sysIconUrl");
            }
            if (res.data.sysLoginPageName) {
              localStorage.setItem("sysLoginPageName", res.data.sysLoginPageName);
              this.sysLoginPageName = res.data.sysLoginPageName
            } else {
              localStorage.removeItem("sysLoginPageName");
            }
            if (res.data.sysMenuPageName) {
              localStorage.setItem("sysMenuPageName", res.data.sysMenuPageName);
              this.sysMenuPageName = res.data.sysMenuPageName
            } else {
              localStorage.removeItem("sysMenuPageName");
            }
          } else {
            localStorage.removeItem("sysIconUrl");
            localStorage.removeItem("sysLoginPageName");
            localStorage.removeItem("sysMenuPageName");
          }
        });
      });
    },
    getCode() {
      // if(this.isOverTime){
      //   this.checkLicense()
      //   return
      // }
      // 情况一，未开启：则直接登录
      if (!this.captchaEnable) {
        this.handleLogin({});
        return;
      }
      // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
      // 弹出验证码
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$refs.verify.show();
        }
      });
    },
    getCookie() {
      const username = getUsername();
      const password = getPassword();
      const rememberMe = getRememberMe();
      const tenantName = getTenantName();
      this.loginForm = {
        ...this.loginForm,
        username: username ? username : this.loginForm.username,
        password: password ? password : this.loginForm.password,
        rememberMe: rememberMe ? getRememberMe() : false,
        tenantName: tenantName ? tenantName : this.loginForm.tenantName,
      };
    },
    handleLogin(captchaParams) {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          // 设置 Cookie
          if (this.loginForm.rememberMe) {
            setUsername(this.loginForm.username);
            setPassword(this.loginForm.password);
            setRememberMe(this.loginForm.rememberMe);
            setTenantName(this.loginForm.tenantName);
          } else {
            removeUsername();
            removePassword();
            removeRememberMe();
            removeTenantName();
          }
          this.loginForm.captchaVerification = captchaParams.captchaVerification;
          let obj = Object.assign({}, this.loginForm, {
            password: aesEncrypt(this.loginForm.password),
          });
          // 发起登陆
          // console.log("发起登录", this.loginForm);
          this.$store
            .dispatch(this.loginForm.loginType === "sms" ? "SmsLogin" : "Login", obj)
            .then(() => {
              // this.$router.push({ path: this.redirect || "/faultManage/alarmShow" }).catch(() => {});
              this.$router.push({ path: "/faultManage/alarmShow" }).catch(() => { 
              });
            })
            .catch(() => {
              
            })
            .finally(() => {
              this.loading = false;
             setTimeout(() => {
                location.reload();
              }, 200);
            });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
// 科技感配色方案
$primary-color: #4380f3;
$primary-light: #6ba1ff;
$primary-dark: #2a5fc7;
$accent-color: #00e5ff;
$background-color: #f7f9fc;
$text-color: #2c3e50;
$text-light: #7f8c8d;
$card-bg: rgba(255, 255, 255, 0.92);
$border-color: rgba(66, 133, 244, 0.2);
$glow-color: rgba(67, 128, 243, 0.4);

.cyber-login-container {
  position: relative;
  min-height: 100vh;
  background: $background-color;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.version {
  font-family: YouSheBiaoTiHei;
  text-align: center;
  color: #4380F3;
  font-size: 24px;
  position: absolute;
  bottom: 0.03rem;
  width: 100%;
}

// 科技感背景
.cyber-background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;

  .cyber-grid {
    position: absolute;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(rgba($primary-color, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba($primary-color, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.4;
  }

  .cyber-orbs {
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.2;
      animation: float 15s infinite ease-in-out;

      &.orb-1 {
        width: 300px;
        height: 300px;
        background: $primary-light;
        top: 10%;
        left: 10%;
        animation-delay: 0s;
      }

      &.orb-2 {
        width: 400px;
        height: 400px;
        background: $accent-color;
        bottom: 5%;
        right: 15%;
        animation-delay: -5s;
      }

      &.orb-3 {
        width: 250px;
        height: 250px;
        background: #9d50ff;
        top: 50%;
        left: 70%;
        animation-delay: -10s;
      }
    }
  }

  .cyber-lines {
    .line {
      position: absolute;
      background: linear-gradient(90deg, transparent, rgba($primary-color, 0.1), transparent);
      height: 1px;
      width: 100%;

      &:nth-child(1) {
        top: 30%;
        animation: scanline 12s linear infinite;
      }

      &:nth-child(2) {
        top: 60%;
        animation: scanline 15s linear infinite;
        animation-delay: -7s;
      }

      &:nth-child(3) {
        top: 80%;
        animation: scanline 10s linear infinite;
        animation-delay: -3s;
      }
    }
  }
}

// 登录内容区域
.cyber-login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

// Logo样式
.cyber-logo-box {
  text-align: center;
  margin-bottom: 10px;
  animation: fadeInUp 0.8s ease-out;

  .logo-icon {
    position: relative;
    display: inline-block;
    margin-bottom: 15px;

    // img {
    //   width: 70px;
    //   height: 70px;
    //   filter: drop-shadow(0 0 10px rgba($primary-color, 0.4));
    // }
    img {
      width: 70px;
      height: 70px;
      vertical-align: middle;
      /* 混合模式，让白底与背景融合 */
      mix-blend-mode: multiply;
    }

    .logo-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90px;
      height: 90px;
      background: $primary-light;
      border-radius: 50%;
      filter: blur(15px);
      opacity: 0.4;
      z-index: -1;
      animation: pulse 3s infinite ease-in-out;
    }
  }

  .logo-text {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: $text-color;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }

  .logo-subtitle {
    font-size: 14px;
    color: $text-light;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
}

// 登录卡片
.cyber-login-card {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: $card-bg;
  border-radius: 16px;
  padding: 10px 30px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    0 0 20px rgba($primary-color, 0.1);
  backdrop-filter: blur(10px);
  animation: scaleIn 0.6s ease-out;
  overflow: hidden;

  .card-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, transparent, transparent, $primary-light, transparent, transparent);
    border-radius: 18px;
    z-index: -1;
    filter: blur(8px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .card-glow {
    opacity: 0.6;
  }
}

// 标题区域
.cyber-title-box {
  text-align: center;
  margin-bottom: 25px;

  .title-main {
    font-size: 24px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 5px;
  }

  .title-sub {
    font-size: 14px;
    color: $text-light;
    margin-bottom: 15px;
  }

  .title-underline {
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, transparent, $primary-color, transparent);
    margin: 0 auto;
    border-radius: 3px;
  }
}

// 标签页样式
.cyber-tabs {
  margin-bottom: 20px;

  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba($primary-color, 0.1);
  }

  :deep(.el-tabs__item) {
    font-weight: 500;
    color: $text-light;

    &.is-active {
      color: $primary-color;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: $primary-color;
    height: 2px;
  }
}

// 输入框样式
.input-container {
  position: relative;
  margin-bottom: 24px;

  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: invert(44%) sepia(88%) saturate(558%) hue-rotate(195deg) brightness(97%) contrast(97%);
    }
  }

  .cyber-input {
    :deep(.el-input__inner) {
      padding-left: 40px;
      height: 48px;
      border: none;
      background: rgba(245, 248, 255, 0.6);
      border-radius: 8px;
      color: $text-color;
      font-size: 16px;
      transition: all 0.3s ease;

      &::placeholder {
        color: #a0aec0;
      }

      &:focus {
        background: rgba(245, 248, 255, 0.9);
        box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
      }
    }
  }

  .input-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, $primary-color, transparent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:focus-within .input-underline {
    transform: scaleX(1);
  }
}

// 选项区域
.cyber-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 30px;

  .cyber-checkbox {
    :deep(.el-checkbox__label) {
      color: $text-light;
      font-size: 14px;
    }

    :deep(.el-checkbox__inner) {
      border-radius: 4px;

      &:after {
        border-width: 2px;
      }
    }
  }

  .option-links {
    display: flex;
    gap: 15px;

    span {
      font-size: 14px;
      color: $primary-color;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: $primary-dark;
        text-shadow: 0 0 5px rgba($primary-color, 0.3);
      }
    }
  }
}

// 登录按钮
.cyber-login-btn {
  position: relative;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  .btn-text {
    position: relative;
    z-index: 2;
  }

  .btn-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, $primary-light, $primary-color);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.7s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($primary-color, 0.4);

    .btn-gradient {
      opacity: 1;
    }

    .btn-glow {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
}

// 版本信息
.cyber-version {
  margin-top: 30px;
  font-family: 'Courier New', monospace;
  text-align: center;
  color: $text-light;
  font-size: 14px;
  letter-spacing: 1px;
}

// 模态框样式
.cyber-modal {
  :deep(.ivu-modal) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.ivu-modal-header) {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    color: white;
    border-bottom: none;
  }

  :deep(.ivu-modal-body) {
    padding: 24px 24px 0 24px;
  }

  :deep(.ivu-modal-footer) {
    border-top: 1px solid rgba($primary-color, 0.1);
    margin: 0 0 10px 0;
  }
}

// 按钮样式
.cyber-btn {
  position: relative;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &.primary {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
    color: white;

    &:hover {
      box-shadow: 0 4px 12px rgba($primary-color, 0.3);
    }
  }

  &.danger {
    background: rgba(245, 101, 101, 0.1);
    color: #f56565;

    &:hover {
      background: rgba(245, 101, 101, 0.2);
    }
  }
}

// 动画定义
@keyframes float {

  0%,
  100% {
    transform: translateY(0) translateX(0);
  }

  25% {
    transform: translateY(-20px) translateX(10px);
  }

  50% {
    transform: translateY(10px) translateX(-10px);
  }

  75% {
    transform: translateY(-10px) translateX(-15px);
  }
}

@keyframes scanline {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .cyber-login-card {
    max-width: 100%;
    padding: 20px;
  }

  .cyber-logo-box {
    .logo-text {
      font-size: 22px;
    }

    .logo-subtitle {
      font-size: 12px;
    }
  }

  .cyber-options {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}
</style>
