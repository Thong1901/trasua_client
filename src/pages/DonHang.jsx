import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Badge, Form, Modal } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { donHangAPI } from '../services/api';

const DonHang = () => {
  const [donHangs, setDonHangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [refresh, setRefresh] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
    useEffect(() => {
    const fetchDonHangs = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Lấy tất cả đơn hàng và filter phía client để có nhiều tùy chọn filter hơn
        const response = await donHangAPI.getAll();
        let filteredOrders = response.data.data;
        
        // Filter theo trạng thái
        if (filter !== 'all') {
          filteredOrders = filteredOrders.filter(order => order.trang_thai === filter);
        }
        
        // Filter theo tìm kiếm (tên khách hàng hoặc SĐT)
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          filteredOrders = filteredOrders.filter(order => 
            order.ten_khach.toLowerCase().includes(searchLower) ||
            order.sdt.includes(searchTerm)
          );
        }
        
        // Filter theo ngày
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.ngay_dat);
            return orderDate.toDateString() === filterDate.toDateString();
          });
        }
        
        setDonHangs(filteredOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Có lỗi khi tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonHangs();
  }, [filter, refresh, searchTerm, dateFilter]);
  
  const handleRefresh = () => {
    setRefresh(prev => prev + 1);
  };  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Số lượng sản phẩm sẽ được hoàn trả về kho.')) {
      try {
        await donHangAPI.cancel(id);
        setRefresh(prev => prev + 1);
        alert('Đã hủy đơn hàng thành công');
      } catch (error) {
        console.error('Error canceling order:', error);
        setError('Có lỗi khi hủy đơn hàng');
      }
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await donHangAPI.updateStatus(orderId, newStatus);
      setRefresh(prev => prev + 1); // Refresh danh sách
      
      // Hiển thị thông báo thành công
      const statusText = getStatusText(newStatus);
      alert(`Đã cập nhật trạng thái đơn hàng thành: ${statusText}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Có lỗi khi cập nhật trạng thái đơn hàng');
    }
  };
  const handleConfirmOrder = async (id) => {
    if (window.confirm('Bạn có muốn xác nhận đơn hàng này?')) {
      try {
        console.log('=== DEBUG: Confirming order ===');
        console.log('Order ID:', id);
        console.log('New status: dang_xu_ly');
        
        const response = await donHangAPI.updateStatus(id, 'dang_xu_ly');
        console.log('API Response:', response);
        
        setRefresh(prev => prev + 1);
        alert('Đã xác nhận đơn hàng thành công');
      } catch (error) {
        console.error('Error confirming order:', error);
        console.error('Error details:', error.response?.data);
        setError('Có lỗi khi xác nhận đơn hàng: ' + (error.response?.data?.message || error.message));
      }    }
  };

  const handleViewDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      setShowDetail(true);
      const response = await donHangAPI.getById(orderId);
      setSelectedOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setError('Có lỗi khi tải chi tiết đơn hàng');
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
  };

  const handleResetFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setDateFilter('');
  };
  const getStatusText = (status) => {
    const statusMap = {
      'cho_xac_nhan': 'Chờ Xác Nhận',
      'dang_xu_ly': 'Đang Xử Lý',
      'hoan_thanh': 'Hoàn Thành',
      'da_huy': 'Đã Hủy'
    };
    return statusMap[status] || status;
  };
  const getFilteredStats = () => {
    // Stats được tính từ dữ liệu đã được filter hiện tại
    const total = donHangs.length;
    const choXacNhan = donHangs.filter(dh => dh.trang_thai === 'cho_xac_nhan').length;
    const daXacNhan = donHangs.filter(dh => dh.trang_thai === 'da_xac_nhan').length;
    const dangXuLy = donHangs.filter(dh => dh.trang_thai === 'dang_xu_ly').length;
    const dangGiao = donHangs.filter(dh => dh.trang_thai === 'dang_giao').length;
    const daGiao = donHangs.filter(dh => dh.trang_thai === 'da_giao').length;
    const huy = donHangs.filter(dh => dh.trang_thai === 'da_huy').length;
    
    return { total, choXacNhan, daXacNhan, dangXuLy, dangGiao, daGiao, huy };
  };

  const stats = getFilteredStats();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusBadge = (trangThai) => {
    const statusMap = {
      'cho_xac_nhan': { bg: 'warning', text: 'Chờ Xác Nhận' },
      'dang_xu_ly': { bg: 'primary', text: 'Đang Xử Lý' },
      'hoan_thanh': { bg: 'success', text: 'Hoàn Thành' },
      'da_huy': { bg: 'danger', text: 'Đã Hủy' }
    };
    const status = statusMap[trangThai] || { bg: 'secondary', text: trangThai };
    return <Badge bg={status.bg}>{status.text}</Badge>;
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
      <div className="d-flex justify-content-between align-items-center mb-4">        <div>
          <h1 className="display-5">
            Quản Lý Đơn Hàng
            {(filter !== 'all' || searchTerm || dateFilter) && (
              <span className="fs-6 text-muted ms-3">
                <Icons.Filter className="me-1" />
                ({donHangs.length} kết quả)
              </span>
            )}
          </h1>
          <p className="text-muted">Danh sách tất cả đơn hàng</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={handleRefresh}
            className="d-flex align-items-center"
          >
            <Icons.ArrowClockwise className="me-2" />
            Làm mới
          </Button>
          <Button as={Link} to="/donhang/create" variant="primary" className="d-flex align-items-center">
            <Icons.Plus className="me-2" />
            Tạo Đơn Hàng
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Label>Lọc theo trạng thái:</Form.Label>              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="cho_xac_nhan">Chờ Xác Nhận</option>
                <option value="dang_xu_ly">Đang Xử Lý</option>
                <option value="hoan_thanh">Hoàn Thành</option>
                <option value="da_huy">Đã Hủy</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Tìm kiếm khách hàng:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Tên hoặc SĐT khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Lọc theo ngày:</Form.Label>
              <Form.Control
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleResetFilters}
                  className="d-flex align-items-center"
                >
                  <Icons.ArrowCounterclockwise className="me-2" />
                  Reset
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={handleRefresh}
                  className="d-flex align-items-center"
                >
                  <Icons.ArrowClockwise className="me-2" />
                  Làm mới
                </Button>
              </div>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  <span>Hiển thị: <strong>{donHangs.length}</strong> đơn hàng</span>
                  {(filter !== 'all' || searchTerm || dateFilter) && (
                    <span className="ms-2 text-info">
                      <Icons.Filter className="me-1" />
                      Đang lọc
                    </span>
                  )}
                </div>
                <div className="text-muted">
                  {stats.dangXuLy > 0 && <span className="me-3">Đang xử lý: <strong>{stats.dangXuLy}</strong></span>}
                  {stats.daGiao > 0 && <span className="me-3">Đã giao: <strong>{stats.daGiao}</strong></span>}
                  {stats.huy > 0 && <span className="me-3">Đã hủy: <strong>{stats.huy}</strong></span>}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>          {donHangs.length === 0 ? (
            <div className="text-center py-5">
              {filter === 'all' && !searchTerm && !dateFilter ? (
                <>
                  <Icons.InboxFill size={64} className="text-muted mb-3" />
                  <p className="text-muted">Chưa có đơn hàng nào</p>
                  <Button as={Link} to="/donhang/create" variant="primary">
                    Tạo Đơn Hàng Đầu Tiên
                  </Button>
                </>
              ) : (
                <>
                  <Icons.Search size={64} className="text-muted mb-3" />
                  <p className="text-muted">Không tìm thấy đơn hàng nào với bộ lọc hiện tại</p>
                  <div className="mb-3">
                    {filter !== 'all' && (
                      <Badge bg="primary" className="me-2">
                        Trạng thái: {getStatusText(filter)}
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge bg="info" className="me-2">
                        Tìm kiếm: "{searchTerm}"
                      </Badge>
                    )}
                    {dateFilter && (
                      <Badge bg="warning" className="me-2">
                        Ngày: {new Date(dateFilter).toLocaleDateString('vi-VN')}
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline-secondary" onClick={handleResetFilters}>
                    <Icons.ArrowCounterclockwise className="me-2" />
                    Xóa bộ lọc
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>STT</th>
                  <th>Mã Đơn Hàng</th>
                  <th>Khách Hàng</th>
                  <th>Số Điện Thoại</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái</th>                  <th>Ngày Tạo</th>
                  <th className="text-center">Xác Nhận</th>
                  <th className="text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {donHangs.map((donHang, index) => (
                  <tr key={donHang._id}>
                    <td>{index + 1}</td>
                    <td>
                      <code className="text-primary">#{donHang._id.slice(-8)}</code>
                    </td>
                    <td>
                      <strong>{donHang.ten_khach}</strong>
                    </td>
                    <td>
                      <span className="text-muted">{donHang.sdt}</span>
                    </td>
                    <td>
                      <strong className="text-success">{formatPrice(donHang.tong_tien)}</strong>
                    </td>
                    <td>
                      {getStatusBadge(donHang.trang_thai)}
                    </td>
                    <td>
                      <small className="text-muted">{formatDate(donHang.ngay_dat)}</small>
                    </td>
                    <td>                      <div className="d-flex justify-content-center gap-1">
                        {donHang.trang_thai === 'cho_xac_nhan' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleConfirmOrder(donHang._id)}
                              title="Xác nhận đơn hàng"
                            >
                              <Icons.Check size={14} /> Xác Nhận
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(donHang._id)}
                              title="Hủy đơn hàng"
                            >
                              <Icons.X size={14} /> Hủy
                            </Button>
                          </>
                        )}
                        {donHang.trang_thai === 'dang_xu_ly' && (
                          <>
                            <Button
                              size="sm"
                              variant="info"
                              onClick={() => handleUpdateStatus(donHang._id, 'hoan_thanh')}
                              title="Hoàn thành đơn hàng"
                            >
                              <Icons.CheckCircle size={14} /> Hoàn Thành
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(donHang._id)}
                              title="Hủy đơn hàng"
                            >
                              <Icons.X size={14} /> Hủy
                            </Button>
                          </>
                        )}                        {['hoan_thanh', 'da_huy'].includes(donHang.trang_thai) && (
                          <span className="text-muted small">
                            <Icons.CheckCircle size={14} /> Đã Xử Lý
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          size="sm"
                          variant="outline-info"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetail(donHang._id)}
                        >
                          <Icons.Eye size={14} />
                        </Button>
                        {donHang.trang_thai === 'da_huy' && (
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(donHang._id)}
                            title="Xóa đơn hàng đã hủy"
                          >
                            <Icons.Trash size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetail} onHide={handleCloseDetail} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <Icons.Receipt className="me-2" />
            Chi Tiết Đơn Hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải chi tiết đơn hàng...</p>
            </div>
          ) : selectedOrder ? (
            <div>
              {/* Thông tin đơn hàng */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">
                        <Icons.Person className="me-2" />
                        Thông Tin Khách Hàng
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Tên khách hàng:</strong> {selectedOrder.ten_khach}
                      </div>
                      <div className="mb-2">
                        <strong>Số điện thoại:</strong> {selectedOrder.sdt}
                      </div>
                      <div className="mb-2">
                        <strong>Địa chỉ:</strong> {selectedOrder.dia_chi}
                      </div>
                      {selectedOrder.ghi_chu_don_hang && (
                        <div className="mb-2">
                          <strong>Ghi chú:</strong> 
                          <div className="text-muted">{selectedOrder.ghi_chu_don_hang}</div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">
                        <Icons.InfoCircle className="me-2" />
                        Thông Tin Đơn Hàng
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="mb-2">
                        <strong>Mã đơn hàng:</strong> 
                        <code className="ms-2">#{selectedOrder._id.slice(-8)}</code>
                      </div>
                      <div className="mb-2">
                        <strong>Trạng thái:</strong> 
                        <div className="mt-1">{getStatusBadge(selectedOrder.trang_thai)}</div>
                      </div>
                      <div className="mb-2">
                        <strong>Ngày đặt:</strong> {formatDate(selectedOrder.ngay_dat)}
                      </div>
                      <div className="mb-2">
                        <strong>Tổng tiền:</strong> 
                        <span className="text-success fw-bold fs-5 ms-2">
                          {formatPrice(selectedOrder.tong_tien)}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Chi tiết sản phẩm */}
              <Card>
                <Card.Header>
                  <h6 className="mb-0">
                    <Icons.Cart className="me-2" />
                    Chi Tiết Sản Phẩm ({selectedOrder.san_phams?.length || 0} món)
                  </h6>
                </Card.Header>
                <Card.Body>
                  {selectedOrder.san_phams && selectedOrder.san_phams.length > 0 ? (                    <Table responsive hover>
                      <thead className="table-light">
                        <tr>
                          <th>STT</th>
                          <th>Tên Sản Phẩm</th>
                          <th>Số Lượng</th>
                          <th>Đơn Giá</th>
                          <th>Thành Tiền</th>
                          <th>Tùy Chọn</th>
                          <th>Ghi Chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.san_phams.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{item.ten_san_pham}</strong>
                            </td>
                            <td>
                              <span className="badge bg-primary">{item.so_luong}</span>
                            </td>
                            <td>{formatPrice(item.gia_tai_thoi_diem)}</td>
                            <td>
                              <strong className="text-success">
                                {formatPrice(item.thanh_tien)}
                              </strong>
                            </td>
                            <td>
                              <div>
                                {item.muc_ngot && (
                                  <small className="badge bg-secondary me-1">
                                    Ngọt: {item.muc_ngot}
                                  </small>
                                )}
                                {item.muc_da && (
                                  <small className="badge bg-info">
                                    Đá: {item.muc_da}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              {item.ghi_chu ? (
                                <small className="text-muted">{item.ghi_chu}</small>
                              ) : (
                                <small className="text-muted">-</small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="4" className="text-end">
                            <strong>Tổng cộng:</strong>
                          </td>
                          <td colSpan="3">
                            <strong className="text-success fs-5">
                              {formatPrice(selectedOrder.tong_tien)}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  ) : (
                    <div className="text-center py-3 text-muted">
                      Không có sản phẩm nào trong đơn hàng
                    </div>
                  )}
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div className="text-center py-4">
              <Icons.ExclamationTriangle size={48} className="text-warning mb-3" />
              <p className="text-muted">Không thể tải chi tiết đơn hàng</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetail}>
            <Icons.X className="me-2" />
            Đóng
          </Button>
          {selectedOrder && selectedOrder.trang_thai === 'cho_xac_nhan' && (
            <>
              <Button 
                variant="success" 
                onClick={() => {
                  handleConfirmOrder(selectedOrder._id);
                  handleCloseDetail();
                }}
              >
                <Icons.Check className="me-2" />
                Xác Nhận Đơn Hàng
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  handleDelete(selectedOrder._id);
                  handleCloseDetail();
                }}
              >
                <Icons.X className="me-2" />
                Hủy Đơn Hàng
              </Button>
            </>
          )}          {selectedOrder && selectedOrder.trang_thai === 'dang_xu_ly' && (
            <Button 
              variant="info" 
              onClick={() => {
                handleUpdateStatus(selectedOrder._id, 'hoan_thanh');
                handleCloseDetail();
              }}
            >
              <Icons.CheckCircle className="me-2" />
              Hoàn Thành Đơn Hàng
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DonHang;
