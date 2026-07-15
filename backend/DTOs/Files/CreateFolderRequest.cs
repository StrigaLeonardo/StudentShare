namespace StudentDrive.Api.Dtos.Files;

public class CreateFolderRequest
{
    public string Name { get; set; } = "";
    public long? ParentFolderId { get; set; }
}
