import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO, RecordResultVO } from "@/api/types/pageQuery";

const AccountManagementAPI = {
  getAll(queryParams?: AccountManagementPageQuery) {
    return request<any, PageResultVO<AccountManagementVO[]>>({
      url: `/main/user/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, RecordResultVO<AccountManagementVO[]>>({
      url: `/main/user/record`,
      method: "get",
      params: queryParams,
    });
  },

  info() {
    return request<any, RecordResultVO<AccountInfoVO[]>>({
      url: `/main/user/login-info`,
      method: "get",
    });
  },

  create(queryParams?: InsertAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/user/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/user/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string | number }) {
    return request<any, ActionResponse>({
      url: `/main/user/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  lang(queryParams?: { lang: number }) {
    return request<any, ActionResponse>({
      url: `/main/user/update-lang`,
      method: "put",
      data: queryParams,
    });
  },

  resetPassword(queryParams?: { password: string }) {
    return request<any, ActionResponse>({
      url: `/main/user/reset-password`,
      method: "put",
      data: queryParams,
    });
  },
};

export default AccountManagementAPI;

export interface AccountManagementPageQuery extends PageQuery {
  search?: string | null | undefined;
  role_id?: string | null | undefined;
}

export interface AccountManagementVO {
  // 帳號id
  id: number;
  // 角色ID
  role_id: number;
  // 角色名稱
  role_id_name: string;
  // 總代理ID
  ga_id: number;
  // 總代理名稱
  ga_name: string;
  // 代理ID
  agent_id: number;
  // 代理名稱
  agent_name: string;
  // 帳號名稱
  user_name: string;
  // 電子信箱
  email: string;
  // 國家
  country: string;
  // 國碼
  country_code: string;
  // 語系
  lang: number;
  // 語系名稱
  lang_name: string;
  // 電話號碼
  local_phone_number: string;
  // 刪除狀態
  del_fl: boolean;
  del_fl_name: string;
  // 權限群組編號
  permission_group_id: number;
  // 權限群組名稱
  permission_group_name: string;
  // 帳號建立時間
  create_time: string;
  // 帳號最後修改時間
  update_time: string;
}

export interface AccountInfoVO {
  id: number;
  name: string;
  email: string;
  role: string;
  agent_id: number;
  ga_id: number;
  lang: number;
}

export interface PermissionGroupVO {
  id: number;
  name: string;
}

export interface InsertAccountParam {
  role_id: number;
  ga_id: number | string | null;
  agent_id: number | string | null;
  user_name: string;
  email: string;
  password: string;
  country: string;
  country_code: string;
  local_phone_number: string;
  lang: number;
  permission_group_id: number | string | null;
}

export interface UpdateAccountParam extends InsertAccountParam {
  id?: number | null;
}
