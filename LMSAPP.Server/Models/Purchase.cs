using LMSAPP.Server.Models;

namespace lmsapp.Server.Models
{
    public class Purchase
    {
        public Guid Id { get; set; } 
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public Guid CourseId { get; set; }
        public Course Course { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
