import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { BarChart3, ShoppingCart, DollarSign, FileText } from 'lucide-react';

const Reports = () => {
  const [orderSummary, setOrderSummary] = useState(null);
  const [saleSummary, setSaleSummary] = useState(null);
  const [transactionSummary, setTransactionSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [orderRes, saleRes, transactionRes] = await Promise.all([
        apiService.getOrderSummary({}),
        apiService.getSaleSummary({}),
        apiService.getTransactionSummary({}),
      ]);
      setOrderSummary(orderRes.data);
      setSaleSummary(saleRes.data);
      setTransactionSummary(transactionRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">รายงานสรุป</h1>
        <p className="mt-1 text-sm text-gray-500">ดูข้อมูลสรุปภาพรวมของระบบ</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-orange-500 rounded-md p-3">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">จำนวนคำสั่งซื้อ</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(orderSummary?.totalOrders || 0)}</dd>
                </dl>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-500 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">จำนวนการขาย</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(saleSummary?.totalSales || 0)}</dd>
                </dl>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-5 flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-500 rounded-md p-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">จำนวนธุรกรรมคลัง</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(transactionSummary?.totalTransactions || 0)}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Orders Report Table */}
          <div className="bg-white shadow rounded-lg mt-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" /> รายงานคำสั่งซื้อ
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม (฿)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderSummary?.ordersByStatus?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatNumber(item._count.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item._sum.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sales Report Table */}
          <div className="bg-white shadow rounded-lg mt-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" /> รายงานการขาย
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม (฿)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">{formatNumber(saleSummary?.totalSales || 0)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(saleSummary?.totalAmount || 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inventory Transactions Report Table */}
          <div className="bg-white shadow rounded-lg mt-8 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" /> รายงานธุรกรรมคลัง
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รวม (ชิ้น)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionSummary?.transactionsByType?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatNumber(item._count.type)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatNumber(item._sum.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports; 