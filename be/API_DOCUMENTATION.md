# CRUD APIs Documentation

## 📌 Favorites API

### Create Favorite
```
POST /api/favorites
Headers: Authorization: Bearer <token>
Body: {
  "locationId": 1
}
```

### Get All User Favorites
```
GET /api/favorites
Headers: Authorization: Bearer <token>
```

### Check if Location is Favorite
```
GET /api/favorites/check/:locationId
Headers: Authorization: Bearer <token>
```

### Delete Favorite
```
DELETE /api/favorites/:id
Headers: Authorization: Bearer <token>
```

---

## 🔔 Alerts API

### Create Alert
```
POST /api/alerts
Headers: Authorization: Bearer <token>
Body: {
  "locationId": 1,
  "type": "temperature_high" | "temperature_low" | "rain" | "wind" | "aqi" | "humidity",
  "threshold": 35,
  "description": "Alert when temperature exceeds 35°C"
}
```

### Get All User Alerts
```
GET /api/alerts
Headers: Authorization: Bearer <token>
```

### Get Alert by ID
```
GET /api/alerts/:id
Headers: Authorization: Bearer <token>
```

### Get Active Alerts by Location
```
GET /api/alerts/location/:locationId
Headers: Authorization: Bearer <token>
```

### Update Alert
```
PUT /api/alerts/:id
Headers: Authorization: Bearer <token>
Body: {
  "type": "temperature_high",
  "threshold": 40,
  "description": "Updated description",
  "isActive": true
}
```

### Delete Alert
```
DELETE /api/alerts/:id
Headers: Authorization: Bearer <token>
```

---

## 📝 Notes API

### Create Note
```
POST /api/notes
Headers: Authorization: Bearer <token>
Body: {
  "locationId": 1,
  "date": "2025-12-20",
  "title": "Weather observation",
  "content": "It was very hot today with clear skies"
}
```

### Get All User Notes
```
GET /api/notes
Headers: Authorization: Bearer <token>
```

### Get Note by ID
```
GET /api/notes/:id
Headers: Authorization: Bearer <token>
```

### Get Notes by Location
```
GET /api/notes/location/:locationId
Headers: Authorization: Bearer <token>
```

### Get Notes by Date Range
```
GET /api/notes/date-range?startDate=2025-12-01&endDate=2025-12-31
Headers: Authorization: Bearer <token>
```

### Update Note
```
PUT /api/notes/:id
Headers: Authorization: Bearer <token>
Body: {
  "title": "Updated title",
  "content": "Updated content",
  "date": "2025-12-21",
  "locationId": 2
}
```

### Delete Note
```
DELETE /api/notes/:id
Headers: Authorization: Bearer <token>
```

---

## Alert Types
- `temperature_high`: High temperature alert
- `temperature_low`: Low temperature alert
- `rain`: Rain alert
- `wind`: Strong wind alert
- `aqi`: Air Quality Index alert
- `humidity`: Humidity alert

## Response Codes
- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error
