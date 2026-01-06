# Hướng dẫn kết nối Frontend - Backend IoT

Tài liệu này hướng dẫn cách gọi API và danh sách các thiết bị trong hệ thống.



## Danh sách Device Name và Sensor Type tương ứng
Sử dụng các cặp `deviceName` và `sensorType` sau:

| Device Name | Sensor Type | Mô tả |
|-------------|-------------|-------|
| `cam_bien_anh_sang` | `light` | Cảm biến ánh sáng |
| `den_led` | `led` | Đèn LED |
| `cam_bien_nhiet_do` | `temperature` | Cảm biến nhiệt độ |
| `cam_bien_do_am` | `humidity` | Cảm biến độ ẩm |
| `air_quality` | `co2`, `nh3`, `nox`, `alcohol`, `benzene` | Cảm biến chất lượng không khí |
| `quat` | `fan` | Quạt |
| `may_bom` | `pump` | Máy bơm |

## Các API chính

### 1. Lấy dữ liệu cảm biến mới nhất
- **Method:** `GET`
- **Route:** `/sensor/get-latest/:deviceName/:sensorType`
- **Ví dụ:** `GET /sensor/get-latest/cam_bien_nhiet_do/temperature`

### 2. Lấy lịch sử dữ liệu
- **Method:** `GET`
- **Route:** `/sensor-data/history/:deviceName/:sensorType`
- **Ví dụ:** `GET /sensor-data/history/air_quality/co2`

### 3. Điều khiển thiết bị (Gửi lệnh)
- **Method:** `POST`
- **Route:** `/sensor/change-status`
- **Body:**
  ```json
  {
    "deviceName": "den_led",
    "sensorType": "led", 
    "value": 1 
  }
  ```
  *(Lưu ý: value thường là 1 (ON) hoặc 0 (OFF) cho các thiết bị điều khiển)*

### 4. Lấy danh sách tất cả thiết bị
- **Method:** `GET`
- **Route:** `/all-devices`

## Socket.IO Integration (Realtime)

Backend sử dụng Socket.IO để gửi dữ liệu realtime (cảm biến, trạng thái thiết bị) xuống Frontend.

**Kết nối:**
```javascript
import { io } from "socket.io-client";
const socket = io("http://localhost:3000"); // URL server
```

**Các sự kiện (Events) cần lắng nghe:**

Backend sẽ emit các event tương ứng với `sensorType` hoặc loại thiết bị.

- `temperature`: Cảm biến nhiệt độ
- `humidity`: Cảm biến độ ẩm
- `light`: Cảm biến ánh sáng
- `co2`, `nh3`, `nox`, `alcohol`, `benzene`: Cảm biến chất lượng không khí (Thay thế cho `air_quality`)
- `led`: Trạng thái đèn LED
- `fan`: Trạng thái quạt
- `pump`: Trạng thái máy bơm

**Cấu trúc dữ liệu trả về (Payload):**
Tất cả các event đều trả về object có cấu trúc:

```json
{
  "deviceName": "cam_bien_nhiet_do", 
  "sensorType": "temperature",
  "value": 30.5,
  "unit": "°C",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Ví dụ Web Client (JS):**
```javascript
// Lắng nghe sự kiện nhiệt độ
socket.on("temperature", (data) => {
  console.log("Nhiệt độ mới:", data.value, data.unit);
});

// Lắng nghe sự kiện đèn LED
socket.on("led", (data) => {
  console.log("Trạng thái đèn:", data.value === 1 ? "Bật" : "Tắt");
});
```

## Hướng dẫn kết nối Mobile App

Lưu ý: Khi chạy trên Emulator hoặc thiết bị thật, `localhost` sẽ không hoạt động. Hãy dùng địa chỉ IP LAN của máy tính server (VD: `192.168.1.x`) hoặc `10.0.2.2` (dành riêng cho Android Emulator).

### 1. Kotlin (Android)
Thư viện: `io.socket:socket.io-client:2.x`

```kotlin
try {
    // Thay http://localhost:3000 bằng http://10.0.2.2:3000 nếu dùng Emulator
    val mSocket = IO.socket("http://192.168.1.5:3000") 
    mSocket.connect()
    
    mSocket.on("temperature") { args ->
        val data = args[0] as JSONObject
        val value = data.getDouble("value")
        Log.d("Socket", "Nhiệt độ: $value")
    }
} catch (e: URISyntaxException) {
    e.printStackTrace()
}
```

### 2. Flutter
Thư viện: `socket_io_client`

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

void connectSocket() {
  // Thay đổi IP phù hợp
  IO.Socket socket = IO.io('http://192.168.1.5:3000', 
    IO.OptionBuilder()
      .setTransports(['websocket']) // Bắt buộc
      .disableAutoConnect() 
      .build()
  );
  
  socket.connect();
  
  socket.onConnect((_) {
    print('Connected');
  });

  socket.on('temperature', (data) {
    print('Nhiệt độ: ${data['value']}');
  });
}
```

### 3. React Native
Thư viện: `socket.io-client`

```javascript
import io from 'socket.io-client';

// Thay đổi IP phù hợp
const socket = io('http://192.168.1.5:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('temperature', (data) => {
    console.log('Nhiệt độ nhận được:', data.value);
});
```
