const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Initialize Prisma client
let prisma;
try {
  prisma = new PrismaClient();
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
}

router.use(requireAdmin);

// GET /api/categories - ดึงข้อมูลหมวดหมู่ทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    if (!prisma) {
      throw new Error('Prisma client not initialized');
    }

    console.log('Fetching categories...');
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    console.log('Query params:', { page, limit, search, skip, where });

    // Test database connection first
    await prisma.$connect();
    console.log('Database connected successfully');

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.count({ where })
    ]);

    console.log('Categories found:', categories.length);
    console.log('Total categories:', total);

    res.json({
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
});

// GET /api/categories/:id - ดึงข้อมูลหมวดหมู่ตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitPrice: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่นี้' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// POST /api/categories - สร้างหมวดหมู่ใหม่
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validation
    const validatedName = validateRequired(name, 'ชื่อหมวดหมู่');

    const category = await prisma.category.create({
      data: {
        name: validatedName,
        description
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories/:id - อัปเดตข้อมูลหมวดหมู่
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validation
    if (name) {
      validateRequired(name, 'ชื่อหมวดหมู่');
    }

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description
      }
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories/:id - ลบหมวดหมู่
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่ามีสินค้าในหมวดหมู่นี้หรือไม่
    const productsCount = await prisma.product.count({
      where: { categoryId: parseInt(id) }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีสินค้า ${productsCount} รายการในหมวดหมู่นี้` 
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 