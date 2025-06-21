<template>
  <template v-if="settingsStore.isMultiScreen">
    <SplitLayout />
  </template>
  <template v-else>
    <SplitPaneContent paneKey="-single" />
  </template>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);
}
</style>
