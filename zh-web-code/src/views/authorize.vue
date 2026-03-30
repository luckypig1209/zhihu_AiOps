<!-- @format -->

<template>
  <div>
    <Spin size="large" fix v-if="spinShow"></Spin>
  </div>
</template>

<script>
import { getSsoTokenAPI } from "@/api/login";
import store from "@/store";
import setToken from '@/utils/auth'

export default {
  name: "authorize",
  data() {
    return {
      spinShow: false
    };
  },  
  methods: {
    init() {
      this.spinShow = true;
      getSsoTokenAPI()
        .then((res) => {
          this.spinShow = false;
          let resData = res.data.data;

          // 设置 token
          // setToken(resData)
          localStorage.setItem('ACCESS_TOKEN', resData.accessToken)
          localStorage.setItem('REFRESH_TOKEN', resData.refreshToken)
          store.commit('SET_passwordExpire', resData.passwordExpire)
          this.$router.push({path: "/"}).catch(() => {
          });          
        })
        .catch((e) => {
          this.spinShow = false;
          this.$router.push({
            name: "login",
          });
          this.$message.error("登录失败");
        });
    },
  },
  mounted() {
    setTimeout(() => {
       this.init();
    }, 1000);
   
  },
};
</script>

<style scoped></style>
