using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StudentDrive.Api.Data;
using StudentDrive.Api.Models.FileSystem;
using StudentDrive.Api.Dtos.Files;
using StudentDrive.Api.Options;
using StudentDrive.Api.Extensions;
using System.IO.Compression;


namespace StudentDrive.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly string _storageRoot;

    public FilesController(AppDbContext db, IOptions<StorageOptions> storageOptions)
    {
        _db = db;
        _storageRoot = storageOptions.Value.RootPath
                       ?? throw new InvalidOperationException("Storage root path is not configured.");
    }

    // POST /api/files  (upload u folder)
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(50_000_000)] // 50 MB
    public async Task<IActionResult> Upload([FromForm] UploadFileRequest request)
    {
        if (request.file == null || request.file.Length == 0)
            return BadRequest("File is empty.");

        var userId = User.GetCurrentUserId();

        // provjeri postoji li folder (ako je zadan)
        Folder? targetFolder = null;
        if (request.folderId.HasValue)
        {
            targetFolder = await _db.Folders
                .FirstOrDefaultAsync(f => f.id == request.folderId.Value && f.owner_user_id == userId);

            if (targetFolder == null)
                return NotFound("Target folder not found.");
        }

        if (!Directory.Exists(_storageRoot))
            Directory.CreateDirectory(_storageRoot);

        var extension = Path.GetExtension(request.file.FileName);
        var storedName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(_storageRoot, storedName);

        await using (var fs = new FileStream(fullPath, FileMode.CreateNew))
        {
            await request.file.CopyToAsync(fs);
        }

        var entity = new FileEntity
        {
            folder_id = request.folderId,
            owner_user_id = userId,
            original_name = request.file.FileName,
            stored_name = storedName,
            mime_type = request.file.ContentType ?? "application/octet-stream",
            size_bytes = request.file.Length,
            created_at = DateTime.UtcNow,
            is_deleted = false,
            deleted_at_utc = null
        };

        _db.Files.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = entity.id,
            name = entity.original_name,
            size = entity.size_bytes,
            mimeType = entity.mime_type,
            folderId = entity.folder_id
        });
    }

    // GET /api/files/{id}  (download sa range support za PDF)
    [HttpGet("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Download(long id)
    {
        var userId = User.GetCurrentUserId();

        var fileEntity = await _db.Files
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId);

        if (fileEntity == null)
            return NotFound();

        var fullPath = Path.Combine(_storageRoot, fileEntity.stored_name);

        if (!System.IO.File.Exists(fullPath))
            return NotFound("File not found on disk.");

        var fileInfo = new FileInfo(fullPath);
        var fileLength = fileInfo.Length;

        Response.Headers.Add("Access-Control-Allow-Origin", Request.Headers["Origin"].ToString());
        Response.Headers.Add("Access-Control-Allow-Credentials", "true");
        Response.Headers.Add("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        Response.Headers.Add("Accept-Ranges", "bytes");

        var rangeHeader = Request.Headers["Range"].ToString();

        if (!string.IsNullOrEmpty(rangeHeader) && rangeHeader.StartsWith("bytes="))
        {
            var range = rangeHeader.Replace("bytes=", "").Split('-');
            var start = long.Parse(range[0]);
            var end = range.Length > 1 && !string.IsNullOrEmpty(range[1])
                ? long.Parse(range[1])
                : fileLength - 1;

            var contentLength = end - start + 1;

            Response.StatusCode = 206;
            Response.Headers.Add("Content-Range", $"bytes {start}-{end}/{fileLength}");
            Response.ContentLength = contentLength;
            Response.ContentType = fileEntity.mime_type ?? "application/octet-stream";

            var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            stream.Seek(start, SeekOrigin.Begin);

            return File(stream, fileEntity.mime_type ?? "application/octet-stream", enableRangeProcessing: true);
        }

        var fullStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(fullStream, fileEntity.mime_type ?? "application/octet-stream", fileEntity.original_name, enableRangeProcessing: true);
    }


    // PUT /api/files/{id}/rename
    [HttpPut("{id:long}/rename")]
    [Authorize]
    public async Task<IActionResult> Rename(long id, [FromBody] RenameFileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewName))
            return BadRequest("NewName is required.");

        var userId = User.GetCurrentUserId();

        var file = await _db.Files
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId
                                      && !f.is_deleted);

        if (file == null)
            return NotFound();

        file.original_name = request.NewName.Trim();
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // PUT /api/files/folders/{id}/rename
    [HttpPut("folders/{id:long}/rename")]
    [Authorize]
    public async Task<IActionResult> RenameFolder(long id, [FromBody] RenameFileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewName))
            return BadRequest("NewName is required.");

        var userId = User.GetCurrentUserId();

        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId
                                      && !f.is_deleted);

        if (folder == null)
            return NotFound();

        folder.name = request.NewName.Trim();
        await _db.SaveChangesAsync();

        return NoContent();
    }


    // DELETE /api/files/{id}  -> premjesti u otpad (soft delete file)
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> SoftDelete(long id)
    {
        var userId = User.GetCurrentUserId();

        var file = await _db.Files
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId
                                      && !f.is_deleted);

        if (file == null)
            return NotFound();

        file.is_deleted = true;
        file.deleted_at_utc = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/files/{id}/restore  -> vrati file iz otpada
    [HttpPost("{id:long}/restore")]
    [Authorize]
    public async Task<IActionResult> Restore(long id)
    {
        var userId = User.GetCurrentUserId();

        var file = await _db.Files
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId
                                      && f.is_deleted);

        if (file == null)
            return NotFound();

        file.is_deleted = false;
        file.deleted_at_utc = null;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/files/{id}/hard  -> trajno brisanje filea
    [HttpDelete("{id:long}/hard")]
    [Authorize]
    public async Task<IActionResult> HardDelete(long id)
    {
        var userId = User.GetCurrentUserId();

        var file = await _db.Files
            .FirstOrDefaultAsync(f => f.id == id
                                      && f.owner_user_id == userId
                                      && f.is_deleted);

        if (file == null)
            return NotFound();

        var fullPath = Path.Combine(_storageRoot, file.stored_name);
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
        }

        _db.Files.Remove(file);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE /api/files/folders/{id} -> soft delete folder (i djecu)
    [HttpDelete("folders/{id:long}")]
    [Authorize]
    public async Task<IActionResult> SoftDeleteFolder(long id)
    {
        var userId = User.GetCurrentUserId();

        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == id &&
                                      f.owner_user_id == userId &&
                                      !f.is_deleted);

        if (folder == null)
            return NotFound();

        var now = DateTime.UtcNow;
        await SoftDeleteFolderRecursive(folder.id, userId, now);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task SoftDeleteFolderRecursive(long folderId, long userId, DateTime nowUtc)
    {
        var folder = await _db.Folders
            .FirstAsync(f => f.id == folderId && f.owner_user_id == userId);

        folder.is_deleted = true;
        folder.deleted_at_utc = nowUtc;

        var files = await _db.Files
            .Where(f => f.owner_user_id == userId &&
                        f.folder_id == folderId &&
                        !f.is_deleted)
            .ToListAsync();

        foreach (var file in files)
        {
            file.is_deleted = true;
            file.deleted_at_utc = nowUtc;
        }

        var childFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId &&
                        f.parent_folder_id == folderId &&
                        !f.is_deleted)
            .ToListAsync();

        foreach (var child in childFolders)
        {
            await SoftDeleteFolderRecursive(child.id, userId, nowUtc);
        }
    }

    // POST /api/files/folders/{id}/restore  -> vrati folder (rekurzivno)
    [HttpPost("folders/{id:long}/restore")]
    [Authorize]
    public async Task<IActionResult> RestoreFolder(long id)
    {
        var userId = User.GetCurrentUserId();

        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == id &&
                                      f.owner_user_id == userId &&
                                      f.is_deleted);

        if (folder == null)
            return NotFound();

        await RestoreFolderRecursive(folder.id, userId);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task RestoreFolderRecursive(long folderId, long userId)
    {
        var folder = await _db.Folders
            .FirstAsync(f => f.id == folderId && f.owner_user_id == userId);

        folder.is_deleted = false;
        folder.deleted_at_utc = null;

        var files = await _db.Files
            .Where(f => f.owner_user_id == userId &&
                        f.folder_id == folderId &&
                        f.is_deleted)
            .ToListAsync();

        foreach (var file in files)
        {
            file.is_deleted = false;
            file.deleted_at_utc = null;
        }

        var childFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId &&
                        f.parent_folder_id == folderId &&
                        f.is_deleted)
            .ToListAsync();

        foreach (var child in childFolders)
        {
            await RestoreFolderRecursive(child.id, userId);
        }
    }

    // DELETE /api/files/folders/{id}/hard -> trajno brisanje foldera (samo već soft-deleted)
    [HttpDelete("folders/{id:long}/hard")]
    [Authorize]
    public async Task<IActionResult> HardDeleteFolder(long id)
    {
        var userId = User.GetCurrentUserId();

        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == id &&
                                      f.owner_user_id == userId &&
                                      f.is_deleted);

        if (folder == null)
            return NotFound();

        await HardDeleteFolderRecursive(folder.id, userId);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task HardDeleteFolderRecursive(long folderId, long userId)
    {
        var files = await _db.Files
            .Where(f => f.owner_user_id == userId &&
                        f.folder_id == folderId &&
                        f.is_deleted)
            .ToListAsync();

        foreach (var file in files)
        {
            var fullPath = Path.Combine(_storageRoot, file.stored_name);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _db.Files.Remove(file);
        }

        var childFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId &&
                        f.parent_folder_id == folderId &&
                        f.is_deleted)
            .ToListAsync();

        foreach (var child in childFolders)
        {
            await HardDeleteFolderRecursive(child.id, userId);
        }

        var folder = await _db.Folders
            .FirstAsync(f => f.id == folderId && f.owner_user_id == userId);

        _db.Folders.Remove(folder);
    }

    // GET /api/files/browse?folderId=123
    [HttpGet("browse")]
    [Authorize]
    public async Task<IActionResult> Browse([FromQuery] long? folderId)
    {
        var userId = User.GetCurrentUserId();

        var foldersQuery = _db.Folders
            .Include(f => f.OwnerUser)  
            .Where(f => f.owner_user_id == userId &&
                        !f.is_deleted &&
                        ((folderId == null && f.parent_folder_id == null) ||
                         (folderId != null && f.parent_folder_id == folderId)));

        var filesQuery = _db.Files
            .Include(f => f.OwnerUser)  
            .Where(f => f.owner_user_id == userId &&
                        !f.is_deleted &&
                        ((folderId == null && f.folder_id == null) ||
                         (folderId != null && f.folder_id == folderId)));

        var folders = await foldersQuery
            .Select(f => new FileItemDto
            {
                Type = "folder",
                id = f.id,
                name = f.name,
                parent_folder_id = f.parent_folder_id,
                size_bytes = null,
                mime_type = null,
                created_at = f.created_at,
                owner_user_id = f.owner_user_id,       
                  
            })
            .ToListAsync();

        var files = await filesQuery
            .Select(f => new FileItemDto
            {
                Type = "file",
                id = f.id,
                name = f.original_name,
                parent_folder_id = f.folder_id,
                size_bytes = f.size_bytes,
                mime_type = f.mime_type,
                created_at = f.created_at,
                owner_user_id = f.owner_user_id,      
                
            })
            .ToListAsync();

        var items = folders.Concat(files)
            .OrderBy(i => i.Type)
            .ThenBy(i => i.name)
            .ToList();

        return Ok(items);
    }


    // POST /api/files/folders  (kreiranje mape)
    [HttpPost("folders")]
    [Authorize]
    public async Task<IActionResult> CreateFolder([FromBody] CreateFolderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required.");

        var userId = User.GetCurrentUserId();

        Folder? parentFolder = null;
        if (request.ParentFolderId.HasValue)
        {
            parentFolder = await _db.Folders
                .FirstOrDefaultAsync(f => f.id == request.ParentFolderId.Value
                                          && f.owner_user_id == userId);
            if (parentFolder == null)
                return NotFound("Parent folder not found.");
        }

        var folder = new Folder
        {
            name = request.Name.Trim(),
            owner_user_id = userId,
            parent_folder_id = request.ParentFolderId,
            created_at = DateTime.UtcNow,
            is_deleted = false,
            deleted_at_utc = null
        };

        _db.Folders.Add(folder);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = folder.id,
            name = folder.name,
            parentFolderId = folder.parent_folder_id,
            createdAt = folder.created_at
        });
    }

    // GET /api/files/folders/{id}/download  (download foldera kao ZIP)
    [HttpGet("folders/{id:long}/download")]
    [Authorize]
    public async Task<IActionResult> DownloadFolder(long id)
    {
        var userId = User.GetCurrentUserId();

        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == id && f.owner_user_id == userId);

        if (folder == null)
            return NotFound("Folder not found.");

        // Kreiraj privremeni ZIP file
        var zipName = $"{folder.name}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";
        var zipPath = Path.Combine(Path.GetTempPath(), zipName);

        try
        {
            using (var zip = ZipFile.Open(zipPath, ZipArchiveMode.Create))
            {
                await AddFolderToZipRecursive(zip, folder.id, userId);
            }

            if (!System.IO.File.Exists(zipPath))  
                return StatusCode(500, "Failed to create ZIP archive.");

            var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(zipPath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }

            // Obriši temp file
            System.IO.File.Delete(zipPath);  

            memoryStream.Position = 0;
            return File(memoryStream, "application/zip", zipName);  //  ControllerBase.File()
        }
        catch (Exception ex)
        {
            // Cleanup na grešku
            if (System.IO.File.Exists(zipPath))  
                System.IO.File.Delete(zipPath);  
            return StatusCode(500, $"ZIP creation failed: {ex.Message}");
        }
    }

    private async Task AddFolderToZipRecursive(ZipArchive zip, long folderId, long userId)
    {
        // Direct files u folderu
        var directFiles = await _db.Files
            .Where(f => f.owner_user_id == userId &&
                       !f.is_deleted &&
                       f.folder_id == folderId)
            .ToListAsync();

        foreach (var file in directFiles)
        {
            var fullPath = Path.Combine(_storageRoot, file.stored_name);
            if (System.IO.File.Exists(fullPath))  
            {
                var entryName = GetRelativePathForZip(file, folderId);
                zip.CreateEntryFromFile(fullPath, entryName, CompressionLevel.Optimal);
            }
        }

        // Rekurzivno subfoldere
        var subFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId &&
                       !f.is_deleted &&
                       f.parent_folder_id == folderId)
            .ToListAsync();

        foreach (var subFolder in subFolders)
        {
            await AddFolderToZipRecursive(zip, subFolder.id, userId);
        }
    }

    private string GetRelativePathForZip(FileEntity file, long rootFolderId)
    {
        var pathParts = new List<string> { file.original_name };

        // Idi gore do root foldera
        long? currentFolderId = file.folder_id;
        while (currentFolderId.HasValue && currentFolderId.Value != rootFolderId)
        {
            var folder = _db.Folders.FirstOrDefault(f => f.id == currentFolderId.Value);
            if (folder != null)
            {
                pathParts.Insert(0, folder.name);
                currentFolderId = folder.parent_folder_id;
            }
            else
                break;
        }

        return string.Join("/", pathParts);
    }



    // GET /api/files/trash  -> sadržaj otpada (fileovi + folderi)
    [HttpGet("trash")]
    [Authorize]
    public async Task<IActionResult> GetTrash()
    {
        var userId = User.GetCurrentUserId();

        var trashedFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId && f.is_deleted)
            .Select(f => new FileItemDto
            {
                Type = "folder",
                id = f.id,
                name = f.name,
                parent_folder_id = f.parent_folder_id,
                size_bytes = null,
                mime_type = null,
                created_at = f.created_at,
                deleted_at_utc = f.deleted_at_utc,
                owner_user_id = f.owner_user_id
            })
            .ToListAsync();

        var trashedFiles = await _db.Files
             .Include(f => f.OwnerUser)
            .Where(f => f.owner_user_id == userId && f.is_deleted)
            .Select(f => new FileItemDto
            {
                Type = "file",
                id = f.id,
                name = f.original_name,
                parent_folder_id = f.folder_id,
                size_bytes = f.size_bytes,
                mime_type = f.mime_type,
                created_at = f.created_at,
                deleted_at_utc = f.deleted_at_utc,
                owner_user_id = f.owner_user_id
            })
            .ToListAsync();

        var items = trashedFolders
            .Concat(trashedFiles)
            .OrderBy(i => i.Type)
            .ThenBy(i => i.name)
            .ToList();

        return Ok(items);
    }

    // DELETE /api/files/trash  -> trajno isprazni otpad (folderi + fajlovi)
    [HttpDelete("trash")]
    [Authorize]
    public async Task<IActionResult> EmptyTrash()
    {
        var userId = User.GetCurrentUserId();

        var trashedFolders = await _db.Folders
            .Where(f => f.owner_user_id == userId && f.is_deleted)
            .ToListAsync();

    
        foreach (var folder in trashedFolders)
        {
            await HardDeleteFolderRecursive(folder.id, userId);
        }

        
        var trashedFiles = await _db.Files
            .Where(f => f.owner_user_id == userId && f.is_deleted)
            .ToListAsync();

        foreach (var file in trashedFiles)
        {
            var fullPath = Path.Combine(_storageRoot, file.stored_name);
            if (System.IO.File.Exists(fullPath))
            {
                System.IO.File.Delete(fullPath);
            }

            _db.Files.Remove(file);
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // POST /api/files/move  <-  Batch move files + folders
    [HttpPost("move")]
    [Authorize]
    public async Task<IActionResult> MoveItems([FromBody] MoveItemsRequest request)
    {
        var userId = User.GetCurrentUserId();

        // Provjeri target folder (ako postoji)
        Folder? targetFolder = null;
        if (request.TargetFolderId.HasValue)
        {
            targetFolder = await _db.Folders
                .FirstOrDefaultAsync(f => f.id == request.TargetFolderId.Value
                                          && f.owner_user_id == userId
                                          && !f.is_deleted);

            if (targetFolder == null)
                return NotFound("Target folder not found.");
        }

        try
        {
            foreach (var item in request.Items)
            {
                if (item.Type == "file")
                {
                    await MoveFile(item.Id, request.TargetFolderId, userId);
                }
                else if (item.Type == "folder")
                {
                    if (item.Id == request.TargetFolderId)
                    {
                        continue;
                    }
                    await MoveFolder(item.Id, request.TargetFolderId, userId);
                }
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Move failed: {ex.Message}");
        }
    }

    private async Task MoveFile(long fileId, long? targetFolderId, long userId)
    {
        var file = await _db.Files
            .FirstOrDefaultAsync(f => f.id == fileId
                                      && f.owner_user_id == userId
                                      && !f.is_deleted);

        if (file != null)
        {
            file.folder_id = targetFolderId;
        }
    }

    private async Task MoveFolder(long folderId, long? targetFolderId, long userId)
    {
        var folder = await _db.Folders
            .FirstOrDefaultAsync(f => f.id == folderId
                                      && f.owner_user_id == userId
                                      && !f.is_deleted);

        if (folder != null)
        {
            folder.parent_folder_id = targetFolderId;
        }
    }


}
