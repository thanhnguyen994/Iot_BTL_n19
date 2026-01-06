import axiosClient from './axiosClient';

const AuthService = {
  login: async (username, password) => {
    const url = '/auth/login'; // <--- Kiểm tra lại route này với BE
    return axiosClient.post(url, { username, password });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user_info');
    if (userStr) return JSON.parse(userStr);
    return null;
  }
};

export default AuthService;