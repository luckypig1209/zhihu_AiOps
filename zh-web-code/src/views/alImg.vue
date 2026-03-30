<template>
    <div ref="dragDiv" class="float-drag-button" @mouseover="showHover=true" @mouseout="showHover=false">
      <img v-show="!showHover"  style="height:80px;vertical-align: middle;" src="@/assets/images/jiqiren.webp" alt="" @dragstart="preventDefault"/>
     
      <img v-show="showHover" style="height:80px;vertical-align: middle;" src="@/assets/images/erweima.png" alt="" @dragstart="preventDefault"/>
      <div v-show="showHover" style="font-size: 13px;width:80px; text-align: center;">AI运维机器人</div>
    </div>
  </template>
  
  <script>export default {
    data() {
    return {
        showHover: false,
        windowHeight: document.body.clientHeight,
        windowWidth: document.body.clientWidth
    };
  },
  watch: {
    // 监听页面高度
    windowHeight(val) {
      // console.log('实时屏幕高度：', val, this.windowHeight)
      this.$nextTick(()=>{
        this.$refs.dragDiv.style.left = 'calc(100vw - 88px)'
    })
    },
    // 监听页面宽度
    windowWidth(val) {
      // console.log('实时屏幕宽度：', val, this.windowHeight)
      this.$nextTick(()=>{
        this.$refs.dragDiv.style.left = 'calc(100vw - 88px)'
    })
    }
  
  },
    mounted() {
        window.onresize = () => {
        return (() => {
          this.windowHeight = document.documentElement.clientHeight // 高
          this.windowWidth = document.documentElement.clientWidth // 宽
        })()
      }      
      this.completeSize()
    },
    methods: {
    completeSize(){
      this.$nextTick(() => {
        // 获取DOM元素
        console.log("cfdfasfsafa")
        let dragDiv = this.$refs.dragDiv;
        // 缓存 clientX clientY 的对象: 用于判断是点击事件还是移动事件
        let clientOffset = {};
        // 绑定鼠标按下事件
        dragDiv.addEventListener("mousedown", (event) => {
          let offsetX = dragDiv.getBoundingClientRect().left; // 获取当前的x轴距离
          let offsetY = dragDiv.getBoundingClientRect().top; // 获取当前的y轴距离
          let innerX = event.clientX - offsetX; // 获取鼠标在方块内的x轴距
          let innerY = event.clientY - offsetY; // 获取鼠标在方块内的y轴距
          console.log(offsetX, offsetY, innerX, innerY);
          // 缓存 clientX clientY
          clientOffset.clientX = event.clientX;
          clientOffset.clientY = event.clientY;
          // 鼠标移动的时候不停的修改div的left和top值
          document.onmousemove = function(event) {
            dragDiv.style.left = event.clientX - innerX + "px";
            dragDiv.style.top = event.clientY - innerY + "px";
            // dragDiv 距离顶部的距离
            let dragDivTop = window.innerHeight - dragDiv.getBoundingClientRect().height;
            // dragDiv 距离左部的距离
            let dragDivLeft = window.innerWidth - dragDiv.getBoundingClientRect().width;
            // 边界判断操作
            // 1、设置左右不能动
            dragDiv.style.left = dragDivLeft + "px";
            // 2、超出顶部操作
            if (dragDiv.getBoundingClientRect().top <= 0) {
              dragDiv.style.top = "0px";
            }
            // 3、超出底部操作
            if (dragDiv.getBoundingClientRect().top >= dragDivTop) {
              dragDiv.style.top = (dragDivTop - 20) + "px";
            }
          };
          // 鼠标抬起时，清除绑定在文档上的mousemove和mouseup事件；否则鼠标抬起后还可以继续拖拽方块
          document.onmouseup = function() {
            document.onmousemove = null;
            document.onmouseup = null;
          };
        }, false);
        // 绑定鼠标松开事件
        dragDiv.addEventListener('mouseup', (event) => {
          let clientX = event.clientX;
          let clientY = event.clientY;
          if (clientX === clientOffset.clientX && clientY === clientOffset.clientY) {
            console.log('click 事件');
          } else {
            console.log('drag 事件');
          }
        })
      });
    },
    preventDefault(event) {
      event.preventDefault();
    }
  },
  };</script>
  <style lang="scss" scoped>.float-drag-button {
    position: absolute;
    right: 0;
    top: 22%;
    z-index: 6666;
    padding: 4px;
    width: 88px;
    opacity: 1;
    background-color: #fff;
    border-radius: 8px 0px 0px 8px;
    box-shadow: 0px 2px 15px 0px rgba(9,41,77,0.15);
    cursor: move;
    span {
      font-size: 16px;
      color: #333333;
      line-height: 24px;
      user-select: none;
    }
  }</style>