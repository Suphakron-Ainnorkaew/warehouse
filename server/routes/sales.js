const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateInteger, validateNumber } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/sales - ดึงข้อมูลการขายทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', customerId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { saleNumber: { contains: search } }
      ];
    }
    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true
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
          saleItems: {
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
            select: { saleItems: true }
          }
        },
        orderBy: { saleDate: 'desc' }
      }),
      prisma.sale.count({ where })
    ]);

    res.json({
      sales,
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

// GET /api/sales/:id - ดึงข้อมูลการขายตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        saleItems: {
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

    if (!sale) {
      return res.status(404).json({ error: 'ไม่พบการขายนี้' });
    }

    res.json(sale);
  } catch (error) {
    next(error);
  }
});

// POST /api/sales - สร้างการขายใหม่
router.post('/', async (req, res, next) => {
  try {
    const { customerId, userId, saleItems } = req.body;

    // Validation
    const validatedUserId = validateInteger(userId, 'รหัสผู้ใช้');
    
    if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
      return res.status(400).json({ error: 'ต้องมีรายการสินค้าอย่างน้อย 1 รายการ' });
    }

    // ตรวจสอบว่าลูกค้าและผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({ where: { id: validatedUserId } });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!customer) {
        return res.status(404).json({ error: 'ไม่พบลูกค้านี้' });
      }
    }

    // สร้างรหัสการขาย
    const saleNumber = `SO${Date.now()}`;

    // คำนวณยอดรวมและตรวจสอบสต็อก
    let totalAmount = 0;
    for (const item of saleItems) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) },
        include: { inventory: true }
      });
      
      if (!product) {
        return res.status(404).json({ error: `ไม่พบสินค้ารหัส ${item.productId}` });
      }
      
      if (!product.inventory) {
        return res.status(400).json({ error: `สินค้า ${product.name} ไม่มีข้อมูลคลังสินค้า` });
      }
      
      if (product.inventory.quantity < parseInt(item.quantity)) {
        return res.status(400).json({ 
          error: `สินค้า ${product.name} มีสต็อกไม่เพียงพอ (มี ${product.inventory.quantity} แต่ต้องการ ${item.quantity})` 
        });
      }
      
      totalAmount += parseFloat(item.unitPrice) * parseInt(item.quantity);
    }

    // สร้างการขายและรายการสินค้า พร้อมอัปเดตสต็อก
    const sale = await prisma.$transaction(async (tx) => {
      // สร้างการขาย
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: customerId ? parseInt(customerId) : null,
          userId: validatedUserId,
          totalAmount,
          saleItems: {
            create: saleItems.map(item => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice)
            }))
          }
        }
      });

      // อัปเดตสต็อกและสร้างธุรกรรม
      for (const item of saleItems) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: parseInt(item.productId) }
        });

        const newQuantity = inventory.quantity - parseInt(item.quantity);
        
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: newQuantity }
        });

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'SELL',
            quantity: parseInt(item.quantity),
            description: `ขายผ่านการขาย ${saleNumber}`
          }
        });
      }

      return newSale;
    });

    // ดึงข้อมูลการขายที่สมบูรณ์
    const completeSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        saleItems: {
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

    res.status(201).json(completeSale);
  } catch (error) {
    next(error);
  }
});

