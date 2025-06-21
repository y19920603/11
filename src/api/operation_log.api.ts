import request from "@/utils/request";
import { PageQuery, DateTimeModelQuery, PageResultVO } from "./types/pageQuery";
import { EnumVO } from "./enum.api";

const OperationLogAPI = {
  get(queryParams?: OperationLogPageQuery) {
    return request<any, PageResultVO<OperationLogVO[]>>({
      url: `/report/operation-log/list`,
      method: "get",
      params: queryParams,
    });
  },
  modules() {
    return request<any, EnumVO[]>({
      url: `/main/module/options`,
      method: "get",
    });
  },
};

export default OperationLogAPI;

export interface OperationLogPageQuery extends PageQuery, DateTimeModelQuery {
  module?: string | null;
  action?: number | null | string;
  create_user_name: string | null;
}

export interface OperationLogVO {
  id: string;
  module: string;
  module_name: string;
  action: number;
  action_name: string;
  success: true;
  request_url: string;
  request_body: string;
  response_body: string;
  before_data: string;
  after_data: string;
  create_user: number;
  create_user_name: string;
  create_time: string;
  ip: string;
}
