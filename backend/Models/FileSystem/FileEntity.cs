namespace StudentDrive.Api.Models.FileSystem;

public class FileEntity
{
    public long id { get; set; }
    public long? folder_id { get; set; }
    public long owner_user_id { get; set; }

    public string original_name { get; set; } = default!;
    public string stored_name { get; set; } = default!;
    public string? mime_type { get; set; }
    public long size_bytes { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? updated_at { get; set; }

    public bool is_deleted { get; set; }
    public DateTime? deleted_at_utc { get; set; }

    public Folder? Folder { get; set; }
    public User OwnerUser { get; set; }


}
