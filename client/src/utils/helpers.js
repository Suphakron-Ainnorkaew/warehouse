import { clsx } from 'clsx';

// Utility function สำหรับ merge Tailwind classes
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

// Format วันที่
export function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format วันที่และเวลา
export function formatDateTime(date) {
  if (!date) return '-';
  return new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format จำนวนเงิน
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
}

// Format จำนวน
export function formatNumber(number) {
  if (!number && number !== 0) return '-';
  return new Intl.NumberFormat('th-TH').format(number);
}

// สร้างรหัสอ้างอิง
export function generateReference(prefix = 'REF') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}${random}`;
}

// ตรวจสอบว่าเป็น email ที่ถูกต้อง
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ตรวจสอบว่าเป็นเบอร์โทรที่ถูกต้อง
export function isValidPhone(phone) {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone);
}

// แปลง status เป็นภาษาไทย
export function translateStatus(status) {
  const statusMap = {
    PENDING: 'รอดำเนินการ',
    COMPLETED: 'เสร็จสิ้น',
    CANCELLED: 'ยกเลิก',
    RECEIVE: 'รับสินค้า',
    SELL: 'ขาย',
    ADJUST: 'ปรับปรุง',
  };
  return statusMap[status] || status;
}

// สร้างสีตาม status
export function getStatusColor(status) {
  const colorMap = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RECEIVE: 'bg-blue-100 text-blue-800',
    SELL: 'bg-purple-100 text-purple-800',
    ADJUST: 'bg-orange-100 text-orange-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// คำนวณเปอร์เซ็นต์
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ตรวจสอบระดับสต็อก
export function getStockLevel(quantity, minStockLevel) {
  if (quantity <= minStockLevel) return 'low';
  if (quantity <= minStockLevel * 2) return 'medium';
  return 'high';
}

// สร้างสีตามระดับสต็อก
export function getStockLevelColor(level) {
  const colorMap = {
    low: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-green-100 text-green-800',
  };
  return colorMap[level] || 'bg-gray-100 text-gray-800';
}

// แปลงขนาดไฟล์
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// สร้าง slug จากข้อความ
export function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ตรวจสอบว่าเป็น URL ที่ถูกต้อง
export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// แปลงข้อความเป็น slug
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
} 