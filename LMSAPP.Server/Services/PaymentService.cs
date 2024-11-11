using Stripe;
using LMSAPP.Server.DTOs;
using LMSAPP.Server.Services.Interfaces;
using LMSAPP.Server.Data;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using LMSAPP.Server.Models;
using Microsoft.AspNetCore.Mvc;

namespace LMSAPP.Server.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PaymentService> _logger;
        private readonly string _stripeSecretKey;
        private readonly string _webhookSecret;

        public PaymentService(
            ApplicationDbContext context,
            ILogger<PaymentService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _stripeSecretKey = configuration["Stripe:SecretKey"] ?? throw new ArgumentNullException("Stripe:SecretKey");
            _webhookSecret = configuration["Stripe:WebhookSecret"] ?? throw new ArgumentNullException("Stripe:WebhookSecret");
            StripeConfiguration.ApiKey = _stripeSecretKey;
        }

        public async Task<IResult> CreateStripeCustomer(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Results.NotFound("User not found");

                var customerService = new CustomerService();
                var customer = await customerService.CreateAsync(new CustomerCreateOptions
                {
                    Email = user.Email,
                    Metadata = new Dictionary<string, string>
                    {
                        { "UserId", userId }
                    }
                });

                var stripeCustomer = new StripeCustomer
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    StripeCustomerId = customer.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    User = user
                };

                _context.StripeCustomers.Add(stripeCustomer);
                await _context.SaveChangesAsync();

                return Results.Ok(new StripeCustomerDto
                {
                    Id = stripeCustomer.Id,
                    UserId = stripeCustomer.UserId,
                    StripeCustomerId = stripeCustomer.StripeCustomerId,
                    CreatedAt = stripeCustomer.CreatedAt,
                    UpdatedAt = stripeCustomer.UpdatedAt,
                    User = new UserDto
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email,
                        Purchases = new List<PurchaseDto>(),
                        UserProgress = new List<UserProgressDto>()
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Stripe customer");
                return Results.Problem("An error occurred while creating the Stripe customer");
            }
        }

        public async Task<IResult> CreateCheckoutSession(string userId, Guid courseId)
        {
            try
            {
                var course = await _context.Courses.FindAsync(courseId);
                if (course == null) return Results.NotFound("Course not found");

                var stripeCustomer = await _context.StripeCustomers
                    .FirstOrDefaultAsync(sc => sc.UserId == userId);

                if (stripeCustomer == null)
                {
                    var createCustomerResult = await CreateStripeCustomer(userId);
                    if (createCustomerResult.GetType().Name != "OkObjectResult")
                    {
                        return Results.BadRequest("Could not create Stripe customer");
                    }
                    var customerDto = (createCustomerResult as OkObjectResult)?.Value as StripeCustomerDto;
                    stripeCustomer = await _context.StripeCustomers
                        .FirstOrDefaultAsync(sc => sc.StripeCustomerId == customerDto.StripeCustomerId);
                }

                var options = new SessionCreateOptions
                {
                    Customer = stripeCustomer.StripeCustomerId,
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = "usd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = course.Title,
                                    Description = course.Description
                                },
                                UnitAmount = (long)(course.Price * 100)
                            },
                            Quantity = 1
                        }
                    },
                    Mode = "payment",
                    SuccessUrl = "https://votresite.com/success?session_id={CHECKOUT_SESSION_ID}",
                    CancelUrl = "https://votresite.com/cancel",
                    Metadata = new Dictionary<string, string>
                    {
                        { "CourseId", courseId.ToString() },
                        { "UserId", userId }
                    }
                };

                var service = new SessionService();
                var session = await service.CreateAsync(options);

                return Results.Ok(new { SessionId = session.Id, SessionUrl = session.Url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating checkout session");
                return Results.Problem("An error occurred while creating the checkout session");
            }
        }

        public async Task<IResult> HandleStripeWebhook(string requestBody, string stripeSignature)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    requestBody,
                    stripeSignature,
                    _webhookSecret
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                    if (session == null) return Results.BadRequest("Invalid session object");

                    var courseId = Guid.Parse(session.Metadata["CourseId"]);
                    var userId = session.Metadata["UserId"];

                    var purchase = new Purchase
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        CourseId = courseId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        User = await _context.Users.FindAsync(userId),
                        Course = await _context.Courses.FindAsync(courseId)
                    };

                    _context.Purchases.Add(purchase);
                    await _context.SaveChangesAsync();
                }

                return Results.Ok(new { Received = true });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook error");
                return Results.BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Webhook handling error");
                return Results.Problem("An error occurred while processing the webhook");
            }
        }

        public async Task<IResult> GetUserPurchases(string userId)
        {
            try
            {
                _logger.LogInformation("Getting purchases for user {UserId}", userId);

                var purchases = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .Include(p => p.Course)
                        .ThenInclude(c => c.Category)
                    .Include(p => p.Course.Chapters)
                    .Select(p => new
                    {
                        Id = p.Course.Id,
                        Title = p.Course.Title,
                        Description = p.Course.Description,
                        ImageUrl = p.Course.ImageUrl,
                        Price = p.Course.Price,
                        CategoryId = p.Course.CategoryId,
                        Category = new
                        {
                            Id = p.Course.Category.Id,
                            Name = p.Course.Category.Name
                        },
                        Progress = 0, // On ajoutera le calcul de progression plus tard
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt
                    })
                    .ToListAsync();

                _logger.LogInformation("Found {Count} purchases", purchases.Count);
                return Results.Ok(new { value = purchases });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user purchases");
                return Results.Problem("An error occurred while getting user purchases");
            }
        }

        public Task<IResult> GetStripeCustomer(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> UpdateStripeCustomer(string userId, string stripeCustomerId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> CreatePurchase(string userId, Guid courseId)
        {
            throw new NotImplementedException();
        }

        public Task<IResult> GetCoursePurchases(Guid courseId)
        {
            throw new NotImplementedException();
        }
    }
}
