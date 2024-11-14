namespace LMSAPP.Server.DTOs.Purchase
{
    public class UserDto
    {
        public required string Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public IFormFile? Avatar { get; set; }
        public string? AvatarPath { get; set; }
        public bool IsActive { get; set; } = true;
        public StripeCustomerDto? StripeCustomer { get; set; }
    }
}