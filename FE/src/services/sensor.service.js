import axiosClient from './axiosClient';

const SensorService = {
  // 1. Lấy tất cả danh sách thiết bị
  // Route: /all-devices
  getAllDevices: () => {
    return axiosClient.get('/all-devices');
  },

  // 2. Lấy dữ liệu cảm biến mới nhất (Dùng cho Dashboard)
  // Route: /sensor/get-latest/:deviceName/:sensorType
  // Nếu sensorType không cung cấp, backend có thể trả tổng quan
  getLatestData: (deviceName, sensorType) => {
    return axiosClient.get(`/sensor/get-latest/${deviceName}/${sensorType}`);
  },

  // 3. Lấy lịch sử dữ liệu (Dùng cho Biểu đồ)
  // Route: /sensor-data/history/:deviceName/:sensorType
  getHistoryData: (deviceName, sensorType) => {
    return axiosClient.get(`/sensor-data/history/${deviceName}/${sensorType}`);
  },

  // 4. Điều khiển thiết bị (Bật/Tắt)
  // Route: /sensor/change-status
  // Value: 1 (ON), 0 (OFF)
  controlDevice: (deviceName, sensorType, status) => {
    return axiosClient.post('/sensor/change-status', {
      deviceName: deviceName,
      sensorType: sensorType,
      value: status ? 1 : 0 // Chuyển boolean true/false thành 1/0
    });
  }
};

export default SensorService;