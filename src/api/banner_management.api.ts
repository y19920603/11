import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO } from "./types/pageQuery";
import { getAccessToken } from "@/utils/auth";
const BannerManagementAPI = {
  getAll(queryParams?: BannerManagementPageQuery) {
    return request<any, PageResultVO<BannerManagementVO[]>>({
      url: `/main/banner/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, BannerVO>({
      url: `/main/banner/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: FormData) {
    return request<any, ActionResponse>({
      url: `/main/banner/insert`,
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
      url: `/main/banner/update`,
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
      url: `/main/banner/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/banner/sync-data`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/banner/sync/status`,
      method: "get",
    });
  },
};

export default BannerManagementAPI;

export interface BannerManagementPageQuery extends PageQuery {
  search?: string | null | undefined;
  lang: number;
  server_id?: string | null | number;
  status?: boolean | null;
}

export interface BannerVO {
  result: boolean;
  msg: string;
  data: BannerRecordVO;
}

export interface BannerRecordVO {
  image_url: string;
  link_url: string;
  lang: string;
  sort_order: number;
  description: string;
  server_id: number;
  status_code: boolean;
  start_time: string;
  end_time: string;
}

export interface BannerManagementVO extends BannerRecordVO {
  id: number;
  server_name: string;
  status: string;
  create_time: string;
  update_time: string;
}

export interface InsertIpParam {
  image_file: File | string | null;
  link_url: string;
  sort_order?: number;
  description: string;
  server_id: number | null;
  lang: number;
  status: boolean;
  start_time: string;
  end_time: string;
}

export interface UpdateIpParam extends InsertIpParam {
  id: number | null;
  start_type: number;
  end_type: number;
  image_pic: string | null;
}
