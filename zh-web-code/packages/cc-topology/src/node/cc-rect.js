/**
 * @author: wenyuan
 * @data: 2019/07/05
 * @repository: https://github.com/wenyuan
 * @description: 矩形节点
 */

import base from "./base";
import theme from "../theme";

// 用来获取调用此js的vue组件实例（this）
let vm = null;

const sendThis = (_this) => {
  vm = _this;
};

export default {
  sendThis,
  name: "cc-rect",
  extendName: "rect",
  options: {
    ...base,
    // 设置节点大小
    getSize(cfg) {
      const size = cfg.size || [44, 44]; // 增大默认大小
      return size;
    },
    // 自定义文本渲染，支持自动换行
    drawLabel(cfg, group) {
      if (!cfg.label) return;

      // 获取节点大小
      const size = this.getSize(cfg) || [44, 44];
      const width = size[0];
      const height = size[1];

      // 设置文本最大宽度和字体大小
      const maxWidth = 100;
      const fontSize = 14; // 增大字体大小

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

      // 计算文本位置（位于节点底部）
      let y = height / 2 + 5; // 从节点底部开始

      // 绘制每行文本
      textArray.forEach((text, index) => {
        // 每行文本向下偏移
        y += (index + 1) * (fontSize + 2); // 调整行间距

        group.addShape("text", {
        attrs: {
          text: text,
          x: 0,
          y: y,
          fill: vm && vm.graphMode === "preview" && vm.hasToken ? "#fff" : "#000", // 预览模式下文字为白色
          fontSize: fontSize,
          textAlign: "center",
          textBaseline: "top",
          maxWidth: maxWidth,
          fontWeight: "normal", // 确保字体变细
        },
        name: `label-${index}`,
      });
      });

      // 返回标签组
      return group;
    },
    getShapeStyle(cfg) {
      const size = this.getSize(cfg) || [44, 44];
      const width = size[0];
      const height = size[1];
      const themeStyle = theme.defaultStyle; // todo...先使用默认主题，后期可能增加其它风格的主体
      const style = {
        x: 0 - width / 2,
        y: 0 - height / 2,
        width: width,
        height: height,
        ...themeStyle.nodeStyle.default,
      };
      return style;
    },
    // 更新时重新绘制标签
    afterUpdate(cfg, node) {
      const group = node.getContainer();

      // 移除旧的标签
      const oldLabels = group.findAll(function (item) {
        return item.attrs.name && item.attrs.name.startsWith("label-");
      });
      oldLabels.forEach((label) => {
        group.removeChild(label);
      });

      // 重新绘制标签
      this.drawLabel(cfg, group);
    },
  },
};
