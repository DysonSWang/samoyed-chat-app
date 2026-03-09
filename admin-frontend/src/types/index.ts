// 管理员类型
export interface Admin {
  id: number;
  username: string;
  nickname: string;
  role: 'super' | 'admin';
  status: number;
  last_login_at?: string;
  created_at: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: Admin;
  };
  message: string;
}

// 通用响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// 分页参数
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// 用户类型
export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  status: number;
  couple_id?: number;
  created_at: string;
}

// 用户详情
export interface UserDetail extends User {
  couple?: {
    id: number;
    partner: {
      id: number;
      username: string;
      nickname: string;
    };
    status: string;
    created_at: string;
  };
  stats: {
    message_count: number;
    total_login_days: number;
  };
}

// 消息类型
export interface Message {
  id: number;
  couple_id: number;
  sender: {
    id: number;
    username: string;
    nickname: string;
  };
  content: string;
  type: 'text' | 'image' | 'video' | 'voice';
  media_url?: string;
  is_deleted: number;
  created_at: string;
}

// 统计数据
export interface OverviewStats {
  users: {
    total: number;
    active_today: number;
    active_week: number;
  };
  couples: {
    total: number;
    active: number;
  };
  messages: {
    total: number;
    today: number;
  };
  storage: {
    images: string;
    videos: string;
  };
}

// 操作日志
export interface OperationLog {
  id: number;
  admin: {
    id: number;
    username: string;
    nickname: string;
  };
  action: string;
  result: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}
