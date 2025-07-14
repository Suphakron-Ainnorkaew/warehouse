const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s()]+$/;
  return phoneRegex.test(phone);
};

const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    throw new Error(`${fieldName} เป็นข้อมูลที่จำเป็น`);
  }
  return value.trim();
};

const validateNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} ต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0`);
  }
  return num;
};

const validateInteger = (value, fieldName) => {
  const num = parseInt(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} ต้องเป็นจำนวนเต็มที่มากกว่าหรือเท่ากับ 0`);
  }
  return num;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateRequired,
  validateNumber,
  validateInteger
}; 