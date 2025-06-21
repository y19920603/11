import request from "@/utils/request";
import type { AxiosResponse } from "axios";

const ExcelAPI = {
  Export<TQuery = Record<string, any>>(url: string, queryParams?: TQuery) {
    return request<Blob, AxiosResponse<Blob>>({
      url,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },
};

export default ExcelAPI;
