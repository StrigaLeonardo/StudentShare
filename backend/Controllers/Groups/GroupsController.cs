using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentDrive.Api.Data;
using StudentDrive.Api.DTOs;
using StudentDrive.Api.Models;

namespace StudentDrive.Api.Controllers.Groups;

[ApiController]
[Route("api/[controller]")]
public class GroupsController : ControllerBase
{
    private readonly AppDbContext _context;

    public GroupsController(AppDbContext context)
    {
        _context = context;
    }

    private bool TryGetUserId(out long userId)
    {
        var idClaim =
            User.FindFirst(JwtRegisteredClaimNames.Sub) ??
            User.FindFirst(ClaimTypes.NameIdentifier) ??
            User.FindFirst("sub");

        var rawId = idClaim?.Value;
        return long.TryParse(rawId, out userId);
    }

    // GET /api/groups -> dohvat grupa za prijavljenog korisnika + permissioni za ekran grupa
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<object>> GetGroups()
    {
        if (!TryGetUserId(out var userId))
            return BadRequest("Invalid user id in token.");

        var roleNames = await _context.UserRoles
            .Where(ur => ur.user_id == userId)
            .Select(ur => ur.Role.name)
            .ToListAsync();

        var isStudent = roleNames.Any(r => r.Equals("student", StringComparison.OrdinalIgnoreCase));
        var isProfessor = roleNames.Any(r => r.Equals("teacher", StringComparison.OrdinalIgnoreCase));

        if (!isStudent && !isProfessor)
        {
            return Ok(new
            {
                items = new List<object>(),
                canCreateGroup = false
            });
        }

        var query = _context.Groups.AsQueryable();

        query = query.Where(g =>
            (isProfessor && g.created_by == userId) ||
            (isStudent && g.UserGroups.Any(ug => ug.user_id == userId))
        );

        var groups = await query
            .Select(g => new
            {
                id = g.id,
                name = g.name,
                description = g.description,
                created_by = g.created_by,
                created_at = g.created_at,
                icon_key = g.icon_key,
                studentsCount = g.UserGroups.Count(ug => ug.role_in_group == "student")
            })
            .ToListAsync();

        return Ok(new
        {
            items = groups,
            canCreateGroup = isProfessor
        });
    }

    // POST /api/groups -> kreiranje nove grupe (samo teacher)
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<object>> CreateGroup([FromBody] CreateGroupRequest request)
    {
        if (!TryGetUserId(out var userId))
            return BadRequest("Invalid user id in token.");

        var roleNames = await _context.UserRoles
            .Where(ur => ur.user_id == userId)
            .Select(ur => ur.Role.name)
            .ToListAsync();

        var isProfessor = roleNames.Any(r => r.Equals("teacher", StringComparison.OrdinalIgnoreCase));

        if (!isProfessor)
            return Forbid();

        var group = new Group
        {
            name = request.Name.Trim(),
            description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            icon_key = string.IsNullOrWhiteSpace(request.Icon_Key)
                ? "school"
                : request.Icon_Key.Trim(),
            created_by = userId,
            created_at = DateTime.UtcNow
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = group.id,
            name = group.name,
            description = group.description,
            created_by = group.created_by,
            created_at = group.created_at,
            icon_key = group.icon_key,
            studentsCount = 0
        });
    }
}