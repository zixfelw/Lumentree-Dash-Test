# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY LumenTreeInfo.sln .
COPY LumenTreeInfo.API/LumenTreeInfo.API.csproj LumenTreeInfo.API/
COPY LumenTreeInfo.Lib/LumenTreeInfo.Lib.csproj LumenTreeInfo.Lib/
COPY LumenTreeInfo.Cmd/LumenTreeInfo.Cmd.csproj LumenTreeInfo.Cmd/

# Restore dependencies
RUN dotnet restore LumenTreeInfo.API/LumenTreeInfo.API.csproj

# Copy all source files
COPY . .

# Build the application
WORKDIR /src/LumenTreeInfo.API
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Copy published files
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LumenTreeInfo.API.dll"]
