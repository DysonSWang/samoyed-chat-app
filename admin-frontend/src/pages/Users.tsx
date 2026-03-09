import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Avatar,
} from 'antd';
import { SearchOutlined, EyeOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getUserList, getUserDetail, updateUserStatus } from '../api';
import type { User } from '../types';

const { Title } = Typography;
const { Search } = Input;

const Users: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, keyword, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUserList({
        page,
        pageSize,
        keyword: keyword || undefined,
        status: statusFilter ? parseInt(statusFilter) : undefined,
      });
      setUsers(res.data?.list || []);
      setTotal(res.data?.pagination?.total || 0);
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleViewDetail = async (user: User) => {
    setDetailVisible(true);
    try {
      const res = await getUserDetail(user.id);
      setUserDetail(res.data);
    } catch (error) {
      console.error('加载用户详情失败:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 1 ? 0 : 1;
    const action = newStatus === 0 ? '禁用' : '启用';
    
    Modal.confirm({
      title: `确认${action}用户？`,
      content: `确定要${action}用户 "${user.username}" 吗？`,
      onOk: async () => {
        try {
          await updateUserStatus(user.id, newStatus);
          message.success(`用户已${action}`);
          loadUsers();
        } catch (error) {
          console.error('更新用户状态失败:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar src={record.avatar} icon={!record.avatar ? undefined : null} />
          <div>
            <div>{record.nickname || record.username}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '情侣关系',
      dataIndex: 'couple_id',
      key: 'couple_id',
      render: (couple_id: number) => (
        <Tag color={couple_id ? 'pink' : 'default'}>
          {couple_id ? '已配对' : '单身'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={record.status === 1 ? <StopOutlined /> : <CheckCircleOutlined />}
            danger={record.status === 1}
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>👥 用户管理</Title>

      <Card>
        {/* 筛选栏 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="搜索用户名/昵称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            options={[
              { value: '1', label: '正常' },
              { value: '0', label: '禁用' },
            ]}
          />
        </Space>

        {/* 用户列表 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      {/* 用户详情弹窗 */}
      <Modal
        title="用户详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {userDetail ? (
          <div>
            <Space style={{ marginBottom: 16 }}>
              <Avatar size={64} src={userDetail.avatar} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>
                  {userDetail.nickname || userDetail.username}
                </div>
                <div style={{ color: '#999' }}>{userDetail.username}</div>
              </div>
            </Space>
            
            <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
              <p>用户 ID: {userDetail.id}</p>
              <p>状态：<Tag color={userDetail.status === 1 ? 'green' : 'red'}>
                {userDetail.status === 1 ? '正常' : '禁用'}
              </Tag></p>
              <p>注册时间：{new Date(userDetail.created_at).toLocaleString('zh-CN')}</p>
            </Card>

            {userDetail.couple && (
              <Card size="small" title="情侣关系" style={{ marginBottom: 16 }}>
                <p>配对状态：<Tag color="pink">已配对</Tag></p>
                <p>伴侣：{userDetail.couple.partner.nickname || userDetail.couple.partner.username}</p>
                <p>配对时间：{new Date(userDetail.couple.created_at).toLocaleString('zh-CN')}</p>
              </Card>
            )}

            <Card size="small" title="统计数据">
              <p>消息数量：{userDetail.stats?.message_count || 0}</p>
              <p>登录天数：{userDetail.stats?.total_login_days || 0}</p>
            </Card>
          </div>
        ) : (
          <div>加载中...</div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
