<!-- 菜单组件 -->
<template>
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
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <!-- 菜单项 -->
    <SidebarMenuItem
      v-for="route in data"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";

import { LayoutMode } from "@/enums/settings/layout.enum";
import { SidebarColor } from "@/enums/settings/theme.enum";
import { useSettingsStore, useAppStore } from "@/store";
import { isExternal } from "@/utils/index";

import variables from "@/styles/variables.module.scss";

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
  background-image: url("@/assets/menus/arrow.png");
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
}
</style>
