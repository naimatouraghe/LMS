namespace lmsapp.Server.Models
{
    public class Course
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public float? Price { get; set; }
        public bool IsPublished { get; set; } = false;

        public string? CategoryId { get; set; }
        public Category? Category { get; set; }

        public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
