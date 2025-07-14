const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 เริ่มต้นใส่ข้อมูลตัวอย่าง...');

  // สร้างผู้ใช้
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123', // ในระบบจริงควรเข้ารหัส
      email: 'admin@warehouse.com',
      firstName: 'ผู้ดูแล',
      lastName: 'ระบบ',
      role: 'ADMIN'
    }
  });

  const staffUser = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: 'staff123',
      email: 'staff@warehouse.com',
      firstName: 'พนักงาน',
      lastName: 'คลังสินค้า',
      role: 'STAFF'
    }
  });

  console.log('✅ สร้างผู้ใช้สำเร็จ');

  // สร้างหมวดหมู่
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'อิเล็กทรอนิกส์' },
      update: {},
      create: {
        name: 'อิเล็กทรอนิกส์',
        description: 'สินค้าอิเล็กทรอนิกส์และอุปกรณ์'
      }
    }),
    prisma.category.upsert({
      where: { name: 'เสื้อผ้า' },
      update: {},
      create: {
        name: 'เสื้อผ้า',
        description: 'เสื้อผ้าและเครื่องแต่งกาย'
      }
    }),
    prisma.category.upsert({
      where: { name: 'อาหาร' },
      update: {},
      create: {
        name: 'อาหาร',
        description: 'อาหารและเครื่องดื่ม'
      }
    })
  ]);

  console.log('✅ สร้างหมวดหมู่สำเร็จ');

  // สร้างซัพพลายเออร์
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { name: 'บริษัท อิเล็กทรอนิกส์ จำกัด' },
      update: {},
      create: {
        name: 'บริษัท อิเล็กทรอนิกส์ จำกัด',
        contactName: 'คุณสมชาย',
        email: 'contact@electronics.co.th',
        phone: '02-123-4567',
        address: '123 ถนนสุขุมวิท กรุงเทพฯ'
      }
    }),
    prisma.supplier.upsert({
      where: { name: 'โรงงานเสื้อผ้าไทย' },
      update: {},
      create: {
        name: 'โรงงานเสื้อผ้าไทย',
        contactName: 'คุณสมหญิง',
        email: 'info@thai-clothing.com',
        phone: '02-987-6543',
        address: '456 ถนนรัชดาภิเษก กรุงเทพฯ'
      }
    })
  ]);

  console.log('✅ สร้างซัพพลายเออร์สำเร็จ');

  // สร้างลูกค้า
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'customer1@example.com' },
      update: {},
      create: {
        firstName: 'ลูกค้า',
        lastName: 'คนที่ 1',
        email: 'customer1@example.com',
        phone: '081-123-4567',
        address: '789 ถนนลาดพร้าว กรุงเทพฯ'
      }
    }),
    prisma.customer.upsert({
      where: { email: 'customer2@example.com' },
      update: {},
      create: {
        firstName: 'ลูกค้า',
        lastName: 'คนที่ 2',
        email: 'customer2@example.com',
        phone: '082-987-6543',
        address: '321 ถนนวิภาวดี กรุงเทพฯ'
      }
    })
  ]);

  console.log('✅ สร้างลูกค้าสำเร็จ');

  // สร้างตำแหน่งในคลัง
  const locations = await Promise.all([
    prisma.warehouseLocation.upsert({
      where: { name: 'Zone A' },
      update: {},
      create: {
        name: 'Zone A',
        description: 'พื้นที่เก็บสินค้าอิเล็กทรอนิกส์'
      }
    }),
    prisma.warehouseLocation.upsert({
      where: { name: 'Zone B' },
      update: {},
      create: {
        name: 'Zone B',
        description: 'พื้นที่เก็บเสื้อผ้า'
      }
    }),
    prisma.warehouseLocation.upsert({
      where: { name: 'Zone C' },
      update: {},
      create: {
        name: 'Zone C',
        description: 'พื้นที่เก็บอาหาร'
      }
    })
  ]);

  console.log('✅ สร้างตำแหน่งในคลังสำเร็จ');

  // สร้างสินค้า
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'ELEC-001' },
      update: {},
      create: {
        sku: 'ELEC-001',
        name: 'สมาร์ทโฟน Samsung Galaxy',
        description: 'สมาร์ทโฟนรุ่นใหม่จาก Samsung',
        unitPrice: 15000.00,
        weight: 0.2,
        dimensions: '15x7x0.8 cm',
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { sku: 'ELEC-002' },
      update: {},
      create: {
        sku: 'ELEC-002',
        name: 'แล็ปท็อป Dell Inspiron',
        description: 'แล็ปท็อปสำหรับงานทั่วไป',
        unitPrice: 25000.00,
        weight: 2.5,
        dimensions: '35x25x2 cm',
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { sku: 'CLOTH-001' },
      update: {},
      create: {
        sku: 'CLOTH-001',
        name: 'เสื้อยืดคอกลม',
        description: 'เสื้อยืดคอกลม ผ้าฝ้าย 100%',
        unitPrice: 250.00,
        weight: 0.15,
        dimensions: '25x20x2 cm',
        categoryId: categories[1].id
      }
    }),
    prisma.product.upsert({
      where: { sku: 'FOOD-001' },
      update: {},
      create: {
        sku: 'FOOD-001',
        name: 'น้ำดื่มบรรจุขวด',
        description: 'น้ำดื่มบรรจุขวด 500ml',
        unitPrice: 10.00,
        weight: 0.5,
        dimensions: '8x8x20 cm',
        categoryId: categories[2].id
      }
    })
  ]);

  console.log('✅ สร้างสินค้าสำเร็จ');

  // สร้างข้อมูลคลังสินค้า
  const inventories = await Promise.all([
    prisma.inventory.upsert({
      where: { productId: products[0].id },
      update: {},
      create: {
        productId: products[0].id,
        quantity: 50,
        locationId: locations[0].id,
        minStockLevel: 10,
        maxStockLevel: 100
      }
    }),
    prisma.inventory.upsert({
      where: { productId: products[1].id },
      update: {},
      create: {
        productId: products[1].id,
        quantity: 20,
        locationId: locations[0].id,
        minStockLevel: 5,
        maxStockLevel: 50
      }
    }),
    prisma.inventory.upsert({
      where: { productId: products[2].id },
      update: {},
      create: {
        productId: products[2].id,
        quantity: 200,
        locationId: locations[1].id,
        minStockLevel: 50,
        maxStockLevel: 500
      }
    }),
    prisma.inventory.upsert({
      where: { productId: products[3].id },
      update: {},
      create: {
        productId: products[3].id,
        quantity: 1000,
        locationId: locations[2].id,
        minStockLevel: 200,
        maxStockLevel: 2000
      }
    })
  ]);

  console.log('✅ สร้างข้อมูลคลังสินค้าสำเร็จ');

  // สร้างธุรกรรมคลังสินค้าเริ่มต้น
  await Promise.all([
    prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventories[0].id,
        type: 'RECEIVE',
        quantity: 50,
        description: 'รับสินค้าเริ่มต้น'
      }
    }),
    prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventories[1].id,
        type: 'RECEIVE',
        quantity: 20,
        description: 'รับสินค้าเริ่มต้น'
      }
    }),
    prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventories[2].id,
        type: 'RECEIVE',
        quantity: 200,
        description: 'รับสินค้าเริ่มต้น'
      }
    }),
    prisma.inventoryTransaction.create({
      data: {
        inventoryId: inventories[3].id,
        type: 'RECEIVE',
        quantity: 1000,
        description: 'รับสินค้าเริ่มต้น'
      }
    })
  ]);

  console.log('✅ สร้างธุรกรรมคลังสินค้าสำเร็จ');

  console.log('🎉 ใส่ข้อมูลตัวอย่างเสร็จสิ้น!');
  console.log('');
  console.log('📊 สรุปข้อมูลที่ใส่:');
  console.log(`   - ผู้ใช้: ${adminUser.username}, ${staffUser.username}`);
  console.log(`   - หมวดหมู่: ${categories.length} รายการ`);
  console.log(`   - ซัพพลายเออร์: ${suppliers.length} รายการ`);
  console.log(`   - ลูกค้า: ${customers.length} รายการ`);
  console.log(`   - ตำแหน่งในคลัง: ${locations.length} รายการ`);
  console.log(`   - สินค้า: ${products.length} รายการ`);
  console.log(`   - ข้อมูลคลังสินค้า: ${inventories.length} รายการ`);
  console.log('');
  console.log('🚀 สามารถเริ่มต้น API ได้ด้วยคำสั่ง: npm start');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการใส่ข้อมูล:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 