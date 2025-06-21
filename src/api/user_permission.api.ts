import request from "@/utils/request";
import { RecordResultVO } from "./types/pageQuery";

const UserPermissionAPI = {
  get() {
    return request<any, RecordResultVO<string[]>>({
      url: `/main/user-permission/permissions`,
      method: "get",
    });
  },
};

export default UserPermissionAPI;
