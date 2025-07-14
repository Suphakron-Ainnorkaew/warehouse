import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, Settings } from 'lucide-react';
import { cn } from '../../utils/helpers';
import { apiService } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงข้อมูลสินค้าสต็อกต่ำ
    apiService.getLowStockItems().then(res => {
      const items = res.data.lowStockItems || [];
      setNotifications(
        items.map(item => ({
          id: item.id,
          text: `สินค้า "${item.product?.name || '-'}" ใกล้หมด (เหลือ ${item.quantity})`,
          read: false
        }))
      );
    }).catch(() => setNotifications([]));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setShowNotifications(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell className="h-6 w-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 z-50">
                <div className="px-4 py-2 font-semibold text-gray-700 border-b">การแจ้งเตือน</div>
                {notifications.length === 0 && (
                  <div className="px-4 py-2 text-gray-500">ไม่มีการแจ้งเตือน</div>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    className={
                      'block w-full text-left px-4 py-2 text-sm ' +
                      (n.read ? 'text-gray-400' : 'text-gray-800 bg-gray-50 hover:bg-gray-100')
                    }
                  >
                    {n.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <User className="h-6 w-6" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                ผู้ดูแลระบบ
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <Settings className="mr-3 h-4 w-4" />
                  ตั้งค่า
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowNotifications(false); }}
        />
      )}
    </header>
  );
};

export default Header; 