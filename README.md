# LumenTreeInfo
<div align="right">
  <a href="README.md">English</a> | <a href="README.vi.md">Tiếng Việt</a>
</div>

A comprehensive web application for monitoring and visualizing energy data from Lumentree solar power systems. This project provides an intuitive interface to track solar production, battery usage, power consumption, and grid interactions in real-time.

![LumenTreeInfo Dashboard](https://github.com/nsknet/lumentree-dashboard/blob/main/screenshots/screenshot1.png?raw=true)

## Features

- **Real-time monitoring** of solar energy systems via MQTT protocol
- **Historical data visualization** with interactive charts for:
  - PV (Photovoltaic) energy production
  - Battery charging and discharging
  - Home power consumption
  - Grid interaction (import/export)
  - Essential load consumption
- **Device information** display with status indicators
- **Date navigation** to review historical data
- **Responsive design** optimized for desktop and mobile devices
- **SignalR** integration for live data updates without page refresh

## Technology Stack

- **Backend**: ASP.NET Core 8.0
- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Charts**: Chart.js for data visualization
- **API Integration**: 
  - RestSharp for Lumentree cloud API communication
  - MQTTnet for direct MQTT communication with devices
- **Real-time Updates**: SignalR for pushing live data to clients
- **Logging**: Serilog for comprehensive application logging

## MQTT Data Collection

The application connects to Lumentree solar inverters via MQTT to obtain real-time data. Below are the key metrics collected:

### Device Information
- Device ID and type
- Firmware version
- Controller version
- Device temperature
- Working mode
- Online status

### PV (Solar) Production
- PV1 and PV2 voltage (V)
- PV1 and PV2 power (W)
- Total PV power production

![PV](https://github.com/nsknet/lumentree-dashboard/blob/main/screenshots/screenshot2.png?raw=true)

### Battery Metrics
- Battery voltage (V)
- Battery charge percentage (%)
- Battery power flow (W) - charging/discharging status
- Battery current (A)
- Individual cell voltages (for supported devices)

![Battery Metrics](https://github.com/nsknet/lumentree-dashboard/blob/main/screenshots/screenshot3.png?raw=true)

### AC Output/Input
- AC output voltage (V)
- AC output frequency (Hz)
- AC output power (W)
- AC input voltage (V)
- AC input frequency (Hz)
- Grid power flow (W) - import/export status

### Consumption Data
- Home load consumption (W)
- Essential load consumption (W)

### Energy Flow Analysis
- Self-consumption ratio (%)
- Energy flow visualization between PV, battery, grid, and home

## Getting Started

### Prerequisites

- **.NET 8.0 SDK** or later
- **Visual Studio 2022** or **Visual Studio Code**
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/nsknet/lumentree-dashboard.git
   cd lumentree-dashboard
   ```

2. **Restore dependencies**
   ```
   dotnet restore
   ```

3. **Build the project**
   ```
   dotnet build
   ```

4. **Configure application settings**
   
   Edit `LumenTreeInfo.API/appsettings.json` to set:
   - Default User ID (used for MQTT authentication)
   - Any other configuration parameters

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

### Running the Application

#### Web Application

1. **Run the web application**
   ```
   dotnet run --project LumenTreeInfo.API
   ```

2. **Access the application at**:
   - https://localhost:7077 (with HTTPS)
   - http://localhost:5165 (with HTTP)

3. **Enter your device ID** in the search field, select a date, and click "Xem" (View) to load data

#### Command Line Utility

For testing or direct console monitoring:

```
dotnet run --project LumenTreeInfo.Cmd
```

The command line utility will start monitoring the configured device(s) and output data to the console.

### Building for Production

```
dotnet publish LumenTreeInfo.API -c Release -o ./publish
```

This will create a production-ready build in the `./publish` directory.

## Project Structure

- **LumenTreeInfo.API**: Web application with controllers, views, and API endpoints
- **LumenTreeInfo.Lib**: Core library with MQTT client, API clients, and data models
- **LumenTreeInfo.Cmd**: Command-line utility for direct device monitoring

## Monitoring Multiple Devices

The application supports monitoring multiple devices simultaneously. Devices can be added:

1. Through the web interface by entering different device IDs
2. By configuring default devices in the code:

```csharp
// In Program.cs or during service configuration
monitor.AddDevice("P123456789");
monitor.AddDevice("H987654321");
```

## Development Notes

- The application is designed to be responsive across various device sizes
- Real-time updates occur via SignalR whenever new data is received over MQTT
- Historical data is fetched from the Lumentree cloud API
- The application caches API responses to minimize requests
- Debug logging can be enabled by adjusting log levels in appsettings.json

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **Cannot connect to MQTT broker**
   - Verify internet connectivity
   - Check that the MQTT credentials are correct
   - Ensure the device ID is valid

2. **No data appearing in charts**
   - Verify the date selected has available data
   - Check console for any API or parsing errors
   - Ensure the device was online during the selected date

3. **SignalR connection failing**
   - Check for browser console errors
   - Verify that WebSockets are not blocked by network policies

### Logging

The application uses Serilog for comprehensive logging. Logs are written to:
- Console output
- Rolling log files in the `logs` directory

To increase log verbosity, adjust the minimum level in `appsettings.json`:

```json
"Serilog": {
  "MinimumLevel": {
    "Default": "Debug",
    "Override": {
      "Microsoft": "Warning"
    }
  }
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MQTTnet library for MQTT communication
- Chart.js for data visualization
- Tailwind CSS for responsive design
- RestSharp for simplified API requests
- The Lumentree API for providing solar system data