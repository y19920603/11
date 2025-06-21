import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const GaProfitAPI = {
  getGaProfitData(queryParams?: GaProfitPageQuery) {
    return request<any, PageResultVO<GaProfitVO[], GaProfitPageQuery, SummaryVO>>({
      url: `/report/ga-profit/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default GaProfitAPI;

export interface GaProfitPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
  income_type?: string | null | undefined;
}

export interface SummaryVO {
  // 分成後收益
  GA_split_gold: string;
  GA_split_gold_increase: string;
  GA_split_gold_previous: string;
  GA_split_gold_trend: number;
  // 分成前收益
  income_gold: string;
  income_gold_increase: string;
  income_gold_previous: string;
  income_gold_trend: number;
}

export interface GaProfitVO {
  id: string;
  // 總代理編號
  ga_name: string;
  // 總代理名稱
  ga_company_name: string;
  // 代理編號
  agent_name: string;
  // 代理名稱
  company_name: string;
  // 收益/支出類別
  income_type: number;
  // 收益/支出類別名稱
  income_type_name: string;
  // 牌局編號
  round_id: string;
  // 代理商玩家編號
  account: string;
  // 分成前收益
  income_gold: string;
  // 總代理分成比例
  ga_split: string;
  // 代理分成比例
  agent_split: string;
  // 總代理收益
  ga_split_gold: string;
  // 總代理支出
  ga_split_gold_del: string;
  // 代理收益
  agent_split_gold: string;
  // 代理支出
  agent_split_gold_del: string;
  // 貨幣類別
  gold_type: number;
  gold_type_name: string;
  // 收益/支出所屬
  sea_type: number;
  sea_type_name: string;
  // 遊戲名稱
  game_name: string;
  game_nickname: string;
  server_id: number;
  // 結算狀態
  settlement_status: number;
  settlement_status_name: string;
  //  交易時間
  create_time: string;
  // 牌局所属
  table_type: number;
  table_type_name: string;
  // 代理存款
  agent_deposit: string;
  // 分成比例
  income_split: string;
  // 代理商分成前收益
  split_gold: string;
}
