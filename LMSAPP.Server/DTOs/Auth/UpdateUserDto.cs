using System.ComponentModel.DataAnnotations;

namespace LMSAPP.Server.DTOs.Auth
{
    public class UpdateUserDto
    {
        [Required(ErrorMessage = "L'email est requis")]
        [EmailAddress(ErrorMessage = "Format d'email invalide")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le nom complet est requis")]
        [MinLength(2, ErrorMessage = "Le nom doit contenir au moins 2 caractères")]
        public string FullName { get; set; } = string.Empty;

        public IFormFile? Avatar { get; set; }
        public string? Role { get; set; }
    }
}