namespace LMSAPP.Server.DTOs.Purchase
{
    public class PurchaseDto
    {
        public Guid Id { get; set; }
        public required string UserId { get; set; }
        public Guid CourseId { get; set; }
        public required CourseDto Course { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}