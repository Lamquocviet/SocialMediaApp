# SocialApp – Ứng dụng mạng xã hội đa nền tảng

SocialApp là dự án xây dựng ứng dụng mạng xã hội lấy cảm hứng từ Twitter, sử dụng **React Native và Expo** cho giao diện di động, kết hợp với **Node.js, Express.js và MongoDB** cho backend.

Dự án cung cấp các chức năng cơ bản của một nền tảng mạng xã hội, bao gồm đăng bài, chia sẻ hình ảnh, tương tác với bài viết, thông báo, nhắn tin và quản lý hồ sơ cá nhân. Hệ thống tích hợp Clerk để xác thực người dùng, Cloudinary để lưu trữ hình ảnh và Arcjet để tăng cường bảo mật.

## 🎯 Mục tiêu dự án

- Xây dựng ứng dụng di động full-stack với React Native.
- Tái sử dụng kiến thức React để phát triển ứng dụng trên Android và iOS.
- Xây dựng REST API bằng Express.js và MongoDB.
- Tích hợp xác thực người dùng và các dịch vụ bên thứ ba.
- Thực hành quy trình quản lý mã nguồn bằng Git và GitHub.
- Tìm hiểu cách cấu hình và triển khai frontend, backend trong môi trường thực tế.

## ✨ Các chức năng chính

- 🔐 **Xác thực người dùng:** Đăng nhập và quản lý phiên bằng Clerk, hỗ trợ các phương thức đăng nhập được cấu hình như Google và Apple.
- 🏠 **Bảng tin:** Đăng bài viết dạng văn bản và hình ảnh từ thư viện hoặc camera.
- ❤️ **Tương tác bài viết:** Thích và bình luận bài viết thông qua giao diện tương tác.
- 🔔 **Thông báo:** Nhận thông báo khi có người thích hoặc bình luận bài viết.
- 💬 **Tin nhắn:** Xem lịch sử tin nhắn và hỗ trợ xóa tin nhắn bằng thao tác nhấn giữ.
- 👤 **Hồ sơ cá nhân:** Xem và chỉnh sửa thông tin cá nhân.
- 🔎 **Tìm kiếm:** Khám phá nội dung và các bài viết nổi bật.
- 🚪 **Đăng xuất:** Kết thúc phiên đăng nhập và quay lại màn hình đăng nhập.
- ⚡ **Nhắn tin thời gian thực:** Gửi và nhận tin nhắn tức thì bằng Socket.IO.

## 🛠️ Công nghệ sử dụng

| Công nghệ    | Vai trò                                       |
| ------------ | --------------------------------------------- |
| React Native | Xây dựng giao diện ứng dụng di động           |
| Expo         | Phát triển và chạy ứng dụng trên Android, iOS |
| Node.js      | Môi trường chạy backend                       |
| Express.js   | Xây dựng REST API                             |
| MongoDB      | Lưu trữ dữ liệu ứng dụng                      |
| Clerk        | Xác thực và quản lý người dùng                |
| Cloudinary   | Lưu trữ và phân phối hình ảnh                 |
| Arcjet       | Hỗ trợ giới hạn yêu cầu và bảo vệ API         |
| Git & GitHub | Quản lý mã nguồn và cộng tác phát triển       |

## 📋 Yêu cầu môi trường

Trước khi chạy dự án, hãy chuẩn bị:

- Node.js và npm.
- Git.
- Tài khoản MongoDB hoặc MongoDB Atlas.
- Tài khoản Cloudinary để lưu trữ hình ảnh.
- Tài khoản Arcjet để cấu hình các tính năng bảo mật.
- Expo Go trên điện thoại hoặc trình giả lập Android/iOS phù hợp.

## ⚙️ Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5001
NODE_ENV=development

JWT_SECRET=<your secretkey>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

MONGO_URI=<your_mongodb_connection_uri>

ARCJET_ENV=development
ARCJET_KEY=<your_arcjet_api_key>

CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

Tạo file `.env` trong thư mục `mobile`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>

EXPO_PUBLIC_API_URL=<your_backend_api_url>
```

**Lưu ý:**

- Thay các giá trị mẫu bằng thông tin cấu hình thực tế của bạn.
- Với Android Emulator, địa chỉ backend thường là `http://10.0.2.2:5001`; với iOS Simulator có thể sử dụng `http://localhost:5001`.
- Khi chạy trên điện thoại thật, hãy sử dụng địa chỉ IP nội bộ của máy tính đang chạy backend, hoặc URL backend đã triển khai.
- Không đưa các khóa bí mật như `SECRET_KEY`, `ARCJET_KEY` và thông tin xác thực Cloudinary lên GitHub.
- Các biến bắt đầu bằng `EXPO_PUBLIC_` có thể được đưa vào ứng dụng phía client, vì vậy không được đặt secret key trong những biến này.

## 🚀 Cài đặt và chạy dự án

### 1. Tải mã nguồn

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Khởi chạy backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5001
```

Đảm bảo MongoDB và các dịch vụ cần thiết đã được cấu hình trước khi chạy.

### 3. Khởi chạy ứng dụng di động

Mở terminal mới tại thư mục gốc dự án:

```bash
cd mobile
npm install
npx expo start
```

Sau đó, quét mã QR bằng Expo Go hoặc chạy ứng dụng trên trình giả lập phù hợp.

## 📂 Cấu trúc dự án

```text
X-Clone/
├── backend/          # Express.js REST API
│   ├── controllers/  # Xử lý nghiệp vụ
│   ├── models/       # Các mô hình dữ liệu MongoDB
│   ├── routes/       # Định nghĩa API endpoints
│   ├── middleware/   # Middleware xác thực và bảo mật
│   └── ...
│
├── mobile/           # Ứng dụng React Native + Expo
│   ├── app/          # Màn hình và điều hướng (nếu sử dụng Expo Router)
│   ├── components/   # Các thành phần giao diện
│   ├── hooks/        # Custom hooks
│   └── ...
│
└── README.md
```

_Lưu ý: Cấu trúc trên mang tính minh họa. Tên thư mục thực tế có thể khác tùy theo mã nguồn dự án._

## 🔒 Bảo mật

- Sử dụng JWT để xác thực người dùng.
- Sử dụng Arcjet để hỗ trợ phát hiện bot và giới hạn yêu cầu theo cấu hình.
- Quản lý thông tin nhạy cảm bằng biến môi trường.
- Không công khai các khóa API hoặc thông tin kết nối cơ sở dữ liệu.
- Kiểm tra quyền truy cập ở backend trước khi cho phép người dùng thao tác với dữ liệu.
