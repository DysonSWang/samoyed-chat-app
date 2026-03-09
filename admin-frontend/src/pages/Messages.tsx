import React, { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Image,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getMessageList, deleteMessage, batchDeleteMessages } from '../api';
import type { Message } from '../types';

const { Title } = Typography;

const Messages: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadMessages();
  }, [page, pageSize, typeFilter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await getMessageList({
        page,
        pageSize,
        type: typeFilter || undefined,
      });
      setMessages(res.data?.list || []);
      setTotal(res.data?.pagination.total || 0);
    } catch (error) {
      console.error('加载消息列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除消息？',
      content: '删除后无法恢复，确定继续吗？',
      onOk: async () => {
        try {
          await deleteMessage(id);
          message.success('消息已删除');
          loadMessages();
        } catch (error) {
          console.error('删除消息失败:', error);
        }
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    
    Modal.confirm({
      title: `确认删除 ${selectedRowKeys.length} 条消息？`,
      content: '删除后无法恢复，确定继续吗？',
      onOk: async () => {
        try {
          await batchDeleteMessages(selectedRowKeys as number[]);
          message.success(`已删除 ${selectedRowKeys.length} 条消息`);
          setSelectedRowKeys([]);
          loadMessages();
        } catch (error) {
          console.error('批量删除失败:', error);
        }
      },
    });
  };

  const renderContent = (record: Message) => {
    switch (record.type) {
      case 'image':
        return (
          <Space>
            <Image
              src={record.media_url}
              width={50}
              height={50}
              style={{ objectFit: 'cover' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
            <span>[图片]</span>
          </Space>
        );
      case 'video':
        return <span>🎥 [视频] {record.content}</span>;
      case 'voice':
        return <span>🎤 [语音] {record.content}</span>;
      default:
        return record.content;
    }
  };

  const columns = [
    {
      title: '发送者',
      key: 'sender',
      render: (_: any, record: Message) => (
        <span>{record.sender.nickname || record.sender.username}</span>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: renderContent,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; text: string }> = {
          text: { color: 'blue', text: '文本' },
          image: { color: 'green', text: '图片' },
          video: { color: 'purple', text: '视频' },
          voice: { color: 'orange', text: '语音' },
        };
        const config = typeMap[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '发送时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Message) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>💬 内容审核</Title>

      <Card>
        {/* 筛选栏 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="消息类型"
            allowClear
            style={{ width: 150 }}
            onChange={handleTypeFilter}
            options={[
              { value: 'text', label: '文本' },
              { value: 'image', label: '图片' },
              { value: 'video', label: '视频' },
              { value: 'voice', label: '语音' },
            ]}
          />
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Space>

        {/* 消息列表 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={messages}
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
    </div>
  );
};

export default Messages;
