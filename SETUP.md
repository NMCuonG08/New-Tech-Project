# Hướng dẫn Setup

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

### 4. Chạy seed để thêm 63 tỉnh thành Việt Nam
```bash
npm run seed:locations
```

### 5. Chạy server
```bash
npm run dev
```

Server chạy tại: `http://localhost:3000`

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

## API Endpoints

### Weather
- `POST /api/weather/current` - Lấy thời tiết hiện tại
- `POST /api/weather/forecast` - Lấy dự báo thời tiết
- `POST /api/weather/coords` - Lấy thời tiết theo tọa độ

### Locations
- `GET /api/locations` - Lấy tất cả địa điểm
- `GET /api/locations/search?q=query` - Tìm kiếm địa điểm (full text search)
- `GET /api/locations/:id` - Lấy địa điểm theo ID
- `POST /api/locations` - Tạo địa điểm mới
- `PUT /api/locations/:id` - Cập nhật địa điểm
- `DELETE /api/locations/:id` - Xóa địa điểm
- `GET /api/locations/province/:province` - Lấy địa điểm theo tỉnh thành

## Cấu trúc

### Backend
- `entities/Location.ts` - Entity địa điểm với full text search và images
- `services/locationService.ts` - Service CRUD và search
- `services/weatherService.ts` - Service gọi Open-Meteo API
- `controllers/` - Controllers xử lý requests
- `routes/` - Route definitions
- `seeds/locationSeed.ts` - Seed 63 tỉnh thành Việt Nam

### Frontend
- `pages/Weather/WeatherPage.jsx` - Trang thời tiết chính
- `services/weatherService.js` - Service gọi BE API thay vì Open-Meteo trực tiếp
- `hooks/useWeather.js` - Hook quản lý weather state

