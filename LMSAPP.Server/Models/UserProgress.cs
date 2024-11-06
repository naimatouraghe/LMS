using LMSAPP.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class UserProgress
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        public required string UserId { get; set; }

        [ForeignKey("UserId")]
        public required ApplicationUser User { get; set; }

        [Required(ErrorMessage = "Chapter ID is required")]
        public Guid ChapterId { get; set; }

        [ForeignKey("ChapterId")]
        public required Chapter Chapter { get; set; }

        [Required]
        public bool IsCompleted { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}
