# 🎉 LumenTree Dashboard - Triển Khai Thành Công!

## ✅ Trạng Thái Triển Khai

Ứng dụng **LumenTree Dashboard** đã được triển khai thành công!

---

## 🌐 URLs Quan Trọng

### 🔗 URL Test Trực Tiếp
```
https://8080-irj4ublym7ufpvykgbe03-5c13a017.sandbox.novita.ai
```
👆 **Click vào đây để test ứng dụng ngay!**

### 📦 GitHub Repository
```
https://github.com/zixfelw/Lumentree-Dash-Test
```

---

## 📋 Tổng Quan Dự Án

**LumenTree Dashboard** là một ứng dụng web toàn diện để giám sát và trực quan hóa dữ liệu năng lượng từ hệ thống điện mặt trời Lumentree.

### 🌟 Tính Năng Chính

- ⚡ **Giám sát thời gian thực** qua giao thức MQTT
- 📊 **Biểu đồ tương tác** cho dữ liệu lịch sử:
  - Sản xuất năng lượng PV (Quang điện)
  - Sạc/xả pin
  - Tiêu thụ điện gia đình
  - Tương tác lưới điện (nhập/xuất)
  - Tiêu thụ tải thiết yếu
- 🖥️ **Hiển thị thông tin thiết bị** với chỉ báo trạng thái
- 📅 **Điều hướng ngày** để xem dữ liệu lịch sử
- 📱 **Thiết kế responsive** tối ưu cho desktop và mobile
- 🔄 **SignalR** tích hợp cập nhật dữ liệu trực tiếp

---

## 🛠️ Công Nghệ Sử Dụng

| Loại | Công Nghệ |
|------|-----------|
| **Backend** | ASP.NET Core 8.0 |
| **Frontend** | HTML, JavaScript, Tailwind CSS |
| **Biểu đồ** | Chart.js |
| **Real-time** | SignalR |
| **API** | RestSharp, MQTTnet |
| **Logging** | Serilog |

---

## 🚀 Hướng Dẫn Sử Dụng

1. **Truy cập URL**: Mở link test bên trên
2. **Nhập Device ID**: Nhập ID thiết bị Lumentree của bạn
3. **Chọn Ngày**: Chọn ngày để xem dữ liệu lịch sử
4. **Giám Sát**: Xem sản xuất solar, trạng thái pin và tiêu thụ năng lượng

---

## 📦 Triển Khai Trên Các Platform Khác

### Option 1: Sử dụng Docker 🐳

```bash
# Clone repository
git clone https://github.com/zixfelw/Lumentree-Dash-Test.git
cd Lumentree-Dash-Test

# Build và chạy với Docker Compose
docker-compose up -d

# Truy cập tại http://localhost:8080
```

### Option 2: Sử dụng .NET SDK 💻

```bash
# Cài đặt .NET 8.0 SDK
# Tải từ: https://dotnet.microsoft.com/download/dotnet/8.0

# Clone và chạy
git clone https://github.com/zixfelw/Lumentree-Dash-Test.git
cd Lumentree-Dash-Test

# Restore dependencies
dotnet restore

# Build project
dotnet build LumenTreeInfo.API -c Release

# Chạy ứng dụng
dotnet run --project LumenTreeInfo.API --urls "http://0.0.0.0:8080"
```

### Option 3: Triển Khai Production ☁️

#### Azure App Service
- Tạo Azure App Service (Web App)
- Cấu hình cho .NET 8.0
- Deploy bằng Azure DevOps hoặc GitHub Actions

#### AWS Elastic Beanstalk
- Tạo môi trường .NET Core
- Deploy bằng EB CLI hoặc AWS Console

#### DigitalOcean App Platform
- Kết nối GitHub repository
- Chọn Dockerfile deployment

#### Heroku
```bash
heroku container:push web -a your-app-name
heroku container:release web -a your-app-name
```

---

## ⚙️ Cấu Hình

Chỉnh sửa `LumenTreeInfo.API/appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "SolarMonitor": {
    "UserId": "YOUR_USER_ID"
  },
  "AllowedHosts": "*"
}
```

---

## 🐛 Xử Lý Sự Cố

### Không thể kết nối MQTT broker
- Kiểm tra kết nối internet
- Xác minh thông tin đăng nhập MQTT
- Đảm bảo Device ID hợp lệ

### Không có dữ liệu trong biểu đồ
- Kiểm tra ngày được chọn có dữ liệu
- Xem console trình duyệt để tìm lỗi
- Đảm bảo thiết bị online trong thời gian được chọn

### Kết nối SignalR thất bại
- Kiểm tra lỗi trong browser console
- Xác minh WebSocket không bị chặn

---

## 📊 Cấu Trúc Dự Án

```
Lumentree-Dash-Test/
├── LumenTreeInfo.API/          # Web application
│   ├── Controllers/            # API controllers
│   ├── Views/                  # Razor views
│   ├── wwwroot/               # Static files
│   └── Program.cs             # Entry point
├── LumenTreeInfo.Lib/         # Core library
│   ├── Models/                # Data models
│   ├── LumentreeClient.cs     # API client
│   └── SolarInverterMonitor.cs # MQTT monitor
├── LumenTreeInfo.Cmd/         # CLI utility
├── Dockerfile                 # Docker configuration
├── docker-compose.yml        # Docker Compose
└── README.md                 # Documentation
```

---

## 📄 Thông Tin Triển Khai

| Thông Tin | Chi Tiết |
|-----------|----------|
| **Ngày Triển Khai** | 12-12-2025 |
| **Platform** | Sandbox Environment |
| **Port** | 8080 |
| **Status** | ✅ Active & Running |
| **Framework** | .NET 8.0 |
| **Server** | Kestrel |

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Commit thay đổi
4. Push lên branch
5. Mở Pull Request

---

## 📞 Hỗ Trợ

- **GitHub Issues**: https://github.com/zixfelw/Lumentree-Dash-Test/issues
- **Dự Án Gốc**: https://github.com/nsknet/lumentree-dashboard

---

## 📜 License

MIT License - Xem file LICENSE để biết chi tiết

---

## 🎯 Next Steps

1. ✅ Code đã được push lên GitHub
2. ✅ Ứng dụng đang chạy và có thể test
3. ✅ Documentation đã được tạo
4. 🔄 Có thể deploy lên các cloud platform production
5. 🔄 Có thể customize theo nhu cầu riêng

---

**Chúc bạn sử dụng ứng dụng thành công! 🎉**
