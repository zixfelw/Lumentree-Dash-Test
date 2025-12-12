using LumenTreeInfo.Lib;

using Serilog;
using Serilog.Events;

namespace LumenTreeInfo.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Host.UseSerilog();

        // Configure Serilog
        SetupSerilog(builder.Configuration);

        // Add services to the container.
        builder.Services.AddControllersWithViews();

        // Add Memory Cache
        builder.Services.AddMemoryCache();

        // Add our custom caching service
        builder.Services.AddSingleton<ICacheService, MemoryCacheService>();

        // Add SignalR
        builder.Services.AddSignalR();

        // Add SolarMonitorService as a singleton
        builder.Services.AddSingleton<SolarMonitorService>();
        builder.Services.AddHostedService(provider => provider.GetRequiredService<SolarMonitorService>());

        // Add LumentreeClient as a singleton with caching
        builder.Services.AddSingleton<LumentreeClient>(serviceProvider => {
            var cacheService = serviceProvider.GetRequiredService<ICacheService>();
            return new LumentreeClient(cacheService);
        });

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();

        app.UseRouting();

        app.UseAuthorization();

        // Map SignalR hubs
        app.MapHub<DeviceHub>("/deviceHub");

        app.MapControllerRoute(
            name: "default",
            pattern: "{controller=Home}/{action=Index}/{id?}");

        Log.Information("Application starting up");
        app.Run();
    }

    private static void SetupSerilog(IConfiguration configuration)
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        var logPath = Path.Combine(new DirectoryInfo(currentDirectory)?.Parent?.FullName ?? "", "logs", "log-.log");

        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .MinimumLevel.Information()
            //.MinimumLevel.Override("Microsoft", LogEventLevel.Error)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(logPath, rollingInterval: RollingInterval.Day)
            .CreateLogger();

        Log.Information("Serilog configured with log path: {LogPath}", logPath);
    }
}