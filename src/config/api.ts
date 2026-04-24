import Axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

type ResponseFunction = (response: AxiosResponse) => AxiosResponse;
type ErrorFunction = (e: unknown) => unknown;

class Api {
  private http: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.http = Axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 60000,
    });
    this.setRequestInterceptors();
    this.setResponseInterceptors();
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (token) resolve(token);
      else reject(error);
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<void> {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    try {
      const { data } = await this.http.post('auth/refresh');
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', JSON.stringify(data.token));
        localStorage.setItem('tokenExpiresAt', JSON.stringify(data.expires_at));
        if (data.user) {
          localStorage.setItem('userData', JSON.stringify(data.user));
        }
      }
      this.processQueue(null, data.token);
    } catch (err) {
      this.processQueue(err, null);
    } finally {
      this.isRefreshing = false;
    }
  }

  private setRequestInterceptors() {
    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      if (!config.headers.Authorization) {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const token = raw ? JSON.parse(raw) : '';
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;

          // Proactive refresh: if token expires within 10 minutes, trigger background refresh
          const expiresAtRaw =
            typeof window !== 'undefined' ? localStorage.getItem('tokenExpiresAt') : null;
          const expiresAt = expiresAtRaw ? JSON.parse(expiresAtRaw) : null;
          if (expiresAt && !this.isRefreshing) {
            const timeLeft = new Date(expiresAt).getTime() - Date.now();
            if (timeLeft > 0 && timeLeft < 10 * 60 * 1000) {
              // Fire-and-forget background refresh — does not block the request
              void this.refreshToken();
            }
          }
        }
      }
      return config;
    });
  }

  private setResponseInterceptors() {
    this.http.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401, not for auth endpoints themselves
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('auth/login') &&
          !originalRequest.url?.includes('auth/refresh')
        ) {
          if (this.isRefreshing) {
            // Wait for the ongoing refresh to complete, then retry
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: (token: string) => {
                  originalRequest._retry = true;
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(this.http(originalRequest));
                },
                reject: (err: unknown) => reject(err),
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { data } = await this.http.post('auth/refresh');
            const newToken = data.token;
            const newExpiresAt = data.expires_at;

            if (typeof window !== 'undefined') {
              localStorage.setItem('authToken', JSON.stringify(newToken));
              localStorage.setItem('tokenExpiresAt', JSON.stringify(newExpiresAt));
              if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
              }
            }

            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.http(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('tokenExpiresAt');
              localStorage.removeItem('userData');
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Non-401 errors: keep existing behavior
        if (error.isAxiosError && error.response?.data) {
          throw error.response;
        }
        throw error;
      },
    );
  }

  interceptRequest(onFulfilled: unknown, onRejected?: ErrorFunction) {
    this.http.interceptors.request.use(onFulfilled as never, onRejected);
    return this;
  }

  interceptResponse(onFulfilled: ResponseFunction, onRejected?: ErrorFunction) {
    this.http.interceptors.response.use(onFulfilled, onRejected);
    return this;
  }

  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.get(url, config);
  }

  post<T = unknown, R = unknown>(url: string, data?: T, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    return this.http.post(url, data ?? {}, config);
  }

  put<T = unknown, R = unknown>(url: string, data: Partial<T>, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    return this.http.put(url, data, config);
  }

  patch<T = unknown, R = unknown>(url: string, data: Partial<T>, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    return this.http.patch(url, data, config);
  }

  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.http.delete(url, config);
  }
}

export default new Api();
