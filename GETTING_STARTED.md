# วิธีเริ่มต้นใช้งานระบบ Backend

## ขั้นตอนการเริ่มต้น (Quick Start)

### 1. ตรวจสอบว่า MongoDB กำลังทำงาน

**Windows:**
```bash
# เปิด Command Prompt แบบ Administrator
net start MongoDB

# หรือถ้าใช้ MongoDB Compass ให้เปิดโปรแกรมและ Connect
```

### 2. เปิด Terminal 2 หน้าต่าง

**Terminal 1 - รัน Backend:**
```bash
npm run server
```

ควรเห็นข้อความ:
```
✅ MongoDB connected successfully
🚀 Server is running on port 5000
📍 API URL: http://localhost:5000
🌍 Environment: development
```

**Terminal 2 - รัน Frontend:**
```bash
npm run dev
```

ควรเห็นข้อความ:
```
  ▲ Next.js 15.5.4
  - Local:        http://localhost:3000
```

### 3. เพิ่มข้อมูลสินค้าตัวอย่าง (ครั้งแรกเท่านั้น)

**Terminal 3:**
```bash
npm run seed
```

ควรเห็นข้อความ:
```
✅ MongoDB connected successfully
✅ Sample products seeded successfully
📦 Created 5 products
```

### 4. ทดสอบระบบ

1. เปิด Browser ไปที่ `http://localhost:3000`
2. คลิก "เข้าสู่ระบบ"
3. คลิก "สมัครสมาชิกเลย"
4. กรอกข้อมูล:
   - ชื่อ: ทดสอบ
   - นามสกุล: ระบบ
   - เบอร์โทร: 0812345678
   - วันเกิด: 01/01/1990
   - อีเมล: test@example.com
   - รหัสผ่าน: 123456
   - ยืนยันรหัสผ่าน: 123456
5. คลิก "สมัครสมาชิก"
6. ถ้าสำเร็จ จะเห็นข้อความ "สมัครสมาชิกสำเร็จ!"

### 5. ทดสอบ Login

1. คลิก "เข้าสู่ระบบ"
2. คลิก "เข้าสู่ระบบด้วย Email"
3. กรอก:
   - อีเมล: test@example.com
   - รหัสผ่าน: 123456
4. คลิก "เข้าสู่ระบบ"
5. ถ้าสำเร็จ จะเห็นข้อความ "ยินดีต้อนรับ ทดสอบ!"

---

## การทดสอบ API ด้วย Postman

### 1. ทดสอบ Health Check
```
GET http://localhost:5000/api/health
```

### 2. ทดสอบ Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "email": "somchai@example.com",
  "password": "password123",
  "phoneNumber": "0898765432",
  "dateOfBirth": "1995-05-15"
}
```

### 3. ทดสอบ Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "somchai@example.com",
  "password": "password123"
}
```

คัดลอก `token` ที่ได้จาก Response

### 4. ทดสอบ Get Products
```
GET http://localhost:5000/api/products
```

### 5. ทดสอบ Add to Cart (ต้อง Login)
```
POST http://localhost:5000/api/cart
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "productId": "PRODUCT_ID_FROM_GET_PRODUCTS",
  "quantity": 1
}
```

---

## คำสั่งที่ใช้บ่อย

```bash
# รัน Backend
npm run server

# รัน Frontend  
npm run dev

# เพิ่มข้อมูลตัวอย่าง
npm run seed

# Build Backend
npm run server:build

# รัน Production Backend
npm run server:start

# Build Frontend
npm run build

# รัน Production Frontend
npm start
```

---

## Troubleshooting

### ❌ MongoDB Connection Error

**ปัญหา:**
```
❌ MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**วิธีแก้:**
1. ตรวจสอบว่า MongoDB กำลังรันอยู่
2. Windows: `net start MongoDB` (Command Prompt แบบ Admin)
3. หรือใช้ MongoDB Compass เชื่อมต่อ

### ❌ Port 5000 Already in Use

**ปัญหา:**
```
Error: Port 5000 is already in use
```

**วิธีแก้:**
แก้ไขไฟล์ `.env`:
```
PORT=5001
```

และแก้ไขไฟล์ `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

### ❌ CORS Error

**ปัญหา:**
```
Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS
```

**วิธีแก้:**
ตรวจสอบไฟล์ `.env` ว่ามี:
```
FRONTEND_URL=http://localhost:3000
```

---

## การตรวจสอบข้อมูลใน MongoDB

### ใช้ MongoDB Compass
1. เปิด MongoDB Compass
2. เชื่อมต่อไปที่ `mongodb://localhost:27017`
3. เลือก Database `ecommerce`
4. ดู Collections:
   - `users` - ข้อมูลผู้ใช้
   - `products` - ข้อมูลสินค้า
   - `carts` - ตะกร้าสินค้า
   - `orders` - คำสั่งซื้อ

### ใช้ MongoDB Shell
```bash
mongosh

use ecommerce

# ดูข้อมูลผู้ใช้
db.users.find()

# ดูข้อมูลสินค้า
db.products.find()

# นับจำนวนสินค้า
db.products.countDocuments()

# ลบข้อมูลทั้งหมด (ระวัง!)
db.users.deleteMany({})
db.products.deleteMany({})
db.carts.deleteMany({})
db.orders.deleteMany({})
```

---

## ข้อมูลสำคัญ

### Token จะถูกเก็บไว้ที่
- `localStorage.getItem('token')` - JWT Token
- `localStorage.getItem('user')` - ข้อมูลผู้ใช้

### การ Logout
เปิด Console ในเว็บและพิมพ์:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
location.reload();
```

---

**พร้อมใช้งานแล้ว! 🎉**
