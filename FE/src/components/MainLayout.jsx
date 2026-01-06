import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, Button , ConfigProvider} from 'antd';
import {
  DashboardOutlined,
  HistoryOutlined,
  ControlOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import AuthService from '../services/auth.service';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
        AuthService.logout(); 
    } else {
        navigate(key);
    }
  };

  const sidebarStyle = {
    
    background: '#009966', 
 
  };

  const logoStyle = {
    height: 64, 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '23px',     
    fontWeight: '800',    
    color: '#fff',        
    letterSpacing: '2px', 
    background: 'rgba(0,0,0,0.2)', 
    textShadow: '0 2px 4px rgba(0,0,0,0.3)', 
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        width={250} 
        style={{ background: sidebarStyle.background }}
      >
        <div style={logoStyle}>
          <span style={{ marginRight: 8, fontSize: 24 }}>🌱</span> 
          SMART FARM
        </div>

<style>
  {`
    .ant-menu-item-selected span {
      font-weight: 700 !important; /* Độ đậm */
    }
  `}
</style>

<ConfigProvider
  theme={{
    components: {
      Menu: {
        // 1. Cấu hình màu sắc
        itemSelectedBg: '#faad14',   
                                     
        itemSelectedColor: '#fff',   
        itemColor: 'rgba(255, 255, 255, 0.7)', 
        itemHoverColor: '#fff',     

        // 3. Cấu hình kích thước
        fontSize: 18,                
        itemHeight: 50,              
        borderRadiusLG: 10,           
      }
    }
  }}
>
        <Menu
          
          mode="inline"
          selectedKeys={[location.pathname]} 
          onClick={handleMenuClick}
          style={{ background: 'transparent', borderRight: 0, marginTop: 10, fontSize: '16px' }} 
          items={[
            {
              key: '/',
              icon: <DashboardOutlined />,
              label: 'Tổng quan',
            },
            {
              key: '/history',
              icon: <HistoryOutlined />,
              label: 'Lịch sử dữ liệu',
            },
            {
              key: '/devices',
              icon: <ControlOutlined />,
              label: 'Quản lý thiết bị',
            },
            {
                type: 'divider', 
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Đăng xuất',
              danger: true, 
            },
          ]}
        />
        </ConfigProvider>
      </Sider>

      <Layout> 
        <Header style={{ padding: 0, background: colorBgContainer, textAlign: 'right', paddingRight: '24px', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
            <span style={{ fontSize: 15 }}>
              Xin chào, <strong style={{ color: '#004d00' }}>{currentUser ? currentUser.username : 'Admin'}</strong> 👋
            </span>
        </Header>

        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;