<!-- 
	@description: 版本号界面
 -->
<template>
	<el-dialog
    title="版本历史记录"
    :visible.sync="dialogVisDetail"
    width="650px"
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-tabs tab-position="left" style="min-height: 500px;">
      <el-tab-pane :label="item.id" v-for="(item, index) in histroyList" :key="index">
        <div class="mod-about">
          <h3 class="category hidden-print">
            {{ item.id }}
            <el-tag type="success" class="tip" v-if="item.activeFlag === '1'">使用中</el-tag>
            <el-tag type="warning" class="tip" v-else>历史版本</el-tag>
            <div id="printcontent" class="print" data-clickable="true" style="">
              <span class="print-text">上线日期：</span>
              <div class="print-logo">
                <i class="el-icon-date"></i>
              </div>
              <div class="print-text">{{ formatTime(item.onlineTime)}}</div>
            </div>
            <hr>
          </h3>
          <div class="descript">版本说明：</div>
          <div style="white-space: pre-wrap; line-height: 1.7; font-size: 14px;" v-text="item.versionContent"></div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import { getAllVersions } from '@/api/login'
export default {
		props: {
			dialogVisDetail: {
      	type: Boolean,
      	required: true,
      	default: false,
    	},
		},
		data() {
			return {
				histroyList:  []
			}
		},
    mounted() {
      this.getAllVersions()
    },
		methods: {
      formatTime(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss')
      },
      // 获取历史版本
      getAllVersions(){
        getAllVersions().then((res) => {
          this.histroyList = res.data || []
        })
      },
      handleClose() {
        this.$parent.dialogVisDetail = false
      }
		}
	};
</script>

<style lang="scss" scoped>
.print {
  display: block;
  text-align: right;
  line-height: 16px;
  margin-left: 5px;
  width: auto;
  height: 16px;
}
.mod-about .category {
  font-size: 30px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: rgba(37,43,58,1);
  line-height: 42px;
  text-align: left;
}
.mod-about .category hr {
  height: 0;
  padding: 0;
  border: 0;
  border-bottom: 1px solid #EDEDED;
  width: 100%;
  margin: 30px auto 0;
  margin-top: 10px;
}
.tip {
  position: relative;
  bottom: 6px;
}
.print-text {
  height: 16px;
  font-size: 13px;
  display: inline-block;
  position: relative;
  bottom: 4px;
}
.mod-about {
  padding-left: 10px;
  margin-bottom: 20px;
}
.descript {
  margin-top: 10px;
}
.print-logo {
  display: inline-block;
  font-size: 16px;
  position: relative;
  top: -3px;
}
</style>