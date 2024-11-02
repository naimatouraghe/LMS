using LMSAPP.Server.Models;
namespace LMSAPP.Server.DTOs
{
    public class CourseDto
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public float? Price { get; set; }
        public bool IsPublished { get; set; }
        public string CategoryId { get; set; }
        public LanguageLevel Level { get; set; }
        public CategoryDto Category { get; set; }
        public ICollection<ChapterDto>? Chapters { get; set; }
        public ICollection<AttachmentDto>? Attachments { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}