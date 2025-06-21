import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const EvCashOutRecordAPI = {
  getEvCashOutRecordData(queryParams?: EvCashOutRecordPageQuery) {
    return request<any, PageResultVO<EvCashOutRecordVO[], EvCashOutRecordPageQuery, SummaryVO>>({
      url: `/report/ev-cashout-record/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default EvCashOutRecordAPI;

export interface EvCashOutRecordPageQuery extends DateTimeModelQuery, PageQuery {
  search?: string | null | undefined;
  income_type?: string | null | undefined;
}

export interface SummaryVO {
  // 總EV返現接受次數
  ev_acceptCount: string;
  // 總EV返現拒絕次數
  ev_rejectCount: string;
  // EV總收益
  ev_totalAmount: string;
  // EV返現總金額
  ev_totalBonus: number;
  // 總EV返現次數
  ev_totalCount: string;
}

export interface EvCashOutRecordVO {
  id: string;
  // 代理編號
  agent_name: string;
  // 帳戶暱稱
  nickname: string;
  // 代理商玩家編號
  account: string;
  // 帳戶編號
  client_uid: number;
  // 牌局編號
  round_id: string;
  // 牌局池底
  all_pots: number;
  all_pots_name: string;
  // 下注回合
  round_type: number;
  round_type_name: string;
  // 手牌
  hand_card: string;
  // 公牌
  board_card: string;
  // 池底金額
  pots_all_gold: string;
  // EV費用
  ev_gold: string;
  // EV收益
  ev_earnings: string;
  // 勝率
  win_rate: string;
  // EV返現狀態
  is_buy: number;
  is_buy_name: string;
  // 牌局勝負
  is_win: number;
  is_win_name: string;
  // 池底所獲
  get_pots: number;
  get_pots_name: string;
  // 購買時間
  ev_time: string;
}
