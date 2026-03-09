import { get, post, put, del } from '../utils/request';
import type {
  LoginRequest,
  LoginResponse,
  Admin,
  PaginationParams,
  PaginationResponse,
  User,
  UserDetail,
  Message,
  OverviewStats,
  OperationLog,
} from '../types';

// ============ 认证接口 ============

// 管理员登录
export function login(data: LoginRequest) {
  return post<LoginResponse['data']>('/login', data);
}

// 管理员登出
export function logout() {
  return post('/logout');
}

// 获取当前管理员信息
export function getProfile() {
  return get<Admin>('/profile');
}

// ============ 用户管理接口 ============

// 获取用户列表
export function getUserList(params: PaginationParams) {
  return get<PaginationResponse<User>>('/users', params);
}

// 获取用户详情
export function getUserDetail(id: number) {
  return get<UserDetail>(`/users/${id}`);
}

// 禁用/启用用户
export function updateUserStatus(id: number, status: number) {
  return put(`/users/${id}/status`, { status });
}

// ============ 内容审核接口 ============

// 获取消息列表
export function getMessageList(params: PaginationParams & { couple_id?: number; type?: string }) {
  return get<PaginationResponse<Message>>('/messages', params);
}

// 删除消息
export function deleteMessage(id: number) {
  return del(`/messages/${id}`);
}

// 批量删除消息
export function batchDeleteMessages(ids: number[]) {
  return post('/messages/batch-delete', { ids });
}

// ============ 数据统计接口 ============

// 概览统计
export function getOverviewStats() {
  return get<OverviewStats>('/stats/overview');
}

// 用户增长统计
export function getUserStats(params: { days?: number }) {
  return get('/stats/users', params);
}

// 消息量统计
export function getMessageStats(params: { days?: number }) {
  return get('/stats/messages', params);
}

// 配对成功率统计
export function getCoupleStats() {
  return get('/stats/couples');
}

// ============ 管理员管理接口 ============

// 获取管理员列表
export function getAdminList() {
  return get<PaginationResponse<Admin>>('/admins');
}

// 创建管理员
export function createAdmin(data: { username: string; password: string; nickname: string; role: string }) {
  return post('/admins', data);
}

// 删除管理员
export function deleteAdmin(id: number) {
  return del(`/admins/${id}`);
}

// ============ 操作日志接口 ============

// 获取操作日志
export function getOperationLogs(params: PaginationParams & { admin_id?: number; action?: string }) {
  return get<PaginationResponse<OperationLog>>('/logs', params);
}
