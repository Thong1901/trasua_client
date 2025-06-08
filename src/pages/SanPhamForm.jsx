import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { sanPhamAPI } from '../services/api';

const SanPhamForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    ten: '',
    moTa: '',
    gia: '',
    soLuong: '',
    danhMuc: '',
    trangThai: 'co_san'
  });

  const danhMucOptions = [
    'Trà Sữa Truyền Thống',
    'Trà Sữa Trái Cây',
    'Trà Sữa Đặc Biệt',
    'Trà Nguyên Chất',
    'Nước Ép Trái Cây',
    'Topping'
  ];
  useEffect(() => {
    const fetchSanPham = async () => {
      try {
        setLoading(true);
        const response = await sanPhamAPI.getById(id);
        const sanPham = response.data.data;
        setFormData({
          ten: sanPham.ten || '',
          moTa: sanPham.moTa || '',
          gia: sanPham.gia || '',
          soLuong: sanPham.soLuong || '',
          danhMuc: sanPham.danhMuc || '',
          trangThai: sanPham.trangThai || 'co_san'
        });
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Có lỗi khi tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) {
      fetchSanPham();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.ten.trim()) {
      setError('Tên sản phẩm không được để trống');
      return false;
    }
    if (!formData.gia || formData.gia <= 0) {
      setError('Giá sản phẩm phải lớn hơn 0');
      return false;
    }
    if (!formData.soLuong || formData.soLuong < 0) {
      setError('Số lượng không được âm');
      return false;
    }
    if (!formData.danhMuc) {
      setError('Vui lòng chọn danh mục');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        gia: parseFloat(formData.gia),
        soLuong: parseInt(formData.soLuong)
      };

      if (isEdit) {
        await sanPhamAPI.update(id, submitData);
        setSuccess('Cập nhật sản phẩm thành công!');
      } else {
        await sanPhamAPI.create(submitData);
        setSuccess('Tạo sản phẩm thành công!');
      }

      setTimeout(() => {
        navigate('/sanpham');
      }, 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(isEdit ? 'Có lỗi khi cập nhật sản phẩm' : 'Có lỗi khi tạo sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/sanpham');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-secondary" onClick={handleBack} className="me-3">
          <Icons.ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="display-6 mb-0">
            {isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
          </h1>
          <p className="text-muted">
            {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin sản phẩm mới'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tên Sản Phẩm <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="ten"
                        value={formData.ten}
                        onChange={handleChange}
                        placeholder="Nhập tên sản phẩm"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Danh Mục <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="danhMuc"
                        value={formData.danhMuc}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {danhMucOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Mô Tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="moTa"
                    value={formData.moTa}
                    onChange={handleChange}
                    placeholder="Nhập mô tả sản phẩm"
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá (VNĐ) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="gia"
                        value={formData.gia}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        step="1000"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số Lượng <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number"
                        name="soLuong"
                        value={formData.soLuong}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Trạng Thái</Form.Label>
                      <Form.Select
                        name="trangThai"
                        value={formData.trangThai}
                        onChange={handleChange}
                      >
                        <option value="co_san">Có Sẵn</option>
                        <option value="het_hang">Hết Hàng</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="d-flex align-items-center"
                  >                    {submitting ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <Icons.Save className="me-2" />
                    )}
                    {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SanPhamForm;
