using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using StudentDrive.Api.DTOs.Roles;
using System.IdentityModel.Tokens.Jwt;


namespace StudentDrive.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IConfiguration _config;

    public RolesController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllRoles()
    {
        var cs = _config.GetConnectionString("DefaultConnection")!;
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();

        const string sql = "SELECT id, name FROM roles ORDER BY name;";
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync();

        var roles = new List<object>();
        while (await reader.ReadAsync())
        {
            roles.Add(new
            {
                Id = reader.GetInt16(0),
                Name = reader.GetString(1)
            });
        }

        return Ok(roles);
    }

    // pomoćna metoda za dohvat userId-a iz tokena
    private bool TryGetUserId(out long userId)
    {
        var idClaim =
            User.FindFirst(JwtRegisteredClaimNames.Sub) ??   // "sub"
            User.FindFirst(ClaimTypes.NameIdentifier) ??
            User.FindFirst("sub");

        var rawId = idClaim?.Value;
        return long.TryParse(rawId, out userId);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyRoles()
    {
        if (!TryGetUserId(out var userId))
            return BadRequest("Invalid user id in token.");

        var cs = _config.GetConnectionString("DefaultConnection")!;
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();

        const string sql = @"
            SELECT r.name
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = @userId;
        ";

        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("userId", userId);

        await using var reader = await cmd.ExecuteReaderAsync();
        var roleNames = new List<string>();
        while (await reader.ReadAsync())
        {
            roleNames.Add(reader.GetString(0));
        }

        return Ok(roleNames);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyRoles([FromBody] UpdateRolesRequest request)
    {
        if (!TryGetUserId(out var userId))
            return BadRequest("Invalid user id in token.");

        if (request.Roles == null || request.Roles.Count == 0)
            return BadRequest("At least one role must be provided.");

        var cs = _config.GetConnectionString("DefaultConnection")!;
        await using var conn = new NpgsqlConnection(cs);
        await conn.OpenAsync();

        try
        {
            const string rolesSql = "SELECT id, name FROM roles;";
            var roleMap = new Dictionary<string, short>(StringComparer.OrdinalIgnoreCase);

            await using (var rolesCmd = new NpgsqlCommand(rolesSql, conn))
            await using (var rolesReader = await rolesCmd.ExecuteReaderAsync())
            {
                while (await rolesReader.ReadAsync())
                {
                    roleMap[rolesReader.GetString(1)] = rolesReader.GetInt16(0);
                }
            }

            var targetRoleIds = request.Roles
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Where(r => roleMap.ContainsKey(r))
                .Select(r => roleMap[r])
                .ToList();

            if (targetRoleIds.Count == 0)
                return BadRequest("No valid roles found for given names.");

            const string deleteSql = "DELETE FROM user_roles WHERE user_id = @userId;";
            await using (var delCmd = new NpgsqlCommand(deleteSql, conn))
            {
                delCmd.Parameters.AddWithValue("userId", userId);
                await delCmd.ExecuteNonQueryAsync();
            }

            const string insertSql = "INSERT INTO user_roles (user_id, role_id) VALUES (@userId, @roleId);";
            foreach (var roleId in targetRoleIds)
            {
                await using var insCmd = new NpgsqlCommand(insertSql, conn);
                insCmd.Parameters.AddWithValue("userId", userId);
                insCmd.Parameters.AddWithValue("roleId", roleId);
                await insCmd.ExecuteNonQueryAsync();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error updating roles: {ex.Message}");
        }
    }
}
