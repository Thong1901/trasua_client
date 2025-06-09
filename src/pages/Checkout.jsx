import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { donHangAPI } from '../services/api';
import { useCart } from '../hooks/useCart';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // State cho topping của từng sản phẩm
  const [selectedToppings, setSelectedToppings] = useState({});
  
  const [customerInfo, setCustomerInfo] = useState({
    ten_khach: '',
    sdt: '',
    dia_chi: '',
    ghi_chu_don_hang: ''
  });

  // Danh sách topping cho Trà Sữa
  const toppings = [
    { id: 'socola', name: 'Socola', price: 5000 },
    { id: 'matcha', name: 'Matcha', price: 5000 },
    { id: 'keo_deo', name: 'Kẹo Dẻo', price: 5000 },
    { id: 'tran_chau', name: 'Trân Châu', price: 5000 },
    { id: 'thach_dua', name: 'Thạch Dừa', price: 5000 },
    { id: 'hat_sen', name: 'Hạt Sen', price: 5000 }
  ];

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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Xử lý chọn topping
  const handleToppingChange = (itemIndex, toppingId, checked) => {
    setSelectedToppings(prev => {
      const itemKey = `item_${itemIndex}`;
      const currentToppings = prev[itemKey] || [];
      
      if (checked) {
        return {
          ...prev,
          [itemKey]: [...currentToppings, toppingId]
        };
      } else {
        return {
          ...prev,
          [itemKey]: currentToppings.filter(id => id !== toppingId)
        };
      }
    });
  };

  // Tính tổng tiền topping cho một sản phẩm
  const getToppingsPrice = (itemIndex) => {
    const itemKey = `item_${itemIndex}`;
    const itemToppings = selectedToppings[itemKey] || [];
    return itemToppings.length * 5000; // Mỗi topping 5k
  };

  // Tính tổng tiền topping cho toàn bộ đơn hàng
  const getTotalToppingsPrice = () => {
    return cart.reduce((total, item, index) => {
      return total + (getToppingsPrice(index) * item.quantity);
    }, 0);
  };

  // Tính tổng tiền cuối cùng (sản phẩm + topping)
  const getFinalTotalPrice = () => {
    return getTotalPrice() + getTotalToppingsPrice();
  };

  // Tạo ghi chú topping cho sản phẩm
  const getToppingsNote = (itemIndex) => {
    const itemKey = `item_${itemIndex}`;
    const itemToppings = selectedToppings[itemKey] || [];
    if (itemToppings.length === 0) return '';
    
    const toppingNames = itemToppings.map(id => 
      toppings.find(t => t.id === id)?.name
    ).filter(Boolean);
    
    return `Topping: ${toppingNames.join(', ')} (+${formatPrice(itemToppings.length * 5000)})`;
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
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu đơn hàng với chi tiết tùy chỉnh và topping
      const san_phams = cart.map((item, index) => {
        let itemNote = item.ghi_chu || '';
        
        // Thêm ghi chú topping nếu sản phẩm là Trà Sữa
        if (item.danh_muc === 'Trà Sữa') {
          const toppingsNote = getToppingsNote(index);
          if (toppingsNote) {
            itemNote = itemNote ? `${itemNote}. ${toppingsNote}` : toppingsNote;
          }
        }
        
        return {
          san_pham_id: item._id,
          so_luong: item.quantity,
          ghi_chu: itemNote,
          chi_tiet_san_pham: {
            ten_san_pham: item.ten,
            so_luong: item.quantity,
            gia: item.gia + (item.danh_muc === 'Trà Sữa' ? getToppingsPrice(index) : 0),
            muc_ngot: item.muc_ngot || 'vua',
            muc_da: item.muc_da || 'vua'
          }
        };
      });

      const orderData = {
        ten_khach: customerInfo.ten_khach,
        sdt: customerInfo.sdt,
        dia_chi: customerInfo.dia_chi,
        ghi_chu_don_hang: customerInfo.ghi_chu_don_hang || '',
        san_phams: san_phams
      };

      // Tạo đơn hàng hoàn chỉnh với API
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
              tong_tien: getFinalTotalPrice(),
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
                  <Form.Label>Địa chỉ giao hàng * (chỉ nhận giao hàng trong địa bàn phú đa)</Form.Label>
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

          {/* Card Tùy Chỉnh Topping cho Trà Sữa */}
          {cart.some(item => item.danh_muc === 'Trà Sữa') && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <Icons.Plus className="me-2" />
                  Tùy Chỉnh Topping
                </h5>
                <small className="text-muted">Chọn topping cho các sản phẩm Trà Sữa (mỗi topping +5,000đ)</small>
              </Card.Header>
              <Card.Body>
                {cart.map((item, index) => {
                  if (item.danh_muc !== 'Trà Sữa') return null;
                  
                  return (
                    <div key={index} className="mb-4 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h6 className="mb-1">{item.ten}</h6>
                          <small className="text-muted">Số lượng: {item.quantity}</small>
                        </div>
                        <Badge bg="success">Trà Sữa</Badge>
                      </div>
                      
                      <div className="row">
                        {toppings.map(topping => {
                          const itemKey = `item_${index}`;
                          const isChecked = selectedToppings[itemKey]?.includes(topping.id) || false;
                          
                          return (
                            <div key={topping.id} className="col-md-6 col-lg-4 mb-2">
                              <Form.Check
                                type="checkbox"
                                id={`topping-${index}-${topping.id}`}
                                label={
                                  <span>
                                    {topping.name} 
                                    <small className="text-muted ms-1">
                                      (+{formatPrice(topping.price)})
                                    </small>
                                  </span>
                                }
                                checked={isChecked}
                                onChange={(e) => handleToppingChange(index, topping.id, e.target.checked)}
                              />
                            </div>
                          );
                        })}
                      </div>
                      
                      {selectedToppings[`item_${index}`]?.length > 0 && (
                        <div className="mt-3 p-2 bg-light rounded">
                          <small className="text-success">
                            <Icons.InfoCircle className="me-1" />
                            Tổng phụ phí topping: {formatPrice(getToppingsPrice(index) * item.quantity)}
                          </small>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          )}
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
                  {cart.map((item, index) => {
                    const itemToppingsPrice = item.danh_muc === 'Trà Sữa' ? getToppingsPrice(index) : 0;
                    const itemTotalPrice = (item.gia + itemToppingsPrice) * item.quantity;
                    
                    return (
                      <tr key={index}>
                        <td>
                          <div className="fw-medium" style={{ fontSize: '0.9rem' }}>
                            {item.ten}
                          </div>
                          <small className="text-muted">
                            {formatPrice(item.gia + itemToppingsPrice)}/sp
                          </small>
                          {item.danh_muc === 'Trà Sữa' && selectedToppings[`item_${index}`]?.length > 0 && (
                            <div>
                              <small className="text-success">
                                +{selectedToppings[`item_${index}`].length} topping
                              </small>
                            </div>
                          )}
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          {formatPrice(itemTotalPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tổng số lượng:</span>
                <strong>{getTotalItems()} sản phẩm</strong>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <span>Tiền sản phẩm:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              {getTotalToppingsPrice() > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí topping:</span>
                  <span className="text-success">+{formatPrice(getTotalToppingsPrice())}</span>
                </div>
              )}
              
              <div className="d-flex justify-content-between mb-3">
                <span>Phí giao hàng:</span>
                <span className="text-success">Miễn phí</span>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between">
                <h5>Tổng thanh toán:</h5>
                <h5 className="text-primary">{formatPrice(getFinalTotalPrice())}</h5>
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
