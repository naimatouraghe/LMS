using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMSAPP.Server.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        // GET api/admin
        [HttpGet]
        public IActionResult GetAdminData()
        {
            return Ok("This is the admin data.");
        }

        // You can add more admin-specific actions here
        // Example: AddUser, DeleteUser, etc.
    }
}
