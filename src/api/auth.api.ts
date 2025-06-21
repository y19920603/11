import request from "@/utils/request";
import JsEncrypt from "jsencrypt";

const AUTH_BASE_URL = "/api/v1/auth";

const AuthAPI = {
  login(data: LoginFormData) {
    return request<any, LoginResult>({
      url: `/main/auth/login`,
      method: "post",
      data,
    });
  },

  async getKey(): Promise<JsEncrypt> {
    const key = await request<any, string>({
      url: "/main/key",
      method: "get",
    });
    const encrypt = new JsEncrypt();
    encrypt.setPublicKey(key);
    return encrypt;
  },

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
  errors: {
    [key: string]: string;
  };
  result: string;
  token: TokenResult;
}

export interface TokenResult {
  token: string;
  expiry_time: string;
}
