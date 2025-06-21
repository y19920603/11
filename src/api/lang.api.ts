import request from "@/utils/request";
import { PageResultVO } from "@/api/types/pageQuery";

const LangAPI = {
  get() {
    return request<any, PageResultVO<LangVO[]>>({
      url: `/main/lang/list`,
      method: "get",
    });
  },
};

export default LangAPI;

export interface LangVO {
  lang_code: string;
  lang_name: string;
}
