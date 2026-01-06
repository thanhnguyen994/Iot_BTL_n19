import { io } from "socket.io-client";

const SOCKET_URL = "https://iot-server-n19.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], 
  autoConnect: false,
  reconnection: true,
});

export default socket;