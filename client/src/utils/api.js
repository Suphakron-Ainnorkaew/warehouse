import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// สร้าง axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Users
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Categories
  getCategories: (params) => api.get('/categories', { params }),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductDashboard: () => api.get('/products/dashboard/summary'),

  // Suppliers
  getSuppliers: (params) => api.get('/suppliers', { params }),
  getSupplier: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`),

  // Customers
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),

  // Warehouse Locations
  getWarehouseLocations: (params) => api.get('/warehouse-locations', { params }),
  getWarehouseLocation: (id) => api.get(`/warehouse-locations/${id}`),
  createWarehouseLocation: (data) => api.post('/warehouse-locations', data),
  updateWarehouseLocation: (id, data) => api.put(`/warehouse-locations/${id}`, data),
  deleteWarehouseLocation: (id) => api.delete(`/warehouse-locations/${id}`),

  // Inventory
  getInventory: (params) => api.get('/inventory', { params }),
  getInventoryItem: (id) => api.get(`/inventory/${id}`),
  createInventory: (data) => api.post('/inventory', data),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventory: (id) => api.delete(`/inventory/${id}`),
  getLowStockItems: () => api.get('/inventory/low-stock/items'),

  // Inventory Transactions
  getInventoryTransactions: (params) => api.get('/inventory-transactions', { params }),
  getInventoryTransaction: (id) => api.get(`/inventory-transactions/${id}`),
  createInventoryTransaction: (data) => api.post('/inventory-transactions', data),
  getInventoryTransactionsByInventory: (inventoryId, params) => 
    api.get(`/inventory-transactions/inventory/${inventoryId}`, { params }),
  getTransactionSummary: (params) => api.get('/inventory-transactions/report/summary', { params }),
  getRecentInventoryTransactions: (limit = 5) => api.get('/inventory-transactions', { params: { limit, page: 1 } }),

  // Orders
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  getOrderSummary: (params) => api.get('/orders/report/summary', { params }),
  getRecentOrders: (limit = 5) => api.get('/orders', { params: { limit, page: 1 } }),

  // Sales
  getSales: (params) => api.get('/sales', { params }),
  getSale: (id) => api.get(`/sales/${id}`),
  createSale: (data) => api.post('/sales', data),
  updateSale: (id, data) => api.put(`/sales/${id}`, data),
  deleteSale: (id) => api.delete(`/sales/${id}`),
  getSaleSummary: (params) => api.get('/sales/report/summary', { params }),
  getRecentSales: (limit = 5) => api.get('/sales', { params: { limit, page: 1 } }),
};

export default api; 