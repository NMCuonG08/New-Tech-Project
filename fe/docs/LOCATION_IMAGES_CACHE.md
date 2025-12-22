# Location Images Cache System

Hệ thống cache ảnh location sử dụng localStorage để tối ưu hiệu suất và giảm số lượng API calls.

## Tổng quan

Hệ thống bao gồm 2 phần chính:

1. **`locationImagesCacheService.js`** - Service standalone, có thể dùng ở bất kỳ đâu
2. **`useLocationImages.js`** - React Hook để sử dụng trong components

## Tính năng

✅ **Cache thông minh**: Tự động lưu ảnh vào localStorage sau khi fetch  
✅ **Tự động hết hạn**: Cache hết hạn sau 24 giờ  
✅ **Fallback**: Dùng cache cũ khi API lỗi  
✅ **Auto-cleanup**: Tự động xóa cache cũ khi localStorage đầy  
✅ **Reusable**: Có thể dùng lại ở nhiều component khác nhau  

## Cách sử dụng

### 1. Sử dụng Hook (Trong React Components)

```jsx
import { useLocationImages } from '../hooks/useLocationImages';

function MyComponent() {
  const locationName = "Hanoi";
  
  const { 
    images,        // Array of image URLs
    loading,       // Boolean
    error,         // Error message or null
    refetch,       // Function to force refresh
    clearCache,    // Clear cache for this location
    clearOldCaches // Clear all expired caches
  } = useLocationImages(locationName);

  return (
    <div>
      {loading && <p>Loading images...</p>}
      {error && <p>Error: {error}</p>}
      
      {images.map((url, idx) => (
        <img key={idx} src={url} alt={`${locationName} ${idx}`} />
      ))}
      
      <button onClick={refetch}>Refresh Images</button>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

### 2. Sử dụng Service (Bất kỳ đâu)

```javascript
import {
  getCachedLocationImages,
  setCachedLocationImages,
  clearLocationImagesCache,
  getLocationImagesCacheInfo,
  getAllLocationImagesCaches,
  clearExpiredLocationImagesCaches,
  clearAllLocationImagesCaches,
} from '../services/locationImagesCacheService';

// Lấy cache
const images = getCachedLocationImages('Hanoi');
if (images) {
  console.log('Found cached images:', images);
}

// Lưu cache
setCachedLocationImages('Hanoi', [
  'url1.jpg',
  'url2.jpg',
]);

// Xem thông tin cache
const info = getLocationImagesCacheInfo('Hanoi');
console.log('Cache info:', info);
// { exists: true, expired: false, imageCount: 2, age: 3600000, ageHours: 1 }

// Xóa cache của một location
clearLocationImagesCache('Hanoi');

// Xóa tất cả cache đã hết hạn
const cleared = clearExpiredLocationImagesCaches();
console.log(`Cleared ${cleared} expired caches`);

// Lấy danh sách tất cả cache
const allCaches = getAllLocationImagesCaches();
console.log('All caches:', allCaches);
// [
//   { location: 'hanoi', exists: true, imageCount: 5, ... },
//   { location: 'saigon', exists: true, imageCount: 3, ... },
// ]

// Xóa tất cả cache (cẩn thận!)
clearAllLocationImagesCaches();
```

### 3. Ví dụ trong WeatherPage

```jsx
export function WeatherPage() {
  const locationName = weather?.name || city;
  
  // Sử dụng hook để lấy ảnh với cache
  const { images: backgroundImages } = useLocationImages(locationName);
  
  // backgroundImages sẽ:
  // - Lấy từ cache nếu có (instant, không cần fetch)
  // - Fetch từ API nếu chưa có cache
  // - Tự động lưu vào cache sau khi fetch
  // - Tự động refresh khi locationName thay đổi
  
  return (
    <div>
      {backgroundImages.map((img, idx) => (
        <div key={idx} style={{ backgroundImage: `url(${img})` }} />
      ))}
    </div>
  );
}
```

## API Reference

### Hook: `useLocationImages(locationName)`

**Returns:**
```typescript
{
  images: string[],           // Array of image URLs
  loading: boolean,           // True khi đang fetch
  error: string | null,       // Error message nếu có
  refetch: () => void,        // Force refresh (bypass cache)
  clearCache: () => void,     // Clear cache for this location
  clearOldCaches: () => number // Clear all expired caches, returns count
}
```

### Service Functions

#### `getCachedLocationImages(locationName: string): string[] | null`
Lấy cache của location, trả về null nếu không có hoặc đã hết hạn.

#### `setCachedLocationImages(locationName: string, images: string[]): void`
Lưu ảnh vào cache.

#### `clearLocationImagesCache(locationName: string): void`
Xóa cache của một location.

#### `getLocationImagesCacheInfo(locationName: string): CacheInfo | null`
Lấy thông tin về cache.

#### `getAllLocationImagesCaches(): CacheInfo[]`
Lấy danh sách tất cả cache.

#### `clearExpiredLocationImagesCaches(): number`
Xóa tất cả cache đã hết hạn, trả về số lượng đã xóa.

#### `clearAllLocationImagesCaches(): number`
Xóa tất cả cache (cẩn thận!), trả về số lượng đã xóa.

## Cache Format

Cache được lưu trong localStorage với format:

```javascript
{
  "location_images_hanoi": {
    "data": ["url1.jpg", "url2.jpg", "url3.jpg"],
    "timestamp": 1703251200000
  }
}
```

- **Key**: `location_images_{locationName.toLowerCase()}`
- **Expiry**: 24 giờ (86400000 ms)

## Best Practices

1. **Dùng Hook trong Components**: Luôn ưu tiên dùng hook khi trong React components
2. **Service cho Logic khác**: Dùng service khi cần xử lý cache bên ngoài components
3. **Cleanup định kỳ**: Gọi `clearExpiredLocationImagesCaches()` thỉnh thoảng để dọn dẹp
4. **Handle Errors**: Luôn check error và có UI fallback phù hợp

## Troubleshooting

### Cache không hoạt động?

```javascript
// Check cache info
const info = getLocationImagesCacheInfo('Hanoi');
console.log('Cache info:', info);

// Check localStorage
console.log('localStorage keys:', Object.keys(localStorage));
```

### LocalStorage đầy?

```javascript
// Clear expired caches
const cleared = clearExpiredLocationImagesCaches();
console.log(`Cleared ${cleared} caches`);
```

### Muốn force refresh?

```javascript
const { refetch } = useLocationImages('Hanoi');
refetch(); // Bypass cache và fetch mới
```

## Performance

- **First load**: ~500-1000ms (API call)
- **Cached load**: <10ms (localStorage read)
- **Cache size**: ~2-5KB per location (phụ thuộc số lượng ảnh)
- **Max storage**: ~5-10MB (localStorage limit)

## Notes

- Cache tự động hết hạn sau 24h
- Khi API lỗi, hệ thống sẽ dùng cache cũ (kể cả đã hết hạn) như fallback
- Tự động cleanup khi localStorage đầy
- Thread-safe (localStorage operations are synchronous)
