using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMSAPP.Server.Services.Interfaces;
using LMSAPP.Server.DTOs.Auth;
using Microsoft.AspNetCore.Cors;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowReactApp")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IResult> Register([FromBody] RegisterDto model)
        {
            return await _authService.CreateUserAsync(model);
        }

        [HttpPost("login")]
        public async Task<IResult> Login([FromBody] LoginDto model)
        {
            return await _authService.LoginAsync(model);
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IResult> Logout()
        {
            return await _authService.LogoutAsync();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IResult> GetUsers([FromQuery] string? role, [FromQuery] string? searchTerm)
        {
            return await _authService.GetAllUsersAsync(role, searchTerm);
        }

        [Authorize]
        [HttpGet("users/{userId}")]
        public async Task<IResult> GetUser(string userId)
        {
            return await _authService.GetUserAsync(userId);
        }

        [Authorize]
        [HttpPut("users/{userId}")]
        public async Task<IResult> UpdateUser(string userId, [FromForm] UpdateUserDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Results.BadRequest(ModelState);
                }

                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var isAdmin = User.IsInRole("Admin");

                // Vérifier si l'utilisateur est autorisé à faire la mise à jour
                if (currentUserId != userId && !isAdmin)
                {
                    return Results.Forbid();
                }

                // Si l'utilisateur n'est pas admin et essaie de modifier le rôle
                if (!isAdmin && !string.IsNullOrEmpty(model.Role))
                {
                    return Results.Forbid();
                }

                return await _authService.UpdateUserAsync(userId, model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'utilisateur");
                return Results.Problem("Une erreur est survenue lors de la mise à jour");
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("users/{userId}")]
        public async Task<IResult> DeleteUser(string userId)
        {
            return await _authService.DeleteUserAsync(userId);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("users/{userId}/role")]
        public async Task<IResult> AssignRole(string userId, [FromBody] string role)
        {
            return await _authService.AssignRoleAsync(userId, role);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("statistics")]
        public async Task<IResult> GetUserStatistics()
        {
            return await _authService.GetUserStatisticsAsync();
        }

        [Authorize]
        [HttpPut("users/{userId}/deactivate")]
        public async Task<IResult> DeactivateUser(string userId)
        {
            return await _authService.DeactivateUserAsync(userId);
        }
    }
}
