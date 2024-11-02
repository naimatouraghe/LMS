using lmsapp.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace LMSAPP.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
         public string? AvatarPath { get; set; }
        // Propriétés de navigation pour les relations
        public virtual ICollection<Purchase> Purchases { get; set; }
        public virtual ICollection<UserProgress> UserProgress { get; set; }
        public virtual StripeCustomer StripeCustomer { get; set; }

        public ApplicationUser()
        {
            Purchases = new HashSet<Purchase>();
            UserProgress = new HashSet<UserProgress>();
        }
    }
}
