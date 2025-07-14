const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateInteger, validateNumber } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/inventory - ดึงข้อมูลคลังสินค้าทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', lowStock = false, warehouseLocationId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.product = {
        OR: [
          { sku: { contains: search } },
          { name: { contains: search } }
        ]
      };
    }
    if (warehouseLocationId) {
      where.locationId = parseInt(warehouseLocationId);
    }
    if (lowStock === 'true') {
      where.quantity = {
        lte: where.minStockLevel || 0
      };
    }

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              unitPrice: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          location: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventory.count({ where })
    ]);

    res.json({
      inventory: inventories,
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

// GET /api/inventory/:id - ดึงข้อมูลคลังสินค้าตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id: parseInt(id) },
      include: {
        product: {
          include: {
            category: true
          }
        },
        location: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลคลังสินค้านี้' });
    }

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory - สร้างข้อมูลคลังสินค้าใหม่
router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity, locationId, minStockLevel, maxStockLevel } = req.body;

    // Validation
    const validatedProductId = validateInteger(productId, 'รหัสสินค้า');
    const validatedQuantity = validateInteger(quantity, 'จำนวนสินค้า');
    const validatedMinStockLevel = validateInteger(minStockLevel || 0, 'ระดับสต็อกขั้นต่ำ');
    
    if (maxStockLevel) {
      validateInteger(maxStockLevel, 'ระดับสต็อกสูงสุด');
    }

    // ตรวจสอบว่าสินค้านี้มีข้อมูลคลังสินค้าแล้วหรือไม่
    const existingInventory = await prisma.inventory.findUnique({
      where: { productId: validatedProductId }
    });

    if (existingInventory) {
      return res.status(400).json({ error: 'สินค้านี้มีข้อมูลคลังสินค้าแล้ว' });
    }

    const inventory = await prisma.inventory.create({
      data: {
        productId: validatedProductId,
        quantity: validatedQuantity,
        locationId: locationId ? parseInt(locationId) : null,
        minStockLevel: validatedMinStockLevel,
        maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitPrice: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
});

// PUT /api/inventory/:id - อัปเดตข้อมูลคลังสินค้า
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, locationId, minStockLevel, maxStockLevel } = req.body;

    // Validation
    if (quantity !== undefined) {
      validateInteger(quantity, 'จำนวนสินค้า');
    }
    if (minStockLevel !== undefined) {
      validateInteger(minStockLevel, 'ระดับสต็อกขั้นต่ำ');
    }
    if (maxStockLevel !== undefined) {
      validateInteger(maxStockLevel, 'ระดับสต็อกสูงสุด');
    }

    const inventory = await prisma.inventory.update({
      where: { id: parseInt(id) },
      data: {
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        locationId: locationId ? parseInt(locationId) : null,
        minStockLevel: minStockLevel !== undefined ? parseInt(minStockLevel) : undefined,
        maxStockLevel: maxStockLevel ? parseInt(maxStockLevel) : null
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitPrice: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory/low-stock - ดึงข้อมูลสินค้าที่มีสต็อกต่ำ
router.get('/low-stock/items', async (req, res, next) => {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: {
          lte: prisma.inventory.fields.minStockLevel
        }
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unitPrice: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { quantity: 'asc' }
    });

    res.json({ lowStockItems });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/inventory/:id - ลบข้อมูลคลังสินค้า
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.inventory.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบข้อมูลคลังสินค้าสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 