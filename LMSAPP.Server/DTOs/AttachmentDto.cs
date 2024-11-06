namespace LMSAPP.Server.DTOs
{
    public class AttachmentDto
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Url { get; set; }
        public Guid CourseId { get; set; }
        public required CourseDto Course { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}