import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import UserLayout from './components/UserLayout';
import CartProvider from './contexts/CartProvider';
import Dashboard from './pages/Dashboard';
import SanPham from './pages/SanPham';
import SanPhamForm from './pages/SanPhamForm';
import SanPhamDetail from './pages/SanPhamDetail';
import DonHang from './pages/DonHang';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Admin Routes với Layout quản trị */}
          <Route path="/admin" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/sanpham" element={
            <Layout>
              <SanPham />
            </Layout>
          } />
          <Route path="/sanpham/create" element={
            <Layout>
              <SanPhamForm />
            </Layout>
          } />
          <Route path="/sanpham/:id" element={
            <Layout>
              <SanPhamDetail />
            </Layout>
          } />
          <Route path="/sanpham/:id/edit" element={
            <Layout>
              <SanPhamForm />
            </Layout>
          } />
          <Route path="/donhang" element={
            <Layout>
              <DonHang />
            </Layout>
          } />
          <Route path="/donhang/create" element={
            <Layout>
              <div className="text-center p-5">Trang Tạo Đơn Hàng - Đang phát triển</div>
            </Layout>
          } />
          <Route path="/donhang/:id" element={
            <Layout>
              <div className="text-center p-5">Trang Chi Tiết Đơn Hàng - Đang phát triển</div>
            </Layout>
          } />
          <Route path="/donhang/:id/edit" element={
            <Layout>
              <div className="text-center p-5">Trang Chỉnh Sửa Đơn Hàng - Đang phát triển</div>
            </Layout>
          } />

          {/* User Routes với UserLayout cho khách hàng */}
          <Route path="/" element={
            <UserLayout>
              <Shop />
            </UserLayout>
          } />
          <Route path="/checkout" element={
            <UserLayout>
              <Checkout />
            </UserLayout>
          } />
          <Route path="/order-success" element={
            <UserLayout>
              <OrderSuccess />
            </UserLayout>
          } />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
