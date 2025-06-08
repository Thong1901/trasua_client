import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { sanPhamAPI } from '../services/api';

const SanPhamDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sanPham, setSanPham] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchSanPham = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await sanPhamAPI.getById(id);
        setSanPham(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Có lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchSanPham();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await sanPhamAPI.delete(id);
        navigate('/sanpham');
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Có lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleBack = () => {
    navigate('/sanpham');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Container>
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
        <Button variant="outline-secondary" onClick={handleBack}>
          <Icons.ArrowLeft className="me-2" />
          Quay Lại
        </Button>
      </Container>
    );
  }
  if (!sanPham) {
    return (
      <Container>
        <Alert variant="warning" className="mt-4">
          Không tìm thấy sản phẩm
        </Alert>
        <Button variant="outline-secondary" onClick={handleBack}>
          <Icons.ArrowLeft className="me-2" />
          Quay Lại
        </Button>
      </Container>
    );
  }

  return (
    <Container>      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-secondary" onClick={handleBack} className="me-3">
          <Icons.ArrowLeft size={18} />
        </Button>
        <div className="flex-grow-1">
          <h1 className="display-6 mb-0">Chi Tiết Sản Phẩm</h1>
          <p className="text-muted">Thông tin chi tiết của sản phẩm</p>
        </div>
        <div className="d-flex gap-2">          <Button
            as={Link}
            to={`/sanpham/${id}/edit`}
            variant="warning"
            className="d-flex align-items-center"
          >
            <Icons.Pencil className="me-2" size={16} />
            Chỉnh Sửa
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="d-flex align-items-center"
          >
            <Icons.Trash className="me-2" size={16} />
            Xóa
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h4 className="mb-0">{sanPham.ten}</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong className="text-muted">Tên Sản Phẩm:</strong>
                    <p className="mt-1 mb-0">{sanPham.ten}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong className="text-muted">Danh Mục:</strong>
                    <p className="mt-1 mb-0">
                      <Badge bg="secondary" className="fs-6">{sanPham.danhMuc}</Badge>
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="mb-3">
                <strong className="text-muted">Mô Tả:</strong>
                <p className="mt-1 mb-0">
                  {sanPham.moTa || <em className="text-muted">Chưa có mô tả</em>}
                </p>
              </div>

              <Row>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted">Giá:</strong>
                    <p className="mt-1 mb-0">
                      <span className="fs-4 text-success fw-bold">
                        {formatPrice(sanPham.gia)}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted">Số Lượng:</strong>
                    <p className="mt-1 mb-0">
                      <Badge 
                        bg={sanPham.soLuong > 10 ? 'success' : sanPham.soLuong > 0 ? 'warning' : 'danger'}
                        className="fs-6"
                      >
                        {sanPham.soLuong} sản phẩm
                      </Badge>
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="mb-3">
                    <strong className="text-muted">Trạng Thái:</strong>
                    <p className="mt-1 mb-0">
                      <Badge 
                        bg={sanPham.trangThai === 'co_san' ? 'success' : 'secondary'}
                        className="fs-6"
                      >
                        {sanPham.trangThai === 'co_san' ? 'Có Sẵn' : 'Hết Hàng'}
                      </Badge>
                    </p>
                  </div>
                </Col>
              </Row>

              <hr />

              <Row className="text-muted">
                <Col md={6}>
                  <small>
                    <strong>Ngày tạo:</strong> {formatDate(sanPham.ngayTao)}
                  </small>
                </Col>
                <Col md={6}>
                  <small>
                    <strong>Cập nhật lần cuối:</strong> {formatDate(sanPham.ngayCapNhat)}
                  </small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SanPhamDetail;
