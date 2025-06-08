import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { sanPhamAPI, donHangAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
          // Lấy thống kê sản phẩm
        const productsResponse = await sanPhamAPI.getAll();
        const totalProducts = productsResponse.data.data.length;

        // Lấy tất cả đơn hàng
        const allOrdersResponse = await donHangAPI.getAll();
        const totalOrders = allOrdersResponse.data.data.length;

        // Lấy đơn hàng đang xử lý
        const pendingResponse = await donHangAPI.getAll('dang_xu_ly');
        const pendingOrders = pendingResponse.data.data.length;

        // Lấy đơn hàng đã giao
        const completedResponse = await donHangAPI.getAll('da_giao');
        const completedOrders = completedResponse.data.data.length;        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
          completedOrders
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '16rem' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }
  return (
    <Container>
      <div className="mb-4">
        <h1 className="display-4 text-dark">Dashboard</h1>
        <p className="lead text-muted">Tổng quan quản lý cửa hàng trà sữa</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="h-100">            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3">
                <Icons.Box size={24} />
              </div>
              <div>
                <p className="text-muted small mb-1">Tổng Sản Phẩm</p>
                <h4 className="mb-0">{stats.totalProducts}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="h-100">            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                <Icons.ClipboardData size={24} />
              </div>
              <div>
                <p className="text-muted small mb-1">Tổng Đơn Hàng</p>
                <h4 className="mb-0">{stats.totalOrders}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="h-100">            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning me-3">
                <Icons.Clock size={24} />
              </div>
              <div>
                <p className="text-muted small mb-1">Đang Xử Lý</p>
                <h4 className="mb-0">{stats.pendingOrders}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={3} className="mb-3">
          <Card className="h-100">            <Card.Body className="d-flex align-items-center">
              <div className="p-3 rounded-circle bg-info bg-opacity-10 text-info me-3">
                <Icons.CheckCircle size={24} />
              </div>
              <div>
                <p className="text-muted small mb-1">Đã Giao</p>
                <h4 className="mb-0">{stats.completedOrders}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col xs={12} md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Quản Lý Sản Phẩm</Card.Title>
              <Card.Text className="text-muted">
                Thêm, sửa, xóa sản phẩm trà sữa
              </Card.Text>
              <div className="d-grid gap-2">
                <Button as={Link} to="/sanpham" variant="primary">
                  Xem Tất Cả Sản Phẩm
                </Button>
                <Button as={Link} to="/sanpham/create" variant="outline-primary">
                  Thêm Sản Phẩm Mới
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Quản Lý Đơn Hàng</Card.Title>
              <Card.Text className="text-muted">
                Theo dõi và xử lý đơn hàng
              </Card.Text>
              <div className="d-grid gap-2">
                <Button as={Link} to="/donhang" variant="primary">
                  Xem Tất Cả Đơn Hàng
                </Button>
                <Button as={Link} to="/donhang/create" variant="outline-primary">
                  Tạo Đơn Hàng Mới
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
