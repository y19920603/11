import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO } from "@/api/types/pageQuery";

const GaAccountManagementAPI = {
  getAll(queryParams?: GaAccountManagementPageQuery) {
    return request<any, PageResultVO<GaAccountManagementVO[]>>({
      url: `/main/ga/list`,
      method: "get",
      params: queryParams,
    });
  },

  get(queryParams?: { id: string | number }) {
    return request<any, GaRecordVO>({
      url: `/main/ga/record`,
      method: "get",
      params: queryParams,
    });
  },

  create(queryParams?: InsertGaAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/ga/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateGaAccountParam) {
    return request<any, ActionResponse>({
      url: `/main/ga/update`,
      method: "put",
      data: queryParams,
    });
  },

  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/ga/delete`,
      method: "delete",
      data: queryParams,
    });
  },

  sync() {
    return request<any, ActionResponse>({
      url: `/main/ga/sync-to-game-server`,
      method: "post",
    });
  },

  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/ga/sync-status`,
      method: "get",
    });
  },

  ga_options() {
    return request<any, GaOptionResult>({
      url: `/main/ga/get-ga-options`,
      method: "get",
    });
  },

  agent_options(queryParams?: { ga_id: number }) {
    return request<any, AgentOptionResult>({
      url: `/main/agent/get-agent-options`,
      method: "get",
      params: queryParams,
    });
  },
};

export default GaAccountManagementAPI;

export interface GaAccountManagementPageQuery extends PageQuery {
  search?: string | null | undefined;
}

interface GaOptionResult extends ActionResponse {
  data: GaOption[];
}

interface AgentOptionResult extends ActionResponse {
  data: AgentOption[];
}

export interface GaOption {
  id: number;
  ga_name: string;
  ga_company_name: string;
}

export interface AgentOption {
  id: number;
  ga_name: string;
  ga_company_name: string;
}

export interface GaRecordVO {
  result: boolean;
  msg: string;
  data: GaAccountRecordVO[];
}

export interface BaseAccountInfo {
  ga_name: string;
  ga_company_name: string;
  gold_split: string | number | null;
  shop_split: string | number | null;
  ev_split: string | number | null;
  del_fl: boolean;
  freeze_fl: boolean;
}

export interface GaAccountFlMsg {
  del_fl_name: string;
  freeze_fl_name: string;
}

export interface GaAccountContact {
  business_contact: string;
  tech_contact: string;
}

export interface BaseRecord {
  id: number;
  create_time: string;
  update_time: string;
}

export interface GaAccountManagementVO extends BaseAccountInfo, BaseRecord, GaAccountFlMsg {}
export interface GaAccountRecordVO extends GaAccountManagementVO, GaAccountContact {}
export interface InsertGaAccountParam extends BaseAccountInfo, GaAccountContact {}
export interface UpdateGaAccountParam extends InsertGaAccountParam {
  id: number | null;
}
