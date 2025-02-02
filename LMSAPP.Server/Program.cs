using LMSAPP.Server.Data;
using LMSAPP.Server.Models;
using LMSAPP.Server.Services;
using LMSAPP.Server.Services.Interfaces;
using LMSAPP.Server.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Stripe;
using System.Text;
using System.Text.Json.Serialization;

namespace LMSAPP.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configuration de Stripe
            StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

            // Ajouter les services au conteneur DI
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "LMSAPP API",
                    Version = "v1",
                    Description = "API pour l'application LMS"
                });

                // Configuration de l'authentification JWT
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });


            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Configure Identity
            // Add services to the container
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Garder uniquement les autres configurations
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.User.RequireUniqueEmail = true;
                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

                options.SignIn.RequireConfirmedEmail = true;
                options.SignIn.RequireConfirmedAccount = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders()
            .AddPasswordValidator<CustomPasswordValidator<ApplicationUser>>();

            // 5. Configuration des cookies pour CSRF et XSS
            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
                options.SlidingExpiration = true;
            });

            // 6. Configuration du hachage des mots de passe (PBKDF2)
            builder.Services.Configure<PasswordHasherOptions>(options =>
            {
                options.IterationCount = 250000;
            });

            // 7. Configuration des tokens
            builder.Services.Configure<DataProtectionTokenProviderOptions>(options =>
            {
                options.TokenLifespan = TimeSpan.FromHours(24);
            });

            // 8. Configuration JWT
            var jwtSettings = builder.Configuration.GetSection("JWT");
            if (string.IsNullOrEmpty(jwtSettings["Secret"]))
            {
                throw new InvalidOperationException("JWT Secret key is not configured in appsettings.json");
            }

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["ValidIssuer"],
                    ValidAudience = jwtSettings["ValidAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is null"))
                    ),
                    ClockSkew = TimeSpan.Zero
                };
            });

            // 9. Ajout de l'antiforgery pour CSRF
            builder.Services.AddAntiforgery(options =>
            {
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.HeaderName = "X-XSRF-TOKEN";
            });

            // Register services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ICourseService, CourseService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IProgressService, ProgressService>();
            builder.Services.AddScoped<ITokenService, Services.TokenService>();

            // Ajouter HttpContextAccessor
            builder.Services.AddHttpContextAccessor();

            // Add authorization policies for roles
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("StudentPolicy", policy =>
                    policy.RequireRole("Student", "Teacher", "Admin"));

                // Politique pour les enseignants (uniquement Teacher)
                options.AddPolicy("TeacherPolicy", policy =>
                    policy.RequireRole("Teacher"));

                // Politique pour les administrateurs
                options.AddPolicy("AdminPolicy", policy =>
                    policy.RequireRole("Admin"));
            });

            // Ajouter la configuration CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    builder =>
                    {
                        builder
                            /* .AllowAnyOrigin()*/
                            .WithOrigins("https://localhost:5173", "http://localhost:5173")
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials();
                    });
            });

            // Après la configuration CORS et avant var app = builder.Build();
            builder.Services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "wwwroot";
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LMSAPP API v1");
                    c.RoutePrefix = string.Empty;
                });
            }

            // Middleware CSP
            app.Use(async (context, next) =>
            {
                context.Response.Headers.Append(
                    "Content-Security-Policy",
                    "default-src 'self'; " +
                    "img-src 'self' data: https:; " +
                    "font-src 'self' https: data:; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "connect-src 'self' ws: wss: http: https:;"
                );
                await next();
            });

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseCors("AllowReactApp");
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();
            app.MapControllers();
            // Ajoutez ceci pour regrouper vos endpoints sous /api
            app.UsePathBase("/api");

            app.MapFallbackToFile("/index.html"); // For client-side routing (if applicable)

            // Après var app = builder.Build(); et avant le middleware CSP
            // Créer le dossier wwwroot et uploads s'ils n'existent pas
            var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            if (!Directory.Exists(webRootPath))
            {
                Directory.CreateDirectory(webRootPath);
            }

            var uploadsPath = Path.Combine(webRootPath, "uploads", "avatars");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            app.Run();
        }
    }
}
