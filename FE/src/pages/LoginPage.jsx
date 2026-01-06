import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
  //     // 1. Gọi API đăng nhập
  //     const res = await AuthService.login(values.username, values.password);

  //     // 2. Kiểm tra kết quả (Tùy cấu trúc server trả về)
  //     // Giả sử server trả về: { token: "...", user: { ... } }
  //     if (res && res.token) {
  //       // 3. Lưu Token và thông tin User
  //       localStorage.setItem('access_token', res.token);
  //       localStorage.setItem('user_info', JSON.stringify(res.user || { name: values.username }));
        
  //       message.success('Đăng nhập thành công!');
  //       navigate('/'); // Chuyển hướng về Dashboard
  //     } else {
  //       message.error('Phản hồi từ server không hợp lệ');
  //     }

  //   } catch (error) {
  //     console.error("Lỗi đăng nhập:", error);
  //     message.error('Sai tài khoản hoặc mật khẩu!');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  //-- Đang fake tạm thông tin đăng nhập để test
  //Tí mà Backend có setup thì ae tự thêm vào
  if (values.username === 'nguyendeptrai' && values.password === '18363637') {
          
          
          localStorage.setItem('access_token', 'fake-token-de-test-thoi-nha');
          
         
          localStorage.setItem('user_info', JSON.stringify({ 
              username: 'nguyendeptrai', 
              fullName: 'Admin Nguyên Đẹp Trai' 
          }));

          message.success('Đăng nhập (Test) thành công!');
          
         
          setTimeout(() => {
             navigate('/');
          }, 500);

      } else {
          message.error('Sai tài khoản hoặc mật khẩu (Thử nguyendeptrai/18363637 xem)');
      }
      // --------------------------------------------------------------------

    } catch (error) {
      console.error("Lỗi:", error);
      message.error('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    buttonColor: '#006400',
    buttonHover: '#004d00',
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: colors.background,
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 15, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: '#009900', marginBottom: 5, fontWeight: 'bold'}}>SMART FARM</Title>
          <Text type="secondary">Hệ thống giám sát & điều khiển</Text>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tài khoản" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{background: colors.buttonColor, borderColor: colors.buttonColor, fontWeight: 600
              }}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;