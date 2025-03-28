import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

import MenuAPI, { SidebarMenuVO, type RouteVO } from "@/api/system/menu.api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layout/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const mixedLayoutLeftRoutes = ref<RouteRecordRaw[]>([]);
  const isRoutesLoaded = ref(false);

  function generateRoutes() {
    return new Promise<RouteRecordRaw[]>((resolve, reject) => {
      MenuAPI.getRoutes()
        .then(({ data, result }) => {
          if (result) {
            const menus = convertToRouteVO(data);
            const dynamicRoutes = parseDynamicRoutes(menus);
            routes.value = [...dynamicRoutes];
            isRoutesLoaded.value = true;
            resolve(dynamicRoutes);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 根据父菜单路径设置混合模式左侧菜单
   *
   * @param parentPath 父菜单的路径，用于查找对应的菜单项
   */
  const setMixedLayoutLeftRoutes = (parentPath: string) => {
    const matchedItem = routes.value.find((item) => item.path === parentPath);
    if (matchedItem && matchedItem.children) {
      mixedLayoutLeftRoutes.value = matchedItem.children;
    }
  };

  /**
   * 重置路由
   */
  const resetRouter = () => {
    routes.value.forEach((route) => {
      if (route.name && !constantRoutes.find((r) => r.name === route.name)) {
        router.removeRoute(route.name);
      }
    });

    routes.value = [];
    mixedLayoutLeftRoutes.value = [];
    isRoutesLoaded.value = false;
  };

  return {
    routes,
    mixedLayoutLeftRoutes,
    isRoutesLoaded,
    generateRoutes,
    setMixedLayoutLeftRoutes,
    resetRouter,
  };
});

function convertToRouteVO(menuData: SidebarMenuVO[], parentPath = ""): RouteVO[] {
  return menuData.map((item) => {
    const currentPath = item.url ? `${parentPath}/${item.url}` : parentPath;

    const route: RouteVO = {
      name: `${item.name}-${currentPath.replace(/\//g, "-")}`,
      path: currentPath,
      component: item.url ? `${currentPath}-component` : undefined,
      meta: {
        title: item.name,
        icon: item.icon,
        alwaysShow: item.subitems && item.subitems.length === 1,
        hidden: false,
      },
      children: item.subitems.length ? convertToRouteVO(item.subitems, currentPath) : [],
    };

    return route;
  });
}

/**
 * 解析后端返回的路由数据并转换为 Vue Router 兼容的路由配置
 *
 * @param rawRoutes 后端返回的原始路由数据
 * @returns 解析后的路由配置数组
 */
const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
  const parsedRoutes: RouteRecordRaw[] = [];

  rawRoutes.forEach((route) => {
    const normalizedRoute = { ...route } as RouteRecordRaw;

    // 处理组件路径
    normalizedRoute.component =
      normalizedRoute.component?.toString() === "Layout"
        ? Layout
        : modules[`../../views/${normalizedRoute.component}.vue`] ||
          modules["../../views/error-page/404.vue"];

    // 递归解析子路由
    if (normalizedRoute.children) {
      normalizedRoute.children = parseDynamicRoutes(route.children);
    }

    parsedRoutes.push(normalizedRoute);
  });

  return parsedRoutes;
};
/**
 * 在组件外使用 Pinia store 实例 @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
