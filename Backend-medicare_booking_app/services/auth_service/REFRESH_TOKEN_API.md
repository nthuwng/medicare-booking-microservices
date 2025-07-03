# Refresh Token API Documentation

## Tổng quan

Hệ thống refresh token cho phép người dùng có thể gia hạn access token mà không cần đăng nhập lại. Refresh token có thời gian sống dài hơn access token và được lưu trữ an toàn trong **HTTP-only cookie** để bảo mật tối đa.

## Các API Endpoints

### 1. Đăng nhập (Login)

**POST** `/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response thành công:

```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

**Lưu ý**: Refresh token được tự động lưu vào HTTP-only cookie và không trả về trong response body.

### 2. Refresh Token

**POST** `/refresh-token`

**Không cần request body** - Refresh token được đọc tự động từ HTTP-only cookie.

Response thành công:

```json
{
  "success": true,
  "message": "Refresh token thành công",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

**Lưu ý**: Refresh token mới sẽ được tự động cập nhật trong HTTP-only cookie.

### 3. Revoke Token (Đăng xuất)

**POST** `/revoke-token`

**Không cần request body** - Refresh token được đọc tự động từ HTTP-only cookie.

Response thành công:

```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

**Lưu ý**: Refresh token sẽ được xóa khỏi cookie sau khi đăng xuất.

## Cách sử dụng

### 1. Đăng nhập

Khi người dùng đăng nhập thành công, hệ thống sẽ:

- Trả về access token trong response body
- Tự động lưu refresh token vào HTTP-only cookie

### 2. Sử dụng Access Token

- Access token được sử dụng để xác thực các API calls
- Thời gian sống ngắn (thường 15-60 phút)
- Được gửi trong header: `Authorization: Bearer <access_token>`
- Lưu trữ trong localStorage hoặc memory

### 3. Refresh Token khi Access Token hết hạn

Khi access token hết hạn, sử dụng refresh token để lấy token mới:

```javascript
// Ví dụ với fetch
const refreshToken = async () => {
  try {
    const response = await fetch("/refresh-token", {
      method: "POST",
      credentials: "include", // Quan trọng: gửi cookie
    });

    const data = await response.json();
    if (data.success) {
      // Lưu access token mới
      localStorage.setItem("access_token", data.data.access_token);
      // Refresh token mới đã được tự động cập nhật trong cookie
    }
  } catch (error) {
    // Xử lý lỗi - có thể redirect về trang login
    console.error("Refresh token failed:", error);
  }
};
```

### 4. Đăng xuất

Khi người dùng đăng xuất, gọi API revoke token:

```javascript
const logout = async () => {
  try {
    await fetch("/revoke-token", {
      method: "POST",
      credentials: "include", // Quan trọng: gửi cookie
    });

    // Xóa access token khỏi localStorage
    localStorage.removeItem("access_token");
    // Refresh token đã được tự động xóa khỏi cookie
  } catch (error) {
    // Xử lý lỗi
    console.error("Logout failed:", error);
  }
};
```

## Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

## Database Migration

Chạy migration để tạo bảng refresh_tokens:

```bash
npx prisma migrate dev --name add_refresh_tokens
```

## Bảo mật

1. **HTTP-only Cookie**: Refresh token được lưu trong HTTP-only cookie, không thể truy cập bằng JavaScript
2. **Secure Flag**: Cookie chỉ được gửi qua HTTPS trong production
3. **SameSite**: Bảo vệ khỏi CSRF attacks
4. **Refresh Token Rotation**: Mỗi lần refresh, hệ thống sẽ tạo refresh token mới và vô hiệu hóa token cũ
5. **Token Revocation**: Refresh token có thể bị vô hiệu hóa khi đăng xuất
6. **Database Storage**: Refresh token được lưu trữ an toàn trong database với thời gian hết hạn

## Lưu ý

- Refresh token có thời gian sống dài hơn access token (7 ngày)
- Mỗi refresh token chỉ có thể sử dụng một lần
- Khi refresh token hết hạn, người dùng phải đăng nhập lại
- Luôn sử dụng `credentials: "include"` khi gọi API refresh token
- Access token vẫn được lưu trong localStorage/memory để sử dụng
- Refresh token được quản lý hoàn toàn bởi server thông qua cookie
