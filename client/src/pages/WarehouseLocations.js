import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../utils/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  description: '',
};

function WarehouseLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchLocations();
  }, [currentPage, searchTerm]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
      };
      const response = await apiService.getWarehouseLocations(params);
      setLocations(response.data.warehouseLocations);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลตำแหน่งคลัง');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await apiService.updateWarehouseLocation(editingLocation.id, formData);
        toast.success('อัปเดตตำแหน่งคลังสำเร็จ');
      } else {
        await apiService.createWarehouseLocation(formData);
        toast.success('เพิ่มตำแหน่งคลังสำเร็จ');
      }
      setShowModal(false);
      setEditingLocation(null);
      setFormData(initialForm);
      fetchLocations();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบตำแหน่งคลังนี้?')) {
      try {
        await apiService.deleteWarehouseLocation(id);
        toast.success('ลบตำแหน่งคลังสำเร็จ');
        fetchLocations();
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการลบตำแหน่งคลัง');
      }
    }
  };

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ตำแหน่งคลัง</h1>
          <p className="mt-1 text-sm text-gray-500">จัดการข้อมูลตำแหน่งในคลังสินค้า</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มตำแหน่งคลัง
        </Button>
      </div>
      <div className="bg-white shadow rounded-lg p-6">
        <Input
          placeholder="ค้นหาตำแหน่งคลัง..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">รายละเอียด</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สร้างเมื่อ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{location.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{location.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(location.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => handleEdit(location)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(location.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingLocation ? 'แก้ไขตำแหน่งคลัง' : 'เพิ่มตำแหน่งคลัง'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="ชื่อ" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          <Input label="รายละเอียด" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} type="textarea" />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>ยกเลิก</Button>
            <Button type="submit">{editingLocation ? 'อัปเดต' : 'เพิ่ม'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WarehouseLocations; 