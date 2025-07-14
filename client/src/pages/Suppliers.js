import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchSuppliers();
  }, [currentPage, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
      };
      const response = await apiService.getSuppliers(params);
      setSuppliers(response.data.suppliers);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลซัพพลายเออร์');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await apiService.updateSupplier(editingSupplier.id, formData);
        toast.success('อัปเดตซัพพลายเออร์สำเร็จ');
      } else {
        await apiService.createSupplier(formData);
        toast.success('เพิ่มซัพพลายเออร์สำเร็จ');
      }
      setShowModal(false);
      setEditingSupplier(null);
      setFormData(initialForm);
      fetchSuppliers();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactName: supplier.contactName || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบซัพพลายเออร์นี้?')) {
      try {
        await apiService.deleteSupplier(id);
        toast.success('ลบซัพพลายเออร์สำเร็จ');
        fetchSuppliers();
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการลบซัพพลายเออร์');
      }
    }
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ซัพพลายเออร์</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลซัพพลายเออร์</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มซัพพลายเออร์
        </Button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Input
          placeholder="ค้นหาซัพพลายเออร์..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อซัพพลายเออร์</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้ติดต่อ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">เบอร์โทร</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ที่อยู่</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สร้างเมื่อ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.contactName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{supplier.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(supplier.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSupplier ? 'แก้ไขซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="ชื่อซัพพลายเออร์" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="ชื่อผู้ติดต่อ" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} />
          <Input label="อีเมล" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <Input label="เบอร์โทร" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="ที่อยู่" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} type="textarea" />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button type="submit">{editingSupplier ? 'อัปเดต' : 'เพิ่ม'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Suppliers; 