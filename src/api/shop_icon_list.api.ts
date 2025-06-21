import request from "@/utils/request";
import { PageQuery, PageResultVO, RecordResultVO } from "./types/pageQuery";
import { ActionResponse } from "./types/response";
import { getAccessToken } from "@/utils/auth";

const ShopIconListAPI = {
  getAll(queryParams?: ShopIconListPageQuery) {
    return request<any, PageResultVO<ShopIconListVO[]>>({
      url: `/main/shop-icon/list`,
      method: "get",
      params: queryParams,
    });
  },
  get(queryParams?: { id: number }) {
    return request<any, RecordResultVO<ShopIconRecordVO>>({
      url: `/main/shop-icon/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: FormData) {
    return request<any, ActionResponse>({
      url: `/main/shop-icon/insert`,
      method: "post",
      data: queryParams,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  },

  update(queryParams?: FormData) {
    return request<any, ActionResponse>({
      url: `/main/shop-icon/update`,
      method: "put",
      data: queryParams,
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/shop-icon/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  options() {
    return request<any, RecordResultVO<ShopIconOption[]>>({
      url: `/main/shop-icon/get-shop-icon-options`,
      method: "get",
    });
  },
};

export default ShopIconListAPI;

export interface ShopIconOption {
  id: number;
  icon_name: string;
  icon_url: string;
}

export interface ShopIconListPageQuery extends PageQuery {
  search?: string | null | undefined;
}

export interface ShopIconRecordVO {
  icon_url: string;
  icon_name: string;
  default_fl: boolean;
}

export interface ShopIconListVO {
  id: number;
  default_fl: boolean;
  default_fl_name: string;
  icon_name: string;
  icon_url: string;
  create_time: string;
  update_time: string;
}

export interface UpdateShopIconParam {
  id?: number | null;
  image_file?: string | null | File;
  icon_name: string;
  default_fl: boolean;
  image_pic: string | null;
}
