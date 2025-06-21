import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO } from "@/api/types/pageQuery";

const AgentAccountManagementAPI = {
  getAll(queryParams?: AgentAccountManagementPageQuery) {
    return request<any, PageResultVO<AgentAccountManagementVO[]>>({
      url: `/main/agent/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, AgentRecordVO>({
      url: `/main/agent/record`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: InsertAgentAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/agent/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateAgentAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/agent/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/agent/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/agent/sync-to-game-server`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/agent/sync-status`,
      method: "get",
    });
  },

  getSecretKey(queryParams: { id: number }) {
    return request<any, { result: boolean; msg: string; secret_key: string }>({
      url: `/main/agent/secret-key`,
      method: "get",
      params: queryParams,
    });
  },

  updateSecretKey(queryParams: { id: number; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/agent/update-secret-key`,
      method: "put",
      data: queryParams,
    });
  },
};

export default AgentAccountManagementAPI;

export interface AgentAccountManagementPageQuery extends PageQuery {
  search?: string | null | undefined;
  ga_id?: number | null | undefined;
}

export interface AgentRecordVO {
  result: boolean;
  msg: string;
  data: AgentAccountRecordVO[];
}

export interface BaseAccountInfo {
  agent_name: string;
  company_name: string;

  gold_split: string | number | null;
  shop_split: string | number | null;
  ev_split: string | number | null;

  del_fl: boolean;
  freeze_fl: boolean;
  join_sea_fl: boolean;

  rake: number;
  master_split: number;
  warning_threshold: number;

  lang: string | number;
}

export interface AgentAccountFlMsg {
  del_fl_name: string;
  freeze_fl_name: string;
  join_sea_fl_name: string;
}

export interface AgentAccountContact {
  business_contact: string;
  tech_contact: string;
}

export interface BaseRecord {
  id: number;
  create_time: string;
  update_time: string;
}

export interface AgentAccountManagementVO extends BaseAccountInfo, BaseRecord, AgentAccountFlMsg {}
export interface AgentAccountRecordVO extends AgentAccountManagementVO, AgentAccountContact {
  ga_id: number;
  ga_name: string;
  ga_company_name: string;
}
export interface InsertAgentAccountParam extends BaseAccountInfo, AgentAccountContact {
  rake: number;
  master_split: number;
  warning_threshold: number;
  lang: string | number;
}
export interface UpdateAgentAccountParam extends InsertAgentAccountParam {
  id: number | null;
  ga_id: number | string;
}
