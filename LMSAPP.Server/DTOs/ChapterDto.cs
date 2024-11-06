namespace LMSAPP.Server.DTOs
{
    public class ChapterDto
    {
        public Guid Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public int Position { get; set; }
        public bool IsPublished { get; set; }
        public bool IsFree { get; set; }
        public Guid CourseId { get; set; }
        public required CourseDto Course { get; set; }
        public MuxDataDto? MuxData { get; set; }
        public required ICollection<UserProgressDto> UserProgress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}