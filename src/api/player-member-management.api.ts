import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { DateTimeQuery, PageQuery, PageResultVO } from "@/api/types/pageQuery";

const AccountAPI = {
  getAll(queryParams?: AccountPageQuery) {
    return request<any, PageResultVO<AccountVO[]>>({
      url: `/main/account/list`,
      method: "get",
      params: queryParams,
    });
  },

  addGold(queryParams?: { uid: number | string; add_gold: number; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/account/add-gold`,
      method: "post",
      data: queryParams,
    });
  },

  kickPlayer(queryParams?: { uid: number | string; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/account/kick-player`,
      method: "post",
      data: queryParams,
    });
  },

  freezePlayer(queryParams?: { uid: number | string; freeze_datetime: string; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/account/freeze-player`,
      method: "post",
      data: queryParams,
    });
  },

  setMasterSplit(queryParams?: { uid: number | string; master_split: number; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/account/set-master-split`,
      method: "post",
      data: queryParams,
    });
  },
};

export default AccountAPI;

export interface AccountPageQuery extends PageQuery, DateTimeQuery {
  search?: string | null | undefined;
  ga_id?: string | null | undefined;
  agent_id?: string | null | undefined;
  nickname?: string | null;
}

export interface AccountVO {
  // 玩家序號
  uid: number;
  // 玩家編號
  client_uid: number;
  // 代理商編號
  agent_name: string;
  // 代理商名稱
  company_name: string;
  // 玩家帳號
  account: string;
  // 玩家暱稱
  nickname: string;
  // 建立時間
  create_time: string;
  // 最後更新時間
  last_update_time: string;
  // 體驗幣的餘額
  ex_coin: string;
  // 金幣的餘額
  coin: string;
  coin_value: number;
  // 泥碼的餘額
  dead_chips: string;
  // 鑽石的餘額
  diamond: string;
  // 房主分成比例
  master_split: string;
  // 註冊地區
  country_code: string;
  // 是否被刪除
  del_fl: number;
  // 帳戶凍結時間
  freeze_time: string;
  // 最後一次登錄時間
  last_login_time: string;
  // IP地址
  ip: string;
  // 帳號的狀態：1正常、L凍結
  status: string;
  status_name: string;
}
