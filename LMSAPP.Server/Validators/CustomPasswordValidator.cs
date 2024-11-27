using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;
using LMSAPP.Server.Models;

namespace LMSAPP.Server.Validators
{
    public class CustomPasswordValidator<TUser> : IPasswordValidator<TUser> where TUser : class
    {
        public async Task<IdentityResult> ValidateAsync(UserManager<TUser> manager, TUser user, string password)
        {
            var errors = new List<IdentityError>();

            // Vérification de la longueur minimale
            if (password.Length < 12)
            {
                errors.Add(new IdentityError
                {
                    Code = "PasswordTooShort",
                    Description = "Password must be at least 12 characters long"
                });
            }

            // Vérification des caractères uniques
            if (password.Distinct().Count() < 6)
            {
                errors.Add(new IdentityError
                {
                    Code = "InsufficientUniqueChars",
                    Description = "Password must use at least 6 different characters"
                });
            }

            // Vérification de la présence de séquences communes
            var commonSequences = new[] { "123", "abc", "qwerty", "azerty", "password" };
            if (commonSequences.Any(seq => password.ToLower().Contains(seq)))
            {
                errors.Add(new IdentityError
                {
                    Code = "CommonSequence",
                    Description = "Password must not contain common sequences"
                });
            }

            // Vérification de la complexité
            var hasUpperCase = new Regex(@"[A-Z]");
            var hasLowerCase = new Regex(@"[a-z]");
            var hasNumber = new Regex(@"[0-9]");
            var hasSpecialChar = new Regex(@"[!@#$%^&*(),.?""':{}|<>]");

            if (!hasUpperCase.IsMatch(password))
            {
                errors.Add(new IdentityError
                {
                    Code = "MissingUpperCase",
                    Description = "Password must contain at least one uppercase letter"
                });
            }

            if (!hasLowerCase.IsMatch(password))
            {
                errors.Add(new IdentityError
                {
                    Code = "MissingLowerCase",
                    Description = "Password must contain at least one lowercase letter"
                });
            }

            if (!hasNumber.IsMatch(password))
            {
                errors.Add(new IdentityError
                {
                    Code = "MissingDigit",
                    Description = "Password must contain at least one number"
                });
            }

            if (!hasSpecialChar.IsMatch(password))
            {
                errors.Add(new IdentityError
                {
                    Code = "MissingSpecialChar",
                    Description = "Password must contain at least one special character"
                });
            }

            // Vérification des informations personnelles
            if (user is ApplicationUser appUser)
            {
                var userName = await manager.GetUserNameAsync(user);
                if (password.Contains(userName, StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add(new IdentityError
                    {
                        Code = "PasswordContainsUserName",
                        Description = "Password cannot contain your username"
                    });
                }
            }

            return errors.Count == 0 ?
                IdentityResult.Success :
                IdentityResult.Failed(errors.ToArray());
        }
    }
}