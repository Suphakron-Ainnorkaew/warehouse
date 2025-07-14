const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired, validateEmail } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/suppliers - ดึงข้อมูลซัพพลายเออร์ทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.count({ where })
    ]);

    res.json({
      suppliers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/suppliers/:id - ดึงข้อมูลซัพพลายเออร์ตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            orderDate: true,
            status: true,
            totalAmount: true
          },
          orderBy: { orderDate: 'desc' },
          take: 10
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'ไม่พบซัพพลายเออร์นี้' });
    }

    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

// POST /api/suppliers - สร้างซัพพลายเออร์ใหม่
router.post('/', async (req, res, next) => {
  try {
    const { name, contactName, email, phone, address } = req.body;

    // Validation
    const validatedName = validateRequired(name, 'ชื่อซัพพลายเออร์');
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: validatedName,
        contactName,
        email,
        phone,
        address
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
});

// PUT /api/suppliers/:id - อัปเดตข้อมูลซัพพลายเออร์
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contactName, email, phone, address } = req.body;

    // Validation
    if (name) {
      validateRequired(name, 'ชื่อซัพพลายเออร์');
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        contactName,
        email,
        phone,
        address
      }
    });

    res.json(supplier);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/suppliers/:id - ลบซัพพลายเออร์
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่ามีคำสั่งซื้อของซัพพลายเออร์นี้หรือไม่
    const ordersCount = await prisma.order.count({
      where: { supplierId: parseInt(id) }
    });

    if (ordersCount > 0) {
      return res.status(400).json({ 
        error: `ไม่สามารถลบซัพพลายเออร์ได้ เนื่องจากมีคำสั่งซื้อ ${ordersCount} รายการของซัพพลายเออร์นี้` 
      });
    }

    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบซัพพลายเออร์สำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 