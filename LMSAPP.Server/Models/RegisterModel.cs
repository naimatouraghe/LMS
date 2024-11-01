namespace LMSAPP.Server.Models
{
    public class RegisterModel
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // Role can be "Admin", "Teacher", or "Student"
    }
}
