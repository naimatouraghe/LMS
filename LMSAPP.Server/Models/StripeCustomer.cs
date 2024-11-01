using LMSAPP.Server.Models;
namespace lmsapp.Server.Models
{
    public class StripeCustomer
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public string StripeCustomerId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; }
    }

}
