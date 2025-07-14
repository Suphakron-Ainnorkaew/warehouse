# Warehouse Management System

ระบบจัดการคลังสินค้าที่สมบูรณ์แบบ ประกอบด้วย Backend API และ Frontend Web Application

## 🚀 คุณสมบัติหลัก

### Backend API (Node.js + Express + Prisma)
- **RESTful API** - API ที่ครบถ้วนสำหรับทุกฟีเจอร์
- **Database Management** - ใช้ Prisma ORM กับ PostgreSQL
- **Authentication & Authorization** - ระบบความปลอดภัย
- **Data Validation** - ตรวจสอบข้อมูลที่รับเข้ามา
- **Error Handling** - จัดการข้อผิดพลาดอย่างครอบคลุม
- **Pagination & Search** - ค้นหาและแบ่งหน้าข้อมูล
- **Reports & Analytics** - สร้างรายงานและสถิติ

### Frontend (React + Tailwind CSS)
- **Modern UI/UX** - ดีไซน์ที่ทันสมัยและใช้งานง่าย
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **Real-time Updates** - อัปเดตข้อมูลแบบ Real-time
- **Interactive Components** - Components ที่ใช้งานง่าย
- **State Management** - จัดการ State ด้วย React Hooks

## 📋 โครงสร้างโปรเจค

```
warehouse/
├── server/                 # Backend API
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── prisma/           # Database schema & migrations
│   ├── server.js         # Main server file
│   └── package.json
├── client/                # Frontend Application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main app component
│   └── package.json
└── README.md
```

## 🛠️ การติดตั้ง

### Prerequisites
- Node.js (v14 หรือสูงกว่า)
- PostgreSQL (v12 หรือสูงกว่า)
- npm หรือ yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd warehouse
```

### 2. Backend Setup

```bash
# เข้าไปในโฟลเดอร์ server
cd server

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
# แก้ไขไฟล์ .env ตามการตั้งค่าของคุณ

# รัน database migrations
npx prisma migrate dev

# Seed ข้อมูลตัวอย่าง
npm run seed

# รัน development server
npm run dev
```

### 3. Frontend Setup

```bash
# เข้าไปในโฟลเดอร์ client
cd client

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# รัน development server
npm start
```

### 4. เปิดเบราว์เซอร์
```
Backend API: http://localhost:5000
Frontend App: http://localhost:3000
```

## 📊 ฟีเจอร์ที่รองรับ

### 🔐 การจัดการผู้ใช้
- ลงทะเบียนและเข้าสู่ระบบ
- จัดการโปรไฟล์ผู้ใช้
- ระบบสิทธิ์และบทบาท

### 📦 การจัดการสินค้า
- เพิ่ม แก้ไข ลบสินค้า
- จัดหมวดหมู่สินค้า
- ค้นหาและกรองสินค้า
- จัดการข้อมูลสินค้า (SKU, ราคา, น้ำหนัก, ขนาด)

### 🏪 การจัดการคลังสินค้า
- ติดตามสต็อกสินค้า
- จัดการตำแหน่งในคลัง
- ตั้งค่าระดับสต็อกขั้นต่ำ/สูงสุด
- แจ้งเตือนสต็อกต่ำ

### 📋 การจัดการซัพพลายเออร์
- เพิ่ม แก้ไข ลบซัพพลายเออร์
- จัดการข้อมูลติดต่อ
- ประวัติการสั่งซื้อ

### 👥 การจัดการลูกค้า
- เพิ่ม แก้ไข ลบลูกค้า
- จัดการข้อมูลติดต่อ
- ประวัติการซื้อ

### 📦 การจัดการคำสั่งซื้อ
- สร้างคำสั่งซื้อใหม่
- ติดตามสถานะคำสั่งซื้อ
- จัดการรายการสินค้าในคำสั่งซื้อ

### 💰 การจัดการการขาย
- บันทึกการขาย
- ติดตามยอดขาย
- จัดการรายการสินค้าที่ขาย

### 📊 รายงานและสถิติ
- แดชบอร์ดภาพรวม
- รายงานยอดขาย
- รายงานสต็อก
- สถิติการใช้งาน

## 🗄️ โครงสร้างฐานข้อมูล

### Models หลัก
- **User** - ผู้ใช้งานระบบ
- **Category** - หมวดหมู่สินค้า
- **Product** - สินค้า
- **Supplier** - ซัพพลายเออร์
- **Customer** - ลูกค้า
- **WarehouseLocation** - ตำแหน่งในคลัง
- **Inventory** - สต็อกสินค้า
- **InventoryTransaction** - ธุรกรรมคลัง
- **Order** - คำสั่งซื้อ
- **OrderItem** - รายการในคำสั่งซื้อ
- **Sale** - การขาย
- **SaleItem** - รายการที่ขาย

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - ลงทะเบียน
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/logout` - ออกจากระบบ

