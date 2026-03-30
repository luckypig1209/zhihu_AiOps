<template>
  <div class="scroll-container" ref="tableContainer">
    <el-table
      :data="tableData"
      height="185px"
      style="width: 100%"
      class="borderless-table"
      @mouseenter.native="pauseScroll"
      @mouseleave.native="resumeScroll"
    >
      <el-table-column
        prop="companyName"
        label="用户名"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="resourceName"
        label="资源池名称"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="typeName"
        label="应用类型"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="cpuNum"
        label="CPU数"
        width="120"
      ></el-table-column>
      <el-table-column
        prop="storageNum"
        label="存储数量"
        width="120"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getUserTrade } from "@/api/screen";
export default {
  data() {
    return {
      tableData: [],
      scrollInterval: null,
      isScrolling: true,
      currentPosition: 0,
      isSmoothReturning: false,
    };
  },
  mounted() {
    this.generateMockData();
    this.initScroll();
  },
  beforeDestroy() {
    this.clearScroll();
  },
  methods: {
    generateMockData() {
      getUserTrade().then((res) => {
        if (res.code == 0) {
          this.tableData = res.data;
        }
      });
    },

    initScroll() {
      const container = this.$refs.tableContainer;
      const tableBody = container.querySelector(".el-table__body-wrapper");

      // 初始化容器高度
      container.style.height = "185px";
      tableBody.style.overflowY = "hidden";

      this.scrollInterval = setInterval(() => {
        if (!this.isScrolling || this.isSmoothReturning) return;

        this.currentPosition += 45;
        tableBody.scrollTop = this.currentPosition;

        // 滚动到底部检测
        if (
          this.currentPosition >=
          tableBody.scrollHeight - tableBody.clientHeight
        ) {
          this.smoothReturnToTop(tableBody);
        }
      }, 2000);
    },

    smoothReturnToTop(element) {
      this.isSmoothReturning = true;
      const duration = 1000; // 动画持续时间
      const startTime = Date.now();
      const startPosition = element.scrollTop;

      const animate = () => {
        if (!this.isSmoothReturning) return;

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        element.scrollTop = startPosition * (1 - easeInOutQuad(progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.currentPosition = 0;
          this.isSmoothReturning = false;
        }
      };

      const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      requestAnimationFrame(animate);
    },

    pauseScroll() {
      this.isScrolling = false;
      this.isSmoothReturning = false;
    },

    resumeScroll() {
      this.isScrolling = true;
    },

    clearScroll() {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    },
  },
};
</script>

<style scoped>
.scroll-container {
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  top: -36px;
  left: 52px;
}
.borderless-table::v-deep {
  /* 去除表格外边框 */
  .el-table {
    border: none !important;

    /* 去除单元格边框 */
    td,
    th {
      border: none !important;
    }

    /* 去除表头下划线 */
    &::before,
    &::after {
      display: none !important;
    }

    /* 去除行间分割线 */
    .el-table__row {
      border-bottom: none !important;

      &::after {
        display: none !important;
      }
    }

    /* 去除固定列阴影 */
    .el-table__fixed-right::before,
    .el-table__fixed::before {
      display: none !important;
    }
  }

  /* 调整单元格内边距 */
  .el-table__header-wrapper .cell,
  .el-table__body-wrapper .cell {
    padding: 8px 10px;
  }
}

/* 隐藏原生滚动条 */
.el-table::before,
.el-table__body-wrapper::-webkit-scrollbar {
  display: none !important;
}

/* 自定义悬停效果 */
.el-table__body tr:hover > td {
  background-color: rgba(64, 158, 255, 0.08) !important;
}
::v-deep .el-table {
  background: transparent;
}
::v-deep .el-table_expanded-cell {
  background: transparent;
}
::v-deep .el-table th {
  background: transparent;
}
::v-deep .el-table tr {
  background: transparent;
}
::v-deep .el-table td {
  background: transparent;
}
::v-deep.el-table--border {
  border-right: none !important;
  border-bottom: none !important;
}
::v-deep.el-table--border {
  border: 0px solid #004a99;
}
::v-deep.el-table::before {
  background-color: #004a99;
}
::v-deep.el-table::after {
  background-color: #004a99;
}
::v-deep.el-table colgroup col[name="gutter"] {
  background: transparent;
  width: 0px;
  display: none;
}
::v-deep.el-table th.el-table__cell.is-leaf {
  height: 64px;
  font-size: 16px;
  background: transparent;
  border-right: none;
  border-bottom: 0px solid #004a99;
  color: #fafffc;
  box-shadow: 0 0px 0 0 #eef1f3 inset !important;
}
::v-deep .el-table__body td.el-table__cell {
  font-size: 16px;
  height: 45px;
  padding: 0 0 8px 0 !important;
  border-right: none;
  background-color: transparent !important;
  color: #fafffc;
  border-bottom: 0px solid #223c72;
  box-shadow: 0 0px 0 0 #eef1f3 inset !important;
}
::v-deep.el-table th.el-table__cell {
  background: transparent;
  border-bottom: 0px solid #004a99 !important;
  box-shadow: 0 0px 0 0 #eef1f3 inset !important;
}
::v-deep.el-table--border,
.el-table--group {
  border: 0px solid #004a99;
}
::v-deep.el-table__body,
.el-table__footer,
.el-table__header {
  width: 100% !important;
}
::v-deep.el-table--enable-row-hover
  .el-table__body
  tr:hover
  > td.el-table__cell {
  background-color: transparent !important;
  box-shadow: 0 0px 0 0 #eef1f3 inset !important;
}
::v-deep.el-table--border th.el-table__cell.gutter:last-of-type {
  width: 0px !important ;
  box-shadow: 0 0px 0 0 #eef1f3 inset !important;
}
::v-deep.el-table th.el-table__cell > .cell {
  font-family: AlibabaPuHuiTi_3_105_Heavy;
  font-weight: 900;
  font-size: 20px;
  color: #ffffff;
  padding-left: 36px;
  /* 设置渐变色背景 */
  background: -webkit-linear-gradient(left, #fff 0%, #90deff 100%);
  background: linear-gradient(to bottom, #fff 0%, #90deff 100%);
  /* 应用背景裁剪 */
  -webkit-background-clip: text;
  background-clip: text;
  /* 设置文字颜色为透明，以便显示背景色（即渐变色） */
  color: transparent;
  /* 确保文字不被裁剪溢出 */
  display: inline;
}
</style>
