import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const BetLogAPI = {
  getBetLogData(queryParams?: BetLogPageQuery) {
    return request<any, PageResultVO<BetLogVO[], BetLogPageQuery, null>>({
      url: `/report/bet-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default BetLogAPI;

export interface BetLogPageQuery extends DateTimeModelQuery, PageQuery {
  agent_name?: string;
  account?: string;
  round_id?: string;
  bet_id?: string;
}

export interface BetLogVO {
  id: string;
  // 下注單號
  bet_id: string;
  // 代理編號
  agent_name: string;
  // 玩家編號
  account: string;
  // 牌局開始時間
  round_start_time: string;
  // 牌局結束時間
  round_end_time: string;
  // 牌局編號
  round_id: string;
  // 玩法
  game_type: string;
  // 玩家輸贏
  gold_add: string;
  // 底池總額
  pots_all_gold: string;
  // 下注金額
  bets: string;
  // 手牌
  card: string;
  // 公牌
  board_card_0: string;
  // EV盈虧
  ev_revenue: string;
  // EV分成
  ev_split: string;
  // 抽水
  rake_gold: string;
  // 抽水比例
  rake_split: string;
  // 抽水比例
  rank: string;
  // 總抽水金額
  rake_amount: number;
}