### Users
- `GET /api/users` - ดึงรายการผู้ใช้
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `GET /api/users/:id` - ดึงข้อมูลผู้ใช้
- `PUT /api/users/:id` - อัปเดตผู้ใช้
- `DELETE /api/users/:id` - ลบผู้ใช้

### Products
- `GET /api/products` - ดึงรายการสินค้า
- `POST /api/products` - สร้างสินค้าใหม่
- `GET /api/products/:id` - ดึงข้อมูลสินค้า
- `PUT /api/products/:id` - อัปเดตสินค้า
- `DELETE /api/products/:id` - ลบสินค้า

### Inventory
- `GET /api/inventory` - ดึงรายการคลังสินค้า
- `POST /api/inventory` - เพิ่มรายการคลัง
- `GET /api/inventory/:id` - ดึงข้อมูลคลัง
- `PUT /api/inventory/:id` - อัปเดตคลัง
- `DELETE /api/inventory/:id` - ลบรายการคลัง

### และอื่นๆ...
ดูรายละเอียดเพิ่มเติมใน `server/README.md`

## 🎨 Frontend Features

### Pages
- **Dashboard** - หน้าแรกแสดงสถิติ
- **Products** - จัดการสินค้า
- **Inventory** - จัดการคลังสินค้า
- **Orders** - จัดการคำสั่งซื้อ
- **Sales** - จัดการการขาย
- **Reports** - รายงานและสถิติ
- **Users** - จัดการผู้ใช้
- **Settings** - ตั้งค่าระบบ

### Components
- **UI Components** - Button, Input, Modal, Select
- **Layout Components** - Layout, Sidebar, Header
- **Page Components** - แต่ละหน้าของแอป

## 🚀 การ Deploy

### Backend Deployment
```bash
# Build สำหรับ production
npm run build

# รันใน production
npm start
```

### Frontend Deployment
```bash
# Build สำหรับ production
npm run build

# Deploy ไฟล์ในโฟลเดอร์ build
```

## 🔒 ความปลอดภัย

- **Input Validation** - ตรวจสอบข้อมูลที่รับเข้ามา
- **SQL Injection Protection** - ป้องกัน SQL Injection
- **CORS Configuration** - ตั้งค่า CORS
- **Error Handling** - จัดการข้อผิดพลาดอย่างปลอดภัย
- **Authentication** - ระบบยืนยันตัวตน

## 📈 Performance

- **Database Indexing** - สร้าง index สำหรับการค้นหา
- **Pagination** - แบ่งหน้าข้อมูล
- **Caching** - ใช้ cache สำหรับข้อมูลที่ใช้บ่อย
- **Optimized Queries** - ปรับปรุงการ query ฐานข้อมูล

## 🧪 Testing

### Backend Testing
```bash
# รัน unit tests
npm test

# รัน integration tests
npm run test:integration
```

### Frontend Testing
```bash
# รัน unit tests
npm test

# รัน e2e tests
npm run test:e2e
```

## 📝 การพัฒนา

### Code Style
- **Backend** - ESLint + Prettier
- **Frontend** - ESLint + Prettier
- **Database** - Prisma Schema

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

## 📞 Support

หากมีปัญหาหรือคำถาม:
- สร้าง Issue ใน GitHub
- ติดต่อทีมพัฒนา
- ดูเอกสารในโฟลเดอร์ docs/

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Express](https://expressjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide React](https://lucide.dev/) - Icons library

---

**สร้างด้วย ❤️ โดยทีมพัฒนา Warehouse Management System** 