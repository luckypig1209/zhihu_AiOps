/**
 * 工作台视图-环形图
 * @router index
 * @autor zm
 * @date 2023/03/23
 */
<template>
  <Card style="border-radius: 24px">
    <div class="itemTitle">
      <span>{{ title }}</span>
    </div>
    <div class="myEcharts" :id="id" style="height: 180px"></div>
  </Card>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "",
  components: {},
  props: {
    title: {
      default: "",
      type: String
    },
    legendWidth: {
      default: "auto",
      type: String
    },
    id: {
      default: "chart",
      type: String
    },
    color: {
      default: ["#3FDFFF", "#0982FD"],
      type: Array
    },
    pieData: {
      default: () => {
        return {};
      },
      type: Object
    }
  },
  data() {
    return { myChart: null, seriesData: [], colorData: [] };
  },
  watch: {
    pieData(val) {
      if (!val.list) return;
      val.list.forEach((el) => {
        this.seriesData.push({
          name: el.name,
          value: el.value,
          title: this.title
        });
        this.colorData.push(el.color);
      });
      this.initChart();
    },
    menuStatus(val) {
      if (!this.myChart) {
        return;
      }
      this.myChart.dispose();
      this.myChart = null;
      setTimeout(() => {
        this.myChart = echarts.init(document.getElementById(this.id));
        this.myChart.setOption(this.echartsOption, true);
      }, 300);
    }
  },
  computed: {
    menuStatus() {
      return this.$store.state.app.menuStatus;
    },
    echartsOption() {
      let color1 = this.color[0],
        color2 = this.color[1];
      return {
        color: this.colorData,
        backgroundColor: "#fff",
        // title: {
        //   text: `{a|${this.pieData.total}}\n{b| ${this.title}}`,
        //   textStyle: {
        //     rich: {
        //       a: {
        //         color: color2,
        //         fontSize: "30",
        //         align: "center"
        //       },
        //       b: {
        //         fontSize: "12",
        //         color: "#000",
        //         align: "center"
        //       }
        //     }
        //   },
        //   left: "16%",
        //   top: "38%"
        // },
        tooltip: {
          trigger: "item",
          position: [10, 10]
        },
        legend: {
          icon: "circle",
          itemHeight: 10,
          itemStyle: {},
          orient: "horizontal",
          left: "50%",
          top: "middle",
          width: this.legendWidth,
          textStyle: {
            color: "#333",
            borderWidth: 0,
            fontSize: 12
          },
          formatter: (params) => {
            let index = this.pieData.list.findIndex((el) => {
              return params == el.name;
            });
            return params + +this.pieData.list[index].value;
            // let tip1 = "";
            // let tip = "";
            // let le = params.length; //图例文本的长度
            // if (le > 5) {
            //   //几个字换行大于几就可以了
            //   let l = Math.ceil(le / 5); //有些不能整除，会有余数，向上取整
            //   for (let i = 1; i <= l; i++) {
            //     //循环
            //     if (i < l) {
            //       //最后一段字符不能有\n
            //       tip1 += params.slice(i * 5 - 5, i * 5) + "\n"; //字符串拼接
            //     } else if (i === l) {
            //       //最后一段字符不一定够5个
            //       tip = tip1 + params.slice((l - 1) * 5, le); //最后的拼接在最后
            //     }
            //   }
            //   return tip;
            // } else {
            //   tip = params; //前面定义了tip为空，这里要重新赋值，不然会替换为空
            //   return tip;
            // }
          },
          data: this.pieData.list.map((r) => r.name)
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: ["50%", "70%"],
            center: ["24%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            itemStyle: {
              borderColor: "#fff",
              borderWidth: 2
            },

            data: this.seriesData
          },
          {
            name: "阴影圈",
            type: "pie",
            radius: ["0", "36%"],
            center: ["24%", "50%"],
            emphasis: {
              scale: false
            },
            tooltip: {
              show: false
            },
            itemStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1.0, [
                // 由中心向四周渐变
                {
                  offset: 0,
                  color: `rgba(${this.color[0]}, 0.1)`
                },
                {
                  offset: 1,
                  color: `rgba(${this.color[0]}, 1)`
                }
              ])
            },
            zlevel: 4,
            labelLine: {
              show: false
            },
            data: [100]
          },
          {
            name: "数据总数",
            type: "pie",
            radius: ["0%", "0%"],
            center: ["24%", "50%"],
            itemStyle: {
              // 防止鼠标悬浮到标签时出现放大的点
              color: "transparent"
            },
            tooltip: {
              show: false
            },
            label: {
              position: "inside",
              formatter: () => {
                return `{a|${this.pieData.total}}\n{b| ${this.title}}`;
              },
              rich: {
                a: {
                  color: color2,
                  fontSize: "28",
                  align: "center"
                },
                b: {
                  fontSize: "10",
                  color: "#000",
                  align: "center"
                }
              }
            },
            labelLine: {
              show: false
            },
            data: [100]
          }
        ]
      };
    }
  },
  methods: {
    initChart() {
      // 基于准备好的dom，初始化echarts实例
      this.myChart = echarts.init(document.getElementById(this.id));
      // this.myChart.showLoading({
      //   text: "加载中...",
      //   color: "#5487d3",
      //   textColor: "#5487d3",
      //   lineWidth: 2
      // });
      this.myChart.on("click", (param) => {
        //添加点击事件
        console.log(param);
        if (param.data.title) {
          this.$emit("openModal", param.data);
        }
      });
      // 绘制图表
      this.myChart.setOption(this.echartsOption);
      window.addEventListener("resize", () => {
        if (this.myChart) {
          this.myChart.resize();
        }
      });
      // this.myChart.hideLoading();
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }
};
</script>

<style scoped lang="less">
</style>
