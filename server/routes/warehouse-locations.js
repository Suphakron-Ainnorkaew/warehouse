const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired } = require('../utils/validation');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/warehouse-locations - ดึงข้อมูลตำแหน่งในคลังทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.warehouseLocation.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: { inventories: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.warehouseLocation.count({ where })
    ]);

    res.json({
      warehouseLocations: locations,
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

// GET /api/warehouse-locations/:id - ดึงข้อมูลตำแหน่งในคลังตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await prisma.warehouseLocation.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventories: {
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
        },
        _count: {
          select: { inventories: true }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'ไม่พบตำแหน่งในคลังนี้' });
    }

    res.json(location);
  } catch (error) {
    next(error);
  }
});

// POST /api/warehouse-locations - สร้างตำแหน่งในคลังใหม่
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validation
    const validatedName = validateRequired(name, 'ชื่อตำแหน่ง');

    const location = await prisma.warehouseLocation.create({
      data: {
        name: validatedName,
        description
      }
    });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
});

// PUT /api/warehouse-locations/:id - อัปเดตข้อมูลตำแหน่งในคลัง
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validation
    if (name) {
      validateRequired(name, 'ชื่อตำแหน่ง');
    }

    const location = await prisma.warehouseLocation.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description
      }
    });

    res.json(location);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/warehouse-locations/:id - ลบตำแหน่งในคลัง
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // ตรวจสอบว่ามีสินค้าในตำแหน่งนี้หรือไม่
    const inventoriesCount = await prisma.inventory.count({
      where: { locationId: parseInt(id) }
    });

    if (inventoriesCount > 0) {
      return res.status(400).json({ 
        error: `ไม่สามารถลบตำแหน่งในคลังได้ เนื่องจากมีสินค้า ${inventoriesCount} รายการในตำแหน่งนี้` 
      });
    }

    await prisma.warehouseLocation.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบตำแหน่งในคลังสำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 