// PUT /api/sales/:id - อัปเดตข้อมูลการขาย
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, userId, saleItems, saleDate } = req.body;

    // Validation
    const validatedUserId = validateInteger(userId, 'รหัสผู้ใช้');
    if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
      return res.status(400).json({ error: 'ต้องมีรายการสินค้าอย่างน้อย 1 รายการ' });
    }

    // ตรวจสอบว่าการขายนี้มีอยู่จริง
    const existingSale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: { saleItems: true }
    });
    if (!existingSale) {
      return res.status(404).json({ error: 'ไม่พบการขายนี้' });
    }

    // ตรวจสอบว่าลูกค้าและผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({ where: { id: validatedUserId } });
    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: parseInt(customerId) } });
      if (!customer) {
        return res.status(404).json({ error: 'ไม่พบลูกค้านี้' });
      }
    }

    // คืน stock เดิม
    for (const item of existingSale.saleItems) {
      const inventory = await prisma.inventory.findUnique({ where: { productId: item.productId } });
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity + item.quantity }
        });
      }
    }

    // ตรวจสอบ stock ใหม่
    let totalAmount = 0;
    for (const item of saleItems) {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(item.productId) },
        include: { inventory: true }
      });
      if (!product) {
        return res.status(404).json({ error: `ไม่พบสินค้ารหัส ${item.productId}` });
      }
      if (!product.inventory) {
        return res.status(400).json({ error: `สินค้า ${product.name} ไม่มีข้อมูลคลังสินค้า` });
      }
      if (product.inventory.quantity < parseInt(item.quantity)) {
        return res.status(400).json({
          error: `สินค้า ${product.name} มีสต็อกไม่เพียงพอ (มี ${product.inventory.quantity} แต่ต้องการ ${item.quantity})`
        });
      }
      totalAmount += parseFloat(item.unitPrice) * parseInt(item.quantity);
    }

    // อัปเดตข้อมูลการขายและ saleItems, อัปเดต stock ใหม่
    const updatedSale = await prisma.$transaction(async (tx) => {
      // ลบ saleItems เดิม
      await tx.saleItem.deleteMany({ where: { saleId: parseInt(id) } });
      // อัปเดตข้อมูลการขาย
      const sale = await tx.sale.update({
        where: { id: parseInt(id) },
        data: {
          customerId: customerId ? parseInt(customerId) : null,
          userId: validatedUserId,
          saleDate: saleDate ? new Date(saleDate) : undefined,
          totalAmount,
        }
      });
      // เพิ่ม saleItems ใหม่
      for (const item of saleItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice)
          }
        });
        // อัปเดต stock
        const inventory = await tx.inventory.findUnique({ where: { productId: parseInt(item.productId) } });
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity - parseInt(item.quantity) }
        });
        // เพิ่ม inventory transaction
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'SELL',
            quantity: parseInt(item.quantity),
            description: `อัปเดตการขาย ${sale.saleNumber}`
          }
        });
      }
      return sale;
    });

    // ดึงข้อมูลการขายที่อัปเดตแล้ว
    const completeSale = await prisma.sale.findUnique({
      where: { id: updatedSale.id },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        saleItems: {
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
    res.json(completeSale);
  } catch (error) {
    next(error);
  }
});

// GET /api/sales/report/summary - รายงานสรุปการขาย
router.get('/report/summary', async (req, res, next) => {
  try {
    const { startDate, endDate, customerId = '' } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.saleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    if (customerId) {
      where.customerId = parseInt(customerId);
    }

    const [totalSales, totalAmount, salesByCustomer] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.aggregate({
        where,
        _sum: { totalAmount: true }
      }),
      prisma.sale.groupBy({
        by: ['customerId'],
        where,
        _count: { customerId: true },
        _sum: { totalAmount: true }
      })
    ]);

    res.json({
      totalSales,
      totalAmount: totalAmount._sum.totalAmount || 0,
      salesByCustomer,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sales/:id - ลบการขาย
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // ดึง sale และ saleItems
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: { saleItems: true }
    });
    if (!sale) {
      return res.status(404).json({ error: 'ไม่พบการขายนี้' });
    }
    // คืน stock
    for (const item of sale.saleItems) {
      const inventory = await prisma.inventory.findUnique({ where: { productId: item.productId } });
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: { quantity: inventory.quantity + item.quantity }
        });
      }
    }
    // ลบ saleItems
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    // ลบ sale
    await prisma.sale.delete({ where: { id: sale.id } });
    res.json({ message: 'ลบการขายสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 