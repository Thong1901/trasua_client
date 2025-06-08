import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <Navbar expand="lg" className="navbar-tea">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>🧋</span>
            <span className="text-tea fw-bold fs-4">Tee's House</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">            <Nav className="ms-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={isActive('/') ? 'text-tea fw-semibold' : 'text-muted'}
              >
                Dashboard
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/sanpham"
                className={isActive('/sanpham') ? 'text-tea fw-semibold' : 'text-muted'}
              >
                Sản Phẩm
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/donhang"
                className={isActive('/donhang') ? 'text-tea fw-semibold' : 'text-muted'}
              >
                Đơn Hàng
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/"
                className={isActive('/') ? 'text-tea fw-semibold' : 'text-muted'}
              >
                🛒 Mua Hàng
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="py-4">
        {children}
      </Container>
    </div>
  );
};

export default Layout;

