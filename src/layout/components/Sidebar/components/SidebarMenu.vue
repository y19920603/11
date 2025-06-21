<!-- 菜单组件 -->
<template>
  <div
    ref="sidebarDiv"
    class="sidebar-container"
    :class="appStore.sidebar.opened ? 'min-w-[240px]!' : ''"
  >
    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        ref="menuRef"
        :collapse="!appStore.sidebar.opened"
        :background-color="
          theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
            ? variables['menu-background']
            : undefined
        "
        :text-color="
          theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
            ? variables['menu-text']
            : undefined
        "
        :active-text-color="
          theme === 'dark' || sidebarColorScheme === SidebarColor.CLASSIC_BLUE
            ? variables['menu-active-text']
            : undefined
        "
        :popper-effect="theme"
        :unique-opened="true"
        :collapse-transition="false"
        :mode="menuMode"
        class="sidebar-menu"
        :class="appStore.sidebar.opened ? 'px-2' : ''"
        @open="onMenuOpen"
        @close="onMenuClose"
      >
        <SidebarMenuItem
          v-for="route in data"
          :key="route.path"
          :item="route"
          :base-path="resolveFullPath(route.path)"
        />
      </el-menu>
    </el-scrollbar>
    <div v-if="appStore.sidebar.opened" class="version-info">
      <div>2025 © POKER MARS.</div>
      <div>{{ appInfo.pkg.version }}:{{ formatTime(appInfo.buildTimestamp) }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";

import { LayoutMode } from "@/enums/settings/layout.enum";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, useAppStore, useMenuStore } from "@/store";
import { isExternal } from "@/utils/index";

import variables from "@/styles/variables.module.scss";
import dayjs from "dayjs";

const sidebarDiv = ref(null);
let resizeObserver: ResizeObserver | null = null;

const menuStore = useMenuStore();

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      menuStore?.setMenuWidth(entry.contentRect.width.toString());
    }
  });

  if (sidebarDiv.value) {
    resizeObserver.observe(sidebarDiv.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && sidebarDiv.value) {
    resizeObserver.unobserve(sidebarDiv.value);
  }
  resizeObserver = null;
});

const appInfo = __APP_INFO__;

const formatTime = (timestamp: number) => dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss");

const props = defineProps({
  data: {
    type: Array<RouteRecordRaw>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
    example: "/system",
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();

const expandedMenuIndexes = ref<string[]>([]);

const menuMode = computed(() => {
  return settingsStore.layout === LayoutMode.TOP ? "horizontal" : "vertical";
});

const theme = computed(() => settingsStore.theme);

const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

function resolveFullPath(routePath: string) {
  if (!routePath) {
    return "";
  }

  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }

  return path.resolve(props.basePath, routePath);
}

const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

watch(
  () => menuMode.value,
  () => {
    if (menuMode.value === "horizontal") {
      expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
    }
  }
);

const openedState = ref(false);
provide("openedState", openedState);
</script>
<style scoped>
:deep(.el-icon svg) {
  display: none !important;
}

:deep(.el-icon) {
  background-image: url("@/assets/menu/arrow.png");
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 74px);
}

.sidebar-scrollbar {
  flex: 1 1 auto;
  min-height: 0;
}

.version-info {
  flex-shrink: 0;
  padding: 12px;
  font-size: 12px;
  color: #999;
  text-align: center;
  user-select: none;
  background-color: var(--menu-background, #fff);
}
</style>
