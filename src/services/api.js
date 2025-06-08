import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// API Services cho Sản Phẩm
export const sanPhamAPI = {
  getAll: () => api.get('/sanpham'),
  getById: (id) => api.get(`/sanpham/${id}`),
  create: (data) => api.post('/sanpham', data),
  update: (id, data) => api.put(`/sanpham/${id}`, data),
  delete: (id) => api.delete(`/sanpham/${id}`),
  search: (keyword) => api.get(`/sanpham/search?q=${keyword}`),
};

// API Services cho Đơn Hàng
export const donHangAPI = {
  getAll: (trangThai = '') => api.get(`/donhang${trangThai ? `?trang_thai=${trangThai}` : ''}`),
  getById: (id) => api.get(`/donhang/${id}`),
  updateStatus: (id, trangThai) => api.patch(`/donhang/${id}/status`, { trang_thai: trangThai }),
  cancel: (id) => api.patch(`/donhang/${id}/cancel`),  // Hủy đơn hàng (hoàn trả kho)
  delete: (id) => api.delete(`/donhang/${id}`),         // Xóa đơn hàng (chỉ đơn đã hủy)
  
  // Tạo đơn hàng hoàn chỉnh với customization
  createOrderWithCustomization: (orderData) => {
    return api.post('/donhang/full', orderData);
  }
};

// API Services cho Chi Tiết Đơn Hàng
export const chiTietDonHangAPI = {
  getAll: () => api.get('/chitietdonhang'),
  getByDonHangId: (donHangId) => api.get(`/chitietdonhang/donhang/${donHangId}`),
  getFull: (donHangId) => api.get(`/chitietdonhang/full/${donHangId}`),
  create: (data) => api.post('/chitietdonhang', data),
  createFull: (data) => api.post('/chitietdonhang/full', data),
  update: (id, data) => api.put(`/chitietdonhang/${id}`, data),
  delete: (id) => api.delete(`/chitietdonhang/${id}`),
  
  // API mới hỗ trợ chi_tiet_san_pham
  createWithCustomOptions: (data) => {
    const payload = {
      don_hang_id: data.don_hang_id,
      san_pham_id: data.san_pham_id,
      so_luong: data.so_luong,
      ghi_chu: data.ghi_chu,
      chi_tiet_san_pham: data.chi_tiet_san_pham
    };
    return api.post('/chitietdonhang', payload);
  },
  
  updateWithCustomOptions: (id, data) => {
    const payload = {
      so_luong: data.so_luong,
      ghi_chu: data.ghi_chu,
      chi_tiet_san_pham: data.chi_tiet_san_pham
    };
    return api.put(`/chitietdonhang/${id}`, payload);
  },
  
  createOrderWithCustomization: (orderData) => {
    // orderData format:
    // {
    //   ten_khach: string,
    //   sdt: string,
    //   dia_chi: string,
    //   ghi_chu_don_hang: string,
    //   san_phams: [
    //     {
    //       san_pham_id: string,
    //       so_luong: number,
    //       ghi_chu: string,
    //       chi_tiet_san_pham: {
    //         ten_san_pham: string,
    //         so_luong: number,
    //         gia: number,
    //         muc_ngot: 'ngot' | 'vua' | 'it_ngot',
    //         muc_da: 'nhieu' | 'vua' | 'it' | 'khong'
    //       }
    //     }
    //   ]
    // }
    return api.post('/donhang/full', orderData);
  }
};


export default api;
