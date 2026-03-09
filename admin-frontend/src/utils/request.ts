import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/admin';

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 添加 Token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    
    // 如果响应不成功
    if (!res.success) {
      message.error(res.error?.message || '请求失败');
      
      // 401 - 未认证，跳转登录
      if (res.error?.code === 'UNAUTHORIZED') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_info');
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(res.error?.message || '请求失败'));
    }
    
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // 网络错误或其他错误
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_info');
      window.location.href = '/login';
    } else {
      message.error(error.response?.data?.error?.message || '网络错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);

// 封装 GET 请求
export async function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.get<ApiResponse<T>>(url, { params, ...config });
  return response.data;
}

// 封装 POST 请求
export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

// 封装 PUT 请求
export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

// 封装 DELETE 请求
export async function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await request.delete<ApiResponse<T>>(url, config);
  return response.data;
}

export default request;
