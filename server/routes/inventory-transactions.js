const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateInteger, validateRequired } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/inventory-transactions - ดึงข้อมูลธุรกรรมคลังสินค้าทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type = '', inventoryId = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (type) {
      where.type = type;
    }
    if (inventoryId) {
      where.inventoryId = parseInt(inventoryId);
    }

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          inventory: {
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryTransaction.count({ where })
    ]);

    res.json({
      transactions,
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

// GET /api/inventory-transactions/report/summary - รายงานสรุปธุรกรรม
router.get('/report/summary', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [totalTransactions, transactionsByType] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
        _sum: { quantity: true }
      })
    ]);

    res.json({
      totalTransactions,
      transactionsByType,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory-transactions/inventory/:inventoryId - ดึงธุรกรรมของคลังสินค้า
router.get('/inventory/:inventoryId', async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where: { inventoryId: parseInt(inventoryId) },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryTransaction.count({
        where: { inventoryId: parseInt(inventoryId) }
      })
    ]);

    res.json({
      transactions,
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

// POST /api/inventory-transactions - สร้างธุรกรรมใหม่
router.post('/', async (req, res, next) => {
  try {
    const { inventoryId, type, quantity, description } = req.body;

    // Validation
    const validatedInventoryId = validateInteger(inventoryId, 'รหัสคลังสินค้า');
    const validatedType = validateRequired(type, 'ประเภทธุรกรรม');
    const validatedQuantity = validateInteger(quantity, 'จำนวน');

    // ตรวจสอบว่าคลังสินค้ามีอยู่จริงหรือไม่
    const inventory = await prisma.inventory.findUnique({
      where: { id: validatedInventoryId }
    });

    if (!inventory) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลคลังสินค้านี้' });
    }

    // คำนวณจำนวนใหม่
    let newQuantity = inventory.quantity;
    if (type === 'RECEIVE' || type === 'ADJUST') {
      newQuantity += validatedQuantity;
    } else if (type === 'SELL') {
      newQuantity -= validatedQuantity;
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'จำนวนสินค้าไม่เพียงพอ' });
      }
    }

    // สร้างธุรกรรมและอัปเดตคลังสินค้า
    const [transaction] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          inventoryId: validatedInventoryId,
          type: validatedType,
          quantity: validatedQuantity,
          description
        }
      }),
      prisma.inventory.update({
        where: { id: validatedInventoryId },
        data: { quantity: newQuantity }
      })
    ]);

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
});

// GET /api/inventory-transactions/:id - ดึงข้อมูลธุรกรรมตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventory: {
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

    if (!transaction) {
      return res.status(404).json({ error: 'ไม่พบธุรกรรมนี้' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

module.exports = router; 