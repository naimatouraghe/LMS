using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LMSAPP.Server.Services.Interfaces;
using LMSAPP.Server.DTOs.Auth;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{userId}")]
        public async Task<IResult> UpdateUser(string userId, [FromBody] RegisterDto model)
        {
            return await _authService.UpdateUserAsync(userId, model);
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
    }
}
