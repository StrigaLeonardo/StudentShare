namespace StudentDrive.Api.Models;

public class Group
{
    public long id { get; set; }
    public string name { get; set; } = string.Empty;
    public string? description { get; set; }
    public long created_by { get; set; }
    public DateTime created_at { get; set; }
    public string? icon_key { get; set; }

    public ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();
}