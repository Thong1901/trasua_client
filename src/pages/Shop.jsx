import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'react-bootstrap-icons';
import { sanPhamAPI } from '../services/api';
import { useCart } from '../hooks/useCart';
import ProductCustomization from '../components/ProductCustomization';

const Shop = () => {
  const navigate = useNavigate();
  const [sanPhams, setSanPhams] = useState([]);
  const [loading, setLoading] = useState(true);  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Sử dụng cart context
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  const danhMucOptions = [
    'Trà Sữa Truyền Thống',
    'Trà Sữa Trái Cây',
    'Trà Sữa Đặc Biệt',
    'Trà Nguyên Chất',
    'Nước Ép Trái Cây',
    'Topping'
  ];

  useEffect(() => {
    fetchSanPhams();
  }, []);

  const fetchSanPhams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sanPhamAPI.getAll();
      // Chỉ lấy sản phẩm có sẵn
      const availableProducts = response.data.data.filter(sp => 
        sp.trangThai === 'co_san' && sp.soLuong > 0
      );
      setSanPhams(availableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Có lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = sanPhams.filter(sanPham => {
    const matchesSearch = sanPham.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sanPham.moTa?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sanPham.danhMuc === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleShowCustomization = (product) => {
    setSelectedProduct(product);
    setShowCustomization(true);
  };

  const handleAddToCartWithCustomization = (product, customization) => {
    const productWithCustomization = {
      ...product,
      muc_ngot: customization.muc_ngot,
      muc_da: customization.muc_da,
      ghi_chu: customization.ghi_chu
    };
    addToCart(productWithCustomization);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  return (
    <div className="shop-container">
      <Container fluid className="py-4">
        <Row>
          {/* Sidebar - Filters & Cart */}
          <Col lg={3} className="mb-4">
            {/* Search */}
            <Card className="filter-card mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <Icons.Search className="me-2" />
                  Tìm Kiếm
                </h6>
              </Card.Header>
              <Card.Body>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputGroup.Text>
                    <Icons.Search />
                  </InputGroup.Text>
                </InputGroup>
              </Card.Body>
            </Card>

            {/* Category Filter */}
            <Card className="filter-card mb-3">
              <Card.Header>
                <h6 className="mb-0">
                  <Icons.Tags className="me-2" />
                  Danh Mục
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  {danhMucOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Form.Select>
              </Card.Body>
            </Card>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <Card className="filter-card cart-summary mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <Icons.Cart className="me-2" />
                    Giỏ Hàng ({getTotalItems()})
                  </h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    {cart.slice(0, 3).map(item => (
                      <div key={item._id} className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <small className="d-block">{item.ten}</small>
                          <small className="text-muted">SL: {item.quantity}</small>
                        </div>
                        <small className="fw-bold">
                          {formatPrice(item.gia * item.quantity)}
                        </small>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <small className="text-muted">... và {cart.length - 3} sản phẩm khác</small>
                    )}
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Tổng cộng:</strong>
                    <strong className="text-primary">
                      {formatPrice(getTotalPrice())}
                    </strong>
                  </div>

                  <Button 
                    variant="success" 
                    className="w-100"
                    onClick={() => navigate('/checkout')}
                  >
                    <Icons.CreditCard className="me-2" />
                    Đặt Hàng
                  </Button>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Main Content - Products */}
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Sản Phẩm ({filteredProducts.length})</h4>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <Icons.EmojiFrown size={48} className="text-muted mb-3" />
                <p className="text-muted">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Không tìm thấy sản phẩm phù hợp' 
                    : 'Chưa có sản phẩm nào'}
                </p>
              </div>
            ) : (              <Row>
                {filteredProducts.map((sanPham) => {
                  // Lấy tất cả các biến thể của sản phẩm này trong giỏ hàng
                  const cartItems = cart.filter(item => item._id === sanPham._id);
                  const totalQuantityInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                  
                  return (
                    <Col md={6} lg={4} key={sanPham._id} className="mb-4">
                      <Card className="product-card h-100">
                        <Card.Body className="d-flex flex-column">
                          <div className="mb-2">
                            <Badge bg="secondary" className="mb-2">
                              {sanPham.danhMuc}
                            </Badge>
                            {totalQuantityInCart > 0 && (
                              <Badge bg="success" className="ms-2">
                                Trong giỏ: {totalQuantityInCart}
                              </Badge>
                            )}
                          </div>
                          
                          <Card.Title className="h5">{sanPham.ten}</Card.Title>
                          
                          <Card.Text className="text-muted flex-grow-1">
                            {sanPham.moTa || 'Không có mô tả'}
                          </Card.Text>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <h5 className="text-primary mb-0">
                                {formatPrice(sanPham.gia)}
                              </h5>
                              <small className="text-muted">
                                Còn: {sanPham.soLuong}
                              </small>
                            </div>
                          </div>

                          {/* Hiển thị các biến thể trong giỏ hàng */}
                          {cartItems.length > 0 && (
                            <div className="mb-3">
                              <small className="text-muted d-block mb-2">Đã thêm:</small>
                              {cartItems.map((cartItem) => (
                                <div key={cartItem.customKey} className="d-flex justify-content-between align-items-center mb-1 p-2 bg-light rounded">
                                  <div>
                                    <small>
                                      {cartItem.muc_ngot !== 'vua' && `${cartItem.muc_ngot} `}
                                      {cartItem.muc_da !== 'vua' && `${cartItem.muc_da}`}
                                      {cartItem.muc_ngot === 'vua' && cartItem.muc_da === 'vua' && 'Mặc định'}
                                    </small>
                                    <small className="d-block">SL: {cartItem.quantity}</small>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => updateQuantity(cartItem._id, cartItem.quantity - 1, cartItem.customKey)}
                                    >
                                      <Icons.Dash />
                                    </Button>
                                    <span className="mx-2">{cartItem.quantity}</span>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={() => updateQuantity(cartItem._id, cartItem.quantity + 1, cartItem.customKey)}
                                      disabled={cartItem.quantity >= sanPham.soLuong}
                                    >
                                      <Icons.Plus />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="ms-2"
                                      onClick={() => removeFromCart(cartItem._id, cartItem.customKey)}
                                    >
                                      <Icons.Trash />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add to Cart Controls */}
                          <div className="d-grid gap-2">
                            <Button
                              variant="outline-primary"
                              onClick={() => handleShowCustomization(sanPham)}
                              disabled={sanPham.soLuong === 0}
                            >
                              <Icons.Gear className="me-2" />
                              Tùy Chỉnh
                            </Button>
                            <Button
                              variant="primary"
                              onClick={() => addToCart(sanPham)}
                              disabled={sanPham.soLuong === 0}
                            >
                              <Icons.CartPlus className="me-2" />
                              Thêm Nhanh
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Col>
        </Row>      </Container>

      {/* Product Customization Modal */}
      <ProductCustomization
        show={showCustomization}
        onHide={() => setShowCustomization(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCartWithCustomization}
      />
    </div>
  );
};

export default Shop;
