<template>
  <el-breadcrumb class="flex-y-center px-8 my-2">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="item.path"
      :to="index !== breadcrumbs.length - 1 ? item.path : undefined"
    >
      <span
        :class="index === breadcrumbs.length - 1 ? 'text-[--breadcrumb-text]' : 'text-gray-400'"
      >
        {{ typeof item.meta.title === "function" ? item.meta.title() : item.meta.title }}
      </span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { RouteLocationMatched } from "vue-router";

const currentRoute = useRoute();
const { t } = useI18n();

const breadcrumbs = ref<Array<RouteLocationMatched>>([]);

function getBreadcrumb() {
  // 如果當前是首頁，不顯示麵包屑
  if (currentRoute.path === "/dashboard") {
    breadcrumbs.value = [];
    return;
  }

  let matched = currentRoute.matched.filter((item) => item.meta && item.meta.title);
  const first = matched[0];

  if (!isDashboard(first)) {
    matched = [
      {
        path: "/dashboard",
        meta: { title: t("PAGE_HOME") },
      } as any,
    ].concat(matched);
  }

  breadcrumbs.value = matched.filter((item) => {
    return item.meta && item.meta.title && item.meta.breadcrumb !== false;
  });
}

function isDashboard(route: RouteLocationMatched) {
  const name = route && route.name;
  if (!name) {
    return false;
  }
  return name.toString().trim().toLocaleLowerCase() === "Dashboard".toLocaleLowerCase();
}

watch(
  () => currentRoute.path,
  () => {
    getBreadcrumb();
  }
);

onBeforeMount(() => {
  getBreadcrumb();
});
</script>

<style lang="scss" scoped>
// 覆盖 element-plus 的样式
.el-breadcrumb__inner,
.el-breadcrumb__inner a {
  font-weight: 400 !important;
}
</style>
