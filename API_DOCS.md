# Backend API Endpoints Documentation

## Base URL
`http://localhost:5000/api`

## Authentication Endpoints

### Register
- **POST** `/auth/register`
- Body:
```json
{
  "firstName": "ชื่อ",
  "lastName": "นามสกุล",
  "email": "example@email.com",
  "password": "password123",
  "phoneNumber": "0812345678",
  "dateOfBirth": "1990-01-01"
}
```

### Login
- **POST** `/auth/login`
- Body:
```json
{
  "email": "example@email.com",
  "password": "password123"
}
```

### Get Current User
- **GET** `/auth/me`
- Headers: `Authorization: Bearer {token}`

### Update Profile
- **PUT** `/auth/profile`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "firstName": "ชื่อใหม่",
  "lastName": "นามสกุลใหม่",
  "phoneNumber": "0987654321"
}
```

## Product Endpoints

### Get All Products
- **GET** `/products?category=โน๊ตบุ๊ค&search=macbook&page=1&limit=20`

### Get Product by ID
- **GET** `/products/:id`

### Get Categories
- **GET** `/products/categories`

### Create Product (Admin)
- **POST** `/products`
- Headers: `Authorization: Bearer {token}`

### Update Product (Admin)
- **PUT** `/products/:id`
- Headers: `Authorization: Bearer {token}`

### Delete Product (Admin)
- **DELETE** `/products/:id`
- Headers: `Authorization: Bearer {token}`

## Cart Endpoints

### Get Cart
- **GET** `/cart`
- Headers: `Authorization: Bearer {token}`

### Add to Cart
- **POST** `/cart`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "productId": "product_id_here",
  "quantity": 1
}
```

### Update Cart Item
- **PUT** `/cart/:productId`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "quantity": 2
}
```

### Remove from Cart
- **DELETE** `/cart/:productId`
- Headers: `Authorization: Bearer {token}`

### Clear Cart
- **DELETE** `/cart`
- Headers: `Authorization: Bearer {token}`

## Order Endpoints

### Create Order
- **POST** `/orders`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "fullName": "ชื่อ-นามสกุล",
    "phoneNumber": "0812345678",
    "address": "123 ถนนสุขุมวิท",
    "district": "คลองเตย",
    "province": "กรุงเทพมหานคร",
    "postalCode": "10110"
  },
  "paymentMethod": "credit_card"
}
```

### Get My Orders
- **GET** `/orders`
- Headers: `Authorization: Bearer {token}`

### Get Order by ID
- **GET** `/orders/:id`
- Headers: `Authorization: Bearer {token}`

### Update Order to Paid
- **PUT** `/orders/:id/pay`
- Headers: `Authorization: Bearer {token}`

### Get All Orders (Admin)
- **GET** `/orders/admin/all`
- Headers: `Authorization: Bearer {token}`

### Update Order Status (Admin)
- **PUT** `/orders/:id/status`
- Headers: `Authorization: Bearer {token}`
- Body:
```json
{
  "status": "processing"
}
```
Status options: "pending", "processing", "shipped", "delivered", "cancelled"
