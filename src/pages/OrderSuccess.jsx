import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderInfo } = location.state || {};

  // Nếu không có thông tin đơn hàng, redirect về shop
  if (!orderId || !orderInfo) {
    return (
      <Container className="text-center py-5">
        <Icons.ExclamationTriangle className="display-1 text-warning mb-3" />
        <h3>Không tìm thấy thông tin đơn hàng</h3>
        <p className="text-muted">Vui lòng đặt hàng để xem thông tin.</p>
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <div className="mb-4">
          <Icons.CheckCircleFill 
            className="display-1 text-success"
            style={{ fontSize: '5rem' }}
          />
        </div>
        <h1 className="display-4 text-success mb-3">Đặt Hàng Thành Công!</h1>
        <p className="lead text-muted">
          Cảm ơn bạn đã tin tương và đặt hàng tại Trà Sữa Ngon
        </p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">
                <Icons.FileEarmarkText className="me-2" />
                Thông Tin Đơn Hàng
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6} className="mb-3">
                  <div className="border-end pe-md-4">
                    <h5 className="text-primary mb-3">
                      <Icons.PersonFill className="me-2" />
                      Thông Tin Khách Hàng
                    </h5>
                    <div className="mb-2">
                      <strong>Mã đơn hàng:</strong>
                      <span className="ms-2 text-monospace bg-light px-2 py-1 rounded">
                        #{orderId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Tên khách hàng:</strong>
                      <span className="ms-2">{orderInfo.ten_khach}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Số điện thoại:</strong>
                      <span className="ms-2">{orderInfo.sdt}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Địa chỉ giao hàng:</strong>
                      <span className="ms-2">{orderInfo.dia_chi}</span>
                    </div>
                    {orderInfo.ghi_chu_don_hang && (
                      <div className="mb-2">
                        <strong>Ghi chú:</strong>
                        <span className="ms-2">{orderInfo.ghi_chu_don_hang}</span>
                      </div>
                    )}
                  </div>
                </Col>
                
                <Col md={6} className="mb-3">
                  <h5 className="text-primary mb-3">
                    <Icons.InfoCircle className="me-2" />
                    Chi Tiết Đơn Hàng
                  </h5>
                  <div className="mb-2">
                    <strong>Thời gian đặt:</strong>
                    <span className="ms-2">{formatDate(new Date())}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Số lượng sản phẩm:</strong>
                    <span className="ms-2">{orderInfo.so_luong_san_pham} sản phẩm</span>
                  </div>
                  <div className="mb-2">
                    <strong>Tổng tiền:</strong>
                    <span className="ms-2 text-success fw-bold">
                      {formatPrice(orderInfo.tong_tien)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Phương thức thanh toán:</strong>
                    <span className="ms-2">Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <div className="mb-2">
                    <strong>Trạng thái:</strong>
                    <span className="ms-2">
                      <span className="badge bg-warning text-dark">Đang xử lý</span>
                    </span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Thông tin giao hàng */}
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">
                <Icons.Truck className="me-2" />
                Thông Tin Giao Hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-start">
                <Icons.Clock className="text-info me-3 mt-1" />
                <div>
                  <h6 className="mb-1">Thời gian giao hàng dự kiến</h6>
                  <p className="text-muted mb-2">
                    Đơn hàng sẽ được giao trong vòng <strong>30-60 phút</strong> kể từ khi xác nhận.
                  </p>
                  <small className="text-muted">
                    Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng và thời gian giao hàng cụ thể.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Liên hệ */}
          <Card className="mt-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <Icons.Headset className="me-2" />
                Hỗ Trợ Khách Hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-3">
                Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:
              </p>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <Icons.Telephone className="text-primary me-2" />
                  <strong>Hotline:</strong> 1900-1234
                </div>
                <div className="col-md-6 mb-2">
                  <Icons.Envelope className="text-primary me-2" />
                  <strong>Email:</strong> support@trasuangon.vn
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Nút hành động */}
          <div className="text-center mt-5">
            <Button 
              variant="primary" 
              size="lg" 
              className="me-3"
              onClick={() => navigate('/shop')}
            >
              <Icons.Shop className="me-2" />
              Tiếp Tục Mua Hàng
            </Button>
            
            <Button 
              variant="outline-secondary" 
              size="lg"
              onClick={() => window.print()}
            >
              <Icons.Printer className="me-2" />
              In Đơn Hàng
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderSuccess;
