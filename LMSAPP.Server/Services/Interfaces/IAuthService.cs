using LMSAPP.Server.DTOs.Auth;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface IAuthService
    {
        // CRUD Utilisateurs
        Task<IResult> CreateUserAsync(RegisterDto model);
        Task<IResult> GetUserAsync(string userId);
        Task<IResult> UpdateUserAsync(string userId, UpdateUserDto model);
        Task<IResult> DeleteUserAsync(string userId);

        // Authentification
        Task<IResult> LoginAsync(LoginDto model);
        Task<IResult> LogoutAsync();

        // Administration
        Task<IResult> GetAllUsersAsync(string? role = null, string? searchTerm = null);
        Task<IResult> AssignRoleAsync(string userId, string role);
        Task<IResult> GetUserStatisticsAsync();

        // Désactivation
        Task<IResult> DeactivateUserAsync(string userId);
    }
}