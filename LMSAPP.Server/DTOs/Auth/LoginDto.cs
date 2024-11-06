using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace LMSAPP.Server.DTOs.Auth
{
    public class LoginDto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }


    }
}
