import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const DepositLogAPI = {
  getDepositLogData(queryParams?: DepositLogPageQuery) {
    return request<any, PageResultVO<DepositLogVO[], DepositLogPageQuery, SummaryVO>>({
      url: `/report/deposit-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default DepositLogAPI;

export interface DepositLogPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
}

export interface DepositLogVO {
  id: string;
  // 代理編號
  agent_name: string;
  // 代理名稱
  company_name: string;
  // 帳戶編號
  client_uid: string;
  // 玩家帳號
  account: string;
  // 金流異動原因
  cause_text: string;
  // 異動前餘額
  old_deposit: string;
  // 異動金額
  add_deposit: string;
  // 異動後餘額
  new_deposit: string;
  // 相關局號
  round_id: string;
  // 異動時間
  create_time: string;
}

export interface SummaryVO {
  // 異動保證金
  add_deposit: string;
  add_deposit_increase: string;
  add_deposit_previous: string;
  add_deposit_trend: number;
}
