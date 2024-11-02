namespace lmsapp.Server.Models
{
    public class Attachment
    {
        public Guid Id { get; set; }  // Changé en Guid
        public string Name { get; set; }
        public string Url { get; set; }
        public Guid CourseId { get; set; }  // Changé en Guid
        public Course Course { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
