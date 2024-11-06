namespace LMSAPP.Server.DTOs
{
    public class StripeCustomerDto
    {
        public Guid Id { get; set; }
        public required string UserId { get; set; }
        public required UserDto User { get; set; }
        public required string StripeCustomerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}