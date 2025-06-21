<template>
  <div class="tags-container">
    <el-scrollbar class="scroll-container" :vertical="false">
      <router-link
        v-for="tag in visitedViews"
        ref="tagRef"
        :key="tag.fullPath"
        :class="'tags-item ' + (tagsViewStore.isActive(tag) ? 'active' : '')"
        :to="{ path: tag.path, query: tag.query }"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
      >
        {{
          permissionStore.routes.flatMap((c) => c.children).find((d) => d?.path === tag.path)?.meta
            ?.title
        }}
        <el-icon
          v-if="!isAffix(tag)"
          class="tag-close-icon mx-1"
          @click.prevent.stop="refreshSelectedTag(tag)"
        >
          <Refresh />
        </el-icon>
        <el-icon
          v-if="!isAffix(tag)"
          class="tag-close-icon mx-1"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <Close />
        </el-icon>
      </router-link>
      <div v-if="visitedViews.length < 5" class="tags-item add-btn" @click="addNewTag">
        <el-icon><Plus /></el-icon>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";

import { usePermissionStore, useTagsViewStore, useSettingsStore, useAppStore } from "@/store";

const route = useRoute();
const router = useRouter();

const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const appStore = useAppStore();

const { visitedViews } = storeToRefs(tagsViewStore);
const settingsStore = useSettingsStore();
const layout = computed(() => settingsStore.layout);

function refreshSelectedTag(view: TagView) {
  tagsViewStore.delCachedView(view);

  const newTabId = Date.now(); // 生成新的唯一 tabId

  const newQuery = {
    ...view.query,
    tabId: newTabId,
  };

  const newFullPath = router.resolve({
    name: view.name as string,
    query: newQuery,
  }).fullPath;

  // 替換當前路由，觸發 KeepAlive 重新渲染
  router.replace(newFullPath);
}
function addNewTag() {
  const timestamp = Date.now();

  const newQuery = {
    ...route.query,
    tabId: timestamp,
  };

  const newFullPath = router.resolve({
    name: route.name as string,
    query: newQuery,
  }).fullPath;

  const newTag: TagView = {
    name: route.name as string,
    title: route.meta.title || "New Tab",
    path: route.path,
    fullPath: newFullPath,
    affix: false,
    keepAlive: route.meta?.keepAlive,
    query: newQuery,
  };

  tagsViewStore.forceAddVisitedView(newTag); // 新增一個 tag（不覆蓋）
  router.push(newFullPath);
}

watch(
  route,
  (newRoute) => {
    if (newRoute.path !== "/" && newRoute.path !== "/dashboard") {
      addTags();
      moveToCurrentTag();
    }
  },
  {
    immediate: true, //初始化立即执行
  }
);

/**
 * 过滤出需要固定的标签
 */
function filterAffixTags(routes: RouteRecordRaw[], basePath = "/") {
  let tags: TagView[] = [];
  routes.forEach((route: RouteRecordRaw) => {
    const tagPath = resolve(basePath, route.path);
    if (route.meta?.affix) {
      tags.push({
        path: tagPath,
        fullPath: tagPath,
        name: String(route.name),
        title: route.meta?.title || "no-name",
        affix: route.meta?.affix,
        keepAlive: route.meta?.keepAlive,
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, basePath + route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}

function initTags() {
  const tags: TagView[] = filterAffixTags(permissionStore.routes);
  for (const tag of tags) {
    if (tag.name) {
      const tabId = Date.now();
      const newQuery = { tabId };
      const fullPath = router.resolve({ path: tag.path, query: newQuery }).fullPath;
      tagsViewStore.addVisitedView({ ...tag, query: newQuery, fullPath });
    }
  }
}
function addTags() {
  if (visitedViews.value.length === 0) {
    if (route.meta.title) {
      // 若 tabId 不存在，給它一個唯一的 tabId
      const hasTabId = !!route.query.tabId;
      const tabId = hasTabId ? route.query.tabId : Date.now();

      const newQuery = {
        ...route.query,
        tabId,
      };

      const fullPath = router.resolve({
        name: route.name as string,
        query: newQuery,
      }).fullPath;

      tagsViewStore.addView({
        name: route.name as string,
        title: route.meta.title,
        path: route.path,
        fullPath,
        affix: route.meta?.affix,
        keepAlive: route.meta?.keepAlive,
        query: newQuery,
      });

      // 替換當前路由，加上 tabId，避免 fullPath 相同
      if (!hasTabId) {
        router.replace({ path: route.path, query: newQuery });
      }
    }
  }
}

function moveToCurrentTag() {
  nextTick(() => {
    tagsViewStore.updateVisitedView({
      name: route.name as string,
      title: route.meta.title || "",
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      query: route.query,
    });
  });
}

function isAffix(tag: TagView) {
  return tag?.affix;
}

function closeSelectedTag(view: TagView) {
  tagsViewStore.delView(view).then((res: any) => {
    if (tagsViewStore.isActive(view)) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
}

function findOutermostParent(tree: any[], findName: string) {
  let parentMap: any = {};

  function buildParentMap(node: any, parent: any) {
    parentMap[node.name] = parent;

    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        buildParentMap(node.children[i], node);
      }
    }
  }

  for (let i = 0; i < tree.length; i++) {
    buildParentMap(tree[i], null);
  }

  let currentNode = parentMap[findName];
  while (currentNode) {
    if (!parentMap[currentNode.name]) {
      return currentNode;
    }
    currentNode = parentMap[currentNode.name];
  }

  return null;
}

const againActiveTop = (newVal: string) => {
  if (layout.value !== "mix") return;
  const parent = findOutermostParent(permissionStore.routes, newVal);
  if (appStore.activeTopMenu !== parent.path) {
    appStore.activeTopMenu(parent.path);
  }
};
// 如果是混合模式，更改selectedTag，需要对应高亮的activeTop
watch(
  () => route.name,
  (newVal) => {
    if (newVal) {
      againActiveTop(newVal as string);
    }
  },
  {
    deep: true,
  }
);
onMounted(() => {
  initTags();
});
</script>

<style lang="scss" scoped>
.tags-container {
  width: 100%;
  height: $tags-view-height;
  background-color: var(--el-bg-color);
  overflow-x: auto;
  white-space: nowrap;
  :deep(.el-scrollbar__view),
  :deep(.el-scrollbar__wrap) {
    display: flex;
    align-items: center;
  }
  .tags-item {
    display: flex;
    padding: 6px 20px;
    font-size: 14px;
    cursor: pointer;
    justify-content: center;
    align-items: center;
  }
  :deep(a.tags-item.active) {
    background: var(--bg-tag);
    border-radius: 8px 8px 0px 0px;
    border: var(--tag-border-active);
    box-shadow: var(--tag-border-shadow);
  }
}
</style>
