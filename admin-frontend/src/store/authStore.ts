import { create } from 'zustand';
import type { Admin } from '../types';

interface AuthState {
  // 状态
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  
  // 行动
  setAuth: (token: string, admin: Admin) => void;
  clearAuth: () => void;
  updateAdmin: (admin: Partial<Admin>) => void;
}

// 从 localStorage 恢复状态
const getTokenFromStorage = () => localStorage.getItem('admin_token');
const getAdminFromStorage = () => {
  const adminStr = localStorage.getItem('admin_info');
  return adminStr ? JSON.parse(adminStr) : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  // 初始状态
  token: getTokenFromStorage(),
  admin: getAdminFromStorage(),
  isAuthenticated: !!getTokenFromStorage() && !!getAdminFromStorage(),
  
  // 设置认证信息
  setAuth: (token: string, admin: Admin) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_info', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },
  
  // 清除认证信息
  clearAuth: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    set({ token: null, admin: null, isAuthenticated: false });
  },
  
  // 更新管理员信息
  updateAdmin: (admin: Partial<Admin>) => {
    set((state) => {
      const updatedAdmin = state.admin ? { ...state.admin, ...admin } : null;
      if (updatedAdmin) {
        localStorage.setItem('admin_info', JSON.stringify(updatedAdmin));
      }
      return { admin: updatedAdmin };
    });
  },
}));
