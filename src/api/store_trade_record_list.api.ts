import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";
const StoreTradeRecordListAPI = {
  get(queryParams?: StoreTradeRecordListPageQuery) {
    return request<
      any,
      PageResultVO<StoreTradeRecordListVO[], StoreTradeRecordListPageQuery, SummaryVO>
    >({
      url: `/report/store-trade-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default StoreTradeRecordListAPI;

export interface StoreTradeRecordListPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
}

export interface SummaryVO {
  // 售價總額
  gold_amount: string;
  // 總代分成收益總額
  ga_split_gold_amount: string;
  // 代理商分成收益總額
  agent_split_gold_amount: string;
}

export interface StoreTradeRecordListVO {
  // 代理編號
  agent_name: string;
  // 訂單號碼
  order_id: string;
  // 代理商玩家編號
  account: string;
  // 帳戶暱稱
  nickname: string;
  // 商品編號
  product_id: string;
  // 商品名稱
  product_name: string;
  // 售價
  gold: string;
  // 總代理商分成比例
  ga_split: string;
  // 總代理商分成收益
  ga_split_gold: string;
  // 代理商分成比例
  agent_split: string;
  // 代理商分成收益
  agent_split_gold: string;
  // 建立時間
  create_time: string;
}
