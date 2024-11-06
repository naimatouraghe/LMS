using LMSAPP.Server.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace LMSAPP.Server.Models
{
    public class Course
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        public required string UserId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters")]
        public required string Title { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        [Range(0, 10000, ErrorMessage = "Price must be between 0 and 10000")]
        [Column(TypeName = "decimal(18,2)")]
        public float? Price { get; set; }

        public bool IsPublished { get; set; } = false;

        [Required(ErrorMessage = "Category is required")]
        public Guid CategoryId { get; set; }

        [ForeignKey("CategoryId")]
        public virtual required Category Category { get; set; }

        [Required(ErrorMessage = "Language level is required")]
        public LanguageLevel Level { get; set; }

        public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
        public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public virtual ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser? Teacher { get; set; }
    }
}
