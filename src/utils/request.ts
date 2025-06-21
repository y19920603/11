import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { getAccessToken } from "@/utils/auth";
import router from "@/router";
import { useUserStoreHook } from "@/store/modules/user.store";

const service = axios.create({
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
  paramsSerializer: (params) => qs.stringify(params),
});

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.responseType === "blob") {
      return response;
    }
    return response.data;
  },
  async (error) => {
    if (error.status === 403) {
      window.location.href = "/403";
      return Promise.reject(new Error("Forbidden"));
    }

    if (error.status === 401) {
      await handleSessionExpired();
      return Promise.reject(new Error("Error"));
    }

    if (error.status === 400) {
      return Promise.resolve(error.response.data);
    }

    console.error("request error", error);
    return Promise.reject(error.message);
  }
);
export default service;

async function handleSessionExpired() {
  await useUserStoreHook().clearSessionAndCache();
  router.push("/login");
}
