<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav"/>
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav"/>

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <!-- <search id="header-search" class="right-menu-item" /> -->
        <!-- <screenfull id="screenfull" class="right-menu-item hover-effect" /> -->
         <!-- <el-tooltip effect="dark" content="License证书" placement="bottom-end">
          <span class="circle-bg version-icon">
            <img :src="licenseIcon" alt="" @click="checkLicense">
          </span>
        </el-tooltip>  -->
        <!-- 站内信 -->
        <!-- <notify-message class="right-menu-item hover-effect" /> -->
        <!-- <el-tooltip effect="dark" :content="`当前版本: ${verSionCode}`" placement="bottom-end">
          <span class="circle-bg version-icon">
            <img :src="versionIcon" alt="" @click="checkVision">
          </span>
        </el-tooltip> -->
        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
        <LangSelect class="right-menu-item hover-effect" />
        <faqGroupIcon/>
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">

          <span class="circle-bg">
            <img :src="getUrl(avatar)" class="user-avatar">
<!--             <img :src="userIcon" alt="">-->
          </span>
          <span v-if="nickname" class="user-nickname">{{ nickname }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>{{ $t('navbar.dropdown.profile') }}</el-dropdown-item>
          </router-link>

          <el-dropdown-item>
            <span @click="checkLicense">{{ $t('navbar.dropdown.license') }}</span>
          </el-dropdown-item>

          <!-- <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item> -->
          <el-dropdown-item divided @click.native="logout">
            <span>{{ $t('navbar.dropdown.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <DetailVision :dialogVisDetail="dialogVisDetail"></DetailVision>
    <!-- 变更license -->
    <UpdateLicense :dialogLicenseVisible="dialogLicenseVisible" :licenseData="licenseData"></UpdateLicense>
  </div>
</template>

<script>
import faqGroupIcon from './faqGroupIcon.vue'
import LangSelect from '@/components/LangSelect.vue'
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import NotifyMessage from '@/layout/components/Message'
import {getPath} from "@/utils/ruoyi";
import userIcon from "@/assets/images/user-icon.png";
import versionIcon from "@/assets/images/version-icon.png";
import DetailVision from '@/layout/components/Version/index'
import { getActiveVersion } from '@/api/login'
import licenseIcon from "@/assets/images/license-icon.png";
import UpdateLicense from '@/views/components/updateLicense.vue'
import { getLicenseInfo } from "@/api/login";
export default {
  data() {
    return {
      licenseData: '', // 过期时间
      dialogLicenseVisible: false, // 弹出更新框
      userIcon: userIcon,
      versionIcon: versionIcon,
      licenseIcon: licenseIcon,
      dialogVisDetail: false, // 版本号弹窗
      verSionCode: '', // 版本号
    }
  },
  components: {
    faqGroupIcon,
    LangSelect,
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc,
    NotifyMessage,
    DetailVision,
    UpdateLicense
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'nickname',
      'device'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      }
    }
  },
  created() {
    this.getVis()
  },
  methods: {
    // 校验license证书
    checkLicense() {
      getLicenseInfo().then(res => {
        // 弹出文件面板
        this.licenseData = res.data
        this.dialogLicenseVisible = true
      })
    },
    getUrl(path) {
      let url = path.indexOf('/static/img/profile') >= 0 ? path :  '/admin-api/system/file' + path;
      return url;
    },
    // 版本详情
    checkVision() {
      this.dialogVisDetail = true

    },
    // 获取当前版本
    getVis(){
      if(localStorage.getItem('version')) {
        this.version = JSON.parse(localStorage.getItem('version'))
        this.verSionCode = this.version.id
      } else {
        getActiveVersion().then((res) => {
         this.versionCode = res.data.id;
          localStorage.setItem('version', JSON.stringify(res.data));
        })
      }

    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
       this.$confirm(this.$t('navbar.message.logoutConfirm'), this.$t('common.tip'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: "warning",
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = getPath('/faultManage/alarmShow');
        })
      }).catch(() => {});
    }
  }
}
</script>

<style lang="scss" scoped>
.circle-bg {
  display: inline-block;
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  text-align: center;
    img {
     width: 16px;
     }

  }
.version-icon {
  margin-left: 10px;
  cursor: pointer;
  img {
    width: 25px;
  }
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  // box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 48px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }
  :deep(.el-breadcrumb__inner a){
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #8693AA;
  }
  :deep(.el-breadcrumb .no-redirect) {
    font-size: 16px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 500;
    color: #1E2E41;
  }



  .topmenu-container {
    position: absolute;
    left: 40px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    // float: right;
    height: 100%;
    // line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: end;
    justify-content: flex-end;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 12px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      // vertical-align: text-bottom;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      &.hover-effect {
        cursor: pointer;
        // transition: background .3s;

        &:hover {
          // background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 50%;
        }
        // .circle-bg {
        //   display: inline-block;
        //   width: 32px;
        //   height: 32px;
        //   background: #fff;
        //   border-radius: 50%;
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   margin-right: 10px;
        //   text-align: center;
        //   img {
        //     width: 16px;
        //   }
        // }
        .user-nickname{
          // margin-left: 5px;
          font-size: 14px;
          font-family: PingFangSC, PingFang SC;
          font-weight: 400;
          color: #1E2E41;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 10px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
