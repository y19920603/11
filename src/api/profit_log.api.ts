import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";

const ProfitLogAPI = {
  getProfitLogData(queryParams?: ProfitLogPageQuery) {
    return request<any, PageResultVO<ProfitLogVO[], ProfitLogPageQuery>>({
      url: `/report/profit-log/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default ProfitLogAPI;

export interface ProfitLogPageQuery extends PageQuery, DateTimeModelQuery {
  search?: string | null | undefined;
}

export interface ProfitLogVO {
  id: string;
  // 訂單編號
  order_id: string;
  // 代理編號
  agent_name: string;
  // 代理商玩家編號
  account: string;
  // 交易類型
  cause: string;
  // 商城收益
  shop_revenue: string;
  // 商城分成比例
  shop_split: string;
  // 房主提領
  host_withdrawal: string;
  // 上分
  deposit: string;
  // 下分
  withdrawal: string;
  // 交易時間
  date_time: string;
}
