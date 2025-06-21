import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const AgentTransferAPI = {
  getAgentTransferData(queryParams?: AgentTransferPageQuery) {
    return request<any, PageResultVO<AgentTransferVO[], AgentTransferPageQuery, SummaryVO>>({
      url: `/report/player-transfer/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default AgentTransferAPI;

export interface AgentTransferPageQuery extends DateTimeModelQuery, PageQuery {
  search?: string | null | undefined;
}

export interface SummaryVO {
  // 總存款金額
  deposit: string;
  deposit_increase: string;
  deposit_previous: string;
  deposit_trend: number;
  // 總存款次數
  deposit_count: number;
  deposit_count_increase: string;
  deposit_count_previous: number;
  deposit_count_trend: number;
  // 總提款金額
  withdrawal: string;
  withdrawal_increase: string;
  withdrawal_previous: string;
  withdrawal_trend: number;
  // 總提款次數
  withdrawal_count: number;
  withdrawal_count_increase: string;
  withdrawal_count_previous: number;
  withdrawal_count_trend: number;
}

export interface AgentTransferVO {
  id: string;
  // 代理編號
  agent_name: string;
  // 代理名稱
  company_name: string;
  // 代理商玩家編號
  account: string;
  // 類別
  cause: number;
  cause_name: string;
  // 金額
  gold_add: string;
  // 幣別
  gold_type: number;
  currency: string;
  // 帳戶編號
  client_uid: string;
  // 異動前餘額
  gold_old: string;
  // 異動後餘額
  gold_new: string;
  // 結算狀態
  status: number;
  status_name: string;
  // 時間
  create_time: string;
}
