using LMSAPP.Server.Models; // Add this to reference your models
using LMSAPP.Server.Services; // Add this for ITokenService
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LMSAPP.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;

        public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        // Register a new user
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            var user = new ApplicationUser { UserName = model.Email, Email = model.Email, FullName = model.FullName };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Assign role to the user
                await _userManager.AddToRoleAsync(user, model.Role);
                return Ok("User registered successfully!");
            }

            return BadRequest(result.Errors);
        }

        // Login an existing user
       [HttpPost("login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                 var token = await _tokenService.CreateToken(user);
                 var roles = await _userManager.GetRolesAsync(user);

             return Ok(new
            {
                token = token,
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                roles = roles
            });
    }

    return Unauthorized(new { message = "Email ou mot de passe incorrect" });
}
    }
}
