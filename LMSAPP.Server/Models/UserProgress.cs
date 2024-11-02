using LMSAPP.Server.Models;

namespace lmsapp.Server.Models
{
    public class UserProgress
    {
        public Guid Id { get; set; } 
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public Guid ChapterId { get; set; }
        public Chapter Chapter { get; set; }

        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
