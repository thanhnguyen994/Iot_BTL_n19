import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('access_token');
  
  // Nếu có token -> Cho phép hiển thị nội dung con (Outlet)
  // Nếu không -> Chuyển hướng về /login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;