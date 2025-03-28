import { store } from "@/store";
import { usePermissionStoreHook } from "@/store/modules/permission.store";
import { useDictStoreHook } from "@/store/modules/dict.store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import UserAPI, { type UserInfo } from "@/api/system/user.api";

import { setAccessToken, clearToken } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);

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
    return new Promise<UserInfo>((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          if (!data) {
            reject("Verification failed, please Login again.");
            return;
          }
          Object.assign(userInfo.value, { ...data });
          resolve(data);
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
      useDictStoreHook().clearDictCache();
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
