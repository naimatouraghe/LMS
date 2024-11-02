using LMSAPP.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;

namespace LMSAPP.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _environment;
        private readonly string _clientAvatarsPath;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _environment = environment;
            _clientAvatarsPath = Path.Combine(_environment.ContentRootPath, "..", "lmsapp.client", "public", "avatars");
            
            // Créer le dossier avatars s'il n'existe pas
            if (!Directory.Exists(_clientAvatarsPath))
            {
                Directory.CreateDirectory(_clientAvatarsPath);
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                AvatarPath = user.AvatarPath
            });
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromForm] UserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser?.Id != id)
                return Forbid();

            user.Email = model.Email;
            user.FullName = model.FullName;

            if (model.Avatar != null && model.Avatar.Length > 0)
            {
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(model.Avatar.ContentType))
                    return BadRequest("Type de fichier non autorisé. Utilisez JPG, PNG ou GIF.");

                if (model.Avatar.Length > 5 * 1024 * 1024)
                    return BadRequest("Le fichier est trop volumineux. Maximum 5MB.");

                // Supprimer l'ancien avatar si existe
                if (!string.IsNullOrEmpty(user.AvatarPath))
                {
                    var oldAvatarPath = Path.Combine(_clientAvatarsPath, 
                        Path.GetFileName(user.AvatarPath));
                    if (System.IO.File.Exists(oldAvatarPath))
                    {
                        System.IO.File.Delete(oldAvatarPath);
                    }
                }

                // Générer un nom de fichier unique
                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(model.Avatar.FileName)}";
                
                // Copier le fichier dans le dossier public du client
                var avatarPath = Path.Combine(_clientAvatarsPath, fileName);
                using (var stream = new FileStream(avatarPath, FileMode.Create))
                {
                    await model.Avatar.CopyToAsync(stream);
                }

                // Mettre à jour le chemin dans la base de données avec un chemin relatif
                user.AvatarPath = $"/avatars/{fileName}";
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { 
                message = "Profil mis à jour avec succès", 
                user = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    AvatarPath = user.AvatarPath
                }
            });
        }

        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivateUser(string id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser?.Id != id)
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.MaxValue;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Compte désactivé avec succès" });
        }



[HttpDelete("{id}")] // Changez la route pour éviter les conflits
public async Task<IActionResult> DeleteAvatar(string id)
{
    var user = await _userManager.FindByIdAsync(id);
    if (user == null)
        return NotFound();

    var currentUser = await _userManager.GetUserAsync(User);
    if (currentUser?.Id != id)
        return Forbid();

    if (!string.IsNullOrEmpty(user.AvatarPath))
    {
        var avatarPath = Path.Combine(_clientAvatarsPath, 
            Path.GetFileName(user.AvatarPath));
        if (System.IO.File.Exists(avatarPath))
        {
            System.IO.File.Delete(avatarPath);
        }

        user.AvatarPath = null;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);
    }

    return Ok(new { 
        message = "Avatar supprimé avec succès",
        user = new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            AvatarPath = null
        }
    });
}


        
    }
}