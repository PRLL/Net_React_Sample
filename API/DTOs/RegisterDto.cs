using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string DisplayName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        // (here are specified password rules ['\\d' for must contains numbers] [a-z A-Z for lower/upper case respectively] ['4,8' for 4 to 8 legnth/characters])
        [RegularExpression("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{4,8}$", 
        ErrorMessage = "Password must contain lowercase, uppercase and numbers & be from 4 to 8 characters")]
        public string Password { get; set; }

        [Required]
        public string Username { get; set; }
    }
}