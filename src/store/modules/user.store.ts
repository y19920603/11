import { store, useAppStore } from "@/store";
import { usePermissionStoreHook } from "@/store/modules/permission.store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";

import { setAccessToken, clearToken } from "@/utils/auth";
import AccountManagementAPI from "@/api/account_management.api";

export interface UserInfo {
  id: number;
  user_name: string;
  email: string;
  role: string;
  agent_id: number;
  ga_id: number;
  lang: number;
  reset_password: boolean;
}

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);
  const appStore = useAppStore();
  const { locale } = useI18n();

  /**
   * 登入
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(LoginFormData)
        .then(({ result, token: tokenObj, errors }) => {
          if (result) {
            const { token } = tokenObj;
            setAccessToken(token);
            resolve();
          } else {
            reject(errors);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 取的用戶資訊
   *
   */
  function getUserInfo() {
    return new Promise((resolve, reject) => {
      AccountManagementAPI.info()
        .then(({ result, msg, data }) => {
          if (!result) {
            reject(msg);
            return;
          }
          Object.assign(userInfo.value, { ...data[0] });
          localStorage.setItem("userInfo", JSON.stringify({ ...userInfo.value }));
          appStore.changeLanguage(data[0].lang);
          locale.value = data[0].lang.toString();
          resolve(data[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve) => {
      clearSessionAndCache();
      resolve();
    });
  }

  /**
   * 清除用户会话和缓存
   */
  function clearSessionAndCache() {
    return new Promise<void>((resolve) => {
      clearToken();
      usePermissionStoreHook().resetRouter();
      localStorage.removeItem("userInfo");
      resolve();
    });
  }

  return {
    userInfo,
    getUserInfo,
    login,
    logout,
    clearSessionAndCache,
  };
});

export function useUserStoreHook() {
  return useUserStore(store);
}
