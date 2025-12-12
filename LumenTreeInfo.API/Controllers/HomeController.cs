using System.Diagnostics;
using LumenTreeInfo.API.Models;
using LumenTreeInfo.Lib;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace LumenTreeInfo.API.Controllers;

/// <summary>
/// Controller for handling home page and device data requests
/// </summary>
public class HomeController : Controller
{
    private readonly LumentreeClient _client;

    /// <summary>
    /// Initializes a new instance of the HomeController
    /// </summary>
    /// <param name="client">Lumentree API client</param>
    public HomeController(LumentreeClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Returns the home page view
    /// </summary>
    [Route("/")]
    public IActionResult Index()
    {
        Log.Information("Rendering home page");
        return View();
    }

    /// <summary>
    /// Gets and returns device information and energy data
    /// </summary>
    /// <param name="deviceId">The device ID to get information for</param>
    /// <param name="date">Optional date parameter (defaults to current date)</param>
    [Route("/device/{deviceId}")]
    public async Task<IActionResult> GetDeviceInfo(string deviceId, string? date)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            Log.Warning("Device ID is null or empty");
            return BadRequest("Device ID is required");
        }

        Log.Information("Getting device info for device {DeviceId} with date {Date}", deviceId, date);

        try
        {
            // Parse the date or use current date if not provided
            var queryDate = DateTime.Now;
            if (!string.IsNullOrEmpty(date))
            {
                // Parse date from format "yyyy-MM-dd"
                if (DateTime.TryParse(date, out var parsedDate))
                {
                    queryDate = parsedDate;
                    Log.Debug("Using parsed date: {QueryDate:yyyy-MM-dd}", queryDate);
                }
                else
                {
                    Log.Warning("Failed to parse date: {Date}, using current date instead", date);
                }
            }

            // Get all device data using the enhanced client method
            var (deviceInfo, pvData, batData, essentialLoad, grid, load) =
                await _client.GetAllDeviceDataAsync(deviceId, queryDate);

            if (deviceInfo == null)
            {
                Log.Warning("No device info found for device {DeviceId}", deviceId);
                return NotFound($"Device {deviceId} not found or data retrieval failed");
            }

            // Return the data in JSON format
            var result = new
            {
                DeviceInfo = deviceInfo,
                Pv = pvData,
                Bat = batData,
                EssentialLoad = essentialLoad,
                Grid = grid,
                Load = load
            };

            Log.Information("Successfully retrieved and returning data for device {DeviceId}", deviceId);
            return Json(result);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error occurred while getting device data for {DeviceId}", deviceId);
            return StatusCode(500, "An error occurred while processing your request");
        }
    }

    /// <summary>
    /// Returns an error view
    /// </summary>
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        Log.Warning("Error page requested. RequestId: {RequestId}",
            Activity.Current?.Id ?? HttpContext.TraceIdentifier);

        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}