import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { getAccessToken } from "@/utils/auth";

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  timeout: 50000,
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
    return response.data;
  },
  async (error) => {
    console.error("request error", error);
    return Promise.reject(error.message);
  }
);
export default service;
