<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :style="{'--theme': theme}" :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="(child, index) in item.children"
        :key="child.path + index"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        :class="sideTheme == 'theme-dark' ? 'nest-menu theme-dark' : 'nest-menu theme-light'"
      />
    </el-submenu>
  </div>
</template>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  computed: {
    sideTheme() {
      return this.$store.state.settings.sideTheme
    },
    theme() {
      return this.$store.state.settings.theme
    }
  },
  data() {
    this.onlyOneChild = null
    return {}
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      if (!children) {
        children = [];
      }
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
<style lang="scss">
.sidebar-container .el-icon-arrow-down::before{
  content: "\e6e0";
}
.el-submenu.is-opened > .el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(90deg) !important;
}
.theme-dark .el-menu .theme-light .el-menu {
  box-sizing: border-box;
 
}
.theme-dark .el-menu-item,.theme-dark .el-submenu__title {
  // margin: 4px 0;
  font-size: 16px !important;
  height: 58px;
  line-height: 52px !important;
  svg {
    font-size: 20px !important;
    vertical-align: middle;
    //  display: none;
  }
}
.theme-dark .nest-menu .el-menu-item {
  font-size: 16px !important;
  height: 58px;
  line-height: 52px !important;
  svg {
      font-size: 20px !important;
      vertical-align: middle;
    }
}
.theme-light .el-menu-item,.theme-light .el-submenu__title {
    margin: 4px 20px 4px 20px;
    border-radius: 0;
    font-size: 16px !important;
    line-height: 50px !important;
    color: #75829A !important;
    svg {
      font-size: 20px !important;
      vertical-align: middle;
      //  display: none;
    }
}
.theme-light .el-menu-item:hover {
  color: #75829A !important;
  // background: linear-gradient(270deg, var(--theme) 0%, var(--theme) 100%)!important;
  // box-shadow: 0px 4px 14px 0px rgba(113,156,238,0.5);
}
.theme-light .el-menu-item.is-active {
  // color: #fff !important;
  color: #1890ff !important;
  border-right: 2px solid #1890ff;
  // background-color: var(--theme) !important;
  background-color: #e6f7ff !important;
  // box-shadow: 0px 4px 14px 0px rgba(113,156,238,0.5);
}
.theme-light .el-menu-item.is-active:hover {
  color: #fff !important;
  background: linear-gradient(270deg, var(--theme) 0%, var(--theme) 100%)!important;
}
.theme-light .nest-menu .el-menu-item {
  margin: 4px 20px 4px 20px;
  border-radius: 0;
  font-size: 16px !important;
  line-height: 41px !important;
  padding: 0 10px 0 50px !important;
  svg {
      font-size: 20px !important;
      vertical-align: middle;
    }
}
.hideSidebar .theme-light .nest-menu .el-menu-item {
  margin: 4px 10px 4px 10px !important;
}
.hideSidebar .theme-light .el-menu-item,.hideSidebar .theme-light .el-submenu__title {
  margin: 4px 20px 4px 20px !important;
}
.hideSidebar .theme-dark .nest-menu .el-menu-item {
  margin: 4px 10px 4px 10px !important;
}
.hideSidebar .theme-dark .el-menu-item,.hideSidebar .theme-dark .el-submenu__title {
  margin: 4px 20px 4px 20px !important;
}
.el-menu--vertical .theme-light .el-menu-item {
  margin: 4px 20px 4px 20px;
  border-radius: 0;
  font-size: 14px !important;
  svg {
    font-size: 20px !important;
    vertical-align: middle;
    // display: none;
  }
  &:hover {
    color: #75829A !important;
  }
}
.el-menu--vertical .theme-light .el-menu-item.is-active  {
  background-color: var(--theme) !important;
  color: #fff !important;
  box-shadow: 0px 4px 14px 0px rgba(113,156,238,0.5);
}
.el-submenu .theme-light .el-submenu__title {
  margin: 4px 20px 4px 20px !important;
}
#app .sidebar-container .theme-light .nest-menu .el-submenu > .el-submenu__title {
  min-width: 100px !important
}
</style>
