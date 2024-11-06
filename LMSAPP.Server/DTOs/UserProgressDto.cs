namespace LMSAPP.Server.DTOs
{
    public class UserProgressDto
    {
        public Guid Id { get; set; }
        public required string UserId { get; set; }
        public required UserDto User { get; set; }
        public Guid ChapterId { get; set; }
        public required ChapterDto Chapter { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}