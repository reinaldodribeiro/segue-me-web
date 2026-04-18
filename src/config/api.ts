import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

type ResponseFunction = (response: AxiosResponse) => AxiosResponse;
type ErrorFunction = (e: unknown) => unknown;

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // 60s buffer to avoid race conditions
    return payload.exp ? payload.exp * 1000 < Date.now() - 60000 : false;
  } catch {
    return false; // Malformed token — let the API handle it
  }
}

class Api {
  private http: AxiosInstance;

  constructor() {
    this.http = Axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 60000,
    });
    this.setRequestInterceptors();
    this.setResponseInterceptors();
  }

  private setRequestInterceptors() {
    this.http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }
      if (!config.headers.Authorization) {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const token = raw ? JSON.parse(raw) : '';
        if (token && isTokenExpired(token)) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(new Error('Token expired'));
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private setResponseInterceptors() {
    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
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
