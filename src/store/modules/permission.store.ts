import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "@/router";
import { store } from "@/store";
import router from "@/router";

import MenuAPI, { SidebarMenuVO, type RouteVO } from "@/api/menu.api";
import UserPermissionAPI from "@/api/user_permission.api";
const modules = import.meta.glob("../../views/**/**.vue");
const Layout = () => import("@/layout/index.vue");

export const usePermissionStore = defineStore("permission", () => {
  const routes = ref<RouteRecordRaw[]>([]);
  const mixedLayoutLeftRoutes = ref<RouteRecordRaw[]>([]);
  const isRoutesLoaded = ref(false);
  const userPermissions = ref<string[]>([] as string[]);

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

  const getUserPermissions = () => {
    return new Promise<string[]>((resolve, reject) => {
      UserPermissionAPI.get()
        .then(({ data, result, msg }) => {
          if (result) {
            userPermissions.value = data;
            resolve(data);
          } else {
            reject(msg);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return {
    routes,
    mixedLayoutLeftRoutes,
    isRoutesLoaded,
    generateRoutes,
    setMixedLayoutLeftRoutes,
    resetRouter,
    getUserPermissions,
    userPermissions,
  };
});

function convertToRouteVO(menuData: SidebarMenuVO[]): RouteVO[] {
  return menuData.map((item) => {
    const currentPath = item.url;

    const route: RouteVO = {
      name: `${item.name}-${currentPath.replace(/\//g, "-")}`.split(" ").join("_"),
      path: currentPath ? `/${currentPath}` : ``,
      component: item.url ? `${currentPath}` : "",
      meta: {
        id: item.id,
        title: item.name,
        icon: item.icon,
        alwaysShow: item.subitems && item.subitems.length === 1,
        hidden: false,
        keepAlive: true,
        sidebar_sort: item.sidebar_sort,
        function_code: item.function_code,
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
