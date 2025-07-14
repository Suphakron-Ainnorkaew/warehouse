const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(400).json({ 
        error: 'ข้อมูลซ้ำกัน กรุณาตรวจสอบข้อมูลอีกครั้ง' 
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        error: 'ไม่พบข้อมูลที่ต้องการ' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง' 
  });
};

module.exports = errorHandler; 