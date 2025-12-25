# User Profile Feature - Implementation Summary

## Overview
Đã cập nhật đầy đủ các tính năng cho trang User Profile, bao gồm:
- Cập nhật thông tin cá nhân (username, email)
- Đổi mật khẩu
- Validation và error handling
- Loading states và toast notifications

## Backend Changes

### 1. DTO (Data Transfer Objects)
**File:** `be/src/dtos/UserDto.ts`
- `UpdateProfileDto`: Validation cho việc cập nhật profile
  - username (optional, min 3 chars)
  - email (optional, valid email format)
- `ChangePasswordDto`: Validation cho việc đổi mật khẩu
  - currentPassword (required)
  - newPassword (required, min 6 chars)

### 2. Service Layer
**File:** `be/src/services/authService.ts`

Added methods:
```typescript
// Update user profile (username and/or email)
async updateProfile(userId: number, updates: { username?: string; email?: string }): Promise<User>

// Change user password
async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>
```

Features:
- Kiểm tra username/email đã tồn tại chưa
- Validate mật khẩu hiện tại
- Bảo vệ OAuth users (không cho phép đổi password nếu user đăng nhập bằng Google)
- TypeORM Not() để exclude user hiện tại khi check uniqueness

### 3. Controller Layer
**File:** `be/src/controllers/authController.ts`

Added endpoints:
```typescript
// PUT /auth/profile - Update user profile
export const updateProfile = async (req: Request, res: Response)

// PUT /auth/change-password - Change password
export const changePassword = async (req: Request, res: Response)
```

Features:
- Authentication required (verifyToken middleware)
- Proper error handling with specific error messages
- Returns updated user data after profile update

### 4. Routes
**File:** `be/src/routes/authRoutes.ts`

New routes:
```typescript
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
```

## Frontend Changes

### 1. User Service
**File:** `fe/src/services/userService.js`

New service class with methods:
```javascript
// Update user profile
async updateProfile(updates)

// Change password
async changePassword(passwordData)

// Get current user (already existed)
async getCurrentUser()
```

### 2. Updated useAuth Hook
**File:** `fe/src/hooks/useAuth.js`

Changes:
- Exported `setUser` để cho phép cập nhật user state từ bên ngoài
- Giữ nguyên tất cả functionality hiện có

### 3. ProfilePage Component
**File:** `fe/src/pages/User/ProfilePage.jsx`

Major updates:

#### State Management
```javascript
const [isUpdating, setIsUpdating] = useState(false);
const [isChangingPassword, setIsChangingPassword] = useState(false);
```

#### Update Profile Handler
```javascript
const handleUpdateProfile = async (e) => {
  // Validates input
  // Calls userService.updateProfile()
  // Updates local state and localStorage
  // Shows success/error toast
}
```

#### Change Password Handler
```javascript
const handleChangePassword = async (e) => {
  // Validates passwords
  // Calls userService.changePassword()
  // Clears password fields on success
  // Shows success/error toast
}
```

#### UI Improvements
- Loading states with spinners
- Disabled buttons during API calls
- Real-time form validation
- Automatic form sync with user data via useEffect
- Proper error messages from backend

## API Endpoints

### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>

Request Body:
{
  "username": "newusername",  // optional
  "email": "newemail@example.com"  // optional
}

Success Response (200):
{
  "id": 1,
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00.000Z"
}

Error Responses:
- 400: Username/Email already taken
- 401: Unauthorized
- 404: User not found
```

### Change Password
```
PUT /api/auth/change-password
Authorization: Bearer <token>

Request Body:
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}

Success Response (200):
{
  "message": "Password changed successfully"
}

Error Responses:
- 400: Current password incorrect / New password too short / OAuth account
- 401: Unauthorized
- 404: User not found
```

## Validation Rules

### Username
- Tối thiểu 3 ký tự (backend)
- Không được để trống (frontend)
- Phải unique trong database

### Email
- Format email hợp lệ (backend validation)
- Có thể để trống (optional field)
- Phải unique trong database nếu được cung cấp

### Password
- Mật khẩu mới tối thiểu 6 ký tự
- Mật khẩu xác nhận phải khớp
- Mật khẩu hiện tại phải đúng
- OAuth users không thể đổi password

## Error Handling

### Backend Errors
- Username/Email already taken
- Current password incorrect
- User not found
- OAuth-only accounts cannot change password

### Frontend Validation
- Empty username
- Password mismatch
- Password too short
- Missing required fields

### Toast Notifications
✅ Success:
- "Cập nhật thông tin thành công!"
- "Đổi mật khẩu thành công!"

❌ Error:
- "Tên người dùng không được để trống!"
- "Mật khẩu xác nhận không khớp!"
- "Mật khẩu mới phải có ít nhất 6 ký tự!"
- Backend error messages (e.g., "Username already taken")

## Testing Steps

### Test Update Profile
1. Login vào tài khoản
2. Truy cập Profile page
3. Click "Chỉnh sửa"
4. Thay đổi username và/hoặc email
5. Click "Lưu thay đổi"
6. Verify:
   - Toast notification hiển thị
   - Thông tin được cập nhật trong UI
   - Refresh page vẫn giữ thông tin mới
   - Navigation header hiển thị username mới

### Test Change Password
1. Login vào tài khoản
2. Truy cập Profile page
3. Scroll xuống section "Đổi Mật Khẩu"
4. Nhập:
   - Mật khẩu hiện tại
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
5. Click "Đổi mật khẩu"
6. Verify:
   - Toast notification hiển thị
   - Form được clear
   - Logout và login lại với password mới

### Test Validation
1. **Empty username**: Try to save without username
2. **Short password**: Try password < 6 chars
3. **Password mismatch**: Different confirm password
4. **Wrong current password**: Wrong current password
5. **Duplicate username**: Try username that exists
6. **Duplicate email**: Try email that exists
7. **OAuth user**: Try to change password for Google OAuth account

### Test Loading States
1. Slow network: Verify spinner appears
2. Verify buttons are disabled during API calls
3. Verify can't submit multiple times

## Security Considerations

### Backend
- JWT authentication required for all operations
- Password verification before changing
- Unique constraints on username/email
- Error messages don't leak information about existing users
- OAuth users protected from password changes

### Frontend
- Token stored in localStorage
- Automatic token attachment via axios interceptor
- User data synced between localStorage and state
- Sensitive operations require current password

## Next Steps (Optional Enhancements)

1. **Avatar Upload**: Add profile picture functionality
2. **Email Verification**: Send verification email when changing email
3. **Password Strength Meter**: Visual indicator for password strength
4. **Two-Factor Authentication**: Add 2FA support
5. **Activity Log**: Show user's recent activities
6. **Delete Account**: Allow users to delete their account
7. **Password Recovery**: "Forgot password" flow
8. **OAuth Link/Unlink**: Connect/disconnect OAuth accounts

## Files Modified/Created

### Backend
- ✨ `be/src/dtos/UserDto.ts` (NEW)
- ✏️ `be/src/services/authService.ts` (UPDATED)
- ✏️ `be/src/controllers/authController.ts` (UPDATED)
- ✏️ `be/src/routes/authRoutes.ts` (UPDATED)

### Frontend
- ✨ `fe/src/services/userService.js` (NEW)
- ✏️ `fe/src/hooks/useAuth.js` (UPDATED)
- ✏️ `fe/src/pages/User/ProfilePage.jsx` (UPDATED)

## Dependencies
No new dependencies required! All features use existing packages.
