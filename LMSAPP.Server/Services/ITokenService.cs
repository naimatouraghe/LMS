using Microsoft.AspNetCore.Identity;

namespace LMSAPP.Server.Services
{
    public interface ITokenService
    {
        string CreateToken(IdentityUser user);
    }
}
