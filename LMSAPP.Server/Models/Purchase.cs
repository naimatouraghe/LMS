using LMSAPP.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class Purchase
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        public required string UserId { get; set; }

        [ForeignKey("UserId")]
        public required ApplicationUser User { get; set; }

        [Required(ErrorMessage = "Course ID is required")]
        public Guid CourseId { get; set; }

        [ForeignKey("CourseId")]
        public required Course Course { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}