import React, { useEffect, useState, useRef } from 'react';
import { Table, Switch, Tag, Card, Button, message, Space, Badge } from 'antd';
import { 
  ReloadOutlined, 
  ThunderboltOutlined, 
  CloudOutlined, 
  BulbOutlined, 
  AppstoreOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
  GatewayOutlined
} from '@ant-design/icons';
import SensorService from '../services/sensor.service';
import socket from '../services/socket.service';

const DevicePage = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  
  const DEVICE_CONFIG = {
    'quat': { label: 'Hệ thống Quạt', type: 'fan', icon: <ThunderboltOutlined />, color: 'green' },
    'may_bom': { label: 'Máy Bơm', type: 'pump', icon: <CloudOutlined />, color: 'blue' },
    'den_led': { label: 'Đèn LED', type: 'led', icon: <BulbOutlined />, color: 'gold' },
    'cung_cap_thuc_an': { label: 'Cửa (Servo)', type: 'door', icon: <GatewayOutlined />, color: 'purple' },
  };

  // 1. Hàm lấy danh sách thiết bị từ api (HTTP)
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await SensorService.getAllDevices();
      
      if (Array.isArray(res)) {
        // Chỉ lấy các thiết bị có trong DEVICE_CONFIG 
        const controlDevices = res.filter(d => DEVICE_CONFIG[d.name]);
        
        const formattedData = controlDevices.map(d => ({
          key: d.name, // Key là deviceName (vd: quat)
          name: d.name,
          type: DEVICE_CONFIG[d.name]?.type, // sensorType (vd: fan)
          displayName: DEVICE_CONFIG[d.name]?.label,
          status: d.value === 1, // 1 bật 0 tắt
          icon: DEVICE_CONFIG[d.name]?.icon,
          color: DEVICE_CONFIG[d.name]?.color,
        }));

        setDataSource(formattedData);
      }
    } catch (error) {
      console.error("Lỗi tải thiết bị:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Socket (Realtime) 
  useEffect(() => {
    fetchDevices();

    if (!socket.connected) socket.connect();

    // Theo dõi trạng thái kết nối
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    const handleSocketUpdate = (data) => {
      console.log("⚡ Socket nhận:", data); 
      
      setDataSource(prev => prev.map(item => {
        if (item.name === data.deviceName || item.type === data.sensorType) {
          return { ...item, status: data.value === 1 };
        }
        return item;
      }));
    };

    // Lắng nghe các sự kiện riêng lẻ 
    socket.on('led', handleSocketUpdate);
    socket.on('fan', handleSocketUpdate);
    socket.on('pump', handleSocketUpdate);
    socket.on('door', handleSocketUpdate); // Dự phòng cho máy cho ăn

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('led');
      socket.off('fan');
      socket.off('pump');
      socket.off('door');
    };
  }, []);

  // 3. Xử lý Bật/Tắt (Gửi API)
  const handleToggle = async (record, checked) => {
    const oldData = [...dataSource];
    setDataSource(prev => prev.map(item => 
      item.key === record.key ? { ...item, status: checked } : item
    ));

    try {
      // Gọi API: POST /sensor/change-status
      await SensorService.controlDevice(record.name, record.type, checked);
      message.success(`Đã gửi lệnh: ${checked ? 'BẬT' : 'TẮT'} ${record.displayName}`);
    } catch (error) {
      message.error('Gửi lệnh thất bại');
      setDataSource(oldData); 
    }
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Tên Thiết Bị',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 36, height: 36, borderRadius: '50%', 
            background: `${record.color}22`, display: 'flex', 
            justifyContent: 'center', alignItems: 'center',
            color: record.color, fontSize: 18
          }}>
            {record.icon}
          </div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Mã (ID)',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Tag>{text}</Tag>,
      responsive: ['sm'],
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Badge 
          status={status ? "processing" : "default"} 
          text={status ? <span style={{color: record.color, fontWeight: 500}}>ĐANG BẬT</span> : "ĐÃ TẮT"} 
        />
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Switch 
          checked={record.status} 
          onChange={(checked) => handleToggle(record, checked)}
          style={{ background: record.status ? record.color : undefined }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Space>
          <h2 style={{ margin: 0 }}><AppstoreOutlined /> Quản Lý Thiết Bị</h2>
          {isConnected ? 
            <Tag icon={<CheckCircleOutlined />} color="success">Socket Online</Tag> : 
            <Tag icon={<DisconnectOutlined />} color="error">Socket Offline</Tag>
          }
        </Space>
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchDevices} 
          loading={loading}
          type="primary" ghost
        >
          Làm mới
        </Button>
      </div>

      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 8 }}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          loading={loading}
          pagination={false}
          rowKey="key"
          locale={{ emptyText: 'Chưa có thiết bị nào' }}
        />
      </Card>
      
      <div style={{ marginTop: 15, color: '#999', fontSize: 12 }}>
        * Trạng thái thiết bị sẽ tự động cập nhật khi có thay đổi từ phần cứng (Real-time).
      </div>
    </div>
  );
};

export default DevicePage;