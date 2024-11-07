using LMSAPP.Server.Data;
using LMSAPP.Server.DTOs.Auth;
using LMSAPP.Server.Models;
using LMSAPP.Server.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LMSAPP.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            ILogger<AuthService> logger,
            ApplicationDbContext context,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment webHostEnvironment)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _logger = logger;
            _context = context;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IResult> CreateUserAsync(RegisterDto model)
        {
            try
            {
                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FullName = model.FullName,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    return Results.BadRequest(result.Errors);
                }

                await _userManager.AddToRoleAsync(user, model.Role);
                return Results.Ok(new { Id = user.Id, Email = user.Email });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return Results.Problem("An error occurred while creating the user");
            }
        }

        public async Task<IResult> GetUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.NotFound("User not found");
                }

                var roles = await _userManager.GetRolesAsync(user);

                var userDto = new
                {
                    id = user.Id,
                    email = user.Email,
                    userName = user.UserName,
                    fullName = user.FullName,
                    roles = roles,
                };

                return Results.Ok(new { value = userDto });
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Error retrieving user: {ex.Message}");
            }
        }

        public async Task<IResult> UpdateUserAsync(string userId, UpdateUserDto model)
        {
            try
            {
                _logger.LogInformation($"Début de la mise à jour pour l'utilisateur {userId}");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning($"Utilisateur {userId} non trouvé");
                    return Results.NotFound(new { message = "Utilisateur non trouvé" });
                }

                // Mise à jour des informations de base
                user.FullName = model.FullName;
                user.Email = model.Email;
                user.UserName = model.Email;

                if (model.Avatar != null)
                {
                    _logger.LogInformation("Traitement de l'avatar");
                    try
                    {
                        // Supprimer l'ancien avatar
                        if (!string.IsNullOrEmpty(user.AvatarPath))
                        {
                            var oldAvatarPath = Path.Combine(_webHostEnvironment.WebRootPath, user.AvatarPath.TrimStart('/'));
                            _logger.LogInformation($"Tentative de suppression de l'ancien avatar: {oldAvatarPath}");

                            if (File.Exists(oldAvatarPath))
                            {
                                File.Delete(oldAvatarPath);
                                _logger.LogInformation("Ancien avatar supprimé avec succès");
                            }
                        }

                        // Sauvegarder le nouvel avatar
                        user.AvatarPath = await SaveAvatarAsync(model.Avatar);
                        _logger.LogInformation($"Nouvel avatar sauvegardé: {user.AvatarPath}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erreur détaillée lors du traitement de l'avatar");
                        return Results.BadRequest(new { message = ex.Message });
                    }
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    _logger.LogError("Échec de la mise à jour de l'utilisateur: {Errors}",
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                    return Results.BadRequest(new
                    {
                        message = "Échec de la mise à jour",
                        errors = result.Errors.Select(e => e.Description)
                    });
                }

                var roles = await _userManager.GetRolesAsync(user);

                var response = new
                {
                    message = "Profil mis à jour avec succès",
                    value = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        avatarPath = user.AvatarPath,
                        isActive = user.IsActive,
                        roles = roles.ToList()
                    }
                };

                _logger.LogInformation("Mise à jour réussie: {@Response}", response);
                return Results.Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur non gérée lors de la mise à jour de l'utilisateur");
                return Results.Problem($"Une erreur est survenue lors de la mise à jour: {ex.Message}");
            }
        }

        public async Task<IResult> DeleteUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.NotFound("User not found");
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    return Results.BadRequest(result.Errors);
                }

                return Results.Ok(new { Message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user");
                return Results.Problem("An error occurred while deleting the user");
            }
        }

        public async Task<IResult> LoginAsync(LoginDto model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return Results.BadRequest("Invalid email or password");
                }

                var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);
                if (!isPasswordValid)
                {
                    return Results.BadRequest("Invalid email or password");
                }

                var userRoles = await _userManager.GetRolesAsync(user);

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim("userId", user.Id)
                };

                foreach (var role in userRoles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _configuration["JWT:ValidIssuer"],
                    audience: _configuration["JWT:ValidAudience"],
                    claims: claims,
                    expires: DateTime.Now.AddHours(3),
                    signingCredentials: creds
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                return Results.Ok(new
                {
                    token = tokenString,
                    expiration = token.ValidTo,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        userName = user.UserName,
                        roles = userRoles
                    }
                });
            }
            catch (Exception ex)
            {
                return Results.BadRequest($"Login failed: {ex.Message}");
            }
        }

        public async Task<IResult> LogoutAsync()
        {
            try
            {
                await _signInManager.SignOutAsync();
                return Results.Ok(new { Message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return Results.Problem("An error occurred during logout");
            }
        }

        public async Task<IResult> GetAllUsersAsync(string? role = null, string? searchTerm = null)
        {
            try
            {
                IQueryable<ApplicationUser> query = _userManager.Users;

                if (!string.IsNullOrEmpty(role))
                {
                    var usersInRole = await _userManager.GetUsersInRoleAsync(role);
                    var userIds = usersInRole.Select(u => u.Id);
                    query = query.Where(u => userIds.Contains(u.Id));
                }

                if (!string.IsNullOrEmpty(searchTerm))
                {
                    searchTerm = searchTerm.ToLower();
                    query = query.Where(u =>
                        u.Email.ToLower().Contains(searchTerm) ||
                        u.FullName.ToLower().Contains(searchTerm));
                }

                var users = await query.Select(u => new
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    AvatarPath = u.AvatarPath,
                    Roles = _userManager.GetRolesAsync(u).Result
                }).ToListAsync();

                return Results.Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users");
                return Results.Problem("An error occurred while getting users");
            }
        }

        public async Task<IResult> AssignRoleAsync(string userId, string role)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.NotFound("User not found");
                }

                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, role);

                return Results.Ok(new { Message = "Role assigned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning role");
                return Results.Problem("An error occurred while assigning role");
            }
        }

        public async Task<IResult> GetUserStatisticsAsync()
        {
            try
            {
                var stats = new
                {
                    TotalUsers = await _userManager.Users.CountAsync(),
                    RoleStats = new[]
                    {
                        new
                        {
                            Role = "Student",
                            Count = (await _userManager.GetUsersInRoleAsync("Student")).Count
                        },
                        new
                        {
                            Role = "Teacher",
                            Count = (await _userManager.GetUsersInRoleAsync("Teacher")).Count
                        },
                        new
                        {
                            Role = "Admin",
                            Count = (await _userManager.GetUsersInRoleAsync("Admin")).Count
                        }
                    }
                };

                return Results.Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user statistics");
                return Results.Problem("An error occurred while getting user statistics");
            }
        }

        public async Task<IResult> DeactivateUserAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.NotFound("User not found");
                }

                user.IsActive = false;
                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    return Results.BadRequest(result.Errors);
                }

                return Results.Ok(new { Message = "User deactivated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user");
                return Results.Problem("An error occurred while deactivating the user");
            }
        }

        // Méthode pour sauvegarder l'avatar
        private async Task<string> SaveAvatarAsync(IFormFile avatar)
        {
            try
            {
                _logger.LogInformation("Début de la sauvegarde de l'avatar");

                if (avatar == null)
                {
                    _logger.LogError("Avatar est null");
                    throw new ArgumentException("Aucun fichier n'a été fourni");
                }

                // Vérifier si WebRootPath existe
                if (string.IsNullOrEmpty(_webHostEnvironment.WebRootPath))
                {
                    _webHostEnvironment.WebRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    _logger.LogInformation($"WebRootPath défini à: {_webHostEnvironment.WebRootPath}");
                }

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "avatars");

                // Créer les dossiers s'ils n'existent pas
                if (!Directory.Exists(uploadsFolder))
                {
                    _logger.LogInformation($"Création du dossier: {uploadsFolder}");
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Générer un nom de fichier unique
                var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(avatar.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                _logger.LogInformation($"Sauvegarde du fichier vers: {filePath}");

                // Sauvegarder le fichier
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(fileStream);
                }

                var relativePath = $"/uploads/avatars/{uniqueFileName}";
                _logger.LogInformation($"Fichier sauvegardé avec succès. Chemin relatif: {relativePath}");

                return relativePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sauvegarde de l'avatar");
                throw new Exception($"Erreur lors de la sauvegarde de l'avatar: {ex.Message}");
            }
        }
    }
}