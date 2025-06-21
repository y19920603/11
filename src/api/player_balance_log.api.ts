import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const PlayerBalanceLogAPI = {
  get(queryParams?: PlayerBalanceLogPageQuery) {
    return request<any, PageResultVO<PlayerBalanceLogVO[], PlayerBalanceLogPageQuery>>({
      url: `/report/player-balance-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default PlayerBalanceLogAPI;

export interface PlayerBalanceLogPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
  cause?: string | null | undefined;
  gold_type?: string | null | undefined;
  client_uid: string;
}

export interface PlayerBalanceLogVO {
  id: string;
  // 金流異動原因
  cause: number;
  // 貨幣類別
  gold_type: number;
  gold_type_name: string;
  // 異動前餘額
  gold_old: string;
  // 交易金額
  gold_add: string;
  // 異動後餘額
  gold_new: string;
  // 異動時間
  create_time: string;
  agent_name: string;
  company_name: string;
  client_uid: string;
  cause_name: string;
  status_name: string;
  currency: string;
  status: number;
  account: string;
}
