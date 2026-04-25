/**
 * axios 인스턴스 + 인터셉터 — 웹(pickca-web/src/lib/axios.ts)과 동일한 패턴
 *
 * 주요 차이점:
 * - localStorage → expo-secure-store (비동기)
 * - window.location.href → expo-router의 router.replace()
 * - X-Client-Type: APP (웹은 WEB)
 */
import axios, { AxiosRequestConfig } from "axios";
import { router } from "expo-router";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  paramsSerializer: (params: Record<string, unknown>) => {
    const flat: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (
        value !== null &&
        value !== undefined &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          if (v !== undefined && v !== null) flat[k] = String(v);
        }
      } else if (value !== undefined && value !== null) {
        flat[key] = String(value);
      }
    }
    return new URLSearchParams(flat).toString();
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  config.headers["X-Client-Type"] = "APP";
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        router.replace("/(auth)/sign-in");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/api/auth/token/refresh`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await setTokens(accessToken, newRefreshToken);
        refreshQueue.forEach(({ resolve }) => resolve(accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        await clearTokens();
        router.replace("/(auth)/sign-in");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

export const fetcher = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance(config);
  return response.data;
};
