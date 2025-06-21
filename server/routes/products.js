// server/routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to test database connection
const testDbConnection = async () => {
    try {
        await db.query('SELECT 1');
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error.message, error.stack);
        throw error;
    }
};

// Get all products
router.get('/', async (req, res) => {
    try {
        await testDbConnection();
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error.message, error.stack);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า', details: error.message });
    }
});

// Add product
router.post('/add', async (req, res) => {
    const { name, quantity, price } = req.body;
    try {
        await testDbConnection();
        if (!name || !quantity || !price) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const [result] = await db.query(
            'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)',
            [name, parseInt(quantity), parseFloat(price)]
        );
        await db.query(
            'INSERT INTO transactions (product_id, type, quantity) VALUES (?, ?, ?)',
            [result.insertId, 'IN', parseInt(quantity)]
        );
        res.json({ message: 'เพิ่มสินค้าสำเร็จ' });
    } catch (error) {
        console.error('Error adding product:', error.message, error.stack);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', details: error.message });
    }
});

// Remove product
router.post('/remove', async (req, res) => {
    const { id, quantity } = req.body;
    try {
        await testDbConnection();
        if (!id || !quantity) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        const [product] = await db.query('SELECT quantity FROM products WHERE id = ?', [id]);
        if (!product.length || product[0].quantity < parseInt(quantity)) {
            return res.status(400).json({ error: 'จำนวนสินค้าไม่เพียงพอ' });
        }
        await db.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ?',
            [parseInt(quantity), id]
        );
        await db.query(
            'INSERT INTO transactions (product_id, type, quantity) VALUES (?, ?, ?)',
            [id, 'OUT', parseInt(quantity)]
        );
        res.json({ message: 'ลบสินค้าสำเร็จ' });
    } catch (error) {
        console.error('Error removing product:', error.message, error.stack);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้า', details: error.message });
    }
});

// Get dashboard data
router.get('/dashboard', async (req, res) => {
    try {
        await testDbConnection();
        const [totalQuantity] = await db.query('SELECT COALESCE(SUM(quantity), 0) as total FROM products');
        const [totalValue] = await db.query('SELECT COALESCE(SUM(quantity * price), 0) as total FROM products');
        const [monthlyData] = await db.query(`
            SELECT 
                DATE_FORMAT(COALESCE(t.created_at, NOW()), '%Y-%m') as month,
                p.id as product_id,
                p.name as product_name,
                COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.quantity ELSE -t.quantity END), 0) as net_quantity,
                COALESCE(SUM(CASE WHEN t.type = 'IN' THEN t.quantity ELSE 0 END), 0) as stock_in,
                COALESCE(SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END), 0) as stock_out
            FROM transactions t
            LEFT JOIN products p ON t.product_id = p.id
            GROUP BY month, p.id, p.name
            ORDER BY month DESC, p.id
            LIMIT 120
        `);
        const responseData = {
            totalQuantity: parseInt(totalQuantity[0].total) || 0,
            totalValue: parseFloat(totalValue[0].total) || 0,
            monthlyData: monthlyData.reverse() // Reverse to show oldest to newest
        };
        console.log('Dashboard data:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error.message, error.stack);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด', details: error.message });
    }
});

module.exports = router;