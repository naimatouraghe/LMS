public class UserDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
     public IFormFile? Avatar { get; set; }  // Ajout de la propriété Avatar
    public string? AvatarPath { get; set; } // Pour stocker le chemin de l'avatar
}