import React, { useState, useEffect } from 'react';
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react';
import { apiService } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    totalInventory: 0,
    totalSuppliers: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลสถิติต่างๆ
        const [
          productsRes,
          usersRes,
          salesRes,
          ordersRes,
          lowStockRes,
          inventoryRes,
          suppliersRes,
          customersRes,
          inventoryTxRes,
          recentOrdersRes,
          recentSalesRes,
        ] = await Promise.all([
          apiService.getProducts({ limit: 1 }),
          apiService.getUsers({ limit: 1 }),
          apiService.getSales({ limit: 1 }),
          apiService.getOrders({ limit: 1 }),
          apiService.getLowStockItems(),
          apiService.getInventory({ limit: 1 }),
          apiService.getSuppliers({ limit: 1 }),
          apiService.getCustomers({ limit: 1 }),
          apiService.getRecentInventoryTransactions(5),
          apiService.getRecentOrders(5),
          apiService.getRecentSales(5),
        ]);

        setStats({
          totalProducts: productsRes.data.pagination?.total || 0,
          totalUsers: usersRes.data.pagination?.total || 0,
          totalSales: salesRes.data.pagination?.total || 0,
          totalOrders: ordersRes.data.pagination?.total || 0,
          lowStockItems: lowStockRes.data.lowStockItems?.length || 0,
          totalInventory: inventoryRes.data.pagination?.total || 0,
          totalSuppliers: suppliersRes.data.pagination?.total || 0,
          totalCustomers: customersRes.data.pagination?.total || 0,
        });
        // รวมกิจกรรมล่าสุด
        const txs = (inventoryTxRes.data.transactions || []).map(tx => ({
          type: 'inventory',
          id: tx.id,
          createdAt: tx.createdAt,
          text: `${tx.type === 'RECEIVE' ? 'รับเข้า' : tx.type === 'SELL' ? 'ขาย' : 'ปรับปรุง'}: ${tx.inventory?.product?.name || '-'} (${tx.quantity})`,
        }));
        const orders = (recentOrdersRes.data.orders || []).map(order => ({
          type: 'order',
          id: order.id,
          createdAt: order.orderDate,
          text: `คำสั่งซื้อ: ${order.orderNumber} (${order.status})`,
        }));
        const sales = (recentSalesRes.data.sales || []).map(sale => ({
          type: 'sale',
          id: sale.id,
          createdAt: sale.saleDate,
          text: `การขาย: ${sale.saleNumber} (฿${formatCurrency(sale.totalAmount)})`,
        }));
        // รวมและเรียงตามเวลา
        const all = [...txs, ...orders, ...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
        setRecentActivity(all);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'สินค้าทั้งหมด',
      value: formatNumber(stats.totalProducts),
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'ผู้ใช้ทั้งหมด',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'การขาย',
      value: formatNumber(stats.totalSales),
      icon: DollarSign,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      title: 'คำสั่งซื้อ',
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: '+3%',
      changeType: 'positive',
    },
    {
      title: 'สินค้าสต็อกต่ำ',
      value: formatNumber(stats.lowStockItems),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-2%',
      changeType: 'negative',
    },
    {
      title: 'คลังสินค้า',
      value: formatNumber(stats.totalInventory),
      icon: Warehouse,
      color: 'bg-indigo-500',
      change: '+15%',
      changeType: 'positive',
    },
    {
      title: 'ซัพพลายเออร์',
      value: formatNumber(stats.totalSuppliers),
      icon: Truck,
      color: 'bg-yellow-500',
      change: '+1%',
      changeType: 'positive',
    },
    {
      title: 'ลูกค้า',
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      color: 'bg-pink-500',
      change: '+7%',
      changeType: 'positive',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="mt-1 text-sm text-gray-500">
          ภาพรวมของระบบจัดการคลังสินค้า
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <div className="flex items-center">
                    <TrendingUp
                      className={`h-4 w-4 ${
                        stat.changeType === 'positive'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    />
                    <span
                      className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      จากเดือนที่แล้ว
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            การดำเนินการด่วน
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/products')}>
              <Package className="mr-2 h-4 w-4" />
              เพิ่มสินค้า
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700" onClick={() => navigate('/orders')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              สร้างคำสั่งซื้อ
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/sales')}>
              <DollarSign className="mr-2 h-4 w-4" />
              บันทึกการขาย
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700" onClick={() => navigate('/inventory')}>
              <Warehouse className="mr-2 h-4 w-4" />
              จัดการคลังสินค้า
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            กิจกรรมล่าสุด
          </h3>
          <div className="space-y-4">
            {recentActivity.length === 0 && <div className="text-gray-500">ไม่มีกิจกรรมล่าสุด</div>}
            {recentActivity.map((item, idx) => (
              <div key={item.type + '-' + item.id + '-' + idx} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.type === 'inventory' ? 'bg-green-100' : item.type === 'order' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                    {item.type === 'inventory' ? <Warehouse className="h-4 w-4 text-green-600" /> : item.type === 'order' ? <ShoppingCart className="h-4 w-4 text-blue-600" /> : <DollarSign className="h-4 w-4 text-purple-600" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.text}</p>
                  <p className="text-sm text-gray-500">{formatTimeAgo(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

function formatTimeAgo(date) {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff} วินาทีที่แล้ว`;
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return d.toLocaleString('th-TH');
} 