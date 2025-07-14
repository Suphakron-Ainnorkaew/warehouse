import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Edit } from 'lucide-react';
import { apiService } from '../utils/api';
import { formatCurrency, formatDate, translateStatus, getStatusColor } from '../utils/helpers';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'PENDING', label: translateStatus('PENDING') },
  { value: 'COMPLETED', label: translateStatus('COMPLETED') },
  { value: 'CANCELLED', label: translateStatus('CANCELLED') },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: '',
    userId: '',
    orderDate: new Date().toISOString().slice(0, 10),
    status: 'PENDING',
    orderItems: [],
  });
  const [orderItem, setOrderItem] = useState({ productId: '', quantity: '', unitPrice: '' });
  const [editingOrder, setEditingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchProducts();
    fetchUsers();
  }, [currentPage, selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: selectedStatus,
        search: searchTerm,
      };
      const response = await apiService.getOrders(params);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ');
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiService.getSuppliers({ limit: 100 });
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      setSuppliers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      setProducts(response.data.products || []);
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.getUsers({ limit: 100 });
      setUsers(response.data.users || []);
    } catch (error) {
      setUsers([]);
    }
  };

  // ดึง userId จาก localStorage (หรือให้กรอกเองถ้าไม่มี)
  useEffect(() => {
    const userId = localStorage.getItem('userId') || '';
    setFormData((prev) => ({ ...prev, userId }));
  }, [showModal]);

  const handleOrderItemChange = (e) => {
    setOrderItem({ ...orderItem, [e.target.name]: e.target.value });
  };

  const handleAddOrderItem = () => {
    if (!orderItem.productId || !orderItem.quantity || !orderItem.unitPrice) {
      toast.error('กรุณากรอกข้อมูลสินค้าให้ครบ');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      orderItems: [...prev.orderItems, { ...orderItem, quantity: parseInt(orderItem.quantity), unitPrice: parseFloat(orderItem.unitPrice) }],
    }));
    setOrderItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleRemoveOrderItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ถ้าไม่มี userId ให้เตือน
      if (!formData.userId) {
        toast.error('กรุณาระบุผู้สร้างคำสั่งซื้อ');
        return;
      }
      if (!formData.supplierId || formData.orderItems.length === 0) {
        toast.error('กรุณากรอกข้อมูลให้ครบ');
        return;
      }
      if (editingOrder) {
        await apiService.updateOrder(editingOrder.id, {
          ...formData,
          orderDate: formData.orderDate,
          orderItems: formData.orderItems,
          userId: formData.userId,
          supplierId: formData.supplierId,
          status: formData.status,
        });
        toast.success('อัปเดตคำสั่งซื้อสำเร็จ');
      } else {
        await apiService.createOrder({
          ...formData,
          orderDate: formData.orderDate,
          orderItems: formData.orderItems,
          userId: formData.userId,
          supplierId: formData.supplierId,
          status: formData.status,
        });
        toast.success('เพิ่มคำสั่งซื้อสำเร็จ');
      }
      setShowModal(false);
      setEditingOrder(null);
      resetForm();
      fetchOrders();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      supplierId: order.supplierId?.toString() || '',
      userId: order.userId?.toString() || '',
      orderDate: order.orderDate ? order.orderDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: order.status || 'PENDING',
      orderItems: order.orderItems?.map(item => ({
        productId: item.productId?.toString() || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })) || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบคำสั่งซื้อนี้?')) {
      try {
        await apiService.deleteOrder(id);
        toast.success('ลบคำสั่งซื้อสำเร็จ');
        fetchOrders();
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการลบคำสั่งซื้อ');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      userId: localStorage.getItem('userId') || '',
      orderDate: new Date().toISOString().slice(0, 10),
      status: 'PENDING',
      orderItems: [],
    });
    setOrderItem({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleAddNew = () => {
    resetForm();
    setEditingOrder(null);
    setShowModal(true);
  };

  // คำนวณยอดรวม
  const totalAmount = formData.orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">คำสั่งซื้อ</h1>
          <p className="mt-1 text-sm text-gray-500">ดูและจัดการคำสั่งซื้อจากซัพพลายเออร์</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มคำสั่งซื้อ
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Input
              placeholder="ค้นหาคำสั่งซื้อ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขที่คำสั่งซื้อ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ซัพพลายเออร์</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders && orders.length > 0 ? (
                    orders.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.orderNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.supplier?.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>{translateStatus(item.status)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(item.orderDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.totalAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลคำสั่งซื้อ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">ก่อนหน้า</button>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">ถัดไป</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">แสดงหน้า <span className="font-medium">{currentPage}</span> จาก <span className="font-medium">{totalPages}</span></p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{page}</button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingOrder(null); }} title={editingOrder ? 'แก้ไขคำสั่งซื้อ' : 'เพิ่มคำสั่งซื้อใหม่'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ซัพพลายเออร์ <span className="text-red-500">*</span></label>
              <select value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                <option value="">เลือกซัพพลายเออร์</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สั่งซื้อ</label>
              <Input type="date" value={formData.orderDate} onChange={e => setFormData({ ...formData, orderDate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ผู้สร้างคำสั่งซื้อ <span className="text-red-500">*</span></label>
              <select value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                <option value="">เลือกผู้ใช้</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username} ({user.firstName} {user.lastName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                {STATUS_OPTIONS.filter((s) => s.value).map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">รายการสินค้า</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <select name="productId" value={orderItem.productId} onChange={handleOrderItemChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">เลือกสินค้า</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} (SKU: {product.sku})</option>
                ))}
              </select>
              <Input name="quantity" type="number" min="1" placeholder="จำนวน" value={orderItem.quantity} onChange={handleOrderItemChange} />
              <Input name="unitPrice" type="number" min="0" step="0.01" placeholder="ราคาต่อหน่วย" value={orderItem.unitPrice} onChange={handleOrderItemChange} />
              <Button type="button" onClick={handleAddOrderItem}>เพิ่ม</Button>
            </div>
            <div className="mt-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500">สินค้า</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500">จำนวน</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500">ราคาต่อหน่วย</th>
                    <th className="px-2 py-1 text-xs font-medium text-gray-500">รวม</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.orderItems.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId || p.id === parseInt(item.productId));
                    return (
                      <tr key={idx}>
                        <td className="px-2 py-1">{product ? product.name : item.productId}</td>
                        <td className="px-2 py-1">{item.quantity}</td>
                        <td className="px-2 py-1">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-2 py-1">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        <td className="px-2 py-1 text-right"><button type="button" onClick={() => handleRemoveOrderItem(idx)} className="text-red-500"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-2 font-bold">ยอดรวม: {formatCurrency(totalAmount)}</div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingOrder(null); }}>ยกเลิก</Button>
            <Button type="submit">{editingOrder ? 'อัปเดต' : 'เพิ่มคำสั่งซื้อ'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders; 