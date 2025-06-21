import request from "@/utils/request";

const MenuAPI = {
  /**
   * 獲取 menu 列表
   */
  getRoutes() {
    return request<any, SidebarMenuResult>({
      url: "/main/sidebar-menu/list",
      method: "get",
    });
  },
};

export default MenuAPI;

export interface SidebarMenuResult {
  result: boolean;
  data: SidebarMenuVO[];
}

export interface SidebarMenuVO {
  id: number;
  icon: string;
  name: string;
  sidebar_sort: number;
  function_code: string;
  url: string;
  subitems: SidebarMenuVO[];
}

/** RouteVO，路由对象 */
export interface RouteVO {
  /** 子路由列表 */
  children: RouteVO[];
  /** 组件路径 */
  component?: string;
  /** 路由属性 */
  meta?: Meta;
  /** 路由名称 */
  name?: string;
  /** 路由路径 */
  path?: string;
  /** 跳转链接 */
  redirect?: string;
}

/** Meta，路由属性 */
export interface Meta {
  /** 【目录】只有一个子路由是否始终显示 */
  alwaysShow?: boolean;
  /** 是否隐藏(true-是 false-否) */
  hidden?: boolean;
  /** ICON */
  icon?: string;
  /** 【菜单】是否开启页面缓存 */
  keepAlive?: boolean;
  /** 路由title */
  title?: string;
  /** id */
  id: number;
  /** 排序 */
  sidebar_sort: number;
  /** 排序代碼 */
  function_code: string;
}
