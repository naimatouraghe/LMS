using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LMSAPP.Server.DTOs
{
    public class InitialCourseDto
    {
        [Required(ErrorMessage = "Le titre est requis")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Le titre doit contenir entre 3 et 100 caractères")]
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
    }
}