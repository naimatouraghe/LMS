namespace LMSAPP.Server.DTOs
{
    public class CreateChapterDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public bool IsFree { get; set; }
        public Guid CourseId { get; set; }
    }
}