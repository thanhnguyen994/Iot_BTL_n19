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
  
  // Mặc định chọn Nhiệt độ
  const [selectedDeviceVal, setSelectedDeviceVal] = useState('cam_bien_nhiet_do');
  
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // 1. CẤU HÌNH DANH SÁCH CẢM BIẾN (Thêm trường 'type' khớp với API Guide)
  const sensorOptions = [
    { label: 'Nhiệt độ', value: 'cam_bien_nhiet_do', type: 'temperature', unit: '°C', color: '#ff4d4f' },
    { label: 'Độ ẩm đất', value: 'cam_bien_do_am', type: 'humidity', unit: '%', color: '#40a9ff' },
    { label: 'Ánh sáng', value: 'cam_bien_anh_sang', type: 'light', unit: ' (0/1)', color: '#faad14' },
    
    // Các loại khí (Dùng chung deviceName 'air_quality' nhưng khác type)
    { label: 'Không khí (CO2)', value: 'CO2', type: 'co2', unit: 'ppm', color: '#52c41a' },
    { label: 'Không khí (NH3)', value: 'NH3', type: 'nh3', unit: 'ppm', color: '#13c2c2' },
    { label: 'Không khí (NOx)', value: 'NOx', type: 'nox', unit: 'ppm', color: '#722ed1' },
    { label: 'Không khí (Alcohol)', value: 'Alcohol', type: 'alcohol', unit: 'ppm', color: '#eb2f96' },
    { label: 'Không khí (Benzene)', value: 'Benzene', type: 'benzene', unit: 'ppm', color: '#fa541c' },
  ];

  // Logic tìm option hiện tại: Phải dựa vào cả value và type (để phân biệt các loại khí)
  // Tuy nhiên để đơn giản, ta sẽ dùng index hoặc tìm tương đối.
  // Ở đây tôi dùng biến selectedDeviceVal lưu 'value' chưa đủ, ta cần tìm đúng option.
  // CÁCH SỬA: State selectedDeviceVal sẽ lưu index của mảng sensorOptions để lấy được cả value và type.
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentSensor = sensorOptions[selectedIndex];

  const fetchHistory = async () => {
    setLoading(true);
    setChartData({ labels: [], datasets: [] });

    try {
      // Gọi API
      const res = await SensorService.getHistoryData(currentSensor.value, currentSensor.type);
      
      console.log("Dữ liệu gốc từ API:", res);

      if (Array.isArray(res) && res.length > 0) {
        
        // 1. Xử lý trục thời gian
        const labels = res.map(item => {
           const timeStr = item.createdAt || item.timestamp || item.created_at || new Date().toISOString();
           return dayjs(timeStr).format('HH:mm DD/MM');
        });

        // 2. Xử lý trục giá trị (ĐÃ SỬA LOGIC TÌM KIẾM)
        const values = res.map((item, index) => {
            // --- ƯU TIÊN 1: Tìm number_value ngay lớp ngoài cùng (Cấu trúc của bạn) ---
            if (item.number_value !== undefined) {
                return parseFloat(item.number_value);
            }
            
            // --- ƯU TIÊN 2: Tìm number_value trong item.value (nếu có lồng nhau) ---
            if (item.value && typeof item.value === 'object' && item.value.number_value !== undefined) {
                return parseFloat(item.value.number_value);
            }

            // --- CÁC TRƯỜNG HỢP DỰ PHÒNG KHÁC ---
            
            // Nếu item.value chính là số
            if (typeof item.value === 'number') return item.value;
            
            // Nếu item.value là string số
            if (typeof item.value === 'string' && !isNaN(parseFloat(item.value))) return parseFloat(item.value);

            // Nếu dữ liệu nằm trong biến theo tên type (VD: item.temperature)
            if (item[currentSensor.type] !== undefined) return parseFloat(item[currentSensor.type]);

            // Nếu bó tay -> Trả về 0
            return 0;
        });

        console.log("Dữ liệu vẽ biểu đồ:", values); // Kiểm tra xem mảng này đã có số chưa

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
  }, [selectedIndex]); // Chạy lại khi index thay đổi

  // Options biểu đồ
  // Cấu hình hiển thị của ChartJS (Đã sửa lỗi trục tung)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Biểu đồ ${currentSensor.label}` },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: currentSensor.unit },
        
        // --- THÊM ĐOẠN NÀY ĐỂ CHỈNH TRỤC TUNG ---
        
        // 1. suggestedMax: Ép trục tung phải cao ít nhất bao nhiêu (dù dữ liệu là 0)
        // Nếu là nhiệt độ -> Max ít nhất 50 độ. Độ ẩm -> 100%. CO2 -> 1000 ppm
        suggestedMax: currentSensor.type === 'temperature' ? 50 
                      : currentSensor.type === 'humidity' ? 100 
                      : currentSensor.type === 'co2' ? 1000 
                      : 10, // Mặc định cho các cái khác (như ánh sáng 0/1)

        // 2. ticks: Chỉnh độ chia nhỏ nhất (Bước nhảy)
        ticks: {
          // Nếu là nhiệt độ thì chia mỗi vạch 5 độ. Độ ẩm 10 độ.
          stepSize: currentSensor.type === 'temperature' ? 5 
                    : currentSensor.type === 'humidity' ? 10 
                    : undefined // Các cái khác để tự động
        }
      }
    }
  };

  return (
    <div>
       <h2 style={{ marginBottom: 20 }}>Lịch sử Dữ liệu</h2>
       <Card variant={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
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
            <button onClick={fetchHistory} style={{ padding: '4px 15px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, height: 32, cursor: 'pointer' }}>
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