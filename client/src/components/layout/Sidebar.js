import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  Warehouse,
  FileText,
  DollarSign,
  MapPin,
  UserCheck,
  Building2,
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const menuItems = [
  {
    title: 'แดชบอร์ด',
    path: '/',
    icon: Home,
  },
  {
    title: 'สินค้า',
    path: '/products',
    icon: Package,
  },
  {
    title: 'คลังสินค้า',
    path: '/inventory',
    icon: Warehouse,
  },
  {
    title: 'ธุรกรรมคลัง',
    path: '/inventory-transactions',
    icon: FileText,
  },
  {
    title: 'คำสั่งซื้อ',
    path: '/orders',
    icon: ShoppingCart,
  },
  {
    title: 'การขาย',
    path: '/sales',
    icon: DollarSign,
  },
  {
    title: 'รายงาน',
    path: '/reports',
    icon: BarChart3,
  },
  {
    title: 'ผู้ใช้',
    path: '/users',
    icon: Users,
  },
  {
    title: 'หมวดหมู่',
    path: '/categories',
    icon: Building2,
  },
  {
    title: 'ซัพพลายเออร์',
    path: '/suppliers',
    icon: Truck,
  },
  {
    title: 'ลูกค้า',
    path: '/customers',
    icon: UserCheck,
  },
  {
    title: 'ตำแหน่งในคลัง',
    path: '/warehouse-locations',
    icon: MapPin,
  },
  {
    title: 'ตั้งค่า',
    path: '/settings',
    icon: Settings,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <Warehouse className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">
              คลังสินค้า
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Warehouse Management
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 