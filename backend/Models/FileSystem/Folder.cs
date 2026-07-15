namespace StudentDrive.Api.Models.FileSystem;

public class Folder
{
    public long id { get; set; }
    public long? parent_folder_id { get; set; }
    public long owner_user_id { get; set; }
    public string name { get; set; } = default!;
    public DateTime created_at { get; set; }

    public bool is_deleted { get; set; }
    public DateTime? deleted_at_utc { get; set; }

    public Folder? ParentFolder { get; set; }
    public ICollection<Folder> Children { get; set; } = new List<Folder>();
    public ICollection<FileEntity> Files { get; set; } = new List<FileEntity>();
    public User OwnerUser { get; set; }




}
