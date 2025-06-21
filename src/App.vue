<template>
  <el-config-provider :size="size">
    <template v-if="hasLayout">
      <Layout></Layout>
    </template>
    <template v-else>
      <router-view />
    </template>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import { ComponentSize } from "@/enums/settings/layout.enum";
import Layout from "@/layout/index.vue";

const appStore = useAppStore();
const route = useRoute();
// const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const hasLayout = computed(() => route.meta.layout !== false); // 默认需要 Layout，除非meta中设置 layout: false
</script>
<style>
.el-input.is-disabled .el-input__wrapper,
.el-select__wrapper.is-disabled {
  background-color: #e5e5e5 !important;
}

.dark .el-input.is-disabled .el-input__wrapper,
.dark .el-select__wrapper.is-disabled {
  background-color: #252735 !important;
}

.dt-container.dt-empty-footer table.dataTable {
  border-bottom: 0px !important;
}

#searchFilter .el-select__wrapper,
#searchFilter .el-input__wrapper,
#dateFilter .el-input__wrapper {
  border-radius: 25px !important;
  padding-left: 20px !important;
  background-color: var(--el-bg-color) !important;
  box-shadow: none !important;
  height: 40px;
  border: 1px solid #e3e3e3;
}

#searchFilter .el-select__wrapper.is-focused,
#searchFilter .el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset !important;
}

.el-select__caret {
  background-image: url("@/assets/icons/Arrow.png"); /* 或 PNG */
  background-size: 16px 16px;
  background-repeat: no-repeat;
  background-position: center;
  width: 16px;
  height: 16px;
  content: "";
  color: transparent; /* 隱藏預設箭頭 */
  border: none;
}

.el-select__caret > svg {
  display: none;
}

.dark #searchFilter .el-select__wrapper,
.dark #searchFilter .el-input__wrapper,
.dark #dateFilter .el-input__wrapper {
  border: none;
}
</style>
