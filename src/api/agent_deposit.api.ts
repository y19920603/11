import request from "@/utils/request";
import { PageQuery, PageResultVO } from "./types/pageQuery";
import { ActionResponse } from "./types/response";

const AgentDepositAPI = {
  get(queryParams?: AgentDepositPageQuery) {
    return request<any, PageResultVO<AgentDepositVO[], AgentDepositPageQuery>>({
      url: `/main/agent-deposit/list`,
      method: "get",
      params: queryParams,
    });
  },
  addDeposit(queryParams?: { agent_id: number; add_deposit: number; password: string }) {
    return request<any, ActionResponse>({
      url: `/main/agent-deposit/add-deposit`,
      method: "post",
      data: queryParams,
    });
  },
};

export default AgentDepositAPI;

export interface AgentDepositPageQuery extends PageQuery {
  search?: string | null | undefined;
}

export interface AgentDepositVO {
  agent_id: number;
  agent_name: string;
  company_name: string;
  deposit: string;
  warning_threshold: string;
  deposit_warning: boolean;
}
