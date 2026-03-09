import React, { useEffect, useState } from 'react';
import { Card, Row, Col, DatePicker, Spin, Typography, Statistic } from 'antd';
import { Line, Column, Pie } from '@ant-design/plots';
import { getCoupleStats } from '../api';
import type { OverviewStats } from '../types';
import { getOverviewStats, getUserStats, getMessageStats } from '../api';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Stats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [messageStats, setMessageStats] = useState<any>(null);
  const [coupleStats, setCoupleStats] = useState<any>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [dateRange, setDateRange] = useState<[any, any]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const days = dateRange[1].diff(dateRange[0], 'day') || 30;
      const [overviewRes, userRes, messageRes, coupleRes] = await Promise.all([
        getOverviewStats(),
        getUserStats({ days }),
        getMessageStats({ days }),
        getCoupleStats(),
      ]);
      setOverview(overviewRes.data || null);
      setUserStats(userRes.data || null);
      setMessageStats(messageRes.data || null);
      setCoupleStats(coupleRes.data || null);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 配对成功率图表配置
  const couplePieConfig = {
    appendPadding: 10,
    data: [
      { type: '成功', value: coupleStats?.accepted || 0 },
      { type: '未接受', value: (coupleStats?.total_invites || 0) - (coupleStats?.accepted || 0) },
    ],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>📈 数据统计</Title>

      {/* 日期选择 */}
      <Card style={{ marginBottom: 24 }}>
        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [any, any])}
          style={{ marginBottom: 16 }}
        />
      </Card>

      {/* 用户增长趋势 */}
      <Card title="👥 用户增长趋势" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Statistic title="累计用户" value={overview?.users.total || 0} />
          </Col>
          <Col span={8}>
            <Statistic title="今日活跃" value={overview?.users.active_today || 0} />
          </Col>
          <Col span={8}>
            <Statistic title="本周活跃" value={overview?.users.active_week || 0} />
          </Col>
        </Row>
        <Line {...{
          data: userStats?.labels?.map((label: string, i: number) => [
            { date: label, type: '新增用户', value: userStats.new_users?.[i] || 0 },
            { date: label, type: '活跃用户', value: userStats.active_users?.[i] || 0 },
          ]).flat() || [],
          xField: 'date',
          yField: 'value',
          seriesField: 'type',
          color: ['#1890ff', '#52c41a'],
          smooth: true,
        }} />
      </Card>

      {/* 消息量趋势 */}
      <Card title="💬 消息量趋势" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Statistic title="总消息数" value={overview?.messages.total || 0} />
          </Col>
          <Col span={12}>
            <Statistic title="今日消息" value={overview?.messages.today || 0} />
          </Col>
        </Row>
        <Column {...{
          data: messageStats?.labels?.map((label: string, i: number) => ({
            date: label,
            value: messageStats.messages?.[i] || 0,
          })) || [],
          xField: 'date',
          yField: 'value',
          label: {
            position: 'middle',
            style: {
              fill: '#FFFFFF',
              opacity: 0.6,
            },
          },
        }} />
      </Card>

      {/* 配对统计 */}
      <Card title="💕 配对成功率" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic title="总邀请数" value={coupleStats?.total_invites || 0} />
          </Col>
          <Col span={8}>
            <Statistic title="成功配对" value={coupleStats?.accepted || 0} valueStyle={{ color: '#eb2f96' }} />
          </Col>
          <Col span={8}>
            <Statistic 
              title="成功率" 
              value={coupleStats?.success_rate || 0} 
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Pie {...couplePieConfig} />
        </div>
      </Card>

      {/* 存储统计 */}
      <Card title="💾 存储使用">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic title="图片存储" value={overview?.storage.images || '0 GB'} />
          </Col>
          <Col span={12}>
            <Statistic title="视频存储" value={overview?.storage.videos || '0 GB'} />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Stats;
