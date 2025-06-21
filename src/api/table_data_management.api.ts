import request from "@/utils/request";

// 取得牌桌列表
export function getTableList(params: any) {
  return request<any, any>({
    url: "main/table-list/list",
    method: "get",
    params,
  });
}

// 取得單一牌桌
export function getTableRecord(id: number) {
  return request<any, any>({
    url: "main/table-list/record",
    method: "get",
    params: { id },
  });
}

// 新增牌桌
export function createTable(data: any) {
  return request<any, any>({
    url: "main/table-list/insert",
    method: "post",
    data,
  });
}

// 更新牌桌
export function updateTable(data: any) {
  return request<any, any>({
    url: "main/table-list/update",
    method: "put",
    data,
  });
}

// 刪除牌桌（假刪除）
export function deleteTable(id: number) {
  return request<any, any>({
    url: "main/table-list/delete",
    method: "delete",
    data: { id },
  });
}

// 同步牌桌
export function syncTableList() {
  return request<any, any>({
    url: "main/table-list/sync-to-game-server",
    method: "post",
  });
}

// 取得 enum 下拉選單（如 ServerId）
export function getEnum(name: string) {
  return request<any, any>({
    url: "enum/" + name,
    method: "get",
  });
}

// 取得指定遊戲類別的規則選單
export function getTableRuleOptions(server_id: number) {
  return request<any, any>({
    url: "main/table-rule/table-rule-options",
    method: "get",
    params: { server_id },
  });
}

// 取得牌桌規則內容
export function getTableRuleRecord(id: number) {
  return request<any, any>({
    url: "main/table-rule/record",
    method: "get",
    params: { id },
  });
}

//同步牌桌
export function checkSyncStatus() {
  return request<any, any>({
    url: "main/table-list/sync-status",
    method: "get",
  });
}

// 取得代理選項
export function getAgentOptions(exclude_sea_vendor: boolean) {
  return request<any, any>({
    url: "main/agent/get-agent-options",
    method: "get",
    params: { exclude_sea_vendor }, 
  });
}


export interface TableListVO {
  id: number;
  table_id: number;
  agent_id: number;
  agent_name: string;
  server_id: number;
  server_name: string;
  server_name_en: string;
  rule_id: number;
  rule_lv: number;
  rule_lv_name: string;
  sea_fl: boolean;
  sea_fl_name: string;
  ante_gold: string;
  sb_gold: string;
  bb_gold: string;
  min_buy_gold: string;
  max_buy_gold: string;
  rake: string;
  max_rake_gold: string;
  max_rake_gold4: string;
  min_player: number;
  max_player: number;
  ev_fl: boolean;
  ev_fl_name: string;
  ip_check_fl: boolean;
  ip_check_fl_name: string;
  del_fl: boolean;
  del_fl_name: string;
  create_time: string;
  update_time: string;
}

export interface TableListForm {
  id: number;
  // 上半部欄位
  server_id: number;
  rule_id: number;
  sea_fl: boolean;
  agent_id: number;
  table_open_number: number;

  // 玩家與籌碼欄位
  min_player: number;
  max_player: number;
  ante_gold: number;
  sb_gold: number;
  bb_gold: number;
  min_buy_gold: number;
  max_buy_gold: number;

  // 抽水設定
  rake: number;
  max_rake_gold: number;
  max_rake_gold4: number;

  // 倒數與時限設定
  time_bank_sec: number;
  time_bank_diamond: number;
  wait_bet_sec: number;
  wait_buy_ev_sec: number;
  winner_need_play_sec: number;

  // 各種功能開關
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
  dead_chip_fl: boolean;
  auto_buy_fl: boolean;
  auto_join_fl: boolean;
  test_fl: boolean;
}


export interface TableRuleOption {
  id: number;
  rule_name: string;
  rule_id: number;
}

export interface AgentOptions {
  id: number;
  name: string;
  ga_name: string;
  ga_company_name: string;
  rake?: number;
}


export interface TableListEnumVO {
  id: number;
  name: string;
}

export interface QueryParams {
  server_id: number | null;
  SeaFl: boolean | null;
  sort: string;
  sort_dir: number;
  start: number;
  length: number;
  search: string;
}

export interface UpdateTableFromParam {
  id: number | null;
  server_id: number | string;
  min_player: number;
  max_player: number;
  wait_buy_ev_sec: string;
  rake: number;
  max_rake_gold: string;
  max_rake_gold4: string;
  min_buy_gold: string;
  max_buy_gold: string;
  time_bank_sec: string;
  time_bank_diamond: string;
  sb_gold: string;
  bb_gold: string;
  ante_gold: string;
  wait_bet_sec: string;
  winner_need_play_sec: string;
  rule_lv: number;
  dead_chip_fl: boolean;
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
  auto_buy_fl: boolean;
  auto_join_fl: boolean;
  test_fl: boolean;
  table_open_number: string;
  sea_fl: boolean;
  rule_id: number | string;
}

export interface TableListPageQuery {
  start: number;
  length: number;
  sort: string;
  sort_dir: number;
  search: string;
  server_id: number | null;
}
