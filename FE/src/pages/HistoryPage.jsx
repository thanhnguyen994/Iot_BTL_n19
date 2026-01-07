import React, { useEffect, useState } from 'react';
import { Card, Select, Spin, Empty, message } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';
import SensorService from '../services/sensor.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const { Option } = Select;

const HistoryPage = () => {
  const [loading, setLoading] = useState(false);
  
  // State selectedDeviceVal không dùng nữa vì đã chuyển sang dùng index để quản lý cả value và type
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // 1. CẤU HÌNH DANH SÁCH CẢM BIẾN
  const sensorOptions = [
    { label: 'Nhiệt độ', value: 'cam_bien_nhiet_do', type: 'temperature', unit: '°C', color: '#ff4d4f' },
    { label: 'Độ ẩm đất', value: 'cam_bien_do_am', type: 'humidity', unit: '%', color: '#40a9ff' },
    { label: 'Ánh sáng', value: 'cam_bien_anh_sang', type: 'light', unit: ' (0/1)', color: '#faad14' },
    
    // Các loại khí (Dùng chung deviceName 'air_quality' nhưng khác type)
    { label: 'Không khí (CO2)', value: 'air_quality', type: 'co2', unit: 'ppm', color: '#52c41a' },
    { label: 'Không khí (NH3)', value: 'air_quality', type: 'nh3', unit: 'ppm', color: '#13c2c2' },
    { label: 'Không khí (NOx)', value: 'air_quality', type: 'nox', unit: 'ppm', color: '#722ed1' },
    { label: 'Không khí (Alcohol)', value: 'air_quality', type: 'alcohol', unit: 'ppm', color: '#eb2f96' },
    { label: 'Không khí (Benzene)', value: 'air_quality', type: 'benzene', unit: 'ppm', color: '#fa541c' },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentSensor = sensorOptions[selectedIndex];

  const fetchHistory = async () => {
    setLoading(true);
    setChartData({ labels: [], datasets: [] });

    try {
      // Gọi API
      console.log(`Đang lấy lịch sử cho: ${currentSensor.value} - ${currentSensor.type}`);
      const res = await SensorService.getHistoryData(currentSensor.value, currentSensor.type);
      
      console.log("Dữ liệu gốc từ API:", res);

      if (Array.isArray(res) && res.length > 0) {
        
        // --- THÊM LOGIC LẤY 30 MẪU GẦN NHẤT ---
        // Giả sử API trả về mảng theo thứ tự cũ -> mới (push vào DB). 
        // Ta lấy 30 phần tử cuối mảng.
        const recentData = res.slice(-30); 

        // 1. Xử lý trục thời gian
        const labels = recentData.map(item => {
           const timeStr = item.createdAt || item.timestamp || item.created_at || new Date().toISOString();
           return dayjs(timeStr).format('HH:mm DD/MM');
        });

        // 2. Xử lý trục giá trị
        const values = recentData.map((item, index) => {
            // --- ƯU TIÊN 1: Tìm number_value ngay lớp ngoài cùng ---
            if (item.number_value !== undefined) {
                return parseFloat(item.number_value);
            }
            
            // --- ƯU TIÊN 2: Tìm number_value trong item.value ---
            if (item.value && typeof item.value === 'object' && item.value.number_value !== undefined) {
                return parseFloat(item.value.number_value);
            }

            // --- CÁC TRƯỜNG HỢP DỰ PHÒNG KHÁC ---
            if (typeof item.value === 'number') return item.value;
            if (typeof item.value === 'string' && !isNaN(parseFloat(item.value))) return parseFloat(item.value);
            if (item[currentSensor.type] !== undefined) return parseFloat(item[currentSensor.type]);

            return 0;
        });

        console.log("Dữ liệu vẽ biểu đồ (30 mẫu):", values);

        setChartData({
          labels: labels,
          datasets: [{
              fill: true,
              label: `${currentSensor.label}`,
              data: values,
              borderColor: currentSensor.color,
              backgroundColor: `${currentSensor.color}33`,
              tension: 0.3,
              pointRadius: 3, 
          }],
        });
      }
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedIndex]);

  // Cấu hình hiển thị của ChartJS
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Biểu đồ ${currentSensor.label} (30 mẫu gần nhất)` },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: currentSensor.unit },
        
        suggestedMax: currentSensor.type === 'temperature' ? 50 
                      : currentSensor.type === 'humidity' ? 100 
                      : currentSensor.type === 'co2' ? 1000 
                      : 10, 

        ticks: {
          stepSize: currentSensor.type === 'temperature' ? 5 
                    : currentSensor.type === 'humidity' ? 10 
                    : undefined 
        }
      }
    }
  };

  return (
    <div>
       <h2 style={{ marginBottom: 20 }}>Lịch sử Dữ liệu</h2>
       <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
         <div style={{ marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Chọn cảm biến:</span>
            <Select 
              value={selectedIndex} 
              style={{ width: 220 }} 
              onChange={(val) => setSelectedIndex(val)}
            >
              {sensorOptions.map((opt, index) => (
                <Option key={index} value={index}>{opt.label}</Option>
              ))}
            </Select>
            <button onClick={fetchHistory} style={{ padding: '4px 15px', background: '#006400', color: '#fff', border: 'none', borderRadius: 4, height: 32, cursor: 'pointer' }}>
              Làm mới
            </button>
         </div>

         <div style={{ height: '400px', width: '100%', position: 'relative' }}>
            {loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>}
            {chartData.labels.length > 0 ? <Line options={options} data={chartData} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" style={{ marginTop: 100 }} />}
         </div>
       </Card>
    </div>
  );
};

export default HistoryPage;