using System.ComponentModel.DataAnnotations;

namespace lmsapp.Server.Models
{
    public class Category
    {
        public Guid Id { get; set; }  // Utiliser Guid au lieu de string

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }

}
