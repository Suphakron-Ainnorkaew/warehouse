import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const [products, setProducts] = useState([]);
    const [addFormData, setAddFormData] = useState({
        name: '',
        quantity: '',
        price: ''
    });
    const [removeFormData, setRemoveFormData] = useState({ id: '', quantity: '' });
    const [addMessage, setAddMessage] = useState('');
    const [removeMessage, setRemoveMessage] = useState('');
    const [dashboardData, setDashboardData] = useState({
        totalQuantity: 0,
        totalValue: 0,
        monthlyData: []
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchDashboardData();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to fetch products');
            }
            const data = await response.json();
            const formattedData = data.map(product => ({
                ...product,
                price: parseFloat(product.price) || 0
            }));
            setProducts(formattedData);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching products:', error.message);
            setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า: ' + error.message);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/products/dashboard');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to fetch dashboard data');
            }
            const data = await response.json();
            console.log('Fetched dashboard data:', data);
            setDashboardData({
                totalQuantity: parseInt(data.totalQuantity) || 0,
                totalValue: parseFloat(data.totalValue) || 0,
                monthlyData: data.monthlyData || []
            });
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching dashboard data:', error.message);
            setErrorMessage('เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด: ' + error.message);
        }
    };

    const handleAddChange = (e) => {
        setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...addFormData,
                    quantity: parseInt(addFormData.quantity),
                    price: parseFloat(addFormData.price)
                })
            });
            const data = await response.json();
            setAddMessage(data.message || data.error);
            setAddFormData({ name: '', quantity: '', price: '' });
            fetchProducts();
            fetchDashboardData();
        } catch (error) {
            setAddMessage('เกิดข้อผิดพลาดในการเพิ่มสินค้า: ' + error.message);
        }
    };

    const handleRemoveChange = (e) => {
        setRemoveFormData({ ...removeFormData, [e.target.name]: e.target.value });
    };

    const handleRemoveSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/products/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...removeFormData,
                    quantity: parseInt(removeFormData.quantity)
                })
            });
            const data = await response.json();
            if (response.ok) {
                setRemoveMessage(data.message);
                setRemoveFormData({ id: '', quantity: '' });
                fetchProducts();
                fetchDashboardData();
            } else {
                setRemoveMessage(data.error);
            }
        } catch (error) {
            setRemoveMessage('เกิดข้อผิดพลาดในการลบสินค้า: ' + error.message);
        }
    };

    // Colors for different products
    const colors = [
        '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
        '#db2777', '#ea580c', '#4b5563', '#14b8a6', '#8b5cf6'
    ];

    // Prepare unique months
    const months = [...new Set(dashboardData.monthlyData.map(item => item.month))].sort();

    // Prepare chart data for stock movement
    const quantityChartData = {
        labels: months,
        datasets: [
            {
                label: 'Stock In',
                data: months.map(month => {
                    return dashboardData.monthlyData
                        .filter(item => item.month === month)
                        .reduce((sum, item) => sum + (item.stock_in || 0), 0);
                }),
                backgroundColor: '#10b981',
                borderRadius: 4
            },
            {
                label: 'Stock Out',
                data: months.map(month => {
                    return dashboardData.monthlyData
                        .filter(item => item.month === month)
                        .reduce((sum, item) => sum + (item.stock_out || 0), 0);
                }),
                backgroundColor: '#ef4444',
                borderRadius: 4
            }
        ]
    };

    // Prepare chart data for net quantity per product
    const netQuantityChartData = {
        labels: months,
        datasets: [...new Set(dashboardData.monthlyData.map(item => item.product_id))].map((productId, index) => {
            const productName = dashboardData.monthlyData.find(item => item.product_id === productId)?.product_name || `Product ${productId}`;
            return {
                label: productName,
                data: months.map(month => {
                    const item = dashboardData.monthlyData.find(i => i.month === month && i.product_id === productId);
                    return item ? item.net_quantity : 0;
                }),
                backgroundColor: colors[index % colors.length],
                borderRadius: 4
            };
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                ระบบจัดการคลังสินค้า
                            </h1>
                            <p className="text-gray-600 mt-1">จัดการสินค้าและติดตามการเคลื่อนไหวของสต็อก</p>
                        </div>
                        <button
                            onClick={() => {
                                fetchProducts();
                                fetchDashboardData();
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            รีเฟรชข้อมูล
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Message */}
                {errorMessage && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Dashboard Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">จำนวนสินค้าทั้งหมด</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardData.totalQuantity.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-cente
r justify-center">
                                <svg className="w  
                                <svg className="w-6 h-6 text-blue-600 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4V17m0 0l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">มูลค่าสินค้าทั้งหมด</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">฿{(parseFloat(dashboardData.totalValue) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ประเภทสินค้า</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{products.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ราคาเฉลี่ย</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    ฿{products.length > 0 ? (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(2) : '0.00'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Add Product Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                เพิ่มสินค้า
                            </h2>
                        </div>
                        <div className="p-6">
                            {addMessage && (
                                <div className={`mb-4 p-3 rounded-lg ${addMessage.includes('ข้อผิดพลาด') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                    {addMessage}
                                </div>
                            )}
                            <form onSubmit={handleAddSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อสินค้า</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={addFormData.name}
                                        onChange={handleAddChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="กรอกชื่อสินค้า"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">จำนวน</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={addFormData.quantity}
                                            onChange={handleAddChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ราคา (฿)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={addFormData.price}
                                            onChange={handleAddChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                            placeholder="0.00"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                                    เพิ่มสินค้า
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Remove Product Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                                ลดสินค้า
                            </h2>
                        </div>
                        <div className="p-6">
                            {removeMessage && (
                                <div className={`mb-4 p-3 rounded-lg ${removeMessage.includes('ข้อผิดพลาด') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                    {removeMessage}
                                </div>
                            )}
                            <form onSubmit={handleRemoveSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">เลือกสินค้า</label>
                                    <select
                                        name="id"
                                        value={removeFormData.id}
                                        onChange={handleRemoveChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    >
                                        <option value="">เลือกสินค้า</option>
                                        {products.map(product => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} (คงเหลือ: {product.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนที่ต้องการลด</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={removeFormData.quantity}
                                        onChange={handleRemoveChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium">
                                    ลดสินค้า
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            รายการสินค้าคงคลัง
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสินค้า</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวน</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ราคาต่อหน่วย</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">มูลค่ารวม</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm text-gray-900 font-medium">{product.quantity.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm text-gray-900">฿{(parseFloat(product.price) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-medium text-gray-900">฿{((product.quantity * parseFloat(product.price)) || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                product.quantity > 10 ? 'bg-green-100 text-green-800' :
                                                product.quantity > 5 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {product.quantity > 10 ? 'พอเพียง' : product.quantity > 5 ? 'ใกล้หมด' : 'หมด'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            ไม่มีสินค้าในคลัง
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                การเคลื่อนไหวของสต็อกสินค้า
                            </h2>
                        </div>
                        <div className="p-6">
                            {dashboardData.monthlyData.length > 0 ? (
                                <div className="h-80">
                                    <Bar
                                        data={quantityChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { 
                                                    position: 'top',
                                                    labels: {
                                                        usePointStyle: true,
                                                        padding: 20
                                                    }
                                                },
                                                title: { 
                                                    display: false
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    grid: {
                                                        display: false
                                                    }
                                                },
                                                y: { 
                                                    title: { 
                                                        display: true, 
                                                        text: 'จำนวน (หน่วย)',
                                                        font: {
                                                            size: 12
                                                        }
                                                    },
                                                    grid: {
                                                        color: '#f3f4f6'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">ไม่มีข้อมูลสต็อกสำหรับแสดง</p>
                                        <p className="text-gray-400 text-sm mt-1">เริ่มต้นด้วยการเพิ่มสินค้าเข้าสู่ระบบ</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                จำนวนสินค้าคงคลัง
                            </h2>
                        </div>
                        <div className="p-6">
                            {dashboardData.monthlyData.length > 0 ? (
                                <div className="h-80">
                                    <Bar
                                        data={netQuantityChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { 
                                                    position: 'top',
                                                    labels: {
                                                        usePointStyle: true,
                                                        padding: 20
                                                    }
                                                },
                                                title: { 
                                                    display: false
                                                }
                                            },
                                            scales: {
                                                x: { 
                                                    grid: {
                                                        display: false
                                                    }
                                                },
                                                y: { 
                                                    title: { 
                                                        display: true, 
                                                        text: 'จำนวน (หน่วย)',
                                                        font: {
                                                            size: 12
                                                        }
                                                    },
                                                    grid: {
                                                        color: '#f3f4f6'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">ไม่มีข้อมูลจำนวนสินค้าสำหรับแสดง</p>
                                        <p className="text-gray-400 text-sm mt-1">ข้อมูลจะปรากฏเมื่อมีการเคลื่อนไหวสินค้า</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        ระบบจัดการคลังสินค้า - อัปเดตล่าสุด: {new Date().toLocaleString('th-TH')}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;