namespace StudentDrive.Api.Models;

public class Role
{
    public short id { get; set; }
    public string name { get; set; } = string.Empty;

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}