public class UserUpdateResponseDto
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FullName { get; set; }
    public string? AvatarPath { get; set; }
    public bool IsActive { get; set; }
    public ICollection<string> Roles { get; set; } = new List<string>();
}