using Microsoft.AspNetCore.Mvc;
using Npgsql;
using BCrypt.Net;
using StudentDrive.Api.DTOs.Auth;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;


namespace StudentDrive.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and password are required.");

        var cs = _config.GetConnectionString("DefaultConnection")!;
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();

        const string checkSql = "SELECT 1 FROM users WHERE email = @email LIMIT 1;";
        await using (var checkCmd = new NpgsqlCommand(checkSql, conn))
        {
            checkCmd.Parameters.AddWithValue("email", req.Email);
            var exists = await checkCmd.ExecuteScalarAsync();
            if (exists != null)
                return Conflict("User with this email already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        const string insertSql = @"
            INSERT INTO users (email, password_hash, full_name, created_at)
            VALUES (@email, @password_hash, @full_name, NOW())
            RETURNING id, email, full_name;
        ";

        await using var cmd = new NpgsqlCommand(insertSql, conn);
        cmd.Parameters.AddWithValue("email", req.Email);
        cmd.Parameters.AddWithValue("password_hash", passwordHash);
        cmd.Parameters.AddWithValue("full_name", req.FullName ?? string.Empty);

        await using var reader = await cmd.ExecuteReaderAsync();
        await reader.ReadAsync();

        var user = new
        {
            Id = reader.GetInt64(0),
            Email = reader.GetString(1),
            FullName = reader.GetString(2)
        };

        return Ok(user);
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and password are required.");

        var cs = _config.GetConnectionString("DefaultConnection")!;
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();

        const string sql = @"
        SELECT id, email, password_hash, full_name
        FROM users
        WHERE email = @email
        LIMIT 1;
    ";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("email", request.Email);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return Unauthorized("Invalid credentials.");

        var userId = reader.GetInt64(0);
        var email = reader.GetString(1);
        var passwordHash = reader.GetString(2);
        var fullName = reader.GetString(3);

        var validPassword = BCrypt.Net.BCrypt.Verify(request.Password, passwordHash);
        if (!validPassword)
            return Unauthorized("Invalid credentials.");

        var jwtKey = _config["Jwt:Key"] ?? "very_secret_dev_key_change_later";
        var jwtIssuer = _config["Jwt:Issuer"] ?? "studentdrive";
        var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

        var claims = new[]
        {
        new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, email),
        new Claim("fullName", fullName ?? string.Empty)
    };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            Issuer = jwtIssuer,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(keyBytes),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        return Ok(new LoginResponse
        {
            Token = jwt,
            FullName = fullName  
        });

    }
}
