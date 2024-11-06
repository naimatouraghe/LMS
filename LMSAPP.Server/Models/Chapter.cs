using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class Chapter
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters")]
        public required string Title { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        public string? VideoUrl { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Position must be a positive number")]
        public int Position { get; set; }

        public bool IsPublished { get; set; } = false;

        public bool IsFree { get; set; } = false;

        [Required(ErrorMessage = "Course ID is required")]
        public Guid CourseId { get; set; }

        [ForeignKey("CourseId")]
        public virtual required Course Course { get; set; }

        public virtual MuxData? MuxData { get; set; }

        public virtual ICollection<UserProgress> UserProgress { get; set; } = new List<UserProgress>();

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}
