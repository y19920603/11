import request from "@/utils/request";
import { ActionResponse } from "./types/response";
import { PageQuery, PageResultVO } from "./types/pageQuery";

const GameServerStatusAPI = {
  get(queryParams?: GameServerStatusPageQuery) {
    return request<any, PageResultVO<GameServerStatusVO[]>>({
      url: `/main/game-server/list`,
      method: "get",
      params: queryParams,
    });
  },

  shutdown(queryParams: { shutdown_time: string; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/game-server/shutdown`,
      method: "post",
      data: queryParams,
    });
  },

  cancelShutdown(queryParams: { password: string }) {
    return request<any, ActionResponse>({
      url: `/main/game-server/cancel-shutdown`,
      method: "post",
      data: queryParams,
    });
  },
};

export default GameServerStatusAPI;

export interface GameServerStatusPageQuery extends PageQuery {
  game_id: number | string | null;
  server_id: number | string | null;
  // power_fl: boolean | string | null;
  // login_fl: boolean | string | null;
}

export interface GameServerStatusVO {
  // 遊戲序號
  game_id: number;
  // 伺服器序號
  server_id: number;
  // 遊戲類別
  game_name: string;
  // 遊戲名稱
  server_name: string;
  // 遊戲狀態
  power_fl: string;
  // 玩家登入狀態
  login_fl: string;
  // 創建時間
  create_time: string;
  // 最後更新時間
  update_time: string;
}

export interface GameModeVO {
  game_id: number;
  server_id: number;
  server_name: string;
  server_nickname: string;
}
