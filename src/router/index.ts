import type { App } from "vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useI18n } from "vue-i18n";
declare module "vue-router" {
  interface RouteMeta {
    title?: string | (() => string); // ✅ 支援函式
    layout?: boolean;
    hidden?: boolean;
  }
}
export const Layout = () => import("@/layout/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/login",
    name: "登入頁",
    component: () => import("@/views/login/index.vue"),
    meta: { layout: false },
  },
  {
    path: "/403",
    component: () => import("@/views/error/403.vue"),
    meta: { hidden: true, showTagsView: false },
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
    meta: { hidden: true, showTagsView: false },
  },
  {
    path: "",
    meta: {
      title: () => useI18n().t("USER_PROFILE"),
    },
    children: [
      {
        path: "/player-balance-log/:id",
        name: "金流異動",
        component: () => import("@/views/pages/player-balance-log.vue"),
        meta: {
          title: () => useI18n().t("PAGE_PLAYER_BALANCE_LOG"),
        },
      },
    ],
  },
  {
    path: "/",
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/pages/dashboard.vue"),
        name: "dashboard",
        meta: {
          title: () => useI18n().t("PAGE_DASHBOARD"),
          showTagsView: false,
          affix: true,
          keepAlive: false,
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
