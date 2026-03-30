/**
 * 工作台视图-我的工作小结
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
  <Card style="border-radius: 24px;">
    <div class="itemTitle">
      <span>我的工单</span>
    </div>
    <Row :gutter="20" class="card" type="flex" align="middle">
      <Col span="8"
        ><div class="result-left">
          <div class="img"><img :src="require('@/assets/images/icon07.png')" /></div>

        </div>
      </Col>
      <Col style="position: relative; top: -20px;" span="16">
        <div style="margin-bottom: 10px" class="count">
          <span style="margin-bottom: 0;color: #1E2E41;">我的工单数：</span>
          <span>
              <span @click="goMyWork()" style="font-size: 26px;cursor: pointer;color: #4380F3;margin-right: 10px" class="num">{{ workOrderTotal }}</span
              ><span>个</span>
            </span>
        </div>
        <div style="margin-bottom: 10px" class="count">
          <span style="margin-bottom: 0;color: #1E2E41;">待办任务数：</span>
          <span>
              <span @click="goToDo" style="font-size: 26px;color: #4380F3;margin-right: 10px;cursor: pointer" class="num">{{ todoTaskTotal }}</span
              ><span>个</span>
            </span>
        </div>
        <div  class="count">
          <span style="margin-bottom: 0;color: #1E2E41;">已办任务数：</span>
          <span>
              <span @click="goDone" style="font-size: 26px;cursor: pointer;color: #4380F3;margin-right: 10px" class="num">{{ doneTaskTotal }}</span
              ><span>个</span>
            </span>
        </div>
<!--        <div>-->
<!--          <div style="display: flex;margin-bottom: 10px">-->
<!--            <div class="count-content">主动性服务</div>-->
<!--            <Progress :stroke-width="6" :stroke-color="'#4380F3'" :format="format" :percent="operationScheduleRate" />-->
<!--          </div>-->
<!--          <div style="display: flex;margin-bottom: 10px">-->
<!--            <div class="count-content">客户需求</div>-->
<!--            <Progress :stroke-width="6" :stroke-color="'#4380F3'" :percent="custReqRate" />-->
<!--          </div>-->
<!--          <div style="display: flex;margin-bottom: 10px">-->
<!--            <div class="count-content">产品项目</div>-->
<!--            <Progress :stroke-width="6" :stroke-color="'#4380F3'" :format="format" :percent="projectUndertakeRate" />-->
<!--          </div>-->
<!--          <div style="display: flex">-->
<!--            <div class="count-content">合作方</div>-->
<!--            <Progress :stroke-width="6" :stroke-color="'#4380F3'" :percent="partnerEvaluationRate" />-->
<!--          </div>-->
<!--        </div>-->
<!--        <div class="myEcharts" id="result" style="height: 200px"></div>-->
      </Col>
    </Row>
  </Card>
</template>

<script>
// import { workResultCount } from "@/api/home";
import * as echarts from "echarts";
import {getWorkSummary} from "@/api/login";
export default {
  name: "",
  components: {},
  data() {
    return {
      pieData: [],
      workOrderTotal:0,
      todoTaskTotal:0,
      doneTaskTotal:0,
      pieTotal: 0,
      myChart: null
    };
  },
  watch: {
    menuStatus(val) {
      if (!this.myChart) {
        return;
      }
      this.myChart.dispose();
      this.myChart = null;
      setTimeout(() => {
        this.myChart = echarts.init(document.getElementById("result"));
        this.myChart.setOption(this.echartsOption, true);
      }, 300);
    }
  },
  computed: {
    menuStatus() {
      return this.$store.state.app.menuStatus;
    },
    echartsOption() {
      return {
        color: ["#4880ff", "#ffc400", "#a0d997", "#7abcee"],
        backgroundColor: "#fff",
        title: {
          // text: `{a|${this.pieData.total}}\n{b| ${this.title}}`,
          textStyle: {
            rich: {
              a: {
                color: "#000",
                fontSize: "30",
                align: "center"
              },
              b: {
                fontSize: "12",
                color: "#000",
                align: "center"
              }
            }
          },
          x: "13%",
          y: "38%"
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          icon: "roundRect",
          itemWidth: 15,
          itemHeight: 4,
          itemStyle: {},
          orient: "horizontal",
          right: "0",
          top: "middle",
          width: "0",
          itemGap: 5,
          textStyle: {
            color: "#333",
            borderWidth: 0,
            fontSize: 12,
            lineHeight: 16,
            rich: {
              a: {
                width: 15,
                height: 4,
                backgroundColor: "#000"
              },
              b: {
                fontSize: "12",
                color: "#000",
                lineHeight: 24
              }
            }
          },
          formatter: (params) => {
            let index = this.pieData.findIndex((el) => {
              return params == el.name;
            });
            return params + "：\n" + this.pieData[index].per;
          },
          data: this.pieData.map((r) => r.name)
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: ["40%", "60%"],
            center: ["24%", "50%"],
            avoidLabelOverlap: false,
            roseType: "radius",
            minShowLabelAngle: 80,
            label: {
              show: false
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 0
            },

            data: this.pieData
          }
          // {
          //   name: "阴影圈",
          //   type: "pie",
          //   radius: ["0", "36%"],
          //   center: ["24%", "50%"],
          //   emphasis: {
          //     scale: false
          //   },
          //   tooltip: {
          //     show: false
          //   },
          //   itemStyle: {
          //     color: new echarts.graphic.RadialGradient(0.5, 0.5, 1.0, [
          //       // 由中心向四周渐变
          //       {
          //         offset: 0,
          //         color: `rgba(${this.color[0]}, 0.1)`
          //       },
          //       {
          //         offset: 1,
          //         color: `rgba(${this.color[0]}, 1)`
          //       }
          //     ])
          //   },
          //   zlevel: 4,
          //   labelLine: {
          //     show: false
          //   },
          //   data: [100]
          // }
        ]
      };
    }
  },
  methods: {
    goMyWork(){
      this.$router.push({name:'BpmProcessInstance'})
    },
    goToDo(){
      this.$router.push({name:'BpmTodoTask'})
    },
    goDone(){
      this.$router.push({name:'BpmDoneTask'})
    },
    format(percentage) {
      return percentage = `${percentage}%`;
    },
    getPieData() {
      getWorkSummary().then((res) => {
        if (res.code === 0) {
          // this.operationScheduleRate = Number(res.data.operationScheduleRate.substring(0,res.data.operationScheduleRate.length - 1))
          // this.custReqRate = Number(res.data.custReqRate.substring(0,res.data.custReqRate.length - 1))
          // this.projectUndertakeRate = Number(res.data.projectUndertakeRate.substring(0,res.data.projectUndertakeRate.length - 1))
          // this.partnerEvaluationRate = Number(res.data.partnerEvaluationRate.substring(0,res.data.partnerEvaluationRate.length - 1))
          this.workOrderTotal = res.data.workOrderTotal
          this.doneTaskTotal = res.data.doneTaskTotal
          this.todoTaskTotal = res.data.todoTaskTotal
        }
      });
    },
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById("result"));

      this.myChart.on("click", function (param) {
        //添加点击事件
        console.log(param);
      });
      this.myChart.setOption(this.echartsOption);
      window.addEventListener("resize", () => {
        if (this.myChart) {
          this.myChart.resize();
        }
      });
    }
  },
  created() {
    this.getPieData();
  },
  mounted() {
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }
};
</script>

<style scoped lang="less">
.card {
  padding: 16px 0 0;
}
.result-left {
  display: flex;
  align-items: center;
  .img {
    img {
      width: 100%;
      margin-top: 20px;
      max-width: 125px;
      margin-left: 8px;
      height: auto;
    }
  }
  .count {
    position: relative;

    flex: 1;
    right: -32px;
    background-color: #fafafa;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 16px 16px 10px;
    box-sizing: border-box;
    z-index: 1;
    font-size: 14px;
    font-weight: 600;
    color: #4a4a4a;
    .num{
      width: 16px;
      height: 37px;
      font-size: 26px;
      font-family: PingFangSC, PingFang SC;
      font-weight: 600;
      color: #4380F3;
      line-height: 37px;
    }
    p {
      line-height: 24px;
    }
    span {
      color: #4880ff;
      font-size: 20px;
    }
    i {
      font-style: normal;
      font-weight: 400;
      color: #c3c3c3;
    }
  }

  .count::before {
    content: "";
    position: absolute;
    top: 5px;
    left: 0;
    width: 16px;
    bottom: 5px;
    background: #fafafa;
    z-index: 3;
  }

  .count::after {
    content: "";
    position: absolute;
    top: 25%;
    left: -8px;
    width: 16px;
    height: 16px;
    background: #fff;
    transform: rotate(-135deg);
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
    border-radius: 0 0 0 4px;
    z-index: 2;
  }
}
.count-content{
  width: 30%;
  font-size: 14px;
  font-weight: 400;
  font-family: PingFangSC, PingFang SC;
}
/deep/.ivu-icon-ios-checkmark-circle:before{
  font-size: medium;
}
</style>
