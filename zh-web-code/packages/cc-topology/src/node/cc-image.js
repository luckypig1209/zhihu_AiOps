/**
 * @author: wenyuan
 * @data: 2019/07/05
 * @repository: https://github.com/wenyuan
 * @description: 图片节点
 */

import utils from "../utils";

// 用来获取调用此js的vue组件实例（this）
let vm = null;

const sendThis = (_this) => {
  vm = _this;
};

export default {
  sendThis,
  name: "cc-image",
  extendName: "image",
  options: {
    // 自定义文本渲染，支持自动换行
    drawLabel(cfg, group) {
      if (!cfg.label) return;

      // 获取节点大小
      const size = this.getSize(cfg) || [44, 44];
      const width = size[0];
      const height = size[1];

      // 设置文本最大宽度和字体大小
      const maxWidth = 100;
      const fontSize = cfg.labelCfg?.style?.fontSize || 14; // 支持自定义字体大小
      const fontWeight = cfg.labelCfg?.style?.fontWeight || "normal"; // 支持自定义字体粗细

      // 确定文本颜色优先级：1. labelCfg.style.fill 2. 预览模式+token的白色 3. 默认黑色
      let textColor = "#000"; // 默认黑色
      
      if (cfg.labelCfg?.style?.fill) {
        // 优先使用自定义颜色
        textColor = cfg.labelCfg.style.fill;
      } else if (vm && vm.graphMode === "preview" && vm.hasToken) {
        // 预览模式且有token时使用白色
        textColor = "#fff";
      }
      // 否则使用默认黑色

      // 处理文本换行
      let labelText = cfg.label;
      let textArray = [];

      // 简单的中文和英文混合文本换行处理，限制最多两行
      if (labelText.length > 10) {
        // 按字符拆分并重组为最多两行
        const chars = labelText.split("");
        let currentLine = "";
        let charCount = 0;

        for (let i = 0; i < chars.length; i++) {
          // 检查是否已经有第一行了
          if (textArray.length === 1) {
            // 第二行显示剩余所有文本
            currentLine = labelText.substring(i);
            textArray.push(currentLine);
            break;
          }

          currentLine += chars[i];
          charCount++;

          // 中文字符算2个单位，英文字符算1个单位
          if (/[\u4e00-\u9fa5]/.test(chars[i])) {
            charCount++;
          }

          // 当达到最大宽度或遇到空格时换行（第一行）
          if (charCount >= (maxWidth / fontSize) * 2 || chars[i] === " ") {
            textArray.push(currentLine);
            currentLine = "";
            charCount = 0;
          }
        }

        if (currentLine && textArray.length === 0) {
          textArray.push(currentLine);
        }
      } else {
        textArray = [labelText];
      }

      // 确保最多只有两行
      if (textArray.length > 2) {
        textArray = textArray.slice(0, 2);
      }

      // 根据标签位置计算Y轴起始位置
      let y;
      const position = cfg.labelCfg?.position || "bottom";
      
      switch (position) {
        case "top":
          y = -height / 2 - 5; // 节点上方
          break;
        case "left":
          y = 0; // 左侧居中，具体位置由每行文本控制
          break;
        case "right":
          y = 0; // 右侧居中，具体位置由每行文本控制
          break;
        case "center":
          y = 0; // 中心位置，具体位置由每行文本控制
          break;
        case "bottom":
        default:
          y = height / 2 + 5; // 默认底部
          break;
      }

      // 计算文本对齐方式
      let textAlign = "center";
      if (position === "left") textAlign = "left";
      if (position === "right") textAlign = "right";

      // 绘制每行文本
      textArray.forEach((text, index) => {
        let textY = y;
        let textX = 0;
        
        // 根据位置调整文本位置
        switch (position) {
          case "top":
            textY += (index + 1) * (fontSize + 2);
            break;
          case "left":
            textX = -width / 2 - 5;
            textY = index * (fontSize + 2) - (textArray.length * fontSize) / 2;
            break;
          case "right":
            textX = width / 2 + 5;
            textY = index * (fontSize + 2) - (textArray.length * fontSize) / 2;
            break;
          case "center":
            textY = index * (fontSize + 2) - (textArray.length * fontSize) / 2;
            break;
          case "bottom":
          default:
            textY += (index + 1) * (fontSize + 2);
            break;
        }

        group.addShape("text", {
          attrs: {
            text: text,
            x: textX,
            y: textY,
            fill: textColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
            textAlign: textAlign,
            textBaseline: position === "top" ? "bottom" : 
                         position === "bottom" ? "top" : "middle",
            maxWidth: maxWidth,
          },
          name: `label-${index}`,
        });
      });

      // 返回标签组
      return group;
    },
    // 设置节点大小
    getSize(cfg) {
      const size = cfg.size || [44, 44];
      return size;
    },
    setState(name, value, item) {
      // 设置节点状态
      utils.node.setState(name, value, item);
      // 设置锚点状态
      if (vm.graphMode === "edit") {
        utils.anchor.setState(name, value, item);
      }
    },
    // 绘制后附加锚点和删除按钮
    afterDraw(cfg, group) {
      // 绘制锚点
      if (vm.graphMode === "edit") {
        utils.anchor.draw(cfg, group);

        // 添加左侧圆形删除按钮（默认隐藏，鼠标悬停节点时显示）
        let size = this.getSize(cfg);
        let width = size[0];
        let height = size[1];
        let { id } = cfg;

        // 删除按钮背景圆 - 减小尺寸
        let deleteBtnBg = group.addShape("circle", {
          id: id + "_delete_btn_bg",
          attrs: {
            name: "deleteBtnBg",
            x: -width / 2 - 10, // 位于节点左侧
            y: -height / 2 + 10,
            r: 6, // 减小半径
            fill: "#fff",
            stroke: "#F56C6C",
            lineWidth: 1,
            opacity: 0, // 默认隐藏
          },
          draggable: false,
          name: "deleteBtnBg",
          zIndex: 10,
        });

        // 删除按钮中的X图标 - 减小尺寸
        let deleteBtnIcon = group.addShape("text", {
          id: id + "_delete_btn_icon",
          attrs: {
            name: "deleteBtnIcon",
            x: -width / 2 - 10,
            y: -height / 2 + 11, // 向上移动1px
            text: "×",
            fontSize: 10, // 减小字体
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

        // 确保鼠标在按钮上时不隐藏
        let isMouseOnButton = false;

        // 鼠标悬停效果
        deleteBtnBg.on("mouseenter", function () {
          // 设置标志，表示鼠标在按钮上
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
          deleteBtnIcon.attr({
            fill: "#fff",
            opacity: 1,
          });
        });

        deleteBtnBg.on("mouseleave", function () {
          // 设置标志，表示鼠标离开按钮
          isMouseOnButton = false;

          // 延迟隐藏，鼠标移开后0.5秒再隐藏
          hideTimer = setTimeout(() => {
            deleteBtnBg.attr({ opacity: 0 });
            deleteBtnIcon.attr({ opacity: 0 });
            // 恢复原始样式
            deleteBtnBg.attr({
              fill: "#fff",
            });
            deleteBtnIcon.attr({
              fill: "#F56C6C",
            });
            hideTimer = null;
          }, 1000);
        });

        // 获取节点主图形
        let nodeMainShape = group.getFirst();
        if (nodeMainShape) {
          // 鼠标移动到节点时显示删除按钮
          nodeMainShape.on("mouseenter", function () {
            // 清除可能存在的隐藏计时器
            if (hideTimer) {
              clearTimeout(hideTimer);
              hideTimer = null;
            }
            deleteBtnBg.attr({ opacity: 1 });
            deleteBtnIcon.attr({ opacity: 1 });
          });

          // 鼠标离开节点时隐藏删除按钮
          // 延迟隐藏，鼠标移开后0.5秒再隐藏
          nodeMainShape.on("mouseleave", function () {
            hideTimer = setTimeout(() => {
              // 只有当鼠标不在按钮上时才隐藏
              if (!isMouseOnButton) {
                deleteBtnBg.attr({ opacity: 0 });
                deleteBtnIcon.attr({ opacity: 0 });
              }
              hideTimer = null;
            }, 1000);
          });
        }

        // 点击删除按钮，调用vue组件的删除方法
        deleteBtnBg.on("click", function (e) {
          e.stopPropagation(); // 阻止事件冒泡，避免触发节点选中
          if (vm && vm.deleteNodeWithEdges) {
            vm.deleteNodeWithEdges(id);
          }
        });

        deleteBtnIcon.on("click", function (e) {
          e.stopPropagation(); // 阻止事件冒泡
          if (vm && vm.deleteNodeWithEdges) {
            vm.deleteNodeWithEdges(id);
          }
        });
      }
    },
    // 设置告警状态和在线状态样式
    afterUpdate(cfg, node) {
      const group = node.getContainer();

      // 移除旧的标签，让自定义drawLabel重新绘制
      const oldLabels = group.getChildren().filter(child => {
        const name = child.get('name');
        return typeof name === 'string' && name.startsWith('label-');
      });
      oldLabels.forEach(label => {
        group.removeChild(label);
      });

      // 重新绘制标签
      this.drawLabel(cfg, group);
      // 获取告警光环
      const halos = group.findAll(function (item) {
        return item.attrs.name === "halo";
      });

      // 获取节点主图形
      const mainShape = group.getFirst();

      // 处理不同在线状态的样式
      if (mainShape) {
        // 优先检查deviceInfo中的onlineStatus，然后再检查assetData
        const deviceInfoStatus = cfg.deviceInfo?.onlineStatus;
        const assetDataStatus = cfg.assetData?.onlineStatus;
        const onlineStatus = deviceInfoStatus ?? assetDataStatus;

        // 添加调试日志
        console.log("节点状态检查:", {
          nodeId: cfg.id,
          deviceInfoStatus: deviceInfoStatus,
          assetDataStatus: assetDataStatus,
          usedStatus: onlineStatus,
        });

        if (onlineStatus === 0 || onlineStatus === 3) {
          // 在线状态为0（未监控）或3（异常）时，设置为灰色
          console.log("设置节点为异常状态，opacity=0.6");
          mainShape.attr({ opacity: 0.6 }); // 降低透明度
          // 如果是图片节点，添加灰度滤镜
          if (mainShape.attrs.img) {
            mainShape.attr({ filter: "grayscale(1)" });
          }
        } else if (onlineStatus === 1) {
          // onlineStatus为1时，正常显示（不应该有红色告警）
          console.log("设置节点为正常状态，opacity=1");
          mainShape.attr({ opacity: 1 });
          if (mainShape.attrs.img) {
            mainShape.attr({ filter: "" });
          }
        } else {
          // 其他状态，默认正常显示
          mainShape.attr({ opacity: 1 });
          if (mainShape.attrs.img) {
            mainShape.attr({ filter: "" });
          }
        }
      }

      // 告警：当onlineStatus不等于1且appState.alert为true，或者onlineStatus等于2时显示告警光环
      // 优先检查deviceInfo中的onlineStatus，然后再检查assetData
      const deviceInfoAlertStatus = cfg.deviceInfo?.onlineStatus;
      const assetDataAlertStatus = cfg.assetData?.onlineStatus;
      const alertOnlineStatus = deviceInfoAlertStatus ?? assetDataAlertStatus;

      // 计算是否应该显示告警：只有当onlineStatus不为1时，才考虑alert状态
      const shouldShowAlert =
        (alertOnlineStatus !== 1 && cfg.appState && cfg.appState.alert) ||
        alertOnlineStatus === 2;

      // 添加调试日志
      console.log("告警状态检查:", {
        nodeId: cfg.id,
        deviceInfoAlertStatus: deviceInfoAlertStatus,
        assetDataAlertStatus: assetDataAlertStatus,
        alertOnlineStatus: alertOnlineStatus,
        appStateAlert: cfg.appState?.alert,
        shouldShowAlert: shouldShowAlert,
      });

      if (shouldShowAlert) {
        if (halos.length > 0) {
          return;
        }
        // 使用动态获取的节点大小，而不是硬编码值
        let size = this.getSize(cfg);
        let r = size[0] / 2;
        let { id } = cfg;
        let halo1 = group.addShape("circle", {
          id: id + "_halo_" + 1,
          attrs: {
            name: "halo",
            x: 0,
            y: 0,
            r: r,
            fill: cfg.color || "#F56C6C",
            opacity: 0.6,
          },
          name: "halo",
          zIndex: -3,
        });
        let halo2 = group.addShape("circle", {
          id: id + "_halo_" + 2,
          attrs: {
            name: "halo",
            x: 0,
            y: 0,
            r: r,
            fill: cfg.color || "#F56C6C",
            opacity: 0.6,
          },
          name: "halo",
          zIndex: -2,
        });
        let halo3 = group.addShape("circle", {
          id: id + "_halo_" + 3,
          attrs: {
            name: "halo",
            x: 0,
            y: 0,
            r: r,
            fill: cfg.color || "#F56C6C",
            opacity: 0.6,
          },
          name: "halo",
          zIndex: -1,
        });
        group.sort(); // 排序，根据zIndex 排序
        halo1.animate(
          {
            // 逐渐放大，并消失
            r: r + 10,
            opacity: 0.1,
          },
          {
            repeat: true, // 循环
            duration: 3000,
            easing: "easeCubic",
            delay: 0, // 无延迟
          }
        );
        halo2.animate(
          {
            // 逐渐放大，并消失
            r: r + 10,
            opacity: 0.1,
          },
          {
            repeat: true, // 循环
            duration: 3000,
            easing: "easeCubic",
            delay: 1000, // 1 秒延迟
          }
        );
        halo3.animate(
          {
            // 逐渐放大，并消失
            r: r + 10,
            opacity: 0.1,
          },
          {
            repeat: true, // 循环
            duration: 3000,
            easing: "easeCubic",
            delay: 2000, // 2 秒延迟
          }
        );
      } else {
        halos.forEach((halo) => {
          group.removeChild(halo);
        });
      }
    },
  },
};