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
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<UserGroup> UserGroups => Set<UserGroup>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // USERS
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
        });

        // FOLDERS
        modelBuilder.Entity<Folder>(e =>
        {
            e.ToTable("folders");

            e.HasOne(f => f.ParentFolder)
                .WithMany(f => f.Children)
                .HasForeignKey(f => f.parent_folder_id)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(f => f.OwnerUser)
                .WithMany(u => u.Folders)
                .HasForeignKey(f => f.owner_user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FILES
        modelBuilder.Entity<FileEntity>(e =>
        {
            e.ToTable("files");

            e.HasOne(f => f.Folder)
                .WithMany(fol => fol.Files)
                .HasForeignKey(f => f.folder_id)
                .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(f => f.OwnerUser)
                .WithMany(u => u.Files)
                .HasForeignKey(f => f.owner_user_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PERMISSIONS
        modelBuilder.Entity<Permission>(e =>
        {
            e.ToTable("permissions");
        });

        // GROUPS
        modelBuilder.Entity<Group>(e =>
        {
            e.ToTable("groups");

            e.Property(g => g.id).HasColumnName("id");
            e.Property(g => g.name).HasColumnName("name");
            e.Property(g => g.description).HasColumnName("description");
            e.Property(g => g.created_by).HasColumnName("created_by");
            e.Property(g => g.created_at).HasColumnName("created_at");
            e.Property(g => g.icon_key).HasColumnName("icon_key");
        });

        // USER_GROUPS
        modelBuilder.Entity<UserGroup>(e =>
        {
            e.ToTable("user_groups");

            e.HasKey(ug => new { ug.user_id, ug.group_id });

            e.Property(ug => ug.user_id).HasColumnName("user_id");
            e.Property(ug => ug.group_id).HasColumnName("group_id");
            e.Property(ug => ug.role_in_group).HasColumnName("role_in_group");

            e.HasOne(ug => ug.User)
                .WithMany(u => u.UserGroups)
                .HasForeignKey(ug => ug.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ug => ug.Group)
                .WithMany(g => g.UserGroups)
                .HasForeignKey(ug => ug.group_id)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ROLES
        modelBuilder.Entity<Role>(e =>
        {
            e.ToTable("roles");

            e.HasKey(r => r.id);

            e.Property(r => r.id).HasColumnName("id");
            e.Property(r => r.name).HasColumnName("name");
        });

        // USER_ROLES
        modelBuilder.Entity<UserRole>(e =>
        {
            e.ToTable("user_roles");

            e.HasKey(ur => new { ur.user_id, ur.role_id });

            e.Property(ur => ur.user_id).HasColumnName("user_id");
            e.Property(ur => ur.role_id).HasColumnName("role_id");

            e.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.user_id)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.role_id)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}