using System.ComponentModel.DataAnnotations;

namespace LMSAPP.Server.Models
{
    public class Category
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }

}
