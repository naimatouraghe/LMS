using LMSAPP.Server.DTOs;

public class UserDto
{
    public required string Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public IFormFile? Avatar { get; set; }
    public string? AvatarPath { get; set; }
    public required ICollection<PurchaseDto> Purchases { get; set; }
    public required ICollection<UserProgressDto> UserProgress { get; set; }
    public StripeCustomerDto? StripeCustomer { get; set; }
}

