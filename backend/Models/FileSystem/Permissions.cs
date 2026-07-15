namespace StudentDrive.Api.Models.FileSystem;

public class Permission
{
    public long id { get; set; }
    public string item_type { get; set; } = default!;      // 'file' | 'folder'
    public long item_id { get; set; }
    public string principal_type { get; set; } = default!; // 'user' | 'group' | 'team'
    public long principal_id { get; set; }
    public string access_level { get; set; } = default!;   // 'view' | 'edit' | 'owner'
    public long shared_by { get; set; }
    public DateTime created_at { get; set; }
}
