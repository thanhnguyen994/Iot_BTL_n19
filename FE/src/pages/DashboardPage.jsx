import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Switch, message, Spin, Divider, Tag } from 'antd';
import { 
  FireOutlined, CloudOutlined, BulbOutlined, ExperimentOutlined, 
  ThunderboltOutlined, GiftOutlined, CheckCircleOutlined, DisconnectOutlined
} from '@ant-design/icons';
import SensorService from '../services/sensor.service';
import socket from '../services/socket.service';

const DashboardPage = () => {
  // 1. STATE
  const [sensors, setSensors] = useState({
    temperature: 0,
    humidity: 0,
    light: 0, 
    co2: 0,
  });

  const [devices, setDevices] = useState({
    fan: false, pump: false, led: false, feeder: false
  });

  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(socket.connected);

  // 2. HÀM XỬ LÝ DỮ LIỆU AN TOÀN
  const parseValue = (data) => {
    if (data === undefined || data === null) return 0;

    if (data.value !== undefined) return data.value;

    if (data.number_value !== undefined) return data.number_value;
    if (typeof data === 'number') return data;
    return 0;
  };

  // 3. GỌI API LẦN ĐẦU (Lấy dữ liệu nền)
  const fetchInitialData = async () => {
    try {
      // Gọi API lấy giá trị mới nhất
      const results = await Promise.allSettled([
        SensorService.getLatestData('cam_bien_nhiet_do', 'temperature'),
        SensorService.getLatestData('cam_bien_do_am', 'humidity'),
        SensorService.getLatestData('cam_bien_anh_sang', 'light'),
        SensorService.getLatestData('CO2', 'co2') 
      ]);

      const getApiVal = (res) => (res.status === 'fulfilled' && res.value) ? parseValue(res.value) : 0;

      setSensors({
        temperature: getApiVal(results[0]),
        humidity: getApiVal(results[1]),
        light: getApiVal(results[2]),
        co2: getApiVal(results[3]),
      });
      
      // Gọi API lấy trạng thái thiết bị
      const deviceRes = await SensorService.getAllDevices();
      if (Array.isArray(deviceRes)) {
        const newDevs = { ...devices };
        deviceRes.forEach(d => {
           if (d.name === 'quat') newDevs.fan = d.value === 1;
           if (d.name === 'may_bom') newDevs.pump = d.value === 1;
           if (d.name === 'den_led') newDevs.led = d.value === 1;
           if (d.name === 'cung_cap_thuc_an') newDevs.feeder = d.value === 1;
        });
        setDevices(newDevs);
      }

    } catch (error) {
      console.error("Lỗi tải dữ liệu ban đầu:", error);
    } finally {
      setLoading(false);
    }
  };

  // 4. THIẾT LẬP SOCKET 
  useEffect(() => {
    fetchInitialData();

    if (!socket.connected) socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    
    // 1. Nhiệt độ (Event: temperature)
    socket.on('temperature', (data) => {
      console.log("🔥 Socket Temp:", data);
      setSensors(prev => ({ ...prev, temperature: parseValue(data) }));
    });

    // 2. Độ ẩm (Event: humidity)
    socket.on('humidity', (data) => {
      setSensors(prev => ({ ...prev, humidity: parseValue(data) }));
    });

    // 3. Ánh sáng (Event: light)
    socket.on('light', (data) => {
      setSensors(prev => ({ ...prev, light: parseValue(data) }));
    });

    // 4. CO2 (Event: đang không biết co2 hoặc air_quality tùy backend emit cái nào)
    // Nghe cả 2 cho chắc
    const handleCO2 = (data) => setSensors(prev => ({ ...prev, co2: parseValue(data) }));
    socket.on('co2', handleCO2);
    socket.on('air_quality', handleCO2);

    // --- LẮNG NGHE TRẠNG THÁI THIẾT BỊ (Để đồng bộ nút gạt) ---
    
    socket.on('fan', (data) => setDevices(prev => ({ ...prev, fan: parseValue(data) === 1 })));
    socket.on('pump', (data) => setDevices(prev => ({ ...prev, pump: parseValue(data) === 1 })));
    socket.on('led', (data) => setDevices(prev => ({ ...prev, led: parseValue(data) === 1 })));
    socket.on('feeder', (data) => setDevices(prev => ({ ...prev, feeder: parseValue(data) === 1 })));

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('temperature');
      socket.off('humidity');
      socket.off('light');
      socket.off('co2');
      socket.off('air_quality');
      socket.off('fan');
      socket.off('pump');
      socket.off('led');
      socket.off('feeder');
    };
  }, []);

  // 5. HÀM ĐIỀU KHIỂN
  const handleToggleDevice = async (deviceName, sensorType, currentStatus) => {
  
    setDevices(prev => ({ ...prev, [sensorType]: !currentStatus }));
    
    try {
      await SensorService.controlDevice(deviceName, sensorType, !currentStatus);
      message.success(`Đã gửi lệnh tới ${deviceName}`);
    } catch (error) {
      message.error('Lỗi điều khiển thiết bị');
      // Revert nếu lỗi
      setDevices(prev => ({ ...prev, [sensorType]: currentStatus }));
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '20px' }}>Giám sát Môi trường</h2>
        {isConnected ? 
            <Tag icon={<CheckCircleOutlined />} color="success">Live Update</Tag> : 
            <Tag icon={<DisconnectOutlined />} color="error">Offline</Tag>
        }
      </div>

      <Row gutter={[16, 16]}>
        {/* Nhiệt độ */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderTop: '4px solid #ff4d4f', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Nhiệt độ" value={sensors.temperature} suffix="°C" valueStyle={{ color: '#ff4d4f' }} prefix={<FireOutlined />} />
          </Card>
        </Col>

        {/* Độ ẩm */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderTop: '4px solid #40a9ff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Độ ẩm đất" value={sensors.humidity} suffix="%" valueStyle={{ color: '#40a9ff' }} prefix={<CloudOutlined />} />
          </Card>
        </Col>

        {/* Ánh sáng */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderTop: '4px solid #faad14', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <div className="ant-statistic-title" style={{marginBottom: 4}}>Ánh sáng</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
               <BulbOutlined /> {sensors.light === 0 ? "Trời Sáng" : "Trời Tối"}
            </div>
          </Card>
        </Col>

        {/* CO2 */}
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderTop: '4px solid #52c41a', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Statistic title="Không khí (CO2)" value={sensors.co2} suffix=" ppm" valueStyle={{ color: '#52c41a' }} prefix={<ExperimentOutlined />} />
          </Card>
        </Col>
      </Row>

      <Divider />

      <h2 style={{ marginBottom: '20px' }}>Điều khiển Thiết bị</h2>
      <Row gutter={[16, 16]}>
        {/* Quạt */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable title="Hệ thống Quạt" extra={<ThunderboltOutlined />}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{devices.fan ? <Tag color="green">ĐANG CHẠY</Tag> : <Tag color="red">ĐÃ TẮT</Tag>}</span>
              <Switch checked={devices.fan} onChange={() => handleToggleDevice('quat', 'fan', devices.fan)} />
            </div>
          </Card>
        </Col>

        {/* Bơm */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable title="Máy Bơm Nước" extra={<CloudOutlined />}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{devices.pump ? <Tag color="blue">ĐANG TƯỚI</Tag> : <Tag color="default">ĐÃ TẮT</Tag>}</span>
              <Switch checked={devices.pump} onChange={() => handleToggleDevice('may_bom', 'pump', devices.pump)} style={{background: devices.pump ? '#1890ff' : undefined}} />
            </div>
          </Card>
        </Col>

        {/* Đèn */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable title="Đèn Chiếu Sáng" extra={<BulbOutlined />}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{devices.led ? <Tag color="gold">ĐANG SÁNG</Tag> : <Tag color="default">ĐÃ TẮT</Tag>}</span>
              <Switch checked={devices.led} onChange={() => handleToggleDevice('den_led', 'led', devices.led)} style={{background: devices.led ? '#faad14' : undefined}} />
            </div>
          </Card>
        </Col>

        {/* Máy Cho Ăn */}
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable title="Máy Cho Ăn" extra={<GiftOutlined />}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{devices.feeder ? <Tag color="purple">ĐANG MỞ</Tag> : <Tag color="default">ĐÃ ĐÓNG</Tag>}</span>
              <Switch checked={devices.feeder} onChange={() => handleToggleDevice('cung_cap_thuc_an', 'feeder', devices.feeder)} style={{background: devices.feeder ? '#722ed1' : undefined}} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;