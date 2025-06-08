import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { donHangAPI } from '../services/api';
import { useCart } from '../hooks/useCart';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    ten_khach: '',
    sdt: '',
    dia_chi: '',
    ghi_chu_don_hang: ''
  });

  // Nếu không có giỏ hàng, redirect về shop
  if (!cart || cart.length === 0) {
    return (
      <Container className="text-center py-5">
        <Icons.Cart className="display-1 text-muted mb-3" />
        <h3>Giỏ hàng trống</h3>
        <p className="text-muted">Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.</p>
        <Button variant="primary" onClick={() => navigate('/shop')}>
          <Icons.Shop className="me-2" />
          Về Trang Mua Hàng
        </Button>
      </Container>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!customerInfo.ten_khach.trim()) {
      setError('Vui lòng nhập tên khách hàng');
      return false;
    }
    if (!customerInfo.sdt.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!customerInfo.dia_chi.trim()) {
      setError('Vui lòng nhập địa chỉ');
      return false;
    }
    
    // Validate phone number (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerInfo.sdt.replace(/\s/g, ''))) {
      setError('Số điện thoại không hợp lệ (10-11 số)');
      return false;
    }

    return true;
  };  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu đơn hàng với chi tiết tùy chỉnh
      const san_phams = cart.map(item => ({
        san_pham_id: item._id,
        so_luong: item.quantity,
        ghi_chu: item.ghi_chu || '',
        chi_tiet_san_pham: {
          ten_san_pham: item.ten,
          so_luong: item.quantity,
          gia: item.gia,
          muc_ngot: item.muc_ngot || 'vua',
          muc_da: item.muc_da || 'vua'
        }
      }));

      const orderData = {
        ten_khach: customerInfo.ten_khach,
        sdt: customerInfo.sdt,
        dia_chi: customerInfo.dia_chi,
        ghi_chu_don_hang: customerInfo.ghi_chu_don_hang || '',
        san_phams: san_phams
      };      // Tạo đơn hàng hoàn chỉnh với API
      const orderResponse = await donHangAPI.createOrderWithCustomization(orderData);
      const orderId = orderResponse.data.data._id;
      
      setSuccess(true);
      setLoading(false);
      
      // Xóa giỏ hàng sau khi đặt hàng thành công
      clearCart();
      
      // Sau 2 giây chuyển đến trang xác nhận
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            orderId: orderId,
            orderInfo: {
              ...customerInfo,
              tong_tien: getTotalPrice(),
              so_luong_san_pham: getTotalItems()
            }
          }
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container className="text-center py-5">
        <div className="mb-4">
          <Icons.CheckCircleFill className="display-1 text-success" />
        </div>
        <h2 className="text-success mb-3">Đặt hàng thành công!</h2>
        <p className="text-muted">Đang chuyển đến trang xác nhận...</p>
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="text-center mb-4">
        <h1 className="display-5">
          <Icons.CreditCard className="me-3" />
          Đặt Hàng
        </h1>
        <p className="text-muted">Vui lòng điền thông tin để hoàn tất đặt hàng</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <Icons.ExclamationTriangleFill className="me-2" />
          {error}
        </Alert>
      )}

      <Row>
        {/* Thông tin đơn hàng */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Icons.PersonFill className="me-2" />
                Thông Tin Khách Hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmitOrder}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Tên khách hàng *</Form.Label>
                      <Form.Control
                        type="text"
                        name="ten_khach"
                        value={customerInfo.ten_khach}
                        onChange={handleInputChange}
                        placeholder="Nhập tên đầy đủ"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Số điện thoại *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="sdt"
                        value={customerInfo.sdt}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ giao hàng *</Form.Label>
                  <Form.Control
                    type="text"
                    name="dia_chi"
                    value={customerInfo.dia_chi}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ đầy đủ"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Ghi chú đơn hàng</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="ghi_chu_don_hang"
                    value={customerInfo.ghi_chu_don_hang}
                    onChange={handleInputChange}
                    placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                  />
                </Form.Group>
                
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/shop')}
                    disabled={loading}
                  >
                    <Icons.ArrowLeft className="me-2" />
                    Quay Lại
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang Xử Lý...
                      </>
                    ) : (
                      <>
                        <Icons.CheckCircle className="me-2" />
                        Xác Nhận Đặt Hàng
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Tổng quan đơn hàng */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">
                <Icons.Cart3 className="me-2" />
                Tổng Quan Đơn Hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <Table size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">SL</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="fw-medium" style={{ fontSize: '0.9rem' }}>
                          {item.ten}
                        </div>
                        <small className="text-muted">
                          {formatPrice(item.gia)}/sp
                        </small>
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">
                        {formatPrice(item.gia * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tổng số lượng:</span>
                <strong>{getTotalItems()} sản phẩm</strong>
              </div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Phí giao hàng:</span>
                <span className="text-success">Miễn phí</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between">
                <h5>Tổng thanh toán:</h5>
                <h5 className="text-primary">{formatPrice(getTotalPrice())}</h5>
              </div>
              
              <div className="mt-3 p-3 bg-light rounded">
                <small className="text-muted">
                  <Icons.InfoCircle className="me-1" />
                  Thanh toán khi nhận hàng (COD)
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;
