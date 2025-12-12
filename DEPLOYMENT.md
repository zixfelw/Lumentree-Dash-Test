# LumenTree Dashboard - Deployment Guide

## 🎉 Deployment Status: SUCCESS

Your LumenTree Dashboard has been successfully deployed!

## 🌐 Live URLs

- **Test URL**: https://8080-irj4ublym7ufpvykgbe03-5c13a017.sandbox.novita.ai
- **GitHub Repository**: https://github.com/zixfelw/Lumentree-Dash-Test

## 📦 What's Included

The deployment includes:
- ✅ Complete ASP.NET Core 8.0 application
- ✅ Docker support with Dockerfile and docker-compose.yml
- ✅ All source code and assets
- ✅ Ready for production deployment

## 🚀 Deployment Options

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/zixfelw/Lumentree-Dash-Test.git
cd Lumentree-Dash-Test

# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:8080
```

### Option 2: Using .NET SDK

```bash
# Prerequisites: Install .NET 8.0 SDK
# Download from: https://dotnet.microsoft.com/download/dotnet/8.0

# Clone and run
git clone https://github.com/zixfelw/Lumentree-Dash-Test.git
cd Lumentree-Dash-Test

# Restore dependencies
dotnet restore

# Build the project
dotnet build LumenTreeInfo.API -c Release

# Run the application
dotnet run --project LumenTreeInfo.API --urls "http://0.0.0.0:8080"

# Access at http://localhost:8080
```

### Option 3: Production Deployment Platforms

#### Azure App Service
1. Create an Azure App Service (Web App)
2. Configure for .NET 8.0
3. Deploy using:
   - Azure DevOps Pipeline
   - GitHub Actions
   - Direct publish from Visual Studio

#### AWS Elastic Beanstalk
1. Create .NET Core environment
2. Deploy using EB CLI or AWS Console
3. Configure environment for .NET 8.0

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Select Dockerfile deployment
3. Platform auto-detects and deploys

#### Heroku
1. Add Heroku remote
2. Deploy using Docker:
   ```bash
   heroku container:push web -a your-app-name
   heroku container:release web -a your-app-name
   ```

## 📝 Configuration

Edit `LumenTreeInfo.API/appsettings.json` to configure:

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

## 🔧 Environment Variables

Set these environment variables for production:

```bash
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
```

## 📊 Features

- Real-time monitoring of solar energy systems via MQTT
- Historical data visualization with interactive charts
- Device information display with status indicators
- Date navigation to review historical data
- Responsive design for desktop and mobile
- SignalR integration for live updates

## 🛠️ Technologies

- **Backend**: ASP.NET Core 8.0
- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Charts**: Chart.js
- **Real-time**: SignalR
- **Communication**: MQTT, RestSharp
- **Logging**: Serilog

## 📖 Usage

1. Open the application URL
2. Enter your Lumentree device ID
3. Select a date to view historical data
4. Monitor real-time solar production, battery status, and energy consumption

## 🐛 Troubleshooting

### Cannot connect to MQTT broker
- Verify internet connectivity
- Check MQTT credentials
- Ensure device ID is valid

### No data in charts
- Verify selected date has available data
- Check browser console for errors
- Ensure device was online during selected period

### SignalR connection failing
- Check for WebSocket blocking
- Verify network policies allow WebSocket connections

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/zixfelw/Lumentree-Dash-Test/issues
- Original Project: https://github.com/nsknet/lumentree-dashboard

---

**Deployed on**: 2025-12-12  
**Platform**: Sandbox Environment  
**Status**: ✅ Active
