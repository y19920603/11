import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO, RecordResultVO } from "./types/pageQuery";

const RoundSeatLogAPI = {
  getRoundSeatLogData(queryParams?: RoundSeatLogPageQuery) {
    return request<any, PageResultVO<RoundSeatLogVO[], RoundSeatLogPageQuery, SummaryVO>>({
      url: `/report/round-seat-log/list`,
      method: "get",
      params: queryParams,
    });
  },
  getDetail(queryParams: { round_id: string }) {
    return request<any, RecordResultVO<RoundSeatLogDetailVO>>({
      url: `/report/round-seat-log/detail`,
      method: "get",
      params: queryParams,
    });
  },
};

export default RoundSeatLogAPI;

export interface RoundSeatLogPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
  sea_type?: string | null | undefined;
  server_id?: string | null | undefined;
  agent_name?: string | null | undefined;
  client_uid?: string | null | undefined;
  account?: string | null | undefined;
  round_id?: string | null | undefined;
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

export interface RoundSeatLogVO {
  id: string;
  // 代理編號
  agent_name: string;
  // 帳戶編號
  client_uid: number;
  // 代理商玩家編號
  account: string;
  // 帳戶暱稱
  nickname: string;
  // 房桌號
  table_id: number;
  // 牌局編號
  round_id: string;
  // 牌局結束時間
  round_end_time: string;
  // 牌局所屬
  table_type: number;
  table_type_name: string;
  round_belong: string;
  sea_type: number;
  sea_type_name: string;
  // 玩法
  game_type: string;
  game_type_name: string;
  // 手牌
  card: string;
  // 公牌
  board_card_0: string;
  board_card_1: string;
  board_card_2: string;
  // A/F
  AF: number;
  AF_name: number;
  // 初始餘額
  gold_old: string;
  // 最終餘額
  gold_new: string;
  // 底池總額
  pots_all_gold: string;
  // 玩家輸贏
  gold_add: string;
  // 貢獻度
  contribution: string;
  contribution_ratio_1: string;
  contribution_ratio_2: string;
  // 貨幣類型
  gold_type: string;
  // 抽水比例
  rake: string;
  // 抽水
  rake_gold: string;
  // 牌局總抽水
  round_rake_gold: string;
  // EV返現
  buy_ev_gold: string;
  // IP位置
  ip: string;
  // 牌局明細
  uid: number;
  company_name: string;
  table_round: string;
}

export interface RoundSeatLogDetailVO {
  AF_name: string;
  board_card_0: string;
  board_card_1: string;
  board_card_2: string;
  buy_ev_gold: string;
  game_type: string;
  game_type_name: string;
  process_detail: string;
  rake: string;
  rake_gold: string;
  round_end_time: string;
  round_id: string;
  round_start_time: string;
  sea_type_name: string;
  seats: Seat[];
  stage0: Stage;
  stage1: Stage;
  stage2: Stage;
  stage3: Stage;
  stage4: Stage;
  table_id: number;
  [key: `board_card_${number}`]: string | undefined;
}

export interface Seat {
  agent_name: string;
  card: string;
  client_uid: number;
  contribution_ratio: string;
  gold_add: string;
  ip: string;
  nickname: string;
  seat_id: number;
}

export interface Stage {
  title?: string | null;
  current_pool_amount: string | null;
  steps: Step[];
}

export interface Step {
  // 動作 (例如:下小盲注,全押, 蓋牌)
  action: string;
  // cause
  cause: number;
  // 玩家輸贏
  gold_add: string;
  // 是否為下大盲注的玩家
  is_bb: boolean;
  // 是否為下小盲注的玩家
  is_sb: boolean;
  max_card0: string;
  max_card1: string;
  max_card2: string;
  // 贏家牌型
  max_card_type: string;
  // 暱稱
  nickname: string;
  // 贏家贏得的主池獎金, 只有 cause = 4 結算才有值
  pot_amount: null;
  // 主池/邊池 只有 cause = 4 結算才有值
  pot_name: null;
  // 座位 id
  seat_id: number;
  [key: `max_card${number}`]: string | undefined;
}
