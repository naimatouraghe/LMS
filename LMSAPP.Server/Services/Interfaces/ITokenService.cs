using LMSAPP.Server.Models;

namespace LMSAPP.Server.Services.Interfaces
{
    public interface ITokenService
    {
        Task<string> CreateToken(ApplicationUser user);
    }
}