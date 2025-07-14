const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired, validateEmail } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/customers - ดึงข้อมูลลูกค้าทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: { sales: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
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

// GET /api/customers/:id - ดึงข้อมูลลูกค้าตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        sales: {
          select: {
            id: true,
            saleNumber: true,
            saleDate: true,
            totalAmount: true
          },
          orderBy: { saleDate: 'desc' },
          take: 10
        },
        _count: {
          select: { sales: true }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'ไม่พบลูกค้านี้' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers - สร้างลูกค้าใหม่
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    // Validation
    const validatedFirstName = validateRequired(firstName, 'ชื่อ');
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    const customer = await prisma.customer.create({
      data: {
        firstName: validatedFirstName,
        lastName,
        email,
        phone,
        address
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// PUT /api/customers/:id - อัปเดตข้อมูลลูกค้า
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;

    // Validation
    if (firstName) {
      validateRequired(firstName, 'ชื่อ');
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address
      }
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/customers/:id - ลบลูกค้า
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่ามีการขายของลูกค้านี้หรือไม่
    const salesCount = await prisma.sale.count({
      where: { customerId: parseInt(id) }
    });

    if (salesCount > 0) {
      return res.status(400).json({ 
        error: `ไม่สามารถลบลูกค้าได้ เนื่องจากมีการขาย ${salesCount} รายการของลูกค้านี้` 
      });
    }

    await prisma.customer.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบลูกค้าสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 