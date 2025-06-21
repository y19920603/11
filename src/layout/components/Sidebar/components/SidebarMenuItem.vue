<template>
  <div v-if="!item.meta || !item.meta.hidden" class="py-[3px]">
    <template
      v-if="
        (!item.meta?.alwaysShow &&
          hasOneShowingChild(item.children, item) &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren)) ||
        (item.meta?.alwaysShow && !item.children)
      "
    >
      <RouterLink :to="{ path: item.path }">
        <el-menu-item
          :index="item.name?.toString() ?? ''"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <SidebarMenuItemTitle
            :icon="onlyOneChild.meta.icon"
            :title="onlyOneChild.meta.title"
            :subItem="false"
            :sortable="onlyOneChild.meta.sidebar_sort"
            :function_code="onlyOneChild.meta.function_code"
          />
        </el-menu-item>
      </RouterLink>
    </template>

    <el-sub-menu v-else ref="submenuRef" :index="item.name?.toString() ?? ''" teleported>
      <template #title>
        <SidebarMenuItemTitle
          v-if="item.meta"
          :icon="item.meta.icon"
          :title="typeof item.meta.title === 'function' ? item.meta.title() : item.meta.title"
          :subItem="true"
          :function_code="item.meta.function_code"
          :sortable="item.meta.sidebar_sort"
        />
      </template>

      <SidebarMenuItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from "vue";
import path from "path-browserify";
import { RouteRecordRaw } from "vue-router";
import { useRoute } from "vue-router";
import { isExternal } from "@/utils";
import { ElSubMenu } from "element-plus";

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
});

const onlyOneChild = ref();
const openedState = inject("openedState", ref(false));

function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (!route.meta?.hidden) {
      onlyOneChild.value = route;
      return true;
    }
    return false;
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }
  return false;
}

function resolvePath(routePath: string) {
  if (!routePath) return "";
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return routePath;
  if (!props.basePath) return routePath;
  return path.join(props.basePath, routePath);
}
const currentRoute = useRoute();
const currentRoutePath = computed(() => currentRoute.path);

const matchedChild = computed(() =>
  props.item.children?.find((e) => e.path === currentRoutePath.value)
);

const submenuRef = ref<InstanceType<typeof ElSubMenu> | null>(null);

const triggerMenuOpen = async () => {
  await nextTick();
  if (submenuRef.value && !openedState.value) {
    const submenuTitle = submenuRef.value.$el.querySelector(".el-sub-menu__title");
    if (submenuTitle && !submenuRef.value.$el.classList.contains("is-opened")) {
      submenuTitle.click();
      openedState.value = true;
    }
  }
};

watch(
  matchedChild,
  (newVal) => {
    if (newVal && !openedState.value) {
      triggerMenuOpen();
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss">
.hideSidebar {
  .submenu-title-noDropdown {
    position: relative;
    padding: 0 !important;

    .el-tooltip {
      padding: 0 !important;

      .sub-el-icon {
        margin-left: 19px;
      }
    }

    & > span {
      display: inline-block;
      visibility: hidden;
      width: 0;
      height: 0;
      overflow: hidden;
    }
  }

  .el-sub-menu {
    overflow: hidden;

    & > .el-sub-menu__title {
      padding: 0 !important;

      .sub-el-icon {
        margin-left: 19px;
      }

      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }

  .el-menu--collapse {
    width: $sidebar-width-collapsed;

    .el-sub-menu {
      & > .el-sub-menu__title > span {
        display: inline-block;
        visibility: hidden;
        width: 0;
        height: 0;
        overflow: hidden;
      }
    }
  }

  .router-link-active > .el-menu-item.submenu-title-noDropdown {
    border-radius: 0px;
  }
}

html.dark {
  .el-menu-item:hover {
    background: linear-gradient(to right, rgba(99, 109, 235, 0.5), rgba(99, 109, 235, 0.08));
    color: #fff;
    border-radius: 50px;
  }

  .hideSidebar {
    .el-menu-item:hover {
      background: linear-gradient(to right, rgba(99, 109, 235, 0.5), rgba(99, 109, 235, 0.08));
      color: #fff;
      border-radius: 0px;
    }
  }
}

html.sidebar-color-blue {
  .el-menu-item:hover {
    background-color: $menu-hover;
  }
}

.el-menu-item.is-active {
  color: var(--el-sub-menu-title-active) !important;
}

.router-link-active > .el-menu-item {
  background: linear-gradient(to right, rgba(99, 109, 235, 0.5), rgba(99, 109, 235, 0.08));
  color: var(--router-link-active);
  border-radius: 50px;
  > span {
    color: #fff;
  }
}

.el-sub-menu__title:hover {
  background-color: var(--el-sub-menu-title-hover) !important;
  border-radius: 50px !important;
}

.hideSidebar .el-sub-menu__title:hover {
  border-radius: 0px !important;
}

html.sidebar-color-blue .el-menu-item:hover,
.el-menu-item:hover {
  background-color: transparent !important;
  background: linear-gradient(to right, rgba(99, 109, 235, 0.5), rgba(99, 109, 235, 0.08));
  border-radius: 50px;
}

.el-sub-menu__title {
  transition: none !important;
}

.el-sub-menu .el-sub-menu__icon-arrow {
  margin-top: 0px;
  top: initial;
}

.el-sub-menu.is-opened > div {
  background: #1b1d29;
  border-radius: 50px;
  > span {
    color: #fff;
  }
}
</style>
