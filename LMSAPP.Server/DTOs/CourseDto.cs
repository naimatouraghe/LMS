using LMSAPP.Server.Models;
namespace LMSAPP.Server.DTOs
{
    public class CourseDto
    {
        public Guid Id { get; set; }
        public required string UserId { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public float? Price { get; set; }
        public bool IsPublished { get; set; }
        public Guid CategoryId { get; set; }
        public required CategoryDto Category { get; set; }
        public LanguageLevel Level { get; set; }
        public required ICollection<ChapterDto> Chapters { get; set; }
        public required ICollection<AttachmentDto> Attachments { get; set; }
        public required ICollection<PurchaseDto> Purchases { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
