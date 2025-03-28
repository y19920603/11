import request from "@/utils/request";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  // 登入
  login(data: LoginFormData) {
    return request<any, LoginResult>({
      url: `/auth/login`,
      method: "post",
      data,
    });
  },

  /** 注销登录接口 */
  logout() {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "delete",
    });
  },
};

export default AuthAPI;

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResult {
  errors: errorObj[];
  result: string;
  token: TokenResult;
}

export interface TokenResult {
  token: string;
  expiry_time: string;
}

export interface errorObj {
  field: string;
  message: string;
}
