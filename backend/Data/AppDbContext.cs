using Microsoft.EntityFrameworkCore;
using StudentDrive.Api.Models;
using StudentDrive.Api.Models.FileSystem;

namespace StudentDrive.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<FileEntity> Files => Set<FileEntity>();
    public DbSet<Permission> Permissions => Set<Permission>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // USERS
        modelBuilder.Entity<User>()
            .ToTable("users");

        // FOLDERS
        modelBuilder.Entity<Folder>(e =>
        {
            e.ToTable("folders");

            // parent_folder_id self-reference
            e.HasOne(f => f.ParentFolder)
                .WithMany(f => f.Children)
                .HasForeignKey(f => f.parent_folder_id)
                .OnDelete(DeleteBehavior.SetNull);

            // owner_user_id -> users.id
            e.HasOne(f => f.OwnerUser)
                .WithMany(u => u.Folders)
                .HasForeignKey(f => f.owner_user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FILES
        modelBuilder.Entity<FileEntity>(e =>
        {
            e.ToTable("files");

            // folder_id -> folders.id
            e.HasOne(f => f.Folder)
                .WithMany(fol => fol.Files)
                .HasForeignKey(f => f.folder_id)
                .OnDelete(DeleteBehavior.SetNull);

            // owner_user_id -> users.id
            e.HasOne(f => f.OwnerUser)
                .WithMany(u => u.Files)
                .HasForeignKey(f => f.owner_user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PERMISSIONS
        modelBuilder.Entity<Permission>()
            .ToTable("permissions");
    }
}
