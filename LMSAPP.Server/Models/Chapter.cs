namespace lmsapp.Server.Models
{
    public class Chapter
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public int Position { get; set; }
        public bool IsPublished { get; set; } = false;
        public bool IsFree { get; set; } = false;

        public Guid CourseId { get; set; }
        public Course Course { get; set; }

        public MuxData? MuxData { get; set; }
        public ICollection<UserProgress> UserProgress { get; set; } = new List<UserProgress>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
