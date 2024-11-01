using LMSAPP.Server.Models;

namespace LMSAPP.Server.Services
{
    public interface ITokenService
    {
        Task<string> CreateToken(ApplicationUser user);
    }
}