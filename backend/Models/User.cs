using StudentDrive.Api.Models.FileSystem;
using System.Collections.Generic;

namespace StudentDrive.Api.Models;

public class User
{
    public long Id { get; set; }
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public DateTime CreatedAt { get; set; }

    public ICollection<Folder> Folders { get; set; } = new List<Folder>();
    public ICollection<FileEntity> Files { get; set; } = new List<FileEntity>();

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
}
