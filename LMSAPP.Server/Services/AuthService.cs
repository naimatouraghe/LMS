using LMSAPP.Server.Data;
using LMSAPP.Server.DTOs.Auth;
using LMSAPP.Server.Models;
using LMSAPP.Server.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LMSAPP.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;
        private readonly ApplicationDbContext _context;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            ILogger<AuthService> logger,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _logger = logger;
            _context = context;
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
                return Results.Ok(new
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarPath = user.AvatarPath,
                    Roles = roles
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user");
                return Results.Problem("An error occurred while getting the user");
            }
        }

        public async Task<IResult> UpdateUserAsync(string userId, RegisterDto model)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return Results.NotFound("User not found");
                }

                user.FullName = model.FullName;
                user.Email = model.Email;
                user.UserName = model.Email;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return Results.BadRequest(result.Errors);
                }

                if (!string.IsNullOrEmpty(model.Password))
                {
                    var passwordResult = await _userManager.RemovePasswordAsync(user);
                    if (passwordResult.Succeeded)
                    {
                        await _userManager.AddPasswordAsync(user, model.Password);
                    }
                }

                return Results.Ok(new { Message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user");
                return Results.Problem("An error occurred while updating the user");
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
                    return Results.BadRequest("Invalid credentials");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                if (!result.Succeeded)
                {
                    return Results.BadRequest("Invalid credentials");
                }

                var token = await _tokenService.CreateToken(user);
                var roles = await _userManager.GetRolesAsync(user);

                return Results.Ok(new
                {
                    Token = token,
                    User = new
                    {
                        Id = user.Id,
                        Email = user.Email,
                        FullName = user.FullName,
                        AvatarPath = user.AvatarPath,
                        Roles = roles
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return Results.Problem("An error occurred during login");
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
    }
}
