namespace LMSAPP.Server.DTOs
{
    public class ChapterDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string VideoUrl { get; set; }
    public int Position { get; set; }
    public bool IsPublished { get; set; }
    public string CourseId { get; set; }  // Reste en string pour l'API
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    }
}