const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

// Import routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const customerRoutes = require('./routes/customers');
const warehouseLocationRoutes = require('./routes/warehouse-locations');
const inventoryRoutes = require('./routes/inventory');
const inventoryTransactionRoutes = require('./routes/inventory-transactions');
const orderRoutes = require('./routes/orders');
const saleRoutes = require('./routes/sales');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/warehouse-locations', warehouseLocationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory-transactions', inventoryTransactionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sales', saleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Warehouse Management System API is running'
  });
});

// Error handler middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'ไม่พบ API endpoint นี้',
    path: req.originalUrl 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Warehouse Management System API running on port ${PORT}`);
    console.log(`📊 Available endpoints:`);
    console.log(`   - GET    /api/health`);
    console.log(`   - GET    /api/products`);
    console.log(`   - GET    /api/users`);
    console.log(`   - GET    /api/categories`);
    console.log(`   - GET    /api/suppliers`);
    console.log(`   - GET    /api/customers`);
    console.log(`   - GET    /api/warehouse-locations`);
    console.log(`   - GET    /api/inventory`);
    console.log(`   - GET    /api/inventory-transactions`);
    console.log(`   - GET    /api/orders`);
    console.log(`   - GET    /api/sales`);
});