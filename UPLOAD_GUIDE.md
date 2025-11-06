# 📸 ระบบอัพโหลดรูปภาพและแปลงเป็น URL

## 🎯 ความสามารถ

- ✅ อัพโหลดรูปภาพเดี่ยว
- ✅ อัพโหลดรูปภาพหลายรูปพร้อมกัน (สูงสุด 10 รูป)
- ✅ แปลงไฟล์รูปเป็น URL อัตโนมัติ
- ✅ Preview รูปก่อนอัพโหลด
- ✅ ลบรูปภาพที่ไม่ต้องการ
- ✅ รองรับ JPEG, JPG, PNG, GIF, WebP
- ✅ จำกัดขนาดไฟล์ 5MB
- ✅ ชื่อไฟล์ unique อัตโนมัติ

## 📡 API Endpoints

### 1. อัพโหลดรูปเดี่ยว
```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- image: File (รูปภาพ)

Response:
{
  "success": true,
  "message": "อัพโหลดรูปภาพสำเร็จ",
  "data": {
    "filename": "product-1699123456789-123456789.jpg",
    "originalname": "product.jpg",
    "size": 245678,
    "url": "http://localhost:5000/uploads/product-1699123456789-123456789.jpg"
  }
}
```

### 2. อัพโหลดหลายรูป
```
POST /api/upload/multiple
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- images: File[] (รูปภาพหลายรูป สูงสุด 10 รูป)

Response:
{
  "success": true,
  "message": "อัพโหลดรูปภาพสำเร็จ 3 รูป",
  "data": {
    "images": [
      {
        "filename": "image1-1699123456789-123456789.jpg",
        "originalname": "image1.jpg",
        "size": 123456,
        "url": "http://localhost:5000/uploads/image1-1699123456789-123456789.jpg"
      },
      // ... รูปอื่นๆ
    ],
    "count": 3
  }
}
```

### 3. ลบรูปภาพ
```
DELETE /api/upload/:filename
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "ลบรูปภาพสำเร็จ"
}
```

### 4. เข้าถึงรูปภาพ
```
GET /uploads/:filename

Example:
http://localhost:5000/uploads/product-1699123456789-123456789.jpg
```

## 🎨 React Components

### ImageUpload (อัพโหลดรูปเดี่ยว)

```tsx
import ImageUpload from '@/app/component/ImageUpload/ImageUpload';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <ImageUpload
      label="อัพโหลดรูปภาพ"
      currentImage={imageUrl}
      onUploadSuccess={(url) => setImageUrl(url)}
    />
  );
}
```

**Props:**
- `onUploadSuccess: (imageUrl: string) => void` - Callback เมื่ออัพโหลดสำเร็จ
- `currentImage?: string` - URL รูปภาพปัจจุบัน
- `label?: string` - ข้อความ label (default: "อัพโหลดรูปภาพ")

### MultipleImageUpload (อัพโหลดหลายรูป)

```tsx
import MultipleImageUpload from '@/app/component/ImageUpload/MultipleImageUpload';

function MyComponent() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  return (
    <MultipleImageUpload
      label="อัพโหลดรูปภาพหลายรูป"
      currentImages={imageUrls}
      maxImages={10}
      onUploadSuccess={(urls) => setImageUrls(urls)}
    />
  );
}
```

**Props:**
- `onUploadSuccess: (imageUrls: string[]) => void` - Callback เมื่ออัพโหลดสำเร็จ
- `currentImages?: string[]` - Array ของ URL รูปภาพปัจจุบัน
- `maxImages?: number` - จำนวนรูปสูงสุด (default: 10)
- `label?: string` - ข้อความ label

## 💻 การใช้งาน API Functions

```typescript
import { uploadAPI } from '@/app/lib/api';

// อัพโหลดรูปเดี่ยว
const file = event.target.files[0];
const response = await uploadAPI.uploadImage(file);
console.log(response.data.url); // URL ของรูปภาพ

// อัพโหลดหลายรูป
const files = Array.from(event.target.files);
const response = await uploadAPI.uploadMultipleImages(files);
console.log(response.data.images); // Array ของรูปภาพ

// ลบรูปภาพ
await uploadAPI.deleteImage('filename.jpg');
```

