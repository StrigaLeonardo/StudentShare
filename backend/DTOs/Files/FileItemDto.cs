namespace StudentDrive.Api.Dtos.Files;

public class FileItemDto
{
    public string Type { get; set; } = "";  // "folder" ili "file"
    public long id { get; set; }
    public string name { get; set; } = "";
    public long? parent_folder_id { get; set; }
    public long? size_bytes { get; set; }
    public string? mime_type { get; set; }
    public DateTime created_at { get; set; }
    public DateTime? deleted_at_utc { get; set; }

    public long owner_user_id { get; set; }

}
