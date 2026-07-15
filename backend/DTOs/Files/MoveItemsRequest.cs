namespace StudentDrive.Api.Dtos.Files;

public class MoveItemsRequest
{
    public List<MoveItemDto> Items { get; set; } = new();
    public long? TargetFolderId { get; set; }
}

public class MoveItemDto
{
    public string Type { get; set; } = "file"; // "file" ili "folder"
    public long Id { get; set; }
}
