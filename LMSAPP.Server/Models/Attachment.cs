using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class Attachment
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "URL is required")]
        [Url(ErrorMessage = "Invalid URL format")]
        public required string Url { get; set; }

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
