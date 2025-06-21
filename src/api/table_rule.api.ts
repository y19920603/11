import request from "@/utils/request";
import { PageQuery, PageResultVO, RecordResultVO } from "@/api/types/pageQuery";
import { ActionResponse } from "./types/response";

const TableRuleAPI = {
  getAll(queryParams?: TableRulePageQuery) {
    return request<any, PageResultVO<TableRuleVO[]>>({
      url: `/main/table-rule/list`,
      method: "get",
      params: queryParams,
    });
  },
  get(queryParams?: { id: string | number }) {
    return request<any, RecordResultVO<TableRuleVO[]>>({
      url: `/main/table-rule/record`,
      method: "get",
      params: queryParams,
    });
  },
  sync() {
    return request<any, ActionResponse>({
      url: `/main/table-rule/sync-to-game-server`,
      method: "post",
    });
  },
  delete(queryParams?: { id: string }) {
    return request<any, ActionResponse>({
      url: `/main/table-rule/delete`,
      method: "delete",
      data: queryParams,
    });
  },
  checkSync() {
    return request<any, ActionResponse>({
      url: `/main/table-rule/sync-status`,
      method: "get",
    });
  },
  create(queryParams?: InsertTableRuleParam) {
    return request<any, ActionResponse>({
      url: `/main/table-rule/insert`,
      method: "post",
      data: queryParams,
    });
  },

  update(queryParams?: UpdateTableRuleParam) {
    return request<any, ActionResponse>({
      url: `/main/table-rule/update`,
      method: "put",
      data: queryParams,
    });
  },
};

export default TableRuleAPI;

export interface TableRulePageQuery extends PageQuery {
  search?: string | null;
  server_id?: number | null;
}

export interface TableRuleVO {
  id: number;
  // 遊戲伺服器ID
  server_id: number;
  // 遊戲玩法
  server_name: string;
  // 遊戲玩法(英文)
  server_name_en: string;
  // 遊戲規則名稱
  rule_name: string;
  rule_id: number;
  // 賭注等級
  rule_lv: string;
  // 賭注等級名稱
  rule_lv_name: string;
  // 前注
  ante_gold: number;
  // 小盲
  sb_gold: number;
  // 大盲
  bb_gold: number;
  // 最小買入金額
  min_buy_gold: number;
  // 最大買入金額
  man_buy_gold: number;
  // 抽水比例
  rake: string;
  // 抽水封頂
  max_rake_gold: number;
  // 抽水封頂(4人以上)
  max_rake_gold4: number;
  // 最少遊戲人數
  min_player: number;
  // 最大遊戲人數
  max_player: number;
  // 時間銀行秒數
  time_bank_sec: number;
  // 時間銀行每次消耗鑽石數量
  time_bank_diamond: number;
  // 刪除
  del_fl: boolean;
  // 刪除翻譯
  del_fl_name: string;
  // 建立時間
  create_time: string;
  // 更新時間
  update_time: string;
}

export interface InsertTableRuleParam {
  server_id?: number | string;
  rule_lv: number;
  ante_gold: number | string | null;
  sb_gold: number | string | null;
  bb_gold: number | string | null;
  min_buy_gold: number | string;
  max_buy_gold: number | string;
  rake: number;
  max_rake_gold: number | string;
  max_rake_gold4: number | string;
  min_player: number;
  max_player: number;
  time_bank_sec: number | string;
  time_bank_diamond: number | string;
  wait_bet_sec: number | string;
  wait_buy_ev_sec: number | string;
  winner_need_play_sec: number | string;
  ev_fl: boolean;
  rake_limit_fl: boolean;
  ip_check_fl: boolean;
  mi_card_fl: boolean;
  multi_dealt_fl: boolean;
  rabbiting_fl: boolean;
  straddle_fl: boolean;
  win_rate_fl: boolean;
  time_bank_fl: boolean;
  emoji_fl: boolean;
  self_flop_fl: boolean;
  chat_fl: boolean;
  dead_chip_fl: boolean | null;
  auto_buy_fl: boolean;
  auto_join_fl: boolean;
  test_fl: boolean;
}
export interface UpdateTableRuleParam extends InsertTableRuleParam {
  id?: number | null;
  rule_name?: string | null;
}
