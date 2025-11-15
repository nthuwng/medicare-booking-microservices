// axios.customize.ts
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // http://localhost:8080
  withCredentials: true, // gửi cookie refresh_token
});

// Request: gắn access_token lên header
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: {
  resolve: (v?: unknown) => void;
  reject: (e?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// Response: auto refresh khi 401
instance.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  async (error) => {
    const originalRequest = error?.config;

    // Nếu request refresh-token chính nó bị 401 → không retry nữa
    if (originalRequest?.url?.includes("/api/auth/refresh-token")) {
      localStorage.removeItem("access_token");
      isRefreshing = false;
      processQueue(error, null);

      // Chỉ redirect nếu đang không ở trang login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (error?.response?.status === 401 && !originalRequest?._retry) {
      // Nếu đang refresh, các request khác chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await instance.post("/api/auth/refresh-token", {});
        const newToken = res?.data?.access_token;

        if (newToken) {
          localStorage.setItem("access_token", newToken);
          processQueue(null, newToken);
          isRefreshing = false;

          originalRequest.headers["Authorization"] = "Bearer " + newToken;
          return instance(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.removeItem("access_token");

        // Chỉ redirect nếu đang không ở trang login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    }

    if (error && error.response && error.response.data) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
);

export default instance;
