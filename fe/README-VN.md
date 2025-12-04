# ⚡ PWA demo(React + Vite)


---

## 1. Tạo project + cài gói

```bash
npm create vite@latest weather-pwa -- --template react
cd weather-pwa
npm install
npm install vite-plugin-pwa
```

---

## 2. Cấu hình PWA

### 2.1 Manifest (`vite.config.js`)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Demo PWA',
        short_name: 'Demo',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

> Copy icon vào `public/pwa-192x192.png` và `public/pwa-512x512.png`.

### 2.2 Workbox cache (`vite.config.js`)

Trong block `VitePWA(...)`, ngay sau `manifest`, thêm phần `workbox` giống cấu hình thực tế:

```js
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,png}'],
  globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
  skipWaiting: true,
  clientsClaim: true,
 
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365
        },
        cacheableResponse: { statuses: [0, 200] }
      }
    },
    {
      urlPattern: /^https:\/\/api\.open-meteo\.com\/v1\/forecast.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'open-meteo-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 30 // 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
}
```



## 3. Đăng ký service worker

`src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

registerSW()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 4. App demo  đơn giản

`src/App.jsx`

```jsx
import { useEffect, useState } from 'react'

export default function App() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current=temperature_2m')
      .then((res) => res.json())
      .then(setWeather)
      .catch((err) => console.error(err))
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Weather PWA</h1>
        <p>Nhiệt độ hiện tại Hà Nội:</p>
        <strong>{weather?.current?.temperature_2m ?? '--'} °C</strong>
      </div>
    </main>
  )
}
```

---

## 5. Chạy và test PWA

### 5.1 Development server

```bash
npm run dev
```

- Mở `http://localhost:5173` để xem app.
- Dùng DevTools > Application > Service Workers (mặc dù dev chưa có SW thật, chỉ check log).

### 5.2 Build

```bash
npm run build 
```

- Tạo thư mục `dist/` sẵn sàng deploy.

### 5.3 Preview bản build + kiểm tra PWA

```bash
npm run preview
```

- DevTools > Application > Service Workers: thấy `sw.js` + các cache (`workbox-precache-v2`, `fonts-cache`, `weather-api-cache`, `image-cache`).
- DevTools > Network > Offline rồi reload để chắc shell + dữ liệu cũ vẫn hiển thị.
- Add to Home Screen nếu dùng Chrome/Edge. Vậy là có bản PWA đơn giản, code gọn, đủ test trong 10 phút.
