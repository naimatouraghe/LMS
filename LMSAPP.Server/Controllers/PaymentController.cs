using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Services.Interfaces;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // Stripe Customer Management
        [Authorize]
        [HttpPost("customers")]
        public async Task<IResult> CreateStripeCustomer()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _paymentService.CreateStripeCustomer(userId);
        }

        [Authorize]
        [HttpGet("customers")]
        public async Task<IResult> GetStripeCustomer()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _paymentService.GetStripeCustomer(userId);
        }

        [Authorize]
        [HttpPut("customers")]
        public async Task<IResult> UpdateStripeCustomer([FromBody] string stripeCustomerId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _paymentService.UpdateStripeCustomer(userId, stripeCustomerId);
        }

        // Purchase Management
        [Authorize]
        [HttpPost("purchases/{courseId}")]
        public async Task<IResult> CreatePurchase(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _paymentService.CreatePurchase(userId, courseId);
        }

        [Authorize]
        [HttpGet("{userId}/purchases")]
        public async Task<IResult> GetUserPurchases(string userId)
        {
            return await _paymentService.GetUserPurchases(userId);
        }

        [Authorize(Roles = "Admin,Teacher")]
        [HttpGet("courses/{courseId}/purchases")]
        public async Task<IResult> GetCoursePurchases(Guid courseId)
        {
            return await _paymentService.GetCoursePurchases(courseId);
        }

        // Checkout Session
        [Authorize]
        [HttpPost("create-checkout-session/{courseId}")]
        public async Task<IResult> CreateCheckoutSession(Guid courseId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("User not authenticated");
            return await _paymentService.CreateCheckoutSession(userId, courseId);
        }

        [HttpPost("webhook")]
        public async Task<IResult> HandleWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();
            return await _paymentService.HandleStripeWebhook(json, signature);
        }
    }
}
