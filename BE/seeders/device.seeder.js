require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/device.model');

// Kết nối database
const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iot_database';
console.log('🔗 Đang kết nối đến:', dbUri.replace(/\/\/.*:.*@/, '//<username>:<password>@'));

mongoose.connect(dbUri)
  .then(() => console.log('✅ Kết nối database thành công'))
  .catch(err => console.error('❌ Lỗi kết nối database:', err));

// Dữ liệu seeder
const devices = [
  {
    name: 'cam_bien_anh_sang',
    type: 'sensor',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'cam_bien_nhiet_do',
    type: 'sensor',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'den_led',
    type: 'actuator',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'may_bom',
    type: 'actuator',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'cam_bien_do_am',
    type: 'sensor',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'cua_dieu_khien',
    type: 'actuator',
    location: 'vườn',
    status: 'offline'
  },
  {
    name: 'cam_bien_khong_khi',
    type: 'sensor',
    location: 'vườn',
    status: 'offline'
  }
];

// Hàm chạy seeder
const seedDevices = async () => {
  try {
    // Xóa tất cả devices hiện có
    await Device.deleteMany({});
    console.log('🗑️  Đã xóa tất cả devices cũ');

    // Thêm devices mới
    await Device.insertMany(devices);
    console.log('✅ Đã seed thành công', devices.length, 'devices');

    // Hiển thị danh sách devices
    const allDevices = await Device.find({});
    console.log('\n📋 Danh sách devices:');
    allDevices.forEach((device, index) => {
      console.log(`${index + 1}. ${device.name} - ${device.type} - ${device.location} - ${device.status}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed devices:', error);
    process.exit(1);
  }
};

// Chạy seeder
seedDevices();
