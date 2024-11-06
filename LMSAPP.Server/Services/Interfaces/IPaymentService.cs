using LMSAPP.Server.DTOs;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface IPaymentService
    {
        // Stripe Customer Management
        Task<IResult> CreateStripeCustomer(string userId);
        Task<IResult> GetStripeCustomer(string userId);
        Task<IResult> UpdateStripeCustomer(string userId, string stripeCustomerId);

        // Purchase Management
        Task<IResult> CreatePurchase(string userId, Guid courseId);
        Task<IResult> GetUserPurchases(string userId);
        Task<IResult> GetCoursePurchases(Guid courseId);

        // Checkout Session
        Task<IResult> CreateCheckoutSession(string userId, Guid courseId);
        Task<IResult> HandleStripeWebhook(string requestBody, string stripeSignature);
    }
}