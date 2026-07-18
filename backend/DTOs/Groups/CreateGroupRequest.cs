using System.ComponentModel.DataAnnotations;

namespace StudentDrive.Api.DTOs
{
    public class CreateGroupRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Icon_Key { get; set; } 
    }
}