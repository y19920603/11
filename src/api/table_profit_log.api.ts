import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const TableProfitLogAPI = {
  get(queryParams?: TableProfitLogPageQuery) {
    return request<any, PageResultVO<TableProfitLogVO[], TableProfitLogPageQuery, SummaryVO>>({
      url: `/report/table-profit-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default TableProfitLogAPI;

export interface TableProfitLogPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
  is_public: number | null | string;
  sea_type: number | null | string;
  rule_lv: number | null | string;
  server_id: number | null | string;
}

export interface TableProfitLogVO {
  // 牌桌編號
  table_id: number;
  // 代理編號
  agent_name: string;
  // 玩法
  game_nickname: string;
  // 牌桌人數
  max_player: number;
  // 盲注/前注
  ante_gold: string;
  sb_gold: string;
  bb_gold: string;
  // 買入注碼
  min_buy_gold: string;
  max_buy_gold: string;
  // 貨幣類別
  gold_type: number;
  currency: string;
  // 遊戲等級
  rule_lv: number;
  rule_lv_name: string;
  // 牌桌所屬
  sea_type: number;
  sea_type_name: string;
  // 牌桌類別
  is_public: number;
  table_type_name: string;
  // 建立時間
  create_time: string;
  // 抽水比率
  rake: string;
  max_rake_gold: string;
  // 牌局總數
  round_count: number;
  // 牌桌總投注額
  pots_all_gold: string;
  // 牌桌抽水
  rake_gold: string;
  // 總抽成
  agent_split_gold: string;
}

export interface SummaryVO {
  // 牌桌總數量
  total_number_of_tables: number;
  public_tables: number;
  private_tables: number;
  // 長牌牌桌總數量
  total_number_of_nlh_tables: number;
  public_nlh_tables: number;
  private_nlh_tables: number;
  // 短牌牌桌總數量
  total_number_of_six_tables: number;
  public_six_tables: number;
  private_six_tables: number;
  // 奧馬哈牌桌總數量
  total_number_of_plo_tables: number;
  public_plo_tables: number;
  private_plo_tables: number;
  // 全押棄牌長牌桌總數量
  total_number_of_aof_nlh_tables: number;
  public_aof_nlh_tables: number;
  private_aof_nlh_tables: number;
  // 全押棄牌奧馬哈牌桌總數量
  total_number_of_aof_plo_tables: number;
  public_aof_plo_tables: number;
  private_aof_plo_tables: number;
  // 牌桌總投注額
  total_betting_amount: string;
  public_amount: string;
  private_amount: string;
  // 長牌總投注額
  total_betting_nlh_amount: string;
  public_nlh_amount: string;
  private_nlh_amount: string;
  // 短牌總投注額
  total_betting_six_amount: string;
  public_six_amount: string;
  private_six_amount: string;
  // 奧馬哈總投注額
  total_betting_plo_amount: string;
  public_plo_amount: string;
  private_plo_amount: string;
  // 全押棄牌長牌總投注額
  total_betting_aof_nlh_amount: string;
  public_aof_nlh_amount: string;
  private_aof_nlh_amount: string;
  // 全押棄牌奧馬哈總投注額
  total_betting_aof_plo_amount: string;
  public_aof_plo_amount: string;
  private_aof_plo_amount: string;
}

export interface SummaryItemVO {
  title: string;
  value: string | number;
  public: string | number;
  private: string | number;
  img: string;
}
