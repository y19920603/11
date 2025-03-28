<template>
  <div class="layout" :class="layoutClass">
    <div v-if="isMobile && isSidebarOpen" class="layout__overlay" @click="handleCloseSidebar" />

    <NavBar />

    <div :class="{ hasTagsView: isShowTagsView }" class="layout__main">
      <Sidebar class="layout__sidebar" />
      <TagsView v-if="isShowTagsView" />
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
// 状态管理
import { useAppStore, useSettingsStore, usePermissionStore } from "@/store";

// 枚举
import { DeviceEnum } from "@/enums/settings/device.enum";

// 组件
import NavBar from "./components/NavBar/index.vue";

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const permissionStore = usePermissionStore();
const width = useWindowSize().width;

// 常量
const WIDTH_DESKTOP = 992; // 响应式布局容器固定宽度（大屏 >=1200px，中屏 >=992px，小屏 >=768px）

// 计算属性
const isMobile = computed(() => appStore.device === DeviceEnum.MOBILE); // 是否为移动设备
const isSidebarOpen = computed(() => appStore.sidebar.opened); // 侧边栏是否展开
const isShowTagsView = computed(() => settingsStore.tagsView); // 是否显示标签视图
const activeTopMenuPath = computed(() => appStore.activeTopMenuPath); // 顶部菜单激活路径

// 监听顶部菜单激活路径变化，更新混合布局左侧菜单路由
watch(
  () => activeTopMenuPath.value,
  (newVal: string) => {
    permissionStore.setMixedLayoutLeftRoutes(newVal);
  },
  { deep: true, immediate: true }
);

// 监听窗口宽度变化，调整设备类型和侧边栏状态
watchEffect(() => {
  const isDesktop = width.value >= WIDTH_DESKTOP;
  appStore.toggleDevice(isDesktop ? DeviceEnum.DESKTOP : DeviceEnum.MOBILE);
  if (isDesktop) {
    appStore.openSideBar();
  } else {
    appStore.closeSideBar();
  }
});

// 监听路由变化，如果是移动设备且侧边栏展开，则关闭侧边栏
const route = useRoute();
watch(route, () => {
  if (isMobile.value && isSidebarOpen.value) {
    appStore.closeSideBar();
  }
});

// 计算属性：布局样式
const layoutClass = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  openSidebar: appStore.sidebar.opened,
  mobile: appStore.device === DeviceEnum.MOBILE,
  [`layout-${settingsStore.layout}`]: true,
}));

/**
 * 处理遮罩层点击事件，关闭侧边栏
 */
function handleCloseSidebar() {
  appStore.closeSideBar();
}
</script>
<style lang="scss" scoped>
.layout {
  width: 100%;
  height: 100%;

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }

  &__sidebar {
    position: fixed;
    top: $navbar-height;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: $sidebar-width;
    background-color: $menu-background;
    transition: width 0.28s;

    :deep(.el-menu) {
      border: none;
    }
  }

  &__main {
    position: relative;
    margin-left: $sidebar-width;
    overflow-y: auto;
    transition: margin-left 0.28s;

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      transition: width 0.28s;
    }
  }
}

// 占位符选择器
%layout__sidebar--horizontal {
  width: 100% !important;
  height: $navbar-height;

  :deep(.el-scrollbar) {
    flex: 1;
    height: $navbar-height;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title),
  :deep(.el-menu--horizontal) {
    height: $navbar-height;
    line-height: $navbar-height;
  }
}

.layout-top {
  .layout__sidebar {
    position: sticky;
    display: flex;
    @extend %layout__sidebar--horizontal;
  }

  .layout__main {
    height: calc(100vh - $navbar-height);
    margin-left: 0;
  }
}

.layout-mix {
  .layout__sidebar {
    @extend %layout__sidebar--horizontal;
  }

  .layout__container {
    display: flex;
    height: 100%;
    padding-top: $navbar-height;

    .layout__sidebar--left {
      position: relative;
      width: $sidebar-width;
      height: 100%;
      background-color: var(--menu-background);

      :deep(.el-scrollbar) {
        height: calc(100vh - $navbar-height - 50px);
      }

      :deep(.el-menu) {
        height: 100%;
        border: none;
      }

      .layout__sidebar-toggle {
        position: absolute;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 50px;
        line-height: 50px;
        box-shadow: 0 0 6px -2px var(--el-color-primary);
      }
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      margin-left: 0;
    }
  }
}

.hideSidebar {
  &.layout-left {
    .layout__main {
      margin-left: $sidebar-width-collapsed;
    }
  }

  &.layout-top {
    .layout__main {
      margin-left: 0;
    }
  }

  &.layout-mix {
    .layout__sidebar {
      width: 100%;
    }

    .layout__container {
      .layout__sidebar--left {
        width: $sidebar-width-collapsed;
      }
    }
  }
}

.layout-left {
  &.hideSidebar {
    .layout__sidebar {
      width: $sidebar-width-collapsed;
    }

    .layout__main {
      margin-left: $sidebar-width-collapsed;
    }

    &.mobile {
      .layout__sidebar {
        pointer-events: none;
        transform: translate3d(-$sidebar-width, 0, 0);
        transition-duration: 0.3s;
      }

      .layout__main {
        margin-left: 0;
      }
    }
  }
  &.openSidebar {
    &.mobile {
      .layout__main {
        margin-left: 0;
      }
    }
  }
}
</style>
