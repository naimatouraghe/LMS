
using LMSAPP.Server.Models;

namespace lmsapp.Server.Models
{
    public class Course
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public float? Price { get; set; }
        public bool IsPublished { get; set; } = false;

        public Guid CategoryId { get; set; }
        public virtual Category Category { get; set; }

        public LanguageLevel Level { get; set; }

        public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
