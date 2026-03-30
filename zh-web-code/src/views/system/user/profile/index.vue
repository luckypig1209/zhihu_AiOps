<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>{{ $t('userProfile.title.personalInfo') }}</span>
          </div>
          <div>
            <div class="text-center">
              <userAvatar :user="user" />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />{{ $t('userProfile.info.username') }}
                <div class="pull-right">{{ user.username }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />{{ $t('userProfile.info.mobile') }}
                <div class="pull-right">{{ user.mobile }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />{{ $t('userProfile.info.email') }}
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />{{ $t('userProfile.info.dept') }}
                <el-tooltip :content="user.dept.name" placement="top">
                  <div class="pull-right" v-if="user.dept">{{ user.dept.name }}</div>
                </el-tooltip>

              </li>
<!--              <li class="list-group-item">-->
<!--                <svg-icon icon-class="tree" />所属岗位-->
<!--                <el-tooltip :content="user.posts?.map(post => post.name).join(',')" placement="top">-->
<!--                  <div class="pull-right" v-if="user.posts">{{ user.posts.map(post => post.name).join(',') }}</div>-->
<!--                </el-tooltip>-->
<!--              </li>-->
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />{{ $t('userProfile.info.role') }}
                <div class="pull-right" v-if="user.roles">{{ user.roles.map(role => role.name).join(',') }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="date" />{{ $t('userProfile.info.createTime') }}
                <div class="pull-right">{{ parseTime(user.createTime) }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>{{ $t('userProfile.title.basicInfo') }}</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('userProfile.title.basicInfo')" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane :label="$t('userProfile.title.changePassword')" name="resetPwd">
              <resetPwd :userInfo="user" />
            </el-tab-pane>
            <!-- <el-tab-pane label="社交信息" name="userSocial">
              <userSocial :user="user" :getUser="getUser" :setActiveTab="setActiveTab" />
            </el-tab-pane> -->
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import userSocial from "./userSocial";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile",
  components: { userAvatar, userInfo, resetPwd, userSocial },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: "userinfo"
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data;
      });
    },
    setActiveTab(activeTab) {
      this.activeTab = activeTab
    }
  }
};
</script>
<style lang="scss" scoped>
  .pull-right {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
