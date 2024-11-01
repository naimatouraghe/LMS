using lmsapp.Server.Models;
using Microsoft.AspNetCore.Identity;

namespace LMSAPP.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public DateTime DateJoined { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public List<UserProgress> Progresses { get; set; } = new List<UserProgress>();
        public List<Purchase> Purchases { get; set; } = new List<Purchase>();
    }
}
