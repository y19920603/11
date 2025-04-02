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

  const setMixedLayoutLeftRoutes = (parentPath: string) => {
    const matchedItem = routes.value.find((item) => item.path === parentPath);
    if (matchedItem && matchedItem.children) {
      mixedLayoutLeftRoutes.value = matchedItem.children;
    }
  };

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

function convertToRouteVO(menuData: SidebarMenuVO[]): RouteVO[] {
  return menuData.map((item) => {
    const currentPath = item.url;

    const route: RouteVO = {
      name: `${item.name}-${currentPath.replace(/\//g, "-")}`,
      path: currentPath ? `/${currentPath}` : ``,
      component: item.url ? `${currentPath}` : undefined,
      meta: {
        title: item.name,
        icon: item.icon,
        alwaysShow: item.subitems && item.subitems.length === 1,
        hidden: false,
      },
      children: item.subitems.length ? convertToRouteVO(item.subitems) : [],
    };

    return route;
  });
}

const parseDynamicRoutes = (rawRoutes: RouteVO[]): RouteRecordRaw[] => {
  const parsedRoutes: RouteRecordRaw[] = [];

  rawRoutes.forEach((route) => {
    const normalizedRoute = { ...route } as RouteRecordRaw;

    normalizedRoute.component =
      normalizedRoute.component?.toString() === "Layout"
        ? Layout
        : modules[`../../views/pages/${normalizedRoute.component}.vue`] ||
          modules["../../views/error-page/404.vue"];

    if (normalizedRoute.children) {
      normalizedRoute.children = parseDynamicRoutes(route.children);
    }

    parsedRoutes.push(normalizedRoute);
  });
  return parsedRoutes;
};

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
