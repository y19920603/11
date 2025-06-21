import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO, RecordResultVO } from "./types/pageQuery";
const ShopManagementAPI = {
  getAll(queryParams?: ShopManagementPageQuery) {
    return request<any, PageResultVO<ShopManagementVO[]>>({
      url: `/main/shop/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: number }) {
    return request<any, RecordResultVO<ShopManagementRecordVO>>({
      url: `/main/shop/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: InsertShopManagementParam) {
    return request<any, ActionResponse>({
      url: `/main/shop/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateShopManagementParam) {
    return request<any, ActionResponse>({
      url: `/main/shop/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/shop/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/shop/sync-data`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/shop/sync/status`,
      method: "get",
    });
  },
};

export default ShopManagementAPI;

export interface ShopManagementPageQuery extends PageQuery {
  search?: string | null | undefined;
  status?: boolean | null;
}

export interface ShopManagementVO {
  id: number;
  // 商品類別
  item_type_name: string;
  // 商品編號
  item_code: string;
  // 商品名稱
  item_name: string;
  // 商品描述
  item_desc: string;
  // 商品圖示檔名
  icon_url: string;
  // 購買使用的貨幣
  gold_type: number;
  gold_type_name: string;
  // 使用多少貨幣購買
  gold: string;
  // 是否優惠
  discount_fl: boolean;
  discount_fl_name: string;
  // 優惠價
  discount_gold: string;
  // 得到多少數量
  buy_gold: string;
  // 贈送數量
  give_gold: string;
  // 上架時間
  start_time: string;
  // 下架時間
  end_time: string;
  // 狀態
  status: boolean;
  status_name: string;
  // 建立時間
  create_time: string;
  // 修改時間
  update_time: string;
}

export interface ShopManagementRecordVO extends InsertShopManagementParam {
  item_code: string;
  icon_url: string;
}

export interface InsertShopManagementParam {
  item_type_id: number;
  item_name: string;
  item_code: string;
  item_desc: string;
  icon_id: number;
  gold_type: number;
  gold: string;
  discount_fl: boolean;
  discount_gold: string | null;
  buy_gold: string;
  give_gold: string | null;
  start_time: string;
  end_time: string;
  status: boolean;
  always_discount: boolean;
}

export interface UpdateShopManagementParam extends InsertShopManagementParam {
  id: number | null;
}
