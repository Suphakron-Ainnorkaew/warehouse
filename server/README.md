# Warehouse Management System API

ระบบจัดการคลังสินค้าที่พัฒนาด้วย Node.js, Express และ Prisma

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ .env และกำหนดค่า DATABASE_URL:
```env
DATABASE_URL="mysql://username:password@localhost:3306/warehouse_db"
PORT=5000
```

3. รัน Prisma migration:
```bash
npx prisma migrate dev
```

4. เริ่มต้นเซิร์ฟเวอร์:
```bash
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - ตรวจสอบสถานะ API

### Users (ผู้ใช้)
- `GET /api/users` - ดึงข้อมูลผู้ใช้ทั้งหมด
- `GET /api/users/:id` - ดึงข้อมูลผู้ใช้ตาม ID
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `PUT /api/users/:id` - อัปเดตข้อมูลผู้ใช้
- `DELETE /api/users/:id` - ลบผู้ใช้

### Categories (หมวดหมู่สินค้า)
- `GET /api/categories` - ดึงข้อมูลหมวดหมู่ทั้งหมด
- `GET /api/categories/:id` - ดึงข้อมูลหมวดหมู่ตาม ID
- `POST /api/categories` - สร้างหมวดหมู่ใหม่
- `PUT /api/categories/:id` - อัปเดตข้อมูลหมวดหมู่
- `DELETE /api/categories/:id` - ลบหมวดหมู่

### Products (สินค้า)
- `GET /api/products` - ดึงข้อมูลสินค้าทั้งหมด
- `GET /api/products/:id` - ดึงข้อมูลสินค้าตาม ID
- `POST /api/products` - สร้างสินค้าใหม่
- `PUT /api/products/:id` - อัปเดตข้อมูลสินค้า
- `DELETE /api/products/:id` - ลบสินค้า
- `GET /api/products/dashboard/summary` - ข้อมูลแดชบอร์ดสินค้า

### Suppliers (ซัพพลายเออร์)
- `GET /api/suppliers` - ดึงข้อมูลซัพพลายเออร์ทั้งหมด
- `GET /api/suppliers/:id` - ดึงข้อมูลซัพพลายเออร์ตาม ID
- `POST /api/suppliers` - สร้างซัพพลายเออร์ใหม่
- `PUT /api/suppliers/:id` - อัปเดตข้อมูลซัพพลายเออร์
- `DELETE /api/suppliers/:id` - ลบซัพพลายเออร์

### Customers (ลูกค้า)
- `GET /api/customers` - ดึงข้อมูลลูกค้าทั้งหมด
- `GET /api/customers/:id` - ดึงข้อมูลลูกค้าตาม ID
- `POST /api/customers` - สร้างลูกค้าใหม่
- `PUT /api/customers/:id` - อัปเดตข้อมูลลูกค้า
- `DELETE /api/customers/:id` - ลบลูกค้า

### Warehouse Locations (ตำแหน่งในคลัง)
- `GET /api/warehouse-locations` - ดึงข้อมูลตำแหน่งในคลังทั้งหมด
- `GET /api/warehouse-locations/:id` - ดึงข้อมูลตำแหน่งในคลังตาม ID
- `POST /api/warehouse-locations` - สร้างตำแหน่งในคลังใหม่
- `PUT /api/warehouse-locations/:id` - อัปเดตข้อมูลตำแหน่งในคลัง
- `DELETE /api/warehouse-locations/:id` - ลบตำแหน่งในคลัง

### Inventory (คลังสินค้า)
- `GET /api/inventory` - ดึงข้อมูลคลังสินค้าทั้งหมด
- `GET /api/inventory/:id` - ดึงข้อมูลคลังสินค้าตาม ID
- `POST /api/inventory` - สร้างข้อมูลคลังสินค้าใหม่
- `PUT /api/inventory/:id` - อัปเดตข้อมูลคลังสินค้า
- `DELETE /api/inventory/:id` - ลบข้อมูลคลังสินค้า
- `GET /api/inventory/low-stock/items` - ดึงข้อมูลสินค้าที่มีสต็อกต่ำ

### Inventory Transactions (ธุรกรรมคลังสินค้า)
- `GET /api/inventory-transactions` - ดึงข้อมูลธุรกรรมคลังสินค้าทั้งหมด
- `GET /api/inventory-transactions/:id` - ดึงข้อมูลธุรกรรมตาม ID
- `POST /api/inventory-transactions` - สร้างธุรกรรมใหม่
- `GET /api/inventory-transactions/inventory/:inventoryId` - ดึงธุรกรรมของคลังสินค้า
- `GET /api/inventory-transactions/report/summary` - รายงานสรุปธุรกรรม

### Orders (คำสั่งซื้อ)
- `GET /api/orders` - ดึงข้อมูลคำสั่งซื้อทั้งหมด
- `GET /api/orders/:id` - ดึงข้อมูลคำสั่งซื้อตาม ID
- `POST /api/orders` - สร้างคำสั่งซื้อใหม่
- `PUT /api/orders/:id` - อัปเดตสถานะคำสั่งซื้อ
- `DELETE /api/orders/:id` - ลบคำสั่งซื้อ
- `GET /api/orders/report/summary` - รายงานสรุปคำสั่งซื้อ

### Sales (การขาย)
- `GET /api/sales` - ดึงข้อมูลการขายทั้งหมด
- `GET /api/sales/:id` - ดึงข้อมูลการขายตาม ID
- `POST /api/sales` - สร้างการขายใหม่
- `DELETE /api/sales/:id` - ลบการขาย
- `GET /api/sales/report/summary` - รายงานสรุปการขาย

## Query Parameters

### Pagination
- `page` - หน้าปัจจุบัน (default: 1)
- `limit` - จำนวนรายการต่อหน้า (default: 10)

### Search
- `search` - ค้นหาข้อมูล

### Filtering
- `status` - กรองตามสถานะ
- `categoryId` - กรองตามหมวดหมู่
- `supplierId` - กรองตามซัพพลายเออร์
- `customerId` - กรองตามลูกค้า
- `type` - กรองตามประเภทธุรกรรม
- `lowStock` - กรองสินค้าที่มีสต็อกต่ำ

## Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "error": "ข้อความแสดงข้อผิดพลาด"
}
```

## Database Schema

ระบบใช้ Prisma ORM กับ MySQL database โดยมีตารางหลักดังนี้:

- **Users** - ข้อมูลผู้ใช้
- **Categories** - หมวดหมู่สินค้า
- **Products** - ข้อมูลสินค้า
- **Suppliers** - ข้อมูลซัพพลายเออร์
- **Customers** - ข้อมูลลูกค้า
- **WarehouseLocations** - ตำแหน่งในคลัง
- **Inventory** - ข้อมูลคลังสินค้า
- **InventoryTransactions** - ธุรกรรมคลังสินค้า
- **Orders** - คำสั่งซื้อ
- **OrderItems** - รายการในคำสั่งซื้อ
- **Sales** - การขาย
- **SaleItems** - รายการในการขาย

## การพัฒนา

### การรันในโหมด Development
```bash
npm run dev
```

### การรัน Migration
```bash
npx prisma migrate dev
```

### การดู Database Schema
```bash
npx prisma studio
```

## License

MIT License 