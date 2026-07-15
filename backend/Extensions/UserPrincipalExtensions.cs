using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace StudentDrive.Api.Extensions;

public static class UserPrincipalExtensions
{
    public static long GetCurrentUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? user.FindFirst("sub")?.Value
                         ?? throw new UnauthorizedAccessException("User ID not found in token.");
        return long.Parse(userIdClaim);
    }
}
