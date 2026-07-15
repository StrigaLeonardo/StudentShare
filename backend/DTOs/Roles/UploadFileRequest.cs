using Microsoft.AspNetCore.Http;

namespace StudentDrive.Api.Dtos.Files;

public class UploadFileRequest
{
    public long? folderId { get; set; }  // target folder; null = root
    public IFormFile file { get; set; } = null!;
}
