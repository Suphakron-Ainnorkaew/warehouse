const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createWarehouseLocations() {
  try {
    console.log('เริ่มสร้างข้อมูลตำแหน่งในคลัง...');
    
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const blocks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const locations = [];
    
    for (const row of rows) {
      for (const block of blocks) {
        const name = `${row}-${block}`;
        const description = `แถว ${row} บล็อคที่ ${block}`;
        
        locations.push({
          name,
          description
        });
      }
    }
    
    console.log(`สร้างข้อมูล ${locations.length} ตำแหน่ง`);
    
    // สร้างข้อมูลแบบ batch
    for (const location of locations) {
      await prisma.warehouseLocation.upsert({
        where: { name: location.name },
        update: {},
        create: {
          name: location.name,
          description: location.description
        }
      });
    }
    
    console.log('✅ สร้างข้อมูลตำแหน่งในคลังสำเร็จ!');
    console.log('');
    console.log('📊 สรุปข้อมูลที่สร้าง:');
    console.log(`   - จำนวนตำแหน่ง: ${locations.length} ตำแหน่ง`);
    console.log(`   - แถว: ${rows.join(', ')}`);
    console.log(`   - บล็อค: ${blocks.join(', ')}`);
    console.log('');
    console.log('🎯 ตัวอย่างรหัสตำแหน่ง:');
    console.log('   - A-1, A-2, A-3, ..., A-10');
    console.log('   - B-1, B-2, B-3, ..., B-10');
    console.log('   - ...');
    console.log('   - J-1, J-2, J-3, ..., J-10');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWarehouseLocations(); 