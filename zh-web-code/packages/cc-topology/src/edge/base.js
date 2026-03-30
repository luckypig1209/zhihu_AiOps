/**
 * @author: wenyuan
 * @data: 2019/07/18
 * @repository: https://github.com/wenyuan
 * @description: 线公共方法
 */

import utils from "../utils";

// 用来获取调用此js的vue组件实例（this）
let vm = null;

const sendThis = (_this) => {
  vm = _this;
};

export default {
  sendThis,
  drawShape(cfg, group) {
    const { startPoint, endPoint } = cfg;
    let style = cfg.style;
    // 使用主题样式中的线条配置，确保所有边类型样式一致
    style.stroke = style.stroke || "#A3B1BF"; // 默认使用主题中的颜色
    style.lineWidth = style.lineWidth || 2; // 默认使用主题中的线宽
    style.strokeOpacity = style.strokeOpacity || 0.92; // 默认使用主题中的透明度
    const keyShape = group.addShape("path", {
      className: "edge-shape",
      attrs: {
        ...style,
        path: [
          ["M", startPoint.x, startPoint.y],
          ["L", endPoint.x, endPoint.y],
        ],
      },
      name: "edge-shape",
    });

    // 添加蓝色圆点动画效果
    this.addAnimatedDots(cfg, group);

    return keyShape;
  },

  // 添加蓝色圆点动画效果
  addAnimatedDots(cfg, group) {
    const { startPoint, endPoint } = cfg;
    const midPoint = {
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2,
    };

    // 创建左侧蓝色圆点
    const leftDot = group.addShape("circle", {
      className: "edge-dot left-dot animated-dot",
      attrs: {
        x: startPoint.x,
        y: startPoint.y,
        r: 3,
        fill: "#1890ff",
      },
      name: "edge-dot-left",
    });

    // 创建右侧蓝色圆点
    const rightDot = group.addShape("circle", {
      className: "edge-dot right-dot animated-dot",
      attrs: {
        x: endPoint.x,
        y: endPoint.y,
        r: 3,
        fill: "#1890ff",
      },
      name: "edge-dot-right",
    });

    // 启动圆点动画
    this.startDotAnimation(leftDot, true); // 左侧圆点从起点到终点
    this.startDotAnimation(rightDot, false); // 右侧圆点从终点到起点
  },

  // 启动圆点动画
  startDotAnimation(dot, initialDirection = true) {
    // initialDirection: true 表示从起点到终点，false 表示从终点到起点
    // 获取父边元素
    const edge = dot.getParent();
    // 获取边的keyShape（路径）
    const keyShape = edge.find((ele) => ele.get("name") === "edge-shape");

    if (!keyShape) return;

    let startTime = null;
    // 基于边的唯一ID生成有规律的随机持续时间，范围在3000-6000毫秒之间
    const edgeId = edge.get("id");
    // 使用简单的哈希函数生成一个基于ID的数值
    let hash = 0;
    for (let i = 0; i < edgeId.length; i++) {
      const char = edgeId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    // 将哈希值映射到3000-6000毫秒的范围
    const duration = 3000 + Math.abs(hash % 3001); // 3000-6000毫秒
    let isMovingToEnd = initialDirection; // 使用传入的初始方向

    // 简单的缓动函数
    const easeInOut = (t) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOut(progress);

      // 根据移动方向确定位置参数
      const offset = isMovingToEnd ? easeProgress : 1 - easeProgress;

      // 获取路径上的点
      const point = keyShape.getPoint(offset);

      if (point) {
        // 更新圆点位置
        dot.attr({ x: point.x, y: point.y });
      }

      // 如果动画还没结束，继续请求下一帧
      if (progress < 1) {
        dot.animationId = requestAnimationFrame(animate);
      } else {
        // 动画结束，切换方向并重新开始
        isMovingToEnd = !isMovingToEnd;
        startTime = null;
        dot.animationId = requestAnimationFrame(animate);
      }
    };

    // 开始动画
    dot.animationId = requestAnimationFrame(animate);
  },
  // 绘制后不再自动创建删除按钮
  // 删除按钮将在线条完全创建并确定位置后通过手动调用addDeleteButton创建
  afterDraw(cfg, group) {
    // 只初始化必要的基础逻辑，不创建删除按钮
  },

  // 当边的位置更新时，同步更新删除按钮和动画圆点的位置
  updateShape(cfg, item) {
    const group = item.get("group");
    if (group) {
      // 更新删除按钮的位置
      if (cfg && item && item.get("edgeComplete")) {
        const deleteBtnBg = group.findById(cfg.id + "_delete_btn_bg");
        const deleteBtnIcon = group.findById(cfg.id + "_delete_btn_icon");

        if (deleteBtnBg && deleteBtnIcon) {
          // 计算新的中点位置
          const midPoint = {
            x: (cfg.startPoint.x + cfg.endPoint.x) / 2,
            y: (cfg.startPoint.y + cfg.endPoint.y) / 2 - 8, // 向上偏移一点，避免与边重叠
          };

          // 更新按钮位置
          deleteBtnBg.attr({ x: midPoint.x, y: midPoint.y });
          deleteBtnIcon.attr({ x: midPoint.x, y: midPoint.y + 1 });
        }
      }

      // 更新动画圆点的位置和动画参数
      const leftDot = group.find((ele) => ele.get("name") === "edge-dot-left");
      const rightDot = group.find(
        (ele) => ele.get("name") === "edge-dot-right"
      );

      // 动画已经直接使用边的路径，无需更新位置信息
      // 如果需要重置动画，可以在这里添加逻辑
    }
  },

  // 添加删除按钮的方法
  addDeleteButton: function (item) {
    // 检查是否为编辑模式
    if (!vm || vm.graphMode !== "edit") {
      return null;
    }

    // 检查item是否存在
    if (!item) {
      return null;
    }

    // 设置edgeComplete标志
    item.set("edgeComplete", true);

    // 获取配置和分组
    const cfg = item.get("model");
    const group = item.get("group");

    // 检查端点是否有效
    if (!cfg.startPoint || !cfg.endPoint) {
      return null;
    }

    // 计算中点位置
    const midPoint = {
      x: (cfg.startPoint.x + cfg.endPoint.x) / 2,
      y: (cfg.startPoint.y + cfg.endPoint.y) / 2 - 8, // 向上偏移一点，避免与边重叠
    };

    // 创建删除按钮背景圆
    const deleteBtnBg = group.addShape("circle", {
      id: cfg.id + "_delete_btn_bg",
      attrs: {
        name: "deleteBtnBg",
        x: midPoint.x,
        y: midPoint.y,
        r: 6, // 与节点删除按钮相同大小
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
        x: midPoint.x,
        y: midPoint.y + 1, // 稍微调整位置
        text: "×",
        fontSize: 10, // 与节点删除按钮相同大小
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
    let isMouseOnButton = false;

    // 添加鼠标事件处理
    // 边的鼠标进入事件
    const edgeShape = group.find((ele) => ele.get("name") === "edge-shape");
    if (edgeShape) {
      edgeShape.on("mouseenter", function () {
        // 清除可能存在的隐藏计时器
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
        // 显示删除按钮
        deleteBtnBg.attr("opacity", 1);
        deleteBtnIcon.attr("opacity", 1);
      });

      edgeShape.on("mouseleave", function () {
        // 延迟隐藏按钮
        if (!isMouseOnButton) {
          hideTimer = setTimeout(() => {
            deleteBtnBg.attr("opacity", 0);
            deleteBtnIcon.attr("opacity", 0);
            hideTimer = null;
          }, 1000);
        }
      });
    }

    // 删除按钮背景的鼠标进入事件
    deleteBtnBg.on("mouseenter", function () {
      isMouseOnButton = true;
      // 清除可能存在的隐藏计时器
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
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
      isMouseOnButton = true;
      // 清除可能存在的隐藏计时器
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
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
      isMouseOnButton = false;
      // 延迟隐藏按钮
      hideTimer = setTimeout(() => {
        if (!isMouseOnButton) {
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
      isMouseOnButton = false;
      // 延迟隐藏按钮
      hideTimer = setTimeout(() => {
        if (!isMouseOnButton) {
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

        // 删除边
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

        // 删除边
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

    // 返回按钮引用
    return { deleteBtnBg, deleteBtnIcon };
  },

  setState(name, value, item) {
    // 设置边状态
    utils.edge.setState(name, value, item);
  },
};
