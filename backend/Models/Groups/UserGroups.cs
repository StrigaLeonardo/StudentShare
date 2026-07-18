namespace StudentDrive.Api.Models;

public class UserGroup
{
    public long user_id { get; set; }
    public long group_id { get; set; }
    public string role_in_group { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Group Group { get; set; } = null!;
}