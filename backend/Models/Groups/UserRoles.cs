namespace StudentDrive.Api.Models;

public class UserRole
{
    public long user_id { get; set; }
    public short role_id { get; set; }

    public User User { get; set; } = null!;
    public Role Role { get; set; } = null!;
}