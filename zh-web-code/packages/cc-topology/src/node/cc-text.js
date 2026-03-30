import G6 from "@antv/g6";
const Util = G6.Util;

// 用来获取调用此js的vue组件实例（this）
let vm = null;

const sendThis = (_this) => {
  vm = _this;
};

const nodeObj = {
  name: "cc-text",
  options: {
    draw(cfg, group) {
      const text = cfg.label || "双击编辑文字";

      // 绘制文本
      const textShape = group.addShape("text", {
        attrs: {
          text: text,
          x: 0,
          y: 0,
          fontSize: cfg.style.fontSize || 14,
          fill: cfg.style.fill || "#333",
          fontWeight: cfg.style.fontWeight || "normal",
          textAlign: "center",
          textBaseline: "middle",
        },
        name: "text-shape",
      });

      return textShape;
    },

    getSize(cfg) {
      return cfg.size || [100, 30];
    },

    // 明确设置没有锚点
    getAnchorPoints() {
      return [];
    },

    // 在节点绘制完成后添加删除按钮
    afterDraw(cfg, group) {
      // 检查是否为编辑模式
      if (!vm || vm.graphMode !== "edit") {
        return;
      }

      // 创建删除按钮背景圆
      const deleteBtnBg = group.addShape("circle", {
        id: cfg.id + "_delete_btn_bg",
        attrs: {
          name: "deleteBtnBg",
          x: 40, // 按钮位置相对于文本中心
          y: -15,
          r: 6,
          fill: "#fff",
          stroke: "#F56C6C",
          lineWidth: 1,
          opacity: 0, // 默认隐藏
        },
        draggable: false,
        name: "deleteBtnBg",
        zIndex: 10,
      });

      // 创建删除按钮图标
      const deleteBtnIcon = group.addShape("text", {
        id: cfg.id + "_delete_btn_icon",
        attrs: {
          name: "deleteBtnIcon",
          x: 40, // 按钮位置相对于文本中心
          y: -15 + 1,
          text: "×",
          fontSize: 10,
          fill: "#F56C6C",
          textAlign: "center",
          textBaseline: "middle",
          opacity: 0, // 默认隐藏
        },
        draggable: false,
        name: "deleteBtnIcon",
        zIndex: 11,
      });

      // 用于跟踪是否有隐藏计时器在运行
      let hideTimer = null;
      let isMouseOnTextOrButton = false;

      // 添加鼠标事件处理
      const textShape = group.find((ele) => ele.get("name") === "text-shape");
      if (textShape) {
        textShape.on("mouseenter", function () {
          // 清除可能存在的隐藏计时器
          if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
          }
          isMouseOnTextOrButton = true;
          // 显示删除按钮
          deleteBtnBg.attr("opacity", 1);
          deleteBtnIcon.attr("opacity", 1);
        });

        textShape.on("mouseleave", function () {
          isMouseOnTextOrButton = false;
          // 延迟隐藏按钮
          hideTimer = setTimeout(() => {
            if (!isMouseOnTextOrButton) {
              deleteBtnBg.attr("opacity", 0);
              deleteBtnIcon.attr("opacity", 0);
              hideTimer = null;
            }
          }, 1000);
        });
      }

      // 删除按钮背景的鼠标进入事件
      deleteBtnBg.on("mouseenter", function () {
        // 清除可能存在的隐藏计时器
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        isMouseOnTextOrButton = true;
        // 应用悬停样式并确保可见
        this.attr({
          fill: "#F56C6C",
          opacity: 1,
        });
        deleteBtnIcon.attr({
          fill: "#fff",
          opacity: 1,
        });
      });

      // 删除按钮图标的鼠标进入事件
      deleteBtnIcon.on("mouseenter", function () {
        // 清除可能存在的隐藏计时器
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        isMouseOnTextOrButton = true;
        // 应用悬停样式并确保可见
        deleteBtnBg.attr({
          fill: "#F56C6C",
          opacity: 1,
        });
        this.attr({
          fill: "#fff",
          opacity: 1,
        });
      });

      // 删除按钮背景的鼠标离开事件
      deleteBtnBg.on("mouseleave", function () {
        isMouseOnTextOrButton = false;
        // 延迟隐藏按钮
        hideTimer = setTimeout(() => {
          if (!isMouseOnTextOrButton) {
            this.attr("opacity", 0);
            deleteBtnIcon.attr("opacity", 0);
            // 恢复原始样式
            this.attr({ fill: "#fff" });
            deleteBtnIcon.attr({ fill: "#F56C6C" });
            hideTimer = null;
          }
        }, 1000);
      });

      // 删除按钮图标的鼠标离开事件
      deleteBtnIcon.on("mouseleave", function () {
        isMouseOnTextOrButton = false;
        // 延迟隐藏按钮
        hideTimer = setTimeout(() => {
          if (!isMouseOnTextOrButton) {
            deleteBtnBg.attr("opacity", 0);
            this.attr("opacity", 0);
            // 恢复原始样式
            deleteBtnBg.attr({ fill: "#fff" });
            this.attr({ fill: "#F56C6C" });
            hideTimer = null;
          }
        }, 1000);
      });

      // 删除按钮点击事件
      deleteBtnBg.on("click", function (e) {
        e.stopPropagation(); // 阻止事件冒泡
        if (vm && vm.graph) {
          // 记录删除前的数据状态用于撤销操作
          let historyData = JSON.stringify(vm.graph.save());
          let key = `graph_history_${vm.historyIndex}`;
          vm.addHistoryData(key, historyData);

          // 删除节点
          vm.graph.removeItem(cfg.id);

          // 记录删除后的数据状态
          if (vm.undoCount > 0) {
            vm.historyIndex = vm.historyIndex - vm.undoCount;
            for (let i = 1; i <= vm.undoCount; i++) {
              let historyKey = `graph_history_${vm.historyIndex + i}`;
              vm.removeHistoryData(historyKey);
            }
            vm.undoCount = 0;
          }
          vm.historyIndex += 1;
          key = `graph_history_${vm.historyIndex}`;
          let currentData = JSON.stringify(vm.graph.save());
          vm.addHistoryData(key, currentData);
        }
      });

      deleteBtnIcon.on("click", function (e) {
        e.stopPropagation(); // 阻止事件冒泡
        if (vm && vm.graph) {
          // 记录删除前的数据状态用于撤销操作
          let historyData = JSON.stringify(vm.graph.save());
          let key = `graph_history_${vm.historyIndex}`;
          vm.addHistoryData(key, historyData);

          // 删除节点
          vm.graph.removeItem(cfg.id);

          // 记录删除后的数据状态
          if (vm.undoCount > 0) {
            vm.historyIndex = vm.historyIndex - vm.undoCount;
            for (let i = 1; i <= vm.undoCount; i++) {
              let historyKey = `graph_history_${vm.historyIndex + i}`;
              vm.removeHistoryData(historyKey);
            }
            vm.undoCount = 0;
          }
          vm.historyIndex += 1;
          key = `graph_history_${vm.historyIndex}`;
          let currentData = JSON.stringify(vm.graph.save());
          vm.addHistoryData(key, currentData);
        }
      });
    },

    update(cfg, node) {
      const group = node.getContainer();
      const textShape = group.find((ele) => ele.get("name") === "text-shape");

      if (textShape) {
        textShape.attr({
          text: cfg.label || "双击编辑文字",
          fontSize: cfg.style.fontSize || 14,
          fill: cfg.style.fill || "#333",
          fontWeight: cfg.style.fontWeight || "normal",
        });
      }
    },

    // 监听双击事件
    setState(name, value, item) {
      const group = item.getContainer();
      const textShape = group.find((ele) => ele.get("name") === "text-shape");
      if (textShape && name === "dblclick") {
        const graph = item.getGraph();
        graph.emit("node:dblclick", { item });
      }
    },
  },
  extendName: "rect",
  sendThis,
};

export default nodeObj;
