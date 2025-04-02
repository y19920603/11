import request from "@/utils/request";

const DashBoardAPI = {
  /** 获取角色分页数据 */
  getDashBoardData(queryParams?: DashBoardPageQuery) {
    return request<any, DashBoardPageVO>({
      url: `/dashboard/list`,
      method: "get",
      params: queryParams,
    });
  },
};

export default DashBoardAPI;

export interface DashBoardPageQuery {
  start_datetime: string;
  end_datetime: string;
  date_mode?: string | null;
}

export interface DashBoardPageVO {
  result: boolean;
  data: DashBoardData;
}

export type GameProportion = [string, string];

export interface DashBoardData {
  // 玩家會員總數
  account_amount: string;
  // 自上周以來_遊戲存款金額
  game_deposit_amount_growing_up: string;
  // 遊戲存款金額
  game_deposit_amount_total: string;
  // 遊戲存款有無增長
  game_deposit_amount_trend: string;
  // 遊戲局數比例
  game_proportions: GameProportion[];
  // 自上周以來_遊戲提款金額
  game_withdrawal_amount_growing_up: string;
  // 遊戲提款金額
  game_withdrawal_amount_total: string;
  // 遊戲提款有無增長
  game_withdrawal_amount_trend: string;
  // 最高遊戲人數
  online_game_player_growing_up: string;
  // 遊戲中人數
  online_game_player_total: string;
  // 自上周以來_線上人數差異數
  online_player_Increase: string;
  // 自上周以來_最高線上人數
  online_player_max: string;
  // 線上人數
  online_player_now: string;
  // 線上人數有無增長
  online_player_trend: string;
  // 自上周以來_本月收益
  orders_chart_growing_up: string;
  // 本月收益
  orders_chart_total: string;
  // 本月收益有無增長
  orders_chart_trend: string;
  // 自上周以來_公海代理總數
  sea_public_company_growing_up: string;
  // 公海代理總數
  sea_public_company_total: string;
  // 公海代理總數有無增長
  sea_public_company_trend: string;
  // 自上周以來_公海玩家開桌總數
  sea_public_player_growing_up: string;
  // 公海玩家開桌總數
  sea_public_player_total: string;
  // 公海玩家開桌總數有無增長
  sea_public_player_trend: string;
  // 自上周以來_公海牌桌總數
  sea_public_table_growing_up: string;
  // 公海牌桌總數
  sea_public_table_total: string;
  // 公海牌桌總數有無增長
  sea_public_table_trend: string;
  // 自上周以來_保證金
  security_deposit_amount_growing_up: string;
  // 保證金
  security_deposit_amount_total: string;
  // 保證金有無增長
  security_deposit_amount_trend: string;
  // 自上周以來_代理總數
  total_company_name_growing_up: string;
  // 代理總數
  total_company_name_total: string;
  // 代理總數有無增長
  total_company_name_trend: string;
  // 自上周以來_遊戲牌局總數
  total_game_board_growing_up: string;
  // 遊戲牌局總數
  total_game_board_total: string;
  // 遊戲牌局總數有無增長
  total_game_board_trend: string;
  // 自上周以來_玩家總數
  total_player_growing_up: string;
  // 玩家總數
  total_player_total: string;
  // 玩家總數有無增長
  total_player_trend: string;
  // 自上周以來_總收益
  total_revenue_chart_growing_up: string;
  // 總收益
  total_revenue_chart_total: string;
  // 總收益變化趨勢
  total_revenue_chart_trend: string;
}

export interface DashBoardCard {
  title: string;
  total: string;
  growth: string;
  trend: number | string;
  image: string;
}
