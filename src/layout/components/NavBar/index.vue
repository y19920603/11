<template>
  <div class="flex justify-between h-[var(--navbar-height)] bg-[var(--el-bg-color)]">
    <div class="flex items-center">
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
    </div>
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";

const appStore = useAppStore();

const isSidebarOpened = computed(() => appStore.sidebar.opened);

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>
