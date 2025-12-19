namespace StudentDrive.Api.Models;

public class User
{
    public long Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
