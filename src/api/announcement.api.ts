import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO, RecordResultVO } from "./types/pageQuery";
import { getAccessToken } from "@/utils/auth";
const AnnouncementAPI = {
  getAll(queryParams?: AnnouncementPageQuery) {
    return request<any, PageResultVO<AnnouncementVO[]>>({
      url: `/main/announcement/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, RecordResultVO<AnnouncementVO>>({
      url: `/main/announcement/entity`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: FormData) {
    return request<any, ActionResponse>({
      url: `/main/announcement/insert`,
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
      url: `/main/announcement/update`,
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
      url: `/main/announcement/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/announcement/sync-data`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/announcement/sync/status`,
      method: "get",
    });
  },
};

export default AnnouncementAPI;

export interface AnnouncementPageQuery extends PageQuery {
  search?: string | null | undefined;
  lang: number;
  status?: boolean | null;
}

export interface AnnouncementRecordVO {
  sort_order: number;
  category: number;
  category_name: string;
  lang: number;
  title: string;
  s_text: string;
  image_url: string;
  link_url: string;
  status_code: boolean;
  start_time: string;
  end_time: string;
}

export interface AnnouncementVO extends AnnouncementRecordVO {
  id: number;
  status: string;
  create_time: string;
  update_time: string;
}

export interface InsertAnnouncementParam {
  image_file: File | string | null;
  sort_order?: number;
  lang: number;
  category: number;
  title: string;
  s_text: string;
  link_url: string;
  start_time: string;
  end_time: string;
  status: boolean;
}

export interface UpdateAnnouncementParam extends InsertAnnouncementParam {
  id: number | null;
  start_type: number;
  end_type: number;
  image_pic: string | null;
}
