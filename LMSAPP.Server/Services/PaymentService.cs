using Stripe;
using LMSAPP.Server.DTOs.Purchase;
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
                        FullName = user?.FullName ?? "Unknown",
                        Email = user?.Email ?? "No Email",
                        AvatarPath = user?.AvatarPath ?? "default_avatar.png",
                        IsActive = user?.IsActive ?? false,
                        Purchases = new List<DTOs.PurchaseDto>(),
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
                    if (createCustomerResult is not OkObjectResult okResult)
                    {
                        return Results.BadRequest("Could not create Stripe customer");
                    }
                    var stripeCustomerDto = okResult.Value as StripeCustomerDto;
                    if (stripeCustomerDto == null) return Results.BadRequest("Failed to create Stripe customer");
                    stripeCustomer = await _context.StripeCustomers
                        .FirstOrDefaultAsync(sc => sc.StripeCustomerId == stripeCustomerDto.StripeCustomerId);
                }

                var options = new SessionCreateOptions
                {
                    Customer = stripeCustomer?.StripeCustomerId ?? throw new ArgumentNullException("StripeCustomerId is null"),
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
                                UnitAmount = (long)(course.Price * 100 ?? 0)
                            },
                            Quantity = 1
                        }
                    },
                    Mode = "payment",
                    SuccessUrl = $"https://localhost:5173/courses/{courseId}?session_id={{CHECKOUT_SESSION_ID}}",
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
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null) return Results.BadRequest("Invalid session object");

                    var courseId = Guid.Parse(session.Metadata["CourseId"]);
                    var userId = session.Metadata["UserId"];

                    var user = await _context.Users.FindAsync(userId);
                    var course = await _context.Courses.FindAsync(courseId);

                    if (user == null || course == null)
                    {
                        return Results.BadRequest("User or Course not found");
                    }

                    var purchase = new Purchase
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        CourseId = courseId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        User = user,
                        Course = course
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

                var completedChapters = await _context.UserProgresses
                    .Where(up => up.UserId == userId && up.IsCompleted)
                    .Select(up => up.ChapterId)
                    .ToListAsync();

                var purchases = await _context.Purchases
                    .Where(p => p.UserId == userId)
                    .Include(p => p.Course)
                    .ThenInclude(c => c.Category)
                    .Include(p => p.Course.Chapters)
                    .Select(p => new
                    {
                        CourseId = p.Course.Id,
                        CourseTitle = p.Course.Title,
                        CourseDescription = p.Course.Description,
                        CourseImageUrl = p.Course.ImageUrl,
                        CoursePrice = p.Course.Price,
                        CategoryId = p.Course.CategoryId,
                        Category = new
                        {
                            CategoryId = p.Course.Category.Id,
                            CategoryName = p.Course.Category.Name
                        },
                        Chapters = p.Course.Chapters.Select(c => new
                        {
                            ChapterId = c.Id,
                            ChapterTitle = c.Title,
                            ChapterPosition = c.Position,
                            ChapterIsPublished = c.IsPublished,
                            ChapterIsFree = c.IsFree,
                            IsCompleted = completedChapters.Contains(c.Id)
                        }).ToList(),
                        Progress = p.Course.Chapters.Any()
                            ? Math.Round((double)p.Course.Chapters.Count(c => completedChapters.Contains(c.Id)) / p.Course.Chapters.Count * 100)
                            : 0
                    })
                    .ToListAsync();

                _logger.LogInformation("Purchases with chapters: {Purchases}",
                    purchases.Select(p => new
                    {
                        p.CourseTitle,
                        ChapterCount = p.Chapters.Count
                    }));

                return Results.Ok(new { value = purchases });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user purchases");
                return Results.Problem("An error occurred while getting user purchases");
            }
        }

        public async Task<IResult> GetStripeCustomer(string userId)
        {
            try
            {
                var stripeCustomer = await _context.StripeCustomers
                    .FirstOrDefaultAsync(sc => sc.UserId == userId);

                if (stripeCustomer == null)
                    return Results.NotFound("Stripe customer not found");

                return Results.Ok(new { stripeCustomer.StripeCustomerId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Stripe customer");
                return Results.Problem("An error occurred while getting the Stripe customer");
            }
        }

        public async Task<IResult> UpdateStripeCustomer(string userId, string stripeCustomerId)
        {
            try
            {
                var customerService = new CustomerService();
                var customer = await customerService.UpdateAsync(stripeCustomerId, new CustomerUpdateOptions
                {
                    // Ajoutez ici les champs que vous souhaitez mettre à jour
                });

                var stripeCustomer = await _context.StripeCustomers
                    .FirstOrDefaultAsync(sc => sc.UserId == userId);

                if (stripeCustomer != null)
                {
                    stripeCustomer.StripeCustomerId = customer.Id; // Exemple de mise à jour
                    await _context.SaveChangesAsync();
                }

                return Results.Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Stripe customer");
                return Results.Problem("An error occurred while updating the Stripe customer");
            }
        }

        public async Task<IResult> CreatePurchase(string userId, Guid courseId)
        {
            try
            {
                // Vérifier si l'achat existe déjà
                var existingPurchase = await _context.Purchases
                    .Include(p => p.Course)
                    .Include(p => p.Course.Category)
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.CourseId == courseId);

                if (existingPurchase != null)
                {
                    // Au lieu de renvoyer une erreur, on renvoie un succès avec l'achat existant
                    return Results.Ok(new DTOs.Purchase.PurchaseDto
                    {
                        Id = existingPurchase.Id,
                        UserId = existingPurchase.UserId,
                        CourseId = existingPurchase.CourseId,
                        CreatedAt = existingPurchase.CreatedAt,
                        UpdatedAt = existingPurchase.UpdatedAt,
                        Course = new CourseDto
                        {
                            Id = existingPurchase.Course.Id,
                            Title = existingPurchase.Course.Title,
                            Description = existingPurchase.Course.Description,
                            UserId = existingPurchase.Course.UserId,
                            Category = new CategoryDto
                            {
                                Id = existingPurchase.Course.Category?.Id ?? Guid.Empty,
                                Name = existingPurchase.Course.Category?.Name ?? string.Empty,
                                Courses = new List<CourseDto>()
                            },
                            Chapters = new List<ChapterDto>(),
                            Attachments = new List<AttachmentDto>(),
                            Purchases = null
                        }
                    });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);

                if (user == null || course == null)
                {
                    return Results.NotFound("User or Course not found");
                }

                var purchase = new Purchase
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CourseId = courseId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    User = user,
                    Course = course
                };

                _context.Purchases.Add(purchase);
                await _context.SaveChangesAsync();

                return Results.Ok(new DTOs.Purchase.PurchaseDto
                {
                    Id = purchase.Id,
                    UserId = purchase.UserId,
                    CourseId = purchase.CourseId,
                    CreatedAt = purchase.CreatedAt,
                    UpdatedAt = purchase.UpdatedAt,
                    Course = new CourseDto
                    {
                        Id = course.Id,
                        Title = course.Title,
                        Description = course.Description,
                        UserId = course.UserId,
                        Category = new CategoryDto
                        {
                            Id = course.Category?.Id ?? Guid.Empty,
                            Name = course.Category?.Name ?? string.Empty,
                            Courses = new List<CourseDto>()
                        },
                        Chapters = new List<ChapterDto>(),
                        Attachments = new List<AttachmentDto>(),
                        Purchases = null
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating purchase");
                return Results.Problem("An error occurred while creating the purchase");
            }
        }

        public async Task<IResult> GetCoursePurchases(Guid courseId)
        {
            try
            {
                var purchases = await _context.Purchases
                    .Where(p => p.CourseId == courseId)
                    .Include(p => p.User)
                    .ToListAsync();

                return Results.Ok(purchases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting course purchases");
                return Results.Problem("An error occurred while getting course purchases");
            }
        }

        public async Task<IResult> GetSession(string sessionId)
        {
            try
            {
                var service = new SessionService();
                var options = new SessionGetOptions();
                var session = await service.GetAsync(sessionId, options);

                if (session == null)
                {
                    return Results.NotFound("Session not found");
                }

                // Vérifier si le paiement est réussi
                if (session.PaymentStatus != "paid")
                {
                    return Results.BadRequest("Payment not completed");
                }

                var courseId = Guid.Parse(session.Metadata["CourseId"]);
                var userId = session.Metadata["UserId"];

                // Récupérer l'utilisateur et le cours
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);

                if (user == null || course == null)
                {
                    return Results.NotFound("User or Course not found");
                }

                // Créer l'achat si ce n'est pas déjà fait
                var existingPurchase = await _context.Purchases
                    .FirstOrDefaultAsync(p => p.CourseId == courseId && p.UserId == userId);

                if (existingPurchase == null)
                {
                    var purchase = new Purchase
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        CourseId = courseId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        User = user,        // Ajouter la référence à l'utilisateur
                        Course = course     // Ajouter la référence au cours
                    };

                    _context.Purchases.Add(purchase);
                    await _context.SaveChangesAsync();
                }

                return Results.Ok(new { CourseId = courseId, UserId = userId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing session");
                return Results.Problem("An error occurred while processing the session");
            }
        }
    }
}
