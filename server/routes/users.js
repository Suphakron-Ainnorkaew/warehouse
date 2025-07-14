const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { validateRequired, validateEmail } = require('../utils/validation');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAdmin);

// GET /api/users - ดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
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

// GET /api/users/:id - ดึงข้อมูลผู้ใช้ตาม ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// POST /api/users - สร้างผู้ใช้ใหม่
router.post('/', async (req, res, next) => {
  try {
    const { username, password, email, firstName, lastName, role = 'STAFF' } = req.body;

    // Validation
    const validatedUsername = validateRequired(username, 'ชื่อผู้ใช้');
    const validatedPassword = validateRequired(password, 'รหัสผ่าน');
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedPassword, 10);

    const user = await prisma.user.create({
      data: {
        username: validatedUsername,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id - อัปเดตข้อมูลผู้ใช้
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, password } = req.body;

    // Validation
    if (username) {
      validateRequired(username, 'ชื่อผู้ใช้');
    }
    
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    const data = { username, email, firstName, lastName, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/users/:id - ลบผู้ใช้
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 