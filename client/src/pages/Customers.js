import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
      };
      const response = await apiService.getCustomers(params);
      setCustomers(response.data.customers);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await apiService.updateCustomer(editingCustomer.id, formData);
        toast.success('อัปเดตข้อมูลลูกค้าสำเร็จ');
      } else {
        await apiService.createCustomer(formData);
        toast.success('เพิ่มลูกค้าสำเร็จ');
      }
      setShowModal(false);
      setEditingCustomer(null);
      setFormData(initialForm);
      fetchCustomers();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบลูกค้านี้?')) {
      try {
        await apiService.deleteCustomer(id);
        toast.success('ลบลูกค้าสำเร็จ');
        fetchCustomers();
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการลบลูกค้า');
      }
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ลูกค้า</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลลูกค้า</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มลูกค้า
        </Button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Input
          placeholder="ค้นหาลูกค้า..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">นามสกุล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เบอร์โทร</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ที่อยู่</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สร้างเมื่อ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{customer.firstName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{customer.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(customer.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCustomer ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้า'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="ชื่อ" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
            <Input label="นามสกุล" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
          </div>
          <Input label="อีเมล" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <Input label="เบอร์โทร" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="ที่อยู่" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} type="textarea" />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button type="submit">{editingCustomer ? 'อัปเดต' : 'เพิ่ม'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Customers; 