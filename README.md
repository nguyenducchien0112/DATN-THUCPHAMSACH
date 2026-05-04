# DATN - THỰC PHẨM SẠCH (Clean Food Project)

Hệ thống quản lý và kinh doanh thực phẩm sạch.

## Tech Stack

- **Frontend**: ReactJS (Vite), Tailwind CSS, Framer Motion, Axios, Zustand.
- **Backend**: Spring Boot 3.2.4, Spring Security (JWT), Spring Data JPA.
- **Database**: MySQL 8.0.
## Hướng dẫn chạy nhanh

### 1. Chuẩn bị Database
- Cài đặt MySQL Server trên máy cục bộ.
- Tạo một database mới có tên: `cleanfood_db`.
- Cấu hình lại `username` và `password` của bạn trong tệp [application.properties](file:///d:/All-Project/DATN-THUCPHAMSACH/cleanfood-server/src/main/resources/application.properties).

### 2. Chạy Backend
```bash
cd cleanfood-server
mvn spring-boot:run
```

### 3. Chạy Frontend
```bash
cd cleanfood-client
npm install
npm run dev
```

