using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LMSAPP.Server.Models
{
    public class StripeCustomer
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "User ID is required")]
        public required string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual required ApplicationUser User { get; set; }

        [Required(ErrorMessage = "Stripe Customer ID is required")]
        [StringLength(100, ErrorMessage = "Stripe Customer ID cannot exceed 100 characters")]
        public required string StripeCustomerId { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}