## 🔒 การรักษาความปลอดภัย

1. **Authentication Required** - ต้อง Login ก่อนใช้งาน
2. **File Type Validation** - รองรับเฉพาะไฟล์รูปภาพ
3. **File Size Limit** - จำกัดขนาดไฟล์ไม่เกิน 5MB
4. **Unique Filename** - ป้องกันไฟล์ซ้ำกัน

## 📁 โครงสร้างไฟล์

```
server/
├── src/
│   ├── middleware/
│   │   └── upload.ts          # Multer configuration
│   ├── routes/
│   │   └── uploadRoutes.ts    # Upload API routes
│   └── server.ts              # Import upload routes
└── uploads/                    # ไฟล์ที่อัพโหลด (auto-created)

src/app/
├── component/
│   └── ImageUpload/
│       ├── ImageUpload.tsx           # Component อัพโหลดรูปเดี่ยว
│       └── MultipleImageUpload.tsx   # Component อัพโหลดหลายรูป
├── lib/
│   └── api.ts                        # Upload API functions
├── test-upload/
│   └── page.tsx                      # หน้าทดสอบอัพโหลด
└── admin/
    └── products/
        └── page.tsx                  # ใช้ ImageUpload component
```

## 🧪 ทดสอบระบบ

1. **เริ่มต้น Backend:**
```bash
npm run server
```

2. **เริ่มต้น Frontend:**
```bash
npm run dev
```

3. **เข้าหน้าทดสอบ:**
```
http://localhost:3000/test-upload
```

4. **หรือใช้ใน Admin Products:**
```
http://localhost:3000/admin/products
```

## 📝 ตัวอย่างการใช้งานในหน้า Admin Products

```tsx
import ImageUpload from '../../component/ImageUpload/ImageUpload';

// ในฟอร์มเพิ่ม/แก้ไขสินค้า
<ImageUpload
  label="รูปภาพสินค้า *"
  currentImage={formData.image}
  onUploadSuccess={(url) => setFormData({...formData, image: url})}
/>

// หรือใส่ URL เอง
<input
  type="text"
  value={formData.image}
  onChange={(e) => setFormData({...formData, image: e.target.value})}
  placeholder="https://example.com/image.jpg"
/>
```

## ⚙️ การตั้งค่า

### Backend (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Storage Location
ไฟล์จะถูกเก็บใน: `server/uploads/`

### File Naming Pattern
```
{original-name}-{timestamp}-{random-number}.{extension}

ตัวอย่าง:
product-1699123456789-123456789.jpg
```

## 🎯 Features

- ✅ Drag & Drop support (Future)
- ✅ Image compression (Future)
- ✅ Image cropping (Future)
- ✅ Cloud storage integration (Future: AWS S3, Cloudinary)
- ✅ Auto-resize images (Future)
- ✅ Watermark support (Future)

## 🐛 Troubleshooting

### ปัญหา: ไม่สามารถอัพโหลดได้
- ตรวจสอบว่า Login แล้วหรือยัง
- ตรวจสอบขนาดไฟล์ (ต้องไม่เกิน 5MB)
- ตรวจสอบประเภทไฟล์ (ต้องเป็นรูปภาพ)

### ปัญหา: ไม่มีโฟลเดอร์ uploads
- โฟลเดอร์จะถูกสร้างอัตโนมัติเมื่อ server start
- หรือสร้างด้วยตัวเอง: `mkdir server/uploads`

### ปัญหา: แสดงรูปไม่ได้
- ตรวจสอบ CORS settings
- ตรวจสอบว่า static file serving ทำงานหรือไม่
- ตรวจสอบ URL ว่าถูกต้อง

## 📞 Support

หากมีปัญหาหรือข้อสงสัย สามารถตรวจสอบได้ที่:
- Backend logs: ดูใน Terminal ที่รัน `npm run server`
- Frontend logs: ดูใน Browser Console
- API testing: ใช้ Postman หรือ Thunder Client
