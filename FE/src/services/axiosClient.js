import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://iot-server-n19.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, 
});

axiosClient.interceptors.request.use(
  (config) => {
  
    const token = localStorage.getItem('access_token');
    
    if (token) {
     
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ---: Xử lý khi Token hết hạn ---
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
   
    if (error.response && error.response.status === 401) {     
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    throw error;
  }
);

export default axiosClient;