import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";
const MasterProfitAPI = {
  get(queryParams?: MasterProfitQuery) {
    return request<any, PageResultVO<MasterProfitVO[], null, MasterProfitSummary>>({
      url: `/report/host-profit/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default MasterProfitAPI;

export interface MasterProfitQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null;
  cause?: string | null;
}

export interface MasterProfitVO {
  // 桌號
  table_id: string;
  // 代理編號
  agent_name: string;
  // 遊戲類型
  game_nickname: string;
  // 房主帳號
  account: string;
  // 暱稱
  nickname: string;
  // 局號
  round_id: string;
  // 房主分成比例
  rake: string;
  // 金額
  amounts: string;
  // 異動前錢包餘額
  gold_old: string;
  // 異動後錢包餘額
  gold_new: string;
  // 異動原因
  cause: string;
  // 交易時間
  create_time: string;
}

export interface MasterProfitSummary {
  // 房主分成
  commission: string;
  // 房主提領
  withdrawal: string;
}
