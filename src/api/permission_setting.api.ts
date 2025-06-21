import request from "@/utils/request";
import { RecordResultVO } from "@/api/types/pageQuery";

//列表
const PermissionAPI = {
  getPermissionData(queryParams?: PermissionPageQuery) {
    return request<any, PermissionPageVO>({
      url: `/main/permission-setting/list`,
      method: "get",
      params: queryParams,
    });
  },

  getPermissionStructure(): Promise<{
    result: boolean;
    data: PermissionModule[];
  }> {
    return request({
      url: "/main/permission-setting/permissions",
      method: "get",
    });
  },

  getPermissionGroupDetail(id: number): Promise<{
    result: boolean;
    msg: string;
    data: PermissionGroupDetailVO;
  }> {
    return request({
      url: "/main/permission-setting/group-detail",
      method: "get",
      params: { id },
    });
  },

  insertPermissionGroup(payload: {
    name: string;
    role_id: number;
    module_id: number[];
  }): Promise<PermissionGroupResponse> {
    return request({
      url: "/main/permission-setting/insert-group",
      method: "post",
      data: payload,
    });
  },

  updatePermissionGroup(payload: {
    id: number;
    name: string;
    role_id: number;
    module_id: number[];
  }): Promise<PermissionGroupResponse> {
    return request({
      url: "/main/permission-setting/update-group",
      method: "put",
      data: payload,
    });
  },

  deletePermissionGroup(id: number): Promise<{ result: boolean; msg: string }> {
    return request({
      url: "/main/permission-setting/delete-group",
      method: "delete",
      data: { id },
    });
  },

  permissionGroupOptions() {
    return request<any, RecordResultVO<PermissionGroupOptionVO[]>>({
      url: "/main/permission-setting/permission-group-options",
      method: "get",
    });
  },
};

export default PermissionAPI;

export interface PermissionGroupOptionVO {
  id: number;
  role_id: number;
  role: string;
  name: string;
}

export interface PermissionPageQuery {
  start_datetime: string;
  end_datetime: string;
  start: number;
  length: number;
  sort: string;
  sort_dir: number;
  date_mode?: string | null;
  search?: string | null | undefined;
  income_type?: string | null | undefined;
  role_id?: string | null | undefined;
}

export interface PermissionPageVO {
  data: PermissionVO[];
  input: PermissionPageQuery;
  records_total: number;
  result: boolean;
}

export interface PermissionVO {
  id: number;
  name: string;
  role: string;
  role_id: number;
  create_time: string;
  modules: string;
}

export interface PermissionModule {
  id: number;
  name: string;
  sub_item?: PermissionSubItem[];
}

export interface PermissionSubItem {
  id: number;
  name: string;
}

export interface PermissionGroupDetailVO {
  id: number;
  name: string;
  role_id: number;
  module_id: number[];
  modules: number[];
}

export interface PermissionGroupResponse {
  result: boolean;
  msg: string;
  errors?: Record<string, string>; // 可選欄位錯誤訊息
}
