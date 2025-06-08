import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import * as Icons from 'react-bootstrap-icons';
import { useCart } from '../hooks/useCart';

const UserLayout = ({ children }) => {
  // const location = useLocation();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  // const isActive = (path) => {
  //   return location.pathname === path;
  // };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Navbar expand="lg" className="navbar-user" style={{ backgroundColor: '#6f42c1', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center text-white">
            <span className="me-2" style={{ fontSize: '1.8rem' }}>🧋</span>
            <span className="fw-bold fs-3">Tee's House</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="user-navbar-nav" className="border-0" />
          <Navbar.Collapse id="user-navbar-nav">
            <Nav className="ms-auto align-items-center">

              {/* <Nav.Link 
                as={Link} 
                to="/contact"
                className={`text-white mx-2 ${isActive('/contact') ? 'fw-semibold border-bottom border-white border-2 pb-1' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <Icons.Telephone className="me-1" />
                Liên Hệ
              </Nav.Link> */}

              {/* Cart icon with badge */}
              {cartItemCount > 0 && (
                <Nav.Link 
                  as={Link} 
                  to="/checkout"
                  className="text-white mx-2 position-relative"
                  style={{ textDecoration: 'none' }}
                >
                  <Icons.Cart3 size={24} />
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {cartItemCount}
                  </Badge>
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 76px)' }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <div className="row">            <div className="col-md-4 mb-3">
              <h5 className="text-primary">
                <span className="me-2">🧋</span>
                Trà Sữa Ngon
              </h5>
              <p className="text-light">
                Thương hiệu trà sữa hàng đầu với hương vị tuyệt vời và chất lượng đảm bảo.
              </p>
            </div>
            
            <div className="col-md-4 mb-3">
              <h6 className="text-white">Liên Hệ</h6>
              <div className="text-light">
                <div className="mb-2">
                  <Icons.GeoAlt className="me-2" />
                  Phan Dịch, 48 Cồn Rang
                </div>
                <div className="mb-2">
                  <Icons.Telephone className="me-2" />
                  0395344556
                </div>
                <div className="mb-2">
                  <Icons.Envelope className="me-2" />
                  https://www.facebook.com/ms.tham.chuyen.vmb.gia.re
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-3">
              <h6 className="text-white">Giờ Mở Cửa</h6>
              <div className="text-light">
                <div className="mb-1">Thứ 2 - Thứ 6: 7:00 - 22:00</div>
                <div className="mb-1">Thứ 7 - Chủ nhật: 8:00 - 23:00</div>
              </div>
              
              <div className="mt-3">
                <h6 className="text-white">Theo Dõi Chúng Tôi</h6>                <div className="d-flex gap-2">
                  <a 
                    href="#" 
                    className="text-white text-decoration-none"
                    style={{ transition: 'opacity 0.3s' }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    <Icons.Facebook size={20} />
                  </a>
                  <a 
                    href="#" 
                    className="text-white text-decoration-none"
                    style={{ transition: 'opacity 0.3s' }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    <Icons.Instagram size={20} />
                  </a>
                  <a 
                    href="#" 
                    className="text-white text-decoration-none"
                    style={{ transition: 'opacity 0.3s' }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    <Icons.Tiktok size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="my-3" />
            <div className="text-center text-light">
            <small>© 2025 Trà Sữa Ngon. Tất cả quyền được bảo lưu.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default UserLayout;
