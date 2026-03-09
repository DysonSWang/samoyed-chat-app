import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
  Typography,
  Avatar,
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { getAdminList, createAdmin, deleteAdmin } from '../api';
import { useAuthStore } from '../store/authStore';
import type { Admin } from '../types';

const { Title } = Typography;

const Admins: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [createForm] = Form.useForm();
  const { admin: currentAdmin } = useAuthStore();

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await getAdminList();
      setAdmins(res.data?.list || []);
    } catch (error) {
      console.error('加载管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: any) => {
    try {
      await createAdmin(values);
      message.success('管理员创建成功');
      setCreateVisible(false);
      createForm.resetFields();
      loadAdmins();
    } catch (error) {
      console.error('创建管理员失败:', error);
    }
  };

  const handleDelete = (admin: Admin) => {
    if (admin.id === currentAdmin?.id) {
      message.error('不能删除自己');
      return;
    }
    
    Modal.confirm({
      title: '确认删除管理员？',
      content: `确定要删除管理员 "${admin.username}" 吗？`,
      onOk: async () => {
        try {
          await deleteAdmin(admin.id);
          message.success('管理员已删除');
          loadAdmins();
        } catch (error) {
          console.error('删除管理员失败:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: '管理员',
      key: 'admin',
      render: (_: any, record: Admin) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div>{record.nickname || record.username}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'super' ? 'red' : 'blue'}>
          {role === 'super' ? '超级管理员' : '普通管理员'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_at',
      key: 'last_login_at',
      render: (time?: string) => time ? new Date(time).toLocaleString('zh-CN') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Admin) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          disabled={record.id === currentAdmin?.id}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>
      ),
    },
  ];

  // 只有超级管理员才能管理其他管理员
  if (currentAdmin?.role !== 'super') {
    return (
      <div>
        <Title level={2}>🔒 权限不足</Title>
        <Card>
          <Typography.Text>只有超级管理员才能访问管理员管理页面。</Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>⚙️ 管理员管理</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateVisible(true)}
          >
            创建管理员
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={admins}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* 创建管理员弹窗 */}
      <Modal
        title="创建管理员"
        open={createVisible}
        onCancel={() => {
          setCreateVisible(false);
          createForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少 3 个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="admin"
          >
            <Select>
              <Select.Option value="admin">普通管理员</Select.Option>
              <Select.Option value="super">超级管理员</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => setCreateVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admins;
