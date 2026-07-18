using System.ComponentModel.DataAnnotations;

namespace StudentDrive.Api.DTOs
{
    public class UpdateGroupRequest
    {
        [Required]
        [MaxLength(100)]
        public string name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? description { get; set; }

        [Required]
        [MaxLength(50)]
        public string icon_key { get; set; } = string.Empty;
    }
}