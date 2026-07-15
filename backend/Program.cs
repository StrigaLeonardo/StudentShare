using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using StudentDrive.Api.Data;
using StudentDrive.Api.Options;

var builder = WebApplication.CreateBuilder(args);

var storageRoot = builder.Configuration["Storage:RootPath"]
                  ?? "/home/leonardo/Server/StudentDriveStorage";

builder.Services.Configure<StorageOptions>(options =>
{
    options.RootPath = storageRoot;
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

var allowedOrigin = builder.Configuration["Frontend:Url"] ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy.WithOrigins(allowedOrigin) 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("Content-Range", "Content-Length", "Accept-Ranges");
    });
});

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("JWT Key is not configured!");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "studentdrive";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

if (keyBytes.Length < 32)
{
    throw new InvalidOperationException("JWT Key must be at least 32 characters long!");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtIssuer, 
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ClockSkew = TimeSpan.FromMinutes(5) 
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendCors");  
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
