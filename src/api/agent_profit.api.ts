import request from "@/utils/request";

const AgentProfitAPI = {
  /** 获取角色分页数据 */
  getAgentProfitData(queryParams?: AgentProfitPageQuery) {
    return request<any, AgentProfitPageVO>({
      url: `/agent-profit/list`,
      method: "get",
      params: queryParams,
    });
  },

  DownloadPDF(queryParams?: { id: number }) {
    return request<any, any>({
      url: `/agent-profit/pdf`,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },
};

export default AgentProfitAPI;

export interface AgentProfitPageQuery {
  start_datetime: string;
  end_datetime: string;
  start: number;
  length: number;
  sort: string;
  sort_dir: number;
  date_mode?: string | null;
  search?: string | null;
  income_type?: string | null;
}

export interface AgentProfitPageVO {
  data: AgentProfitVO[];
  input: AgentProfitPageQuery;
  recordsTotal: number;
  result: boolean;
  summary: SummaryVO;
}

export interface SummaryVO {
  agent_split_gold: string;
  agent_split_gold_increase: string;
  agent_split_gold_previous: string;
  agent_split_gold_trend: number;
  income_gold: string;
  income_gold_increase: string;
  income_gold_previous: string;
  income_gold_trend: number;
  split_gold: string;
  split_gold_increase: string;
  split_gold_previous: string;
  split_gold_trend: number;
}

export interface AgentProfitVO {
  account: string;
  agent_deposit: string;
  agent_name: string;
  agent_split_gold: string;
  agent_split_gold_del: string;
  company_name: string;
  create_time: string;
  ga_company_name: string;
  ga_name: string;
  game_name: string;
  game_nickname: string;
  gold_type: number;
  id: string;
  income_gold: string;
  income_split: string;
  income_type: string;
  round_id: string;
  sea_type: number;
  sea_type_name: string;
  server_id: number;
  settlement_status: number;
  split_gold: string;
  table_type: number;
}

export interface SummaryItemVO {
  title: string;
  value: string;
  previous: string;
  increase: string;
  trend: number;
  imageSrc: string;
}
