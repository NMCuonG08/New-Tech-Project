# Weather PWA - Hướng dẫn chạy dự án

## Yêu cầu
- Node.js >= 18
- MySQL (hoặc MariaDB)

## Backend (BE)

### 1. Cài đặt dependencies
```bash
cd be
npm install
```

### 2. Cấu hình database
Tạo file `.env` trong thư mục `be/`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=weather_db
FRONTEND_URL=http://localhost:5173
```

### 3. Tạo database
```sql
CREATE DATABASE weather_db;
```

### 4. Chạy server
```bash
npm run dev
```

Server chạy tại: `http://localhost:3000`

---

## Frontend (FE)

### 1. Cài đặt dependencies
```bash
cd fe
npm install
```

### 2. Cấu hình API
Tạo file `.env` trong thư mục `fe/`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng chạy tại: `http://localhost:5173`

---

## Sử dụng

1. Mở trình duyệt vào `http://localhost:5173`
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Xem thời tiết theo thời gian thực

---

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

