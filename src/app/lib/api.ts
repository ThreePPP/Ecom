const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not set in environment variables.");
}

// Helper function to get token from localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to make API requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Disable caching for all API requests to ensure fresh data
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    cache: options.cache || 'no-store',
  };

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  const data = await response.json();

  if (!response.ok) {
    // ให้ข้อมูล error ที่ชัดเจนขึ้นสำหรับ 401 errors
    if (response.status === 401) {
      throw new Error(data.message || 'การยืนยันตัวตนไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
    }
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string;
  }) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  login: async (email: string, password: string) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    return fetchAPI('/auth/me');
  },

  updateProfile: async (userData: any) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAuthenticated: () => {
    return !!getToken();
  },
};

// Product API
export const productAPI = {
  getProducts: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    flashSale?: boolean;
  }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return fetchAPI(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProductById: async (id: string) => {
    return fetchAPI(`/products/${id}`);
  },

  getCategories: async () => {
    return fetchAPI('/products/categories');
  },

  createProduct: async (productData: any) => {
    return fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (id: string, productData: any) => {
    return fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id: string) => {
    return fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    return fetchAPI('/cart');
  },

  addToCart: async (productId: string, quantity: number = 1) => {
    return fetchAPI('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateCartItem: async (productId: string, quantity: number) => {
    return fetchAPI(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (productId: string) => {
    return fetchAPI(`/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return fetchAPI('/cart', {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: {
      fullName: string;
      phoneNumber: string;
      address: string;
      district: string;
      province: string;
      postalCode: string;
    };
    paymentMethod: string;
  }) => {
    return fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getMyOrders: async () => {
    return fetchAPI('/orders');
  },

  getOrderById: async (id: string) => {
    return fetchAPI(`/orders/${id}`);
  },

  updateOrderToPaid: async (id: string) => {
    return fetchAPI(`/orders/${id}/pay`, {
      method: 'PUT',
    });
  },

  getAllOrders: async () => {
    return fetchAPI('/orders/admin/all');
  },

  updateOrderStatus: async (id: string, status: string) => {
    return fetchAPI(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  updateTrackingNumber: async (id: string, trackingNumber: string, carrier: string) => {
    return fetchAPI(`/orders/${id}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ trackingNumber, carrier }),
    });
  },

  deleteOrder: async (id: string) => {
    return fetchAPI(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return fetchAPI('/admin/stats');
  },

  getAllUsers: async () => {
    return fetchAPI('/admin/users');
  },

  // Get all products for admin (including inactive)
  getAllProducts: async () => {
    return fetchAPI('/admin/products');
  },

  updateUserRole: async (userId: string, role: 'user' | 'admin') => {
    return fetchAPI(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  deleteUser: async (userId: string) => {
    return fetchAPI(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    return fetchAPI(`/admin/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  },

  markNotificationAsRead: async (notificationId: string) => {
    return fetchAPI(`/admin/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsAsRead: async () => {
    return fetchAPI('/admin/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

// Upload API
export const uploadAPI = {
  // อัพโหลดรูปเดี่ยว
  uploadImage: async (file: File) => {
    const token = getToken();

    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนอัพโหลดรูปภาพ');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  // อัพโหลดหลายรูป (สูงสุด 10 รูป)
  uploadMultipleImages: async (files: File[]) => {
    const token = getToken();

    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนอัพโหลดรูปภาพ');
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  },

  // ลบรูปภาพ
  deleteImage: async (filename: string) => {
    return fetchAPI(`/upload/${filename}`, {
      method: 'DELETE',
    });
  },
};

// Address API
export const addressAPI = {
  // ดึงที่อยู่จัดส่งทั้งหมด
  getAddresses: async () => {
    return fetchAPI('/addresses');
  },

  // เพิ่มที่อยู่จัดส่งใหม่
  addAddress: async (addressData: {
    fullName: string;
    phoneNumber: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
    isDefault?: boolean;
  }) => {
    return fetchAPI('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  // แก้ไขที่อยู่จัดส่ง
  updateAddress: async (addressId: string, addressData: {
    fullName: string;
    phoneNumber: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
    isDefault?: boolean;
  }) => {
    return fetchAPI(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },

  // ลบที่อยู่จัดส่ง
  deleteAddress: async (addressId: string) => {
    return fetchAPI(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },

  // ตั้งเป็นที่อยู่เริ่มต้น
  setDefaultAddress: async (addressId: string) => {
    return fetchAPI(`/addresses/${addressId}/default`, {
      method: 'PATCH',
    });
  },
};

// Coin API
export const coinAPI = {
  // ดึงรายการ transactions
  getTransactions: async (page = 1, limit = 20) => {
    return fetchAPI(`/coins/transactions?page=${page}&limit=${limit}`);
  },

  // ดึงข้อมูลสรุป coins
  getSummary: async () => {
    return fetchAPI('/coins/summary');
  },

  // เพิ่ม coins (topup/earn)
  addCoins: async (data: {
    amount: number;
    type?: 'topup' | 'earn';
    description?: string;
    orderId?: string;
  }) => {
    return fetchAPI('/coins/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ใช้ coins
  spendCoins: async (data: {
    amount: number;
    description?: string;
    orderId?: string;
  }) => {
    return fetchAPI('/coins/spend', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin: เพิ่ม coins ให้ user
  adminAddCoins: async (data: {
    userId: string;
    amount: number;
    description?: string;
  }) => {
    return fetchAPI('/coins/admin/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin: ลบ/หัก coins จาก user
  adminRemoveCoins: async (data: {
    userId: string;
    amount: number;
    description?: string;
  }) => {
    return fetchAPI('/coins/admin/remove', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ส่งคำขอเติมเงินพร้อมใบเสร็จ
  submitTopupRequest: async (data: {
    amount: number;
    receiptImage: string;
    username: string;
    note?: string;
  }) => {
    return fetchAPI('/coins/topup-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ดึงรายการคำขอเติมเงินของตัวเอง
  getMyTopupRequests: async (page = 1, limit = 10) => {
    return fetchAPI(`/coins/topup-requests?page=${page}&limit=${limit}`);
  },

  // Admin: ดึงคำขอเติมเงินทั้งหมด
  getAllTopupRequests: async (page = 1, limit = 20, status?: string) => {
    const statusQuery = status ? `&status=${status}` : '';
    return fetchAPI(`/coins/admin/topup-requests?page=${page}&limit=${limit}${statusQuery}`);
  },

  // Admin: อนุมัติคำขอเติมเงิน
  approveTopupRequest: async (requestId: string, adminNote?: string) => {
    return fetchAPI(`/coins/admin/topup-requests/${requestId}/process`, {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', adminNote }),
    });
  },

  // Admin: ปฏิเสธคำขอเติมเงิน
  rejectTopupRequest: async (requestId: string, reason?: string) => {
    return fetchAPI(`/coins/admin/topup-requests/${requestId}/process`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject', adminNote: reason }),
    });
  },
};

// Wishlist API
export const wishlistAPI = {
  // Get user's wishlist
  getWishlist: async () => {
    return fetchAPI('/wishlist');
  },

  // Add product to wishlist
  addToWishlist: async (productId: string) => {
    return fetchAPI('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId: string) => {
    return fetchAPI(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  },

  // Toggle product in wishlist
  toggleWishlist: async (productId: string) => {
    return fetchAPI('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  // Check if product is in wishlist
  checkWishlist: async (productId: string) => {
    return fetchAPI(`/wishlist/check/${productId}`);
  },

  // Clear wishlist
  clearWishlist: async () => {
    return fetchAPI('/wishlist/clear', {
      method: 'DELETE',
    });
  },
};

export { API_URL };
