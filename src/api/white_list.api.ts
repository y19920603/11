import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO } from "@/api/types/pageQuery";

const WhiteListAPI = {
  getAll(queryParams?: WhiteListPageQuery) {
    return request<any, PageResultVO<WhiteListVO[]>>({
      url: `/main/ip/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, IpRecordVO>({
      url: `/main/ip/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: InsertIpParam) {
    return request<any, ActionResponse>({
      url: `/main/ip/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateIpParam) {
    return request<any, ActionResponse>({
      url: `/main/ip/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/ip/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/ip/sync-data`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/ip/sync/status`,
      method: "get",
    });
  },
};

export default WhiteListAPI;

export interface WhiteListPageQuery extends PageQuery {
  search?: string | null | undefined;
  status?: boolean | null;
}

export interface IpRecordVO {
  result: boolean;
  msg: string;
  data: WhiteRecordVO;
}

export interface WhiteRecordVO {
  // IP
  ip: string;
  // 存取類型
  type: string | number;
  // 說明
  description: string;
  // 狀態
  status: string | number;
}

export interface WhiteListVO extends WhiteRecordVO {
  // 資料序號
  id: number;
  // 存取類型 code
  type_code: number;
  // 狀態 code
  status_code: boolean;
  // 建立日期
  create_time: string;
  // 最後修改日期
  update_time: string;
}

export interface InsertIpParam {
  type: number;
  ip: string;
  description: string;
  status: boolean | number;
}

export interface UpdateIpParam extends InsertIpParam {
  id: number | null;
}
