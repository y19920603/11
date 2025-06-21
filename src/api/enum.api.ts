import request from "@/utils/request";

const EnumAPI = {
  get(name: string) {
    return request<any, EnumVO[]>({
      url: `/main/enum`,
      method: "get",
      params: { name },
    });
  },
};

export default EnumAPI;

export interface EnumVO {
  id: number;
  name: string;
}
