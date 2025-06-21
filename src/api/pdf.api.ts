import request from "@/utils/request";
import { AxiosResponse } from "axios";

const PdfAPI = {
  DownloadPDF<TQuery = Record<string, any>>(url: string, queryParams?: TQuery) {
    return request<Blob, AxiosResponse<Blob>>({
      url,
      method: "get",
      params: queryParams,
      responseType: "blob",
    });
  },
};

export default PdfAPI;
