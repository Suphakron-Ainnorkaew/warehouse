const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired, validateNumber, validateInteger } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/orders - ดึงข้อมูลคำสั่งซื้อทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', supplierId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } }
      ];
    }
    if (status) {
      where.status = status;
    }
    if (supplierId) {
      where.supplierId = parseInt(supplierId);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          supplier: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  sku: true,
                  name: true
                }
              }
            }
          },
          _count: {
            select: { orderItems: true }
          }
        },
        orderBy: { orderDate: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
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

// GET /api/orders/:id - ดึงข้อมูลคำสั่งซื้อตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unitPrice: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อนี้' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// POST /api/orders - สร้างคำสั่งซื้อใหม่
router.post('/', async (req, res, next) => {
  try {
    const { supplierId, userId, orderItems, status = 'PENDING' } = req.body;

    // Validation
    const validatedSupplierId = validateInteger(supplierId, 'รหัสซัพพลายเออร์');
    const validatedUserId = validateInteger(userId, 'รหัสผู้ใช้');
    
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: 'ต้องมีรายการสินค้าอย่างน้อย 1 รายการ' });
    }

    // ตรวจสอบว่าซัพพลายเออร์และผู้ใช้มีอยู่จริง
    const [supplier, user] = await Promise.all([
      prisma.supplier.findUnique({ where: { id: validatedSupplierId } }),
      prisma.user.findUnique({ where: { id: validatedUserId } })
    ]);

    if (!supplier) {
      return res.status(404).json({ error: 'ไม่พบซัพพลายเออร์นี้' });
    }
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    // สร้างรหัสคำสั่งซื้อ
    const orderNumber = `PO${Date.now()}`;

    // คำนวณยอดรวม
    let totalAmount = 0;
    for (const item of orderItems) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) }
      });
      if (!product) {
        return res.status(404).json({ error: `ไม่พบสินค้ารหัส ${item.productId}` });
      }
      totalAmount += parseFloat(item.unitPrice) * parseInt(item.quantity);
    }

    // สร้างคำสั่งซื้อและรายการสินค้า
    const order = await prisma.order.create({
      data: {
        orderNumber,
        supplierId: validatedSupplierId,
        userId: validatedUserId,
        status,
        totalAmount,
        orderItems: {
          create: orderItems.map(item => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          }))
        }
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id - อัปเดตสถานะคำสั่งซื้อ
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'สถานะเป็นข้อมูลที่จำเป็น' });
    }

    // ดึง order เดิมก่อน
    const prevOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { orderItems: true }
    });
    if (!prevOrder) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อนี้' });
    }

    // ถ้าเปลี่ยนสถานะเป็น COMPLETED และเดิมไม่ใช่ COMPLETED ให้เพิ่ม stock
    if (status === 'COMPLETED' && prevOrder.status !== 'COMPLETED') {
      for (const item of prevOrder.orderItems) {
        // เพิ่มจำนวนใน inventory
        const inventory = await prisma.inventory.findUnique({ where: { productId: item.productId } });
        if (inventory) {
          await prisma.inventory.update({
            where: { id: inventory.id },
            data: { quantity: inventory.quantity + item.quantity }
          });
        } else {
          // ถ้ายังไม่มี inventory ให้สร้างใหม่
          await prisma.inventory.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              minStockLevel: 0
            }
          });
        }
        // สร้าง inventory transaction
        const inv = await prisma.inventory.findUnique({ where: { productId: item.productId } });
        await prisma.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: 'RECEIVE',
            quantity: item.quantity,
            description: `รับเข้าจากคำสั่งซื้อ #${prevOrder.orderNumber}`
          }
        });
      }
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        supplier: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/report/summary - รายงานสรุปคำสั่งซื้อ
router.get('/report/summary', async (req, res, next) => {
  try {
    const { startDate, endDate, status = '' } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (status) {
      where.status = status;
    }

    const [totalOrders, ordersByStatus, totalAmount] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
        _sum: { totalAmount: true }
      }),
      prisma.order.aggregate({
        where,
        _sum: { totalAmount: true }
      })
    ]);

    res.json({
      totalOrders,
      ordersByStatus,
      totalAmount: totalAmount._sum.totalAmount || 0,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/orders/:id - ลบคำสั่งซื้อ
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.order.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบคำสั่งซื้อสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 