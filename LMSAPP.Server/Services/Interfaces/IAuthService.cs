using LMSAPP.Server.DTOs.Auth;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface IAuthService
    {
        // CRUD Utilisateurs
        Task<IResult> CreateUserAsync(RegisterDto model);  // Changed from UserDto to RegisterDto
        Task<IResult> GetUserAsync(string userId);
        Task<IResult> UpdateUserAsync(string userId, RegisterDto model);  // Changed from UserDto to RegisterDto
        Task<IResult> DeleteUserAsync(string userId);

        // Authentification
        Task<IResult> LoginAsync(LoginDto model);  // Changed to use LoginDto
        Task<IResult> LogoutAsync();

        // Administration
        Task<IResult> GetAllUsersAsync(string? role = null, string? searchTerm = null);
        Task<IResult> AssignRoleAsync(string userId, string role);
        Task<IResult> GetUserStatisticsAsync();
    }
}