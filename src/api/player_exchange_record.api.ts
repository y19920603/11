import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const PlayerExchangeRecordAPI = {
  get(queryParams?: PlayerExchangeRecordPageQuery) {
    return request<any, PageResultVO<PlayerExchangeRecordVO[], PlayerExchangeRecordPageQuery>>({
      url: `/report/player-trade-log/list`,
      method: "get",
      params: queryParams,
    });
  },

  getCauseCategory() {
    return request<any, CauseCategoryVO[]>({
      url: `/report/player-trade-log/cause-category`,
      method: "get",
    });
  },
};

export default PlayerExchangeRecordAPI;

export interface CauseCategoryVO {
  cause: number;
  cause_text: string;
}

export interface PlayerExchangeRecordPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
  ga_id?: string | null | undefined;
  agent_id?: string | null | undefined;
  cause?: string | null | undefined;
  gold_type?: string | null | undefined;
}

export interface PlayerExchangeRecordVO {
  id: string;
  // 帳戶編號
  client_uid: string;
  // 帳戶暱稱
  player_nickname: string;
  // 代理編號
  agent_name: string;
  // 交易類別
  cause_text: string;
  // 所屬
  cause_category: string;
  // 交易金額
  gold_add: string;
  gold_add_positive: boolean;
  // 買前餘額
  gold_old: string;
  // 買後餘額
  gold_new: string;
  // 貨幣種類
  gold_type: number;
  gold_type_name: string;
  // 交易時間
  create_time: string;
  currency: string;
  company_name: string;
  cause_name: string;
  status_name: string;
  status: number;
  cause: number;
  account: string;
  agent_id: number;
}
