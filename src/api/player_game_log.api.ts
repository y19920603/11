import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const PlayGameLogAPI = {
  getPlayGameLogData(queryParams?: PlayGameLogPageQuery) {
    return request<any, PageResultVO<PlayGameLogVO[], PlayGameLogPageQuery, SummaryVO>>({
      url: `/report/player-game-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default PlayGameLogAPI;

export interface PlayGameLogPageQuery extends PageQuery, DateTimeModelQuery {
  account?: string | null | undefined;
  agent_name?: string | null | undefined;
  client_uid?: string | null | undefined;
}

export interface SummaryVO {
  // 總投注金額
  contribution: string;
  contribution_increase: string;
  contribution_previous: string;
  contribution_trend: number;
  // 總玩家輸贏
  gold_add: string;
  gold_add_increase: string;
  gold_add_previous: string;
  gold_add_trend: number;
  // 總玩家人數
  player_count: number;
  player_count_increase: string;
  player_count_previous: number;
  player_count_trend: number;
  // 總抽水
  rake_gold: string;
  rake_gold_increase: string;
  rake_gold_previous: string;
  rake_gold_trend: number;
  // 總牌局數量
  round_count: number;
  round_count_increase: string;
  round_count_previous: number;
  round_count_trend: number;
}

export interface PlayGameLogVO {
  // 代理編號
  agent_name: string;
  // 帳戶編號
  client_uid: string;
  // 代理商玩家編號
  account: string;
  // 帳戶暱稱
  nickname: string;
  // 總投注額
  contribution: string;
  // 總盈虧
  gold_add: string;
  gold_add_positive: true;
  // 總全押次數
  AF: number;
  // 總牌局數
  round_id_count: number;
  // NLH長牌
  server_id_1_count: number;
  // 6+短牌
  server_id_2_count: number;
  // PLO奧馬哈
  server_id_3_count: number;
  // AOF全押/棄牌
  server_id_4_count: number;
  // 最終餘額
  gold_new: string;
  // 代理傭金
  agent_split_all_gold: string;
  // 總抽水
  rake_gold: string;
  // EV返現次數
  buy_ev_gold_count: number;
  // EV返現總額
  buy_ev_gold: string;
  // 牌局列表
  uid: number;
}
