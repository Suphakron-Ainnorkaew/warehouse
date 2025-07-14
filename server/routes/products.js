// server/routes/products.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired, validateNumber, validateInteger } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/products - ดึงข้อมูลสินค้าทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { sku: { contains: search } },
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          inventory: {
            select: {
              id: true,
              quantity: true,
              minStockLevel: true,
              maxStockLevel: true,
              location: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: { 
              orderItems: true,
              saleItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
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

// GET /api/products/:id - ดึงข้อมูลสินค้าตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        inventory: {
          include: {
            location: true,
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                orderDate: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        saleItems: {
          include: {
            sale: {
              select: {
                id: true,
                saleNumber: true,
                saleDate: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้านี้' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - สร้างสินค้าใหม่
router.post('/', async (req, res, next) => {
  try {
    const { sku, name, description, unitPrice, weight, dimensions, categoryId } = req.body;

    // Validation
    const validatedSku = validateRequired(sku, 'รหัสสินค้า');
    const validatedName = validateRequired(name, 'ชื่อสินค้า');
    const validatedUnitPrice = validateNumber(unitPrice, 'ราคาต่อหน่วย');
    const validatedCategoryId = validateInteger(categoryId, 'หมวดหมู่');

    // ตรวจสอบว่าหมวดหมู่มีอยู่จริง
    const category = await prisma.category.findUnique({
      where: { id: validatedCategoryId }
    });

    if (!category) {
      return res.status(404).json({ error: 'ไม่พบหมวดหมู่นี้' });
    }

    const product = await prisma.product.create({
      data: {
        sku: validatedSku,
        name: validatedName,
        description,
        unitPrice: validatedUnitPrice,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        categoryId: validatedCategoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - อัปเดตข้อมูลสินค้า
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sku, name, description, unitPrice, weight, dimensions, categoryId } = req.body;

    // Validation
    if (sku) {
      validateRequired(sku, 'รหัสสินค้า');
    }
    if (name) {
      validateRequired(name, 'ชื่อสินค้า');
    }
    if (unitPrice) {
      validateNumber(unitPrice, 'ราคาต่อหน่วย');
    }
    if (categoryId) {
      validateInteger(categoryId, 'หมวดหมู่');
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        sku,
        name,
        description,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        weight: weight ? parseFloat(weight) : null,
        dimensions,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/dashboard - ข้อมูลแดชบอร์ดสินค้า
router.get('/dashboard/summary', async (req, res, next) => {
  try {
    const [totalProducts, lowStockProducts, totalValue, productsByCategory] = await Promise.all([
      prisma.product.count(),
      prisma.inventory.count({
        where: {
          quantity: {
            lte: prisma.inventory.fields.minStockLevel
          }
        }
      }),
      prisma.inventory.aggregate({
        _sum: {
          quantity: true
        }
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: { id: true }
      })
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      totalStockQuantity: totalValue._sum.quantity || 0,
      productsByCategory
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - ลบสินค้า
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่ามีการใช้งานสินค้านี้หรือไม่
    const [orderItemsCount, saleItemsCount] = await Promise.all([
      prisma.orderItem.count({ where: { productId: parseInt(id) } }),
      prisma.saleItem.count({ where: { productId: parseInt(id) } })
    ]);

    if (orderItemsCount > 0 || saleItemsCount > 0) {
      return res.status(400).json({ 
        error: `ไม่สามารถลบสินค้าได้ เนื่องจากมีการใช้งานในคำสั่งซื้อ ${orderItemsCount} รายการ และการขาย ${saleItemsCount} รายการ` 
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;