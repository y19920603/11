import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO, RecordResultVO } from "./types/pageQuery";
const MarqueeAPI = {
  getAll(queryParams?: MarqueePageQuery) {
    return request<any, PageResultVO<MarqueeVO[]>>({
      url: `/main/marquee/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: number }) {
    return request<any, RecordResultVO<MarqueeRecordVO>>({
      url: `/main/marquee/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: InsertMarqueeParam) {
    return request<any, ActionResponse>({
      url: `/main/marquee/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateMarqueeParam) {
    return request<any, ActionResponse>({
      url: `/main/marquee/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/marquee/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/marquee/sync-data`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/marquee/sync/status`,
      method: "get",
    });
  },
};

export default MarqueeAPI;

export interface MarqueePageQuery extends PageQuery {
  search?: string | null | undefined;
  status?: boolean | null;
}

export interface MarqueeVO {
  id: number;
  title: string;
  status: string;
  status_code: boolean;
  interval_min: number;
  start_time: string;
  end_time: string;
  create_time: string;
  update_time: string;
}

export interface MarqueeRecordVO extends MarqueeVO {
  messages: MarqueeMessage[];
}

export interface MarqueeMessage {
  lang: number;
  text: string;
}

export interface InsertMarqueeParam {
  title: string;
  status: boolean;
  interval_min: number | string;
  start_time: string;
  end_time: string;
  messages: MarqueeMessage[];
  start_type: number;
  end_type: number;
}

export interface UpdateMarqueeParam extends InsertMarqueeParam {
  id: number | null;
}
