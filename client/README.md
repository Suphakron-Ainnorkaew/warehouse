# Warehouse Management System - Frontend

ระบบจัดการคลังสินค้า Frontend ที่สร้างด้วย React และ Tailwind CSS

## คุณสมบัติ

### 🎯 ฟีเจอร์หลัก
- **แดชบอร์ด** - ภาพรวมระบบพร้อมสถิติและกิจกรรมล่าสุด
- **จัดการสินค้า** - เพิ่ม แก้ไข ลบ และค้นหาสินค้า
- **จัดการคลังสินค้า** - ติดตามสต็อกสินค้าในคลัง
- **ระบบ Navigation** - Sidebar และ Header ที่ใช้งานง่าย
- **Responsive Design** - รองรับทุกขนาดหน้าจอ

### 🎨 UI/UX
- **Modern Design** - ใช้ Tailwind CSS สำหรับ UI ที่สวยงาม
- **Interactive Components** - Modal, Forms, Tables ที่ใช้งานง่าย
- **Loading States** - แสดงสถานะการโหลดข้อมูล
- **Toast Notifications** - แจ้งเตือนการดำเนินการต่างๆ
- **Pagination** - แบ่งหน้าข้อมูล

### 🔧 Technical Features
- **React Hooks** - ใช้ useState, useEffect สำหรับ state management
- **React Router** - จัดการ routing ระหว่างหน้า
- **Axios** - เชื่อมต่อกับ API backend
- **Lucide React** - Icons ที่สวยงาม
- **React Hot Toast** - Notifications

## การติดตั้ง

### Prerequisites
- Node.js (v14 หรือสูงกว่า)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **ติดตั้ง Dependencies**
```bash
npm install
```

2. **สร้างไฟล์ Environment Variables**
```bash
# สร้างไฟล์ .env ในโฟลเดอร์ client
REACT_APP_API_URL=http://localhost:5000/api
```

3. **รัน Development Server**
```bash
npm start
```

4. **เปิดเบราว์เซอร์**
```
http://localhost:3000
```

## โครงสร้างโปรเจค

```
client/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/           # UI Components
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   └── Modal.js
│   │   └── layout/       # Layout Components
│   │       ├── Layout.js
│   │       ├── Sidebar.js
│   │       └── Header.js
│   ├── pages/            # Page Components
│   │   ├── Dashboard.js
│   │   ├── Products.js
│   │   └── Inventory.js
│   ├── utils/            # Utility Functions
│   │   ├── api.js        # API Service
│   │   └── helpers.js    # Helper Functions
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## การใช้งาน

### 1. แดชบอร์ด
- ดูสถิติภาพรวมของระบบ
- ตรวจสอบกิจกรรมล่าสุด
- เข้าถึงฟีเจอร์ต่างๆ ผ่าน Quick Actions

### 2. จัดการสินค้า
- เพิ่มสินค้าใหม่
- แก้ไขข้อมูลสินค้า
- ลบสินค้า
- ค้นหาและกรองสินค้า
- ดูรายละเอียดสต็อก

### 3. จัดการคลังสินค้า
- เพิ่มรายการในคลัง
- แก้ไขจำนวนสต็อก
- ตั้งค่าระดับสต็อกขั้นต่ำ/สูงสุด
- ดูสถานะสต็อก (ต่ำ/ปานกลาง/สูง)

## Components

### UI Components
- **Button** - ปุ่มที่มีหลาย variant และ size
- **Input** - Input field พร้อม validation
- **Select** - Dropdown selection
- **Modal** - Popup dialog

### Layout Components
- **Layout** - Layout หลักของแอป
- **Sidebar** - Navigation sidebar
- **Header** - Header พร้อม user menu

### Pages
- **Dashboard** - หน้าแรกแสดงสถิติ
- **Products** - จัดการสินค้า
- **Inventory** - จัดการคลังสินค้า

## API Integration

### API Service (`utils/api.js`)
- เชื่อมต่อกับ backend API
- จัดการ authentication
- Error handling
- Request/Response interceptors

### Helper Functions (`utils/helpers.js`)
- Format functions (date, currency, number)
- Validation functions
- Status translation
- Utility functions

## การพัฒนา

### การเพิ่มหน้าใหม่
1. สร้างไฟล์ใน `src/pages/`
2. เพิ่ม route ใน `App.js`
3. เพิ่ม menu item ใน `Sidebar.js`

### การเพิ่ม Component ใหม่
1. สร้างไฟล์ใน `src/components/`
2. Export component
3. Import และใช้งาน

### การปรับแต่ง Styling
- ใช้ Tailwind CSS classes
- ปรับแต่ง `tailwind.config.js` สำหรับ custom styles
- ใช้ `utils/helpers.js` สำหรับ dynamic classes

## การ Deploy

### Build สำหรับ Production
```bash
npm run build
```

### Environment Variables
```bash
# Production
REACT_APP_API_URL=https://your-api-domain.com/api

# Development
REACT_APP_API_URL=http://localhost:5000/api
```

## Troubleshooting

### ปัญหาที่พบบ่อย

1. **API Connection Error**
   - ตรวจสอบ REACT_APP_API_URL ใน .env
   - ตรวจสอบว่า backend server กำลังรัน

2. **CORS Error**
   - ตรวจสอบ proxy setting ใน package.json
   - ตรวจสอบ CORS configuration ใน backend

3. **Build Error**
   - ลบ node_modules และติดตั้งใหม่
   - ตรวจสอบ dependencies ใน package.json

## การปรับปรุงในอนาคต

### ฟีเจอร์ที่วางแผน
- [ ] ระบบ Authentication/Authorization
- [ ] หน้า Reports และ Analytics
- [ ] ระบบ Notifications
- [ ] Dark Mode
- [ ] Multi-language Support
- [ ] Export/Import Data
- [ ] Advanced Search และ Filters
- [ ] Real-time Updates

### Technical Improvements
- [ ] TypeScript Migration
- [ ] Unit Tests
- [ ] E2E Tests
- [ ] Performance Optimization
- [ ] PWA Support
- [ ] Offline Support

## License

MIT License - ดูรายละเอียดใน LICENSE file

## Support

หากมีปัญหาหรือคำถาม กรุณาติดต่อทีมพัฒนา
