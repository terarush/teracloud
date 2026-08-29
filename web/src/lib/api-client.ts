import axios from "axios"
import Cookies from "js-cookie"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_VERSION = import.meta.env.VITE_API_VERSION || "1";

export { BASE_URL };

const apiBaseURL = `${BASE_URL}/api/v${API_VERSION}`;

export const googleLoginUrl = `${apiBaseURL}/auth/google/login`;

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    const skipRefreshUrls = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ]
    const isSkipUrl = skipRefreshUrls.some((url) =>
      originalRequest?.url?.includes(url)
    )

    const isMissingUser =
      error.response?.status === 404 &&
      error.response?.data?.error?.code === "AUTH_USER_NOT_FOUND"
    const isAuthError =
      error.response?.status === 401 || isMissingUser
    const isRefreshAttempt =
      originalRequest?.url === "/auth/refresh" || (originalRequest?._retry ?? false)

    if (isAuthError && isRefreshAttempt) {
      clearSession()
      return Promise.reject(error)
    }

    if (
      isAuthError &&
      !originalRequest?._retry &&
      !isSkipUrl
    ) {
      originalRequest._retry = true

      const refreshToken = Cookies.get("refreshToken")
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${apiBaseURL}/auth/refresh`,
            {
              refresh_token: refreshToken,
            }
          )

          const data = response.data?.data || response.data
          const access_token = data.access_token || data.AccessToken

          if (access_token) {
            Cookies.set("accessToken", access_token, {
              expires: 7,
            })

            originalRequest.headers.Authorization = `Bearer ${access_token}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          clearSession()
          return Promise.reject(refreshError)
        }
      } else {
        clearSession()
      }
    }

    return Promise.reject(error)

    function clearSession() {
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register") &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login"
      }
    }
  }
)
