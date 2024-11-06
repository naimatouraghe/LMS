using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace LMSAPP.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        [RegularExpression(@"^[a-zA-Z\s-']+$",
             ErrorMessage = "Full name can only contain letters, spaces, hyphens and apostrophes")]
        public string FullName { get; set; }

        public string? AvatarPath { get; set; }

        // Relations
        public virtual ICollection<Purchase> Purchases { get; set; }
        public virtual ICollection<UserProgress> UserProgress { get; set; }

        public ApplicationUser()
        {
            Purchases = new HashSet<Purchase>();
            UserProgress = new HashSet<UserProgress>();
            FullName = string.Empty;
        }
    }
}
