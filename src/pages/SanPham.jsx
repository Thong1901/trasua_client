import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { sanPhamAPI } from '../services/api';

const SanPham = () => {
  const [sanPhams, setSanPhams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSanPhams();
  }, []);

  const fetchSanPhams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sanPhamAPI.getAll();
      setSanPhams(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Có lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await sanPhamAPI.delete(id);
        await fetchSanPhams();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Có lỗi khi xóa sản phẩm');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-5">Quản Lý Sản Phẩm</h1>
          <p className="text-muted">Danh sách tất cả sản phẩm trà sữa</p>
        </div>        <Button as={Link} to="/sanpham/create" variant="primary" className="d-flex align-items-center">
          <Icons.Plus className="me-2" />
          Thêm Sản Phẩm
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {sanPhams.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Chưa có sản phẩm nào</p>
              <Button as={Link} to="/sanpham/create" variant="primary">
                Thêm Sản Phẩm Đầu Tiên
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Mô Tả</th>
                  <th>Giá</th>
                  <th>Số Lượng</th>
                  <th>Danh Mục</th>
                  <th>Trạng Thái</th>
                  <th className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {sanPhams.map((sanPham, index) => (
                  <tr key={sanPham._id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{sanPham.ten}</strong>
                    </td>
                    <td>
                      <span className="text-muted">
                        {sanPham.moTa && sanPham.moTa.length > 50 
                          ? `${sanPham.moTa.substring(0, 50)}...` 
                          : sanPham.moTa}
                      </span>
                    </td>
                    <td>
                      <strong className="text-success">{formatPrice(sanPham.gia)}</strong>
                    </td>
                    <td>
                      <Badge bg={sanPham.soLuong > 10 ? 'success' : sanPham.soLuong > 0 ? 'warning' : 'danger'}>
                        {sanPham.soLuong}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="secondary">{sanPham.danhMuc}</Badge>
                    </td>
                    <td>
                      <Badge bg={sanPham.trangThai === 'co_san' ? 'success' : 'secondary'}>
                        {sanPham.trangThai === 'co_san' ? 'Có Sẵn' : 'Hết Hàng'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">                        <Button
                          as={Link}
                          to={`/sanpham/${sanPham._id}`}
                          size="sm"
                          variant="outline-info"
                          title="Xem chi tiết"
                        >
                          <Icons.Eye size={14} />
                        </Button>
                        <Button
                          as={Link}
                          to={`/sanpham/${sanPham._id}/edit`}
                          size="sm"
                          variant="outline-warning"
                          title="Chỉnh sửa"
                        >
                          <Icons.Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(sanPham._id)}
                          title="Xóa"
                        >
                          <Icons.Trash size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SanPham;
